(() => {
  "use strict";

  const APP_ROOT = document.querySelector("#app");
  const STATE_KEY = "lake-forest-learning-state-v1";
  const SESSION_KEY = "lake-forest-learning-session-v1";
  const ACCOUNTS_KEY = "lake-forest-learning-accounts-v1";
  const REGISTERED_ACCOUNT_KEY = "lake-forest-learning-registration-v1";
  const WORKSPACE_LOGOUT_SUPPRESS_KEY =
    "lake-forest-learning-workspace-signed-out-v1";
  const FILE_DATABASE_NAME = "lake-forest-learning-files-v1";
  const FILE_STORE_NAME = "submission-files";
  const ACCESS_EMAIL = "student@example.invalid";
  const ACCESS_PASSWORD = null;
  const TEACHER_EMAIL = "james.whitmore@example.invalid";
  const TEACHER_PASSWORD = null;
  const AUTH_CONFIG = {
    googleWorkspaceAuthStart: String(
      window.LFA_AUTH_CONFIG?.googleWorkspaceAuthStart || "",
    ).trim(),
    workspaceSessionEndpoint: String(
      window.LFA_AUTH_CONFIG?.workspaceSessionEndpoint || "",
    ).trim(),
    workspaceLogoutEndpoint: String(
      window.LFA_AUTH_CONFIG?.workspaceLogoutEndpoint || "",
    ).trim(),
  };
  const WORKSPACE_GMAIL_URL =
    "https://mail.google.com/a/lakeforestacademy.ca";
  const SCHOOL_ACCOUNT = {
    firstName: "Alex",
    lastName: "Morgan",
    displayName: "Alex Morgan",
    email: ACCESS_EMAIL,
    accountType: "school",
    role: "student",
    program: "OSSD · Grade 12",
  };
  const TEACHER_ACCOUNT = {
    firstName: "James",
    lastName: "Whitmore",
    displayName: "James Whitmore",
    email: TEACHER_EMAIL,
    accountType: "faculty",
    role: "teacher",
    program: "Faculty · All Courses",
  };

  const COURSES = [
    {
      id: "mhf4u",
      code: "MHF4U",
      title: "Advanced Functions",
      subject: "Mathematics",
      instructor: "James Whitmore",
      instructorEmail: "james.whitmore@example.invalid",
      term: "Summer 2026",
      schedule: "Mon, Wed & Fri · 9:00 AM",
      mode: "Teacher-paced",
      startDate: "2026-07-06",
      completionDate: "2026-08-21",
      weeklyHours: "15–17 hours",
      credit: "1.0 OSSD credit",
      prerequisite: "MCR3U or MCF3M",
      responseTime: "Within one school day",
      evaluation: [
        { label: "Course Work", weight: 70 },
        { label: "Culminating Investigation", weight: 15 },
        { label: "Final Examination", weight: 15 },
      ],
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
      instructorEmail: "amelia.hart@lakeforestacademy.ca",
      term: "Summer 2026",
      schedule: "Tue & Thu · 10:15 AM",
      mode: "Teacher-paced",
      startDate: "2026-07-06",
      completionDate: "2026-08-21",
      weeklyHours: "15–17 hours",
      credit: "1.0 OSSD credit",
      prerequisite: "SBI3U",
      responseTime: "Within one school day",
      evaluation: [
        { label: "Course Work & Laboratories", weight: 70 },
        { label: "Culminating Research Task", weight: 15 },
        { label: "Final Examination", weight: 15 },
      ],
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
      instructorEmail: "eleanor.bennett@lakeforestacademy.ca",
      term: "Summer 2026",
      schedule: "Mon & Thu · 1:30 PM",
      mode: "Teacher-paced",
      startDate: "2026-07-06",
      completionDate: "2026-08-21",
      weeklyHours: "15–17 hours",
      credit: "1.0 OSSD credit",
      prerequisite: "ENG3U",
      responseTime: "Within one school day",
      evaluation: [
        { label: "Course Work & Seminars", weight: 70 },
        { label: "Culminating Portfolio", weight: 20 },
        { label: "Final Oral Conference", weight: 10 },
      ],
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
      unit: "Unit 2",
      unitTitle: "Polynomial and Rational Functions",
      title: "Quadratic Models Investigation",
      due: "2026-07-22T23:59:00-04:00",
      availableUntil: "2026-07-24T23:59:00-04:00",
      points: 100,
      status: "due",
      rubric: [
        { label: "Mathematical Reasoning", points: 35 },
        { label: "Model & Evidence", points: 30 },
        { label: "Communication", points: 25 },
        { label: "Reflection", points: 10 },
      ],
      instructions:
        "Choose a real-world situation that can be represented by a quadratic function. Develop a model, explain the meaning of its key features and test the model against at least three data points. Submit a concise report with a graph and a reflection on the model’s limitations.",
    },
    {
      id: "a2",
      courseId: "sbi4u",
      unit: "Unit 2",
      unitTitle: "Metabolic Processes",
      title: "Cellular Respiration Lab Analysis",
      due: "2026-07-18T23:59:00-04:00",
      availableUntil: "2026-07-20T23:59:00-04:00",
      points: 80,
      status: "submitted",
      rubric: [
        { label: "Data Analysis", points: 30 },
        { label: "Biological Reasoning", points: 25 },
        { label: "Graph & Conventions", points: 15 },
        { label: "Conclusion", points: 10 },
      ],
      instructions:
        "Analyze the class respiration dataset. Present one well-labelled graph, identify the overall pattern and discuss two sources of uncertainty. Your conclusion should connect the evidence to enzyme activity and ATP production.",
    },
    {
      id: "a3",
      courseId: "eng4u",
      unit: "Unit 2",
      unitTitle: "Academic Writing",
      title: "Comparative Literary Essay",
      due: "2026-07-15T23:59:00-04:00",
      availableUntil: "2026-07-17T23:59:00-04:00",
      points: 100,
      status: "graded",
      score: 92,
      feedback:
        "A thoughtful, well-structured comparison. Your close reading is strongest in the second section. For the final essay, make the transition between the two central claims more explicit.",
      rubric: [
        { label: "Thesis & Interpretation", points: 30 },
        { label: "Evidence & Analysis", points: 35 },
        { label: "Organization", points: 20 },
        { label: "Style & Documentation", points: 15 },
      ],
      instructions:
        "Write a 1,200–1,500 word comparative essay that develops one focused interpretation across two course texts. Integrate primary evidence, use MLA documentation and include a Works Cited page.",
    },
    {
      id: "a4",
      courseId: "mhf4u",
      unit: "Unit 4",
      unitTitle: "Trigonometric Functions",
      title: "Trigonometric Proof Portfolio",
      due: "2026-07-29T23:59:00-04:00",
      availableUntil: "2026-07-31T23:59:00-04:00",
      points: 60,
      status: "upcoming",
      rubric: [
        { label: "Proof Accuracy", points: 30 },
        { label: "Strategy Annotations", points: 18 },
        { label: "Reflection", points: 12 },
      ],
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

  const COURSE_GUIDE_STEPS = [
    { id: "overview", label: "Review the course overview and credit requirements" },
    { id: "evaluation", label: "Read the evaluation plan and submission policy" },
    { id: "schedule", label: "Add live sessions and completion dates to your plan" },
    { id: "technology", label: "Confirm your browser, file and video-call setup" },
    { id: "support", label: "Save your teacher and Student Support contacts" },
  ];

  const CALENDAR_EVENTS = [
    {
      id: "cal-mhf-1",
      courseId: "mhf4u",
      date: "2026-07-20",
      time: "9:00 AM",
      title: "Advanced Functions Live Lesson",
      type: "Live Class",
      route: "course/mhf4u",
    },
    {
      id: "cal-eng-1",
      courseId: "eng4u",
      date: "2026-07-20",
      time: "1:30 PM",
      title: "English Seminar",
      type: "Live Class",
      route: "course/eng4u",
    },
    {
      id: "cal-sbi-1",
      courseId: "sbi4u",
      date: "2026-07-21",
      time: "10:15 AM",
      title: "Biology Data Workshop",
      type: "Live Class",
      route: "course/sbi4u",
    },
    {
      id: "cal-guidance",
      date: "2026-07-21",
      time: "2:30 PM",
      title: "University Planning Drop-In",
      type: "Student Support",
      route: "support",
    },
    {
      id: "cal-mhf-2",
      courseId: "mhf4u",
      date: "2026-07-22",
      time: "9:00 AM",
      title: "Advanced Functions Problem Lab",
      type: "Live Class",
      route: "course/mhf4u",
    },
    {
      id: "cal-sbi-2",
      courseId: "sbi4u",
      date: "2026-07-23",
      time: "10:15 AM",
      title: "Biology Tutorial",
      type: "Live Class",
      route: "course/sbi4u",
    },
    {
      id: "cal-eng-2",
      courseId: "eng4u",
      date: "2026-07-23",
      time: "1:30 PM",
      title: "Comparative Essay Conference",
      type: "Live Class",
      route: "course/eng4u",
    },
    {
      id: "cal-mhf-3",
      courseId: "mhf4u",
      date: "2026-07-24",
      time: "9:00 AM",
      title: "Advanced Functions Review",
      type: "Live Class",
      route: "course/mhf4u",
    },
  ];

  const SUPPORT_CONTACTS = [
    {
      id: "guidance",
      name: "Vivienne Chow",
      role: "Guidance Counsellor",
      email: "vivienne.chow@lakeforestacademy.ca",
      hours: "Monday–Friday · 9:00 AM–4:00 PM",
      description:
        "OSSD planning, university pathways, course selection and academic check-ins.",
      action: "Email Vivienne",
    },
    {
      id: "academic",
      name: "Academic Office",
      role: "Course & Assessment Support",
      email: "academics@lakeforestacademy.ca",
      hours: "Monday–Friday · 8:30 AM–4:30 PM",
      description:
        "Course access, assessment policy, extensions and official academic records.",
      action: "Contact Academic Office",
    },
    {
      id: "technology",
      name: "Learning Technology",
      role: "Technical Support",
      email: "support@lakeforestacademy.ca",
      hours: "Monday–Friday · 8:00 AM–6:00 PM",
      description:
        "Sign-in, browser, file submission and live-class technical support.",
      action: "Request Technical Help",
    },
    {
      id: "writing",
      name: "Learning Commons",
      role: "Writing & Research Support",
      email: "learningcommons@lakeforestacademy.ca",
      hours: "Tuesday–Thursday · 11:00 AM–5:00 PM",
      description:
        "Research planning, citation guidance and feedback on a work-in-progress.",
      action: "Ask the Learning Commons",
    },
  ];

  const DEFAULT_STATE = {
    completed: ["mhf-1", "sbi-1", "eng-1", "eng-2"],
    guideChecks: {
      mhf4u: ["overview", "evaluation"],
      sbi4u: ["overview"],
      eng4u: ["overview", "evaluation", "schedule", "technology", "support"],
    },
    read: ["ann-4"],
    feedbackRead: [],
    submissions: {
      a2: {
        text: "Lab analysis submitted with graph and uncertainty notes.",
        fileName: "respiration-lab-analysis.pdf",
        submittedAt: "2026-07-18T18:42:00",
        receiptId: "LFA-SBI4U-260718-1842",
        status: "review",
        history: [
          {
            fileName: "respiration-lab-analysis.pdf",
            submittedAt: "2026-07-18T18:42:00",
            receiptId: "LFA-SBI4U-260718-1842",
          },
        ],
      },
      a3: {
        text: "Final comparative essay.",
        fileName: "comparative-literary-essay.pdf",
        submittedAt: "2026-07-15T20:11:00",
        receiptId: "LFA-ENG4U-260715-2011",
        status: "graded",
        history: [
          {
            fileName: "comparative-literary-essay.pdf",
            submittedAt: "2026-07-15T20:11:00",
            receiptId: "LFA-ENG4U-260715-2011",
          },
        ],
      },
    },
  };

  const NEW_ACCOUNT_STATE = {
    completed: [],
    guideChecks: {
      mhf4u: [],
      sbi4u: [],
      eng4u: [],
    },
    read: [],
    feedbackRead: [],
    submissions: {},
  };

  let state = loadState();
  let assignmentFilter = "all";
  let replacingSubmissionId = null;
  let toastTimer = null;
  let signInNotice = "";
  let signInPrefill = "";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function loadAccounts() {
    try {
      const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      return Object.fromEntries(
        Object.entries(saved).filter(
          ([email, account]) =>
            normalizeEmail(email) === email &&
            account &&
            typeof account === "object" &&
            typeof account.firstName === "string" &&
            typeof account.lastName === "string" &&
            typeof account.passwordHash === "string" &&
            typeof account.salt === "string",
        ),
      );
    } catch {
      return {};
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function registeredAccount(email) {
    return loadAccounts()[normalizeEmail(email)] || null;
  }

  function readSession() {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved === "signed-in") return { email: ACCESS_EMAIL };
    try {
      const session = JSON.parse(saved);
      return session && typeof session.email === "string"
        ? { email: normalizeEmail(session.email) }
        : null;
    } catch {
      return null;
    }
  }

  function currentUser() {
    const session = readSession();
    if (!session) return null;
    if (session.email === ACCESS_EMAIL) return SCHOOL_ACCOUNT;
    if (session.email === TEACHER_EMAIL) return TEACHER_ACCOUNT;
    const account = registeredAccount(session.email);
    if (!account) return null;
    return {
      ...account,
      displayName: `${account.firstName} ${account.lastName}`.trim(),
      accountType: "personal",
      role: "student",
      program: "OSSD · Grade 12",
    };
  }

  function startSession(account) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email: normalizeEmail(account.email) }),
    );
  }

  function stateStorageKey(user = currentUser()) {
    if (!user || user.email === ACCESS_EMAIL) return STATE_KEY;
    return `${STATE_KEY}:${encodeURIComponent(normalizeEmail(user.email))}`;
  }

  function initialStateForUser(user = currentUser()) {
    return structuredCopy(
      user && user.email !== ACCESS_EMAIL ? NEW_ACCOUNT_STATE : DEFAULT_STATE,
    );
  }

  function hasSeededAcademicRecord(user = currentUser()) {
    return user?.email === ACCESS_EMAIL;
  }

  function isTeacher(user = currentUser()) {
    return user?.role === "teacher";
  }

  function userInitials(user = currentUser()) {
    const parts = [user?.firstName, user?.lastName].filter(Boolean);
    return (
      parts
        .map((part) => String(part).trim().charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "LF"
    );
  }

  function loadState(user = currentUser()) {
    const initialState = initialStateForUser(user);
    try {
      const saved = JSON.parse(localStorage.getItem(stateStorageKey(user)));
      if (!saved || typeof saved !== "object") {
        return initialState;
      }
      const lessonIds = new Set(
        COURSES.flatMap((course) => course.lessons.map((lesson) => lesson.id)),
      );
      const announcementIds = new Set(ANNOUNCEMENTS.map((item) => item.id));
      const courseIds = new Set(COURSES.map((course) => course.id));
      const guideStepIds = new Set(COURSE_GUIDE_STEPS.map((step) => step.id));
      const feedbackIds = new Set(
        ASSIGNMENTS.filter((assignment) =>
          assignmentFeedback(assignment, user),
        ).map(
          (assignment) => assignment.id,
        ),
      );
      const savedSubmissions =
        saved.submissions && typeof saved.submissions === "object"
          ? saved.submissions
          : structuredCopy(initialState.submissions);
      const submissions = Object.fromEntries(
        Object.entries(savedSubmissions).map(([id, submission]) => {
          const assignment = findAssignment(id);
          const submittedAt = submission.submittedAt || new Date().toISOString();
          const receiptId =
            submission.receiptId || receiptIdFor(id, submittedAt);
          const history =
            Array.isArray(submission.history) && submission.history.length
              ? submission.history
              : [
                  {
                    fileName: submission.fileName || "",
                    submittedAt,
                    receiptId,
                    fileReceiptId: submission.fileReceiptId || "",
                    fileSize: submission.fileSize || 0,
                    fileType: submission.fileType || "",
                  },
                ];
          return [
            id,
            {
              ...submission,
              submittedAt,
              receiptId,
              status:
                submission.status ||
                (assignment && assignmentScore(assignment, user) != null
                  ? "graded"
                  : assignment?.status === "submitted"
                    ? "review"
                    : "submitted"),
              history,
            },
          ];
        }),
      );
      const guideChecks = structuredCopy(initialState.guideChecks);
      if (saved.guideChecks && typeof saved.guideChecks === "object") {
        Object.entries(saved.guideChecks).forEach(([courseId, checks]) => {
          if (!courseIds.has(courseId) || !Array.isArray(checks)) return;
          guideChecks[courseId] = [
            ...new Set(checks.filter((id) => guideStepIds.has(id))),
          ];
        });
      }
      return {
        completed: Array.isArray(saved.completed)
          ? [...new Set(saved.completed.filter((id) => lessonIds.has(id)))]
          : [...initialState.completed],
        guideChecks,
        read: Array.isArray(saved.read)
          ? [...new Set(saved.read.filter((id) => announcementIds.has(id)))]
          : [...initialState.read],
        feedbackRead: Array.isArray(saved.feedbackRead)
          ? [...new Set(saved.feedbackRead.filter((id) => feedbackIds.has(id)))]
          : [...initialState.feedbackRead],
        submissions,
      };
    } catch {
      return initialState;
    }
  }

  function structuredCopy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function receiptIdFor(assignmentId, submittedAt) {
    const assignment = findAssignment(assignmentId);
    const course = assignment ? findCourse(assignment.courseId) : null;
    const compactDate = new Date(submittedAt)
      .toISOString()
      .replace(/\D/g, "")
      .slice(2, 14);
    return `LFA-${course?.code || "COURSE"}-${compactDate}`;
  }

  function saveState() {
    localStorage.setItem(stateStorageKey(), JSON.stringify(state));
  }

  function isSignedIn() {
    return Boolean(currentUser());
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizeEmail(value));
  }

  function isValidName(value) {
    const name = String(value || "").trim();
    return (
      name.length >= 1 &&
      name.length <= 50 &&
      /^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(name)
    );
  }

  function passwordChecks(password, email = "") {
    const value = String(password || "");
    const emailName = normalizeEmail(email).split("@")[0];
    return [
      {
        id: "length",
        label: "12–128 characters",
        met: value.length >= 12 && value.length <= 128,
      },
      {
        id: "uppercase",
        label: "One uppercase letter",
        met: /[A-Z]/.test(value),
      },
      {
        id: "lowercase",
        label: "One lowercase letter",
        met: /[a-z]/.test(value),
      },
      { id: "number", label: "One number", met: /\d/.test(value) },
      {
        id: "symbol",
        label: "One symbol",
        met: /[^A-Za-z0-9\s]/.test(value),
      },
      {
        id: "personal",
        label: "Does not contain your email name",
        met:
          !value ||
          emailName.length < 3 ||
          !value.toLowerCase().includes(emailName.toLowerCase()),
      },
    ];
  }

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = window.atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function createPasswordSalt() {
    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);
    return bytesToBase64(salt);
  }

  async function derivePasswordHash(password, salt) {
    if (!window.crypto?.subtle) {
      throw new Error("Secure password storage is unavailable in this browser.");
    }
    const key = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: base64ToBytes(salt),
        iterations: 120000,
      },
      key,
      256,
    );
    return bytesToBase64(new Uint8Array(bits));
  }

  async function verifyRegisteredPassword(account, password) {
    if (!account?.salt || !account?.passwordHash) return false;
    const candidate = await derivePasswordHash(password, account.salt);
    return candidate === account.passwordHash;
  }

  function openFileDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("Local file storage is unavailable."));
        return;
      }
      const request = window.indexedDB.open(FILE_DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(FILE_STORE_NAME)) {
          database.createObjectStore(FILE_STORE_NAME, {
            keyPath: "receiptId",
          });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("Could not open local file storage."));
    });
  }

  async function storeSubmissionFile(record) {
    const database = await openFileDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(FILE_STORE_NAME, "readwrite");
      transaction.objectStore(FILE_STORE_NAME).put(record);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(
          transaction.error || new Error("Could not save the submission file."),
        );
      };
    });
  }

  async function getSubmissionFile(receiptId) {
    const database = await openFileDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(FILE_STORE_NAME, "readonly");
      const request = transaction.objectStore(FILE_STORE_NAME).get(receiptId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(request.error || new Error("Could not retrieve the file."));
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    });
  }

  function allStudentAccounts() {
    const personalAccounts = Object.values(loadAccounts()).map((account) => ({
      ...account,
      displayName: `${account.firstName} ${account.lastName}`.trim(),
      accountType: "personal",
      role: "student",
      program: "OSSD · Grade 12",
    }));
    return [SCHOOL_ACCOUNT, ...personalAccounts].sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }

  function teacherSubmissionRecords() {
    const records = [];
    allStudentAccounts().forEach((student) => {
      const studentState = loadState(student);
      Object.entries(studentState.submissions || {}).forEach(
        ([assignmentId, submission]) => {
          const assignment = findAssignment(assignmentId);
          if (!assignment) return;
          const course = findCourse(assignment.courseId);
          const history = Array.isArray(submission.history)
            ? submission.history
            : [];
          records.push({
            id: `${student.email}:${assignmentId}`,
            student,
            course,
            assignment,
            submission,
            history,
            versionCount: Math.max(history.length, 1),
            latestFileReceiptId:
              submission.fileReceiptId ||
              history.at(-1)?.fileReceiptId ||
              submission.receiptId,
          });
        },
      );
    });
    return records.sort(
      (a, b) =>
        new Date(b.submission.submittedAt) -
        new Date(a.submission.submittedAt),
    );
  }

  function teacherSubmissionStatus(record) {
    if (record.submission.status === "graded") {
      return { label: "Returned", className: "success" };
    }
    if (record.submission.status === "revision") {
      return { label: "Revision Requested", className: "warning" };
    }
    return { label: "Awaiting Review", className: "info" };
  }

  function formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return "Size unavailable";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function configuredAuthUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      const localDevelopment =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname);
      return url.protocol === "https:" || localDevelopment ? url : null;
    } catch {
      return null;
    }
  }

  function googleWorkspaceAuthUrl() {
    const url = configuredAuthUrl(AUTH_CONFIG.googleWorkspaceAuthStart);
    if (!url) return "";
    const returnTo = new URL(window.location.href);
    returnTo.search = "";
    returnTo.hash = "#/teacher/dashboard";
    url.searchParams.set("returnTo", returnTo.toString());
    url.searchParams.set("portal", "faculty");
    return url.toString();
  }

  async function restoreWorkspaceSession() {
    if (
      readSession() ||
      sessionStorage.getItem(WORKSPACE_LOGOUT_SUPPRESS_KEY) === "1"
    ) {
      return false;
    }
    const endpoint = configuredAuthUrl(AUTH_CONFIG.workspaceSessionEndpoint);
    if (!endpoint) return false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(endpoint, {
        credentials: "include",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) return false;
      const session = await response.json();
      const validTeacher =
        session?.authenticated === true &&
        session?.role === "teacher" &&
        normalizeEmail(session?.email) === TEACHER_EMAIL;
      if (!validTeacher) return false;
      sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
      startSession(TEACHER_ACCOUNT);
      state = loadState(TEACHER_ACCOUNT);
      return true;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function closeWorkspaceSession() {
    const endpoint = configuredAuthUrl(AUTH_CONFIG.workspaceLogoutEndpoint);
    if (!endpoint) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
        keepalive: true,
        signal: controller.signal,
      });
    } catch {
      // Local sign-out still completes when the optional Workspace backend is offline.
    } finally {
      window.clearTimeout(timeout);
    }
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

  function guideProgress(course) {
    const checked = state.guideChecks?.[course.id] || [];
    return {
      checked,
      completed: checked.length,
      total: COURSE_GUIDE_STEPS.length,
      percent: Math.round((checked.length / COURSE_GUIDE_STEPS.length) * 100),
      isComplete: checked.length === COURSE_GUIDE_STEPS.length,
    };
  }

  function courseGrade(courseId, user = currentUser()) {
    if (!hasSeededAcademicRecord(user)) return null;
    return GRADES.find((grade) => grade.courseId === courseId);
  }

  function assignmentScore(assignment, user = currentUser()) {
    return hasSeededAcademicRecord(user) ? assignment.score : null;
  }

  function assignmentFeedback(assignment, user = currentUser()) {
    return hasSeededAcademicRecord(user) ? assignment.feedback : "";
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Toronto",
    }).format(new Date(value));
  }

  function calendarEvents() {
    const dueDates = ASSIGNMENTS.map((assignment) => {
      const course = findCourse(assignment.courseId);
      return {
        id: `due-${assignment.id}`,
        courseId: assignment.courseId,
        date: assignment.due.slice(0, 10),
        time: formatTime(assignment.due),
        title: assignment.title,
        type: "Assignment Due",
        route: `assignment/${assignment.id}`,
        sortTime: assignment.due,
        courseCode: course.code,
      };
    });
    return [...CALENDAR_EVENTS, ...dueDates]
      .map((event) => ({
        ...event,
        sortTime:
          event.sortTime ||
          `${event.date}T${event.time === "9:00 AM" ? "09:00" : "12:00"}:00-04:00`,
        courseCode:
          event.courseCode ||
          (event.courseId ? findCourse(event.courseId)?.code : "LFA"),
      }))
      .sort((a, b) => new Date(a.sortTime) - new Date(b.sortTime));
  }

  function unreadFeedback() {
    return ASSIGNMENTS.filter(
      (assignment) =>
        assignmentFeedback(assignment) &&
        !state.feedbackRead.includes(assignment.id),
    );
  }

  function smartActions() {
    const actions = [];
    ASSIGNMENTS.forEach((assignment) => {
      const status = assignmentStatus(assignment);
      if (!["overdue", "late", "due"].includes(status.key)) return;
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `assignment-${assignment.id}`,
        priority: status.key === "overdue" ? 0 : status.key === "late" ? 1 : 2,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · ${status.label}`,
        title: assignment.title,
        meta: `Due ${formatDate(assignment.due, true)}`,
        className: status.key === "overdue" ? "danger" : "warning",
      });
    });
    unreadFeedback().forEach((assignment) => {
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `feedback-${assignment.id}`,
        priority: 2,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · New Feedback`,
        title: assignment.title,
        meta: `${assignmentScore(assignment)}% · Review instructor comments`,
        className: "success",
      });
    });
    COURSES.forEach((course) => {
      const guide = guideProgress(course);
      if (guide.isComplete) return;
      actions.push({
        id: `guide-${course.id}`,
        priority: 3,
        route: `guide/${course.id}`,
        eyebrow: `${course.code} · Start Here`,
        title: "Complete the Course Guide",
        meta: `${guide.completed} of ${guide.total} steps reviewed`,
        className: "info",
      });
    });
    COURSES.forEach((course) => {
      const lesson = course.lessons.find(
        (item) => !state.completed.includes(item.id),
      );
      if (!lesson) return;
      actions.push({
        id: `lesson-${lesson.id}`,
        priority: 4,
        route: `lesson/${lesson.id}`,
        eyebrow: `${course.code} · Continue Learning`,
        title: lesson.title,
        meta: `${lesson.unit} · ${lesson.duration}`,
        className: "",
      });
    });
    return actions.sort((a, b) => a.priority - b.priority);
  }

  function assignmentStatus(assignment) {
    const score = assignmentScore(assignment);
    if (score != null) {
      return { key: "graded", label: `Graded · ${score}%`, className: "success" };
    }
    const submission = state.submissions[assignment.id];
    if (submission?.status === "revision") {
      return {
        key: "revision",
        label: "Revision Requested",
        className: "warning",
      };
    }
    if (submission?.status === "review") {
      return { key: "review", label: "Under Review", className: "info" };
    }
    if (submission) {
      return { key: "submitted", label: "Submitted", className: "info" };
    }
    const overdue = new Date(assignment.due) < new Date();
    if (overdue) {
      if (
        assignment.availableUntil &&
        new Date(assignment.availableUntil) >= new Date()
      ) {
        return {
          key: "late",
          label: "Late · Still Open",
          className: "warning",
        };
      }
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
    if (section === "guide") return `${findCourse(id)?.title || "Course"} Guide`;
    if (section === "lesson") return findLesson(id)?.title || "Lesson";
    if (section === "assignment") return findAssignment(id)?.title || "Assignment";
    return {
      dashboard: "Student Dashboard",
      courses: "My Courses",
      calendar: "Calendar",
      assignments: "Assignments",
      progress: "Progress & Grades",
      announcements: "Announcements",
      support: "Student Support",
    }[section] || "Page Not Found";
  }

  function activeSection(route) {
    if (
      route[0] === "course" ||
      route[0] === "guide" ||
      route[0] === "lesson"
    ) {
      return "courses";
    }
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
    const user = currentUser() || SCHOOL_ACCOUNT;
    const initials = userInitials(user);
    const unread = ANNOUNCEMENTS.filter((item) => !state.read.includes(item.id)).length;
    const pending = ASSIGNMENTS.filter((item) =>
      ["due", "late", "overdue", "revision"].includes(
        assignmentStatus(item).key,
      ),
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
            ${navLink("calendar", "Calendar", "calendar")}
            ${navLink("assignments", "Assignments", "clipboard", pending)}
            ${navLink("progress", "Progress & Grades", "chart")}
            ${navLink("announcements", "Announcements", "bell", unread)}
            ${navLink("support", "Student Support", "award")}
          </nav>
          <div class="sidebar-student">
            <span class="avatar" aria-hidden="true">${escapeHtml(initials)}</span>
            <span><strong>${escapeHtml(user.displayName)}</strong><span>${escapeHtml(user.program)}</span></span>
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
              <span class="avatar" aria-hidden="true">${escapeHtml(initials)}</span>
              <span>${escapeHtml(user.displayName)}</span>
            </div>
          </header>
          <main id="main-content" class="page">
            ${content}
          </main>
        </section>
      </div>
    `;
  }

  function teacherPageTitle(route) {
    if (route[1] === "course") {
      return findCourse(route[2])?.title || "Course Submissions";
    }
    if (route[1] === "submission") return "Submission Details";
    return {
      dashboard: "Faculty Dashboard",
      submissions: "Submission Centre",
    }[route[1]] || "Faculty Dashboard";
  }

  function teacherNavLink(section, label, iconName, count = 0) {
    const route = routeParts();
    const active =
      route[0] === "teacher" &&
      (route[1] === section ||
        (section === "submissions" && route[1] === "submission"));
    return `
      <a href="#/teacher/${section}" class="${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : ""}>
        <span class="nav-icon">${icon(iconName, 19)}</span>
        <span>${label}</span>
        ${count ? `<small>${count}</small>` : ""}
      </a>
    `;
  }

  function teacherShell(content) {
    const route = routeParts();
    const user = currentUser() || TEACHER_ACCOUNT;
    const records = teacherSubmissionRecords();
    const awaitingReview = records.filter(
      (record) => record.submission.status !== "graded",
    ).length;
    const courseMenuOpen = route[1] === "course";
    return `
      <div class="app-shell">
        <aside class="sidebar faculty-sidebar" id="sidebar" aria-label="Faculty navigation">
          <button class="sidebar-close" type="button" data-action="close-menu" aria-label="Close menu">${icon("close")}</button>
          <div class="sidebar-brand">
            <img src="../images/lake-forest-academy-logo-light.png" alt="Lake Forest Academy" />
            <p>Faculty Learning</p>
          </div>
          <nav class="sidebar-nav">
            ${teacherNavLink("dashboard", "Dashboard", "home")}
            ${teacherNavLink("submissions", "Submission Centre", "clipboard", awaitingReview)}
            <details class="faculty-course-menu" ${courseMenuOpen ? "open" : ""}>
              <summary>
                <span class="nav-icon">${icon("book", 19)}</span>
                <span>Courses</span>
              </summary>
              <div>
                ${COURSES.map((course) => {
                  const active =
                    route[1] === "course" && route[2] === course.id;
                  return `<a class="faculty-course-link ${active ? "is-active" : ""}" href="#/teacher/course/${course.id}" ${active ? 'aria-current="page"' : ""}><strong>${course.code}</strong><span>${course.title}</span></a>`;
                }).join("")}
              </div>
            </details>
            <a href="${WORKSPACE_GMAIL_URL}" target="_blank" rel="noopener noreferrer">
              <span class="nav-icon">${icon("file", 19)}</span>
              <span>Workspace Gmail</span>
            </a>
          </nav>
          <div class="sidebar-student">
            <span class="avatar teacher-avatar" aria-hidden="true">${escapeHtml(userInitials(user))}</span>
            <span><strong>${escapeHtml(user.displayName)}</strong><span>Faculty · All Courses</span></span>
            <button class="logout-button" type="button" data-action="logout" aria-label="Sign out">${icon("logout")}</button>
          </div>
        </aside>
        <button class="sidebar-scrim" type="button" data-action="close-menu" aria-label="Close menu" hidden></button>
        <section class="stage">
          <header class="app-header">
            <button class="mobile-menu" type="button" data-action="open-menu" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button>
            <div class="header-title">
              <span>Lake Forest Learning</span>
              <strong>${escapeHtml(teacherPageTitle(route))}</strong>
            </div>
            <span class="header-spacer"></span>
            <span class="faculty-badge">Faculty</span>
            <a class="notification-link" href="${WORKSPACE_GMAIL_URL}" target="_blank" rel="noopener noreferrer" aria-label="Open Workspace Gmail">
              ${icon("file", 18)}
            </a>
            <div class="header-profile">
              <span class="avatar teacher-avatar" aria-hidden="true">${escapeHtml(userInitials(user))}</span>
              <span>${escapeHtml(user.displayName)}</span>
            </div>
          </header>
          <main id="main-content" class="page teacher-page">
            ${content}
          </main>
        </section>
      </div>
    `;
  }

  function teacherRecordLink(record) {
    return `#/teacher/submission/${encodeURIComponent(record.student.email)}/${record.assignment.id}`;
  }

  function teacherRecordMarkup(record) {
    const status = teacherSubmissionStatus(record);
    return `
      <article class="teacher-record">
        <a class="teacher-record-main" href="${teacherRecordLink(record)}">
          <span class="teacher-avatar" aria-hidden="true">${escapeHtml(userInitials(record.student))}</span>
          <span>
            <strong>${escapeHtml(record.student.displayName)}</strong>
            <small>${escapeHtml(record.assignment.title)}</small>
          </span>
        </a>
        <div class="teacher-record-meta">
          <span><strong>${escapeHtml(record.course.code)}</strong> · ${escapeHtml(record.assignment.unit)}</span>
          <span>${formatDate(record.submission.submittedAt, true)}</span>
          <span>${escapeHtml(record.submission.fileName || "Submission note only")}</span>
        </div>
        <span class="status ${status.className}">${status.label}</span>
        <a class="button button-quiet" href="${teacherRecordLink(record)}">Review</a>
      </article>
    `;
  }

  function teacherHierarchy(records) {
    if (!records.length) {
      return `
        <div class="teacher-empty">
          ${icon("clipboard", 30)}
          <h3>No Submissions Yet</h3>
          <p>Student work will be organized here by course, student, unit and assignment.</p>
        </div>
      `;
    }
    return `
      <div class="hierarchy-list">
        ${COURSES.map((course) => {
          const courseRecords = records.filter(
            (record) => record.course.id === course.id,
          );
          if (!courseRecords.length) return "";
          const students = [
            ...new Map(
              courseRecords.map((record) => [record.student.email, record.student]),
            ).values(),
          ];
          return `
            <details class="hierarchy-course" open>
              <summary>
                <span><strong>${course.code}</strong>${escapeHtml(course.title)}</span>
                <small>${plural(courseRecords.length, "submission")}</small>
              </summary>
              <div class="hierarchy-list">
                ${students.map((student) => {
                  const studentRecords = courseRecords.filter(
                    (record) => record.student.email === student.email,
                  );
                  const units = [
                    ...new Map(
                      studentRecords.map((record) => [
                        record.assignment.unit,
                        {
                          id: record.assignment.unit,
                          title: record.assignment.unitTitle,
                        },
                      ]),
                    ).values(),
                  ].sort((a, b) => a.id.localeCompare(b.id));
                  return `
                    <details class="hierarchy-student">
                      <summary>
                        <span class="teacher-avatar" aria-hidden="true">${escapeHtml(userInitials(student))}</span>
                        <span><strong>${escapeHtml(student.displayName)}</strong><small>${escapeHtml(student.email)}</small></span>
                        <small>${plural(studentRecords.length, "submission")}</small>
                      </summary>
                      <div class="hierarchy-list">
                        ${units.map((unit) => {
                          const unitRecords = studentRecords.filter(
                            (record) => record.assignment.unit === unit.id,
                          );
                          return `
                            <section class="hierarchy-unit" aria-labelledby="${course.id}-${encodeURIComponent(student.email)}-${unit.id.replace(/\s+/g, "-")}">
                              <header>
                                <span class="course-code">${escapeHtml(unit.id)}</span>
                                <h3 id="${course.id}-${encodeURIComponent(student.email)}-${unit.id.replace(/\s+/g, "-")}">${escapeHtml(unit.title)}</h3>
                              </header>
                              <div>
                                ${unitRecords.map((record) => {
                                  const status = teacherSubmissionStatus(record);
                                  return `
                                    <a class="hierarchy-assignment" href="${teacherRecordLink(record)}">
                                      <span>
                                        <strong>${escapeHtml(record.assignment.title)}</strong>
                                        <small>${formatDate(record.submission.submittedAt, true)} · ${escapeHtml(record.submission.fileName || "Note only")}</small>
                                      </span>
                                      <span class="status ${status.className}">${status.label}</span>
                                      ${icon("arrow", 17)}
                                    </a>
                                  `;
                                }).join("")}
                              </div>
                            </section>
                          `;
                        }).join("")}
                      </div>
                    </details>
                  `;
                }).join("")}
              </div>
            </details>
          `;
        }).join("")}
      </div>
    `;
  }

  function teacherDashboardView() {
    const records = teacherSubmissionRecords();
    const awaitingReview = records.filter(
      (record) => record.submission.status !== "graded",
    ).length;
    const attachedFiles = records.filter(
      (record) => record.submission.fileName,
    ).length;
    return `
      <header class="teacher-hero">
        <div>
          <p class="eyebrow">Faculty Portal</p>
          <h1>Welcome Back, James</h1>
          <p>Review student progress and find submitted work across every OSSD course from one organized workspace.</p>
        </div>
        <a class="button button-gold" href="#/teacher/submissions">Open Submission Centre ${icon("arrow", 17)}</a>
      </header>
      <section class="teacher-metrics" aria-label="Faculty overview">
        <article class="teacher-metric"><span>${icon("book", 22)}</span><strong>${COURSES.length}</strong><p>Active Courses</p></article>
        <article class="teacher-metric"><span>${icon("award", 22)}</span><strong>${allStudentAccounts().length}</strong><p>Students</p></article>
        <article class="teacher-metric"><span>${icon("clipboard", 22)}</span><strong>${awaitingReview}</strong><p>Awaiting Review</p></article>
        <article class="teacher-metric"><span>${icon("file", 22)}</span><strong>${attachedFiles}</strong><p>Files Submitted</p></article>
      </section>
      <section class="teacher-section">
        <div class="section-heading"><div><p class="eyebrow">Course Overview</p><h2>Assigned Courses</h2></div></div>
        <div class="teacher-course-grid">
          ${COURSES.map((course) => {
            const courseRecords = records.filter(
              (record) => record.course.id === course.id,
            );
            const pending = courseRecords.filter(
              (record) => record.submission.status !== "graded",
            ).length;
            return `
              <a class="teacher-course-card" href="#/teacher/course/${course.id}">
                <span class="course-code">${course.code}</span>
                <h3>${escapeHtml(course.title)}</h3>
                <p>${escapeHtml(course.subject)} · ${escapeHtml(course.term)}</p>
                <dl>
                  <div><dt>Submissions</dt><dd>${courseRecords.length}</dd></div>
                  <div><dt>Awaiting Review</dt><dd>${pending}</dd></div>
                </dl>
                <span class="text-link">Open Course ${icon("arrow", 16)}</span>
              </a>
            `;
          }).join("")}
        </div>
      </section>
      <section class="teacher-section">
        <div class="section-heading">
          <div><p class="eyebrow">Latest Activity</p><h2>Recent Submissions</h2></div>
          <a class="text-link" href="#/teacher/submissions">View All ${icon("arrow", 15)}</a>
        </div>
        <div class="teacher-records">
          ${records.length ? records.slice(0, 5).map(teacherRecordMarkup).join("") : teacherHierarchy([])}
        </div>
      </section>
    `;
  }

  function teacherSubmissionsView(courseId = "") {
    const course = courseId ? findCourse(courseId) : null;
    const records = teacherSubmissionRecords().filter(
      (record) => !course || record.course.id === course.id,
    );
    const title = course
      ? `${course.code} · ${course.title}`
      : "All Student Submissions";
    return `
      ${pageHeading(
        course ? course.subject : "Submission Centre",
        title,
        course
          ? `Browse ${course.term} work by student, unit and assignment.`
          : "Every uploaded assignment is organized by course, student, unit and assignment.",
        course
          ? '<a class="button button-secondary" href="#/teacher/submissions">View All Courses</a>'
          : "",
      )}
      <section class="teacher-section">
        <div class="section-heading">
          <div><p class="eyebrow">${course ? "Course Files" : "Faculty Records"}</p><h2>${plural(records.length, "Submission")}</h2></div>
        </div>
        ${teacherHierarchy(records)}
      </section>
    `;
  }

  function teacherSubmissionDetailView(studentEmail, assignmentId) {
    const record = teacherSubmissionRecords().find(
      (item) =>
        normalizeEmail(item.student.email) === normalizeEmail(studentEmail) &&
        item.assignment.id === assignmentId,
    );
    if (!record) {
      return `
        <div class="teacher-empty">
          ${icon("file", 30)}
          <h1>Submission Not Found</h1>
          <p>This record is unavailable or no longer belongs to an active student account.</p>
          <a class="button button-primary" href="#/teacher/submissions">Return to Submission Centre</a>
        </div>
      `;
    }
    const status = teacherSubmissionStatus(record);
    const history = record.history.length
      ? [...record.history].reverse()
      : [
          {
            fileName: record.submission.fileName,
            submittedAt: record.submission.submittedAt,
            receiptId: record.submission.receiptId,
            fileReceiptId: record.submission.fileReceiptId,
            fileSize: record.submission.fileSize,
            fileType: record.submission.fileType,
          },
        ];
    return `
      <nav class="teacher-breadcrumbs" aria-label="Breadcrumb">
        <a href="#/teacher/submissions">Submissions</a><span>/</span>
        <a href="#/teacher/course/${record.course.id}">${record.course.code}</a><span>/</span>
        <span>${escapeHtml(record.student.displayName)}</span><span>/</span>
        <span>${escapeHtml(record.assignment.unit)}</span><span>/</span>
        <span aria-current="page">${escapeHtml(record.assignment.title)}</span>
      </nav>
      ${pageHeading(
        `${escapeHtml(record.course.code)} · ${escapeHtml(record.assignment.unit)}`,
        escapeHtml(record.assignment.title),
        `${escapeHtml(record.student.displayName)} · ${escapeHtml(record.student.email)}`,
        `<span class="status ${status.className}">${status.label}</span>`,
      )}
      <section class="teacher-detail-grid">
        <div>
          <article class="teacher-detail-card">
            <p class="eyebrow">Student Submission</p>
            <h2>Submission Note</h2>
            <p>${escapeHtml(record.submission.text || "No written response was included.")}</p>
          </article>
          <article class="teacher-detail-card">
            <div class="section-heading"><div><p class="eyebrow">Files & Versions</p><h2>Submission History</h2></div></div>
            <div class="teacher-records">
              ${history.map((version, index) => {
                const fileReceiptId =
                  version.fileReceiptId ||
                  (index === 0 ? record.submission.fileReceiptId : "");
                const fileName =
                  version.fileName ||
                  (index === 0 ? record.submission.fileName : "") ||
                  "Submission note only";
                return `
                  <article class="submission-file-card">
                    <span>${icon("file", 22)}</span>
                    <div>
                      <strong>${escapeHtml(fileName)}</strong>
                      <p>Version ${history.length - index} · ${formatDate(version.submittedAt, true)}</p>
                      <small>${escapeHtml(version.receiptId || "")}${version.fileSize ? ` · ${formatFileSize(version.fileSize)}` : ""}</small>
                    </div>
                    ${
                      fileReceiptId
                        ? `<button class="button button-secondary" type="button" data-action="download-submission" data-receipt="${escapeHtml(fileReceiptId)}">Download File</button>`
                        : '<span class="file-unavailable">File metadata only</span>'
                    }
                  </article>
                `;
              }).join("")}
            </div>
            <p class="login-help"><strong>File Availability</strong>Files uploaded in this browser can be downloaded here. Earlier sample records display metadata only until central storage is connected.</p>
          </article>
        </div>
        <aside>
          <article class="teacher-detail-card">
            <p class="eyebrow">Record Details</p>
            <h2>${escapeHtml(record.student.displayName)}</h2>
            <dl>
              <div><dt>Email</dt><dd>${escapeHtml(record.student.email)}</dd></div>
              <div><dt>Course</dt><dd>${record.course.code} · ${escapeHtml(record.course.title)}</dd></div>
              <div><dt>Unit</dt><dd>${escapeHtml(record.assignment.unit)} · ${escapeHtml(record.assignment.unitTitle)}</dd></div>
              <div><dt>Submitted</dt><dd>${formatDate(record.submission.submittedAt, true)}</dd></div>
              <div><dt>Receipt</dt><dd>${escapeHtml(record.submission.receiptId)}</dd></div>
              <div><dt>Versions</dt><dd>${record.versionCount}</dd></div>
            </dl>
          </article>
        </aside>
      </section>
    `;
  }

  function authStory() {
    return `
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
    `;
  }

  function authPage(title, content) {
    document.title = `${title} | Lake Forest Learning`;
    APP_ROOT.innerHTML = `
      <main class="login-page" id="main-content">
        ${authStory()}
        <section class="login-panel">
          <div class="login-panel-inner">
            <img class="login-mobile-logo" src="../images/lake-forest-academy-logo.png" alt="Lake Forest Academy" />
            ${content}
          </div>
        </section>
      </main>
    `;
  }

  function passwordInput(id, label, autocomplete, describedBy = "") {
    return `
      <div class="password-label">
        <label for="${id}">${label}</label>
        <span>${id === "password" ? "Secure access" : "Use the same password"}</span>
      </div>
      <div class="auth-input-wrap">
        <input id="${id}" name="${id}" type="password" autocomplete="${autocomplete}" ${describedBy ? `aria-describedby="${describedBy}"` : ""} required />
        <button class="password-toggle" type="button" data-action="toggle-password" data-target="${id}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">Show</button>
      </div>
    `;
  }

  function loginView({
    error = "",
    email = "",
    notice = "",
    portal = "student",
  } = {}) {
    const facultyPortal = portal === "faculty";
    const savedEmail = facultyPortal
      ? email || TEACHER_EMAIL
      : email || signInPrefill;
    const message = notice || signInNotice;
    const workspaceReady = Boolean(googleWorkspaceAuthUrl());
    const portalSwitcher = `
      <nav class="portal-switcher" aria-label="Choose a sign-in portal">
        <a class="portal-switch-link ${facultyPortal ? "" : "is-active"}" href="#/signin/student" ${facultyPortal ? "" : 'aria-current="page"'}>Student Sign In</a>
        <a class="portal-switch-link ${facultyPortal ? "is-active" : ""}" href="#/signin/faculty" ${facultyPortal ? 'aria-current="page"' : ""}>Faculty Sign In</a>
      </nav>
    `;
    authPage(
      facultyPortal ? "Faculty Sign In" : "Student Sign In",
      `
        ${portalSwitcher}
        <p class="eyebrow">${facultyPortal ? "Faculty Portal" : "Student Portal"}</p>
        <h1>Welcome Back</h1>
        <p class="login-intro">${
          facultyPortal
            ? "James Whitmore can continue with his Lake Forest Academy Google Workspace account or use the assigned faculty credentials."
            : "Sign in with your school account or a personal email account created on this device."
        }</p>
        ${message ? `<p class="form-success" role="status">${escapeHtml(message)}</p>` : ""}
        ${
          facultyPortal
            ? `
              <button class="button workspace-button full-width" type="button" data-action="google-workspace-signin" ${workspaceReady ? "" : 'disabled aria-disabled="true"'}>
                <span class="google-mark" aria-hidden="true">G</span>
                Continue with Google Workspace
              </button>
              <p class="auth-setup-note ${workspaceReady ? "is-ready" : ""}" role="status">
                ${
                  workspaceReady
                    ? "Secure Workspace authorization is connected."
                    : "Workspace authorization will activate after the school OAuth client and backend callback are connected. Use the assigned faculty credentials for now."
                }
              </p>
              <div class="auth-divider"><span>or use faculty credentials</span></div>
            `
            : ""
        }
        <form id="login-form" novalidate>
          <input type="hidden" name="portal" value="${facultyPortal ? "faculty" : "student"}" />
          <label for="email">Email Address</label>
          <input id="email" name="email" type="email" autocomplete="username" value="${escapeHtml(savedEmail)}" required />
          ${passwordInput("password", "Password", "current-password")}
          ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
          <button class="button button-primary login-submit" type="submit">${facultyPortal ? "Faculty Sign In" : "Student Sign In"} ${icon("arrow", 17)}</button>
        </form>
        ${
          facultyPortal
            ? `
              <div class="auth-switch">
                <p><strong>Need your school mailbox?</strong>Open the Google Workspace Gmail page in a new tab.</p>
                <a class="button button-secondary full-width" href="${WORKSPACE_GMAIL_URL}" target="_blank" rel="noopener noreferrer">Open Workspace Gmail</a>
              </div>
              <p class="login-help"><strong>Faculty Access</strong>This entry is currently assigned to James Whitmore. Additional faculty accounts can be added after central authentication is connected.</p>
            `
            : `
              <div class="auth-switch">
                <p><strong>New to Lake Forest Learning?</strong>Create an account with your personal email address.</p>
                <a class="button button-secondary full-width" href="#/register">Create Personal Account</a>
              </div>
              <p class="login-help"><strong>School Account</strong>Students with an assigned Lake Forest Academy email can continue to use their existing credentials.</p>
            `
        }
      `,
    );
  }

  function fieldError(errors, name) {
    return errors[name]
      ? `<p class="field-error" id="${name}-error">${escapeHtml(errors[name])}</p>`
      : "";
  }

  function registrationView(values = {}, errors = {}) {
    const errorMessages = Object.values(errors);
    const errorSummary = errorMessages.length
      ? `
        <div class="error-summary" id="registration-errors" role="alert" tabindex="-1">
          <strong>Please review the following information.</strong>
          <ul>${errorMessages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
        </div>
      `
      : "";
    authPage(
      "Create Account",
      `
        <p class="eyebrow">Personal Email Access</p>
        <h1>Create Your Account</h1>
        <p class="login-intro">Use any personal email address to create a Lake Forest Learning student profile on this device.</p>
        ${errorSummary}
        <form id="registration-form" class="registration-form" novalidate>
          <div class="register-name-grid">
            <div class="auth-field">
              <label for="firstName">First Name</label>
              <input id="firstName" name="firstName" type="text" autocomplete="given-name" value="${escapeHtml(values.firstName || "")}" ${errors.firstName ? 'aria-invalid="true" aria-describedby="firstName-error"' : ""} required />
              ${fieldError(errors, "firstName")}
            </div>
            <div class="auth-field">
              <label for="lastName">Last Name</label>
              <input id="lastName" name="lastName" type="text" autocomplete="family-name" value="${escapeHtml(values.lastName || "")}" ${errors.lastName ? 'aria-invalid="true" aria-describedby="lastName-error"' : ""} required />
              ${fieldError(errors, "lastName")}
            </div>
          </div>
          <div class="auth-field">
            <label for="registerEmail">Personal Email</label>
            <input id="registerEmail" name="email" type="email" autocomplete="email" value="${escapeHtml(values.email || "")}" ${errors.email ? 'aria-invalid="true" aria-describedby="email-error"' : ""} required />
            ${fieldError(errors, "email")}
          </div>
          <div class="auth-field">
            ${passwordInput("newPassword", "Password", "new-password", `password-rules${errors.password ? " password-error" : ""}`)}
            ${fieldError(errors, "password")}
            <ul class="password-rules" id="password-rules" aria-label="Password requirements" aria-live="polite">
              ${passwordChecks("", values.email || "")
                .map(
                  (rule) => `<li data-password-rule="${rule.id}" aria-label="${escapeHtml(rule.label)}: not yet met"><span aria-hidden="true">${icon("check", 12)}</span>${escapeHtml(rule.label)}</li>`,
                )
                .join("")}
            </ul>
          </div>
          <div class="auth-field">
            ${passwordInput("confirmPassword", "Confirm Password", "new-password", errors.confirmPassword ? "confirmPassword-error" : "")}
            ${fieldError(errors, "confirmPassword")}
          </div>
          <label class="consent-row" for="deviceConsent">
            <input id="deviceConsent" name="deviceConsent" type="checkbox" value="yes" ${errors.deviceConsent ? 'aria-invalid="true" aria-describedby="deviceConsent-error"' : ""} />
            <span>I understand this account is currently saved only on this device.</span>
          </label>
          ${fieldError(errors, "deviceConsent")}
          <button class="button button-primary login-submit" type="submit">Create Account ${icon("arrow", 17)}</button>
        </form>
        <p class="auth-privacy-note"><strong>Your privacy matters.</strong>Your name, email and a protected password record stay in this browser. Do not register on a shared or public device.</p>
        <p class="auth-return">Already have an account? <a href="#/signin/student">Return to Student Sign In</a></p>
      `,
    );
  }

  function accountCreatedView() {
    let account = null;
    try {
      account = JSON.parse(sessionStorage.getItem(REGISTERED_ACCOUNT_KEY));
    } catch {
      account = null;
    }
    if (!account?.email) {
      registrationView();
      return;
    }
    authPage(
      "Account Created",
      `
        <div class="account-created">
          <span class="account-created-mark">${icon("check", 28)}</span>
          <p class="eyebrow">Registration Complete</p>
          <h1>Your Account Is Ready</h1>
          <p class="login-intro">Your personal email account has been created for Lake Forest Learning.</p>
          <dl>
            <div><dt>Student</dt><dd>${escapeHtml(account.displayName)}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(account.email)}</dd></div>
            <div><dt>Account Storage</dt><dd>This browser</dd></div>
          </dl>
          <button class="button button-primary full-width" type="button" data-action="continue-to-signin">Continue to Sign In ${icon("arrow", 17)}</button>
          <p class="auth-privacy-note"><strong>Remember:</strong>Use this same browser and device when signing in with this account.</p>
        </div>
      `,
    );
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
    const user = currentUser() || SCHOOL_ACCOUNT;
    const progress = overallProgress();
    const actions = smartActions();
    const primary = actions[0];
    const pending = ASSIGNMENTS.filter((item) =>
      ["due", "late", "overdue", "revision"].includes(
        assignmentStatus(item).key,
      ),
    );
    const feedback = unreadFeedback();
    const weekEvents = calendarEvents().filter(
      (event) => event.date >= "2026-07-20" && event.date <= "2026-07-26",
    );
    const primaryCopy = primary
      ? `${escapeHtml(primary.eyebrow)} is the most important item in your learning plan.`
      : "You are caught up. Review your progress or plan the week ahead.";
    const primaryAction = primary
      ? `<a class="button button-gold" href="#/${primary.route}">Open Next Action ${icon("arrow", 17)}</a>`
      : `<a class="button button-gold" href="#/calendar">Plan Your Week ${icon("arrow", 17)}</a>`;
    return `
      <section class="welcome">
        <div class="welcome-copy">
          <p class="eyebrow light">${todayLabel()}</p>
          <h1>Good Evening, ${escapeHtml(user.firstName)}.</h1>
          <p>${primaryCopy}</p>
          ${primaryAction}
        </div>
        <img class="welcome-emblem" src="../images/lake-forest-academy-logo-light.png" alt="" />
      </section>
      <section class="metric-grid" aria-label="Learning summary">
        <div class="metric"><span class="metric-icon">${icon("book")}</span><span><strong>${COURSES.length}</strong><span>Active Courses</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("check")}</span><span><strong>${progress}%</strong><span>Overall Progress</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("clipboard")}</span><span><strong>${pending.length}</strong><span>Items Needing Attention</span></span></div>
        <div class="metric"><span class="metric-icon">${icon("bell")}</span><span><strong>${feedback.length}</strong><span>New Feedback</span></span></div>
      </section>
      <section class="dashboard-grid">
        <div class="panel dashboard-priority">
          <header class="panel-header">
            <div><h2>Next Actions</h2><p>Ordered by urgency across all courses</p></div>
            <a class="text-link" href="#/calendar">Open Calendar ${icon("arrow", 16)}</a>
          </header>
          ${
            actions.length
              ? actions
                  .slice(0, 5)
                  .map(
                    (action, index) => `
                      <a class="priority-action-row" href="#/${action.route}">
                        <span class="action-rank">${index + 1}</span>
                        <span>
                          <p class="course-code">${escapeHtml(action.eyebrow)}</p>
                          <h3>${escapeHtml(action.title)}</h3>
                          <p>${escapeHtml(action.meta)}</p>
                        </span>
                        <span class="badge ${action.className}">${index === 0 ? "Next" : "Planned"}</span>
                        ${icon("arrow", 18)}
                      </a>
                    `,
                  )
                  .join("")
              : '<div class="empty-state"><p>You are all caught up.</p></div>'
          }
        </div>
        <div class="panel">
          <header class="panel-header">
            <div><h2>This Week</h2><p>Classes, support and due dates</p></div>
            <a class="text-link" href="#/calendar">View All ${icon("arrow", 16)}</a>
          </header>
          ${
            weekEvents.length
              ? weekEvents
                  .slice(0, 5)
                  .map(
                    (event) => `
                      <a class="task-row" href="#/${event.route}">
                        <span class="task-date"><strong>${formatDate(event.date).split(",")[0]}</strong><small>${event.time}</small></span>
                        <span><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.courseCode)} · ${escapeHtml(event.type)}</p></span>
                        ${icon("arrow", 17)}
                      </a>
                    `,
                  )
                  .join("")
              : '<div class="empty-state"><p>You are all caught up.</p></div>'
          }
        </div>
        <div class="panel">
          <header class="panel-header">
            <div><h2>My Courses</h2><p>Progress, pacing and course guides</p></div>
            <a class="text-link" href="#/courses">View All ${icon("arrow", 16)}</a>
          </header>
          ${COURSES.map(courseRow).join("")}
        </div>
        <div class="panel">
          <header class="panel-header"><div><h2>Feedback & Support</h2><p>Returned work and people who can help</p></div></header>
          ${
            feedback.length
              ? feedback
                  .slice(0, 2)
                  .map((assignment) => {
                    const course = findCourse(assignment.courseId);
                    return `
                      <a class="feedback-row" href="#/assignment/${assignment.id}">
                        <span class="feedback-score">${assignmentScore(assignment)}%</span>
                        <span><p class="course-code">${course.code} · New Feedback</p><h3>${escapeHtml(assignment.title)}</h3></span>
                        ${icon("arrow", 18)}
                      </a>
                    `;
                  })
                  .join("")
              : '<div class="empty-state compact"><p>No unread feedback.</p></div>'
          }
          <a class="support-callout" href="#/support">
            <span>${icon("award", 22)}</span>
            <span><strong>Need help?</strong><small>Contact a teacher, counsellor or Learning Technology.</small></span>
            ${icon("arrow", 18)}
          </a>
        </div>
      </section>
    `;
  }

  function courseRow(course) {
    const progress = courseProgress(course);
    const guide = guideProgress(course);
    return `
      <a class="course-row" href="#/course/${course.id}">
        <span class="course-chip">${course.code}</span>
        <span><h3>${escapeHtml(course.title)}</h3><p>${progress.completed}/${course.lessons.length} lessons · ${guide.isComplete ? "Guide complete" : `${guide.completed}/${guide.total} guide steps`}</p></span>
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
                  <span>${escapeHtml(course.mode)} · Ends ${formatDate(course.completionDate)}</span>
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
    const guide = guideProgress(course);
    const grade = courseGrade(course.id);
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
          <div class="course-hero-actions">
            <a class="button button-gold" href="#/guide/${course.id}">${icon("book", 17)} ${guide.isComplete ? "Review Course Guide" : "Start Here · Course Guide"}</a>
            <a class="button button-on-dark" href="#/calendar">${icon("calendar", 17)} View Calendar</a>
          </div>
        </div>
        <div class="course-hero-image"><img src="${course.image}" alt="" /></div>
      </section>
      <section class="course-detail-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>Course Learning Path</h2><p>Follow the unit order and complete each learning check</p></div></header>
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
          <div class="panel guide-status-card">
            <header class="panel-header"><div><h3>Start Here</h3><p>Course Guide</p></div><span class="badge ${guide.isComplete ? "success" : "warning"}">${guide.isComplete ? "Complete" : `${guide.completed}/${guide.total}`}</span></header>
            <div class="panel-content">
              <div class="progress-track" aria-label="${guide.percent}% of course guide complete"><span style="width:${guide.percent}%"></span></div>
              <p>Review expectations, evaluation, dates and support before beginning major assessments.</p>
              <a class="button button-secondary full-width" href="#/guide/${course.id}">${guide.isComplete ? "Review Guide" : "Continue Guide"}</a>
            </div>
          </div>
          <div class="panel">
            <header class="panel-header"><h3>Course Details</h3></header>
            <div class="panel-content course-facts">
              <div class="fact"><span>Instructor</span><strong>${escapeHtml(course.instructor)}</strong></div>
              <div class="fact"><span>Course Mode</span><strong>${escapeHtml(course.mode)}</strong></div>
              <div class="fact"><span>Term</span><strong>${escapeHtml(course.term)}</strong></div>
              <div class="fact"><span>Completion Date</span><strong>${formatDate(course.completionDate)}</strong></div>
              <div class="fact"><span>Weekly Study Plan</span><strong>${escapeHtml(course.weeklyHours)}</strong></div>
              <div class="fact"><span>Live Sessions</span><strong>${escapeHtml(course.schedule)}</strong></div>
              <div class="fact"><span>Current Standing</span><strong>${grade ? `${grade.current}%` : "Not Yet Graded"}</strong></div>
              <div class="fact"><span>OSSD Credit</span><strong>${escapeHtml(course.credit)}</strong></div>
            </div>
          </div>
          <div class="panel instructor-card">
            <header class="panel-header"><div><h3>Your Instructor</h3><p>${escapeHtml(course.responseTime)}</p></div></header>
            <div class="panel-content">
              <span class="instructor-avatar">${course.instructor.split(" ").map((part) => part[0]).slice(-2).join("")}</span>
              <h3>${escapeHtml(course.instructor)}</h3>
              <p>${escapeHtml(course.subject)} · ${course.code}</p>
              <a class="button button-primary full-width" href="mailto:${encodeURIComponent(course.instructorEmail)}">Email Instructor</a>
              <a class="text-link centered" href="#/support">View All Student Support ${icon("arrow", 15)}</a>
            </div>
          </div>
        </aside>
      </section>
    `;
  }

  function courseGuideView(course) {
    const guide = guideProgress(course);
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="courses">My Courses</button><span>/</span>
        <button type="button" data-route="course/${course.id}">${course.code}</button><span>/</span>
        <span>Course Guide</span>
      </nav>
      <section class="guide-hero">
        <div>
          <p class="eyebrow light">${course.code} · Start Here</p>
          <h1>${escapeHtml(course.title)} Course Guide</h1>
          <p>Understand how the course works, what is expected and where to get help before you begin major course work.</p>
        </div>
        <div class="guide-progress-summary">
          <strong>${guide.percent}%</strong>
          <span>${guide.completed} of ${guide.total} guide steps complete</span>
          <div class="progress-track"><span style="width:${guide.percent}%"></span></div>
        </div>
      </section>
      <section class="guide-layout">
        <div class="guide-main">
          <section class="panel">
            <header class="panel-header"><div><h2>Course at a Glance</h2><p>${escapeHtml(course.mode)} · ${escapeHtml(course.credit)}</p></div></header>
            <div class="guide-fact-grid">
              <div class="guide-fact"><span>Start Date</span><strong>${formatDate(course.startDate)}</strong></div>
              <div class="guide-fact"><span>Completion Date</span><strong>${formatDate(course.completionDate)}</strong></div>
              <div class="guide-fact"><span>Weekly Commitment</span><strong>${escapeHtml(course.weeklyHours)}</strong></div>
              <div class="guide-fact"><span>Prerequisite</span><strong>${escapeHtml(course.prerequisite)}</strong></div>
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>How This Course Works</h2><p>A consistent path through every unit</p></div></header>
            <div class="learning-path" aria-label="Course learning sequence">
              ${["Review Learning Goals", "Study Lesson & Resources", "Complete Practice", "Submit Assignment or Quiz", "Use Feedback in the Next Unit"]
                .map(
                  (label, index) => `
                    <div class="path-step"><span>${index + 1}</span><strong>${label}</strong></div>
                  `,
                )
                .join("")}
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>Evaluation Plan</h2><p>Your current standing updates when evaluated work is returned</p></div></header>
            <div class="evaluation-list">
              ${course.evaluation
                .map(
                  (item) => `
                    <div class="evaluation-row">
                      <span>${escapeHtml(item.label)}</span>
                      <strong>${item.weight}%</strong>
                      <div class="progress-track"><span style="width:${item.weight}%"></span></div>
                    </div>
                  `,
                )
                .join("")}
            </div>
            <div class="policy-note">
              <strong>Submission policy</strong>
              <p>Submit work before the due date whenever possible. The assignment page shows both the regular due date and the final availability date. Contact your instructor before the deadline if circumstances affect your work.</p>
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>Technology & Academic Practice</h2><p>Prepare before graded work</p></div></header>
            <div class="guide-copy">
              <p>Use a current desktop browser for file submissions and timed assessments. Keep a copy of each submitted file and confirm that a submission receipt appears before leaving the page.</p>
              <p>All work must reflect your own learning. Sources, tools and collaboration must be acknowledged according to the instructions for each assessment.</p>
            </div>
          </section>
        </div>
        <aside>
          <section class="panel guide-checklist">
            <header class="panel-header"><div><h2>Before You Begin</h2><p>Complete each orientation step</p></div></header>
            <div class="panel-content">
              ${COURSE_GUIDE_STEPS.map((step) => {
                const checked = guide.checked.includes(step.id);
                return `
                  <button class="guide-check ${checked ? "is-complete" : ""}" type="button" data-action="toggle-guide-step" data-course="${course.id}" data-step="${step.id}" aria-pressed="${checked}">
                    <span>${checked ? icon("check", 15) : ""}</span>
                    <strong>${escapeHtml(step.label)}</strong>
                  </button>
                `;
              }).join("")}
              <a class="button ${guide.isComplete ? "button-primary" : "button-quiet"} full-width" href="#/course/${course.id}">
                ${guide.isComplete ? `Open Course ${icon("arrow", 16)}` : "Return to Course"}
              </a>
            </div>
          </section>
          <section class="panel instructor-card">
            <header class="panel-header"><div><h3>Course Contact</h3><p>${escapeHtml(course.responseTime)}</p></div></header>
            <div class="panel-content">
              <span class="instructor-avatar">${course.instructor.split(" ").map((part) => part[0]).slice(-2).join("")}</span>
              <h3>${escapeHtml(course.instructor)}</h3>
              <p>${escapeHtml(course.instructorEmail)}</p>
              <a class="button button-primary full-width" href="mailto:${encodeURIComponent(course.instructorEmail)}">Email Instructor</a>
            </div>
          </section>
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

  function calendarView() {
    const dates = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
    ];
    const events = calendarEvents();
    const deadlineEvents = events.filter(
      (event) => event.type === "Assignment Due",
    );
    return `
      ${pageHeading(
        "Summer Term · July 20–24",
        "Learning Calendar",
        "See live classes, support sessions and assignment deadlines from every course in one place. All times are shown in Eastern Time (ET).",
        `<a class="button button-secondary" href="#/assignments">${icon("clipboard", 17)} View Assignments</a>`,
      )}
      <section class="calendar-summary" aria-label="Week summary">
        <div><strong>${events.filter((event) => dates.includes(event.date) && event.type === "Live Class").length}</strong><span>Live Classes</span></div>
        <div><strong>${deadlineEvents.filter((event) => dates.includes(event.date)).length}</strong><span>Due This Week</span></div>
        <div><strong>${events.filter((event) => dates.includes(event.date) && event.type === "Student Support").length}</strong><span>Support Session</span></div>
        <div><strong>${smartActions().filter((action) => action.priority <= 2).length}</strong><span>Priority Actions</span></div>
      </section>
      <section class="week-calendar" aria-label="Week of July 20, 2026">
        ${dates
          .map((date) => {
            const dayEvents = events.filter((event) => event.date === date);
            const dateObject = new Date(`${date}T12:00:00-04:00`);
            const day = new Intl.DateTimeFormat("en-CA", {
              weekday: "short",
              timeZone: "America/Toronto",
            }).format(dateObject);
            const number = new Intl.DateTimeFormat("en-CA", {
              day: "numeric",
              timeZone: "America/Toronto",
            }).format(dateObject);
            return `
              <section class="calendar-day">
                <header><span>${day}</span><strong>${number}</strong></header>
                <div>
                  ${
                    dayEvents.length
                      ? dayEvents
                          .map(
                            (event) => `
                              <a class="calendar-event ${event.type === "Assignment Due" ? "is-deadline" : event.type === "Student Support" ? "is-support" : ""}" href="#/${event.route}">
                                <span>${escapeHtml(event.time)}</span>
                                <strong>${escapeHtml(event.title)}</strong>
                                <small>${escapeHtml(event.courseCode)} · ${escapeHtml(event.type)}</small>
                              </a>
                            `,
                          )
                          .join("")
                      : '<p class="calendar-empty">No scheduled items</p>'
                  }
                </div>
              </section>
            `;
          })
          .join("")}
      </section>
      <section class="calendar-lower-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>Upcoming Deadlines</h2><p>Due date and final submission window</p></div></header>
          ${ASSIGNMENTS.slice()
            .sort((a, b) => new Date(a.due) - new Date(b.due))
            .map((assignment) => {
              const course = findCourse(assignment.courseId);
              const status = assignmentStatus(assignment);
              return `
                <a class="deadline-row" href="#/assignment/${assignment.id}">
                  <span class="deadline-date"><strong>${formatDate(assignment.due).split(",")[0]}</strong><small>${formatTime(assignment.due)}</small></span>
                  <span><p class="course-code">${course.code}</p><h3>${escapeHtml(assignment.title)}</h3><p>Available until ${formatDate(assignment.availableUntil, true)}</p></span>
                  <span class="badge ${status.className}">${status.label}</span>
                  ${icon("arrow", 17)}
                </a>
              `;
            })
            .join("")}
        </div>
        <aside class="panel weekly-plan">
          <header class="panel-header"><div><h2>Weekly Study Plan</h2><p>Recommended independent study time</p></div></header>
          <div class="panel-content">
            ${COURSES.map((course) => {
              const progress = courseProgress(course);
              return `
                <a class="study-plan-row" href="#/course/${course.id}">
                  <span class="course-chip">${course.code}</span>
                  <span><strong>${escapeHtml(course.weeklyHours)}</strong><small>${progress.percent}% complete · ${formatDate(course.completionDate)} finish</small></span>
                </a>
              `;
            }).join("")}
            <a class="button button-primary full-width" href="#/support">Ask for Planning Help</a>
          </div>
        </aside>
      </section>
    `;
  }

  function supportView() {
    return `
      ${pageHeading(
        "Student Services",
        "Student Support",
        "Connect with the right person for academic planning, course questions, technology and research support.",
      )}
      <section class="support-hero">
        <div>
          <p class="eyebrow light">One Clear Starting Point</p>
          <h2>Tell us what is getting in the way.</h2>
          <p>If you are unsure who to contact, begin with Student Support. We will connect you with the appropriate teacher or service.</p>
        </div>
        <a class="button button-gold" href="mailto:studentservices@lakeforestacademy.ca">Email Student Support ${icon("arrow", 17)}</a>
      </section>
      <section class="support-grid">
        ${SUPPORT_CONTACTS.map(
          (contact) => `
            <article class="support-card">
              <span class="support-monogram">${contact.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}</span>
              <p class="course-code">${escapeHtml(contact.role)}</p>
              <h2>${escapeHtml(contact.name)}</h2>
              <p>${escapeHtml(contact.description)}</p>
              <dl>
                <div><dt>Email</dt><dd>${escapeHtml(contact.email)}</dd></div>
                <div><dt>Hours</dt><dd>${escapeHtml(contact.hours)}</dd></div>
              </dl>
              <a class="button button-secondary full-width" href="mailto:${encodeURIComponent(contact.email)}">${escapeHtml(contact.action)}</a>
            </article>
          `,
        ).join("")}
      </section>
      <section class="support-lower-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>Your Course Team</h2><p>Ask content questions and discuss feedback directly</p></div></header>
          ${COURSES.map(
            (course) => `
              <div class="teacher-row">
                <span class="instructor-avatar">${course.instructor
                  .split(" ")
                  .map((part) => part[0])
                  .slice(-2)
                  .join("")}</span>
                <span><p class="course-code">${course.code} · ${escapeHtml(course.subject)}</p><h3>${escapeHtml(course.instructor)}</h3><p>Expected reply: ${escapeHtml(course.responseTime.toLowerCase())}</p></span>
                <a class="button button-quiet" href="mailto:${encodeURIComponent(course.instructorEmail)}">Email</a>
              </div>
            `,
          ).join("")}
        </div>
        <aside class="panel">
          <header class="panel-header"><div><h2>Before You Send</h2><p>A useful help request includes</p></div></header>
          <ol class="support-checklist">
            <li><span>1</span><p><strong>Course and lesson</strong><br />Include the course code and exact task.</p></li>
            <li><span>2</span><p><strong>What you tried</strong><br />Describe the step where you became stuck.</p></li>
            <li><span>3</span><p><strong>What you need next</strong><br />Ask one clear question or request an appointment.</p></li>
          </ol>
        </aside>
      </section>
      <section class="panel support-faq">
        <header class="panel-header"><div><h2>Common Questions</h2><p>Quick guidance for frequent learning-platform issues</p></div></header>
        <details><summary>I cannot submit an assignment.</summary><p>Check the final availability date, use a current desktop browser and confirm that the selected file is not open in another application. If the problem continues, contact Learning Technology and include the assignment title.</p></details>
        <details><summary>I need more time for course work.</summary><p>Contact your instructor before the deadline and explain the circumstances. For a broader course-plan change, include Vivienne Chow or the Academic Office.</p></details>
        <details><summary>I need an assessment accommodation.</summary><p>Contact Student Support as early as possible. Approved accommodations should be confirmed before a timed assessment or final evaluation is scheduled.</p></details>
      </section>
    `;
  }

  function assignmentsView() {
    const visible = ASSIGNMENTS.filter((assignment) => {
      const key = assignmentStatus(assignment).key;
      if (assignmentFilter === "all") return true;
      if (assignmentFilter === "open") {
        return ["due", "upcoming", "late", "overdue", "revision"].includes(
          key,
        );
      }
      if (assignmentFilter === "submitted") {
        return ["submitted", "review"].includes(key);
      }
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
    const submittedOnTime =
      submission && new Date(submission.submittedAt) <= new Date(assignment.due);
    const score = assignmentScore(assignment);
    const feedback = assignmentFeedback(assignment);
    const lifecycleIndex =
      score != null
        ? 3
        : submission?.status === "review"
          ? 1
          : submission
            ? 0
            : -1;
    const lifecycle = [
      ["Submitted", "Your work and submission receipt are recorded."],
      ["Under Review", "Your instructor is reviewing the submission."],
      ["Feedback Available", "Comments and rubric results are ready."],
      ["Graded", "The published result is included in your course standing."],
    ];
    const feedbackUnread =
      feedback && !state.feedbackRead.includes(assignment.id);
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
            <div class="assignment-date-grid">
              <div><span>Due Date</span><strong>${formatDate(assignment.due, true)}</strong></div>
              <div><span>Available Until</span><strong>${formatDate(assignment.availableUntil, true)}</strong></div>
              <div><span>Value</span><strong>${assignment.points} Points</strong></div>
            </div>
            <section class="lesson-section">
              <h2>Assignment Brief</h2>
              <p>${escapeHtml(assignment.instructions)}</p>
            </section>
            <section class="lesson-section">
              <h2>Assessment Rubric</h2>
              <div class="rubric-list">
                ${assignment.rubric
                  .map(
                    (criterion) => `
                      <div><span>${escapeHtml(criterion.label)}</span><strong>${criterion.points} points</strong></div>
                    `,
                  )
                  .join("")}
              </div>
            </section>
            ${
              feedback
                ? `
                  <section class="lesson-section feedback-panel ${feedbackUnread ? "is-new" : ""}">
                    <div class="feedback-heading">
                      <div><p class="course-code">${feedbackUnread ? "New Feedback" : "Instructor Feedback"}</p><h2>${escapeHtml(course.instructor)}</h2></div>
                      <strong>${score}%</strong>
                    </div>
                    <p>${escapeHtml(feedback)}</p>
                    ${
                      feedbackUnread
                        ? `<button class="button button-quiet" type="button" data-action="mark-feedback-read" data-id="${assignment.id}">Mark Feedback as Reviewed</button>`
                        : '<span class="badge success">Reviewed</span>'
                    }
                  </section>
                `
                : ""
            }
            <section class="lesson-section">
              <h2>Submission Progress</h2>
              <div class="submission-timeline">
                ${lifecycle
                  .map(
                    ([label, copy], index) => `
                      <div class="submission-stage ${index < lifecycleIndex ? "is-complete" : index === lifecycleIndex ? "is-current" : ""}">
                        <span>${index <= lifecycleIndex ? icon("check", 14) : index + 1}</span>
                        <div><strong>${label}</strong><p>${copy}</p></div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </section>
          </div>
        </article>
        <aside>
          <div class="panel">
            <header class="panel-header"><h3>${submission ? "Your Submission" : "Submit Your Work"}</h3></header>
            <div class="panel-content">
              ${
                !showSubmissionForm
                  ? `
                    <div class="receipt-card">
                      <div class="receipt-heading">
                        <span>${icon("check", 18)}</span>
                        <div><p class="course-code">Submission Received</p><h3>${status.label}</h3></div>
                      </div>
                      <dl>
                        <div><dt>Submission ID</dt><dd>${escapeHtml(submission.receiptId)}</dd></div>
                        <div><dt>Submitted</dt><dd>${formatDate(submission.submittedAt, true)}</dd></div>
                        <div><dt>Timing</dt><dd>${submittedOnTime ? "On Time" : "Late"}</dd></div>
                        <div><dt>Version</dt><dd>${submission.history?.length || 1}</dd></div>
                        <div><dt>File</dt><dd>${escapeHtml(submission.fileName || "Submission note only")}</dd></div>
                      </dl>
                      ${
                        submission.text
                          ? `<div class="receipt-note"><strong>Student Note</strong><p>${escapeHtml(submission.text)}</p></div>`
                          : ""
                      }
                    </div>
                    ${
                      score == null
                        ? `<button class="button button-quiet full-width" type="button" data-action="replace-submission" data-id="${assignment.id}">Replace Submission</button>`
                        : ""
                    }
                    <div class="submission-history">
                      <h3>Submission History</h3>
                      ${(submission.history || [])
                        .slice()
                        .reverse()
                        .map(
                          (record, index) => `
                            <div>
                              <span>${submission.history.length - index}</span>
                              <p><strong>Version ${submission.history.length - index}</strong><br />${formatDate(record.submittedAt, true)}<br /><small>${escapeHtml(record.receiptId)}</small></p>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>
                  `
                  : `
                    <form class="assignment-form" id="assignment-form" data-id="${assignment.id}">
                      ${
                        submission
                          ? '<p class="form-notice">Replacing this work creates a new version. Earlier versions remain in the submission history.</p>'
                          : ""
                      }
                      <label for="submission-note">Submission Note</label>
                      <textarea id="submission-note" name="note" placeholder="Add a short note for your instructor…">${escapeHtml(submission?.text || "")}</textarea>
                      <label for="submission-file">Attach a File</label>
                      <input id="submission-file" name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" />
                      ${submission?.fileName ? `<p class="login-help">Current file: ${escapeHtml(submission.fileName)}</p>` : ""}
                      <label class="integrity-check" for="submission-integrity">
                        <input id="submission-integrity" name="integrity" type="checkbox" value="confirmed" />
                        <span>I confirm that this is my own work and that I have credited all sources.</span>
                      </label>
                      <button class="button button-primary" type="submit">${icon("file", 17)} ${submission ? "Submit New Version" : "Submit Assignment"}</button>
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
    const grades = hasSeededAcademicRecord() ? GRADES : [];
    const average = grades.length
      ? Math.round(
          grades.reduce((total, grade) => total + grade.current, 0) /
            grades.length,
        )
      : null;
    const graded = ASSIGNMENTS.filter(
      (assignment) => assignmentScore(assignment) != null,
    );
    return `
      ${pageHeading(
        "Academic Record",
        "Progress & Grades",
        "A current view of lesson completion and evaluated course work.",
      )}
      <section class="progress-summary">
        <div class="progress-stat"><p class="course-code">Overall Progress</p><strong>${overallProgress()}%</strong><span>${state.completed.length} of ${allLessons().length} lessons complete</span></div>
        <div class="progress-stat"><p class="course-code">Current Average</p><strong>${average == null ? "—" : `${average}%`}</strong><span>${average == null ? "No published grades yet" : `Across ${COURSES.length} active courses`}</span></div>
        <div class="progress-stat"><p class="course-code">Evaluated Work</p><strong>${graded.length}</strong><span>${graded.length === 1 ? "Published assignment grade" : "Published assignment grades"}</span></div>
      </section>
      <section class="panel">
        <header class="panel-header"><div><h2>Course Standing</h2><p>Updated as evaluated work is returned</p></div></header>
        ${COURSES.map((course) => {
          const grade = courseGrade(course.id);
          const progress = courseProgress(course);
          return `
            <a class="grade-row" href="#/course/${course.id}">
              <span>
                <h3>${course.code} · ${escapeHtml(course.title)}</h3>
                <p>${progress.completed}/${course.lessons.length} lessons · Instructor: ${escapeHtml(course.instructor)}</p>
              </span>
              <strong class="grade-score">${grade ? `${grade.current}%` : "—"}</strong>
              <span class="badge ${grade ? (grade.current >= grade.target ? "success" : "warning") : ""}">${grade ? `Target ${grade.target}%` : "Not Yet Graded"}</span>
            </a>
          `;
        }).join("")}
      </section>
      <section class="panel" style="margin-top:23px">
        <header class="panel-header"><div><h2>Returned Work</h2><p>Published feedback and scores</p></div></header>
        ${
          graded.length
            ? graded
                .map((assignment) => {
                  const course = findCourse(assignment.courseId);
                  return `
                    <a class="grade-row" href="#/assignment/${assignment.id}">
                      <span><h3>${escapeHtml(assignment.title)}</h3><p>${course.code} · ${formatDate(assignment.due)}</p></span>
                      <strong class="grade-score">${assignmentScore(assignment)}%</strong>
                      <span>${icon("arrow", 18)}</span>
                    </a>
                  `;
                })
                .join("")
            : '<div class="empty-state compact"><p>No grades have been published for this account.</p></div>'
        }
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

  function replaceRoute(route) {
    window.history.replaceState(null, "", `#/${route}`);
  }

  function renderTeacher(route) {
    let teacherRoute = route;
    if (teacherRoute[0] !== "teacher") {
      replaceRoute("teacher/dashboard");
      teacherRoute = ["teacher", "dashboard"];
    }
    document.title = `${teacherPageTitle(teacherRoute)} | Lake Forest Learning`;
    let view;
    if (teacherRoute[1] === "dashboard") {
      view = teacherDashboardView();
    } else if (teacherRoute[1] === "submissions") {
      view = teacherSubmissionsView();
    } else if (teacherRoute[1] === "course") {
      const course = findCourse(teacherRoute[2]);
      view = course
        ? teacherSubmissionsView(course.id)
        : teacherSubmissionsView();
    } else if (teacherRoute[1] === "submission") {
      view = teacherSubmissionDetailView(
        safeDecode(teacherRoute[2] || ""),
        teacherRoute[3] || "",
      );
    } else {
      replaceRoute("teacher/dashboard");
      teacherRoute = ["teacher", "dashboard"];
      view = teacherDashboardView();
    }
    APP_ROOT.innerHTML = teacherShell(view);
  }

  function render(shouldFocusMain = false) {
    if (!isSignedIn()) {
      const authParts = routeParts();
      const authRoute = authParts[0];
      if (authRoute === "register") registrationView();
      else if (authRoute === "account-created") accountCreatedView();
      else
        loginView({
          portal:
            authRoute === "signin" && authParts[1] === "faculty"
              ? "faculty"
              : "student",
        });
      if (shouldFocusMain) focusMain();
      return;
    }
    let route = routeParts();
    if (isTeacher()) {
      renderTeacher(route);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (shouldFocusMain) focusMain();
      return;
    }
    if (
      route[0] === "teacher" ||
      route[0] === "signin" ||
      route[0] === "register" ||
      route[0] === "account-created"
    ) {
      replaceRoute("dashboard");
      route = ["dashboard"];
    }
    document.title = `${pageTitle(route)} | Lake Forest Learning`;
    let view;
    if (route[0] === "dashboard") view = dashboardView();
    else if (route[0] === "courses") view = coursesView();
    else if (route[0] === "calendar") view = calendarView();
    else if (route[0] === "course") {
      const course = findCourse(route[1]);
      view = course ? courseView(course) : notFoundView();
    } else if (route[0] === "guide") {
      const course = findCourse(route[1]);
      view = course ? courseGuideView(course) : notFoundView();
    } else if (route[0] === "lesson") {
      const lesson = findLesson(route[1]);
      view = lesson ? lessonView(lesson) : notFoundView();
    } else if (route[0] === "assignments") view = assignmentsView();
    else if (route[0] === "assignment") {
      const assignment = findAssignment(route[1]);
      view = assignment ? assignmentView(assignment) : notFoundView();
    } else if (route[0] === "progress") view = progressView();
    else if (route[0] === "announcements") view = announcementsView();
    else if (route[0] === "support") view = supportView();
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

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "login-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = normalizeEmail(form.get("email"));
      const password = String(form.get("password") || "");
      const portal = form.get("portal") === "faculty" ? "faculty" : "student";
      let account = null;
      let accepted = false;
      if (portal === "faculty") {
        if (email === TEACHER_EMAIL) {
          account = TEACHER_ACCOUNT;
          accepted = password === TEACHER_PASSWORD;
        }
      } else {
        if (email === ACCESS_EMAIL) {
          account = SCHOOL_ACCOUNT;
          accepted = password === ACCESS_PASSWORD;
        } else if (email !== TEACHER_EMAIL) {
          account = registeredAccount(email);
          try {
            accepted = Boolean(
              account && (await verifyRegisteredPassword(account, password)),
            );
          } catch {
            accepted = false;
          }
        }
      }
      if (!accepted || !account) {
        loginView({
          error:
            portal === "faculty"
              ? "The faculty email or password is incorrect. Please try again."
              : "The student email or password is incorrect. Please try again.",
          email,
          portal,
        });
        document.querySelector(email ? "#password" : "#email")?.focus();
        return;
      }
      startSession(account);
      state = loadState(currentUser());
      signInNotice = "";
      signInPrefill = "";
      sessionStorage.removeItem(REGISTERED_ACCOUNT_KEY);
      window.location.hash = isTeacher()
        ? "#/teacher/dashboard"
        : "#/dashboard";
      render(true);
      showToast(`Welcome back, ${currentUser()?.firstName || "student"}.`);
      return;
    }

    if (event.target.id === "registration-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const values = {
        firstName: String(form.get("firstName") || "").trim(),
        lastName: String(form.get("lastName") || "").trim(),
        email: normalizeEmail(form.get("email")),
      };
      const password = String(form.get("newPassword") || "");
      const confirmation = String(form.get("confirmPassword") || "");
      const errors = {};
      if (!isValidName(values.firstName)) {
        errors.firstName = "Enter a first name using 1–50 characters.";
      }
      if (!isValidName(values.lastName)) {
        errors.lastName = "Enter a last name using 1–50 characters.";
      }
      if (!isValidEmail(values.email)) {
        errors.email = "Enter a complete email address, such as name@example.com.";
      } else if (values.email.endsWith("@lakeforestacademy.ca")) {
        errors.email =
          "School email accounts are issued by Lake Forest Academy. Sign in with your school credentials or use a personal address.";
      } else if (registeredAccount(values.email)) {
        errors.email =
          "We could not create an account with this email. Try signing in or use another address.";
      }
      if (!passwordChecks(password, values.email).every((rule) => rule.met)) {
        errors.password = "Create a password that meets every requirement.";
      }
      if (!confirmation || confirmation !== password) {
        errors.confirmPassword = "Enter the same password again.";
      }
      if (form.get("deviceConsent") !== "yes") {
        errors.deviceConsent =
          "Confirm that you understand this account is saved on this device.";
      }
      if (Object.keys(errors).length) {
        registrationView(values, errors);
        document.querySelector("#registration-errors")?.focus();
        return;
      }

      const submitButton = event.target.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Creating Account…";
      }
      try {
        const salt = createPasswordSalt();
        const passwordHash = await derivePasswordHash(password, salt);
        const account = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
        };
        const accounts = loadAccounts();
        accounts[values.email] = account;
        saveAccounts(accounts);
        sessionStorage.setItem(
          REGISTERED_ACCOUNT_KEY,
          JSON.stringify({
            email: account.email,
            displayName: `${account.firstName} ${account.lastName}`.trim(),
          }),
        );
        signInPrefill = account.email;
        signInNotice =
          "Account created. Sign in with your new personal email account.";
        window.location.hash = "#/account-created";
        render(true);
      } catch {
        registrationView(values, {
          form:
            "We could not securely create the account in this browser. Please update your browser or try another device.",
        });
        document.querySelector("#registration-errors")?.focus();
      }
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
      if (form.get("integrity") !== "confirmed") {
        showToast("Confirm the academic integrity statement before submitting.");
        document.querySelector("#submission-integrity")?.focus();
        return;
      }
      const submittedAt = new Date().toISOString();
      const receiptId = receiptIdFor(id, submittedAt);
      let fileReceiptId = existing?.fileReceiptId || "";
      let fileSize = existing?.fileSize || 0;
      let fileType = existing?.fileType || "";
      let fileStorageWarning = false;
      if (newFileName) {
        fileReceiptId = receiptId;
        fileSize = file.size;
        fileType = file.type || "application/octet-stream";
        try {
          await storeSubmissionFile({
            receiptId,
            studentEmail: currentUser()?.email || "",
            assignmentId: id,
            fileName,
            fileSize,
            fileType,
            lastModified: file.lastModified,
            blob: file,
            createdAt: submittedAt,
          });
        } catch {
          fileReceiptId = "";
          fileStorageWarning = true;
        }
      }
      const history = [
        ...(existing?.history || []),
        {
          fileName,
          submittedAt,
          receiptId,
          fileReceiptId,
          fileSize,
          fileType,
        },
      ];
      state.submissions[id] = {
        text,
        fileName,
        submittedAt,
        receiptId,
        fileReceiptId,
        fileSize,
        fileType,
        status: "submitted",
        history,
      };
      replacingSubmissionId = null;
      saveState();
      render(true);
      showToast(
        fileStorageWarning
          ? `Submission received. Receipt ${receiptId}. The file metadata was saved, but this browser could not store the file for download.`
          : `Submission received. Receipt ${receiptId}.`,
      );
    }
  });

  document.addEventListener("input", (event) => {
    if (!["newPassword", "registerEmail"].includes(event.target.id)) return;
    const password = document.querySelector("#newPassword")?.value || "";
    const email = document.querySelector("#registerEmail")?.value || "";
    passwordChecks(password, email).forEach((rule) => {
      const item = document.querySelector(
        `[data-password-rule="${rule.id}"]`,
      );
      item?.classList.toggle("is-met", Boolean(password && rule.met));
      item?.setAttribute(
        "aria-label",
        `${rule.label}: ${password && rule.met ? "met" : "not yet met"}`,
      );
    });
  });

  document.addEventListener("click", async (event) => {
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
    if (action === "google-workspace-signin") {
      const authorizationUrl = googleWorkspaceAuthUrl();
      if (!authorizationUrl) {
        showToast(
          "Google Workspace needs the school OAuth client and backend callback endpoint before authorization can begin.",
        );
        document.querySelector(".auth-setup-note")?.setAttribute("role", "alert");
        return;
      }
      sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
      window.location.assign(authorizationUrl);
    } else if (action === "download-submission") {
      const receiptId = target.dataset.receipt || "";
      target.disabled = true;
      try {
        const fileRecord = await getSubmissionFile(receiptId);
        if (!fileRecord?.blob) {
          showToast(
            "The original file is not stored in this browser. Only its submission metadata is available.",
          );
          return;
        }
        const downloadUrl = URL.createObjectURL(fileRecord.blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileRecord.fileName || "student-submission";
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        showToast(`Downloading ${fileRecord.fileName || "student submission"}.`);
      } catch {
        showToast("This file could not be retrieved from local storage.");
      } finally {
        target.disabled = false;
      }
    } else if (action === "toggle-password") {
      const input = document.querySelector(`#${target.dataset.target}`);
      if (!input) return;
      const willShow = input.type === "password";
      input.type = willShow ? "text" : "password";
      target.textContent = willShow ? "Hide" : "Show";
      target.setAttribute("aria-pressed", String(willShow));
      target.setAttribute(
        "aria-label",
        `${willShow ? "Hide" : "Show"} ${input.labels?.[0]?.textContent?.toLowerCase() || "password"}`,
      );
      input.focus();
    } else if (action === "continue-to-signin") {
      let account = null;
      try {
        account = JSON.parse(sessionStorage.getItem(REGISTERED_ACCOUNT_KEY));
      } catch {
        account = null;
      }
      signInPrefill = account?.email || "";
      signInNotice =
        "Account created. Sign in with your new personal email account.";
      window.location.hash = "#/signin/student";
      render(true);
      document.querySelector("#password")?.focus();
    } else if (action === "open-menu") {
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
      const facultySession = isTeacher();
      target.disabled = true;
      if (facultySession) {
        sessionStorage.setItem(WORKSPACE_LOGOUT_SUPPRESS_KEY, "1");
        await closeWorkspaceSession();
      }
      sessionStorage.removeItem(SESSION_KEY);
      state = initialStateForUser(null);
      signInNotice = "";
      signInPrefill = "";
      window.location.hash = facultySession
        ? "#/signin/faculty"
        : "#/signin/student";
      loginView({ portal: facultySession ? "faculty" : "student" });
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
    } else if (action === "toggle-guide-step") {
      const courseId = target.dataset.course;
      const stepId = target.dataset.step;
      const current = state.guideChecks[courseId] || [];
      state.guideChecks[courseId] = current.includes(stepId)
        ? current.filter((item) => item !== stepId)
        : [...current, stepId];
      saveState();
      render();
      document
        .querySelector(
          `[data-action="toggle-guide-step"][data-course="${courseId}"][data-step="${stepId}"]`,
        )
        ?.focus();
      const guide = guideProgress(findCourse(courseId));
      showToast(
        guide.isComplete
          ? "Course Guide complete. You are ready to begin."
          : "Course Guide progress saved.",
      );
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
    } else if (action === "mark-feedback-read") {
      if (!state.feedbackRead.includes(target.dataset.id)) {
        state.feedbackRead.push(target.dataset.id);
      }
      saveState();
      render();
      document
        .querySelector('[data-action="mark-feedback-read"]')
        ?.focus();
      showToast("Feedback marked as reviewed.");
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
  restoreWorkspaceSession().then((restored) => {
    if (restored) render(true);
  });
})();
