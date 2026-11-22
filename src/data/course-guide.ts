import assessmentPolicy from "./native-assessments.json" with { type: "json" };

export const programs = [
  { slug: "science", code: "SCI", title: "Science", text: "Students learn to ask useful questions, plan careful investigations and explain what the evidence shows." },
  { slug: "mathematics", code: "MAT", title: "Mathematics", text: "Courses build from strong fundamentals to functions, calculus and data, with time to practise and revisit difficult ideas." },
  { slug: "technology", code: "TEC", title: "Technology & Computer Studies", text: "Hands-on design, coding and collaborative projects help students turn an idea into something they can test and improve." },
  { slug: "business", code: "BUS", title: "Business", text: "Case studies and practical assignments introduce entrepreneurship, accounting, marketing and responsible decision-making." },
  { slug: "humanities", code: "HUM", title: "Humanities & Social Sciences", text: "History, geography and the social sciences invite students to read closely and understand different perspectives." },
  { slug: "english-support", code: "ENG", title: "English & Language Support", text: "English courses and targeted language support help students communicate confidently and prepare for senior-level study." },
] as const;

type CourseListing = {
  code: string;
  title: string;
  grade: string;
  pathway: string;
  credit: string;
  prerequisite: string;
  summary: string;
};

type CourseGroup = {
  slug: (typeof programs)[number]["slug"];
  code: string;
  title: string;
  eyebrow: string;
  introduction: string;
  courses: CourseListing[];
};

export const courseGroups: CourseGroup[] = [
  {
    slug: "science",
    code: "SCI",
    title: "Science",
    eyebrow: "From Integrated Science To Senior Specialization",
    introduction: "The science pathway begins with a shared foundation, then opens into biology, chemistry and physics. Laboratory work, data analysis and scientific communication run through every year.",
    courses: [
      { code: "SNC1W", title: "Science", grade: "Grade 9", pathway: "De-Streamed", credit: "1 Credit", prerequisite: "None", summary: "Explore biology, chemistry, physics, Earth and space science through investigation, engineering design and real-world applications." },
      { code: "SNC2D", title: "Science", grade: "Grade 10", pathway: "Academic", credit: "1 Credit", prerequisite: "Grade 9 Science (SNC1W)", summary: "Study biological systems, chemical reactions, climate change and light while developing stronger laboratory and analytical skills." },
      { code: "SBI3U", title: "Biology", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 Science, Academic (SNC2D)", summary: "Investigate biodiversity, evolution, genetics, animal systems and plant structure, with an emphasis on evidence and experimental design." },
      { code: "SCH3U", title: "Chemistry", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 Science, Academic (SNC2D)", summary: "Examine matter, chemical trends, reactions, quantities, solutions and gases through theory, calculation and laboratory investigation." },
      { code: "SPH3U", title: "Physics", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 Science, Academic (SNC2D)", summary: "Develop models for motion, forces, energy, waves, sound, electricity and magnetism, then test those models against observations." },
      { code: "SBI4U", title: "Biology", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 11 Biology, University (SBI3U)", summary: "Connect biochemistry, metabolism, molecular genetics, homeostasis and population dynamics in preparation for post-secondary study." },
      { code: "SCH4U", title: "Chemistry", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 11 Chemistry, University (SCH3U)", summary: "Study organic chemistry, molecular structure, energy changes, reaction rates, equilibrium and electrochemistry through advanced problem solving." },
      { code: "SPH4U", title: "Physics", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 11 Physics, University (SPH3U)", summary: "Explore dynamics, energy and momentum, gravitational and electromagnetic fields, light and key ideas in modern physics." },
      { code: "SES4U", title: "Earth And Space Science", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 Science, Academic (SNC2D)", summary: "Investigate the universe, the solar system, Earth's materials and geological history, and the processes that shape the planet." },
    ],
  },
  {
    slug: "mathematics",
    code: "MAT",
    title: "Mathematics",
    eyebrow: "Build Fluency, Reasoning And Choice",
    introduction: "Students develop mathematical confidence through clear instruction, purposeful practice and problems that connect algebra, functions, geometry, probability and data.",
    courses: [
      { code: "MTH1W", title: "Mathematics", grade: "Grade 9", pathway: "De-Streamed", credit: "1 Credit", prerequisite: "None", summary: "Strengthen number sense, algebra, geometry, measurement, data literacy, coding and financial literacy in one connected course." },
      { code: "MPM2D", title: "Principles Of Mathematics", grade: "Grade 10", pathway: "Academic", credit: "1 Credit", prerequisite: "Grade 9 Mathematics (MTH1W)", summary: "Use linear and quadratic relationships, analytic geometry and trigonometry to model and solve increasingly complex problems." },
      { code: "MCR3U", title: "Functions", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 Principles Of Mathematics, Academic (MPM2D)", summary: "Study polynomial, rational, exponential and trigonometric functions while refining algebraic reasoning and mathematical communication." },
      { code: "MHF4U", title: "Advanced Functions", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 11 Functions (MCR3U) Or Mathematics For College Technology (MCT4C)", summary: "Extend work with polynomial, rational, logarithmic and trigonometric functions and prepare for calculus-based study." },
      { code: "MCV4U", title: "Calculus And Vectors", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Advanced Functions (MHF4U), Taken Before Or At The Same Time", summary: "Investigate rates of change, derivatives and the geometry and algebra of vectors for programs in science, engineering and mathematics." },
      { code: "MDM4U", title: "Mathematics Of Data Management", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Functions (MCR3U) Or Functions And Applications (MCF3M)", summary: "Explore counting, probability, distributions, statistical analysis and a culminating investigation built around a meaningful data question." },
    ],
  },
  {
    slug: "technology",
    code: "TEC",
    title: "Technology & Computer Studies",
    eyebrow: "Design, Build, Code And Improve",
    introduction: "Technology courses give students structured time to work safely with tools and digital systems, develop prototypes and learn through testing, feedback and revision.",
    courses: [
      { code: "TAS1O", title: "Technology And The Skilled Trades", grade: "Grade 9", pathway: "Open", credit: "1 Credit", prerequisite: "None", summary: "Use the engineering design process to create prototypes, products or services while exploring tools, safety and pathways in technology and the skilled trades." },
      { code: "TAS2O", title: "Technology And The Skilled Trades", grade: "Grade 10", pathway: "Open", credit: "1 Credit", prerequisite: "None", summary: "Apply the engineering design process to more complex prototypes while developing safe tool use and exploring technological systems and skilled-trades pathways." },
      { code: "ICS3U", title: "Introduction To Computer Science", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "None", summary: "Design programs with clear algorithms, modular code and testing while considering software development practices and computing careers." },
      { code: "ICS4U", title: "Computer Science", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Introduction To Computer Science (ICS3U)", summary: "Develop more complex software using data structures, algorithms, object-oriented design, collaborative tools and a substantial final project." },
      { code: "TEJ3M", title: "Computer Engineering Technology", grade: "Grade 11", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "None", summary: "Work with computer hardware, electronics, interfaces and programming while designing and troubleshooting integrated systems." },
      { code: "TEJ4M", title: "Computer Engineering Technology", grade: "Grade 12", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "Computer Engineering Technology (TEJ3M)", summary: "Design more complex digital and computer systems and complete an engineering project that brings hardware and software together." },
    ],
  },
  {
    slug: "business",
    code: "BUS",
    title: "Business",
    eyebrow: "Ideas, Decisions And Responsible Leadership",
    introduction: "Business courses connect entrepreneurial thinking with financial literacy, marketing, accounting and leadership. Students learn by developing ideas and making decisions with evidence.",
    courses: [
      { code: "BEM1O", title: "Building The Entrepreneurial Mindset", grade: "Grade 9", pathway: "Open", credit: "1 Credit", prerequisite: "None", summary: "Identify needs, generate and test ideas, use business technologies and consider how responsible entrepreneurs create value." },
      { code: "BEP2O", title: "Launching And Leading A Business", grade: "Grade 10", pathway: "Open", credit: "1 Credit", prerequisite: "None", summary: "Explore market opportunities and the responsibilities involved in planning, operating and leading an ethical business." },
      { code: "BAF3M", title: "Financial Accounting Fundamentals", grade: "Grade 11", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "None", summary: "Learn the accounting cycle, prepare financial statements and use financial information to understand how a service or merchandising business is performing." },
      { code: "BAT4M", title: "Financial Accounting Principles", grade: "Grade 12", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "Financial Accounting Fundamentals (BAF3M)", summary: "Apply advanced accounting principles to partnerships and corporations and interpret financial information for decision-making." },
      { code: "BBB4M", title: "International Business Fundamentals", grade: "Grade 12", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "None", summary: "Examine global markets, trade, culture, ethics and the strategies Canadian organizations use when operating internationally." },
      { code: "BOH4M", title: "Business Leadership: Management Fundamentals", grade: "Grade 12", pathway: "University / College Preparation", credit: "1 Credit", prerequisite: "None", summary: "Study leadership, planning, organizing and communication, then apply management concepts to contemporary workplace situations." },
    ],
  },
  {
    slug: "humanities",
    code: "HUM",
    title: "Humanities & Social Sciences",
    eyebrow: "Understand Place, History And People",
    introduction: "Students examine how communities, institutions and ideas change over time. Research, discussion and writing help them compare perspectives and make well-supported arguments.",
    courses: [
      { code: "CGC1W", title: "Exploring Canadian Geography", grade: "Grade 9", pathway: "De-Streamed", credit: "1 Credit", prerequisite: "None", summary: "Investigate connections among Canada's natural and human systems and consider how local choices relate to national and global issues." },
      { code: "CHC2D", title: "Canadian History Since World War I", grade: "Grade 10", pathway: "Academic", credit: "1 Credit", prerequisite: "None", summary: "Use historical evidence to examine political, economic and social developments in Canada from 1914 to the present." },
      { code: "CHV2O", title: "Civics And Citizenship", grade: "Grade 10", pathway: "Open", credit: "0.5 Credit", prerequisite: "None", summary: "Explore rights, responsibilities, public issues and ways citizens can participate thoughtfully in democratic life." },
      { code: "HSP3U", title: "Introduction To Anthropology, Psychology And Sociology", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 English, Academic, Or Grade 10 Canadian History, Academic", summary: "Learn how three social science disciplines investigate human behaviour, culture and society, then apply their research methods to contemporary questions." },
      { code: "HSB4U", title: "Challenge And Change In Society", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Any Grade 11 Or 12 U/M Course In Social Sciences And Humanities, English, Or Canadian And World Studies", summary: "Use social science theories and research to analyze how demographic, technological and cultural forces shape social change." },
    ],
  },
  {
    slug: "english-support",
    code: "ENG",
    title: "English & Language Support",
    eyebrow: "Read Closely, Write Clearly, Speak With Confidence",
    introduction: "English instruction develops interpretation, writing, media literacy and oral communication. Multilingual learners can receive language support connected directly to the work they do across subjects.",
    courses: [
      { code: "ENL1W", title: "English", grade: "Grade 9", pathway: "De-Streamed", credit: "1 Credit", prerequisite: "None", summary: "Read and discuss varied texts, develop an individual voice in writing and strengthen the literacy skills used across the Grade 9 program." },
      { code: "ENG2D", title: "English", grade: "Grade 10", pathway: "Academic", credit: "1 Credit", prerequisite: "Grade 9 English (ENL1W)", summary: "Analyze literary, informational and media texts and communicate ideas with greater precision in discussion, presentations and writing." },
      { code: "ENG3U", title: "English", grade: "Grade 11", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 10 English, Academic (ENG2D)", summary: "Interpret challenging texts, refine essay writing and use evidence and academic language to develop independent arguments." },
      { code: "ENG4U", title: "English", grade: "Grade 12", pathway: "University Preparation", credit: "1 Credit", prerequisite: "Grade 11 English, University (ENG3U)", summary: "Consolidate critical literacy, research, analytical writing and oral communication for university-level reading and argument." },
      { code: "ESLAO", title: "English As A Second Language - Level 1", grade: "ESL Level 1", pathway: "Open", credit: "1 Credit", prerequisite: "Initial English-Language Placement", summary: "Build beginning listening, speaking, reading and writing skills for everyday communication and participation in the school community." },
      { code: "ESLBO", title: "English As A Second Language - Level 2", grade: "ESL Level 2", pathway: "Open", credit: "1 Credit", prerequisite: "ESLAO Or Equivalent Proficiency", summary: "Develop classroom communication, short-text comprehension and paragraph writing while expanding academic and everyday vocabulary." },
      { code: "ESLCO", title: "English As A Second Language - Level 3", grade: "ESL Level 3", pathway: "Open", credit: "1 Credit", prerequisite: "ESLBO Or Equivalent Proficiency", summary: "Participate in sustained classroom discussion, interpret varied texts and produce increasingly connected oral and written work." },
      { code: "ESLDO", title: "English As A Second Language - Level 4", grade: "ESL Level 4", pathway: "Open", credit: "1 Credit", prerequisite: "ESLCO Or Equivalent Proficiency", summary: "Use academic language with greater independence in subject reading, reports, presentations and collaborative learning." },
      { code: "ESLEO", title: "English As A Second Language - Level 5", grade: "ESL Level 5", pathway: "Open", credit: "1 Credit", prerequisite: "ESLDO Or Equivalent Proficiency", summary: "Refine academic reading, research, essay writing and presentation skills in preparation for full participation in senior English courses." },
      { code: "OLC4O", title: "Ontario Secondary School Literacy Course", grade: "Grade 11 / 12", pathway: "Open", credit: "1 Credit", prerequisite: "Eligibility Confirmed By Guidance", summary: "Strengthen practical reading and writing skills while working toward the provincial secondary school literacy graduation requirement." },
    ],
  },
];

export const courseTypes = [
  ["U", "University preparation"],
  ["M", "University / college preparation"],
  ["O", "Open"],
  ["W", "De-streamed"],
  ["D", "Academic"],
] as const;

export const ontario = {
  curriculum: "https://www.dcp.edu.gov.on.ca/en/curriculum",
  assessment: "https://www.ontario.ca/page/growing-success-assessment-evaluation-and-reporting-ontario-schools-kindergarten-grade-12",
  diploma: "https://www.ontario.ca/document/ontario-schools-kindergarten-grade-12-policy-and-program-requirements/diploma-and-certificate-requirements-related-procedures",
  courseCredits: "https://www.ontario.ca/document/ontario-schools-kindergarten-grade-12-policy-and-program-requirements/secondary-school-courses-and-related-procedures",
};

type CourseFilters = {
  query: string;
  grade: string;
  subject: string;
  courseType: string;
};

export function filterCourses({ query, grade, subject, courseType }: CourseFilters) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return courseGroups.flatMap((group) => {
    if (subject && group.slug !== subject) return [];
    const courses = group.courses.filter((course) => {
      const isEsl = course.grade.startsWith("ESL");
      const grades = isEsl ? ["ESL"] : course.grade.replace("Grade ", "").split(" / ");
      return (!grade || grades.includes(grade)) &&
        (!courseType || course.code.endsWith(courseType)) &&
        terms.every((term) => `${course.code} ${course.title}`.toLowerCase().includes(term));
    });
    return courses.length ? [{ ...group, courses }] : [];
  });
}

export const policyYear = assessmentPolicy.year;

type AssessmentWeights = {
  classroom: number;
  final: number;
  attendance: number;
  exam: number;
  task: number;
};

const nativeWeights: Readonly<Record<string, AssessmentWeights>> = assessmentPolicy.courses;

// Growing Success, September 2026, tables 1–2. The six platform courses use
// the same generated weights as the gradebook. Other listings use the
// provincial grade/subject tables and their specific course exceptions.
export function assessmentForCourse(course: CourseListing, subject: CourseGroup["slug"]) {
  if (course.grade.startsWith("ESL")) {
    return {
      weights: "ESL courses use placement levels. Ask guidance which assessment breakdown applies to your section.",
      final: "",
    };
  }

  const junior = course.grade === "Grade 9" || course.grade === "Grade 10";
  const native = nativeWeights[course.code];
  const classroom = native?.classroom ?? 65;
  const attendance = native?.attendance ?? (junior ? 15 : 10);
  const finalWeight = native?.final ?? (junior ? 20 : 25);
  const weights = `Classroom work ${classroom}% · Final evaluation ${finalWeight}% · Attendance and participation ${attendance}%`;

  if (course.code === "MTH1W") {
    return { weights, final: "The Grade 9 EQAO mathematics assessment counts as the 20% written exam." };
  }
  if (!junior && course.code.endsWith("O")) {
    return { weights, final: "A written final exam is optional for senior open courses. The final evaluation can include a project, presentation or portfolio." };
  }

  let task = 0;
  if (native) task = native.task;
  else if (subject === "technology") task = junior ? 10 : 15;
  else if (subject === "business" || (subject === "humanities" && !junior)) task = 10;

  const exam = native?.exam ?? (finalWeight - task);
  const final = task
    ? `Written exam ${exam}% · Culminating task ${task}%.`
    : `Written exam ${exam}%.`;
  return { weights, final };
}
