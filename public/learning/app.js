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
  const ACCESS_EMAIL = "student@lakeforestacademy.ca";
  const ACCESS_PASSWORD = "LakeForest2026!";
  const TEACHER_EMAIL = "james.whitmore@lakeforestacademy.ca";
  const TEACHER_PASSWORD = "LakeForestFaculty2026!";
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
            "Evaluate source credibility and place sou…30324 tokens truncated… : teacherSubmissionsView();
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

