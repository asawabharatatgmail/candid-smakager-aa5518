import { UserRole, RoleConfig } from '../types';

// ─── SEED VERSION — bump this to force a full data reset on next load ───────
export const SEED_VERSION = 'v7';

// ─── IDS ─────────────────────────────────────────────────────────────────────
export const DEMO_INSTITUTE_ID = 'inst_demo';
export const DEMO_BRANCH_ID   = 'branch_main';

// ─── INSTITUTES ──────────────────────────────────────────────────────────────
export const SEED_INSTITUTES = [
  {
    id: DEMO_INSTITUTE_ID,
    name: 'System4Learn Demo Institute',
    adminEmail: 'admin@demo.com',
    adminMobile: '9000000001',
    address: '42 Knowledge Park, Sector 18, Learning City – 400001',
    tagline: 'Where Knowledge Meets Innovation',
    packageId: 'package_premium_initial',
    activeAddonIds: ['addon_ai', 'addon_business'],
    subscriptionStatus: 'active',
    subscriptionExpiry: '2027-12-31',
  },
];

// ─── BRANCHES ────────────────────────────────────────────────────────────────
export const SEED_BRANCHES = [
  { id: DEMO_BRANCH_ID,    name: 'Main Campus',  location: 'Sector 18, Downtown',  head: 'Dr. Priya Sharma',   instituteId: DEMO_INSTITUTE_ID },
  { id: 'branch_north',   name: 'North Campus', location: 'North City, Block 4',  head: 'Mr. Amit Verma',     instituteId: DEMO_INSTITUTE_ID },
  { id: 'branch_south',   name: 'South Campus', location: 'South Avenue, Lane 2', head: 'Ms. Kavitha Nair',   instituteId: DEMO_INSTITUTE_ID },
];

// ─── SUBJECTS ────────────────────────────────────────────────────────────────
export const SEED_SUBJECTS = [
  { id: 'sub_math',   name: 'Mathematics',       category: 'Science',    instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_phy',    name: 'Physics',            category: 'Science',    instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_chem',   name: 'Chemistry',          category: 'Science',    instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_bio',    name: 'Biology',            category: 'Science',    instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_eng',    name: 'English',            category: 'Language',   instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_hindi',  name: 'Hindi',              category: 'Language',   instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_hist',   name: 'History',            category: 'Humanities', instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_cs',     name: 'Computer Science',   category: 'Technology', instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_geo',    name: 'Geography',          category: 'Humanities', instituteId: DEMO_INSTITUTE_ID },
  { id: 'sub_eco',    name: 'Economics',          category: 'Commerce',   instituteId: DEMO_INSTITUTE_ID },
];

// ─── CLASSES ─────────────────────────────────────────────────────────────────
export const SEED_CLASSES = [
  { id: 'class_9a',  name: 'Class 9-A',  teacherIds: ['teacher_1','teacher_2'], studentIds: ['student_1','student_2','student_3','student_4','student_5'], instituteId: DEMO_INSTITUTE_ID },
  { id: 'class_9b',  name: 'Class 9-B',  teacherIds: ['teacher_2','teacher_3'], studentIds: ['student_6','student_7','student_8'], instituteId: DEMO_INSTITUTE_ID },
  { id: 'class_10a', name: 'Class 10-A', teacherIds: ['teacher_1','teacher_4'], studentIds: ['student_9','student_10','student_11','student_12'], instituteId: DEMO_INSTITUTE_ID },
  { id: 'class_10b', name: 'Class 10-B', teacherIds: ['teacher_2','teacher_5'], studentIds: ['student_13','student_14','student_15'], instituteId: DEMO_INSTITUTE_ID },
  { id: 'class_11a', name: 'Class 11-A', teacherIds: ['teacher_3','teacher_4'], studentIds: [], instituteId: DEMO_INSTITUTE_ID },
  { id: 'class_12a', name: 'Class 12-A', teacherIds: ['teacher_5'],             studentIds: [], instituteId: DEMO_INSTITUTE_ID },
];

// ─── USERS (admin staff) ─────────────────────────────────────────────────────
export const SEED_USERS = [
  {
    id: 'user_class_admin',
    name: 'Rahul Mehta',
    email: 'admin@demo.com',
    mobile: '9000000001',
    role: UserRole.ClassAdmin,
    status: 'active',
    instituteId: DEMO_INSTITUTE_ID,
    branchIds: [DEMO_BRANCH_ID, 'branch_north', 'branch_south'],
  },
  {
    id: 'user_branch_admin',
    name: 'Priya Sharma',
    email: 'branch@demo.com',
    mobile: '9000000002',
    role: UserRole.BranchAdmin,
    status: 'active',
    instituteId: DEMO_INSTITUTE_ID,
    branchIds: [DEMO_BRANCH_ID],
  },
  {
    id: 'user_branch_admin_north',
    name: 'Amit Verma',
    email: 'north@demo.com',
    mobile: '9000000008',
    role: UserRole.BranchAdmin,
    status: 'active',
    instituteId: DEMO_INSTITUTE_ID,
    branchIds: ['branch_north'],
  },
];

// ─── TEACHERS ────────────────────────────────────────────────────────────────
export const SEED_TEACHERS = [
  {
    id: 'teacher_1',
    name: 'Dr. Anita Desai',
    email: 'teacher@demo.com',
    mobile: '9100000001',
    subjectIds: ['sub_math', 'sub_phy'],
    classIds: ['class_9a', 'class_10a'],
    branchIds: [DEMO_BRANCH_ID],
    status: 'active',
    role: UserRole.Teacher,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'teacher_2',
    name: 'Mr. Suresh Rajan',
    email: 'suresh@demo.com',
    mobile: '9100000002',
    subjectIds: ['sub_eng', 'sub_hindi'],
    classIds: ['class_9a', 'class_9b', 'class_10b'],
    branchIds: [DEMO_BRANCH_ID, 'branch_north'],
    status: 'active',
    role: UserRole.Teacher,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'teacher_3',
    name: 'Ms. Meena Pillai',
    email: 'meena@demo.com',
    mobile: '9100000003',
    subjectIds: ['sub_bio', 'sub_chem'],
    classIds: ['class_9b', 'class_11a'],
    branchIds: [DEMO_BRANCH_ID],
    status: 'active',
    role: UserRole.Teacher,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'teacher_4',
    name: 'Mr. Kiran Bhat',
    email: 'kiran@demo.com',
    mobile: '9100000004',
    subjectIds: ['sub_cs', 'sub_math'],
    classIds: ['class_10a', 'class_11a'],
    branchIds: ['branch_north'],
    status: 'active',
    role: UserRole.Teacher,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'teacher_5',
    name: 'Ms. Divya Nair',
    email: 'divya@demo.com',
    mobile: '9100000005',
    subjectIds: ['sub_hist', 'sub_geo', 'sub_eco'],
    classIds: ['class_10b', 'class_12a'],
    branchIds: ['branch_south'],
    status: 'active',
    role: UserRole.Teacher,
    instituteId: DEMO_INSTITUTE_ID,
  },
];

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const SEED_STUDENTS = [
  // Class 9-A
  { id: 'student_1',  name: 'Arjun Kumar',    email: 'student@demo.com',   mobile: '9200000001', classId: 'class_9a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_phy','sub_eng','sub_cs'],          status: 'active', parentName: 'Vikram Kumar',    parentEmail: 'parent@demo.com',      parentMobile: '9300000001', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_2',  name: 'Sneha Patel',    email: 'sneha@demo.com',     mobile: '9200000002', classId: 'class_9a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_bio','sub_eng','sub_hindi'],        status: 'active', parentName: 'Ravi Patel',      parentEmail: 'ravi.parent@demo.com',  parentMobile: '9300000002', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_3',  name: 'Rohan Sharma',   email: 'rohan.s@demo.com',   mobile: '9200000003', classId: 'class_9a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_phy','sub_chem','sub_eng'],        status: 'active', parentName: 'Deepak Sharma',   parentEmail: 'deepak@demo.com',      parentMobile: '9300000003', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_4',  name: 'Priya Iyer',     email: 'priya.i@demo.com',   mobile: '9200000004', classId: 'class_9a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_eng','sub_hindi','sub_hist','sub_geo'],       status: 'active', parentName: 'Suresh Iyer',     parentEmail: 'suresh.iyer@demo.com', parentMobile: '9300000004', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_5',  name: 'Aditya Gupta',   email: 'aditya@demo.com',    mobile: '9200000005', classId: 'class_9a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_cs','sub_eng','sub_eco'],          status: 'active', parentName: 'Manoj Gupta',     parentEmail: 'manoj@demo.com',       parentMobile: '9300000005', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  // Class 9-B
  { id: 'student_6',  name: 'Kavya Menon',    email: 'kavya@demo.com',     mobile: '9200000006', classId: 'class_9b', branchIds: ['branch_north'], subjectIds: ['sub_bio','sub_chem','sub_eng','sub_hindi'],       status: 'active', parentName: 'Rajesh Menon',    parentEmail: 'rajesh@demo.com',      parentMobile: '9300000006', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_7',  name: 'Nikhil Joshi',   email: 'nikhil@demo.com',    mobile: '9200000007', classId: 'class_9b', branchIds: ['branch_north'], subjectIds: ['sub_math','sub_phy','sub_cs','sub_eng'],          status: 'active', parentName: 'Anil Joshi',      parentEmail: 'anil@demo.com',        parentMobile: '9300000007', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_8',  name: 'Shreya Singh',   email: 'shreya@demo.com',    mobile: '9200000008', classId: 'class_9b', branchIds: ['branch_north'], subjectIds: ['sub_hist','sub_geo','sub_eco','sub_eng'],         status: 'active', parentName: 'Ramesh Singh',    parentEmail: 'ramesh@demo.com',      parentMobile: '9300000008', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  // Class 10-A
  { id: 'student_9',  name: 'Vikram Reddy',   email: 'vikram@demo.com',    mobile: '9200000009', classId: 'class_10a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_phy','sub_chem','sub_cs'],        status: 'active', parentName: 'Krishna Reddy',   parentEmail: 'krishna@demo.com',     parentMobile: '9300000009', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_10', name: 'Ananya Roy',     email: 'ananya@demo.com',    mobile: '9200000010', classId: 'class_10a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_bio','sub_chem','sub_eng','sub_hindi'],      status: 'active', parentName: 'Subir Roy',       parentEmail: 'subir@demo.com',       parentMobile: '9300000010', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_11', name: 'Rahul Das',      email: 'rahul.d@demo.com',   mobile: '9200000011', classId: 'class_10a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_math','sub_cs','sub_eco','sub_eng'],         status: 'active', parentName: 'Sunil Das',       parentEmail: 'sunil@demo.com',       parentMobile: '9300000011', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_12', name: 'Pooja Mishra',   email: 'pooja@demo.com',     mobile: '9200000012', classId: 'class_10a', branchIds: [DEMO_BRANCH_ID], subjectIds: ['sub_hist','sub_geo','sub_eco','sub_hindi'],      status: 'active', parentName: 'Girish Mishra',   parentEmail: 'girish@demo.com',      parentMobile: '9300000012', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  // Class 10-B
  { id: 'student_13', name: 'Siddharth Rao',  email: 'sid@demo.com',       mobile: '9200000013', classId: 'class_10b', branchIds: ['branch_south'], subjectIds: ['sub_math','sub_phy','sub_chem','sub_eng'],       status: 'active', parentName: 'Nagesh Rao',      parentEmail: 'nagesh@demo.com',      parentMobile: '9300000013', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_14', name: 'Tanvi Shah',     email: 'tanvi@demo.com',     mobile: '9200000014', classId: 'class_10b', branchIds: ['branch_south'], subjectIds: ['sub_eco','sub_hist','sub_eng','sub_hindi'],      status: 'active', parentName: 'Nilesh Shah',     parentEmail: 'nilesh@demo.com',      parentMobile: '9300000014', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
  { id: 'student_15', name: 'Aryan Kapoor',   email: 'aryan@demo.com',     mobile: '9200000015', classId: 'class_10b', branchIds: ['branch_south'], subjectIds: ['sub_math','sub_cs','sub_geo','sub_eng'],         status: 'active', parentName: 'Vikas Kapoor',    parentEmail: 'vikas@demo.com',       parentMobile: '9300000015', role: UserRole.Student, instituteId: DEMO_INSTITUTE_ID },
];

// ─── FEE STRUCTURES ──────────────────────────────────────────────────────────
export const SEED_FEE_STRUCTURES = [
  {
    id: 'fee_struct_9',
    name: 'Class 9 Annual Fee 2025-26',
    academicYear: '2025-26',
    totalAmount: 45000,
    classId: 'class_9a',
    branchId: DEMO_BRANCH_ID,
    paymentMode: 'Installments',
    installments: [
      { name: 'First Term', percentage: 40, dueDate: '2025-06-15' },
      { name: 'Second Term', percentage: 30, dueDate: '2025-10-15' },
      { name: 'Third Term', percentage: 30, dueDate: '2026-01-15' },
    ],
    lateFeePerDay: 50,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'fee_struct_10',
    name: 'Class 10 Annual Fee 2025-26',
    academicYear: '2025-26',
    totalAmount: 55000,
    classId: 'class_10a',
    branchId: DEMO_BRANCH_ID,
    paymentMode: 'Installments',
    installments: [
      { name: 'First Term',  percentage: 50, dueDate: '2025-06-15' },
      { name: 'Second Term', percentage: 50, dueDate: '2025-11-15' },
    ],
    lateFeePerDay: 75,
    instituteId: DEMO_INSTITUTE_ID,
  },
  {
    id: 'fee_struct_10b',
    name: 'Class 10-B Annual Fee 2025-26',
    academicYear: '2025-26',
    totalAmount: 55000,
    classId: 'class_10b',
    branchId: 'branch_south',
    paymentMode: 'Lumpsum',
    installments: [
      { name: 'Full Year', percentage: 100, dueDate: '2025-07-01' },
    ],
    lateFeePerDay: 75,
    instituteId: DEMO_INSTITUTE_ID,
  },
];

// ─── DISCOUNTS ───────────────────────────────────────────────────────────────
export const SEED_DISCOUNTS = [
  { id: 'disc_1', name: 'Sibling Discount',    type: 'Percentage',    value: 10, instituteId: DEMO_INSTITUTE_ID },
  { id: 'disc_2', name: 'Merit Scholarship',   type: 'Percentage',    value: 15, instituteId: DEMO_INSTITUTE_ID },
  { id: 'disc_3', name: 'Early Bird',          type: 'Fixed Amount',  value: 2000, instituteId: DEMO_INSTITUTE_ID },
  { id: 'disc_4', name: 'Staff Ward',          type: 'Percentage',    value: 25, instituteId: DEMO_INSTITUTE_ID },
];

// ─── FEE RECEIPTS ────────────────────────────────────────────────────────────
// Must match FeeReceipt type: { id, receiptNumber, studentId, paymentDate, amountPaid, paymentMode, paidFor, breakdown }
export const SEED_FEE_RECEIPTS = [
  { id:'rcpt_1',  receiptNumber:'RCP-2526-001', studentId:'student_1',  paymentDate:'2025-06-10', amountPaid:18000, paymentMode:'Online'       as const, paidFor:'Installment 1 — Class 9 Fee 2025-26', breakdown:[{description:'First Term (40%)',  amount:18000}] },
  { id:'rcpt_2',  receiptNumber:'RCP-2526-002', studentId:'student_1',  paymentDate:'2025-10-08', amountPaid:13500, paymentMode:'Online'       as const, paidFor:'Installment 2 — Class 9 Fee 2025-26', breakdown:[{description:'Second Term (30%)', amount:13500}] },
  { id:'rcpt_3',  receiptNumber:'RCP-2526-003', studentId:'student_1',  paymentDate:'2026-01-05', amountPaid:13500, paymentMode:'Online'       as const, paidFor:'Installment 3 — Class 9 Fee 2025-26', breakdown:[{description:'Third Term (30%)',  amount:13500}] },
  { id:'rcpt_4',  receiptNumber:'RCP-2526-004', studentId:'student_2',  paymentDate:'2025-06-12', amountPaid:15300, paymentMode:'Cash'         as const, paidFor:'Installment 1 — Class 9 Fee 2025-26', breakdown:[{description:'First Term (40%)', amount:18000},{description:'Merit Scholarship (15%)', amount:-2700}] },
  { id:'rcpt_5',  receiptNumber:'RCP-2526-005', studentId:'student_4',  paymentDate:'2025-06-01', amountPaid:43000, paymentMode:'Online'       as const, paidFor:'Lumpsum — Class 9 Fee 2025-26',       breakdown:[{description:'Annual Fee', amount:45000},{description:'Early Bird Discount', amount:-2000}] },
  { id:'rcpt_6',  receiptNumber:'RCP-2526-006', studentId:'student_5',  paymentDate:'2025-06-15', amountPaid:22500, paymentMode:'Cheque'       as const, paidFor:'Installment 1 — Class 9 Fee 2025-26', breakdown:[{description:'First Term (50%)', amount:22500}] },
  { id:'rcpt_7',  receiptNumber:'RCP-2526-007', studentId:'student_9',  paymentDate:'2025-06-10', amountPaid:27500, paymentMode:'Online'       as const, paidFor:'Installment 1 — Class 10 Fee 2025-26',breakdown:[{description:'First Term (50%)', amount:27500}] },
  { id:'rcpt_8',  receiptNumber:'RCP-2526-008', studentId:'student_9',  paymentDate:'2025-11-10', amountPaid:27500, paymentMode:'Online'       as const, paidFor:'Installment 2 — Class 10 Fee 2025-26',breakdown:[{description:'Second Term (50%)',amount:27500}] },
  { id:'rcpt_9',  receiptNumber:'RCP-2526-009', studentId:'student_10', paymentDate:'2025-06-18', amountPaid:24750, paymentMode:'Cash'         as const, paidFor:'Installment 1 — Class 10 Fee 2025-26',breakdown:[{description:'First Term (50%)', amount:27500},{description:'Sibling Discount (10%)', amount:-2750}] },
  { id:'rcpt_10', receiptNumber:'RCP-2526-010', studentId:'student_12', paymentDate:'2025-06-14', amountPaid:27500, paymentMode:'Online'       as const, paidFor:'Installment 1 — Class 10 Fee 2025-26',breakdown:[{description:'First Term (50%)', amount:27500}] },
  { id:'rcpt_11', receiptNumber:'RCP-2526-011', studentId:'student_12', paymentDate:'2025-11-12', amountPaid:27500, paymentMode:'Online'       as const, paidFor:'Installment 2 — Class 10 Fee 2025-26',breakdown:[{description:'Second Term (50%)',amount:27500}] },
  { id:'rcpt_12', receiptNumber:'RCP-2526-012', studentId:'student_13', paymentDate:'2025-07-01', amountPaid:55000, paymentMode:'Online'       as const, paidFor:'Lumpsum — Class 10-B Fee 2025-26',    breakdown:[{description:'Full Year',  amount:55000}] },
  { id:'rcpt_13', receiptNumber:'RCP-2526-013', studentId:'student_15', paymentDate:'2025-07-04', amountPaid:23375, paymentMode:'Online'       as const, paidFor:'Installment 1 — Class 10-B Fee 2025-26',breakdown:[{description:'First Term (50%)', amount:27500},{description:'Merit Scholarship (15%)', amount:-4125}] },
];

// ─── STUDENT FEE PROFILES ────────────────────────────────────────────────────
// Must match StudentFeeProfile type: { id, studentId, academicYear, feeStructureId, totalFee, totalDiscount, netPayable, installments: Installment[], appliedDiscounts }
export const SEED_STUDENT_FEE_PROFILES = [
  // student_1 — Class 9-A — Fully Paid (3 installments)
  { id:'sfp_student_1', studentId:'student_1', academicYear:'2025-26', feeStructureId:'fee_struct_9', totalFee:45000, totalDiscount:0, netPayable:45000, appliedDiscounts:[],
    installments:[
      { id:'inst_s1_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:18000, amountPaid:18000, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-10', receiptId:'rcpt_1' },
      { id:'inst_s1_2', installmentNumber:2, dueDate:'2025-10-15', amountDue:13500, amountPaid:13500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-10-08', receiptId:'rcpt_2' },
      { id:'inst_s1_3', installmentNumber:3, dueDate:'2026-01-15', amountDue:13500, amountPaid:13500, lateFeeApplied:0, status:'Paid', paymentDate:'2026-01-05', receiptId:'rcpt_3' },
    ]},
  // student_2 — Class 9-A — Merit 15% discount — Partially Paid
  { id:'sfp_student_2', studentId:'student_2', academicYear:'2025-26', feeStructureId:'fee_struct_9', totalFee:45000, totalDiscount:6750, netPayable:38250,
    appliedDiscounts:[{discountId:'disc_2', name:'Merit Scholarship', appliedAmount:6750}],
    installments:[
      { id:'inst_s2_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:15300, amountPaid:15300, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-12', receiptId:'rcpt_4' },
      { id:'inst_s2_2', installmentNumber:2, dueDate:'2025-10-15', amountDue:11475, amountPaid:0, lateFeeApplied:0, status:'Overdue' },
      { id:'inst_s2_3', installmentNumber:3, dueDate:'2026-01-15', amountDue:11475, amountPaid:0, lateFeeApplied:0, status:'Pending' },
    ]},
  // student_3 — Class 9-A — No payment yet
  { id:'sfp_student_3', studentId:'student_3', academicYear:'2025-26', feeStructureId:'fee_struct_9', totalFee:45000, totalDiscount:0, netPayable:45000, appliedDiscounts:[],
    installments:[
      { id:'inst_s3_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:18000, amountPaid:0, lateFeeApplied:500, status:'Overdue' },
      { id:'inst_s3_2', installmentNumber:2, dueDate:'2025-10-15', amountDue:13500, amountPaid:0, lateFeeApplied:0,   status:'Overdue' },
      { id:'inst_s3_3', installmentNumber:3, dueDate:'2026-01-15', amountDue:13500, amountPaid:0, lateFeeApplied:0,   status:'Pending' },
    ]},
  // student_4 — Class 9-A — Early Bird ₹2000 — Fully Paid lumpsum
  { id:'sfp_student_4', studentId:'student_4', academicYear:'2025-26', feeStructureId:'fee_struct_9', totalFee:45000, totalDiscount:2000, netPayable:43000,
    appliedDiscounts:[{discountId:'disc_3', name:'Early Bird', appliedAmount:2000}],
    installments:[
      { id:'inst_s4_1', installmentNumber:1, dueDate:'2025-06-01', amountDue:43000, amountPaid:43000, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-01', receiptId:'rcpt_5' },
    ]},
  // student_5 — Class 9-A — Partially paid (1 of 2)
  { id:'sfp_student_5', studentId:'student_5', academicYear:'2025-26', feeStructureId:'fee_struct_9', totalFee:45000, totalDiscount:0, netPayable:45000, appliedDiscounts:[],
    installments:[
      { id:'inst_s5_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:22500, amountPaid:22500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-15', receiptId:'rcpt_6' },
      { id:'inst_s5_2', installmentNumber:2, dueDate:'2025-11-15', amountDue:22500, amountPaid:0,     lateFeeApplied:0, status:'Overdue' },
    ]},
  // student_9 — Class 10-A — Fully Paid
  { id:'sfp_student_9', studentId:'student_9', academicYear:'2025-26', feeStructureId:'fee_struct_10', totalFee:55000, totalDiscount:0, netPayable:55000, appliedDiscounts:[],
    installments:[
      { id:'inst_s9_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:27500, amountPaid:27500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-10', receiptId:'rcpt_7' },
      { id:'inst_s9_2', installmentNumber:2, dueDate:'2025-11-15', amountDue:27500, amountPaid:27500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-11-10', receiptId:'rcpt_8' },
    ]},
  // student_10 — Class 10-A — Sibling 10% — Partially paid
  { id:'sfp_student_10', studentId:'student_10', academicYear:'2025-26', feeStructureId:'fee_struct_10', totalFee:55000, totalDiscount:5500, netPayable:49500,
    appliedDiscounts:[{discountId:'disc_1', name:'Sibling Discount', appliedAmount:5500}],
    installments:[
      { id:'inst_s10_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:24750, amountPaid:24750, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-18', receiptId:'rcpt_9' },
      { id:'inst_s10_2', installmentNumber:2, dueDate:'2025-11-15', amountDue:24750, amountPaid:0,     lateFeeApplied:0, status:'Overdue' },
    ]},
  // student_11 — Class 10-A — No payment
  { id:'sfp_student_11', studentId:'student_11', academicYear:'2025-26', feeStructureId:'fee_struct_10', totalFee:55000, totalDiscount:0, netPayable:55000, appliedDiscounts:[],
    installments:[
      { id:'inst_s11_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:27500, amountPaid:0, lateFeeApplied:750, status:'Overdue' },
      { id:'inst_s11_2', installmentNumber:2, dueDate:'2025-11-15', amountDue:27500, amountPaid:0, lateFeeApplied:0,   status:'Overdue' },
    ]},
  // student_12 — Class 10-A — Fully Paid
  { id:'sfp_student_12', studentId:'student_12', academicYear:'2025-26', feeStructureId:'fee_struct_10', totalFee:55000, totalDiscount:0, netPayable:55000, appliedDiscounts:[],
    installments:[
      { id:'inst_s12_1', installmentNumber:1, dueDate:'2025-06-15', amountDue:27500, amountPaid:27500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-06-14', receiptId:'rcpt_10' },
      { id:'inst_s12_2', installmentNumber:2, dueDate:'2025-11-15', amountDue:27500, amountPaid:27500, lateFeeApplied:0, status:'Paid', paymentDate:'2025-11-12', receiptId:'rcpt_11' },
    ]},
  // student_13 — Class 10-B — Lumpsum Fully Paid
  { id:'sfp_student_13', studentId:'student_13', academicYear:'2025-26', feeStructureId:'fee_struct_10b', totalFee:55000, totalDiscount:0, netPayable:55000, appliedDiscounts:[],
    installments:[
      { id:'inst_s13_1', installmentNumber:1, dueDate:'2025-07-01', amountDue:55000, amountPaid:55000, lateFeeApplied:0, status:'Paid', paymentDate:'2025-07-01', receiptId:'rcpt_12' },
    ]},
  // student_14 — Class 10-B — Not paid
  { id:'sfp_student_14', studentId:'student_14', academicYear:'2025-26', feeStructureId:'fee_struct_10b', totalFee:55000, totalDiscount:0, netPayable:55000, appliedDiscounts:[],
    installments:[
      { id:'inst_s14_1', installmentNumber:1, dueDate:'2025-07-01', amountDue:55000, amountPaid:0, lateFeeApplied:1500, status:'Overdue' },
    ]},
  // student_15 — Class 10-B — Merit 15% — Partially paid
  { id:'sfp_student_15', studentId:'student_15', academicYear:'2025-26', feeStructureId:'fee_struct_10b', totalFee:55000, totalDiscount:8250, netPayable:46750,
    appliedDiscounts:[{discountId:'disc_2', name:'Merit Scholarship', appliedAmount:8250}],
    installments:[
      { id:'inst_s15_1', installmentNumber:1, dueDate:'2025-07-01', amountDue:23375, amountPaid:23375, lateFeeApplied:0, status:'Paid', paymentDate:'2025-07-04', receiptId:'rcpt_13' },
      { id:'inst_s15_2', installmentNumber:2, dueDate:'2025-12-01', amountDue:23375, amountPaid:0,     lateFeeApplied:0, status:'Overdue' },
    ]},
];

// ─── SCHEDULE EVENTS ─────────────────────────────────────────────────────────
export const SEED_SCHEDULE_EVENTS = [
  // Class 9-A
  { id:'sch_1',  classId:'class_9a',  subjectId:'sub_math', teacherId:'teacher_1', day:'Monday',    startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_2',  classId:'class_9a',  subjectId:'sub_phy',  teacherId:'teacher_1', day:'Monday',    startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_3',  classId:'class_9a',  subjectId:'sub_eng',  teacherId:'teacher_2', day:'Tuesday',   startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_4',  classId:'class_9a',  subjectId:'sub_cs',   teacherId:'teacher_1', day:'Wednesday', startTime:'11:00', endTime:'12:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_5',  classId:'class_9a',  subjectId:'sub_hindi',teacherId:'teacher_2', day:'Thursday',  startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_6',  classId:'class_9a',  subjectId:'sub_math', teacherId:'teacher_1', day:'Friday',    startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
  // Class 10-A
  { id:'sch_7',  classId:'class_10a', subjectId:'sub_math', teacherId:'teacher_1', day:'Monday',    startTime:'11:00', endTime:'12:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_8',  classId:'class_10a', subjectId:'sub_phy',  teacherId:'teacher_1', day:'Tuesday',   startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_9',  classId:'class_10a', subjectId:'sub_cs',   teacherId:'teacher_4', day:'Wednesday', startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_10', classId:'class_10a', subjectId:'sub_chem', teacherId:'teacher_3', day:'Thursday',  startTime:'11:00', endTime:'12:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_11', classId:'class_10a', subjectId:'sub_eng',  teacherId:'teacher_2', day:'Friday',    startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  // Class 9-B
  { id:'sch_12', classId:'class_9b',  subjectId:'sub_bio',  teacherId:'teacher_3', day:'Monday',    startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_13', classId:'class_9b',  subjectId:'sub_eng',  teacherId:'teacher_2', day:'Tuesday',   startTime:'11:00', endTime:'12:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_14', classId:'class_9b',  subjectId:'sub_hist', teacherId:'teacher_5', day:'Wednesday', startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
  // Class 10-B
  { id:'sch_15', classId:'class_10b', subjectId:'sub_math', teacherId:'teacher_2', day:'Monday',    startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_16', classId:'class_10b', subjectId:'sub_eco',  teacherId:'teacher_5', day:'Tuesday',   startTime:'09:00', endTime:'10:00', instituteId: DEMO_INSTITUTE_ID },
  { id:'sch_17', classId:'class_10b', subjectId:'sub_hist', teacherId:'teacher_5', day:'Thursday',  startTime:'10:00', endTime:'11:00', instituteId: DEMO_INSTITUTE_ID },
];

// ─── LEADS ───────────────────────────────────────────────────────────────────
export const SEED_LEADS = [
  { id:'lead_1',  name:'Rohan Singh',      email:'rohan@example.com',   mobile:'8000000001', source:'Website',      status:'New',           addedDate:'2026-05-01', notes:'Interested in Class 9 admission' },
  { id:'lead_2',  name:'Meera Joshi',      email:'meera@example.com',   mobile:'8000000002', source:'Referral',     status:'Qualified',     addedDate:'2026-05-03', notes:'Parent walked in, needs brochure' },
  { id:'lead_3',  name:'Aakash Gupta',     email:'aakash@example.com',  mobile:'8000000003', source:'Social Media', status:'New',           addedDate:'2026-05-05', notes:'Saw Instagram ad' },
  { id:'lead_4',  name:'Divya Khanna',     email:'divya.k@example.com', mobile:'8000000004', source:'Walk-in',      status:'Contacted',     addedDate:'2026-05-06', notes:'Looking for Class 10 seat' },
  { id:'lead_5',  name:'Rahul Nair',       email:'rahul.n@example.com', mobile:'8000000005', source:'Google Ads',   status:'Qualified',     addedDate:'2026-05-08', notes:'Very interested, fee discussion done' },
  { id:'lead_6',  name:'Simran Kaur',      email:'simran@example.com',  mobile:'8000000006', source:'Referral',     status:'Converted',     addedDate:'2026-04-20', notes:'Converted to admission' },
  { id:'lead_7',  name:'Tarun Mehta',      email:'tarun@example.com',   mobile:'8000000007', source:'Website',      status:'Lost',          addedDate:'2026-04-15', notes:'Chose another institute' },
  { id:'lead_8',  name:'Anjali Dubey',     email:'anjali@example.com',  mobile:'8000000008', source:'Walk-in',      status:'New',           addedDate:'2026-05-10', notes:'Inquiry for Class 11 Science' },
  { id:'lead_9',  name:'Manish Tiwari',    email:'manish@example.com',  mobile:'8000000009', source:'Social Media', status:'Contacted',     addedDate:'2026-05-11', notes:'WhatsApp enquiry' },
  { id:'lead_10', name:'Pooja Agarwal',    email:'pooja.a@example.com', mobile:'8000000010', source:'Google Ads',   status:'Qualified',     addedDate:'2026-05-12', notes:'Scheduled campus visit' },
  { id:'lead_11', name:'Karan Malhotra',   email:'karan@example.com',   mobile:'8000000011', source:'Referral',     status:'Converted',     addedDate:'2026-04-28', notes:'Sibling already enrolled' },
  { id:'lead_12', name:'Nisha Verma',      email:'nisha@example.com',   mobile:'8000000012', source:'Website',      status:'New',           addedDate:'2026-05-14', notes:'Downloaded prospectus' },
];

// ─── DEMO CREDENTIALS shown on login page ────────────────────────────────────
export const DEMO_CREDENTIALS = [
  { role: 'Class Admin',   email: 'admin@demo.com',   label: 'Full institute view' },
  { role: 'Branch Admin',  email: 'branch@demo.com',  label: 'Branch-level management' },
  { role: 'Teacher',       email: 'teacher@demo.com', label: 'Content & classes' },
  { role: 'Student',       email: 'student@demo.com', label: 'Learning workspace' },
  { role: 'Parent',        email: 'parent@demo.com',  label: 'Child progress & fees' },
];

// ─── LINKED CHILDREN (parent → multiple students) ──────────────────────────
export const SEED_LINKED_CHILDREN = [
  { id: 'lc_1', parentId: 'parent_1', studentId: 'student_1', nickname: 'Aarav (Class 10)', addedAt: '2025-06-01', isDefault: true },
  { id: 'lc_2', parentId: 'parent_1', studentId: 'student_2', nickname: 'Priya (Class 9)',  addedAt: '2025-06-01', isDefault: false },
];

// ─── PERSONAL AI CONFIGS ───────────────────────────────────────────────────
export const SEED_PERSONAL_AI_CONFIGS = [
  {
    id: 'pai_1', ownerId: 'student_1', ownerRole: 'Student' as const,
    activeProvider: 'gemini' as const, geminiApiKey: 'AIzaSy-demo-student-key',
    createdAt: '2025-06-01', updatedAt: '2025-06-01',
  },
  {
    id: 'pai_2', ownerId: 'parent_1', ownerRole: 'Parent' as const,
    activeProvider: 'gemini' as const, geminiApiKey: 'AIzaSy-demo-parent-key',
    createdAt: '2025-06-01', updatedAt: '2025-06-01',
  },
];

// ─── SAVED AI CONTENT (generated by students) ──────────────────────────────
export const SEED_SAVED_AI_CONTENT = [
  {
    id: 'sac_1', ownerId: 'student_1', ownerRole: 'Student' as const,
    contentType: 'quiz' as const,
    title: 'Photosynthesis Quick Quiz', topic: 'Photosynthesis',
    subjectName: 'Biology', className: 'Class 10',
    content: JSON.stringify({
      quizTitle: 'Photosynthesis Quick Quiz', quizType: 'Multiple Choice',
      questions: [
        { questionText: 'Where does photosynthesis primarily occur?', options: ['Mitochondria','Chloroplast','Nucleus','Ribosome'], correctAnswerIndex: 1 },
        { questionText: 'What is the primary pigment used in photosynthesis?', options: ['Carotenoid','Xanthophyll','Chlorophyll','Hemoglobin'], correctAnswerIndex: 2 },
        { questionText: 'What gas is released during photosynthesis?', options: ['CO2','N2','O2','H2'], correctAnswerIndex: 2 },
        { questionText: 'Light reactions occur in which part of chloroplast?', options: ['Stroma','Matrix','Thylakoid','Granum'], correctAnswerIndex: 2 },
      ],
    }),
    generatedAt: '2025-05-20', isSharedWithParent: true, aiProvider: 'gemini' as const,
  },
  {
    id: 'sac_2', ownerId: 'student_1', ownerRole: 'Student' as const,
    contentType: 'study_material' as const,
    title: 'Algebra Fundamentals Notes', topic: 'Linear Equations',
    subjectName: 'Mathematics', className: 'Class 10',
    content: `# Linear Equations — Class 10\n\n## What is a Linear Equation?\nA **linear equation** in one variable is an equation of the form **ax + b = 0**, where a ≠ 0.\n\n## Standard Form\n$$ax + b = c$$\n\n## Solving Steps\n1. Isolate the variable on one side\n2. Use inverse operations\n3. Verify by substituting back\n\n## Example\n**Solve: 3x + 6 = 15**\n- 3x = 15 – 6 = 9\n- x = 9 ÷ 3 = **3** ✓\n\n## Word Problems Tips\n- Define your variable clearly\n- Translate keywords: *more than* = +, *less than* = –, *times* = ×\n- Write the equation, then solve\n\n## Practice Problems\n1. 2x + 4 = 14 → x = ?\n2. 5y – 10 = 20 → y = ?\n3. x/3 + 7 = 10 → x = ?`,
    generatedAt: '2025-05-22', isSharedWithParent: false, aiProvider: 'gemini' as const,
  },
  {
    id: 'sac_3', ownerId: 'student_1', ownerRole: 'Student' as const,
    contentType: 'flashcards' as const,
    title: 'Chemistry Elements Flashcards', topic: 'Periodic Table',
    subjectName: 'Chemistry', className: 'Class 10',
    content: JSON.stringify([
      { front: 'Symbol for Sodium', back: 'Na (from Latin: Natrium)' },
      { front: 'Atomic number of Carbon', back: '6' },
      { front: 'Most abundant gas in atmosphere', back: 'Nitrogen (N₂) — 78%' },
      { front: 'Formula for Water', back: 'H₂O' },
      { front: 'What is the valency of Oxygen?', back: '2' },
    ]),
    generatedAt: '2025-05-25', isSharedWithParent: true, aiProvider: 'gemini' as const,
  },
];

// ─── ACTIVITY SESSIONS ─────────────────────────────────────────────────────
export const SEED_ACTIVITY_SESSIONS = [
  { id: 'act_1',  studentId: 'student_1', date: '2025-05-01', durationMinutes: 45, activity: 'quiz',           subjectId: 'subject_math', contentTitle: 'Algebra Quiz', score: 80, totalQuestions: 10 },
  { id: 'act_2',  studentId: 'student_1', date: '2025-05-02', durationMinutes: 30, activity: 'study_material', subjectId: 'subject_sci',  contentTitle: 'Photosynthesis Notes' },
  { id: 'act_3',  studentId: 'student_1', date: '2025-05-03', durationMinutes: 20, activity: 'flashcards',     subjectId: 'subject_chem', contentTitle: 'Periodic Table Cards' },
  { id: 'act_4',  studentId: 'student_1', date: '2025-05-05', durationMinutes: 60, activity: 'video',          subjectId: 'subject_phys', contentTitle: 'Newton Laws Video' },
  { id: 'act_5',  studentId: 'student_1', date: '2025-05-07', durationMinutes: 35, activity: 'quiz',           subjectId: 'subject_sci',  contentTitle: 'Biology MCQ', score: 70, totalQuestions: 10 },
  { id: 'act_6',  studentId: 'student_1', date: '2025-05-08', durationMinutes: 25, activity: 'game',           contentTitle: 'Science Challenge', score: 550 },
  { id: 'act_7',  studentId: 'student_1', date: '2025-05-10', durationMinutes: 50, activity: 'ai_generate',    subjectId: 'subject_math', contentTitle: 'AI Generated Quiz' },
  { id: 'act_8',  studentId: 'student_1', date: '2025-05-12', durationMinutes: 40, activity: 'quiz',           subjectId: 'subject_math', contentTitle: 'Geometry Test', score: 90, totalQuestions: 10 },
  { id: 'act_9',  studentId: 'student_1', date: '2025-05-14', durationMinutes: 15, activity: 'notes',          contentTitle: 'Physics Notes' },
  { id: 'act_10', studentId: 'student_1', date: '2025-05-16', durationMinutes: 55, activity: 'study_material', subjectId: 'subject_hist', contentTitle: 'World War I Notes' },
  { id: 'act_11', studentId: 'student_1', date: '2025-05-18', durationMinutes: 30, activity: 'quiz',           subjectId: 'subject_eng',  contentTitle: 'Grammar Quiz', score: 85, totalQuestions: 20 },
  { id: 'act_12', studentId: 'student_1', date: '2025-05-20', durationMinutes: 45, activity: 'ai_generate',    subjectId: 'subject_sci',  contentTitle: 'Photosynthesis AI Quiz' },
  { id: 'act_13', studentId: 'student_1', date: '2025-05-22', durationMinutes: 35, activity: 'flashcards',     subjectId: 'subject_chem', contentTitle: 'Elements Flashcards' },
  { id: 'act_14', studentId: 'student_1', date: '2025-05-24', durationMinutes: 60, activity: 'video',          subjectId: 'subject_math', contentTitle: 'Calculus Intro Video' },
  { id: 'act_15', studentId: 'student_1', date: '2025-05-26', durationMinutes: 40, activity: 'quiz',           subjectId: 'subject_phys', contentTitle: 'Physics Test', score: 60, totalQuestions: 10 },
  { id: 'act_16', studentId: 'student_2', date: '2025-05-03', durationMinutes: 30, activity: 'quiz',           subjectId: 'subject_math', contentTitle: 'Algebra Quiz', score: 75, totalQuestions: 10 },
  { id: 'act_17', studentId: 'student_2', date: '2025-05-10', durationMinutes: 25, activity: 'flashcards',     contentTitle: 'Science Flashcards' },
  { id: 'act_18', studentId: 'student_2', date: '2025-05-15', durationMinutes: 45, activity: 'study_material', contentTitle: 'History Notes' },
];

// ─── AI PROGRESS REPORTS ──────────────────────────────────────────────────
export const SEED_AI_PROGRESS_REPORTS = [
  {
    id: 'apr_1', studentId: 'student_1',
    generatedAt: '2025-05-31', periodLabel: 'May 2025',
    summary: `Aarav has shown **strong consistency** in his study habits during May 2025, logging study sessions on 15 out of 26 school days. His performance in **Mathematics** has been excellent with a 90% score in Geometry, indicating solid conceptual understanding. However, **Physics** remains a challenge with only 60% in the recent test — this needs focused attention.\n\nHis engagement with AI-generated quizzes shows initiative in self-directed learning. He is spending an average of **38 minutes per session**, which is a healthy study duration. Time management across subjects needs improvement — he is over-spending on Mathematics and under-investing in Physics and English.`,
    strengths: [
      'Strong Mathematics performance (avg 85%)',
      'Consistent daily study habit — logged activity on 15/26 days',
      'Proactively uses AI tools to generate study content',
      'Good Biology understanding (70%+ scores)',
    ],
    areasToImprove: [
      'Physics score dropped to 60% — needs revision of Newton\'s Laws & Motion',
      'English Grammar needs more practice (85% but lower engagement time)',
      'Chemistry flashcard revision incomplete',
      'Spending less time on video content compared to peers',
    ],
    studyRecommendations: [
      'Dedicate 30 mins/day to Physics for the next 2 weeks',
      'Take 1 grammar quiz every alternate day',
      'Complete the Periodic Table flashcard set',
      'Watch 2–3 concept videos per week for visual learning',
      'Generate an AI quiz on Newton\'s Laws to test understanding',
    ],
    weeklyTimeSpent: [
      { week: 'Week 1 (May 1–7)',   minutes: 190 },
      { week: 'Week 2 (May 8–14)', minutes: 150 },
      { week: 'Week 3 (May 15–21)', minutes: 175 },
      { week: 'Week 4 (May 22–31)', minutes: 195 },
    ],
    subjectScores: [
      { subjectName: 'Mathematics', avgScore: 85, quizCount: 3 },
      { subjectName: 'Biology',     avgScore: 70, quizCount: 1 },
      { subjectName: 'Physics',     avgScore: 60, quizCount: 1 },
      { subjectName: 'English',     avgScore: 85, quizCount: 1 },
    ],
    overallScore: 75,
    attendancePercent: 88,
  },
];

// ─── PARENT PLANS ──────────────────────────────────────────────────────────
export const SEED_PARENT_PLANS = [
  {
    id: 'pp_free', name: 'Free', price: 0, billingCycle: 'monthly' as const, maxChildren: 1,
    features: ['View child progress', 'Attendance reports', 'Fee status'],
    aiReportsEnabled: false, aiGeneratorEnabled: false, detailedAnalyticsEnabled: false,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'pp_basic', name: 'Basic', price: 99, billingCycle: 'monthly' as const, maxChildren: 2,
    features: ['Everything in Free', 'AI Monthly Progress Report', 'Time-on-app analytics', 'Up to 2 children'],
    aiReportsEnabled: true, aiGeneratorEnabled: false, detailedAnalyticsEnabled: true,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'pp_pro', name: 'Pro', price: 199, billingCycle: 'monthly' as const, maxChildren: 4,
    features: ['Everything in Basic', 'AI Content Generator for kids', 'Detailed subject-wise analytics', 'Up to 4 children', 'Weekly AI summary'],
    aiReportsEnabled: true, aiGeneratorEnabled: true, detailedAnalyticsEnabled: true,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'pp_family', name: 'Family', price: 299, billingCycle: 'monthly' as const, maxChildren: 10,
    features: ['Everything in Pro', 'Unlimited children', 'Priority support', 'Annual AI learning report', 'Custom study plan per child'],
    aiReportsEnabled: true, aiGeneratorEnabled: true, detailedAnalyticsEnabled: true,
    isActive: true, createdAt: '2025-01-01',
  },
];

// ─── PARENT SUBSCRIPTIONS ─────────────────────────────────────────────────
export const SEED_PARENT_SUBSCRIPTIONS = [
  {
    id: 'ps_1', parentId: 'parent_1', planId: 'pp_pro',
    status: 'active' as const, startDate: '2025-05-01', expiryDate: '2025-06-01',
    paymentMode: 'UPI' as const, amountPaid: 199, autoRenew: true,
  },
];

// ─── ROLE CONFIGS ──────────────────────────────────────────────────────────
export const SEED_ROLE_CONFIGS: RoleConfig[] = [
  { role: UserRole.ClassAdmin,      label: 'Institute Admin',     description: 'Manages full institute — students, teachers, fees, reports', isActive: true,  isInstituteRole: true,  revenueStream: 'institute', registrationOpen: false },
  { role: UserRole.BranchAdmin,     label: 'Branch Admin',        description: 'Manages a single branch within an institute',               isActive: true,  isInstituteRole: true,  revenueStream: 'institute', registrationOpen: false },
  { role: UserRole.Teacher,         label: 'Teacher',             description: 'Creates content, assigns quizzes, tracks student progress',  isActive: true,  isInstituteRole: true,  revenueStream: 'institute', registrationOpen: false },
  { role: UserRole.Student,         label: 'Institute Student',   description: 'Student enrolled via an institute',                         isActive: true,  isInstituteRole: true,  revenueStream: 'institute', registrationOpen: false },
  { role: UserRole.Parent,          label: 'Institute Parent',    description: 'Parent linked to an institute-enrolled student',            isActive: true,  isInstituteRole: true,  revenueStream: 'institute', registrationOpen: false },
  { role: UserRole.ExternalParent,  label: 'External Parent',     description: 'Standalone parent — direct subscription, AI tools for kids. Independent revenue stream.', isActive: true,  isInstituteRole: false, revenueStream: 'direct', registrationOpen: true  },
  { role: UserRole.ExternalStudent, label: 'External Student',    description: 'Standalone learner — self-registered, AI-powered study tools', isActive: true,  isInstituteRole: false, revenueStream: 'direct', registrationOpen: true  },
];

// ─── EXTERNAL PARENTS ──────────────────────────────────────────────────────
export const SEED_EXTERNAL_PARENTS = [
  {
    id: 'ext_parent_1', name: 'Sunita Reddy', email: 'sunita@external.com',
    password: 'parent123', mobile: '9900001111',
    role: UserRole.ExternalParent, city: 'Hyderabad',
    createdAt: '2025-05-01', isActive: true,
    planId: 'pp_pro', subscriptionStatus: 'active' as const, subscriptionExpiry: '2025-07-01',
  },
  {
    id: 'ext_parent_2', name: 'Rajan Mehta', email: 'rajan@external.com',
    password: 'parent123', mobile: '9900002222',
    role: UserRole.ExternalParent, city: 'Surat',
    createdAt: '2025-05-15', isActive: true,
    planId: 'pp_basic', subscriptionStatus: 'active' as const, subscriptionExpiry: '2025-06-15',
  },
];

// ─── EXTERNAL CHILD PROFILES ───────────────────────────────────────────────
export const SEED_EXTERNAL_CHILDREN = [
  {
    id: 'ext_child_1', parentId: 'ext_parent_1', name: 'Arjun Reddy',
    grade: 'Class 10', age: 15,
    subjectsOfInterest: ['Mathematics', 'Physics', 'Chemistry'],
    schoolName: 'Delhi Public School', city: 'Hyderabad',
    createdAt: '2025-05-01',
  },
  {
    id: 'ext_child_2', parentId: 'ext_parent_1', name: 'Kavya Reddy',
    grade: 'Class 8', age: 13,
    subjectsOfInterest: ['Biology', 'English', 'Social Science'],
    schoolName: 'Delhi Public School', city: 'Hyderabad',
    createdAt: '2025-05-01',
  },
  {
    id: 'ext_child_3', parentId: 'ext_parent_2', name: 'Riya Mehta',
    grade: 'Class 9', age: 14,
    subjectsOfInterest: ['Mathematics', 'Science', 'Hindi'],
    schoolName: 'Kendriya Vidyalaya', city: 'Surat',
    createdAt: '2025-05-15',
  },
];

// ─── EXTERNAL STUDENTS ─────────────────────────────────────────────────────
export const SEED_EXTERNAL_STUDENTS = [
  {
    id: 'ext_student_1', name: 'Prateek Shah', email: 'prateek@external.com',
    password: 'student123', mobile: '9900003333',
    role: UserRole.ExternalStudent,
    grade: 'Class 11', age: 16,
    subjectsOfInterest: ['Physics', 'Mathematics', 'Chemistry'],
    schoolName: 'Ryan International', city: 'Mumbai',
    createdAt: '2025-05-10', isActive: true,
  },
  {
    id: 'ext_student_2', name: 'Anika Joshi', email: 'anika@external.com',
    password: 'student123', mobile: '9900004444',
    role: UserRole.ExternalStudent,
    grade: 'Class 9', age: 14,
    subjectsOfInterest: ['Biology', 'English', 'History'],
    schoolName: 'Podar International', city: 'Pune',
    createdAt: '2025-05-12', isActive: true,
    planId: 'sp_pro', subscriptionStatus: 'active' as const, subscriptionExpiry: '2025-07-12',
  },
];

// ─── STUDENT SUBSCRIPTION PLANS ────────────────────────────────────────────
export const SEED_STUDENT_PLANS = [
  {
    id: 'sp_free', name: 'Free Explorer', price: 0, billingCycle: 'monthly' as const,
    features: ['5 AI generations/month', 'Basic quizzes & flashcards', 'Personal library'],
    challengesEnabled: false, shareEnabled: false, aiGeneratorEnabled: true,
    maxAiGenerations: 5, detailedReportsEnabled: false, leaderboardEnabled: false,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'sp_basic', name: 'Learner', price: 49, billingCycle: 'monthly' as const,
    features: ['30 AI generations/month', 'All content types', 'Share up to 5 materials', 'Basic progress report'],
    challengesEnabled: false, shareEnabled: true, aiGeneratorEnabled: true,
    maxAiGenerations: 30, detailedReportsEnabled: true, leaderboardEnabled: false,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'sp_pro', name: 'Pro Scholar', price: 99, billingCycle: 'monthly' as const,
    features: ['Unlimited AI generations', 'Create & join challenges', 'Public library sharing', 'Detailed AI progress report', 'Leaderboard access', 'Challenge invites'],
    challengesEnabled: true, shareEnabled: true, aiGeneratorEnabled: true,
    maxAiGenerations: -1, detailedReportsEnabled: true, leaderboardEnabled: true,
    isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'sp_elite', name: 'Elite Champion', price: 149, billingCycle: 'monthly' as const,
    features: ['Everything in Pro', 'Unlimited challenges', 'Featured on public leaderboard', 'Custom branding on challenges', 'Priority AI responses', 'Analytics dashboard'],
    challengesEnabled: true, shareEnabled: true, aiGeneratorEnabled: true,
    maxAiGenerations: -1, detailedReportsEnabled: true, leaderboardEnabled: true,
    isActive: true, createdAt: '2025-01-01',
  },
];

// ─── STUDENT SUBSCRIPTIONS ────────────────────────────────────────────────
export const SEED_STUDENT_SUBSCRIPTIONS = [
  {
    id: 'ss_1', studentId: 'ext_student_1', planId: 'sp_pro',
    status: 'active' as const, startDate: '2025-05-10', expiryDate: '2025-06-10',
    paymentMode: 'UPI' as const, amountPaid: 99, autoRenew: true,
  },
  {
    id: 'ss_2', studentId: 'ext_student_2', planId: 'sp_pro',
    status: 'active' as const, startDate: '2025-05-12', expiryDate: '2025-06-12',
    paymentMode: 'Card' as const, amountPaid: 99, autoRenew: false,
  },
];

// ─── STUDY CHALLENGES ──────────────────────────────────────────────────────
export const SEED_STUDY_CHALLENGES = [
  {
    id: 'ch_1', code: 'PHY101', creatorId: 'ext_student_1', creatorName: 'Prateek Shah',
    title: 'Newton\'s Laws Sprint',
    description: 'Test your knowledge of Newton\'s 3 laws of motion. Quick 5-question challenge!',
    subject: 'Physics', grade: 'Class 11', contentType: 'quiz' as const,
    content: JSON.stringify({
      quizTitle: 'Newton\'s Laws Sprint', quizType: 'Multiple Choice',
      questions: [
        { questionText: 'Newton\'s First Law is also called the Law of?', options: ['Motion','Inertia','Gravity','Action-Reaction'], correctAnswerIndex: 1 },
        { questionText: 'F = ma represents Newton\'s ___ Law', options: ['First','Second','Third','Fourth'], correctAnswerIndex: 1 },
        { questionText: 'Every action has an equal and opposite ___?', options: ['Force','Reaction','Momentum','Impulse'], correctAnswerIndex: 1 },
        { questionText: 'Unit of Force in SI system?', options: ['Joule','Watt','Newton','Pascal'], correctAnswerIndex: 2 },
        { questionText: 'A body at rest continues to be at rest due to?', options: ['Gravity','Friction','Inertia','Mass'], correctAnswerIndex: 2 },
      ],
    }),
    difficulty: 'Medium' as const, timeLimitMinutes: 5,
    isPublic: true, invitedEmails: ['anika@external.com'],
    status: 'active' as const, createdAt: '2025-05-20',
    expiresAt: '2025-06-20', participantCount: 3,
  },
  {
    id: 'ch_2', code: 'MATH99', creatorId: 'ext_student_2', creatorName: 'Anika Joshi',
    title: 'Algebra Blitz',
    description: 'Can you solve these linear equations faster than anyone? Join the Algebra Blitz!',
    subject: 'Mathematics', grade: 'Class 9', contentType: 'quiz' as const,
    content: JSON.stringify({
      quizTitle: 'Algebra Blitz', quizType: 'Multiple Choice',
      questions: [
        { questionText: 'Solve: 2x + 4 = 14. Find x.', options: ['3','4','5','6'], correctAnswerIndex: 2 },
        { questionText: 'If 3y - 9 = 0, then y = ?', options: ['2','3','4','5'], correctAnswerIndex: 1 },
        { questionText: 'The degree of a linear equation is?', options: ['0','1','2','3'], correctAnswerIndex: 1 },
        { questionText: 'Solve: x/2 = 7. Find x.', options: ['7','12','14','3.5'], correctAnswerIndex: 2 },
        { questionText: 'In ax + b = 0, x = ?', options: ['a/b','-b/a','b/a','-a/b'], correctAnswerIndex: 1 },
      ],
    }),
    difficulty: 'Easy' as const, timeLimitMinutes: 5,
    isPublic: true, invitedEmails: [],
    status: 'active' as const, createdAt: '2025-05-22',
    participantCount: 8,
  },
];

// ─── CHALLENGE PARTICIPATIONS ─────────────────────────────────────────────
export const SEED_CHALLENGE_PARTICIPATIONS = [
  { id: 'cp_1', challengeId: 'ch_1', participantId: 'ext_student_2', participantName: 'Anika Joshi', participantGrade: 'Class 9', score: 4, totalQuestions: 5, percentage: 80, timeTakenSeconds: 95, completedAt: '2025-05-21T10:22:00Z', answers: [1,1,1,2,2], rank: 1 },
  { id: 'cp_2', challengeId: 'ch_1', participantId: 'anon_1', participantName: 'Rahul K.', participantGrade: 'Class 11', score: 3, totalQuestions: 5, percentage: 60, timeTakenSeconds: 180, completedAt: '2025-05-21T14:05:00Z', answers: [1,1,0,2,2], rank: 2 },
  { id: 'cp_3', challengeId: 'ch_1', participantId: 'anon_2', participantName: 'Sneha M.', participantGrade: 'Class 11', score: 5, totalQuestions: 5, percentage: 100, timeTakenSeconds: 72, completedAt: '2025-05-22T09:10:00Z', answers: [1,1,1,2,2], rank: 1 },
  { id: 'cp_4', challengeId: 'ch_2', participantId: 'ext_student_1', participantName: 'Prateek Shah', participantGrade: 'Class 11', score: 4, totalQuestions: 5, percentage: 80, timeTakenSeconds: 120, completedAt: '2025-05-23T11:30:00Z', answers: [2,1,1,2,1], rank: 2 },
  { id: 'cp_5', challengeId: 'ch_2', participantId: 'anon_3', participantName: 'Divya S.', participantGrade: 'Class 10', score: 5, totalQuestions: 5, percentage: 100, timeTakenSeconds: 88, completedAt: '2025-05-23T16:45:00Z', answers: [2,1,1,2,1], rank: 1 },
];

// ─── SHARED CONTENT ────────────────────────────────────────────────────────
export const SEED_SHARED_CONTENT = [
  {
    id: 'sc_1', shareCode: 'PHY-QUIZ1', contentId: 'sac_1', ownerId: 'ext_student_1',
    ownerName: 'Prateek Shah', title: 'Photosynthesis Quick Quiz',
    contentType: 'quiz' as const, subject: 'Biology', grade: 'Class 10',
    description: 'Test your knowledge on Photosynthesis with 4 MCQs',
    isPublic: true, viewCount: 24, likeCount: 8,
    createdAt: '2025-05-21', tags: ['biology', 'class10', 'photosynthesis'],
  },
  {
    id: 'sc_2', shareCode: 'MATH-NOTES', contentId: 'sac_2', ownerId: 'ext_student_1',
    ownerName: 'Prateek Shah', title: 'Algebra Fundamentals Notes',
    contentType: 'study_material' as const, subject: 'Mathematics', grade: 'Class 10',
    description: 'Complete notes on linear equations with examples and practice problems',
    isPublic: true, viewCount: 45, likeCount: 12,
    createdAt: '2025-05-23', tags: ['math', 'algebra', 'class10'],
  },
];
