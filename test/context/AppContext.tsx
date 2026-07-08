import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { UserRole, Quiz, QuizSubmission, Branch, User, Student, Teacher, Parent, AcademicClass, Subject, FlashcardSet, ManagementCategory, AppSettings, AiProviderConfig, ThemeSettings, Status, StudyMaterial, Lead, LeadStatus, Institute, SubscriptionSettings, AttendanceRecord, ScheduleEvent, AiSchedulerRule, Reminder, EmailTemplate, FeeStructure, Discount, StudentFeeProfile, Installment, FeeReceipt, Video, UploadedDocument, QuizType, Notification, FeeStructureInstallment, Note, GameChallenge, GameChallengeMode, ChallengeSubmission, GameLevel, GoogleAdCampaign, EmailCampaign, SocialPost, CampaignStatus, ChatMessage, SubscriptionPackage, Addon, FeatureKey, ContextSource, SubscriptionStatus, PersonalAiConfig, LinkedChild, SavedAiContent, ActivitySession, AiProgressReport, ParentPlan, ParentSubscription, RoleConfig, ExternalParent, ExternalChildProfile, ExternalStudent, StudentPlan, StudentSubscription, StudyChallenge, ChallengeParticipation, SharedContent } from '../types';
import { NAV_LINKS, MANAGEMENT_CONFIG, SUBSCRIPTION_PACKAGES, SUBSCRIPTION_ADDONS } from '../constants';
import { SEED_INSTITUTES, SEED_BRANCHES, SEED_CLASSES, SEED_SUBJECTS, SEED_USERS, SEED_TEACHERS, SEED_STUDENTS, SEED_SCHEDULE_EVENTS, SEED_LEADS, SEED_FEE_STRUCTURES, SEED_DISCOUNTS, SEED_STUDENT_FEE_PROFILES, SEED_FEE_RECEIPTS, SEED_VERSION, SEED_LINKED_CHILDREN, SEED_PERSONAL_AI_CONFIGS, SEED_SAVED_AI_CONTENT, SEED_ACTIVITY_SESSIONS, SEED_AI_PROGRESS_REPORTS, SEED_PARENT_PLANS, SEED_PARENT_SUBSCRIPTIONS, SEED_ROLE_CONFIGS, SEED_EXTERNAL_PARENTS, SEED_EXTERNAL_CHILDREN, SEED_EXTERNAL_STUDENTS, SEED_STUDENT_PLANS, SEED_STUDENT_SUBSCRIPTIONS, SEED_STUDY_CHALLENGES, SEED_CHALLENGE_PARTICIPATIONS, SEED_SHARED_CONTENT } from '../data/seedData';
import { generateSchedule, generateGameLevels, forgotPassword as apiForgotPassword } from '../services/apiClient';
import { apiListChildren, apiGetAiConfig, apiListAiContent } from '../services/externalDataApi';
import { apiCreateInstituteRecord, apiUpdateInstituteRecord, apiDeleteInstituteRecord, apiListInstituteRecords, isSyncableCategory } from '../services/institutionApi';
import { apiListFeeStructures, apiCreateFeeStructure, apiDeleteFeeStructure, apiListDiscounts, apiCreateDiscount, apiDeleteDiscount, apiCreateLeadReminder, apiListEmailTemplates, apiCreateEmailTemplate, apiDeleteEmailTemplate, apiListFeeProfiles, apiCreateFeeProfile, apiRecordPayment } from '../services/feesLeadsApi';
import { format, add } from 'date-fns';

const PYTHON_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Cloud Storage Simulation ---
// In a real application, these functions would interact with a cloud database.
// Here, we use localStorage to simulate persistence.
const getFromCloudStore = (key: string, defaultValue: any) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const saveToCloudStore = (key: string, value: any) => {
    try {
        // The artificial 300ms timeout was removed to prevent race conditions
        // during rapid operations like creating a user and immediately trying to log in.
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // In a real app, you might have more sophisticated error handling/logging
    }
};

// ── Seed-version reset: if stored version differs, wipe data stores and re-seed ──
const STORED_SEED_VER_KEY = 'seed_version';
const storedSeedVer = (() => { try { return localStorage.getItem(STORED_SEED_VER_KEY); } catch { return null; } })();
if (storedSeedVer !== SEED_VERSION) {
  const keysToReset = ['branches','users','students','teachers','classes','subjects','leads','scheduleEvents',
    'feeStructures','discounts','studentFeeProfiles','feeReceipts',
    'linkedChildren','personalAiConfigs','savedAiContent','activitySessions','aiProgressReports','parentPlans','parentSubscriptions',
    'roleConfigs','externalParents','externalChildren','externalStudents',
    'studentPlans','studentSubscriptions','studyChallenges','challengeParticipations','sharedContent'];
  keysToReset.forEach(k => { try { localStorage.removeItem(k); } catch {} });
  // Pre-load seed data into localStorage
  const seedMap: Record<string,any> = {
    branches: SEED_BRANCHES,
    students: SEED_STUDENTS,
    teachers: SEED_TEACHERS,
    classes:  SEED_CLASSES,
    subjects: SEED_SUBJECTS,
    leads:    SEED_LEADS,
    scheduleEvents: SEED_SCHEDULE_EVENTS,
    feeStructures:  SEED_FEE_STRUCTURES,
    discounts:      SEED_DISCOUNTS,
    studentFeeProfiles: SEED_STUDENT_FEE_PROFILES,
    feeReceipts:    SEED_FEE_RECEIPTS,
    linkedChildren: SEED_LINKED_CHILDREN,
    personalAiConfigs: SEED_PERSONAL_AI_CONFIGS,
    savedAiContent: SEED_SAVED_AI_CONTENT,
    activitySessions: SEED_ACTIVITY_SESSIONS,
    aiProgressReports: SEED_AI_PROGRESS_REPORTS,
    parentPlans: SEED_PARENT_PLANS,
    parentSubscriptions: SEED_PARENT_SUBSCRIPTIONS,
    roleConfigs: SEED_ROLE_CONFIGS,
    externalParents: SEED_EXTERNAL_PARENTS,
    externalChildren: SEED_EXTERNAL_CHILDREN,
    externalStudents: SEED_EXTERNAL_STUDENTS,
    studentPlans: SEED_STUDENT_PLANS,
    studentSubscriptions: SEED_STUDENT_SUBSCRIPTIONS,
    studyChallenges: SEED_STUDY_CHALLENGES,
    challengeParticipations: SEED_CHALLENGE_PARTICIPATIONS,
    sharedContent: SEED_SHARED_CONTENT,
  };
  Object.entries(seedMap).forEach(([k, v]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} });
  try { localStorage.setItem(STORED_SEED_VER_KEY, SEED_VERSION); } catch {}
}

const initialCsvTemplates = Object.entries(MANAGEMENT_CONFIG).reduce((acc, [key, value]) => {
    if (value.csvTemplate) {
        acc[key] = value.csvTemplate;
    }
    return acc;
}, {} as Record<string, string>);


// Define the shape of the context data
interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: (User | Student | Teacher | Parent) | null;
  login: (instituteName: string, loginIdentifier: string, password?: string) => Promise<boolean>;
  logout: () => void;
  loginAsProductOwner: () => void;
  showLoginPage: boolean;
  setShowLoginPage: (show: boolean) => void;
  
  // Impersonation
  originalUser: User | null;
  impersonateUser: (user: Student | Teacher) => void;
  exitImpersonation: () => void;
  switchRole: (role: UserRole) => void;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  getViewLabel: (viewKey: string) => string;

  // Mobile navigation
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  
  // Workspace Modal
  isWorkspaceAccessModalOpen: boolean;
  openWorkspaceAccessModal: () => void;
  closeWorkspaceAccessModal: () => void;

  // Connect Email Modal
  isConnectEmailModalOpen: boolean;
  openConnectEmailModal: () => void;
  closeConnectEmailModal: () => void;
  connectEmail: () => void;
  disconnectEmail: () => void;


  // Password Reset
  isForgotPasswordModalOpen: boolean;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
  requestPasswordReset: (identifier: string) => Promise<boolean>;

  // Global Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  csvTemplates: Record<string, string>;
  updateCsvTemplate: (category: string, newTemplate: string) => void;

  // Theme
  themeSettings: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;

  // Multi-tenancy & Subscriptions
  institutes: Institute[];
  activeInstituteId: string | null;
  setActiveInstituteId: (id: string | null) => void;
  activeInstitute: Institute | undefined;
  currentSubscription: SubscriptionSettings;
  addPackage: (pkg: SubscriptionPackage) => void;

  // Data
  branches: Branch[];
  users: User[];
  students: Student[];
  teachers: Teacher[];
  classes: AcademicClass[];
  subjects: Subject[];
  leads: Lead[];
  addRecord: (category: ManagementCategory, record: any) => void;
  addBulkRecords: (category: ManagementCategory, data: any[]) => void;
  updateRecord: (category: ManagementCategory, id: string, updatedRecord: any) => void;
  deleteRecord: (category: ManagementCategory, id: string) => void;
  getData: (category: ContextSource) => any[];
  getContextData: (source: string, id: string) => any;

  // Role-specific filtered data
  filteredBranches: Branch[];
  filteredClasses: AcademicClass[];
  filteredStudents: Student[];
  filteredTeachers: Teacher[];
  filteredSubjects: Subject[];
  filteredQuizzes: Quiz[];
  filteredFlashcardSets: FlashcardSet[];
  filteredStudyMaterials: StudyMaterial[];
  filteredVideos: Video[];
  filteredUploadedDocuments: UploadedDocument[];
  filteredScheduleEvents: ScheduleEvent[];

  // Teacher Workspace
  teacherWorkspace: { classId: string, subjectId: string };
  setTeacherWorkspace: (workspace: { classId: string, subjectId: string }) => void;

  // LMS & Library
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'> & { topic: string }) => void;
  flashcardSets: FlashcardSet[];
  addFlashcardSet: (set: Omit<FlashcardSet, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'> & { topic: string }) => void;
  studyMaterials: StudyMaterial[];
  addStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'createdBy' | 'instituteId'>) => void;
  videos: Video[];
  addVideo: (video: Omit<Video, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'>) => void;
  uploadedDocuments: UploadedDocument[];
  addUploadedDocument: (doc: Omit<UploadedDocument, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'>) => void;

  // Quiz Flow
  activeQuiz: Quiz | null;
  startQuiz: (quiz: Quiz) => void;
  submission: QuizSubmission | null;
  quizSubmissions: QuizSubmission[];
  submitQuiz: (submission: Omit<QuizSubmission, 'studentId'>) => void;
  clearSubmission: () => void;

  // Study Flow
  activeFlashcardSet: FlashcardSet | null;
  studyFlashcardSet: (set: FlashcardSet) => void;
  activeStudyMaterial: StudyMaterial | null;
  viewStudyMaterial: (material: StudyMaterial) => void;
  clearStudyView: () => void;
  isAiVideoFinderOpen: boolean;
  openAiVideoFinder: () => void;
  closeAiVideoFinder: () => void;
  playingVideo: Video | null;
  playVideo: (video: Video) => void;
  closeVideoPlayer: () => void;

  // Note Taking
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'studentId'>) => void;
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'studentId' | 'createdAt'>>) => void;
  deleteNote: (noteId: string) => void;
  editingNote: Note | null;
  startNewNote: () => void;
  editNote: (note: Note) => void;
  closeNoteEditor: () => void;

  // Attendance
  attendance: AttendanceRecord[];
  updateAttendance: (studentId: string, subjectId: string, date: string, status: 'Present' | 'Absent' | 'Late') => void;
  addBulkAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Scheduler
  scheduleEvents: ScheduleEvent[];
  isAiScheduling: boolean;
  generateScheduleFromAI: (rules: AiSchedulerRule[], forClassId: string) => Promise<void>;
  addScheduleEvent: (eventData: Omit<ScheduleEvent, 'id' | 'instituteId' | 'endTime'>) => void;
  updateScheduleEvent: (eventId: string, newDay: string, newStartTime: string) => void;
  deleteScheduleEvent: (eventId: string) => void;
  scheduleLiveClass: (classId: string, dateTime: string, meetLink: string) => void;

  // Lead Management
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'isCompleted'>) => void;
  updateReminder: (reminderId: string, updates: Partial<Reminder>) => void;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => void;
  updateEmailTemplate: (templateId: string, template: EmailTemplate) => void;
  deleteEmailTemplate: (templateId: string) => void;
  isReminderModalOpen: boolean;
  selectedLeadForReminder: Lead | null;
  openReminderModal: (lead: Lead) => void;
  closeReminderModal: () => void;
  isEmailModalOpen: boolean;
  selectedLeadForEmail: Lead | null;
  openEmailModal: (lead: Lead) => void;
  closeEmailModal: () => void;
  isMeetModalOpen: boolean;
  selectedLeadForMeet: Lead | null;
  selectedClassForMeet: AcademicClass | null;
  openMeetModal: (entity: Lead | AcademicClass) => void;
  closeMeetModal: () => void;

  // Fee Management
  feeStructures: FeeStructure[];
  discounts: Discount[];
  studentFeeProfiles: StudentFeeProfile[];
  feeReceipts: FeeReceipt[];
  getStudentFeeProfile: (studentId: string) => StudentFeeProfile | undefined;
  assignFeeStructureToStudent: (studentId: string, feeStructureId: string) => void;
  applyDiscountsToStudent: (studentId: string, discountIds: string[]) => void;
  recordPayment: (studentId: string, installmentId: string, amount: number, mode: FeeReceipt['paymentMode']) => void;
  setStudentPaymentPlan: (studentId: string, numInstallments: number, lateFeePerDay: number) => void;
  isReceiptModalOpen: boolean;
  activeReceipt: FeeReceipt | null;
  openReceiptModal: (receiptId: string) => void;
  closeReceiptModal: () => void;
  getReceipt: (receiptId: string) => FeeReceipt | undefined;
  notifications: Notification[];

  // --- Gamification ---
  gameChallenges: GameChallenge[];
  challengeSubmissions: ChallengeSubmission[];
  activeGameChallenge: GameChallenge | null;
  activeGameResults: GameChallenge | null;
  createGameChallenge: (challengeData: {
      topic: string;
      mode: GameChallengeMode;
      durationMinutes?: number;
      deadline?: string;
      numLevels: number;
      questionsPerLevel: number;
      classIds: string[];
  }) => Promise<void>;
  startChallenge: (challenge: GameChallenge) => void;
  submitChallenge: (submissionData: Omit<ChallengeSubmission, 'id' | 'studentId' | 'completedAt'>) => void;
  viewChallengeResults: (challenge: GameChallenge) => void;

  // --- Digital Marketing ---
  googleAdCampaigns: GoogleAdCampaign[];
  emailCampaigns: EmailCampaign[];
  socialPosts: SocialPost[];
  addGoogleAdCampaign: (campaign: Omit<GoogleAdCampaign, 'id'|'clicks'|'impressions'>) => void;
  addEmailCampaign: (campaign: Omit<EmailCampaign, 'id'|'status'|'sentDate'|'openRate'|'clickRate'>) => void;
  addSocialPost: (post: Omit<SocialPost, 'id'|'likes'|'comments'|'shares'>) => void;
  updateSocialPost: (post: SocialPost) => void;
  
  // --- Communication ---
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  // New: AI Personal, Children, Saved Content, Activity, Reports, Plans
  linkedChildren: LinkedChild[];
  setLinkedChildren: React.Dispatch<React.SetStateAction<LinkedChild[]>>;
  personalAiConfigs: PersonalAiConfig[];
  setPersonalAiConfigs: React.Dispatch<React.SetStateAction<PersonalAiConfig[]>>;
  savedAiContent: SavedAiContent[];
  setSavedAiContent: React.Dispatch<React.SetStateAction<SavedAiContent[]>>;
  activitySessions: ActivitySession[];
  setActivitySessions: React.Dispatch<React.SetStateAction<ActivitySession[]>>;
  aiProgressReports: AiProgressReport[];
  setAiProgressReports: React.Dispatch<React.SetStateAction<AiProgressReport[]>>;
  parentPlans: ParentPlan[];
  setParentPlans: React.Dispatch<React.SetStateAction<ParentPlan[]>>;
  parentSubscriptions: ParentSubscription[];
  setParentSubscriptions: React.Dispatch<React.SetStateAction<ParentSubscription[]>>;
  // External roles
  roleConfigs: RoleConfig[];
  setRoleConfigs: React.Dispatch<React.SetStateAction<RoleConfig[]>>;
  externalParents: ExternalParent[];
  setExternalParents: React.Dispatch<React.SetStateAction<ExternalParent[]>>;
  externalChildren: ExternalChildProfile[];
  setExternalChildren: React.Dispatch<React.SetStateAction<ExternalChildProfile[]>>;
  externalStudents: ExternalStudent[];
  setExternalStudents: React.Dispatch<React.SetStateAction<ExternalStudent[]>>;
  externalParentSession: ExternalParent | null;
  externalStudentSession: ExternalStudent | null;
  loginExternal: (email: string, password: string) => Promise<'parent' | 'student' | false>;
  registerExternalParent: (data: { name: string; email: string; password: string; mobile: string; city?: string }) => Promise<boolean>;
  registerExternalStudent: (data: { name: string; email: string; password: string; mobile?: string; grade: string; age: number; subjectsOfInterest: string[]; schoolName?: string; city?: string }) => Promise<boolean>;
  studentPlans: StudentPlan[];
  setStudentPlans: React.Dispatch<React.SetStateAction<StudentPlan[]>>;
  studentSubscriptions: StudentSubscription[];
  setStudentSubscriptions: React.Dispatch<React.SetStateAction<StudentSubscription[]>>;
  studyChallenges: StudyChallenge[];
  setStudyChallenges: React.Dispatch<React.SetStateAction<StudyChallenge[]>>;
  challengeParticipations: ChallengeParticipation[];
  setChallengeParticipations: React.Dispatch<React.SetStateAction<ChallengeParticipation[]>>;
  sharedContent: SharedContent[];
  setSharedContent: React.Dispatch<React.SetStateAction<SharedContent[]>>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Minimal Initial Data for Production Readiness
const initialProductOwner: User = { id: 'user_po', name: 'Product Owner', email: 'po@saaa.com', mobile: '555-999-9999', role: UserRole.ProductOwner, status: 'active', instituteId: '' };


// Context Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | Student | Teacher | Parent | null>(null);
    const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ClassAdmin);
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showLoginPage, setShowLoginPage] = useState(false);
    const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
    // ── Theme ─────────────────────────────────────────────────────────────────
    const DEFAULT_THEME: ThemeSettings = {
      primaryColor: '#2563EB', primaryHover: '#1D4ED8', primaryLight: '#EFF6FF',
      sidebarFrom: '#1E1B4B', sidebarTo: '#1E3A8A',
      headingFont: 'Inter', bodyFont: 'Inter',
      borderRadius: '0.875rem',
      surface: '#FFFFFF', surface3: '#F0F4FF',
      textPrimary: '#1E3A8A', borderColor: '#BFDBFE',
    };

    const applyThemeToDom = (theme: ThemeSettings) => {
      const root = document.documentElement;
      root.style.setProperty('--brand', theme.primaryColor);
      root.style.setProperty('--brand-hover', theme.primaryHover);
      root.style.setProperty('--brand-light', theme.primaryLight);
      root.style.setProperty('--radius', theme.borderRadius);
      root.style.setProperty('--surface', theme.surface);
      root.style.setProperty('--surface-3', theme.surface3);
      root.style.setProperty('--text-primary', theme.textPrimary);
      root.style.setProperty('--border', theme.borderColor);
      // Load Google Font if needed
      const fonts = [theme.headingFont, theme.bodyFont].filter(Boolean);
      fonts.forEach(font => {
        if (!document.querySelector(`link[data-font="${font}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.setAttribute('data-font', font);
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;
          document.head.appendChild(link);
        }
      });
      // Inject dynamic CSS overrides
      let el = document.getElementById('eduveda-theme');
      if (!el) { el = document.createElement('style'); el.id = 'eduveda-theme'; document.head.appendChild(el); }
      el.textContent = `
        /* ── Font family applies globally (safe) ── */
        body { font-family: '${theme.bodyFont}', sans-serif !important; }

        /* ── ALL theme color/bg overrides scoped to .light-theme only ── */
        /* This prevents landing page / login from being affected         */
        .light-theme { background-color: ${theme.surface3} !important; }
        .light-theme main { background-color: ${theme.surface3} !important; }
        .light-theme h1,.light-theme h2,.light-theme h3,.light-theme h4,.light-theme h5,.light-theme h6 {
          font-family: '${theme.headingFont}', sans-serif !important;
          color: ${theme.textPrimary} !important;
          font-weight: 700 !important;
        }
        .light-theme p:not([class*="text-"]),
        .light-theme span:not([class*="text-"]),
        .light-theme label:not([class*="text-"]),
        .light-theme td:not([class*="text-"]) { color: ${theme.textPrimary} !important; }
        .light-theme .text-slate-900, .light-theme .text-gray-900 { color: ${theme.textPrimary} !important; }
        .light-theme .text-slate-800, .light-theme .text-gray-800 { color: ${theme.textPrimary} !important; }
        .light-theme .text-slate-700, .light-theme .text-gray-700 { color: color-mix(in srgb, ${theme.textPrimary} 80%, #4a90d9 20%) !important; }
        .light-theme .text-slate-600, .light-theme .text-gray-600 { color: color-mix(in srgb, ${theme.textPrimary} 65%, #4a90d9 35%) !important; }
        .light-theme .text-slate-500, .light-theme .text-gray-500 { color: color-mix(in srgb, ${theme.textPrimary} 50%, #4a90d9 50%) !important; }
        .btn-primary { background-color: ${theme.primaryColor} !important; color: #ffffff !important; box-shadow: 0 1px 3px ${theme.primaryColor}44 !important; }
        .btn-primary:hover { background-color: ${theme.primaryHover} !important; box-shadow: 0 4px 12px ${theme.primaryColor}55 !important; }
        .btn-secondary { background-color: ${theme.primaryLight} !important; color: ${theme.primaryColor} !important; border-color: ${theme.primaryColor}44 !important; }
        .btn-secondary:hover { background-color: ${theme.primaryColor}18 !important; }
        .light-theme .btn-icon:hover { color: ${theme.primaryColor} !important; background-color: ${theme.primaryLight} !important; }
        .light-theme .card,.light-theme .card-hover,.light-theme .card-flat { background-color: ${theme.surface} !important; border-color: ${theme.borderColor} !important; border-radius: ${theme.borderRadius} !important; }
        .light-theme .card-hover:hover { border-color: ${theme.primaryColor}66 !important; }
        .light-theme .input-field,.light-theme .select-field { background-color: ${theme.surface} !important; border-color: ${theme.borderColor} !important; border-radius: 12px !important; }
        .light-theme .input-field:focus,.light-theme .select-field:focus { border-color: ${theme.primaryColor} !important; box-shadow: 0 0 0 4px ${theme.primaryColor}1A !important; }
        .light-theme .tab-active { color: ${theme.primaryColor} !important; }
        .light-theme .modal-box,.light-theme .modal-box-sm { background-color: ${theme.surface} !important; }
        .light-theme .table-wrap { background-color: ${theme.surface} !important; border-color: ${theme.borderColor} !important; }
        .light-theme .badge-indigo { background-color: ${theme.primaryLight} !important; color: ${theme.primaryColor} !important; }
        .light-theme a.text-indigo-600, .light-theme .text-indigo-600 { color: ${theme.primaryColor} !important; }
        .light-theme .bg-indigo-600 { background-color: ${theme.primaryColor} !important; }
        .light-theme .bg-indigo-700 { background-color: ${theme.primaryHover} !important; }
        .light-theme .bg-indigo-50 { background-color: ${theme.primaryLight} !important; }
        .light-theme .text-indigo-700 { color: ${theme.primaryHover} !important; }
        .light-theme .border-indigo-200 { border-color: ${theme.primaryColor}44 !important; }
        .light-theme .hover\\:text-indigo-600:hover { color: ${theme.primaryColor} !important; }
        .light-theme .hover\\:bg-indigo-100:hover { background-color: ${theme.primaryColor}18 !important; }
        .light-theme .hover\\:bg-indigo-700:hover { background-color: ${theme.primaryHover} !important; }
        .app-sidebar .nav-item { color: rgba(255,255,255,0.75) !important; }
        .app-sidebar .nav-item:hover { background-color: rgba(255,255,255,0.12) !important; color: #ffffff !important; }
        .app-sidebar .nav-active { background-color: rgba(255,255,255,0.22) !important; color: #ffffff !important; }
      `;
    };

    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
      const stored = getFromCloudStore('themeSettings', null);
      const theme = stored ? { ...DEFAULT_THEME, ...stored } : DEFAULT_THEME;
      // Apply on first load
      setTimeout(() => applyThemeToDom(theme), 0);
      return theme;
    });

    const defaultAiProviders: AiProviderConfig = {
      activeProvider: 'backend',
      geminiApiKey: '', openaiApiKey: '', anthropicApiKey: '',
      mistralApiKey: '', groqApiKey: '', cohereApiKey: '',
      deepseekApiKey: '', perplexityApiKey: '',
      customApiKey: '', customApiUrl: '', customModelName: '',
    };
    const [settings, setSettings] = useState<AppSettings>(() => {
        const stored = getFromCloudStore('settings', null);
        const defaults = { multiBranchEnabled: true, isAiGloballyEnabled: true, isMaintenanceMode: false, aiProviders: defaultAiProviders };
        if (!stored) return defaults;
        // Force isMaintenanceMode to false on load — prevents users being locked out
        return { ...defaults, ...stored, isMaintenanceMode: false, aiProviders: { ...defaultAiProviders, ...(stored.aiProviders || {}) } };
    });
    const [csvTemplates, setCsvTemplates] = useState<Record<string, string>>(() => getFromCloudStore('csvTemplates', initialCsvTemplates));
    
    // Impersonation State
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [isWorkspaceAccessModalOpen, setWorkspaceAccessModalOpen] = useState(false);
    const [isConnectEmailModalOpen, setConnectEmailModalOpen] = useState(false);


    // Multi-tenancy
    const [institutes, setInstitutes] = useState<Institute[]>(() => getFromCloudStore('institutes', SEED_INSTITUTES as any));
    const [activeInstituteId, setActiveInstituteId] = useState<string | null>(() => getFromCloudStore('activeInstituteId', null));
    const activeInstitute = useMemo(() => institutes.find(i => i.id === activeInstituteId), [institutes, activeInstituteId]);

    // Subscriptions
    const [packages, setPackages] = useState<SubscriptionPackage[]>(() => getFromCloudStore('packages', SUBSCRIPTION_PACKAGES));
    const [addons, setAddons] = useState<Addon[]>(() => getFromCloudStore('addons', SUBSCRIPTION_ADDONS));

    // Main Data Stores - Pre-seeded with demo data
    const [branches, setBranches] = useState<Branch[]>(() => getFromCloudStore('branches', SEED_BRANCHES as any));
    const [users, setUsers] = useState<User[]>(() => getFromCloudStore('users', [initialProductOwner, ...SEED_USERS] as any));
    const [students, setStudents] = useState<Student[]>(() => getFromCloudStore('students', SEED_STUDENTS as any));
    const [teachers, setTeachers] = useState<Teacher[]>(() => getFromCloudStore('teachers', SEED_TEACHERS as any));
    const [classes, setClasses] = useState<AcademicClass[]>(() => getFromCloudStore('classes', SEED_CLASSES as any));
    const [subjects, setSubjects] = useState<Subject[]>(() => getFromCloudStore('subjects', SEED_SUBJECTS as any));
    const [leads, setLeads] = useState<Lead[]>(() => getFromCloudStore('leads', SEED_LEADS as any));
    const [quizzes, setQuizzes] = useState<Quiz[]>(() => getFromCloudStore('quizzes', []));
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>(() => getFromCloudStore('flashcardSets', []));
    const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => getFromCloudStore('studyMaterials', []));
    const [videos, setVideos] = useState<Video[]>(() => getFromCloudStore('videos', []));
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>(() => getFromCloudStore('uploadedDocuments', []));
    const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>(() => getFromCloudStore('quizSubmissions', []));
    const [notes, setNotes] = useState<Note[]>(() => getFromCloudStore('notes', []));
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getFromCloudStore('attendance', []));
    const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() => getFromCloudStore('scheduleEvents', SEED_SCHEDULE_EVENTS as any));
    const [reminders, setReminders] = useState<Reminder[]>(() => getFromCloudStore('reminders', []));
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => getFromCloudStore('emailTemplates', []));
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => getFromCloudStore('feeStructures', SEED_FEE_STRUCTURES));
    const [discounts, setDiscounts] = useState<Discount[]>(() => getFromCloudStore('discounts', SEED_DISCOUNTS));
    const [studentFeeProfiles, setStudentFeeProfiles] = useState<StudentFeeProfile[]>(() => getFromCloudStore('studentFeeProfiles', SEED_STUDENT_FEE_PROFILES));
    const [feeReceipts, setFeeReceipts] = useState<FeeReceipt[]>(() => getFromCloudStore('feeReceipts', SEED_FEE_RECEIPTS));

    // ── New: Personal AI, Children, Saved Content, Activity, Reports, Plans ──
    const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>(() => getFromCloudStore('linkedChildren', SEED_LINKED_CHILDREN));
    const [personalAiConfigs, setPersonalAiConfigs] = useState<PersonalAiConfig[]>(() => getFromCloudStore('personalAiConfigs', SEED_PERSONAL_AI_CONFIGS));
    const [savedAiContent, setSavedAiContent] = useState<SavedAiContent[]>(() => getFromCloudStore('savedAiContent', SEED_SAVED_AI_CONTENT));
    const [activitySessions, setActivitySessions] = useState<ActivitySession[]>(() => getFromCloudStore('activitySessions', SEED_ACTIVITY_SESSIONS));
    const [aiProgressReports, setAiProgressReports] = useState<AiProgressReport[]>(() => getFromCloudStore('aiProgressReports', SEED_AI_PROGRESS_REPORTS));
    const [parentPlans, setParentPlans] = useState<ParentPlan[]>(() => getFromCloudStore('parentPlans', SEED_PARENT_PLANS));
    const [parentSubscriptions, setParentSubscriptions] = useState<ParentSubscription[]>(() => getFromCloudStore('parentSubscriptions', SEED_PARENT_SUBSCRIPTIONS));
    const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(() => getFromCloudStore('roleConfigs', SEED_ROLE_CONFIGS));
    const [externalParents, setExternalParents] = useState<ExternalParent[]>(() => getFromCloudStore('externalParents', SEED_EXTERNAL_PARENTS));
    const [externalChildren, setExternalChildren] = useState<ExternalChildProfile[]>(() => getFromCloudStore('externalChildren', SEED_EXTERNAL_CHILDREN));
    const [externalStudents, setExternalStudents] = useState<ExternalStudent[]>(() => getFromCloudStore('externalStudents', SEED_EXTERNAL_STUDENTS));
    const [studentPlans, setStudentPlans] = useState<StudentPlan[]>(() => getFromCloudStore('studentPlans', SEED_STUDENT_PLANS));
    const [studentSubscriptions, setStudentSubscriptions] = useState<StudentSubscription[]>(() => getFromCloudStore('studentSubscriptions', SEED_STUDENT_SUBSCRIPTIONS));
    const [studyChallenges, setStudyChallenges] = useState<StudyChallenge[]>(() => getFromCloudStore('studyChallenges', SEED_STUDY_CHALLENGES));
    const [challengeParticipations, setChallengeParticipations] = useState<ChallengeParticipation[]>(() => getFromCloudStore('challengeParticipations', SEED_CHALLENGE_PARTICIPATIONS));
    const [sharedContent, setSharedContent] = useState<SharedContent[]>(() => getFromCloudStore('sharedContent', SEED_SHARED_CONTENT));
    // Track which external account is logged in (separate from institute login)
    const [externalParentSession, setExternalParentSession] = useState<ExternalParent | null>(null);
    const [externalStudentSession, setExternalStudentSession] = useState<ExternalStudent | null>(null);
    const [gameChallenges, setGameChallenges] = useState<GameChallenge[]>(() => getFromCloudStore('gameChallenges', []));
    const [challengeSubmissions, setChallengeSubmissions] = useState<ChallengeSubmission[]>(() => getFromCloudStore('challengeSubmissions', []));
    const [googleAdCampaigns, setGoogleAdCampaigns] = useState<GoogleAdCampaign[]>(() => getFromCloudStore('googleAdCampaigns', []));
    const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => getFromCloudStore('emailCampaigns', []));
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => getFromCloudStore('socialPosts', []));
    const [messages, setMessages] = useState<ChatMessage[]>(() => getFromCloudStore('messages', []));
    
    // UI State
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [submission, setSubmission] = useState<QuizSubmission | null>(null);
    const [activeFlashcardSet, setActiveFlashcardSet] = useState<FlashcardSet | null>(null);
    const [activeStudyMaterial, setActiveStudyMaterial] = useState<StudyMaterial | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [teacherWorkspace, setTeacherWorkspace] = useState({ classId: '', subjectId: '' });
    const [isAiScheduling, setIsAiScheduling] = useState(false);
    const [isReminderModalOpen, setReminderModalOpen] = useState(false);
    const [selectedLeadForReminder, setSelectedLeadForReminder] = useState<Lead | null>(null);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
    const [isMeetModalOpen, setMeetModalOpen] = useState(false);
    const [selectedLeadForMeet, setSelectedLeadForMeet] = useState<Lead | null>(null);
    const [selectedClassForMeet, setSelectedClassForMeet] = useState<AcademicClass | null>(null);
    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState<FeeReceipt | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeGameChallenge, setActiveGameChallenge] = useState<GameChallenge | null>(null);
    const [activeGameResults, setActiveGameResults] = useState<GameChallenge | null>(null);
    const [isAiVideoFinderOpen, setAiVideoFinderOpen] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

    // --- COMPUTED STATE & DERIVED DATA ---

    const currentSubscription: SubscriptionSettings = useMemo(() => {
        if (currentRole === UserRole.ProductOwner) {
            return {
                status: 'active',
                expiryDate: null,
                isAiEnabled: true,
                isLeadManagementEnabled: true,
                maxStudents: Infinity,
                maxTeachers: Infinity,
                maxBranchAdmins: Infinity,
            };
        }

        if (!activeInstitute) {
            return {
                status: 'inactive',
                expiryDate: null,
                isAiEnabled: false,
                isLeadManagementEnabled: false,
                maxStudents: 0,
                maxTeachers: 0,
                maxBranchAdmins: 0,
            };
        }

        const basePackage = packages.find(p => p.id === activeInstitute.packageId);
        const activeAddons = addons.filter(a => activeInstitute.activeAddonIds.includes(a.id));

        const isExpired = activeInstitute.subscriptionExpiry ? new Date(activeInstitute.subscriptionExpiry) < new Date() : true;
        const status = isExpired ? 'expired' : activeInstitute.subscriptionStatus;

        if (status !== 'active') {
            return {
                status,
                expiryDate: activeInstitute.subscriptionExpiry,
                isAiEnabled: false,
                isLeadManagementEnabled: false,
                maxStudents: 0,
                maxTeachers: 0,
                maxBranchAdmins: 0,
            };
        }

        return {
            status: 'active',
            expiryDate: activeInstitute.subscriptionExpiry,
            isAiEnabled: settings.isAiGloballyEnabled && (
                basePackage?.id === 'package_premium_initial' ||
                activeAddons.some(a => a.featureKey === FeatureKey.AI_POWER_PACK)
            ),
            isLeadManagementEnabled:
                basePackage?.id === 'package_premium_initial' ||
                activeAddons.some(a => a.featureKey === FeatureKey.BUSINESS_SUITE),
            maxStudents: basePackage?.maxStudents || 0,
            maxTeachers: basePackage?.maxTeachers || 0,
            maxBranchAdmins: basePackage?.maxBranchAdmins || 0,
        };
    }, [currentRole, activeInstitute, packages, addons, settings.isAiGloballyEnabled]);


    // Filter data based on role and active institute
    const {
        filteredBranches,
        filteredClasses,
        filteredStudents,
        filteredTeachers,
        filteredSubjects,
        filteredQuizzes,
        filteredFlashcardSets,
        filteredStudyMaterials,
        filteredVideos,
        filteredUploadedDocuments,
        filteredScheduleEvents
    } = useMemo(() => {
        const instituteId = activeInstitute?.id;
        if (currentRole === UserRole.ProductOwner && !instituteId) { // Product owner with no institute selected
             return {
                filteredBranches: branches, filteredClasses: classes, filteredStudents: students, filteredTeachers: teachers,
                filteredSubjects: subjects, filteredQuizzes: quizzes, filteredFlashcardSets: flashcardSets,
                filteredStudyMaterials: studyMaterials, filteredVideos: videos, filteredUploadedDocuments: uploadedDocuments,
                filteredScheduleEvents: scheduleEvents,
            };
        }

        // Base filtering for institute
        const instStudents = students.filter(s => s.instituteId === instituteId);
        const instTeachers = teachers.filter(t => t.instituteId === instituteId);
        const instBranches = branches.filter(b => b.instituteId === instituteId);
        const instClasses = classes.filter(c => c.instituteId === instituteId);
        const instSubjects = subjects.filter(s => s.instituteId === instituteId);
        const instQuizzes = quizzes.filter(q => q.instituteId === instituteId);
        const instFlashcardSets = flashcardSets.filter(fs => fs.instituteId === instituteId);
        const instStudyMaterials = studyMaterials.filter(sm => sm.instituteId === instituteId);
        const instVideos = videos.filter(v => v.instituteId === instituteId);
        const instUploadedDocuments = uploadedDocuments.filter(ud => ud.instituteId === instituteId);
        const instScheduleEvents = scheduleEvents.filter(se => se.instituteId === instituteId);
        
        if (currentRole === UserRole.BranchAdmin) {
            const branchAdminUser = currentUser as User;
            const adminBranchIds = new Set(branchAdminUser.branchIds || []);

            const fStudents = instStudents.filter(s => s.branchIds.some(id => adminBranchIds.has(id)));
            const fTeachers = instTeachers.filter(t => t.branchIds.some(id => adminBranchIds.has(id)));

            const relevantClassIds = new Set<string>();
            fStudents.forEach(s => relevantClassIds.add(s.classId));
            fTeachers.forEach(t => t.classIds.forEach(id => relevantClassIds.add(id)));

            const fClasses = instClasses.filter(c => relevantClassIds.has(c.id));
            const fQuizzes = instQuizzes.filter(q => q.classId !== undefined && relevantClassIds.has(q.classId));
            const fFlashcardSets = instFlashcardSets.filter(fs => fs.classId !== undefined && relevantClassIds.has(fs.classId));
            const fStudyMaterials = instStudyMaterials.filter(sm => relevantClassIds.has(sm.classId));
            const fVideos = instVideos.filter(v => relevantClassIds.has(v.classId));
            const fUploadedDocuments = instUploadedDocuments.filter(ud => relevantClassIds.has(ud.classId));
            const fScheduleEvents = instScheduleEvents.filter(e => relevantClassIds.has(e.classId));

            return {
                filteredBranches: instBranches.filter(b => adminBranchIds.has(b.id)),
                filteredClasses: fClasses,
                filteredStudents: fStudents,
                filteredTeachers: fTeachers,
                filteredSubjects: instSubjects, // Subjects are institute-wide
                filteredQuizzes: fQuizzes,
                filteredFlashcardSets: fFlashcardSets,
                filteredStudyMaterials: fStudyMaterials,
                filteredVideos: fVideos,
                filteredUploadedDocuments: fUploadedDocuments,
                filteredScheduleEvents: fScheduleEvents,
            };
        }

        if (currentRole === UserRole.Student) {
            const studentUser = currentUser as Student;
            return {
                filteredBranches: instBranches,
                filteredClasses: instClasses.filter(c => c.id === studentUser.classId),
                filteredStudents: [studentUser],
                filteredTeachers: instTeachers.filter(t => t.classIds.includes(studentUser.classId)),
                filteredSubjects: instSubjects.filter(s => studentUser.subjectIds.includes(s.id)),
                filteredQuizzes: instQuizzes.filter(q => q.classId === studentUser.classId),
                filteredFlashcardSets: instFlashcardSets.filter(fs => fs.classId === studentUser.classId),
                filteredStudyMaterials: instStudyMaterials.filter(sm => sm.classId === studentUser.classId),
                filteredVideos: instVideos.filter(v => v.classId === studentUser.classId),
                filteredUploadedDocuments: instUploadedDocuments.filter(ud => ud.classId === studentUser.classId),
                filteredScheduleEvents: instScheduleEvents.filter(e => e.classId === studentUser.classId),
            };
        }
        
        if (currentRole === UserRole.Teacher) {
            const teacherUser = currentUser as Teacher;
            const teacherClassIds = new Set(teacherUser.classIds);
            const teacherSubjectIds = new Set(teacherUser.subjectIds);

            return {
                filteredBranches: instBranches,
                filteredClasses: instClasses.filter(c => teacherClassIds.has(c.id)),
                filteredStudents: instStudents.filter(s => s.classId && teacherClassIds.has(s.classId)),
                filteredTeachers: instTeachers.filter(t => t.id === teacherUser.id),
                filteredSubjects: instSubjects.filter(s => teacherSubjectIds.has(s.id)),
                filteredQuizzes: instQuizzes.filter(q => q.classId !== undefined && teacherClassIds.has(q.classId)),
                filteredFlashcardSets: instFlashcardSets.filter(fs => fs.classId !== undefined && teacherClassIds.has(fs.classId)),
                filteredStudyMaterials: instStudyMaterials.filter(sm => teacherClassIds.has(sm.classId)),
                filteredVideos: instVideos.filter(v => teacherClassIds.has(v.classId)),
                filteredUploadedDocuments: instUploadedDocuments.filter(ud => teacherClassIds.has(ud.classId)),
                filteredScheduleEvents: instScheduleEvents.filter(e => e.teacherId === teacherUser.id),
            };
        }
        
        if (currentRole === UserRole.Parent) {
            const parentUser = currentUser as Parent;
            const child = parentUser.child;
            if (!child) return { filteredBranches: [], filteredClasses: [], filteredStudents: [], filteredTeachers: [], filteredSubjects: [], filteredQuizzes: [], filteredFlashcardSets: [], filteredStudyMaterials: [], filteredVideos: [], filteredUploadedDocuments: [], filteredScheduleEvents: [] };
             return {
                filteredBranches: instBranches,
                filteredClasses: instClasses.filter(c => c.id === child.classId),
                filteredStudents: [child],
                filteredTeachers: instTeachers.filter(t => t.classIds.includes(child.classId)),
                filteredSubjects: instSubjects.filter(s => child.subjectIds.includes(s.id)),
                filteredQuizzes: instQuizzes.filter(q => q.classId === child.classId),
                filteredFlashcardSets: instFlashcardSets.filter(fs => fs.classId === child.classId),
                filteredStudyMaterials: instStudyMaterials.filter(sm => sm.classId === child.classId),
                filteredVideos: instVideos.filter(v => v.classId === child.classId),
                filteredUploadedDocuments: instUploadedDocuments.filter(ud => ud.classId === child.classId),
                filteredScheduleEvents: instScheduleEvents.filter(e => e.classId === child.classId),
            };
        }

        // For ClassAdmin, show all data for their institute.
        return {
            filteredBranches: instBranches, 
            filteredClasses: instClasses, 
            filteredStudents: instStudents,
            filteredTeachers: instTeachers,
            filteredSubjects: instSubjects,
            filteredQuizzes: instQuizzes,
            filteredFlashcardSets: instFlashcardSets,
            filteredStudyMaterials: instStudyMaterials,
            filteredVideos: instVideos,
            filteredUploadedDocuments: instUploadedDocuments,
            filteredScheduleEvents: instScheduleEvents,
        };
    }, [activeInstitute, currentRole, currentUser, branches, students, teachers, classes, subjects, quizzes, flashcardSets, studyMaterials, videos, uploadedDocuments, scheduleEvents]);


    // --- HOOKS ---
    // Persist data to localStorage whenever it changes
    useEffect(() => { saveToCloudStore('institutes', institutes); }, [institutes]);
    useEffect(() => { saveToCloudStore('branches', branches); }, [branches]);
    useEffect(() => { saveToCloudStore('users', users); }, [users]);
    useEffect(() => { saveToCloudStore('students', students); }, [students]);
    useEffect(() => { saveToCloudStore('teachers', teachers); }, [teachers]);
    useEffect(() => { saveToCloudStore('classes', classes); }, [classes]);
    useEffect(() => { saveToCloudStore('subjects', subjects); }, [subjects]);
    useEffect(() => { saveToCloudStore('quizzes', quizzes); }, [quizzes]);
    useEffect(() => { saveToCloudStore('flashcardSets', flashcardSets); }, [flashcardSets]);
    useEffect(() => { saveToCloudStore('studyMaterials', studyMaterials); }, [studyMaterials]);
    useEffect(() => { saveToCloudStore('videos', videos); }, [videos]);
    useEffect(() => { saveToCloudStore('uploadedDocuments', uploadedDocuments); }, [uploadedDocuments]);
    useEffect(() => { saveToCloudStore('quizSubmissions', quizSubmissions); }, [quizSubmissions]);
    useEffect(() => { saveToCloudStore('notes', notes); }, [notes]);
    useEffect(() => { saveToCloudStore('settings', settings); }, [settings]);
    useEffect(() => { saveToCloudStore('csvTemplates', csvTemplates); }, [csvTemplates]);
    useEffect(() => { saveToCloudStore('themeSettings', themeSettings); }, [themeSettings]);
    useEffect(() => { saveToCloudStore('attendance', attendance); }, [attendance]);
    useEffect(() => { saveToCloudStore('scheduleEvents', scheduleEvents); }, [scheduleEvents]);
    useEffect(() => { saveToCloudStore('leads', leads); }, [leads]);
    useEffect(() => { saveToCloudStore('reminders', reminders); }, [reminders]);
    useEffect(() => { saveToCloudStore('emailTemplates', emailTemplates); }, [emailTemplates]);
    useEffect(() => { saveToCloudStore('feeStructures', feeStructures); }, [feeStructures]);
    useEffect(() => { saveToCloudStore('discounts', discounts); }, [discounts]);
    useEffect(() => { saveToCloudStore('studentFeeProfiles', studentFeeProfiles); }, [studentFeeProfiles]);
    useEffect(() => { saveToCloudStore('feeReceipts', feeReceipts); }, [feeReceipts]);
    useEffect(() => { saveToCloudStore('linkedChildren', linkedChildren); }, [linkedChildren]);
    useEffect(() => { saveToCloudStore('personalAiConfigs', personalAiConfigs); }, [personalAiConfigs]);
    useEffect(() => { saveToCloudStore('savedAiContent', savedAiContent); }, [savedAiContent]);
    useEffect(() => { saveToCloudStore('activitySessions', activitySessions); }, [activitySessions]);
    useEffect(() => { saveToCloudStore('aiProgressReports', aiProgressReports); }, [aiProgressReports]);
    useEffect(() => { saveToCloudStore('parentPlans', parentPlans); }, [parentPlans]);
    useEffect(() => { saveToCloudStore('parentSubscriptions', parentSubscriptions); }, [parentSubscriptions]);
    useEffect(() => { saveToCloudStore('roleConfigs', roleConfigs); }, [roleConfigs]);
    useEffect(() => { saveToCloudStore('externalParents', externalParents); }, [externalParents]);
    useEffect(() => { saveToCloudStore('externalChildren', externalChildren); }, [externalChildren]);
    useEffect(() => { saveToCloudStore('externalStudents', externalStudents); }, [externalStudents]);
    useEffect(() => { saveToCloudStore('studentPlans', studentPlans); }, [studentPlans]);
    useEffect(() => { saveToCloudStore('studentSubscriptions', studentSubscriptions); }, [studentSubscriptions]);
    useEffect(() => { saveToCloudStore('studyChallenges', studyChallenges); }, [studyChallenges]);
    useEffect(() => { saveToCloudStore('challengeParticipations', challengeParticipations); }, [challengeParticipations]);
    useEffect(() => { saveToCloudStore('sharedContent', sharedContent); }, [sharedContent]);
    useEffect(() => { saveToCloudStore('gameChallenges', gameChallenges); }, [gameChallenges]);
    useEffect(() => { saveToCloudStore('challengeSubmissions', challengeSubmissions); }, [challengeSubmissions]);
    useEffect(() => { saveToCloudStore('googleAdCampaigns', googleAdCampaigns); }, [googleAdCampaigns]);
    useEffect(() => { saveToCloudStore('emailCampaigns', emailCampaigns); }, [emailCampaigns]);
    useEffect(() => { saveToCloudStore('socialPosts', socialPosts); }, [socialPosts]);
    useEffect(() => { saveToCloudStore('messages', messages); }, [messages]);
    useEffect(() => { saveToCloudStore('packages', packages); }, [packages]);
    
    // Auto-initialize teacher workspace context when user changes
    useEffect(() => {
        if (currentRole === UserRole.Teacher && currentUser) {
            const teacher = currentUser as Teacher;
            const firstClass = teacher.classIds?.[0];
            const firstSubject = teacher.subjectIds?.[0];

            if (firstClass && firstSubject) {
                // Set a default valid workspace if the current one is not valid for this teacher
                if (!teacher.classIds.includes(teacherWorkspace.classId) || !teacher.subjectIds.includes(teacherWorkspace.subjectId)) {
                    setTeacherWorkspace({
                        classId: firstClass,
                        subjectId: firstSubject,
                    });
                }
            } else {
                // Teacher has no classes/subjects, clear workspace
                setTeacherWorkspace({ classId: '', subjectId: '' });
            }
        }
    }, [currentUser, currentRole]);

    const assignFeeStructureToStudent = useCallback((studentId: string, feeStructureId: string) => {
        const structure = feeStructures.find(fs => fs.id === feeStructureId);
        if (!structure) return;

        const newProfile: StudentFeeProfile = {
            id: `sfp_${studentId}`,
            studentId,
            academicYear: structure.academicYear,
            feeStructureId,
            totalFee: structure.totalAmount,
            totalDiscount: 0,
            netPayable: structure.totalAmount,
            installments: [],
            appliedDiscounts: [],
        };
        
        setStudentFeeProfiles(prev => [...prev.filter(p => p.studentId !== studentId), newProfile]);
    }, [feeStructures]);

    // Auto-assign fee structure to students
    useEffect(() => {
        const studentIdsWithProfiles = new Set(studentFeeProfiles.map(p => p.studentId));
        students.forEach(student => {
            if (!studentIdsWithProfiles.has(student.id)) {
                const applicableStructure = feeStructures.find(fs => fs.classId === student.classId);
                if (applicableStructure) {
                    assignFeeStructureToStudent(student.id, applicableStructure.id);
                }
            }
        });
    }, [students, feeStructures, studentFeeProfiles, assignFeeStructureToStudent]);

    // --- FUNCTIONS ---
    // Auth & Impersonation
    const openWorkspaceAccessModal = useCallback(() => setWorkspaceAccessModalOpen(true), []);
    const closeWorkspaceAccessModal = useCallback(() => setWorkspaceAccessModalOpen(false), []);
    const openConnectEmailModal = useCallback(() => setConnectEmailModalOpen(true), []);
    const closeConnectEmailModal = useCallback(() => setConnectEmailModalOpen(false), []);

    const impersonateUser = useCallback((userToImpersonate: Student | Teacher) => {
        if (!originalUser) {
            setOriginalUser(currentUser as User);
        }
        setCurrentUser(userToImpersonate);
        setCurrentRole(userToImpersonate.role as UserRole);
        setActiveView('dashboard');
        closeWorkspaceAccessModal();
    }, [currentUser, originalUser, closeWorkspaceAccessModal]);

    const logout = useCallback(() => {
        localStorage.removeItem('eduveda_token');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveView('dashboard');
        setShowLoginPage(false);
        setOriginalUser(null);
    }, []);

    const exitImpersonation = useCallback(() => {
        if (originalUser) {
            setCurrentUser(originalUser);
            setCurrentRole(originalUser.role as UserRole);
            setOriginalUser(null);
            setActiveView('dashboard');
        } else {
            // Fallback to logout if not impersonating, just in case
            logout();
        }
    }, [originalUser, logout]);

    const switchRole = useCallback((role: UserRole) => {
        if (currentRole === role) {
            return; // No change needed
        }

        // Logic for starting impersonation
        if (role === UserRole.Student) {
            // Find a suitable student to impersonate. Filter by active institute if one is selected.
            const studentPool = activeInstituteId ? students.filter(s => s.instituteId === activeInstituteId) : students;
            const studentToImpersonate = studentPool.find(s => s.status === 'active');
            if (studentToImpersonate) {
                impersonateUser(studentToImpersonate);
            } else {
                console.warn("No active student found to switch to.");
            }
        } else if (role === UserRole.Teacher) {
            // Find a suitable teacher to impersonate. Filter by active institute if one is selected.
            const teacherPool = activeInstituteId ? teachers.filter(t => t.instituteId === activeInstituteId) : teachers;
            const teacherToImpersonate = teacherPool.find(t => t.status === 'active');
            if (teacherToImpersonate) {
                impersonateUser(teacherToImpersonate);
            } else {
                console.warn("No active teacher found to switch to.");
            }
        }
    }, [originalUser, currentRole, students, teachers, impersonateUser, activeInstituteId]);
    
    const login = useCallback(async (instituteName: string, loginIdentifier: string, password?: string): Promise<boolean> => {
        // ── 1. Try real backend authentication (requires password) ──────────
        if (password && loginIdentifier.includes('@')) {
            try {
                const res = await fetch(`${PYTHON_API}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: loginIdentifier, password }),
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('eduveda_token', data.access_token);
                    const u = data.user;
                    const backendUser: any = {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        mobile: u.mobile || '',
                        role: u.role as UserRole,
                        status: 'active' as const,
                        instituteId: u.institute_id || u.instituteId,
                    };
                    setCurrentUser(backendUser);
                    setCurrentRole(backendUser.role);
                    setActiveInstituteId(backendUser.instituteId);
                    setIsAuthenticated(true);
                    setActiveView('dashboard');
                    setShowLoginPage(false);
                    setOriginalUser(null);
                    if (backendUser.instituteId) hydrateInstituteData(backendUser.instituteId);
                    return true;
                }
            } catch (_) {
                // Backend unavailable — fall through to demo mode
            }
        }

        // ── 2. Demo / localStorage fallback ────────────────────────────────
        const identifier = loginIdentifier.toLowerCase().trim();
        const instName = instituteName.trim().toLowerCase();

        const institute = institutes.find(i => i.name.toLowerCase() === instName);
        if (!institute) return false;
        const instituteId = institute.id;

        let foundUser: User | Teacher | Student | Parent | null = null;

        foundUser = users.find(u =>
            u.instituteId === instituteId && (u.email.toLowerCase() === identifier || u.mobile === identifier)
        ) || null;

        if (!foundUser) {
            foundUser = teachers.find(t =>
                t.instituteId === instituteId && (t.email.toLowerCase() === identifier || t.mobile === identifier)
            ) || null;
        }

        if (!foundUser) {
            foundUser = students.find(s =>
                s.instituteId === instituteId && (s.email.toLowerCase() === identifier || s.mobile === identifier)
            ) || null;
        }

        if (!foundUser) {
            const studentForParent = students.find(s =>
                s.instituteId === instituteId && (s.parentEmail.toLowerCase() === identifier || s.parentMobile === identifier)
            );
            if (studentForParent) {
                foundUser = {
                    id: `parent_${studentForParent.id}`,
                    name: studentForParent.parentName,
                    email: studentForParent.parentEmail,
                    mobile: studentForParent.parentMobile,
                    role: UserRole.Parent,
                    studentId: studentForParent.id,
                    instituteId: studentForParent.instituteId,
                    child: studentForParent,
                };
            }
        }

        if (foundUser) {
            setCurrentUser(foundUser);
            setCurrentRole(foundUser.role as UserRole);
            setActiveInstituteId(instituteId);
            setIsAuthenticated(true);
            setActiveView('dashboard');
            setShowLoginPage(false);
            setOriginalUser(null);
            return true;
        }

        return false;
    // Note: hydrateInstituteData is intentionally NOT in this dependency
    // array — it's declared later in this file, so including it here would
    // evaluate a temporal-dead-zone reference on every render and crash.
    // It's referenced inside the function body only, which is safe: by the
    // time `login` is actually invoked (a user action), hydrateInstituteData
    // has already been initialized during the render pass, and its own
    // deps array is `[]` so its identity never changes anyway.
    }, [institutes, users, teachers, students]);
    
    // ── External login (completely separate from institute system) ───────────
    // ── External auth now calls the real FastAPI backend (bcrypt + JWT) ──────
    // instead of comparing plaintext passwords in the browser. The returned
    // profile is mirrored into local state so already-built UI (Role Manager
    // subscriber counts, child management, etc.) keeps working unchanged —
    // those data flows move to the backend in a later phase.
    const mapExternalParentFromApi = (u: any): ExternalParent => ({
        id: u.id, name: u.name, email: u.email, password: '', mobile: u.mobile,
        role: UserRole.ExternalParent, city: u.city ?? undefined,
        createdAt: (u.created_at ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
        isActive: u.status !== 'inactive',
        planId: u.plan_id ?? undefined,
        subscriptionStatus: (u.subscription_status ?? 'none') as ExternalParent['subscriptionStatus'],
        subscriptionExpiry: u.subscription_expiry ?? undefined,
    });

    const mapExternalStudentFromApi = (u: any): ExternalStudent => ({
        id: u.id, name: u.name, email: u.email, password: '', mobile: u.mobile ?? undefined,
        role: UserRole.ExternalStudent, grade: u.grade, age: u.age,
        subjectsOfInterest: u.subjects_of_interest ?? [],
        schoolName: u.school_name ?? undefined, city: u.city ?? undefined,
        createdAt: (u.created_at ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
        isActive: u.status !== 'inactive',
        linkedParentId: u.linked_parent_id ?? undefined,
        planId: u.plan_id ?? undefined,
        subscriptionStatus: (u.subscription_status ?? 'none') as ExternalStudent['subscriptionStatus'],
        subscriptionExpiry: u.subscription_expiry ?? undefined,
    });

    const mapChildFromApi = (c: any): ExternalChildProfile => ({
        id: c.id, parentId: c.parent_id, name: c.name, grade: c.grade, age: c.age,
        subjectsOfInterest: c.subjects_of_interest ?? [], schoolName: c.school_name ?? undefined,
        city: c.city ?? undefined, linkedExternalStudentId: c.linked_external_student_id ?? undefined,
        createdAt: (c.created_at ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
        avatar: c.avatar ?? undefined,
    });

    const mapAiConfigFromApi = (c: any): PersonalAiConfig => ({
        id: c.id, ownerId: c.owner_id, ownerRole: c.owner_role,
        activeProvider: c.active_provider, geminiApiKey: c.gemini_api_key ?? undefined,
        openaiApiKey: c.openai_api_key ?? undefined, anthropicApiKey: c.anthropic_api_key ?? undefined,
        groqApiKey: c.groq_api_key ?? undefined, customApiKey: c.custom_api_key ?? undefined,
        customApiUrl: c.custom_api_url ?? undefined, customModelName: c.custom_model_name ?? undefined,
        createdAt: c.created_at, updatedAt: c.updated_at,
    });

    const mapAiContentFromApi = (c: any): SavedAiContent => ({
        id: c.id, ownerId: c.owner_id, ownerRole: 'Student', contentType: c.content_type,
        title: c.title, topic: c.topic, subjectName: c.subject_name, className: c.class_name,
        content: c.content, generatedAt: (c.generated_at ?? '').split('T')[0] || c.generated_at,
        isSharedWithParent: c.is_shared_with_parent, aiProvider: c.ai_provider,
    });

    // Best-effort hydration from the backend after login/register — replaces
    // matching local entries if the backend is reachable, otherwise the
    // existing localStorage cache (seed data or prior session) is left as-is.
    const hydrateExternalData = useCallback(async (ownerId: string, kind: 'parent' | 'student') => {
        if (kind === 'parent') {
            const children = await apiListChildren();
            if (children) setExternalChildren(prev => [...prev.filter(c => c.parentId !== ownerId), ...children.map(mapChildFromApi)]);
        } else {
            const content = await apiListAiContent();
            if (content) setSavedAiContent(prev => [...prev.filter(c => c.ownerId !== ownerId), ...content.map(mapAiContentFromApi)]);
        }
        const config = await apiGetAiConfig();
        if (config) setPersonalAiConfigs(prev => [...prev.filter(c => c.ownerId !== ownerId), mapAiConfigFromApi(config)]);
    }, []);

    // Best-effort hydration of core institute data after a real (non-demo)
    // institute login — replaces matching local entries if the backend is
    // reachable, otherwise the existing localStorage cache (seed data or
    // prior session) is left as-is. Mirrors hydrateExternalData's pattern.
    const hydrateInstituteData = useCallback(async (instituteId: string) => {
        const [
            branchesRes, studentsRes, teachersRes, classesRes, subjectsRes,
            leadsRes, feeStructuresRes, discountsRes, emailTemplatesRes, feeProfilesRes,
        ] = await Promise.all([
            apiListInstituteRecords('branches', instituteId),
            apiListInstituteRecords('students', instituteId),
            apiListInstituteRecords('teachers', instituteId),
            apiListInstituteRecords('classes', instituteId),
            apiListInstituteRecords('subjects', instituteId),
            apiListInstituteRecords('leads', instituteId),
            apiListFeeStructures(instituteId),
            apiListDiscounts(instituteId),
            apiListEmailTemplates(instituteId),
            apiListFeeProfiles(instituteId),
        ]);

        if (branchesRes) setBranches(prev => [...prev.filter(b => b.instituteId !== instituteId), ...branchesRes.map((b: any): Branch => ({
            id: b.id, name: b.name, location: b.location, head: b.head, instituteId: b.institute_id,
        }))]);
        if (studentsRes) setStudents(prev => [...prev.filter(s => s.instituteId !== instituteId), ...studentsRes.map((s: any): Student => ({
            id: s.id, name: s.name, email: s.email, mobile: s.mobile, classId: s.class_id ?? '',
            branchIds: s.branch_ids ?? [], subjectIds: s.subject_ids ?? [], status: s.status,
            parentName: s.parent_name ?? '', parentEmail: s.parent_email ?? '', parentMobile: s.parent_mobile ?? '',
            role: UserRole.Student, instituteId: s.institute_id ?? instituteId,
        }))]);
        if (teachersRes) setTeachers(prev => [...prev.filter(t => t.instituteId !== instituteId), ...teachersRes.map((t: any): Teacher => ({
            id: t.id, name: t.name, email: t.email, mobile: t.mobile,
            subjectIds: t.subject_ids ?? [], classIds: t.class_ids ?? [], branchIds: t.branch_ids ?? [],
            status: t.status, role: UserRole.Teacher, instituteId: instituteId,
        }))]);
        if (classesRes) setClasses(prev => [...prev.filter(c => c.instituteId !== instituteId), ...classesRes.map((c: any): AcademicClass => ({
            id: c.id, name: c.name, teacherIds: c.teacher_ids ?? [], studentIds: c.student_ids ?? [], instituteId: c.institute_id,
        }))]);
        if (subjectsRes) setSubjects(prev => [...prev.filter(s => s.instituteId !== instituteId), ...subjectsRes.map((s: any): Subject => ({
            id: s.id, name: s.name, category: s.category, instituteId: s.institute_id,
        }))]);

        // Lead type has no instituteId field, so replace all rather than filtering by institute.
        // Single-institute-per-session makes this safe.
        if (leadsRes) setLeads(leadsRes.map((l: any): Lead => ({
            id: l.id, name: l.name, email: l.email, mobile: l.mobile,
            source: l.source, status: l.status as LeadStatus,
            addedDate: l.added_date ?? l.created_at ?? new Date().toISOString(),
        })));

        if (feeStructuresRes) setFeeStructures(prev => [
            ...prev.filter(fs => fs.instituteId !== instituteId),
            ...feeStructuresRes.map((fs: any): FeeStructure => ({
                id: fs.id, name: fs.name, academicYear: fs.academic_year,
                totalAmount: fs.total_amount, classId: fs.class_id, branchId: fs.branch_id,
                paymentMode: fs.payment_mode as 'Lumpsum' | 'Installments',
                lateFeePerDay: fs.late_fee_per_day ?? 0,
                installments: (fs.fee_structure_installments ?? []).map((i: any): FeeStructureInstallment => ({
                    name: i.name, percentage: i.percentage, dueDate: i.due_date,
                })),
                instituteId: fs.institute_id,
            })),
        ]);

        if (discountsRes) setDiscounts(prev => [
            ...prev.filter(d => d.instituteId !== instituteId),
            ...discountsRes.map((d: any): Discount => ({
                id: d.id, name: d.name, type: d.type as 'Percentage' | 'Fixed Amount', value: d.value,
                instituteId: d.institute_id,
            })),
        ]);

        // EmailTemplate has no instituteId field — replace all (single-institute-per-session).
        if (emailTemplatesRes) setEmailTemplates(emailTemplatesRes.map((et: any): EmailTemplate => ({
            id: et.id, name: et.name, subject: et.subject, body: et.body,
            statusTarget: et.status_target as LeadStatus | 'General',
        })));

        // Fee profiles include nested installments and applied discounts.
        // Replacing them with real backend UUIDs means subsequent recordPayment calls
        // use real foreign keys without needing a separate ID-lookup step.
        // StudentFeeProfile has no instituteId field — replace all (single-institute-per-session).
        if (feeProfilesRes) setStudentFeeProfiles(feeProfilesRes.map((fp: any): StudentFeeProfile => ({
            id: fp.id,
            studentId: fp.student_id,
            academicYear: fp.academic_year,
            feeStructureId: fp.fee_structure_id ?? null,
            totalFee: fp.total_fee,
            totalDiscount: fp.total_discount ?? 0,
            netPayable: fp.net_payable,
            installments: (fp.student_installments ?? []).map((i: any): Installment => ({
                id: i.id,
                installmentNumber: i.installment_number,
                dueDate: i.due_date,
                amountDue: i.amount_due,
                amountPaid: i.amount_paid ?? 0,
                lateFeeApplied: i.late_fee_applied ?? 0,
                status: i.status as Installment['status'],
                paymentDate: i.payment_date ?? undefined,
                receiptId: i.receipt_id ?? undefined,
            })),
            appliedDiscounts: (fp.student_applied_discounts ?? []).map((d: any) => ({
                discountId: d.discount_id,
                name: d.name,
                appliedAmount: d.applied_amount,
            })),
        })));
    }, []);

    const loginExternal = useCallback(async (email: string, password: string): Promise<'parent' | 'student' | false> => {
        try {
            const payload = JSON.stringify({ email, password });
            const doFetch = () => fetch(`${PYTHON_API}/api/external/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
            });
            let res: Response | undefined;
            for (let attempt = 0; attempt < 3; attempt++) {
                try { res = await doFetch(); break; }
                catch { if (attempt < 2) await new Promise(r => setTimeout(r, 15000)); }
            }
            if (!res) return false;
            if (!res.ok) return false;
            const data = await res.json();
            localStorage.setItem('eduveda_token', data.access_token);

            if (data.account_type === 'parent') {
                const ep = mapExternalParentFromApi(data.user);
                setExternalParents(prev => prev.some(p => p.id === ep.id) ? prev.map(p => p.id === ep.id ? ep : p) : [...prev, ep]);
                setExternalParentSession(ep);
                setExternalStudentSession(null);
                setCurrentUser({ id: ep.id, name: ep.name, email: ep.email, mobile: ep.mobile, role: ep.role, status: 'active' as const, instituteId: '' });
                setCurrentRole(UserRole.ExternalParent);
                setActiveInstituteId(null);
                setIsAuthenticated(true);
                setActiveView('dashboard');
                setShowLoginPage(false);
                hydrateExternalData(ep.id, 'parent');
                return 'parent';
            }
            const es = mapExternalStudentFromApi(data.user);
            setExternalStudents(prev => prev.some(s => s.id === es.id) ? prev.map(s => s.id === es.id ? es : s) : [...prev, es]);
            setExternalStudentSession(es);
            setExternalParentSession(null);
            setCurrentUser({ id: es.id, name: es.name, email: es.email, mobile: es.mobile || '', role: es.role, status: 'active' as const, instituteId: '' });
            setCurrentRole(UserRole.ExternalStudent);
            setActiveInstituteId(null);
            setIsAuthenticated(true);
            setActiveView('dashboard');
            setShowLoginPage(false);
            hydrateExternalData(es.id, 'student');
            return 'student';
        } catch {
            return false; // backend unreachable — no plaintext local fallback for external roles
        }
    }, [hydrateExternalData]);

    const registerExternalParent = useCallback(async (data: { name: string; email: string; password: string; mobile: string; city?: string }): Promise<boolean> => {
        const rc = roleConfigs.find(rc => rc.role === UserRole.ExternalParent);
        if (!rc?.isActive || !rc?.registrationOpen) return false;
        try {
            const payload = JSON.stringify({ name: data.name, email: data.email, password: data.password, mobile: data.mobile, city: data.city });
            const doFetch = () => fetch(`${PYTHON_API}/api/external/parent/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
            });
            // Retry up to 3 times with 15s gaps — covers Render's 30-60s cold start
            let res: Response | undefined;
            for (let attempt = 0; attempt < 3; attempt++) {
                try { res = await doFetch(); break; }
                catch { if (attempt < 2) await new Promise(r => setTimeout(r, 15000)); }
            }
            if (!res) throw new Error('Server is starting up — please wait a moment and try again.');
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || 'Registration failed. Please try again.');
            }
            const resp = await res.json();
            localStorage.setItem('eduveda_token', resp.access_token);
            const ep = mapExternalParentFromApi(resp.user);
            setExternalParents(prev => [...prev, ep]);
            setExternalParentSession(ep);
            setExternalStudentSession(null);
            setCurrentUser({ id: ep.id, name: ep.name, email: ep.email, mobile: ep.mobile, role: ep.role, status: 'active' as const, instituteId: '' });
            setCurrentRole(UserRole.ExternalParent);
            setActiveInstituteId(null);
            setIsAuthenticated(true);
            setActiveView('dashboard');
            setShowLoginPage(false);
            return true;
        } catch (e) {
            throw e;
        }
    }, [roleConfigs]);

    const registerExternalStudent = useCallback(async (data: { name: string; email: string; password: string; mobile?: string; grade: string; age: number; subjectsOfInterest: string[]; schoolName?: string; city?: string }): Promise<boolean> => {
        const rc = roleConfigs.find(rc => rc.role === UserRole.ExternalStudent);
        if (!rc?.isActive || !rc?.registrationOpen) return false;
        try {
            const payload = JSON.stringify({
                name: data.name, email: data.email, password: data.password, mobile: data.mobile,
                grade: data.grade, age: data.age, subjects_of_interest: data.subjectsOfInterest,
                school_name: data.schoolName, city: data.city,
            });
            const doFetch = () => fetch(`${PYTHON_API}/api/external/student/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
            });
            // Retry up to 3 times with 15s gaps — covers Render's 30-60s cold start
            let res: Response | undefined;
            for (let attempt = 0; attempt < 3; attempt++) {
                try { res = await doFetch(); break; }
                catch { if (attempt < 2) await new Promise(r => setTimeout(r, 15000)); }
            }
            if (!res) throw new Error('Server is starting up — please wait a moment and try again.');
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || 'Registration failed. Please try again.');
            }
            const resp = await res.json();
            localStorage.setItem('eduveda_token', resp.access_token);
            const es = mapExternalStudentFromApi(resp.user);
            setExternalStudents(prev => [...prev, es]);
            setExternalStudentSession(es);
            setExternalParentSession(null);
            setCurrentUser({ id: es.id, name: es.name, email: es.email, mobile: es.mobile || '', role: es.role, status: 'active' as const, instituteId: '' });
            setCurrentRole(UserRole.ExternalStudent);
            setActiveInstituteId(null);
            setIsAuthenticated(true);
            setActiveView('dashboard');
            setShowLoginPage(false);
            return true;
        } catch (e) {
            throw e;
        }
    }, [roleConfigs]);

    const loginAsProductOwner = useCallback(() => {
        const po = users.find(u => u.role === UserRole.ProductOwner);
        if (po) {
            setCurrentUser(po);
            setCurrentRole(UserRole.ProductOwner);
            setActiveInstituteId(null);
            setIsAuthenticated(true);
            setActiveView('dashboard');
            setOriginalUser(null);
        }
    }, [users]);

    const connectEmail = useCallback(() => {
        if (!currentUser) return;
    
        const updatedUser = { ...currentUser, connectedEmail: currentUser.email };
        setCurrentUser(updatedUser);
    
        if (currentUser.role === UserRole.Student) {
            setStudents(prev => prev.map(s => s.id === currentUser.id ? { ...s, connectedEmail: currentUser.email } : s));
        } else if (currentUser.role === UserRole.Teacher) {
            setTeachers(prev => prev.map(t => t.id === currentUser.id ? { ...t, connectedEmail: currentUser.email } : t));
        } else {
            setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, connectedEmail: currentUser.email } : u));
        }
    }, [currentUser]);
    
    const disconnectEmail = useCallback(() => {
        if (!currentUser) return;
        
        const { connectedEmail, ...restOfUser } = currentUser as any;
        setCurrentUser(restOfUser);
    
        if (currentUser.role === UserRole.Student) {
            setStudents(prev => prev.map(s => {
                if (s.id === currentUser.id) {
                    const { connectedEmail, ...rest } = s as Student & { connectedEmail?: string };
                    return rest;
                }
                return s;
            }));
        } else if (currentUser.role === UserRole.Teacher) {
            setTeachers(prev => prev.map(t => {
                if (t.id === currentUser.id) {
                    const { connectedEmail, ...rest } = t as Teacher & { connectedEmail?: string };
                    return rest;
                }
                return t;
            }));
        } else {
            setUsers(prev => prev.map(u => {
                if (u.id === currentUser.id) {
                    const { connectedEmail, ...rest } = u as User & { connectedEmail?: string };
                    return rest;
                }
                return u;
            }));
        }
    }, [currentUser]);

    // UI
    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const getViewLabel = useCallback((viewKey: string) => {
        const navLink = NAV_LINKS[currentRole]?.find(link => link.key === viewKey);
        if (navLink) return navLink.label;
        if (viewKey === 'take-quiz') return 'Take Quiz';
        if (viewKey === 'quiz-result') return 'Quiz Result';
        if (viewKey === 'study-flashcards') return 'Study Flashcards';
        return 'Dashboard';
    }, [currentRole]);

    // Settings
    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({...prev, ...newSettings}));
    }, []);

    // Theme
    const updateTheme = useCallback((newTheme: Partial<ThemeSettings>) => {
        setThemeSettings(prev => {
            const merged = { ...prev, ...newTheme };
            applyThemeToDom(merged);
            return merged;
        });
    }, []);
    const resetTheme = useCallback(() => {
        const t: ThemeSettings = {
            primaryColor: '#4f46e5', primaryHover: '#4338ca', primaryLight: '#eef2ff',
            sidebarFrom: '#1e1b4b', sidebarTo: '#312e81',
            headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter',
            borderRadius: '0.875rem', surface: '#ffffff', surface3: '#f1f5f9',
            textPrimary: '#0f172a', borderColor: '#e2e8f0',
        };
        setThemeSettings(t);
        applyThemeToDom(t);
    }, []);

    const updateCsvTemplate = useCallback((category: string, newTemplate: string) => {
        setCsvTemplates(prev => ({ ...prev, [category]: newTemplate }));
    }, []);
    
    // Subscriptions
    const addPackage = useCallback((pkg: SubscriptionPackage) => {
        setPackages(prev => [...prev, pkg]);
    }, []);
    
    // Data Management
    const dataStores: { [key in ContextSource]: [any[], React.Dispatch<React.SetStateAction<any[]>>] } = useMemo(() => ({
        institutes: [institutes, setInstitutes],
        branches: [branches, setBranches],
        users: [users, setUsers],
        students: [students, setStudents],
        teachers: [teachers, setTeachers],
        classes: [classes, setClasses],
        subjects: [subjects, setSubjects],
        leads: [leads, setLeads],
        discounts: [discounts, setDiscounts],
        feeStructures: [feeStructures, setFeeStructures],
        packages: [packages, setPackages],
        addons: [addons, setAddons],
    }), [institutes, branches, users, students, teachers, classes, subjects, leads, discounts, feeStructures, packages, addons]);

    const getData = useCallback((category: ContextSource) => {
        return dataStores[category] ? dataStores[category][0] : [];
    }, [dataStores]);

    const getContextData = useCallback((source: string, id: string) => {
        const data = getData(source as ContextSource);
        return data.find(item => item.id === id);
    }, [getData]);

    const addRecord = useCallback((category: ManagementCategory, record: any) => {
        if (category === 'institutes') {
            const newInstituteId = `inst_${Date.now()}`;
            const newInstitute: Institute = {
                ...record,
                id: newInstituteId,
                subscriptionStatus: 'active',
            };
            const newAdminUser: User = {
                id: `user_${Date.now()}`,
                name: `${record.name} Admin`,
                email: record.adminEmail,
                mobile: record.adminMobile,
                role: UserRole.ClassAdmin,
                status: 'active',
                instituteId: newInstituteId,
                branchIds: [],
            };
            setInstitutes(prev => [...prev, newInstitute]);
            setUsers(prev => [...prev, newAdminUser]);
            return;
        }

        const [, setStore] = dataStores[category as ContextSource];

        if (category === 'students') {
            if (students.length >= currentSubscription.maxStudents) {
                alert(`Cannot add new student. The license limit of ${currentSubscription.maxStudents} has been reached.`);
                return;
            }
        }

        const roleData: Partial<{ role: UserRole }> = {};
        if (category === 'students') {
            roleData.role = UserRole.Student;
        } else if (category === 'teachers') {
            roleData.role = UserRole.Teacher;
        }

        const newRecord = {
            ...record,
            ...roleData,
            id: `${category.slice(0, 3)}_${Date.now()}`,
            status: 'active' as Status,
            instituteId: activeInstitute?.id,
        };
        setStore(prevStore => [...prevStore, newRecord]);

        // Best-effort backend sync — local state above already updated.
        if (isSyncableCategory(category) && activeInstitute?.id) {
            apiCreateInstituteRecord(category, newRecord, activeInstitute.id);
        } else if (category === 'feeStructures' && activeInstitute?.id) {
            apiCreateFeeStructure(newRecord, activeInstitute.id);
        } else if (category === 'discounts' && activeInstitute?.id) {
            apiCreateDiscount(newRecord, activeInstitute.id);
        }
    }, [dataStores, activeInstitute, students.length, currentSubscription, setInstitutes, setUsers]);

    const addBulkRecords = useCallback((category: ManagementCategory, data: any[]) => {
        if (category === 'institutes') {
            const newInstitutes: Institute[] = [];
            const newAdmins: User[] = [];
            data.forEach(record => {
                if (!record.name || !record.adminEmail || !record.adminMobile) {
                    console.warn("Skipping institute record due to missing required fields:", record);
                    return;
                }
                const newInstituteId = `inst_${Date.now()}_${Math.random()}`;
                const newInstitute: Institute = {
                    ...record,
                    id: newInstituteId,
                    packageId: record.packageId || null,
                    activeAddonIds: record.activeAddonIds || [],
                    subscriptionStatus: 'active', // Default to active
                    subscriptionExpiry: record.subscriptionExpiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                };
                const newAdminUser: User = {
                    id: `user_${Date.now()}_${Math.random()}`,
                    name: `${record.name} Admin`,
                    email: record.adminEmail,
                    mobile: record.adminMobile,
                    role: UserRole.ClassAdmin,
                    status: 'active',
                    instituteId: newInstituteId,
                    branchIds: [],
                };
                newInstitutes.push(newInstitute);
                newAdmins.push(newAdminUser);
            });
            setInstitutes(prev => [...prev, ...newInstitutes]);
            setUsers(prev => [...prev, ...newAdmins]);
            return;
        }
    
        const [, setStore] = dataStores[category as ContextSource];
        setStore(prevStore => {
            const roleData: Partial<{ role: UserRole }> = {};
            if (category === 'students') {
                roleData.role = UserRole.Student;
            } else if (category === 'teachers') {
                roleData.role = UserRole.Teacher;
            }
            const newRecords = data.map(record => ({
                ...record,
                ...roleData,
                id: `${category.slice(0, 3)}_${Date.now()}_${Math.random()}`,
                status: 'active' as Status,
                instituteId: activeInstitute?.id,
            }));
            return [...prevStore, ...newRecords];
        });
    }, [dataStores, activeInstitute, setInstitutes, setUsers]);

    const updateRecord = useCallback((category: ManagementCategory, id: string, updatedRecord: any) => {
        const [, setStore] = dataStores[category as ContextSource];
        setStore(prevStore => prevStore.map(item => item.id === id ? { ...item, ...updatedRecord } : item));

        // Best-effort backend sync — local state above already updated.
        // (Records created locally this session and not yet hydrated with a
        // real backend UUID will fail soft here — same known limitation as
        // Phase 2a's external data sync.)
        if (isSyncableCategory(category)) {
            apiUpdateInstituteRecord(category, id, updatedRecord);
        }
    }, [dataStores]);

    const deleteRecord = useCallback((category: ManagementCategory, id: string) => {
        const [, setStore] = dataStores[category as ContextSource];
        setStore(prevStore => prevStore.filter(item => item.id !== id));

        if (isSyncableCategory(category)) {
            apiDeleteInstituteRecord(category, id);
        } else if (category === 'feeStructures') {
            apiDeleteFeeStructure(id);
        } else if (category === 'discounts') {
            apiDeleteDiscount(id);
        }
    }, [dataStores]);
    
    // LMS & Library
    const addQuiz = useCallback((quiz: Omit<Quiz, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'> & { topic: string }) => {
        const newQuiz: Quiz = {
            ...quiz,
            id: `quiz_${Date.now()}`,
            ownerId: currentUser?.id || 'unknown',
            classId: teacherWorkspace.classId,
            subjectId: teacherWorkspace.subjectId,
            instituteId: activeInstitute?.id || '',
        }
        setQuizzes(prev => [...prev, newQuiz]);
    }, [currentUser, teacherWorkspace, activeInstitute]);

    const addFlashcardSet = useCallback((set: Omit<FlashcardSet, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'> & { topic: string }) => {
        const newSet: FlashcardSet = {
            ...set,
            id: `fc_${Date.now()}`,
            ownerId: currentUser?.id || 'unknown',
            classId: teacherWorkspace.classId,
            subjectId: teacherWorkspace.subjectId,
            instituteId: activeInstitute?.id || '',
        };
        setFlashcardSets(prev => [...prev, newSet]);
    }, [currentUser, teacherWorkspace, activeInstitute]);

     const addStudyMaterial = useCallback((material: Omit<StudyMaterial, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'createdBy' | 'instituteId'>) => {
        const newMaterial: StudyMaterial = {
            ...material,
            id: `sm_${Date.now()}`,
            ownerId: currentUser?.id || 'unknown',
            classId: teacherWorkspace.classId,
            subjectId: teacherWorkspace.subjectId,
            instituteId: activeInstitute?.id || '',
            createdBy: currentRole === UserRole.Student ? 'student' : 'teacher',
        };
        setStudyMaterials(prev => [...prev, newMaterial]);
    }, [currentUser, teacherWorkspace, currentRole, activeInstitute]);

    const addVideo = useCallback((video: Omit<Video, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'>) => {
        const newVideo: Video = {
            ...video,
            id: `vid_${Date.now()}`,
            ownerId: currentUser?.id || 'unknown',
            classId: teacherWorkspace.classId,
            subjectId: teacherWorkspace.subjectId,
            instituteId: activeInstitute?.id || '',
        };
        setVideos(prev => [...prev, newVideo]);
    }, [currentUser, teacherWorkspace, activeInstitute]);

     const addUploadedDocument = useCallback((doc: Omit<UploadedDocument, 'id' | 'ownerId' | 'classId' | 'subjectId' | 'instituteId'>) => {
        const newDoc: UploadedDocument = {
            ...doc,
            id: `doc_${Date.now()}`,
            ownerId: currentUser?.id || 'unknown',
            classId: teacherWorkspace.classId,
            subjectId: teacherWorkspace.subjectId,
            instituteId: activeInstitute?.id || '',
        };
        setUploadedDocuments(prev => [...prev, newDoc]);
    }, [currentUser, teacherWorkspace, activeInstitute]);

    // Quiz Flow
    const startQuiz = useCallback((quiz: Quiz) => { setActiveQuiz(quiz); setActiveView('take-quiz'); }, []);
    
    const submitQuiz = useCallback((newSubmission: Omit<QuizSubmission, 'studentId'>) => {
        const fullSubmission = { ...newSubmission, studentId: currentUser!.id };
        setQuizSubmissions(prev => [...prev, fullSubmission]);
        setSubmission(fullSubmission);
        setActiveQuiz(null);
        setActiveView('quiz-result');
    }, [currentUser]);
    
    const clearSubmission = useCallback(() => { setSubmission(null); setActiveView('dashboard'); }, []);
    
    // Study Flow
    const studyFlashcardSet = useCallback((set: FlashcardSet) => { setActiveFlashcardSet(set); setActiveView('study-flashcards'); }, []);
    const viewStudyMaterial = useCallback((material: StudyMaterial) => { setActiveStudyMaterial(material); setActiveView('view-study-material'); }, []);
    const clearStudyView = useCallback(() => { setActiveFlashcardSet(null); setActiveStudyMaterial(null); setActiveView('dashboard'); }, []);
    const openAiVideoFinder = useCallback(() => setAiVideoFinderOpen(true), []);
    const closeAiVideoFinder = useCallback(() => setAiVideoFinderOpen(false), []);
    const playVideo = useCallback((video: Video) => setPlayingVideo(video), []);
    const closeVideoPlayer = useCallback(() => setPlayingVideo(null), []);

    // Note Taking
    const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'studentId'>) => {
        const newNote: Note = {
            ...note,
            id: `note_${Date.now()}`,
            studentId: currentUser!.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setNotes(prev => [...prev, newNote]);
    }, [currentUser]);

    const updateNote = useCallback((noteId: string, updates: Partial<Omit<Note, 'id' | 'studentId' | 'createdAt'>>) => {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    }, []);

    const deleteNote = useCallback((noteId: string) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
    }, []);

    const startNewNote = useCallback(() => { setEditingNote(null); setActiveView('note-editor'); }, []);
    const editNote = useCallback((note: Note) => { setEditingNote(note); setActiveView('note-editor'); }, []);
    const closeNoteEditor = useCallback(() => { setEditingNote(null); setActiveView('my-notes'); }, []);

    // Password Reset
    const openForgotPasswordModal = useCallback(() => setForgotPasswordModalOpen(true), []);
    const closeForgotPasswordModal = useCallback(() => setForgotPasswordModalOpen(false), []);
    const requestPasswordReset = useCallback(async (identifier: string): Promise<boolean> => {
        try {
            await apiForgotPassword(identifier);
        } catch {
            // Always return true — backend also always returns 202 to prevent enumeration
        }
        return true;
    }, []);
    
    // Attendance
    const updateAttendance = useCallback((studentId: string, subjectId: string, date: string, status: 'Present' | 'Absent' | 'Late') => {
        setAttendance(prev => {
            const existingRecordIndex = prev.findIndex(a => a.studentId === studentId && a.date === date && a.subjectId === subjectId);
            if (existingRecordIndex > -1) {
                const newAttendance = [...prev];
                newAttendance[existingRecordIndex] = { ...newAttendance[existingRecordIndex], status };
                return newAttendance;
            } else {
                return [...prev, { studentId, subjectId, date, status }];
            }
        });
    }, []);
    
    const addBulkAttendance = useCallback((records: Omit<AttendanceRecord, 'id'>[]) => {
        setAttendance(prev => {
            const attendanceMap = new Map<string, AttendanceRecord>();
            // Populate map with existing records
            prev.forEach(rec => {
                const key = `${rec.studentId}-${rec.subjectId}-${rec.date}`;
                attendanceMap.set(key, rec);
            });

            // Update map with new records (upsert)
            records.forEach(newRecord => {
                const key = `${newRecord.studentId}-${newRecord.subjectId}-${newRecord.date}`;
                attendanceMap.set(key, newRecord);
            });
            
            return Array.from(attendanceMap.values());
        });
    }, []);

    // Scheduler
    const generateScheduleFromAI = useCallback(async (rules: AiSchedulerRule[], forClassId: string) => {
        setIsAiScheduling(true);
        try {
            const forClass = classes.find(c => c.id === forClassId);
            if (!forClass) throw new Error("Class not found");

            const relevantTeachers = teachers.filter(t => t.classIds.includes(forClassId));
            const generatedEvents = await generateSchedule([forClass], relevantTeachers, subjects, rules);
            
            if(generatedEvents) {
                const newEventsWithIds = generatedEvents.map(e => ({...e, id: `sch_${Date.now()}_${Math.random()}`, instituteId: activeInstitute?.id || '' }));
                setScheduleEvents(prev => [...prev.filter(e => e.classId !== forClassId), ...newEventsWithIds]);
            }
        } finally {
            setIsAiScheduling(false);
        }
    }, [classes, teachers, subjects, activeInstitute]);
    
    const addScheduleEvent = useCallback((eventData: Omit<ScheduleEvent, 'id' | 'instituteId' | 'endTime'>) => {
        const newEvent: ScheduleEvent = {
            ...eventData,
            id: `sch_${Date.now()}`,
            instituteId: activeInstitute?.id || '',
            endTime: `${(parseInt(eventData.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
        };
        setScheduleEvents(prev => [...prev, newEvent]);
    }, [activeInstitute]);

    const updateScheduleEvent = useCallback((eventId: string, newDay: string, newStartTime: string) => {
        setScheduleEvents(prev => prev.map(e => e.id === eventId ? {...e, day: newDay, startTime: newStartTime, endTime: `${(parseInt(newStartTime.split(':')[0]) + 1).toString().padStart(2,'0')}:00`} : e));
    }, []);

    const deleteScheduleEvent = useCallback((eventId: string) => {
        setScheduleEvents(prev => prev.filter(e => e.id !== eventId));
    }, []);
    
    const scheduleLiveClass = useCallback((classId: string, dateTime: string, meetLink: string) => {
        if (!currentUser || !activeInstitute) return;
        const classInfo = classes.find(c => c.id === classId);
        if (!classInfo) return;

        const eventDate = new Date(dateTime);
        const day = format(eventDate, 'EEEE'); // e.g., 'Monday'
        const startTime = format(eventDate, 'HH:mm');
        const endTime = format(add(eventDate, { hours: 1 }), 'HH:mm');

        const newEvent: ScheduleEvent = {
            id: `sch_live_${Date.now()}`,
            day,
            startTime,
            endTime,
            classId,
            subjectId: '', // Live classes might not have a specific subject
            teacherId: currentUser.id,
            instituteId: activeInstitute.id,
            eventType: 'Live Class',
        };
        setScheduleEvents(prev => [...prev, newEvent]);

        const newVideo: Video = {
            id: `vid_live_${Date.now()}`,
            title: `Live Class for ${classInfo.name} on ${format(eventDate, 'dd MMM yyyy')}`,
            url: meetLink,
            topic: 'Live Class Recording',
            ownerId: currentUser.id,
            classId,
            subjectId: '',
            instituteId: activeInstitute.id,
        };
        setVideos(prev => [...prev, newVideo]);

    }, [classes, currentUser, activeInstitute]);

    // Lead Management
    const openReminderModal = useCallback((lead: Lead) => { setSelectedLeadForReminder(lead); setReminderModalOpen(true); }, []);
    const closeReminderModal = useCallback(() => { setSelectedLeadForReminder(null); setReminderModalOpen(false); }, []);
    const openEmailModal = useCallback((lead: Lead) => { setSelectedLeadForEmail(lead); setEmailModalOpen(true); }, []);
    const closeEmailModal = useCallback(() => { setSelectedLeadForEmail(null); setEmailModalOpen(false); }, []);
    
    const openMeetModal = useCallback((entity: Lead | AcademicClass) => {
        if ('status' in entity) { // It's a Lead
            setSelectedLeadForMeet(entity);
            setSelectedClassForMeet(null);
        } else { // It's an AcademicClass
            setSelectedLeadForMeet(null);
            setSelectedClassForMeet(entity);
        }
        setMeetModalOpen(true);
    }, []);
    
    const closeMeetModal = useCallback(() => {
        setSelectedLeadForMeet(null);
        setSelectedClassForMeet(null);
        setMeetModalOpen(false);
    }, []);
    
    const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'isCompleted'>) => {
        const newReminder = { ...reminder, id: `rem_${Date.now()}`, isCompleted: false };
        setReminders(prev => [...prev, newReminder]);
        apiCreateLeadReminder(reminder.leadId, reminder.dateTime, reminder.notes);
    }, []);

    const updateReminder = useCallback((reminderId: string, updates: Partial<Reminder>) => {
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, ...updates } : r));
    }, []);

    const addEmailTemplate = useCallback((template: Omit<EmailTemplate, 'id'>) => {
        const newTemplate = { ...template, id: `et_${Date.now()}` };
        setEmailTemplates(prev => [...prev, newTemplate]);
        if (activeInstitute?.id) apiCreateEmailTemplate(template, activeInstitute.id);
    }, [activeInstitute]);

    const updateEmailTemplate = useCallback((templateId: string, template: EmailTemplate) => {
        setEmailTemplates(prev => prev.map(t => t.id === templateId ? template : t));
    }, []);

    const deleteEmailTemplate = useCallback((templateId: string) => {
        setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
        apiDeleteEmailTemplate(templateId);
    }, []);
    
    // Fee Management
    const getReceipt = useCallback((receiptId: string) => feeReceipts.find(r => r.id === receiptId), [feeReceipts]);

    const openReceiptModal = useCallback((receiptId: string) => {
        const receipt = getReceipt(receiptId);
        if (receipt) setActiveReceipt(receipt);
        setReceiptModalOpen(true);
    }, [getReceipt]);

    const closeReceiptModal = useCallback(() => {
        setActiveReceipt(null);
        setReceiptModalOpen(false);
    }, []);
        
    const getStudentFeeProfile = useCallback((studentId: string) => {
        return studentFeeProfiles.find(p => p.studentId === studentId);
    }, [studentFeeProfiles]);
        
    const applyDiscountsToStudent = useCallback((studentId: string, discountIds: string[]) => {
        setStudentFeeProfiles(prev => prev.map(profile => {
            if (profile.studentId === studentId) {
                const appliedDiscounts = discountIds.map(id => discounts.find(d => d.id === id)).filter((d): d is Discount => d !== undefined);
                
                let totalDiscount = 0;
                const appliedDiscountDetails = appliedDiscounts.map(d => {
                    const appliedAmount = d.type === 'Percentage' ? (profile.totalFee * d.value / 100) : d.value;
                    totalDiscount += appliedAmount;
                    return { discountId: d.id, name: d.name, appliedAmount };
                });

                const netPayable = profile.totalFee - totalDiscount;
                return { ...profile, totalDiscount, netPayable, appliedDiscounts: appliedDiscountDetails };
            }
            return profile;
        }));
    }, [discounts]);
    
    const setStudentPaymentPlan = useCallback((studentId: string, numInstallments: number, lateFeePerDay: number) => {
        // Compute new installments BEFORE setState so we can use the complete profile
        // for the backend sync call (the .then() in setState would not have access to it).
        const currentProfile = studentFeeProfiles.find(p => p.studentId === studentId);
        if (!currentProfile) return;

        const amountPerInstallment = currentProfile.netPayable / numInstallments;
        const today = new Date();
        const newInstallments: Installment[] = Array.from({ length: numInstallments }, (_, i) => ({
            id: `inst_${studentId}_${i + 1}`,
            installmentNumber: i + 1,
            dueDate: format(add(today, { months: i * (12 / numInstallments) }), 'yyyy-MM-dd'),
            amountDue: amountPerInstallment,
            amountPaid: 0,
            lateFeeApplied: 0,
            status: 'Pending' as const,
        }));
        const updatedProfile: StudentFeeProfile = { ...currentProfile, installments: newInstallments };

        setStudentFeeProfiles(prev => prev.map(p => p.studentId === studentId ? updatedProfile : p));

        // Best-effort backend sync. On success, swap temp local IDs for real backend UUIDs
        // so that subsequent recordPayment calls use real foreign keys.
        if (activeInstitute?.id) {
            apiCreateFeeProfile(updatedProfile, activeInstitute.id).then(backendProfile => {
                if (!backendProfile) return;
                setStudentFeeProfiles(prev => prev.map(p => {
                    if (p.studentId !== studentId) return p;
                    return {
                        ...p,
                        id: backendProfile.id,
                        installments: p.installments.map((inst, idx) => ({
                            ...inst,
                            id: (backendProfile.student_installments ?? [])[idx]?.id ?? inst.id,
                        })),
                    };
                }));
            });
        }
    }, [studentFeeProfiles, activeInstitute]);
    
    const recordPayment = useCallback((studentId: string, installmentId: string, amount: number, mode: FeeReceipt['paymentMode']) => {
        const receiptNumber = `RCPT-${Date.now()}`;
        const newReceipt: FeeReceipt = {
            id: `rec_${receiptNumber}`,
            receiptNumber,
            studentId,
            paymentDate: new Date().toISOString(),
            amountPaid: amount,
            paymentMode: mode,
            paidFor: `Payment for Installment`,
            breakdown: [{ description: 'Installment Payment', amount }],
        };

        setFeeReceipts(prev => [...prev, newReceipt]);
        
        setStudentFeeProfiles(prev => prev.map(profile => {
            if (profile.studentId === studentId) {
                const newInstallments = profile.installments.map(inst => {
                    if (inst.id === installmentId) {
                        const newAmountPaid = inst.amountPaid + amount;
                        const newStatus: Installment['status'] = newAmountPaid >= inst.amountDue ? 'Paid' : 'Partially Paid';
                        return { ...inst, amountPaid: newAmountPaid, status: newStatus, receiptId: newReceipt.id, paymentDate: new Date().toISOString() };
                    }
                    return inst;
                });
                return { ...profile, installments: newInstallments };
            }
            return profile;
        }));

        // Best-effort backend sync. Succeeds only when the fee profile was previously
        // persisted via setStudentPaymentPlan (IDs are real backend UUIDs). Fails soft
        // with temp local IDs — no user-visible error in either case.
        const profile = studentFeeProfiles.find(p => p.studentId === studentId);
        if (profile && activeInstitute?.id) {
            apiRecordPayment({
                feeProfileId: profile.id,
                installmentId,
                amountPaid: amount,
                paymentMode: mode,
                studentId,
                instituteId: activeInstitute.id,
            });
        }
    }, [studentFeeProfiles, activeInstitute]);
    
    // Gamification
    const createGameChallenge = useCallback(async (challengeData: any) => {
        const { topic, numLevels, questionsPerLevel, ...rest } = challengeData;
        const levels = await generateGameLevels(topic, numLevels, questionsPerLevel);
        if (!levels) {
            throw new Error("AI failed to generate game levels. Please try a different topic or configuration.");
        }
        
        const newChallenge: GameChallenge = {
            id: `gc_${Date.now()}`,
            title: `${topic} Challenge`,
            topic,
            ...rest,
            levels,
            ownerId: currentUser!.id,
            createdAt: new Date().toISOString(),
        };
        setGameChallenges(prev => [...prev, newChallenge]);
    }, [currentUser]);
    
    const startChallenge = useCallback((challenge: GameChallenge) => {
        setActiveGameChallenge(challenge);
        setActiveView('play-game');
    }, []);

    const viewChallengeResults = useCallback((challenge: GameChallenge) => {
        setActiveGameResults(challenge);
        setActiveView('game-results');
    }, []);

    const submitChallenge = useCallback((submissionData: Omit<ChallengeSubmission, 'id' | 'studentId' | 'completedAt'>) => {
        const newSubmission: ChallengeSubmission = {
            ...submissionData,
            id: `csub_${Date.now()}`,
            studentId: currentUser!.id,
            completedAt: new Date().toISOString(),
        };
        setChallengeSubmissions(prev => [...prev, newSubmission]);
        const challenge = gameChallenges.find(c => c.id === submissionData.challengeId);
        setActiveGameChallenge(null);
        if(challenge) viewChallengeResults(challenge);
    }, [currentUser, gameChallenges, viewChallengeResults]);
    
    // Digital Marketing
    const addGoogleAdCampaign = useCallback((campaign: Omit<GoogleAdCampaign, 'id'|'clicks'|'impressions'>) => {
        const newCampaign: GoogleAdCampaign = {
            ...campaign,
            id: `ggl_${Date.now()}`,
            clicks: Math.floor(Math.random() * 5000) + 500,
            impressions: Math.floor(Math.random() * 100000) + 10000,
        };
        setGoogleAdCampaigns(prev => [...prev, newCampaign]);
    }, []);

    const addEmailCampaign = useCallback((campaign: Omit<EmailCampaign, 'id'|'status'|'sentDate'|'openRate'|'clickRate'>) => {
        const newCampaign: EmailCampaign = {
            ...campaign,
            id: `emc_${Date.now()}`,
            status: CampaignStatus.Completed,
            sentDate: new Date().toISOString().split('T')[0],
            openRate: Math.random() * 30 + 10,
            clickRate: Math.random() * 5 + 1,
        };
        setEmailCampaigns(prev => [...prev, newCampaign]);
    }, []);

    const addSocialPost = useCallback((post: Omit<SocialPost, 'id'|'likes'|'comments'|'shares'>) => {
        const newPost: SocialPost = {
            ...post,
            id: `soc_${Date.now()}`,
            likes: 0,
            comments: 0,
            shares: 0,
        };
        setSocialPosts(prev => [...prev, newPost]);
    }, []);

    const updateSocialPost = useCallback((updated: SocialPost) => {
        setSocialPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
    }, []);
    
    // Communication
    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    // Context value to be passed to consumers
    const value: AppContextType = {
        isAuthenticated, currentUser, login, logout, loginAsProductOwner, showLoginPage, setShowLoginPage,
        originalUser, impersonateUser, exitImpersonation, switchRole,
        currentRole, setCurrentRole, activeView, setActiveView, getViewLabel,
        isSidebarOpen, toggleSidebar, closeSidebar,
        isWorkspaceAccessModalOpen, openWorkspaceAccessModal, closeWorkspaceAccessModal,
        isConnectEmailModalOpen, openConnectEmailModal, closeConnectEmailModal, connectEmail, disconnectEmail,
        isForgotPasswordModalOpen, openForgotPasswordModal, closeForgotPasswordModal, requestPasswordReset,
        settings, updateSettings, csvTemplates, updateCsvTemplate,
        themeSettings, updateTheme, resetTheme,
        institutes, activeInstituteId, setActiveInstituteId, activeInstitute, currentSubscription, addPackage,
        branches, users, students, teachers, classes, subjects, leads, addRecord, addBulkRecords, updateRecord, deleteRecord, getData, getContextData,
        filteredBranches, filteredClasses, filteredStudents, filteredTeachers, filteredSubjects, filteredQuizzes, filteredFlashcardSets, filteredStudyMaterials, filteredVideos, filteredUploadedDocuments, filteredScheduleEvents,
        teacherWorkspace, setTeacherWorkspace,
        quizzes, addQuiz, flashcardSets, addFlashcardSet, studyMaterials, addStudyMaterial, videos, addVideo, uploadedDocuments, addUploadedDocument,
        activeQuiz, startQuiz, submission, quizSubmissions, submitQuiz, clearSubmission,
        activeFlashcardSet, studyFlashcardSet, activeStudyMaterial, viewStudyMaterial, clearStudyView,
        isAiVideoFinderOpen, openAiVideoFinder, closeAiVideoFinder, playingVideo, playVideo, closeVideoPlayer,
        notes, addNote, updateNote, deleteNote, editingNote, startNewNote, editNote, closeNoteEditor,
        attendance, updateAttendance, addBulkAttendance,
        scheduleEvents, isAiScheduling, generateScheduleFromAI, addScheduleEvent, updateScheduleEvent, deleteScheduleEvent, scheduleLiveClass,
        reminders, addReminder, updateReminder, emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
        isReminderModalOpen, selectedLeadForReminder, openReminderModal, closeReminderModal,
        isEmailModalOpen, selectedLeadForEmail, openEmailModal, closeEmailModal,
        isMeetModalOpen, selectedLeadForMeet, selectedClassForMeet, openMeetModal, closeMeetModal,
        feeStructures, discounts, studentFeeProfiles, feeReceipts, getStudentFeeProfile, assignFeeStructureToStudent, applyDiscountsToStudent, recordPayment, setStudentPaymentPlan,
        isReceiptModalOpen, activeReceipt, openReceiptModal, closeReceiptModal, getReceipt, notifications,
        gameChallenges, challengeSubmissions, activeGameChallenge, activeGameResults, createGameChallenge, startChallenge, submitChallenge, viewChallengeResults,
        googleAdCampaigns, emailCampaigns, socialPosts, addGoogleAdCampaign, addEmailCampaign, addSocialPost, updateSocialPost,
        messages, addMessage,
        // New: AI Personal, Children, Saved Content, Activity, Reports, Plans
        linkedChildren, setLinkedChildren,
        personalAiConfigs, setPersonalAiConfigs,
        savedAiContent, setSavedAiContent,
        activitySessions, setActivitySessions,
        aiProgressReports, setAiProgressReports,
        parentPlans, setParentPlans,
        parentSubscriptions, setParentSubscriptions,
        // External roles
        roleConfigs, setRoleConfigs,
        externalParents, setExternalParents,
        externalChildren, setExternalChildren,
        externalStudents, setExternalStudents,
        externalParentSession, externalStudentSession,
        loginExternal, registerExternalParent, registerExternalStudent,
        studentPlans, setStudentPlans,
        studentSubscriptions, setStudentSubscriptions,
        studyChallenges, setStudyChallenges,
        challengeParticipations, setChallengeParticipations,
        sharedContent, setSharedContent,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};