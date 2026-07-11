import { FormEvent, useState } from "react";

const programs = [
  { code: "SCI", title: "Sciences", text: "Biology, chemistry and physics taught through inquiry, lab work and evidence-based thinking." },
  { code: "MAT", title: "Mathematics", text: "From foundations to advanced functions and calculus, with support matched to each learner." },
  { code: "TEC", title: "Technology", text: "Computer science, digital fluency and project-based problem solving for a changing world." },
  { code: "BUS", title: "Business", text: "Business leadership, economics and accounting grounded in real-world applications." },
  { code: "HUM", title: "Humanities", text: "English, social sciences and the arts that strengthen communication and global awareness." },
  { code: "ESL", title: "English Support", text: "Focused language development integrated with academic coursework and university preparation." },
];

const admissionsSteps = [
  ["01", "Start your application", "Complete the short online inquiry and tell us about the student’s goals."],
  ["02", "Share your records", "Provide recent transcripts and identification documents for an academic review."],
  ["03", "Meet our team", "Join a friendly interview and complete an academic or English assessment if needed."],
  ["04", "Plan your pathway", "Receive a decision and meet an advisor to build a personalized OSSD study plan."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main>
      <div className="demo-banner">Prototype website — fictional school and contact information</div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lake Forest Academy home">
          <span className="brand-mark" aria-hidden="true">LFA</span>
          <span className="brand-copy"><strong>Lake Forest</strong><span>Academy</span></span>
        </a>

        <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /> <span /> <span />
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>Our School</a>
          <a href="#academics" onClick={() => setMenuOpen(false)}>Academics</a>
          <a href="#admissions" onClick={() => setMenuOpen(false)}>Admissions</a>
          <a href="#community" onClick={() => setMenuOpen(false)}>Student Life</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Apply now</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <img src="./images/campus-hero.jpg" alt="Students walking toward a modern school campus beside a lake" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">OSSD education in North York, Ontario</p>
          <h1>Your path forward<br />starts here.</h1>
          <p className="hero-lead">A supportive learning community where academic purpose, personal confidence and university ambition grow together.</p>
          <div className="hero-actions">
            <a className="button primary" href="#admissions">Explore admissions <span>→</span></a>
            <a className="button ghost" href="#academics">Discover our programs</a>
          </div>
        </div>
        <div className="hero-note"><span>Learn with purpose.</span><span>Grow with confidence.</span></div>
      </section>

      <section className="intro section" id="about">
        <div>
          <p className="eyebrow">Welcome to Lake Forest Academy</p>
          <h2>A close-knit school with a global outlook.</h2>
        </div>
        <div className="intro-copy">
          <p>Lake Forest Academy is a Grade 9–12 learning community in North York, offering the Ontario Secondary School Diploma in an inclusive, student-centred environment.</p>
          <p>Small classes, dedicated advisors and thoughtful university planning help every student build a pathway that reflects who they are and where they want to go.</p>
          <a className="text-link" href="#community">Experience our community <span>↗</span></a>
        </div>
      </section>

      <section className="stats" aria-label="School facts">
        <div><strong>320</strong><span>students</span></div>
        <div><strong>1:10</strong><span>teacher–student ratio</span></div>
        <div><strong>30+</strong><span>OSSD courses</span></div>
        <div><strong>18</strong><span>countries represented</span></div>
      </section>

      <section className="academics section" id="academics">
        <div className="section-heading centered">
          <p className="eyebrow">The Ontario advantage</p>
          <h2>An OSSD pathway built around your goals.</h2>
          <p>Students earn the Ontario Secondary School Diploma through a balanced program of required credits, electives, literacy learning and community involvement.</p>
        </div>

        <div className="program-grid">
          {programs.map((program) => (
            <article className="program-card" key={program.code}>
              <span>{program.code}</span>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
            </article>
          ))}
        </div>

        <div className="feature-row">
          <div className="feature-image"><img src="./images/science-lab.jpg" alt="Students conducting a science experiment with their teacher" /></div>
          <div className="feature-copy">
            <p className="eyebrow light">Learning that connects</p>
            <h2>Curious minds. Practical experiences.</h2>
            <p>Our classrooms combine Ontario curriculum expectations with hands-on inquiry, collaboration and clear academic feedback.</p>
            <ul>
              <li>Average class size of 15–18 students</li>
              <li>After-school tutorials and academic support</li>
              <li>Course planning aligned with university prerequisites</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="support section">
        <div className="support-copy">
          <p className="eyebrow">Guidance at every turning point</p>
          <h2>A plan for today—and what comes next.</h2>
          <p>Every student is known by name and supported by an advisor who brings academics, wellbeing and future planning into one clear conversation.</p>
          <div className="support-list">
            <div><strong>01</strong><span><b>Personal course planning</b>Build the right sequence of credits for graduation and university entry.</span></div>
            <div><strong>02</strong><span><b>University application support</b>Research programs, prepare applications and practise for interviews.</span></div>
            <div><strong>03</strong><span><b>English language development</b>Strengthen academic communication with targeted ESL support.</span></div>
          </div>
        </div>
        <div className="support-image"><img src="./images/student-guidance.jpg" alt="A guidance counsellor helping a student plan their academic pathway" /></div>
      </section>

      <section className="community" id="community">
        <div className="community-grid">
          <img className="community-main" src="./images/student-community.jpg" alt="A diverse group of students talking in the school courtyard" />
          <img src="./images/technology-class.jpg" alt="Students collaborating on a technology project" />
          <img src="./images/campus-life-basketball.jpg" alt="Students playing basketball in the school gym" />
        </div>
        <div className="community-copy">
          <p className="eyebrow light">Beyond the classroom</p>
          <h2>A community where everyone has a place.</h2>
          <p>Clubs, athletics, leadership and service give students room to try new things, form lasting friendships and contribute with confidence.</p>
          <div className="club-tags"><span>Robotics</span><span>Basketball</span><span>Model UN</span><span>Visual Arts</span><span>Student Council</span><span>Volunteering</span></div>
        </div>
      </section>

      <section className="admissions section" id="admissions">
        <div className="section-heading">
          <p className="eyebrow">Admissions</p>
          <h2>Four steps to your Lake Forest journey.</h2>
          <p>We welcome domestic and international applicants entering Grades 9–12. Our team will guide your family through every stage.</p>
        </div>
        <div className="steps">
          {admissionsSteps.map(([number, title, text]) => (
            <article key={number}><strong>{number}</strong><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-copy">
          <p className="eyebrow light">Let’s start a conversation</p>
          <h2>Ready to explore what’s possible?</h2>
          <p>Tell us a little about your student. Our admissions team will help you understand programs, requirements and next steps.</p>
          <div className="contact-details">
            <span><small>Admissions</small>+1 416-555-0162</span>
            <span><small>Email</small>admissions@lakeforestacademy.example</span>
            <span><small>Location</small>North York, Ontario</span>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>Student name<input name="student" required placeholder="Full name" /></label>
            <label>Current grade<select name="grade" defaultValue=""><option value="" disabled>Select grade</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label>
          </div>
          <div className="field-row">
            <label>Parent / guardian email<input name="email" type="email" required placeholder="name@example.com" /></label>
            <label>Entry term<select name="term" defaultValue=""><option value="" disabled>Select term</option><option>September 2026</option><option>February 2027</option><option>September 2027</option></select></label>
          </div>
          <label>How can we help?<textarea name="message" rows={4} placeholder="Tell us about your questions or goals." /></label>
          <button className="button form-button" type="submit">Submit inquiry <span>→</span></button>
          {sent && <p className="form-message" role="status">Test form only — no information has been sent.</p>}
          <small className="form-disclaimer">This prototype does not store or transmit personal information.</small>
        </form>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-mark">LFA</span><div><strong>Lake Forest Academy</strong><p>Learn with purpose. Grow with confidence.</p></div></div>
        <div className="footer-links"><a href="#about">Our School</a><a href="#academics">Academics</a><a href="#admissions">Admissions</a><a href="#community">Student Life</a></div>
        <div className="footer-bottom"><span>© 2026 Lake Forest Academy — Demo website</span><span>All school details are fictional placeholders.</span></div>
      </footer>
    </main>
  );
}
