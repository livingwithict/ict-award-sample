/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AwardCategory, UserAccount, Application, JuryEvaluation, EventCalendarItem, Announcement } from "../types";

export const INITIAL_CATEGORIES: AwardCategory[] = [
  // Category A: Startup, Product and Innovation
  {
    id: "cat-a1",
    code: "STARTUP_ICT",
    title: "Startup ICT Award 2026",
    group: "A",
    description: "Honoring outstanding registered technology startups demonstrating innovative products, high growth trajectory, and robust scalability in Nepal.",
    deadline: "2026-07-17",
    isLocked: false
  },
  {
    id: "cat-a2",
    code: "PRODUCT_ICT",
    title: "Product ICT Award 2026",
    group: "A",
    description: "Recognizing high-quality, innovative IT products/software built and commercialized successfully within the local tech ecosystem.",
    deadline: "2026-07-17",
    isLocked: false
  },
  {
    id: "cat-a3",
    code: "RISING_STAR",
    title: "Rising Star Innovation ICT Award 2026",
    group: "A",
    description: "Designed for brilliant student projects, research ventures, and pre-commercial prototype innovations.",
    deadline: "2026-07-17",
    isLocked: false
  },
  {
    id: "cat-a4",
    code: "SOCIAL_INNOVATION",
    title: "Social Innovation ICT Award 2026",
    group: "A",
    description: "Celebrating innovative ICT systems or concepts developed to tackle persistent socio-economic challenges.",
    deadline: "2026-07-17",
    isLocked: false
  },

  // Category B: Individual Excellence
  {
    id: "cat-b1",
    code: "PIONEER_ICT",
    title: "Pioneer ICT Award 2026",
    group: "B",
    description: "A lifetime prestige honor for veterans who paved the pathways of Nepal's IT sector over decades.",
    deadline: "2026-07-25",
    isLocked: false
  },
  {
    id: "cat-b2",
    code: "PROFESSIONAL_EXC",
    title: "Professional Excellence ICT Award 2026",
    group: "B",
    description: "Celebrating professionals or researchers demonstrating exemplary breakthroughs in IT or engineering leadership.",
    deadline: "2026-07-25",
    isLocked: false
  },
  {
    id: "cat-b3",
    code: "ENTREPRENEUR_ICT",
    title: "Entrepreneur ICT Award 2026",
    group: "B",
    description: "Honoring visionary business founders scaling tech operations, delivering jobs, and contributing to economic output.",
    deadline: "2026-07-25",
    isLocked: false
  },
  {
    id: "cat-b4",
    code: "WOMAN_ICON",
    title: "Woman Icon ICT Award 2026",
    group: "B",
    description: "Advancing active empowerment by honoring exceptional female tech leaders, scientists, or entrepreneurs.",
    deadline: "2026-07-25",
    isLocked: false
  },
  {
    id: "cat-b5",
    code: "NEPALI_DIASPORA",
    title: "Nepali Diaspora ICT Award 2026",
    group: "B",
    description: "Reconnecting global talent by highlighting individuals living abroad who made prestigious contributions in tech.",
    deadline: "2026-07-25",
    isLocked: false
  },

  // Category C: Organization & Enterprises
  {
    id: "cat-c1",
    code: "DIGITAL_GOV",
    title: "Digital Governance ICT Award 2026",
    group: "C",
    description: "Awarded to local bodies, departments, or ministries executing high-impact, transparent e-governance systems.",
    deadline: "2026-08-05",
    isLocked: false
  },
  {
    id: "cat-c2",
    code: "DIGITAL_EDU_PUB",
    title: "Digital Education ICT Award 2026 (Public)",
    group: "C",
    description: "Spotlighting public/govermental schools, colleges, or universities leading online digital curriculum execution.",
    deadline: "2026-08-05",
    isLocked: false
  },
  {
    id: "cat-c3",
    code: "DIGITAL_EDU_PVT",
    title: "Digital Education ICT Award 2026 (Private)",
    group: "C",
    description: "Recognizing private academic centers implementing cutting-edge LMS, smart labs, and virtual technologies.",
    deadline: "2026-08-05",
    isLocked: false
  },
  {
    id: "cat-c4",
    code: "DIGITAL_SERV_ENT",
    title: "Digital Services ICT Award (Enterprise)",
    group: "C",
    description: "Celebrating corporate enterprises, commercial banks, or retail groups boosting service accessibility.",
    deadline: "2026-08-05",
    isLocked: false
  },
  {
    id: "cat-c5",
    code: "DIGITAL_SERV_NEO",
    title: "Digital Services ICT Award (Neo)",
    group: "C",
    description: "Designed for fintech startups, neo-banks, and logistics networks redesigning structural transactions.",
    deadline: "2026-08-05",
    isLocked: false
  },

  // Category D: International
  {
    id: "cat-d1",
    code: "SOUTH_ASIA_STARTUP",
    title: "South Asia Startup ICT Award 2026",
    group: "D",
    description: "Fostering regional collaboration by inviting next-gen startup innovations working within SAARC nations.",
    deadline: "2026-08-10",
    isLocked: false
  }
];

export const MOCK_USERS: UserAccount[] = [
  // Super Admins
  { id: "admin-1", email: "admin1@ictawards.org", role: "ADMIN", name: "Er. Kabir Rajbanshi (Organizer CTO)" },
  { id: "admin-2", email: "organizer@ictawards.org", role: "ADMIN", name: "ICT Media Admin Panel" },

  // Juries (16 Experts, covering all 16 required counts)
  { id: "jury-1", email: "samir.shah@jury.org", role: "JURY", name: "Dr. Samir Shah (Professor - IT)", assignedCategoryIds: ["cat-a1", "cat-a2", "cat-a3"] },
  { id: "jury-2", email: "neha.giri@jury.org", role: "JURY", name: "Er. Neha Giri (VP of Engineering)", assignedCategoryIds: ["cat-a1", "cat-a4", "cat-b4"] },
  { id: "jury-3", email: "ramesh.bhatta@jury.org", role: "JURY", name: "Prof. Ramesh Bhatta (Academian)", assignedCategoryIds: ["cat-a2", "cat-a3", "cat-c2"] },
  { id: "jury-4", email: "praveen.shrestha@jury.org", role: "JURY", name: "Praveen Shrestha (Gov Consultant)", assignedCategoryIds: ["cat-c1", "cat-c2", "cat-c3"] },
  { id: "jury-5", email: "anupama.pant@jury.org", role: "JURY", name: "Anupama Pant (Venture Capitalist)", assignedCategoryIds: ["cat-a1", "cat-b3"] },
  { id: "jury-6", email: "dhiran.subedi@jury.org", role: "JURY", name: "Dhiran Subedi (Cybersecurity Specialist)", assignedCategoryIds: ["cat-c4", "cat-c5"] },
  { id: "jury-7", email: "sarita.adhikari@jury.org", role: "JURY", name: "Sarita Adhikari (Fintech Architect)", assignedCategoryIds: ["cat-a2", "cat-c5"] },
  { id: "jury-8", email: "subodh.thapa@jury.org", role: "JURY", name: "Subodh Thapa (Nepali Tech Veteran)", assignedCategoryIds: ["cat-b1", "cat-b2", "cat-b5"] },
  { id: "jury-9", email: "pujan.kc@jury.org", role: "JURY", name: "Er. Pujan K.C. (Chief Architect)", assignedCategoryIds: ["cat-a3", "cat-b2"] },
  { id: "jury-10", email: "mamata.rai@jury.org", role: "JURY", name: "Mamata Rai (Social Tech Lead)", assignedCategoryIds: ["cat-a4", "cat-b4", "cat-c3"] },
  { id: "jury-11", email: "binit.dhakal@jury.org", role: "JURY", name: "Binit Dhakal (Cloud Advisor)", assignedCategoryIds: ["cat-c4", "cat-d1"] },
  { id: "jury-12", email: "kiran.lama@jury.org", role: "JURY", name: "Kiran Lama (Regional Director)", assignedCategoryIds: ["cat-d1", "cat-b5"] },
  { id: "jury-13", email: "sunita.joshi@jury.org", role: "JURY", name: "Sunita Joshi (Senior Scientist)", assignedCategoryIds: ["cat-b2", "cat-b4"] },
  { id: "jury-14", email: "arun.paudel@jury.org", role: "JURY", name: "Arun Paudel (DevOps Leader)", assignedCategoryIds: ["cat-a2", "cat-c1"] },
  { id: "jury-15", email: "geeta.manandhar@jury.org", role: "JURY", name: "Geeta Manandhar (E-Governance Architect)", assignedCategoryIds: ["cat-c1", "cat-c2"] },
  { id: "jury-16", email: "niranjan.joshi@jury.org", role: "JURY", name: "Niranjan Joshi (Hardware R&D Expert)", assignedCategoryIds: ["cat-a3", "cat-a1"] },

  // Participants (Self-registred)
  { id: "part-1", email: "arjun@paynepal.com", role: "PARTICIPANT", name: "Arjun Kandel (PayNepal Tech)", isVerified: true },
  { id: "part-2", email: "sambridhi@greeningpost.org", role: "PARTICIPANT", name: "Sambridhi Ghimire (GreenPost)", isVerified: true },
  { id: "part-3", email: "shyam@shyamedu.com", role: "PARTICIPANT", name: "Shyam Sundar Lal (EducateNepal)", isVerified: false }, // Needs verification
  { id: "part-4", email: "bipana.woman@gmail.com", role: "PARTICIPANT", name: "Bipana Adhikari (AI Researcher)", isVerified: true }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "app-101",
    categoryId: "cat-a1", // Startup ICT Award
    userId: "part-1",
    nominationType: "self",
    nomineeName: "PayNepal Digital Wallet",
    nomineeEmail: "contact@paynepal.com",
    nomineePhone: "9851082394",
    companyName: "PayNepal Services Pvt. Ltd.",
    fields: {
      teamExperience: "Core team includes 4 fullstack engineers and 2 fintech product managers with 10+ combined years of payments experience.",
      currentTraction: "Processed over 4.2 million transactions inside 12 months with NPR 82 Crore transaction volume.",
      noveltyDefense: "Offline peer-to-peer audio-encrypted transactions allowing payments in areas with zero internet or cellular data.",
      demoVideoLink: "https://youtube.com/watch?v=paynepaldemo",
      employeesCount: "22 full-time staff, 15 sales officers.",
      pitchDeckFilename: "paynepal_pitch_v2_2026.pdf"
    },
    status: "SCREENED_IN", // Sent to Jury
    submittedAt: "2026-07-05T14:22:10Z"
  },
  {
    id: "app-102",
    categoryId: "cat-a2", // Product ICT Award
    userId: "part-1",
    nominationType: "self",
    nomineeName: "Astra ERP Engine",
    nomineeEmail: "astra@paynepal.com",
    nomineePhone: "9851082395",
    companyName: "PayNepal Services Pvt. Ltd.",
    fields: {
      teamExperience: "3 senior enterprise engineers, 2 local banking advisors.",
      currentTraction: "Deployed in 14 commercial finance companies with 15k active backend users.",
      noveltyDefense: "High performing local taxation-native accounting graphs that handle local financial audit protocols without custom external sheets.",
      demoVideoLink: "https://vimeo.com/astraerp",
      employeesCount: "12 software engineers",
      pitchDeckFilename: "astra_erp_specheet.pdf"
    },
    status: "TOP_12", // Under Category A Top 12 selection
    submittedAt: "2026-07-06T09:12:00Z"
  },
  {
    id: "app-103",
    categoryId: "cat-a4", // Social Innovation
    userId: "part-2",
    nominationType: "self",
    nomineeName: "GreenPost Agri-Network",
    nomineeEmail: "greenpost@gmail.com",
    nomineePhone: "9841392811",
    companyName: "GreenPost BioTech",
    fields: {
      teamExperience: "2 agricultural scientists and 1 mobile software dev.",
      currentTraction: "Connected 1,200 local organic growers in Gandaki province with raw buyers.",
      noveltyDefense: "SMS-based agricultural listing broker that connects direct markets with zero intermediate traders.",
      demoVideoLink: "https://youtube.com/watch?v=greenpost",
      employeesCount: "6 full-time, 40 community agents.",
      pitchDeckFilename: "green_post_organic_social_report.pdf"
    },
    status: "SCREENED_IN",
    submittedAt: "2026-07-10T11:05:40Z"
  },
  // Screened out sample
  {
    id: "app-104",
    categoryId: "cat-a1", // Startup
    userId: "part-3",
    nominationType: "self",
    nomineeName: "CryptoExchange Nepal",
    nomineeEmail: "crypto@shyamedu.com",
    nomineePhone: "9812391299",
    companyName: "Cryptonites Inc.",
    fields: {
      teamExperience: "2 students",
      currentTraction: "None, raw concept screen.",
      noveltyDefense: "Brokerage model",
      demoVideoLink: "",
      employeesCount: "2 students",
      pitchDeckFilename: ""
    },
    status: "SCREENED_OUT", // Regulatory checks failed
    submittedAt: "2026-07-02T16:00:00Z"
  },
  // Nominee recommended Category B sample
  {
    id: "app-105",
    categoryId: "cat-b4", // Woman Icon
    userId: "part-4",
    nominationType: "recommend", // Recommended
    nomineeName: "Dr. Alka Saphkota",
    nomineeEmail: "alka.saphkota@ku.edu.np",
    nomineePhone: "9851172813",
    fields: {
      resumeFilename: "dr_alka_cv.pdf",
      yearsOfExp: "16 years in AI/ML research and remote sensing computing models.",
      achievements: "First researcher in South Asia to apply AI-based glacio-hydrological models detecting landslide risk corridors locally.",
      recommendationLetter: "recommended_by_ku_dean_endorsement.pdf",
      narrativeStatement: "She has mentored over 250 female graduates in tech science and established the local Female in AI consortium."
    },
    status: "SCREENED_IN",
    submittedAt: "2026-07-12T08:30:22Z"
  }
];

export const MOCK_EVALUATIONS: JuryEvaluation[] = [
  // Samir Shah scored PayNepal Startup
  {
    id: "eval-1",
    applicationId: "app-101",
    juryId: "jury-1",
    canVote: true,
    rawScoreReason: "Impressive traction and solid financial indicators.",
    teamIndicator1: 10, // Yes - competent
    teamIndicator2: 10, // Yes - committed
    perfIndicator1: 10, // Yes - strong revenue
    perfIndicator2: 5,  // Maybe - hit milestones under resources
    noveltyScore: 10,   // Yes - offline audio
    wowScore: 10,       // Yes - memorable
    portfolioScore: 5,  // Maybe - software alignment
    prospectsScore: 10, // Yes - scale TAM
    jobScore: 5,        // Maybe - workforce scale
    investScore: 10,     // Yes - would invest
    totalRawScore: 85,
    finalNormalizedScore: 96.2, // Log computed
    submittedAt: "2026-07-15T18:22:40Z",
    isFinalized: true
  },
  // Neha Giri scored Astra ERP
  {
    id: "eval-2",
    applicationId: "app-102",
    juryId: "jury-2",
    canVote: true,
    rawScoreReason: "Very solid ERP architecture, targeted niche is excellent.",
    teamIndicator1: 10,
    teamIndicator2: 10,
    perfIndicator1: 10,
    perfIndicator2: 10,
    noveltyScore: 5,
    wowScore: 5,
    portfolioScore: 10,
    prospectsScore: 5,
    jobScore: 10,
    investScore: 5,
    totalRawScore: 80,
    finalNormalizedScore: 95.2,
    submittedAt: "2026-07-16T12:05:00Z",
    isFinalized: true
  }
];

export const SAMPLE_CALENDAR: EventCalendarItem[] = [
  { id: "cal-1", title: "Campaign Launch & Call for Entries", date: "2026-07-01", category: "Milestone", description: "Online portal opens for applications across all 15 award categories." },
  { id: "cal-2", title: "Form Submission Deadline Cat A", date: "2026-07-17", category: "Deadline", description: "Final call for Startup, Product, Rising Star, and Social Innovation forms." },
  { id: "cal-3", title: "Internal Team Screening & Phase 1 Checks", date: "2026-08-01", category: "Process", description: "Internal administrative filtering checks on data integrity and eligibility." },
  { id: "cal-5", title: "Shortlisting Top 12/15 Presentations", date: "2026-09-12", category: "Judging", description: "Direct speed dating pitches and presentations before 16 grand juries." },
  { id: "cal-6", title: "Site Field Visits & Verification Rounds", date: "2026-10-20", category: "Audit", description: "Grand jury spot audit checks in contestant workspace centers." },
  { id: "cal-7", title: "ICT Awards 2026 Grand Gala Finale", date: "2026-12-18", category: "Ceremony", description: "Televised final selection winner crowning at the Yak & Yeti Convention Hall." }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Official Launch of ICT Award 2026 Registration Portal",
    content: "ICT Media welcomes applications for the annual IT & Innovation accolades. Register and verify your email to submit self-applications or recommend others.",
    date: "2026-07-01",
    targetRole: "ALL"
  },
  {
    id: "ann-2",
    title: "Grand Jury Evaluation Rubric Consolidated",
    content: "All judging panel accounts have been provisioned. Juries must configure a secure Google Authenticator tool to finalize application scores.",
    date: "2026-07-03",
    targetRole: "JURY"
  },
  {
    id: "ann-3",
    title: "Reminder: Startup ICT Draft Submission Deadline",
    content: "Drafts not finalized before July 17 at midnight will be automatically locked out. Please review the 'Startup Performance' indicators section and complete files uploads.",
    date: "2026-07-10",
    targetRole: "PARTICIPANT"
  }
];
