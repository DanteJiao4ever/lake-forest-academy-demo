import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type ActionType = "enquire" | "tour" | "apply";

const programs = [
  { code: "SCI", title: "Sciences", text: "Biology, chemistry and physics taught through inquiry, lab work and evidence-based thinking." },
  { code: "MAT", title: "Mathematics", text: "From foundations to advanced functions and calculus, with support matched to each learner." },
  { code: "TEC", title: "Technology", text: "Computer science, digital fluency and project-based problem solving for a changing world." },
  { code: "BUS", title: "Business", text: "Business leadership, economics and accounting grounded in real-world applications." },
  { code: "HUM", title: "Humanities", text: "English, social sciences and the arts that strengthen communication and global awareness." },
  { code: "ESL", title: "English Support", text: "Focused language development integrated with academic coursework and university preparation." },
];

const admissionsSteps = [
  ["01", "Start your application", "Complete a short inquiry and tell us about the student's goals."],
  ["02", "Share your records", "Provide recent transcripts and identification documents for an academic review."],
  ["03", "Meet our team", "Join a friendly interview and complete an academic or English assessment if needed."],
  ["04", "Plan your pathway", "Receive a decision and meet an advisor to build a personalized OSSD study plan."],
];

const historyMilestones = [
  {
    year: "2008",
    title: "An idea takes root",
    text: "A small group of Ontario educators and internationally minded families begins planning a North York secondary school where rigorous OSSD learning and close mentorship belong in the same daily experience.",
  },
  {
    year: "2012",
    title: "The first graduating class",
    text: "The Academy celebrates its first graduating cohort, establishing advisory meetings, family partnership and a student-centred approach as enduring traditions.",
  },
  {
    year: "2017",
    title: "Guidance becomes a signature",
    text: "Dedicated university planning and expanded English-language support give every student a clearer route from course selection to post-secondary study.",
  },
  {
    year: "2021",
    title: "Learning moves beyond the desk",
    text: "New science, technology and community-impact projects bring hands-on inquiry, collaboration and service into the centre of the academic program.",
  },
  {
    year: "Today",
    title: "A wider world, one community",
    text: "The Academy now brings together 320 students from 18 countries, united by curiosity, responsibility and the confidence to choose their own path forward.",
  },
];

const menuGroups = [
  {
    title: "Our School",
    description: "A close-knit Grade 9-12 community in North York.",
    links: [["Welcome", "#about"], ["Our history", "#history"], ["School facts", "#facts"]],
  },
  {
    title: "Academics",
    description: "OSSD courses, English support and university planning.",
    links: [["OSSD pathway", "#academics"], ["Course areas", "#programs"], ["Learning support", "#guidance"]],
  },
  {
    title: "Student Life",
    description: "Clubs, athletics, belonging and international transition support.",
    links: [["Life at LFA", "#student-life"], ["Photo stories", "#life-gallery"], ["News and events", "#news"]],
  },
  {
    title: "Admissions",
    description: "Clear next steps for domestic and international families.",
    links: [["How to apply", "#admissions"], ["Frequently asked questions", "#faq"], ["Contact admissions", "#contact"]],
  },
];

const carouselSlides = [
  { src: "./images/student-community.jpg", alt: "Students gathering in the school courtyard", title: "A community built on belonging", text: "Advisory, clubs and shared traditions help every student feel known." },
  { src: "./images/technology-class.jpg", alt: "Students collaborating on a technology project", title: "Ideas become real projects", text: "Students learn through teamwork, experimentation and purposeful technology." },
  { src: "./images/campus-life-basketball.jpg", alt: "Students playing basketball in the school gym", title: "Energy beyond the classroom", text: "Athletics and recreation create space for confidence, balance and friendship." },
  { src: "./images/science-lab.jpg", alt: "Students conducting a science experiment with their teacher", title: "Learning by doing", text: "Practical experiences connect Ontario curriculum expectations with curiosity." },
];

const newsItems = [
  { date: "03 SEP 2026", category: "Community", title: "Welcome and Orientation Day", text: "New students meet their advisors, explore campus routines and connect with peer ambassadors." },
  { date: "14 OCT 2026", category: "University Planning", title: "OSSD Pathways Evening", text: "Families explore prerequisites, graduation planning and Canadian university application timelines." },
  { date: "07 NOV 2026", category: "Student Life", title: "Community Service Saturday", text: "Student teams take part in local service projects and reflect on responsible citizenship." },
];

const faqs = [
  ["Does Lake Forest Academy offer the OSSD?", "Yes. This prototype presents Lake Forest Academy as an Ontario Grade 9-12 school offering courses toward the Ontario Secondary School Diploma."],
  ["Which students can apply?", "Domestic and international students entering Grades 9-12 may submit an inquiry. Course placement is reviewed individually using recent academic records."],
  ["Is English-language support available?", "Yes. ESL course planning, academic-language development and after-school learning support are included in the proposed student experience."],
  ["Does the school operate boarding houses?", "No boarding operation is claimed in this prototype. International families would arrange housing independently, while the school concept focuses on orientation and academic transition support."],
  ["How do I book a campus visit?", "Choose Book a Tour anywhere on the site, share your preferred date and the admissions team will follow up. The current form is a non-transmitting demo."],
  ["Are the forms connected to admissions?", "Not yet. Every form on this test website demonstrates the experience only and does not store or transmit personal information."],
];

const searchItems = [
  { title: "About Lake Forest Academy", area: "Our School", text: "School profile, learning community and facts.", href: "#about" },
  { title: "Our History", area: "Our School", text: "A fictional timeline from the founding idea to today's learning community.", href: "#history" },
  { title: "OSSD Academic Pathway", area: "Academics", text: "Course areas, diploma expectations and university preparation.", href: "#academics" },
  { title: "Guidance and English Support", area: "Student Support", text: "Course planning, wellbeing and ESL development.", href: "#guidance" },
  { title: "Student Life", area: "Community", text: "Clubs, athletics, leadership and international transition support.", href: "#student-life" },
  { title: "News and Events", area: "Community", text: "Sample orientation, planning and service events.", href: "#news" },
  { title: "How to Apply", area: "Admissions", text: "Four steps from inquiry to an OSSD study plan.", href: "#admissions" },
  { title: "Admissions FAQ", area: "Admissions", text: "Answers about grades, language support and campus visits.", href: "#faq" },
  { title: "Contact Admissions", area: "Admissions", text: "Ask a question or start a test inquiry.", href: "#contact" },
];

const actionCopy: Record<ActionType, { eyebrow: string; title: string; text: string; button: string }> = {
  enquire: { eyebrow: "Admissions enquiry", title: "Start a conversation", text: "Tell us what you would like to understand about OSSD programs, entry requirements or student support.", button: "Submit enquiry" },
  tour: { eyebrow: "Campus visit", title: "Book a school tour", text: "Choose a preferred visit date and share who will be joining you. Our demo admissions team will confirm the next step.", button: "Request a tour" },
  apply: { eyebrow: "Online application", title: "Begin your application", text: "Share the student's current grade and intended entry term to start a preliminary application record.", button: "Start application" },
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPlaying, setCarouselPlaying] = useState(true);
  const [activeHistory, setActiveHistory] = useState(0);
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCarouselPlaying(false);
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
      <div className="demo-banner">Fictional North York school concept - not affiliated with any existing institution</div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lake Forest Academy home">
          <img className="brand-logo" src="./images/lake-forest-academy-logo.png" alt="Lake Forest Academy" />
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#about">Our School</a>
          <a href="#academics">Academics</a>
          <a href="#student-life">Student Life</a>
          <a href="#admissions">Admissions</a>
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
            <img src="./images/lake-forest-academy-logo-light.png" alt="Lake Forest Academy" />
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
                  {group.links.map(([label, href]) => <a href={href} key={label} onClick={() => setMenuOpen(false)}>{label}<span aria-hidden="true">+</span></a>)}
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
                <a href={item.href} key={item.title} onClick={closeSearch}>
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
      <section className="hero" id="top">
        <img src="./images/campus-hero.jpg" alt="Students walking toward a modern school campus beside a lake" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">North York, Ontario &middot; Grades 9-12 &middot; OSSD</p>
          <h1>Rooted in purpose.<br /><em>Open to possibility.</em></h1>
          <p className="hero-lead">A thoughtful learning community where strong foundations, clear guidance and global ambition help every student move forward with confidence.</p>
          <div className="hero-actions">
            <a className="button primary" href="#academics">Explore the OSSD program <span aria-hidden="true">-&gt;</span></a>
            <button className="button ghost" type="button" onClick={() => openAction("tour")}>Book a campus tour</button>
          </div>
        </div>
        <div className="hero-note"><span><small>Lake</small>Clarity &amp; curiosity</span><span><small>Forest</small>Roots &amp; resilience</span></div>
      </section>

      <section className="quick-links" aria-label="Family quick links">
        <a href="#history"><small>Discover our foundations</small>Our Story</a>
        <a href="#admissions"><small>Plan your pathway</small>Entry Requirements</a>
        <a href="#faq"><small>Common questions</small>Admissions FAQ</a>
        <button type="button" onClick={() => openAction("tour")}><small>See the community</small>Visit LFA</button>
      </section>

      <section className="intro section" id="about">
        <div>
          <p className="eyebrow">Welcome to Lake Forest Academy</p>
          <h2>A close-knit school with a <em>global outlook.</em></h2>
        </div>
        <div className="intro-copy">
          <p>Lake Forest Academy is a Grade 9-12 learning community in North York, offering the Ontario Secondary School Diploma in an inclusive, student-centred environment.</p>
          <p>Our name brings together two ideas: the clarity and openness of a lake, and the deep roots and steady growth of a forest. They shape how we learn, support one another and look toward the future.</p>
          <a className="text-link" href="#history">Read our story <span aria-hidden="true">-&gt;</span></a>
        </div>
      </section>

      <section className="history section" id="history">
        <div className="history-intro">
          <p className="eyebrow light">Our story</p>
          <h2>Where our story <em>takes root.</em></h2>
          <p>Lake Forest Academy began with a simple belief: students move further when academic ambition is matched by personal attention, belonging and a clear sense of direction.</p>
          <div className="name-meaning" aria-label="The meaning behind the school name">
            <article><span>Lake</span><strong>Clarity and reflection</strong><p>Space to think deeply, see new perspectives and choose a purposeful direction.</p></article>
            <article><span>Forest</span><strong>Roots and growth</strong><p>Strong relationships, resilient habits and the confidence to keep growing.</p></article>
          </div>
        </div>
        <div className="history-experience">
          <div className="history-tabs" aria-label="School history milestones">
            {historyMilestones.map((milestone, index) => (
              <button type="button" key={milestone.year} aria-pressed={activeHistory === index} onClick={() => setActiveHistory(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>{milestone.year}
              </button>
            ))}
          </div>
          <article className="history-panel" aria-live="polite">
            <div><small>Milestone {String(activeHistory + 1).padStart(2, "0")}</small><strong>{historyMilestones[activeHistory].year}</strong></div>
            <h3>{historyMilestones[activeHistory].title}</h3>
            <p>{historyMilestones[activeHistory].text}</p>
            <div className="history-progress" aria-hidden="true">
              {historyMilestones.map((milestone, index) => <i className={index <= activeHistory ? "complete" : ""} key={milestone.year} />)}
            </div>
          </article>
        </div>
      </section>

      <section className="stats" id="facts" aria-label="School facts">
        <div><strong>320</strong><span>students</span></div>
        <div><strong>1:10</strong><span>teacher-student ratio</span></div>
        <div><strong>30+</strong><span>OSSD courses</span></div>
        <div><strong>18</strong><span>countries represented</span></div>
      </section>

      <section className="academics section" id="academics">
        <div className="section-heading centered">
          <p className="eyebrow">The Ontario advantage</p>
          <h2>An OSSD pathway built around your goals.</h2>
          <p>Students earn the Ontario Secondary School Diploma through a balanced program of required credits, electives, literacy learning and community involvement.</p>
        </div>
        <div className="program-grid" id="programs">
          {programs.map((program) => (
            <article className="program-card" key={program.code}>
              <span>{program.code}</span><h3>{program.title}</h3><p>{program.text}</p>
            </article>
          ))}
        </div>
        <div className="feature-row">
          <div className="feature-image"><img src="./images/science-lab.jpg" alt="Students conducting a science experiment with their teacher" /></div>
          <div className="feature-copy">
            <p className="eyebrow light">Learning that connects</p>
            <h2>Curious minds. Practical experiences.</h2>
            <p>Our classrooms combine Ontario curriculum expectations with hands-on inquiry, collaboration and clear academic feedback.</p>
            <ul><li>Average class size of 15-18 students</li><li>After-school tutorials and academic support</li><li>Course planning aligned with university prerequisites</li></ul>
          </div>
        </div>
      </section>

      <section className="support section" id="guidance">
        <div className="support-copy">
          <p className="eyebrow">Guidance at every turning point</p>
          <h2>A plan for today - and what comes next.</h2>
          <p>Every student is known by name and supported by an advisor who brings academics, wellbeing and future planning into one clear conversation.</p>
          <div className="support-list">
            <div><strong>01</strong><span><b>Personal course planning</b>Build the right sequence of credits for graduation and university entry.</span></div>
            <div><strong>02</strong><span><b>University application support</b>Research programs, prepare applications and practise for interviews.</span></div>
            <div><strong>03</strong><span><b>English language development</b>Strengthen academic communication with targeted ESL support.</span></div>
          </div>
        </div>
        <div className="support-image"><img src="./images/student-guidance.jpg" alt="A guidance counsellor helping a student plan their academic pathway" /></div>
      </section>

      <section className="student-life section" id="student-life">
        <div className="student-life-intro">
          <div><p className="eyebrow light">Life at Lake Forest</p><h2>A community where everyone has a place.</h2></div>
          <div><p>Clubs, athletics, leadership and service give students room to try new things, form lasting friendships and contribute with confidence.</p><div className="club-tags"><span>Robotics</span><span>Basketball</span><span>Model UN</span><span>Visual Arts</span><span>Student Council</span><span>Volunteering</span></div></div>
        </div>
        <div className="life-options">
          <article><span>01</span><h3>Campus belonging</h3><p>Advisor check-ins, peer ambassadors and student-led activities create a welcoming daily rhythm.</p></article>
          <article><span>02</span><h3>International transition</h3><p>Orientation, ESL planning and practical guidance help students settle into learning in Ontario.</p></article>
          <article><span>03</span><h3>Family support</h3><p>International families receive practical orientation and settling resources; no school-operated boarding is claimed.</p></article>
        </div>

        <div className="life-carousel" id="life-gallery" role="region" aria-roledescription="carousel" aria-label="Student life photo stories">
          <figure>
            <img src={activeSlide.src} alt={activeSlide.alt} />
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
        <div className="section-heading news-heading"><div><p className="eyebrow">News and events</p><h2>What is happening at LFA.</h2></div><p>Sample calendar content for this fictional school prototype.</p></div>
        <div className="news-grid">
          {newsItems.map((item) => <article key={item.title}><div><time>{item.date}</time><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.text}</p><span className="news-status">Sample event</span></article>)}
        </div>
      </section>

      <section className="admissions section" id="admissions">
        <div className="section-heading"><p className="eyebrow">Admissions</p><h2>Four steps to your Lake Forest journey.</h2><p>We welcome domestic and international applicants entering Grades 9-12. Our team will guide your family through every stage.</p></div>
        <div className="steps">
          {admissionsSteps.map(([number, title, text]) => <article key={number}><strong>{number}</strong><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="faq section" id="faq">
        <div className="faq-heading"><p className="eyebrow">Frequently asked questions</p><h2>Clear answers for families.</h2><p>These answers describe the current test-site concept. Final admissions policies should be verified before commercial use.</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
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
          <p className="eyebrow light">Let's start a conversation</p><h2>Ready to explore what is possible?</h2><p>Tell us a little about your student. Our admissions team will help you understand programs, requirements and next steps.</p>
          <div className="contact-details"><span><small>Admissions</small>+1 416-555-0162</span><span><small>Email</small>admissions@lakeforestacademy.example</span><span><small>Location</small>North York, Ontario</span></div>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="field-row"><label>Student name<input name="student" required placeholder="Full name" /></label><label>Current grade<select required name="grade" defaultValue=""><option value="" disabled>Select grade</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label></div>
          <div className="field-row"><label>Parent / guardian email<input name="email" type="email" required placeholder="name@example.com" /></label><label>Entry term<select required name="term" defaultValue=""><option value="" disabled>Select term</option><option>September 2026</option><option>February 2027</option><option>September 2027</option></select></label></div>
          <label>How can we help?<textarea name="message" rows={4} placeholder="Tell us about your questions or goals." /></label>
          <button className="button form-button" type="submit">Submit inquiry <span aria-hidden="true">-&gt;</span></button>
          {contactSent && <p className="form-message" role="status">Test form only - no information has been sent.</p>}
          <small className="form-disclaimer">This prototype does not store or transmit personal information.</small>
        </form>
      </section>
      </main>

      <footer>
        <div className="footer-brand"><img className="footer-logo" src="./images/lake-forest-academy-logo-light.png" alt="Lake Forest Academy" /><p>Rooted in purpose. Open to possibility.</p></div>
        <div className="footer-columns">
          {menuGroups.map((group) => <div key={group.title}><strong>{group.title}</strong>{group.links.slice(0, 3).map(([label, href]) => <a href={href} key={label}>{label}</a>)}</div>)}
        </div>
        <div className="footer-bottom"><span>&copy; 2026 Lake Forest Academy - Demo website</span><span>Fictional North York concept; not affiliated with any existing school of the same name.</span></div>
      </footer>

      {activeAction && activeCopy && (
        <div className="modal-backdrop" role="presentation">
          <section ref={actionDialogRef} className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
            <button className="close-button" type="button" onClick={closeAction} aria-label="Close admissions form">Close <span aria-hidden="true">x</span></button>
            <p className="eyebrow">{activeCopy.eyebrow}</p><h2 id="action-title">{activeCopy.title}</h2><p>{activeCopy.text}</p>
            {actionSent ? (
              <div className="modal-success" role="status"><strong>Thank you for testing this experience.</strong><p>No information was sent or stored. A production version can connect this step to an admissions system.</p><button className="button primary" type="button" onClick={closeAction}>Close</button></div>
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
