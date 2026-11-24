import { useEffect, useMemo, useRef, useState } from "react";

import { ReadingSample } from "./learning/ReadingSample";
import { assessmentForCourse, courseGroups, courseTypes, filterCourses, ontario, policyYear, programs } from "./data/course-guide";
import { emailHref, schoolContact } from "./data/school";

type ActionType = "enquire" | "tour" | "apply";
type PageKind = "home" | "academics" | "courses" | "admissions";
type InnerPageKind = Exclude<PageKind, "home">;

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
    links: [["OSSD Pathway", "#academics"], ["Course Catalogue", "#courses"], ["Learning Support", "#guidance"], ["Student / Faculty Portal", "#learning"], ["Try a sample lesson", "#reading-sample"]],
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
  ["How should I send admissions documents?", "Begin by emailing the admissions team. We will confirm which records are needed and provide appropriate instructions for sharing them securely. Please do not email sensitive documents unless requested."],
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
  { title: "Student / Faculty Portal", area: "Online learning", text: "Sign in to courses, assignments and feedback.", href: "#learning" },
  { title: "60-second reading sample", area: "Online learning", text: "Try a short interactive lesson.", href: "#reading-sample" },
  { title: "Admissions FAQ", area: "Admissions", text: "Answers about grades, language support and campus visits.", href: "#faq" },
  { title: "Contact Admissions", area: "Admissions", text: "Ask about entry, course planning or student support.", href: "#contact" },
];

const actionCopy: Record<ActionType, { eyebrow: string; title: string; text: string; button: string; subject: string }> = {
  enquire: { eyebrow: "Admissions enquiry", title: "Ask us what you need to know", text: "Tell us the student's current grade and what your family is hoping to understand about courses, support or admissions.", button: "Email an enquiry", subject: "Admissions enquiry" },
  tour: { eyebrow: "Campus visit", title: "Come and see a school day up close", text: "Suggest a preferred date and let us know who plans to attend. A visit time will be confirmed before you arrive.", button: "Request a visit", subject: "Campus visit request" },
  apply: { eyebrow: "Application", title: "Begin with the essentials", text: "Share the student's current grade and intended entry term to begin an initial admissions conversation.", button: "Begin by email", subject: "Application enquiry" },
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
      <span className="program-card-top"><span className="program-code">{program.code}</span><span className="program-card-arrow" aria-hidden="true">{"\u2197"}</span></span>
      <h3>{program.title}</h3>
      <p>{program.text}</p>
      <span className="program-card-cta">View Course Details <span aria-hidden="true">-&gt;</span></span>
    </a>
  );
}

function DiplomaRoadmap() {
  const [entryYear, setEntryYear] = useState("2025");
  const modernCredits = Number(entryYear) >= 2024;
  return (
    <section className="diploma-roadmap section" id="diploma-roadmap" aria-labelledby="roadmap-heading">
      <div className="roadmap-intro">
        <p className="eyebrow">Ontario Secondary School Diploma</p>
        <h2 id="roadmap-heading">Your graduation roadmap</h2>
        <label>When did you start Grade 9?
          <select value={entryYear} onChange={(event) => setEntryYear(event.target.value)}>
            <option value="2025">2025–26 or later</option>
            <option value="2024">2024–25</option>
            <option value="2020">2020–21 through 2023–24</option>
            <option value="2019">Before 2020–21</option>
          </select>
        </label>
        <p>Transferring schools or returning to study? Guidance can review your transcript, equivalent credits and individual requirements.</p>
        <a className="text-link" href={ontario.diploma}>Ontario diploma requirements ↗</a>
      </div>
      <dl className="roadmap-list" aria-live="polite" aria-atomic="true">
        <div><dt>30 credits</dt><dd>{modernCredits
          ? "17 compulsory and 13 optional credits. Include a Grade 9 or 10 technological education credit."
          : "18 compulsory and 12 optional credits."}</dd></div>
        <div><dt>Literacy</dt><dd>Complete the Ontario Secondary School Literacy Test (OSSLT) or, if eligible, the Ontario Secondary School Literacy Course (OLC4O).</dd></div>
        <div><dt>Community involvement</dt><dd>Plan for 40 hours of eligible activities. Confirm your activity with guidance before you begin.</dd></div>
        {Number(entryYear) >= 2020 && <div><dt>Online learning</dt><dd>Earn two of your 30 credits online, unless an opt-out or exemption applies.</dd></div>}
        {entryYear === "2025" && <div><dt>Financial literacy</dt><dd>Starting in 2026–27, achieve at least 70% on the financial literacy modules in Grade 10 Career Studies.</dd></div>}
      </dl>
    </section>
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
            <a className="button primary" href="#diploma-roadmap">See how planning works <span aria-hidden="true">-&gt;</span></a>
            <button className="button ghost" type="button" onClick={() => openAction("enquire")}>Ask about courses</button>
          </div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("academics-seminar.jpg")} alt="Students and a teacher discussing a classroom design project" /></div>
      </section>

      <nav className="page-subnav" aria-label="Academics page">
        <a href="#diploma-roadmap">Graduation roadmap</a><a href="#grade-journey">Grades 9-12</a><a href="#programs">Course Areas</a><a href="#guidance">Guidance</a>
      </nav>

      <section className="page-intro section" id="pathway">
        <div><p className="eyebrow">The Ontario pathway</p><h2>Start with the student, then build the plan.</h2></div>
        <div className="page-intro-copy">
          <p>Each plan begins with previous credits, current strengths and the possibilities a student wants to explore. Required courses, electives, literacy learning, community involvement and future prerequisites are reviewed together.</p>
          <p>Graduation requirements can depend on when and where a student began secondary school. Guidance confirms each student&apos;s requirements, placement and available courses individually.</p>
        </div>
      </section>

      <DiplomaRoadmap />

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

function CourseCataloguePage({ assetUrl, routeHref, homeHref, openAction }: PageViewProps) {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [courseType, setCourseType] = useState("");
  const [linkedId, setLinkedId] = useState(() => typeof window === "undefined" ? "" : window.location.hash.slice(1));

  useEffect(() => {
    function followCatalogueLink() {
      const id = window.location.hash.slice(1);
      setLinkedId(id);
      const isListing = courseGroups.some((group) => group.slug === id || group.courses.some((course) => course.code === id));
      if (isListing && !document.getElementById(id)) resetFilters();
    }
    window.addEventListener("hashchange", followCatalogueLink);
    return () => window.removeEventListener("hashchange", followCatalogueLink);
  }, []);

  useEffect(() => {
    if (linkedId) document.getElementById(linkedId)?.scrollIntoView({ behavior: "instant" });
  }, [linkedId]);

  const filtersActive = Boolean(query.trim() || grade || subject || courseType);
  const matchingGroups = filterCourses({ query, grade, subject, courseType });
  const resultCount = matchingGroups.reduce((total, group) => total + group.courses.length, 0);

  function resetFilters() {
    setQuery("");
    setGrade("");
    setSubject("");
    setCourseType("");
  }

  return (
    <>
      <section className="inner-hero course-catalogue-hero" id="top">
        <div className="inner-hero-copy">
          <p className="eyebrow light">2026-27 Course Guide</p>
          <h1>The course <strong>catalogue.</strong></h1>
          <p>Explore 42 courses across six subject areas. Check the prerequisites for your next course and find the credit and assessment details you need to plan your year.</p>
          <div className="hero-actions">
            <a className="button primary" href="#course-finder">Browse course listings <span aria-hidden="true">-&gt;</span></a>
            <a className="button ghost" href={`${routeHref("admissions")}#contact`}>Contact admissions</a>
          </div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("science-lab.jpg")} alt="Students working through a science investigation in the laboratory" /></div>
      </section>


      <section className={`course-catalogue section${filtersActive ? " is-filtered" : ""}`} aria-label="Course catalogue by subject">
        <div className="course-finder" id="course-finder">
          <h2>Find a course</h2>
          <div className="course-finder-fields">
            <label>Course name or code
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Chemistry or SCH4U" />
            </label>
            <label>Grade
              <select value={grade} onChange={(event) => setGrade(event.target.value)}>
                <option value="">All grades</option>
                {[9, 10, 11, 12].map((level) => <option key={level} value={level}>Grade {level}</option>)}
                <option value="ESL">ESL levels 1–5</option>
              </select>
            </label>
            <label>Course type
              <select value={courseType} onChange={(event) => setCourseType(event.target.value)}>
                <option value="">All types</option>
                {courseTypes.map(([code, title]) => <option key={code} value={code}>{code} · {title}</option>)}
              </select>
            </label>
            <label>Subject
              <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option value="">All subjects</option>
                {courseGroups.map((group) => <option value={group.slug} key={group.slug}>{group.title}</option>)}
              </select>
            </label>
          </div>
          <div className="course-finder-summary">
            <p role="status">{resultCount} {resultCount === 1 ? "course" : "courses"} found</p>
            <button type="button" className="text-link" onClick={resetFilters} disabled={!filtersActive}>Clear filters</button>
          </div>
          {!resultCount && <p className="course-finder-empty">Try a different course code or clear your filters.</p>}
        </div>
        {matchingGroups.map((group) => (
          <section className="course-area" id={group.slug} key={group.slug}>
            <header className="course-area-heading">
              <div className="course-area-index"><strong>{group.code}</strong></div>
              <div><p className="eyebrow">{group.eyebrow}</p><h2>{group.title}</h2><p>{group.introduction}</p></div>
            </header>

            {group.slug === "science" && !filtersActive && (
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
              {group.courses.map((course) => {
                const policy = assessmentForCourse(course, group.slug);
                return (
                  <article className="course-row" key={course.code} id={course.code} data-linked={course.code === linkedId || undefined}>
                    <div className="course-identity">
                      <a href={`#${course.code}`} aria-label={`Link to ${course.code}`}>{course.code}</a>
                      <span>{course.grade}</span>
                    </div>
                    <div className="course-description">
                      <p className="course-meta">{course.pathway} &middot; {course.credit}</p>
                      <h3>{course.title}</h3><p>{course.summary}</p>
                      <details className="course-policy">
                        <summary>Ontario assessment · {policyYear}</summary>
                        <p>{policy.weights}</p>
                        {policy.final && <p>{policy.final}</p>}
                        {course.code === "ICS4U" && <p>Request the course outline to confirm the exam and project weights for your section.</p>}
                        <a href={ontario.assessment}>Provincial assessment policy ↗</a>
                      </details>
                    </div>
                    <div className="course-prerequisite">
                      <span>Prerequisite</span><p>{course.prerequisite}</p>
                      <a className="button primary course-entry" href={`${homeHref()}learning/#/course/${course.code.toLowerCase()}`}>Student login · Enter {course.code}</a>
                      <a className="text-link" href={emailHref(`Course outline request: ${course.code} — ${course.title} (${policyYear})`)}>Request {course.code} outline</a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </section>

      <section className="course-guide-intro section">
        <div className="course-guide-copy"><p className="eyebrow">Planning for graduation</p><h2>How do these credits fit?</h2><p>Plan for at least 110 scheduled hours of instruction for a full credit, or 55 hours for a half credit such as Civics and Citizenship. Guidance can confirm availability and review your choices against your diploma requirements.</p><a className="text-link" href={`${routeHref("academics")}#diploma-roadmap`}>Check your graduation roadmap <span aria-hidden="true">→</span></a></div>
        <div className="course-guide-facts" aria-label="OSSD planning facts">
          <article><strong>30</strong><span>Credits In A Complete OSSD Program</span></article>
          <article><strong>2</strong><span>Compulsory Science Credits</span></article>
          <article><strong>1</strong><span>Grade 9 Or 10 Technology Credit For 2024+ Cohorts</span></article>
        </div>
      </section>

      <section className="course-planning section">
        <div><p className="eyebrow light">Plan With The Full Picture</p><h2>A Course Choice Should Make Sense Today And Tomorrow.</h2><p>Graduation requirements vary by the year a student entered Grade 9. Guidance reviews previous credits, compulsory requirements, language needs and post-secondary prerequisites before confirming a plan.</p></div>
        <div className="course-planning-actions">
          <button className="button primary" type="button" onClick={() => openAction("enquire")}>Discuss A Course Plan</button>
          <a className="button ghost" href={`${routeHref("academics")}#diploma-roadmap`}>Review the OSSD pathway</a>
          <a className="text-link light-link" href={`${routeHref("admissions")}#contact`}>Contact Admissions <span aria-hidden="true">-&gt;</span></a>
        </div>
        <div className="curriculum-references">
          <span>Ontario references</span>
          <a href={ontario.curriculum}>Curriculum ↗</a>
          <a href={ontario.courseCredits}>Courses and credits ↗</a>
          <a href={ontario.diploma}>Diploma requirements ↗</a>
          <a href={ontario.assessment}>Assessment policy ↗</a>
        </div>
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
          <div className="hero-actions"><a className="button primary" href="#contact">Contact admissions</a><button className="button ghost" type="button" onClick={() => openAction("tour")}>Plan a visit</button></div>
        </div>
        <div className="inner-hero-media"><img src={assetUrl("admissions-welcome.jpg")} alt="A peer ambassador welcoming a prospective student on campus" /></div>
      </section>

      <nav className="page-subnav" aria-label="Admissions page">
        <a href="#pathways">Applicant Pathways</a><a href="#steps">How To Apply</a><a href="#requirements">What To Prepare</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
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
          <aside><b>Sending documents</b>Contact admissions first. We will confirm what is needed and provide appropriate instructions for sharing records securely.</aside>
        </div>
      </section>

      <section className="faq section" id="faq">
        <div className="faq-heading"><p className="eyebrow">Admissions questions</p><h2>Questions families often ask first.</h2><p>Entry dates, course availability and individual requirements are confirmed directly with each family after an academic review.</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => <article className={openFaq === index ? "open" : ""} key={question}><h3><button type="button" aria-expanded={openFaq === index} aria-controls={`admissions-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><i aria-hidden="true">{openFaq === index ? "-" : "+"}</i></button></h3><div id={`admissions-faq-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></article>)}
        </div>
      </section>

      <section className="page-next section admissions-next" id="contact" aria-labelledby="admissions-contact-heading">
        <div>
          <p className="eyebrow light">Admissions office</p>
          <h2 id="admissions-contact-heading">Contact admissions</h2>
          <p>Email us with the student&apos;s current grade, intended entry term and any courses you want to discuss. Campus visits are available by appointment.</p>
        </div>
        <div className="page-next-actions">
          <a className="button primary admissions-email" href={emailHref("Admissions enquiry")}>{schoolContact.admissionsEmail}</a>
          <button className="button ghost" type="button" onClick={() => openAction("tour")}>Plan a visit</button>
          <a className="text-link light-link" href={routeHref("academics")}>Review academics <span aria-hidden="true">-&gt;</span></a>
        </div>
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const actionDialogRef = useRef<HTMLElement>(null);
  const lastActionTriggerRef = useRef<HTMLElement | null>(null);
  const [{ page, base }] = useState(() => getRouteContext(initialPage));

  useEffect(() => {
    // On a direct link the browser can look for the fragment before React renders it.
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView({ behavior: "instant" });
  }, []);

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
  }, [menuOpen, searchOpen, activeAction]);

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
    if (href === "#learning") return `${base}learning/#/signin/student`;
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
          <a href={routeHref("academics")} aria-current={page === "academics" ? "page" : undefined}>Academics</a>
          <a href={routeHref("courses")} aria-current={page === "courses" ? "page" : undefined}>Courses</a>
          <a href={homeHref("#student-life")}>Student Life</a>
          <a href={routeHref("admissions")} aria-current={page === "admissions" ? "page" : undefined}>Admissions</a>
          <button className="nav-cta" type="button" onClick={() => openAction("enquire")}>Enquire</button>
        </nav>

        <div className="header-tools">
          <a className="header-learning" href={resolveHref("#learning")}><span>Student / Faculty Portal</span><span aria-hidden="true">↗</span></a>
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
                <a href={resolveHref(item.href)} key={item.title} onClick={() => setSearchOpen(false)}>
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
            <a className="button primary" href={routeHref("courses")}>Browse the course catalogue <span aria-hidden="true">-&gt;</span></a>
            <a className="button ghost" href="#reading-sample">Try a 60-second lesson</a>
          </div>
        </div>
      </section>

      <ReadingSample />

      <section className="family-paths section" aria-label="Explore Lake Forest Academy">
        <a href={`${routeHref("courses")}#course-finder`}>
          <img src={assetUrl("science-lab.jpg")} alt="" loading="lazy" />
          <div><h2>Find a course</h2><p>Search by grade, subject or course code.</p><span aria-hidden="true">→</span></div>
        </a>
        <a href={`${routeHref("admissions")}#steps`}>
          <img src={assetUrl("admissions-welcome.jpg")} alt="" loading="lazy" />
          <div><h2>Plan your application</h2><p>See the steps, what to prepare and how to arrange a visit.</p><span aria-hidden="true">→</span></div>
        </a>
        <a href={resolveHref("#learning")}>
          <img src={assetUrl("library-study.jpg")} alt="" loading="lazy" />
          <div><h2>Open the portal</h2><p>Sign in to courses and feedback.</p><span aria-hidden="true">→</span></div>
        </a>
      </section>

      <section className="online-learning section" id="online-learning" aria-labelledby="online-learning-heading">
        <div>
          <h2 id="online-learning-heading">LFA Online Learning</h2>
          <p>Open your Lake Forest Academy courses, assignments and announcements.</p>
        </div>
        <div className="online-learning-actions">
          <a className="button primary" href={`${base}learning/#/signin/student`}>Student sign-in</a>
          <a className="button ghost" href={`${base}learning/#/signin/faculty`}>Teacher sign-in</a>
        </div>
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
          <div className="contact-details">
            <a href={`mailto:${schoolContact.admissionsEmail}`}><small>Email</small>{schoolContact.admissionsEmail}</a>
            <a href={schoolContact.mapHref} target="_blank" rel="noreferrer"><small>Campus</small>{schoolContact.location}</a>
            <a href={emailHref("Campus visit request")}><small>Visits</small>Available by appointment</a>
          </div>
        </div>
        <div className="contact-card">
          <p className="eyebrow">Admissions office</p>
          <h3>Start with a quick conversation.</h3>
          <p>Email is the best first step for questions about entry, transcripts, course planning or a campus visit.</p>
          <div className="contact-card-list">
            <a href={emailHref("Admissions enquiry")}><small>Write to us</small><strong>{schoolContact.admissionsEmail}</strong><span>Include the student&apos;s current grade and intended entry term.</span></a>
            <a href={schoolContact.mapHref} target="_blank" rel="noreferrer"><small>Campus area</small><strong>{schoolContact.location}</strong><span>Campus visits are available by appointment.</span></a>
            <a href={emailHref("Admissions document guidance")}><small>Admissions records</small><strong>Ask before sending documents</strong><span>We will confirm what is needed and explain the appropriate way to share it.</span></a>
          </div>
        </div>
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
        <div className="footer-bottom"><span>&copy; 2026 Lake Forest Academy</span><span><a href={`mailto:${schoolContact.admissionsEmail}`}>{schoolContact.admissionsEmail}</a> &middot; {schoolContact.location}</span></div>
      </footer>

      {activeAction && activeCopy && (
        <div className="modal-backdrop" role="presentation">
          <section ref={actionDialogRef} className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
            <button className="close-button" type="button" onClick={closeAction} aria-label="Close admissions options">Close <span aria-hidden="true">x</span></button>
            <p className="eyebrow">{activeCopy.eyebrow}</p><h2 id="action-title">{activeCopy.title}</h2><p>{activeCopy.text}</p>
            <div className="action-contact-options">
              <a className="button primary" href={emailHref(activeCopy.subject)}>{activeCopy.button}</a>
              <a className="text-link" href={`${routeHref("admissions")}#contact`} onClick={() => setActiveAction(null)}>View all contact details <span aria-hidden="true">-&gt;</span></a>
              <p>Campus visits are confirmed by appointment. Contact admissions before sending transcripts or other personal records.</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return <SchoolSite />;
}
