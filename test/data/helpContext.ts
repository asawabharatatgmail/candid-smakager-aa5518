
export const CLASS_ADMIN_HELP_CONTEXT = `
# SAAA Platform: Class Admin Functionalities & Data Flow

This document outlines the core responsibilities, functionalities, and data interactions for the **Class Admin** role. This information is used by the AI Help assistant to answer your questions.

---

## 1. Core Responsibilities

The Class Admin is the primary operator for a specific institute. Their role is to manage the entire digital infrastructure of the institute on the SAAA platform. This includes managing branches, staff, students, academic structure, finances, and day-to-day operations.

---

## 2. Visual Data Flow

The platform is structured hierarchically. The Class Admin sits at the top level of the institute and manages interconnected entities.

- **Institute (Top Level)**
  - **Branding & Settings**: The Admin controls the institute's logo, name, and global settings like multi-branch functionality.
  - **Branches**: The Admin creates and manages all physical or logical branches of the institute.
    - **Users (Teachers, Branch Admins)**: Each user is associated with the institute and can be assigned to one or more branches.
    - **Students**: Each student belongs to the institute and is assigned to branches, classes, and subjects.
      - **Parents**: Parents are linked directly to students.
    - **Classes & Subjects**: These form the academic backbone and are available across branches.
  - **Finance**: The Admin defines fee structures and discounts at the institute level, which are then applied to students.
  - **Content Library**: A central repository for all educational materials, accessible to assigned teachers and students.
  - **Leads**: The lead management system captures potential new students for the institute.

---

## 3. Detailed Functionality Breakdown

### Dashboard
- **Purpose**: Provides a high-level, real-time overview of the institute's key metrics.
- **Features**:
  - View total number of branches, students, and teachers.
  - See a snapshot of month-to-date revenue.
  - Access personalized AI-powered insights and suggestions for improving operations.

### Branch Management
- **Purpose**: Manage the physical or logical locations of your institute.
- **Features**:
  - **Create New Branch**: Add a new branch with a name, location, and assigned head.
  - **View & Edit**: See a list of all branches and update their details.
  - **Delete**: Remove branches that are no longer active.
  - **Bulk Upload**: Add multiple branches at once using a CSV template.

### User Management
- **Purpose**: Onboard and manage staff accounts.
- **Features**:
  - **Create Users**: Add new Class Admins or Branch Admins.
  - **Manage Roles**: Assign appropriate permissions.
  - **Toggle Status**: Activate or deactivate user accounts.
  - **Reset Passwords**: Send password reset links to users.

### Student Management
- **Purpose**: Manage the complete lifecycle of a student.
- **Features**:
  - **Onboard Students**: Add new students individually or via CSV bulk upload.
  - **Manage Profiles**: Update student details, including contact information and parent/guardian data.
  - **Assign to Classes/Subjects**: Enroll students in the correct academic programs.
  - **Assign to Branches**: If multi-branch is enabled, assign students to their respective branches.
  - **Toggle Status**: Mark students as active or inactive.

### Teacher Management
- **Purpose**: Manage teacher profiles and their assignments.
- **Features**:
  - **Onboard Teachers**: Add new teachers and their contact details.
  - **Assign to Classes/Subjects**: Specify which classes and subjects a teacher is qualified for and assigned to teach.
  - **Toggle Status**: Activate or deactivate teacher accounts.

### Class & Subject Management
- **Purpose**: Define the academic structure of the institute.
- **Features**:
  - **Create Classes**: Define class groups (e.g., "Grade 10-A").
  - **Create Subjects**: Define subjects offered (e.g., "Physics", "Algebra").
  - **Link Teachers/Students**: Assign multiple teachers and students to classes.

### Content Library & Creator
- **Purpose**: A centralized hub for creating, managing, and distributing all learning materials.
- **Features**:
  - **AI Quiz Creator**: Generate MCQs or True/False quizzes on any topic.
  - **AI Flashcard Creator**: Generate flashcard sets for revision.
  - **AI Study Guide Creator**: Generate detailed study notes in markdown format.
  - **Upload Documents**: Add existing PDFs, Word documents, or presentations.
  - **Add Videos**: Link to educational videos from platforms like YouTube.
  - **Central Library**: All created content is stored in a filterable, searchable library accessible to authorized users.

### Lead Management
- **Purpose**: A CRM tool to track and convert prospective students.
- **Features**:
  - **Add Leads**: Manually add new leads or bulk upload from a CSV.
  - **Track Status**: Move leads through the pipeline (New, Contacted, Qualified, Lost).
  - **AI-Powered Communication**:
    - Generate personalized emails for leads based on their status and your objective.
    - Use pre-defined email templates for common scenarios.
  - **Set Reminders**: Schedule follow-up calls or tasks for each lead.
  - **AI Analytics**: Get an automated summary of lead performance, conversion rates, and actionable suggestions.

### Finance
- **Purpose**: Manage all financial aspects of the institute.
- **Features**:
  - **Fee Structures**: Create detailed fee plans for different classes or academic years.
  - **Discounts**: Create and manage various types of discounts (e.g., merit-based, sibling).
  - **Student Fee Profiles**: Assign fee structures and apply discounts to individual students.
  - **Payment Plans**: Set custom installment plans for students (e.g., 4 installments instead of 2).
  - **Track Payments**: (Functionality managed by parents, overseen by admin) View payment statuses for all students.

### Attendance
- **Purpose**: Track and manage daily student attendance.
- **Features**:
  - Select a class and date to view or mark attendance.
  - Mark students as Present, Absent, or Late.
  - Historical data is saved for reporting.

### Scheduler
- **Purpose**: Create and manage weekly class timetables.
- **Features**:
  - **AI Scheduling Assistant**: Define rules (e.g., "Physics 3 times a week") and let the AI generate an optimized, conflict-free schedule.
  - **Manual Adjustment**: Drag and drop lectures to different time slots or days to make manual changes.
  - **Class-specific Views**: View the schedule for each class individually.

### Branding & Settings
- **Purpose**: Customize the platform to match your institute's identity.
- **Features**:
  - **Branding**: Set the institute's name, logo, tagline, and address, which appear in the sidebar and on receipts.
  - **Settings**: Enable or disable features like the multi-branch system.
`;

export const STUDENT_HELP_CONTEXT = `
# SAAA Platform: Student Help Guide

This document explains the features available to you as a **Student**. Use this guide or ask me, your AI assistant, any questions about how to use the platform.

---

## 1. Your Dashboard

Your central hub for everything.
- **Welcome Message**: Greets you and shows a quick summary.
- **Thought of the Day & AI Insights**: Get daily motivation and personalized study tips.
- **Quick Access**: See available Quizzes, Flashcard Sets, and your saved Study Materials. You can start any activity directly from here.

---

## 2. Navigating the Platform

Use the sidebar to access all your features:

- **My Courses**: View all the subjects you are enrolled in, like Physics or Algebra. See a mock progress bar for each.
- **Assignments & Tests**: This is where you find all your assigned quizzes and tests. They are split into "New & Pending" and "Completed" tabs.
- **My Progress**: Get a visual overview of your performance. See mock charts for your recent quiz scores and your mastery level in different subjects.
- **My Notes**: This section holds all the study guides you have personally created and saved using the "AI Study Tool".
- **AI Study Tool**: Your personal study assistant!
  - **How to use**: Enter a topic you want to learn about (e.g., "Mitochondria"), specify your grade level, and choose a difficulty.
  - **What it does**: The AI generates a detailed, well-structured study guide with headings, bullet points, and key information, formatted for easy reading. You can save this guide to your "My Notes" section.
- **My Profile**: View your personal details, enrolled subjects, and your parent/guardian's contact information on file.

---

## 3. How can I help?

You can ask me questions like:
- "How do I create a study guide?"
- "Where can I find my quizzes?"
- "What's on the 'My Progress' page?"
- "How do I check my profile details?"
`;

export const TEACHER_HELP_CONTEXT = `
# SAAA Platform: Teacher Help Guide

This document explains the features available to you as a **Teacher**. Use this guide or ask me, your AI assistant, any questions about how to use the platform to manage your classes and content.

---

## 1. Your Dashboard & Workspace

Your dashboard is your starting point.
- **Workspace Context Selector**: This is a critical feature! Before creating content, select the **Class** and **Subject** you are creating it for. This ensures your new quizzes or notes are correctly categorized and assigned.
- **Personalized Insights**: Get AI-powered tips to improve your teaching and content creation.
- **My Content Overview**: See a quick list of quizzes and flashcards you've recently created.

---

## 2. Core Functionalities

Use the sidebar to access all your tools:

- **My Classes**: View a list of all classes you are assigned to, along with the number of students in each.
- **Content Library**: Access the entire institute's library of educational materials. You can search and filter for quizzes, study guides, videos, and documents created by you or other teachers.
- **Content Creator**: Your primary tool for building learning materials. It has several AI-powered modules:
  - **Quiz Creator**: Generate Multiple Choice or True/False quizzes. Just provide a topic, number of questions, and difficulty.
  - **Flashcard Creator**: Create sets of digital flashcards for revision.
  - **Study Guide Creator**: Generate detailed study notes on any topic for your students.
  - **Upload Document / Add Video**: Add existing materials like PDFs, worksheets, or links to YouTube videos.
- **Assignments & Tests**: This is where your students will see the quizzes and tests you create and assign.
- **Attendance**: Mark daily attendance for your classes. Select a class and date, then mark each student as Present, Absent, or Late.
- **Scheduler**: View your personal weekly teaching schedule.

---

## 3. How can I help?

You can ask me questions like:
- "How do I create a quiz about the solar system?"
- "Why do I need to select a class in the workspace context?"
- "Where can I find content created by other teachers?"
- "How do I mark attendance?"
`;

export const PARENT_HELP_CONTEXT = `
# SAAA Platform: Parent Help Guide

Welcome! This document explains the features available to you as a **Parent**. My purpose is to help you easily navigate the platform and stay informed about your child's academic journey.

---

## 1. Your Dashboard

This is your main screen, giving you a quick summary of your child's status.
- **Welcome Message**: Shows you whose dashboard you're viewing (e.g., "Alex's Dashboard").
- **Quick Cards**: One-click access to the main sections: Child's Progress, Fee Payment, and Communication.
- **AI Insights**: Get helpful tips about supporting your child's learning.

---

## 2. Key Features Explained

Use the sidebar to access these sections:

- **Child's Progress**:
  - **Summary**: See at-a-glance information on overall attendance percentage, average test scores, and the number of assignments currently due.
  - **Recent Scores**: View a list of recent tests, projects, or quizzes and the scores your child achieved.

- **Fee Payment**:
  - **Financial Summary**: View the total academic fee, any applied discounts, and the final net payable amount for the year.
  - **Installment Plan**: See a clear table of all fee installments, including due dates, amounts, and their current status (e.g., Pending, Paid, Overdue).
  - **Pay Fees**: A "Pay Now" button will appear for any pending or overdue installments (this is a mock feature for demonstration).
  - **Payment History**: Review a list of all past payments. You can click on a receipt number to view and download a detailed PDF receipt for your records.

- **Communication**:
  - **Chat Interface**: Use the built-in messenger to communicate directly and securely with your child's teachers. Select a contact to view your conversation history and send new messages.

---

## 3. How can I help?

You can ask me questions like:
- "Where can I see my child's test scores?"
- "How do I download a fee receipt?"
- "How do I send a message to a teacher?"
- "What does 'Net Payable' mean on the fee page?"
`;

export const PRODUCT_OWNER_HELP_CONTEXT = `
# SAAA Platform: Product Owner Help Guide

This document outlines the core functionalities for the **Product Owner** role.

---

## 1. Core Responsibilities

As the Product Owner, you have the highest level of administrative access. Your primary responsibilities are to oversee all client institutes, manage their subscriptions, and monitor the overall health of the platform.

---

## 2. Key Features Explained

- **Dashboard**: Provides a high-level overview of the entire platform, including the number of active institutes, total licensed users (teachers and admins), and total user count.

- **Institute Management**: This is your main control panel for managing client institutes.
  - **Create & Edit**: Onboard new institutes by providing their details and subscription plan. You can edit any existing institute's information, including their branding (logo, tagline) and subscription settings.
  - **Subscription Control**: Activate, deactivate, or change subscription details like expiry date, AI feature enablement, and license counts (max teachers, max branch admins).
  - **Password Resets**: You can trigger a password reset for an institute's primary administrator.

- **System Health**: A real-time dashboard to monitor the status of all critical platform services.
  - **Service Status**: Check if services like the Web Application, API Gateway, Cloud SQL Databases, and AI Services are Operational, Degraded, or Offline.
  - **Troubleshooting**: Use this view to quickly identify any system-wide issues.

- **Payment Gateway**: Configure payment gateway settings (e.g., PhonePe) for any institute on the platform.

- **Institute Switcher**: Located in the header, this dropdown allows you to view the platform from the perspective of a specific institute's Class Admin, which is useful for support and verification purposes.

---

## 3. How can I help?
You can ask me questions like:
- "How do I add a new institute?"
- "Where can I change the subscription for a client?"
- "What does the System Health page show?"
`;

export const BRANCH_ADMIN_HELP_CONTEXT = `
# SAAA Platform: Branch Admin Help Guide

This document explains the features available to you as a **Branch Admin**. Your role is to manage the day-to-day operations of your specific branch.

---

## 1. Core Responsibilities

You are responsible for managing the students, teachers, classes, and attendance specifically within the branch(es) you are assigned to. Your view is automatically filtered to show only relevant data.

---

## 2. Key Features Explained

- **Dashboard**: Your dashboard provides quick links to all your management sections.

- **Student Management**:
  - **View Students**: See a list of all students enrolled in your branch.
  - **Manage Profiles**: You can view and manage student details.
  - **Note**: You will only see students associated with your branch.

- **Teacher Management**:
  - **View Teachers**: See a list of all teachers assigned to your branch.
  - **Manage Profiles**: View teacher assignments and details.

- **Class Management**:
  - **View Classes**: See all classes that are active within your branch.
  - **Manage Rosters**: View which students and teachers are part of each class.

- **Attendance**:
  - **Track Attendance**: Mark and review daily attendance for all classes within your branch. You can select a class and a date to manage the records.

---

## 3. How can I help?
You can ask me questions like:
- "How do I see the list of students in my branch?"
- "Where do I take attendance for Grade 10-A?"
- "Can I see teachers from other branches?" (The answer is no, your view is scoped).
`;
