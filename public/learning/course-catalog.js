(() => {
  "use strict";

  const INSTRUCTOR = "James Whitmore";
  const INSTRUCTOR_EMAIL = "james.whitmore@lakeforestacademy.ca";

  const createCourse = ({
    id,
    code,
    title,
    subject,
    gradeType,
    prerequisite,
    prerequisiteCourseIds = [],
    concurrentPrerequisite = false,
    image,
    description,
    overview,
    evaluation,
    units,
  }) => ({
    id,
    code,
    title,
    subject,
    gradeType,
    instructor: INSTRUCTOR,
    instructorEmail: INSTRUCTOR_EMAIL,
    schedule: "Flexible online schedule",
    mode: "Teacher-guided online",
    weeklyHours: "8–12 hours",
    credit: "1.0 OSSD credit",
    plannedHours: 110,
    prerequisite,
    prerequisiteCourseIds,
    concurrentPrerequisite,
    responseTime: "Within one school day",
    evaluation,
    image,
    description,
    overview,
    syllabus: {
      gradeType,
      credit: "1.0 credit",
      plannedHours: 110,
      prerequisite,
      description: overview,
      units,
      evaluation,
    },
    lessons: units.map((unit, index) => ({
      id: `${id}-u${index + 1}-overview`,
      unit: `Unit ${index + 1}`,
      unitTitle: unit.title,
      title: `${unit.title}: Unit Orientation`,
      duration: "45 min",
      summary: `Review the learning sequence, evidence requirements and key questions for ${unit.title}.`,
      objectives: [
        `Identify the central concepts and expectations in ${unit.title}.`,
        "Plan the readings, practice and assessed evidence for this unit.",
        "Use teacher feedback and verification checkpoints before final submission.",
      ],
      content: [
        `This orientation introduces the ${unit.hours}-hour learning plan for ${unit.title}. Use the approved readings, worked examples, practice and evidence tables in the secure course index.`,
        "Keep drafts, calculations, source records and feedback as evidence of your learning process. Your teacher may schedule a conference or parallel task to verify understanding and authorship.",
      ],
    })),
  });

  const courses = [
    createCourse({
      id: "sch4u",
      code: "SCH4U",
      title: "Chemistry",
      subject: "Science",
      gradeType: "Grade 12 · University Preparation",
      prerequisite: "Chemistry, Grade 11, University Preparation",
      image: "../images/science-lab.jpg",
      description:
        "Study organic chemistry, matter, energy, reaction rates, equilibrium and electrochemistry through scientific inquiry.",
      overview:
        "This course deepens students’ understanding of chemistry through organic chemistry, the structure and properties of matter, energy changes and rates of reaction, equilibrium in chemical systems, and electrochemistry. Students strengthen investigation, problem-solving and scientific communication skills while evaluating chemistry in everyday life and the environment.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 25 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Organic Chemistry", hours: 22 },
        { title: "Structure and Properties of Matter", hours: 22 },
        { title: "Energy Changes and Rates of Reaction", hours: 22 },
        { title: "Chemical Systems and Equilibrium", hours: 22 },
        { title: "Electrochemistry", hours: 22 },
      ],
    }),
    createCourse({
      id: "ics4u",
      code: "ICS4U",
      title: "Computer Science",
      subject: "Computer Science",
      gradeType: "Grade 12 · University Preparation",
      prerequisite:
        "Introduction to Computer Science, Grade 11, University Preparation",
      image: "../images/technology-class.jpg",
      description:
        "Design modular software, analyse algorithms and manage a complete development project using industry practices.",
      overview:
        "Students further develop knowledge and skills in computer science through modular program design, algorithm analysis and a student-managed software project. The course also examines ethical and environmental issues, emerging technologies, computer science research and related careers.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 15 },
        { label: "Culminating Task", weight: 10 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Programming Concepts and Skills", hours: 22 },
        { title: "Software Development", hours: 22 },
        { title: "Designing Modular Programs", hours: 22 },
        { title: "Topics in Computer Science", hours: 22 },
        {
          title: "Culminating Computer Science Inquiry and Communication",
          hours: 22,
        },
      ],
    }),
    createCourse({
      id: "sph4u",
      code: "SPH4U",
      title: "Physics",
      subject: "Science",
      gradeType: "Grade 12 · University Preparation",
      prerequisite: "Physics, Grade 11, University Preparation",
      image: "../images/science-lab.jpg",
      description:
        "Investigate motion, energy, fields, waves, quantum mechanics and relativity through quantitative inquiry.",
      overview:
        "This course deepens students’ understanding of physics concepts and theories. Students investigate motion, energy and momentum, gravitational, electric and magnetic fields, electromagnetic radiation, the wave nature of light, quantum mechanics and special relativity while developing quantitative investigation skills.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 25 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Dynamics", hours: 22 },
        { title: "Energy and Momentum", hours: 22 },
        {
          title: "Gravitational, Electric, and Magnetic Fields",
          hours: 22,
        },
        { title: "The Wave Nature of Light", hours: 22 },
        {
          title:
            "Revolutions in Modern Physics: Quantum Mechanics and Special Relativity",
          hours: 22,
        },
      ],
    }),
    createCourse({
      id: "mhf4u",
      code: "MHF4U",
      title: "Advanced Functions",
      subject: "Mathematics",
      gradeType: "Grade 12 · University Preparation",
      prerequisite:
        "Functions, Grade 11, University Preparation, or Mathematics for College Technology, Grade 12, College Preparation",
      image: "../images/academics-seminar.jpg",
      description:
        "Investigate exponential, logarithmic, trigonometric, polynomial and rational functions and their applications.",
      overview:
        "This course extends students’ experience with functions. Students investigate polynomial, rational, logarithmic and trigonometric functions, combine functions, broaden their understanding of rates of change and refine the mathematical processes needed for university study.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 25 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Exponential and Logarithmic Functions", hours: 22 },
        { title: "Trigonometric Functions", hours: 22 },
        { title: "Polynomial and Rational Functions", hours: 22 },
        { title: "Characteristics of Functions", hours: 22 },
        {
          title: "Culminating Advanced Functions Inquiry and Communication",
          hours: 22,
        },
      ],
    }),
    createCourse({
      id: "mcv4u",
      code: "MCV4U",
      title: "Calculus and Vectors",
      subject: "Mathematics",
      gradeType: "Grade 12 · University Preparation",
      prerequisite:
        "Advanced Functions, Grade 12, University Preparation, taken prior to or concurrently",
      prerequisiteCourseIds: ["mhf4u"],
      concurrentPrerequisite: true,
      image: "../images/technology-class.jpg",
      description:
        "Develop derivatives, optimization and vector methods for modelling in science, engineering and business.",
      overview:
        "This course builds on students’ experience with functions and rates of change. Students study derivatives and their applications, vectors in two- and three-dimensional space, and equations of lines and planes while applying mathematical processes to real-world models.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 25 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Rate of Change", hours: 22 },
        { title: "Derivatives and Their Applications", hours: 22 },
        { title: "Geometry and Algebra of Vectors", hours: 22 },
        { title: "Integrated Calculus and Vectors Applications", hours: 22 },
        {
          title: "Culminating Calculus and Vectors Inquiry and Communication",
          hours: 22,
        },
      ],
    }),
    createCourse({
      id: "bbb4m",
      code: "BBB4M",
      title: "International Business Fundamentals",
      subject: "Business Studies",
      gradeType: "Grade 12 · University/College Preparation",
      prerequisite: "None",
      image: "../images/student-community.jpg",
      description:
        "Examine trade, globalization, international marketing, distribution, ethics and market-entry strategy.",
      overview:
        "This course provides an overview of international business and trade in the global economy. Students examine factors that influence success in international markets and develop strategies related to marketing, distribution, ethics and managing international business effectively.",
      evaluation: [
        { label: "Coursework Evidence", weight: 65 },
        { label: "Mandatory Written Examination", weight: 15 },
        { label: "Culminating Task", weight: 10 },
        { label: "Attendance and Participation", weight: 10 },
      ],
      units: [
        { title: "Business, Trade, and the Economy", hours: 20 },
        { title: "The Global Business Environment", hours: 22 },
        { title: "Factors Influencing International Success", hours: 22 },
        { title: "International Marketing and Distribution", hours: 22 },
        { title: "Ethics, Operations, and Market-Entry Plan", hours: 24 },
      ],
    }),
  ];

  window.LFA_COURSE_CATALOG = Object.freeze(courses);
  window.LFA_SELECTABLE_COURSE_IDS = Object.freeze(
    courses.map((course) => course.id),
  );
})();
