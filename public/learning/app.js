(() => {
  "use strict";

  const APP_ROOT = document.querySelector("#app");
  const API_STATUS = Object.freeze({
    state: String(window.LFA_API_STATUS?.state || "disabled"),
    message: String(window.LFA_API_STATUS?.message || "").trim(),
  });
  const DRIVE_CATALOG_STATUS = Object.freeze({
    state: String(
      window.LFA_DRIVE_CATALOG_STATUS?.state || "disabled",
    ).trim(),
    message: String(
      window.LFA_DRIVE_CATALOG_STATUS?.message || "",
    ).trim(),
  });
  const STATE_KEY = "lake-forest-learning-state-v1";
  const SESSION_KEY = "lake-forest-learning-session-v1";
  const ACCOUNTS_KEY = "lake-forest-learning-accounts-v1";
  const REGISTERED_ACCOUNT_KEY = "lake-forest-learning-registration-v1";
  const GRADING_DRAFTS_KEY = "lake-forest-learning-grading-drafts-v1";
  const CSRF_TOKEN_KEY = "lake-forest-learning-csrf-v1";
  const WORKSPACE_LOGOUT_SUPPRESS_KEY =
    "lake-forest-learning-workspace-signed-out-v1";
  const DRIVE_MATERIALS_CACHE_KEY =
    "lake-forest-learning-drive-materials-v1";
  const FILE_DATABASE_NAME = "lake-forest-learning-files-v1";
  const FILE_STORE_NAME = "submission-files";
  const MAX_SUBMISSION_BYTES = 25 * 1024 * 1024;
  const ACCESS_EMAIL = "student@lakeforestacademy.ca";
  const TEACHER_EMAIL = "james.whitmore@lakeforestacademy.ca";
  const AUTH_CONFIG = {
    loginEndpoint: String(
      window.LFA_AUTH_CONFIG?.loginEndpoint || "",
    ).trim(),
    registrationEndpoint: String(
      window.LFA_AUTH_CONFIG?.registrationEndpoint || "",
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
  const DRIVE_CONFIG = Object.freeze({
    sourceName: String(
      window.LFA_DRIVE_CONFIG?.sourceName || "Lotus Google Drive",
    ).trim(),
    sourceConfigured:
      window.LFA_DRIVE_CONFIG?.sourceConfigured === true,
    syncEndpoint: String(
      window.LFA_DRIVE_CONFIG?.syncEndpoint || "",
    ).trim(),
  });
  const SUBMISSION_CONFIG = Object.freeze({
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
  const PLATFORM_API_CONFIG = Object.freeze({
    coursesEndpoint: String(
      window.LFA_PLATFORM_API_CONFIG?.coursesEndpoint || "",
    ).trim(),
    studentProgressEndpoint: String(
      window.LFA_PLATFORM_API_CONFIG?.studentProgressEndpoint || "",
    ).trim(),
    studentGradesEndpoint: String(
      window.LFA_PLATFORM_API_CONFIG?.studentGradesEndpoint || "",
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
  let toastTimer = null;
  let lastEnrollmentChange = null;
  let signInNotice = "";
  let signInPrefill = "";
  let driveMaterialsState = loadDriveMaterialsCache();
  let driveRequestInFlight = false;
  let driveEndpointChecked = false;
  let driveSessionGeneration = 0;
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
    teacherRosters: {},
    teacherProgress: {},
    teacherGradebooks: {},
    errors: {},
  };
  const platformRequests = new Map();

  function resetPlatformRuntime() {
    platformRuntime.modules = {};
    platformRuntime.assignments = {};
    platformRuntime.studentProgress = {};
    platformRuntime.studentGrades = {};
    platformRuntime.teacherRosters = {};
    platformRuntime.teacherProgress = {};
    platformRuntime.teacherGradebooks = {};
    platformRuntime.errors = {};
    platformRequests.clear();
    expandedCourseMaterials.clear();
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
    return `${studentRecordKey(record.student)}:${record.assignment.id}`;
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
        feedback:
          typeof responseSource?.feedback === "string"
            ? responseSource.feedback
            : feedback,
        gradeEtag:
          scalarLabel(responseSource?.etag) ||
          record.submission.gradeEtag ||
          "",
        gradeVersion: Number.isInteger(returnedVersion)
          ? returnedVersion
          : record.submission.gradeVersion ?? null,
        publishedAt,
        status: publishedAt ? "graded" : "submitted",
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
    const record = teacherSubmissionRecords().find(
      (item) =>
        item.assignment.id === assignmentId &&
        studentRecordKey(item.student) === studentKey,
    );
    if (!record) return null;
    const values = {
      score: form.elements.score?.value || "",
      feedback: form.elements.feedback?.value || "",
    };
    const serverValues = {
      score:
        record.submission.score == null ? "" : String(record.submission.score),
      feedback: record.submission.feedback || "",
    };
    if (
      !gradingDraftFor(record) &&
      values.score === serverValues.score &&
      values.feedback === serverValues.feedback
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
    if (session.email === ACCESS_EMAIL) return SCHOOL_ACCOUNT;
    if (session.email === TEACHER_EMAIL) return TEACHER_ACCOUNT;
    const account = AUTH_CONFIG.allowDeviceAccounts
      ? registeredAccount(session.email)
      : null;
    if (!account && !session.displayName && !session.firstName) return null;
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
    if (
      record.submission.score != null &&
      !record.submission.publishedAt &&
      record.submission.status !== "graded"
    ) {
      return { label: "Draft Saved", className: "warning" };
    }
    if (record.submission.status === "graded") {
      return { label: "Returned", className: "success" };
    }
    if (record.submission.status === "revision") {
      return { label: "Revision Requested", className: "warning" };
    }
    return { label: "Awaiting Review", className: "info" };
  }

  function teacherSubmissionBucket(record) {
    if (record.unmapped) return "unmapped";
    if (record.submission.status === "graded") return "graded";
    if (record.submission.status === "revision") return "revision";
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

  function normalizeSubmissionVersion(raw, fallback = {}) {
    const version = raw && typeof raw === "object" ? raw : {};
    const submittedAt = validTimestamp(
      version.submittedAt || version.createdAt,
      fallback.submittedAt || new Date().toISOString(),
    );
    const receiptId =
      scalarLabel(version.receiptId || version.id) ||
      fallback.receiptId ||
      "";
    return {
      attemptNumber: Number.isInteger(Number(version.attemptNumber))
        ? Math.max(1, Number(version.attemptNumber))
        : null,
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
    };
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
    const rawScore = source.score ?? source.grade?.score;
    const numericScore =
      rawScore === "" || rawScore == null ? null : Number(rawScore);
    const score =
      Number.isInteger(numericScore) &&
      numericScore >= 0 &&
      numericScore <= 100
        ? numericScore
        : null;
    const attemptNumber = Number.isInteger(Number(source.attemptNumber))
      ? Math.max(1, Number(source.attemptNumber))
      : 1;
    const updatedAt = validTimestamp(
      source.updatedAt || source.gradedAt || source.grade?.updatedAt,
      "",
    );
    const publishedAt = validTimestamp(
      source.publishedAt || source.grade?.publishedAt,
      "",
    );
    const historySource = Array.isArray(source.history)
      ? source.history
      : Array.isArray(source.versions)
        ? source.versions
        : [];
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
    const history = (
      historySource.length ? historySource : [fallbackVersion]
    ).map((version) => normalizeSubmissionVersion(version, fallbackVersion));
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
        attemptNumber,
        text: scalarLabel(source.note || source.text || source.comment),
        fileName,
        submittedAt,
        receiptId,
        fileReceiptId: fallbackVersion.fileReceiptId,
        fileSize: fallbackVersion.fileSize,
        fileType: fallbackVersion.fileType,
        fileUrl,
        status: publishedAt
          ? "graded"
          : scalarLabel(source.status) || "submitted",
        score,
        feedback: scalarLabel(
          source.feedback || source.teacherFeedback || source.grade?.feedback,
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

  async function requestSubmissionEndpoint(endpoint, options = {}) {
    const url = configuredDriveUrl(endpoint);
    if (!url) throw new Error("Submission service is not configured.");
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
      const text = response.status === 204 ? "" : await response.text();
      let payload = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          if (response.ok) {
            throw new Error("The submission service returned invalid JSON.");
          }
        }
      }
      if (!response.ok) {
        if (response.status === 401) expireRemoteSession();
        const error = new Error(
          payload?.error?.message ||
            payload?.message ||
            `Submission service request failed (${response.status}).`,
        );
        error.status = response.status;
        error.code = payload?.error?.code || "";
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

  function submissionForAssignment(assignmentId, user = currentUser()) {
    const localSubmission =
      user && normalizeEmail(user.email) !== normalizeEmail(currentUser()?.email)
        ? loadState(user).submissions?.[assignmentId] || null
        : state?.submissions?.[assignmentId] || null;
    const remoteSubmission = submissionsEndpointUrl()
      ? remoteSubmissionFor(assignmentId, user)
      : null;
    if (!remoteSubmission) return localSubmission;
    if (!localSubmission) return remoteSubmission;
    const localSubmittedAt = Date.parse(localSubmission.submittedAt || "");
    const remoteSubmittedAt = Date.parse(remoteSubmission.submittedAt || "");
    return Number.isFinite(localSubmittedAt) &&
      (!Number.isFinite(remoteSubmittedAt) || localSubmittedAt > remoteSubmittedAt)
      ? localSubmission
      : remoteSubmission;
  }

  async function refreshRemoteSubmissions({ silent = false } = {}) {
    const user = currentUser();
    const scope = isTeacher(user) ? "teacher" : "student";
    const endpoint = submissionsEndpointUrl(scope);
    const scopeKey = submissionScopeKey(user);
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
      remoteSubmissionsState = {
        ...remoteSubmissionsState,
        error:
          error?.name === "AbortError"
            ? "The submission service did not respond in time."
            : error?.message || "Submissions could not be loaded.",
      };
      return false;
    } finally {
      submissionsRequestInFlight = false;
      captureVisibleGradingDraft();
      render(false, true);
      if (focusedFieldId) {
        window.requestAnimationFrame(() =>
          document.querySelector(`#${focusedFieldId}`)?.focus(),
        );
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
    const request = Promise.resolve()
      .then(loader)
      .catch((error) => {
        platformRuntime.errors[key] =
          error?.name === "AbortError"
            ? "The course service timed out."
            : error?.message || "Course data could not be loaded.";
      })
      .finally(() => {
        platformRequests.set(key, Promise.resolve());
        render(false, true);
      });
    platformRequests.set(key, request);
    return request;
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
        requestPlatformJson(courseAssignmentsEndpoint(course)).catch(() => ({
          data: [],
        })),
        requestPlatformJson(studentGradesEndpoint(course)).catch(() => ({
          data: [],
        })),
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
              () => ({ data: [] }),
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
            ["course", "courses", "guide", "syllabus"].includes(route[0]))
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
    const returnTo = new URL(window.location.href);
    returnTo.search = "";
    returnTo.hash = "#/teacher/dashboard";
    url.searchParams.set("returnTo", returnTo.toString());
    url.searchParams.set("portal", "faculty");
    return url.toString();
  }

  async function restoreWorkspaceSession() {
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
      const account = authenticatedUserFrom(session);
      if (!account) {
        remoteSessionValidated = true;
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(CSRF_TOKEN_KEY);
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

  function moduleIsUnlocked(course, module) {
    if (module.number === 0) return true;
    if (!officialProgressConnected(course)) {
      return !officialProgressConfigured(course);
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

  function calendarEvents() {
    const dueDates = studentAssignments()
      .filter(assignmentIsUnlocked)
      .filter((assignment) => Boolean(assignment.due))
      .map((assignment) => {
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
    return studentAssignments().filter(
      (assignment) =>
        assignmentIsUnlocked(assignment) &&
        assignmentFeedback(assignment) &&
        !state.feedbackRead.includes(assignment.id),
    );
  }

  function smartActions() {
    const actions = [];
    studentAssignments().filter(assignmentIsUnlocked).forEach((assignment) => {
      const status = assignmentStatus(assignment);
      if (!["overdue", "late", "due"].includes(status.key)) return;
      const course = findCourse(assignment.courseId);
      actions.push({
        id: `assignment-${assignment.id}`,
        priority: status.key === "overdue" ? 0 : status.key === "late" ? 1 : 2,
        route: `assignment/${assignment.id}`,
        eyebrow: `${course.code} · ${status.label}`,
        title: assignment.title,
        meta: assignment.due
          ? `Due ${formatDate(assignment.due, true)}`
          : "Schedule set separately",
        cta: status.key === "revision" ? "Revise Submission" : `Open ${assignment.title}`,
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
        cta: "Review Feedback",
        className: "success",
      });
    });
    studentCourses().forEach((course) => {
      const guide = guideProgress(course);
      if (guide.isComplete) return;
      actions.push({
        id: `guide-${course.id}`,
        priority: 3,
        route: `guide/${course.id}`,
        eyebrow: `${course.code} · Start Here`,
        title: "Complete the Course Guide",
        meta: `${guide.completed} of ${guide.total} steps reviewed`,
        cta: `Finish ${course.code} Setup`,
        className: "info",
      });
    });
    studentCourses().forEach((course) => {
      const lesson = course.lessons.find(
        (item) =>
          !state.completed.includes(item.id) &&
          lessonIsUnlocked({ ...item, course }),
      );
      if (!lesson) return;
      actions.push({
        id: `lesson-${lesson.id}`,
        priority: 4,
        route: `lesson/${lesson.id}`,
        eyebrow: `${course.code} · Continue Learning`,
        title: lesson.title,
        meta: `${lesson.unit} · ${lesson.duration}`,
        cta: `Continue ${course.code}`,
        className: "",
      });
    });
    return actions.sort((a, b) => a.priority - b.priority);
  }

  function assignmentStatus(assignment) {
    if (!assignmentIsUnlocked(assignment)) {
      return { key: "locked", label: "Locked", className: "warning" };
    }
    const score = assignmentScore(assignment);
    if (score != null) {
      return { key: "graded", label: `Graded · ${score}%`, className: "success" };
    }
    const submission = submissionForAssignment(assignment.id);
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
    if (
      submission &&
      submission.status !== "draft" &&
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
      route[0] === "syllabus" ||
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
    if (route[1] === "submissions" && route[2]) {
      return `${findCourse(route[2])?.code || "Course"} Submissions`;
    }
    if (route[1] === "submission") return "Submission Details";
    return {
      dashboard: "Faculty Dashboard",
      courses: "Course Management",
      submissions: "Submission Centre",
      materials: "Course Materials",
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
      isAwaitingTeacherReview,
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
            ${teacherNavLink("courses", "Course Management", "book")}
            ${teacherNavLink("submissions", "Submission Centre", "clipboard", awaitingReview)}
            ${teacherNavLink("materials", "Course Materials", "file")}
            <details class="faculty-course-menu" ${courseMenuOpen ? "open" : ""}>
              <summary>
                <span class="nav-icon">${icon("book", 19)}</span>
                <span>Quick Course Access</span>
              </summary>
              <div>
                ${catalogCourses().map((course) => {
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
    return `#/teacher/submission/${encodeURIComponent(studentRecordKey(record.student))}/${encodeURIComponent(record.assignment.id)}`;
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

  function teacherHierarchy(
    records,
    emptyMessage = "Student work will be organized here by course, student, unit and assignment.",
    emptyTitle = "No Submissions Yet",
  ) {
    if (!records.length) {
      return `
        <div class="teacher-empty">
          ${icon("clipboard", 30)}
          <h3>${escapeHtml(emptyTitle)}</h3>
          <p>${escapeHtml(emptyMessage)}</p>
        </div>
      `;
    }
    const hierarchyCourses = [
      ...new Map(records.map((record) => [record.course.id, record.course])).values(),
    ].sort((a, b) => {
      const aIndex = COURSES.findIndex((course) => course.id === a.id);
      const bIndex = COURSES.findIndex((course) => course.id === b.id);
      if (aIndex < 0 && bIndex < 0) return a.code.localeCompare(b.code);
      if (aIndex < 0) return 1;
      if (bIndex < 0) return -1;
      return aIndex - bIndex;
      });
    return `
      <div class="hierarchy-list">
        ${hierarchyCourses.map((course, courseIndex) => {
          const courseRecords = records.filter(
            (record) => record.course.id === course.id,
          );
          if (!courseRecords.length) return "";
          const students = [
            ...new Map(
              courseRecords.map((record) => [
                studentRecordKey(record.student),
                record.student,
              ]),
            ).values(),
          ];
          return `
            <details class="hierarchy-course" ${courseIndex === 0 ? "open" : ""}>
              <summary>
                <span><strong>${escapeHtml(course.code)}</strong>${escapeHtml(course.title)}</span>
                <small>${plural(courseRecords.length, "submission")}</small>
              </summary>
              <div class="hierarchy-list">
                ${students.map((student) => {
                  const studentRecords = courseRecords.filter(
                    (record) =>
                      studentRecordKey(record.student) ===
                      studentRecordKey(student),
                  );
                  const studentKey = studentRecordKey(student);
                  const studentReference =
                    student.email || student.id || "Student record";
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
                        <span><strong>${escapeHtml(student.displayName)}</strong><small>${escapeHtml(studentReference)}</small></span>
                        <small>${plural(studentRecords.length, "submission")}</small>
                      </summary>
                      <div class="hierarchy-list">
                        ${units.map((unit) => {
                          const unitRecords = studentRecords.filter(
                            (record) => record.assignment.unit === unit.id,
                          );
                          const unitHeadingId = `${safeDomId(course.id)}-${safeDomId(studentKey)}-${safeDomId(unit.id)}`;
                          return `
                            <section class="hierarchy-unit" aria-labelledby="${unitHeadingId}">
                              <header>
                                <span class="course-code">${escapeHtml(unit.id)}</span>
                                <h3 id="${unitHeadingId}">${escapeHtml(unit.title)}</h3>
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

  function driveTimestampLabel(value) {
    if (!value || Number.isNaN(new Date(value).getTime())) return "Not synced yet";
    return formatDate(value, true);
  }

  function groupDriveRecords(records, keyFor) {
    return records.reduce((groups, record) => {
      const key = keyFor(record) || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
      return groups;
    }, new Map());
  }

  function driveMaterialItem(record) {
    const mimeType = String(record.mimeType || "").toLowerCase();
    const fileKind = mimeType.includes("pdf")
      ? "PDF"
      : mimeType.includes("spreadsheet") || mimeType.includes("sheet")
        ? "XLS"
        : mimeType.includes("presentation") || mimeType.includes("slide")
          ? "PPT"
          : mimeType.includes("video")
            ? "VID"
            : mimeType.includes("audio")
              ? "AUD"
              : mimeType.includes("image")
                ? "IMG"
                : "DOC";
    const details = [
      record.mimeType
        ? record.mimeType.replace(
            "application/vnd.google-apps.",
            "Google ",
          )
        : "",
      record.size ? formatFileSize(record.size) : "",
      record.modifiedAt
        ? `Updated ${driveTimestampLabel(record.modifiedAt)}`
        : "",
    ].filter(Boolean);
    return `
      <li class="drive-material-item" data-file-kind="${fileKind}">
        <span>
          <strong>${escapeHtml(record.name)}</strong>
          ${
            record.description
              ? `<span class="drive-material-meta">${escapeHtml(record.description)}</span>`
              : ""
          }
          ${
            details.length
              ? `<small class="drive-material-meta">${details.map(escapeHtml).join(" 路 ")}</small>`
              : ""
          }
        </span>
        ${
          record.url
            ? `<a class="button button-secondary" href="${escapeHtml(record.url)}" target="_blank" rel="noopener noreferrer">Open ${icon("arrow", 15)}</a>`
            : '<span class="badge">Indexed</span>'
        }
      </li>
    `;
  }

  function driveUnitTree(records) {
    const unitGroups = groupDriveRecords(records, (record) => record.unit);
    return [...unitGroups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(
        ([unit, unitRecords]) => `
          <details class="drive-unit-group" open>
            <summary>${escapeHtml(unit)} 路 ${plural(unitRecords.length, "material")}</summary>
            ${[...groupDriveRecords(unitRecords, (record) => record.category).entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(
                ([category, categoryRecords]) => `
                  <section class="drive-category-group">
                    <h4>${escapeHtml(category)}</h4>
                    <ul class="drive-material-list">
                      ${categoryRecords
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(driveMaterialItem)
                        .join("")}
                    </ul>
                  </section>
                `,
              )
              .join("")}
          </details>
        `,
      )
      .join("");
  }

  function courseDriveMaterials(course) {
    return driveMaterialsState.records.filter(
      (record) => record.courseId === course?.id,
    );
  }

  function courseDriveMaterialCount(course, records = courseDriveMaterials(course)) {
    const metadata = driveMaterialsState.courseMetadata?.[course?.code] || {};
    return Math.max(records.length, Number(metadata.count) || 0);
  }

  function courseMaterialsBody(course, noun = "Materials") {
    const records = courseDriveMaterials(course);
    if (!driveMaterialsReadReady()) {
      const checking = DRIVE_CATALOG_STATUS.state === "checking";
      return `<div class="course-materials-status ${checking ? "is-loading" : "is-error"}" role="status">${icon(checking ? "clock" : "file", 18)}<span><strong>${checking ? `Checking ${noun.toLowerCase()}` : `${noun} temporarily unavailable`}</strong><small>${escapeHtml(driveCatalogUnavailableMessage())}</small></span></div>`;
    }
    if (driveRequestInFlight && !records.length) {
      return `<div class="course-materials-status is-loading" role="status">${icon("clock", 18)}<span><strong>Loading ${noun.toLowerCase()}</strong><small>Reading the secure course index.</small></span></div>`;
    }
    if (driveMaterialsState.error) {
      return `<div class="course-materials-status is-error" role="alert">${icon("file", 18)}<span><strong>${noun} could not be loaded</strong><small>${escapeHtml(driveMaterialsState.error)}</small></span><button class="button button-secondary" type="button" data-action="refresh-course-materials">Try Again</button></div>`;
    }
    if (!driveEndpointChecked) {
      return `<div class="course-materials-status is-loading" role="status">${icon("clock", 18)}<span><strong>Connecting ${noun.toLowerCase()}</strong><small>Waiting for the secure course index.</small></span></div>`;
    }
    if (!records.length) {
      return `<div class="course-materials-status" role="status">${icon("file", 18)}<span><strong>No ${noun.toLowerCase()} published yet</strong><small>New course files will appear here after the approved Drive source is synced.</small></span></div>`;
    }
    return driveUnitTree(records);
  }

  function courseMaterialsDisclosure(course, context = "student") {
    const records = courseDriveMaterials(course);
    const metadata = driveMaterialsState.courseMetadata?.[course.code] || {};
    const materialCount = courseDriveMaterialCount(course, records);
    const disclosureKey = `${context}:${course.id}`;
    const expanded = expandedCourseMaterials.has(disclosureKey);
    const panelId = `${context}-${course.id}-materials`;
    const noun = context === "teacher" ? "Resources" : "Materials";
    if (!driveMaterialsReadReady()) {
      return {
        count: 0,
        expanded: false,
        button: `<button class="button button-secondary course-materials-toggle" type="button" disabled aria-disabled="true" aria-expanded="false" title="${escapeHtml(driveCatalogUnavailableMessage())}">${noun} Temporarily Unavailable</button>`,
        panel: "",
      };
    }
    const countLabel =
      (driveEndpointChecked && !driveRequestInFlight) || materialCount
      ? ` (${materialCount})`
      : "";
    const buttonLabel = expanded
      ? `Hide ${noun}`
      : driveRequestInFlight
        ? `Loading ${noun}...`
        : `View ${noun}${countLabel}`;
    const body = courseMaterialsBody(course, noun);

    return {
      count: materialCount,
      expanded,
      button: `<button class="button button-secondary course-materials-toggle" type="button" data-action="toggle-course-materials" data-course="${course.id}" data-context="${context}" aria-expanded="${expanded}" aria-controls="${panelId}">${escapeHtml(buttonLabel)}</button>`,
      panel: expanded
        ? `<section class="course-card-materials" id="${panelId}" aria-label="${course.code} ${noun.toLowerCase()}" aria-live="polite"><header><span><span class="course-code">Secure Course Index</span><strong>${course.code} ${noun}</strong>${metadata.lastSyncedAt ? `<small>Synced ${escapeHtml(driveTimestampLabel(metadata.lastSyncedAt))}</small>` : ""}</span><span class="badge">${plural(materialCount, "item")}</span></header>${body}</section>`
        : "",
    };
  }

  function teacherDriveMaterialTree(records) {
    if (!records.length) {
      return `
        <div class="panel drive-empty-state">
          <h2>No synced materials yet</h2>
          <p>When the Lotus folder is connected and synced, its course, unit and category structure will appear here.</p>
        </div>
      `;
    }
    const courseGroups = groupDriveRecords(records, (record) => record.courseId);
    return `
      <div class="drive-material-tree">
        ${[...courseGroups.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([courseId, courseRecords]) => {
            const course = findCourse(courseId);
            const label = course
              ? `${course.code} 路 ${course.title}`
              : courseRecords[0]?.courseCode || "Unassigned";
            return `
              <details class="drive-course-group" open>
                <summary>${escapeHtml(label)} 路 ${plural(courseRecords.length, "material")}</summary>
                ${driveUnitTree(courseRecords)}
              </details>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function teacherMaterialsView() {
    const materialsEndpointReady = driveMaterialsReadReady();
    const syncEndpointReady = Boolean(
      configuredDriveUrl(DRIVE_CONFIG.syncEndpoint),
    );
    const sourceConfigured =
      DRIVE_CONFIG.sourceConfigured && syncEndpointReady;
    const canSyncDrive = isTeacherAdmin();
    const retryVerification = ["invalid", "unavailable"].includes(
      DRIVE_CATALOG_STATUS.state,
    );
    let connection = {
      label: "Awaiting protected source",
      className: "warning",
      detail:
        "The backend administrator still needs to configure the protected course source and verification endpoint.",
    };
    if (!sourceConfigured) {
      // Keep the source location private; the browser only needs to know
      // whether the protected backend adapter is configured.
    } else if (driveRequestInFlight) {
      connection = {
        label: materialsEndpointReady ? "Syncing" : "Verifying",
        className: "info",
        detail: materialsEndpointReady
          ? `Refreshing the protected ${DRIVE_CONFIG.sourceName} index.`
          : `Running a protected verification of ${DRIVE_CONFIG.sourceName}.`,
      };
    } else if (!materialsEndpointReady) {
      connection = {
        label: retryVerification
          ? "Verification required"
          : "Initial verification pending",
        className: "warning",
        detail: canSyncDrive
          ? retryVerification
            ? "The protected course source is configured, but its read catalogue is not ready. Retry verification to rebuild the secure index."
            : "Run the first protected verification to build the secure course-material index."
          : "Course materials are waiting for a platform administrator to verify the protected source.",
      };
    } else if (driveMaterialsState.error) {
      connection = {
        label: "Needs attention",
        className: "danger",
        detail: driveMaterialsState.error,
      };
    } else if (driveMaterialsState.records.length) {
      connection = {
        label: "Connected",
        className: "success",
        detail: `${plural(driveMaterialsState.records.length, "material")} available from ${DRIVE_CONFIG.sourceName}.`,
      };
    } else {
      connection = {
        label:
          syncEndpointReady && canSyncDrive
            ? "Ready to sync"
            : "Connected read-only",
        className: "info",
        detail: syncEndpointReady && canSyncDrive
          ? "The protected source and backend adapter are configured."
          : "Materials can be read. Synchronization is reserved for platform administrators.",
      };
    }
    const syncDisabled =
      !canSyncDrive ||
      !sourceConfigured ||
      driveRequestInFlight;
    const syncLabel = driveRequestInFlight
      ? materialsEndpointReady
        ? "Syncing..."
        : "Verifying..."
      : materialsEndpointReady
        ? "Sync from Drive"
        : retryVerification
          ? "Retry Drive Verification"
          : "Verify & Sync Drive";
    return `
      <header class="teacher-hero drive-materials-hero">
        <div>
          <p class="eyebrow">Faculty Materials</p>
          <h1>${escapeHtml(DRIVE_CONFIG.sourceName)}</h1>
          <p>Organize school-owned course materials in Drive and publish the synced index to students without sharing a Google password.</p>
        </div>
        <div class="drive-materials-actions">
          ${canSyncDrive ? `<button class="button button-gold" type="button" data-action="sync-drive-materials" ${syncDisabled ? 'disabled aria-disabled="true"' : ""}>${escapeHtml(syncLabel)} ${icon("arrow", 16)}</button>` : ""}
        </div>
      </header>
      <section class="panel drive-connection-card" aria-label="Drive connection">
        <div>
          <p class="eyebrow">Connection</p>
          <div class="drive-status-line">
            <h2>Protected course source</h2>
            <span class="status ${connection.className}">${escapeHtml(connection.label)}</span>
          </div>
          <p class="drive-connection-detail">${escapeHtml(connection.detail)}</p>
          <p class="drive-connection-detail"><strong>Last sync:</strong> ${escapeHtml(driveTimestampLabel(driveMaterialsState.lastSyncedAt))}</p>
        </div>
        <div class="drive-folder-convention">
          <p class="eyebrow">Protected Workflow</p>
          <strong>Materials remain behind the school API</strong>
          <ol aria-label="Protected course material workflow">
            <li>Verify source</li><li>Build index</li><li>Publish catalogue</li><li>Open through API</li>
          </ol>
        </div>
      </section>
      ${
        !sourceConfigured
          ? '<p class="login-help"><strong>Administrator setup required</strong>Configure the protected Drive source on the backend. The browser does not accept or reveal folder identifiers, Drive links or Google passwords.</p>'
          : ""
      }
      <section class="teacher-section">
        <div class="section-heading">
          <div><p class="eyebrow">Synced Index</p><h2>Course Materials</h2></div>
          <span class="badge">${plural(driveMaterialsState.records.length, "material")}</span>
        </div>
        ${
          materialsEndpointReady
            ? teacherDriveMaterialTree(driveMaterialsState.records)
            : `<div class="teacher-empty" role="status">${icon("file", 30)}<h3>Course Materials Temporarily Unavailable</h3><p>${escapeHtml(driveCatalogUnavailableMessage())}</p></div>`
        }
      </section>
    `;
  }

  function studentCourseMaterials(course) {
    const records = courseDriveMaterials(course);
    const count = courseDriveMaterialCount(course, records);
    return `
      <section class="module course-materials">
        <header>
          <p class="course-code">Secure Course Index</p>
          <h3>Course Materials</h3>
          <p>${count ? `${plural(count, "resource")} organized by course section and category.` : "Approved course files will appear here after synchronization."}</p>
        </header>
        ${courseMaterialsBody(course, "Materials")}
      </section>
    `;
  }

  function teacherDashboardView() {
    const records = teacherSubmissionRecords();
    const awaitingReview = records.filter(
      isAwaitingTeacherReview,
    ).length;
    const attachedFiles = records.filter(
      (record) => record.submission.fileName,
    ).length;
    const studentCount = submissionsEndpointUrl()
      ? new Set(records.map((record) => studentRecordKey(record.student))).size
      : allStudentAccounts().length;
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
        <a class="teacher-metric" href="#/teacher/courses" aria-label="${catalogCourses().length} active courses. Open Course Management."><span>${icon("book", 22)}</span><strong>${catalogCourses().length}</strong><p>Active Courses</p></a>
        <a class="teacher-metric" href="#/teacher/courses" aria-label="${studentCount} students. Open Course Management."><span>${icon("award", 22)}</span><strong>${studentCount}</strong><p>Students</p></a>
        <a class="teacher-metric" href="#/teacher/submissions" aria-label="${awaitingReview} submissions awaiting review. Open Submission Centre."><span>${icon("clipboard", 22)}</span><strong>${awaitingReview}</strong><p>Awaiting Review</p></a>
        <a class="teacher-metric" href="#/teacher/submissions" aria-label="${attachedFiles} submitted files. Open Submission Centre."><span>${icon("file", 22)}</span><strong>${attachedFiles}</strong><p>Files Submitted</p></a>
      </section>
      <section class="teacher-section">
        <div class="section-heading"><div><p class="eyebrow">Course Overview</p><h2>Assigned Courses</h2></div></div>
        <div class="teacher-course-grid">
          ${catalogCourses().map((course) => {
            const courseRecords = records.filter(
              (record) => record.course.id === course.id,
            );
            const pending = courseRecords.filter(
              isAwaitingTeacherReview,
            ).length;
            return `
              <a class="teacher-course-card" href="#/teacher/course/${course.id}">
                <span class="course-code">${course.code}</span>
                <h3>${escapeHtml(course.title)}</h3>
                <p>${escapeHtml(course.subject)} · ${course.plannedHours} planned hours</p>
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

  function teacherCoursesView() {
    const records = teacherSubmissionRecords();
    return `
      ${pageHeading(
        "Six-Course Programme",
        "Course Management",
        "Open a course workspace to review its syllabus, enrolled students, assignments, submissions and Lotus Drive materials.",
      )}
      <section class="teacher-course-grid teacher-course-management-grid">
        ${catalogCourses()
          .map((course) => {
            const enrolled = allStudentAccounts().filter((student) =>
              isCourseEnrolled(course.id, loadState(student)),
            ).length;
            const materials = courseMaterialsDisclosure(course, "teacher");
            const courseRecords = records.filter(
              (record) => record.course.id === course.id,
            );
            const awaiting = courseRecords.filter(
              isAwaitingTeacherReview,
            ).length;
            return `
              <article class="teacher-course-card ${materials.expanded ? "is-materials-open" : ""}">
                <span class="course-code">${course.code}</span>
                <h2>${escapeHtml(course.title)}</h2>
                <p>${escapeHtml(course.gradeType)} · ${course.plannedHours} hours</p>
                <dl>
                  <div><dt>Enrolled</dt><dd>${enrolled}</dd></div>
                  <div><dt>Awaiting Review</dt><dd>${awaiting}</dd></div>
                </dl>
                <div class="teacher-course-card-actions">
                  <a class="button button-primary" href="#/teacher/course/${course.id}">Open Workspace ${icon("arrow", 16)}</a>
                  ${materials.button}
                </div>
                ${materials.panel}
              </article>
            `;
          })
          .join("")}
      </section>
    `;
  }

  const DIRECT_GRADE_MODES = new Set([
    "supervised",
    "none",
    "oral_defence",
  ]);

  function gradebookScoreFor(student, itemId) {
    return (student?.scores || []).find((score) => score.itemId === itemId) || null;
  }

  function publishedTeacherGrade(score) {
    if (!score) return null;
    if (Object.prototype.hasOwnProperty.call(score, "latestPublished")) {
      const snapshot = score.latestPublished;
      return snapshot?.publishedAt && Number.isFinite(Number(snapshot.score))
        ? snapshot
        : null;
    }
    const legacySnapshot = score.published || null;
    if (
      legacySnapshot?.publishedAt &&
      Number.isFinite(Number(legacySnapshot.score))
    ) {
      return legacySnapshot;
    }
    if (
      score.latestPublishedAt &&
      Number.isFinite(Number(score.publishedScore))
    ) {
      return {
        score: Number(score.publishedScore),
        feedback: score.publishedFeedback || "",
        publishedAt: score.latestPublishedAt,
      };
    }
    return score.publishedAt && Number.isFinite(Number(score.score))
      ? score
      : null;
  }

  function teacherPublishedStanding(gradebook, student) {
    const published = (gradebook?.items || [])
      .map((item) => ({
        item,
        grade: publishedTeacherGrade(gradebookScoreFor(student, item.id)),
      }))
      .filter(({ item, grade }) => grade && Number(item.weightPercent) > 0)
      .map(({ item, grade }) => ({
        percent: normalizedGradePercent(grade.score, item.maxScore),
        weight: Number(item.weightPercent),
      }))
      .filter((record) => record.percent != null);
    const weight = published.reduce((sum, record) => sum + record.weight, 0);
    const earned = published.reduce(
      (sum, record) => sum + record.percent * record.weight,
      0,
    );
    return {
      count: published.length,
      weight,
      average: weight ? Math.round(earned / weight) : null,
    };
  }

  function directGradebookMarkup(course, gradebook) {
    const directItems = (gradebook?.items || []).filter((item) =>
      DIRECT_GRADE_MODES.has(item.submissionMode),
    );
    if (!directItems.length || !gradebook?.students?.length) {
      return '<div class="teacher-empty"><p>No teacher-entered gradebook items are available yet.</p></div>';
    }
    return `
      <div class="direct-gradebook-list">
        ${directItems
          .map(
            (item) => `
              <details class="direct-gradebook-item">
                <summary>
                  <span><span class="course-code">${escapeHtml(String(item.submissionMode || "teacher entry").replaceAll("_", " "))}</span><strong>${escapeHtml(item.title)}</strong></span>
                  <span>${item.weightPercent}% · ${item.maxScore} points</span>
                </summary>
                <div class="direct-grade-students">
                  ${gradebook.students
                    .map((student) => {
                      const score = gradebookScoreFor(student, item.id);
                      const priorPublished = Boolean(
                        !score?.publishedAt && publishedTeacherGrade(score),
                      );
                      const status = score?.publishedAt
                        ? "Published"
                        : score?.score != null
                          ? priorPublished
                            ? "Draft · prior result published"
                            : "Draft"
                          : "Not Entered";
                      return `
                        <form class="direct-grade-form" data-course="${course.id}" data-course-code="${course.code}" data-student="${escapeHtml(student.studentId)}" data-item="${escapeHtml(item.id)}" data-version="${Number(score?.version || 0)}" data-max-score="${Number(item.maxScore || 100)}">
                          <div class="direct-grade-student-heading"><span class="teacher-avatar">${escapeHtml(userInitials(student))}</span><span><strong>${escapeHtml(student.displayName)}</strong><small>${escapeHtml(student.email)}</small></span><span class="badge ${status === "Published" ? "success" : status.startsWith("Draft") ? "warning" : ""}">${status}</span></div>
                          <div class="form-alert" role="alert" tabindex="-1" hidden></div>
                          <div class="direct-grade-fields">
                            <label><span>Score</span><input name="score" type="number" min="0" max="${Number(item.maxScore || 100)}" step="1" value="${score?.score == null ? "" : Number(score.score)}" required /></label>
                            <label><span>Feedback</span><textarea name="feedback" maxlength="10000" placeholder="Feedback visible after publishing">${escapeHtml(score?.feedback || "")}</textarea></label>
                          </div>
                          <div class="direct-grade-actions">
                            <button class="button button-quiet" type="submit" name="gradeAction" value="draft">Save Draft</button>
                            <button class="button button-primary" type="submit" name="gradeAction" value="publish">Publish to Student</button>
                          </div>
                        </form>
                      `;
                    })
                    .join("")}
                </div>
              </details>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function teacherStandingMarkup(course, gradebook) {
    if (!gradebook?.students?.length) {
      return `<div class="teacher-empty"><p>${configuredDriveUrl(PLATFORM_API_CONFIG.teacherCoursesEndpoint) ? "No published gradebook records are available yet." : "Connect the secure course service to view the official gradebook."}</p></div>`;
    }
    return `
      <div class="teacher-gradebook-table" role="region" aria-label="${course.code} gradebook">
        <table>
          <thead><tr><th>Student</th><th>Published Items</th><th>Weight Graded</th><th>Current Average</th></tr></thead>
          <tbody>
            ${gradebook.students
              .map((student) => {
                const standing = teacherPublishedStanding(gradebook, student);
                return `<tr><td><strong>${escapeHtml(student.displayName || student.email)}</strong><small>${escapeHtml(student.email || "")}</small></td><td>${standing.count}</td><td>${standing.weight}%</td><td>${standing.average == null ? "—" : `${standing.average}%`}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function officialTeacherProgress(course) {
    const record = platformRuntime.teacherProgress[course?.code];
    return record && Array.isArray(record.students) ? record : null;
  }

  function teacherProgressRequestKey(course) {
    return `teacher-progress:${course?.code || ""}`;
  }

  function invalidateTeacherProgress(course) {
    if (!course?.code) return;
    const key = teacherProgressRequestKey(course);
    platformRequests.delete(key);
    delete platformRuntime.teacherProgress[course.code];
    delete platformRuntime.errors[key];
  }

  function teacherProgressModule(student, moduleNumber) {
    return (student?.modules || []).find(
      (module) => Number(module?.moduleNumber) === Number(moduleNumber),
    );
  }

  function teacherProgressStatus(record) {
    const key = String(record?.status || "").toLowerCase();
    const statuses = {
      completed: { label: "Completed", className: "success" },
      in_progress: { label: "In Progress", className: "info" },
      available: { label: "Available", className: "warning" },
      locked: { label: "Locked", className: "" },
    };
    return {
      key: statuses[key] ? key : "unavailable",
      ...(statuses[key] || { label: "Unavailable", className: "" }),
    };
  }

  function teacherProgressStatusMarkup(record, includeOverride = true) {
    const status = teacherProgressStatus(record);
    const override = Boolean(record?.override?.active);
    return `<span class="badge ${status.className} teacher-progress-status" data-status="${status.key}">${status.label}</span>${includeOverride && override ? '<small class="teacher-progress-override">Override active</small>' : ""}`;
  }

  function teacherProgressOverrideExpiry(value) {
    if (!value) return "No expiry";
    try {
      return `Expires ${formatDate(value, true)}`;
    } catch {
      return "Expiry unavailable";
    }
  }

  function teacherProgressRefreshButton(course, label = "Refresh") {
    const connected = Boolean(teacherCourseEndpoint(course, "progress"));
    return `<button class="button button-quiet" type="button" data-action="refresh-teacher-progress" data-course="${escapeHtml(course.id)}" ${connected ? "" : "disabled"}>${escapeHtml(label)}</button>`;
  }

  function teacherProgressToolbar(course, progress) {
    const updated = progress?.loadedAt
      ? `Last refreshed ${formatDate(progress.loadedAt, true)}`
      : "Official progress has not been refreshed.";
    return `<div class="teacher-progress-toolbar"><small>${escapeHtml(updated)}</small>${teacherProgressRefreshButton(course, "Refresh Official Progress")}</div>`;
  }

  function teacherProgressPlaceholder(course) {
    const endpoint = teacherCourseEndpoint(course, "progress");
    const error = platformRuntime.errors[teacherProgressRequestKey(course)];
    if (!endpoint) {
      return `<div class="teacher-empty"><p>Connect the secure course service to view official module progress. Browser activity is not used as a faculty record.</p>${teacherProgressRefreshButton(course, "Refresh Official Progress")}</div>`;
    }
    if (error) {
      return `<div class="teacher-empty" role="alert"><h3>Official Progress Unavailable</h3><p>${escapeHtml(error)} No browser-only or roster-derived module status is shown.</p>${teacherProgressRefreshButton(course, "Try Again")}</div>`;
    }
    return '<div class="teacher-empty" role="status"><p>Loading official module progress… Only central school records will be shown.</p></div>';
  }

  function teacherProgressMatrixMarkup(course) {
    const progress = officialTeacherProgress(course);
    if (!progress) return teacherProgressPlaceholder(course);
    if (!progress.students.length) {
      return `<div class="teacher-empty"><p>No official student progress records are available for this course.</p>${teacherProgressToolbar(course, progress)}</div>`;
    }
    const modules = [...(course.platformModules || [])].sort(
      (left, right) => Number(left.number) - Number(right.number),
    );
    return `
      <div class="teacher-gradebook-table teacher-progress-matrix" role="region" aria-label="${course.code} official progress matrix">
        <table>
          <thead><tr><th scope="col">Student</th>${modules.map((module) => `<th scope="col"><a class="teacher-progress-module-link" href="#/${platformModuleRoute(course, module, true)}" aria-label="Open Module ${module.number}">M${String(module.number).padStart(2, "0")}</a></th>`).join("")}</tr></thead>
          <tbody>
            ${progress.students
              .map(
                (student) => `<tr><td><strong>${escapeHtml(student.displayName || student.email || student.studentId || "Student")}</strong><small>${escapeHtml(student.email || "")}</small></td>${modules.map((module) => `<td>${teacherProgressStatusMarkup(teacherProgressModule(student, module.number))}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      ${teacherProgressToolbar(course, progress)}
    `;
  }

  function teacherModuleProgressMarkup(course, module) {
    const progress = officialTeacherProgress(course);
    if (!progress) return teacherProgressPlaceholder(course);
    if (!progress.students.length) {
      return `<div class="teacher-empty"><p>No official student progress records are available for this course.</p>${teacherProgressToolbar(course, progress)}</div>`;
    }
    return `
      <div class="teacher-gradebook-table teacher-progress-detail" role="region" aria-label="${course.code} Module ${module.number} official student progress">
        <table>
          <thead><tr><th scope="col">Student</th><th scope="col">Status</th><th scope="col">Override</th></tr></thead>
          <tbody>
            ${progress.students
              .map((student) => {
                const record = teacherProgressModule(student, module.number);
                const override = record?.override?.active
                  ? record.override
                  : null;
                const expiry = teacherProgressOverrideExpiry(
                  override?.expiresAt,
                );
                return `<tr><td><strong>${escapeHtml(student.displayName || student.email || student.studentId || "Student")}</strong><small>${escapeHtml(student.email || "")}</small></td><td>${teacherProgressStatusMarkup(record, false)}</td><td>${override ? `<span class="badge warning">Active Override</span><small>${escapeHtml(override.reason || "Documented faculty override")} · ${escapeHtml(expiry)}</small>` : '<span class="badge">None</span>'}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      ${teacherProgressToolbar(course, progress)}
    `;
  }

  function teacherCourseView(course) {
    const syllabus = course.syllabus || { units: [] };
    const records = teacherSubmissionRecords().filter(
      (record) => record.course.id === course.id,
    );
    const awaiting = records.filter(
      isAwaitingTeacherReview,
    );
    const connectedRoster = platformRuntime.teacherRosters[course.code];
    const roster = Array.isArray(connectedRoster) ? connectedRoster : [];
    const gradebook = platformRuntime.teacherGradebooks[course.code] || null;
    const assignments = ASSIGNMENTS.filter(
      (assignment) => assignment.courseId === course.id,
    );
    return `
      <nav class="teacher-breadcrumbs" aria-label="Breadcrumb">
        <a href="#/teacher/courses">Course Management</a><span>/</span>
        <span aria-current="page">${course.code}</span>
      </nav>
      <header class="teacher-course-hero">
        <div>
          <p class="eyebrow light">${escapeHtml(course.subject)} · ${course.code}</p>
          <h1>${escapeHtml(course.title)}</h1>
          <p>${escapeHtml(course.description)}</p>
        </div>
        <div class="teacher-course-hero-actions">
          <a class="button button-gold" href="#/teacher/submissions/${course.id}">Submission Centre</a>
          <a class="button button-on-dark" href="#/teacher/materials">Course Materials</a>
        </div>
      </header>
      <section class="teacher-metrics teacher-course-metrics" aria-label="${course.code} overview">
        <article class="teacher-metric"><span>${icon("award", 22)}</span><strong>${roster.length}</strong><p>Enrolled Students</p></article>
        <article class="teacher-metric"><span>${icon("clipboard", 22)}</span><strong>${assignments.length}</strong><p>Assignments</p></article>
        <article class="teacher-metric"><span>${icon("file", 22)}</span><strong>${records.length}</strong><p>Submissions</p></article>
        <article class="teacher-metric"><span>${icon("clock", 22)}</span><strong>${awaiting.length}</strong><p>Awaiting Review</p></article>
      </section>
      <section class="teacher-course-workspace">
        <div>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Syllabus</p><h2>110-Hour Course Plan</h2></div><span class="badge">${escapeHtml(course.credit)}</span></div>
            <p class="teacher-section-copy">${escapeHtml(syllabus.description || course.overview)}</p>
            <div class="teacher-syllabus-list platform-teacher-module-list">
              ${(course.platformModules || [])
                .map(
                  (module) => `
                    <a href="#/${platformModuleRoute(course, module, true)}"><span>${String(module.number).padStart(2, "0")}</span><div><small>${escapeHtml(module.unitTitle || "Course Sequence")}</small><strong>${escapeHtml(module.title)}</strong></div><b>${module.estimatedCreditHours || 0}h</b>${icon("arrow", 15)}</a>
                  `,
                )
                .join("")}
            </div>
            <div class="teacher-evaluation-strip">
              ${course.evaluation.map((item) => `<span><strong>${item.weight}%</strong>${escapeHtml(item.label)}</span>`).join("")}
            </div>
          </section>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Official Progress</p><h2>Student × Module Matrix</h2></div><span class="badge">${course.platformModules.length} modules</span></div>
            <p class="teacher-section-copy">Central school records are shown for each enrolled student. Select a module heading to review its status and active overrides in detail.</p>
            ${teacherProgressMatrixMarkup(course)}
          </section>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Course Work</p><h2>Assignments</h2></div><span class="badge">${assignments.length}</span></div>
            <div class="teacher-assignment-list">
              ${
                assignments.length
                  ? assignments
                      .map(
                        (assignment) => `
                          <article>
                            <span class="course-chip">${escapeHtml(assignment.unit)}</span>
                            <div><h3>${escapeHtml(assignment.title)}</h3><p>${assignmentScheduleLabel(assignment)} · ${assignment.weightPercent || 0}% of course grade</p></div>
                            <a class="button button-quiet" href="#/teacher/submissions/${course.id}/${assignment.id}">Submissions</a>
                          </article>
                        `,
                      )
                      .join("")
                  : '<div class="teacher-empty"><p>No assignments have been added to this course yet.</p></div>'
              }
            </div>
          </section>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Gradebook</p><h2>Course Standing</h2></div><span class="badge">${course.gradebookItems?.length || assignments.length} items</span></div>
            ${teacherStandingMarkup(course, gradebook)}
          </section>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Teacher-Entered Results</p><h2>Supervised, Participation & Oral Results</h2></div><span class="badge">Draft or Publish</span></div>
            <p class="teacher-section-copy">Enter results that do not use the student submission workflow. Drafts remain staff-only; published results appear in the student grade report.</p>
            ${directGradebookMarkup(course, gradebook)}
          </section>
          <section class="teacher-section">
            <div class="section-heading"><div><p class="eyebrow">Student Work</p><h2>Recent Submissions</h2></div><a class="text-link" href="#/teacher/submissions/${course.id}">View All ${icon("arrow", 15)}</a></div>
            <div class="teacher-records">
              ${records.length ? records.slice(0, 4).map(teacherRecordMarkup).join("") : teacherHierarchy([])}
            </div>
          </section>
        </div>
        <aside>
          <section class="teacher-section teacher-roster-card">
            <div class="section-heading"><div><p class="eyebrow">Roster</p><h2>Enrolled Students</h2></div></div>
            ${
              roster.length
                ? `<div class="teacher-roster">${roster
                    .map(
                      (student) => `
                        <div><span class="teacher-avatar">${escapeHtml(userInitials(student))}</span><span><strong>${escapeHtml(student.displayName)}</strong><small>${escapeHtml(student.email)} · ${Number(student.completedModules || 0)}/${Number(student.totalModules || 12)} modules</small></span></div>
                      `,
                    )
                    .join("")}</div>`
                : `<div class="teacher-empty"><p>${configuredDriveUrl(PLATFORM_API_CONFIG.teacherCoursesEndpoint) ? "No enrolled students are available for this course." : "Connect the secure course service to view the official roster and progress."}</p></div>`
            }
          </section>
          <section class="teacher-section teacher-drive-card">
            <div class="section-heading"><div><p class="eyebrow">Secure Course Index</p><h2>Course Files</h2></div><span class="badge">${plural(courseDriveMaterialCount(course), "item")}</span></div>
            <div class="teacher-drive-actions">${courseMaterialsBody(course, "Resources")}</div>
            <p class="teacher-security-note"><strong>Files open through the school API.</strong> Direct Google Drive sharing is not required, and staff-only access remains enforced by the signed-in role.</p>
          </section>
        </aside>
      </section>
    `;
  }

  function teacherModuleView(course, module) {
    const assignments = platformAssignmentsForModule(course, module);
    const roster = Array.isArray(platformRuntime.teacherRosters[course.code])
      ? platformRuntime.teacherRosters[course.code]
      : [];
    const remoteModule = remotePlatformModule(course, module);
    const displayModule = teacherDisplayModule(course, module, remoteModule);
    const assessment = displayModule.assessment || {};
    module = displayModule;
    const unlockReady = Boolean(
      remoteModule?.id &&
        roster.length &&
        configuredDriveUrl(PLATFORM_API_CONFIG.teacherStudentsEndpoint),
    );
    return `
      <nav class="teacher-breadcrumbs" aria-label="Breadcrumb"><a href="#/teacher/courses">Course Management</a><span>/</span><a href="#/teacher/course/${course.id}">${course.code}</a><span>/</span><span aria-current="page">Module ${module.number}</span></nav>
      <header class="teacher-course-hero module-teacher-hero"><div><p class="eyebrow light">${course.code} · Module ${String(module.number).padStart(2, "0")}</p><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.unitTitle || "Course sequence")}</p></div><div class="teacher-course-hero-actions"><a class="button button-gold" href="#/teacher/submissions/${course.id}">Open Submission Centre</a><a class="button button-on-dark" href="#/teacher/course/${course.id}">Back to Course</a></div></header>
      <section class="teacher-module-layout">
        <div>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Instructional Plan</p><h2>Teacher Presence</h2></div><span class="badge">${module.estimatedCreditHours || 0} hours</span></div><p class="teacher-section-copy">${escapeHtml(module.teacherPresence)}</p><h3>Learning Focus</h3><ul class="objective-list">${module.learningFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Sequence</p><h2>Reading, Practice & Check</h2></div></div><ol class="module-sequence-list">${module.readingSteps.map((item) => `<li><span></span><p>${escapeHtml(item)}</p></li>`).join("")}</ol><div class="module-activity-grid"><article><h3>Guided Practice</h3><p>${escapeHtml(module.guidedPractice)}</p></article><article><h3>Low-Stakes Check</h3><p>${escapeHtml(module.lowStakesCheck)}</p></article></div></section>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Assessment</p><h2>${escapeHtml(assessment.title || "Module Evidence")}</h2></div><span class="badge ${Number(assessment.weightPercent) > 0 ? "warning" : ""}">${Number(assessment.weightPercent || 0)}%</span></div><p>${escapeHtml(assessment.taskType || assessment.type || "Formative module check")}</p>${assessment.evidenceFile ? `<p><strong>Evidence file:</strong> ${escapeHtml(assessment.evidenceFile)}</p>` : ""}<h3>Assessment Sequence</h3><ol class="module-sequence-list compact">${sequenceList(assessment.sequence).map((item) => `<li><span></span><p>${escapeHtml(item)}</p></li>`).join("")}</ol>${assessment.processCheckpoints ? `<h3>Process Checkpoints</h3><p>${escapeHtml(Array.isArray(assessment.processCheckpoints) ? assessment.processCheckpoints.join(" · ") : assessment.processCheckpoints)}</p>` : ""}${assessment.authenticationEvidence ? `<h3>Authentication Evidence</h3><p>${escapeHtml(Array.isArray(assessment.authenticationEvidence) ? assessment.authenticationEvidence.join(" · ") : assessment.authenticationEvidence)}</p>` : ""}<div class="teacher-module-assignment-links">${assignments.map((assignment) => `<a class="button button-secondary" href="#/teacher/submissions/${course.id}/${assignment.id}">${escapeHtml(assignment.title)} (${assignment.weightPercent}%)</a>`).join("")}</div></section>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Evidence & Feedback</p><h2>Retain and Review</h2></div></div><h3>Evidence to Retain</h3><p>${escapeHtml(module.evidenceToRetain)}</p><h3>Feedback and Unlock Rule</h3><p>${escapeHtml(module.feedbackAndUnlock)}</p></section>
        </div>
        <aside>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Official Progress</p><h2>Student Module Status</h2></div><span class="badge">M${String(module.number).padStart(2, "0")}</span></div>${teacherModuleProgressMarkup(course, module)}</section>
          <section class="teacher-section"><div class="section-heading"><div><p class="eyebrow">Override</p><h2>Unlock Module</h2></div></div><p>Use only for an accommodation, technical barrier or documented alternative pathway. A reason is required and retained in the audit record.</p><form id="unlock-override-form" data-course="${course.id}" data-module="${module.number}" data-module-id="${escapeHtml(remoteModule?.id || "")}"><div class="form-alert" role="alert" tabindex="-1" hidden></div><label for="unlock-student">Student</label><select id="unlock-student" name="studentId" required ${!unlockReady ? "disabled" : ""}><option value="">Select a student</option>${roster.map((student) => `<option value="${escapeHtml(student.studentId || student.id || "")}">${escapeHtml(student.displayName)} · ${escapeHtml(student.email)}</option>`).join("")}</select><label for="unlock-reason">Documented reason</label><textarea id="unlock-reason" name="reason" required minlength="10" placeholder="Describe the approved accommodation, technical barrier or alternative pathway." ${!unlockReady ? "disabled" : ""}></textarea><button class="button button-primary full-width" type="submit" ${!unlockReady ? "disabled" : ""}>Create Unlock Override</button>${!unlockReady ? '<p class="teacher-security-note"><strong>Official service required.</strong> Unlocks are never stored as browser-only authority.</p>' : ""}</form></section>
        </aside>
      </section>`;
  }

  function teacherSubmissionsView(courseId = "", assignmentId = "") {
    const course = courseId ? findCourse(courseId) : null;
    const assignment = assignmentId ? findAssignment(assignmentId) : null;
    const allRecords = teacherSubmissionRecords();
    const selectedCourse =
      course?.id || teacherSubmissionFilters.course || "all";
    const selectedStatus = assignment
      ? "all"
      : teacherSubmissionFilters.status || "awaiting";
    const query = teacherSubmissionFilters.query || "";
    const scopedRecords = allRecords.filter(
      (record) =>
        (selectedCourse === "all" || record.course.id === selectedCourse) &&
        (!assignment || record.assignment.id === assignment.id),
    );
    const records = scopedRecords.filter(
      (record) =>
        (selectedStatus === "all" ||
          (selectedStatus === "awaiting"
            ? isAwaitingTeacherReview(record)
            : teacherSubmissionBucket(record) === selectedStatus)) &&
        teacherRecordMatchesQuery(record, query),
    );
    const statusCounts = {
      all: scopedRecords.length,
      awaiting: scopedRecords.filter(isAwaitingTeacherReview).length,
      revision: scopedRecords.filter(
        (record) => teacherSubmissionBucket(record) === "revision",
      ).length,
      graded: scopedRecords.filter(
        (record) => teacherSubmissionBucket(record) === "graded",
      ).length,
      unmapped: scopedRecords.filter(
        (record) => teacherSubmissionBucket(record) === "unmapped",
      ).length,
    };
    const title = course
      ? `${course.code} · ${course.title}`
      : "All Student Submissions";
    const selectedAssignmentLabel = assignment
      ? `${assignment.unit} · ${assignment.title}`
      : "";
    const lastUpdated = remoteSubmissionsState.lastLoadedAt
      ? `Updated ${formatDate(remoteSubmissionsState.lastLoadedAt, true)}`
      : submissionsEndpointUrl()
        ? "Waiting for the first Lotus Drive refresh"
        : "Showing submissions available on this device";
    const emptyTitle =
      query || selectedStatus !== "awaiting"
        ? "No Submissions Match These Filters"
        : "You’re All Caught Up";
    const recordsMarkup =
      submissionsRequestInFlight && !allRecords.length
        ? `<div class="teacher-empty" role="status">${icon("clock", 30)}<h3>Loading Submissions…</h3><p>Checking Lotus Drive for the latest student work.</p></div>`
        : remoteSubmissionsState.error && !allRecords.length
          ? `<div class="teacher-empty">${icon("file", 30)}<h3>Couldn’t Load Submissions</h3><p>No records could be loaded. Try the connection again.</p><button class="button button-primary" type="button" data-action="refresh-submissions">Try Again</button></div>`
          : teacherHierarchy(
              records,
              query
                ? "No submissions match this search. Try a student, assignment, file name or receipt."
                : selectedStatus === "awaiting"
                  ? "No submitted work is waiting for review right now."
                  : selectedStatus !== "all"
                    ? "No submissions match this review status."
                    : "Student work will appear here after it is submitted.",
              emptyTitle,
            );
    return `
      ${pageHeading(
        course ? course.subject : "Submission Centre",
        title,
        course
          ? `Browse ${course.code} work by student, module and assignment.`
          : "Every uploaded assignment is organized by course, student, unit and assignment.",
        course
          ? '<a class="button button-secondary" href="#/teacher/submissions">View All Courses</a>'
          : "",
      )}
      <section class="teacher-section teacher-submission-centre" aria-busy="${submissionsRequestInFlight}">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${course ? "Course Files" : "Faculty Records"}</p>
            <h2>${plural(records.length, "Matching Submission")}</h2>
          </div>
          <div class="teacher-refresh-summary">
            <span>${escapeHtml(lastUpdated)}</span>
            ${
              submissionsEndpointUrl()
                ? `<button class="button button-secondary" type="button" data-action="refresh-submissions" ${submissionsRequestInFlight ? "disabled" : ""}>${submissionsRequestInFlight ? "Refreshing…" : "Refresh"}</button>`
                : ""
            }
          </div>
        </div>
        <form class="teacher-submission-filters" id="teacher-submission-filter-form">
          <label>
            <span>Search</span>
            <input name="query" type="search" value="${escapeHtml(query)}" placeholder="Student, assignment, file or receipt" />
          </label>
          <label>
            <span>Course</span>
            <select name="course">
              <option value="all" ${selectedCourse === "all" ? "selected" : ""}>All Courses</option>
              ${catalogCourses()
                .map(
                  (item) =>
                    `<option value="${item.id}" ${selectedCourse === item.id ? "selected" : ""}>${item.code} · ${escapeHtml(item.title)}</option>`,
                )
                .join("")}
            </select>
          </label>
          <button class="button button-primary" type="submit">Apply Filters</button>
          <button class="button button-quiet" type="button" data-action="clear-teacher-filters">Reset</button>
        </form>
        ${
          selectedAssignmentLabel
            ? `<div class="teacher-active-filter"><span>Assignment</span><strong>${escapeHtml(selectedAssignmentLabel)}</strong><a href="#/teacher/submissions/${course?.id || ""}">Clear assignment filter</a></div>`
            : ""
        }
        <div class="teacher-queue-tabs" aria-label="Filter submissions by review status">
          ${[
            ["awaiting", "Needs Review"],
            ["revision", "Revision Requested"],
            ["graded", "Returned"],
            ["unmapped", "Needs Mapping"],
            ["all", "All"],
          ]
            .map(
              ([key, label]) => `
                <button type="button" data-action="set-teacher-status" data-status="${key}" aria-pressed="${selectedStatus === key}">
                  <span>${label}</span><strong>${statusCounts[key]}</strong>
                </button>
              `,
            )
            .join("")}
        </div>
        ${
          submissionsRequestInFlight
            ? '<p class="form-notice" role="status">Refreshing submissions from Lotus Drive…</p>'
            : remoteSubmissionsState.error && allRecords.length
              ? `<div class="form-notice teacher-refresh-error" role="alert"><span>${escapeHtml(remoteSubmissionsState.error)} Existing records remain available below.</span><button class="button button-secondary" type="button" data-action="refresh-submissions">Try Again</button></div>`
              : ""
        }
        ${recordsMarkup}
      </section>
    `;
  }

  function teacherSubmissionDetailView(studentKey, assignmentId) {
    const record = teacherSubmissionRecords().find(
      (item) =>
        studentRecordKey(item.student) === studentKey &&
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
    const gradingDraft = gradingDraftFor(record);
    const centralDraft =
      !gradingDraft &&
      record.submission.score != null &&
      !record.submission.publishedAt &&
      record.submission.status !== "graded";
    const gradeScoreValue =
      gradingDraft?.score ??
      (record.submission.score == null ? "" : String(record.submission.score));
    const gradeFeedbackValue =
      gradingDraft?.feedback ?? record.submission.feedback ?? "";
    const nextAwaitingRecord = teacherSubmissionRecords().find(
      (item) => item.id !== record.id && isAwaitingTeacherReview(item),
    );
    const history = record.history.length
      ? [...record.history].reverse()
      : [
          {
            attemptNumber: record.submission.attemptNumber,
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
        ${
          record.unmapped
            ? `<span>${escapeHtml(record.course.code)}</span>`
            : `<a href="#/teacher/course/${record.course.id}">${escapeHtml(record.course.code)}</a>`
        }<span>/</span>
        <span>${escapeHtml(record.student.displayName)}</span><span>/</span>
        <span>${escapeHtml(record.assignment.unit)}</span><span>/</span>
        <span aria-current="page">${escapeHtml(record.assignment.title)}</span>
      </nav>
      ${pageHeading(
        `${escapeHtml(record.course.code)} · ${escapeHtml(record.assignment.unit)}`,
        escapeHtml(record.assignment.title),
        `${escapeHtml(record.student.displayName)} · ${escapeHtml(record.student.email || record.student.id || "Student record")}`,
        `<div class="teacher-detail-heading-actions"><span class="status ${status.className}">${status.label}</span><button class="button button-primary" type="button" data-action="focus-grading">Grade Submission</button></div>`,
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
                const versionNumber = Number.isInteger(
                  Number(version.attemptNumber),
                )
                  ? Number(version.attemptNumber)
                  : history.length - index;
                const fileReceiptId =
                  version.fileReceiptId ||
                  (index === 0 ? record.submission.fileReceiptId : "");
                const fileUrl = configuredDriveUrl(
                  version.fileUrl ||
                    (index === 0 ? record.submission.fileUrl : ""),
                  configuredDriveUrl(SUBMISSION_CONFIG.submissionsEndpoint) ||
                    window.location.href,
                );
                const fileName =
                  version.fileName ||
                  (index === 0 ? record.submission.fileName : "") ||
                  "Submission note only";
                return `
                  <article class="submission-file-card">
                    <span>${icon("file", 22)}</span>
                    <div>
                      <strong>${escapeHtml(fileName)}</strong>
                      <p>Version ${versionNumber} · ${formatDate(version.submittedAt, true)}</p>
                      <small>${escapeHtml(version.receiptId || "")}${version.fileSize ? ` · ${formatFileSize(version.fileSize)}` : ""}</small>
                    </div>
                    ${fileUrl
                      ? `<a class="button button-secondary" href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener">Open File</a>`
                      : fileReceiptId
                        ? `<button class="button button-secondary" type="button" data-action="download-submission" data-receipt="${escapeHtml(fileReceiptId)}">Download File</button>`
                        : '<span class="file-unavailable">File metadata only</span>'}
                  </article>
                `;
              }).join("")}
            </div>
            <p class="login-help"><strong>File Availability</strong>${submissionsEndpointUrl() ? "Submitted files are opened through the secure school service. Records without an attached file show metadata only." : "Files saved in this browser can be downloaded here. Records created on another device may show metadata only."}</p>
          </article>
        </div>
        <aside>
          <article class="teacher-detail-card">
            <p class="eyebrow">Record Details</p>
            <h2>${escapeHtml(record.student.displayName)}</h2>
            <dl>
              ${
                record.student.email
                  ? `<div><dt>Email</dt><dd>${escapeHtml(record.student.email)}</dd></div>`
                  : `<div><dt>Student ID</dt><dd>${escapeHtml(record.student.id || "Unavailable")}</dd></div>`
              }
              <div><dt>Course</dt><dd>${escapeHtml(record.course.code)} · ${escapeHtml(record.course.title)}</dd></div>
              <div><dt>Unit</dt><dd>${escapeHtml(record.assignment.unit)} · ${escapeHtml(record.assignment.unitTitle)}</dd></div>
              <div><dt>Submitted</dt><dd>${formatDate(record.submission.submittedAt, true)}</dd></div>
              <div><dt>Receipt</dt><dd>${escapeHtml(record.submission.receiptId)}</dd></div>
              <div><dt>Versions</dt><dd>${record.versionCount}</dd></div>
            </dl>
          </article>
          <article class="teacher-detail-card grading-card">
            <p class="eyebrow">Assessment</p>
            <h2>Grade This Submission</h2>
            <form class="assignment-form grading-form" id="grading-form"
              data-submission="${escapeHtml(record.submission.id || record.id)}"
              data-student="${escapeHtml(studentRecordKey(record.student))}"
              data-assignment="${escapeHtml(record.assignment.id)}">
              <label for="grade-score">Percentage Score</label>
              <div class="grade-score-input">
                <input id="grade-score" name="score" type="number" min="0" max="100" step="1" inputmode="numeric" required aria-describedby="grading-form-alert grading-help" value="${escapeHtml(gradeScoreValue)}" />
                <span aria-hidden="true">%</span>
              </div>
              <label for="grade-feedback">Teacher Feedback</label>
              <textarea id="grade-feedback" name="feedback" maxlength="10000" required aria-describedby="grading-form-alert grading-help" placeholder="Explain strengths and the next step for improvement.">${escapeHtml(gradeFeedbackValue)}</textarea>
              <p class="form-alert is-error" id="grading-form-alert" role="alert" tabindex="-1" hidden></p>
              <p class="grading-status ${
                gradingDraft || centralDraft
                  ? "is-draft"
                  : record.submission.score != null
                    ? "is-graded"
                    : "is-pending"
              }">${
                gradingDraft
                  ? `Draft saved on this device at ${formatDate(gradingDraft.savedAt, true)} · Not published to the student.`
                  : centralDraft
                    ? `Draft saved to the school record${record.submission.updatedAt || record.submission.gradedAt ? ` at ${formatDate(record.submission.updatedAt || record.submission.gradedAt, true)}` : ""} · Not published to the student; any earlier published result remains visible.`
                  : record.submission.score != null
                    ? `Returned at ${record.submission.score}%${record.submission.updatedAt || record.submission.gradedAt ? ` · Updated ${formatDate(record.submission.updatedAt || record.submission.gradedAt, true)}` : ""}`
                    : "Awaiting grading"
              }</p>
              <div class="grading-actions">
                <button class="button button-secondary" type="button" data-action="save-grade-draft">Save Draft</button>
                <button class="button button-primary" type="submit" ${
                  record.unmapped ||
                  (submissionsEndpointUrl() &&
                    !configuredDriveUrl(SUBMISSION_CONFIG.gradingEndpoint))
                    ? "disabled"
                    : ""
                }>Publish Grade & Feedback</button>
              </div>
              ${
                record.unmapped
                  ? '<p class="login-help" id="grading-help">This Lotus record is not matched to the local assignment catalogue. Confirm the course and assignment before publishing.</p>'
                  : submissionsEndpointUrl() &&
                      !configuredDriveUrl(SUBMISSION_CONFIG.gradingEndpoint)
                  ? '<p class="login-help" id="grading-help">You can save a device draft now. Connect the grading service before publishing to the student.</p>'
                  : '<p class="login-help" id="grading-help">Save Draft syncs a valid score and current feedback to the school record without showing it to the student. Publish releases the percentage and feedback.</p>'
              }
              ${
                nextAwaitingRecord
                  ? `<a class="button button-quiet grading-next-link" href="${teacherRecordLink(nextAwaitingRecord)}">Review Next Submission ${icon("arrow", 15)}</a>`
                  : ""
              }
            </form>
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
    const passwordSignInReady =
      serverAuthReady() || AUTH_CONFIG.allowDeviceAccounts;
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
              ? "James Whitmore can continue with his Lake Forest Academy Google Workspace account or use his assigned faculty credentials."
              : "Sign in with your school account or the personal email account you registered for Lake Forest Learning."
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
                    : "Workspace authorization will activate after the school OAuth client and secure callback are connected."
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
          <button class="button button-primary login-submit" type="submit" ${passwordSignInReady ? "" : 'disabled aria-disabled="true"'}>${facultyPortal ? "Faculty Sign In" : "Student Sign In"} ${icon("arrow", 17)}</button>
        </form>
        ${
          passwordSignInReady
            ? ""
            : `<p class="auth-setup-note ${API_STATUS.state === "unavailable" || API_STATUS.state === "invalid" ? "is-error" : ""}" role="${API_STATUS.state === "invalid" ? "alert" : "status"}">${escapeHtml(apiAvailabilityMessage("Secure password sign-in is awaiting the school API deployment. No browser-only password is accepted."))}</p>`
        }
        ${
          facultyPortal
            ? `
              <div class="auth-switch">
                <p><strong>Need your school mailbox?</strong>Open the Google Workspace Gmail page in a new tab.</p>
                <a class="button button-secondary full-width" href="${WORKSPACE_GMAIL_URL}" target="_blank" rel="noopener noreferrer">Open Workspace Gmail</a>
              </div>
              <p class="login-help"><strong>Faculty Access</strong>This entry is assigned to James Whitmore. Additional faculty accounts are provisioned by school administrators.</p>
            `
            : `
              <div class="auth-switch">
                <p><strong>New to Lake Forest Learning?</strong>Create an account with your personal email address.</p>
                <a class="button button-secondary full-width" href="#/register">Create Personal Account</a>
              </div>
              <p class="login-help"><strong>School Account</strong>Students with an assigned Lake Forest Academy email can use the credentials issued by the school.</p>
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
    const serverRegistrationReady = Boolean(
      configuredAuthUrl(AUTH_CONFIG.registrationEndpoint),
    );
    const deviceRegistrationReady =
      !serverRegistrationReady && AUTH_CONFIG.allowDeviceAccounts;
    const registrationReady =
      serverRegistrationReady || deviceRegistrationReady;
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
        <p class="login-intro">Use any personal email address to create a Lake Forest Learning student profile${deviceRegistrationReady ? " on this development device" : ""}.</p>
        ${
          registrationReady
            ? ""
            : `<p class="auth-setup-note ${API_STATUS.state === "unavailable" || API_STATUS.state === "invalid" ? "is-error" : ""}" role="${API_STATUS.state === "invalid" ? "alert" : "status"}">${escapeHtml(apiAvailabilityMessage("Registration will open when the secure school API is deployed."))}</p>`
        }
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
          ${
            deviceRegistrationReady
              ? `<label class="consent-row" for="deviceConsent">
                  <input id="deviceConsent" name="deviceConsent" type="checkbox" value="yes" ${errors.deviceConsent ? 'aria-invalid="true" aria-describedby="deviceConsent-error"' : ""} />
                  <span>I understand this development account is saved only on this device.</span>
                </label>
                ${fieldError(errors, "deviceConsent")}`
              : ""
          }
          <button class="button button-primary login-submit" type="submit" ${registrationReady ? "" : 'disabled aria-disabled="true"'}>Create Account ${icon("arrow", 17)}</button>
        </form>
        <p class="auth-privacy-note"><strong>Your privacy matters.</strong>${deviceRegistrationReady ? "Your name, email and protected password record stay in this development browser." : "Your password is sent only to the secure school API and is never stored in this webpage."}</p>
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
            <div><dt>Account Storage</dt><dd>${AUTH_CONFIG.allowDeviceAccounts && !configuredAuthUrl(AUTH_CONFIG.registrationEndpoint) ? "Development browser" : "Secure school account"}</dd></div>
          </dl>
          <button class="button button-primary full-width" type="button" data-action="continue-to-signin">Continue to Sign In ${icon("arrow", 17)}</button>
          <p class="auth-privacy-note"><strong>Next step:</strong>Sign in with the personal email and password you just registered.</p>
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
    const enrolled = studentCourses();
    const progress = overallProgress();
    const actions = smartActions();
    const primary = actions[0];
    const pending = studentAssignments().filter((item) =>
      ["due", "late", "overdue", "revision"].includes(
        assignmentStatus(item).key,
      ),
    );
    const feedback = unreadFeedback();
    const weekEvents = calendarEvents().slice(0, 5);
    const primaryCopy = !enrolled.length
      ? "Choose your courses to build your learning plan and unlock course syllabi."
      : primary
      ? `${escapeHtml(primary.eyebrow)} is the most important item in your learning plan.`
      : "You are caught up. Review your progress or plan the week ahead.";
    const primaryAction = !enrolled.length
      ? `<a class="button button-gold" href="#/course-selection">Choose Courses ${icon("arrow", 17)}</a>`
      : primary
      ? `<a class="button button-gold" href="#/${primary.route}">${escapeHtml(primary.cta || "Open Next Action")} ${icon("arrow", 17)}</a>`
      : `<a class="button button-gold" href="#/calendar">Plan Your Week ${icon("arrow", 17)}</a>`;
    return `
      <section class="welcome">
        <div class="welcome-copy">
          <p class="eyebrow light">${todayLabel()}</p>
          <h1>${torontoGreeting()}, ${escapeHtml(user.firstName)}.</h1>
          <p>${primaryCopy}</p>
          ${primaryAction}
        </div>
        <img class="welcome-emblem" src="../images/lake-forest-academy-logo-light.png" alt="" />
      </section>
      <section class="metric-grid" aria-label="Learning summary">
        <a class="metric" href="#/courses" aria-label="${enrolled.length} active courses. Open My Courses."><span class="metric-icon">${icon("book")}</span><span><strong>${enrolled.length}</strong><span>Active Courses</span></span>${icon("arrow", 16)}</a>
        <a class="metric" href="#/progress" aria-label="${progress}% overall progress. Open Progress and Grades."><span class="metric-icon">${icon("check")}</span><span><strong>${progress}%</strong><span>Overall Progress</span></span>${icon("arrow", 16)}</a>
        <a class="metric" href="#/assignments" aria-label="${pending.length} items need attention. Open Assignments."><span class="metric-icon">${icon("clipboard")}</span><span><strong>${pending.length}</strong><span>Items Needing Attention</span></span>${icon("arrow", 16)}</a>
        <a class="metric" href="#/progress" aria-label="${feedback.length} new feedback items. Open Progress and Grades."><span class="metric-icon">${icon("bell")}</span><span><strong>${feedback.length}</strong><span>New Feedback</span></span>${icon("arrow", 16)}</a>
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
          ${
            enrolled.length
              ? enrolled.map(courseRow).join("")
              : '<div class="empty-state"><p>No courses selected yet.</p><a class="button button-secondary" href="#/course-selection">Open Course Selection</a></div>'
          }
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
        <span><h3>${escapeHtml(course.title)}</h3><p>${progress.completed}/${progress.total} modules · ${progress.official ? "official progress" : `${guide.completed}/${guide.total} guide steps`}</p></span>
        <span class="progress-track" aria-label="${progress.percent}% complete"><span style="width:${progress.percent}%"></span></span>
        ${icon("arrow", 18)}
      </a>
    `;
  }

  function courseSelectionView() {
    const enrolled = studentCourses();
    const credits = selectedCreditCount();
    const remoteEnrollmentEnabled = Boolean(
      configuredAuthUrl(AUTH_CONFIG.enrollmentsEndpoint),
    );
    return `
      ${pageHeading(
        "Grade 12 Course Planning",
        "Course Selection",
        "Choose from the six courses in the Lotus OSSD course library. Five are university-preparation courses; BBB4M is university/college preparation.",
        `<span class="selection-count">${enrolled.length} of ${catalogCourses().length} selected</span>`,
      )}
      <section class="selection-intro">
        <div>
          <p class="eyebrow light">Your Learning Plan</p>
          <h2>Select a course to add its lessons, assignments and deadlines.</h2>
          <p>MCV4U requires MHF4U before or at the same time. Other Grade 11 prerequisites are reviewed by Guidance during enrolment.</p>
        </div>
        <a class="button button-gold" href="#/courses">Open My Courses ${icon("arrow", 17)}</a>
      </section>
      <section class="selection-toolbar" aria-label="Selected course plan">
        <div class="selection-toolbar-summary">
          <span class="selection-toolbar-count">${enrolled.length}</span>
          <span><strong>${plural(enrolled.length, "course")} selected</strong><small>${credits.toFixed(1)} planned OSSD ${credits === 1 ? "credit" : "credits"} · ${remoteEnrollmentEnabled ? "saved to your account" : "saved on this device"}</small></span>
        </div>
        <div class="selection-chips">
          ${
            enrolled.length
              ? enrolled
                  .map(
                    (course) =>
                      `<a href="#/course/${course.id}" aria-label="Open ${course.code}: ${escapeHtml(course.title)}">${course.code}</a>`,
                  )
                  .join("")
              : "<span>Choose a course below to begin your plan.</span>"
          }
        </div>
        ${
          enrolled.length
            ? `<a class="button button-primary" href="#/courses">Continue to My Courses ${icon("arrow", 16)}</a>`
            : '<button class="button button-quiet" type="button" disabled>Select Your First Course</button>'
        }
      </section>
      <section class="selection-grid" id="selection-catalog" aria-label="Available courses">
        ${catalogCourses()
          .map((course) => {
            const selected = isCourseEnrolled(course.id);
            const requirement = enrollmentRequirement(course);
            const dependent = studentCourses().find((candidate) =>
              (candidate.prerequisiteCourseIds || []).includes(course.id),
            );
            const hasRecord = courseHasAcademicRecord(course);
            const removalLocked = selected && (hasRecord || dependent);
            const lockCopy = hasRecord
              ? "Contact Guidance to withdraw because academic work is recorded."
              : dependent
                ? `${dependent.code} currently depends on this course.`
                : "";
            return `
              <article class="selection-card ${selected ? "is-selected" : ""}">
                <div class="selection-image">
                  <img src="${course.image}" alt="" />
                  <span class="status ${selected ? "success" : ""}">${selected ? "Selected" : "Available"}</span>
                </div>
                <div class="selection-card-body">
                  <div class="selection-card-title">
                    <span class="course-chip">${course.code}</span>
                    <span>${course.plannedHours} hours · ${escapeHtml(course.credit)}</span>
                  </div>
                  <h2>${escapeHtml(course.title)}</h2>
                  <p>${escapeHtml(course.description)}</p>
                  <dl class="selection-facts">
                    <div><dt>Level</dt><dd>${escapeHtml(course.gradeType)}</dd></div>
                    <div><dt>Prerequisite</dt><dd>${escapeHtml(course.prerequisite)}</dd></div>
                  </dl>
                  ${
                    !selected && !requirement.met
                      ? `<p class="selection-note warning">${escapeHtml(requirement.message)}</p>`
                      : removalLocked
                        ? `<p class="selection-note">${escapeHtml(lockCopy)}</p>`
                        : ""
                  }
                  <div class="selection-actions">
                    ${
                      selected
                        ? `
                          <a class="button button-primary" href="#/course/${course.id}">Open Course ${icon("arrow", 15)}</a>
                          <button
                            class="button button-text-danger"
                            type="button"
                            data-action="toggle-enrollment"
                            data-course="${course.id}"
                            ${removalLocked ? "disabled" : ""}
                          >Remove</button>
                        `
                        : `
                          <a class="button button-quiet" href="#/syllabus/${course.id}">View Syllabus</a>
                          ${
                            !requirement.met && requirement.missing.includes("mhf4u")
                              ? `<button class="button button-primary" type="button" data-action="add-course-pair" data-course="${course.id}">Add MHF4U + ${course.code}</button>`
                              : `<button class="button button-primary" type="button" data-action="toggle-enrollment" data-course="${course.id}" ${!requirement.met ? "disabled" : ""}>Select Course</button>`
                          }
                        `
                    }
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
      <p class="selection-storage-note">${remoteEnrollmentEnabled ? "Course choices are saved to your account and will be available the next time you sign in." : "Course choices are saved only in this browser until the enrolment service is connected."}</p>
    `;
  }

  function courseAccessView(course) {
    return `
      ${pageHeading(
        course.code,
        "Select This Course First",
        `${escapeHtml(course.title)} is not currently part of your learning plan.`,
      )}
      <section class="course-access-card">
        <span class="course-chip">${course.code}</span>
        <h2>${escapeHtml(course.title)}</h2>
        <p>Review the syllabus, prerequisite and evaluation plan before adding this course.</p>
        <div>
          <a class="button button-primary" href="#/course-selection">Open Course Selection</a>
          <a class="button button-secondary" href="#/syllabus/${course.id}">View Syllabus</a>
        </div>
      </section>
    `;
  }

  function coursesView() {
    const enrolled = studentCourses();
    return `
      ${pageHeading(
        "Grade 12 OSSD",
        "My Courses",
        "Open a course to review its outline, work through lessons and see your current progress.",
        '<a class="button button-secondary" href="#/course-selection">Add or Change Courses</a>',
      )}
      <section class="course-grid">
        ${
          enrolled.length
            ? enrolled.map((course) => {
          const progress = courseProgress(course);
          const materials = courseMaterialsDisclosure(course, "student");
          return `
            <article class="course-card ${materials.expanded ? "is-materials-open" : ""}">
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
                  <span>${escapeHtml(course.mode)} · ${course.plannedHours} planned hours</span>
                </div>
                <div class="course-progress">
                  <div><span>${progress.completed} of ${progress.total} modules</span><strong>${progress.percent}%</strong></div>
                  <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
                </div>
                <div class="course-card-actions">
                  <a class="button button-primary" href="#/course/${course.id}">Open Course ${icon("arrow", 16)}</a>
                  ${materials.button}
                </div>
              </div>
              ${materials.panel}
            </article>
          `;
              }).join("")
            : '<div class="course-empty-selection"><span class="course-chip">6 Courses Available</span><h2>Build Your Course Plan</h2><p>Select the courses you want to study. Your dashboard, assignments, calendar and grades will follow that plan.</p><a class="button button-primary" href="#/course-selection">Choose Courses</a></div>'
        }
      </section>
    `;
  }

  function courseView(course) {
    const progress = courseProgress(course);
    const grade = courseGrade(course.id);
    const modules = course.platformModules || [];
    const nextModule =
      modules.find(
        (module) =>
          moduleIsUnlocked(course, module) &&
          moduleStatus(course, module).key !== "completed",
      ) || modules[0];
    if (!modules.length) return notFoundView();
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
            <div><span>${progress.completed} of ${progress.total} modules complete</span><strong>${progress.percent}%</strong></div>
            <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
          </div>
          <div class="course-hero-actions">
            <a class="button button-gold" href="#/${platformModuleRoute(course, nextModule)}">${icon("arrow", 17)} ${nextModule.number === 0 ? "Start Course" : `Continue Module ${nextModule.number}`}</a>
            <a class="button button-on-dark" href="#/syllabus/${course.id}">${icon("book", 17)} View Syllabus</a>
          </div>
        </div>
        <div class="course-hero-image"><img src="${course.image}" alt="" /></div>
      </section>
      <section class="course-detail-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>12-Module Learning Path</h2><p>Read, practise, check understanding, complete evidence, then use feedback to unlock the next module.</p></div></header>
          <div class="platform-connection-note ${progress.official ? "is-connected" : ""}" role="status">
            ${progress.official ? icon("check", 16) : icon("clock", 16)}
            <span><strong>${progress.official ? "Official progress connected" : "Catalog preview"}</strong><small>${progress.official ? "Module completion is synchronized with your school record." : "Course content is available to review. Official completion and unlock decisions appear when the secure course service is connected."}</small></span>
          </div>
          ${modules
            .map((module) => {
              const status = moduleStatus(course, module);
              const assignments = platformAssignmentsForModule(course, module);
              return `
                <a class="platform-module-row ${status.key === "locked" ? "is-locked" : ""}" href="#/${platformModuleRoute(course, module)}">
                  <span class="platform-module-number">${String(module.number).padStart(2, "0")}</span>
                  <span class="platform-module-copy">
                    <span class="module-row-meta">${escapeHtml(module.unitTitle || (module.number === 0 ? "Course Orientation" : module.number === 11 ? "Final Evaluation" : `Unit ${module.unitNumber}`))}</span>
                    <strong>${escapeHtml(module.title)}</strong>
                    <small>${plural(module.readingSteps.length, "reading step")} · ${plural(module.selfStudyResources.length, "resource")} · ${assignments.length ? `${assignments.reduce((sum, assignment) => sum + Number(assignment.weightPercent || 0), 0)}% assessed` : "formative"}</small>
                  </span>
                  <span class="badge ${status.className}">${status.label}</span>
                  ${icon("arrow", 17)}
                </a>
              `;
            })
            .join("")}
          ${studentCourseMaterials(course)}
        </div>
        <aside>
          <div class="panel guide-status-card">
            <header class="panel-header"><div><h3>Course Sequence</h3><p>Permanent catalog</p></div><span class="badge">12 modules</span></header>
            <div class="panel-content">
              <p>Module 0 establishes course routines. Modules 1–10 move through core reading, self-study, guided application and assessment. Module 11 completes the final evaluation.</p>
              <a class="button button-secondary full-width" href="#/syllabus/${course.id}">Review Syllabus</a>
            </div>
          </div>
          <div class="panel">
            <header class="panel-header"><h3>Course Details</h3></header>
            <div class="panel-content course-facts">
              <div class="fact"><span>Instructor</span><strong>${escapeHtml(course.instructor)}</strong></div>
              <div class="fact"><span>Course Mode</span><strong>${escapeHtml(course.mode)}</strong></div>
              <div class="fact"><span>Planned Learning</span><strong>${course.plannedHours} hours</strong></div>
              <div class="fact"><span>Prerequisite</span><strong>${escapeHtml(course.prerequisite)}</strong></div>
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

  function sequenceList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || "")
      .split(/\s*[>→]\s*|\s{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function moduleResourceMarkup(resource) {
    const href =
      safeExternalHttpsUrl(resource?.url) ||
      (driveMaterialsReadReady()
        ? safeProtectedResourceUrl(resource?.openUrl)
        : "");
    const content = `
      <span class="course-code">${escapeHtml(resource?.provider || "Learning Resource")}</span>
      <strong>${escapeHtml(resource?.title || "Learning Resource")}</strong>
      <p>${escapeHtml(resource?.assignedUse || resource?.assigned_use || "Complete the assigned bounded task.")}</p>
      <span class="text-link">${href ? `Open Resource ${icon("arrow", 14)}` : "Secure link unavailable"}</span>
    `;
    return href
      ? `<a class="module-resource-card" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${content}</a>`
      : `<article class="module-resource-card" aria-disabled="true">${content}</article>`;
  }

  function studentModuleView(course, module) {
    const status = moduleStatus(course, module);
    const remoteModule = remotePlatformModule(course, module);
    const assignments = platformAssignmentsForModule(course, module);
    const assessment = module.assessment || {};
    if (status.key === "locked") {
      return `
        <nav class="breadcrumb" aria-label="Breadcrumb"><button type="button" data-route="courses">My Courses</button><span>/</span><button type="button" data-route="course/${course.id}">${course.code}</button><span>/</span><span>Module ${module.number}</span></nav>
        <section class="module-lock-card">
          ${icon("clock", 30)}<p class="course-code">Module ${String(module.number).padStart(2, "0")}</p><h1>${escapeHtml(module.title)}</h1>
          <p>${escapeHtml(module.unlockRule.ruleText || module.feedbackAndUnlock)}</p>
          <a class="button button-secondary" href="#/course/${course.id}">Return to Course Path</a>
        </section>`;
    }
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb"><button type="button" data-route="courses">My Courses</button><span>/</span><button type="button" data-route="course/${course.id}">${course.code}</button><span>/</span><span>Module ${module.number}</span></nav>
      <header class="module-detail-hero">
        <div><p class="eyebrow light">${course.code} · Module ${String(module.number).padStart(2, "0")}</p><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.unitTitle || "Course sequence")}</p></div>
        <span class="badge ${status.className}">${status.label}</span>
      </header>
      <section class="module-detail-layout">
        <div class="module-detail-main">
          <section class="panel module-content-section"><header class="panel-header"><div><h2>Learning Focus</h2><p>${escapeHtml(module.workloadLabel)}</p></div></header><ul class="objective-list">${module.learningFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section class="panel module-content-section"><header class="panel-header"><div><h2>Required Reading Order</h2><p>Complete each step in sequence</p></div></header><ol class="module-sequence-list">${module.readingSteps.map((item) => `<li><span></span><p>${escapeHtml(item)}</p></li>`).join("")}</ol>${module.lessons.length ? `<div class="module-lesson-links">${module.lessons.map((lesson) => `<a class="resource-link" href="#/lesson/${lesson.id}"><span>${icon("book", 18)}</span><span><strong>${escapeHtml(lesson.title)}</strong><small>Core lesson ${lesson.order}</small></span>${icon("arrow", 16)}</a>`).join("")}</div>` : ""}</section>
          <section class="panel module-content-section"><header class="panel-header"><div><h2>Self-Study Resources</h2><p>Use after the required core reading</p></div></header>${module.selfStudyResources.length ? `<div class="module-resource-grid">${module.selfStudyResources.map(moduleResourceMarkup).join("")}</div>` : '<div class="empty-state compact"><p>No external resource is required in this module.</p></div>'}</section>
          <section class="module-activity-grid">
            <article class="panel module-content-section"><h2>Guided Practice</h2><p>${escapeHtml(module.guidedPractice)}</p></article>
            <article class="panel module-content-section"><h2>Low-Stakes Check</h2><p>${escapeHtml(module.lowStakesCheck)}</p></article>
          </section>
          <section class="panel module-content-section assessment-sequence-card"><header class="panel-header"><div><p class="eyebrow">Assessment</p><h2>${escapeHtml(assessment.title || "Module Evidence")}</h2></div><span class="badge ${Number(assessment.weightPercent) > 0 ? "warning" : ""}">${Number(assessment.weightPercent || 0)}% of course grade</span></header><p>${escapeHtml(assessment.taskType || assessment.type || "Formative module check")}</p>${assessment.evidenceFile ? `<p><strong>Evidence file:</strong> ${escapeHtml(assessment.evidenceFile)}</p>` : ""}<ol class="module-sequence-list compact">${sequenceList(assessment.sequence).map((item) => `<li><span></span><p>${escapeHtml(item)}</p></li>`).join("")}</ol>${assignments.map((assignment) => `<a class="button button-primary" href="#/assignment/${assignment.id}">${assignment.teacherRecorded ? "View Gradebook Item" : "Open Assignment"}: ${escapeHtml(assignment.title)} (${assignment.weightPercent}%)</a>`).join("")}</section>
        </div>
        <aside>
          <section class="panel"><header class="panel-header"><h3>Feedback & Unlock</h3></header><div class="panel-content"><p>${escapeHtml(module.feedbackAndUnlock)}</p><div class="platform-connection-note ${officialProgressConnected(course) ? "is-connected" : ""}"><span>${officialProgressConnected(course) ? "Official record connected" : "Official progress unavailable"}</span></div>${officialProgressConnected(course) ? `<button class="button button-primary full-width" type="button" data-action="set-module-complete" data-course="${course.id}" data-module="${module.number}" data-module-id="${escapeHtml(remoteModule?.id || "")}" data-activity-id="${escapeHtml(remoteModule?.activity?.id || "")}" ${!remoteModule?.id || (status.key !== "completed" && !remoteModule?.activity?.id) ? "disabled" : ""}>${status.key === "completed" ? "Reopen Module" : `${icon("check", 16)} Mark Module Complete`}</button>` : '<p class="teacher-security-note"><strong>Preview only.</strong> Browser activity is not treated as the school’s official progress record.</p>'}</div></section>
          <section class="panel"><header class="panel-header"><h3>Module Evidence</h3></header><div class="panel-content"><p><strong>Estimated credit time</strong><br>${module.estimatedCreditHours || 0} hours</p></div></section>
        </aside>
      </section>`;
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
              <div class="guide-fact"><span>Course Structure</span><strong>${course.platformModules?.length || 0} modules</strong></div>
              <div class="guide-fact"><span>Planned Learning</span><strong>${course.plannedHours} hours</strong></div>
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

  function courseSyllabusView(course) {
    const guide = guideProgress(course);
    const syllabus = course.syllabus || {
      gradeType: "Grade 12",
      plannedHours: 110,
      description: course.overview,
      units: [],
    };
    const selected = isCourseEnrolled(course.id);
    const nextModule =
      (course.platformModules || []).find(
        (module) =>
          moduleIsUnlocked(course, module) &&
          moduleStatus(course, module).key !== "completed",
      ) || course.platformModules?.[0];
    const requirement = enrollmentRequirement(course);
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="${selected ? "courses" : "course-selection"}">${selected ? "My Courses" : "Course Selection"}</button><span>/</span>
        <span>${course.code}</span><span>/</span>
        <span>Course Syllabus</span>
      </nav>
      <section class="guide-hero syllabus-hero">
        <div>
          <p class="eyebrow light">${course.code} · Course Syllabus</p>
          <h1>${escapeHtml(course.title)}</h1>
          <p>${escapeHtml(syllabus.description || course.overview)}</p>
        </div>
        <div class="guide-progress-summary">
          <strong>${syllabus.plannedHours || 110}</strong>
          <span>planned learning hours · ${escapeHtml(course.credit)}</span>
          <small>${escapeHtml(syllabus.gradeType || course.gradeType || "Grade 12")}</small>
        </div>
      </section>
      <section class="syllabus-action-card">
        <div>
          <p class="eyebrow">${selected ? `${course.code} Learning Path` : "Ready to Begin?"}</p>
          <h2>${selected ? (nextModule ? escapeHtml(nextModule.title) : "Course Learning Path Complete") : `Add ${course.code} to Your Learning Plan`}</h2>
          <p>${selected ? (nextModule ? `Module ${nextModule.number} is your next step. Official progress is synchronized when the secure course service is connected.` : "Review your completed work and published feedback.") : `Add this course now to open its modules, assignments and progress tracking.`}</p>
        </div>
        ${
          selected
            ? `<a class="button button-primary" href="${nextModule ? `#/${platformModuleRoute(course, nextModule)}` : `#/course/${course.id}`}">${nextModule ? `Open Module ${nextModule.number}` : "Review Course"} ${icon("arrow", 16)}</a>`
            : !requirement.met && requirement.missing.includes("mhf4u")
              ? `<button class="button button-primary" type="button" data-action="add-course-pair" data-course="${course.id}">Add MHF4U + ${course.code}</button>`
              : `<button class="button button-primary" type="button" data-action="toggle-enrollment" data-course="${course.id}" ${!requirement.met ? "disabled" : ""}>Add ${course.code}</button>`
        }
      </section>
      <section class="guide-layout">
        <div class="guide-main">
          <section class="panel">
            <header class="panel-header"><div><h2>Course at a Glance</h2><p>${escapeHtml(course.mode)} · ${escapeHtml(course.credit)}</p></div></header>
            <div class="guide-fact-grid">
              <div class="guide-fact"><span>Course Code</span><strong>${course.code}</strong></div>
              <div class="guide-fact"><span>Course Type</span><strong>${escapeHtml(syllabus.gradeType || course.gradeType || "Grade 12")}</strong></div>
              <div class="guide-fact"><span>Weekly Commitment</span><strong>${escapeHtml(course.weeklyHours)}</strong></div>
              <div class="guide-fact"><span>Prerequisite</span><strong>${escapeHtml(course.prerequisite)}</strong></div>
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>110-Hour Module Plan</h2><p>Learning, assessed evidence, teacher feedback and final evaluation</p></div></header>
            <div class="syllabus-units">
              ${(course.platformModules || [])
                .map((module) => {
                  const status = moduleStatus(course, module);
                  return `
                    <details class="syllabus-unit" ${module.number === 0 ? "open" : ""}>
                      <summary>
                        <span class="syllabus-unit-number">${String(module.number).padStart(2, "0")}</span>
                        <span><span class="course-code">Module ${module.number}</span><strong>${escapeHtml(module.title)}</strong></span>
                        <span class="syllabus-unit-hours">${module.estimatedCreditHours || 0} hours</span>
                        <span class="syllabus-unit-toggle">${status.label} ${icon("arrow", 15)}</span>
                      </summary>
                      <div class="syllabus-unit-body">
                        <p>${escapeHtml(module.learningFocus[0] || `Review the learning goals, evidence requirements and assessment for ${module.title}.`)}</p>
                        ${
                          selected
                            ? `<a class="button button-secondary" href="#/${platformModuleRoute(course, module)}">Open Module ${icon("arrow", 15)}</a>`
                            : `<span class="syllabus-unit-lock">${icon("book", 16)} Add this course to open the module learning path.</span>`
                        }
                      </div>
                    </details>
                  `;
                })
                .join("")}
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>Evaluation Plan</h2><p>Current weighting in the Lotus course implementation package</p></div></header>
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
              <strong>Final-evaluation administration</strong>
              <p>Mandatory examinations are completed in the designated examination period under school-approved identity, supervision, security and accommodation procedures.</p>
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>Course Materials</h2><p>Student-facing documents from the secure course index</p></div>${selected ? `<span class="badge">${plural(courseDriveMaterialCount(course), "item")}</span>` : ""}</header>
            <div class="syllabus-resources">
              ${selected ? courseMaterialsBody(course, "Materials") : `<div class="course-materials-status" role="status">${icon("file", 18)}<span><strong>Select this course to view materials</strong><small>Course files are available only to enrolled students.</small></span></div>`}
            </div>
          </section>
          <section class="panel">
            <header class="panel-header"><div><h2>Academic Practice</h2><p>Evidence, authorship and accessible learning</p></div></header>
            <div class="guide-copy">
              <p>Retain notes, source records, calculations, drafts, tests, feedback and revisions as evidence of process and authorship. Cite external ideas, data, images, quotations, code, models and media in the format specified by the teacher.</p>
              <p>Approved accommodations may change the format or timing of evidence without changing the curriculum expectation or authentication standard. Contact Student Support before a timed assessment is scheduled.</p>
            </div>
          </section>
        </div>
        <aside>
          <section class="panel guide-checklist">
            <header class="panel-header"><div><h2>${selected ? "Before You Begin" : "Course Selection"}</h2><p>${selected ? "Complete each orientation step" : "Add this course to your plan"}</p></div></header>
            <div class="panel-content">
              ${
                selected
                  ? COURSE_GUIDE_STEPS.map((step) => {
                      const checked = guide.checked.includes(step.id);
                      return `
                        <button class="guide-check ${checked ? "is-complete" : ""}" type="button" data-action="toggle-guide-step" data-course="${course.id}" data-step="${step.id}" aria-pressed="${checked}">
                          <span>${checked ? icon("check", 15) : ""}</span>
                          <strong>${escapeHtml(step.label)}</strong>
                        </button>
                      `;
                    }).join("")
                  : `<p>Review the prerequisite and syllabus, then add ${course.code} from Course Selection.</p>`
              }
              ${
                selected
                  ? `<a class="button button-primary full-width" href="${nextModule ? `#/${platformModuleRoute(course, nextModule)}` : `#/course/${course.id}`}">${nextModule ? `Open Module ${nextModule.number}` : "Review Course"} ${icon("arrow", 16)}</a>`
                  : !requirement.met && requirement.missing.includes("mhf4u")
                    ? `<button class="button button-primary full-width" type="button" data-action="add-course-pair" data-course="${course.id}">Add MHF4U + ${course.code}</button>`
                    : `<button class="button button-primary full-width" type="button" data-action="toggle-enrollment" data-course="${course.id}" ${!requirement.met ? "disabled" : ""}>Add ${course.code}</button>`
              }
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
    const nextCandidate = courseLessons[index + 1];
    const next =
      nextCandidate && lessonIsUnlocked({ ...nextCandidate, course: lesson.course })
        ? nextCandidate
        : null;
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
    const events = calendarEvents();
    const dates = [...new Set(events.map((event) => event.date).filter(Boolean))]
      .sort()
      .slice(0, 5);
    const deadlineEvents = events.filter(
      (event) => event.type === "Assignment Due",
    );
    return `
      ${pageHeading(
        "Offering Schedule",
        "Learning Calendar",
        "Scheduled classes, support sessions and assignment deadlines appear here when the active course offering is published.",
        `<a class="button button-secondary" href="#/assignments">${icon("clipboard", 17)} View Assignments</a>`,
      )}
      <section class="calendar-summary" aria-label="Schedule summary">
        <div><strong>${events.filter((event) => dates.includes(event.date) && event.type === "Live Class").length}</strong><span>Live Classes</span></div>
        <div><strong>${deadlineEvents.filter((event) => dates.includes(event.date)).length}</strong><span>Published Deadlines</span></div>
        <div><strong>${events.filter((event) => dates.includes(event.date) && event.type === "Student Support").length}</strong><span>Support Session</span></div>
        <div><strong>${smartActions().filter((action) => action.priority <= 2).length}</strong><span>Priority Actions</span></div>
      </section>
      <section class="week-calendar" aria-label="Published offering schedule">
        ${dates.length ? dates
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
          .join("") : '<p class="calendar-empty">No offering dates have been published.</p>'}
      </section>
      <section class="calendar-lower-grid">
        <div class="panel">
          <header class="panel-header"><div><h2>Upcoming Deadlines</h2><p>Due date and final submission window</p></div></header>
          ${studentAssignments().slice()
            .sort((a, b) => {
              if (!a.due && !b.due) return a.title.localeCompare(b.title);
              if (!a.due) return 1;
              if (!b.due) return -1;
              return new Date(a.due) - new Date(b.due);
            })
            .map((assignment) => {
              const course = findCourse(assignment.courseId);
              const status = assignmentStatus(assignment);
              const locked = status.key === "locked";
              const rowTag = locked ? "article" : "a";
              const rowTarget = locked
                ? ' aria-disabled="true"'
                : ` href="#/assignment/${assignment.id}"`;
              return `
                <${rowTag} class="deadline-row ${locked ? "is-locked" : ""}"${rowTarget}>
                  <span class="deadline-date"><strong>${assignment.due ? formatDate(assignment.due).split(",")[0] : "TBD"}</strong><small>${assignment.due ? formatTime(assignment.due) : "Offering schedule"}</small></span>
                  <span><p class="course-code">${course.code}</p><h3>${escapeHtml(assignment.title)}</h3><p>${assignment.due ? `Available until ${assignmentAvailabilityLabel(assignment)}` : "Schedule set separately for the active course offering"}</p></span>
                  <span class="badge ${status.className}">${status.label}</span>
                  ${icon(locked ? "clock" : "arrow", 17)}
                </${rowTag}>
              `;
            })
            .join("")}
        </div>
        <aside class="panel weekly-plan">
          <header class="panel-header"><div><h2>Weekly Study Plan</h2><p>Recommended independent study time</p></div></header>
          <div class="panel-content">
            ${studentCourses().map((course) => {
              const progress = courseProgress(course);
              return `
                <a class="study-plan-row" href="#/course/${course.id}">
                  <span class="course-chip">${course.code}</span>
                  <span><strong>${course.plannedHours} planned hours</strong><small>${progress.percent}% official module progress</small></span>
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
          ${studentCourses().map(
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
    const visible = studentAssignments().filter((assignment) => {
      const key = assignmentStatus(assignment).key;
      if (assignmentFilter === "all") return true;
      if (assignmentFilter === "open") {
        return ["open", "due", "upcoming", "late", "overdue", "revision"].includes(
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
                  const cardTag = status.key === "locked" ? "article" : "a";
                  const cardHref =
                    status.key === "locked"
                      ? ' aria-disabled="true"'
                      : ` href="#/assignment/${assignment.id}"`;
                  return `
                    <${cardTag} class="assignment-card ${status.key === "locked" ? "is-locked" : ""}"${cardHref}>
                      <span class="task-dot ${status.key === "overdue" ? "overdue" : ""}"></span>
                      <span>
                        <p class="course-code">${course.code} · ${course.title}</p>
                        <h2>${escapeHtml(assignment.title)}</h2>
                        <p>${assignmentScheduleLabel(assignment)} · ${assignment.weightPercent || 0}% of course grade</p>
                      </span>
                      <span class="badge ${status.className}">${status.label}</span>
                      ${icon(status.key === "locked" ? "clock" : "arrow", 18)}
                    </${cardTag}>
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
    const submission = submissionForAssignment(assignment.id);
    const remoteSubmissionEnabled = submissionUploadEnabled();
    const deliveredToLotus =
      submission?.delivery === "lotus" ||
      Boolean(submission?.driveFileId || submission?.fileUrl);
    const submissionManagedByTeacher =
      assignment.teacherRecorded || assignment.submissionMode === "supervised";
    const requiresSubmissionFile = ["file", "project"].includes(
      assignment.submissionMode,
    );
    const showSubmissionForm =
      !submissionManagedByTeacher &&
      (!submission || replacingSubmissionId === assignment.id);
    const submittedOnTime =
      submission &&
      (!assignment.due ||
        new Date(submission.submittedAt) <= new Date(assignment.due));
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
      [
        deliveredToLotus
          ? "Submitted"
          : remoteSubmissionEnabled
            ? "Ready to Submit"
            : "Saved on This Device",
        deliveredToLotus
          ? "Your work and submission receipt are recorded."
          : remoteSubmissionEnabled
            ? "Attach your completed work and submit it securely to your teacher."
            : "This draft remains in this browser until the Lotus submission service is connected.",
      ],
      ["Under Review", "Your instructor is reviewing the submission."],
      ["Feedback Available", "Comments and rubric results are ready."],
      ["Graded", "The published result is included in your course standing."],
    ];
    const feedbackUnread =
      score != null && !state.feedbackRead.includes(assignment.id);
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button" data-route="assignments">Assignments</button><span>/</span><span>${course.code}</span>
      </nav>
      <section class="assignment-detail">
        <article class="panel assignment-summary">
          <div class="panel-content">
            <p class="course-code">${course.code} · ${course.title}</p>
            <h1>${escapeHtml(assignment.title)}</h1>
            <span class="badge ${submission && !deliveredToLotus ? "warning" : status.className}">${submission && !deliveredToLotus ? "Device-Only Draft" : status.label}</span>
            <div class="assignment-date-grid">
              <div><span>Schedule</span><strong>${assignmentScheduleLabel(assignment)}</strong></div>
              <div><span>Availability</span><strong>${assignmentAvailabilityLabel(assignment)}</strong></div>
              <div><span>Course Weight</span><strong>${assignment.weightPercent || 0}%</strong></div>
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
              score != null
                ? `
                  <section class="lesson-section feedback-panel ${feedbackUnread ? "is-new" : ""}">
                    <div class="feedback-heading">
                      <div><p class="course-code">${feedbackUnread ? "New Feedback" : "Instructor Feedback"}</p><h2>${escapeHtml(course.instructor)}</h2></div>
                      <strong>${score}%</strong>
                    </div>
                    <p>${escapeHtml(feedback || "No written comment was added to this grade.")}</p>
                    ${
                      submission?.updatedAt || submission?.gradedAt
                        ? `<small class="grade-updated-at">Updated ${formatDate(submission.updatedAt || submission.gradedAt, true)}</small>`
                        : ""
                    }
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
              <div class="submission-destination ${remoteSubmissionEnabled ? "is-connected" : "is-local"}">
                <span>${icon(remoteSubmissionEnabled ? "check" : "file", 18)}</span>
                <span>
                  <strong>${remoteSubmissionEnabled ? "Connected to Lotus Drive" : "Device-Only Draft Mode"}</strong>
                  <small>${remoteSubmissionEnabled ? "A successful upload will be available to your teacher." : "The submission service is not connected yet. Work saved here remains in this browser and is not sent to your teacher."}</small>
                </span>
              </div>
              ${
                submissionManagedByTeacher
                  ? `<div class="teacher-recorded-note"><strong>${assignment.submissionMode === "supervised" ? "Supervised assessment" : "Teacher-recorded evidence"}</strong><p>${assignment.submissionMode === "supervised" ? "The school schedules and administers this assessment separately. No browser file upload is required here." : "This gradebook item is based on required contact, checkpoints, conferences and documented use of feedback. No file upload is required here."}</p></div>`
                  : !showSubmissionForm
                  ? `
                    <div class="receipt-card">
                      <div class="receipt-heading">
                        <span>${icon("check", 18)}</span>
                        <div><p class="course-code">${deliveredToLotus ? "Submitted to Lotus Drive" : "Saved on This Device"}</p><h3>${deliveredToLotus ? status.label : "Local Draft"}</h3></div>
                      </div>
                      <dl>
                        <div><dt>Receipt ID</dt><dd>${escapeHtml(submission.receiptId)}</dd></div>
                        <div><dt>${deliveredToLotus ? "Submitted" : "Saved"}</dt><dd>${formatDate(submission.submittedAt, true)}</dd></div>
                        <div><dt>Timing</dt><dd>${submittedOnTime ? "On Time" : "Late"}</dd></div>
                        <div><dt>Version</dt><dd>${submission.history?.length || 1}</dd></div>
                        <div><dt>File</dt><dd>${escapeHtml(submission.fileName || "Submission note only")}</dd></div>
                        <div><dt>Grading</dt><dd>${score == null ? "Awaiting grading" : `${score}% · Returned`}</dd></div>
                        ${
                          score != null && (submission.updatedAt || submission.gradedAt)
                            ? `<div><dt>Grade Updated</dt><dd>${formatDate(submission.updatedAt || submission.gradedAt, true)}</dd></div>`
                            : ""
                        }
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
                          (record, index) => {
                            const versionNumber = Number.isInteger(
                              Number(record.attemptNumber),
                            )
                              ? Number(record.attemptNumber)
                              : submission.history.length - index;
                            return `
                            <div>
                              <span>${versionNumber}</span>
                              <p><strong>Version ${versionNumber}</strong><br />${formatDate(record.submittedAt, true)}<br /><small>${escapeHtml(record.receiptId)}</small></p>
                            </div>
                          `;
                          },
                        )
                        .join("")}
                    </div>
                  `
                  : `
                    <form class="assignment-form" id="assignment-form" data-id="${assignment.id}">
                      <div class="form-alert" id="assignment-form-alert" role="alert" tabindex="-1" hidden></div>
                      ${
                        submission
                          ? '<p class="form-notice">Replacing this work creates a new version. Earlier versions remain in the submission history.</p>'
                          : ""
                      }
                      <label for="submission-note">Submission Note</label>
                      <textarea id="submission-note" name="note" placeholder="Add a short note for your instructor…">${escapeHtml(submission?.text || "")}</textarea>
                      <label for="submission-file">Attach a File${requiresSubmissionFile ? " (required)" : ""}</label>
                      <input id="submission-file" name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" aria-describedby="submission-file-help" ${requiresSubmissionFile ? 'required aria-required="true"' : ""} />
                      <p class="field-help" id="submission-file-help">PDF, Word, PowerPoint or Excel · maximum 25 MB${requiresSubmissionFile ? " · required for this assignment" : ""}</p>
                      <div class="file-preview" id="submission-file-preview" hidden>
                        <span>${icon("file", 18)}</span>
                        <span><strong data-file-name></strong><small data-file-meta></small></span>
                        <button type="button" data-action="clear-submission-file">Remove</button>
                      </div>
                      ${submission?.fileName ? `<p class="login-help">Current file: ${escapeHtml(submission.fileName)}</p>` : ""}
                      <label class="integrity-check" for="submission-integrity">
                        <input id="submission-integrity" name="integrity" type="checkbox" value="confirmed" />
                        <span>I confirm that this is my own work and that I have credited all sources.</span>
                      </label>
                      <button class="button button-primary" type="submit">${icon("file", 17)} ${remoteSubmissionEnabled ? (submission ? "Submit New Version to Lotus Drive" : "Submit to Lotus Drive") : "Save Draft on This Device"}</button>
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
    const enrolled = studentCourses();
    const standings = enrolled.map((course) => courseGrade(course.id)).filter(Boolean);
    const average = standings.length
      ? Math.round(
          standings.reduce((total, grade) => total + grade.current, 0) /
            standings.length,
        )
      : null;
    const graded = studentAssignments().filter(
      (assignment) => assignmentScore(assignment) != null,
    );
    const assignmentGradebookIds = new Set(
      studentAssignments()
        .map((assignment) => assignment.gradebookItemId)
        .filter(Boolean),
    );
    const standaloneDirectGrades = enrolled.flatMap((course) =>
      publishedDirectGrades(course.code)
        .filter(
          (grade) =>
            !assignmentGradebookIds.has(
              String(grade.gradebookItemId || "").toLowerCase(),
            ),
        )
        .map((grade) => ({ course, grade })),
    );
    const evaluatedCount = graded.length + standaloneDirectGrades.length;
    const platformModules = enrolled.flatMap((course) =>
      (course.platformModules || []).map((module) => ({ course, module })),
    );
    const completedModules = platformModules.filter(
      ({ course, module }) =>
        studentModuleProgress(course, module)?.status === "completed",
    ).length;
    return `
      ${pageHeading(
        "Academic Record",
        "Progress & Grades",
        "A current view of lesson completion and evaluated course work.",
      )}
      <section class="progress-summary">
        <div class="progress-stat"><p class="course-code">Overall Progress</p><strong>${overallProgress()}%</strong><span>${completedModules} of ${platformModules.length} modules complete</span></div>
        <div class="progress-stat"><p class="course-code">Current Average</p><strong>${average == null ? "—" : `${average}%`}</strong><span>${average == null ? "No published grades yet" : `Across ${enrolled.length} active courses`}</span></div>
        <div class="progress-stat"><p class="course-code">Evaluated Work</p><strong>${evaluatedCount}</strong><span>${evaluatedCount === 1 ? "Published gradebook result" : "Published gradebook results"}</span></div>
      </section>
      <section class="panel">
        <header class="panel-header"><div><h2>Course Standing</h2><p>Updated as evaluated work is returned</p></div></header>
        ${enrolled.map((course) => {
          const grade = courseGrade(course.id);
          const progress = courseProgress(course);
          return `
            <a class="grade-row" href="#/course/${course.id}">
              <span>
                <h3>${course.code} · ${escapeHtml(course.title)}</h3>
                <p>${progress.completed}/${progress.total} modules · Instructor: ${escapeHtml(course.instructor)}</p>
              </span>
              <strong class="grade-score">${grade ? `${grade.current}%` : "—"}</strong>
              <span class="badge ${grade ? "success" : ""}">${grade ? `${grade.gradedWeight || 0}% weight graded` : "Not Yet Graded"}</span>
            </a>
          `;
        }).join("")}
      </section>
      <section class="panel" style="margin-top:23px">
        <header class="panel-header"><div><h2>Returned Work</h2><p>Published feedback and scores</p></div></header>
        ${
          evaluatedCount
            ? `${graded
                .map((assignment) => {
                  const course = findCourse(assignment.courseId);
                  return `
                    <a class="grade-row" href="#/assignment/${assignment.id}">
                      <span><h3>${escapeHtml(assignment.title)}</h3><p>${course.code} · ${assignmentScheduleLabel(assignment, false)}</p></span>
                      <strong class="grade-score">${assignmentScore(assignment)}%</strong>
                      <span>${icon("arrow", 18)}</span>
                    </a>
                  `;
                })
                .join("")}${standaloneDirectGrades
                .map(({ course, grade }) => {
                  const score = normalizedGradePercent(
                    grade.score,
                    grade.maxScore,
                  );
                  return `
                    <div class="grade-row direct-grade-row">
                      <span><h3>${escapeHtml(grade.title || "Gradebook Result")}</h3><p>${course.code} · ${escapeHtml(grade.category || "Direct grade")} · ${Number(grade.weightPercent || 0)}% of course</p>${grade.feedback ? `<small>${escapeHtml(grade.feedback)}</small>` : ""}</span>
                      <strong class="grade-score">${score == null ? "—" : `${score}%`}</strong>
                      <span class="badge success">Published</span>
                    </div>
                  `;
                })
                .join("")}`
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

  function teacherNotFoundView() {
    return `
      <div class="teacher-empty">
        <h1>Page Not Found</h1>
        <p>The faculty page you requested is unavailable.</p>
        <a class="button button-primary" href="#/teacher/courses">Return to Course Management</a>
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

  function setDrawerOpen(open, { restoreFocus = true } = {}) {
    const sidebar = document.querySelector("#sidebar");
    const stage = document.querySelector(".stage");
    const scrim = document.querySelector(".sidebar-scrim");
    const menuButton = document.querySelector(".mobile-menu");
    const skipLink = document.querySelector(".skip-link");
    if (open && sidebar) {
      drawerScrollY = window.scrollY;
      sidebar.classList.add("is-open");
      stage?.setAttribute("inert", "");
      skipLink?.setAttribute("inert", "");
      if (scrim) scrim.hidden = false;
      menuButton?.setAttribute("aria-expanded", "true");
      document.body.style.top = `-${drawerScrollY}px`;
      document.body.classList.add("drawer-open");
      document.querySelector(".sidebar-close")?.focus();
      return;
    }

    const wasOpen = Boolean(sidebar?.classList.contains("is-open"));
    const wasLocked = document.body.classList.contains("drawer-open");
    sidebar?.classList.remove("is-open");
    stage?.removeAttribute("inert");
    skipLink?.removeAttribute("inert");
    if (scrim) scrim.hidden = true;
    menuButton?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    document.body.style.removeProperty("top");
    if (wasLocked) {
      window.scrollTo({ top: drawerScrollY, behavior: "instant" });
    }
    if (restoreFocus && wasOpen) menuButton?.focus();
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
    } else if (teacherRoute[1] === "courses") {
      view = teacherCoursesView();
    } else if (teacherRoute[1] === "submissions") {
      view = teacherSubmissionsView(
        safeDecode(teacherRoute[2] || ""),
        safeDecode(teacherRoute[3] || ""),
      );
    } else if (teacherRoute[1] === "materials") {
      view = teacherMaterialsView();
    } else if (teacherRoute[1] === "course") {
      const course = findCourse(teacherRoute[2]);
      const moduleRequested = teacherRoute[3] === "module";
      const module =
        course && moduleRequested
          ? findPlatformModule(course, teacherRoute[4])
          : null;
      view = !course
        ? teacherNotFoundView()
        : moduleRequested
          ? module
            ? teacherModuleView(course, module)
            : teacherNotFoundView()
          : teacherRoute.length === 3
            ? teacherCourseView(course)
            : teacherNotFoundView();
    } else if (teacherRoute[1] === "submission") {
      view = teacherSubmissionDetailView(
        safeDecode(teacherRoute[2] || ""),
        safeDecode(teacherRoute[3] || ""),
      );
    } else {
      replaceRoute("teacher/dashboard");
      teacherRoute = ["teacher", "dashboard"];
      view = teacherDashboardView();
    }
    APP_ROOT.innerHTML = teacherShell(view);
    if (teacherRoute[1] === "course") {
      ensureTeacherPlatformData(findCourse(teacherRoute[2]));
    }
    if (
      ["course", "courses", "materials"].includes(teacherRoute[1]) &&
      !driveEndpointChecked &&
      driveMaterialsReadReady()
    ) {
      void refreshDriveMaterials({
        silent: teacherRoute[1] === "materials",
      });
    }
    if (
      submissionsEndpointUrl() &&
      submissionsEndpointCheckedFor !== submissionScopeKey() &&
      !submissionsRequestInFlight
    ) {
      void refreshRemoteSubmissions({
        silent: teacherRoute[1] !== "submissions",
      });
    }
  }

  function render(shouldFocusMain = false, preserveScroll = false) {
    if (document.body.classList.contains("drawer-open")) {
      setDrawerOpen(false, { restoreFocus: false });
    }
    const previousScroll = preserveScroll ? window.scrollY : 0;
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
      if (preserveScroll) {
        window.requestAnimationFrame(() =>
          window.scrollTo({ top: previousScroll, behavior: "instant" }),
        );
      }
      if (shouldFocusMain) focusMain();
      return;
    }
    let route = routeParts();
    if (isTeacher()) {
      renderTeacher(route);
      window.requestAnimationFrame(() =>
        window.scrollTo({
          top: preserveScroll ? previousScroll : 0,
          behavior: "instant",
        }),
      );
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
    else if (route[0] === "course-selection") view = courseSelectionView();
    else if (route[0] === "courses") view = coursesView();
    else if (route[0] === "calendar") view = calendarView();
    else if (route[0] === "course") {
      const course = findCourse(route[1]);
      if (!course) {
        view = notFoundView();
      } else if (!isCourseEnrolled(course.id)) {
        view = SELECTABLE_COURSE_IDS.includes(course.id)
          ? courseAccessView(course)
          : notFoundView();
      } else if (route[2] === "module") {
        const module = findPlatformModule(course, route[3]);
        view = module ? studentModuleView(course, module) : notFoundView();
      } else {
        view = route.length === 2 ? courseView(course) : notFoundView();
      }
    } else if (route[0] === "guide" || route[0] === "syllabus") {
      const course = findCourse(route[1]);
      view =
        course && SELECTABLE_COURSE_IDS.includes(course.id)
          ? courseSyllabusView(course)
          : notFoundView();
    } else if (route[0] === "lesson") {
      const lesson = findLesson(route[1]);
      const module = platformModuleForLesson(lesson);
      view = lesson
        ? isCourseEnrolled(lesson.course.id)
          ? module && !moduleIsUnlocked(lesson.course, module)
            ? studentModuleView(lesson.course, module)
            : lessonView(lesson)
          : SELECTABLE_COURSE_IDS.includes(lesson.course.id)
            ? courseAccessView(lesson.course)
            : notFoundView()
        : notFoundView();
    } else if (route[0] === "assignments") view = assignmentsView();
    else if (route[0] === "assignment") {
      const assignment = findAssignment(route[1]);
      const course = assignment ? findCourse(assignment.courseId) : null;
      const module = platformModuleForAssignment(assignment);
      view = assignment
        ? course && isCourseEnrolled(course.id)
          ? module && !moduleIsUnlocked(course, module)
            ? studentModuleView(course, module)
            : assignmentView(assignment)
          : course && SELECTABLE_COURSE_IDS.includes(course.id)
            ? courseAccessView(course)
            : notFoundView()
        : notFoundView();
    } else if (route[0] === "progress") view = progressView();
    else if (route[0] === "announcements") view = announcementsView();
    else if (route[0] === "support") view = supportView();
    else view = notFoundView();
    APP_ROOT.innerHTML = shell(view);
    if (route[0] === "course") {
      ensureStudentPlatformData(findCourse(route[1]));
    } else if (route[0] === "lesson") {
      const lesson = findLesson(route[1]);
      ensureStudentPlatformData(lesson?.course);
    } else if (route[0] === "assignment") {
      const assignment = findAssignment(route[1]);
      ensureStudentPlatformData(findCourse(assignment?.courseId));
    } else if (
      ["dashboard", "assignments", "calendar", "progress"].includes(route[0])
    ) {
      studentCourses().forEach(ensureStudentPlatformData);
    }
    if (
      ["course", "courses", "guide", "syllabus"].includes(route[0]) &&
      !driveEndpointChecked &&
      driveMaterialsReadReady()
    ) {
      void refreshDriveMaterials({ silent: route[0] === "course" });
    }
    if (
      submissionsEndpointUrl() &&
      submissionsEndpointCheckedFor !== submissionScopeKey() &&
      !submissionsRequestInFlight
    ) {
      void refreshRemoteSubmissions({ silent: true });
    }
    window.requestAnimationFrame(() =>
      window.scrollTo({
        top: preserveScroll ? previousScroll : 0,
        behavior: "instant",
      }),
    );
    if (shouldFocusMain) focusMain();
  }

  function navigate(route) {
    window.location.hash = `#/${route}`;
  }

  function setFormAlert(form, message = "", tone = "error") {
    const alert = form?.querySelector("#assignment-form-alert, .form-alert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = `form-alert ${tone ? `is-${tone}` : ""}`;
    alert.hidden = !message;
    if (message) alert.focus?.();
  }

  function setGradingAlert(form, message = "") {
    const alert = form?.querySelector("#grading-form-alert");
    if (!alert) return;
    alert.textContent = message;
    alert.hidden = !message;
    ["score", "feedback"].forEach((name) => {
      const field = form.elements[name];
      if (field) {
        if (message) field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");
      }
    });
    if (message) alert.focus();
  }

  function showToast(
    message,
    {
      tone = "info",
      actionLabel = "",
      action = "",
      persistent = false,
    } = {},
  ) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = `toast toast-${tone}`;
    toast.setAttribute("role", tone === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      ${
        actionLabel && action
          ? `<button type="button" data-action="toast-action" data-toast-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>`
          : ""
      }
      <button class="toast-close" type="button" data-action="dismiss-toast" aria-label="Dismiss notification">${icon("close", 15)}</button>
    `;
    document.body.append(toast);
    window.clearTimeout(toastTimer);
    if (!persistent && !(actionLabel && action)) {
      toastTimer = window.setTimeout(
        () => toast.remove(),
        tone === "error" ? 8000 : 5000,
      );
    }
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
      let remoteLogin = false;
      if (serverAuthReady()) {
        const submitButton = event.target.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Signing In…";
        }
        try {
          const payload = await requestAuthEndpoint(AUTH_CONFIG.loginEndpoint, {
            method: "POST",
            skipSessionExpiry: true,
            body: JSON.stringify({ email, password, portal }),
          });
          account = authenticatedUserFrom(payload);
          accepted = Boolean(
            account &&
              (portal === "faculty"
                ? isTeacher(account)
                : account.role === "student"),
          );
          remoteLogin = accepted;
        } catch (error) {
          loginView({
            error:
              error?.name === "AbortError"
                ? "The sign-in service did not respond. Please try again."
                : error?.message || "Secure sign-in is temporarily unavailable.",
            email,
            portal,
          });
          document.querySelector(email ? "#password" : "#email")?.focus();
          return;
        }
      } else if (AUTH_CONFIG.allowDeviceAccounts && portal === "student") {
        if (email !== TEACHER_EMAIL) {
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
        if (serverAuthReady() && account) {
          await closeWorkspaceSession();
        }
        loginView({
          error:
            !serverAuthReady() && !AUTH_CONFIG.allowDeviceAccounts
              ? "Secure sign-in is not available until the school API is deployed."
              : portal === "faculty"
              ? "The faculty email or password is incorrect. Please try again."
              : "The student email or password is incorrect. Please try again.",
          email,
          portal,
        });
        document.querySelector(email ? "#password" : "#email")?.focus();
        return;
      }
      sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
      startSession(account, { remote: remoteLogin });
      state = loadState(currentUser());
      let enrollmentRefreshError = "";
      if (remoteLogin && account.role === "student") {
        try {
          await refreshRemoteEnrollments();
        } catch (error) {
          enrollmentRefreshError =
            error?.message || "Your course selections could not be refreshed.";
        }
      }
      signInNotice = "";
      signInPrefill = "";
      sessionStorage.removeItem(REGISTERED_ACCOUNT_KEY);
      window.location.hash = isTeacher()
        ? "#/teacher/dashboard"
        : "#/dashboard";
      render(true);
      showToast(
        enrollmentRefreshError ||
          `Welcome back, ${currentUser()?.firstName || "student"}.`,
        { tone: enrollmentRefreshError ? "error" : "success" },
      );
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
      } else if (
        AUTH_CONFIG.allowDeviceAccounts &&
        !configuredAuthUrl(AUTH_CONFIG.registrationEndpoint) &&
        registeredAccount(values.email)
      ) {
        errors.email =
          "We could not create an account with this email. Try signing in or use another address.";
      }
      if (!passwordChecks(password, values.email).every((rule) => rule.met)) {
        errors.password = "Create a password that meets every requirement.";
      }
      if (!confirmation || confirmation !== password) {
        errors.confirmPassword = "Enter the same password again.";
      }
      if (
        AUTH_CONFIG.allowDeviceAccounts &&
        !configuredAuthUrl(AUTH_CONFIG.registrationEndpoint) &&
        form.get("deviceConsent") !== "yes"
      ) {
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
        const registrationEndpoint = configuredAuthUrl(
          AUTH_CONFIG.registrationEndpoint,
        );
        let account;
        let remoteRegistration = false;
        if (registrationEndpoint) {
          const payload = await requestAuthEndpoint(
            registrationEndpoint.toString(),
            {
              method: "POST",
              skipSessionExpiry: true,
              body: JSON.stringify({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password,
              }),
            },
          );
          account = authenticatedUserFrom(payload);
          if (!account || account.role !== "student") {
            throw new Error("The registration service returned an invalid account.");
          }
          remoteRegistration = true;
        } else if (AUTH_CONFIG.allowDeviceAccounts) {
          const salt = createPasswordSalt();
          const passwordHash = await derivePasswordHash(password, salt);
          account = {
            firstName: values.firstName,
            lastName: values.lastName,
            displayName: `${values.firstName} ${values.lastName}`.trim(),
            email: values.email,
            role: "student",
            passwordHash,
            salt,
            createdAt: new Date().toISOString(),
          };
          const accounts = loadAccounts();
          accounts[values.email] = account;
          saveAccounts(accounts);
        } else {
          throw new Error(
            "Registration is not available until the secure school API is deployed.",
          );
        }
        sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
        startSession(account, { remote: remoteRegistration });
        state = loadState(currentUser());
        let enrollmentSyncError = "";
        if (remoteRegistration) {
          try {
            await persistRemoteEnrollments(state.enrolledCourseIds || []);
          } catch (error) {
            enrollmentSyncError =
              error?.message || "Your empty course plan could not be saved.";
          }
        }
        sessionStorage.removeItem(REGISTERED_ACCOUNT_KEY);
        signInPrefill = "";
        signInNotice = "";
        window.location.hash = "#/course-selection";
        render(true);
        showToast(
          enrollmentSyncError ||
            `Welcome, ${account.firstName}. Choose your courses to build your learning plan.`,
          { tone: enrollmentSyncError ? "error" : "success" },
        );
      } catch (error) {
        registrationView(values, {
          form:
            error?.name === "AbortError"
              ? "The registration service did not respond. Please try again."
              : error?.message ||
                "We could not securely create this account. Please try again.",
        });
        document.querySelector("#registration-errors")?.focus();
      }
      return;
    }

    if (event.target.matches(".direct-grade-form")) {
      event.preventDefault();
      const form = event.target;
      setFormAlert(form);
      const values = new FormData(form);
      const scoreText = String(values.get("score") || "").trim();
      const score = Number(scoreText);
      const feedback = String(values.get("feedback") || "").trim();
      const maxScore = Number(form.dataset.maxScore || 100);
      const courseCode = String(form.dataset.courseCode || "").trim();
      const studentId = String(form.dataset.student || "").trim();
      const itemId = String(form.dataset.item || "").trim();
      const version = Number(form.dataset.version || 0);
      const publish = event.submitter?.value === "publish";
      if (
        !courseCode ||
        !studentId ||
        !itemId ||
        !scoreText ||
        !Number.isInteger(score) ||
        score < 0 ||
        score > maxScore
      ) {
        setFormAlert(
          form,
          `Enter a whole-number score from 0 to ${maxScore}.`,
        );
        return;
      }
      const endpoint = platformEndpoint(
        PLATFORM_API_CONFIG.teacherCoursesEndpoint,
        `${encodeURIComponent(courseCode)}/students/${encodeURIComponent(studentId)}/grades/${encodeURIComponent(itemId)}`,
      );
      if (!endpoint) {
        setFormAlert(form, "The secure gradebook service is not connected.");
        return;
      }
      const buttons = [...form.querySelectorAll('[type="submit"]')];
      buttons.forEach((button) => {
        button.disabled = true;
      });
      try {
        await requestPlatformJson(endpoint, {
          method: "PUT",
          headers: {
            "If-Match": `"direct-grade-v${version}"`,
            "Idempotency-Key": requestIdFor("direct-grade"),
          },
          body: JSON.stringify({ score, feedback, publish }),
        });
        delete platformRuntime.teacherGradebooks[courseCode];
        platformRequests.delete(`teacher-gradebook:${courseCode}`);
        const course = findCourse(form.dataset.course);
        if (course) ensureTeacherPlatformData(course);
        showToast(
          publish
            ? "The result was published to the student."
            : "The gradebook draft was saved.",
          { tone: "success" },
        );
      } catch (error) {
        setFormAlert(
          form,
          error?.message || "The gradebook result could not be saved.",
        );
      } finally {
        buttons.forEach((button) => {
          button.disabled = false;
        });
      }
      return;
    }

    if (event.target.id === "unlock-override-form") {
      event.preventDefault();
      setFormAlert(event.target);
      const values = new FormData(event.target);
      const studentId = String(values.get("studentId") || "").trim();
      const reason = String(values.get("reason") || "").trim();
      const moduleId = String(event.target.dataset.moduleId || "").trim();
      const course = findCourse(event.target.dataset.course);
      if (!studentId || !moduleId || reason.length < 10) {
        setFormAlert(
          event.target,
          "Choose a student and provide a documented reason of at least 10 characters.",
        );
        return;
      }
      const endpoint = platformEndpoint(
        PLATFORM_API_CONFIG.teacherStudentsEndpoint,
        `${encodeURIComponent(studentId)}/modules/${encodeURIComponent(moduleId)}/unlock-overrides`,
      );
      const button = event.target.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      try {
        await requestPlatformJson(endpoint, {
          method: "POST",
          body: JSON.stringify({ reason }),
        });
        event.target.reset();
        if (course) {
          platformRequests.delete(`teacher-roster:${course.code}`);
          invalidateTeacherProgress(course);
          ensureTeacherPlatformData(course);
        }
        showToast("The documented module unlock override was created.", {
          tone: "success",
        });
      } catch (error) {
        setFormAlert(
          event.target,
          error?.message || "The unlock override could not be created.",
        );
      } finally {
        if (button) button.disabled = false;
      }
      return;
    }

    if (event.target.id === "teacher-submission-filter-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const selectedCourse = String(form.get("course") || "all");
      teacherSubmissionFilters = {
        ...teacherSubmissionFilters,
        course:
          selectedCourse === "all" || findCourse(selectedCourse)
            ? selectedCourse
            : "all",
        query: String(form.get("query") || "").trim().slice(0, 120),
      };
      const nextHash =
        teacherSubmissionFilters.course === "all"
          ? "#/teacher/submissions"
          : `#/teacher/submissions/${teacherSubmissionFilters.course}`;
      if (window.location.hash === nextHash) {
        render(false, true);
        document
          .querySelector('#teacher-submission-filter-form input[name="query"]')
          ?.focus();
      } else {
        window.location.hash = nextHash;
      }
      return;
    }

    if (event.target.id === "grading-form") {
      event.preventDefault();
      setGradingAlert(event.target);
      const scoreText = String(new FormData(event.target).get("score") || "");
      const score = Number(scoreText);
      const feedback = String(
        new FormData(event.target).get("feedback") || "",
      ).trim();
      if (
        !/^\d{1,3}$/.test(scoreText) ||
        !Number.isInteger(score) ||
        score < 0 ||
        score > 100
      ) {
        setGradingAlert(
          event.target,
          "Enter a whole-number score from 0 to 100.",
        );
        document.querySelector("#grade-score")?.focus();
        return;
      }
      if (!feedback) {
        setGradingAlert(
          event.target,
          "Add written feedback before publishing this grade.",
        );
        document.querySelector("#grade-feedback")?.focus();
        return;
      }
      if ([...feedback].length > 10000) {
        setGradingAlert(
          event.target,
          "Teacher feedback must be 10,000 characters or fewer.",
        );
        document.querySelector("#grade-feedback")?.focus();
        return;
      }
      const studentKey = event.target.dataset.student || "";
      const assignmentId = event.target.dataset.assignment || "";
      const submissionId = event.target.dataset.submission || "";
      const record = teacherSubmissionRecords().find(
        (item) =>
          item.assignment.id === assignmentId &&
          studentRecordKey(item.student) === studentKey,
      );
      if (!record) {
        setGradingAlert(
          event.target,
          "This submission is no longer available.",
        );
        return;
      }
      if (record.unmapped) {
        setGradingAlert(
          event.target,
          "Confirm the course and assignment mapping before publishing this grade.",
        );
        return;
      }
      saveGradingDraft(record, { score: scoreText, feedback });
      const gradedAt = new Date().toISOString();
      const { endpoint: gradingEndpoint, submissionId: targetSubmissionId } =
        gradingRequestTarget(record, submissionId);
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submissionsEndpointUrl() && !gradingEndpoint) {
        setGradingAlert(
          event.target,
          "The grading service must be configured before this grade can be saved.",
        );
        return;
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Publishing…";
      }
      try {
        if (gradingEndpoint) {
          const payload = await requestSubmissionEndpoint(gradingEndpoint, {
            method: "PUT",
            headers: {
              "Idempotency-Key": requestIdFor("grade"),
              "If-Match": record.submission.gradeEtag || '"grade-v0"',
            },
            body: JSON.stringify({
              submissionId: targetSubmissionId,
              score,
              feedback,
              publish: true,
            }),
          });
          applyRemoteSubmissionGrade(record, payload, {
            score,
            feedback,
            publish: true,
            fallbackSubmissionId: submissionId,
          });
        } else {
          const studentState = loadState(record.student);
          const currentSubmission =
            studentState.submissions?.[assignmentId] || record.submission;
          studentState.submissions[assignmentId] = {
            ...currentSubmission,
            score,
            feedback,
            status: "graded",
            gradedAt,
            updatedAt: gradedAt,
          };
          localStorage.setItem(
            stateStorageKey(record.student),
            JSON.stringify(studentState),
          );
        }
        clearGradingDraft(record);
        render(true);
        showToast(
          `Grade and feedback published to ${record.student.displayName}: ${score}%.`,
          { tone: "success" },
        );
      } catch (error) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Publish Grade & Feedback";
        }
        const detail =
          error?.name === "AbortError"
            ? "The grading request timed out."
            : error?.message || "The grade could not be published.";
        const message = `Publishing failed. Your device draft is still safe. ${detail}`;
        setGradingAlert(event.target, message);
        showToast(message, { tone: "error", persistent: true });
      }
      return;
    }

    if (event.target.id === "assignment-form") {
      event.preventDefault();
      const id = event.target.dataset.id;
      setFormAlert(event.target);
      const form = new FormData(event.target);
      const file = form.get("file");
      const assignment = findAssignment(id);
      const existing = submissionForAssignment(id);
      const text = String(form.get("note") || "").trim();
      const newFileName = file instanceof File && file.name ? file.name : "";
      const fileName = newFileName || existing?.fileName || "";
      if (newFileName && file.size > MAX_SUBMISSION_BYTES) {
        setFormAlert(
          event.target,
          `${file.name} is ${formatFileSize(file.size)}. Choose a file no larger than 25 MB.`,
        );
        document.querySelector("#submission-file")?.focus();
        return;
      }
      if (
        ["file", "project"].includes(assignment?.submissionMode) &&
        !newFileName
      ) {
        setFormAlert(
          event.target,
          "Choose a new file for this assignment before continuing.",
        );
        document.querySelector("#submission-file")?.focus();
        return;
      }
      if (!text && !fileName) {
        setFormAlert(
          event.target,
          "Add a submission note or choose a file before continuing.",
        );
        document.querySelector("#submission-note")?.focus();
        return;
      }
      if (form.get("integrity") !== "confirmed") {
        setFormAlert(
          event.target,
          "Confirm the academic integrity statement before continuing.",
        );
        document.querySelector("#submission-integrity")?.focus();
        return;
      }
      const submittedAt = new Date().toISOString();
      const receiptId = receiptIdFor(id, submittedAt);
      const remoteEndpoint = submissionUploadEnabled()
        ? submissionsEndpointUrl()
        : "";
      if (remoteEndpoint) {
        const course = assignment ? findCourse(assignment.courseId) : null;
        const user = currentUser();
        const unitNumber = Number(assignment?.unitNumber);
        const attemptNumber =
          Math.max(
            Number(existing?.attemptNumber || 0),
            existing?.history?.length || 0,
          ) + 1;
        const upload = new FormData();
        upload.set("assignmentId", id);
        upload.set("courseCode", course?.code || "");
        if (
          Number.isInteger(unitNumber) &&
          unitNumber >= 1 &&
          unitNumber <= 999
        ) {
          upload.set("unitNumber", String(unitNumber));
        }
        upload.set("assignmentTitle", assignment?.title || "");
        upload.set("attemptNumber", String(attemptNumber));
        upload.set("note", text);
        upload.set("integrityConfirmed", "true");
        if (existing?.id) upload.set("replacesSubmissionId", existing.id);
        if (newFileName) upload.set("files", file, file.name);
        const submitButton = event.target.querySelector(
          'button[type="submit"]',
        );
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Uploading to Lotus Drive…";
        }
        try {
          const payload = await requestSubmissionEndpoint(remoteEndpoint, {
            method: "POST",
            headers: {
              "Idempotency-Key": requestIdFor("submission"),
            },
            body: upload,
          });
          const extracted = normalizeRemoteSubmissions(payload, user);
          const responseSource =
            payload?.data?.submission ||
            payload?.submission ||
            payload?.data ||
            payload;
          const normalized =
            extracted.records[0] ||
            normalizeRemoteSubmission(responseSource, 0, user);
          const fallbackRecord = normalizeRemoteSubmission(
            {
              submissionId:
                scalarLabel(
                  responseSource?.submissionId || responseSource?.id,
                ) || receiptId,
              assignmentId: id,
              courseId: course?.id || "",
              courseCode: course?.code || "",
              studentEmail: user?.email || "",
              studentName: user?.displayName || "",
              note: text,
              fileName,
              fileSize: newFileName ? file.size : existing?.fileSize || 0,
              fileType:
                (newFileName ? file.type : existing?.fileType) ||
                "application/octet-stream",
              submittedAt,
              receiptId:
                scalarLabel(responseSource?.receiptId) || receiptId,
              driveFileId: scalarLabel(
                responseSource?.driveFileId || responseSource?.fileId,
              ),
              fileUrl:
                responseSource?.fileUrl ||
                responseSource?.webViewLink ||
                responseSource?.openUrl ||
                "",
              status: "submitted",
              history: [
                ...(existing?.history || []),
                {
                  fileName,
                  fileSize: newFileName
                    ? file.size
                    : existing?.fileSize || 0,
                  fileType:
                    (newFileName ? file.type : existing?.fileType) ||
                    "application/octet-stream",
                  submittedAt,
                  receiptId,
                },
              ],
            },
            0,
            user,
          );
          const storedRecord = normalized
            ? {
                ...fallbackRecord,
                ...normalized,
                student: {
                  ...fallbackRecord.student,
                  ...normalized.student,
                },
                submission: {
                  ...fallbackRecord.submission,
                  ...normalized.submission,
                },
              }
            : fallbackRecord;
          storedRecord.submission.delivery = "lotus";
          upsertRemoteSubmission(storedRecord);
          remoteSubmissionsState.error = "";
          remoteSubmissionsState.lastLoadedAt = new Date().toISOString();
          submissionsEndpointCheckedFor = submissionScopeKey(user);
          replacingSubmissionId = null;
          render(true);
          showToast(
            `Submission uploaded to Lotus Drive. Receipt ${
              storedRecord?.submission.receiptId ||
              receiptId
            }.`,
          );
        } catch (error) {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = existing
              ? "Submit New Version to Lotus Drive"
              : "Submit to Lotus Drive";
          }
          const message =
            error?.name === "AbortError"
              ? "The upload timed out. Your work was not submitted."
              : error?.message ||
                "The file could not be uploaded. Your work was not submitted.";
          setFormAlert(event.target, message);
          showToast(message, {
            tone: "error",
            persistent: true,
          });
        }
        return;
      }
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
        delivery: "device",
        status: "draft",
        history,
      };
      replacingSubmissionId = null;
      saveState();
      render(true);
      showToast(
        fileStorageWarning
          ? `Draft saved on this device. Receipt ${receiptId}. File metadata was saved, but the browser could not retain the file for download.`
          : `Draft saved on this device. Receipt ${receiptId}.`,
        { tone: fileStorageWarning ? "error" : "success" },
      );
    }
  });

  document.addEventListener("input", (event) => {
    const gradingForm = event.target.closest("#grading-form");
    if (gradingForm) {
      setGradingAlert(gradingForm);
      const statusMessage = gradingForm.querySelector(".grading-status");
      if (statusMessage) {
        statusMessage.className = "grading-status is-draft";
        statusMessage.textContent =
          "Unsaved grading changes. Save a draft or publish when ready.";
      }
    }
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

  document.addEventListener("change", (event) => {
    if (event.target.id !== "submission-file") return;
    const form = event.target.closest("form");
    const preview = form?.querySelector("#submission-file-preview");
    const file = event.target.files?.[0];
    setFormAlert(form);
    if (!preview) return;
    if (!file) {
      preview.hidden = true;
      return;
    }
    preview.hidden = false;
    preview.classList.toggle("is-error", file.size > MAX_SUBMISSION_BYTES);
    const name = preview.querySelector("[data-file-name]");
    const meta = preview.querySelector("[data-file-meta]");
    if (name) name.textContent = file.name;
    if (meta) {
      meta.textContent = `${formatFileSize(file.size)} · ${file.type || "File"}`;
    }
    if (file.size > MAX_SUBMISSION_BYTES) {
      setFormAlert(
        form,
        `${file.name} is ${formatFileSize(file.size)}. Choose a file no larger than 25 MB.`,
      );
    }
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
      setDrawerOpen(false, { restoreFocus: false });
      if (wasOpen) focusMain();
    }

    const target = event.target.closest("[data-action], [data-route]");
    if (!target) return;

    if (target.dataset.route) {
      navigate(target.dataset.route);
      return;
    }

    const action = target.dataset.action;
    if (action === "dismiss-toast") {
      window.clearTimeout(toastTimer);
      target.closest(".toast")?.remove();
    } else if (action === "toast-action") {
      if (target.dataset.toastAction === "undo-enrollment" && lastEnrollmentChange) {
        const currentCourseIds = [...enrolledCourseIdsFor()];
        state.enrolledCourseIds = [...lastEnrollmentChange.enrolledCourseIds];
        try {
          await persistRemoteEnrollments(state.enrolledCourseIds);
        } catch (error) {
          state.enrolledCourseIds = currentCourseIds;
          showToast(error?.message || "The course plan could not be restored.", {
            tone: "error",
          });
          return;
        }
        saveState();
        lastEnrollmentChange = null;
        render(false, true);
        showToast("Your previous course plan has been restored.", {
          tone: "success",
        });
      }
    } else if (action === "focus-grading") {
      const form = document.querySelector("#grading-form");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => form?.elements.score?.focus());
    } else if (action === "set-teacher-status") {
      const status = ["awaiting", "revision", "graded", "unmapped", "all"].includes(
        target.dataset.status,
      )
        ? target.dataset.status
        : "awaiting";
      teacherSubmissionFilters.status = status;
      const route = routeParts();
      if (route[1] === "submissions" && route[3]) {
        window.location.hash = route[2]
          ? `#/teacher/submissions/${route[2]}`
          : "#/teacher/submissions";
      } else {
        render(false, true);
        document
          .querySelector(
            `[data-action="set-teacher-status"][data-status="${status}"]`,
          )
          ?.focus();
      }
    } else if (action === "clear-teacher-filters") {
      teacherSubmissionFilters = {
        course: "all",
        status: "awaiting",
        query: "",
      };
      if (window.location.hash === "#/teacher/submissions") {
        render(false, true);
        document
          .querySelector('#teacher-submission-filter-form input[name="query"]')
          ?.focus();
      } else {
        window.location.hash = "#/teacher/submissions";
      }
    } else if (action === "refresh-submissions") {
      if (!submissionsEndpointUrl()) {
        showToast("Lotus Drive submission sync is not connected yet.", {
          tone: "error",
        });
      } else {
        void refreshRemoteSubmissions();
      }
    } else if (action === "refresh-teacher-progress") {
      const course = findCourse(target.dataset.course);
      const endpoint = course
        ? teacherCourseEndpoint(course, "progress")
        : "";
      if (!course || !endpoint) {
        showToast("The official progress service is not connected.", {
          tone: "error",
        });
        return;
      }
      const key = teacherProgressRequestKey(course);
      target.disabled = true;
      target.textContent = "Refreshing...";
      invalidateTeacherProgress(course);
      ensureTeacherPlatformData(course);
      await platformRequests.get(key);
      const error = platformRuntime.errors[key];
      showToast(
        error
          ? `Official progress could not be refreshed. ${error}`
          : "Official student progress was refreshed.",
        { tone: error ? "error" : "success" },
      );
    } else if (action === "save-grade-draft") {
      const form = target.closest("#grading-form");
      const studentKey = form?.dataset.student || "";
      const assignmentId = form?.dataset.assignment || "";
      const record = teacherSubmissionRecords().find(
        (item) =>
          item.assignment.id === assignmentId &&
          studentRecordKey(item.student) === studentKey,
      );
      if (!form || !record) {
        showToast("This submission is no longer available.", {
          tone: "error",
        });
        return;
      }
      setGradingAlert(form);
      const scoreText = String(form.elements.score?.value || "").trim();
      const score = Number(scoreText);
      const feedback = String(form.elements.feedback?.value || "").trim();
      const draft = saveGradingDraft(record, { score: scoreText, feedback });
      const statusMessage = form.querySelector(".grading-status");
      if (statusMessage && draft) {
        statusMessage.className = "grading-status is-draft";
        statusMessage.textContent = `Draft saved on this device at ${formatDate(draft.savedAt, true)} · Not published to the student.`;
      }
      const { endpoint, submissionId } = gradingRequestTarget(
        record,
        form.dataset.submission || "",
      );
      if (!submissionsEndpointUrl() || !endpoint) {
        showToast("Grading draft saved on this device.", {
          tone: "success",
        });
        return;
      }
      if (
        !/^\d{1,3}$/.test(scoreText) ||
        !Number.isInteger(score) ||
        score < 0 ||
        score > 100
      ) {
        const message =
          "Device draft saved. Enter a whole-number score from 0 to 100 before syncing it to the school record.";
        setGradingAlert(form, message);
        showToast(message, { tone: "error" });
        return;
      }
      if ([...feedback].length > 10000) {
        const message =
          "Device draft saved. Teacher feedback must be 10,000 characters or fewer before central sync.";
        setGradingAlert(form, message);
        showToast(message, { tone: "error" });
        return;
      }
      const originalLabel = target.textContent;
      target.disabled = true;
      target.textContent = "Saving...";
      try {
        const payload = await requestSubmissionEndpoint(endpoint, {
          method: "PUT",
          headers: {
            "Idempotency-Key": requestIdFor("grade-draft"),
            "If-Match": record.submission.gradeEtag || '"grade-v0"',
          },
          body: JSON.stringify({
            submissionId,
            score,
            feedback,
            publish: false,
          }),
        });
        applyRemoteSubmissionGrade(record, payload, {
          score,
          feedback,
          publish: false,
          fallbackSubmissionId: submissionId,
        });
        clearGradingDraft(record);
        render(false, true);
        showToast(
          "Grading draft saved to the school record. It is not visible to the student.",
          { tone: "success" },
        );
      } catch (error) {
        target.disabled = false;
        target.textContent = originalLabel;
        const detail =
          error?.name === "AbortError"
            ? "The grading request timed out."
            : error?.message || "The central draft could not be saved.";
        const message = `Central save failed. Your device draft is still safe. ${detail}`;
        setGradingAlert(form, message);
        showToast(message, { tone: "error", persistent: true });
      }
    } else if (action === "clear-submission-file") {
      const form = target.closest("form");
      const input = form?.querySelector("#submission-file");
      if (input) input.value = "";
      const preview = form?.querySelector("#submission-file-preview");
      if (preview) preview.hidden = true;
      setFormAlert(form);
      input?.focus();
    } else if (action === "google-workspace-signin") {
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
    } else if (action === "toggle-course-materials") {
      const course = findCourse(target.dataset.course);
      const context = target.dataset.context === "teacher" ? "teacher" : "student";
      if (!course || (context === "teacher" && !isTeacher())) return;
      const disclosureKey = `${context}:${course.id}`;
      if (expandedCourseMaterials.has(disclosureKey)) {
        expandedCourseMaterials.delete(disclosureKey);
      } else {
        expandedCourseMaterials.add(disclosureKey);
      }
      render(false, true);
      window.requestAnimationFrame(() =>
        document
          .querySelector(
            `[data-action="toggle-course-materials"][data-course="${course.id}"][data-context="${context}"]`,
          )
          ?.focus(),
      );
    } else if (action === "refresh-course-materials") {
      await refreshDriveMaterials();
    } else if (action === "sync-drive-materials") {
      await syncDriveMaterials();
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
      setDrawerOpen(true);
    } else if (action === "close-menu") {
      setDrawerOpen(false);
    } else if (action === "logout") {
      const facultySession = isTeacher();
      target.disabled = true;
      if (configuredAuthUrl(AUTH_CONFIG.workspaceLogoutEndpoint)) {
        sessionStorage.setItem(WORKSPACE_LOGOUT_SUPPRESS_KEY, "1");
        const signedOut = await closeWorkspaceSession();
        if (!signedOut) {
          sessionStorage.removeItem(WORKSPACE_LOGOUT_SUPPRESS_KEY);
          target.disabled = false;
          showToast(
            "Secure sign-out could not be confirmed. Check your connection and try again.",
            { tone: "error", persistent: true },
          );
          return;
        }
      }
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(CSRF_TOKEN_KEY);
      remoteSessionValidated = true;
      state = initialStateForUser(null);
      remoteSubmissionsState = {
        records: [],
        error: "",
        lastLoadedAt: "",
      };
      submissionsEndpointCheckedFor = "";
      resetPlatformRuntime();
      resetDriveMaterialsForSession();
      signInNotice = "";
      signInPrefill = "";
      window.location.hash = facultySession
        ? "#/signin/faculty"
        : "#/signin/student";
      loginView({ portal: facultySession ? "faculty" : "student" });
    } else if (action === "add-course-pair") {
      const course = findCourse(target.dataset.course);
      if (!course || !SELECTABLE_COURSE_IDS.includes(course.id)) return;
      const prerequisiteIds = (course.prerequisiteCourseIds || []).filter((id) =>
        SELECTABLE_COURSE_IDS.includes(id),
      );
      const previousCourseIds = [...enrolledCourseIdsFor()];
      const addedIds = [...prerequisiteIds, course.id].filter(
        (id) => !previousCourseIds.includes(id),
      );
      state.enrolledCourseIds = [
        ...new Set([...previousCourseIds, ...prerequisiteIds, course.id]),
      ];
      state.guideChecks = state.guideChecks || {};
      [...prerequisiteIds, course.id].forEach((id) => {
        state.guideChecks[id] = state.guideChecks[id] || [];
      });
      try {
        await persistRemoteEnrollments(state.enrolledCourseIds);
      } catch (error) {
        state.enrolledCourseIds = previousCourseIds;
        showToast(error?.message || "These courses could not be added.", {
          tone: "error",
        });
        return;
      }
      lastEnrollmentChange = {
        enrolledCourseIds: previousCourseIds,
        courseId: course.id,
      };
      saveState();
      render(false, true);
      document
        .querySelector(
          `[data-action="toggle-enrollment"][data-course="${course.id}"], .syllabus-action-card .button`,
        )
        ?.focus();
      showToast(
        `${addedIds.map((id) => findCourse(id)?.code || id).join(" and ")} added to your learning plan.`,
        {
          tone: "success",
          actionLabel: "Undo",
          action: "undo-enrollment",
        },
      );
    } else if (action === "toggle-enrollment") {
      const course = findCourse(target.dataset.course);
      if (!course || !SELECTABLE_COURSE_IDS.includes(course.id)) return;
      const selected = isCourseEnrolled(course.id);
      const previousCourseIds = [...enrolledCourseIdsFor()];
      if (selected) {
        const dependent = studentCourses().find((candidate) =>
          (candidate.prerequisiteCourseIds || []).includes(course.id),
        );
        if (dependent) {
          showToast(
            `${course.code} cannot be removed while ${dependent.code} is selected.`,
            { tone: "error", persistent: true },
          );
          return;
        }
        if (courseHasAcademicRecord(course)) {
          showToast(
            "Contact Guidance to withdraw from a course with recorded academic work.",
            { tone: "error", persistent: true },
          );
          return;
        }
        state.enrolledCourseIds = enrolledCourseIdsFor().filter(
          (id) => id !== course.id,
        );
      } else {
        const requirement = enrollmentRequirement(course);
        if (!requirement.met) {
          showToast(requirement.message, {
            tone: "error",
            persistent: true,
          });
          return;
        }
        state.enrolledCourseIds = [
          ...new Set([...enrolledCourseIdsFor(), course.id]),
        ];
        state.guideChecks = state.guideChecks || {};
        state.guideChecks[course.id] = state.guideChecks[course.id] || [];
      }
      try {
        await persistRemoteEnrollments(state.enrolledCourseIds);
      } catch (error) {
        state.enrolledCourseIds = previousCourseIds;
        showToast(error?.message || "Your course selection could not be saved.", {
          tone: "error",
        });
        return;
      }
      lastEnrollmentChange = {
        enrolledCourseIds: previousCourseIds,
        courseId: course.id,
      };
      saveState();
      render(false, true);
      document
        .querySelector(
          `[data-action="toggle-enrollment"][data-course="${course.id}"], .syllabus-action-card .button`,
        )
        ?.focus();
      showToast(
        selected
          ? `${course.code} removed from your plan.`
          : `${course.code} added to your courses.`,
        {
          tone: "success",
          actionLabel: "Undo",
          action: "undo-enrollment",
        },
      );
    } else if (action === "set-module-complete") {
      const course = findCourse(target.dataset.course);
      const module = course
        ? findPlatformModule(course, target.dataset.module)
        : null;
      const moduleId = String(target.dataset.moduleId || "").trim();
      const activityId = String(target.dataset.activityId || "").trim();
      const endpoint = platformEndpoint(
        PLATFORM_API_CONFIG.moduleProgressEndpoint,
        encodeURIComponent(moduleId),
      );
      if (!course || !module || !moduleId || !endpoint) {
        showToast("Official module progress is not connected.", {
          tone: "error",
        });
        return;
      }
      const currentStatus = studentModuleProgress(course, module)?.status;
      const nextStatus =
        currentStatus === "completed" ? "in_progress" : "completed";
      const activityEndpoint = platformEndpoint(
        PLATFORM_API_CONFIG.activityProgressEndpoint,
        encodeURIComponent(activityId),
      );
      if (nextStatus === "completed" && (!activityId || !activityEndpoint)) {
        showToast(
          "The required module activity is not connected, so official completion cannot be recorded.",
          { tone: "error", persistent: true },
        );
        return;
      }
      target.disabled = true;
      try {
        if (nextStatus === "completed") {
          await requestPlatformJson(activityEndpoint, {
            method: "PUT",
            body: JSON.stringify({
              status: "completed",
              evidence: { source: "student_module_completion" },
            }),
          });
        }
        await requestPlatformJson(endpoint, {
          method: "PUT",
          body: JSON.stringify({ status: nextStatus }),
        });
        platformRequests.delete(`student-progress:${course.code}`);
        delete platformRuntime.studentProgress[course.code];
        ensureStudentPlatformData(course);
        showToast(
          nextStatus === "completed"
            ? "Module completion was saved to your official record."
            : "The module was returned to in progress.",
          { tone: "success" },
        );
      } catch (error) {
        target.disabled = false;
        showToast(error?.message || "Module progress could not be saved.", {
          tone: "error",
          persistent: true,
        });
      }
    } else if (action === "toggle-lesson") {
      const id = target.dataset.id;
      if (state.completed.includes(id)) {
        state.completed = state.completed.filter((item) => item !== id);
      } else {
        state.completed.push(id);
      }
      saveState();
      render(false, true);
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
      render(false, true);
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
      render(false, true);
      document.querySelector(`[data-filter="${assignmentFilter}"]`)?.focus();
    } else if (action === "replace-submission") {
      replacingSubmissionId = target.dataset.id;
      render(false, true);
      document.querySelector("#submission-note")?.focus();
    } else if (action === "cancel-replacement") {
      replacingSubmissionId = null;
      render(false, true);
      document.querySelector('[data-action="replace-submission"]')?.focus();
    } else if (action === "mark-feedback-read") {
      if (!state.feedbackRead.includes(target.dataset.id)) {
        state.feedbackRead.push(target.dataset.id);
      }
      saveState();
      render(false, true);
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

  drawerMedia.addEventListener("change", (event) => {
    if (!event.matches) setDrawerOpen(false, { restoreFocus: false });
  });
  window.addEventListener("hashchange", () => render(true));
  render();
  restoreWorkspaceSession().then((restored) => {
    if (restored) render(true);
  });
})();
