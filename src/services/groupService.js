import { db, isFirebaseConfigured, withTimeout } from "./firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { mockDb } from "./mockDb";

export const groupService = {
  // Get all groups a user is member of
  getGroups: async (userEmail) => {
    if (!isFirebaseConfigured) {
      return mockDb.getGroups(userEmail);
    }
    try {
      const q = query(
        collection(db, "groups"),
        where("memberEmails", "array-contains", userEmail.toLowerCase())
      );
      const querySnapshot = await withTimeout(getDocs(q));
      const groups = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        groups.push({
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      return groups;
    } catch (error) {
      console.error("Firestore getGroups failed, falling back to mockDb:", error);
      return mockDb.getGroups(userEmail);
    }
  },

  // Get details of a single group
  getGroup: async (groupId) => {
    if (!isFirebaseConfigured) {
      return mockDb.getGroup(groupId);
    }
    try {
      const docRef = doc(db, "groups", groupId);
      const docSnap = await withTimeout(getDoc(docRef));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error("Firestore getGroup failed, falling back to mockDb:", error);
      return mockDb.getGroup(groupId);
    }
  },

  // Create a new group
  createGroup: async (groupData) => {
    // groupData: { name, description, members: [{email, name, uid}], createdBy }
    if (!isFirebaseConfigured) {
      return mockDb.createGroup(groupData);
    }
    try {
      const docData = {
        name: groupData.name,
        description: groupData.description || "",
        members: groupData.members,
        memberEmails: groupData.members.map(m => m.email.toLowerCase()),
        createdBy: groupData.createdBy,
        createdAt: Timestamp.now()
      };
      const docRef = await withTimeout(addDoc(collection(db, "groups"), docData));
      
      // Log Activity in Firestore
      try {
        const creator = groupData.members.find(m => m.uid === groupData.createdBy) || { name: "Someone" };
        await withTimeout(addDoc(collection(db, "activities"), {
          text: `${creator.name} created the group "${groupData.name}"`,
          groupId: docRef.id,
          date: Timestamp.now()
        }));
      } catch (actErr) {
        console.error("Failed to log creation activity in Firestore", actErr);
      }

      return {
        id: docRef.id,
        ...docData,
        createdAt: docData.createdAt.toDate().toISOString()
      };
    } catch (error) {
      console.error("Firestore createGroup failed, falling back to mockDb:", error);
      return mockDb.createGroup(groupData);
    }
  },

  // Add member to group
  addMemberToGroup: async (groupId, member) => {
    // member: { email, name, uid }
    if (!isFirebaseConfigured) {
      const group = mockDb.getGroup(groupId);
      if (group) {
        if (!group.members.some(m => m.email.toLowerCase() === member.email.toLowerCase())) {
          group.members.push(member);
          const groups = JSON.parse(localStorage.getItem("splitflow_groups") || "[]");
          const index = groups.findIndex(g => g.id === groupId);
          if (index !== -1) {
            groups[index] = group;
            localStorage.setItem("splitflow_groups", JSON.stringify(groups));
          }
          mockDb.addActivity(`Added ${member.name} to "${group.name}"`, groupId);
        }
        return group;
      }
      return null;
    }
    try {
      const docRef = doc(db, "groups", groupId);
      await withTimeout(updateDoc(docRef, {
        members: arrayUnion(member),
        memberEmails: arrayUnion(member.email.toLowerCase())
      }));

      // Log Activity in Firestore
      try {
        const groupSnap = await withTimeout(getDoc(docRef));
        const groupName = groupSnap.exists() ? groupSnap.data().name : "";
        await withTimeout(addDoc(collection(db, "activities"), {
          text: `Added ${member.name} to "${groupName}"`,
          groupId: groupId,
          date: Timestamp.now()
        }));
      } catch (actErr) {
        console.error("Failed to log addMember activity in Firestore", actErr);
      }

      return true;
    } catch (error) {
      console.error("Firestore addMemberToGroup failed:", error);
      return false;
    }
  }
};
