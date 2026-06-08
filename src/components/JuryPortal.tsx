/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Key, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, 
  Settings, Award, Lock, ArrowUpRight, BarChart3, Star, 
  MessageSquare, UserCheck, RefreshCw, Send, CheckCircle, Smartphone, Check
} from "lucide-react";
import { AwardCategory, Application, JuryEvaluation, UserAccount } from "../types";
import { computeLogarithmicScore } from "../utils";

interface JuryPortalProps {
  currentUser: UserAccount | null;
  categories: AwardCategory[];
  applications: Application[];
  evaluations: JuryEvaluation[];
  onSignIn: (email: string, name: string) => void;
  onSubmitEvaluation: (evalData: Omit<JuryEvaluation, "id" | "submittedAt" | "isFinalized">) => void;
  onResetEvaluation: (evalId: string) => void;
  activeTab?: "worklist" | "guidelines" | "settings";
  onTabChange?: (tab: "worklist" | "guidelines" | "settings") => void;
}

export default function JuryPortal({
  currentUser,
  categories,
  applications,
  evaluations,
  onSignIn,
  onSubmitEvaluation,
  onResetEvaluation,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}: JuryPortalProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"worklist" | "guidelines" | "settings">("worklist");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange !== undefined ? externalOnTabChange : setInternalActiveTab;
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Authenticator State
  const [is2faVerifying, setIs2faVerifying] = useState(false);
  const [googleAuthCode, setGoogleAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);
  const [temp6DigitPin, setTemp6DigitPin] = useState("482 915");

  // Indicator States: Raw Scorers (Yes = 10, Maybe = 5, No = 0)
  const [teamInd1, setTeamInd1] = useState<number>(10);
  const [teamInd2, setTeamInd2] = useState<number>(10);
  const [perfInd1, setPerfInd1] = useState<number>(10);
  const [perfInd2, setPerfInd2] = useState<number>(10);
  const [noveltySel, setNoveltySel] = useState<number>(10);
  const [wowSel, setWowSel] = useState<number>(10);
  const [portfolioSel, setPortfolioSel] = useState<number>(10);
  const [prospectsSel, setProspectsSel] = useState<number>(10);
  const [jobSel, setJobSel] = useState<number>(10);
  const [investSel, setInvestSel] = useState<number>(10);

  // Gatekeeper state: I Can Vote
  const [canVoteGate, setCanVoteGate] = useState<boolean>(true);
  const [rawComment, setRawComment] = useState("");

  // Sandbox Login variables
  const [emailInput, setEmailInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Re-generate OTP code occasionally to simulate actual Google Authenticator
  useEffect(() => {
    const timer = setInterval(() => {
      const firstPart = Math.floor(100 + Math.random() * 900);
      const secondPart = Math.floor(100 + Math.random() * 900);
      setTemp6DigitPin(`${firstPart} ${secondPart}`);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Filter list of categorized worklists assigned specifically to this Jury
  const myAssignedCats = currentUser?.assignedCategoryIds || [];
  const assignedCatsList = categories.filter(c => myAssignedCats.includes(c.id));

  // Juries are assigned by categories and different categories must not be mixed together
  const [selectedJuryCatId, setSelectedJuryCatId] = useState<string>("");

  React.useEffect(() => {
    if (assignedCatsList.length > 0 && !selectedJuryCatId) {
      setSelectedJuryCatId(assignedCatsList[0].id);
    }
  }, [assignedCatsList, selectedJuryCatId]);

  // Jury can evaluate applications that are forwarded to standard jury round (e.g. SCREENED_IN, TOP_12, TOP_5, TOP_3, WINNER) and belong to their assigned category
  const filteredApps = applications.filter(app => {
    const isAssigned = myAssignedCats.includes(app.categoryId);
    const isJuryReady = app.status !== "DRAFT" && app.status !== "SCREENED_OUT";
    return isAssigned && isJuryReady;
  });

  const displayedApps = filteredApps.filter(app => {
    if (!selectedJuryCatId) return true;
    return app.categoryId === selectedJuryCatId;
  });

  // Calculate sum raw and smoothed final score
  const activeRawScoreSum = 
    teamInd1 + teamInd2 + perfInd1 + perfInd2 + 
    noveltySel + wowSel + portfolioSel + prospectsSel + jobSel + investSel;

  const activeNormalizedScore = computeLogarithmicScore(activeRawScoreSum);

  const handleAppCardSelection = (app: Application) => {
    setSelectedApp(app);
    // Presets with existing evaluations if saved
    const existing = evaluations.find(e => e.applicationId === app.id && e.juryId === currentUser?.id);
    if (existing) {
      setTeamInd1(existing.teamIndicator1);
      setTeamInd2(existing.teamIndicator2);
      setPerfInd1(existing.perfIndicator1);
      setPerfInd2(existing.perfIndicator2);
      setNoveltySel(existing.noveltyScore);
      setWowSel(existing.wowScore);
      setPortfolioSel(existing.portfolioScore);
      setProspectsSel(existing.prospectsScore);
      setJobSel(existing.jobScore);
      setInvestSel(existing.investScore);
      setCanVoteGate(existing.canVote);
      setRawComment(existing.rawScoreReason || "");
    } else {
      // Setup default scores
      setTeamInd1(10);
      setTeamInd2(10);
      setPerfInd1(10);
      setPerfInd2(5);
      setNoveltySel(10);
      setWowSel(10);
      setPortfolioSel(5);
      setProspectsSel(10);
      setJobSel(5);
      setInvestSel(10);
      setCanVoteGate(true);
      setRawComment("");
    }
    setIs2faVerifying(false);
    setAuthSuccess(false);
    setAuthError("");
  };

  const triggerVerificationFlow = (e: React.FormEvent) => {
    e.preventDefault();
    setIs2faVerifying(true);
  };

  const handle2faVerification = () => {
    // Standard mock verification check. Any 6-digit or matching the temp pin works in mock
    const cleanProposed = googleAuthCode.replace(/\s+/g, "");
    const cleanActual = temp6DigitPin.replace(/\s+/g, "");
    
    if (cleanProposed.length === 6) {
      setAuthSuccess(true);
      setAuthError("");
      
      // Submit scored criteria
      if (selectedApp && currentUser) {
        onSubmitEvaluation({
          applicationId: selectedApp.id,
          juryId: currentUser.id,
          canVote: canVoteGate,
          rawScoreReason: rawComment,
          teamIndicator1: teamInd1,
          teamIndicator2: teamInd2,
          perfIndicator1: perfInd1,
          perfIndicator2: perfInd2,
          noveltyScore: noveltySel,
          wowScore: wowSel,
          portfolioScore: portfolioSel,
          prospectsScore: prospectsSel,
          jobScore: jobSel,
          investScore: investSel,
          totalRawScore: activeRawScoreSum,
          finalNormalizedScore: activeNormalizedScore
        });
      }

      setTimeout(() => {
        setIs2faVerifying(false);
        setGoogleAuthCode("");
        setAuthSuccess(false);
      }, 2000);

    } else {
      setAuthError("Incorrect token pin. Please verify your mock Authenticator client.");
    }
  };

  // LOGIN PAGE
  if (!currentUser || currentUser.role !== "JURY") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <span className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg text-slate-950 font-bold">
              <Key className="h-9 w-9" />
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-sans font-bold tracking-tight text-white">
            Grand Jury Board Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Secure workspace panel for provisioned judges evaluation & grading.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800 border border-slate-700 py-8 px-4 shadow-xl rounded-xl sm:px-10">
            <form onSubmit={(e) => {
              e.preventDefault();
              onSignIn(emailInput || "samir.shah@jury.org", "Dr. Samir Shah");
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Assigned Expert Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="samir.shah@jury.org"
                  className="mt-1.5 block w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Assigned Passphrase
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  defaultValue="jurySecret2026"
                  className="mt-1.5 block w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 rounded leading-relaxed">
                <strong>Credential Autoload:</strong> Type index jury email <u>samir.shah@jury.org</u> or click the role selection button at the top banner. Password checks are simulated.
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
                id="btn-jury-login-submit"
              >
                Access Jury Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <button onClick={() => setActiveTab("worklist")} className="flex items-center gap-2 text-white font-bold text-sm tracking-wide uppercase font-sans">
                <span className="p-1 bg-amber-500 text-slate-950 rounded">
                  <Award className="h-4 w-4" />
                </span>
                Jury Evaluation Engine
              </button>
              <nav className="hidden md:flex gap-1">
                <button
                  onClick={() => setActiveTab("worklist")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                    activeTab === "worklist" ? "bg-amber-500/15 text-amber-400" : "text-slate-400 hover:text-white"
                  }`}
                  id="j-tab-worklist"
                >
                  Assigned Portfolios ({filteredApps.length})
                </button>
                <button
                  onClick={() => setActiveTab("guidelines")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                    activeTab === "guidelines" ? "bg-amber-500/15 text-amber-400" : "text-slate-400 hover:text-white"
                  }`}
                  id="j-tab-guidelines"
                >
                  Judging Guidelines
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                    activeTab === "settings" ? "bg-amber-500/15 text-amber-400" : "text-slate-400 hover:text-white"
                  }`}
                  id="j-tab-settings"
                >
                  Expert settings
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono text-slate-300 pr-1">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {activeTab === "worklist" && (
          <>
            {/* Left side list of candidates assigned */}
            <div className="w-full md:w-1/3 space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Your Assessment Worklist
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Preliminary screened portfolios requiring final logarithmic scoring. Only assigned categories appear.
                </p>

                {assignedCatsList.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Category Workspace (Separate)
                    </label>
                    <div className="flex flex-wrap gap-1.5" id="jury-category-filter-pills">
                      {assignedCatsList.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedJuryCatId(cat.id);
                            setSelectedApp(null); // Clear selected candidate to prevent crossing visual borders
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                            selectedJuryCatId === cat.id
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm"
                              : "bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {cat.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {displayedApps.length === 0 ? (
                  <div className="p-8 text-center text-slate-650 border border-dashed border-slate-800 rounded-lg">
                    <AlertOctagon className="h-7 w-7 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">No pending applications for the active category selection.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5" id="jury-worklist-apps">
                    {displayedApps.map((app) => {
                      const cat = categories.find(c => c.id === app.categoryId);
                      const isGraded = evaluations.some(e => e.applicationId === app.id && e.juryId === currentUser.id);
                      const selectedGraded = evaluations.find(e => e.applicationId === app.id && e.juryId === currentUser.id);
                      
                      return (
                        <button
                          key={app.id}
                          onClick={() => handleAppCardSelection(app)}
                          className={`w-full text-left p-3.5 rounded-lg border transition-all block ${
                            selectedApp?.id === app.id
                              ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5 text-white"
                              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              {cat?.code || "ICT"}
                            </span>
                            {isGraded ? (
                              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase flex items-center gap-1">
                                <Check className="h-3 w-3" /> Graded: {selectedGraded?.finalNormalizedScore}%
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-500 font-mono font-bold uppercase animate-pulse">
                                Pending
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-xs mt-2 text-slate-100 truncate">
                            {app.nomineeName}
                          </h4>
                          {app.companyName && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.companyName}</p>
                          )}
                          <p className="text-[9px] font-mono text-slate-500 mt-1">
                            Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Show Google Authenticator Simulator in Sidebar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Smartphone className="h-4.5 w-4.5 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-100 font-mono uppercase">Google Authenticator</h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Dual-Factor key required to seal evaluations. Codes update in memory every 12 seconds.
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-center font-mono relative">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Nepal ICT Award Secret</div>
                  <div className="text-2xl font-bold text-amber-500 tracking-wider mt-1">{temp6DigitPin}</div>
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-500 animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Right side scorecard scoring fields */}
            <div className="w-full md:w-2/3">
              {selectedApp ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="jury-evaluation-scorecard">
                  {/* Portfolio Preview Header */}
                  <div className="bg-slate-850 p-5 border-b border-slate-800">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded font-mono text-[9px] uppercase tracking-wider font-bold">
                      Portfolio Analysis
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1.5">{selectedApp.nomineeName}</h2>
                    {selectedApp.companyName && (
                      <p className="text-xs text-slate-400 mt-0.5">Corporate Body: {selectedApp.companyName}</p>
                    )}
                    
                    {/* Rendered Answers to Form */}
                    <div className="mt-4 p-4 bg-slate-905 border border-slate-800 rounded text-xs space-y-2.5">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                        Submitted Fields Check
                      </h4>
                      {selectedApp.fields.teamExperience && (
                        <div>
                          <strong className="text-slate-300 block font-sans">Team Credentials:</strong>
                          <span className="text-slate-400 leading-relaxed block mt-0.5">{selectedApp.fields.teamExperience}</span>
                        </div>
                      )}
                      {selectedApp.fields.currentTraction && (
                        <div>
                          <strong className="text-slate-300 block">Traction & Milestone Proof:</strong>
                          <span className="text-slate-400 leading-relaxed block mt-0.5">{selectedApp.fields.currentTraction}</span>
                        </div>
                      )}
                      {selectedApp.fields.noveltyDefense && (
                        <div>
                          <strong className="text-slate-300 block">Novelty Factor Highlight:</strong>
                          <span className="text-slate-400 block mt-0.5">{selectedApp.fields.noveltyDefense}</span>
                        </div>
                      )}
                      {selectedApp.fields.demoVideoLink && (
                        <div>
                          <strong className="text-slate-300 block">Digital Platform Showcase URL:</strong>
                          <a href={selectedApp.fields.demoVideoLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{selectedApp.fields.demoVideoLink}</a>
                        </div>
                      )}
                      {selectedApp.fields.achievements && (
                        <div>
                          <strong className="text-slate-300 block">Major Lifetime Accolades:</strong>
                          <span className="text-slate-400 block mt-0.5">{selectedApp.fields.achievements}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grading Rubric Forms built meticulously based on Annex 4 guidelines */}
                  <form onSubmit={triggerVerificationFlow} className="p-5 sm:p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                        Unified Marking Rubric (Annex 4 Scorecard)
                      </h3>

                      {/* GATEKEEPER TOGGLE OPTION */}
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase ml-1">Ethical Gatekeeper:</span>
                        <select
                          value={canVoteGate ? "YES" : "NO"}
                          onChange={(e) => setCanVoteGate(e.target.value === "YES")}
                          className="bg-slate-900 text-xs font-bold text-amber-400 px-1 py-0.5 rounded focus:outline-none"
                          id="gatekeeper-vote-toggle"
                        >
                          <option value="YES">I Can Vote (Pass)</option>
                          <option value="NO">Disqualify / Conflict (Red Flag)</option>
                        </select>
                      </div>
                    </div>

                    {!canVoteGate ? (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-lg flex items-start gap-2.5">
                        <AlertOctagon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Disqualification Red-Flag Active:</strong> Mark calculations will be locked to <strong>0 final points</strong> for this evaluation profile owing to a conflict of interest or policy violation, regardless of the numerical scores assigned below.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Interactive Grader indicators */}
                        {/* Team (2 indicators, max 20) */}
                        <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                            <span>1. Startup Team & Founder Indicators</span>
                            <span className="text-amber-400 font-mono">Max: 20 pts</span>
                          </h4>
                          <em className="text-[10px] text-slate-500 block mt-0.5">Yes = 10 pts per indicator | Maybe = 5 pts | No = 0 pts</em>
                          
                          <div className="mt-3 space-y-3.5">
                            <div>
                              <p className="text-[11px] text-slate-300 font-medium">Indicator 1: Does the team have complementary skills and technical capability to execute?</p>
                              <div className="mt-2 flex gap-1.5">
                                {[10, 5, 0].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setTeamInd1(val)}
                                    className={`px-3 py-1 text-xs rounded border transition-colors ${
                                      teamInd1 === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                    }`}
                                  >
                                    {val === 10 ? "Yes (10)" : val === 5 ? "Maybe (5)" : "No (0)"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-300 font-medium">Indicator 2: Do they demonstrate high commitment, domain expertise, and coachability?</p>
                              <div className="mt-2 flex gap-1.5">
                                {[10, 5, 0].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setTeamInd2(val)}
                                    className={`px-3 py-1 text-xs rounded border transition-colors ${
                                      teamInd2 === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                    }`}
                                  >
                                    {val === 10 ? "Yes (10)" : val === 5 ? "Maybe (5)" : "No (0)"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Startup Performance (2 indicators, max 20) */}
                        <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                            <span>2. Startup Performance Validation</span>
                            <span className="text-amber-400 font-mono">Max: 20 pts</span>
                          </h4>
                          <div className="mt-3 space-y-3.5">
                            <div>
                              <p className="text-[11px] text-slate-300 font-medium">Indicator 1: Has the startup shown clear traction (revenue, user growth, or pilot validation)?</p>
                              <div className="mt-2 flex gap-1.5">
                                {[10, 5, 0].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setPerfInd1(val)}
                                    className={`px-3 py-1 text-xs rounded border transition-colors ${
                                      perfInd1 === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                    }`}
                                  >
                                    {val === 10 ? "Yes (10)" : val === 5 ? "Maybe (5)" : "No (0)"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-300 font-medium">Indicator 2: Have they hit key milestones efficiently with available resources?</p>
                              <div className="mt-2 flex gap-1.5">
                                {[10, 5, 0].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setPerfInd2(val)}
                                    className={`px-3 py-1 text-xs rounded border transition-colors ${
                                      perfInd2 === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                    }`}
                                  >
                                    {val === 10 ? "Yes (10)" : val === 5 ? "Maybe (5)" : "No (0)"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Single Indicators (max 10 points each) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Novelty */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>3. Novelty factor</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Is the product uniquely innovative compared to market players?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setNoveltySel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    noveltySel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* WoW! Factor */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>4. WoW! Factor Impact</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Did the live demo or core concept leave an outstanding impression?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setWowSel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    wowSel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Product Portfolio */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>5. Product Portfolio</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Is current service lineup functional, robust and aligned?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setPortfolioSel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    portfolioSel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Future Prospects */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>6. Future TAM Prospects</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Is the target market size large and scaling model defensible?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setProspectsSel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    prospectsSel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Job Creation */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>7. Direct Job Creation</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Does it have potential to scale workforce or stimulate jobs?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setJobSel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    jobSel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-900 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Will Jury Invest */}
                          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex justify-between">
                              <span>8. Will Jury Invest?</span>
                              <span className="text-amber-400 font-mono">Max: 10 pts</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight">Would you realistically recommend or put money into this pitch?</p>
                            <div className="flex gap-1 pt-1">
                              {[10, 5, 0].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setInvestSel(val)}
                                  className={`flex-1 text-center py-1 text-xs rounded border ${
                                    investSel === val ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-905 border-slate-800"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Comments block */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Confidential Narrative Evaluation Remark
                      </label>
                      <textarea
                        rows={2}
                        value={rawComment}
                        onChange={(e) => setRawComment(e.target.value)}
                        placeholder="State specific audit parameters or concerns regarding competitive edge..."
                        className="w-full bg-slate-950/50 border border-slate-800 text-xs text-white rounded p-3 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* LIVE COMPRESSION GRAPH AND SCORE FORMULA SUMMARY */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-amber-500" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase">Log Normalization Curve Output</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          The ICT Evaluation System implements a natural logarithmic function:{" "}
                          <code className="text-amber-400 font-mono font-bold">LN(Raw+1)/LN(101)*100</code> to prevent hyper-inflations and isolate real consistent metrics.
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded text-center">
                        <div className="text-[9px] text-slate-400 uppercase font-mono">Compressed Scoring output</div>
                        <div className="flex justify-center items-baseline gap-1 mt-1">
                          <strong className="text-lg font-bold text-white">{canVoteGate ? activeNormalizedScore : 0}</strong>
                          <span className="text-[10px] text-slate-500">/ 100</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Raw total: {canVoteGate ? activeRawScoreSum : 0} pts</div>
                      </div>
                    </div>

                    {/* Action Block Submit trigger showing the Google 2FA Prompt */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded shadow-md transition-colors flex items-center gap-1 text-xs"
                        id="btn-jury-submit-scores"
                      >
                        <ShieldCheck className="h-4.5 w-4.5" /> Grade and Verify with 2FA OTP
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                <div className="bg-slate-900/40 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <Award className="h-14 w-14 text-slate-800 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-300">No Portfolio Selected</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Select a screened startup or finalist candidate from the list to invoke the interactive scorecard grading grid.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* GUIDELINES VIEW */}
        {activeTab === "guidelines" && (
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-white font-sans border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <Star className="h-5 w-5 text-amber-400" /> ICT Award Evaluation Rubric Overview
              </h2>
              
              <div className="space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
                <div>
                  <h3 className="font-bold text-amber-400 uppercase text-xs">A-Category Evaluation Methodology</h3>
                  <p className="mt-1">
                    To keep the scoring uniform, the 20-point major categories have been simplified into binary sub-indicators of 10 points each. Juries consistently apply:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-[11px] text-slate-400">
                    <li><strong>Yes:</strong> 10 points per indicator</li>
                    <li><strong>Maybe:</strong> 5 points per indicator</li>
                    <li><strong>No:</strong> 0 points per indicator</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-amber-400 uppercase text-xs mt-3">Sovereign Logarithmic Smoothing</h3>
                  <p className="mt-1">
                     A single outlier panel jury must not break the global curve. We compress variance at the top-tier of scores using:
                  </p>
                  <div className="bg-slate-950 p-2 text-center rounded border border-slate-850 my-2 font-mono text-xs text-white">
                    Final Score = ( LN(Raw Score + 1) / LN(101) ) * 100
                  </div>
                  <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                    <li className="bg-slate-950 p-1.5 rounded text-center">Raw 20 gives Smoothed 66.1</li>
                    <li className="bg-slate-950 p-1.5 rounded text-center">Raw 50 gives Smoothed 85.3</li>
                    <li className="bg-slate-950 p-1.5 rounded text-center">Raw 80 gives Smoothed 95.2</li>
                    <li className="bg-slate-950 p-1.5 rounded text-center">Raw 100 gives Smoothed 100.0</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-850">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Jury Profile & Assigned Sectors</h2>
                <p className="text-xs text-slate-400 mt-1">Manage virtual Google Authenticator settings and review assigned category locks.</p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Assigned Accolade Categories</label>
                  <div className="mt-2 space-y-1.5">
                    {assignedCatsList.map(cat => (
                      <div key={cat.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{cat.title}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Assign Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">Standardize 2-Factor Credential Settings</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Your account has a default security secret linked to the synchronized Google Authenticator simulation sidebar. No further configuration is needed for the sandbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL / OVERLAY FOR GOOGLE AUTHENTICATOR OPT PIN INPUT */}
      {is2faVerifying && selectedApp && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            
            <div className="flex items-center gap-2.5 text-amber-400">
              <Smartphone className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-sm uppercase font-mono tracking-wider">Dynamic 2FA Verification</h3>
                <p className="text-[9px] text-slate-400">Enter code from simulated Google Authenticator device</p>
              </div>
            </div>

            {authSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded text-center space-y-1">
                <CheckCircle className="h-8 w-8 mx-auto text-emerald-400 animate-bounce" />
                <h4 className="font-bold text-white uppercase text-xs">Evaluation Authenticated</h4>
                <p className="text-[10px] text-slate-300">Grade sealed on blockchain database successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-850">
                  <span>Simulated OTP generated on your authenticator app sidebar:</span>
                  <div className="text-center font-mono font-bold text-lg tracking-wider text-amber-500 mt-1">{temp6DigitPin}</div>
                </div>

                <div>
                  <label htmlFor="auth-code-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Enter Verification OTP Code (6 Digits)
                  </label>
                  <input
                    id="auth-code-input"
                    type="text"
                    required
                    maxLength={7}
                    value={googleAuthCode}
                    onChange={(e) => setGoogleAuthCode(e.target.value)}
                    placeholder="e.g. 482 915"
                    className="w-full bg-slate-950 border border-slate-800 text-center font-mono font-bold text-lg text-white p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {authError && <p className="text-[10px] text-red-400 mt-1 text-center font-semibold">{authError}</p>}
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIs2faVerifying(false)}
                    className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-xs"
                    id="btn-auth-cancel"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="button"
                    onClick={handle2faVerification}
                    className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-600"
                    id="btn-auth-verify-confirm"
                  >
                    Confirm OTP
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
