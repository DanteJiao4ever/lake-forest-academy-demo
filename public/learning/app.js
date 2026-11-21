(() => {
  "use strict";

  const APP_ROOT = document.querySelector("#app");
  function serviceStatus(value) {
    return Object.freeze({
      state: String(value?.state || "disabled").trim(),
      message: String(value?.message || "").trim(),
    });
  }
  let API_STATUS = serviceStatus(window.LFA_API_STATUS);
  let DRIVE_CATALOG_STATUS = serviceStatus(window.LFA_DRIVE_CATALOG_STATUS);
  const STATE_KEY = "lake-forest-learning-state-v1";
  const SESSION_KEY = "lake-forest-learning-session-v1";
  const ACCOUNTS_KEY = "lake-forest-learning-accounts-v1";
  const REGISTERED_ACCOUNT_KEY = "lake-forest-learning-registration-v1";
  const GRADING_DRAFTS_KEY = "lake-forest-learning-grading-drafts-v1";
  const CSRF_TOKEN_KEY = "lake-forest-learning-csrf-v1";
  const WORKSPACE_LOGOUT_SUPPRESS_KEY =
    "lake-forest-learning-workspace-signed-out-v1";
  const WORKSPACE_AUTH_RETURN_TO = "teacher/dashboard";
  const WORKSPACE_CALLBACK_MESSAGES = Object.freeze({
    connected: Object.freeze({
      tone: "success",
      message: "Google Workspace sign-in is connected.",
    }),
    cancelled: Object.freeze({
      tone: "notice",
      message:
        "Google Workspace sign-in was cancelled. You can try again or use your assigned faculty credentials.",
    }),
    "not-authorized": Object.freeze({
      tone: "error",
      message:
        "This Google Workspace account is not authorized for the faculty portal.",
    }),
    unavailable: Object.freeze({
      tone: "error",
      message:
        "Google Workspace sign-in is temporarily unavailable. Use your assigned faculty credentials or try again later.",
    }),
    expired: Object.freeze({
      tone: "error",
      message:
        "Google Workspace sign-in expired before it could be completed. Please try again.",
    }),
    failed: Object.freeze({
      tone: "error",
      message:
        "Google Workspace sign-in could not be completed. Please try again.",
    }),
  });
  const DRIVE_MATERIALS_CACHE_KEY =
    "lake-forest-learning-drive-materials-v1";
  const FILE_DATABASE_NAME = "lake-forest-learning-files-v1";
  const FILE_STORE_NAME = "submission-files";
  const MAX_SUBMISSION_BYTES = 25 * 1024 * 1024;
  const SUBMISSION_FILE_EXTENSIONS = Object.freeze([
    "pdf",
    "docx",
    "xlsx",
    "pptx",
    "txt",
    "png",
    "jpg",
    "jpeg",
  ]);
  const SUBMISSION_FILE_ACCEPT = SUBMISSION_FILE_EXTENSIONS.map(
    (extension) => `.${extension}`,
  ).join(",");
  const SUBMISSION_FILE_TYPE_LABEL =
    "PDF, DOCX, XLSX, PPTX, TXT, PNG or JPEG";
  const ACCESS_EMAIL = "student@lakeforestacademy.ca";
  function readAuthConfiguration() {
    return {
      loginEndpoint: String(
        window.LFA_AUTH_CONFIG?.loginEndpoint || "",
      ).trim(),
      registrationEndpoint: String(
        window.LFA_AUTH_CONFIG?.registrationEndpoint || "",
      ).trim(),
      passwordResetRequestEndpoint: String(
        window.LFA_AUTH_CONFIG?.passwordResetRequestEndpoint || "",
      ).trim(),
      passwordResetEndpoint: String(
        window.LFA_AUTH_CONFIG?.passwordResetEndpoint || "",
      ).trim(),
      passwordChangeEndpoint: String(
        window.LFA_AUTH_CONFIG?.passwordChangeEndpoint || "",
      ).trim(),
      enrollmentsEndpoint: String(
        window.LFA_AUTH_CONFIG?.enrollmentsEndpoint || "",
      ).trim(),
      googleWorkspaceAuthStart: String(
        window.LFA_AUTH_CONFIG?.googleWorkspaceAuthStart || "",
      ).trim(),
      workspaceSessionEndpoint: String(
        window.LFA_AUTH_CONFIG?.workspaceSessionEndpoint || "",
      ).trim(),
      workspaceLogoutEndpoint: String(
        window.LFA_AUTH_CONFIG?.workspaceLogoutEndpoint || "",
      ).trim(),
      allowDeviceAccounts:
        window.LFA_AUTH_CONFIG?.allowDeviceAccounts === true &&
        ["localhost", "127.0.0.1"].includes(window.location.hostname),
    };
  }
  let AUTH_CONFIG = readAuthConfiguration();
  function readDriveConfiguration() {
    return Object.freeze({
      sourceName: String(
        window.LFA_DRIVE_CONFIG?.sourceName || "Lotus Google Drive",
      ).trim(),
      sourceConfigured:
        window.LFA_DRIVE_CONFIG?.sourceConfigured === true,
      syncEndpoint: String(
        window.LFA_DRIVE_CONFIG?.syncEndpoint || "",
      ).trim(),
    });
  }
  let DRIVE_CONFIG = readDriveConfiguration();
  function readSubmissionConfiguration() {
    return Object.freeze({
      submissionsEndpoint: String(
        window.LFA_SUBMISSION_CONFIG?.submissionsEndpoint ||
          window.LFA_DRIVE_CONFIG?.submissionsEndpoint ||
          "",
      ).trim(),
      gradingEndpoint: String(
        window.LFA_SUBMISSION_CONFIG?.gradingEndpoint ||
          window.LFA_DRIVE_CONFIG?.gradingEndpoint ||
          "",
      ).trim(),
      uploadReady:
        window.LFA_SUBMISSION_CONFIG?.uploadReady !== false &&
        window.LFA_DRIVE_CONFIG?.uploadReady !== false,
    });
  }
  let SUBMISSION_CONFIG = readSubmissionConfiguration();
  function readPlatformConfiguration() {
    return Object.freeze({
      announcementsEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.announcementsEndpoint || "",
      ).trim(),
      coursesEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.coursesEndpoint || "",
      ).trim(),
      studentProgressEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.studentProgressEndpoint || "",
      ).trim(),
      studentGradesEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.studentGradesEndpoint || "",
      ).trim(),
      notificationsEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.notificationsEndpoint || "",
      ).trim(),
      moduleProgressEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.moduleProgressEndpoint || "",
      ).trim(),
      activityProgressEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.activityProgressEndpoint || "",
      ).trim(),
      teacherCoursesEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.teacherCoursesEndpoint || "",
      ).trim(),
      teacherStudentsEndpoint: String(
        window.LFA_PLATFORM_API_CONFIG?.teacherStudentsEndpoint || "",
      ).trim(),
    });
  }
  let PLATFORM_API_CONFIG = readPlatformConfiguration();

  function refreshServiceConfiguration() {
    API_STATUS = serviceStatus(window.LFA_API_STATUS);
    DRIVE_CATALOG_STATUS = serviceStatus(window.LFA_DRIVE_CATALOG_STATUS);
    AUTH_CONFIG = readAuthConfiguration();
    DRIVE_CONFIG = readDriveConfiguration();
    SUBMISSION_CONFIG = readSubmissionConfiguration();
    PLATFORM_API_CONFIG = readPlatformConfiguration();
  }
  let serviceRetryPending = false;
  let authSubmissionPending = false;
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
  const COURSES = [
    {
      id: "mhf4u",
      code: "MHF4U",
      title: "Advanced Functions",
      subject: "Mathematics",
      instructor: "James Whitmore",
      instructorEmail: "james.whitmore@lakeforestacademy.ca",
      schedule: "Mon, Wed & Fri · 9:00 AM",
      mode: "Teacher-paced",
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
      schedule: "Tue & Thu · 10:15 AM",
      mode: "Teacher-paced",
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
      schedule: "Mon & Thu · 1:30 PM",
      mode: "Teacher-paced",
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

  const DRIVE_CATALOG = Array.isArray(window.LFA_COURSE_CATALOG)
    ? window.LFA_COURSE_CATALOG
    : [];
  DRIVE_CATALOG.forEach((catalogCourse) => {
    const existing = COURSES.find((course) => course.id === catalogCourse.id);
    if (existing) {
      Object.assign(existing, catalogCourse);
      existing.lessons = (catalogCourse.lessons || []).map((lesson) => ({
        ...lesson,
      }));
      return;
    }
    COURSES.push({
      ...catalogCourse,
      lessons: catalogCourse.lessons.map((lesson) => ({ ...lesson })),
    });
  });
  const SELECTABLE_COURSE_IDS = Array.isArray(
    window.LFA_SELECTABLE_COURSE_IDS,
  )
    ? [...window.LFA_SELECTABLE_COURSE_IDS]
    : ["mhf4u"];

  const PLATFORM_CATALOG =
    window.LFA_PLATFORM_SEQUENCES || window.LFA_PLATFORM_CATALOG || {};
  const PLATFORM_COURSES = Array.isArray(PLATFORM_CATALOG.courses)
    ? PLATFORM_CATALOG.courses
    : [];

  function platformCourseForCode(code) {
    const normalizedCode = String(code || "").trim().toUpperCase();
    return (
      PLATFORM_CATALOG.coursesByCode?.[normalizedCode] ||
      PLATFORM_COURSES.find(
        (course) => String(course?.code || "").toUpperCase() === normalizedCode,
      ) ||
      null
    );
  }

  function moduleLessonDuration(module) {
    const hours = Number(module?.estimatedCreditHours);
    const lessonCount = Math.max(1, module?.lessons?.length || 0);
    return Number.isFinite(hours) && hours > 0
      ? `${Math.max(1, Math.round((hours * 60) / lessonCount))} min`
      : "Self-paced";
  }

  function normalizePlatformAssessment(assessment = {}) {
    const components = Array.isArray(assessment?.components)
      ? assessment.components
      : [];
    const sequence = Array.isArray(assessment?.sequence)
      ? assessment.sequence
      : [];
    return {
      ...assessment,
      key: String(assessment?.key || assessment?.id || ""),
      type: String(
        assessment?.type ||
          assessment?.activityType ||
          assessment?.activity_type ||
          "",
      ),
      title: String(assessment?.title || ""),
      weightPercent: Number(
        assessment?.weightPercent ??
          assessment?.courseGradeWeightPercent ??
          assessment?.course_grade_weight_percent ??
          0,
      ),
      evidenceFile:
        assessment?.evidenceFile ?? assessment?.evidence_file ?? null,
      sequence,
      taskType: assessment?.taskType ?? assessment?.task_type ?? null,
      timeMinutes:
        assessment?.timeMinutes ?? assessment?.time_minutes ?? null,
      required:
        assessment?.required ??
        assessment?.isRequired ??
        assessment?.is_required ??
        false,
      processCheckpoints:
        assessment?.processCheckpoints ??
        assessment?.process_checkpoints ??
        null,
      authenticationEvidence:
        assessment?.authenticationEvidence ??
        assessment?.authentication_evidence ??
        null,
      components: components.map((component, index) => ({
        ...component,
        key: String(component?.key || component?.id || `component-${index + 1}`),
        title: String(component?.title || `Part ${index + 1}`),
        type: String(component?.type || component?.componentType || ""),
        weightPercent: Number(
          component?.weightPercent ?? component?.weight_percent ?? 0,
        ),
        timeMinutes:
          component?.timeMinutes ?? component?.time_minutes ?? null,
        processCheckpoints:
          component?.processCheckpoints ??
          component?.process_checkpoints ??
          null,
      })),
    };
  }

  function normalizePlatformModule(module, courseCode) {
    const number = Number(module?.number ?? module?.moduleNumber);
    const moduleNumber = Number.isFinite(number) ? number : 0;
    const moduleKey =
      String(module?.key || module?.moduleKey || "").trim() ||
      `${courseCode}-M${String(moduleNumber).padStart(2, "0")}`;
    const rawLessons = Array.isArray(module?.lessons)
      ? module.lessons
      : (module?.lessonIds || []).map((id, index) => ({
          id,
          key: id,
          title: module?.lessonTitles?.[index] || `Lesson ${index + 1}`,
          order: index + 1,
        }));
    return {
      ...module,
      key: moduleKey,
      number: moduleNumber,
      title: String(module?.title || module?.moduleTitle || `Module ${moduleNumber}`),
      unitNumber: module?.unitNumber ?? module?.unit_number ?? null,
      unitTitle: String(module?.unitTitle || module?.unit_title || ""),
      learningFocus: Array.isArray(module?.learningFocus)
        ? module.learningFocus
        : module?.learning_focus || [],
      readingSteps: Array.isArray(module?.readingSteps)
        ? module.readingSteps
        : Array.isArray(module?.coreReadingOrder)
          ? module.coreReadingOrder
          : module?.core_reading_order || [],
      selfStudyResources: Array.isArray(module?.selfStudyResources)
        ? module.selfStudyResources
        : Array.isArray(module?.resources)
          ? module.resources
          : module?.self_study_resources || [],
      guidedPractice: String(
        module?.guidedPractice || module?.guided_practice || "",
      ),
      lowStakesCheck: String(
        module?.lowStakesCheck || module?.low_stakes_check || "",
      ),
      feedbackAndUnlock: String(
        module?.feedbackAndUnlock ||
          module?.feedback_and_unlock ||
          module?.unlockRule?.ruleText ||
          "",
      ),
      teacherPresence: String(
        module?.teacherPresence || module?.teacher_presence || "",
      ),
      evidenceToRetain: String(
        module?.evidenceToRetain || module?.evidence_to_retain || "",
      ),
      estimatedCreditHours: Number(
        module?.estimatedCreditHours ?? module?.estimated_credit_hours ?? 0,
      ),
      workloadLabel: String(
        module?.workloadLabel || module?.workload_label || "Self-paced",
      ),
      unlockRule: {
        ruleText: String(
          module?.unlockRule?.ruleText ||
            module?.feedbackAndUnlock ||
            module?.feedback_and_unlock ||
            "",
        ),
        teacherOverrideAllowed:
          module?.unlockRule?.teacherOverrideAllowed !== false,
        overrideReasonRequired:
          module?.unlockRule?.overrideReasonRequired !== false,
      },
      assessment: normalizePlatformAssessment(
        module?.assessment || module?.activity || {},
      ),
      lessons: rawLessons.map((lesson, index) => ({
        ...lesson,
        id: String(lesson?.id || lesson?.key || `${moduleKey}-L${index + 1}`),
        key: String(lesson?.key || lesson?.id || `${moduleKey}-L${index + 1}`),
        title: String(lesson?.title || `Lesson ${index + 1}`),
        order: Number(lesson?.order || index + 1),
      })),
    };
  }

  COURSES.forEach((course) => {
    const platformCourse = platformCourseForCode(course.code);
    if (!platformCourse) return;
    const modules = (platformCourse.modules || [])
      .map((module) => normalizePlatformModule(module, course.code))
      .sort((a, b) => a.number - b.number);
    course.platformCourse = platformCourse;
    course.platformModules = modules;
    course.gradebookItems = Array.isArray(platformCourse.gradebookItems)
      ? platformCourse.gradebookItems
      : [];
    course.plannedHours = Number(platformCourse.hours || course.plannedHours || 110);
    course.description = platformCourse.description || course.description;
    course.overview = platformCourse.description || course.overview;
    course.lessons = modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        id: lesson.id,
        unit: `Module ${String(module.number).padStart(2, "0")}`,
        unitTitle: module.title,
        title: lesson.title,
        duration: moduleLessonDuration(module),
        summary:
          module.learningFocus[lesson.order - 1] ||
          module.learningFocus[0] ||
          `Complete the assigned reading and practice for ${module.title}.`,
        objectives: [...module.learningFocus],
        content: [...module.readingSteps],
        platformModuleKey: module.key,
        platformModuleNumber: module.number,
      })),
    );
  });

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

  ASSIGNMENTS.push(
    {
      id: "sch4u-u1-assessment",
      courseId: "sch4u",
      unit: "Unit 1",
      unitTitle: "Organic Chemistry",
      title: "Organic Compound Impact Brief",
      due: "2026-10-02T23:59:00-04:00",
      availableUntil: "2026-10-04T23:59:00-04:00",
      points: 100,
      status: "upcoming",
      rubric: [
        { label: "Chemical Understanding", points: 30 },
        { label: "Evidence and Analysis", points: 30 },
        { label: "Scientific Communication", points: 25 },
        { label: "Source Practice", points: 15 },
      ],
      instructions:
        "Investigate one organic compound used in everyday life. Explain its structure and properties, evaluate one social or environmental impact, and recommend a defensible course of action using cited evidence.",
    },
    {
      id: "ics4u-u2-assessment",
      courseId: "ics4u",
      unit: "Unit 2",
      unitTitle: "Software Development",
      title: "Software Project Planning Package",
      due: "2026-10-16T23:59:00-04:00",
      availableUntil: "2026-10-18T23:59:00-04:00",
      points: 100,
      status: "upcoming",
      rubric: [
        { label: "Requirements and Design", points: 30 },
        { label: "Project Planning", points: 25 },
        { label: "Technical Reasoning", points: 30 },
        { label: "Documentation", points: 15 },
      ],
      instructions:
        "Prepare the requirements, modular design, test strategy, milestone plan and risk log for a student-managed software project. Include enough detail for another developer to begin implementation.",
    },
    {
      id: "sph4u-u2-assessment",
      courseId: "sph4u",
      unit: "Unit 2",
      unitTitle: "Energy and Momentum",
      title: "Conservation Investigation",
      due: "2026-10-30T23:59:00-04:00",
      availableUntil: "2026-11-01T23:59:00-04:00",
      points: 100,
      status: "upcoming",
      rubric: [
        { label: "Physics Reasoning", points: 35 },
        { label: "Data and Calculations", points: 30 },
        { label: "Model Evaluation", points: 20 },
        { label: "Communication", points: 15 },
      ],
      instructions:
        "Use experimental data or an approved simulation to investigate conservation of energy or momentum. Submit labelled calculations, uncertainty analysis, a model check and a concise conclusion.",
    },
    {
      id: "mcv4u-u2-assessment",
      courseId: "mcv4u",
      unit: "Unit 2",
      unitTitle: "Derivatives and Their Applications",
      title: "Optimization Model",
      due: "2026-11-13T23:59:00-05:00",
      availableUntil: "2026-11-15T23:59:00-05:00",
      points: 100,
      status: "upcoming",
      rubric: [
        { label: "Mathematical Model", points: 30 },
        { label: "Derivative Reasoning", points: 30 },
        { label: "Verification", points: 25 },
        { label: "Communication", points: 15 },
      ],
      instructions:
        "Define and solve a contextual optimization problem. State assumptions and domain restrictions, justify the derivative model, verify the optimum and interpret the result in context.",
    },
    {
      id: "bbb4m-u4-assessment",
      courseId: "bbb4m",
      unit: "Unit 4",
      unitTitle: "International Marketing and Distribution",
      title: "International Market-Entry Proposal",
      due: "2026-11-27T23:59:00-05:00",
      availableUntil: "2026-11-29T23:59:00-05:00",
      points: 100,
      status: "upcoming",
      rubric: [
        { label: "Market Analysis", points: 30 },
        { label: "Entry and Distribution Strategy", points: 30 },
        { label: "Risk and Ethics", points: 25 },
        { label: "Business Communication", points: 15 },
      ],
      instructions:
        "Recommend a market-entry and distribution strategy for a Canadian product in one international market. Address culture, competition, logistics, ethics and major risks using cited evidence.",
    },
  );

  function generatedGradebookItems(course) {
    if (course.gradebookItems?.length) return course.gradebookItems;
    return (course.platformModules || []).flatMap((module) => {
      const assessment = module.assessment || {};
      const weight = Number(
        assessment.weightPercent ?? assessment.courseGradeWeightPercent ?? 0,
      );
      if (!(weight > 0)) return [];
      const components = Array.isArray(assessment.components)
        ? assessment.components.filter(
            (component) => Number(component?.weightPercent ?? component?.weight) > 0,
          )
        : [];
      if (components.length) {
        return components.map((component, index) => ({
          key: `${module.key}-A${index + 1}`,
          moduleKey: module.key,
          moduleNumber: module.number,
          category: module.number === 11 ? "Final Evaluation" : "Coursework",
          title: component.title || `${assessment.title} — Part ${index + 1}`,
          type: component.type || assessment.type,
          weightPercent: Number(component.weightPercent ?? component.weight),
          evidenceDescription: component.description || assessment.taskType || "",
        }));
      }
      return [
        {
          key: assessment.key || `${module.key}-A1`,
          moduleKey: module.key,
          moduleNumber: module.number,
          category: module.number === 11 ? "Final Evaluation" : "Coursework",
          title: assessment.title,
          type: assessment.type,
          weightPercent: weight,
          timeMinutes: assessment.timeMinutes,
          processCheckpoints: assessment.processCheckpoints,
          evidenceDescription: assessment.taskType || assessment.evidenceFile || "",
        },
      ];
    });
  }

  const PLATFORM_COURSE_IDS = new Set(
    COURSES.filter((course) => course.platformModules?.length).map(
      (course) => course.id,
    ),
  );
  for (let index = ASSIGNMENTS.length - 1; index >= 0; index -= 1) {
    if (PLATFORM_COURSE_IDS.has(ASSIGNMENTS[index].courseId)) {
      ASSIGNMENTS.splice(index, 1);
    }
  }
  COURSES.filter((course) => PLATFORM_COURSE_IDS.has(course.id)).forEach(
    (course) => {
      generatedGradebookItems(course)
        .filter(
          (item) =>
            Number(item?.weightPercent) > 0 &&
            (item.assignmentKey || !course.gradebookItems?.length),
        )
        .forEach((item, index) => {
          const module = (course.platformModules || []).find(
            (candidate) =>
              candidate.key === item.moduleKey ||
              candidate.number === Number(item.moduleNumber),
          );
          const assessment = module?.assessment || {};
          const assessmentComponent = (assessment.components || []).find(
            (component) => component.assignmentKey === item.assignmentKey,
          );
          const teacherRecorded = /participation/i.test(
            `${item.category || ""} ${item.type || ""} ${item.title || ""}`,
          );
          ASSIGNMENTS.push({
            id: String(
              item.assignmentKey || item.key || `${course.code}-GB-${index + 1}`,
            ).toLowerCase(),
            gradebookItemId: String(item.key || "").toLowerCase(),
            courseId: course.id,
            moduleKey: item.moduleKey || module?.key || "",
            moduleNumber: module?.number ?? item.moduleNumber ?? null,
            sectionKind:
              module?.number === 11 ? "final_evaluation" : "unit",
            sectionLabel:
              module?.number === 11
                ? "Final Evaluation"
                : module?.unitTitle || `Unit ${module?.unitNumber}`,
            curriculumUnitNumber: module?.unitNumber ?? null,
            unitNumber: module?.unitNumber ?? null,
            unit:
              module?.number == null
                ? "Coursewide"
                : module.number === 11
                  ? "Final Evaluation"
                : `Module ${String(module.number).padStart(2, "0")}`,
            unitTitle: module?.title || item.category || "Course Gradebook",
            title: String(item.title || assessment.title || "Assessed Evidence"),
            points: 100,
            weightPercent: Number(item.weightPercent),
            status: "open",
            teacherRecorded,
            submissionMode:
              assessmentComponent?.submissionMode || item.submissionMode || "file",
            rubric: [
              { label: "Knowledge and Understanding", points: 25 },
              { label: "Thinking and Inquiry", points: 25 },
              { label: "Communication", points: 25 },
              { label: "Application", points: 25 },
            ],
            instructions: String(
              item.evidenceDescription ||
                assessmentComponent?.type ||
                assessment.taskType ||
                assessment.evidenceFile ||
                (teacherRecorded
                  ? "Participation evidence is recorded by the teacher from required contact, checkpoints, conferences and documented use of feedback."
                  : "Complete the evidence sequence shown in the course module and submit the required final work."),
            ),
            processCheckpoints:
              assessmentComponent?.processCheckpoints ||
              item.processCheckpoints ||
              assessment.processCheckpoints ||
              "",
          });
        });
    },
  );

  const LEGACY_DEMO_ANNOUNCEMENTS = [
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

  const ANNOUNCEMENTS = [];

  const LEGACY_DEMO_GRADES = [
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

  const GRADES = [];

  const LEGACY_DEMO_CALENDAR_EVENTS = [
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

  const CALENDAR_EVENTS = [];

  // Retain the former demo records only as migration reference. Production
  // students never receive fabricated announcements, grades, or schedules.
  void LEGACY_DEMO_ANNOUNCEMENTS;
  void LEGACY_DEMO_GRADES;
  void LEGACY_DEMO_CALENDAR_EVENTS;

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
    enrolledCourseIds: [
      "sch4u",
      "ics4u",
      "sph4u",
      "mhf4u",
      "mcv4u",
      "bbb4m",
    ],
    completed: ["mhf-1", "sbi-1", "eng-1", "eng-2"],
    guideChecks: {
      sch4u: [],
      ics4u: [],
      sph4u: [],
      mhf4u: ["overview", "evaluation"],
      mcv4u: [],
      bbb4m: [],
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
    enrolledCourseIds: [],
    completed: [],
    guideChecks: {
      sch4u: [],
      ics4u: [],
      sph4u: [],
      mhf4u: [],
      mcv4u: [],
      bbb4m: [],
    },
    read: [],
    feedbackRead: [],
    submissions: {},
  };

  let state;
  let assignmentFilter = "all";
  let replacingSubmissionId = null;
  let resumingDeviceDraftId = null;
  let toastTimer = null;
  let lastEnrollmentChange = null;
  let signInNotice = "";
  let signInPrefill = "";
  let workspaceCallbackFeedback = null;
  let driveMaterialsState = loadDriveMaterialsCache();
  let driveRequestInFlight = false;
  let driveEndpointChecked = false;
  let driveSessionGeneration = 0;
  let platformSessionGeneration = 0;
  const expandedCourseMaterials = new Set();
  let remoteSubmissionsState = {
    records: [],
    error: "",
    lastLoadedAt: "",
  };
  let teacherSubmissionFilters = {
    course: "all",
    status: "awaiting",
    query: "",
  };
  let gradingDrafts = loadGradingDrafts();
  let submissionsRequestInFlight = false;
  let submissionsEndpointCheckedFor = "";
  let enrollmentSaveInFlight = false;
  const platformRuntime = {
    modules: {},
    assignments: {},
    studentProgress: {},
    studentGrades: {},
    notifications: [],
    notificationsUnreadCount: null,
    notificationsLoaded: false,
    notificationsLoading: false,
    notificationsError: "",
    teacherRosters: {},
    teacherProgress: {},
    teacherGradebooks: {},
    errors: {},
  };
  const platformRequests = new Map();
  let announcementBoard = null;

  function resetPlatformRuntime() {
    platformSessionGeneration += 1;
    announcementBoard = null;
    platformRuntime.modules = {};
    platformRuntime.assignments = {};
    platformRuntime.studentProgress = {};
    platformRuntime.studentGrades = {};
    platformRuntime.notifications = [];
    platformRuntime.notificationsUnreadCount = null;
    platformRuntime.notificationsLoaded = false;
    platformRuntime.notificationsLoading = false;
    platformRuntime.notificationsError = "";
    platformRuntime.teacherRosters = {};
    platformRuntime.teacherProgress = {};
    platformRuntime.teacherGradebooks = {};
    platformRuntime.errors = {};
    platformRequests.clear();
    expandedCourseMaterials.clear();
    submissionsRequestInFlight = false;
    submissionsEndpointCheckedFor = "";
    replacingSubmissionId = null;
    resumingDeviceDraftId = null;
  }
  let drawerScrollY = 0;
  let remoteSessionValidated = !AUTH_CONFIG.workspaceSessionEndpoint;
  const drawerMedia = window.matchMedia("(max-width: 860px)");
  state = loadState();

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function csrfTokenFrom(payload) {
    return String(
      payload?.csrfToken ||
        payload?.data?.csrfToken ||
        payload?.session?.csrfToken ||
        "",
    ).trim();
  }

  function currentCsrfToken() {
    return sessionStorage.getItem(CSRF_TOKEN_KEY) || "";
  }

  function saveCsrfToken(payload) {
    const token = csrfTokenFrom(payload);
    if (token) sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    return token;
  }

  function assignmentRubricRows(assignment) {
    const criteria = assignment?.rubric;
    if (!Array.isArray(criteria) || !criteria.length || criteria.length > 12) return [];
    const rows = criteria.map((item) => ({
      label: String(item.label || "").trim(), points: "", maximum: Number(item.points),
    }));
    return rows.every((row) => row.label && row.label.length <= 100 &&
      Number.isInteger(row.maximum) && row.maximum >= 1 && row.maximum <= 100) ? rows : [];
  }

  function rubricRowMarkup(row = {}) {
    return `<div class="rubric-row">
      <label>Criterion<input data-rubric-label maxlength="100" value="${escapeHtml(row.label)}" required /></label>
      <label>Earned<input data-rubric-points type="number" min="0" max="100" step="1" value="${escapeHtml(row.points)}" required /></label>
      <label>Possible<input data-rubric-maximum type="number" min="1" max="100" step="1" value="${escapeHtml(row.maximum)}" required /></label>
      <button type="button" class="button button-quiet" data-action="remove-criterion">Remove criterion</button>
    </div>`;
  }

  function readRubric(form) {
    return Array.from(form.querySelectorAll?.(".rubric-row") || [], (row) => ({
      label: row.querySelector("[data-rubric-label]").value.trim(),
      points: row.querySelector("[data-rubric-points]").value,
      maximum: row.querySelector("[data-rubric-maximum]").value,
    }));
  }

  function rubricResult(rows) {
    if (!rows.length) return {};
    const rubric = rows.map((row) => ({ label: row.label, points: Number(row.points), maximum: Number(row.maximum) }));
    if (rows.some((row) => !row.label || row.points === "" || row.maximum === "") ||
        rubric.some((row) => !Number.isInteger(row.points) || !Number.isInteger(row.maximum) ||
          row.maximum < 1 || row.maximum > 100 || row.points < 0 || row.points > row.maximum)) {
      return { error: "Give each criterion a name, 1–100 possible points, and earned points from zero to the possible points." };
    }
    if (new Set(rubric.map((row) => row.label.toLowerCase())).size !== rows.length) {
      return { error: "Use a different name for each criterion." };
    }
    const earned = rubric.reduce((total, row) => total + row.points, 0);
    const possible = rubric.reduce((total, row) => total + row.maximum, 0);
    return { rubric, score: Math.round(100 * earned / possible) };
  }

  function updateRubricEditor(form) {
    const rows = readRubric(form);
    form.elements.score.readOnly = rows.length > 0;
    if (rows.length) form.elements.score.value = rubricResult(rows).score ?? "";
    form.querySelector('[data-action="add-criterion"]').disabled = rows.length >= 12;
    const preset = form.querySelector('[data-action="use-assignment-rubric"]');
    if (preset) preset.hidden = rows.length > 0;
  }

  function loadGradingDrafts() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(GRADING_DRAFTS_KEY));
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {};
    } catch {
      return {};
    }
  }

  function saveGradingDrafts() {
    sessionStorage.setItem(GRADING_DRAFTS_KEY, JSON.stringify(gradingDrafts));
  }

  function gradingDraftKey(record) {
    if (!record) return "";
    const assignmentKey = scalarLabel(
      record.assignment?.id || record.assignmentId,
    );
    const submissionKey = scalarLabel(
      record.submission?.id ||
        record.submission?.submissionId ||
        record.id ||
        `attempt-${record.submission?.attemptNumber || "unknown"}`,
    );
    if (!assignmentKey || !submissionKey) return "";
    return `${submissionScopeKey()}:${studentRecordKey(record.student)}:${assignmentKey}:${submissionKey}`;
  }

  function gradingDraftFor(record) {
    return gradingDrafts[gradingDraftKey(record)] || null;
  }

  function saveGradingDraft(record, values) {
    const key = gradingDraftKey(record);
    if (!key) return null;
    const draft = {
      score: String(values?.score ?? ""),
      feedback: String(values?.feedback ?? ""),
      rubric: values?.rubric || [],
      savedAt: new Date().toISOString(),
    };
    gradingDrafts[key] = draft;
    saveGradingDrafts();
    return draft;
  }

  function clearGradingDraft(record) {
    const key = gradingDraftKey(record);
    if (!key || !gradingDrafts[key]) return;
    delete gradingDrafts[key];
    saveGradingDrafts();
  }

  function gradingRequestTarget(record, fallbackSubmissionId = "") {
    const endpointBase = configuredDriveUrl(
      SUBMISSION_CONFIG.gradingEndpoint,
    );
    const submissionId = scalarLabel(
      record?.submission?.id || fallbackSubmissionId || record?.id,
    );
    return {
      submissionId,
      endpoint:
        endpointBase && submissionId
          ? new URL(
              encodeURIComponent(submissionId),
              `${endpointBase.replace(/\/+$/, "")}/`,
            ).toString()
          : "",
    };
  }

  function applyRemoteSubmissionGrade(
    record,
    payload,
    { score, feedback, publish, fallbackSubmissionId = "" },
  ) {
    const responseSource =
      payload?.data?.submission ||
      payload?.submission ||
      payload?.data ||
      payload;
    const now = new Date().toISOString();
    const returnedScore = Number(responseSource?.score);
    const returnedVersion = Number(responseSource?.version);
    const publishedAt = validTimestamp(
      responseSource?.publishedAt,
      publish ? now : "",
    );
    const gradedAt = validTimestamp(responseSource?.gradedAt, now);
    const submissionId = scalarLabel(
      responseSource?.submissionId ||
        record?.submission?.id ||
        fallbackSubmissionId ||
        record?.id,
    );
    upsertRemoteSubmission({
      id: record.id,
      student: record.student,
      assignmentId: record.assignment.id,
      courseId: record.course.id,
      submission: {
        ...record.submission,
        id: submissionId,
        score: Number.isInteger(returnedScore) ? returnedScore : score,
        rubric: responseSource?.rubric || null,
        feedback:
          typeof responseSource?.feedback === "string"
            ? responseSource.feedback
            : feedback,
        gradedBy: scalarLabel(
          responseSource?.gradedBy || record.submission.gradedBy,
        ),
        gradedByDisplayName: scalarLabel(
          responseSource?.gradedByDisplayName ||
            record.submission.gradedByDisplayName,
        ),
        gradeEtag:
          scalarLabel(responseSource?.etag) ||
          record.submission.gradeEtag ||
          "",
        gradeVersion: Number.isInteger(returnedVersion)
          ? returnedVersion
          : record.submission.gradeVersion ?? null,
        publishedAt,
        status: publishedAt
          ? "graded"
          : record.submission.workflowStatus ||
            record.submission.status ||
            "submitted",
        workflowStatus: publishedAt
          ? "graded"
          : record.submission.workflowStatus ||
            record.submission.status ||
            "submitted",
        gradedAt,
        updatedAt: validTimestamp(
          publishedAt || responseSource?.gradedAt,
          now,
        ),
      },
    });
    remoteSubmissionsState.error = "";
    remoteSubmissionsState.lastLoadedAt = now;
    return { publishedAt, gradedAt };
  }

  function captureVisibleGradingDraft() {
    const form = document.querySelector("#grading-form");
    if (!form) return null;
    const studentKey = form.dataset.student || "";
    const assignmentId = form.dataset.assignment || "";
    const submissionId = scalarLabel(form.dataset.submission);
    const record = teacherSubmissionRecords().find(
      (item) =>
        item.assignment.id === assignmentId &&
        studentRecordKey(item.student) === studentKey &&
        scalarLabel(item.submission?.id) === submissionId,
    );
    if (!record) return null;
    const values = {
      score: form.elements.score?.value || "",
      feedback: form.elements.feedback?.value || "",
      rubric: readRubric(form),
    };
    const parsedRubric = rubricResult(values.rubric);
    const serverValues = {
      score:
        record.submission.score == null ? "" : String(record.submission.score),
      feedback: record.submission.feedback || "",
    };
    if (
      !gradingDraftFor(record) &&
      values.score === serverValues.score &&
      values.feedback === serverValues.feedback &&
      !parsedRubric.error &&
      JSON.stringify(parsedRubric.rubric || []) === JSON.stringify(
        (record.submission.rubric || []).map(({ label, points, maximum }) => ({ label, points, maximum })),
      )
    ) {
      return null;
    }
    return saveGradingDraft(record, values);
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
      if (!session || typeof session.email !== "string") return null;
      return {
        publicId: String(session.publicId || session.id || "").trim(),
        email: normalizeEmail(session.email),
        role: ["teacher", "teacher_admin"].includes(session.role)
          ? session.role
          : "student",
        firstName: String(session.firstName || "").trim(),
        lastName: String(session.lastName || "").trim(),
        displayName: String(session.displayName || "").trim(),
        accountType: String(session.accountType || "").trim(),
      };
    } catch {
      return null;
    }
  }

  function currentUser() {
    if (!remoteSessionValidated) return null;
    const session = readSession();
    if (!session) return null;
    const account = AUTH_CONFIG.allowDeviceAccounts
      ? registeredAccount(session.email)
      : null;
    const identity = account || session;
    return {
      ...identity,
      displayName:
        identity.displayName ||
        `${identity.firstName || ""} ${identity.lastName || ""}`.trim() ||
        identity.email,
      accountType: identity.accountType || "personal",
      role: ["teacher", "teacher_admin"].includes(identity.role)
        ? identity.role
        : "student",
      program: "OSSD · Grade 12",
    };
  }

  function startSession(account, { remote = false, csrfToken = "" } = {}) {
    if (remote) remoteSessionValidated = true;
    if (csrfToken) sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        publicId: scalarLabel(account.publicId || account.id || account.userId),
        email: normalizeEmail(account.email),
        role: ["teacher", "teacher_admin"].includes(account.role)
          ? account.role
          : "student",
        firstName: String(account.firstName || "").trim(),
        lastName: String(account.lastName || "").trim(),
        displayName:
          String(account.displayName || "").trim() ||
          `${account.firstName || ""} ${account.lastName || ""}`.trim(),
        accountType: String(account.accountType || "").trim(),
      }),
    );
    remoteSubmissionsState = {
      records: [],
      error: "",
      lastLoadedAt: "",
    };
    submissionsEndpointCheckedFor = "";
    resetPlatformRuntime();
    resetDriveMaterialsForSession();
  }

  function expireRemoteSession() {
    const facultySession = isTeacher();
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    remoteSessionValidated = true;
    remoteSubmissionsState = {
      records: [],
      error: "",
      lastLoadedAt: "",
    };
    submissionsEndpointCheckedFor = "";
    resetPlatformRuntime();
    resetDriveMaterialsForSession();
    state = initialStateForUser(null);
    signInNotice = "Your secure session expired. Please sign in again.";
    const destination = facultySession
      ? "#/signin/faculty"
      : "#/signin/student";
    if (window.location.hash !== destination) window.location.hash = destination;
    render(true);
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
    return ["teacher", "teacher_admin"].includes(user?.role);
  }

  function isTeacherAdmin(user = currentUser()) {
    return user?.role === "teacher_admin";
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
        ASSIGNMENTS.map((assignment) => assignment.id),
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
                (submission.delivery === "device"
                  ? "draft"
                  : assignment && assignmentScore(assignment, user) != null
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
        enrolledCourseIds: Array.isArray(saved.enrolledCourseIds)
          ? [
              ...new Set(
                saved.enrolledCourseIds.filter((id) =>
                  SELECTABLE_COURSE_IDS.includes(id),
                ),
              ),
            ]
          : [...initialState.enrolledCourseIds],
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

  function requestIdFor(prefix) {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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
    if (submissionsEndpointUrl()) {
      return remoteSubmissionsState.records
        .map((remote) => {
          const matchedAssignment = findAssignment(remote.assignmentId);
          const matchedCourse = findCourse(
            remote.courseId || matchedAssignment?.courseId,
          );
          const supportedCourse =
            matchedCourse &&
            SELECTABLE_COURSE_IDS.includes(matchedCourse.id)
              ? matchedCourse
              : null;
          const assignment = matchedAssignment
            ? {
                ...matchedAssignment,
                moduleNumber:
                  remote.moduleNumber ??
                  remote.submission.moduleNumber ??
                  matchedAssignment.moduleNumber,
                unit:
                  remote.assignmentMeta?.unit || matchedAssignment.unit,
                unitTitle:
                  remote.assignmentMeta?.unitTitle ||
                  matchedAssignment.unitTitle,
              }
            : {
              id: remote.assignmentId,
              courseId: remote.courseId || "unmapped",
              title:
                remote.assignmentMeta?.title ||
                `Unmapped Assignment (${remote.assignmentId})`,
              unit: remote.assignmentMeta?.unit || "Unmapped",
              unitTitle:
                remote.assignmentMeta?.unitTitle || "Needs Course Mapping",
              points: null,
            };
          const fallbackCourseId =
            remote.courseId || assignment.courseId || "unmapped";
          const course =
            supportedCourse || {
              id: fallbackCourseId,
              code:
                remote.courseMeta?.code ||
                fallbackCourseId.toUpperCase() ||
                "UNMAPPED",
              title: remote.courseMeta?.title || "Unmapped Course",
              subject: "Needs Mapping",
            };
          const history = Array.isArray(remote.submission.history)
            ? remote.submission.history
            : [];
          return {
            id: remote.id,
            student: remote.student,
            course,
            assignment,
              submission: remote.submission,
              moduleId:
                remote.moduleId || remote.submission.moduleId || "",
              moduleNumber:
                remote.moduleNumber ??
                remote.submission.moduleNumber ??
                assignment.moduleNumber ??
                null,
            unmapped: !matchedAssignment || !supportedCourse,
            history,
            versionCount: Math.max(history.length, 1),
            latestFileReceiptId:
              remote.submission.fileReceiptId ||
              history.at(-1)?.fileReceiptId ||
              remote.submission.receiptId,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b.submission.submittedAt) -
            new Date(a.submission.submittedAt),
        );
    }
    const records = [];
    allStudentAccounts().forEach((student) => {
      const studentState = loadState(student);
      Object.entries(studentState.submissions || {}).forEach(
        ([assignmentId, submission]) => {
          if (
            submission?.status === "draft" ||
            submission?.delivery === "device"
          ) {
            return;
          }
          const assignment = findAssignment(assignmentId);
          if (!assignment) return;
          const course = findCourse(assignment.courseId);
          if (!course || !SELECTABLE_COURSE_IDS.includes(course.id)) return;
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
    if (record.unmapped) {
      return { label: "Needs Mapping", className: "danger" };
    }
    const workflowStatus = normalizeSubmissionWorkflowStatus(
      record.submission.workflowStatus || record.submission.status,
      record.submission.publishedAt,
    );
    if (workflowStatus === "graded") {
      return { label: "Grade Published", className: "success" };
    }
    if (workflowStatus === "revision_requested") {
      return { label: "Revision Requested", className: "warning" };
    }
    if (
      gradingDraftFor(record) ||
      (record.submission.score != null && !record.submission.publishedAt)
    ) {
      return { label: "Draft Saved", className: "warning" };
    }
    if (workflowStatus === "resubmitted") {
      return { label: "Resubmitted", className: "info" };
    }
    if (workflowStatus === "under_review") {
      return { label: "Under Review", className: "info" };
    }
    return { label: "Awaiting Review", className: "info" };
  }

  function teacherSubmissionBucket(record) {
    if (record.unmapped) return "unmapped";
    const workflowStatus = normalizeSubmissionWorkflowStatus(
      record.submission.workflowStatus || record.submission.status,
      record.submission.publishedAt,
    );
    if (workflowStatus === "graded") return "graded";
    if (workflowStatus === "revision_requested") return "revision";
    if (
      gradingDraftFor(record) ||
      (record.submission.score != null && !record.submission.publishedAt)
    ) {
      return "draft";
    }
    return "awaiting";
  }

  function isAwaitingTeacherReview(record) {
    return ["awaiting", "unmapped"].includes(teacherSubmissionBucket(record));
  }

  function teacherRecordMatchesQuery(record, query) {
    const normalized = String(query || "").trim().toLowerCase();
    if (!normalized) return true;
    return [
      record.student.displayName,
      record.student.email,
      record.course.code,
      record.course.title,
      record.assignment.title,
      record.assignment.unit,
      record.assignment.unitTitle,
      record.moduleNumber == null ? "" : `module ${record.moduleNumber}`,
      record.submission.fileName,
      record.submission.receiptId,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized));
  }

  function studentRecordKey(student) {
    return (
      normalizeEmail(student?.email) ||
      scalarLabel(student?.id || student?.studentId)
    );
  }

  function formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return "Size unavailable";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function submissionFileExtension(fileName) {
    return String(fileName || "")
      .trim()
      .toLowerCase()
      .match(/\.([a-z0-9]+)$/)?.[1] || "";
  }

  function submissionFileIsSupported(file) {
    return Boolean(
      file?.name &&
        SUBMISSION_FILE_EXTENSIONS.includes(
          submissionFileExtension(file.name),
        ),
    );
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function safeDomId(value) {
    return String(value || "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
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

  function configuredDriveUrl(value, base = window.location.href) {
    if (!value) return "";
    try {
      const url = new URL(value, base);
      const localDevelopment =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname);
      return url.protocol === "https:" || localDevelopment ? url.toString() : "";
    } catch {
      return "";
    }
  }

  function safeExternalHttpsUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(String(value));
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password
      ) {
        return "";
      }
      return url.toString();
    } catch {
      return "";
    }
  }

  function safeProtectedResourceUrl(value) {
    if (!value) return "";
    const configuredBase = configuredDriveUrl(
      PLATFORM_API_CONFIG.coursesEndpoint,
    );
    if (!configuredBase) return "";
    try {
      const base = new URL(configuredBase);
      const url = new URL(String(value), base);
      const localDevelopment =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname);
      if (
        url.origin !== base.origin ||
        (url.protocol !== "https:" && !localDevelopment) ||
        url.username ||
        url.password
      ) {
        return "";
      }
      return url.toString();
    } catch {
      return "";
    }
  }

  function submissionsEndpointUrl(scope = "") {
    const configured = configuredDriveUrl(
      SUBMISSION_CONFIG.submissionsEndpoint,
    );
    if (!configured) return "";
    const url = new URL(configured);
    if (scope) {
      url.searchParams.set("scope", scope);
      if (!url.searchParams.has("limit")) url.searchParams.set("limit", "100");
    }
    return url.toString();
  }

  function submissionUploadEnabled() {
    return SUBMISSION_CONFIG.uploadReady && Boolean(submissionsEndpointUrl());
  }

  function nextPageUrl(currentUrl, payload) {
    const cursor = scalarLabel(
      payload?.page?.nextCursor ||
        payload?.data?.page?.nextCursor ||
        payload?.nextCursor,
    );
    if (!cursor) return "";
    const url = new URL(currentUrl);
    url.searchParams.set("cursor", cursor);
    return url.toString();
  }

  function submissionScopeKey(user = currentUser()) {
    if (!user) return "";
    return isTeacher(user)
      ? `teacher:${normalizeEmail(user.email)}`
      : `student:${normalizeEmail(user.email)}`;
  }

  function platformSessionMatches(generation, scopeKey) {
    return (
      generation === platformSessionGeneration &&
      scopeKey === submissionScopeKey()
    );
  }

  function flattenSubmissionItems(items) {
    const flattened = [];
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      if (!Array.isArray(item.students)) {
        flattened.push(item);
        return;
      }
      item.students.forEach((student) => {
        const units = Array.isArray(student?.units) ? student.units : [];
        units.forEach((unit) => {
          const submissions = Array.isArray(unit?.submissions)
            ? unit.submissions
            : [];
          submissions.forEach((submission) => {
            flattened.push({
              ...submission,
              courseCode:
                submission.courseCode || item.courseCode || item.courseId,
              sectionKind:
                submission.sectionKind || unit.sectionKind || "unit",
              sectionLabel:
                submission.sectionLabel || unit.sectionLabel || "",
              unit:
                submission.unit ||
                submission.sectionLabel ||
                unit.sectionLabel ||
                (unit.sectionKind === "final_evaluation"
                  ? "Final Evaluation"
                  : ""),
              unitNumber:
                submission.unitNumber ?? unit.unitNumber ?? unit.number,
              curriculumUnitNumber:
                submission.curriculumUnitNumber ??
                unit.curriculumUnitNumber ??
                null,
              student: {
                ...student,
                id: student.studentId || student.id,
              },
            });
          });
        });
      });
    });
    return flattened;
  }

  function extractSubmissionItems(payload) {
    if (Array.isArray(payload)) {
      return { found: true, items: flattenSubmissionItems(payload) };
    }
    if (!payload || typeof payload !== "object") {
      return { found: false, items: [] };
    }
    for (const key of ["submissions", "records", "items"]) {
      if (Array.isArray(payload[key])) {
        return {
          found: true,
          items: flattenSubmissionItems(payload[key]),
        };
      }
    }
    if (payload.data && payload.data !== payload) {
      return extractSubmissionItems(payload.data);
    }
    return { found: false, items: [] };
  }

  function validTimestamp(value, fallback = "") {
    const timestamp = String(value || "").trim();
    return timestamp && !Number.isNaN(new Date(timestamp).getTime())
      ? timestamp
      : fallback;
  }

  function positiveAttemptNumber(value) {
    if (value == null || String(value).trim() === "") return null;
    const attemptNumber = Number(value);
    return Number.isInteger(attemptNumber) && attemptNumber >= 1
      ? attemptNumber
      : null;
  }

  function normalizeSubmissionVersion(raw, fallback = {}) {
    const version = raw && typeof raw === "object" ? raw : {};
    const attemptNumber =
      positiveAttemptNumber(version.attemptNumber) ||
      positiveAttemptNumber(fallback.attemptNumber);
    const submittedAt = validTimestamp(
      version.submittedAt || version.createdAt,
      fallback.submittedAt || new Date().toISOString(),
    );
    const receiptId =
      scalarLabel(version.receiptId || version.id) ||
      fallback.receiptId ||
      "";
    return {
      attemptNumber,
      fileName:
        scalarLabel(version.fileName || version.name) ||
        fallback.fileName ||
        "",
      submittedAt,
      receiptId,
      fileReceiptId:
        scalarLabel(version.fileReceiptId || version.driveFileId) ||
        fallback.fileReceiptId ||
        "",
      fileSize: Number.isFinite(Number(version.fileSize ?? version.size))
        ? Number(version.fileSize ?? version.size)
        : Number(fallback.fileSize || 0),
      fileType:
        scalarLabel(version.fileType || version.mimeType) ||
        fallback.fileType ||
        "",
      fileUrl: configuredDriveUrl(
        version.fileUrl ||
          version.downloadUrl ||
          version.webViewLink ||
          version.openUrl ||
          fallback.fileUrl ||
          "",
        configuredDriveUrl(SUBMISSION_CONFIG.submissionsEndpoint) ||
          window.location.href,
      ),
      messages: normalizeSubmissionMessages(
        version.messages || version.interactionMessages || version.thread,
        attemptNumber,
      ),
    };
  }

  function normalizeSubmissionWorkflowStatus(value, publishedAt = "") {
    const status = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const aliases = {
      review: "under_review",
      reviewing: "under_review",
      revision: "revision_requested",
      returned_for_revision: "revision_requested",
      changes_requested: "revision_requested",
      returned: "graded",
      published: "graded",
    };
    const normalized = aliases[status] || status;
    if (
      [
        "draft",
        "submitted",
        "under_review",
        "revision_requested",
        "resubmitted",
        "graded",
        "rejected",
        "withdrawn",
      ].includes(normalized)
    ) {
      return normalized;
    }
    return publishedAt ? "graded" : "submitted";
  }

  function normalizeSubmissionMessages(value, fallbackAttemptNumber = null) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((message) => message && typeof message === "object")
      .map((message, index) => ({
        id:
          scalarLabel(message.id) ||
          `attempt-${fallbackAttemptNumber || "current"}-message-${index + 1}`,
        body: scalarLabel(message.body || message.message || message.text),
        authorRole: String(
          message.authorRole ||
            message.author_role ||
            message.senderRole ||
            message.sender_role ||
            "teacher",
        )
          .trim()
          .toLowerCase(),
        authorName: scalarLabel(
          message.authorName ||
            message.author_name ||
            message.senderName ||
            message.sender_name,
        ),
        createdAt: validTimestamp(
          message.createdAt ||
            message.created_at ||
            message.sentAt ||
            message.sent_at,
          "",
        ),
        attemptNumber:
          positiveAttemptNumber(message.attemptNumber) ||
          positiveAttemptNumber(fallbackAttemptNumber),
      }))
      .filter((message) => message.body);
  }

  function normalizeRemoteSubmission(raw, index, defaultStudent = null) {
    if (!raw || typeof raw !== "object") return null;
    const nested =
      raw.submission && typeof raw.submission === "object"
        ? raw.submission
        : {};
    const source = { ...raw, ...nested };
    const suppliedAssignmentId = scalarLabel(
      source.assignmentId || source.assignment?.id,
    );
    const fallbackAssignmentKey =
      scalarLabel(
        source.submissionId || source.id || source.receiptId,
      ).replace(/[^a-zA-Z0-9_-]/g, "-") || `record-${index + 1}`;
    let assignmentId =
      suppliedAssignmentId || `unmapped-${fallbackAssignmentKey}`;
    let assignment = findAssignment(assignmentId);
    const courseId =
      canonicalCourseId(
        source.courseId ||
          source.courseCode ||
          source.course?.id ||
          source.course,
      ) ||
      assignment?.courseId ||
      "";
    if (!assignment && findCourse(courseId)) {
      const normalizedTitle = scalarLabel(
        source.assignmentTitle || source.assignment?.title,
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      const unitLabel = scalarLabel(
        source.unit || source.unitCode || source.assignment?.unit,
      ).toLowerCase();
      const courseAssignments = ASSIGNMENTS.filter(
        (item) => item.courseId === courseId,
      );
      const exactTitleMatches = normalizedTitle
        ? courseAssignments.filter(
            (item) =>
              item.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, " ")
                .trim() === normalizedTitle,
          )
        : [];
      const unitMatches = unitLabel
        ? courseAssignments.filter(
            (item) => item.unit.toLowerCase() === unitLabel,
          )
        : [];
      const matched =
        exactTitleMatches.length === 1
          ? exactTitleMatches[0]
          : unitMatches.length === 1
            ? unitMatches[0]
            : null;
      if (matched) {
        assignment = matched;
        assignmentId = matched.id;
      }
    }
    const course = findCourse(courseId) || findCourse(assignment?.courseId);
    const studentSource =
      raw.student && typeof raw.student === "object" ? raw.student : {};
    const studentId = scalarLabel(
      source.studentId || studentSource.studentId || studentSource.id,
    );
    const studentEmail = normalizeEmail(
      source.studentEmail ||
        studentSource.email ||
        defaultStudent?.email ||
        "",
    );
    const firstName = scalarLabel(
      studentSource.firstName || source.studentFirstName,
    );
    const lastName = scalarLabel(
      studentSource.lastName || source.studentLastName,
    );
    const displayName =
      scalarLabel(
        studentSource.displayName ||
          studentSource.studentName ||
          studentSource.name ||
          source.studentName,
      ) ||
      `${firstName} ${lastName}`.trim() ||
      defaultStudent?.displayName ||
      studentEmail ||
      studentId ||
      "Student";
    const submittedAt = validTimestamp(
      source.submittedAt || source.createdAt,
      new Date().toISOString(),
    );
    const receiptId =
      scalarLabel(source.receiptId || source.submissionId || source.id) ||
      receiptIdFor(assignmentId, submittedAt);
    const primaryFile =
      source.file && typeof source.file === "object"
        ? source.file
        : Array.isArray(source.files) &&
            source.files[0] &&
            typeof source.files[0] === "object"
          ? source.files[0]
          : {};
    const fileName = scalarLabel(source.fileName || primaryFile.name);
    const fileUrl = configuredDriveUrl(
      source.fileUrl ||
        source.downloadUrl ||
        source.webViewLink ||
        source.openUrl ||
        primaryFile.openUrl ||
        primaryFile.url ||
        "",
      configuredDriveUrl(SUBMISSION_CONFIG.submissionsEndpoint) ||
        window.location.href,
    );
    const historySource = Array.isArray(source.history)
      ? source.history
      : Array.isArray(source.versions)
        ? source.versions
        : [];
    const rawScore = source.score ?? source.grade?.score;
    const numericScore =
      rawScore === "" || rawScore == null ? null : Number(rawScore);
    const score =
      Number.isInteger(numericScore) &&
      numericScore >= 0 &&
      numericScore <= 100
        ? numericScore
        : null;
    const historyAttemptNumbers = historySource
      .map((version) => positiveAttemptNumber(version?.attemptNumber))
      .filter(Boolean);
    const attemptNumber =
      positiveAttemptNumber(source.attemptNumber) ||
      (historyAttemptNumbers.length
        ? Math.max(...historyAttemptNumbers)
        : Math.max(historySource.length, 1));
    const rawMaximumAttempts = Number(
      source.maxAttempts ?? source.max_attempts ?? source.assignment?.maxAttempts,
    );
    const maxAttempts = Number.isInteger(rawMaximumAttempts)
      ? Math.max(attemptNumber, rawMaximumAttempts)
      : 99;
    const updatedAt = validTimestamp(
      source.updatedAt || source.gradedAt || source.grade?.updatedAt,
      "",
    );
    const publishedAt = validTimestamp(
      source.publishedAt || source.grade?.publishedAt,
      "",
    );
    const workflowStatus = normalizeSubmissionWorkflowStatus(
      source.workflowStatus || source.workflow_status || source.status,
      publishedAt,
    );
    const moduleId = scalarLabel(
      source.moduleId || source.module_id || source.assignment?.moduleId,
    );
    const rawModuleNumber = Number(
      source.moduleNumber ??
        source.module_number ??
        source.assignment?.moduleNumber,
    );
    const moduleNumber = Number.isInteger(rawModuleNumber)
      ? rawModuleNumber
      : null;
    const currentMessages = normalizeSubmissionMessages(
      source.messages || source.interactionMessages || source.thread,
      attemptNumber,
    );
    const resubmissionAllowed =
      source.resubmissionAllowed === true ||
      source.resubmission_allowed === true ||
      workflowStatus === "revision_requested";
    const fallbackVersion = {
      attemptNumber,
      fileName,
      submittedAt,
      receiptId,
      fileReceiptId: scalarLabel(
        source.fileReceiptId || source.driveFileId || primaryFile.id,
      ),
      fileSize: Number(
        source.fileSize ?? primaryFile.sizeBytes ?? primaryFile.size ?? 0,
      ),
      fileType: scalarLabel(
        source.fileType || source.mimeType || primaryFile.mimeType,
      ),
      fileUrl,
    };
    const history = (historySource.length ? historySource : [fallbackVersion])
      .map((version) =>
        normalizeSubmissionVersion(version, {
          ...fallbackVersion,
          attemptNumber: null,
        }),
      )
      .sort((left, right) => {
        const leftTime = Date.parse(left.submittedAt || "");
        const rightTime = Date.parse(right.submittedAt || "");
        if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
          return leftTime - rightTime;
        }
        return 0;
      })
      .map((version, versionIndex) => {
        const versionAttemptNumber =
          positiveAttemptNumber(version.attemptNumber) || versionIndex + 1;
        return {
          ...version,
          attemptNumber: versionAttemptNumber,
          messages: (version.messages || []).map((message) => ({
            ...message,
            attemptNumber:
              positiveAttemptNumber(message.attemptNumber) ||
              versionAttemptNumber,
          })),
        };
      });
    const messages = [
      ...new Map(
        [...history.flatMap((version) => version.messages || []), ...currentMessages].map(
          (message) => [
            message.id ||
              `${message.authorRole}:${message.createdAt}:${message.body}:${message.attemptNumber || ""}`,
            message,
          ],
        ),
      ).values(),
    ].sort((a, b) => {
      const aTime = Date.parse(a.createdAt || "");
      const bTime = Date.parse(b.createdAt || "");
      if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;
      return Number(a.attemptNumber || 0) - Number(b.attemptNumber || 0);
    });
    return {
      id:
        scalarLabel(source.submissionId || source.id) ||
        `${studentEmail || "student"}:${assignmentId}:${index}`,
      student: {
        id: studentId || studentEmail || `student-${index + 1}`,
        firstName: firstName || defaultStudent?.firstName || "",
        lastName: lastName || defaultStudent?.lastName || "",
        displayName,
        email: studentEmail,
        role: "student",
      },
      assignmentId,
      attemptNumber,
      moduleId,
      moduleNumber,
      courseId: course?.id || courseId || assignment?.courseId || "",
      assignmentMeta: {
        title: scalarLabel(
          source.assignmentTitle || source.assignment?.title,
        ),
        unit: scalarLabel(
          source.unit || source.unitCode || source.assignment?.unit,
        ),
        unitTitle: scalarLabel(
          source.unitTitle || source.assignment?.unitTitle,
        ),
      },
      courseMeta: {
        code: scalarLabel(source.courseCode || source.course?.code),
        title: scalarLabel(source.courseTitle || source.course?.title),
      },
      submission: {
        id:
          scalarLabel(source.submissionId || source.id) ||
          scalarLabel(source.receiptId),
        delivery:
          fileName || fallbackVersion.fileReceiptId || fileUrl
            ? "lotus"
            : "central",
        attemptNumber,
        maxAttempts,
        text: scalarLabel(source.note || source.text || source.comment),
        fileName,
        submittedAt,
        receiptId,
        fileReceiptId: fallbackVersion.fileReceiptId,
        fileSize: fallbackVersion.fileSize,
        fileType: fallbackVersion.fileType,
        fileUrl,
        status: workflowStatus,
        workflowStatus,
        resubmissionAllowed,
        moduleId,
        moduleNumber,
        messages,
        score,
        feedback: scalarLabel(
          source.feedback || source.teacherFeedback || source.grade?.feedback,
        ),
        rubric: Array.isArray(source.grade?.rubric) ? source.grade.rubric : null,
        gradedBy: scalarLabel(source.gradedBy || source.grade?.gradedBy),
        gradedByDisplayName: scalarLabel(
          source.gradedByDisplayName || source.grade?.gradedByDisplayName,
        ),
        gradeEtag: scalarLabel(source.etag || source.grade?.etag),
        gradeVersion: Number.isInteger(
          Number(source.version ?? source.grade?.version),
        )
          ? Number(source.version ?? source.grade?.version)
          : null,
        gradedAt: validTimestamp(
          source.gradedAt || source.grade?.gradedAt,
          score != null ? updatedAt : "",
        ),
        publishedAt,
        updatedAt,
        history,
      },
    };
  }

  function normalizeRemoteSubmissions(payload, defaultStudent = null) {
    const extracted = extractSubmissionItems(payload);
    return {
      found: extracted.found,
      records: extracted.items
        .map((item, index) =>
          normalizeRemoteSubmission(item, index, defaultStudent),
        )
        .filter(Boolean),
    };
  }

  function submissionVersionNumber(submission) {
    const history = Array.isArray(submission?.history)
      ? submission.history
      : [];
    const numberedAttempts = [
      positiveAttemptNumber(submission?.attemptNumber),
      ...history.map((version) =>
        positiveAttemptNumber(version?.attemptNumber),
      ),
    ].filter(Boolean);
    return Math.max(
      numberedAttempts.length ? Math.max(...numberedAttempts) : 0,
      history.length,
      1,
    );
  }

  function safeSupportToken(value, maxLength = 128) {
    if (!["string", "number"].includes(typeof value)) return "";
    const token = String(value).trim();
    if (!token || token.length > maxLength) return "";
    return /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(token) ? token : "";
  }

  function safeUploadFailureMessage(error) {
    if (error?.name === "AbortError") {
      return "The upload timed out. Your work was not submitted.";
    }
    const requestId = safeSupportToken(error?.requestId);
    const code = safeSupportToken(error?.code, 64);
    const diagnostic = [
      requestId ? `Reference: ${requestId}` : "",
      code ? `Code: ${code}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    return `The service could not complete the upload. Your work was not submitted.${
      diagnostic ? ` ${diagnostic}.` : ""
    }`;
  }

  async function requestSubmissionEndpoint(endpoint, options = {}) {
    const url = configuredDriveUrl(endpoint);
    if (!url) throw new Error("Submission service is not configured.");
    const requestGeneration = platformSessionGeneration;
    const requestScopeKey = submissionScopeKey();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    const method = String(options.method || "GET").toUpperCase();
    const csrfToken = currentCsrfToken();
    const headers = {
      Accept: "application/json",
      ...(method !== "GET" && csrfToken
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...(options.headers || {}),
    };
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }
    try {
      const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers,
        signal: controller.signal,
      });
      const headerRequestId = safeSupportToken(
        response.headers?.get?.("X-Request-ID"),
      );
      const text = response.status === 204 ? "" : await response.text();
      let payload = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          if (response.ok) {
            const error = new Error(
              "The submission service returned invalid JSON.",
            );
            error.requestId = headerRequestId;
            throw error;
          }
        }
      }
      if (!platformSessionMatches(requestGeneration, requestScopeKey)) {
        const error = new Error(
          "The account changed while the request was in progress.",
        );
        error.name = "StaleSessionError";
        throw error;
      }
      if (!response.ok) {
        if (response.status === 401) expireRemoteSession();
        const error = new Error(
          payload?.error?.message ||
            payload?.message ||
            `Submission service request failed (${response.status}).`,
        );
        error.status = response.status;
        error.code = safeSupportToken(payload?.error?.code, 64);
        error.requestId =
          safeSupportToken(payload?.error?.requestId) ||
          safeSupportToken(payload?.requestId) ||
          headerRequestId;
        throw error;
      }
      return payload;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function upsertRemoteSubmission(record) {
    if (!record) return;
    const index = remoteSubmissionsState.records.findIndex(
      (item) =>
        (record.id && item.id === record.id) ||
        (item.assignmentId === record.assignmentId &&
          studentRecordKey(item.student) === studentRecordKey(record.student)),
    );
    if (index >= 0) {
      const current = remoteSubmissionsState.records[index];
      remoteSubmissionsState.records[index] = {
        ...current,
        ...record,
        student: { ...current.student, ...record.student },
        submission: { ...current.submission, ...record.submission },
      };
    } else {
      remoteSubmissionsState.records.push(record);
    }
  }

  function remoteSubmissionFor(assignmentId, user = currentUser()) {
    if (!user || isTeacher(user)) return null;
    return (
      remoteSubmissionsState.records.find(
        (record) =>
          record.assignmentId === assignmentId &&
          (!record.student.email ||
            normalizeEmail(record.student.email) ===
              normalizeEmail(user.email)),
      )?.submission || null
    );
  }

  function localSubmissionForAssignment(assignmentId, user = currentUser()) {
    return (
      user && normalizeEmail(user.email) !== normalizeEmail(currentUser()?.email)
        ? loadState(user).submissions?.[assignmentId] || null
        : state?.submissions?.[assignmentId] || null
    );
  }

  function localDeviceDraftForAssignment(
    assignmentId,
    user = currentUser(),
  ) {
    const localSubmission = localSubmissionForAssignment(assignmentId, user);
    return localSubmission?.delivery === "device"
      ? localSubmission
      : null;
  }

  function submissionForAssignment(assignmentId, user = currentUser()) {
    const localSubmission = localSubmissionForAssignment(assignmentId, user);
    const remoteSubmission = submissionsEndpointUrl()
      ? remoteSubmissionFor(assignmentId, user)
      : null;
    if (!remoteSubmission) return localSubmission;
    return remoteSubmission;
  }

  async function refreshRemoteSubmissions({ silent = false } = {}) {
    const user = currentUser();
    const scope = isTeacher(user) ? "teacher" : "student";
    const endpoint = submissionsEndpointUrl(scope);
    const scopeKey = submissionScopeKey(user);
    const requestGeneration = platformSessionGeneration;
    if (!user || !endpoint || submissionsRequestInFlight) return false;
    submissionsRequestInFlight = true;
    submissionsEndpointCheckedFor = scopeKey;
    const focusedFieldId = document.activeElement?.id || "";
    captureVisibleGradingDraft();
    if (!silent) render(false, true);
    try {
      let pageUrl = endpoint;
      let pageCount = 0;
      let found = false;
      const loadedRecords = [];
      while (pageUrl && pageCount < 50) {
        const payload = await requestSubmissionEndpoint(pageUrl);
        const normalized = normalizeRemoteSubmissions(
          payload,
          isTeacher(user) ? null : user,
        );
        if (!normalized.found) {
          throw new Error(
            "The submission service returned an unsupported response.",
          );
        }
        found = true;
        loadedRecords.push(...normalized.records);
        pageUrl = nextPageUrl(pageUrl, payload);
        pageCount += 1;
      }
      if (!found) throw new Error("No submission response was returned.");
      const uniqueRecords = collapseRemoteSubmissionRecords(loadedRecords);
      const records = isTeacher(user)
        ? uniqueRecords
        : uniqueRecords.filter(
            (record) =>
              !record.student.email ||
              normalizeEmail(record.student.email) ===
                normalizeEmail(user.email),
          );
      remoteSubmissionsState = {
        records,
        error: "",
        lastLoadedAt: new Date().toISOString(),
      };
      return true;
    } catch (error) {
      if (
        error?.name === "StaleSessionError" ||
        !platformSessionMatches(requestGeneration, scopeKey)
      ) {
        return false;
      }
      remoteSubmissionsState = {
        ...remoteSubmissionsState,
        error:
          error?.name === "AbortError"
            ? "The submission service did not respond in time."
            : error?.message || "Submissions could not be loaded.",
      };
      return false;
    } finally {
      if (platformSessionMatches(requestGeneration, scopeKey)) {
        submissionsRequestInFlight = false;
        captureVisibleGradingDraft();
        const rendered = renderAfterBackgroundRefresh();
        if (rendered && focusedFieldId) {
          window.requestAnimationFrame(() =>
            document.querySelector(`#${focusedFieldId}`)?.focus(),
          );
        }
      }
    }
  }

  function platformEndpoint(base, suffix = "") {
    const configured = configuredDriveUrl(base);
    if (!configured) return "";
    const root = configured.endsWith("/") ? configured : `${configured}/`;
    return configuredDriveUrl(String(suffix || ""), root);
  }

  function courseModulesEndpoint(course) {
    return platformEndpoint(
      PLATFORM_API_CONFIG.coursesEndpoint,
      `${encodeURIComponent(course.code)}/modules`,
    );
  }

  function courseAssignmentsEndpoint(course) {
    return platformEndpoint(
      PLATFORM_API_CONFIG.coursesEndpoint,
      `${encodeURIComponent(course.code)}/assignments`,
    );
  }

  function studentProgressEndpoint(course) {
    const endpoint = configuredDriveUrl(
      PLATFORM_API_CONFIG.studentProgressEndpoint,
    );
    if (!endpoint) return "";
    const url = new URL(endpoint);
    url.searchParams.set("courseCode", course.code);
    return url.toString();
  }

  function studentGradesEndpoint(course) {
    const endpoint = configuredDriveUrl(
      PLATFORM_API_CONFIG.studentGradesEndpoint,
    );
    if (!endpoint) return "";
    const url = new URL(endpoint);
    url.searchParams.set("courseCode", course.code);
    return url.toString();
  }

  function teacherCourseEndpoint(course, resource) {
    return platformEndpoint(
      PLATFORM_API_CONFIG.teacherCoursesEndpoint,
      `${encodeURIComponent(course.code)}/${resource}`,
    );
  }

  async function requestPlatformJson(endpoint, options = {}) {
    const url = configuredDriveUrl(endpoint);
    if (!url) throw new Error("The secure course service is not connected.");
    const requestGeneration = platformSessionGeneration;
    const requestScopeKey = submissionScopeKey();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    const method = String(options.method || "GET").toUpperCase();
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const csrfToken = currentCsrfToken();
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
    }
    try {
      const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include",
        mode: "cors",
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!platformSessionMatches(requestGeneration, requestScopeKey)) {
        const error = new Error(
          "The account changed while the request was in progress.",
        );
        error.name = "StaleSessionError";
        throw error;
      }
      saveCsrfToken(payload);
      if (response.status === 401) expireRemoteSession();
      if (!response.ok) {
        throw new Error(
          payload?.error?.message || payload?.message || "The request failed.",
        );
      }
      return payload;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function platformPayloadData(payload, fallback) {
    return payload?.data ?? fallback;
  }

  function notificationActionHref(value) {
    const candidate = String(value || "").trim();
    if (/^#\/[a-z0-9/_?&=%.-]+$/i.test(candidate)) return candidate;
    try {
      const url = new URL(candidate, window.location.href);
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        /^#\/[a-z0-9/_?&=%.-]+$/i.test(url.hash)
      ) {
        return url.hash;
      }
    } catch {
      // Invalid or external action destinations intentionally fall back.
    }
    return "#/notifications";
  }

  function normalizeNotification(record, index = 0) {
    if (!record || typeof record !== "object") return null;
    const id = scalarLabel(record.id || record.notificationId);
    const title = scalarLabel(record.title);
    const body = scalarLabel(record.body || record.message);
    if (!id || (!title && !body)) return null;
    return {
      id,
      eventType: scalarLabel(
        record.eventType || record.event_type || record.type || "update",
      ),
      title: title || "Learning update",
      body,
      actionUrl: notificationActionHref(
        record.actionUrl || record.action_url || record.href,
      ),
      readAt: validTimestamp(record.readAt || record.read_at, ""),
      createdAt: validTimestamp(
        record.createdAt || record.created_at,
        new Date(Date.now() - index).toISOString(),
      ),
    };
  }

  function notificationItems() {
    return [...platformRuntime.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  function unreadNotificationCount() {
    const authoritative = Number(platformRuntime.notificationsUnreadCount);
    return Number.isInteger(authoritative) && authoritative >= 0
      ? authoritative
      : notificationItems().filter((item) => !item.readAt).length;
  }

  async function ensureNotifications({ force = false } = {}) {
    if (!currentUser()) return false;
    const requestGeneration = platformSessionGeneration;
    const requestScopeKey = submissionScopeKey();
    const endpoint = configuredDriveUrl(
      PLATFORM_API_CONFIG.notificationsEndpoint,
    );
    if (!endpoint) {
      platformRuntime.notificationsLoaded = true;
      return false;
    }
    if (platformRuntime.notificationsLoading) return false;
    if (platformRuntime.notificationsError && !force) return false;
    if (platformRuntime.notificationsLoaded && !force) return true;
    platformRuntime.notificationsLoading = true;
    if (force) platformRuntime.notificationsError = "";
    try {
      const firstPage = new URL(endpoint);
      firstPage.searchParams.set("limit", "100");
      let pageUrl = firstPage.toString();
      let pageCount = 0;
      let unreadCount = null;
      const loadedRecords = [];
      while (pageUrl && pageCount < 50) {
        const payload = await requestPlatformJson(pageUrl);
        const source = platformPayloadData(payload, []);
        const records = Array.isArray(source)
          ? source
          : Array.isArray(source?.notifications)
            ? source.notifications
            : null;
        if (!Array.isArray(records)) {
          throw new Error(
            "The notification service returned an invalid response.",
          );
        }
        loadedRecords.push(...records);
        const pageUnreadCount = Number(payload?.unreadCount);
        if (Number.isInteger(pageUnreadCount) && pageUnreadCount >= 0) {
          unreadCount = pageUnreadCount;
        }
        pageUrl = nextPageUrl(pageUrl, payload);
        pageCount += 1;
      }
      platformRuntime.notifications = [
        ...new Map(
          loadedRecords
            .map(normalizeNotification)
            .filter(Boolean)
            .map((notification) => [notification.id, notification]),
        ).values(),
      ];
      platformRuntime.notificationsUnreadCount =
        unreadCount ??
        platformRuntime.notifications.filter((item) => !item.readAt).length;
      platformRuntime.notificationsLoaded = true;
      platformRuntime.notificationsError = "";
      return true;
    } catch (error) {
      if (
        error?.name === "StaleSessionError" ||
        !platformSessionMatches(requestGeneration, requestScopeKey)
      ) {
        return false;
      }
      platformRuntime.notificationsError =
        error?.message || "Notifications could not be loaded.";
      return false;
    } finally {
      if (platformSessionMatches(requestGeneration, requestScopeKey)) {
        platformRuntime.notificationsLoading = false;
        renderAfterBackgroundRefresh();
      }
    }
  }

  function notificationEndpointFor(id = "") {
    const endpoint = configuredDriveUrl(
      PLATFORM_API_CONFIG.notificationsEndpoint,
    );
    return id
      ? platformEndpoint(endpoint, encodeURIComponent(id))
      : endpoint;
  }

  function notificationAssignmentId(notification) {
    const match = String(notification?.actionUrl || "").match(
      /^#\/assignment\/([^/?#]+)/i,
    );
    return match ? safeDecode(match[1]) : "";
  }

  function unreadGradeNotificationsForAssignment(assignmentId = "") {
    return notificationItems().filter((notification) => {
      const eventType = String(notification.eventType || "")
        .toLowerCase()
        .replace(/[.-]+/g, "_");
      return (
        !notification.readAt &&
        ["grade_published", "feedback_published", "submission_graded"].includes(
          eventType,
        ) &&
        (!assignmentId ||
          notificationAssignmentId(notification) === assignmentId)
      );
    });
  }

  async function markNotificationRead(id) {
    const endpoint = notificationEndpointFor(id);
    if (!id || !endpoint) {
      throw new Error("The notification service is not connected.");
    }
    const payload = await requestPlatformJson(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
    const returned = normalizeNotification(
      platformPayloadData(payload, null),
    );
    const unreadCount = Number(payload?.unreadCount);
    if (Number.isInteger(unreadCount) && unreadCount >= 0) {
      platformRuntime.notificationsUnreadCount = unreadCount;
    }
    const notification = platformRuntime.notifications.find(
      (item) => item.id === id,
    );
    if (notification) {
      notification.readAt = returned?.readAt || new Date().toISOString();
    }
    return notification;
  }

  function mergeRemoteAssignments(course, records) {
    if (!Array.isArray(records)) return;
    platformRuntime.assignments[course.code] = records;
    records.forEach((record) => {
      const id = String(record?.id || "").trim().toLowerCase();
      if (!id) return;
      const assignment = ASSIGNMENTS.find((item) => item.id === id);
      if (!assignment) return;
      assignment.instructions = record.instructions || assignment.instructions;
      assignment.rubric = Array.isArray(record.rubric) && record.rubric.length
        ? record.rubric
        : assignment.rubric;
      assignment.weightPercent = Number(
        record.weightPercent ?? assignment.weightPercent,
      );
      assignment.submissionMode =
        record.submissionMode || assignment.submissionMode;
      assignment.status = record.status || assignment.status;
      const matchedModule =
        findPlatformModule(course, record.moduleKey) ||
        findPlatformModule(course, record.moduleNumber) ||
        findPlatformModule(course, record.moduleId);
      assignment.moduleKey =
        matchedModule?.key || assignment.moduleKey || record.moduleKey;
      assignment.sectionKind =
        record.sectionKind || assignment.sectionKind || "unit";
      assignment.sectionLabel =
        record.sectionLabel ||
        (assignment.sectionKind === "final_evaluation"
          ? "Final Evaluation"
          : assignment.sectionLabel);
      assignment.curriculumUnitNumber =
        record.curriculumUnitNumber != null &&
        Number.isInteger(Number(record.curriculumUnitNumber))
          ? Number(record.curriculumUnitNumber)
          : null;
      assignment.unitNumber =
        assignment.sectionKind === "final_evaluation"
          ? null
          : assignment.curriculumUnitNumber ??
            (record.unitNumber != null &&
            Number.isInteger(Number(record.unitNumber))
              ? Number(record.unitNumber)
              : assignment.unitNumber);
      assignment.unit =
        assignment.sectionLabel ||
        (assignment.unitNumber != null
          ? `Unit ${assignment.unitNumber}`
          : assignment.unit);
      assignment.moduleNumber =
        record.moduleNumber != null && Number.isInteger(Number(record.moduleNumber))
        ? Number(record.moduleNumber)
        : assignment.moduleNumber;
      assignment.due = record.dueAt || "";
      assignment.availableFrom = record.availableFrom || "";
      assignment.availableUntil = record.availableUntil || "";
      assignment.remoteModuleId = record.moduleId || "";
    });
  }

  function loadPlatformData(key, loader) {
    if (platformRequests.has(key)) return platformRequests.get(key);
    const requestGeneration = platformSessionGeneration;
    const requestScopeKey = submissionScopeKey();
    const request = Promise.resolve()
      .then(loader)
      .catch((error) => {
        if (
          error?.name === "StaleSessionError" ||
          !platformSessionMatches(requestGeneration, requestScopeKey)
        ) {
          return;
        }
        platformRuntime.errors[key] =
          error?.name === "AbortError"
            ? "The course service timed out."
            : error?.message || "Course data could not be loaded.";
      })
      .finally(() => {
        if (!platformSessionMatches(requestGeneration, requestScopeKey)) return;
        platformRequests.set(key, Promise.resolve());
        renderAfterBackgroundRefresh();
      });
    platformRequests.set(key, request);
    return request;
  }

  function optionalPlatformPayload(error) {
    if (error?.name === "StaleSessionError") throw error;
    return { data: [] };
  }

  function ensureStudentPlatformData(course) {
    if (!course?.platformModules?.length) return;
    const endpoint = studentProgressEndpoint(course);
    const modulesEndpoint = courseModulesEndpoint(course);
    if (!endpoint || !modulesEndpoint) return;
    const key = `student-progress:${course.code}`;
    if (platformRequests.has(key)) return;
    void loadPlatformData(key, async () => {
      const [
        progressPayload,
        modulesPayload,
        assignmentsPayload,
        gradesPayload,
      ] = await Promise.all([
        requestPlatformJson(endpoint),
        requestPlatformJson(modulesEndpoint),
        requestPlatformJson(courseAssignmentsEndpoint(course)).catch(
          optionalPlatformPayload,
        ),
        requestPlatformJson(studentGradesEndpoint(course)).catch(
          optionalPlatformPayload,
        ),
      ]);
      const records = platformPayloadData(progressPayload, []);
      platformRuntime.studentProgress[course.code] = Array.isArray(records)
        ? records
        : [];
      const modules = platformPayloadData(modulesPayload, []);
      platformRuntime.modules[course.code] = Array.isArray(modules)
        ? modules
        : [];
      mergeRemoteAssignments(
        course,
        platformPayloadData(assignmentsPayload, []),
      );
      const grades = platformPayloadData(gradesPayload, []);
      platformRuntime.studentGrades[course.code] = Array.isArray(grades)
        ? grades.filter((grade) => Boolean(grade?.publishedAt))
        : [];
      delete platformRuntime.errors[key];
    });
  }

  function ensureTeacherPlatformData(course) {
    if (!course?.platformModules?.length) return;
    const rosterEndpoint = teacherCourseEndpoint(course, "roster");
    const progressEndpoint = teacherCourseEndpoint(course, "progress");
    const gradebookEndpoint = teacherCourseEndpoint(course, "gradebook");
    const modulesEndpoint = courseModulesEndpoint(course);
    if (modulesEndpoint) {
      const key = `teacher-modules:${course.code}`;
      if (!platformRequests.has(key)) {
        void loadPlatformData(key, async () => {
          const [payload, assignmentsPayload] = await Promise.all([
            requestPlatformJson(modulesEndpoint),
            requestPlatformJson(courseAssignmentsEndpoint(course)).catch(
              optionalPlatformPayload,
            ),
          ]);
          const records = platformPayloadData(payload, []);
          platformRuntime.modules[course.code] = Array.isArray(records)
            ? records
            : [];
          mergeRemoteAssignments(
            course,
            platformPayloadData(assignmentsPayload, []),
          );
          delete platformRuntime.errors[key];
        });
      }
    }
    if (rosterEndpoint) {
      const key = `teacher-roster:${course.code}`;
      if (!platformRequests.has(key)) {
        void loadPlatformData(key, async () => {
          const payload = await requestPlatformJson(rosterEndpoint);
          const records = platformPayloadData(payload, []);
          platformRuntime.teacherRosters[course.code] = Array.isArray(records)
            ? records
            : [];
          delete platformRuntime.errors[key];
        });
      }
    }
    if (progressEndpoint) {
      const key = teacherProgressRequestKey(course);
      if (!platformRequests.has(key)) {
        delete platformRuntime.teacherProgress[course.code];
        void loadPlatformData(key, async () => {
          const payload = await requestPlatformJson(progressEndpoint);
          const record = platformPayloadData(payload, null);
          if (
            !record ||
            typeof record !== "object" ||
            !Array.isArray(record.students) ||
            String(record.courseCode || "").toUpperCase() !== course.code
          ) {
            throw new Error(
              "The official course progress response was not valid.",
            );
          }
          platformRuntime.teacherProgress[course.code] = {
            courseCode: course.code,
            loadedAt: new Date().toISOString(),
            students: record.students
              .filter(
                (student) => student && typeof student === "object",
              )
              .map((student) => ({
                studentId: String(student.studentId || ""),
                displayName: String(student.displayName || ""),
                email: String(student.email || ""),
                modules: Array.isArray(student.modules)
                  ? student.modules.filter(
                      (module) => module && typeof module === "object",
                    )
                  : [],
              })),
          };
          delete platformRuntime.errors[key];
        });
      }
    }
    if (gradebookEndpoint) {
      const key = `teacher-gradebook:${course.code}`;
      if (!platformRequests.has(key)) {
        void loadPlatformData(key, async () => {
          const payload = await requestPlatformJson(gradebookEndpoint);
          const record = platformPayloadData(payload, {});
          platformRuntime.teacherGradebooks[course.code] =
            record && typeof record === "object" ? record : {};
          delete platformRuntime.errors[key];
        });
      }
    }
  }

  function collapseRemoteSubmissionRecords(records) {
    const groups = new Map();
    for (const record of records) {
      const key = `${studentRecordKey(record.student)}:${record.courseId}:${record.assignmentId}`;
      const current = groups.get(key);
      if (!current) {
        groups.set(key, record);
        continue;
      }
      const recordAttempt = Number(record.attemptNumber || 1);
      const currentAttempt = Number(current.attemptNumber || 1);
      const recordTime = new Date(record.submission.submittedAt || 0).getTime();
      const currentTime = new Date(current.submission.submittedAt || 0).getTime();
      const latest =
        recordAttempt > currentAttempt ||
        (recordAttempt === currentAttempt && recordTime > currentTime)
          ? record
          : current;
      const history = [
        ...(current.submission.history || []),
        ...(record.submission.history || []),
      ];
      const uniqueHistory = [
        ...new Map(
          history.map((version) => [
            version.receiptId ||
              `${version.submittedAt}:${version.fileReceiptId}:${version.fileName}`,
            version,
          ]),
        ).values(),
      ].sort(
        (a, b) =>
          new Date(a.submittedAt || 0).getTime() -
          new Date(b.submittedAt || 0).getTime(),
      );
      groups.set(key, {
        ...latest,
        submission: { ...latest.submission, history: uniqueHistory },
      });
    }
    return [...groups.values()];
  }

  function serverAuthReady() {
    return Boolean(
      configuredAuthUrl(AUTH_CONFIG.loginEndpoint) &&
        configuredAuthUrl(AUTH_CONFIG.workspaceSessionEndpoint),
    );
  }

  function apiAvailabilityMessage(fallback) {
    return API_STATUS.state === "ready"
      ? ""
      : API_STATUS.message || fallback;
  }

  function authenticatedUserFrom(payload) {
    if (!payload || typeof payload !== "object") return null;
    const source =
      payload.user || payload.data?.user || payload.data || payload;
    const authenticated =
      payload.authenticated ?? payload.data?.authenticated ?? source.authenticated;
    if (authenticated === false || !source || typeof source !== "object") {
      return null;
    }
    const email = normalizeEmail(source.email || payload.email);
    const serverRole = String(source.role || payload.role || "").toLowerCase();
    const role = serverRole;
    if (!email || !["student", "teacher", "teacher_admin"].includes(role)) {
      return null;
    }
    const firstName = String(source.firstName || "").trim();
    const lastName = String(source.lastName || "").trim();
    return {
      id: scalarLabel(source.id || source.userId),
      email,
      role,
      firstName,
      lastName,
      displayName:
        String(source.displayName || source.name || "").trim() ||
        `${firstName} ${lastName}`.trim() ||
        email,
      accountType: ["teacher", "teacher_admin"].includes(role)
        ? "faculty"
        : "personal",
    };
  }

  async function requestAuthEndpoint(endpoint, options = {}) {
    const url = configuredAuthUrl(endpoint);
    if (!url) throw new Error("The secure sign-in service is not configured.");
    const {
      timeout: timeoutMs = 10000,
      skipSessionExpiry = false,
      ...requestOptions
    } = options;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      Number(timeoutMs),
    );
    const method = String(requestOptions.method || "GET").toUpperCase();
    const csrfToken = currentCsrfToken();
    const headers = {
      Accept: "application/json",
      ...(method !== "GET" && csrfToken
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...(requestOptions.headers || {}),
    };
    if (requestOptions.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    try {
      const response = await fetch(url, {
        credentials: "include",
        ...requestOptions,
        headers,
        signal: controller.signal,
      });
      const text = response.status === 204 ? "" : await response.text();
      let payload = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = {};
        }
      }
      if (!response.ok) {
        if (response.status === 401 && !skipSessionExpiry) {
          expireRemoteSession();
        }
        const message =
          payload?.error?.message ||
          payload?.message ||
          (response.status === 401
            ? "The email or password is incorrect."
            : `The sign-in service returned ${response.status}.`);
        const error = new Error(message);
        error.status = response.status;
        error.code = payload?.error?.code || "";
        throw error;
      }
      saveCsrfToken(payload);
      return payload;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function courseIdsFromCodes(courseCodes) {
    return [...new Set(courseCodes)]
      .map((code) => findCourse(String(code || "").toLowerCase())?.id)
      .filter((id) => id && SELECTABLE_COURSE_IDS.includes(id));
  }

  function courseCodesFromIds(courseIds) {
    return [...new Set(courseIds)]
      .map((id) => findCourse(id)?.code)
      .filter(Boolean);
  }

  async function refreshRemoteEnrollments() {
    const endpoint = configuredAuthUrl(AUTH_CONFIG.enrollmentsEndpoint);
    if (!endpoint || !currentUser() || isTeacher()) return false;
    const payload = await requestAuthEndpoint(endpoint.toString());
    const courseCodes = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.courseCodes)
        ? payload.courseCodes
        : null;
    if (!courseCodes) {
      throw new Error("The enrollment service returned an invalid course list.");
    }
    state.enrolledCourseIds = courseIdsFromCodes(courseCodes);
    saveState();
    return true;
  }

  async function persistRemoteEnrollments(courseIds) {
    const endpoint = configuredAuthUrl(AUTH_CONFIG.enrollmentsEndpoint);
    if (!endpoint || !currentUser() || isTeacher()) return false;
    if (enrollmentSaveInFlight) {
      throw new Error("Your previous course change is still being saved.");
    }
    const body = JSON.stringify({ courseCodes: courseCodesFromIds(courseIds) });
    enrollmentSaveInFlight = true;
    try {
      await requestAuthEndpoint(endpoint.toString(), {
        method: "PUT",
        body,
      });
      return true;
    } finally {
      enrollmentSaveInFlight = false;
    }
  }

  function driveMaterialsReadReady() {
    return (
      DRIVE_CATALOG_STATUS.state === "ready" &&
      Boolean(configuredDriveUrl(PLATFORM_API_CONFIG.coursesEndpoint))
    );
  }

  function driveCatalogUnavailableMessage() {
    if (DRIVE_CATALOG_STATUS.state === "checking") {
      return "The secure course-material service is still being checked.";
    }
    return (
      DRIVE_CATALOG_STATUS.message ||
      "Course materials are temporarily unavailable. Courses and other learning tools remain available."
    );
  }

  function scalarLabel(value) {
    if (typeof value === "string" || typeof value === "number") {
      return String(value).trim();
    }
    if (value && typeof value === "object") {
      return String(
        value.name || value.title || value.label || value.code || value.id || "",
      ).trim();
    }
    return "";
  }

  function canonicalCourseId(value, path = "") {
    const candidate = scalarLabel(value).toLowerCase();
    const combined = `${candidate} ${String(path || "").toLowerCase()}`;
    const course = COURSES.find(
      (item) =>
        candidate === item.id ||
        candidate === item.code.toLowerCase() ||
        combined.includes(item.code.toLowerCase()) ||
        combined.includes(item.id),
    );
    return course?.id || candidate.replace(/[^a-z0-9_-]/g, "");
  }

  function extractDriveMaterialItems(payload) {
    if (Array.isArray(payload)) return { found: true, items: payload };
    if (!payload || typeof payload !== "object") {
      return { found: false, items: [] };
    }
    for (const key of ["materials", "records", "items", "files"]) {
      if (Array.isArray(payload[key])) {
        return { found: true, items: payload[key] };
      }
    }
    if (payload.data && payload.data !== payload) {
      return extractDriveMaterialItems(payload.data);
    }
    return { found: false, items: [] };
  }

  function normalizeDriveMaterial(raw, index, fallbackCourse = null) {
    if (!raw || typeof raw !== "object") return null;
    const path = String(raw.path || raw.folderPath || raw.relativePath || "");
    const pathParts = path
      .split(/[\\/]/)
      .map((part) => part.trim())
      .filter(Boolean);
    const courseId = canonicalCourseId(
      raw.courseId || raw.courseCode || raw.course || fallbackCourse?.code,
      path,
    );
    const course = findCourse(courseId);
    const name = scalarLabel(
      raw.name || raw.title || raw.fileName || raw.displayName,
    );
    if (!name) return null;
    const fileUrl = safeProtectedResourceUrl(raw.openUrl);
    const pathUnit =
      pathParts.find((part) => /^unit\s+\d+/i.test(part)) || "";
    const pathCategory =
      pathParts.find((part) =>
        ["lessons", "resources", "assignments", "assessments"].includes(
          part.toLowerCase(),
        ),
      ) || "";
    const explicitUnit = scalarLabel(
      raw.unitName || raw.unitTitle || raw.unit,
    );
    const rawUnitNumber = raw.unitNumber ?? raw.unit_number;
    const normalizedUnitNumber =
      rawUnitNumber !== null &&
      rawUnitNumber !== undefined &&
      String(rawUnitNumber).trim() !== "" &&
      Number.isInteger(Number(rawUnitNumber)) &&
      Number(rawUnitNumber) > 0
        ? Number(rawUnitNumber)
        : null;
    const rawUnit =
      (explicitUnit && explicitUnit !== "0" ? explicitUnit : "") ||
      (normalizedUnitNumber ? `Unit ${normalizedUnitNumber}` : "") ||
      pathUnit ||
      "Course Resources";
    const rawCategory =
      scalarLabel(raw.categoryName || raw.category || raw.type) ||
      pathCategory ||
      "General Resources";
    const modifiedAt = String(
      raw.modifiedTime ||
        raw.driveModifiedAt ||
        raw.modifiedAt ||
        raw.updatedAt ||
        "",
    ).trim();
    return {
      id: scalarLabel(raw.id || raw.fileId) || `material-${index}`,
      name,
      courseId: course?.id || courseId || "unassigned",
      courseCode:
        scalarLabel(raw.courseCode) ||
        course?.code ||
        fallbackCourse?.code ||
        scalarLabel(raw.course) ||
        "Unassigned",
      unit: rawUnit,
      category: rawCategory,
      mimeType: scalarLabel(raw.mimeType || raw.contentType),
      url: fileUrl,
      modifiedAt:
        modifiedAt && !Number.isNaN(new Date(modifiedAt).getTime())
          ? modifiedAt
          : "",
      size: Number.isFinite(Number(raw.size ?? raw.sizeBytes))
        ? Number(raw.size ?? raw.sizeBytes)
        : 0,
      description: scalarLabel(raw.description),
    };
  }

  function normalizeDrivePayload(payload, fallbackCourse = null) {
    const extracted = extractDriveMaterialItems(payload);
    const metadata =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : {};
    const nestedMetadata =
      metadata.data && typeof metadata.data === "object" ? metadata.data : {};
    const syncValue = String(
      metadata.lastSyncedAt ||
        metadata.lastSync ||
        metadata.syncedAt ||
        nestedMetadata.lastSyncedAt ||
        nestedMetadata.lastSync ||
        nestedMetadata.syncedAt ||
        "",
    ).trim();
    return {
      found: extracted.found,
      records: extracted.items
        .map((item, index) =>
          normalizeDriveMaterial(item, index, fallbackCourse),
        )
        .filter(Boolean),
      lastSyncedAt:
        syncValue && !Number.isNaN(new Date(syncValue).getTime())
          ? syncValue
          : "",
    };
  }

  function driveSourceCacheKey() {
    const sourceKey = DRIVE_CONFIG.sourceName;
    const session = readSession();
    const accountKey =
      session?.publicId || normalizeEmail(session?.email) || "anonymous";
    const role = ["student", "teacher", "teacher_admin"].includes(
      session?.role,
    )
      ? session.role
      : "anonymous";
    return `${sourceKey}::${role}:${accountKey}`;
  }

  function loadDriveMaterialsCache() {
    const fallback = {
      records: [],
      courseMetadata: {},
      lastSyncedAt: "",
      lastLoadedAt: "",
      error: "",
    };
    try {
      const saved = JSON.parse(localStorage.getItem(DRIVE_MATERIALS_CACHE_KEY));
      if (!saved || typeof saved !== "object" || !Array.isArray(saved.records)) {
        return fallback;
      }
      if (saved.sourceKey !== driveSourceCacheKey()) {
        return fallback;
      }
      return {
        ...fallback,
        records: saved.records
          .map((item, index) => normalizeDriveMaterial(item, index))
          .filter(Boolean),
        courseMetadata:
          saved.courseMetadata && typeof saved.courseMetadata === "object"
            ? saved.courseMetadata
            : {},
        lastSyncedAt:
          saved.lastSyncedAt &&
          !Number.isNaN(new Date(saved.lastSyncedAt).getTime())
            ? saved.lastSyncedAt
            : "",
        lastLoadedAt:
          saved.lastLoadedAt &&
          !Number.isNaN(new Date(saved.lastLoadedAt).getTime())
            ? saved.lastLoadedAt
            : "",
      };
    } catch {
      return fallback;
    }
  }

  function saveDriveMaterialsCache() {
    const cache = {
      sourceKey: driveSourceCacheKey(),
      records: driveMaterialsState.records,
      courseMetadata: driveMaterialsState.courseMetadata || {},
      lastSyncedAt: driveMaterialsState.lastSyncedAt,
      lastLoadedAt: driveMaterialsState.lastLoadedAt,
    };
    try {
      localStorage.setItem(DRIVE_MATERIALS_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // The in-memory material index remains available if storage is restricted.
    }
  }

  function resetDriveMaterialsForSession() {
    driveSessionGeneration += 1;
    driveRequestInFlight = false;
    driveEndpointChecked = false;
    driveMaterialsState = loadDriveMaterialsCache();
  }

  async function requestDriveJson(endpoint, options = {}) {
    const url = configuredDriveUrl(endpoint);
    if (!url) throw new Error("Drive endpoint is not configured.");
    const { timeoutMs = 8000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      Number(timeoutMs) || 8000,
    );
    const method = String(fetchOptions.method || "GET").toUpperCase();
    const csrfToken = currentCsrfToken();
    const headers = {
      Accept: "application/json",
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" && csrfToken
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...(fetchOptions.headers || {}),
    };
    try {
      const response = await fetch(url, {
        credentials: "include",
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 401) expireRemoteSession();
        throw new Error(`Drive request failed (${response.status}).`);
      }
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function normalizeCourseMaterialsCatalog(payload) {
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];
    return Object.fromEntries(
      rows
        .map((row) => {
          const code = scalarLabel(row?.code || row?.courseCode).toUpperCase();
          const course = COURSES.find((candidate) => candidate.code === code);
          const materials = row?.materials;
          if (!course || !materials || typeof materials !== "object") return null;
          const lastSyncedAt = String(materials.lastSyncedAt || "").trim();
          return [
            course.code,
            {
              count: Math.max(0, Number(materials.count) || 0),
              lastSyncedAt:
                lastSyncedAt &&
                !Number.isNaN(new Date(lastSyncedAt).getTime())
                  ? lastSyncedAt
                  : "",
              href: safeProtectedResourceUrl(materials.href),
            },
          ];
        })
        .filter(Boolean),
    );
  }

  function latestDriveTimestamp(values) {
    return values
      .filter((value) => value && !Number.isNaN(new Date(value).getTime()))
      .sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      )[0] || "";
  }

  async function readDriveMaterialPages(endpoint, fallbackCourse = null) {
    const firstUrl = new URL(configuredDriveUrl(endpoint));
    if (!firstUrl.searchParams.has("limit")) {
      firstUrl.searchParams.set("limit", "100");
    }
    let pageUrl = firstUrl.toString();
    let pageCount = 0;
    let lastSyncedAt = "";
    const records = [];
    while (pageUrl && pageCount < 50) {
      const payload = await requestDriveJson(pageUrl);
      const normalized = normalizeDrivePayload(payload, fallbackCourse);
      if (!normalized.found) {
        throw new Error(
          "The materials endpoint returned an unsupported response.",
        );
      }
      records.push(...normalized.records);
      lastSyncedAt = normalized.lastSyncedAt || lastSyncedAt;
      pageUrl = nextPageUrl(pageUrl, payload);
      pageCount += 1;
    }
    return { records, lastSyncedAt };
  }

  async function refreshDriveMaterials({ silent = false } = {}) {
    const catalogEndpoint = configuredDriveUrl(
      PLATFORM_API_CONFIG.coursesEndpoint,
    );
    if (
      driveRequestInFlight ||
      !driveMaterialsReadReady() ||
      !catalogEndpoint
    ) {
      return false;
    }
    const requestGeneration = driveSessionGeneration;
    driveRequestInFlight = true;
    driveEndpointChecked = true;
    driveMaterialsState.error = "";
    if (!silent) render(false, true);
    try {
      let courseMetadata = {};
      let pageResults = [];
      if (catalogEndpoint) {
        const catalogPayload = await requestDriveJson(catalogEndpoint);
        courseMetadata = normalizeCourseMaterialsCatalog(catalogPayload);
        const targets = Object.entries(courseMetadata)
          .filter(([, metadata]) => metadata.href)
          .map(([courseCode, metadata]) => ({
            course: COURSES.find((candidate) => candidate.code === courseCode),
            endpoint: metadata.href,
          }))
          .filter((target) => target.course);
        if (targets.length) {
          pageResults = await Promise.all(
            targets.map((target) =>
              readDriveMaterialPages(target.endpoint, target.course),
            ),
          );
        }
      }
      const records = pageResults.flatMap((result) => result.records);
      const lastSyncedAt = latestDriveTimestamp([
        ...Object.values(courseMetadata).map(
          (metadata) => metadata.lastSyncedAt,
        ),
        ...pageResults.map((result) => result.lastSyncedAt),
      ]);
      if (requestGeneration !== driveSessionGeneration) return false;
      driveMaterialsState = {
        records: [
          ...new Map(records.map((record) => [record.id, record])).values(),
        ],
        courseMetadata,
        lastSyncedAt:
          lastSyncedAt ||
          (Object.keys(courseMetadata).length
            ? ""
            : driveMaterialsState.lastSyncedAt),
        lastLoadedAt: new Date().toISOString(),
        error: "",
      };
      saveDriveMaterialsCache();
      return true;
    } catch (error) {
      if (requestGeneration !== driveSessionGeneration) return false;
      driveMaterialsState.error =
        error?.name === "AbortError"
          ? "The Drive service did not respond within 8 seconds."
          : error?.message || "The Drive materials could not be loaded.";
      return false;
    } finally {
      if (requestGeneration === driveSessionGeneration) {
        driveRequestInFlight = false;
        const route = routeParts();
        if (
            (isTeacher() &&
              ["course", "courses", "materials"].includes(route[1])) ||
            (!isTeacher() &&
              [
                "course",
                "courses",
                "guide",
                "syllabus",
                "assessments",
                "assignments",
              ].includes(route[0]))
          ) {
          render(false, true);
        }
      }
    }
  }

  async function syncDriveMaterials() {
    if (
      !isTeacherAdmin() ||
      !DRIVE_CONFIG.sourceConfigured ||
      !configuredDriveUrl(DRIVE_CONFIG.syncEndpoint) ||
      driveRequestInFlight
    ) {
      return;
    }
    const requestGeneration = driveSessionGeneration;
    driveRequestInFlight = true;
    driveMaterialsState.error = "";
    render();
    try {
      const payload = await requestDriveJson(DRIVE_CONFIG.syncEndpoint, {
        method: "POST",
        headers: { "Idempotency-Key": requestIdFor("drive-sync") },
        body: JSON.stringify({ mode: "incremental" }),
        timeoutMs: 120000,
      });
      if (requestGeneration !== driveSessionGeneration) return;
      const normalized = normalizeDrivePayload(payload);
      const syncStatus = scalarLabel(
        payload?.data?.status || payload?.status,
      ).toLowerCase();
      if (["queued", "running"].includes(syncStatus)) {
        showToast(
          driveMaterialsReadReady()
            ? `Sync started for ${DRIVE_CONFIG.sourceName}. The material index will refresh shortly.`
            : `Verification started for ${DRIVE_CONFIG.sourceName}. Course materials will open after the protected catalogue passes its readiness check.`,
        );
        if (driveMaterialsReadReady()) {
          window.setTimeout(
            () => void refreshDriveMaterials({ silent: true }),
            3000,
          );
        }
        return;
      }
      if (normalized.found) {
        driveMaterialsState = {
          records: normalized.records,
          courseMetadata: driveMaterialsState.courseMetadata || {},
          lastSyncedAt: normalized.lastSyncedAt || new Date().toISOString(),
          lastLoadedAt: new Date().toISOString(),
          error: "",
        };
        saveDriveMaterialsCache();
      } else {
        driveMaterialsState.lastSyncedAt =
          normalized.lastSyncedAt || new Date().toISOString();
      }
      if (
        !driveMaterialsReadReady() &&
        ["success", "succeeded", "completed"].includes(syncStatus)
      ) {
        showToast(
          `Verification completed for ${DRIVE_CONFIG.sourceName}. Reload the portal after the readiness check updates to open course materials.`,
        );
        return;
      }
      driveRequestInFlight = false;
      const refreshed =
        normalized.found ||
        (driveMaterialsReadReady()
          ? await refreshDriveMaterials({ silent: true })
          : false);
      if (!refreshed && !normalized.found) {
        throw new Error("Sync finished, but no material index was returned.");
      }
      showToast(
        `Synced ${plural(driveMaterialsState.records.length, "material")} from ${DRIVE_CONFIG.sourceName}.`,
      );
    } catch (error) {
      if (requestGeneration !== driveSessionGeneration) return;
      driveMaterialsState.error =
        error?.name === "AbortError"
          ? "The Drive sync did not respond within two minutes."
          : error?.message || "Drive sync could not be completed.";
      showToast(driveMaterialsState.error);
    } finally {
      if (requestGeneration === driveSessionGeneration) {
        driveRequestInFlight = false;
        if (isTeacher() && routeParts()[1] === "materials") render();
      }
    }
  }

  function googleWorkspaceAuthUrl() {
    const url = configuredAuthUrl(AUTH_CONFIG.googleWorkspaceAuthStart);
    if (!url) return "";
    url.search = "";
    url.hash = "";
    url.searchParams.set("portal", "faculty");
    url.searchParams.set("returnTo", WORKSPACE_AUTH_RETURN_TO);
    return url.toString();
  }

  function workspaceCallbackMessage(status) {
    const safeStatus = Object.hasOwn(WORKSPACE_CALLBACK_MESSAGES, status)
      ? status
      : "failed";
    return {
      status: safeStatus,
      ...WORKSPACE_CALLBACK_MESSAGES[safeStatus],
    };
  }

  function consumeWorkspaceCallbackFeedback() {
    const query = authRouteQuery();
    if (!query.has("workspace")) return null;
    const route = routeParts();
    const facultyRoute =
      route[0] === "teacher" ||
      (route[0] === "signin" && route[1] === "faculty");
    const status = String(query.get("workspace") || "").trim().toLowerCase();
    query.delete("workspace");
    const cleanQuery = query.toString();
    const cleanPath = route.join("/") || "signin/faculty";
    window.history.replaceState(
      null,
      "",
      `#/${cleanPath}${cleanQuery ? `?${cleanQuery}` : ""}`,
    );
    return facultyRoute ? workspaceCallbackMessage(status) : null;
  }

  function workspaceLoginFeedback() {
    if (!workspaceCallbackFeedback) return null;
    if (workspaceCallbackFeedback.status === "connected") {
      return {
        status: "failed",
        tone: "error",
        message:
          "Google Workspace sign-in could not be confirmed. Please try again.",
      };
    }
    return workspaceCallbackFeedback;
  }

  async function restoreWorkspaceSession({ canApply = () => true } = {}) {
    if (sessionStorage.getItem(WORKSPACE_LOGOUT_SUPPRESS_KEY) === "1") {
      remoteSessionValidated = true;
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(CSRF_TOKEN_KEY);
      return false;
    }
    const endpoint = configuredAuthUrl(AUTH_CONFIG.workspaceSessionEndpoint);
    if (!endpoint) {
      remoteSessionValidated = true;
      return false;
    }
    try {
      const session = await requestAuthEndpoint(endpoint.toString(), {
        timeout: 5000,
        skipSessionExpiry: true,
      });
      if (!canApply()) {
        remoteSessionValidated = true;
        return false;
      }
      const account = authenticatedUserFrom(session);
      if (!account) {
        remoteSessionValidated = true;
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(CSRF_TOKEN_KEY);
        return false;
      }
      if (
        workspaceCallbackFeedback?.status === "connected" &&
        !isTeacher(account)
      ) {
        await closeWorkspaceSession();
        remoteSessionValidated = true;
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(CSRF_TOKEN_KEY);
        workspaceCallbackFeedback = workspaceCallbackMessage("not-authorized");
        return false;
      }
      sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
      startSession(account, { remote: true });
      state = loadState(account);
      if (account.role === "student") {
        try {
          await refreshRemoteEnrollments();
        } catch {
          // Keep the last device cache if enrollment sync is temporarily offline.
        }
      }
      return true;
    } catch {
      remoteSessionValidated = true;
      if (!canApply()) return false;
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(CSRF_TOKEN_KEY);
      return false;
    }
  }

  async function closeWorkspaceSession() {
    const endpoint = configuredAuthUrl(AUTH_CONFIG.workspaceLogoutEndpoint);
    if (!endpoint) return true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(currentCsrfToken()
            ? { "X-CSRF-Token": currentCsrfToken() }
            : {}),
        },
        keepalive: true,
        signal: controller.signal,
      });
      return response.ok || response.status === 401;
    } catch {
      return false;
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

  function torontoGreeting() {
    const hour = Number(
      new Intl.DateTimeFormat("en-CA", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone: "America/Toronto",
      }).format(new Date()),
    );
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
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
      lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
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

  function findPlatformModule(course, identifier) {
    if (!course?.platformModules?.length) return null;
    const decoded = safeDecode(String(identifier ?? "")).trim();
    if (!decoded) return null;
    const numeric = /^(?:0|[1-9]\d*)$/.test(decoded)
      ? Number(decoded)
      : null;
    return (
      course.platformModules.find(
        (module) =>
          module.key === decoded ||
          (numeric != null && module.number === numeric),
      ) || null
    );
  }

  function platformModuleRoute(course, module, teacher = false) {
    const prefix = teacher ? "teacher/course" : "course";
    return `${prefix}/${course.id}/module/${encodeURIComponent(module.key)}`;
  }

  function platformModuleForLesson(lesson) {
    return findPlatformModule(
      lesson?.course,
      lesson?.platformModuleKey ?? lesson?.platformModuleNumber,
    );
  }

  function platformModuleForAssignment(assignment) {
    const course = findCourse(assignment?.courseId);
    return course
      ? findPlatformModule(
          course,
          assignment?.moduleKey ?? assignment?.moduleNumber,
        )
      : null;
  }

  function platformAssignmentsForModule(course, module) {
    return ASSIGNMENTS.filter(
      (assignment) =>
        assignment.courseId === course.id &&
        (assignment.moduleKey === module.key ||
          Number(assignment.moduleNumber) === module.number),
    );
  }

  function remotePlatformModule(course, module) {
    const records = platformRuntime.modules[course?.code];
    if (!Array.isArray(records) || !module) return null;
    return (
      records.find(
        (record) =>
          record.moduleKey === module.key ||
          Number(record.moduleNumber) === module.number,
      ) || null
    );
  }

  function teacherDisplayModule(course, module, remoteModule) {
    if (!remoteModule) return module;
    return normalizePlatformModule(
      {
        ...module,
        ...remoteModule,
        key: module.key,
        number: module.number,
        readingSteps:
          remoteModule.coreReadingOrder ||
          remoteModule.readingSteps ||
          module.readingSteps,
        selfStudyResources:
          remoteModule.resources || module.selfStudyResources,
        assessment: remoteModule.activity
          ? {
              ...module.assessment,
              ...remoteModule.activity,
            }
          : module.assessment,
        unlockRule: {
          ...module.unlockRule,
          ...(remoteModule.unlockRule || {}),
        },
      },
      course.code,
    );
  }

  function studentModuleProgress(course, module) {
    if (!course || !module) return null;
    const records = platformRuntime.studentProgress[course.code];
    if (!Array.isArray(records)) return null;
    return (
      records.find(
        (record) =>
          (Boolean(record.moduleId) &&
            Boolean(module.id) &&
            record.moduleId === module.id) ||
          (Boolean(record.moduleKey) &&
            Boolean(module.key) &&
            record.moduleKey === module.key) ||
          Number(record.moduleNumber) === module.number,
      ) || null
    );
  }

  function officialProgressConnected(course) {
    return Array.isArray(platformRuntime.studentProgress[course?.code]);
  }

  function officialProgressConfigured(course) {
    return Boolean(
      course &&
        studentProgressEndpoint(course) &&
        courseModulesEndpoint(course),
    );
  }

  function officialProgressRequired(course) {
    return (
      officialProgressConfigured(course) ||
      ["ready", "unavailable", "invalid"].includes(API_STATUS.state)
    );
  }

  function moduleIsUnlocked(course, module) {
    if (module.number === 0) return true;
    if (!officialProgressConnected(course)) {
      return !officialProgressRequired(course);
    }
    const current = studentModuleProgress(course, module);
    if (current?.override?.active) return true;
    if (current?.status === "locked") return false;
    if (["available", "in_progress", "completed"].includes(current?.status)) {
      return true;
    }
    const previous = findPlatformModule(course, module.number - 1);
    return studentModuleProgress(course, previous)?.status === "completed";
  }

  function lessonIsUnlocked(lesson) {
    const module = platformModuleForLesson(lesson);
    return !module || moduleIsUnlocked(lesson.course, module);
  }

  function assignmentIsUnlocked(assignment) {
    const course = findCourse(assignment?.courseId);
    const module = platformModuleForAssignment(assignment);
    return !course || !module || moduleIsUnlocked(course, module);
  }

  function moduleStatus(course, module) {
    const record = studentModuleProgress(course, module);
    if (record?.status === "completed") {
      return { key: "completed", label: "Completed", className: "success" };
    }
    if (!moduleIsUnlocked(course, module)) {
      return { key: "locked", label: "Locked", className: "warning" };
    }
    if (record?.status === "in_progress") {
      return { key: "in_progress", label: "In Progress", className: "info" };
    }
    return {
      key: "available",
      label: officialProgressConnected(course) ? "Available" : "Preview",
      className: "",
    };
  }

  function mergeStudentModuleProgress(course, module, record = {}) {
    const records = platformRuntime.studentProgress[course?.code];
    if (!Array.isArray(records) || !course || !module) return;
    const existing = studentModuleProgress(course, module) || {};
    const remoteModule = remotePlatformModule(course, module);
    const next = {
      ...existing,
      ...record,
      courseCode: course.code,
      moduleId:
        record.moduleId || existing.moduleId || remoteModule?.id || "",
      moduleKey: module.key,
      moduleNumber: module.number,
    };
    const index = records.indexOf(existing);
    if (index >= 0) records.splice(index, 1, next);
    else records.push(next);
  }

  function catalogCourses() {
    return SELECTABLE_COURSE_IDS.map(findCourse).filter(Boolean);
  }

  function enrolledCourseIdsFor(userState = state) {
    return Array.isArray(userState?.enrolledCourseIds)
      ? userState.enrolledCourseIds.filter((id) =>
          SELECTABLE_COURSE_IDS.includes(id),
        )
      : [];
  }

  function isCourseEnrolled(courseId, userState = state) {
    return enrolledCourseIdsFor(userState).includes(courseId);
  }

  function studentCourses() {
    const enrolledIds = new Set(enrolledCourseIdsFor());
    return catalogCourses().filter((course) => enrolledIds.has(course.id));
  }

  function studentAssignments() {
    const enrolledIds = new Set(enrolledCourseIdsFor());
    return ASSIGNMENTS.filter((assignment) =>
      enrolledIds.has(assignment.courseId),
    );
  }

  function studentLessons() {
    return studentCourses().flatMap((course) =>
      course.lessons.map((lesson) => ({ ...lesson, course })),
    );
  }

  function courseHasAcademicRecord(course) {
    if (
      course.lessons.some((lesson) => state.completed.includes(lesson.id))
    ) {
      return true;
    }
    return ASSIGNMENTS.some(
      (assignment) =>
        assignment.courseId === course.id &&
        Boolean(state.submissions?.[assignment.id]),
    );
  }

  function enrollmentRequirement(course) {
    const requiredIds = Array.isArray(course.prerequisiteCourseIds)
      ? course.prerequisiteCourseIds
      : [];
    const missing = requiredIds.filter((id) => !isCourseEnrolled(id));
    return {
      missing,
      met: missing.length === 0,
      message: missing.length
        ? `${missing.map((id) => findCourse(id)?.code || id).join(", ")} must be selected first or concurrently.`
        : "",
    };
  }

  function courseProgress(course) {
    if (course.platformModules?.length) {
      const records = platformRuntime.studentProgress[course.code];
      const completed = Array.isArray(records)
        ? course.platformModules.filter(
            (module) => studentModuleProgress(course, module)?.status === "completed",
          ).length
        : 0;
      return {
        completed,
        total: course.platformModules.length,
        percent: course.platformModules.length
          ? Math.round((completed / course.platformModules.length) * 100)
          : 0,
        official: Array.isArray(records),
      };
    }
    const completed = course.lessons.filter((lesson) =>
      state.completed.includes(lesson.id),
    ).length;
    return {
      completed,
      total: course.lessons.length,
      percent: course.lessons.length
        ? Math.round((completed / course.lessons.length) * 100)
        : 0,
    };
  }

  function nextLessonForCourse(course) {
    return (
      course.lessons.find((lesson) => !state.completed.includes(lesson.id)) ||
      null
    );
  }

  function selectedCreditCount() {
    return studentCourses().reduce((total, course) => {
      const match = String(course.credit || "").match(/\d+(?:\.\d+)?/);
      return total + (match ? Number(match[0]) : 1);
    }, 0);
  }

  function overallProgress() {
    const modules = studentCourses().flatMap((course) =>
      (course.platformModules || []).map((module) => ({ course, module })),
    );
    if (modules.length) {
      const completed = modules.filter(
        ({ course, module }) =>
          studentModuleProgress(course, module)?.status === "completed",
      ).length;
      return Math.round((completed / modules.length) * 100);
    }
    const lessons = studentLessons();
    if (!lessons.length) return 0;
    const completed = lessons.filter((lesson) =>
      state.completed.includes(lesson.id),
    ).length;
    return Math.round((completed / lessons.length) * 100);
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

  function publishedDirectGrades(courseCode) {
    const records = platformRuntime.studentGrades[courseCode];
    return Array.isArray(records)
      ? records.filter(
          (grade) =>
            grade?.publishedAt &&
            Number.isFinite(Number(grade.score)) &&
            Number(grade.score) >= 0,
        )
      : [];
  }

  function directGradeForAssignment(assignment) {
    if (!assignment?.gradebookItemId) return null;
    const course = findCourse(assignment.courseId);
    return (
      publishedDirectGrades(course?.code).find(
        (grade) =>
          String(grade.gradebookItemId || "").toLowerCase() ===
          assignment.gradebookItemId,
      ) || null
    );
  }

  function normalizedGradePercent(score, maxScore = 100) {
    const numericScore = Number(score);
    const numericMaximum = Number(maxScore);
    if (
      !Number.isFinite(numericScore) ||
      !Number.isFinite(numericMaximum) ||
      numericMaximum <= 0
    ) {
      return null;
    }
    return Math.round((numericScore / numericMaximum) * 100);
  }

  function courseGrade(courseId, user = currentUser()) {
    const assignments = ASSIGNMENTS.filter(
      (assignment) =>
        assignment.courseId === courseId && Number(assignment.weightPercent) > 0,
    );
    const scored = assignments
      .map((assignment) => ({
        assignment,
        score: assignmentScore(assignment, user),
      }))
      .filter((record) => record.score != null);
    const assignedGradebookIds = new Set(
      assignments.map((assignment) => assignment.gradebookItemId).filter(Boolean),
    );
    const directOnly = publishedDirectGrades(findCourse(courseId)?.code)
      .filter(
        (grade) =>
          !assignedGradebookIds.has(
            String(grade.gradebookItemId || "").toLowerCase(),
          ),
      )
      .map((grade) => ({
        grade,
        score: normalizedGradePercent(grade.score, grade.maxScore),
        weightPercent: Number(grade.weightPercent || 0),
      }))
      .filter(
        (record) =>
          record.score != null && Number(record.weightPercent) > 0,
      );
    if (scored.length || directOnly.length) {
      const earnedFromAssignments = scored.reduce(
        (total, record) =>
          total + record.score * Number(record.assignment.weightPercent),
        0,
      );
      const assignmentWeight = scored.reduce(
        (total, record) => total + Number(record.assignment.weightPercent),
        0,
      );
      const earnedFromDirect = directOnly.reduce(
        (total, record) => total + record.score * record.weightPercent,
        0,
      );
      const directWeight = directOnly.reduce(
        (total, record) => total + record.weightPercent,
        0,
      );
      const earned = earnedFromAssignments + earnedFromDirect;
      const weight = assignmentWeight + directWeight;
      const current = weight ? Math.round(earned / weight) : null;
      return current == null
        ? null
        : {
            current,
            target: current,
            completed: scored.length + directOnly.length,
            gradedWeight: weight,
          };
    }
    if (findCourse(courseId)?.platformModules?.length) return null;
    if (!hasSeededAcademicRecord(user)) return null;
    return GRADES.find((grade) => grade.courseId === courseId);
  }

  function assignmentScore(assignment, user = currentUser()) {
    const directGrade = directGradeForAssignment(assignment);
    if (directGrade) {
      return normalizedGradePercent(directGrade.score, directGrade.maxScore);
    }
    if (assignment?.submissionMode === "supervised") return null;
    const submission = submissionForAssignment(assignment.id, user);
    if (
      Number.isInteger(submission?.score) &&
      submission.score >= 0 &&
      submission.score <= 100
    ) {
      return submission.score;
    }
    if (submissionsEndpointUrl()) return null;
    return hasSeededAcademicRecord(user) ? assignment.score : null;
  }

  function assignmentFeedback(assignment, user = currentUser()) {
    const directGrade = directGradeForAssignment(assignment);
    if (directGrade) return String(directGrade.feedback || "");
    if (assignment?.submissionMode === "supervised") return "";
    const submission = submissionForAssignment(assignment.id, user);
    if (submission?.feedback) return submission.feedback;
    if (submissionsEndpointUrl()) return "";
    return hasSeededAcademicRecord(user) ? assignment.feedback : "";
  }

  function assignmentFeedbackAuthor(assignment, user = currentUser()) {
    const directGrade = directGradeForAssignment(assignment);
    if (directGrade?.gradedByDisplayName) {
      return String(directGrade.gradedByDisplayName);
    }
    if (assignment?.submissionMode !== "supervised") {
      const submission = submissionForAssignment(assignment.id, user);
      if (submission?.gradedByDisplayName) {
        return String(submission.gradedByDisplayName);
      }
    }
    return "Lake Forest Academy Faculty";
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Toronto",
    }).format(new Date(value));
  }

  function assignmentScheduleLabel(assignment, includeTime = true) {
    return assignment?.due
      ? formatDate(assignment.due, includeTime)
      : "Schedule set separately";
  }

  function assignmentAvailabilityLabel(assignment) {
    return assignment?.availableUntil
      ? formatDate(assignment.availableUntil, true)
      : "Set in the course offering";
  }

  const torontoDayFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Toronto",
  });

  function torontoDayKey(date) {
    const parts = torontoDayFormatter.formatToParts(date);
    return ["year", "month", "day"].map((key) => parts.find((part) => part.type === key).value).join("-");
  }

  function nextSevenDays(now = new Date()) {
    const today = new Date(`${torontoDayKey(now)}T00:00:00Z`);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setUTCDate(day.getUTCDate() + index);
      return day.toISOString().slice(0, 10);
    });
  }

  function calendarEvents() {
    const dueDates = studentAssignments()
      .filter(assignmentIsUnlocked)
      .filter((assignment) => assignment.due && Number.isFinite(Date.parse(assignment.due)))
      .map((assignment) => {
      const course = findCourse(assignment.courseId);
      return {
        id: `due-${assignment.id}`,
        courseId: assignment.courseId,
        date: /^\d{4}-\d{2}-\d{2}$/.test(assignment.due)
          ? assignment.due
          : torontoDayKey(new Date(assignment.due)),
        time: /^\d{4}-\d{2}-\d{2}$/.test(assignment.due)
          ? "Time not set"
          : formatTime(assignment.due),
        title: assignment.title,
        type: "Assignment Due",
        route: `assignment/${assignment.id}`,
        sortTime: assignment.due,
        courseCode: course.code,
      };
    });
    const scheduledEvents = CALENDAR_EVENTS.filter(
      (event) => !event.courseId || isCourseEnrolled(event.courseId),
    );
    return [...scheduledEvents, ...dueDates]
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
    if (notificationEndpointFor()) {
      if (!platformRuntime.notificationsLoaded) return [];
      return [
        ...new Map(
          unreadGradeNotificationsForAssignment()
            .map((notification) =>
              findAssignment(notificationAssignmentId(notification)),
            )
            .filter(Boolean)
            .map((assignment) => [assignment.id, assignment]),
        ).values(),
      ];
    }
    return studentAssignments().filter(
      (assignment) =>
        assignmentIsUnlocked(assignment) &&
        assignmentFeedback(assignment) &&
        !state.feedbackRead.includes(assignment.id),
    );
  }

  function unreadStandaloneFeedbackNotifications() {
    if (!notificationEndpointFor() || !platformRuntime.notificationsLoaded) {
      return [];
    }
    return unreadGradeNotificationsForAssignment().filter(
      (notification) =>
        !findAssignment(notificationAssignmentId(notification)),
    );
  }

  function studentWorkspaceStatus() {
    const courseErrors = studentCourses()
      .map(
        (course) =>
          platformRuntime.errors[`student-progress:${course.code}`],
      )
      .filter(Boolean);
    const courseLoading = studentCourses().some(
      (course) =>
        course.platformModules?.length &&
        officialProgressConfigured(course) &&
        !officialProgressConnected(course) &&
        !platformRuntime.errors[`student-progress:${course.code}`],
    );
    const submissionsLoading = Boolean(
      submissionsEndpointUrl() &&
        (submissionsRequestInFlight ||
          submissionsEndpointCheckedFor !== submissionScopeKey()),
    );
    const notificationsLoading = Boolean(
      notificationEndpointFor() &&
        (!platformRuntime.notificationsLoaded ||
          platformRuntime.notificationsLoading) &&
        !platformRuntime.notificationsError,
    );
    const errors = [
      ...courseErrors,
      remoteSubmissionsState.error,
      platformRuntime.notificationsError,
    ].filter(Boolean);
    return {
      loading: courseLoading || submissionsLoading || notificationsLoading,
      error: errors.join(" "),
    };
  }

  function refreshStudentWorkspace() {
    studentCourses().forEach((course) => {
      const key = `student-progress:${course.code}`;
      platformRequests.delete(key);
      delete platformRuntime.errors[key];
      delete platformRuntime.studentProgress[course.code];
      delete platformRuntime.studentGrades[course.code];
      delete platformRuntime.modules[course.code];
      delete platformRuntime.assignments[course.code];
      ensureStudentPlatformData(course);
    });
    if (submissionsEndpointUrl()) {
      submissionsEndpointCheckedFor = "";
      void refreshRemoteSubmissions({ silent: true });
    }
    void ensureNotifications({ force: true });
  }

  function smartActions() {
    const actions = [];
    const unlockedAssignments = studentAssignments().filter(assignmentIsUnlocked);
    unlockedAssignments.forEach((assignment) => {
      const status = assignmentStatus(assignment);
      if (status.key !== "revision") return;
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `assignment-${assignment.id}`,
        priority: 0,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · ${status.label}`,
        title: assignment.title,
        meta: "Read your teacher's message and submit a new version.",
        cta: "Revise Submission",
        className: "warning",
      });
    });
    unlockedAssignments.forEach((assignment) => {
      const status = assignmentStatus(assignment);
      if (!["overdue", "late", "due"].includes(status.key)) return;
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `assignment-${assignment.id}`,
        priority: status.key === "overdue" ? 1 : 2,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · ${status.label}`,
        title: assignment.title,
        meta: assignment.due
          ? `Due ${formatDate(assignment.due, true)}`
          : "Schedule set separately",
        cta: `Open ${assignment.title}`,
        className: status.key === "overdue" ? "danger" : "warning",
      });
    });
    unreadFeedback().forEach((assignment) => {
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `feedback-${assignment.id}`,
        priority: 3,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · New Feedback`,
        title: assignment.title,
        meta: `${assignmentScore(assignment)}% · Review instructor comments`,
        cta: "Review Feedback",
        className: "success",
      });
    });
    unreadStandaloneFeedbackNotifications().forEach((notification) => {
      const actionUrl = notificationActionHref(
        notification.actionUrl || "#/progress",
      );
      actions.push({
        id: `feedback-notification-${notification.id}`,
        priority: 3,
        route: actionUrl.replace(/^#\//, ""),
        notificationId: notification.id,
        actionUrl,
        eyebrow: "New Feedback",
        title: notification.title,
        meta:
          notification.body ||
          "A published result and teacher feedback are ready to review.",
        cta: "Review Feedback",
        className: "success",
      });
    });
    studentCourses().forEach((course) => {
      if (!officialProgressConnected(course)) return;
      const module = (course.platformModules || []).find(
        (item) =>
          moduleIsUnlocked(course, item) &&
          moduleStatus(course, item).key !== "completed",
      );
      if (!module) return;
      const status = moduleStatus(course, module);
      actions.push({
        id: `module-${course.id}-${module.key}`,
        priority: 4,
        route:
          status.key === "available"
            ? `course/${course.id}`
            : platformModuleRoute(course, module),
        eyebrow: `${course.code} · Continue Learning`,
        title: module.title,
        meta: `Module ${String(module.number).padStart(2, "0")} · ${status.label}`,
        cta:
          status.key === "available"
            ? module.number === 0
              ? "Start Course"
              : `Start Module ${module.number}`
            : `Continue ${course.code}`,
        className: "",
      });
    });
    return actions.sort((a, b) => a.priority - b.priority);
  }

  function assignmentStatus(assignment) {
    if (!assignmentIsUnlocked(assignment)) {
      return { key: "locked", label: "Locked", className: "warning" };
    }
    const submission = submissionForAssignment(assignment.id);
    const workflowStatus = normalizeSubmissionWorkflowStatus(
      submission?.workflowStatus || submission?.status,
      submission?.publishedAt,
    );
    if (workflowStatus === "revision_requested") {
      return {
        key: "revision",
        label: "Revision Requested",
        className: "warning",
      };
    }
    const score = assignmentScore(assignment);
    if (score != null) {
      return { key: "graded", label: `Graded · ${score}%`, className: "success" };
    }
    if (workflowStatus === "under_review") {
      return { key: "review", label: "Under Review", className: "info" };
    }
    if (
      submission &&
      workflowStatus !== "draft" &&
      submission.delivery !== "device"
    ) {
      return {
        key: "submitted",
        label: "Awaiting Grading",
        className: "info",
      };
    }
    if (!assignment.due) {
      return {
        key: "open",
        label: assignment.teacherRecorded ? "Teacher Recorded" : "Open",
        className: "info",
      };
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
    if (section === "guide" || section === "syllabus") {
      return `${findCourse(id)?.title || "Course"} Syllabus`;
    }
    if (section === "lesson") return findLesson(id)?.title || "Lesson";
    if (section === "assignment") return findAssignment(id)?.title || "Assignment";
    return {
      dashboard: "Student Dashboard",
      "course-selection": "Course Selection",
      courses: "My Courses",
      calendar: "Calendar",
      assessments: "Assessments",
      assignments: "Assessments",
      progress: "Progress & Grades",
      notifications: "Notifications",
      announcements: "Course Announcements",
      support: "Student Support",
      security: "Account Security",
    }[section] || "Page Not Found";
  }

  function activeSection(route) {
    if (
      route[0] === "course" ||
      route[0] === "guide" ||
      route[0] === "syllabus" ||
      route[0] === "lesson"
    ) {
      return "courses";
    }
    if (route[0] === "assignment" || route[0] === "assignments") {
      return "assessments";
    }
    return route[0] || "dashboard";
  }

  function routeParts() {
    const clean = window.location.hash.replace(/^#\/?/, "");
    const path = clean.split("?", 1)[0];
    return (path || "dashboard").split("/").filter(Boolean);
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
    const user = currentUser();
    const initials = userInitials(user);
    const unread = unreadNotificationCount();
    const pending = studentAssignments().filter((item) =>
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
            ${navLink("course-selection", "Course Selection", "clipboard")}
            ${navLink("courses", "My Courses", "book")}
            ${navLink("calendar", "Calendar", "calendar")}
            ${navLink("assessments", "Assessments", "clipboard", pending)}
            ${navLink("progress", "Progress & Grades", "chart")}
            ${navLink("notifications", "Notifications", "bell", unread)}
            ${navLink("announcements", "Course Announcements", "book")}
            ${navLink("support", "Student Support", "award")}
            ${navLink("security", "Account Security", "lock")}
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
            <a class="notification-link" href="#/notifications" aria-label="${plural(unread, "unread notification")}">
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
    if (route[1] === "submissions" && route[2]) {
      return `${findCourse(route[2])?.code || "Course"} Submissions`;
    }
    if (route[1] === "submission") return "Submission Details";
    return {
      dashboard: "Faculty Dashboard",
      courses: "Course Management",
      submissions: "Action Inbox",
      announcements: "Course Announcements",
      notifications: "Notifications",
      materials: "Course Materials",
      security: "Account Security",
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
    const user = currentUser();
    const records = teacherSubmissionRecords();
    const awaitingReview = records.filter(
      isAwaitingTeacherReview,
    ).length;
    const unread = unreadNotificationCount();
 [Truncated]
