/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, CheckCircle, Mail, AlertTriangle, Clock, Calendar, 
  Settings, Award, Save, Send, Plus, Lock, ArrowRight, Upload, Globe, FileText, Check, Landmark, GraduationCap, Building
} from "lucide-react";
import { AwardCategory, Application, Announcement, EventCalendarItem, UserAccount } from "../types";

interface ParticipantPortalProps {
  currentUser: UserAccount | null;
  categories: AwardCategory[];
  applications: Application[];
  announcements: Announcement[];
  calendar: EventCalendarItem[];
  onSignIn: (email: string, name: string) => void;
  onSignUp: (email: string, name: string) => void;
  onVerifyEmail: (userId: string) => void;
  onSaveDraft: (appId: string, data: Partial<Application>) => void;
  onSubmitApplication: (appId: string) => void;
  onAddNewApplication: (categoryId: string, nominationType: "self" | "recommend") => void;
  onUpdateName: (newName: string) => void;
  activeTab?: "dashboard" | "apply" | "calendar" | "settings";
  onTabChange?: (tab: "dashboard" | "apply" | "calendar" | "settings") => void;
}

export default function ParticipantPortal({
  currentUser,
  categories,
  applications,
  announcements,
  calendar,
  onSignIn,
  onSignUp,
  onVerifyEmail,
  onSaveDraft,
  onSubmitApplication,
  onAddNewApplication,
  onUpdateName,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}: ParticipantPortalProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"dashboard" | "apply" | "calendar" | "settings">("dashboard");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange !== undefined ? externalOnTabChange : setInternalActiveTab;
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(null);
  const [selectedNominationType, setSelectedNominationType] = useState<"self" | "recommend">("self");

  // Dynamic state for active edited draft
  const [activeDraftApp, setActiveDraftApp] = useState<Application | null>(null);
  const [draftFields, setDraftFields] = useState<Record<string, any>>({});
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeEmail, setNomineeEmail] = useState("");
  const [nomineePhone, setNomineePhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Settings State
  const [settingsName, setSettingsName] = useState(currentUser?.name || "");
  const [settingsEmail, setSettingsEmail] = useState(currentUser?.email || "");
  const [settingsPassword, setSettingsPassword] = useState("••••••••••••");
  const [settingsMessage, setSettingsMessage] = useState("");

  // Update draft form state when switching active draft
  const loadDraft = (app: Application) => {
    setActiveDraftApp(app);
    setDraftFields(app.fields || {});
    setNomineeName(app.nomineeName || "");
    setNomineeEmail(app.nomineeEmail || "");
    setNomineePhone(app.nomineePhone || "");
    setCompanyName(app.companyName || "");
    setSelectedCategory(categories.find(c => c.id === app.categoryId) || null);
    setSelectedNominationType(app.nominationType);
  };

  // Sync draft local state to parent draft
  const handleAutoSave = () => {
    if (!activeDraftApp) return;
    setSaveStatus("saving");
    
    // Simulate auto-save delay
    setTimeout(() => {
      onSaveDraft(activeDraftApp.id, {
        nominationType: selectedNominationType,
        nomineeName: selectedNominationType === "self" ? (currentUser?.name || "") : nomineeName,
        nomineeEmail: selectedNominationType === "self" ? (currentUser?.email || "") : nomineeEmail,
        nomineePhone,
        companyName,
        fields: draftFields
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 4500);
  };

  // Trigger auto-save on field edits
  const updateField = (key: string, value: any) => {
    const updated = { ...draftFields, [key]: value };
    setDraftFields(updated);
    setSaveStatus("saving");
    onSaveDraft(activeDraftApp!.id, {
      fields: updated,
      nominationType: selectedNominationType,
      nomineeName: selectedNominationType === "self" ? (currentUser?.name || "") : nomineeName,
      nomineeEmail: selectedNominationType === "self" ? (currentUser?.email || "") : nomineeEmail,
      nomineePhone,
      companyName
    });
    setTimeout(() => setSaveStatus("saved"), 800);
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  // Keep track of our user's applications
  const myApplications = currentUser ? applications.filter(app => app.userId === currentUser.id) : [];

  const handleApplyClick = (cat: AwardCategory) => {
    setSelectedCategory(cat);
    // Categories B and C can handle 'recommend someone else'
    if (cat.group === "B" || cat.group === "C") {
      setSelectedNominationType("self"); // default
    } else {
      setSelectedNominationType("self");
    }
    
    // Check if user already has an application/draft for this category
    const existing = myApplications.find(app => app.categoryId === cat.id);
    if (existing) {
      loadDraft(existing);
      setActiveTab("apply");
    } else {
      // Create new application draft
      onAddNewApplication(cat.id, "self");
      setActiveTab("apply");
    }
  };

  // Automatically load the first available application draft on Tab load
  useEffect(() => {
    if (activeTab === "apply" && myApplications.length > 0 && !activeDraftApp) {
      loadDraft(myApplications[0]);
    }
  }, [activeTab, myApplications, activeDraftApp]);

  useEffect(() => {
    if (currentUser) {
      setSettingsName(currentUser.name);
      setSettingsEmail(currentUser.email);
    }
  }, [currentUser]);

  // LOGIN PAGE WORKFLOW
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <span className="p-3.5 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl shadow-md shadow-teal-500/10 text-white">
              <Award className="h-9 w-9" />
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-sans font-bold tracking-tight text-slate-900">
            Participant Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Register entries, self-nominate, or recommend candidates for the{" "}
            <span className="font-semibold text-slate-800">11th ICT Awards 2026</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 rounded-xl sm:px-10">
            {isRegistering ? (
              // Sign Up Form
              <form onSubmit={(e) => {
                e.preventDefault();
                onSignUp(emailInput, nameInput);
              }} className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Full Name / Organization</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Arjun Kandel"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Email address</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@company.com"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    disabled
                    placeholder="•••••••••••• (Auto Seeded in Sandbox)"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 rounded-md text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  id="btn-register-submit"
                >
                  Create Participant Account
                </button>
                <div className="text-center mt-3 text-xs text-slate-500">
                  By clicking register, you will initiate a passwordless sandbox account requiring a virtual email verify action.
                </div>
              </form>
            ) : (
              // Sign In Form
              <form onSubmit={(e) => {
                e.preventDefault();
                onSignIn(emailInput || "arjun@paynepal.com", "Arjun Kandel");
              }} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="arjun@paynepal.com"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    placeholder="•••••••••••• (Default Sandbox Password)"
                    defaultValue="demo123"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  id="btn-login-submit"
                >
                  Access Participant Portal
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between">
              <span className="w-1/5 border-b border-slate-200"></span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Sandbox Quick Mode</span>
              <span className="w-1/5 border-b border-slate-200"></span>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                id="toggle-register-btn"
              >
                {isRegistering ? "Back to standard Sign In" : "Don't have an account? Self-Register Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simulation Banner for email verification */}
      {!currentUser.isVerified && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Mandatory Verification Required:</strong> Your email <strong>{currentUser.email}</strong> is unverified. Access to form creation is strictly blocked.
              </span>
            </div>
            <button
              onClick={() => onVerifyEmail(currentUser.id)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-mono font-medium tracking-wide shadow flex items-center gap-1.5 transition-colors self-end sm:self-auto"
              id="sandbox-verify-trigger"
            >
              <Mail className="h-3.5 w-3.5" />
              Simulate Email Verification Link Click
            </button>
          </div>
        </div>
      )}

      {/* Main Portal Bar */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded">
                  <Award className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-800 text-sm tracking-wide uppercase font-sans">
                  Participant Portal
                </span>
              </div>
              <nav className="hidden md:flex gap-1">
                {(["dashboard", "apply", "calendar", "settings"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    id={`p-tab-${tab}`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-800">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wide">{currentUser.email}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
          {/* Mobile navigation */}
          <div className="md:hidden flex gap-1 py-2 overflow-x-auto border-t border-slate-100">
            {(["dashboard", "apply", "calendar", "settings"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shrink-0 rounded ${
                  activeTab === tab ? "bg-teal-50 text-teal-700" : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: UNIFIED DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-teal-600/30 opacity-40">
                <Award className="h-48 w-48 -mr-16 -mt-16" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl font-bold font-sans tracking-tight">Welcome to the Award Evaluation Engine</h2>
                <p className="mt-2 text-sm text-teal-100/90 leading-relaxed font-sans">
                  The ICT Awards are Nepal's most prestigious annual accolade celebrating innovation, startups, academic excellence, and individual leadership. You can nominate your projects or suggest outstanding names in the B & C categories directly from below.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 pt-1">
                  <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-mono">Sandbox Mode Active</span>
                  </div>
                  <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-mono">15 Category Openings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Application List section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Your ongoing drafts or entries */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Your Drafts & Submitted Entries ({myApplications.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("apply")}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      id="dashboard-new-form"
                    >
                      <Plus className="h-3 w-3" /> Create New
                    </button>
                  </div>

                  {myApplications.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-500">
                      <Award className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs mb-1">No applications found in this account.</p>
                      <p className="text-[10px] text-slate-400">Apply to different categories in the "Apply" section.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5" id="participants-drafts-list">
                      {myApplications.map((app) => {
                        const cat = categories.find(c => c.id === app.categoryId);
                        return (
                          <div 
                            key={app.id}
                            className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded">
                                  {cat?.group ? `Category ${cat.group}` : "ICT Award"}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  {cat?.title || "ICT Category"}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900 mt-1">
                                {app.nomineeName || "(No Name Draft)"}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                Nomination: <span className="uppercase text-slate-500 font-semibold">{app.nominationType}</span> | Last updated: {new Date(app.submittedAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {app.status === "DRAFT" ? (
                                <>
                                  <span className="text-[10px] text-amber-600 font-semibold font-mono uppercase bg-amber-50 px-2 py-1 rounded border border-amber-200/50 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Draft Persistence
                                  </span>
                                  <button
                                    onClick={() => {
                                      loadDraft(app);
                                      setActiveTab("apply");
                                    }}
                                    className="px-3 py-1.5 bg-slate-950 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-1 transition-colors"
                                  >
                                    Edit Form <ArrowRight className="h-3 w-3" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-emerald-700 font-semibold font-mono uppercase bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5" /> Approved / Submitted ({app.status})
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">Database Locked</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Categories available for application */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
                    Award Catalog & Call for Nominations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((cat) => {
                      const isApplied = myApplications.some(app => app.categoryId === cat.id);
                      return (
                        <div 
                          key={cat.id}
                          className="border border-slate-100 p-4 rounded-xl space-y-3 bg-white hover:shadow-sm hover:border-slate-300/80 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-mono text-[9px] uppercase font-bold">
                                Group {cat.group}
                              </span>
                              <span className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Deadline: {cat.deadline}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-2 hover:text-teal-600 transition-colors">
                              {cat.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {cat.description}
                            </p>
                          </div>
                          
                          <div className="pt-2">
                            {isApplied ? (
                              <button
                                onClick={() => handleApplyClick(cat)}
                                className="w-full py-1.5 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                              >
                                View / Continue Application
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApplyClick(cat)}
                                disabled={!currentUser.isVerified}
                                className={`w-full py-1.5 text-xs font-semibold rounded shadow-sm text-center block transition-all ${
                                  currentUser.isVerified
                                    ? "bg-slate-900 text-white hover:bg-teal-600"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                                }`}
                              >
                                {currentUser.isVerified ? "Nominate / Apply Now" : "Verify Email to Apply"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Alerts, calendar briefs, timeline */}
              <div className="space-y-6">
                
                {/* Real-time Deadline countdown alerts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
                    Broadcasting & Reminders
                  </h3>
                  <div className="space-y-3">
                    {announcements
                      .filter(ann => ann.targetRole === "ALL" || ann.targetRole === "PARTICIPANT")
                      .map((ann) => (
                        <div key={ann.id} className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg">
                          <h4 className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                            {ann.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {ann.content}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400 mt-2 block">
                            Fired on: {ann.date}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Calendar summary card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Upcoming Key Events
                    </h3>
                    <button onClick={() => setActiveTab("calendar")} className="text-[11px] text-teal-600 font-medium hover:underline">
                      See full calendar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {calendar.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div className="bg-slate-100 p-2 text-center rounded min-w-[55px] h-fit">
                          <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest leading-none">JUL/'26</span>
                          <span className="block font-sans font-bold text-slate-700 text-sm mt-0.5 leading-none">{item.date.split("-")[2] || "01"}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SMART APPLICATION FORM ENGINE */}
        {activeTab === "apply" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] font-mono tracking-wider font-bold uppercase border border-teal-500/30 rounded">
                      Smart Form Engine
                    </span>
                    <h2 className="text-xl font-sans font-bold mt-2">
                      {activeDraftApp ? `Form Entry: ${categories.find(c => c.id === activeDraftApp.categoryId)?.title}` : "Select Category Application"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Adaptive fields configure immediately depending on your chosen category rules. Draft is continuously cached in local sandbox memory.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeDraftApp && activeDraftApp.status === "DRAFT" && (
                      <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded border border-slate-700">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>
                          {saveStatus === "saving" ? "Auto-saving draft..." : saveStatus === "saved" ? "Draft persistent in LocalStorage" : "Draft sync online active"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Draft Selector Dropdown if user has multiple drafts */}
                {myApplications.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Switch Application Draft:</span>
                    <select
                      value={activeDraftApp?.id || ""}
                      onChange={(e) => {
                        const found = myApplications.find(app => app.id === e.target.value);
                        if (found) loadDraft(found);
                      }}
                      className="bg-slate-850 border border-slate-755 text-white rounded px-2 py-1 text-xs"
                      id="draft-selector-dropdown"
                    >
                      {myApplications.map(app => {
                        const cat = categories.find(c => c.id === app.categoryId);
                        return (
                          <option key={app.id} value={app.id}>
                            {cat?.title} ({app.nomineeName || "New Draft"}) - {app.status}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {!currentUser.isVerified ? (
                <div className="p-8 text-center text-slate-500 max-w-md mx-auto">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-800 text-lg">Verification Prerequisite</h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Before uploading documents, adding video demos, or saving entries, you must click the simulated confirmation link at the top banner to verify email authenticity.
                  </p>
                </div>
              ) : myApplications.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Award className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-800 text-lg">No Application Draft Initialized</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                    Select any category from the award catalog on your dashboard or select below to bootstrap an active draft.
                  </p>
                  <div className="mt-6 max-w-xs mx-auto">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onAddNewApplication(e.target.value, "self");
                        }
                      }}
                      className="w-full bg-white border border-slate-300 px-3 py-2 rounded text-xs text-slate-800"
                      id="category-bootstrapper"
                    >
                      <option value="">-- Choose Category to Apply --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : activeDraftApp ? (
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Category Locking Safeguard Indicator */}
                  {categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800 text-xs">
                      <Lock className="h-4 w-4 shrink-0 text-red-500" />
                      <span>
                        <strong>Automated System Lockdown Triggered:</strong> The official deadline for this category has elapsed or this form was locked. You may view the draft fields but modifications are rejected by the system database.
                      </span>
                    </div>
                  )}

                  {activeDraftApp.status !== "DRAFT" && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800 text-xs">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>
                        <strong>Entry Successfully Submitted:</strong> Your dossier is being inspected in <strong>Phase 1 (Internal screening)</strong>. The database is locked from further applicant edits to maintain absolute integrity of judging.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Nomination block */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                        Basic Application Metadata
                      </h3>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                          Nomination Type
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={activeDraftApp.isSubmitted || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                            onClick={() => {
                              setSelectedNominationType("self");
                              setNomineeName(currentUser.name);
                              setNomineeEmail(currentUser.email);
                            }}
                            className={`px-3 py-2 text-xs font-semibold rounded border text-center transition-all ${
                              selectedNominationType === "self" 
                                ? "bg-teal-50 border-teal-500 text-teal-700 font-bold" 
                                : "border-slate-200 text-slate-500"
                            }`}
                          >
                            Nominate Competent Self
                          </button>
                          <button
                            type="button"
                            disabled={
                              activeDraftApp.isSubmitted || 
                              categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked ||
                              selectedCategory?.group === "A" // category A is self only generally
                            }
                            onClick={() => {
                              setSelectedNominationType("recommend");
                              setNomineeName("");
                              setNomineeEmail("");
                            }}
                            className={`px-3 py-2 text-xs font-semibold rounded border text-center transition-all ${
                              selectedCategory?.group === "A" 
                                ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50"
                                : selectedNominationType === "recommend"
                                ? "bg-teal-50 border-teal-500 text-teal-700 font-bold"
                                : "border-slate-200 text-slate-500"
                            }`}
                          >
                            Recommend Someone Else {selectedCategory?.group === "A" && "(Disabled)"}
                          </button>
                        </div>
                        {selectedCategory?.group === "A" && (
                          <span className="text-[10px] text-slate-400 mt-1 block">Category A requires direct corporate self-nomination only.</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                          {selectedNominationType === "self" ? "Applicant / Organization Name" : "Proposed Nominee Full Name"}
                        </label>
                        <input
                          type="text"
                          disabled={activeDraftApp.status !== "DRAFT" || selectedNominationType === "self" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                          value={selectedNominationType === "self" ? currentUser.name : nomineeName}
                          onChange={(e) => {
                            setNomineeName(e.target.value);
                            handleAutoSave();
                          }}
                          placeholder="Full Name"
                          className="mt-1 block w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                            Official Email
                          </label>
                          <input
                            type="email"
                            disabled={activeDraftApp.status !== "DRAFT" || selectedNominationType === "self" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                            value={selectedNominationType === "self" ? currentUser.email : nomineeEmail}
                            onChange={(e) => {
                              setNomineeEmail(e.target.value);
                              handleAutoSave();
                            }}
                            placeholder="nominee@domain.com"
                            className="mt-1 block w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                            Primary Phone Number
                          </label>
                          <input
                            type="text"
                            disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                            value={nomineePhone}
                            onChange={(e) => {
                              setNomineePhone(e.target.value);
                              handleAutoSave();
                            }}
                            placeholder="e.g. 9851000000"
                            className="mt-1 block w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1"
                          />
                        </div>
                      </div>

                      {selectedCategory?.group === "A" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                            Registered Company Name
                          </label>
                          <input
                            type="text"
                            disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              handleAutoSave();
                            }}
                            placeholder="e.g. PayNepal Services Pvt. Ltd."
                            className="mt-1 block w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC FORM ACCORDING TO CATEGORIES */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                        Dynamic Category Criteria
                      </h3>

                      {selectedCategory?.group === "A" && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] text-slate-500 font-sans flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>These responses are directly scored with weights in the jury panel scorecard. Give precise parameters.</span>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Core Team & Technical Competence (Max 20 marks indicator)
                            </label>
                            <textarea
                              rows={2}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.teamExperience || ""}
                              onChange={(e) => updateField("teamExperience", e.target.value)}
                              placeholder="Detail key engineers, founder backgrounds, and domain experts."
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Traction & Growth Validation (Max 20 marks indicator)
                            </label>
                            <textarea
                              rows={2}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.currentTraction || ""}
                              onChange={(e) => updateField("currentTraction", e.target.value)}
                              placeholder="List key metrics, customer growth database, or financial revenue."
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Competitive Advantage & Novelty (Max 10 marks indicator)
                            </label>
                            <input
                              type="text"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.noveltyDefense || ""}
                              onChange={(e) => updateField("noveltyDefense", e.target.value)}
                              placeholder="How is this product uniquely innovative?"
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                                Live Demo Web URL
                              </label>
                              <input
                                type="text"
                                disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                                value={draftFields.demoVideoLink || ""}
                                onChange={(e) => updateField("demoVideoLink", e.target.value)}
                                placeholder="http://youtube.com/watch"
                                className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                                WorkForce Count
                              </label>
                              <input
                                type="number"
                                disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                                value={draftFields.employeesCount || ""}
                                onChange={(e) => updateField("employeesCount", e.target.value)}
                                placeholder="e.g. 15"
                                className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                              />
                            </div>
                          </div>

                          {/* Mock Document Upload box */}
                          <div className="border border-dashed border-slate-200 p-3 rounded-lg text-center bg-slate-50/50">
                            <Upload className="h-4.5 w-4.5 mx-auto text-slate-400 mb-1" />
                            <span className="text-[11px] block text-slate-600 font-semibold">Pitch Deck PDF / Company Profile</span>
                            <span className="text-[9px] block text-slate-400 mt-0.5">Limits: 15MB maximum. (Mock file selection fully functional)</span>
                            <input
                              type="file"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              onChange={(e) => {
                                const filename = e.target.files?.[0]?.name || "pitch_uploaded.pdf";
                                updateField("pitchDeckFilename", filename);
                              }}
                              className="mt-2 text-[10px] text-slate-500 bg-white ml-2 rounded p-1 border border-slate-100 w-full"
                            />
                            {draftFields.pitchDeckFilename && (
                              <p className="text-[10px] text-teal-600 mt-1 font-mono flex items-center justify-center gap-1">
                                <Check className="h-3 w-3" /> Encrypted file cached: {draftFields.pitchDeckFilename}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CATEGORY B: INDIVIDUAL EXCELLENCE */}
                      {selectedCategory?.group === "B" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Years of Active IT / Technical Experience
                            </label>
                            <input
                              type="text"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.yearsOfExp || ""}
                              onChange={(e) => updateField("yearsOfExp", e.target.value)}
                              placeholder="e.g. 14 years"
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Sovereign Accomplishments & Breakthroughs
                            </label>
                            <textarea
                              rows={3}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.achievements || ""}
                              onChange={(e) => updateField("achievements", e.target.value)}
                              placeholder="Detail key awards, software deployments, publishings, or infrastructure led."
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Nomination Narrative statement
                            </label>
                            <textarea
                              rows={2}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.narrativeStatement || ""}
                              onChange={(e) => updateField("narrativeStatement", e.target.value)}
                              placeholder="Why is this candidate the ultimate leader for ICT pioneer/excellence?"
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          {/* PDF Upload */}
                          <div className="border border-dashed border-slate-200 p-3 rounded-lg text-center bg-slate-50/50">
                            <FileText className="h-4.5 w-4.5 mx-auto text-slate-400 mb-1" />
                            <span className="text-[11px] block text-slate-600 font-semibold">Latest CV & Recommendation Letter</span>
                            <input
                              type="file"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              onChange={(e) => {
                                const filename = e.target.files?.[0]?.name || "individual_cv.pdf";
                                updateField("resumeFilename", filename);
                              }}
                              className="mt-2 text-[10px] text-slate-500 bg-white ml-2 rounded p-1"
                            />
                            {draftFields.resumeFilename && (
                              <p className="text-[10px] text-emerald-600 mt-1 font-mono">
                                Verified: {draftFields.resumeFilename}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CATEGORY C: ORGANIZATIONS */}
                      {selectedCategory?.group === "C" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Impact Metric & System Users Base
                            </label>
                            <input
                              type="text"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.impactScore || ""}
                              onChange={(e) => updateField("impactScore", e.target.value)}
                              placeholder="e.g. 50,000 active citizen profiles, or LMS integrated across 12 public schools"
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Sector Operational Blueprint
                            </label>
                            <textarea
                              rows={2}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.operationalBlueprint || ""}
                              onChange={(e) => updateField("operationalBlueprint", e.target.value)}
                              placeholder="Describe structural integration, governance, and technology used in service."
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>

                          {/* Document selection */}
                          <div className="border border-dashed border-slate-200 p-3 rounded-lg text-center bg-slate-50/50">
                            <Landmark className="h-4.5 w-4.5 mx-auto text-slate-400 mb-1" />
                            <span className="text-[11px] block text-slate-600 font-semibold">Government Audit / Service Integrity ISO Report</span>
                            <input
                              type="file"
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              onChange={(e) => {
                                const filename = e.target.files?.[0]?.name || "audit_report_certified.pdf";
                                updateField("servicesAuditFilename", filename);
                              }}
                              className="mt-2 text-[10px] text-slate-500 bg-white ml-2 rounded p-1"
                            />
                            {draftFields.servicesAuditFilename && (
                              <p className="text-[10px] text-teal-600 mt-1 font-mono">
                                Registered PDF: {draftFields.servicesAuditFilename}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* OTHER CATEGORIES FALLBACK */}
                      {(selectedCategory?.group === "D" || selectedCategory?.group === "RECOGNITION") && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Regional Core Contribution Synopsis
                            </label>
                            <textarea
                              rows={4}
                              disabled={activeDraftApp.status !== "DRAFT" || categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked}
                              value={draftFields.regionalSynopsis || ""}
                              onChange={(e) => updateField("regionalSynopsis", e.target.value)}
                              placeholder="Define the scope, technology baseline, and geographical impact area."
                              className="mt-1 block w-full border border-slate-300 rounded p-2 text-xs"
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Submit Action block */}
                  <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-mono">
                      <span>Unique Draft Token ID: </span>
                      <strong className="text-slate-800">{activeDraftApp.id}</strong>
                    </div>

                    <div className="flex gap-2">
                      {activeDraftApp.status === "DRAFT" && !categories.find(c => c.id === activeDraftApp.categoryId)?.isLocked && (
                        <>
                          <button
                            type="button"
                            onClick={handleAutoSave}
                            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition"
                          >
                            Force Manual Cache Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Are you ready to lock this entry and submit to administrative Phase 1 screening? You cannot edit this draft after submission.")) {
                                onSubmitApplication(activeDraftApp.id);
                              }
                            }}
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition flex items-center gap-1"
                            id="btn-submit-form-final"
                          >
                            <Send className="h-3.5 w-3.5" /> Submit Dossier & Lock Form
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 3: CONSOLIDATED EVENT CALENDAR */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-sans tracking-tight text-slate-800">Unified Evaluation & Milestone Calendar</h2>
                  <p className="text-xs text-slate-500">Official scheduling and chronological timeline for the 2026 Competition cycle.</p>
                </div>
                <span className="text-xs font-mono text-slate-400">Current Local Time Sandbox Active</span>
              </div>

              <div className="space-y-6">
                {calendar.map((item, idx) => {
                  const dateObj = new Date(item.date);
                  return (
                    <div key={item.id} className="relative flex gap-6 pl-2 group">
                      {/* Left vertical visual line */}
                      {idx !== calendar.length - 1 && (
                        <div className="absolute left-[31px] top-8 bottom-0 w-0.5 bg-slate-100 group-hover:bg-teal-100 transition-colors"></div>
                      )}
                      
                      {/* Calendar date icon */}
                      <div className="h-10 w-10 rounded-full bg-slate-900 text-white shrink-0 flex flex-col items-center justify-center font-mono text-[9px] relative z-10 border border-slate-800">
                        <span className="text-[7px] uppercase text-slate-400">JULY</span>
                        <strong className="text-xs leading-none mt-0.5">{item.date.split("-")[2]}</strong>
                      </div>

                      {/* Content block */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex-1 hover:border-slate-300/80 transition shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-teal-600 bg-teal-50 px-2 py-0.5 border border-teal-200/50 rounded">
                              {item.category}
                            </span>
                            <h4 className="font-bold text-slate-900 mt-1.5 text-sm">
                              {item.title}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-slate-400">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS PAGE */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-150">
                <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-slate-500" /> Account Settings
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage registration profile details, simulated authentications, and credentials.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                onUpdateName(settingsName);
                setSettingsMessage("Profile updated successfully!");
                setTimeout(() => setSettingsMessage(""), 2000);
              }} className="p-6 space-y-4">
                {settingsMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-medium rounded flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>{settingsMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Full Name / Institution Title
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    disabled
                    value={settingsEmail}
                    className="mt-1 block w-full border border-slate-200 bg-slate-50 text-slate-400 rounded px-3 py-2 text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be modified while drafts are active in sandbox.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    User Role Permission Matrix
                  </label>
                  <div className="mt-1.5 p-3 bg-slate-50 text-xs font-mono text-slate-600 rounded border border-slate-150">
                    Role: <strong className="text-teal-600 font-bold uppercase">{currentUser.role}</strong> (Standard self-registration access)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Change Password
                  </label>
                  <input
                    type="password"
                    disabled
                    value={settingsPassword}
                    className="mt-1 block w-full border border-slate-200 bg-slate-50 text-slate-400 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs transition"
                    id="btn-save-settings"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
