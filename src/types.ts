/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "ADMIN" | "JURY" | "PARTICIPANT";

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  isVerified?: boolean;
  assignedCategoryIds?: string[]; // For juries
  isDeactivated?: boolean;
}

export type CategoryGroup = "A" | "B" | "C" | "D" | "RECOGNITION";

export interface AwardCategory {
  id: string;
  code: string; // e.g. "STARTUP"
  title: string;
  group: CategoryGroup;
  description: string;
  deadline: string; // Date string
  isLocked: boolean; // lock database when deadline passes or admin locks
}

export interface ApplicationDraft {
  id: string;
  categoryId: string;
  userId: string;
  nominationType: "self" | "recommend"; // recommend is only for B & C
  nomineeName: string;
  nomineeEmail: string;
  nomineePhone: string;
  // Dynamic fields
  fields: Record<string, any>;
  lastSavedAt: string;
  isSubmitted: boolean;
}

export interface Application {
  id: string;
  categoryId: string;
  userId: string;
  nominationType: "self" | "recommend";
  nomineeName: string;
  nomineeEmail: string;
  nomineePhone: string;
  companyName?: string;
  fields: Record<string, any>;
  status: "DRAFT" | "SUBMITTED" | "SCREENED_OUT" | "SCREENED_IN" | "TOP_12" | "TOP_5" | "TOP_3" | "WINNER";
  submittedAt: string;
}

export interface IndicatorScore {
  score: number; // 0 (No), 5 (Maybe), 10 (Yes)
  comment?: string;
}

export interface JuryEvaluation {
  id: string;
  applicationId: string;
  juryId: string;
  canVote: boolean; // Gatekeeper Metric "I Can Vote"
  rawScoreReason?: string;
  // Startup Team / Founder (2 Indicators max 20)
  teamIndicator1: number;
  teamIndicator2: number;
  // Startup Performance (2 Indicators max 20)
  perfIndicator1: number;
  perfIndicator2: number;
  // Novelty (1 Indicator max 10)
  noveltyScore: number;
  // WoW! Factor (1 Indicator max 10)
  wowScore: number;
  // Product Portfolio (1 Indicator max 10)
  portfolioScore: number;
  // Future Prospects (1 Indicator max 10)
  prospectsScore: number;
  // Job Creation (1 Indicator max 10)
  jobScore: number;
  // Will Jury Invest? (1 Indicator max 10)
  investScore: number;
  totalRawScore: number; // Sum of indicators
  finalNormalizedScore: number; // Logarithmic calculated
  submittedAt: string;
  isFinalized: boolean;
}

export interface EventCalendarItem {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  targetRole: "ALL" | "PARTICIPANT" | "JURY";
}
