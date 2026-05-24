# SplitFlow 💸

SplitFlow is a premium, mobile-first, full-stack Progressive Web Application (PWA) designed for seamless expense splitting and bill tracking among friends. Inspired by Splitwise's ledger-based utilities and CRED's fintech aesthetic, it features a glassmorphic interface, real-time cloud database syncing, and a robust offline-first fallback architecture.

---

## 🌟 Key Features

* **Fintech Glassmorphic UI**: Tailored color palettes, sleek dark modes, linear gradients, and micro-animations built using Vanilla CSS.
* **Real-time Cloud Syncing**: Instant synchronization of groups, expenses, and activity logs across members using Cloud Firestore.
* **Intelligent Offline Sandbox Fallback**: Automatic detection of poor network connectivity or unconfigured databases. The app seamlessly degrades to a client-side localStorage mock database (`mockDb`) within 1.5 seconds, ensuring the UI never freezes.
* **Smart Balance Simplification**: Computes net balances for all members inside a group and simplifies debts to minimize the total number of cash transactions.
* **Standalone PWA Mode**: Installs directly onto smartphone home screens (Android & iOS) to run full-screen, hiding browser banners, URL bars, and tabs.

---

## 🏗️ System Architecture

SplitFlow follows a layered architecture that decouples UI rendering, state management, backend network APIs, and data caches:

```mermaid
graph TD
    %% UI Layer
    subgraph UI ["UI Layer (React Components)"]
        Pages[App / PageLayout]
        Dash[Dashboard / Activity / Settings]
        GroupDet[Group Details Ledger]
        Modals[Create Group / Add Expense / Settle Up Modals]
    end

    %% State Management
    subgraph Providers ["State Management (React Context)"]
        AuthCtx[AuthContext.jsx <br/> handles auth state & profile updates]
        GroupCtx[GroupContext.jsx <br/> handles groups, expenses, activity & balances]
    end

    %% API Service Layer
    subgraph Services ["Service Layer (API Wrapper)"]
        GService[groupService.js <br/> CRUD operations for groups]
        EService[expenseService.js <br/> CRUD operations for expenses]
        Timeout[firebase.js / withTimeout <br/> 15s operation timeout helper]
    end

    %% Storage Caches
    subgraph Caches ["Data Access / Storage Caches"]
        Firestore[(Cloud Firestore Database <br/> groups, expenses, activities collections)]
        LocalDB[(LocalStorage / mockDb.js <br/> offline sandbox data storage)]
    end

    %% Flow arrows
    Pages --> Dash
    Pages --> GroupDet
    Pages --> Modals

    Dash & GroupDet & Modals --> Providers
    Providers --> Services
    
    Services -- Online Mode --> Firestore
    Services -- Offline/Sandbox Mode --> LocalDB
```

---

## 🔄 User Workflow & Navigation

The application navigation is structured as a state machine that dynamically switches views to maintain a fluid, app-like smartphone experience:

```mermaid
graph TD
    Start([User Opens SplitFlow]) --> AuthCheck{Is User Logged In?}
    
    %% Unauthenticated Flow
    AuthCheck -- No --> LandingView[Landing Page <br/> Hero intro & feature overview]
    LandingView -- Get Started --> SigninView[Login Screen <br/> Email/Password or Google Sign-In]
    SigninView -- No account? --> RegisterView[Signup Screen]
    RegisterView -- Has account? --> SigninView

    %% Authenticated Flow
    AuthCheck -- Yes --> SyncUser[Sync Auth State]
    SigninView -- Authentication Success --> SyncUser
    RegisterView -- Registration Success --> SyncUser

    SyncUser --> MainApp[Main Dashboard <br/> Net balance card & active group lists]
    
    %% Tab Switch navigation
    MainApp -- Bottom Nav Tab 2 --> ActivityFeed[Recent Activity Feed <br/> Timeline of splits and creations]
    MainApp -- Bottom Nav Tab 3 --> ProfileView[Profile Settings <br/> Avatar edit, dark mode & install banner]
    
    %% Group Navigation
    MainApp -- Click Group Card --> GroupDetails[Group Ledger <br/> Expenses history list & balances tab]
    GroupDetails -- Settle Up Button --> SettleModal[Settle Up Modal <br/> Log cash payment splits]
    GroupDetails -- Add Expense Button --> AddExpenseModal[Add Expense Modal <br/> Enter title, cost, category & splits]
    GroupDetails -- Trash Icon Header --> DeleteGroup[Delete Group <br/> Optimistic delete + background sync]

    %% Modal Close Navigation
    SettleModal & AddExpenseModal --> GroupDetails
    DeleteGroup -- Redirect --> MainApp
```

---

## 🛠️ How It Works (Technical Details)

### 1. The Firestore Caching & Offline Sandbox Fallback
When the application starts, it registers a real-time `onSnapshot` listener on the Firestore `groups` collection.
* **Safety Timer**: A 1.5-second timer runs in the background. If the Firestore snapshot fails to resolve within 1.5 seconds (due to network blockages, latency, or missing firebase configurations), the app prints a warning to the console, displays an offline warning toast, and triggers `fallbackToMock()`.
* **Simulated mockDb**: In sandbox/offline mode, the app reads and writes data to LocalStorage using a fully functional mock backend schema (`mockDb.js`). As soon as internet connectivity or configuration is restored, the app swaps back to the live Cloud database.

### 2. Decoupled safe event-loop (setTimeout)
To prevent network delay or database failures from locking up the interface, all database writes (creating a group, deleting a group, or adding an expense) are separated from state updates:
* The primary transaction completes and updates the Firestore collections.
* The secondary dashboard re-fetches (`loadGroups()`, `loadActivities()`, `refreshGlobalBalances()`) are wrapped inside a zero-delay `setTimeout(..., 0)`.
* This decouples the updates. Even if a background refresh query fails, it executes in a separate loop tick. It will never bubble up to throw errors in the main UI action, ensuring that success toasts display correctly and modals or details screens redirect immediately.

### 3. Smart Balance Calculation & Simplification
Inside [balanceCalculator.js](file:///c:/Users/Ashu/Desktop/codes/SplitFlow/src/utils/balanceCalculator.js), the system computes splits:
* **Net Balances**: Accumulates how much each member has paid versus how much they owe across all group expenses.
* **Debts Simplification**: Groups members into two lists: **Creditors** (those owed money) and **Debtors** (those who owe money). Using a greedy search algorithm, the debtor with the largest debt pays the creditor with the largest credit. The balance is updated, and the loop continues until all net balances are resolved. This minimizes the total number of manual settlement transactions.

---

## 💻 Local Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Firebase Account](https://console.firebase.google.com/)

### Steps to Run Locally

1. **Clone and Navigate**:
   Ensure you are in the `/SplitFlow` directory of your workspace:
   ```powershell
   cd c:\Users\Ashu\Desktop\codes\SplitFlow
   ```
2. **Install Dependencies**:
   Install all required Node modules:
   ```powershell
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root folder of the project. Fill it in with your Firebase project configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
   ```
   *Note: If no `.env` file is present, or the values are left empty, the application will automatically start in offline sandbox mode.*

4. **Apply Firestore Security Rules**:
   Publish the security rules inside the **Firestore Database > Rules** tab in your Firebase console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       
       // Allow authenticated reads and writes
       match /groups/{groupId} {
         allow read, write: if request.auth != null;
       }
       match /expenses/{expenseId} {
         allow read, write: if request.auth != null;
       }
       match /activities/{activityId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. **Run the Development Server**:
   Start the local Vite dev server:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Mobile Installation (PWA Guide)

SplitFlow is a fully optimized Progressive Web App (PWA). You can access and install the official app directly on your smartphone by visiting:

**Official App Link**: [https://splitflow-three.vercel.app/](https://splitflow-three.vercel.app/)

### How to Install the App on Your Phone

#### On Android (Google Chrome / Microsoft Edge):
1. Open the [Official App Link](https://splitflow-three.vercel.app/) in Chrome or Edge.
2. Tap the bottom banner that says **"Add SplitFlow to Home Screen"**.
3. If the banner doesn't appear, tap the browser's **three-dot menu** in the top-right corner and select **Install App** or **Add to Home screen**.
4. Confirm the installation. The SplitFlow icon will be added to your home screen and app drawer, running as a borderless standalone app.

#### On iOS (Apple Safari):
1. Open the [Official App Link](https://splitflow-three.vercel.app/) in Safari.
2. Tap the **Share** icon (a square with an arrow pointing upwards) in the bottom navigation bar.
3. Scroll down the options list and select **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner. The SplitFlow icon will appear on your iOS home screen, launched without any browser tabs or URL bars.
