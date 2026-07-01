import React from 'react';

export enum UserRole {
  ProductOwner = 'Product Owner',
  ClassAdmin = 'Class Admin',
  BranchAdmin = 'Branch Admin',
  Teacher = 'Teacher',
  Student = 'Student',
  Parent = 'Parent',
  // ── External (standalone, not institute-linked) ──
  ExternalParent = 'External Parent',
  ExternalStudent = 'External Student',
}

// ─── Role Config (Product Owner controls which roles are active) ─────────────
export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  isActive: boolean;
  isInstituteRole: boolean;   // false = external / standalone revenue
  revenueStream: 'institute' | 'direct';
  registrationOpen: boolean;  // whether new sign-ups allowed
}

// ─── External Parent (standalone, not linked to any institute) ────────────────
export interface ExternalParent {
  id: string;
  name: string;
  email: string;
  password: string;
  mobile: string;
  role: UserRole.ExternalParent;
  city?: string;
  createdAt: string;
  isActive: boolean;
  // subscription
  planId?: string;
  subscriptionStatus: 'none' | 'trial' | 'active' | 'expired';
  subscriptionExpiry?: string;
}

// ─── External Child Profile (created/managed by ExternalParent) ──────────────
export interface ExternalChildProfile {
  id: string;
  parentId: string;          // ExternalParent.id
  name: string;
  grade: string;             // e.g. "Class 10", "Grade 8"
  age: number;
  subjectsOfInterest: string[];   // free-form subject names
  schoolName?: string;
  city?: string;
  linkedExternalStudentId?: string;  // if they have their own account
  createdAt: string;
  avatar?: string;           // emoji or initials
}

// ─── External Student (standalone learner) ────────────────────────────────────
export interface ExternalStudent {
  id: string;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: UserRole.ExternalStudent;
  grade: string;
  age: number;
  subjectsOfInterest: string[];
  schoolName?: string;
  city?: string;
  createdAt: string;
  isActive: boolean;
  linkedParentId?: string;
  // subscription
  planId?: string;
  subscriptionStatus: 'none' | 'trial' | 'active' | 'expired';
  subscriptionExpiry?: string;
  // stats cache
  totalStudyMinutes?: number;
  totalChallengesCreated?: number;
  totalChallengesJoined?: number;
}

// ─── Student Subscription Plans (separate from Parent plans) ─────────────────
export interface StudentPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  challengesEnabled: boolean;
  shareEnabled: boolean;
  aiGeneratorEnabled: boolean;
  maxAiGenerations: number;   // per month; -1 = unlimited
  detailedReportsEnabled: boolean;
  leaderboardEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface StudentSubscription {
  id: string;
  studentId: string;
  planId: string;
  status: 'active' | 'expired' | 'trial' | 'cancelled';
  startDate: string;
  expiryDate: string;
  paymentMode: 'UPI' | 'Card' | 'NetBanking' | 'Free Trial';
  amountPaid: number;
  autoRenew: boolean;
}

// ─── Study Challenge ──────────────────────────────────────────────────────────
export interface StudyChallenge {
  id: string;
  code: string;               // 6-char join code e.g. "ABC123"
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  contentType: 'quiz';
  content: string;            // JSON — same structure as quiz SavedAiContent
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitMinutes: number;
  isPublic: boolean;
  invitedEmails: string[];
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
  expiresAt?: string;
  participantCount: number;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  participantId: string;
  participantName: string;
  participantGrade?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
  answers: number[];
  rank?: number;
}

// ─── Shared Study Content ─────────────────────────────────────────────────────
export interface SharedContent {
  id: string;
  shareCode: string;          // 8-char public access code
  contentId: string;          // SavedAiContent.id
  ownerId: string;
  ownerName: string;
  title: string;
  contentType: AiContentType;
  subject: string;
  grade: string;
  description?: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  expiresAt?: string;
  tags: string[];
}

export type Status = 'active' | 'inactive';

export enum LeadStatus {
    New = 'New',
    Contacted = 'Contacted',
    Qualified = 'Qualified',
    Lost = 'Lost',
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    mobile: string;
    source: string;
    status: LeadStatus;
    addedDate: string;
    instituteId?: string;
}

// Data Management Types
export interface Branch {
  id: string;
  name: string;
  location: string;
  head: string;
  instituteId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: Status;
  instituteId: string;
  branchIds?: string[];
  connectedEmail?: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    mobile: string;
    classId: string;
    branchIds: string[];
    subjectIds: string[];
    status: Status;
    // Parent info is now part of the student record
    parentName: string;
    parentEmail: string;
    parentMobile: string;
    role: UserRole.Student;
    instituteId: string;
    connectedEmail?: string;
}

export interface Teacher {
    id: string;
    name: string;
    email: string;
    mobile: string;
    subjectIds: string[];
    classIds: string[];
    branchIds: string[];
    status: Status;
    role: UserRole.Teacher;
    instituteId: string;
    connectedEmail?: string;
}

export interface Parent {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: UserRole.Parent;
    studentId: string;
    instituteId: string;
    child: Student;
    connectedEmail?: string;
}

export interface AcademicClass {
    id: string;
    name: string;
    teacherIds: string[]; // A class can have multiple teachers
    studentIds: string[];
    instituteId: string;
}

export interface Subject {
    id: string;
    name: string;
    category: string;
    instituteId: string;
}

export interface ThemeSettings {
  primaryColor: string;    // e.g. '#4f46e5'
  primaryHover: string;    // e.g. '#4338ca'
  primaryLight: string;    // e.g. '#eef2ff'
  sidebarFrom: string;     // gradient start e.g. '#1e1b4b'
  sidebarTo: string;       // gradient end   e.g. '#312e81'
  headingFont: string;     // e.g. 'Plus Jakarta Sans'
  bodyFont: string;        // e.g. 'Inter'
  borderRadius: string;    // e.g. '0.875rem'
  surface: string;         // card bg  e.g. '#ffffff'
  surface3: string;        // page bg  e.g. '#f1f5f9'
  textPrimary: string;     // e.g. '#0f172a'
  borderColor: string;     // e.g. '#e2e8f0'
}

export interface AiProviderConfig {
  activeProvider: 'gemini' | 'openai' | 'anthropic' | 'mistral' | 'groq' | 'cohere' | 'deepseek' | 'perplexity' | 'custom' | 'backend';
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  mistralApiKey: string;
  groqApiKey: string;
  cohereApiKey: string;
  deepseekApiKey: string;
  perplexityApiKey: string;
  customApiKey: string;
  customApiUrl: string;
  customModelName: string;
}

export interface AppSettings {
  multiBranchEnabled: boolean;
  isAiGloballyEnabled: boolean;
  isMaintenanceMode: boolean;
  aiProviders: AiProviderConfig;
}

export type SubscriptionStatus = 'active' | 'expired' | 'inactive';

export type PaymentGatewayEnvironment = 'Sandbox' | 'Production';

export interface PaymentGatewaySettings {
  isEnabled: boolean;
  provider: 'PhonePe';
  environment: PaymentGatewayEnvironment;
  merchantId: string;
  saltKey: string;
  saltIndex: string;
}

export enum FeatureKey {
    AI_POWER_PACK = 'AI_POWER_PACK',
    BUSINESS_SUITE = 'BUSINESS_SUITE',
}

export interface SubscriptionPackage {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    maxStudents: number;
    maxTeachers: number;
    maxBranchAdmins: number;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
    description: string;
    includedFeatures: string[];
    featureKey: FeatureKey;
}

export interface Institute {
  id: string;
  name: string;
  adminEmail: string;
  adminMobile: string;
  logoUrl?: string;
  address?: string;
  tagline?: string;
  paymentGateway?: PaymentGatewaySettings;
  // New subscription model
  packageId: string | null;
  activeAddonIds: string[];
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
}

export interface SubscriptionSettings {
  status: SubscriptionStatus;
  expiryDate: string | null;
  isAiEnabled: boolean;
  isLeadManagementEnabled: boolean;
  maxStudents: number;
  maxTeachers: number;
  maxBranchAdmins: number;
}


// --- LMS & Library Types ---

export enum QuizType {
  MCQ = 'Multiple Choice',
  TrueFalse = 'True / False',
}
export interface MCQ {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}
export interface Quiz {
  id:string;
  quizTitle: string;
  quizType: QuizType;
  questions: MCQ[];
  topic: string;
  // Library Metadata — set when saving; optional during generation
  ownerId?: string;
  classId?: string;
  subjectId?: string;
  instituteId?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}
export interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
  topic: string;
  // Library Metadata — set when saving; optional during generation
  ownerId?: string;
  classId?: string;
  subjectId?: string;
  instituteId?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  content: string; // Markdown formatted content
  topic: string;
  // Library Metadata
  ownerId: string;
  classId: string;
  subjectId: string;
  instituteId: string;
  createdBy?: 'teacher' | 'student';
}

export interface Video {
    id: string;
    title: string;
    url: string; // e.g., YouTube URL
    topic: string;
    // Library Metadata
    ownerId: string;
    classId: string;
    subjectId: string;
    instituteId: string;
}

export interface UploadedDocument {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string; // URL to the stored file
    fileType: 'pdf' | 'docx' | 'pptx' | 'link';
    topic: string;
    // Library Metadata
    ownerId: string;
    classId: string;
    subjectId: string;
    instituteId: string;
}

// --- End of LMS & Library Types ---

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown formatted content
  studentId: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface AttendanceRecord {
    studentId: string;
    subjectId: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'Late';
}

export interface QuizSubmission {
  studentId: string;
  quiz: Quiz;
  answers: number[]; // Array of selected option indices (-1 for unanswered)
  score: number;
}

// Scheduler Types
export interface ScheduleEvent {
  id: string;
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // '09:00'
  endTime: string; // '10:00'
  classId: string;
  subjectId: string;
  teacherId: string;
  instituteId: string;
  eventType?: 'Lecture' | 'Live Class';
}

export interface AiSchedulerRule {
    subjectId: string;
    lecturesPerWeek: number;
}

// Lead Management Types
export interface Reminder {
    id: string;
    leadId: string;
    dateTime: string; // ISO string
    notes: string;
    isCompleted: boolean;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    statusTarget: LeadStatus | 'General';
}

// --- Fee Management Types ---

export interface FeeStructure {
  id: string;
  name: string;
  academicYear: string;
  totalAmount: number;
  classId: string;
  branchId: string;
  paymentMode: 'Lumpsum' | 'Installments';
  installments: FeeStructureInstallment[];
  lateFeePerDay: number;
  instituteId: string;
}

export interface FeeStructureInstallment {
  name: string; // e.g., "First Term", "Installment 1"
  percentage: number; // e.g., 50 for 50%
  dueDate: string; // YYYY-MM-DD
}

export interface Discount {
  id: string;
  name: string; // e.g., 'Merit Scholarship', 'Sibling Discount'
  type: 'Percentage' | 'Fixed Amount';
  value: number; // The percentage (e.g., 10 for 10%) or the fixed amount
  instituteId: string;
}

export interface StudentFeeProfile {
  id: string;
  studentId: string;
  academicYear: string;
  feeStructureId: string | null;
  totalFee: number;
  totalDiscount: number;
  netPayable: number;
  installments: Installment[];
  appliedDiscounts: { discountId: string, name: string, appliedAmount: number }[];
}

export interface Installment {
  id: string;
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  amountDue: number;
  amountPaid: number;
  lateFeeApplied: number; // The calculated late fee at a point in time
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
  paymentDate?: string;
  receiptId?: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  paymentDate: string;
  amountPaid: number;
  paymentMode: 'Cash' | 'Card' | 'Online' | 'Cheque';
  paidFor: string; // e.g., 'Payment for Installment 1'
  breakdown: { description: string; amount: number }[];
}

// --- End of Fee Management Types ---

// --- Digital Marketing Types ---
export enum CampaignStatus {
    Active = 'Active',
    Paused = 'Paused',
    Completed = 'Completed',
    Draft = 'Draft',
}

export interface GoogleAdCampaign {
    id: string;
    name: string;
    status: CampaignStatus;
    budget: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    clicks: number;
    impressions: number;
}

export interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    status: CampaignStatus;
    audienceSize: number;
    sentDate: string; // YYYY-MM-DD
    openRate: number; // Percentage
    clickRate: number; // Percentage
}

export interface SocialPost {
    id: string;
    platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'YouTube' | 'WhatsApp';
    content: string;
    status: 'Scheduled' | 'Posted';
    scheduledDate: string; // ISO String
    likes: number;
    comments: number;
    shares: number;
}
// --- End Digital Marketing Types ---

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
}

export interface NavLink {
    label: string;
    key: string; // Unique key for view routing
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export type ManagementCategory = 'branches' | 'users' | 'students' | 'teachers' | 'classes' | 'subjects' | 'leads' | 'institutes' | 'discounts' | 'feeStructures';

export type ManagementFieldType = 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'tel' | 'date' | 'toggle' | 'password' | 'textarea' | 'url';

export type ContextSource = 'branches' | 'classes' | 'subjects' | 'teachers' | 'students' | 'users' | 'packages' | 'addons' | 'leads' | 'institutes' | 'discounts' | 'feeStructures';

export interface ManagementField {
  name: string;
  label: string;
  type: ManagementFieldType;
  required?: boolean;
  options?: string[];
  optionsFromContext?: ContextSource;
  defaultValue?: any;
}
export interface ManagementConfig {
  [key: string]: {
    label: string;
    fields: ManagementField[];
    columns: { header: string; accessor: keyof any; render?: (item: any, context: any) => React.ReactNode }[];
    csvTemplate: string;
  };
}

// --- Gamification Types ---

export enum GameChallengeMode {
  TimeAttack = 'Time Attack', // Beat the clock
  Deadline = 'Deadline',     // Finish before a specific date/time
}

export interface GameLevel {
  levelNumber: number;
  questions: MCQ[];
}

export interface GameChallenge {
  id: string;
  title: string;
  topic: string;
  mode: GameChallengeMode;
  durationMinutes?: number; // For TimeAttack
  deadline?: string; // ISO String for Deadline
  classIds: string[];
  ownerId: string; // teacher or admin
  levels: GameLevel[];
  createdAt: string; // ISO String
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  studentId: string;
  score: number;
  timeTakenSeconds: number;
  completedAt: string; // ISO String
}
// --- End of Gamification Types ---

// --- Communication Types ---
export interface ChatMessage {
    id: string;
    conversationId: string; // e.g., 'parent_1-teacher_1'
    senderId: string;
    text: string;
    timestamp: string; // ISO String
}

// --- Subscription Modeler Types ---
export interface FunctionalityTier {
  name: string;
  model?: string;
  cost: number;
  description: string;
}

export interface FunctionalityCost {
  id: string;
  name: string;
  description: string;
  unit: 'student' | 'teacher' | 'admin' | 'institute';
  cost?: number; // For non-tiered functionalities
  tiers?: FunctionalityTier[]; // For tiered functionalities
}

// ─── Personal AI Config (Student / Parent) ────────────────────────────────────
export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'custom';

export interface PersonalAiConfig {
  id: string;
  ownerId: string;         // studentId or parentId
  ownerRole: 'Student' | 'Parent';
  activeProvider: AiProvider;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  groqApiKey?: string;
  customApiKey?: string;
  customApiUrl?: string;
  customModelName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Linked Children (Parent → multiple Students) ────────────────────────────
export interface LinkedChild {
  id: string;
  parentId: string;
  studentId: string;
  nickname?: string;        // e.g. "Elder Son", "My Daughter"
  addedAt: string;
  isDefault: boolean;       // the primary child shown by default
}

// ─── AI-Generated / Saved Content ────────────────────────────────────────────
export type AiContentType = 'quiz' | 'flashcards' | 'study_material' | 'summary';

export interface SavedAiContent {
  id: string;
  ownerId: string;          // studentId
  ownerRole: 'Student';
  contentType: AiContentType;
  title: string;
  topic: string;
  subjectName: string;
  className: string;
  content: string;          // JSON string for quiz/flashcards; markdown for material
  parsedData?: Quiz | FlashcardSet | StudyMaterial;
  generatedAt: string;
  isSharedWithParent: boolean;
  aiProvider: AiProvider;
}

// ─── Student Activity Log ─────────────────────────────────────────────────────
export interface ActivitySession {
  id: string;
  studentId: string;
  date: string;              // YYYY-MM-DD
  durationMinutes: number;
  activity: 'quiz' | 'flashcards' | 'study_material' | 'video' | 'game' | 'notes' | 'ai_generate';
  subjectId?: string;
  contentTitle?: string;
  score?: number;            // for quiz/game
  totalQuestions?: number;
}

// ─── AI Progress Report ───────────────────────────────────────────────────────
export interface AiProgressReport {
  id: string;
  studentId: string;
  generatedAt: string;
  periodLabel: string;       // e.g. "May 2025"
  summary: string;           // AI narrative text
  strengths: string[];
  areasToImprove: string[];
  studyRecommendations: string[];
  weeklyTimeSpent: { week: string; minutes: number }[];
  subjectScores: { subjectName: string; avgScore: number; quizCount: number }[];
  overallScore: number;      // 0-100
  attendancePercent: number;
}

// ─── Parent Subscription Plans ───────────────────────────────────────────────
export interface ParentPlan {
  id: string;
  name: string;              // e.g. "Basic", "Pro", "Family"
  price: number;             // per month
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  maxChildren: number;
  features: string[];
  aiReportsEnabled: boolean;
  aiGeneratorEnabled: boolean;
  detailedAnalyticsEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ParentSubscription {
  id: string;
  parentId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  expiryDate: string;
  paymentMode: 'UPI' | 'Card' | 'NetBanking' | 'Free Trial';
  amountPaid: number;
  autoRenew: boolean;
}