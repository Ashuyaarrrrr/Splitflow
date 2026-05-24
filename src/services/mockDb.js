// Mock LocalStorage Database for SplitFlow
// Enables full functionality offline and without Firebase keys

const KEY_USERS = "splitflow_users";
const KEY_GROUPS = "splitflow_groups";
const KEY_EXPENSES = "splitflow_expenses";
const KEY_ACTIVITIES = "splitflow_activities";
const KEY_CURRENT_USER = "splitflow_current_user";

// Seed Initial Data
const SEED_USERS = [
  { uid: "user-1", email: "ashu@splitflow.com", displayName: "Ashu", photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashu&backgroundColor=b6e3f4" },
  { uid: "user-2", email: "priya@splitflow.com", displayName: "Priya", photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf" },
  { uid: "user-3", email: "rahul@splitflow.com", displayName: "Rahul", photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=c0aede" },
  { uid: "user-4", email: "amit@splitflow.com", displayName: "Amit", photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit&backgroundColor=d1f4c9" },
];

const SEED_GROUPS = [
  {
    id: "group-1",
    name: "Flatmates",
    description: "Rent, groceries and daily utility bills",
    members: [
      { email: "ashu@splitflow.com", name: "Ashu", uid: "user-1" },
      { email: "priya@splitflow.com", name: "Priya", uid: "user-2" },
      { email: "rahul@splitflow.com", name: "Rahul", uid: "user-3" }
    ],
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "group-2",
    name: "Goa Trip 🏖️",
    description: "Travel tickets, villa stay, and food splits",
    members: [
      { email: "ashu@splitflow.com", name: "Ashu", uid: "user-1" },
      { email: "priya@splitflow.com", name: "Priya", uid: "user-2" },
      { email: "rahul@splitflow.com", name: "Rahul", uid: "user-3" },
      { email: "amit@splitflow.com", name: "Amit", uid: "user-4" }
    ],
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_EXPENSES = [
  // Flatmates Expenses
  {
    id: "exp-1",
    groupId: "group-1",
    title: "Broadband WiFi Router",
    amount: 900,
    paidBy: "ashu@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com"],
    category: "Utilities",
    note: "Airtel Xstream broadband payment for May",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  {
    id: "exp-2",
    groupId: "group-1",
    title: "Organic Groceries",
    amount: 1500,
    paidBy: "priya@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com"],
    category: "Food",
    note: "Fruits, veggies and monthly pantry items",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  {
    id: "exp-3",
    groupId: "group-1",
    title: "Electricity Bill",
    amount: 2400,
    paidBy: "rahul@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com"],
    category: "Utilities",
    note: "BESCOM monthly bill",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  // Goa Trip Expenses
  {
    id: "exp-4",
    groupId: "group-2",
    title: "Luxury Beach Villa Stay",
    amount: 12000,
    paidBy: "ashu@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com", "amit@splitflow.com"],
    category: "Lodging",
    note: "3 nights booking in Candolim",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  {
    id: "exp-5",
    groupId: "group-2",
    title: "Candolim Beach Dinner",
    amount: 4000,
    paidBy: "priya@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com", "amit@splitflow.com"],
    category: "Food",
    note: "Seafood dinner & drinks at Calamari",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  {
    id: "exp-6",
    groupId: "group-2",
    title: "SUV Rental & Fuel",
    amount: 6000,
    paidBy: "amit@splitflow.com",
    splitAmong: ["ashu@splitflow.com", "priya@splitflow.com", "rahul@splitflow.com", "amit@splitflow.com"],
    category: "Travel",
    note: "Car rental from airport",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: false
  },
  {
    id: "exp-7",
    groupId: "group-2",
    title: "Rahul settled with Ashu",
    amount: 2000,
    paidBy: "rahul@splitflow.com",
    splitAmong: ["ashu@splitflow.com"],
    category: "Settlement",
    note: "Manual cash settlement",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isSettlement: true,
    settlementReceiver: "ashu@splitflow.com"
  }
];

const SEED_ACTIVITIES = [
  { id: "act-1", text: "Ashu created the group 'Flatmates'", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-1" },
  { id: "act-2", text: "Ashu created the group 'Goa Trip 🏖️'", date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-2" },
  { id: "act-3", text: "Ashu added 'Broadband WiFi Router' in Flatmates", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-1" },
  { id: "act-4", text: "Priya added 'Organic Groceries' in Flatmates", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-1" },
  { id: "act-5", text: "Rahul added 'Electricity Bill' in Flatmates", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-1" },
  { id: "act-6", text: "Rahul settled with Ashu in Goa Trip 🏖️", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), groupId: "group-2" }
];

export const initializeMockDb = () => {
  if (!localStorage.getItem(KEY_USERS)) {
    localStorage.setItem(KEY_USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(KEY_GROUPS)) {
    localStorage.setItem(KEY_GROUPS, JSON.stringify(SEED_GROUPS));
  }
  if (!localStorage.getItem(KEY_EXPENSES)) {
    localStorage.setItem(KEY_EXPENSES, JSON.stringify(SEED_EXPENSES));
  }
  if (!localStorage.getItem(KEY_ACTIVITIES)) {
    localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
  }
  if (!localStorage.getItem(KEY_CURRENT_USER)) {
    // Default logged in user is Ashu (user-1) for initial preview
    localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  }
};

// Read Helpers
export const mockDb = {
  getCurrentUser: () => {
    initializeMockDb();
    const user = localStorage.getItem(KEY_CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
      // Ensure user exists in users table
      const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
      if (!users.some(u => u.uid === user.uid)) {
        users.push(user);
        localStorage.setItem(KEY_USERS, JSON.stringify(users));
      }
    } else {
      localStorage.removeItem(KEY_CURRENT_USER);
    }
  },

  getUsers: () => {
    initializeMockDb();
    return JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
  },

  getGroups: (email) => {
    initializeMockDb();
    const groups = JSON.parse(localStorage.getItem(KEY_GROUPS) || "[]");
    // Return groups where member email matches
    return groups.filter(g => g.members.some(m => m.email.toLowerCase() === email.toLowerCase()));
  },

  getGroup: (groupId) => {
    initializeMockDb();
    const groups = JSON.parse(localStorage.getItem(KEY_GROUPS) || "[]");
    return groups.find(g => g.id === groupId) || null;
  },

  createGroup: (group) => {
    initializeMockDb();
    const groups = JSON.parse(localStorage.getItem(KEY_GROUPS) || "[]");
    const newGroup = {
      ...group,
      id: "group-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    groups.unshift(newGroup);
    localStorage.setItem(KEY_GROUPS, JSON.stringify(groups));

    // Log Activity
    const creator = group.members.find(m => m.uid === group.createdBy) || { name: "Someone" };
    mockDb.addActivity(`${creator.name} created the group "${group.name}"`, newGroup.id);

    return newGroup;
  },

  getExpenses: (groupId) => {
    initializeMockDb();
    const expenses = JSON.parse(localStorage.getItem(KEY_EXPENSES) || "[]");
    return expenses
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getAllExpenses: (email) => {
    initializeMockDb();
    const groups = mockDb.getGroups(email);
    const groupIds = groups.map(g => g.id);
    const expenses = JSON.parse(localStorage.getItem(KEY_EXPENSES) || "[]");
    return expenses
      .filter(e => groupIds.includes(e.groupId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addExpense: (expense) => {
    initializeMockDb();
    const expenses = JSON.parse(localStorage.getItem(KEY_EXPENSES) || "[]");
    const newExpense = {
      ...expense,
      id: "exp-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    expenses.unshift(newExpense);
    localStorage.setItem(KEY_EXPENSES, JSON.stringify(expenses));

    // Log Activity
    const users = mockDb.getUsers();
    const payer = users.find(u => u.email === expense.paidBy) || { displayName: expense.paidBy };
    const group = mockDb.getGroup(expense.groupId);
    const groupName = group ? group.name : "";

    let activityText = "";
    if (expense.isSettlement) {
      const receiver = users.find(u => u.email === expense.settlementReceiver) || { displayName: expense.settlementReceiver };
      activityText = `${payer.displayName} settled with ${receiver.displayName} in "${groupName}"`;
    } else {
      activityText = `${payer.displayName} added "${expense.title}" in "${groupName}"`;
    }
    mockDb.addActivity(activityText, expense.groupId);

    return newExpense;
  },

  getActivities: (email) => {
    initializeMockDb();
    const activities = JSON.parse(localStorage.getItem(KEY_ACTIVITIES) || "[]");
    if (!email) {
      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Filter activities belonging to groups the user is in
    const userGroups = mockDb.getGroups(email).map(g => g.id);
    return activities
      .filter(act => !act.groupId || userGroups.includes(act.groupId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addActivity: (text, groupId = null) => {
    initializeMockDb();
    const activities = JSON.parse(localStorage.getItem(KEY_ACTIVITIES) || "[]");
    const newActivity = {
      id: "act-" + Math.random().toString(36).substring(2, 9),
      text,
      groupId,
      date: new Date().toISOString()
    };
    activities.unshift(newActivity);
    localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(activities));
    return newActivity;
  },

  deleteGroup: (groupId) => {
    initializeMockDb();
    const groups = JSON.parse(localStorage.getItem(KEY_GROUPS) || "[]");
    const filteredGroups = groups.filter(g => g.id !== groupId);
    localStorage.setItem(KEY_GROUPS, JSON.stringify(filteredGroups));

    // Delete related expenses
    const expenses = JSON.parse(localStorage.getItem(KEY_EXPENSES) || "[]");
    const filteredExpenses = expenses.filter(e => e.groupId !== groupId);
    localStorage.setItem(KEY_EXPENSES, JSON.stringify(filteredExpenses));

    // Delete related activities
    const activities = JSON.parse(localStorage.getItem(KEY_ACTIVITIES) || "[]");
    const filteredActivities = activities.filter(a => a.groupId !== groupId);
    localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(filteredActivities));

    return true;
  },

  updateUserProfile: (uid, updates) => {
    initializeMockDb();
    // Update currentUser
    const currentUser = mockDb.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      const newCurrentUser = { ...currentUser, ...updates };
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(newCurrentUser));
    }

    // Update in users table
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(KEY_USERS, JSON.stringify(users));
    }
  }
};
