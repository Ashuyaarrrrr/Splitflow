import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GroupProvider } from "./context/GroupContext";
import { ToastProvider } from "./components/Toast";
import { PageLayout } from "./components/PageLayout";
import { BottomNav } from "./components/BottomNav";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { GroupDetails } from "./pages/GroupDetails";
import { Activity } from "./pages/Activity";
import { Profile } from "./pages/Profile";

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [authView, setAuthView] = useState("landing"); // landing | login | signup
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | activity | profile
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold tracking-wider">Loading SplitFlow...</span>
        </div>
      </div>
    );
  }

  // Non-authenticated user view
  if (!currentUser) {
    if (authView === "landing") {
      return (
        <PageLayout title="Welcome">
          <Landing onGetStarted={() => setAuthView("login")} />
        </PageLayout>
      );
    }
    
    return (
      <PageLayout 
        title={authView === "login" ? "Sign In" : "Register"}
        showBackButton={true}
        onBack={() => setAuthView(authView === "login" ? "landing" : "login")}
      >
        {authView === "login" ? (
          <Login onNavigateToSignup={() => setAuthView("signup")} />
        ) : (
          <Signup onNavigateToLogin={() => setAuthView("login")} />
        )}
      </PageLayout>
    );
  }

  // Authenticated user page router
  let pageContent;
  let pageTitle = "SplitFlow";
  let showBackButton = false;

  if (selectedGroupId) {
    pageTitle = "Group Details";
    showBackButton = true;
    pageContent = (
      <GroupDetails 
        groupId={selectedGroupId} 
        onBack={() => setSelectedGroupId(null)} 
      />
    );
  } else {
    switch (activeTab) {
      case "activity":
        pageTitle = "Recent Activity";
        pageContent = <Activity />;
        break;
      case "profile":
        pageTitle = "My Settings";
        pageContent = <Profile />;
        break;
      case "dashboard":
      default:
        pageTitle = "SplitFlow";
        pageContent = (
          <Dashboard 
            onNavigateToGroup={(id) => setSelectedGroupId(id)} 
          />
        );
        break;
    }
  }

  return (
    <PageLayout 
      title={pageTitle} 
      showBackButton={showBackButton} 
      onBack={() => setSelectedGroupId(null)}
    >
      {pageContent}
      
      {/* Sticky Bottom Nav rendered inside phone mockup container */}
      {!selectedGroupId && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </PageLayout>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <GroupProvider>
          <AppContent />
        </GroupProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
