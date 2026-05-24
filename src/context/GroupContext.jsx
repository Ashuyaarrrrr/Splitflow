import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { groupService } from "../services/groupService";
import { expenseService } from "../services/expenseService";
import { calculateBalances } from "../utils/balanceCalculator";
import { db, isFirebaseConfigured } from "../services/firebase";
import { collection, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import { useToast } from "../components/Toast";

const GroupContext = createContext();

export const useGroups = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [expenses, setExpenses] = useState([]); // Expenses of current group
  const [allExpenses, setAllExpenses] = useState([]); // All expenses across user's groups
  const [activities, setActivities] = useState([]);
  const [balances, setBalances] = useState({ netBalances: {}, simplifiedDebts: [] });
  const [globalBalance, setGlobalBalance] = useState({ youOwe: 0, youAreOwed: 0, net: 0 });
  
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch groups list
  const loadGroups = useCallback(async () => {
    if (!currentUser) return;
    setLoadingGroups(true);
    try {
      const userGroups = await groupService.getGroups(currentUser.email);
      setGroups(userGroups);
      return userGroups;
    } catch (error) {
      console.error("Failed to load groups from Firestore:", error);
      showToast("⚠️ Cloud Sync failed. Loading local data.", "warning");
      const localGroups = mockDb.getGroups(currentUser.email);
      setGroups(localGroups);
      return localGroups;
    } finally {
      setLoadingGroups(false);
    }
  }, [currentUser, showToast]);

  // Fetch recent activities
  const loadActivities = useCallback(async () => {
    if (!currentUser) return;
    setLoadingActivities(true);
    try {
      const activeGroupIds = groups.map(g => g.id);
      const recentActivities = await expenseService.getActivities(
        currentUser.email,
        activeGroupIds.length > 0 ? activeGroupIds : null
      );
      setActivities(recentActivities);
    } catch (error) {
      console.error("Failed to load activities from Firestore:", error);
      const localActivities = mockDb.getActivities(currentUser.email);
      setActivities(localActivities);
    } finally {
      setLoadingActivities(false);
    }
  }, [currentUser, groups]);

  // Fetch details of a selected group (expenses + info)
  const loadGroupDetails = useCallback(async (groupId) => {
    setLoadingDetails(true);
    try {
      const groupData = await groupService.getGroup(groupId);
      setCurrentGroup(groupData);

      if (groupData) {
        const groupExpenses = await expenseService.getExpenses(groupId);
        setExpenses(groupExpenses);

        // Calculate balances
        const calcResult = calculateBalances(groupData.members, groupExpenses);
        setBalances(calcResult);
      }
    } catch (error) {
      console.error("Failed to load group details from Firestore:", error);
      const groupData = mockDb.getGroup(groupId);
      setCurrentGroup(groupData);
      if (groupData) {
        const groupExpenses = mockDb.getExpenses(groupId);
        setExpenses(groupExpenses);
        const calcResult = calculateBalances(groupData.members, groupExpenses);
        setBalances(calcResult);
      }
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Create a new group
  const createGroup = async (name, description, members) => {
    if (!currentUser) return;
    try {
      // Ensure current user is part of the members
      const formattedMembers = [...members];
      if (!formattedMembers.some(m => m.email.toLowerCase() === currentUser.email.toLowerCase())) {
        formattedMembers.push({
          email: currentUser.email,
          name: currentUser.displayName,
          uid: currentUser.uid
        });
      }

      const newGroup = await groupService.createGroup({
        name,
        description,
        members: formattedMembers,
        createdBy: currentUser.uid
      });

      await loadGroups();
      await loadActivities();
      return newGroup;
    } catch (error) {
      console.error("Create group failed:", error);
      throw error;
    }
  };

  // Delete an existing group
  const deleteGroup = async (groupId) => {
    if (!currentUser) return false;
    try {
      const success = await groupService.deleteGroup(groupId);
      if (success) {
        showToast("Group deleted successfully!", "success");
        await Promise.all([
          loadGroups(),
          loadActivities(),
          refreshGlobalBalances()
        ]);
      } else {
        showToast("Failed to delete group. Only the creator can delete it.", "error");
      }
      return success;
    } catch (error) {
      console.error("Delete group failed:", error);
      showToast("Failed to delete group", "error");
      return false;
    }
  };

  // Add a new expense / settlement
  const addExpense = async (expenseData) => {
    if (!currentUser) return;
    try {
      const response = await expenseService.addExpense(expenseData);
      
      // Refresh current group if viewing it
      const refreshGroupDetails = (currentGroup && currentGroup.id === expenseData.groupId)
        ? loadGroupDetails(currentGroup.id)
        : Promise.resolve();
      
      // Refresh global states in parallel
      await Promise.all([
        refreshGroupDetails,
        loadActivities(),
        refreshGlobalBalances()
      ]);
      
      return response;
    } catch (error) {
      console.error("Add expense failed:", error);
      throw error;
    }
  };

  // Calculate global totals for Dashboard using parallel fetches
  const refreshGlobalBalances = useCallback(async () => {
    if (!currentUser) return;
    try {
      // Step 1: Fetch groups list
      const userGroups = await groupService.getGroups(currentUser.email);
      setGroups(userGroups);
      
      if (userGroups.length === 0) {
        setAllExpenses([]);
        setGlobalBalance({ youOwe: 0, youAreOwed: 0, net: 0 });
        return;
      }

      // Step 2: Fetch expenses for all groups in parallel
      const allExpensesDocs = await Promise.all(
        userGroups.map(grp => expenseService.getExpenses(grp.id))
      );

      let youOwe = 0;
      let youAreOwed = 0;
      const allTempExpenses = [];
      const myEmailKey = currentUser.email.toLowerCase();

      userGroups.forEach((grp, idx) => {
        const grpExpenses = allExpensesDocs[idx] || [];
        allTempExpenses.push(...grpExpenses);
        
        const grpBalances = calculateBalances(grp.members, grpExpenses);
        const myBalance = grpBalances.netBalances[myEmailKey] || 0;
        
        if (myBalance > 0) {
          youAreOwed += myBalance;
        } else if (myBalance < 0) {
          youOwe += Math.abs(myBalance);
        }
      });

      setAllExpenses(
        allTempExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      setGlobalBalance({
        youOwe: Math.round(youOwe * 100) / 100,
        youAreOwed: Math.round(youAreOwed * 100) / 100,
        net: Math.round((youAreOwed - youOwe) * 100) / 100
      });
    } catch (error) {
      console.error("Error refreshing global balances from Firestore:", error);
      // Fallback to mockDb
      const userGroups = mockDb.getGroups(currentUser.email);
      setGroups(userGroups);
      
      let youOwe = 0;
      let youAreOwed = 0;
      const allTempExpenses = [];
      const myEmailKey = currentUser.email.toLowerCase();

      userGroups.forEach((grp) => {
        const grpExpenses = mockDb.getExpenses(grp.id);
        allTempExpenses.push(...grpExpenses);
        
        const grpBalances = calculateBalances(grp.members, grpExpenses);
        const myBalance = grpBalances.netBalances[myEmailKey] || 0;
        
        if (myBalance > 0) {
          youAreOwed += myBalance;
        } else if (myBalance < 0) {
          youOwe += Math.abs(myBalance);
        }
      });

      setAllExpenses(
        allTempExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      setGlobalBalance({
        youOwe: Math.round(youOwe * 100) / 100,
        youAreOwed: Math.round(youAreOwed * 100) / 100,
        net: Math.round((youAreOwed - youOwe) * 100) / 100
      });
    }
  }, [currentUser]);

  // Sync groups & activities on auth state change (real-time listener)
  useEffect(() => {
    if (!currentUser) {
      setGroups([]);
      setCurrentGroup(null);
      setExpenses([]);
      setAllExpenses([]);
      setActivities([]);
      setBalances({ netBalances: {}, simplifiedDebts: [] });
      setGlobalBalance({ youOwe: 0, youAreOwed: 0, net: 0 });
      return;
    }

    // Mock Mode Sync (Fallback)
    if (!isFirebaseConfigured) {
      const initMock = async () => {
        setLoadingGroups(true);
        try {
          const userGroups = await groupService.getGroups(currentUser.email);
          setGroups(userGroups);
          await Promise.all([
            loadActivities(),
            refreshGlobalBalances()
          ]);
        } catch (e) {
          console.error("Mock database init failed", e);
        } finally {
          setLoadingGroups(false);
        }
      };
      initMock();
      return;
    }

    // Live Firebase Mode Sync (Real-time listener)
    setLoadingGroups(true);
    
    // Safety timer to prevent perpetual loading skeleton if Firestore is uninitialized/hanging
    const safetyTimer = setTimeout(() => {
      console.warn("Firestore realtime listener timed out, falling back to mockDb");
      fallbackToMock();
    }, 1500);

    const fallbackToMock = () => {
      try {
        const userGroups = mockDb.getGroups(currentUser.email);
        setGroups(userGroups);
        const recentActivities = mockDb.getActivities(currentUser.email);
        setActivities(recentActivities);
        
        let youOwe = 0;
        let youAreOwed = 0;
        const allTempExpenses = [];
        const myEmailKey = currentUser.email.toLowerCase();

        userGroups.forEach((grp) => {
          const grpExpenses = mockDb.getExpenses(grp.id);
          allTempExpenses.push(...grpExpenses);
          
          const grpBalances = calculateBalances(grp.members, grpExpenses);
          const myBalance = grpBalances.netBalances[myEmailKey] || 0;
          
          if (myBalance > 0) {
            youAreOwed += myBalance;
          } else if (myBalance < 0) {
            youOwe += Math.abs(myBalance);
          }
        });

        setAllExpenses(
          allTempExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );

        setGlobalBalance({
          youOwe: Math.round(youOwe * 100) / 100,
          youAreOwed: Math.round(youAreOwed * 100) / 100,
          net: Math.round((youAreOwed - youOwe) * 100) / 100
        });
      } catch (err) {
        console.error("Fallback to mockDb failed:", err);
      } finally {
        setLoadingGroups(false);
      }
    };

    // 1. Fetch activities on mount
    loadActivities();

    // 2. Set up realtime onSnapshot groups listener
    const q = query(
      collection(db, "groups"),
      where("memberEmails", "array-contains", currentUser.email.toLowerCase())
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      clearTimeout(safetyTimer);
      const userGroups = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        userGroups.push({
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });

      // Sort by createdAt descending
      userGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Compare new list with previous list to check if added by someone else
      setGroups((prevGroups) => {
        if (prevGroups.length > 0) {
          userGroups.forEach((newG) => {
            const isNew = !prevGroups.some((oldG) => oldG.id === newG.id);
            if (isNew && newG.createdBy !== currentUser.uid) {
              // Trigger Live Toast notification
              showToast(`✨ You've been added to group "${newG.name}"!`, "success");
            }
          });
        }
        return userGroups;
      });

      // Recalculate balances
      refreshGlobalBalances();
      setLoadingGroups(false);
    }, (error) => {
      clearTimeout(safetyTimer);
      console.error("Realtime groups snapshot failed:", error);
      showToast("⚠️ Cloud Sync failed. Running in offline sandbox mode.", "warning");
      fallbackToMock();
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const value = {
    groups,
    currentGroup,
    expenses,
    allExpenses,
    activities,
    balances,
    globalBalance,
    loadingGroups,
    loadingDetails,
    loadingActivities,
    loadGroups,
    loadActivities,
    loadGroupDetails,
    createGroup,
    deleteGroup,
    addExpense,
    refreshGlobalBalances
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
