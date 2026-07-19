(() => {
  "use strict";

  const APP_ROOT = document.querySelector("#app");
  const STATE_KEY = "lake-forest-learning-state-v1";
  const SESSION_KEY = "lake-forest-learning-session-v1";
  const ACCESS_EMAIL = "student@lakeforestacademy.ca";
  const ACCESS_PASSWORD = "LakeForest2026!";

  const COURSES = [
    {
      id: "mhf4u",
      code: "MHF4U",
      title: "Advanced Functions",
      subject: "Mathematics",
      instructor: "James Whitmore",
      instructorEmail: "james.whitmore@lakeforestacademy.ca",
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
      const courseIds = new Set(COURSES.map((course) => course.id));
      const guideStepIds = new Set(COURSE_GUIDE_STEPS.map((step) => step.id));
      const feedbackIds = new Set(
        ASSIGNMENTS.filter((assignment) => assignment.feedback).map(
          (assignment) => assignment.id,
        ),
      );
      const savedSubmissions =
        saved.submissions && typeof saved.submissions === "object"
          ? saved.submissions
          : structuredCopy(DEFAULT_STATE.submissions);
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
                (assignment?.score != null
                  ? "graded"
                  : assignment?.status === "submitted"
                    ? "review"
                    : "submitted"),
              history,
            },
          ];
        }),
      );
      const guideChecks = structuredCopy(DEFAULT_STATE.guideChecks);
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
          : [...DEFAULT_STATE.completed],
        guideChecks,
        read: Array.isArray(saved.read)
          ? [...new Set(saved.read.filter((id) => announcementIds.has(id)))]
          : [...DEFAULT_STATE.read],
        feedbackRead: Array.isArray(saved.feedbackRead)
          ? [...new Set(saved.feedbackRead.filter((id) => feedbackIds.has(id)))]
          : [...DEFAULT_STATE.feedbackRead],
        submissions,
      };
    } catch {
      return structuredCopy(DEFAULT_STATE);
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

  function courseGrade(courseId) {
    return GRADES.find((grade) => grade.courseId === courseId);
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
        assignment.feedback && !state.feedbackRead.includes(assignment.id),
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
        meta: `${assignment.score}% · Review instructor comments`,
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
    if (assignment.score != null) {
      return { key: "graded", label: `Graded · ${assignment.score}%`, className: "success" };
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
              <input id="email" name="email" type="email" autocomplete="username" value="${ACCESS_EMAIL}" required />
              <div class="password-label">
                <label for="password">Password</label>
                <span>Student access</span>
              </div>
              <input id="password" name="password" type="password" autocomplete="current-password" value="${ACCESS_PASSWORD}" required />
              ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
              <button class="button button-primary login-submit" type="submit">Sign In ${icon("arrow", 17)}</button>
            </form>
            <p class="login-help"><strong>Lake Forest Academy Account</strong>Use your assigned school email and password.</p>
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
          <h1>Good Evening, Alex.</h1>
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
                        <span class="feedback-score">${assignment.score}%</span>
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
              <div class="fact"><span>Current Standing</span><strong>${grade?.current ?? "—"}%</strong></div>
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
    const lifecycleIndex =
      assignment.score != null
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
      assignment.feedback && !state.feedbackRead.includes(assignment.id);
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
              assignment.feedback
                ? `
                  <section class="lesson-section feedback-panel ${feedbackUnread ? "is-new" : ""}">
                    <div class="feedback-heading">
                      <div><p class="course-code">${feedbackUnread ? "New Feedback" : "Instructor Feedback"}</p><h2>${escapeHtml(course.instructor)}</h2></div>
                      <strong>${assignment.score}%</strong>
                    </div>
                    <p>${escapeHtml(assignment.feedback)}</p>
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
                      assignment.score == null
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

  document.addEventListener("submit", (event) => {
    if (event.target.id === "login-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const email = String(form.get("email") || "").trim().toLowerCase();
      const password = String(form.get("password") || "");
      if (email !== ACCESS_EMAIL || password !== ACCESS_PASSWORD) {
        loginView("The email or password does not match the student account.");
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
      if (form.get("integrity") !== "confirmed") {
        showToast("Confirm the academic integrity statement before submitting.");
        document.querySelector("#submission-integrity")?.focus();
        return;
      }
      const submittedAt = new Date().toISOString();
      const receiptId = receiptIdFor(id, submittedAt);
      const history = [
        ...(existing?.history || []),
        {
          fileName,
          submittedAt,
          receiptId,
        },
      ];
      state.submissions[id] = {
        text,
        fileName,
        submittedAt,
        receiptId,
        status: "submitted",
        history,
      };
      replacingSubmissionId = null;
      saveState();
      render(true);
      showToast(`Submission received. Receipt ${receiptId}.`);
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
})();
