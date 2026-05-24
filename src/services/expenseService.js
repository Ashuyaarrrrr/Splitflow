import { db, isFirebaseConfigured, withTimeout } from "./firebase";
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp, limit } from "firebase/firestore";
import { mockDb } from "./mockDb";
import { groupService } from "./groupService";

export const expenseService = {
  getExpenses: async (groupId) => {
    if (!isFirebaseConfigured) {
      return mockDb.getExpenses(groupId);
    }
    try {
      const q = query(
        collection(db, "expenses"),
        where("groupId", "==", groupId)
      );
      const querySnapshot = await withTimeout(getDocs(q));
      const expenses = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        expenses.push({
          id: docSnapshot.id,
          ...data,
          date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : data.date,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      // Sort in-memory to prevent composite index requirement in Firestore
      expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return expenses;
    } catch (error) {
      console.error("Firestore getExpenses failed:", error);
      throw error;
    }
  },

  // Add a new expense (or settlement)
  addExpense: async (expenseData) => {
    // expenseData: { groupId, title, amount, paidBy, splitAmong, category, note, date, isSettlement, settlementReceiver }
    if (!isFirebaseConfigured) {
      return mockDb.addExpense(expenseData);
    }
    try {
      const docData = {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        date: expenseData.date ? Timestamp.fromDate(new Date(expenseData.date)) : Timestamp.now(),
        createdAt: Timestamp.now()
      };
      
      const docRef = await withTimeout(addDoc(collection(db, "expenses"), docData), 15000);
      
      // Log Activity in Firestore
      try {
        const group = await groupService.getGroup(expenseData.groupId);
        const groupName = group ? group.name : "";
        let activityText = "";

        // Query user names for descriptive activity text
        // For simple prototyping, we will do email-based descriptions
        if (expenseData.isSettlement) {
          activityText = `${expenseData.paidBy} settled with ${expenseData.settlementReceiver} in "${groupName}"`;
        } else {
          activityText = `${expenseData.paidBy} added "${expenseData.title}" in "${groupName}"`;
        }

        await withTimeout(addDoc(collection(db, "activities"), {
          text: activityText,
          groupId: expenseData.groupId,
          date: Timestamp.now()
        }), 15000);
      } catch (actErr) {
        console.error("Failed to log expense activity in Firestore", actErr);
      }

      return {
        id: docRef.id,
        ...docData,
        date: docData.date && typeof docData.date.toDate === 'function' ? docData.date.toDate().toISOString() : docData.date,
        createdAt: docData.createdAt && typeof docData.createdAt.toDate === 'function' ? docData.createdAt.toDate().toISOString() : docData.createdAt
      };
    } catch (error) {
      console.error("Firestore addExpense failed:", error);
      throw error;
    }
  },

  getActivities: async (userEmail, preloadedGroupIds = null) => {
    if (!isFirebaseConfigured) {
      return mockDb.getActivities(userEmail);
    }
    try {
      let groupIds = preloadedGroupIds;
      if (!groupIds) {
        // Find groups user belongs to
        const groups = await groupService.getGroups(userEmail);
        if (groups.length === 0) return [];
        groupIds = groups.map(g => g.id);
      }
      
      if (groupIds.length === 0) return [];
      
      // Firestore IN query supports up to 30 items
      const q = query(
        collection(db, "activities"),
        where("groupId", "in", groupIds.slice(0, 30))
      );
      
      const querySnapshot = await withTimeout(getDocs(q));
      const activities = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        activities.push({
          id: docSnapshot.id,
          ...data,
          date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : data.date
        });
      });
      // Sort and slice in-memory to prevent composite index requirement in Firestore
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return activities.slice(0, 50);
    } catch (error) {
      console.error("Firestore getActivities failed:", error);
      throw error;
    }
  },

  getAllExpenses: async (userEmail) => {
    if (!isFirebaseConfigured) {
      return mockDb.getAllExpenses(userEmail);
    }
    try {
      const groups = await groupService.getGroups(userEmail);
      if (groups.length === 0) return [];
      const groupIds = groups.map(g => g.id);
      
      const q = query(
        collection(db, "expenses"),
        where("groupId", "in", groupIds.slice(0, 30))
      );
      
      const querySnapshot = await withTimeout(getDocs(q));
      const expenses = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        expenses.push({
          id: docSnapshot.id,
          ...data,
          date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : data.date,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      // Sort in-memory to prevent composite index requirement in Firestore
      expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return expenses;
    } catch (error) {
      console.error("Firestore getAllExpenses failed:", error);
      throw error;
    }
  }
};
