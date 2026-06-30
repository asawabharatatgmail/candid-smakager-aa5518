// ─── Indian Education Boards Master Data ─────────────────────────────────────
// Comprehensive list of all major Indian boards with classes and subjects.
// Used in PlatformMastersView → Boards & Subjects tab.

export type BoardType = 'National' | 'State' | 'International';
export type ClassLevel = 'Pre-Primary' | 'Primary' | 'Middle' | 'Secondary' | 'Senior Secondary';
export type StreamType = 'Science' | 'Commerce' | 'Arts/Humanities' | 'Vocational' | 'General';

export interface BoardSubject {
  name: string;
  code?: string;
  isCompulsory: boolean;
  streams: StreamType[];          // empty = all streams / non-streamed grade
}

export interface BoardGrade {
  grade: string;                  // e.g. "Class 1", "Class 10"
  level: ClassLevel;
  hasStreams: boolean;
  subjects: BoardSubject[];
}

export interface IndianBoard {
  id: string;
  shortName: string;
  fullName: string;
  type: BoardType;
  state?: string;
  website?: string;
  description: string;
  isCustom?: boolean;             // true for manually-added entries
  grades: BoardGrade[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────
const sub = (name: string, code?: string, compulsory = false, streams: StreamType[] = []): BoardSubject =>
  ({ name, code, isCompulsory: compulsory, streams });

// ─── CBSE ─────────────────────────────────────────────────────────────────────
const cbse: IndianBoard = {
  id: 'cbse',
  shortName: 'CBSE',
  fullName: 'Central Board of Secondary Education',
  type: 'National',
  website: 'https://www.cbse.gov.in',
  description: 'Premier national board under MHRD; followed by 25,000+ schools across India.',
  grades: [
    // ── Pre-Primary ──
    { grade: 'Pre-Nursery', level: 'Pre-Primary', hasStreams: false, subjects: [
      sub('Play & Activity', undefined, true),
      sub('Language Development', undefined, true),
      sub('Number Sense', undefined, true),
    ]},
    { grade: 'Nursery', level: 'Pre-Primary', hasStreams: false, subjects: [
      sub('English Basics', undefined, true),
      sub('Hindi Basics', undefined, true),
      sub('Environmental Awareness', undefined, true),
      sub('Mathematics Basics', undefined, true),
      sub('Drawing & Craft', undefined, false),
    ]},
    { grade: 'KG / LKG', level: 'Pre-Primary', hasStreams: false, subjects: [
      sub('English', undefined, true),
      sub('Hindi', undefined, true),
      sub('Mathematics', undefined, true),
      sub('Environmental Studies (EVS)', undefined, true),
      sub('Art & Craft', undefined, false),
      sub('Physical Education', undefined, false),
    ]},
    // ── Primary (1–5) ──
    ...([1,2,3,4,5].map(n => ({
      grade: `Class ${n}`,
      level: 'Primary' as ClassLevel,
      hasStreams: false,
      subjects: [
        sub('English', undefined, true),
        sub('Hindi', undefined, true),
        sub('Mathematics', undefined, true),
        sub('Environmental Studies (EVS)', undefined, true),
        sub('General Knowledge', undefined, false),
        sub('Computer Science', undefined, false),
        sub('Art Education', undefined, false),
        sub('Physical Education', undefined, false),
        ...(n >= 3 ? [sub('Third Language (Regional / Sanskrit)', undefined, false)] : []),
      ],
    }))),
    // ── Middle (6–8) ──
    ...([6,7,8].map(n => ({
      grade: `Class ${n}`,
      level: 'Middle' as ClassLevel,
      hasStreams: false,
      subjects: [
        sub('English', undefined, true),
        sub('Hindi', undefined, true),
        sub('Mathematics', undefined, true),
        sub('Science', undefined, true),
        sub('Social Science', undefined, true),
        sub('Sanskrit / Third Language', undefined, false),
        sub('Computer Science', undefined, false),
        sub('Art Education', undefined, false),
        sub('Physical Education', undefined, false),
        sub('Health & Wellness', undefined, false),
      ],
    }))),
    // ── Secondary (9–10) ──
    { grade: 'Class 9', level: 'Secondary', hasStreams: false, subjects: [
      sub('English (Language & Literature)', 'EL', true),
      sub('Hindi Course A / Hindi Course B', 'HA/HB', true),
      sub('Mathematics (Standard / Basic)', 'MA', true),
      sub('Science', 'SC', true),
      sub('Social Science', 'SS', true),
      sub('Sanskrit', 'SA', false),
      sub('Computer Applications', 'CA', false),
      sub('Information Technology', 'IT', false),
      sub('Artificial Intelligence', 'AI', false),
      sub('Physical Education', 'PE', false),
      sub('Home Science', 'HS', false),
      sub('Painting', 'PA', false),
    ]},
    { grade: 'Class 10', level: 'Secondary', hasStreams: false, subjects: [
      sub('English (Language & Literature)', 'EL', true),
      sub('Hindi Course A / Hindi Course B', 'HA/HB', true),
      sub('Mathematics (Standard / Basic)', 'MA', true),
      sub('Science', 'SC', true),
      sub('Social Science', 'SS', true),
      sub('Sanskrit', 'SA', false),
      sub('Computer Applications', 'CA', false),
      sub('Information Technology', 'IT', false),
      sub('Artificial Intelligence', 'AI', false),
      sub('Physical Education', 'PE', false),
      sub('Home Science', 'HS', false),
      sub('Painting', 'PA', false),
    ]},
    // ── Senior Secondary (11–12) ──
    { grade: 'Class 11', level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English Core', 'EC', true, ['Science','Commerce','Arts/Humanities']),
      sub('English Elective', 'EE', false, ['Arts/Humanities']),
      sub('Hindi Core', 'HC', false, ['Science','Commerce','Arts/Humanities']),
      sub('Hindi Elective', 'HE', false, ['Arts/Humanities']),
      sub('Physics', 'PH', true, ['Science']),
      sub('Chemistry', 'CH', true, ['Science']),
      sub('Mathematics', 'MA', false, ['Science','Commerce']),
      sub('Biology', 'BI', false, ['Science']),
      sub('Computer Science', 'CS', false, ['Science']),
      sub('Informatics Practices', 'IP', false, ['Science','Commerce']),
      sub('Accountancy', 'AC', true, ['Commerce']),
      sub('Business Studies', 'BS', true, ['Commerce']),
      sub('Economics', 'EC2', false, ['Commerce','Arts/Humanities']),
      sub('History', 'HI', false, ['Arts/Humanities']),
      sub('Political Science', 'PS', false, ['Arts/Humanities']),
      sub('Geography', 'GE', false, ['Arts/Humanities','Science']),
      sub('Sociology', 'SO', false, ['Arts/Humanities']),
      sub('Psychology', 'PY', false, ['Arts/Humanities']),
      sub('Philosophy', 'PL', false, ['Arts/Humanities']),
      sub('Home Science', 'HS', false, ['Arts/Humanities']),
      sub('Physical Education', 'PE', false, ['Science','Commerce','Arts/Humanities']),
      sub('Fine Arts', 'FA', false, ['Arts/Humanities']),
      sub('Music', 'MU', false, ['Arts/Humanities']),
      sub('Dance', 'DA', false, ['Arts/Humanities']),
      sub('Entrepreneurship', 'EN', false, ['Commerce']),
      sub('Legal Studies', 'LS', false, ['Arts/Humanities']),
      sub('Sanskrit', 'SK', false, ['Arts/Humanities']),
      sub('Artificial Intelligence', 'AI', false, ['Science']),
      sub('Applied Mathematics', 'AM', false, ['Commerce']),
    ]},
    { grade: 'Class 12', level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English Core', 'EC', true, ['Science','Commerce','Arts/Humanities']),
      sub('English Elective', 'EE', false, ['Arts/Humanities']),
      sub('Hindi Core', 'HC', false, ['Science','Commerce','Arts/Humanities']),
      sub('Hindi Elective', 'HE', false, ['Arts/Humanities']),
      sub('Physics', 'PH', true, ['Science']),
      sub('Chemistry', 'CH', true, ['Science']),
      sub('Mathematics', 'MA', false, ['Science','Commerce']),
      sub('Biology', 'BI', false, ['Science']),
      sub('Computer Science', 'CS', false, ['Science']),
      sub('Informatics Practices', 'IP', false, ['Science','Commerce']),
      sub('Accountancy', 'AC', true, ['Commerce']),
      sub('Business Studies', 'BS', true, ['Commerce']),
      sub('Economics', 'EC2', false, ['Commerce','Arts/Humanities']),
      sub('History', 'HI', false, ['Arts/Humanities']),
      sub('Political Science', 'PS', false, ['Arts/Humanities']),
      sub('Geography', 'GE', false, ['Arts/Humanities','Science']),
      sub('Sociology', 'SO', false, ['Arts/Humanities']),
      sub('Psychology', 'PY', false, ['Arts/Humanities']),
      sub('Philosophy', 'PL', false, ['Arts/Humanities']),
      sub('Physical Education', 'PE', false, ['Science','Commerce','Arts/Humanities']),
      sub('Fine Arts', 'FA', false, ['Arts/Humanities']),
      sub('Music', 'MU', false, ['Arts/Humanities']),
      sub('Dance', 'DA', false, ['Arts/Humanities']),
      sub('Entrepreneurship', 'EN', false, ['Commerce']),
      sub('Legal Studies', 'LS', false, ['Arts/Humanities']),
      sub('Sanskrit', 'SK', false, ['Arts/Humanities']),
      sub('Applied Mathematics', 'AM', false, ['Commerce']),
    ]},
  ],
};

// ─── CISCE (ICSE / ISC) ───────────────────────────────────────────────────────
const cisce: IndianBoard = {
  id: 'cisce',
  shortName: 'ICSE / ISC',
  fullName: 'Council for the Indian School Certificate Examinations',
  type: 'National',
  website: 'https://www.cisce.org',
  description: 'ICSE (Class 10) & ISC (Class 12) — known for depth & comprehensive English-medium curriculum.',
  grades: [
    ...([1,2,3,4,5,6,7,8].map(n => ({
      grade: `Class ${n}`,
      level: (n <= 5 ? 'Primary' : 'Middle') as ClassLevel,
      hasStreams: false,
      subjects: [
        sub('English', undefined, true),
        sub('Hindi / Regional Language', undefined, true),
        sub('Mathematics', undefined, true),
        sub('Environmental Science (EVS)', undefined, true),
        sub('History & Civics', undefined, n >= 6),
        sub('Geography', undefined, n >= 6),
        sub('Science', undefined, n >= 6),
        sub('Computer Applications', undefined, false),
        sub('Art', undefined, false),
        sub('Physical Education', undefined, false),
        sub('Second Language (Sanskrit / French / Gujarati etc.)', undefined, false),
      ].filter(s => s.name !== 'History & Civics' || n >= 6)
      .filter(s => s.name !== 'Geography' || n >= 6)
      .filter(s => s.name !== 'Science' || n >= 6),
    }))),
    { grade: 'Class 9', level: 'Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, true),
      sub('English Literature', undefined, true),
      sub('Hindi / Second Language', undefined, true),
      sub('History & Civics', undefined, true),
      sub('Geography', undefined, true),
      sub('Mathematics', undefined, true),
      sub('Physics', undefined, true),
      sub('Chemistry', undefined, true),
      sub('Biology', undefined, true),
      sub('Computer Applications', undefined, false),
      sub('Economic Applications', undefined, false),
      sub('Commercial Studies', undefined, false),
      sub('Environmental Science', undefined, false),
      sub('Physical Education', undefined, false),
      sub('Art', undefined, false),
      sub('Music', undefined, false),
      sub('Home Science', undefined, false),
    ]},
    { grade: 'Class 10', level: 'Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, true),
      sub('English Literature', undefined, true),
      sub('Hindi / Second Language', undefined, true),
      sub('History & Civics', undefined, true),
      sub('Geography', undefined, true),
      sub('Mathematics', undefined, true),
      sub('Physics', undefined, true),
      sub('Chemistry', undefined, true),
      sub('Biology', undefined, true),
      sub('Computer Applications', undefined, false),
      sub('Economic Applications', undefined, false),
      sub('Commercial Studies', undefined, false),
      sub('Environmental Science', undefined, false),
      sub('Physical Education', undefined, false),
      sub('Art', undefined, false),
    ]},
    { grade: 'Class 11 (ISC)', level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English', undefined, true, ['Science','Commerce','Arts/Humanities']),
      sub('Hindi / Alternative English', undefined, false, ['Science','Commerce','Arts/Humanities']),
      sub('Physics', undefined, true, ['Science']),
      sub('Chemistry', undefined, true, ['Science']),
      sub('Mathematics', undefined, false, ['Science']),
      sub('Biology', undefined, false, ['Science']),
      sub('Computer Science', undefined, false, ['Science']),
      sub('Accountancy', undefined, true, ['Commerce']),
      sub('Business Studies', undefined, true, ['Commerce']),
      sub('Commerce', undefined, true, ['Commerce']),
      sub('Economics', undefined, false, ['Commerce','Arts/Humanities']),
      sub('History', undefined, false, ['Arts/Humanities']),
      sub('Political Science', undefined, false, ['Arts/Humanities']),
      sub('Geography', undefined, false, ['Arts/Humanities','Science']),
      sub('Sociology', undefined, false, ['Arts/Humanities']),
      sub('Psychology', undefined, false, ['Arts/Humanities']),
      sub('Physical Education', undefined, false, ['Science','Commerce','Arts/Humanities']),
      sub('Fine Arts', undefined, false, ['Arts/Humanities']),
      sub('Music', undefined, false, ['Arts/Humanities']),
    ]},
    { grade: 'Class 12 (ISC)', level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English', undefined, true, ['Science','Commerce','Arts/Humanities']),
      sub('Hindi / Alternative English', undefined, false, ['Science','Commerce','Arts/Humanities']),
      sub('Physics', undefined, true, ['Science']),
      sub('Chemistry', undefined, true, ['Science']),
      sub('Mathematics', undefined, false, ['Science']),
      sub('Biology', undefined, false, ['Science']),
      sub('Computer Science', undefined, false, ['Science']),
      sub('Accountancy', undefined, true, ['Commerce']),
      sub('Business Studies', undefined, true, ['Commerce']),
      sub('Commerce', undefined, true, ['Commerce']),
      sub('Economics', undefined, false, ['Commerce','Arts/Humanities']),
      sub('History', undefined, false, ['Arts/Humanities']),
      sub('Political Science', undefined, false, ['Arts/Humanities']),
      sub('Geography', undefined, false, ['Arts/Humanities','Science']),
      sub('Sociology', undefined, false, ['Arts/Humanities']),
      sub('Psychology', undefined, false, ['Arts/Humanities']),
      sub('Physical Education', undefined, false, ['Science','Commerce','Arts/Humanities']),
    ]},
  ],
};

// ─── NIOS (National Institute of Open Schooling) ─────────────────────────────
const nios: IndianBoard = {
  id: 'nios',
  shortName: 'NIOS',
  fullName: 'National Institute of Open Schooling',
  type: 'National',
  website: 'https://www.nios.ac.in',
  description: 'India\'s open schooling system for Secondary (Class 10) and Senior Secondary (Class 12).',
  grades: [
    { grade: 'Secondary (Class 10)', level: 'Secondary', hasStreams: false, subjects: [
      sub('Hindi', undefined, false), sub('English', undefined, false), sub('Mathematics', undefined, false),
      sub('Science & Technology', undefined, false), sub('Social Science', undefined, false),
      sub('Economics', undefined, false), sub('Business Studies', undefined, false),
      sub('Home Science', undefined, false), sub('Data Entry Operations', undefined, false),
      sub('Painting', undefined, false), sub('Psychology', undefined, false),
    ]},
    { grade: 'Senior Secondary (Class 12)', level: 'Senior Secondary', hasStreams: false, subjects: [
      sub('Hindi', undefined, false), sub('English', undefined, false), sub('Mathematics', undefined, false),
      sub('Physics', undefined, false), sub('Chemistry', undefined, false), sub('Biology', undefined, false),
      sub('History', undefined, false), sub('Geography', undefined, false), sub('Economics', undefined, false),
      sub('Political Science', undefined, false), sub('Accountancy', undefined, false),
      sub('Business Studies', undefined, false), sub('Computer Science', undefined, false),
      sub('Psychology', undefined, false), sub('Sociology', undefined, false),
      sub('Home Science', undefined, false), sub('Environmental Science', undefined, false),
    ]},
  ],
};

// ─── IB (International Baccalaureate) ─────────────────────────────────────────
const ib: IndianBoard = {
  id: 'ib',
  shortName: 'IB',
  fullName: 'International Baccalaureate',
  type: 'International',
  website: 'https://www.ibo.org',
  description: 'PYP (K–5), MYP (6–10), DP (11–12), and CP programmes. Globally recognised.',
  grades: [
    { grade: 'PYP (Ages 3–12)', level: 'Primary', hasStreams: false, subjects: [
      sub('Language Arts', undefined, true), sub('Mathematics', undefined, true),
      sub('Social Studies', undefined, true), sub('Science', undefined, true),
      sub('Arts (Visual / Performing)', undefined, true), sub('Physical Education', undefined, true),
    ]},
    { grade: 'MYP Year 1–3 (Class 6–8)', level: 'Middle', hasStreams: false, subjects: [
      sub('Language & Literature', undefined, true), sub('Language Acquisition', undefined, true),
      sub('Mathematics', undefined, true), sub('Sciences', undefined, true),
      sub('Individuals & Societies', undefined, true), sub('Arts', undefined, true),
      sub('Physical & Health Education', undefined, true), sub('Design', undefined, true),
    ]},
    { grade: 'MYP Year 4–5 (Class 9–10)', level: 'Secondary', hasStreams: false, subjects: [
      sub('Language & Literature', undefined, true), sub('Language Acquisition', undefined, true),
      sub('Mathematics', undefined, true), sub('Sciences', undefined, true),
      sub('Individuals & Societies', undefined, true), sub('Arts', undefined, true),
      sub('Physical & Health Education', undefined, true), sub('Design', undefined, true),
      sub('MYP Personal Project', undefined, true),
    ]},
    { grade: 'DP Year 1 (Class 11)', level: 'Senior Secondary', hasStreams: false, subjects: [
      sub('Studies in Language & Literature (HL/SL)', undefined, true),
      sub('Language Acquisition (HL/SL)', undefined, true),
      sub('Individuals & Societies (History/Econ/Geography/Business)', undefined, true),
      sub('Sciences (Physics/Chemistry/Biology/Computer Science)', undefined, true),
      sub('Mathematics: Analysis & Approaches / Applications (HL/SL)', undefined, true),
      sub('The Arts (Music/Theatre/Visual Arts)', undefined, false),
      sub('Theory of Knowledge (TOK)', undefined, true),
      sub('Extended Essay', undefined, true),
      sub('Creativity, Activity, Service (CAS)', undefined, true),
    ]},
    { grade: 'DP Year 2 (Class 12)', level: 'Senior Secondary', hasStreams: false, subjects: [
      sub('Studies in Language & Literature (HL/SL)', undefined, true),
      sub('Language Acquisition (HL/SL)', undefined, true),
      sub('Individuals & Societies (History/Econ/Geography/Business)', undefined, true),
      sub('Sciences (Physics/Chemistry/Biology/Computer Science)', undefined, true),
      sub('Mathematics: Analysis & Approaches / Applications (HL/SL)', undefined, true),
      sub('The Arts (Music/Theatre/Visual Arts)', undefined, false),
      sub('Theory of Knowledge (TOK)', undefined, true),
      sub('Extended Essay', undefined, true),
      sub('Creativity, Activity, Service (CAS)', undefined, true),
    ]},
  ],
};

// ─── Cambridge IGCSE / A-Level ────────────────────────────────────────────────
const cambridge: IndianBoard = {
  id: 'cambridge',
  shortName: 'Cambridge (IGCSE / AS & A)',
  fullName: 'Cambridge Assessment International Education (CAIE)',
  type: 'International',
  website: 'https://www.cambridgeinternational.org',
  description: 'Globally recognised IGCSE (Class 9–10) and A-Level (Class 11–12) qualifications.',
  grades: [
    { grade: 'Lower Secondary (Class 6–8)', level: 'Middle', hasStreams: false, subjects: [
      sub('English as a First / Second Language', undefined, true),
      sub('Mathematics', undefined, true), sub('Science', undefined, true),
      sub('Global Perspectives', undefined, false), sub('Art & Design', undefined, false),
    ]},
    { grade: 'IGCSE Year 1 (Class 9)', level: 'Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, true), sub('English Literature', undefined, false),
      sub('Mathematics', undefined, true), sub('Additional Mathematics', undefined, false),
      sub('Physics', undefined, false), sub('Chemistry', undefined, false), sub('Biology', undefined, false),
      sub('Combined Science (Co-ordinated)', undefined, false),
      sub('History', undefined, false), sub('Geography', undefined, false),
      sub('Economics', undefined, false), sub('Business Studies', undefined, false),
      sub('Computer Science', undefined, false), sub('ICT', undefined, false),
      sub('Hindi as a Second Language', undefined, false),
      sub('Art & Design', undefined, false), sub('Music', undefined, false),
      sub('Physical Education', undefined, false),
    ]},
    { grade: 'IGCSE Year 2 (Class 10)', level: 'Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, true), sub('Mathematics', undefined, true),
      sub('Physics', undefined, false), sub('Chemistry', undefined, false), sub('Biology', undefined, false),
      sub('History', undefined, false), sub('Geography', undefined, false), sub('Economics', undefined, false),
      sub('Business Studies', undefined, false), sub('Computer Science', undefined, false),
      sub('Hindi as a Second Language', undefined, false),
    ]},
    { grade: 'AS Level (Class 11)', level: 'Senior Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, false), sub('English Literature', undefined, false),
      sub('Mathematics', undefined, false), sub('Further Mathematics', undefined, false),
      sub('Physics', undefined, false), sub('Chemistry', undefined, false), sub('Biology', undefined, false),
      sub('Computer Science', undefined, false), sub('Economics', undefined, false),
      sub('Business', undefined, false), sub('History', undefined, false), sub('Geography', undefined, false),
      sub('Psychology', undefined, false), sub('Sociology', undefined, false),
      sub('Art & Design', undefined, false), sub('Music', undefined, false),
    ]},
    { grade: 'A Level (Class 12)', level: 'Senior Secondary', hasStreams: false, subjects: [
      sub('English Language', undefined, false), sub('Mathematics', undefined, false),
      sub('Further Mathematics', undefined, false),
      sub('Physics', undefined, false), sub('Chemistry', undefined, false), sub('Biology', undefined, false),
      sub('Computer Science', undefined, false), sub('Economics', undefined, false),
      sub('Business', undefined, false), sub('History', undefined, false), sub('Geography', undefined, false),
      sub('Psychology', undefined, false), sub('Sociology', undefined, false),
    ]},
  ],
};

// ─── STATE BOARDS ─────────────────────────────────────────────────────────────
// Helper: generate standard state board structure
const makeStateBoard = (
  id: string, shortName: string, fullName: string, state: string, website: string,
  secondaryExam: string, seniorExam: string, lang: string, extraSec: BoardSubject[] = [], extraSr: BoardSubject[] = [],
): IndianBoard => ({
  id, shortName, fullName, type: 'State', state, website,
  description: `${state} state board. ${secondaryExam} (Class 10), ${seniorExam} (Class 12).`,
  grades: [
    ...([1,2,3,4,5].map(n => ({
      grade: `Class ${n}`, level: 'Primary' as ClassLevel, hasStreams: false,
      subjects: [
        sub('English', undefined, true), sub(lang, undefined, true),
        sub('Mathematics', undefined, true), sub('Environmental Studies (EVS)', undefined, true),
        sub('General Knowledge', undefined, false), sub('Art & Craft', undefined, false),
      ],
    }))),
    ...([6,7,8].map(n => ({
      grade: `Class ${n}`, level: 'Middle' as ClassLevel, hasStreams: false,
      subjects: [
        sub('English', undefined, true), sub(lang, undefined, true),
        sub('Mathematics', undefined, true), sub('Science', undefined, true),
        sub('Social Science', undefined, true), sub('Sanskrit / Third Language', undefined, false),
        sub('Computer Science', undefined, false), sub('Physical Education', undefined, false),
      ],
    }))),
    { grade: 'Class 9', level: 'Secondary', hasStreams: false, subjects: [
      sub('English', undefined, true), sub(lang, undefined, true),
      sub('Mathematics', undefined, true), sub('Science', undefined, true),
      sub('Social Science', undefined, true), sub('Sanskrit / Third Language', undefined, false),
      sub('Computer Science', undefined, false), ...extraSec,
    ]},
    { grade: `Class 10 (${secondaryExam})`, level: 'Secondary', hasStreams: false, subjects: [
      sub('English', undefined, true), sub(lang, undefined, true),
      sub('Mathematics', undefined, true), sub('Science', undefined, true),
      sub('Social Science', undefined, true), sub('Sanskrit / Third Language', undefined, false),
      sub('Computer Science', undefined, false), ...extraSec,
    ]},
    { grade: 'Class 11', level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English', undefined, true, ['Science','Commerce','Arts/Humanities']),
      sub(lang, undefined, false, ['Science','Commerce','Arts/Humanities']),
      sub('Physics', undefined, true, ['Science']), sub('Chemistry', undefined, true, ['Science']),
      sub('Mathematics', undefined, false, ['Science','Commerce']), sub('Biology', undefined, false, ['Science']),
      sub('Computer Science', undefined, false, ['Science']),
      sub('Accountancy', undefined, true, ['Commerce']), sub('Business Studies', undefined, true, ['Commerce']),
      sub('Economics', undefined, false, ['Commerce','Arts/Humanities']),
      sub('History', undefined, false, ['Arts/Humanities']), sub('Political Science', undefined, false, ['Arts/Humanities']),
      sub('Geography', undefined, false, ['Arts/Humanities','Science']),
      sub('Sociology', undefined, false, ['Arts/Humanities']), sub('Psychology', undefined, false, ['Arts/Humanities']),
      sub('Physical Education', undefined, false, ['Science','Commerce','Arts/Humanities']), ...extraSr,
    ]},
    { grade: `Class 12 (${seniorExam})`, level: 'Senior Secondary', hasStreams: true, subjects: [
      sub('English', undefined, true, ['Science','Commerce','Arts/Humanities']),
      sub(lang, undefined, false, ['Science','Commerce','Arts/Humanities']),
      sub('Physics', undefined, true, ['Science']), sub('Chemistry', undefined, true, ['Science']),
      sub('Mathematics', undefined, false, ['Science','Commerce']), sub('Biology', undefined, false, ['Science']),
      sub('Computer Science', undefined, false, ['Science']),
      sub('Accountancy', undefined, true, ['Commerce']), sub('Business Studies', undefined, true, ['Commerce']),
      sub('Economics', undefined, false, ['Commerce','Arts/Humanities']),
      sub('History', undefined, false, ['Arts/Humanities']), sub('Political Science', undefined, false, ['Arts/Humanities']),
      sub('Geography', undefined, false, ['Arts/Humanities','Science']),
      sub('Sociology', undefined, false, ['Arts/Humanities']), sub('Psychology', undefined, false, ['Arts/Humanities']),
      sub('Physical Education', undefined, false, ['Science','Commerce','Arts/Humanities']), ...extraSr,
    ]},
  ],
});

const maharashtra = makeStateBoard('msbshse','Maharashtra SSC / HSC','Maharashtra State Board of Secondary & Higher Secondary Education','Maharashtra','https://mahahsscboard.in','SSC','HSC','Marathi', [sub('Marathi Literature', undefined, false)],[sub('Marathi Literature', undefined, false)]);
const tamilnadu   = makeStateBoard('tnbse','Tamil Nadu (Samacheer)','Tamil Nadu State Board (Samacheer Kalvi)','Tamil Nadu','https://www.tmbse.nic.in','SSLC','HSC','Tamil');
const karnataka   = makeStateBoard('kseeb','Karnataka (KSEEB)','Karnataka Secondary Education Examination Board','Karnataka','https://www.kseeb.kar.nic.in','SSLC','PUC','Kannada');
const andhrapradesh = makeStateBoard('bseap','Andhra Pradesh (BSEAP)','Board of Secondary Education Andhra Pradesh','Andhra Pradesh','https://bse.ap.gov.in','SSC','Intermediate','Telugu');
const telangana   = makeStateBoard('bsets','Telangana (TSBIE)','Telangana State Board of Intermediate Education','Telangana','https://tsbie.cgg.gov.in','SSC','Intermediate','Telugu');
const kerala      = makeStateBoard('kbpe','Kerala (KBPE)','Kerala Board of Public Examinations','Kerala','https://keralapareekshabhavan.in','SSLC','HSE','Malayalam');
const gujarat     = makeStateBoard('gseb','Gujarat (GSEB)','Gujarat Secondary and Higher Secondary Education Board','Gujarat','https://gseb.org','SSC','HSC','Gujarati');
const rajasthan   = makeStateBoard('rbse','Rajasthan (RBSE)','Board of Secondary Education Rajasthan','Rajasthan','https://rajeduboard.rajasthan.gov.in','Secondary','Senior Secondary','Hindi');
const uttarpradesh = makeStateBoard('upmsp','UP Board (UPMSP)','Uttar Pradesh Madhyamik Shiksha Parishad','Uttar Pradesh','https://upmsp.edu.in','High School','Intermediate','Hindi');
const westbengal  = makeStateBoard('wbbse','West Bengal (WBBSE / WBCHSE)','West Bengal Board of Secondary Education','West Bengal','https://wbbse.wb.gov.in','Madhyamik','Higher Secondary','Bengali');
const bihar       = makeStateBoard('bseb','Bihar (BSEB)','Bihar School Examination Board','Bihar','https://secondary.biharboardonline.com','Matric','Inter','Hindi');
const madhyapradesh = makeStateBoard('mpbse','Madhya Pradesh (MPBSE)','Madhya Pradesh Board of Secondary Education','Madhya Pradesh','https://mpbse.nic.in','High School','Higher Secondary','Hindi');
const punjab      = makeStateBoard('pseb','Punjab (PSEB)','Punjab School Education Board','Punjab','https://pseb.ac.in','Matric','Senior Secondary','Punjabi');
const haryana     = makeStateBoard('hbse','Haryana (HBSE)','Board of School Education Haryana','Haryana','https://bseh.org.in','Secondary','Senior Secondary','Hindi');
const himachal    = makeStateBoard('hpbose','Himachal Pradesh (HPBOSE)','Himachal Pradesh Board of School Education','Himachal Pradesh','https://hpbose.org','Matric','Plus 2','Hindi');
const uttarakhand = makeStateBoard('ubse','Uttarakhand (UBSE)','Uttarakhand Board of School Education','Uttarakhand','https://ubse.uk.gov.in','High School','Intermediate','Hindi');
const odisha      = makeStateBoard('bseodisha','Odisha (BSE)','Board of Secondary Education Odisha','Odisha','https://bseodisha.ac.in','HSC / Matric','CHSE','Odia');
const assam       = makeStateBoard('seba','Assam (SEBA / AHSEC)','Board of Secondary Education Assam','Assam','https://sebaonline.org','HSLC','HSSLC','Assamese');
const jharkhand   = makeStateBoard('jac','Jharkhand (JAC)','Jharkhand Academic Council','Jharkhand','https://jac.jharkhand.gov.in','Matric','Intermediate','Hindi');
const chhattisgarh = makeStateBoard('cgbse','Chhattisgarh (CGBSE)','Chhattisgarh Board of Secondary Education','Chhattisgarh','https://cgbse.net','High School','Higher Secondary','Hindi');
const goa         = makeStateBoard('gbshse','Goa (GBSHSE)','Goa Board of Secondary & Higher Secondary Education','Goa','https://gbshse.gov.in','SSC','HSSC','Konkani / Marathi');
const jammuKashmir = makeStateBoard('jkbose','J&K (JKBOSE)','Jammu and Kashmir Board of School Education','Jammu & Kashmir','https://jkbose.nic.in','Secondary','Higher Secondary','Urdu / Kashmiri / Dogri');
const manipur     = makeStateBoard('bsem','Manipur (BSEM / COHSEM)','Board of Secondary Education Manipur','Manipur','https://bsem.nic.in','HSLC','HSE','Meitei (Manipuri)');
const meghalaya   = makeStateBoard('mbose','Meghalaya (MBOSE)','Meghalaya Board of School Education','Meghalaya','https://mbose.in','SSLC','HSSLC','Khasi / Garo / English');
const mizoram     = makeStateBoard('mbse','Mizoram (MBSE)','Mizoram Board of School Education','Mizoram','https://mbse.edu.in','HSLC','HSSLC','Mizo');
const nagaland    = makeStateBoard('nbse','Nagaland (NBSE)','Nagaland Board of School Education','Nagaland','https://nbsenagaland.com','HSLC','HSSLC','English / Nagamese');
const tripura     = makeStateBoard('tbse','Tripura (TBSE)','Tripura Board of Secondary Education','Tripura','https://tbse.in','Madhyamik','Higher Secondary','Bengali / Kokborok');
const sikkim      = makeStateBoard('sbse','Sikkim (SBSE)','Sikkim Board of School Education','Sikkim','https://sikkim.gov.in/boards/sikkim-board-of-school-education','Secondary','Senior Secondary','Nepali / Sikkimese');
const arunachal   = makeStateBoard('dbse','Arunachal Pradesh (DBSE)','Directorate of Secondary Education Arunachal Pradesh','Arunachal Pradesh','https://seba.ac.in','HSLC','HSSLC','English');

// ─── EXPORTED MASTER LIST ─────────────────────────────────────────────────────
export const INDIAN_BOARDS_MASTER: IndianBoard[] = [
  // National
  cbse, cisce, nios,
  // International
  ib, cambridge,
  // State — sorted by school enrollment (approx)
  uttarpradesh, maharashtra, rajasthan, bihar, madhyapradesh, westbengal,
  andhrapradesh, telangana, tamilnadu, karnataka, gujarat, haryana,
  kerala, jharkhand, odisha, chhattisgarh, uttarakhand, punjab,
  assam, himachal, goa, jammuKashmir, manipur, meghalaya, mizoram,
  nagaland, tripura, sikkim, arunachal,
];

// ─── Subject categories for grouping ─────────────────────────────────────────
export const SUBJECT_CATEGORIES = [
  'Science', 'Commerce', 'Arts/Humanities', 'Language', 'Mathematics',
  'Technology', 'Physical Education', 'Vocational', 'General',
] as const;

export type SubjectCategory = typeof SUBJECT_CATEGORIES[number];

// ─── Default subjects for manual "add subject" quick-pick ─────────────────────
export const COMMON_SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology',
  'English', 'Hindi', 'Sanskrit', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu',
  'History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Psychology',
  'Philosophy', 'Social Science', 'Environmental Studies (EVS)', 'Accountancy',
  'Business Studies', 'Commerce', 'Entrepreneurship', 'Legal Studies',
  'Computer Science', 'Computer Applications', 'Informatics Practices',
  'Information Technology', 'Artificial Intelligence', 'Data Science',
  'Physical Education', 'Yoga', 'Health & Wellness',
  'Fine Arts', 'Drawing & Painting', 'Music (Vocal)', 'Music (Instrumental)', 'Dance',
  'Drama / Theatre', 'Home Science', 'Agriculture',
  'Applied Mathematics', 'Statistics', 'Biotechnology',
];
