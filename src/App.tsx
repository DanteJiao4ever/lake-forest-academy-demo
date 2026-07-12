import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type ActionType = "enquire" | "tour" | "apply";
type PageKind = "home" | "academics" | "courses" | "admissions";
type InnerPageKind = Exclude<PageKind, "home">;

const programs = [
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

const courseGroups: CourseGroup[] = [
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

const admissionsSteps = [
  ["01", "Tell us about your student", "Begin with a short enquiry about the student's current grade, interests and intended entry term."],
  ["02", "Share recent school records", "The admissions team will explain how to provide report cards or transcripts through an appropriate process."],
  ["03", "Meet with us", "A conversation with the student and family helps us understand goals, support needs and any placement questions."],
  ["04", "Review the next steps", "After the academic review, the family receives an admissions decision and an invitation to discuss course planning."],
];

const academicJourney = [
  ["Grade 9", "Settle into strong habits", "Build confidence in core subjects, learn how high school credits work and begin exploring new interests."],
  ["Grade 10", "Notice what fits", "Review progress, strengthen academic communication and make more intentional choices for senior study."],
  ["Grade 11", "Connect courses with possibilities", "Choose senior courses with post-secondary prerequisites in mind while becoming a more independent learner."],
  ["Grade 12", "Finish well and look ahead", "Confirm remaining requirements, prepare applications and plan for the transition beyond secondary school."],
];

const learningPrinciples = [
  ["01", "Begin with a good question", "Students investigate ideas, test assumptions and learn to explain the evidence behind their conclusions."],
  ["02", "Use feedback well", "Teachers make expectations clear and give students practical ways to revise and improve their work."],
  ["03", "Connect learning with context", "Labs, presentations and group projects help students see where classroom knowledge can be used."],
];

const admissionPathways = [
  {
    label: "Domestic applicants",
    title: "Build on your current studies",
    text: "We begin with the student's current grade, recent Canadian school records and intended entry term. Guidance then identifies the questions that need to be resolved before a course plan is confirmed.",
  },
  {
    label: "International applicants",
    title: "Prepare for a new school system",
    text: "We review recent academic records and the student's English-language background. Certified translations may be requested, while families remain responsible for immigration and housing arrangements.",
  },
];

const applicationChecklist = [
  "Recent report cards or transcripts",
  "The student's current grade and intended entry term",
  "Certified English translations when original records are in another language",
  "A short introduction to the student's interests and goals",
  "Information about previous English-language study, if relevant",
  "Any follow-up material confirmed directly by the admissions team",
];

const historyMilestones = [
  {
    year: "2008",
    title: "A smaller school with a clear purpose",
    text: "Lake Forest Academy grew from conversations among North York educators and families who wanted a secondary school where academic expectations and personal attention could exist side by side.",
  },
  {
    year: "2012",
    title: "Traditions begin to take hold",
    text: "As the first senior students completed their time at the Academy, advisor meetings, family conversations and student-led activities became part of the school's everyday rhythm.",
  },
  {
    year: "2017",
    title: "Guidance becomes part of every year",
    text: "Course planning and post-secondary research were brought together so that students could understand not only what they needed to take, but why each choice mattered.",
  },
  {
    year: "2021",
    title: "More learning moves into practice",
    text: "Science investigations, technology projects and community-focused work gave students more opportunities to collaborate, solve problems and reflect on their impact.",
  },
  {
    year: "Today",
    title: "Still growing, still personal",
    text: "Lake Forest Academy continues to welcome students with different experiences and ambitions while holding on to the close relationships that shaped the school from the beginning.",
  },
];

const menuGroups = [
  {
    title: "Our School",
    description: "A close-knit Grade 9-12 community in North York.",
    links: [["Welcome", "#about"], ["Our History", "#history"], ["School Facts", "#facts"]],
  },
  {
    title: "Academics",
    description: "OSSD courses, English support and university planning.",
    links: [["OSSD Pathway", "#academics"], ["Course Catalogue", "#courses"], ["Learning Support", "#guidance"]],
  },
  {
    title: "Student Life",
    description: "Clubs, athletics, belonging and international transition support.",
    links: [["Life At LFA", "#student-life"], ["Photo Stories", "#life-gallery"], ["News And Events", "#news"]],
  },
  {
    title: "Admissions",
    description: "Clear next steps for domestic and international families.",
    links: [["How To Apply", "#admissions"], ["Frequently Asked Questions", "#faq"], ["Contact Admissions", "#contact"]],
  },
];

const carouselSlides = [
  { src: "student-community.jpg", alt: "Students gathering in the school courtyard", title: "A place to feel known", text: "Advisor meetings, clubs and ordinary time together help new students find their place." },
  { src: "technology-class.jpg", alt: "Students collaborating on a technology project", title: "An idea worth testing", text: "Students plan, build, make mistakes and improve their work together." },
  { src: "campus-life-basketball.jpg", alt: "Students playing basketball in the school gym", title: "Time to move and reconnect", text: "Athletics and recreation give students a healthy change of pace after class." },
  { src: "science-lab.jpg", alt: "Students conducting a science experiment with their teacher", title: "Look closely, then ask why", text: "Lab work gives students a chance to compare what they expected with what actually happened." },
];

const newsItems = [
  { date: "03 SEP 2026", category: "Community", title: "New Student Welcome Morning", text: "Advisors and peer ambassadors will help new students learn the daily schedule, find their classrooms and meet the people they can turn to for help." },
  { date: "14 OCT 2026", category: "Academic Planning", title: "Senior Courses and University Pathways Evening", text: "Students and families can ask questions about Grade 11 and 12 course choices, prerequisites and application timelines." },
  { date: "07 NOV 2026", category: "Student Life", title: "North York Community Service Day", text: "Student groups will spend the morning contributing to local service activities, followed by a short reflection back at school." },
];

const faqs = [
  ["What academic pathway does Lake Forest Academy follow?", "Our Grade 9-12 program is organized around Ontario curriculum expectations and OSSD requirements. Guidance reviews each student's previous learning and remaining requirements before confirming a course plan."],
  ["Who can apply?", "Domestic and international students seeking entry to Grades 9-12 may begin with an enquiry. Placement depends on recent academic records, the intended entry term and available courses."],
  ["Is English-language support available?", "English-language support can be included in a student's plan when it is needed. The level and format of support are discussed after reviewing the student's academic and language background."],
  ["Does the school offer boarding?", "Lake Forest Academy is a day school and does not operate student residences. Families make their own housing and transportation arrangements."],
  ["How can I arrange a campus visit?", "Choose Book a Tour and suggest a preferred date. The admissions team will follow up to confirm an available time and explain what to expect during the visit."],
  ["Can I submit documents through this website?", "No. The current enquiry and application forms are demonstrations and do not send or store personal information. Please do not enter or upload sensitive documents."],
];

const searchItems = [
  { title: "About Lake Forest Academy", area: "Our School", text: "School profile, learning community and facts.", href: "#about" },
  { title: "Our History", area: "Our School", text: "How the school's close-knit approach developed over time.", href: "#history" },
  { title: "OSSD Academic Pathway", area: "Academics", text: "Course areas, diploma expectations and university preparation.", href: "#academics" },
  { title: "Course Catalogue", area: "Academics", text: "Course codes, prerequisites and descriptions by subject.", href: "#courses" },
  { title: "Guidance and English Support", area: "Student Support", text: "Course planning, wellbeing and ESL development.", href: "#guidance" },
  { title: "Student Life", area: "Community", text: "Clubs, athletics, leadership and international transition support.", href: "#student-life" },
  { title: "News and Events", area: "Community", text: "Upcoming orientation, academic planning and community events.", href: "#news" },
  { title: "How to Apply", area: "Admissions", text: "Four steps from inquiry to an OSSD study plan.", href: "#admissions" },
  { title: "Admissions FAQ", area: "Admissions", text: "Answers about grades, language support and campus visits.", href: "#faq" },
  { title: "Contact Admissions", area: "Admissions", text: "Ask about entry, course planning or student support.", href: "#contact" },
];

const actionCopy: Record<ActionType, { eyebrow: string; title: string; text: string; button: string }> = {
  enquire: { eyebrow: "Admissions enquiry", title: "Ask us what you need to know", text: "Tell us the student's current grade and what your family is hoping to understand about courses, support or admissions.", button: "Send enquiry" },
  tour: { eyebrow: "Campus visit", title: "Come and see a school day up close", text: "Suggest a preferred date and let us know who plans to attend. A visit time would be confirmed before you arrive.", button: "Request a visit" },
  apply: { eyebrow: "Application", title: "Begin with the essentials", text: "Share the student's current grade and intended entry term to begin an initial admissions record.", button: "Begin application" },
};

type PageViewProps = {
  assetUrl: (filename: string) => string;
  routeHref: (destination: InnerPageKind) => string;
  homeHref: (hash?: string) => string;
  openAction: (action: ActionType) => void;
};

function ProgramCard({ program, routeHref }: { program: (typeof programs)[number]; routeHref: PageViewProps["routeHref"] }) {
  return (
    <a className="program-card" href={`${routeHref("courses")}#${program.slug}`}>
      <span className="program-card-top"><span className="program-code">{program.code}</span><span className="program-card-arrow" aria-hidden="true">&nearr;</span></span>
      <h3>{program.title}</h3>
      <p>{program.text}</p>
      <span className="program-card-cta">View Course Details <span aria-hidden="true">-&gt;</span></span>
    </a>
  );
}

function AcademicsPage({ assetUrl, routeHref, homeHref, openAction }: PageViewProps) {
  return (
    <>
      <section className="inner-hero" id="top">
        <div className="inner-hero-copy">
          <p className="eyebrow light">Academics at Lake Forest</p>
          <h1>Learn with purpose. <strong>Keep your options open.</strong></h1>
          <p>A good course plan should make sense now and still leave room for a student to change. Our Grade 9-12 program combines Ontario curriculum, practical work and regular guidance.</p>
          <div className="hero-actions">
            <a className="button primary" href="#pathway">See how planning works <span aria-hidden="true">-&gt;</span></a>
            <button className="button ghost" type="button" onClick={() => openAction("enquire")}>Ask about courses</button>
          </div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("academics-seminar.jpg")} alt="Students and a teacher discussing a classroom design project" /></div>
      </section>

      <nav className="page-subnav" aria-label="Academics page">
        <a href="#pathway">OSSD Pathway</a><a href="#grade-journey">Grades 9-12</a><a href="#programs">Course Areas</a><a href="#guidance">Guidance</a>
      </nav>

      <section className="page-intro section" id="pathway">
        <div><p className="eyebrow">The Ontario pathway</p><h2>Start with the student, then build the plan.</h2></div>
        <div className="page-intro-copy">
          <p>Each plan begins with previous credits, current strengths and the possibilities a student wants to explore. Required courses, electives, literacy learning, community involvement and future prerequisites are reviewed together.</p>
          <p>Graduation requirements can depend on when and where a student began secondary school. Guidance confirms each student&apos;s requirements, placement and available courses individually.</p>
        </div>
      </section>

      <section className="framework section" aria-label="OSSD planning framework">
        <div className="framework-grid">
          <article><span>01</span><h3>Credit planning</h3><p>Review completed learning and map the remaining required and elective courses in a sensible sequence.</p></article>
          <article><span>02</span><h3>Literacy development</h3><p>Strengthen the reading, writing and communication students use in every subject.</p></article>
          <article><span>03</span><h3>Community involvement</h3><p>Choose meaningful ways to contribute, then reflect on what the experience taught.</p></article>
          <article><span>04</span><h3>Future prerequisites</h3><p>Look at possible college and university programs before senior course choices are finalized.</p></article>
        </div>
      </section>

      <section className="grade-journey section" id="grade-journey">
        <div className="section-heading"><p className="eyebrow">Grades 9-12</p><h2>A plan that changes as students do.</h2><p>Each year should answer today&apos;s questions while preparing students for the choices that come next.</p></div>
        <div className="journey-list">
          {academicJourney.map(([grade, title, text]) => <article key={grade}><strong>{grade}</strong><div><h3>{title}.</h3><p>{text}</p></div></article>)}
        </div>
      </section>

      <section className="academics section inner-programs" id="programs">
        <div className="section-heading"><p className="eyebrow">Course exploration</p><h2>Build depth, then leave room to explore.</h2><p>The program combines core Ontario curriculum with opportunities to investigate science, technology, business, the humanities and the arts.</p></div>
        <div className="program-grid">
          {programs.map((program) => <ProgramCard key={program.code} program={program} routeHref={routeHref} />)}
        </div>
      </section>

      <section className="learning-practice section">
        <div className="learning-image"><img src={assetUrl("science-lab.jpg")} alt="Students conducting a science experiment with their teacher" /></div>
        <div className="learning-copy"><p className="eyebrow">Learning that connects</p><h2>Good work rarely happens on the first try.</h2><p>Students investigate, discuss, revise and explain their thinking. Feedback is treated as part of learning, not simply a comment added after the work is finished.</p>
          <div className="principle-list">{learningPrinciples.map(([number, title, text]) => <div key={number}><strong>{number}</strong><span><b>{title}</b>{text}</span></div>)}</div>
        </div>
      </section>

      <section className="support section" id="guidance">
        <div className="support-copy"><p className="eyebrow">A plan that belongs to the student</p><h2>A course plan students can understand and own.</h2><p>Planning begins with the student&apos;s record, interests and current questions. Advisors revisit the plan as new strengths appear and post-secondary ideas become more specific.</p>
          <div className="support-list">
            <div><strong>01</strong><span><b>Course mapping</b>Review completed learning and map the courses still needed for the student&apos;s pathway.</span></div>
            <div><strong>02</strong><span><b>Post-secondary research</b>Compare prerequisites, timelines and questions to explore with colleges and universities.</span></div>
            <div><strong>03</strong><span><b>Academic English support</b>Connect language development with the reading, writing and discussion used in class.</span></div>
          </div>
        </div>
        <div className="support-image"><img src={assetUrl("student-guidance.jpg")} alt="A guidance counsellor helping a student plan an academic pathway" /></div>
      </section>

      <section className="page-next section">
        <div><p className="eyebrow light">Your next academic step</p><h2>Bring your transcript - and your questions.</h2><p>Whether a student is entering Grade 9 or transferring later, the best starting point is an honest conversation about completed studies, interests and the intended entry term.</p></div>
        <div className="page-next-actions"><button className="button primary" type="button" onClick={() => openAction("enquire")}>Ask about academics</button><a className="button ghost" href={routeHref("admissions")}>Review admissions</a><a className="text-link light-link" href={homeHref("#student-life")}>Discover student life <span aria-hidden="true">-&gt;</span></a></div>
      </section>
    </>
  );
}

function CourseCataloguePage({ assetUrl, routeHref, openAction }: PageViewProps) {
  return (
    <>
      <section className="inner-hero course-catalogue-hero" id="top">
        <div className="inner-hero-copy">
          <p className="eyebrow light">2026-27 Course Guide</p>
          <h1>Explore Courses. <strong>Build Your Pathway.</strong></h1>
          <p>Begin with the courses a student has already completed, then look ahead to the prerequisites that keep future options open. This guide brings course content and sequencing into one place.</p>
          <div className="hero-actions"><a className="button primary" href="#science">Explore Science <span aria-hidden="true">-&gt;</span></a><button className="button ghost" type="button" onClick={() => openAction("enquire")}>Ask About Courses</button></div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("science-lab.jpg")} alt="Students working through a science investigation in the laboratory" /></div>
      </section>

      <nav className="page-subnav course-subnav" aria-label="Course subjects">
        {programs.map((program) => <a href={`#${program.slug}`} key={program.slug}>{program.title}</a>)}
      </nav>

      <section className="course-guide-intro section">
        <div className="course-guide-copy"><p className="eyebrow">Course Planning At A Glance</p><h2>See What A Course Covers - And What It Opens Next.</h2><p>Every course listing includes the ministry course code, grade, pathway, credit value and prerequisite. Course availability is reviewed each year and a student&apos;s final timetable is confirmed through guidance.</p></div>
        <div className="course-guide-facts" aria-label="OSSD planning facts">
          <article><strong>30</strong><span>Credits In A Complete OSSD Program</span></article>
          <article><strong>2</strong><span>Compulsory Science Credits</span></article>
          <article><strong>1</strong><span>Grade 9 Or 10 Technology Credit For 2024+ Cohorts</span></article>
        </div>
      </section>

      <section className="course-catalogue section" aria-label="Course catalogue by subject">
        {courseGroups.map((group, groupIndex) => (
          <section className="course-area" id={group.slug} key={group.slug}>
            <header className="course-area-heading">
              <div className="course-area-index"><span>{String(groupIndex + 1).padStart(2, "0")}</span><strong>{group.code}</strong></div>
              <div><p className="eyebrow">{group.eyebrow}</p><h2>{group.title}</h2><p>{group.introduction}</p></div>
            </header>

            {group.slug === "science" && (
              <div className="science-map" aria-label="OSSD science course pathway">
                <div className="science-map-heading"><span>Science Pathway</span><p>Complete the shared Grade 9 and Grade 10 foundation before moving into senior subject specializations.</p></div>
                <div className="science-pathway">
                  <article><small>Grade 9</small><strong>SNC1W</strong><span>Integrated Science</span></article>
                  <i aria-hidden="true">-&gt;</i>
                  <article><small>Grade 10</small><strong>SNC2D</strong><span>Academic Science</span></article>
                  <i aria-hidden="true">-&gt;</i>
                  <div className="science-senior-branches">
                    <article><small>Biology</small><strong>SBI3U -&gt; SBI4U</strong><span>Grade 11 To Grade 12</span></article>
                    <article><small>Chemistry</small><strong>SCH3U -&gt; SCH4U</strong><span>Grade 11 To Grade 12</span></article>
                    <article><small>Physics</small><strong>SPH3U -&gt; SPH4U</strong><span>Grade 11 To Grade 12</span></article>
                    <article><small>Earth & Space</small><strong>SNC2D -&gt; SES4U</strong><span>Direct Senior Option</span></article>
                  </div>
                </div>
              </div>
            )}

            <div className="course-list">
              {group.courses.map((course) => (
                <article className="course-row" key={course.code}>
                  <div className="course-identity"><strong>{course.code}</strong><span>{course.grade}</span></div>
                  <div className="course-description"><p className="course-meta">{course.pathway} &middot; {course.credit}</p><h3>{course.title}</h3><p>{course.summary}</p></div>
                  <div className="course-prerequisite"><span>Prerequisite</span><p>{course.prerequisite}</p></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="course-planning section">
        <div><p className="eyebrow light">Plan With The Full Picture</p><h2>A Course Choice Should Make Sense Today And Tomorrow.</h2><p>Graduation requirements vary by the year a student entered Grade 9. Guidance reviews previous credits, compulsory requirements, language needs and post-secondary prerequisites before confirming a plan.</p></div>
        <div className="course-planning-actions">
          <button className="button primary" type="button" onClick={() => openAction("enquire")}>Discuss A Course Plan</button>
          <a className="button ghost" href={routeHref("academics")}>Review The OSSD Pathway</a>
          <a className="text-link light-link" href={`${routeHref("admissions")}#contact`}>Contact Admissions <span aria-hidden="true">-&gt;</span></a>
        </div>
        <div className="curriculum-references"><span>Curriculum References</span><a href="https://www.dcp.edu.gov.on.ca/en/curriculum" target="_blank" rel="noreferrer">Ontario Curriculum & Resources <span aria-hidden="true">&nearr;</span></a><a href="https://www.ontario.ca/page/earning-your-high-school-diploma" target="_blank" rel="noreferrer">Current OSSD Requirements <span aria-hidden="true">&nearr;</span></a></div>
      </section>
    </>
  );
}

type AdmissionsPageProps = PageViewProps & {
  openFaq: number | null;
  setOpenFaq: (index: number | null) => void;
};

function AdmissionsPage({ assetUrl, routeHref, openAction, openFaq, setOpenFaq }: AdmissionsPageProps) {
  return (
    <>
      <section className="inner-hero admissions-hero" id="top">
        <div className="inner-hero-copy">
          <p className="eyebrow light">Admissions</p>
          <h1>Choosing a school is personal. <strong>The process can still be clear.</strong></h1>
          <p>Begin with a conversation, share recent school records and meet with us to discuss fit, support needs and a possible OSSD course pathway.</p>
          <div className="hero-actions"><button className="button primary" type="button" onClick={() => openAction("enquire")}>Ask Admissions</button><button className="button ghost" type="button" onClick={() => openAction("tour")}>Plan a visit</button></div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("admissions-welcome.jpg")} alt="A peer ambassador welcoming a prospective student on campus" /></div>
      </section>

      <nav className="page-subnav" aria-label="Admissions page">
        <a href="#pathways">Applicant Pathways</a><a href="#steps">How To Apply</a><a href="#requirements">What To Prepare</a><a href="#faq">FAQ</a>
      </nav>

      <section className="pathways section" id="pathways">
        <div className="section-heading"><p className="eyebrow">Find your pathway</p><h2>We begin by understanding where the student is now.</h2><p>Recent studies, intended entry term and support needs give the admissions team the context for a useful first conversation.</p></div>
        <div className="pathway-grid">
          {admissionPathways.map((pathway, index) => <article key={pathway.label}><span>0{index + 1}</span><small>{pathway.label}</small><h3>{pathway.title}.</h3><p>{pathway.text}</p></article>)}
        </div>
        <p className="section-note">Lake Forest Academy is a day school. Families are responsible for immigration, legal, housing and transportation arrangements.</p>
      </section>

      <section className="admissions section inner-admissions" id="steps">
        <div className="section-heading"><p className="eyebrow">The admissions journey</p><h2>Four steps, with time to ask questions.</h2><p>Admissions should help both the family and the school understand whether the learning environment and suggested course plan are a good fit.</p></div>
        <div className="steps">{admissionsSteps.map(([number, title, text]) => <article key={number}><strong>{number}</strong><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="requirements section" id="requirements">
        <div className="requirements-copy"><p className="eyebrow">Preparing ahead</p><h2>A few things to have nearby.</h2><p>You do not need to organize everything before making an enquiry. These items simply help the academic review move forward when the time comes.</p><button className="button primary" type="button" onClick={() => openAction("apply")}>Begin an application</button></div>
        <div className="requirement-list">
          {applicationChecklist.map((item, index) => <div key={item}><strong>{String(index + 1).padStart(2, "0")}</strong><span>{item}</span></div>)}
          <aside><b>Please note</b>This demonstration website cannot receive documents or personal information. Do not enter or upload sensitive records here.</aside>
        </div>
      </section>

      <section className="faq section" id="faq">
        <div className="faq-heading"><p className="eyebrow">Admissions questions</p><h2>Questions families often ask first.</h2><p>Entry dates, course availability and individual requirements are confirmed directly with each family after an academic review.</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => <article className={openFaq === index ? "open" : ""} key={question}><h3><button type="button" aria-expanded={openFaq === index} aria-controls={`admissions-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><i aria-hidden="true">{openFaq === index ? "-" : "+"}</i></button></h3><div id={`admissions-faq-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></article>)}
        </div>
      </section>

      <section className="page-next section admissions-next">
        <div><p className="eyebrow light">Your next step</p><h2>Take the next step that feels useful.</h2><p>Ask a question, arrange a visit or review the academic program before deciding whether to begin an application.</p></div>
        <div className="page-next-actions"><button className="button primary" type="button" onClick={() => openAction("enquire")}>Enquire</button><button className="button ghost" type="button" onClick={() => openAction("tour")}>Book a Tour</button><a className="text-link light-link" href={routeHref("academics")}>Review academics <span aria-hidden="true">-&gt;</span></a></div>
      </section>
    </>
  );
}

function getRouteContext(initialPage?: PageKind) {
  if (typeof window === "undefined") return { page: initialPage ?? "home" as PageKind, base: "/" };
  const trimmedPath = window.location.pathname.replace(/\/+$/, "");
  const segments = trimmedPath.split("/").filter(Boolean);
  const finalSegment = segments.at(-1);
  const routeSegment = finalSegment === "index.html" ? segments.at(-2) : finalSegment;
  const detectedPage: PageKind = routeSegment === "academics" || routeSegment === "courses" || routeSegment === "admissions" ? routeSegment : "home";
  const page = initialPage ?? detectedPage;
  const base = detectedPage === "home"
    ? (finalSegment === "index.html" ? window.location.pathname.replace(/index\.html\/?$/, "") : window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`)
    : window.location.pathname.replace(new RegExp(`${detectedPage}(?:/index\\.html)?/?$`), "");
  return { page, base: base || "/" };
}

export function SchoolSite({ initialPage }: { initialPage?: PageKind }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPlaying, setCarouselPlaying] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [actionSent, setActionSent] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const actionDialogRef = useRef<HTMLElement>(null);
  const lastActionTriggerRef = useRef<HTMLElement | null>(null);
  const [{ page, base }] = useState(() => getRouteContext(initialPage));

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectMotionPreference = () => {
      if (motionPreference.matches) setCarouselPlaying(false);
    };
    const timer = window.setTimeout(respectMotionPreference, 0);
    motionPreference.addEventListener("change", respectMotionPreference);
    return () => {
      window.clearTimeout(timer);
      motionPreference.removeEventListener("change", respectMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!carouselPlaying) return;
    const timer = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % carouselSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [carouselPlaying]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeAction) closeAction();
      else if (searchOpen) closeSearch();
      else if (menuOpen) closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen, activeAction]);

  useEffect(() => {
    const container = activeAction ? actionDialogRef.current : searchOpen ? searchDialogRef.current : menuOpen ? menuDialogRef.current : null;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const initial = container.querySelector<HTMLElement>("[autofocus]") ?? first;
    const timer = window.setTimeout(() => initial.focus(), 0);
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", trapFocus);
    return () => {
      window.clearTimeout(timer);
      container.removeEventListener("keydown", trapFocus);
    };
  }, [menuOpen, searchOpen, activeAction, actionSent]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = menuOpen || searchOpen || activeAction ? "hidden" : previous;
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen, searchOpen, activeAction]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchItems.slice(0, 5);
    return searchItems.filter((item) => `${item.title} ${item.area} ${item.text}`.toLowerCase().includes(query));
  }, [searchQuery]);

  const activeSlide = carouselSlides[carouselIndex];
  const activeCopy = activeAction ? actionCopy[activeAction] : null;
  const routeHref = (destination: InnerPageKind) => `${base}${destination}/`;
  const homeHref = (hash = "") => `${base}${hash}`;
  const assetUrl = (filename: string) => `${base}images/${filename}`;

  function resolveHref(href: string) {
    if (href === "#courses") return routeHref("courses");
    if (["#academics", "#programs", "#guidance"].includes(href)) {
      return `${routeHref("academics")}${href === "#academics" ? "" : href}`;
    }
    if (["#admissions", "#requirements", "#faq", "#contact"].includes(href)) {
      return `${routeHref("admissions")}${href === "#admissions" ? "" : href}`;
    }
    return homeHref(href);
  }

  function closeLayers() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function openAction(action: ActionType) {
    lastActionTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeLayers();
    setActionSent(false);
    setActiveAction(action);
  }

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }

  function closeSearch() {
    setSearchOpen(false);
    window.setTimeout(() => searchButtonRef.current?.focus(), 0);
  }

  function closeAction() {
    setActiveAction(null);
    const fallback = menuButtonRef.current;
    window.setTimeout(() => {
      const target = lastActionTriggerRef.current;
      if (target && document.contains(target)) target.focus();
      else fallback?.focus();
    }, 0);
  }

  function handleActionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionSent(true);
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactSent(true);
  }

  function changeSlide(direction: number) {
    setCarouselIndex((current) => (current + direction + carouselSlides.length) % carouselSlides.length);
  }

  return (
    <>
      <a className="skip-link" href="#top">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href={homeHref()} aria-label="Lake Forest Academy home">
          <img className="brand-logo" src={assetUrl("lake-forest-academy-logo.png")} alt="Lake Forest Academy" />
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href={homeHref("#about")}>Our School</a>
          <a href={routeHref("academics")} aria-current={page === "academics" || page === "courses" ? "page" : undefined}>Academics</a>
          <a href={homeHref("#student-life")}>Student Life</a>
          <a href={routeHref("admissions")} aria-current={page === "admissions" ? "page" : undefined}>Admissions</a>
          <button className="nav-cta" type="button" onClick={() => openAction("enquire")}>Enquire</button>
        </nav>

        <div className="header-tools">
          <button ref={searchButtonRef} className="header-tool" type="button" aria-label="Search this website" onClick={() => setSearchOpen(true)}>
            <span className="search-symbol" aria-hidden="true" />
            <span className="tool-label">Search</span>
          </button>
          <button ref={menuButtonRef} className="header-tool menu-button" type="button" aria-label="Open full website menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <span className="menu-lines" aria-hidden="true"><i /><i /><i /></span>
            <span className="tool-label">Menu</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div ref={menuDialogRef} className="menu-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-title">
          <div className="overlay-top">
            <img src={assetUrl("lake-forest-academy-logo-light.png")} alt="Lake Forest Academy" />
            <button className="close-button light" type="button" autoFocus onClick={closeMenu} aria-label="Close website menu">Close <span aria-hidden="true">x</span></button>
          </div>
          <div className="menu-heading">
            <p className="eyebrow light">Explore Lake Forest Academy</p>
            <h2 id="menu-title">Find your next step.</h2>
          </div>
          <div className="menu-grid">
            {menuGroups.map((group) => (
              <section className="menu-group" key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <div>
                  {group.links.map(([label, href]) => <a href={resolveHref(href)} key={label} onClick={() => setMenuOpen(false)}>{label}<span aria-hidden="true">+</span></a>)}
                </div>
              </section>
            ))}
          </div>
          <div className="menu-actions" aria-label="Admissions actions">
            <button type="button" onClick={() => openAction("enquire")}><small>Have a question?</small>Enquire</button>
            <button type="button" onClick={() => openAction("tour")}><small>Visit North York</small>Book a Tour</button>
            <button type="button" onClick={() => openAction("apply")}><small>Ready for the next step?</small>Apply Online</button>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="presentation">
          <div ref={searchDialogRef} className="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
            <div className="search-head">
              <div><p className="eyebrow">Site search</p><h2 id="search-title">What can we help you find?</h2></div>
              <button className="close-button" type="button" onClick={closeSearch} aria-label="Close search">Close <span aria-hidden="true">x</span></button>
            </div>
            <label className="search-field"><span>Search Lake Forest Academy</span><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Try OSSD, student life or admissions" /></label>
            <div className="search-results" aria-live="polite">
              {searchResults.length ? searchResults.map((item) => (
                <a href={resolveHref(item.href)} key={item.title} onClick={closeSearch}>
                  <small>{item.area}</small><strong>{item.title}</strong><span>{item.text}</span>
                </a>
              )) : <p className="empty-state">No matching pages yet. Try a broader search.</p>}
            </div>
          </div>
        </div>
      )}

      <aside className="sticky-actions" aria-label="Quick admissions actions">
        <button type="button" onClick={() => openAction("enquire")}>Enquire</button>
        <button type="button" onClick={() => openAction("tour")}>Book a Tour</button>
        <button type="button" onClick={() => openAction("apply")}>Apply</button>
      </aside>

      <main>
      {page === "home" ? (
      <>
      <section className="hero" id="top">
        <img src={assetUrl("campus-arrival-hero.jpg")} alt="Students arriving at the Lake Forest Academy campus in North York" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">North York, Ontario &middot; Grades 9-12 &middot; OSSD</p>
          <h1><span>Find your footing.</span><span>Discover your strengths.</span><strong>Choose what comes next.</strong></h1>
          <p className="hero-lead">High school brings big decisions. At Lake Forest Academy, students receive the academic challenge, steady guidance and room to grow they need to make those decisions well.</p>
          <div className="hero-actions">
            <a className="button primary" href={routeHref("academics")}>Explore academics <span aria-hidden="true">-&gt;</span></a>
            <button className="button ghost" type="button" onClick={() => openAction("tour")}>Plan a visit</button>
          </div>
        </div>
      </section>

      <section className="quick-links" aria-label="Family quick links">
        <a href="#history"><small>Discover our foundations</small>Our Story</a>
        <a href={`${routeHref("admissions")}#requirements`}><small>Plan your pathway</small>Entry Requirements</a>
        <a href={`${routeHref("admissions")}#faq`}><small>Common questions</small>Admissions FAQ</a>
        <button type="button" onClick={() => openAction("tour")}><small>See the community</small>Visit LFA</button>
      </section>

      <section className="intro section" id="about">
        <div>
          <p className="eyebrow">Welcome to Lake Forest Academy</p>
          <h2>A school that knows its students.<br /><span>A community that keeps them moving.</span></h2>
        </div>
        <div className="intro-copy">
          <p>Lake Forest Academy is a Grade 9-12 day school in North York. Our academic program is organized around Ontario curriculum expectations and individual OSSD planning.</p>
          <p>Students do their best work when someone understands where they are starting and what they are working toward. Teachers, advisors and families stay in conversation so that support can be practical and timely.</p>
          <a className="text-link" href="#history">Read our story <span aria-hidden="true">-&gt;</span></a>
        </div>
      </section>

      <section className="stats" id="facts" aria-label="School facts">
        <div><strong>9-12</strong><span>grades served</span></div>
        <div><strong>OSSD</strong><span>individual pathway planning</span></div>
        <div><strong>North York</strong><span>Ontario campus</span></div>
        <div><strong>Day school</strong><span>local and international students</span></div>
      </section>

      <section className="academics section" id="academics">
        <div className="section-heading centered">
          <p className="eyebrow">The Ontario pathway</p>
          <h2>A clear plan, reviewed as students grow.</h2>
          <p>Required courses, electives, literacy learning, community involvement and future prerequisites are considered together rather than as separate checklists.</p>
        </div>
        <div className="program-grid" id="programs">
          {programs.slice(0, 3).map((program) => (
            <ProgramCard key={program.code} program={program} routeHref={routeHref} />
          ))}
        </div>
        <div className="feature-row">
          <div className="feature-image"><img src={assetUrl("science-lab.jpg")} alt="Students conducting a science experiment with their teacher" /></div>
          <div className="feature-copy">
            <p className="eyebrow light">Learning that connects</p>
            <h2>Learn the idea. Test it. Explain it.</h2>
            <p>Class time combines direct instruction with questions, discussion and practical work. Students are expected to understand their process, not simply submit an answer.</p>
            <ul><li>Small-group instruction and time for questions</li><li>Labs, projects and presentations across subject areas</li><li>Course choices reviewed against current goals and prerequisites</li></ul>
            <a className="text-link light-link" href={routeHref("academics")}>Explore the full academic pathway <span aria-hidden="true">-&gt;</span></a>
          </div>
        </div>
      </section>

      <section className="support section" id="guidance">
        <div className="support-copy">
          <p className="eyebrow">Guidance throughout high school</p>
          <h2>Course choices make more sense in context.</h2>
          <p>Advisors help students connect today&apos;s work with graduation requirements and the options they may want after high school. The plan is reviewed as interests and goals change.</p>
          <div className="support-list">
            <div><strong>01</strong><span><b>Course planning</b>Review completed credits, remaining requirements and a sensible sequence for future courses.</span></div>
            <div><strong>02</strong><span><b>Post-secondary research</b>Compare programs, prerequisites and timelines before application decisions become urgent.</span></div>
            <div><strong>03</strong><span><b>Academic English</b>Practise the reading, writing, listening and discussion skills used across the curriculum.</span></div>
          </div>
        </div>
        <div className="support-image"><img src={assetUrl("student-guidance.jpg")} alt="A guidance counsellor helping a student plan their academic pathway" /></div>
      </section>

      <section className="history section" id="history">
        <div className="history-intro">
          <p className="eyebrow light">Our story</p>
          <h2>Where our story <span>takes root.</span></h2>
          <p>Lake Forest Academy began with a practical question: what changes when teachers have the time to know their students well? The answer became a school built around thoughtful course planning, clear expectations and everyday relationships.</p>
          <div className="name-meaning" aria-label="The meaning behind the school name">
            <article><span>Lake</span><strong>Time to reflect</strong><p>Students need space to ask questions, consider different perspectives and make choices they understand.</p></article>
            <article><span>Forest</span><strong>Strong roots, steady growth</strong><p>Progress is easier to sustain when students feel supported, challenged and connected to a community.</p></article>
          </div>
        </div>
        <div className="history-list" aria-label="School history milestones">
          {historyMilestones.map((milestone, index) => (
            <article key={milestone.year}>
              <strong>{milestone.year}</strong>
              <div><small>Milestone {String(index + 1).padStart(2, "0")}</small><h3>{milestone.title}</h3><p>{milestone.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="student-life section" id="student-life">
        <div className="student-life-intro">
          <div><p className="eyebrow light">Life at Lake Forest</p><h2>School life is made in the everyday moments.</h2></div>
          <div><p>Clubs, athletics, leadership and service give students a reason to work with people outside their usual classes, try something unfamiliar and contribute to the school around them.</p><div className="club-tags"><span>Robotics</span><span>Basketball</span><span>Model UN</span><span>Visual Arts</span><span>Student Council</span><span>Volunteering</span></div></div>
        </div>
        <div className="life-options">
          <article><span>01</span><h3>Campus belonging</h3><p>Advisor check-ins, peer ambassadors and student-led activities create a welcoming daily rhythm.</p></article>
          <article><span>02</span><h3>International transition</h3><p>Orientation, ESL planning and practical guidance help students settle into learning in Ontario.</p></article>
          <article><span>03</span><h3>Family communication</h3><p>Advisors share progress and next steps with families at appropriate points in the year. As a day school, LFA does not provide housing or transportation.</p></article>
        </div>

        <div className="campus-moments" aria-label="Everyday moments at Lake Forest Academy">
          <figure className="campus-moment campus-moment-wide">
            <img src={assetUrl("library-study.jpg")} alt="Students working together around a table in the school library" />
            <figcaption><small>Between classes</small><strong>Study becomes a conversation.</strong></figcaption>
          </figure>
          <figure className="campus-moment">
            <img src={assetUrl("arts-studio.jpg")} alt="Students painting, sketching and working with clay in the art studio" />
            <figcaption><small>Creative practice</small><strong>Ideas take shape by hand.</strong></figcaption>
          </figure>
          <figure className="campus-moment">
            <img src={assetUrl("community-service.jpg")} alt="Students preparing food and school supplies for a community service activity" />
            <figcaption><small>Community service</small><strong>Contribution starts close to home.</strong></figcaption>
          </figure>
        </div>

        <div className="life-carousel" id="life-gallery" role="region" aria-roledescription="carousel" aria-label="Student life photo stories">
          <figure>
            <img src={assetUrl(activeSlide.src)} alt={activeSlide.alt} />
            <figcaption><small>Photo story {carouselIndex + 1} of {carouselSlides.length}</small><strong>{activeSlide.title}</strong><span>{activeSlide.text}</span></figcaption>
          </figure>
          <div className="carousel-controls">
            <button type="button" onClick={() => changeSlide(-1)} aria-label="Previous photo">Previous</button>
            <div className="carousel-dots" aria-label="Choose a photo">
              {carouselSlides.map((slide, index) => <button type="button" key={slide.title} className={index === carouselIndex ? "active" : ""} aria-label={`Show photo ${index + 1}: ${slide.title}`} aria-current={index === carouselIndex ? "true" : undefined} onClick={() => setCarouselIndex(index)} />)}
            </div>
            <button type="button" onClick={() => setCarouselPlaying((playing) => !playing)}>{carouselPlaying ? "Pause" : "Play"}</button>
            <button type="button" onClick={() => changeSlide(1)} aria-label="Next photo">Next</button>
          </div>
        </div>
      </section>

      <section className="news section" id="news">
        <div className="section-heading news-heading"><div><p className="eyebrow">News and events</p><h2>A few dates worth saving.</h2></div><p>Meet the people, conversations and activities shaping the coming school term.</p></div>
        <div className="news-grid">
          {newsItems.map((item) => <article key={item.title}><div><time>{item.date}</time><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.text}</p><span className="news-status">Upcoming</span></article>)}
        </div>
      </section>

      <section className="admissions section" id="admissions">
        <div className="section-heading"><p className="eyebrow">Admissions</p><h2>Start with a conversation, not a stack of forms.</h2><p>Families entering Grades 9-12 can begin by telling us about the student&apos;s current studies, goals and preferred entry term. We will explain what information is useful next.</p></div>
        <div className="steps">
          {admissionsSteps.map(([number, title, text]) => <article key={number}><strong>{number}</strong><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        <a className="text-link admissions-link" href={routeHref("admissions")}>View the complete admissions journey <span aria-hidden="true">-&gt;</span></a>
      </section>

      <section className="faq section" id="faq">
        <div className="faq-heading"><p className="eyebrow">Frequently asked questions</p><h2>Clear answers for families.</h2><p>Entry dates, course availability and individual requirements are confirmed after an academic review.</p></div>
        <div className="faq-list">
          {faqs.slice(0, 3).map(([question, answer], index) => (
            <article className={openFaq === index ? "open" : ""} key={question}>
              <h3><button type="button" aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><i aria-hidden="true">{openFaq === index ? "-" : "+"}</i></button></h3>
              <div id={`faq-answer-${index}`} hidden={openFaq !== index}><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="action-panel" aria-label="Admissions next steps">
        <div><p className="eyebrow light">Your next step</p><h2>Explore Lake Forest Academy your way.</h2></div>
        <div className="action-cards">
          <button type="button" onClick={() => openAction("enquire")}><small>Ask a question</small><strong>Enquire</strong><span aria-hidden="true">01</span></button>
          <button type="button" onClick={() => openAction("tour")}><small>Meet our community</small><strong>Book a Tour</strong><span aria-hidden="true">02</span></button>
          <button type="button" onClick={() => openAction("apply")}><small>Begin your journey</small><strong>Apply Online</strong><span aria-hidden="true">03</span></button>
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="contact-copy">
          <p className="eyebrow light">Talk with admissions</p><h2>Every family arrives with different questions.</h2><p>Tell us the student&apos;s current grade and what matters most to your family. We can help you identify the academic, admissions and support questions to explore next.</p>
          <div className="contact-details"><span><small>Admissions</small>+1 416-555-0162</span><span><small>Email</small>admissions@lakeforestacademy.example</span><span><small>Location</small>North York, Ontario</span></div>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="field-row"><label>Student name<input name="student" required placeholder="Full name" /></label><label>Current grade<select required name="grade" defaultValue=""><option value="" disabled>Select grade</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label></div>
          <div className="field-row"><label>Parent / guardian email<input name="email" type="email" required placeholder="name@example.com" /></label><label>Entry term<select required name="term" defaultValue=""><option value="" disabled>Select term</option><option>September 2026</option><option>February 2027</option><option>September 2027</option></select></label></div>
          <label>How can we help?<textarea name="message" rows={4} placeholder="Tell us about your questions or goals." /></label>
          <button className="button form-button" type="submit">Submit inquiry <span aria-hidden="true">-&gt;</span></button>
          {contactSent && <p className="form-message" role="status">Test form only - no information has been sent.</p>}
          <small className="form-disclaimer">Demonstration form - no information is sent or stored.</small>
        </form>
      </section>
      </>
      ) : page === "academics" ? (
        <AcademicsPage assetUrl={assetUrl} routeHref={routeHref} homeHref={homeHref} openAction={openAction} />
      ) : page === "courses" ? (
        <CourseCataloguePage assetUrl={assetUrl} routeHref={routeHref} homeHref={homeHref} openAction={openAction} />
      ) : (
        <AdmissionsPage assetUrl={assetUrl} routeHref={routeHref} homeHref={homeHref} openAction={openAction} openFaq={openFaq} setOpenFaq={setOpenFaq} />
      )}
      </main>

      <footer>
        <div className="footer-brand"><img className="footer-logo" src={assetUrl("lake-forest-academy-logo-light.png")} alt="Lake Forest Academy" /><p>Rooted in purpose. Open to possibility.</p></div>
        <div className="footer-columns">
          {menuGroups.map((group) => <div key={group.title}><strong>{group.title}</strong>{group.links.slice(0, 3).map(([label, href]) => <a href={resolveHref(href)} key={label}>{label}</a>)}</div>)}
        </div>
        <div className="footer-bottom"><span>&copy; 2026 Lake Forest Academy - demonstration website</span><span>Forms on this site do not send or store information.</span></div>
      </footer>

      {activeAction && activeCopy && (
        <div className="modal-backdrop" role="presentation">
          <section ref={actionDialogRef} className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
            <button className="close-button" type="button" onClick={closeAction} aria-label="Close admissions form">Close <span aria-hidden="true">x</span></button>
            <p className="eyebrow">{activeCopy.eyebrow}</p><h2 id="action-title">{activeCopy.title}</h2><p>{activeCopy.text}</p>
            {actionSent ? (
              <div className="modal-success" role="status"><strong>Thank you.</strong><p>No information was sent or stored. This form is for demonstration only.</p><button className="button primary" type="button" onClick={closeAction}>Close</button></div>
            ) : (
              <form onSubmit={handleActionSubmit}>
                <div className="field-row"><label>Student name<input autoFocus required name="student" placeholder="Full name" /></label><label>Current grade<select required name="grade" defaultValue=""><option value="" disabled>Select grade</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label></div>
                <label>Parent / guardian email<input type="email" required name="email" placeholder="name@example.com" /></label>
                {activeAction === "tour" && <label>Preferred visit date<input required type="date" name="visit-date" /></label>}
                {activeAction === "apply" && <label>Intended entry term<select required name="term" defaultValue=""><option value="" disabled>Select term</option><option>September 2026</option><option>February 2027</option><option>September 2027</option></select></label>}
                <label>Message<textarea name="message" rows={3} placeholder="Share any questions or useful context." /></label>
                <button className="button primary" type="submit">{activeCopy.button}</button>
                <small className="form-disclaimer">Demo only - no information will be transmitted.</small>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return <SchoolSite />;
}
