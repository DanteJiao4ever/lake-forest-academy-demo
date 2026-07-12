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
  "Infor…9162 tokens truncated…aceholder="Try OSSD, student life or admissions" /></label>
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
