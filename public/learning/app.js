(() => {
  "use strict";

  const APP_ROOT = document.querySelector("#app");
  const STATE_KEY = "lake-forest-learning-state-v1";
  const SESSION_KEY = "lake-forest-learning-session-v1";
  const DEMO_EMAIL = "student@example.invalid";
  const DEMO_PASSWORD = null;

  const COURSES = [
    {
      id: "mhf4u",
      code: "MHF4U",
      title: "Advanced Functions",
      subject: "Mathematics",
      instructor: "James Whitmore",
      term: "Summer 2026",
      schedule: "Mon, Wed & Fri · 9:00 AM",
      image: "../images/technology-class.jpg",
      description:
        "Investigate polynomial, rational, logarithmic and trigonometric functions while building the reasoning required for senior mathematics.",
      overview:
        "This Grade 12 university-preparation course extends students’ experience with functions. Lessons combine short demonstrations, collaborative problem solving, technology-enabled investigations and individual practice.",
      lessons: [
        {
          id: "mhf-1",
          unit: "Unit 1",
          unitTitle: "Characteristics of Functions",
          title: "Transformations and Function Notation",
          duration: "38 min",
          summary:
            "Connect transformations of a graph to changes in its algebraic representation.",
          objectives: [
            "Use function notation accurately in context.",
            "Describe translations, stretches and reflections.",
            "Build a transformed equation from a parent function.",
          ],
          content: [
            "A function can be viewed as a relationship, a machine or a graph. In this lesson, we use all three perspectives to describe how a parent function changes when constants are introduced.",
            "Pay particular attention to horizontal transformations. They appear inside the function and act in the opposite direction from what a first reading may suggest.",
          ],
        },
        {
          id: "mhf-2",
          unit: "Unit 1",
          unitTitle: "Characteristics of Functions",
          title: "Rates of Change and End Behaviour",
          duration: "42 min",
          summary:
            "Interpret average and instantaneous rates of change using tables, graphs and equations.",
          objectives: [
            "Calculate an average rate of change over an interval.",
            "Estimate an instantaneous rate from nearby points.",
            "Relate degree and leading coefficient to end behaviour.",
          ],
          content: [
            "Rates of change tell us how one quantity responds as another changes. We begin with secant slopes, then use progressively smaller intervals to motivate the idea of an instantaneous rate.",
            "End behaviour provides a concise description of a function far from the origin. It is especially useful when sketching polynomial models.",
          ],
        },
        {
          id: "mhf-3",
          unit: "Unit 2",
          unitTitle: "Polynomial and Rational Functions",
          title: "Polynomial Models and Inequalities",
          duration: "45 min",
          summary:
            "Use zeros, intervals and sign analysis to solve polynomial inequalities.",
          objectives: [
            "Factor a polynomial strategically.",
            "Construct and interpret a sign chart.",
            "State an inequality solution using interval notation.",
          ],
          content: [
            "A polynomial inequality asks where a graph sits above or below the horizontal axis. Once the zeros are known, a sign chart organizes the reasoning without relying only on a sketch.",
            "Always check whether endpoints are included. The inequality symbol determines whether a zero belongs in the final solution.",
          ],
        },
        {
          id: "mhf-4",
          unit: "Unit 2",
          unitTitle: "Polynomial and Rational Functions",
          title: "Rational Functions and Asymptotes",
          duration: "41 min",
          summary:
            "Analyze restrictions, intercepts, holes and asymptotes in rational functions.",
          objectives: [
            "Identify restrictions before simplifying.",
            "Distinguish a removable hole from a vertical asymptote.",
            "Sketch a rational function from key features.",
          ],
          content: [
            "Rational functions often contain values that are excluded from the domain. Simplifying an expression does not erase these original restrictions.",
            "We use intercepts and asymptotes as anchors for a careful sketch, then confirm the shape with selected test points.",
          ],
        },
        {
          id: "mhf-5",
          unit: "Unit 3",
          unitTitle: "Exponential and Logarithmic Functions",
          title: "Logarithms as Inverse Functions",
          duration: "39 min",
          summary:
            "Move fluently between exponential and logarithmic representations.",
          objectives: [
            "Rewrite exponential statements in logarithmic form.",
            "Apply logarithm laws with valid restrictions.",
            "Solve simple exponential equations.",
          ],
          content: [
            "A logarithm answers an exponent question. Seeing logarithmic and exponential forms as inverse statements makes their laws easier to understand and apply.",
            "Domain restrictions matter: the argument of a real logarithm must remain positive throughout a solution.",
          ],
        },
        {
          id: "mhf-6",
          unit: "Unit 4",
          unitTitle: "Trigonometric Functions",
          title: "Trigonometric Identities and Proof",
          duration: "47 min",
          summary:
            "Build clear, logically sequenced proofs using fundamental identities.",
          objectives: [
            "Select an identity that advances a proof.",
            "Work from one side of an identity at a time.",
            "Communicate restrictions and equivalent steps.",
          ],
          content: [
            "A trigonometric proof is an argument, not a chain of guesses. Begin with the more complicated side and make one justified change at a time.",
            "Factoring, finding common denominators and converting to sine and cosine are often more useful than searching immediately for a special identity.",
          ],
        },
      ],
    },
    {
      id: "sbi4u",
      code: "SBI4U",
      title: "Biology",
      subject: "Science",
      instructor: "Dr. Amelia Hart",
      term: "Summer 2026",
      schedule: "Tue & Thu · 10:15 AM",
      image: "../images/science-lab.jpg",
      description:
        "Explore biochemistry, metabolic processes, molecular genetics, homeostasis and population dynamics through evidence-based inquiry.",
      overview:
        "This Grade 12 university-preparation course emphasizes the systems and molecular processes that sustain life. Students interpret evidence, design investigations and connect biological ideas to current issues.",
      lessons: [
        {
          id: "sbi-1",
          unit: "Unit 1",
          unitTitle: "Biochemistry",
          title: "Water, Carbon and Biological Molecules",
          duration: "36 min",
          summary:
            "Explain how molecular structure gives water and carbon-based molecules their biological roles.",
          objectives: [
            "Relate polarity to the properties of water.",
            "Recognize the four major classes of biomolecules.",
            "Connect molecular structure to biological function.",
          ],
          content: [
            "Life depends on a small set of atoms arranged in remarkably varied ways. Carbon provides the flexible framework, while water creates the environment in which most cellular reactions occur.",
            "As you compare biomolecules, focus on how structure supports function rather than memorizing isolated examples.",
          ],
        },
        {
          id: "sbi-2",
          unit: "Unit 1",
          unitTitle: "Biochemistry",
          title: "Enzymes and Cellular Reactions",
          duration: "43 min",
          summary:
            "Investigate how enzymes affect reaction rates and respond to environmental conditions.",
          objectives: [
            "Describe activation energy and enzyme specificity.",
            "Interpret enzyme-rate graphs.",
            "Predict the effects of temperature and pH.",
          ],
          content: [
            "Enzymes make cellular chemistry possible at ordinary biological temperatures. They lower activation energy without being consumed by the reaction.",
            "An enzyme’s three-dimensional shape is central to its function. Environmental changes can alter that shape and therefore change reaction rate.",
          ],
        },
        {
          id: "sbi-3",
          unit: "Unit 2",
          unitTitle: "Metabolic Processes",
          title: "Cellular Respiration and ATP",
          duration: "48 min",
          summary:
            "Trace energy transfer from glucose through cellular respiration.",
          objectives: [
            "Summarize glycolysis, the Krebs cycle and the electron transport chain.",
            "Explain the role of redox reactions.",
            "Compare aerobic and anaerobic pathways.",
          ],
          content: [
            "Cellular respiration transfers energy from glucose into ATP through a coordinated series of reactions. Each stage captures only part of the available energy.",
            "Rather than treating the pathway as a list, follow the movement of carbon, electrons and hydrogen ions through the system.",
          ],
        },
        {
          id: "sbi-4",
          unit: "Unit 3",
          unitTitle: "Molecular Genetics",
          title: "DNA Replication and Gene Expression",
          duration: "46 min",
          summary:
            "Follow genetic information from DNA replication through transcription and translation.",
          objectives: [
            "Describe semiconservative DNA replication.",
            "Translate an mRNA sequence using the genetic code.",
            "Predict how a mutation may alter a protein.",
          ],
          content: [
            "Cells preserve genetic information with high accuracy, then use selected regions of that information to build proteins. Replication and expression rely on complementary base pairing.",
            "Mutations create new sequence variation. Their effect depends on where they occur and whether they change the structure or regulation of a protein.",
          ],
        },
        {
          id: "sbi-5",
          unit: "Unit 4",
          unitTitle: "Homeostasis",
          title: "Feedback Systems and Blood Glucose",
          duration: "40 min",
          summary:
            "Model negative feedback using the regulation of blood glucose.",
          objectives: [
            "Identify the components of a feedback loop.",
            "Compare the actions of insulin and glucagon.",
            "Use a model to explain a disruption of homeostasis.",
          ],
          content: [
            "Homeostasis is dynamic rather than static. Receptors, coordinating centres and effectors continually respond to internal change.",
            "Blood glucose regulation offers a clear example of two opposing hormonal pathways working together to maintain a functional range.",
          ],
        },
        {
          id: "sbi-6",
          unit: "Unit 5",
          unitTitle: "Population Dynamics",
          title: "Population Growth and Carrying Capacity",
          duration: "44 min",
          summary:
            "Use mathematical models to interpret population growth and limiting factors.",
          objectives: [
            "Distinguish exponential and logistic growth.",
            "Interpret carrying capacity in context.",
            "Evaluate limits of a population model.",
          ],
          content: [
            "Population models simplify complex ecological relationships so that important patterns become visible. Exponential growth assumes few limits; logistic growth includes environmental resistance.",
            "A carrying capacity is not permanently fixed. Resource availability, competition and human activity can all shift it over time.",
          ],
        },
      ],
    },
    {
      id: "eng4u",
      code: "ENG4U",
      title: "English",
      subject: "English",
      instructor: "Eleanor Bennett",
      term: "Summer 2026",
      schedule: "Mon & Thu · 1:30 PM",
      image: "../images/library-study.jpg",
      description:
        "Develop academic reading, writing, oral communication and media literacy through contemporary and classic texts.",
      overview:
        "This Grade 12 university-preparation course asks students to read closely, write with purpose and participate thoughtfully in an academic community. Major work includes literary analysis, research and oral communication.",
      lessons: [
        {
          id: "eng-1",
          unit: "Unit 1",
          unitTitle: "Reading with Purpose",
          title: "Close Reading and Annotation",
          duration: "34 min",
          summary:
            "Develop an annotation system that turns observations into interpretive questions.",
          objectives: [
            "Annotate for pattern, contrast and change.",
            "Distinguish observation from interpretation.",
            "Form a focused question from textual evidence.",
          ],
          content: [
            "Close reading begins with attention. Effective annotations record patterns and tensions that can later support an interpretation; they do more than summarize the plot.",
            "Try to notice before you explain. A strong analytical question often emerges when two details do not fit comfortably together.",
          ],
        },
        {
          id: "eng-2",
          unit: "Unit 1",
          unitTitle: "Reading with Purpose",
          title: "Theme, Motif and Authorial Choice",
          duration: "39 min",
          summary:
            "Trace recurring details and explain how authorial choices shape a text’s central concerns.",
          objectives: [
            "Differentiate a topic from a thematic statement.",
            "Trace the development of a motif.",
            "Connect a stylistic choice to meaning.",
          ],
          content: [
            "A theme is not a single abstract word. It is a claim a text develops about a topic through characters, structure, imagery and conflict.",
            "Motifs help readers follow that development. Their meaning often shifts as the text’s circumstances change.",
          ],
        },
        {
          id: "eng-3",
          unit: "Unit 2",
          unitTitle: "Academic Writing",
          title: "From Evidence to Analytical Claim",
          duration: "41 min",
          summary:
            "Build paragraphs in which evidence and reasoning work together.",
          objectives: [
            "Write a specific, arguable claim.",
            "Integrate a quotation smoothly.",
            "Explain how evidence supports an interpretation.",
          ],
          content: [
            "Evidence does not speak for itself. The writer’s analysis should identify the significant detail, explain its effect and connect it back to the paragraph’s claim.",
            "Strong paragraphs develop an idea rather than repeating it in several forms. Each sentence should move the reasoning forward.",
          ],
        },
        {
          id: "eng-4",
          unit: "Unit 2",
          unitTitle: "Academic Writing",
          title: "Structure, Coherence and Revision",
          duration: "37 min",
          summary:
            "Revise an argument at the level of ideas, paragraphs and sentences.",
          objectives: [
            "Use an outline to test argumentative structure.",
            "Create purposeful transitions.",
            "Separate revision from proofreading.",
          ],
          content: [
            "Revision is an act of re-seeing. Begin with the argument’s structure before polishing sentences that may later be removed.",
            "A coherent essay gives the reader a sense of direction. Transitions should name the relationship between ideas, not simply announce the next paragraph.",
          ],
        },
        {
          id: "eng-5",
          unit: "Unit 3",
          unitTitle: "Research and Media",
          title: "Source Evaluation and Synthesis",
          duration: "45 min",
          summary:
            "Evaluate source credibility and place sources in meaningful conversation.",
          objectives: [
            "Assess authority, evidence and context.",
            "Distinguish summary from synthesis.",
            "Document source use consistently.",
          ],
          content: [
            "A source can be useful without being neutral or definitive. Evaluation asks who produced it, for whom, with what evidence and under what conditions.",
            "Synthesis organizes sources around ideas. Instead of reporting one source at a time, show where evidence converges, differs or leaves a question open.",
          ],
        },
        {
          id: "eng-6",
          unit: "Unit 4",
          unitTitle: "Voice and Presentation",
          title: "Seminar Discussion and Oral Advocacy",
          duration: "38 min",
          summary:
            "Prepare an evidence-based contribution to a collaborative seminar.",
          objectives: [
            "Frame a contribution that advances discussion.",
            "Respond directly and respectfully to a peer.",
            "Use pace and emphasis to support clarity.",
          ],
          content: [
            "A seminar is collaborative inquiry, not a sequence of individual speeches. Preparation gives you evidence and questions; listening helps you decide when they will be most useful.",
            "Good oral advocacy is both confident and responsive. State your position clearly while remaining willing to refine it in light of new evidence.",
          ],
        },
      ],
    },
  ];

  const ASSIGNMENTS = [
    {
      id: "a1",
      courseId: "mhf4u",
      title: "Quadratic Models Investigation",
      due: "2026-07-22T23:59:00-04:00",
      points: 100,
      status: "due",
      instructions:
        "Choose a real-world situation that can be represented by a quadratic function. Develop a model, explain the meaning of its key features and test the model against at least three data points. Submit a concise report with a graph and a reflection on the model’s limitations.",
    },
    {
      id: "a2",
      courseId: "sbi4u",
      title: "Cellular Respiration Lab Analysis",
      due: "2026-07-18T23:59:00-04:00",
      points: 80,
      status: "submitted",
      instructions:
        "Analyze the class respiration dataset. Present one well-labelled graph, identify the overall pattern and discuss two sources of uncertainty. Your conclusion should connect the evidence to enzyme activity and ATP production.",
    },
    {
      id: "a3",
      courseId: "eng4u",
      title: "Comparative Literary Essay",
      due: "2026-07-15T23:59:00-04:00",
      points: 100,
      status: "graded",
      score: 92,
      feedback:
        "A thoughtful, well-structured comparison. Your close reading is strongest in the second section. For the final essay, make the transition between the two central claims more explicit.",
      instructions:
        "Write a 1,200–1,500 word comparative essay that develops one focused interpretation across two course texts. Integrate primary evidence, use MLA documentation and include a Works Cited page.",
    },
    {
      id: "a4",
      courseId: "mhf4u",
      title: "Trigonometric Proof Portfolio",
      due: "2026-07-29T23:59:00-04:00",
      points: 60,
      status: "upcoming",
      instructions:
        "Complete six selected identities and annotate each proof with a brief explanation of the strategy used. End with a 150-word reflection identifying the two transformations you found most useful.",
    },
  ];

  const ANNOUNCEMENTS = [
    {
      id: "ann-1",
      date: "2026-07-19",
      author: "Academic Office",
      category: "Academic",
      title: "Midterm Progress Conferences",
      body:
        "Student progress conferences will be held online on Thursday, July 23. Appointment links will appear in your school email by Tuesday afternoon. Please review your course progress before the meeting.",
    },
    {
      id: "ann-2",
      date: "2026-07-18",
      author: "Dr. Amelia Hart",
      category: "SBI4U",
      title: "Biology Lab Data Now Available",
      body:
        "The consolidated cellular respiration dataset has been posted with the assignment instructions. Check units carefully before creating your graph, and bring questions to Tuesday’s workshop.",
    },
    {
      id: "ann-3",
      date: "2026-07-16",
      author: "Student Services",
      category: "Community",
      title: "University Planning Drop-In",
      body:
        "Vivienne Chow will host an open university-planning session on Friday from 2:30–3:30 PM. Students are welcome to bring program research, OUAC questions or a draft activity list.",
    },
    {
      id: "ann-4",
      date: "2026-07-14",
      author: "Eleanor Bennett",
      category: "ENG4U",
      title: "Seminar Reading Schedule",
      body:
        "The seminar reading order has been updated to allow more time for the comparative essay. Please use the new schedule in the course outline and come prepared with one passage for discussion.",
    },
  ];

  const GRADES = [
    { courseId: "mhf4u", current: 89, target: 90, completed: 4 },
    { courseId: "sbi4u", current: 87, target: 88, completed: 3 },
    { courseId: "eng4u", current: 92, target: 92, completed: 5 },
  ];

  const DEFAULT_STATE = {
    completed: ["mhf-1", "sbi-1", "eng-1", "eng-2"],
    read: ["ann-4"],
    submissions: {
      a2: {
        text: "Lab analysis submitted with graph and uncertainty notes.",
        fileName: "respiration-lab-analysis.pdf",
        submittedAt: "2026-07-18T18:42:00",
      },
      a3: {
        text: "Final comparative essay.",
        fileName: "comparative-literary-essay.pdf",
        submittedAt: "2026-07-15T20:11:00",
      },
    },
  };

  let state = loadState();
  let assignmentFilter = "all";
  let replacingSubmissionId = null;
  let toastTimer = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY));
      if (!saved || typeof saved !== "object") {
        return structuredCopy(DEFAULT_STATE);
      }
      const lessonIds = new Set(
        COURSES.flatMap((course) => course.lessons.map((lesson) => lesson.id)),
      );
      const announcementIds = new Set(ANNOUNCEMENTS.map((item) => item.id));
      return {
        completed: Array.isArray(saved.completed)
          ? [...new Set(saved.completed.filter((id) => lessonIds.has(id)))]
          : [...DEFAULT_STATE.completed],
        read: Array.isArray(saved.read)
          ? [...new Set(saved.read.filter((id) => announcementIds.has(id)))]
          : [...DEFAULT_STATE.read],
        submissions:
          saved.submissions && typeof saved.submissions === "object"
            ? saved.submissions
            : structuredCopy(DEFAULT_STATE.submissions),
      };
    } catch {
      return structuredCopy(DEFAULT_STATE);
    }
  }

  function structuredCopy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function isSignedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "signed-in";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value, includeTime = false) {
    const normalized =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T12:00:00-04:00`
        : value;
    const date = new Date(normalized);
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Toronto",
      ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
    }).format(date);
  }

  function todayLabel() {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "America/Toronto",
    }).format(new Date());
  }

  function plural(count, singular, pluralForm = `${singular}s`) {
    return `${count} ${count === 1 ? singular : pluralForm}`;
  }

  function icon(name, size = 20) {
    const paths = {
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"/>',
      clipboard:
        '<path d="M9 5h6M9 3h6v4H9z"/><path d="M7 5H5v16h14V5h-2"/><path d="m8 13 2 2 5-5M8 19h8"/>',
      chart:
        '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      logout:
        '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      arrow: '<path d="m9 18 6-6-6-6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
      calendar:
        '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 3v4M17 3v4M3 10h18"/>',
      award:
        '<circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8"/>',
    };
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.book}</svg>`;
  }

  function allLessons() {
    return COURSES.flatMap((course) =>
      course.lessons.map((lesson) => ({ ...lesson, course })),
    );
  }

  function findCourse(id) {
    return COURSES.find((course) => course.id === id);
  }

  function findLesson(id) {
    return allLessons().find((lesson) => lesson.id === id);
  }

  function findAssignment(id) {
    return ASSIGNMENTS.find((assignment) => assignment.id === id);
  }

  function courseProgress(course) {
    const completed = course.lessons.filter((lesson) =>
      state.completed.includes(lesson.id),
    ).length;
    return {
      completed,
      percent: Math.round((completed / course.lessons.length) * 100),
    };
  }

  function overallProgress() {
    return Math.round((state.completed.length / allLessons().length) * 100);
  }

  function assignmentStatus(assignment) {
    if (assignment.score != null) {
      return { key: "graded", label: `Graded · ${assignment.score}%`, className: "success" };
    }
    if (state.submissions[assignment.id]) {
      return { key: "submitted", label: "Submitted", className: "info" };
    }
    const overdue = new Date(assignment.due) < new Date();
    if (overdue) {
      return { key: "overdue", label: "Overdue", className: "danger" };
    }
    if (assignment.status === "upcoming") {
      return { key: "upcoming", label: "Upcoming", className: "" };
    }
    return { key: "due", label: "Due Soon", className: "warning" };
  }

  function pageTitle(route) {
    const [section, id] = route;
    if (section === "course") return findCourse(id)?.title || "Courses";
    if (section === "lesson") return findLesson(id)?.title || "Lesson";
    if (section === "assignment") return findAssignment(id)?.title || "Assignment";
    return {
      dashboard: "Student Dashboard",
      courses: "My Courses",
      assignments: "Assignments",
      progress: "Progress & Grades",
      announcements: "Announcements",
    }[section] || "Page Not Found";
  }

  function activeSection(route) {
    if (route[0] === "course" || route[0] === "lesson") return "courses";
    if (route[0] === "assignment") return "assignments";
    return route[0] || "dashboard";
  }

  function routeParts() {
    const clean = window.location.hash.replace(/^#\/?/, "");
    return (clean || "dashboard").split("/").filter(Boolean);
  }

  function navLink(section, label, iconName, count = 0) {
    const active = activeSection(routeParts()) === section;
    return `
      <a href="#/${section}" class="${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : ""}>
        <span class="nav-icon">${icon(iconName, 19)}</span>
        <span>${label}</span>
        ${count ? `<small>${count}</small>` : ""}
      </a>
    `;
  }

  function shell(content) {
    const route = routeParts();
    const unread = ANNOUNCEMENTS.filter((item) => !state.read.includes(item.id)).length;
    const pending = ASSIGNMENTS.filter((item) =>
      ["due", "overdue"].includes(assignmentStatus(item).key),
    ).length;
    return `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar" aria-label="Student navigation">
          <button class="sidebar-close" type="button" data-action="close-menu" aria-label="Close menu">${icon("close")}</button>
          <div class="sidebar-brand">
            <img src="../images/lake-forest-academy-logo-light.png" alt="Lake Forest Academy" />
            <p>Student Learning</p>
          </div>
          <nav class="sidebar-nav">
            ${navLink("dashboard", "Dashboard", "home")}
            ${navLink("courses", "My Courses", "book")}
            ${navLink("assignments", "Assignments", "clipboard", pending)}
            ${navLink("progress", "Progress & Grades", "chart")}
            ${navLink("announcements", "Announcements", "bell", unread)}
          </nav>
          <div class="sidebar-student">
            <span class="avatar" aria-hidden="true">AM</span>
            <span><strong>Alex Morgan</strong><span>OSSD · Grade 12</span></span>
            <button class="logout-button" type="button" data-action="logout" aria-label="Sign out">${icon("logout")}</button>
          </div>
        </aside>
        <button class="sidebar-scrim" type="button" data-action="close-menu" aria-label="Close menu" hidden></button>
        <section class="stage">
          <header class="app-header">
            <button class="mobile-menu" type="button" data-action="open-menu" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button>
            <div class="header-title">
              <span>Lake Forest Learning</span>
              <strong>${escapeHtml(pageTitle(route))}</strong>
            </div>
            <span class="header-spacer"></span>
            <a class="notification-link" href="#/announcements" aria-label="${plural(unread, "unread announcement")}">
              ${icon("bell", 18)}
              ${unread ? `<small>${unread}</small>` : ""}
            </a>
            <div class="header-profile">
              <span class="avatar" aria-hidden="true">AM</span>
              <span>Alex Morgan</span>
            </div>
          </header>
          <main id="main-content" class="page">
            ${content}
          </main>
        </section>
      </div>
    `;
  }

  function loginView(error = "") {
    document.title = "Sign In | Lake Forest Learning";
    APP_ROOT.innerHTML = `
      <main class="login-page" id="main-content">
        <section class="login-story" aria-label="Lake Forest Academy learning community">
          <img src="../images/academics-seminar.jpg" alt="Students learning together in a classroom" />
          <span class="login-overlay"></span>
          <div class="login-story-content">
            <img class="login-logo" src="../images/lake-forest-academy-logo-light.png" alt="Lake Forest Academy" />
            <div class="login-story-copy">
              <p class="eyebrow light">Lake Forest Learning</p>
              <h1>Your Courses.<br />Your Next Step.</h1>
              <p>Access OSSD lessons, submit assignments, review feedback and keep your learning on track from one clear workspace.</p>
            </div>
            <p class="login-location">North York · Ontario · Canada</p>
          </div>
        </section>
        <section class="login-panel">
          <div class="login-panel-inner">
            <img class="login-mobile-logo" src="../images/lake-forest-academy-logo.png" alt="Lake Forest Academy" />
            <p class="eyebrow">Student Portal</p>
            <h1>Welcome Back</h1>
            <p class="login-intro">Sign in with your Lake Forest Academy student account.</p>
            <form id="login-form" novalidate>
              <label for="email">School Email</label>
              <input id="email" name="email" type="email" autocomplete="username" value="${DEMO_EMAIL}" required />
              <div class="password-label">
                <label for="password">Password</label>
                <span>Demo access</span>
              </div>
              <input id="password" name="password" type="password" autocomplete="current-password" value="${DEMO_PASSWORD}" required />
              ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
              <button class="button button-primary login-submit" type="submit">Sign In ${icon("arrow", 17)}</button>
            </form>
            <p class="login-help"><strong>Demo Account</strong>${DEMO_EMAIL}<br />Password: ${DEMO_PASSWORD}</p>
          </div>
        </section>
      </main>
    `;
  }

  function pageHeading(eyebrow, title, copy, action = "") {
    return `
      <header class="page-heading">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          ${copy ? `<p>${copy}</p>` : ""}
        </div>
        ${action}
      </header>
    `;
  }

  function dashboardView() {
    const progress = overallProgress();
    const unread = ANNOUNCEMENTS.filter((item) => !state.read.includes(item.id)).length;
    const average = Math.round(
      GRADES.reduce((total, grade) => total + grade.current, 0) / GRADES.length,
    );
    const pending = ASSIGNMENTS.filter((item) =>
      ["due", "overdue"].includes(assignmentStatus(item).key),
    );
    const firstIncomplete = allLessons().find((lesson) => !state.completed.includes(lesson.id));
    const nextLessonCopy = firstIncomplete
      ? `Continue with ${escapeHtml(firstIncomplete.title)} when you are ready.`
      : "Every available lesson is complete. Review your progress and returned feedback.";
    const nextLessonAction = firstIncomplete
      ? `<a class="button button-gold" href="#/lesson/${firstIncomplete.id}">Continue Learning ${icon("arrow", 17)}</a>`
      : `<a class="button button-gold" href="#/progress">Review Progress ${icon("arrow", 17)}</a>`;
    return `
      <section class="welcome">
        <div class="welcome-copy">
          <p class="eyebrow light">${todayLabel()}</p>
          <h1>Good Evening, Alex.</h1>
          <p>You have made a steady start this week. ${nextLessonCopy}</p>
          ${nextLessonAction}
        </div>
        <img class="welcome-emblem" src="../images/lake-forest-academy-logo-light.png" alt="" />
      </section>
      <section class="metric-grid" aria-label="Learning summary">
        <div class="metric"><span class="metric-icon">${icon("book")}</span><span><strong>${COURSES.length}</strong><span>Active Courses</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("check")}</span><span><strong>${progress}%</strong><span>Overall Progress</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("award")}</span><span><strong>${average}%</strong><span>Current Average</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("bell")}</span><span><strong>${unread}</strong><span>Unread Notices</span></span></div>
      </section>
      <section class="dashboard-grid">
        <div class="panel">
          <header class="panel-header">
            <div><h2>My Courses</h2><p>Your current OSSD course progress</p></div>
            <a class="text-link" href="#/courses">View All ${icon("arrow", 16)}</a>
          </header>
          ${COURSES.map(courseRow).join("")}
        </div>
        <div class="panel">
          <header class="panel-header">
            <div><h2>Coming Up</h2><p>${plural(pending.length, "item")} requiring attention</p></div>
          </header>
          ${
            pending.length
              ? pending
                  .slice(0, 3)
                  .map((assignment) => {
                    const course = findCourse(assignment.courseId);
                    const status = assignmentStatus(assignment);
                    return `
                      <a class="task-row" href="#/assignment/${assignment.id}">
                        <span class="task-dot ${status.key === "overdue" ? "overdue" : ""}"></span>
                        <span><h3>${escapeHtml(assignment.title)}</h3><p>${course.code} · Due ${formatDate(assignment.due)}</p></span>
                        <span class="badge ${status.className}">${status.label}</span>
                      </a>
                    `;
                  })
                  .join("")
              : '<div class="empty-state"><p>You are all caught up.</p></div>'
          }
        </div>
        <div class="panel">
          <header class="panel-header">
            <div><h2>Latest Announcements</h2><p>Updates from faculty and student services</p></div>
            <a class="text-link" href="#/announcements">View All ${icon("arrow", 16)}</a>
          </header>
          ${ANNOUNCEMENTS.slice(0, 3)
            .map(
              (item) => `
                <a class="announcement-row ${state.read.includes(item.id) ? "" : "unread"}" href="#/announcements">
                  <span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.author)} · ${formatDate(item.date)}</p></span>
                  <span class="badge">${escapeHtml(item.category)}</span>
                </a>
              `,
            )
            .join("")}
        </div>
        <div class="panel">
          <header class="panel-header"><div><h2>Current Grades</h2><p>Most recent course standing</p></div></header>
          ${GRADES.map((grade) => {
            const course = findCourse(grade.courseId);
            return `
              <div class="grade-row">
                <span><h3>${course.code} · ${escapeHtml(course.title)}</h3><p>${grade.completed} evaluated activities</p></span>
                <strong class="grade-score">${grade.current}%</strong>
                <span class="badge ${grade.current >= grade.target ? "success" : "warning"}">Target ${grade.target}%</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function courseRow(course) {
    const progress = courseProgress(course);
    return `
      <a class="course-row" href="#/course/${course.id}">
        <span class="course-chip">${course.code}</span>
        <span><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.instructor)} · ${progress.completed}/${course.lessons.length} lessons</p></span>
        <span class="progress-track" aria-label="${progress.percent}% complete"><span style="width:${progress.percent}%"></span></span>
        ${icon("arrow", 18)}
      </a>
    `;
  }

  function coursesView() {
    return `
      ${pageHeading(
        "2026 Summer Term",
        "My Courses",
        "Open a course to review its outline, work through lessons and see your current progress.",
      )}
      <section class="course-grid">
        ${COURSES.map((course) => {
          const progress = courseProgress(course);
          return `
            <a class="course-card" href="#/course/${course.id}">
              <div class="course-image">
                <img src="${course.image}" alt="" />
                <span class="badge">${course.subject}</span>
              </div>
              <div class="course-card-content">
                <p class="course-code">${course.code}</p>
                <h2>${escapeHtml(course.title)}</h2>
                <p>${escapeHtml(course.description)}</p>
                <div class="course-meta">
                  <span>${escapeHtml(course.instructor)}</span>
                  <span>${escapeHtml(course.schedule)}</span>
                </div>
                <div class="course-progress">
                  <div><span>${progress.completed} of ${course.lessons.length} lessons</span><strong>${progress.percent}%</strong></div>
                  <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
                </div>
              </div>
            </a>
          `;
        }).join("")}
      </section>
    `;
  }

  function courseView(course) {
    const progress = courseProgress(course);
    const modules = [...new Set(course.lessons.map((lesson) => lesson.unit))];
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="courses">My Courses</button><span>/</span><span>${course.code}</span>
      </nav>
      <section class="course-hero">
        <div class="course-hero-copy">
          <p class="eyebrow light">${course.subject} · ${course.code}</p>
          <h1>${escapeHtml(course.title)}</h1>
          <p>${escapeHtml(course.overview)}</p>
          <div class="course-progress">
            <div><span>${progress.completed} of ${course.lessons.length} lessons complete</span><strong>${progress.percent}%</strong></div>
            <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
          </div>
        </div>
        <div class="course-hero-image"><img src="${course.image}" alt="" /></div>
      </section>
      <section class="course-detail-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>Course Lessons</h2><p>Work through each unit at your own pace</p></div></header>
          ${modules
            .map((unit) => {
              const lessons = course.lessons.filter((lesson) => lesson.unit === unit);
              return `
                <section class="module">
                  <header class="module-heading">
                    <p class="course-code">${unit}</p>
                    <h3>${escapeHtml(lessons[0].unitTitle)}</h3>
                    <p>${plural(lessons.length, "lesson")} in this unit</p>
                  </header>
                  ${lessons
                    .map((lesson) => {
                      const complete = state.completed.includes(lesson.id);
                      return `
                        <a class="lesson-row" href="#/lesson/${lesson.id}">
                          <span class="lesson-status ${complete ? "complete" : ""}">${complete ? icon("check", 14) : ""}</span>
                          <span><h4>${escapeHtml(lesson.title)}</h4><p>${escapeHtml(lesson.summary)}</p></span>
                          <span class="badge">${icon("clock", 13)} ${lesson.duration}</span>
                          ${icon("arrow", 17)}
                        </a>
                      `;
                    })
                    .join("")}
                </section>
              `;
            })
            .join("")}
        </div>
        <aside>
          <div class="panel">
            <header class="panel-header"><h3>Course Details</h3></header>
            <div class="panel-content course-facts">
              <div class="fact"><span>Instructor</span><strong>${escapeHtml(course.instructor)}</strong></div>
              <div class="fact"><span>Term</span><strong>${escapeHtml(course.term)}</strong></div>
              <div class="fact"><span>Live Sessions</span><strong>${escapeHtml(course.schedule)}</strong></div>
              <div class="fact"><span>OSSD Course Type</span><strong>Grade 12 · University</strong></div>
            </div>
          </div>
        </aside>
      </section>
    `;
  }

  function lessonView(lesson) {
    const complete = state.completed.includes(lesson.id);
    const courseLessons = lesson.course.lessons;
    const index = courseLessons.findIndex((item) => item.id === lesson.id);
    const previous = courseLessons[index - 1];
    const next = courseLessons[index + 1];
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="courses">My Courses</button><span>/</span>
        <button type="button" data-route="course/${lesson.course.id}">${lesson.course.code}</button><span>/</span>
        <span>${lesson.unit}</span>
      </nav>
      <section class="lesson-layout">
        <article class="panel lesson-article">
          <header class="lesson-title">
            <p class="course-code">${lesson.course.code} · ${lesson.unit}</p>
            <h1>${escapeHtml(lesson.title)}</h1>
            <p>${escapeHtml(lesson.summary)}</p>
          </header>
          <section class="lesson-section">
            <h2>Learning Goals</h2>
            <ul class="objective-list">
              ${lesson.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join("")}
            </ul>
          </section>
          <section class="lesson-section">
            <h2>Lesson Notes</h2>
            ${lesson.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </section>
          <section class="lesson-section">
            <h2>Before You Move On</h2>
            <ol class="instruction-list">
              <li>Write one idea from this lesson in your own words.</li>
              <li>Complete the related practice in your course notebook.</li>
              <li>Mark the lesson complete when you are confident with the learning goals.</li>
            </ol>
          </section>
        </article>
        <aside>
          <div class="panel">
            <header class="panel-header"><h3>Lesson Progress</h3></header>
            <div class="panel-content lesson-actions">
              <span class="badge ${complete ? "success" : "warning"}">${complete ? "Completed" : "In Progress"}</span>
              <p>${icon("clock", 15)} Estimated time: ${lesson.duration}</p>
              <button class="button ${complete ? "button-quiet" : "button-primary"}" type="button" data-action="toggle-lesson" data-id="${lesson.id}">
                ${complete ? "Mark as Incomplete" : `${icon("check", 17)} Mark Complete`}
              </button>
              ${previous ? `<a class="button button-quiet" href="#/lesson/${previous.id}">Previous Lesson</a>` : ""}
              ${next ? `<a class="button button-secondary" href="#/lesson/${next.id}">Next Lesson ${icon("arrow", 16)}</a>` : `<a class="button button-secondary" href="#/course/${lesson.course.id}">Back to Course</a>`}
            </div>
          </div>
        </aside>
      </section>
    `;
  }

  function assignmentsView() {
    const visible = ASSIGNMENTS.filter((assignment) => {
      const key = assignmentStatus(assignment).key;
      if (assignmentFilter === "all") return true;
      if (assignmentFilter === "open") return ["due", "upcoming", "overdue"].includes(key);
      return key === assignmentFilter;
    });
    const filters = [
      ["all", "All"],
      ["open", "Open"],
      ["submitted", "Submitted"],
      ["graded", "Graded"],
    ];
    return `
      ${pageHeading(
        "Coursework",
        "Assignments",
        "Review due dates, submit your work and return to instructor feedback.",
      )}
      <div class="assignment-filters" role="group" aria-label="Filter assignments">
        ${filters
          .map(
            ([key, label]) =>
              `<button class="filter-button ${assignmentFilter === key ? "is-active" : ""}" type="button" data-action="filter-assignment" data-filter="${key}" aria-pressed="${assignmentFilter === key}">${label}</button>`,
          )
          .join("")}
      </div>
      <section class="assignment-list">
        ${
          visible.length
            ? visible
                .map((assignment) => {
                  const course = findCourse(assignment.courseId);
                  const status = assignmentStatus(assignment);
                  return `
                    <a class="assignment-card" href="#/assignment/${assignment.id}">
                      <span class="task-dot ${status.key === "overdue" ? "overdue" : ""}"></span>
                      <span>
                        <p class="course-code">${course.code} · ${course.title}</p>
                        <h2>${escapeHtml(assignment.title)}</h2>
                        <p>${formatDate(assignment.due, true)} · ${assignment.points} points</p>
                      </span>
                      <span class="badge ${status.className}">${status.label}</span>
                      ${icon("arrow", 18)}
                    </a>
                  `;
                })
                .join("")
            : '<div class="empty-state"><p>No assignments match this filter.</p></div>'
        }
      </section>
    `;
  }

  function assignmentView(assignment) {
    const course = findCourse(assignment.courseId);
    const status = assignmentStatus(assignment);
    const submission = state.submissions[assignment.id];
    const showSubmissionForm =
      !submission || replacingSubmissionId === assignment.id;
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="assignments">Assignments</button><span>/</span><span>${course.code}</span>
      </nav>
      <section class="assignment-detail">
        <article class="panel assignment-summary">
          <div class="panel-content">
            <p class="course-code">${course.code} · ${course.title}</p>
            <h1>${escapeHtml(assignment.title)}</h1>
            <span class="badge ${status.className}">${status.label}</span>
            <section class="lesson-section">
              <h2>Assignment Brief</h2>
              <p>${escapeHtml(assignment.instructions)}</p>
            </section>
            ${
              assignment.feedback
                ? `<section class="lesson-section"><h2>Instructor Feedback</h2><p>${escapeHtml(assignment.feedback)}</p></section>`
                : ""
            }
          </div>
        </article>
        <aside>
          <div class="panel">
            <header class="panel-header"><h3>${submission ? "Your Submission" : "Submit Your Work"}</h3></header>
            <div class="panel-content">
              <div class="course-facts">
                <div class="fact"><span>Due</span><strong>${formatDate(assignment.due, true)}</strong></div>
                <div class="fact"><span>Value</span><strong>${assignment.points} Points</strong></div>
              </div>
              ${
                !showSubmissionForm
                  ? `
                    <div class="submission-note">
                      <strong>Submitted ${formatDate(submission.submittedAt, true)}</strong><br />
                      ${submission.fileName ? `File: ${escapeHtml(submission.fileName)}<br />` : ""}
                      ${submission.text ? escapeHtml(submission.text) : "No note was included."}
                    </div>
                    ${
                      assignment.score == null
                        ? `<button class="button button-quiet" type="button" data-action="replace-submission" data-id="${assignment.id}">Replace Submission</button>`
                        : ""
                    }
                  `
                  : `
                    <form class="assignment-form" id="assignment-form" data-id="${assignment.id}">
                      <label for="submission-note">Submission Note</label>
                      <textarea id="submission-note" name="note" placeholder="Add a short note for your instructor…">${escapeHtml(submission?.text || "")}</textarea>
                      <label for="submission-file">Attach a File</label>
                      <input id="submission-file" name="file" type="file" />
                      <p class="login-help">
                        For this public preview, the file name is saved in this browser; the file itself is not uploaded.
                        ${submission?.fileName ? `<br />Current file: ${escapeHtml(submission.fileName)}` : ""}
                      </p>
                      <button class="button button-primary" type="submit">${icon("file", 17)} ${submission ? "Save Replacement" : "Submit Assignment"}</button>
                      ${submission ? `<button class="button button-quiet" type="button" data-action="cancel-replacement">Keep Existing Submission</button>` : ""}
                    </form>
                  `
              }
            </div>
          </div>
        </aside>
      </section>
    `;
  }

  function progressView() {
    const average = Math.round(
      GRADES.reduce((total, grade) => total + grade.current, 0) / GRADES.length,
    );
    const graded = ASSIGNMENTS.filter((assignment) => assignment.score != null);
    return `
      ${pageHeading(
        "Academic Record",
        "Progress & Grades",
        "A current view of lesson completion and evaluated course work.",
      )}
      <section class="progress-summary">
        <div class="progress-stat"><p class="course-code">Overall Progress</p><strong>${overallProgress()}%</strong><span>${state.completed.length} of ${allLessons().length} lessons complete</span></div>
        <div class="progress-stat"><p class="course-code">Current Average</p><strong>${average}%</strong><span>Across ${COURSES.length} active courses</span></div>
        <div class="progress-stat"><p class="course-code">Evaluated Work</p><strong>${graded.length}</strong><span>Published assignment grade</span></div>
      </section>
      <section class="panel">
        <header class="panel-header"><div><h2>Course Standing</h2><p>Updated as evaluated work is returned</p></div></header>
        ${GRADES.map((grade) => {
          const course = findCourse(grade.courseId);
          const progress = courseProgress(course);
          return `
            <a class="grade-row" href="#/course/${course.id}">
              <span>
                <h3>${course.code} · ${escapeHtml(course.title)}</h3>
                <p>${progress.completed}/${course.lessons.length} lessons · Instructor: ${escapeHtml(course.instructor)}</p>
              </span>
              <strong class="grade-score">${grade.current}%</strong>
              <span class="badge ${grade.current >= grade.target ? "success" : "warning"}">Target ${grade.target}%</span>
            </a>
          `;
        }).join("")}
      </section>
      <section class="panel" style="margin-top:23px">
        <header class="panel-header"><div><h2>Returned Work</h2><p>Published feedback and scores</p></div></header>
        ${graded
          .map((assignment) => {
            const course = findCourse(assignment.courseId);
            return `
              <a class="grade-row" href="#/assignment/${assignment.id}">
                <span><h3>${escapeHtml(assignment.title)}</h3><p>${course.code} · ${formatDate(assignment.due)}</p></span>
                <strong class="grade-score">${assignment.score}%</strong>
                <span>${icon("arrow", 18)}</span>
              </a>
            `;
          })
          .join("")}
      </section>
    `;
  }

  function announcementsView() {
    const unread = ANNOUNCEMENTS.filter((item) => !state.read.includes(item.id)).length;
    return `
      ${pageHeading(
        "School Updates",
        "Announcements",
        "Messages from your teachers, the Academic Office and Student Services.",
        unread
          ? '<button class="button button-secondary" type="button" data-action="read-all">Mark All as Read</button>'
          : "",
      )}
      <section class="announcement-list">
        ${ANNOUNCEMENTS.map((item) => {
          const read = state.read.includes(item.id);
          return `
            <article class="announcement-card ${read ? "" : "unread"}">
              <div>
                <p class="course-code">${escapeHtml(item.category)}</p>
                <h2>${escapeHtml(item.title)}</h2>
                <p>${escapeHtml(item.body)}</p>
                <div class="announcement-meta"><span>${escapeHtml(item.author)}</span><span>${formatDate(item.date)}</span></div>
              </div>
              ${
                read
                  ? '<span class="badge success">Read</span>'
                  : `<button class="button button-quiet" type="button" data-action="read-announcement" data-id="${item.id}">Mark as Read</button>`
              }
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function notFoundView() {
    return `
      <div class="empty-state">
        <div><h1>Page Not Found</h1><p>The learning page you requested is unavailable.</p><a class="button button-primary" href="#/dashboard">Return to Dashboard</a></div>
      </div>
    `;
  }

  function focusMain() {
    const main = document.querySelector("#main-content");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus();
    }
  }

  function render(shouldFocusMain = false) {
    if (!isSignedIn()) {
      loginView();
      return;
    }
    const route = routeParts();
    document.title = `${pageTitle(route)} | Lake Forest Learning`;
    let view;
    if (route[0] === "dashboard") view = dashboardView();
    else if (route[0] === "courses") view = coursesView();
    else if (route[0] === "course") {
      const course = findCourse(route[1]);
      view = course ? courseView(course) : notFoundView();
    } else if (route[0] === "lesson") {
      const lesson = findLesson(route[1]);
      view = lesson ? lessonView(lesson) : notFoundView();
    } else if (route[0] === "assignments") view = assignmentsView();
    else if (route[0] === "assignment") {
      const assignment = findAssignment(route[1]);
      view = assignment ? assignmentView(assignment) : notFoundView();
    } else if (route[0] === "progress") view = progressView();
    else if (route[0] === "announcements") view = announcementsView();
    else view = notFoundView();
    APP_ROOT.innerHTML = shell(view);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (shouldFocusMain) focusMain();
  }

  function navigate(route) {
    window.location.hash = `#/${route}`;
  }

  function showToast(message) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.remove(), 3200);
  }

  document.addEventListener("submit", (event) => {
    if (event.target.id === "login-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = String(form.get("email") || "").trim().toLowerCase();
      const password = String(form.get("password") || "");
      if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        loginView("The email or password does not match the demo account.");
        document.querySelector("#email")?.focus();
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "signed-in");
      if (!window.location.hash) window.location.hash = "#/dashboard";
      render(true);
      showToast("Welcome back, Alex.");
      return;
    }

    if (event.target.id === "assignment-form") {
      event.preventDefault();
      const id = event.target.dataset.id;
      const form = new FormData(event.target);
      const file = form.get("file");
      const existing = state.submissions[id];
      const text = String(form.get("note") || "").trim();
      const newFileName = file instanceof File && file.name ? file.name : "";
      const fileName = newFileName || existing?.fileName || "";
      if (!text && !fileName) {
        showToast("Add a submission note or choose a file before submitting.");
        document.querySelector("#submission-note")?.focus();
        return;
      }
      state.submissions[id] = {
        text,
        fileName,
        submittedAt: new Date().toISOString(),
      };
      replacingSubmissionId = null;
      saveState();
      render(true);
      showToast("Assignment submitted. Your local preview has been updated.");
    }
  });

  document.addEventListener("click", (event) => {
    const skipLink = event.target.closest(".skip-link");
    if (skipLink) {
      event.preventDefault();
      const main = document.querySelector("#main-content");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus();
      }
      return;
    }

    if (event.target.closest(".sidebar-nav a")) {
      const sidebar = document.querySelector("#sidebar");
      const wasOpen = sidebar?.classList.contains("is-open");
      sidebar?.classList.remove("is-open");
      const scrim = document.querySelector(".sidebar-scrim");
      if (scrim) scrim.hidden = true;
      document.querySelector(".mobile-menu")?.setAttribute("aria-expanded", "false");
      if (wasOpen) focusMain();
    }

    const target = event.target.closest("[data-action], [data-route]");
    if (!target) return;

    if (target.dataset.route) {
      navigate(target.dataset.route);
      return;
    }

    const action = target.dataset.action;
    if (action === "open-menu") {
      document.querySelector("#sidebar")?.classList.add("is-open");
      const scrim = document.querySelector(".sidebar-scrim");
      if (scrim) scrim.hidden = false;
      target.setAttribute("aria-expanded", "true");
      document.querySelector(".sidebar-close")?.focus();
    } else if (action === "close-menu") {
      document.querySelector("#sidebar")?.classList.remove("is-open");
      const scrim = document.querySelector(".sidebar-scrim");
      if (scrim) scrim.hidden = true;
      const menuButton = document.querySelector(".mobile-menu");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.focus();
    } else if (action === "logout") {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.hash = "";
      loginView();
    } else if (action === "toggle-lesson") {
      const id = target.dataset.id;
      if (state.completed.includes(id)) {
        state.completed = state.completed.filter((item) => item !== id);
      } else {
        state.completed.push(id);
      }
      saveState();
      render();
      document.querySelector('[data-action="toggle-lesson"]')?.focus();
      showToast(state.completed.includes(id) ? "Lesson marked complete." : "Lesson returned to in progress.");
    } else if (action === "filter-assignment") {
      assignmentFilter = target.dataset.filter || "all";
      render();
      document.querySelector(`[data-filter="${assignmentFilter}"]`)?.focus();
    } else if (action === "replace-submission") {
      replacingSubmissionId = target.dataset.id;
      render();
      document.querySelector("#submission-note")?.focus();
    } else if (action === "cancel-replacement") {
      replacingSubmissionId = null;
      render();
      document.querySelector('[data-action="replace-submission"]')?.focus();
    } else if (action === "read-announcement") {
      if (!state.read.includes(target.dataset.id)) state.read.push(target.dataset.id);
      saveState();
      render(true);
    } else if (action === "read-all") {
      state.read = ANNOUNCEMENTS.map((item) => item.id);
      saveState();
      render(true);
      showToast("All announcements marked as read.");
    }
  });

  document.addEventListener("keydown", (event) => {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      document.querySelector('[data-action="close-menu"]')?.click();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [
      ...sidebar.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])',
      ),
    ].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("hashchange", () => render(true));
  render();
})();
