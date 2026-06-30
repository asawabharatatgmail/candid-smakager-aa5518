


import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole, SubscriptionSettings } from './types';
import DashboardLayout from './components/DashboardLayout';
import ClassAdminDashboard from './components/dashboards/ClassAdminDashboard';
import BranchAdminDashboard from './components/dashboards/BranchAdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import ProductOwnerDashboard from './components/dashboards/ProductOwnerDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import QuizTaker from './components/features/QuizTaker';
import QuizResult from './components/features/QuizResult';
import ManagementView from './components/views/ManagementView';
import LmsView from './components/views/LmsView';
import SettingsView from './components/views/SettingsView';
import StudentProfileView from './components/views/StudentProfileView';
import AiStudyToolView from './components/views/AiStudyToolView';
import LeadManagementView from './components/views/LeadManagementView';
import SystemHealthView from './components/views/SystemHealthView';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { NAV_LINKS } from './constants';
import FinanceView from './components/views/FinanceView';
import AttendanceView from './components/views/AttendanceView';
import MyClassesView from './components/views/MyClassesView';
import LibraryView from './components/views/LibraryView';
import MyCoursesView from './components/views/MyCoursesView';
import AssignmentsTestsView from './components/views/AssignmentsTestsView';
import MyProgressView from './components/views/MyProgressView';
import MyNotesView from './components/views/MyNotesView';
import FlashcardStudyView from './components/features/FlashcardStudyView';
import StudyMaterialDetailView from './components/features/StudyMaterialDetailView';
import SchedulerView from './components/views/SchedulerView';
import SetReminderModal from './components/modals/SetReminderModal';
import AiEmailModal from './components/modals/AiEmailModal';
import ChildProgressView from './components/views/ChildProgressView';
import CommunicationView from './components/views/CommunicationView';
import BrandingView from './components/views/BrandingView';
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';
import FeeReceiptModal from './components/modals/FeeReceiptModal';
import DataFlowView from './components/views/DataFlowView';
import PaymentGatewayView from './components/views/PaymentGatewayView';
import NoteEditorView from './components/views/NoteEditorView';
import ScheduleMeetModal from './components/modals/ScheduleMeetModal';
import GamificationView from './components/views/GamificationView';
import GamePlayer from './components/features/GamePlayer';
import GameChallengeResultsView from './components/features/GameChallengeResultsView';
import DigitalMarketingView from './components/views/DigitalMarketingView';
import IntegrationsView from './components/views/IntegrationsView';
import AiVideoFinderModal from './components/modals/AiVideoFinderModal';
import VideoPlayerModal from './components/modals/VideoPlayerModal';
import FeePaymentView from './components/views/FeePaymentView';
import SubscriptionManagerView from './components/views/SubscriptionManagerView';
import CreatePackageModal from './components/modals/CreatePackageModal';
import SubscriptionModelerView from './components/views/SubscriptionModelerView';
import AiHelpChatbot from './components/features/AiHelpChatbot';
import WorkspaceAccessModal from './components/modals/WorkspaceAccessModal';
import PlatformSettingsView from './components/views/PlatformSettingsView';
import MaintenancePage from './components/MaintenancePage';
import ClassesAndSubjectsView from './components/views/ClassesAndSubjectsView';
import ConnectEmailModal from './components/modals/ConnectEmailModal';
import PlatformMastersView from './components/views/PlatformMastersView';
import DataImportSettingsView from './components/views/DataImportSettingsView';
import ThemeCustomizerView from './components/views/ThemeCustomizerView';
import VideoConferenceView from './components/views/VideoConferenceView';
import MailView from './components/views/MailView';
import UserGuideView from './components/views/UserGuideView';
import PersonalAiConfigView from './components/views/PersonalAiConfigView';
import AiGeneratorView from './components/views/AiGeneratorView';
import MyAiLibraryView from './components/views/MyAiLibraryView';
import AiSuggestionsView from './components/views/AiSuggestionsView';
import MyChildrenView from './components/views/MyChildrenView';
import ParentReportsView from './components/views/ParentReportsView';
import ParentSubscriptionView from './components/views/ParentSubscriptionView';
import ParentPlansView from './components/views/ParentPlansView';
import RoleManagerView from './components/views/RoleManagerView';
import ExternalChildrenView from './components/views/ExternalChildrenView';
import ExternalParentDashboard from './components/dashboards/ExternalParentDashboard';
import ExternalStudentDashboard from './components/dashboards/ExternalStudentDashboard';
import ChallengesView from './components/views/ChallengesView';
import PublicLibraryView from './components/views/PublicLibraryView';
import ExtStudentProgressView from './components/views/ExtStudentProgressView';
import StudentSubscriptionView from './components/views/StudentSubscriptionView';
import StudentPlansView from './components/views/StudentPlansView';


const dashboardMap: Record<UserRole, React.FC> = {
  [UserRole.ProductOwner]: ProductOwnerDashboard,
  [UserRole.ClassAdmin]: ClassAdminDashboard,
  [UserRole.BranchAdmin]: BranchAdminDashboard,
  [UserRole.Teacher]: TeacherDashboard,
  [UserRole.Student]: StudentDashboard,
  [UserRole.Parent]: ParentDashboard,
  [UserRole.ExternalParent]: ExternalParentDashboard,
  [UserRole.ExternalStudent]: ExternalStudentDashboard,
};

const viewMap: Record<string, React.ReactElement> = {
    'take-quiz': <QuizTaker />,
    'quiz-result': <QuizResult />,
    'study-flashcards': <FlashcardStudyView />,
    'view-study-material': <StudyMaterialDetailView />,
    'play-game': <GamePlayer />,
    'game-results': <GameChallengeResultsView />,
    'institutes': <ManagementView category="institutes" />,
    'branches': <ManagementView category="branches" />,
    'users': <ManagementView category="users" />,
    'students': <ManagementView category="students" />,
    'teachers': <ManagementView category="teachers" />,
    'classes': <ManagementView category="classes" />,
    'classes-subjects': <ClassesAndSubjectsView />,
    'subjects': <ManagementView category="subjects" />,
    'leads': <LeadManagementView />,
    'digital-marketing': <DigitalMarketingView />,
    'integrations': <IntegrationsView />,
    'content-creator': <LmsView />,
    'settings': <SettingsView />,
    'branding': <BrandingView />,
    'my-profile': <StudentProfileView />,
    'ai-study-tool': <AiStudyToolView />,
    'system-health': <SystemHealthView />,
    'theme-customizer': <ThemeCustomizerView />,
    'platform-settings': <PlatformSettingsView />,
    'platform-masters': <PlatformMastersView />,
    'data-import-settings': <DataImportSettingsView />,
    'scheduler': <SchedulerView />,
    'library': <LibraryView />,
    'payment-gateway': <PaymentGatewayView />,
    'data-flow': <DataFlowView />,
    'gamification': <GamificationView />,
    'subscription-management': <SubscriptionManagerView />,
    'subscription-modeler': <SubscriptionModelerView />,
    'finance': <FinanceView />,
    'attendance': <AttendanceView />,
    'my-classes': <MyClassesView />,
    'my-courses': <MyCoursesView />,
    'assignments-tests': <AssignmentsTestsView />,
    'my-progress': <MyProgressView />,
    'my-notes': <MyNotesView />,
    'note-editor': <NoteEditorView />,
    'child-progress': <ChildProgressView />,
    'communication': <CommunicationView />,
    'fee-payment': <FeePaymentView />,
    'video-conference': <VideoConferenceView />,
    'mail': <MailView />,
    'user-guide': <UserGuideView />,
    // ── New AI / Parent / Student routes ──
    'personal-ai-config': <PersonalAiConfigView />,
    'ai-generator': <AiGeneratorView />,
    'my-ai-library': <MyAiLibraryView />,
    'ai-suggestions': <AiSuggestionsView />,
    'my-children': <MyChildrenView />,
    'parent-reports': <ParentReportsView />,
    'ai-progress-report': <ParentReportsView />,
    'parent-subscription': <ParentSubscriptionView />,
    'parent-plans': <ParentPlansView />,
    'role-manager':        <RoleManagerView />,
    'student-plans':       <StudentPlansView />,
    // External Parent views
    'ext-children':        <ExternalChildrenView />,
    'ext-ai-generator':    <AiGeneratorView />,
    'ext-ai-reports':      <ParentReportsView />,
    'ext-ai-library':      <MyAiLibraryView />,
    'ext-subscription':    <ParentSubscriptionView />,
    'ext-account':         <PersonalAiConfigView />,
    // External Student views
    'challenges':          <ChallengesView />,
    'public-library':      <PublicLibraryView />,
    'ext-progress':        <ExtStudentProgressView />,
    'student-subscription':<StudentSubscriptionView />,
};

const MainContent: React.FC = () => {
    const { 
        isAuthenticated, showLoginPage, currentRole, activeView, setActiveView, currentSubscription,
        isReminderModalOpen, closeReminderModal, selectedLeadForReminder,
        isEmailModalOpen, closeEmailModal, selectedLeadForEmail,
        isMeetModalOpen, closeMeetModal, selectedLeadForMeet, selectedClassForMeet,
        isForgotPasswordModalOpen, closeForgotPasswordModal,
        isReceiptModalOpen, closeReceiptModal, activeReceipt,
        isAiVideoFinderOpen, closeAiVideoFinder,
        playingVideo, closeVideoPlayer,
        isWorkspaceAccessModalOpen,
        isConnectEmailModalOpen, closeConnectEmailModal,
        settings,
    } = useAppContext();

    if (isAuthenticated && settings.isMaintenanceMode && currentRole !== UserRole.ProductOwner) {
        return <MaintenancePage />;
    }

    useEffect(() => {
        const isViewRestricted = (view: string, sub: SubscriptionSettings) => {
            switch (view) {
                case 'leads':
                case 'digital-marketing':
                case 'integrations':
                case 'finance':
                    return !sub.isLeadManagementEnabled;
                case 'content-creator':
                case 'ai-study-tool':
                case 'gamification':
                    return !sub.isAiEnabled;
                default:
                    return false;
            }
        };

        if (isAuthenticated && currentRole !== UserRole.ProductOwner && isViewRestricted(activeView, currentSubscription)) {
            // If the current view is restricted by subscription, redirect to the dashboard.
            setActiveView('dashboard');
        }
    }, [activeView, currentSubscription, isAuthenticated, currentRole, setActiveView]);


    if (!isAuthenticated) {
        if (showLoginPage) {
            return (
                <>
                    <LoginPage />
                    {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={closeForgotPasswordModal} />}
                </>
            );
        }
        return <LandingPage />;
    }
    
    const DashboardComponent = dashboardMap[currentRole];
    const currentView = viewMap[activeView] || <DashboardComponent />;
    const meetModalEntity = selectedLeadForMeet || selectedClassForMeet;

    return (
        <DashboardLayout>
            {currentView}
            {isReminderModalOpen && selectedLeadForReminder && (
                <SetReminderModal
                    lead={selectedLeadForReminder}
                    onClose={closeReminderModal}
                />
            )}
            {isEmailModalOpen && selectedLeadForEmail && (
                <AiEmailModal
                    lead={selectedLeadForEmail}
                    onClose={closeEmailModal}
                />
            )}
            {isMeetModalOpen && meetModalEntity && (
                <ScheduleMeetModal
                    entity={meetModalEntity}
                    onClose={closeMeetModal}
                />
            )}
             {isReceiptModalOpen && activeReceipt && (
                <FeeReceiptModal
                    receipt={activeReceipt}
                    onClose={closeReceiptModal}
                />
            )}
            {isWorkspaceAccessModalOpen && <WorkspaceAccessModal />}
            {isConnectEmailModalOpen && <ConnectEmailModal onClose={closeConnectEmailModal} />}
            {isAiVideoFinderOpen && <AiVideoFinderModal onClose={closeAiVideoFinder} />}
            {playingVideo && <VideoPlayerModal video={playingVideo} onClose={closeVideoPlayer} />}
            <AiHelpChatbot />
        </DashboardLayout>
    );
};


const App = () => {
  return (
    <AppProvider>
        <MainContent />
    </AppProvider>
  );
}

export default App;