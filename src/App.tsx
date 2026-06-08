/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  AwardCategory, Application, JuryEvaluation, UserAccount, Announcement, EventCalendarItem, UserRole 
} from "./types";
import { 
  INITIAL_CATEGORIES, MOCK_USERS, INITIAL_APPLICATIONS, MOCK_EVALUATIONS, SAMPLE_CALENDAR, INITIAL_ANNOUNCEMENTS 
} from "./data/mockData";
import { storage } from "./utils";
import { 
  Award, Calendar, Settings, BarChart, CheckCircle, Users, AlertTriangle, Send 
} from "lucide-react";

import RoleSwitcher from "./components/RoleSwitcher";
import ParticipantPortal from "./components/ParticipantPortal";
import JuryPortal from "./components/JuryPortal";
import AdminPortal from "./components/AdminPortal";

export default function App() {
  // Sandbox State Management with persistent local-storage wrappers
  const [categories, setCategories] = useState<AwardCategory[]>(() => 
    storage.get<AwardCategory[]>("ict_categories", INITIAL_CATEGORIES)
  );
  const [applications, setApplications] = useState<Application[]>(() => 
    storage.get<Application[]>("ict_applications", INITIAL_APPLICATIONS)
  );
  const [evaluations, setEvaluations] = useState<JuryEvaluation[]>(() => 
    storage.get<JuryEvaluation[]>("ict_evaluations", MOCK_EVALUATIONS)
  );
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => 
    storage.get<UserAccount[]>("ict_users", MOCK_USERS)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => 
    storage.get<Announcement[]>("ict_announcements", INITIAL_ANNOUNCEMENTS)
  );
  const [calendar] = useState<EventCalendarItem[]>(SAMPLE_CALENDAR);

  // Active simulated login state
  const [currentRole, setCurrentRole] = useState<UserRole>("PARTICIPANT");
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Synchronized view tabs for the sidebar navigation flow
  const [participantTab, setParticipantTab] = useState<"dashboard" | "apply" | "calendar" | "settings">("dashboard");
  const [juryTab, setJuryTab] = useState<"worklist" | "guidelines" | "settings">("guidelines");
  const [adminTab, setAdminTab] = useState<"organizer" | "screening" | "deadlines" | "broadcasting" | "users" | "results">("organizer");
  const [adminUserFilter, setAdminUserFilter] = useState<"ALL" | "PARTICIPANT" | "JURY" | "ADMIN">("ALL");

  // Auto-initialize default user depending on initial role selector state
  useEffect(() => {
    if (!currentUser) {
      if (currentRole === "PARTICIPANT") {
        setCurrentUser(allUsers.find(u => u.role === "PARTICIPANT") || null);
      } else if (currentRole === "JURY") {
        setCurrentUser(allUsers.find(u => u.role === "JURY") || null);
      } else if (currentRole === "ADMIN") {
        setCurrentUser(allUsers.find(u => u.role === "ADMIN") || null);
      }
    }
  }, [currentRole, currentUser, allUsers]);

  // Sync states to local storage on change
  useEffect(() => {
    storage.set("ict_categories", categories);
  }, [categories]);

  useEffect(() => {
    storage.set("ict_applications", applications);
  }, [applications]);

  useEffect(() => {
    storage.set("ict_evaluations", evaluations);
  }, [evaluations]);

  useEffect(() => {
    storage.set("ict_users", allUsers);
  }, [allUsers]);

  useEffect(() => {
    storage.set("ict_announcements", announcements);
  }, [announcements]);

  // --- ACTIONS ---

  // Reset sandbox data back to original mocks
  const handleResetData = () => {
    if (confirm("Reset prototype database state back to master default files? This wipes your custom drafts.")) {
      localStorage.clear();
      setCategories(INITIAL_CATEGORIES);
      setApplications(INITIAL_APPLICATIONS);
      setEvaluations(MOCK_EVALUATIONS);
      setAllUsers(MOCK_USERS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      // Reset active session
      setCurrentRole("PARTICIPANT");
      setCurrentUser(MOCK_USERS.find(u => u.role === "PARTICIPANT") || null);
    }
  };

  // Sign in simulation
  const handleSignIn = (email: string, assumedName: string) => {
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
    } else {
      // Auto-provision standard sandbox account
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        email,
        role: "PARTICIPANT",
        name: assumedName || email.split("@")[0],
        isVerified: true
      };
      const updated = [...allUsers, newUser];
      setAllUsers(updated);
      setCurrentUser(newUser);
      setCurrentRole("PARTICIPANT");
    }
  };

  // Self-register account
  const handleSignUp = (email: string, name: string) => {
    const exists = allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      alert("This account already exists. Please login using the Sign In button.");
      return;
    }
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      email,
      role: "PARTICIPANT",
      name,
      isVerified: false // Requires virtual verification!
    };
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    setCurrentUser(newUser);
    setCurrentRole("PARTICIPANT");
  };

  // Verify email trigger simulation
  const handleVerifyEmail = (userId: string) => {
    const updated = allUsers.map(u => u.id === userId ? { ...u, isVerified: true } : u);
    setAllUsers(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, isVerified: true });
    }
  };

  // Edit/persist candidate application draft
  const handleSaveDraft = (appId: string, updatedFields: Partial<Application>) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          ...updatedFields,
          submittedAt: new Date().toISOString()
        };
      }
      return app;
    });
    setApplications(updated);
  };

  // Submit and lock the application
  const handleSubmitApplication = (appId: string) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: "SUBMITTED" as const,
          submittedAt: new Date().toISOString()
        };
      }
      return app;
    });
    setApplications(updated);
  };

  // Provision a brand new application draft
  const handleAddNewApplication = (categoryId: string, nominationType: "self" | "recommend") => {
    if (!currentUser) return;
    const newApp: Application = {
      id: `app-${Date.now()}`,
      categoryId,
      userId: currentUser.id,
      nominationType,
      nomineeName: nominationType === "self" ? currentUser.name : "",
      nomineeEmail: nominationType === "self" ? currentUser.email : "",
      nomineePhone: "",
      fields: {},
      status: "DRAFT",
      submittedAt: new Date().toISOString()
    };
    setApplications([...applications, newApp]);
  };

  // Update categories deadline
  const handleUpdateDeadline = (catId: string, newDate: string) => {
    const updated = categories.map(cat => cat.id === catId ? { ...cat, deadline: newDate } : cat);
    setCategories(updated);
  };

  // Toggle category lockdown toggle
  const handleToggleCategoryLock = (catId: string) => {
    const updated = categories.map(cat => cat.id === catId ? { ...cat, isLocked: !cat.isLocked } : cat);
    setCategories(updated);
  };

  // Admin Phase 1 Validation screening checks
  const handleScreenApplication = (appId: string, isPassed: boolean) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: isPassed ? ("SCREENED_IN" as const) : ("SCREENED_OUT" as const),
          submittedAt: new Date().toISOString()
        };
      }
      return app;
    });
    setApplications(updated);
  };

  // Add platform announcement broadcast
  const handleAddAnnouncement = (annData: Omit<Announcement, "id" | "date">) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    setAnnouncements([newAnn, ...announcements]);
  };

  // Submit Jury Rubric Grading
  const handleSubmitEvaluation = (evalData: Omit<JuryEvaluation, "id" | "submittedAt" | "isFinalized">) => {
    // Check if evaluation already exists, update it, else append
    const existsIdx = evaluations.findIndex(e => e.applicationId === evalData.applicationId && e.juryId === evalData.juryId);
    
    const newEval: JuryEvaluation = {
      ...evalData,
      id: existsIdx !== -1 ? evaluations[existsIdx].id : `eval-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      isFinalized: true
    };

    if (existsIdx !== -1) {
      const updated = [...evaluations];
      updated[existsIdx] = newEval;
      setEvaluations(updated);
    } else {
      setEvaluations([...evaluations, newEval]);
    }
  };

  const handleResetEvaluation = (evalId: string) => {
    const updated = evaluations.filter(e => e.id !== evalId);
    setEvaluations(updated);
  };

  // --- ADMIN USER MANAGEMENT SIMULATION ACTIONS ---
  const handleAddUser = (user: { name: string; email: string; role: UserRole; assignedCategoryIds?: string[] }) => {
    const exists = allUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      alert("A user account with this email already exists!");
      return;
    }
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: true,
      assignedCategoryIds: user.assignedCategoryIds || [],
      isDeactivated: false
    };
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
  };

  const handleAddScreenedParticipant = (participant: {
    name: string;
    email: string;
    categoryId: string;
    nominationType: "self" | "recommend";
    companyName?: string;
    fields: Record<string, any>;
  }) => {
    const exists = allUsers.some(u => u.email.toLowerCase() === participant.email.toLowerCase());
    if (exists) {
      alert("A user account with this email already exists!");
      return;
    }
    
    const userId = `user-${Date.now()}`;
    const newUser: UserAccount = {
      id: userId,
      email: participant.email,
      role: "PARTICIPANT",
      name: participant.name,
      isVerified: true,
      isDeactivated: false
    };
    
    const newApp: Application = {
      id: `app-${Date.now()}`,
      categoryId: participant.categoryId,
      userId: userId,
      nominationType: participant.nominationType,
      nomineeName: participant.name,
      nomineeEmail: participant.email,
      nomineePhone: "+977-1-445566",
      companyName: participant.companyName,
      fields: participant.fields,
      status: "SCREENED_IN",
      submittedAt: new Date().toISOString()
    };
    
    const updatedUsers = [...allUsers, newUser];
    const updatedApps = [...applications, newApp];
    
    setAllUsers(updatedUsers);
    setApplications(updatedApps);
    
    storage.set("ict_users", updatedUsers);
    storage.set("ict_applications", updatedApps);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole, assignedCategoryIds?: string[]) => {
    const updated = allUsers.map(u => 
      u.id === userId 
        ? { ...u, role: newRole, assignedCategoryIds: assignedCategoryIds ?? u.assignedCategoryIds } 
        : u
    );
    setAllUsers(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole, assignedCategoryIds: assignedCategoryIds ?? prev.assignedCategoryIds } : null);
    }
  };

  const handleToggleUserDeactivity = (userId: string) => {
    const updated = allUsers.map(u => 
      u.id === userId ? { ...u, isDeactivated: !u.isDeactivated } : u
    );
    setAllUsers(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isDeactivated: !prev.isDeactivated } : null);
    }
  };

  // Switch role and prefetch first user belonging to role to keep testing fluid
  const handleSwitchUserAndRole = (user: UserAccount | null, role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(user);
    if (role === "PARTICIPANT") setParticipantTab("dashboard");
    if (role === "JURY") setJuryTab("guidelines");
    if (role === "ADMIN") {
      setAdminTab("organizer");
      setAdminUserFilter("ALL");
    }
  };

  // Profile updating
  const handleUpdateProfileName = (newName: string) => {
    if (!currentUser) return;
    
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? { ...u, name: newName } : u);
    setAllUsers(updatedUsers);
    setCurrentUser({ ...currentUser, name: newName });
  };

  // Navigation Sidebar Component
  const renderSidebar = () => {
    if (!currentUser) return null;

    return (
      <aside className="w-full md:w-64 bg-slate-950/40 md:bg-white/5 backdrop-filter backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col p-5 shrink-0 z-20" id="global-sidebar">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-3 mb-8 select-none">
          <div className="w-9 h-9 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10 text-white font-black text-sm">
            ICT
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight text-white block">ICT Awards 2026</span>
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Role: {currentUser.role}</span>
          </div>
        </div>

        {/* Dynamic Navigation list depending on role */}
        <nav className="flex-1 space-y-1.5">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold mb-3 px-2 select-none">
            Main Menu
          </div>

          {currentUser.role === "PARTICIPANT" && (
            <>
              {/* Participant Links */}
              <button
                onClick={() => setParticipantTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  participantTab === "dashboard"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-p-dashboard"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </div>
                My Dashboard
              </button>

              <button
                onClick={() => setParticipantTab("apply")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  participantTab === "apply"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-p-apply"
              >
                <Award className="h-4 w-4" />
                Nominate & Apply
              </button>

              <button
                onClick={() => setParticipantTab("calendar")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  participantTab === "calendar"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-p-calendar"
              >
                <Calendar className="h-4 w-4" />
                Event Calendar
              </button>

              <button
                onClick={() => setParticipantTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  participantTab === "settings"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-p-settings"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </button>
            </>
          )}

          {currentUser.role === "JURY" && (
            <>
              {/* Jury Links */}
              <button
                onClick={() => setJuryTab("guidelines")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  juryTab === "guidelines"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-j-dashboard"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </div>
                Jury Dashboard
              </button>

              <button
                onClick={() => setJuryTab("worklist")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  juryTab === "worklist"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-j-submissions"
              >
                <CheckCircle className="h-4 w-4" />
                View Submissions
              </button>

              <button
                onClick={() => setJuryTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  juryTab === "settings"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-j-settings"
              >
                <Settings className="h-4 w-4" />
                Settings & Sectors
              </button>
            </>
          )}

          {currentUser.role === "ADMIN" && (
            <>
              {/* Admin Links */}
              <button
                onClick={() => setAdminTab("organizer")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "organizer"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-dashboards"
              >
                <BarChart className="h-4 w-4" />
                View All Dashboards
              </button>

              <button
                onClick={() => {
                  setAdminTab("users");
                  setAdminUserFilter("PARTICIPANT");
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "users" && adminUserFilter === "PARTICIPANT"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-participants"
              >
                <Users className="h-4 w-4 text-teal-400" />
                Manage Participants
              </button>

              <button
                onClick={() => {
                  setAdminTab("users");
                  setAdminUserFilter("JURY");
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "users" && adminUserFilter === "JURY"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-juries"
              >
                <Users className="h-4 w-4 text-amber-400" />
                Manage Juries
              </button>

              <button
                onClick={() => setAdminTab("screening")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "screening"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-submissions"
              >
                <CheckCircle className="h-4 w-4" />
                Manage Submissions
              </button>

              <button
                onClick={() => setAdminTab("deadlines")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "deadlines" || adminTab === "broadcasting"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-settings"
              >
                <Settings className="h-4 w-4" />
                Global Settings
              </button>

              <button
                onClick={() => setAdminTab("results")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  adminTab === "results"
                    ? "bg-white/10 border border-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                id="nav-a-results"
              >
                <BarChart className="h-4 w-4 text-emerald-400" />
                Calculated Results
              </button>
            </>
          )}
        </nav>

        {/* User profile card in sidebar */}
        <div className="mt-8 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5 select-none animate-fade-in text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 font-extrabold text-xs flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/10">
            {currentUser.name ? currentUser.name.charAt(0) : "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight mb-0.5">{currentUser.name}</p>
            <p className="text-[9px] text-slate-400 truncate leading-none">{currentUser.email}</p>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden" id="ict-award-evaluation-app">
      {/* Decorative glass background blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/25 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "12s" }}></div>
      <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "16s" }}></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[125px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "14s" }}></div>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Dynamic Simulation switcher */}
        <RoleSwitcher
          currentRole={currentRole}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUserAndRole}
          onResetData={handleResetData}
        />

        {/* Primary Role portal conditional gateways & layout container */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Render Left Sidebar */}
          {renderSidebar()}

          {/* Render Active Viewport Content */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {currentUser && currentUser.isDeactivated ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center" id="suspended-account-barrier">
                <div className="bg-[#0b1329]/60 backdrop-blur-xl border border-rose-500/15 p-10 rounded-2xl max-w-md shadow-2xl space-y-4 animate-fade-in my-16 mx-4">
                  <div className="w-14 h-14 bg-rose-500/10 text-rose-450 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-7 w-7 text-rose-500" />
                  </div>
                  <h2 className="text-lg font-bold font-sans text-rose-400">Database Access Suspended</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Your simulated context identifier (<strong>{currentUser.email}</strong>) has been set to <strong>Deactivated</strong> status by Super Admin operators.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    If this simulation is expected, switch users from the sandbox selector above or click the Reset Data trigger.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                {currentRole === "PARTICIPANT" && (
                  <ParticipantPortal
                    currentUser={currentUser}
                    categories={categories}
                    applications={applications}
                    announcements={announcements}
                    calendar={calendar}
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                    onVerifyEmail={handleVerifyEmail}
                    onSaveDraft={handleSaveDraft}
                    onSubmitApplication={handleSubmitApplication}
                    onAddNewApplication={handleAddNewApplication}
                    onUpdateName={handleUpdateProfileName}
                    activeTab={participantTab}
                    onTabChange={setParticipantTab}
                  />
                )}

                {currentRole === "JURY" && (
                  <JuryPortal
                    currentUser={currentUser}
                    categories={categories}
                    applications={applications}
                    evaluations={evaluations}
                    onSignIn={handleSignIn}
                    onSubmitEvaluation={handleSubmitEvaluation}
                    onResetEvaluation={handleResetEvaluation}
                    activeTab={juryTab}
                    onTabChange={setJuryTab}
                  />
                )}

                {currentRole === "ADMIN" && (
                  <AdminPortal
                    currentUser={currentUser}
                    categories={categories}
                    applications={applications}
                    evaluations={evaluations}
                    allUsers={allUsers}
                    announcements={announcements}
                    calendar={calendar}
                    onUpdateDeadline={handleUpdateDeadline}
                    onToggleCategoryLock={handleToggleCategoryLock}
                    onScreenApplication={handleScreenApplication}
                    onAddAnnouncement={handleAddAnnouncement}
                    activeTab={adminTab}
                    onTabChange={setAdminTab}
                    userFilter={adminUserFilter}
                    onChangeUserFilter={setAdminUserFilter}
                    onAddUser={handleAddUser}
                    onUpdateUserRole={handleUpdateUserRole}
                    onToggleUserDeactivity={handleToggleUserDeactivity}
                    onAddScreenedParticipant={handleAddScreenedParticipant}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
