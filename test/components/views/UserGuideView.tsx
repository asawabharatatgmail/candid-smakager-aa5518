import React, { useState } from 'react';

const sections = [
  {
    id: 'overview',
    role: 'Platform Overview',
    icon: 'ri-information-line',
    color: 'bg-slate-700',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    content: [
      {
        title: 'What is System4Learn?',
        body: 'System4Learn is an all-in-one smart academic administration and analytics platform built for educational institutes of all sizes. It brings together student management, teacher tools, fee collection, AI-powered content creation, lead CRM, and analytics in one unified workspace.',
      },
      {
        title: 'Demo Login Credentials',
        body: '',
        table: {
          headers: ['Role', 'Email', 'Password', 'Access Level'],
          rows: [
            ['Class Admin',  'admin@demo.com',   'Any text', 'Full institute — all modules'],
            ['Branch Admin', 'branch@demo.com',  'Any text', 'Branch-level management'],
            ['Teacher',      'teacher@demo.com', 'Any text', 'Classes, content, attendance'],
            ['Student',      'student@demo.com', 'Any text', 'Learning, fees, schedule'],
            ['Parent',       'parent@demo.com',  'Any text', 'Child progress & fee payment'],
          ],
        },
      },
      {
        title: 'Navigation',
        body: 'After logging in, use the left sidebar to navigate between modules. Each role sees only the modules relevant to them. Click any menu item to switch views instantly. On mobile, tap the ☰ icon at the top-left to open the sidebar.',
      },
    ],
  },
  {
    id: 'institute',
    role: 'Class Admin (Institute)',
    icon: 'ri-building-2-line',
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    content: [
      {
        title: '1. Dashboard',
        body: 'The dashboard gives you a live snapshot of your institute — total students, teachers, active classes, fee collection status, lead pipeline, and recent activity. Use the stat cards at the top to quickly jump to key areas.',
        steps: [
          'Login with admin@demo.com',
          'You land on the Dashboard automatically',
          'Review stat cards: Students, Teachers, Revenue, Leads',
          'Scroll down to see Recent Admissions and Upcoming Events',
        ],
      },
      {
        title: '2. Branch Management',
        body: 'Create and manage multiple branches of your institute. Each branch can have its own admin, classes, teachers, and students.',
        steps: [
          'Click "Branch Management" in the sidebar',
          'You will see 3 demo branches: Main Campus, North Campus, South Campus',
          'Click "+ Add Branch" to create a new branch',
          'Fill in Branch Name, Location, and Branch Head',
          'Save — the branch is now available for user assignment',
        ],
      },
      {
        title: '3. User Management',
        body: 'Add and manage staff users (Class Admins, Branch Admins). Assign them to specific branches and set their roles.',
        steps: [
          'Click "User Management" → view all staff users',
          'Click "+ Add User" → fill Name, Email, Mobile, Role, Branches',
          'Set Role to "BranchAdmin" to restrict to branch-level access',
          'Users can log in immediately with their email (demo: any password)',
        ],
      },
      {
        title: '4. Student Management',
        body: 'Add, edit, search, and export all student records. Assign students to classes, branches, and subjects. Link parent details for the parent portal.',
        steps: [
          'Click "Student Management" → 15 demo students are loaded',
          'Use the Search bar to find a student by name or email',
          'Click "+ Add Student" to enroll a new student',
          'Fill: Name, Email, Mobile, Class, Branch, Subjects, Parent details',
          'Click Edit (pencil icon) on any row to update records',
          'Use "Export CSV" to download all student data',
        ],
      },
      {
        title: '5. Teacher Management',
        body: 'Manage all teachers — their subjects, assigned classes, and branches.',
        steps: [
          'Click "Teacher Management" → 5 demo teachers are loaded',
          'Click "+ Add Teacher" → fill Name, Email, Subjects, Classes, Branch',
          'Assign multiple subjects and classes to one teacher',
          'Teachers appear in the scheduler and content creator automatically',
        ],
      },
      {
        title: '6. Classes & Subjects',
        body: 'Define your academic structure — create classes (e.g., Class 10-A) and subjects (e.g., Mathematics). Link teachers and students to classes.',
        steps: [
          'Click "Classes & Subjects"',
          'Tab 1 — Classes: 6 demo classes visible (9-A, 9-B, 10-A, 10-B, 11-A, 12-A)',
          'Tab 2 — Subjects: 10 subjects across Science, Language, Humanities, Technology',
          'Click "+ Add Class" → name it, assign teachers and students',
          'Click "+ Add Subject" → name it and set category',
        ],
      },
      {
        title: '7. Finance & Fee Management',
        body: 'Create fee structures, apply discounts, track payments, and download PDF receipts.',
        steps: [
          'Click "Finance" in the sidebar',
          'Tab: Fee Structures — 3 demo structures for Class 9, 10-A, 10-B',
          'Tab: Students → see payment status for each student (Paid / Partial / Pending)',
          'Click a student row → view full fee breakdown and payment history',
          'Click "Record Payment" → enter amount, mode (Cash/Online/Cheque)',
          'System auto-generates a receipt — click "Download Receipt" for PDF',
          'Tab: Discounts — 4 demo discounts (Sibling, Merit, Early Bird, Staff Ward)',
          'Click "+ Add Discount" → set name, type (%), value, apply to student',
        ],
      },
      {
        title: '8. Attendance',
        body: 'Mark and view attendance for any class on any date.',
        steps: [
          'Click "Attendance"',
          'Select Class from the dropdown (e.g., Class 9-A)',
          'Select Date using the date picker',
          'Mark each student as Present / Absent / Late',
          'Click "Save Attendance"',
          'Use the summary tab to see monthly attendance % per student',
        ],
      },
      {
        title: '9. Lead Management (CRM)',
        body: 'Track prospective student enquiries from initial contact through to admission.',
        steps: [
          '12 demo leads loaded across New, Contacted, Qualified, Converted, Lost stages',
          'Click a lead → view full profile, add notes, set reminders',
          'Click "AI Email" → let AI draft a personalised follow-up email',
          'Drag leads between Kanban columns (or use the Status dropdown)',
          'Click "+ Add Lead" → fill name, contact, source, status',
          'Filter leads by source or status using the filter bar',
        ],
      },
      {
        title: '10. Digital Marketing',
        body: 'Plan and track social media posts, email campaigns, and Google Ads.',
        steps: [
          'Click "Digital Marketing"',
          'Tab: Social Media — schedule posts for Facebook, Instagram, LinkedIn, Twitter, YouTube, WhatsApp',
          'Tab: Email Campaigns — create bulk email campaigns with open/click tracking',
          'Tab: Google Ads — record ad campaigns and track budget vs results',
          'Click "+ Create Post" → choose platform, write content, set scheduled date',
          'Click "Mark Posted" on any post to record it as published',
        ],
      },
      {
        title: '11. Scheduler',
        body: 'Build and view the class timetable. AI can auto-generate an optimised schedule.',
        steps: [
          'Click "Scheduler"',
          'See the weekly timetable for all classes',
          'Click "+ Add Event" → pick class, subject, teacher, day, time',
          'Or click "AI Generate Schedule" → AI builds an optimised timetable',
          'Export timetable as PDF for distribution',
        ],
      },
      {
        title: '12. Settings & AI Configuration',
        body: 'Connect AI providers (Gemini, OpenAI, Claude, Mistral, Groq etc.), manage branding, and configure system settings.',
        steps: [
          'Click "Settings"',
          'Tab: AI Providers — add your API key for any of 8 supported AI services',
          'Click "Test Connection" to verify your key works',
          'Click "Set as Active" to use that provider for all AI features',
          'Tab: Branding — upload institute logo, change name, tagline',
          'Tab: Notifications — configure email alerts for fees, attendance, leads',
        ],
      },
      {
        title: '13. Theme Customizer',
        body: 'Change the look of the platform with pre-built themes or full custom controls.',
        steps: [
          'Click "Branding" in the sidebar',
          'Select a preset: System4Learn Default, Stripe Enterprise, Linear Dark, Notion Clean',
          'Or manually adjust Primary Color, Sidebar Color, Font, Border Radius',
          'Changes apply instantly — share a custom-branded experience with your institute',
        ],
      },
    ],
  },
  {
    id: 'branch',
    role: 'Branch Admin',
    icon: 'ri-git-branch-line',
    color: 'bg-violet-600',
    lightColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    content: [
      {
        title: '1. Dashboard',
        body: 'Branch Admins see a dashboard scoped to their branch — student count, teacher count, attendance rate, and recent activity for their campus only.',
        steps: [
          'Login with branch@demo.com',
          'Dashboard shows Main Campus data only',
          'Stats: students enrolled, teachers assigned, classes running',
        ],
      },
      {
        title: '2. Student Management',
        body: 'View and manage students enrolled in your branch. Add new students, edit existing records, and link parent information.',
        steps: [
          'Click "Student Management"',
          'Only students from your branch are visible',
          'Click "+ Add Student" to enroll a new student in this branch',
          'Edit student details — class assignment, parent contact, subjects',
        ],
      },
      {
        title: '3. Teacher Management',
        body: 'View teachers assigned to your branch. Coordinate with them on classes and timetable.',
        steps: [
          'Click "Teacher Management"',
          'See all teachers assigned to your branch',
          'View their subject list and class assignments',
          'Contact via email using the mail icon on each row',
        ],
      },
      {
        title: '4. Class Management',
        body: 'View the classes running in your branch, see student counts, and check teacher assignments.',
        steps: [
          'Click "Class Management"',
          'See all classes at your branch with student and teacher counts',
          'Click a class to view the student list',
        ],
      },
      {
        title: '5. Attendance',
        body: 'Mark daily attendance for all classes in your branch and view attendance reports.',
        steps: [
          'Click "Attendance"',
          'Select the class and date',
          'Mark each student Present / Absent / Late',
          'Save — records are stored and visible in the Class Admin dashboard too',
        ],
      },
      {
        title: '6. Mail Center',
        body: 'Send emails to parents, teachers, or students from your branch using the built-in mail tool.',
        steps: [
          'Click "Mail Center"',
          'Click "Compose" to write a new email',
          'Use Bulk Mail to send the same message to multiple recipients at once',
          'Select a template (Fee Reminder, Exam Notice, etc.) and personalise with {name}',
        ],
      },
    ],
  },
  {
    id: 'teacher',
    role: 'Teacher',
    icon: 'ri-user-star-line',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    content: [
      {
        title: '1. Dashboard',
        body: 'See your assigned classes, upcoming schedule, recent student activity, and quick links to content tools.',
        steps: [
          'Login with teacher@demo.com (Dr. Anita Desai)',
          'Dashboard shows: My Classes, Today\'s Schedule, Recent Quiz Results',
        ],
      },
      {
        title: '2. My Classes',
        body: 'View all students in each of your assigned classes. Check attendance, view notes, and communicate.',
        steps: [
          'Click "My Classes"',
          'See Class 9-A and Class 10-A with student lists',
          'Click a student to view their profile and progress',
          'Click "Take Attendance" to mark today\'s class',
        ],
      },
      {
        title: '3. Content Creator (AI-Powered)',
        body: 'Generate quizzes, flashcard sets, and study guides in seconds using AI. All content is saved to the shared library.',
        steps: [
          'Click "Content Creator"',
          'Tab: Quiz Generator — enter topic (e.g., "Newton\'s Laws of Motion"), select class, number of questions',
          'Click "Generate Quiz" → AI creates a full quiz with options and answers',
          'Review, edit any question if needed, then click "Save to Library"',
          'Tab: Flashcards — enter topic, click Generate → AI makes a card set',
          'Tab: Study Guide — enter chapter name, click Generate → full notes created',
          'All content appears in Content Library for students immediately',
        ],
      },
      {
        title: '4. Assignments & Tests',
        body: 'Create assignments and tests for your classes, set deadlines, and review student submissions.',
        steps: [
          'Click "Assignments & Tests"',
          'Click "+ Create Assignment" → add title, instructions, class, due date',
          'Or click "+ Create Test" → set questions, marks, duration',
          'Students see assignments in their portal and can submit online',
          'View submissions → mark and add feedback',
        ],
      },
      {
        title: '5. Content Library',
        body: 'Browse all quizzes, flashcards, and study materials. Filter by subject or class.',
        steps: [
          'Click "Content Library"',
          'Filter by Subject (e.g., Mathematics) or Type (Quiz / Flashcards / Guide)',
          'Click any item to preview it',
          'Click "Assign to Class" to push it to a specific class',
          'Students can access it in their "My Courses" section',
        ],
      },
      {
        title: '6. Scheduler',
        body: 'View your personal timetable and see which classes you teach on each day.',
        steps: [
          'Click "Scheduler"',
          'Weekly view shows your classes by day and time',
          'Click any slot to see class details and student count',
          'Request a schedule change via the "Request Change" button',
        ],
      },
      {
        title: '7. Video Conference',
        body: 'Start an instant online class using Jitsi Meet — free, no account needed, HD video.',
        steps: [
          'Click "Video Conference"',
          'Your display name is pre-filled from your profile',
          'Click "Start Class Now" → a unique room is created automatically',
          'Copy the invite link and share with students via WhatsApp/Email',
          'Or click "Schedule Class" → set date, time, duration → a scheduled entry is created',
          'Students see scheduled classes in their "Online Classes" section and can join with one click',
        ],
      },
      {
        title: '8. Attendance',
        body: 'Mark attendance for your classes quickly each day.',
        steps: [
          'Click "Attendance"',
          'Your classes are pre-selected',
          'Choose date → mark each student P / A / L',
          'Save — parents receive an absence notification automatically',
        ],
      },
    ],
  },
  {
    id: 'student',
    role: 'Student',
    icon: 'ri-graduation-cap-line',
    color: 'bg-cyan-600',
    lightColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    content: [
      {
        title: '1. Dashboard',
        body: 'Your personal learning hub — see today\'s schedule, upcoming tests, recent scores, and AI study suggestions.',
        steps: [
          'Login with student@demo.com (Arjun Kumar, Class 9-A)',
          'Dashboard shows: Today\'s Classes, Pending Assignments, Recent Scores, Study Streak',
        ],
      },
      {
        title: '2. AI Study Tool',
        body: 'Your personal AI tutor. Ask any subject question and get a detailed explanation, or generate a custom study guide for any chapter.',
        steps: [
          'Click "AI Study Tool"',
          'Type your question (e.g., "Explain Newton\'s 3rd Law with examples")',
          'Click "Ask" → AI gives a detailed, student-friendly answer',
          'Click "Generate Study Guide" → enter chapter name → full notes are created and saved',
          'Tab: Practice Quiz — AI generates a 10-question quiz on your chosen topic',
          'Tab: Flashcards — generate flash cards for quick revision',
        ],
      },
      {
        title: '3. My Courses',
        body: 'View all content assigned to you by your teachers — quizzes, study materials, and flashcard sets.',
        steps: [
          'Click "My Courses"',
          'See all assigned content organised by subject',
          'Click a Quiz to attempt it — results are saved automatically',
          'Click a Study Guide to read it — highlight key points',
          'Click Flashcards → go through cards using Flip / Next / Previous',
        ],
      },
      {
        title: '4. Assignments & Tests',
        body: 'View all pending and submitted assignments and tests. Submit work before the deadline.',
        steps: [
          'Click "Assignments & Tests"',
          'Pending tab: all assignments with due date and subject',
          'Click an assignment → read instructions → type / upload your submission → Submit',
          'Submitted tab: view teacher feedback and marks',
          'Tests: click "Start Test" → timed online test with immediate results',
        ],
      },
      {
        title: '5. Online Classes (Video)',
        body: 'Join live online classes scheduled by your teacher.',
        steps: [
          'Click "Online Classes"',
          'See all scheduled video classes with date, time, teacher name',
          'Click "Join" on an upcoming class → opens in Jitsi Meet',
          'No download needed — works in your browser',
          'Camera and microphone permissions will be requested on first join',
        ],
      },
      {
        title: '6. Game Challenges',
        body: 'Play educational game challenges created by your teacher and compete with classmates.',
        steps: [
          'Click "Game Challenges"',
          'See available challenges — subject, difficulty, time limit',
          'Click "Play" → multi-level quiz game starts',
          'Complete all levels to see your score on the leaderboard',
          'Earn badges and points that appear on your profile',
        ],
      },
      {
        title: '7. My Schedule',
        body: 'View your personal weekly timetable.',
        steps: [
          'Click "My Schedule"',
          'See the full weekly timetable with subject, teacher, room',
          'Color-coded by subject for easy reading',
          'Click any class slot to see more details',
        ],
      },
      {
        title: '8. My Fees',
        body: 'View your fee structure, payment history, and download receipts.',
        steps: [
          'Click "My Fees"',
          'See your current fee structure and breakdown by installment',
          'Check which installments are Paid / Due / Overdue',
          'Click on any paid installment → Download Receipt as PDF',
          'Share payment receipt with the admin if needed',
        ],
      },
      {
        title: '9. My Progress',
        body: 'Track your academic performance over time — quiz scores, attendance, assignment completion.',
        steps: [
          'Click "My Progress"',
          'Overall score chart shows performance by subject',
          'Attendance percentage for the current term',
          'Quiz score history with date and topic',
          'Improvement tips from AI based on your weak areas',
        ],
      },
      {
        title: '10. My Notes',
        body: 'Create, organise, and search personal study notes.',
        steps: [
          'Click "My Notes"',
          'Click "+ New Note" → type title and content',
          'Use the subject tag to organise notes by subject',
          'Search bar finds notes instantly',
          'Notes are saved in your private workspace — teachers cannot see them',
        ],
      },
    ],
  },
  {
    id: 'parent',
    role: 'Parent',
    icon: 'ri-parent-line',
    color: 'bg-pink-600',
    lightColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    content: [
      {
        title: '1. Dashboard',
        body: 'Get a quick overview of your child\'s school life — attendance, upcoming tests, recent results, and fee status.',
        steps: [
          'Login with parent@demo.com (Vikram Kumar — parent of Arjun Kumar)',
          'Dashboard shows: Child\'s Attendance %, Upcoming Tests, Recent Scores, Fee Status',
          'If you have multiple children, use the child switcher at the top',
        ],
      },
      {
        title: '2. Child\'s Progress',
        body: 'Deep-dive into your child\'s academic performance across all subjects.',
        steps: [
          'Click "Child\'s Progress"',
          'Subject-wise performance chart — see which subjects need attention',
          'Quiz scores with date and topic',
          'Attendance record month by month',
          'Teacher comments and remarks',
          'Overall rank in class (if enabled by the institute)',
        ],
      },
      {
        title: '3. Fee Payment',
        body: 'View outstanding fees, check payment history, and download receipts.',
        steps: [
          'Click "Fee Payment"',
          'See your child\'s current fee structure and installment schedule',
          'Outstanding amount highlighted in red — Due Date shown clearly',
          'Click "Pay Now" → redirected to the payment gateway',
          'Paid installments show a green tick — click to download the receipt PDF',
          'Share the receipt via WhatsApp or Email directly from the portal',
        ],
      },
      {
        title: '4. Communication',
        body: 'Message teachers directly and receive school announcements.',
        steps: [
          'Click "Communication"',
          'Inbox: school announcements, teacher messages, event reminders',
          'Click "New Message" → select teacher → type your message → Send',
          'Teachers reply within the platform — you get notified',
          'All conversations are private and archived',
        ],
      },
    ],
  },
];

const UserGuideView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const currentSection = sections.find(s => s.id === activeSection)!;

  const toggle = (key: string) => setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
          <i className="ri-book-open-line text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Guide</h1>
          <p className="text-sm text-slate-500 mt-0.5">Step-by-step instructions for every role on System4Learn</p>
        </div>
        <a
          href="https://system4learn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
        >
          <i className="ri-external-link-line" /> system4learn.com
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role selector */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">Select Role</p>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeSection === s.id
                  ? `${s.color} text-white shadow-md`
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <i className={`${s.icon} text-base flex-shrink-0`} />
              <span className="truncate">{s.role}</span>
              {activeSection === s.id && <i className="ri-arrow-right-s-line ml-auto" />}
            </button>
          ))}

          {/* Quick tips card */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
              <i className="ri-lightbulb-line" /> Quick Tips
            </p>
            <ul className="text-xs text-amber-700 space-y-1.5">
              <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line mt-0.5 flex-shrink-0" /> All demo accounts use any text as password</li>
              <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line mt-0.5 flex-shrink-0" /> Data resets on browser cache clear</li>
              <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line mt-0.5 flex-shrink-0" /> AI features need an API key in Settings</li>
              <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line mt-0.5 flex-shrink-0" /> Admin access: system4learn.com/#admin</li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-3">
          {/* Section header */}
          <div className={`${currentSection.lightColor} ${currentSection.borderColor} border rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${currentSection.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <i className={`${currentSection.icon} text-white text-xl`} />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold ${currentSection.textColor}`}>{currentSection.role}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {currentSection.content.length} module{currentSection.content.length !== 1 ? 's' : ''} documented below
              </p>
            </div>
          </div>

          {/* Accordion items */}
          {currentSection.content.map((item, idx) => {
            const key = `${activeSection}-${idx}`;
            const open = expandedItems[key] !== false; // open by default
            return (
              <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                  <i className={`ri-arrow-down-s-line text-xl text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
                    {item.body && (
                      <p className="text-sm text-slate-600 leading-relaxed pt-4">{item.body}</p>
                    )}
                    {item.table && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 mt-3">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              {item.table.headers.map(h => (
                                <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {item.table.rows.map((row, ri) => (
                              <tr key={ri} className="hover:bg-blue-50/30">
                                {row.map((cell, ci) => (
                                  <td key={ci} className={`px-4 py-3 text-sm ${ci === 0 ? 'font-semibold text-slate-800' : ci === 1 ? 'font-mono text-blue-600' : 'text-slate-600'}`}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {item.steps && item.steps.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step-by-Step</p>
                        <ol className="space-y-2">
                          {item.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-3">
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${currentSection.color} text-white text-xs font-bold flex items-center justify-center mt-0.5`}>
                                {si + 1}
                              </span>
                              <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserGuideView;
