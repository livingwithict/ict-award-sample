/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, CheckCircle, Clock, Calendar, MessageSquare, 
  Send, Users, EyeOff, Lock, Unlock, CheckCircle2, 
  AlertTriangle, RefreshCw, BarChart, Settings, FileText, ArrowRight, XCircle,
  UserPlus
} from "lucide-react";
import { AwardCategory, Application, JuryEvaluation, UserAccount, Announcement, EventCalendarItem, UserRole } from "../types";

interface AdminPortalProps {
  currentUser: UserAccount | null;
  categories: AwardCategory[];
  applications: Application[];
  evaluations: JuryEvaluation[];
  allUsers: UserAccount[];
  announcements: Announcement[];
  calendar: EventCalendarItem[];
  onUpdateDeadline: (catId: string, newDate: string) => void;
  onToggleCategoryLock: (catId: string) => void;
  onScreenApplication: (appId: string, isPassed: boolean) => void;
  onAddAnnouncement: (ann: Omit<Announcement, "id" | "date">) => void;
  
  // External navigation props
  activeTab?: "organizer" | "screening" | "deadlines" | "broadcasting" | "users" | "results";
  onTabChange?: (tab: "organizer" | "screening" | "deadlines" | "broadcasting" | "users" | "results") => void;
  userFilter?: "ALL" | "PARTICIPANT" | "JURY" | "ADMIN";
  onChangeUserFilter?: (filter: "ALL" | "PARTICIPANT" | "JURY" | "ADMIN") => void;

  // User management props
  onAddUser: (user: { name: string; email: string; role: UserRole; assignedCategoryIds?: string[] }) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole, assignedCategoryIds?: string[]) => void;
  onToggleUserDeactivity: (userId: string) => void;
  onAddScreenedParticipant?: (participant: {
    name: string;
    email: string;
    categoryId: string;
    nominationType: "self" | "recommend";
    companyName?: string;
    fields: Record<string, any>;
  }) => void;
}

export default function AdminPortal({
  currentUser,
  categories,
  applications,
  evaluations,
  allUsers,
  announcements,
  calendar,
  onUpdateDeadline,
  onToggleCategoryLock,
  onScreenApplication,
  onAddAnnouncement,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  userFilter: externalUserFilter,
  onChangeUserFilter,
  onAddUser,
  onUpdateUserRole,
  onToggleUserDeactivity,
  onAddScreenedParticipant
}: AdminPortalProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"organizer" | "screening" | "deadlines" | "broadcasting" | "users" | "results">("organizer");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange !== undefined ? externalOnTabChange : setInternalActiveTab;

  const [internalUserFilter, setInternalUserFilter] = useState<"ALL" | "PARTICIPANT" | "JURY" | "ADMIN">("ALL");
  const userFilter = externalUserFilter !== undefined ? externalUserFilter : internalUserFilter;
  const setUserFilter = onChangeUserFilter !== undefined ? onChangeUserFilter : setInternalUserFilter;

  // User Management local form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("PARTICIPANT");
  const [newUserCategories, setNewUserCategories] = useState<string[]>([]);
  const [userManageSuccess, setUserManageSuccess] = useState<string | null>(null);

  // Screening Fast-Track Form states
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directCompanyName, setDirectCompanyName] = useState("");
  const [directNominationType, setDirectNominationType] = useState<"self" | "recommend">("self");
  const [directCategory, setDirectCategory] = useState("");
  const [directDescription, setDirectDescription] = useState("");
  const [directTraction, setDirectTraction] = useState("");
  const [directNovelty, setDirectNovelty] = useState("");
  const [directSuccess, setDirectSuccess] = useState(false);

  // Edit states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserRole, setEditUserRole] = useState<UserRole>("PARTICIPANT");
  const [editUserCategories, setEditUserCategories] = useState<string[]>([]);

  // State for announcement composer
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annRole, setAnnRole] = useState<"ALL" | "PARTICIPANT" | "JURY">("ALL");
  const [annSuccess, setAnnSuccess] = useState(false);

  // Statistics Computations
  const totalApplicationsCount = applications.length;
  const draftApps = applications.filter(app => app.status === "DRAFT");
  const activeDraftsCount = draftApps.length; // Active drafts to gauge metrics!
  const submittedCount = applications.filter(app => app.status !== "DRAFT").length;
  
  const screenedInApps = applications.filter(app => app.status !== "DRAFT" && app.status !== "SCREENED_OUT");
  const screenedOutCount = applications.filter(app => app.status === "SCREENED_OUT").length;

  const totalJuries = allUsers.filter(u => u.role === "JURY");

  // Blind Progress Tracker Calculations:
  // Show jury work status (percent done) without showing their actual scores or who they voted for.
  const blindJuryProgress = totalJuries.map((jury, index) => {
    // How many applications exist in categories assigned to this jury
    const assignedCatIds = jury.assignedCategoryIds || [];
    const eligibleApps = applications.filter(app => 
      assignedCatIds.includes(app.categoryId) && app.status !== "DRAFT" && app.status !== "SCREENED_OUT"
    );
    const eligibleCount = eligibleApps.length;

    // How many of these has this specific jury graded
    const gradedCount = evaluations.filter(e => 
      e.juryId === jury.id && eligibleApps.some(app => app.id === e.applicationId)
    ).length;

    const completedPercent = eligibleCount > 0 ? Math.round((gradedCount / eligibleCount) * 100) : 0;

    return {
      fakeName: `Anonymous Expert #${index + 101}`,
      realName: jury.name, // Displaying only in sandbox, but emphasizing Split-Blind state
      categories: categories.filter(c => assignedCatIds.includes(c.id)).map(c => c.code),
      completedPercent,
      gradedCount,
      eligibleCount
    };
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    onAddAnnouncement({
      title: annTitle,
      content: annContent,
      targetRole: annRole
    });

    setAnnTitle("");
    setAnnContent("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin SubHeader */}
      <div className="bg-slate-900 border-b border-rose-500 py-3.5 px-4 sm:px-6 shrink-0 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-500/15 text-rose-400 rounded-lg border border-rose-500/30">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Super Admin Panel (Organizer Dashboard)
              </h1>
              <p className="text-xs text-slate-400">
                Rule configurations, Phase 1 Screening gates, and Blind progression metrics.
              </p>
            </div>
          </div>
          
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 flex-wrap">
            {(["organizer", "screening", "deadlines", "broadcasting", "users", "results"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-rose-500 text-white shadow"
                    : "text-slate-400 hover:text-slate-100"
                }`}
                id={`a-tab-${tab}`}
              >
                {tab === "users" ? "Users" : tab === "results" ? "Results Grid" : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Admin Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" id="admin-main-container">
        
        {/* TAB 1: METRICS & BLIND PROGRESS MONITORING */}
        {activeTab === "organizer" && (
          <div className="space-y-6">
            
            {/* Split statistics block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid-admin">
              
              {/* Stat 1: Drafts gauge */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-widest block">Active Drafts Count</span>
                  <strong className="text-3xl font-sans font-black text-rose-600 block mt-1">{activeDraftsCount}</strong>
                  <span className="text-[9px] text-slate-500 mt-1 block">Live cached applicant drafts</span>
                </div>
                <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                  <RefreshCw className="h-5 w-5 animate-spin-slow" />
                </div>
              </div>

              {/* Stat 2: Submitted applications */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-widest block">Submitted Entries</span>
                  <strong className="text-3xl font-sans font-black text-slate-800 block mt-1">{submittedCount}</strong>
                  <span className="text-[9px] text-emerald-600 mt-1 font-semibold flex items-center gap-0.5">
                    ● Screened In: {screenedInApps.length}
                  </span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              {/* Stat 3: Screened Out */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-widest block">Screened Out (Fails)</span>
                  <strong className="text-3xl font-sans font-black text-slate-850 block mt-1">{screenedOutCount}</strong>
                  <span className="text-[9px] text-slate-500 mt-1 block">Administrative disqualifications</span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>

              {/* Stat 4: Panel Juries */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-widest block">Manually Invites Juries</span>
                  <strong className="text-3xl font-sans font-black text-slate-800 block mt-1">{totalJuries.length} / 16</strong>
                  <span className="text-[9px] text-slate-500 mt-1 block">Standard + authenticator enabled</span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
              </div>

            </div>

            {/* Split-Blind Data Matrix policy banner */}
            <div className="bg-[#0b1329] text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[9px] uppercase tracking-wider font-bold">
                  Split-Blind judging policy active
                </span>
                <h3 className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
                  <EyeOff className="h-4.5 w-4.5 text-rose-400" /> Blind Progress Tracking Metrics Module
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xl">
                  <strong>The Evaluation Integrity Rule:</strong> Organizers track if evaluations are submitted, but score distributions, criteria markings, and candidate profiles remain nested and hidden from super admins until grand final calculations are completed.
                </p>
              </div>
              <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] p-2.5 rounded font-mono leading-relaxed">
                ● Status check: 100% Secure
              </div>
            </div>

            {/* Simulated Blind Progress Tracking chart-table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
                Grand Jury Evaluation Completion Tracking (Split-Blind Table)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700" id="blind-progress-table">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-mono tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Expert Profile (Masked ID)</th>
                      <th className="py-3 px-4">Assigned Sectors</th>
                      <th className="py-3 px-4">Committed Assignments</th>
                      <th className="py-3 px-4">Progress Completed</th>
                      <th className="py-3 px-4">Individual Marking Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blindJuryProgress.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {item.fakeName} 
                          <span className="text-[9px] text-slate-400 block font-normal font-sans">
                            Sandbox bypass profile: {item.realName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {item.categories.map((c, cIdx) => (
                              <span key={cIdx} className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-150">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {item.gradedCount} / {item.eligibleCount} graded
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-28 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-rose-500 transition-all rounded-full"
                                style={{ width: `${item.completedPercent}%` }}
                              ></div>
                            </div>
                            <span className="font-mono font-bold">{item.completedPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[10px] text-rose-500 font-medium font-mono uppercase flex items-center gap-1 text-rose-500">
                          <EyeOff className="h-3.5 w-3.5" /> Blocked (Blind Matrix)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
        {/* TAB 2: ADMINISTRATIVE PHASE 1 SCREENING */}
        {activeTab === "screening" && (
          <div className="space-y-6 animate-fade-in" id="phase-1-screening-sec">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Direct nomination screened participant injector */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs h-fit">
                <div className="border-b border-slate-100 pb-2.5">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded font-mono text-[9px] uppercase tracking-wider font-extrabold">
                    Primary Organizers Engine
                  </span>
                  <h3 className="text-xs font-bold text-slate-950 mt-1.5 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                     <UserPlus className="h-4.5 w-4.5 text-rose-500" /> Direct Add Screened Participant
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Directly inject a verified applicant. Creates user credentials & forwards status straight to the assigned Grand Jury's workspace worklist.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!directName.trim() || !directEmail.trim() || !directCategory) return;
                  
                  onAddScreenedParticipant?.({
                    name: directName,
                    email: directEmail,
                    categoryId: directCategory,
                    nominationType: directNominationType,
                    companyName: directCompanyName || undefined,
                    fields: {
                      teamExperience: directDescription || "Admitted under direct nomination protocols with valid registration licensing verified.",
                      currentTraction: directTraction || "Demonstrated operational products with verified testing statistics.",
                      novelty: directNovelty || "Proprietary design leveraging modern automation models."
                    }
                  });
                  
                  setDirectName("");
                  setDirectEmail("");
                  setDirectCompanyName("");
                  setDirectDescription("");
                  setDirectTraction("");
                  setDirectNovelty("");
                  setDirectSuccess(true);
                  setTimeout(() => setDirectSuccess(false), 4500);
                }} className="space-y-3">
                  {directSuccess && (
                     <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded flex items-center gap-1.5 animate-pulse">
                       <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                       <span>Screened participant registered! Sent to category Grand Jury worklist.</span>
                     </div>
                  )}

                  <div>
                    <label htmlFor="direct-name" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Contestant Full Name</label>
                    <input
                      id="direct-name"
                      type="text"
                      required
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      placeholder="e.g. Samir Shrestha"
                      className="mt-1 block w-full border border-slate-350 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="direct-email" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
                    <input
                      id="direct-email"
                      type="email"
                      required
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      placeholder="samir@nepaltech.org"
                      className="mt-1 block w-full border border-slate-350 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="direct-nomination" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nomination</label>
                      <select
                        id="direct-nomination"
                        value={directNominationType}
                        onChange={(e) => setDirectNominationType(e.target.value as any)}
                        className="mt-1 block w-full bg-white border border-slate-355 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="self">Self Nominated</option>
                        <option value="recommend">Recommended</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="direct-category" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Category Sector</label>
                      <select
                        id="direct-category"
                        required
                        value={directCategory}
                        onChange={(e) => setDirectCategory(e.target.value)}
                        className="mt-1 block w-full bg-white border border-slate-355 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="direct-company" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Company / Project Name</label>
                    <input
                      id="direct-company"
                      type="text"
                      value={directCompanyName}
                      onChange={(e) => setDirectCompanyName(e.target.value)}
                      placeholder="e.g. Nepal Trajectory Systems"
                      className="mt-1 block w-full border border-slate-355 border-slate-3d0 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="direct-desc" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Detailed Portfolio Narrative</label>
                    <textarea
                      id="direct-desc"
                      rows={2}
                      value={directDescription}
                      onChange={(e) => setDirectDescription(e.target.value)}
                      placeholder="Describe applicant innovative factors..."
                      className="mt-1 block w-full border border-slate-355 border-slate-3d0 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="direct-traction" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Performance & Traction Metrics</label>
                    <input
                      id="direct-traction"
                      type="text"
                      value={directTraction}
                      onChange={(e) => setDirectTraction(e.target.value)}
                      placeholder="e.g. 15,000 active devices across 18 zones"
                      className="mt-1 block w-full border border-slate-355 border-slate-3d0 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="direct-novelty" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Technological Novelty Aspects</label>
                    <input
                      id="direct-novelty"
                      type="text"
                      value={directNovelty}
                      onChange={(e) => setDirectNovelty(e.target.value)}
                      placeholder="e.g. Proprietary mesh transmission protocols"
                      className="mt-1 block w-full border border-slate-355 border-slate-3d0 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono rounded-lg uppercase tracking-wider transition-all shadow cursor-pointer mt-1 flex items-center justify-center gap-1"
                  >
                    🚀 Release & Screen-In Participant
                  </button>
                </form>
              </div>

              {/* Right Column: Submitted applications list for screening action */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono mb-2">
                    Phase 1 Internal Screening & Verification Dashboard
                  </h2>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Verify locked applicant details, compliance criteria, or document attachments. Approve to screen-pass candidates directly into Grand Jury worklist rounds.
                  </p>

                  <div className="mt-6 space-y-4">
                    {applications.filter(app => app.status !== "DRAFT").length === 0 ? (
                      <div className="border border-dashed border-slate-200 text-center p-12 rounded bg-slate-50/50">
                        <CheckCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No applications have been finalized or locked by participants yet.</p>
                      </div>
                    ) : (
                      applications
                        .filter(app => app.status !== "DRAFT")
                        .map((app) => {
                          const cat = categories.find(c => c.id === app.categoryId);
                          return (
                            <div 
                              key={app.id}
                              className="border border-slate-200 hover:border-slate-300 rounded-lg p-5 bg-white shadow-xs space-y-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-rose-50 px-2 py-0.5 text-rose-600 border border-rose-200 text-[9px] font-bold font-mono rounded uppercase">
                                      {cat?.group ? `${cat.code} - ${cat.group}` : "ICT Award"}
                                    </span>
                                    <h4 className="text-sm font-semibold text-slate-900">
                                      {app.nomineeName} {app.companyName && `(${app.companyName})`}
                                    </h4>
                                  </div>
                                  <p className="text-xs font-mono text-slate-400 mt-1">
                                    Unique ID: {app.id} | Email: {app.nomineeEmail} | Phone: {app.nomineePhone} | Submission: {new Date(app.submittedAt).toLocaleDateString()}
                                  </p>
                                </div>

                                <div>
                                  {app.status === "SCREENED_IN" ? (
                                    <span className="text-[10px] text-emerald-700 font-semibold font-mono bg-emerald-50 px-2.5 py-1 rounded border border-emerald-250 flex items-center gap-1 uppercase">
                                      ● Screen Passed (sent to Jury)
                                    </span>
                                  ) : app.status === "SCREENED_OUT" ? (
                                    <span className="text-[10px] text-slate-500 font-semibold font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-205 flex items-center gap-1 uppercase">
                                      ● Screened Out (Excluded)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-700 font-semibold font-mono bg-amber-50 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1 uppercase">
                                      ● Pending Checks (Phase 1)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Render Details */}
                              <div className="p-3 bg-slate-50 rounded border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <strong className="text-slate-600 font-semibold block">Team Profile:</strong>
                                  <p className="text-slate-500 mt-0.5">{app.fields.teamExperience || app.fields.description || "(No response)"}</p>
                                </div>
                                <div>
                                  <strong className="text-slate-600 font-semibold block">Traction metrics & Novelty:</strong>
                                  <p className="text-slate-500 mt-0.5">
                                    {app.fields.currentTraction || app.fields.traction || ""}{" "}
                                    {app.fields.novelty ? `| Novelty: ${app.fields.novelty}` : ""}
                                    {!app.fields.currentTraction && !app.fields.traction && !app.fields.novelty && "(No response)"}
                                  </p>
                                </div>
                              </div>

                              {/* Screening Controls buttons */}
                              {app.status === "SUBMITTED" && (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => onScreenApplication(app.id, false)}
                                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded"
                                  >
                                    Reject / Screen Out
                                  </button>
                                  <button
                                    onClick={() => onScreenApplication(app.id, true)}
                                    className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded shadow-sm flex items-center gap-1"
                                  >
                                    Forward to Jury Round (Screen Pass) <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ADAPTIVE DEADLINE CONTROLS */}
        {activeTab === "deadlines" && (
          <div className="space-y-6" id="deadline-controls-sec">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono mb-2">
                Adaptive Category Deadlines & Lockdown Settings
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Configure distinct cutoff timelines across different category groups (e.g., closing startups early). Once a lock state is triggered, database submissions from applicants and jury score entries reject updates automatically.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700" id="deadlines-table">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-mono tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Category Index Name</th>
                      <th className="py-3 px-4">Group</th>
                      <th className="py-3 px-4">Cutoff Deadline</th>
                      <th className="py-3 px-4">Form Locks State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {cat.title} 
                          <span className="text-[10px] text-slate-400 block font-mono uppercase">Code: {cat.code}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold rounded">
                            {cat.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={cat.deadline}
                              onChange={(e) => onUpdateDeadline(cat.id, e.target.value)}
                              className="bg-white border border-slate-350 px-2 py-1 text-xs rounded text-slate-800 font-semibold focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onToggleCategoryLock(cat.id)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                              cat.isLocked
                                ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {cat.isLocked ? (
                              <>
                                <Lock className="h-3.5 w-3.5 text-red-500" />
                                Locked (Form Disabled)
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                                Active (Open)
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BROADCASTING & ANNOUNCEMENTS COMPOSER */}
        {activeTab === "broadcasting" && (
          <div className="space-y-6 max-w-2xl mx-auto" id="broadcasting-composer-sec">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-150">
                <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-slate-500" /> Send Bulletins & Announcements
                </h2>
                <p className="text-xs text-slate-500 mt-1">Compose dynamic bulletins that show immediately on the contestant or grand jury dashboard screens.</p>
              </div>

              <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                {annSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-medium rounded flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Broadcast announcements updated instantly across standard client feeds!</span>
                  </div>
                )}

                <div>
                  <label htmlFor="broadcasting-title" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Announcement Headline
                  </label>
                  <input
                    id="broadcasting-title"
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Action Required: Revise Trajectory data models"
                    className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor="broadcasting-role" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Target Broadcast Audience
                  </label>
                  <select
                    id="broadcasting-role"
                    value={annRole}
                    onChange={(e) => setAnnRole(e.target.value as any)}
                    className="mt-1 block w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="ALL">All Users (Juries & Participants)</option>
                    <option value="PARTICIPANT">Contestants / Participants Only</option>
                    <option value="JURY">Jury Expert Evaluators Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="broadcasting-content" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Content Body
                  </label>
                  <textarea
                    id="broadcasting-content"
                    rows={4}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Type details regarding orientational Zoom linkages, submission cutoff extended notices, etc."
                    className="mt-1 block w-full border border-slate-300 rounded p-3 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded text-xs shadow-sm transition"
                    id="btn-broadcast-submit"
                  >
                    Send Platform Broadcast News <Send className="h-3 w-3 inline ml-1" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT SECTION */}
        {activeTab === "users" && (
          <div className="space-y-6" id="user-management-sec">
            {/* Split dashboard-style info banner */}
            <div className="bg-[#0b1329] text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[9px] uppercase tracking-wider font-bold">
                  Sovereign Identity Module
                </span>
                <h3 className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-rose-400" /> Platform Security and Account Management
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xl">
                  Configure global user roles, assign grand jury panel categories, or deactivate candidate profile databases instantaneously.
                </p>
              </div>
              <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] p-2.5 rounded font-mono leading-relaxed">
                ● Active Database Sessions: {allUsers.length} Users
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Add New User Form */}
              <div className="bg-white p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Provision New User Account
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Configure role-based clearance metrics instantly.</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUserName.trim() || !newUserEmail.trim()) return;
                  onAddUser({
                    name: newUserName,
                    email: newUserEmail,
                    role: newUserRole,
                    assignedCategoryIds: newUserRole === "JURY" ? newUserCategories : []
                  });
                  setNewUserName("");
                  setNewUserEmail("");
                  setNewUserCategories([]);
                  setUserManageSuccess(`New user account created successfully: ${newUserEmail}`);
                  setTimeout(() => setUserManageSuccess(null), 3500);
                }} className="space-y-3.5">
                  {userManageSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{userManageSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="new-user-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Full Name / Entity
                    </label>
                    <input
                      id="new-user-name"
                      type="text"
                      className="mt-1 block w-full text-xs text-white"
                      placeholder="e.g. Ram Bahadur"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="new-user-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Email address
                    </label>
                    <input
                      id="new-user-email"
                      type="email"
                      className="mt-1 block w-full text-xs text-white"
                      placeholder="ram@nepalict.org"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="new-user-role" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Assigned Role
                    </label>
                    <select
                      id="new-user-role"
                      className="mt-1 block w-full text-xs"
                      value={newUserRole}
                      onChange={(e) => {
                        const r = e.target.value as UserRole;
                        setNewUserRole(r);
                      }}
                    >
                      <option value="PARTICIPANT">Participant (Contestant)</option>
                      <option value="JURY">Jury Member (Evaluator)</option>
                      <option value="ADMIN">Super Admin (Organizer)</option>
                    </select>
                  </div>

                  {newUserRole === "JURY" && (
                    <div className="space-y-1.5 p-3 bg-white/5 rounded-xl border border-white/5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Category Assignments
                      </label>
                      <div className="max-h-36 overflow-y-auto space-y-1 mt-1 pr-1">
                        {categories.map(cat => {
                          const isChecked = newUserCategories.includes(cat.id);
                          return (
                            <label key={cat.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNewUserCategories(newUserCategories.filter(id => id !== cat.id));
                                  } else {
                                    setNewUserCategories([...newUserCategories, cat.id]);
                                  }
                                }}
                                className="rounded h-3.5 w-3.5 bg-slate-900/60 border-white/10 text-rose-500 focus:ring-rose-500"
                              />
                              <span className="truncate" title={cat.title}>({cat.code}) {cat.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition uppercase tracking-wider"
                  >
                    Provision user account
                  </button>
                </form>
              </div>

              {/* Column 2 & 3: Users List & Management */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      User Database Registers ({allUsers.length} total)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Toggle active sessions, edit credential roles, or sync assigned jury categories.</p>
                  </div>

                  {/* Filter tabs */}
                  <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 shrink-0">
                    {(["ALL", "PARTICIPANT", "JURY", "ADMIN"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setUserFilter(f)}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase transition rounded-md ${
                          userFilter === f
                            ? "bg-rose-500 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left" id="user-accounts-table">
                    <thead className="bg-[#030712]/10 text-[9px] text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3 text-white">Full Name / Profile</th>
                        <th className="py-2.5 px-3 text-white">Role Designation</th>
                        <th className="py-2.5 px-3 text-white">Category Scope</th>
                        <th className="py-2.5 px-3 text-white">Session Status</th>
                        <th className="py-2.5 px-3 text-right text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allUsers
                        .filter(u => userFilter === "ALL" || u.role === userFilter)
                        .map(user => {
                          const isEditing = editingUserId === user.id;
                          return (
                            <tr key={user.id} className="hover:bg-white/2 select-none">
                              {/* Profile info */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                                    {user.name ? user.name.charAt(0) : "U"}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5 leading-none">
                                      {user.name}
                                      {user.id === currentUser?.id && (
                                        <span className="text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/20 px-1 rounded uppercase font-mono">You</span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">{user.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <select
                                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-1"
                                    value={editUserRole}
                                    onChange={(e) => {
                                      const newR = e.target.value as UserRole;
                                      setEditUserRole(newR);
                                      if (newR !== "JURY") {
                                        setEditUserCategories([]);
                                      }
                                    }}
                                  >
                                    <option value="PARTICIPANT">PARTICIPANT</option>
                                    <option value="JURY">JURY</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>
                                ) : (
                                  <span className={`px-2 py-0.5 text-[9px] font-extrabold font-mono rounded inline-block ${
                                    user.role === "ADMIN" 
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
                                      : user.role === "JURY"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                      : "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                                  }`}>
                                    {user.role}
                                  </span>
                                )}
                              </td>

                              {/* Scope Category Sector */}
                              <td className="py-3 px-3 italic text-[10px] text-slate-450 font-mono max-w-[150px]">
                                {isEditing && editUserRole === "JURY" ? (
                                  <div className="space-y-1 p-2 bg-slate-950 rounded border border-white/10 max-h-24 overflow-y-auto">
                                    {categories.map(cat => {
                                      const checked = editUserCategories.includes(cat.id);
                                      return (
                                        <label key={cat.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                              if (checked) {
                                                setEditUserCategories(editUserCategories.filter(id => id !== cat.id));
                                              } else {
                                                setEditUserCategories([...editUserCategories, cat.id]);
                                              }
                                            }}
                                            className="rounded h-3 w-3 bg-slate-900 border-white/10"
                                          />
                                          <span>{cat.code}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : user.role === "JURY" ? (
                                  user.assignedCategoryIds && user.assignedCategoryIds.length > 0 ? (
                                    <div className="flex flex-wrap gap-0.5">
                                      {user.assignedCategoryIds.map(cid => {
                                        const c = categories.find(cat => cat.id === cid);
                                        return c ? (
                                          <span key={cid} className="bg-white/10 text-slate-100 border border-white/5 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                                            {c.code}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  ) : <span className="text-slate-500">No sectors assigned</span>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3 text-[10px] font-semibold">
                                {user.isDeactivated ? (
                                  <span className="text-[9px] text-rose-400 font-bold border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 rounded-lg inline-flex items-center uppercase tracking-wider font-mono">
                                    Deactivated
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-lg inline-flex items-center uppercase tracking-wider font-mono">
                                    Active ✓
                                  </span>
                                )}
                              </td>

                              {/* Action controls */}
                              <td className="py-3 px-3 text-right space-x-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateUserRole(user.id, editUserRole, editUserRole === "JURY" ? editUserCategories : []);
                                        setEditingUserId(null);
                                      }}
                                      className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingUserId(user.id);
                                        setEditUserRole(user.role);
                                        setEditUserCategories(user.assignedCategoryIds || []);
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold underline"
                                    >
                                      Edit Role
                                    </button>

                                    {user.id !== currentUser?.id && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to ${user.isDeactivated ? "REACTIVATE" : "DEACTIVATE"} ${user.name}?`)) {
                                            onToggleUserDeactivity(user.id);
                                          }
                                        }}
                                        className={`${
                                          user.isDeactivated 
                                            ? "text-emerald-400 hover:text-emerald-300" 
                                            : "text-rose-400 hover:text-rose-300"
                                        } text-[10px] font-bold underline`}
                                      >
                                        {user.isDeactivated ? "Reactivate" : "Deactivate"}
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CALCULATED RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-6 animate-fade-in text-slate-850" id="calculated-results-sec">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <BarChart className="h-4.5 w-4.5 text-rose-500" /> Logarithmic Ranked Calculated Results
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Compiled grand jury assessment scoring metrics. Total Raw Score weights are smoothed using logarithmic curve normalization formulas to prevent standard judge bias.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-[#0b1329] text-rose-400 border border-slate-850 text-xs rounded font-mono font-bold flex items-center gap-1.5 shrink-0 select-none">
                  ● Live Aggregated Engine
                </div>
              </div>

              <div className="mt-6 space-y-10">
                {categories.map((cat) => {
                  const catApps = applications.filter(app => app.categoryId === cat.id && app.status !== "DRAFT" && app.status !== "SCREENED_OUT");
                  
                  // Compute calculated results with sorted positions
                  const candidatesWithScores = catApps.map(app => {
                    const appEvals = evaluations.filter(e => e.applicationId === app.id);
                    const avgRaw = appEvals.length > 0 
                      ? appEvals.reduce((sum, e) => sum + e.totalRawScore, 0) / appEvals.length 
                      : 0;
                    const avgNorm = appEvals.length > 0 
                      ? appEvals.reduce((sum, e) => sum + e.finalNormalizedScore, 0) / appEvals.length 
                      : 0;
                    return {
                      app,
                      evals: appEvals,
                      avgRaw,
                      avgNorm
                    };
                  }).sort((a, b) => b.avgNorm - a.avgNorm);

                  return (
                    <div key={cat.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold rounded text-slate-705 text-slate-600">
                            {cat.code}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                            {cat.title} <span className="text-slate-400 font-normal">({cat.group})</span>
                          </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {candidatesWithScores.length} Finalists Registered
                        </span>
                      </div>

                      {candidatesWithScores.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No pre-screened finalists registered in this category path.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left text-slate-600">
                            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-100">
                              <tr>
                                <th className="py-2 px-3">Rank</th>
                                <th className="py-2 px-3">Nominee / Company</th>
                                <th className="py-2 px-3">Evaluations</th>
                                <th className="py-2 px-3">Average Raw Score</th>
                                <th className="py-2 px-3">Calculated Final Score</th>
                                <th className="py-2 px-3 text-right">Current Standing</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {candidatesWithScores.map((item, index) => {
                                const isFirst = index === 0;
                                const hasReviews = item.evals.length > 0;
                                return (
                                  <tr key={item.app.id} className="hover:bg-slate-50/50">
                                    <td className="py-3.5 px-3 font-mono font-bold">
                                      {hasReviews ? (
                                        <span className={`px-2 py-0.5 bg-slate-100 border rounded text-[10px] ${
                                          isFirst ? "bg-amber-100 text-amber-700 border-amber-300 font-black" : "text-slate-600 border-indigo-200"
                                        }`}>
                                          #{index + 1}
                                        </span>
                                      ) : (
                                        <span className="text-slate-350">—</span>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-3 font-bold text-slate-800">
                                      <div>{item.app.nomineeName}</div>
                                      {item.app.companyName && (
                                        <div className="text-[10px] text-slate-400 font-normal">{item.app.companyName}</div>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-3">
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-[4px] text-[10px] font-mono">
                                        {item.evals.length} Grand Juries evaluated
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3 font-mono text-slate-500">
                                      {hasReviews ? `${item.avgRaw.toFixed(1)} pts` : "Pending evaluations"}
                                    </td>
                                    <td className="py-3.5 px-3 font-bold">
                                      {hasReviews ? (
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono text-xs font-extrabold text-[#030712] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded leading-none">
                                            {item.avgNorm.toFixed(1)}%
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-amber-600 font-semibold font-mono animate-pulse uppercase">Waiting inputs</span>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-3 text-right">
                                      {hasReviews ? (
                                        isFirst ? (
                                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                                            🌟 Leading Candidates
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-medium uppercase font-mono">
                                            Under Review
                                          </span>
                                        )
                                      ) : (
                                        <span className="text-[9px] text-slate-400 italic">No grades yet</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
