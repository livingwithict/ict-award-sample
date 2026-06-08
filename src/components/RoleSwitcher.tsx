/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Sparkles, User, Database, RefreshCw, Key, HelpCircle } from "lucide-react";
import { UserAccount, UserRole } from "../types";

interface RoleSwitcherProps {
  currentRole: UserRole;
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount | null, role: UserRole) => void;
  onResetData: () => void;
}

export default function RoleSwitcher({
  currentRole,
  currentUser,
  allUsers,
  onSwitchUser,
  onResetData
}: RoleSwitcherProps) {
  const admins = allUsers.filter(u => u.role === "ADMIN");
  const juries = allUsers.filter(u => u.role === "JURY");
  const participants = allUsers.filter(u => u.role === "PARTICIPANT");

  return (
    <div className="bg-[#0b1329] border-b border-slate-800 text-slate-100 py-3.5 px-4 sm:px-6 relative z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Flag Labels */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center border border-teal-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-sm tracking-wide text-white uppercase">
              ICT Award Evaluation System
            </h1>
            <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
              <span>Prototype Sandbox Mode</span>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
          </div>
        </div>

        {/* Roles Quick-Select */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-[11px] font-mono text-slate-400 hidden lg:block uppercase tracking-wider mr-1">
            Simulate Role:
          </div>

          {/* Super Admin Buttons */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => onSwitchUser(admins[0], "ADMIN")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === "ADMIN"
                  ? "bg-rose-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="role-btn-admin"
            >
              <Shield className="h-3.5 w-3.5" />
              Organizer (Admin)
            </button>

            {/* Jury */}
            <button
              onClick={() => onSwitchUser(juries[0], "JURY")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === "JURY"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="role-btn-jury"
            >
              <Key className="h-3.5 w-3.5" />
              Jury
            </button>

            {/* Participant */}
            <button
              onClick={() => onSwitchUser(participants[0], "PARTICIPANT")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === "PARTICIPANT"
                  ? "bg-teal-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="role-btn-participant"
            >
              <User className="h-3.5 w-3.5" />
              Participant
            </button>
          </div>

          {/* User Profile Selector based on role */}
          <div className="flex items-center gap-2">
            <select
              value={currentUser?.id || ""}
              onChange={(e) => {
                const found = allUsers.find(u => u.id === e.target.value);
                if (found) {
                  onSwitchUser(found, found.role);
                } else if (e.target.value === "GUEST") {
                  onSwitchUser(null, "PARTICIPANT");
                }
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-[200px] truncate"
              id="user-profile-select"
            >
              <option value="GUEST">Guest (Logged Out)</option>
              <optgroup label="Super Admin (Organizers)">
                {admins.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
              <optgroup label="Jury Members (16 Total)">
                {juries.map(j => (
                  <option key={j.id} value={j.id}>{j.name} {j.id === "jury-1" ? "(Cat A)" : ""}</option>
                ))}
              </optgroup>
              <optgroup label="Participants">
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.isVerified ? "✓" : "⚡ Unverified"}</option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={onResetData}
              title="Reset Sandbox Data"
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              id="btn-reset-sandbox"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
