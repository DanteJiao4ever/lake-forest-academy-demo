(() => {
  "use strict";

  const TERM = "2026–2027";
  const START_DATE = "2026-09-01";
  const COMPLETION_DATE = "2027-06-30";
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
    drive,
  }) => ({
    id,
    code,
    title,
    subject,
    gradeType,
    instructor: INSTRUCTOR,
    instructorEmail: INSTRUCTOR_EMAIL,
    term: TERM,
    schedule: "Flexible online schedule",
    mode: "Teacher-guided online",
    startDate: START_DATE,
    completionDate: COMPLETION_DATE,
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
      drive,
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
        `This orientation introduces the ${unit.hours}-hour learning plan for ${unit.title}. Open the linked Lotus coursebook for the full readings, worked examples, practice and evidence tables.`,
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/1h8rfMCSbWHMmOT0lnUKlE7eHjCpGQ5F0",
        coursebookUrl:
          "https://drive.google.com/file/d/1ibKA6xO9ykj3PD2ZF0dDX8K0-rBsKnvf/view",
        assessmentUrl:
          "https://drive.google.com/file/d/1Hbshpt7D1lpkxGqd81vsW_1SY3vRe0Es/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1DvH37GLYl1oyydGx1BtUCsuDAHbIQOu3/view",
      },
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/1H-ELcyymQdeMci2Ck0WR322ihS1fdm0k",
        coursebookUrl:
          "https://drive.google.com/file/d/1ruGTXKidVcKVXgMT0St_210UdrTKjdET/view",
        assessmentUrl:
          "https://drive.google.com/file/d/19nRcyg8gVk0WaNga4zaZSpPU52WRv0XJ/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1Z30J66OOjUIA3c9frMDqYcGT817jRzpL/view",
      },
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/1RvUeLK1TLU96OpfEC4Q2hT6XzEjdC8e4",
        coursebookUrl:
          "https://drive.google.com/file/d/1Tj-CqBTEoLd1plNTYoke5Oi_eQGFPZee/view",
        assessmentUrl:
          "https://drive.google.com/file/d/1VV9pplD6VgTKd3vozmpVjeoOIBlkpf8M/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1VmOITXMoZplZA_hvoHDJAzyPcDVPAaHB/view",
      },
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/1AZ2HaaWeJH8vVH73oGnls_vuyggMZmLC",
        coursebookUrl:
          "https://drive.google.com/file/d/1dJqooy1JPitLWz8idZw7plac3QIlLcgU/view",
        assessmentUrl:
          "https://drive.google.com/file/d/1icAn97-9TujjoO1tZHFrHhDiarg21_4s/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1HvMDUkPgpyUGuztLGpU3GnxHHZtFTFk_/view",
      },
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/1jhAefDynRG18ovK4GeFI7bMJ4KfjvLO6",
        coursebookUrl:
          "https://drive.google.com/file/d/1Ogb_U_Qo7yHcMNq6kJpsN1ydnwVgkVHp/view",
        assessmentUrl:
          "https://drive.google.com/file/d/1AONXddrn74Ajhq9xPNhZ6DOs05n71OGG/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1RMaBh_U3Cx2OW28JyakgvU737-tZul_v/view",
      },
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
      drive: {
        studentMaterialsFolderUrl:
          "https://drive.google.com/drive/folders/18K2Me1laOV9jFJqIp543MNMZvuDphIRy",
        coursebookUrl:
          "https://drive.google.com/file/d/1DNXO-AMqAJE35sNg-YsvbugqX141Gc1d/view",
        assessmentUrl:
          "https://drive.google.com/file/d/15i2K0F8WnJ--FtsMBWcqqH6MlsPSMXtz/view",
        curriculumMapUrl:
          "https://drive.google.com/file/d/1jRt1pQIjY8KFCSRravoG3LI__Bg5KA-w/view",
      },
    }),
  ];

  window.LFA_COURSE_CATALOG = Object.freeze(courses);
  window.LFA_SELECTABLE_COURSE_IDS = Object.freeze(
    courses.map((course) => course.id),
  );
})();
