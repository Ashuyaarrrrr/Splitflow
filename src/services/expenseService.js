import { db, isFirebaseConfigured, withTimeout } from "./firebase";
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp, limit } from "firebase/firestore";
import { mockDb } from "./mockDb";
import { groupService } from "./groupService";

export const expenseService = {
  // Get expenses for a group
  getExpenses: async (groupId) => {
    if (!isFirebaseConfigured) {
      return mockDb.getExpenses(groupId);
    }
    try {
      const q = query(
        collection(db, "expenses"),
        where("groupId", "==", groupId),
        orderBy("date", "desc")
      );
      const querySnapshot = await withTimeout(getDocs(q));
      const expenses = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        expenses.push({
          id: docSnapshot.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
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
      
      const docRef = await withTimeout(addDoc(collection(db, "expenses"), docData), 5000);
      
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
        }), 5000);
      } catch (actErr) {
        console.error("Failed to log expense activity in Firestore", actErr);
      }

      return {
        id: docRef.id,
        ...docData,
        date: docData.date.toDate().toISOString(),
        createdAt: docData.createdAt.toDate().toISOString()
      };
    } catch (error) {
      console.error("Firestore addExpense failed:", error);
      throw error;
    }
  },

  // Get recent activities for groups user is member of
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
        where("groupId", "in", groupIds.slice(0, 30)),
        orderBy("date", "desc"),
        limit(50)
      );
      
      const querySnapshot = await withTimeout(getDocs(q));
      const activities = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        activities.push({
          id: docSnapshot.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        });
      });
      return activities;
    } catch (error) {
      console.error("Firestore getActivities failed:", error);
      throw error;
    }
  },

  // Fetch recent expenses across all groups the user belongs to
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
        where("groupId", "in", groupIds.slice(0, 30)),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await withTimeout(getDocs(q));
      const expenses = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        expenses.push({
          id: docSnapshot.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      return expenses;
    } catch (error) {
      console.error("Firestore getAllExpenses failed:", error);
      throw error;
    }
  }
};
