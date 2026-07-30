// Deterministic Lotus Academy Grade 12 platform catalog.
(function loadLfaPlatformCatalog(global) {
  "use strict";
  const catalog = {
  "contract": "lfa.course-import.v1",
  "schemaVersion": 1,
  "catalogId": "lotus-grade12-six-course-v1",
  "courseOrder": [
    "SCH4U",
    "ICS4U",
    "SPH4U",
    "MHF4U",
    "MCV4U",
    "BBB4M"
  ],
  "courses": [
    {
      "code": "SCH4U",
      "title": "Chemistry",
      "department": "Science",
      "grade": "12",
      "courseType": "University Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "Chemistry, Grade 11, University Preparation",
      "description": "This course enables students to deepen their understanding of chemistry through the study of organic chemistry, the structure and properties of matter, energy changes and rates of reaction, equilibrium in chemical systems, and electrochemistry. Students will further develop their problem-solving and investigation skills as they investigate chemical processes, and will refine their ability to communicate scientific information. Emphasis will be placed on the importance of chemistry in everyday life and on evaluating the impact of chemical technology on the environment.",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 11 and 12: Science (Revised)",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with a retrieval check after each reading cluster.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 25,
        "culminatingTaskPercent": 0,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "SCH4U-M11-C01",
          "componentKey": "m11-written-exam",
          "position": 1,
          "title": "SCH4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "timeMinutes": 150,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "SCH4U-M00",
          "number": 0,
          "title": "Start Here: Learning Chemistry in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 25% mandatory written examination, 10% attendance and participation.",
            "Establish safe, ethical, and traceable practices for data, calculations, citations, and virtual investigations."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, scientific-source rules, and safety boundaries.",
            "Preview the five unit assessments and the SCH4U Mandatory Written Examination before beginning content."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, submit a sample equation-and-source record, and practise finding rubric feedback.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering Grade 11 chemistry, algebra, units, significant figures, and interpretation of tables/graphs; students receive a targeted review list.",
          "assessment": {
            "key": "SCH4U-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Safety, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Safety/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "SCH4U-M01",
          "number": 1,
          "title": "Organic Structures, Names, and Property Patterns",
          "unitNumber": 1,
          "unitTitle": "Organic Chemistry",
          "lessonIds": [
            "SCH4U-U1-L1",
            "SCH4U-U1-L2"
          ],
          "lessonTitles": [
            "Carbon Skeletons, Functional Groups, and Systematic Names",
            "Intermolecular Forces and Organic Physical Properties"
          ],
          "lessons": [
            {
              "key": "SCH4U-U1-L1",
              "id": "SCH4U-U1-L1",
              "title": "Carbon Skeletons, Functional Groups, and Systematic Names",
              "order": 1
            },
            {
              "key": "SCH4U-U1-L2",
              "id": "SCH4U-U1-L2",
              "title": "Intermolecular Forces and Organic Physical Properties",
              "order": 2
            }
          ],
          "learningFocus": [
            "Represent and name organic structures using a consistent decision process.",
            "Use functional groups, molecular geometry, and intermolecular forces to predict properties."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U1-L1: Carbon Skeletons, Functional Groups, and Systematic Names.",
            "Complete the nomenclature retrieval set and correct every locant, parent-chain, and suffix error.",
            "Student Coursebook Lesson SCH4U-U1-L2: Intermolecular Forces and Organic Physical Properties.",
            "Complete the structure-property comparison before opening the extension resources."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M01-RESOURCE-01",
              "title": "Brief Guide to the Nomenclature of Organic Chemistry",
              "provider": "International Union of Pure and Applied Chemistry (IUPAC)",
              "url": "https://iupac.org/wp-content/uploads/2021/06/Organic-Brief-Guide-brochure_v1.1_June2021.pdf",
              "assignedUse": "Convert the naming sequence into a one-page decision tree and test it on teacher-selected structures.",
              "order": 1
            },
            {
              "key": "SCH4U-M01-RESOURCE-02",
              "title": "Molecule Polarity",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/molecule-polarity",
              "assignedUse": "Predict bond and molecular dipoles before revealing the simulation arrows, then connect polarity to a property ranking.",
              "order": 2
            },
            {
              "key": "SCH4U-M01-RESOURCE-03",
              "title": "Organic Chemistry",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/organic-chemistry/pages/1-why-this-chapter",
              "assignedUse": "Read only the matching functional-group section and complete one worked-example reconstruction.",
              "order": 3
            }
          ],
          "guidedPractice": "Build a functional-group identification deck, complete bidirectional name-to-structure practice, and defend a boiling-point or solubility ranking with geometry and intermolecular-force evidence.",
          "lowStakesCheck": "Ten-item nomenclature and structure-property check with one correction attempt; add each error to the course correction log.",
          "assessment": {
            "key": "SCH4U-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Organic Structure and Property Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Guided examples",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after both lesson checkpoints and a correction entry are submitted. Teacher feedback targets nomenclature logic and evidence quality, not only the final answer.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SCH4U-M02",
          "number": 2,
          "title": "Organic Reactions, Polymers, and Safer Product Decisions",
          "unitNumber": 1,
          "unitTitle": "Organic Chemistry",
          "lessonIds": [
            "SCH4U-U1-L3",
            "SCH4U-U1-L4"
          ],
          "lessonTitles": [
            "Organic Reaction Families and Evidence-Based Pathways",
            "Polymers, Petrochemicals, and Life-Cycle Decisions"
          ],
          "lessons": [
            {
              "key": "SCH4U-U1-L3",
              "id": "SCH4U-U1-L3",
              "title": "Organic Reaction Families and Evidence-Based Pathways",
              "order": 1
            },
            {
              "key": "SCH4U-U1-L4",
              "id": "SCH4U-U1-L4",
              "title": "Polymers, Petrochemicals, and Life-Cycle Decisions",
              "order": 2
            }
          ],
          "learningFocus": [
            "Classify organic transformations and distinguish an overall reaction from a supported pathway.",
            "Evaluate performance, hazard, exposure, and life-cycle evidence in a product decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U1-L3: Organic Reaction Families and Evidence-Based Pathways.",
            "Complete a reaction-family map and balance the assigned transformation.",
            "Student Coursebook Lesson SCH4U-U1-L4: Polymers, Petrochemicals, and Life-Cycle Decisions.",
            "Assessment Reading Library: Evidence File 1: Solvent Reformulation for a Coating Process.",
            "Annotate the assessment brief and rubric before drafting the product comparison."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M02-RESOURCE-01",
              "title": "5.12 Organic Chemistry I",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/5-12-organic-chemistry-i-spring-2005/",
              "assignedUse": "Study one matching reaction-family handout and attempt two bounded problems before checking solutions.",
              "order": 1
            },
            {
              "key": "SCH4U-M02-RESOURCE-02",
              "title": "Green Chemistry Teaching Modules",
              "provider": "American Chemical Society Green Chemistry Institute",
              "url": "https://www.acs.org/green-chemistry-sustainability/education/teaching-modules.html",
              "assignedUse": "Apply three green-chemistry principles to the coating-process evidence file.",
              "order": 2
            },
            {
              "key": "SCH4U-M02-RESOURCE-03",
              "title": "NIST Chemistry WebBook, SRD 69",
              "provider": "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
              "url": "https://webbook.nist.gov/chemistry/index.html",
              "assignedUse": "Verify one relevant physical or thermochemical property and preserve the source citation.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete a reaction-pathway evidence table and a four-criterion safer-solvent decision matrix, then submit a one-paragraph conditional recommendation for feedback.",
          "lowStakesCheck": "Assessment-readiness quiz on reaction families, polymer structure, hazard versus exposure, and life-cycle trade-offs, followed by a rubric self-check.",
          "assessment": {
            "key": "SCH4U-M02-ASSESSMENT",
            "assignmentKey": "SCH4U-M02-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Safer Organic Product Reformulation Dossier",
            "weightPercent": 10,
            "evidenceFile": "Evidence File 1: Solvent Reformulation for a Coating Process",
            "sequence": [
              "Evidence-file annotation",
              "Claim and calculation checkpoint",
              "Draft comparison",
              "Teacher feedback",
              "Final dossier and oral defence",
              "Post-submission reflection"
            ],
            "taskType": "Evidence-based design report and oral defence",
            "processCheckpoints": [
              "Approve the product category, research question, and safety boundary",
              "Submit a structure, nomenclature, and source-credibility check",
              "Conference on the comparison matrix, reaction reasoning, and provisional recommendation",
              "Revise after peer review and complete an individual oral defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SCH4U-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Safer Organic Product Reformulation Dossier",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve the product category, research question, and safety boundary",
                  "Submit a structure, nomenclature, and source-credibility check",
                  "Conference on the comparison matrix, reaction reasoning, and provisional recommendation",
                  "Revise after peer review and complete an individual oral defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SCH4U-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher gives rubric-linked feedback at the claim/calculation checkpoint. Unlock Module 3 after final submission and a brief reflection identifying one evidence limitation.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SCH4U-M03",
          "number": 3,
          "title": "Atomic Evidence and Bond Models",
          "unitNumber": 2,
          "unitTitle": "Structure and Properties of Matter",
          "lessonIds": [
            "SCH4U-U2-L1",
            "SCH4U-U2-L2"
          ],
          "lessonTitles": [
            "Quantum Model, Electron Configurations, and Periodic Evidence",
            "Lewis Structures, Formal Charge, Resonance, and Bond Models"
          ],
          "lessons": [
            {
              "key": "SCH4U-U2-L1",
              "id": "SCH4U-U2-L1",
              "title": "Quantum Model, Electron Configurations, and Periodic Evidence",
              "order": 1
            },
            {
              "key": "SCH4U-U2-L2",
              "id": "SCH4U-U2-L2",
              "title": "Lewis Structures, Formal Charge, Resonance, and Bond Models",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use electron configurations and periodic evidence to explain trends.",
            "Construct and evaluate Lewis, formal-charge, resonance, and bonding representations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U2-L1: Quantum Model, Electron Configurations, and Periodic Evidence.",
            "Complete the electron-configuration and periodic-trend retrieval set.",
            "Student Coursebook Lesson SCH4U-U2-L2: Lewis Structures, Formal Charge, Resonance, and Bond Models.",
            "Complete a representation-choice comparison before using the simulation/database resources."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M03-RESOURCE-01",
              "title": "Chemistry 2e",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/chemistry-2e/pages/1-introduction",
              "assignedUse": "Read the matching atomic-structure and bonding sections, then reconstruct one worked example without looking.",
              "order": 1
            },
            {
              "key": "SCH4U-M03-RESOURCE-02",
              "title": "Periodic Table of Elements",
              "provider": "PubChem, U.S. National Library of Medicine",
              "url": "https://pubchem.ncbi.nlm.nih.gov/ptable/",
              "assignedUse": "Record and graph one period and one group, then explain two exceptions using shielding and electron configuration.",
              "order": 2
            },
            {
              "key": "SCH4U-M03-RESOURCE-03",
              "title": "Atomic Interactions",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/atomic-interactions",
              "assignedUse": "Predict and test equilibrium distance and relative well depth for three atom pairs.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete an electron-configuration error sort, select the most defensible Lewis/resonance representation for assigned species, and explain where each model is useful or limited.",
          "lowStakesCheck": "Mixed short-answer check on configurations, trends, bond type, formal charge, and resonance; require an annotated correction for every missed item.",
          "assessment": {
            "key": "SCH4U-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Atomic and Bonding Model Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Data/diagram practice",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after students submit one complete model comparison and correct the readiness check. Teacher flags persistent charge-counting or periodic-trend misconceptions.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SCH4U-M04",
          "number": 4,
          "title": "Molecular Geometry and Material Selection",
          "unitNumber": 2,
          "unitTitle": "Structure and Properties of Matter",
          "lessonIds": [
            "SCH4U-U2-L3",
            "SCH4U-U2-L4"
          ],
          "lessonTitles": [
            "Molecular Geometry, Hybridization, Polarity, and Spectral Evidence",
            "Solids, Materials, and Technology Decisions"
          ],
          "lessons": [
            {
              "key": "SCH4U-U2-L3",
              "id": "SCH4U-U2-L3",
              "title": "Molecular Geometry, Hybridization, Polarity, and Spectral Evidence",
              "order": 1
            },
            {
              "key": "SCH4U-U2-L4",
              "id": "SCH4U-U2-L4",
              "title": "Solids, Materials, and Technology Decisions",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect geometry, hybridization, polarity, and spectra to molecular evidence.",
            "Infer bonding/solid structure from a bounded set of material properties and justify a technology choice."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U2-L3: Molecular Geometry, Hybridization, Polarity, and Spectral Evidence.",
            "Complete a predict-build-explain geometry table.",
            "Student Coursebook Lesson SCH4U-U2-L4: Solids, Materials, and Technology Decisions.",
            "Assessment Reading Library: Evidence File 2: Selecting a Material for a High-Temperature Sensor Housing.",
            "Annotate the coded-material evidence and rejection criteria before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M04-RESOURCE-01",
              "title": "Molecule Shapes",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/molecule-shapes",
              "assignedUse": "Predict geometry and bond angles for twelve species before testing; explain lone-pair effects.",
              "order": 1
            },
            {
              "key": "SCH4U-M04-RESOURCE-02",
              "title": "PubChem Structures: Search, Draw, Compare, and Download",
              "provider": "PubChem, U.S. National Library of Medicine",
              "url": "https://pubchem.ncbi.nlm.nih.gov/docs/structures",
              "assignedUse": "Compare three related structures and explain why structural similarity is not identity.",
              "order": 2
            },
            {
              "key": "SCH4U-M04-RESOURCE-03",
              "title": "Organic Chemistry",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/organic-chemistry/pages/1-why-this-chapter",
              "assignedUse": "Use one matching section to connect hybridization and geometry to observed properties.",
              "order": 3
            }
          ],
          "guidedPractice": "Classify four anonymous materials from partial property sets, identify the next most useful test, and write a claim-evidence-reasoning rejection of one plausible alternative.",
          "lowStakesCheck": "Geometry/polarity/solid-type readiness quiz plus a one-page evidence sufficiency checklist.",
          "assessment": {
            "key": "SCH4U-M04-ASSESSMENT",
            "assignmentKey": "SCH4U-M04-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Unknown Material Structure-Property Identification",
            "weightPercent": 12,
            "evidenceFile": "Evidence File 2: Selecting a Material for a High-Temperature Sensor Housing",
            "sequence": [
              "Evidence-file annotation",
              "Geometry and bonding checkpoint",
              "Candidate ranking",
              "Teacher feedback",
              "Final technical recommendation",
              "Post-submission reflection"
            ],
            "taskType": "Data investigation and technical recommendation",
            "processCheckpoints": [
              "Approve the coded-material evidence plan and variable definitions",
              "Submit atomic, bonding, and geometry model checks",
              "Conference on property classification and alternative explanations",
              "Revise the recommendation after an individual evidence defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SCH4U-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Unknown Material Structure-Property Identification",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve the coded-material evidence plan and variable definitions",
                  "Submit atomic, bonding, and geometry model checks",
                  "Conference on property classification and alternative explanations",
                  "Revise the recommendation after an individual evidence defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SCH4U-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks the chain from data to model to recommendation before final submission. Unlock Module 5 after the assessment and an uncertainty statement are submitted.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SCH4U-M05",
          "number": 5,
          "title": "Enthalpy, Calorimetry, and Energy Pathways",
          "unitNumber": 3,
          "unitTitle": "Energy Changes and Rates of Reaction",
          "lessonIds": [
            "SCH4U-U3-L1",
            "SCH4U-U3-L2"
          ],
          "lessonTitles": [
            "Systems, Enthalpy, Calorimetry, and Measurement Quality",
            "Hess's Law, Formation Enthalpies, and Energy Profiles"
          ],
          "lessons": [
            {
              "key": "SCH4U-U3-L1",
              "id": "SCH4U-U3-L1",
              "title": "Systems, Enthalpy, Calorimetry, and Measurement Quality",
              "order": 1
            },
            {
              "key": "SCH4U-U3-L2",
              "id": "SCH4U-U3-L2",
              "title": "Hess's Law, Formation Enthalpies, and Energy Profiles",
              "order": 2
            }
          ],
          "learningFocus": [
            "Define systems consistently and calculate energy changes from calorimetry evidence.",
            "Use Hess's law, formation enthalpies, and energy profiles while tracking signs and assumptions."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U3-L1: Systems, Enthalpy, Calorimetry, and Measurement Quality.",
            "Complete the sign-convention and calorimetry worked-example set.",
            "Student Coursebook Lesson SCH4U-U3-L2: Hess's Law, Formation Enthalpies, and Energy Profiles.",
            "Complete one pathway calculation in two independent ways and reconcile any mismatch."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M05-RESOURCE-01",
              "title": "Chemistry: Physical Principles",
              "provider": "University of Toronto via Chemistry LibreTexts",
              "url": "https://chem.libretexts.org/Courses/University_of_Toronto/Chemistry%3A_Physical_Principles",
              "assignedUse": "Read the matching thermochemistry section, reproduce one example, and explain the microscopic meaning of the equation.",
              "order": 1
            },
            {
              "key": "SCH4U-M05-RESOURCE-02",
              "title": "NIST Chemistry WebBook, SRD 69",
              "provider": "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
              "url": "https://webbook.nist.gov/chemistry/index.html",
              "assignedUse": "Locate one cited thermochemical value and record its conditions, units, and literature source.",
              "order": 2
            },
            {
              "key": "SCH4U-M05-RESOURCE-03",
              "title": "Atomic Interactions",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/atomic-interactions",
              "assignedUse": "Sketch potential-energy curves and connect well depth qualitatively to bond energy.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a flawed calorimetry solution, complete a Hess-cycle card sort, and compare pathway-independent enthalpy with an activation-energy profile.",
          "lowStakesCheck": "Short calculation set requiring equations, units, sign convention, assumptions, and one uncertainty comment; students resubmit corrected work.",
          "assessment": {
            "key": "SCH4U-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Thermochemistry Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Worked examples",
              "Source-data task",
              "Calculation check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after a fully annotated Hess/calorimetry solution is accepted. Teacher feedback prioritizes system boundaries, signs, and evidence quality.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SCH4U-M06",
          "number": 6,
          "title": "Rates, Mechanisms, and Process Optimization",
          "unitNumber": 3,
          "unitTitle": "Energy Changes and Rates of Reaction",
          "lessonIds": [
            "SCH4U-U3-L3",
            "SCH4U-U3-L4"
          ],
          "lessonTitles": [
            "Reaction Rates, Rate Laws, and Data Interpretation",
            "Mechanisms, Catalysis, and Responsible Process Design"
          ],
          "lessons": [
            {
              "key": "SCH4U-U3-L3",
              "id": "SCH4U-U3-L3",
              "title": "Reaction Rates, Rate Laws, and Data Interpretation",
              "order": 1
            },
            {
              "key": "SCH4U-U3-L4",
              "id": "SCH4U-U3-L4",
              "title": "Mechanisms, Catalysis, and Responsible Process Design",
              "order": 2
            }
          ],
          "learningFocus": [
            "Infer rate relationships from controlled data and distinguish rate, rate constant, and reaction order.",
            "Evaluate mechanisms, catalysts, operating conditions, safety, energy, and emissions in a process decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U3-L3: Reaction Rates, Rate Laws, and Data Interpretation.",
            "Complete the initial-rate and temperature-data practice.",
            "Student Coursebook Lesson SCH4U-U3-L4: Mechanisms, Catalysis, and Responsible Process Design.",
            "Assessment Reading Library: Evidence File 3: Choosing Conditions for a Catalysed Production Route.",
            "Annotate the evidence file for comparable basis, constraints, and uncertainty before optimization."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M06-RESOURCE-01",
              "title": "5.60 Thermodynamics & Kinetics",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/5-60-thermodynamics-kinetics-spring-2008/",
              "assignedUse": "Study one rate-law lesson, attempt a bounded exam-style question, and distinguish kinetic from thermodynamic claims.",
              "order": 1
            },
            {
              "key": "SCH4U-M06-RESOURCE-02",
              "title": "NIST Chemical Kinetics Database, SRD 17",
              "provider": "National Institute of Standards and Technology",
              "url": "https://kinetics.nist.gov/kinetics/index.jsp",
              "assignedUse": "Compare two published rate expressions within their stated temperature ranges and note source limitations.",
              "order": 2
            },
            {
              "key": "SCH4U-M06-RESOURCE-03",
              "title": "What triggers a chemical reaction?",
              "provider": "TED-Ed (lesson by Kareem Jarrah)",
              "url": "https://ed.ted.com/lessons/what-triggers-a-chemical-reaction-kareem-jarrah",
              "assignedUse": "Build a claim-evidence-reasoning table and explain why favourable does not necessarily mean fast.",
              "order": 3
            }
          ],
          "guidedPractice": "Determine rate-law evidence from controlled trials, reject an unsupported mechanism, and use a normalized decision matrix to compare two process routes.",
          "lowStakesCheck": "Readiness check on orders, units, mechanisms, catalyst claims, normalization, and sensitivity; students complete a rubric-based preflight.",
          "assessment": {
            "key": "SCH4U-M06-ASSESSMENT",
            "assignmentKey": "SCH4U-M06-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Chemical Process Energy and Rate Optimization",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 3: Choosing Conditions for a Catalysed Production Route",
            "sequence": [
              "Evidence-file annotation",
              "Rate and enthalpy calculation checkpoint",
              "Route comparison",
              "Teacher feedback",
              "Final quantitative case study",
              "Post-submission reflection"
            ],
            "taskType": "Quantitative case study and process recommendation",
            "processCheckpoints": [
              "Approve the functional output, boundary, and variables",
              "Check thermochemical equations, signs, units, and data provenance",
              "Conference on kinetic interpretation and catalyst claims",
              "Complete sensitivity analysis and individual recommendation defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SCH4U-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "Chemical Process Energy and Rate Optimization",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve the functional output, boundary, and variables",
                  "Check thermochemical equations, signs, units, and data provenance",
                  "Conference on kinetic interpretation and catalyst claims",
                  "Complete sensitivity analysis and individual recommendation defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SCH4U-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks data comparability and one sensitivity calculation before final submission. Unlock Module 7 after assessment submission and documented revision decisions.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SCH4U-M07",
          "number": 7,
          "title": "Dynamic Equilibrium and Quantitative System Models",
          "unitNumber": 4,
          "unitTitle": "Chemical Systems and Equilibrium",
          "lessonIds": [
            "SCH4U-U4-L1",
            "SCH4U-U4-L2"
          ],
          "lessonTitles": [
            "Dynamic Equilibrium, K, and Reaction Quotient",
            "ICE Tables, Le Châtelier Reasoning, and Coupled Systems"
          ],
          "lessons": [
            {
              "key": "SCH4U-U4-L1",
              "id": "SCH4U-U4-L1",
              "title": "Dynamic Equilibrium, K, and Reaction Quotient",
              "order": 1
            },
            {
              "key": "SCH4U-U4-L2",
              "id": "SCH4U-U4-L2",
              "title": "ICE Tables, Le Châtelier Reasoning, and Coupled Systems",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use particle and symbolic models to distinguish equilibrium rate, position, K, and Q.",
            "Solve bounded equilibrium systems with ICE tables and evaluate qualitative shift claims."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U4-L1: Dynamic Equilibrium, K, and Reaction Quotient.",
            "Complete a Q-versus-K prediction set before viewing solutions.",
            "Student Coursebook Lesson SCH4U-U4-L2: ICE Tables, Le Châtelier Reasoning, and Coupled Systems.",
            "Complete one ICE-table solution with a verification substitution."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M07-RESOURCE-01",
              "title": "5.60 Thermodynamics & Kinetics",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/5-60-thermodynamics-kinetics-spring-2008/",
              "assignedUse": "Use one equilibrium lesson to separate equilibrium-position and rate claims.",
              "order": 1
            },
            {
              "key": "SCH4U-M07-RESOURCE-02",
              "title": "Reversible Reactions",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/reversible-reactions",
              "assignedUse": "Change one condition at a time and distinguish the rate response from the final composition.",
              "order": 2
            },
            {
              "key": "SCH4U-M07-RESOURCE-03",
              "title": "Chemistry 2e",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/chemistry-2e/pages/1-introduction",
              "assignedUse": "Read the matching equilibrium section and reconstruct one worked ICE-table example.",
              "order": 3
            }
          ],
          "guidedPractice": "Sort equilibrium claims into rate, position, K, or Q; complete two ICE tables; and diagnose a Le Châtelier shortcut that conflicts with the equilibrium expression.",
          "lowStakesCheck": "Mixed conceptual/calculation check with a required verification step and a particle-level explanation.",
          "assessment": {
            "key": "SCH4U-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Equilibrium Model Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Prediction task",
              "Simulation task",
              "Calculation check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after the verified ICE-table solution and correction log are complete. Teacher feedback identifies when a verbal shift claim is not supported by K/Q mathematics.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SCH4U-M08",
          "number": 8,
          "title": "Acid-Base, Solubility, and Water-System Decisions",
          "unitNumber": 4,
          "unitTitle": "Chemical Systems and Equilibrium",
          "lessonIds": [
            "SCH4U-U4-L3",
            "SCH4U-U4-L4"
          ],
          "lessonTitles": [
            "Acids, Bases, Buffers, and Titration Evidence",
            "Solubility Equilibria, Water Systems, and Treatment Trade-offs"
          ],
          "lessons": [
            {
              "key": "SCH4U-U4-L3",
              "id": "SCH4U-U4-L3",
              "title": "Acids, Bases, Buffers, and Titration Evidence",
              "order": 1
            },
            {
              "key": "SCH4U-U4-L4",
              "id": "SCH4U-U4-L4",
              "title": "Solubility Equilibria, Water Systems, and Treatment Trade-offs",
              "order": 2
            }
          ],
          "learningFocus": [
            "Interpret acid-base, buffer, titration, and solubility evidence using appropriate equilibrium models.",
            "Develop a conditional water-treatment recommendation that acknowledges coupled systems and uncertainty."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U4-L3: Acids, Bases, Buffers, and Titration Evidence.",
            "Complete the acid-base and buffer calculation checkpoint.",
            "Student Coursebook Lesson SCH4U-U4-L4: Solubility Equilibria, Water Systems, and Treatment Trade-offs.",
            "Assessment Reading Library: Evidence File 4: Carbonate Balance and Distribution-System Decision.",
            "Map gas dissolution, pH, buffering, Ksp, scaling, and corrosion before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M08-RESOURCE-01",
              "title": "Acid-Base Solutions",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/acid-base-solutions",
              "assignedUse": "Run a controlled comparison and explain why concentration and acid/base strength are different variables.",
              "order": 1
            },
            {
              "key": "SCH4U-M08-RESOURCE-02",
              "title": "Concentration",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/concentration",
              "assignedUse": "Predict and test concentration changes through dilution, evaporation, and saturation.",
              "order": 2
            },
            {
              "key": "SCH4U-M08-RESOURCE-03",
              "title": "ChemCollective Virtual Labs",
              "provider": "ChemCollective, Carnegie Mellon University / NSF-supported project",
              "url": "https://chemcollective.org/activities/type_page/1",
              "assignedUse": "Complete one teacher-selected titration or Ksp virtual investigation with a data table and uncertainty note.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete a coupled carbonate-system map, solve one buffer and one Ksp case, then write a public-facing recommendation that separates findings, assumptions, and monitoring triggers.",
          "lowStakesCheck": "Assessment-readiness check on pH, Ka/Kb, buffers, Qsp/Ksp, conditional language, and evidence traceability.",
          "assessment": {
            "key": "SCH4U-M08-ASSESSMENT",
            "assignmentKey": "SCH4U-M08-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Equilibrium-Based Water Quality Decision",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 4: Carbonate Balance and Distribution-System Decision",
            "sequence": [
              "Evidence-file annotation",
              "Equilibrium calculation checkpoint",
              "System map and recommendation outline",
              "Teacher feedback",
              "Final evidence report and stakeholder briefing",
              "Post-submission reflection"
            ],
            "taskType": "Quantitative evidence report and stakeholder briefing",
            "processCheckpoints": [
              "Approve system boundary, chemical species, and decision question",
              "Submit equilibrium expressions and calculation setup for feedback",
              "Conference on assumptions, sensitivity, and guideline interpretation",
              "Revise the stakeholder briefing after an individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SCH4U-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "Equilibrium-Based Water Quality Decision",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve system boundary, chemical species, and decision question",
                  "Submit equilibrium expressions and calculation setup for feedback",
                  "Conference on assumptions, sensitivity, and guideline interpretation",
                  "Revise the stakeholder briefing after an individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SCH4U-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one coupled calculation and the distinction between evidence and assumption. Unlock Module 9 after final submission and a documented monitoring/revision trigger.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SCH4U-M09",
          "number": 9,
          "title": "Redox Accounting and Galvanic Cells",
          "unitNumber": 5,
          "unitTitle": "Electrochemistry",
          "lessonIds": [
            "SCH4U-U5-L1",
            "SCH4U-U5-L2"
          ],
          "lessonTitles": [
            "Oxidation Numbers and Balancing Redox Reactions",
            "Galvanic Cells, Standard Potentials, and Thermodynamic Meaning"
          ],
          "lessons": [
            {
              "key": "SCH4U-U5-L1",
              "id": "SCH4U-U5-L1",
              "title": "Oxidation Numbers and Balancing Redox Reactions",
              "order": 1
            },
            {
              "key": "SCH4U-U5-L2",
              "id": "SCH4U-U5-L2",
              "title": "Galvanic Cells, Standard Potentials, and Thermodynamic Meaning",
              "order": 2
            }
          ],
          "learningFocus": [
            "Assign oxidation states and balance redox reactions in appropriate media.",
            "Represent galvanic cells and use standard potentials to interpret spontaneity and energy conversion."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U5-L1: Oxidation Numbers and Balancing Redox Reactions.",
            "Complete the oxidation-number and half-reaction balancing set.",
            "Student Coursebook Lesson SCH4U-U5-L2: Galvanic Cells, Standard Potentials, and Thermodynamic Meaning.",
            "Complete a labelled cell diagram and verify the calculated cell potential."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M09-RESOURCE-01",
              "title": "Chemistry: Physical Principles",
              "provider": "University of Toronto via Chemistry LibreTexts",
              "url": "https://chem.libretexts.org/Courses/University_of_Toronto/Chemistry%3A_Physical_Principles",
              "assignedUse": "Read the matching electrochemistry section, solve one example, and connect electron transfer to the equation used.",
              "order": 1
            },
            {
              "key": "SCH4U-M09-RESOURCE-02",
              "title": "How batteries work",
              "provider": "TED-Ed (lesson by Adam Jacobson)",
              "url": "https://ed.ted.com/lessons/why-batteries-die-adam-jacobson",
              "assignedUse": "Annotate anode, cathode, electron path, ion movement, and energy conversion before proposing a plausible cell.",
              "order": 2
            },
            {
              "key": "SCH4U-M09-RESOURCE-03",
              "title": "How Do Batteries Work?",
              "provider": "OpenLearn, The Open University",
              "url": "https://www.open.edu/openlearn/course/view.php?id=8229",
              "assignedUse": "Create a labelled chemical-change-to-current sequence diagram and test voltage predictions using the provided model.",
              "order": 3
            }
          ],
          "guidedPractice": "Balance redox reactions, build cell-notation/diagram translations, calculate E°cell, and explain why a positive standard potential does not by itself determine real-world battery suitability.",
          "lowStakesCheck": "Redox and galvanic-cell check requiring direction labels, units, sign logic, and one thermodynamic interpretation.",
          "assessment": {
            "key": "SCH4U-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Redox and Cell Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Balancing practice",
              "Cell-model task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after one correct cell representation and an annotated correction are submitted. Teacher feedback targets anode/cathode conventions and sign reasoning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SCH4U-M10",
          "number": 10,
          "title": "Electrolysis, Batteries, Corrosion, and Lifecycle Control",
          "unitNumber": 5,
          "unitTitle": "Electrochemistry",
          "lessonIds": [
            "SCH4U-U5-L3",
            "SCH4U-U5-L4"
          ],
          "lessonTitles": [
            "Electrolysis, Faraday's Law, and Industrial Accounting",
            "Batteries, Fuel Cells, Corrosion, and Lifecycle Control"
          ],
          "lessons": [
            {
              "key": "SCH4U-U5-L3",
              "id": "SCH4U-U5-L3",
              "title": "Electrolysis, Faraday's Law, and Industrial Accounting",
              "order": 1
            },
            {
              "key": "SCH4U-U5-L4",
              "id": "SCH4U-U5-L4",
              "title": "Batteries, Fuel Cells, Corrosion, and Lifecycle Control",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use Faraday's law and efficiency evidence to analyse electrolysis and storage systems.",
            "Compare performance, safety, corrosion control, service life, and end-of-life trade-offs."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SCH4U-U5-L3: Electrolysis, Faraday's Law, and Industrial Accounting.",
            "Complete the charge-moles-mass calculation pathway and an efficiency check.",
            "Student Coursebook Lesson SCH4U-U5-L4: Batteries, Fuel Cells, Corrosion, and Lifecycle Control.",
            "Assessment Reading Library: Evidence File 5: Remote Clinic Energy Storage and Corrosion Plan.",
            "Annotate operating constraints, safety thresholds, sensitivity variables, and end-of-life requirements."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M10-RESOURCE-01",
              "title": "DOE Explains...Batteries",
              "provider": "U.S. Department of Energy, Office of Science",
              "url": "https://www.energy.gov/science/doe-explainsbatteries",
              "assignedUse": "Create paired charge/discharge diagrams and propose one testable materials or chemistry research question.",
              "order": 1
            },
            {
              "key": "SCH4U-M10-RESOURCE-02",
              "title": "ChemCollective Virtual Labs",
              "provider": "ChemCollective, Carnegie Mellon University / NSF-supported project",
              "url": "https://chemcollective.org/activities/type_page/1",
              "assignedUse": "Complete one teacher-selected redox virtual investigation with recorded data, a calculation, and a limitation note.",
              "order": 2
            },
            {
              "key": "SCH4U-M10-RESOURCE-03",
              "title": "IUPAC Compendium of Chemical Terminology (Gold Book)",
              "provider": "International Union of Pure and Applied Chemistry",
              "url": "https://goldbook.iupac.org/",
              "assignedUse": "Verify and paraphrase the electrochemical terms used in the recommendation, preserving citations.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete an electrolysis accounting case, compare two storage/corrosion options on a normalized basis, and conduct one sensitivity test before writing the recommendation.",
          "lowStakesCheck": "Assessment-readiness check on Faraday's law, energy/capacity units, corrosion mechanisms, safety thresholds, lifecycle evidence, and conditional recommendations.",
          "assessment": {
            "key": "SCH4U-M10-ASSESSMENT",
            "assignmentKey": "SCH4U-M10-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Electrochemical Technology and Corrosion-Control Proposal",
            "weightPercent": 15,
            "evidenceFile": "Evidence File 5: Remote Clinic Energy Storage and Corrosion Plan",
            "sequence": [
              "Evidence-file annotation",
              "Cell and capacity calculation checkpoint",
              "Option matrix and sensitivity test",
              "Teacher feedback",
              "Final engineering case and policy memo",
              "Post-submission reflection"
            ],
            "taskType": "Quantitative engineering case and policy memo",
            "processCheckpoints": [
              "Approve the application, electrochemical system, and safety boundary",
              "Submit balanced equations, cell notation, and potential check",
              "Conference on quantitative performance and lifecycle evidence",
              "Revise the policy memo after sensitivity analysis and oral defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SCH4U-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Electrochemical Technology and Corrosion-Control Proposal",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve the application, electrochemical system, and safety boundary",
                  "Submit balanced equations, cell notation, and potential check",
                  "Conference on quantitative performance and lifecycle evidence",
                  "Revise the policy memo after sensitivity analysis and oral defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SCH4U-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies the electrochemical accounting and one safety/lifecycle constraint before final submission. Unlock Module 11 after the assessment and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 11.5,
          "workloadLabel": "11.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SCH4U-M11",
          "number": 11,
          "title": "Cumulative Synthesis and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Integrate structure-property, energy-rate, equilibrium, and electrochemical reasoning across unfamiliar contexts.",
            "Demonstrate independent, time-bounded problem solving and evidence communication."
          ],
          "readingSteps": [
            "Review the five unit concept maps and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved problem set that requires model selection before calculation.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "SCH4U-M11-RESOURCE-01",
              "title": "Chemistry 2e",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/chemistry-2e/pages/1-introduction",
              "assignedUse": "Use only the sections identified by the correction log, then complete selected end-of-section questions without notes.",
              "order": 1
            },
            {
              "key": "SCH4U-M11-RESOURCE-02",
              "title": "5.111SC Principles of Chemical Science",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/",
              "assignedUse": "Use selected concept questions and problems for retrieval practice; attempt them before viewing explanations or solutions.",
              "order": 2
            },
            {
              "key": "SCH4U-M11-RESOURCE-03",
              "title": "IUPAC Compendium of Chemical Terminology (Gold Book)",
              "provider": "International Union of Pure and Applied Chemistry",
              "url": "https://goldbook.iupac.org/",
              "assignedUse": "Resolve terminology gaps found in the five-unit glossary; this resource is for preparation, not for use during the examination unless expressly permitted.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: identify the governing model, solve, check units/limits, explain evidence, and revise. Finish with a timed mock and a teacher conference based on the error log.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "SCH4U-M11-ASSESSMENT",
            "assignmentKey": "SCH4U-M11-ASSIGNMENT",
            "assignmentKeys": [
              "SCH4U-M11-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "SCH4U Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": 150,
            "components": [
              {
                "key": "SCH4U-M11-C01",
                "componentKey": "m11-written-exam",
                "position": 1,
                "title": "SCH4U Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 25,
                "timeMinutes": 150,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "SCH4U-M11-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes content, model-selection, calculation, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 2.5,
          "workloadLabel": "2.5 h supervised written examination",
          "teacherPresence": "Readiness confirmation, approved accommodations, identity check, supervision, and post-exam closure.",
          "evidenceToRetain": "Supervised examination script and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "SCH4U-M02-COURSEWORK",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M02",
          "moduleActivityKey": "SCH4U-M02-ASSESSMENT",
          "assignmentKey": "SCH4U-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Safer Organic Product Reformulation Dossier",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Evidence File 1: Solvent Reformulation for a Coating Process"
        },
        {
          "key": "SCH4U-M04-COURSEWORK",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M04",
          "moduleActivityKey": "SCH4U-M04-ASSESSMENT",
          "assignmentKey": "SCH4U-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Unknown Material Structure-Property Identification",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Evidence File 2: Selecting a Material for a High-Temperature Sensor Housing"
        },
        {
          "key": "SCH4U-M06-COURSEWORK",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M06",
          "moduleActivityKey": "SCH4U-M06-ASSESSMENT",
          "assignmentKey": "SCH4U-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "Chemical Process Energy and Rate Optimization",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Evidence File 3: Choosing Conditions for a Catalysed Production Route"
        },
        {
          "key": "SCH4U-M08-COURSEWORK",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M08",
          "moduleActivityKey": "SCH4U-M08-ASSESSMENT",
          "assignmentKey": "SCH4U-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "Equilibrium-Based Water Quality Decision",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Evidence File 4: Carbonate Balance and Distribution-System Decision"
        },
        {
          "key": "SCH4U-M10-COURSEWORK",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M10",
          "moduleActivityKey": "SCH4U-M10-ASSESSMENT",
          "assignmentKey": "SCH4U-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Electrochemical Technology and Corrosion-Control Proposal",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Evidence File 5: Remote Clinic Energy Storage and Corrosion Plan"
        },
        {
          "key": "SCH4U-M11-WRITTEN-EXAM",
          "courseCode": "SCH4U",
          "moduleKey": "SCH4U-M11",
          "moduleActivityKey": "SCH4U-M11-ASSESSMENT",
          "assignmentKey": "SCH4U-M11-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "SCH4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "SCH4U-PARTICIPATION",
          "courseCode": "SCH4U",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 7,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    },
    {
      "code": "ICS4U",
      "title": "Computer Science",
      "department": "Computer Studies",
      "grade": "12",
      "courseType": "University Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "Introduction to Computer Science, Grade 11, University Preparation",
      "description": "This course enables students to further develop knowledge and skills in computer science. Students will use modular design principles to create complex and fully documented programs, according to industry standards. Student teams will manage a large software development project, from planning through to project review. Students will also analyse algorithms for effectiveness. They will investigate ethical issues in computing and further explore environmental issues, emerging technologies, areas of research in computer science, and careers in the field.",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 10 to 12: Computer Studies",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with a code trace, retrieval check, or design check after each reading cluster.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 15,
        "culminatingTaskPercent": 10,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "ICS4U-M11-C01",
          "componentKey": "m11-culminating",
          "position": 1,
          "title": "ICS4U Culminating Performance and Defence",
          "type": "Culminating performance and defence",
          "weightPercent": 10,
          "timeMinutes": 120,
          "processCheckpoints": [
            "Scope, evidence, and integrity conference",
            "Interim artefact and source-trail review",
            "Testing, analysis, or feasibility checkpoint",
            "Final submission and authenticated individual defence"
          ],
          "submissionMode": "project"
        },
        {
          "key": "ICS4U-M11-C02",
          "componentKey": "m11-written-exam",
          "position": 2,
          "title": "ICS4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 15,
          "timeMinutes": 90,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "ICS4U-M00",
          "number": 0,
          "title": "Start Here: Learning Computer Science in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 10% culminating performance and defence, 15% mandatory written examination, 10% attendance and participation.",
            "Establish safe, ethical, accessible, and traceable practices for local programming, fictional data, citations, version evidence, and technical support."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, source-and-licence rules, and the boundaries for local, authorized computing work.",
            "Preview the five unit assessments and the ICS4U Mandatory Written Examination before beginning content.",
            "Preview ICS4U Culminating Performance and Defence and its staged authenticated defence checkpoints."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, submit a harmless local code-and-source record using fictional data, and practise finding rubric and code-review feedback.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering Grade 11 programming, variables, selection, iteration, functions, basic collections, tracing, and test cases; students receive a targeted review list.",
          "assessment": {
            "key": "ICS4U-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Computing-Safety, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Safety/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "ICS4U-M01",
          "number": 1,
          "title": "Traceable State, Collections, and Iterative Reasoning",
          "unitNumber": 1,
          "unitTitle": "Programming Concepts and Skills",
          "lessonIds": [
            "ICS4U-U1-L1",
            "ICS4U-U1-L2"
          ],
          "lessonTitles": [
            "Data Types, Expressions, and Traceable State",
            "Collections, Iteration, and Accumulation Patterns"
          ],
          "lessons": [
            {
              "key": "ICS4U-U1-L1",
              "id": "ICS4U-U1-L1",
              "title": "Data Types, Expressions, and Traceable State",
              "order": 1
            },
            {
              "key": "ICS4U-U1-L2",
              "id": "ICS4U-U1-L2",
              "title": "Collections, Iteration, and Accumulation Patterns",
              "order": 2
            }
          ],
          "learningFocus": [
            "Choose data types and expressions that make program state and correctness conditions visible.",
            "Trace collection, iteration, and accumulation patterns across normal, boundary, and empty inputs."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U1-L1: Data Types, Expressions, and Traceable State.",
            "Complete the variable-state trace and identify one type or expression error before running code.",
            "Student Coursebook Lesson ICS4U-U1-L2: Collections, Iteration, and Accumulation Patterns.",
            "Complete the loop-invariant and empty-collection check before opening the external practice resources."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M01-RESOURCE-01",
              "title": "The Python Tutorial",
              "provider": "Python Software Foundation",
              "url": "https://docs.python.org/3/tutorial/",
              "assignedUse": "Read the matching language and collection sections, annotate three examples, and change one input to expose a boundary case.",
              "order": 1
            },
            {
              "key": "ICS4U-M01-RESOURCE-02",
              "title": "CS50's Introduction to Programming with Python (CS50P)",
              "provider": "Harvard University / CS50",
              "url": "https://cs50.harvard.edu/python/",
              "assignedUse": "Use selected introductory examples for retrieval practice, then write an original small accumulator with an explicit correctness condition.",
              "order": 2
            },
            {
              "key": "ICS4U-M01-RESOURCE-03",
              "title": "Python Tutor",
              "provider": "Philip Guo / Python Tutor",
              "url": "https://pythontutor.com/",
              "assignedUse": "Visualize an original iterative example, annotate five state changes, and reconcile the visualization with a hand trace.",
              "order": 3
            }
          ],
          "guidedPractice": "Trace three short programs, repair a type mismatch, and implement a collection summary that correctly handles empty, single-item, and repeated-value cases.",
          "lowStakesCheck": "Ten-item code-trace and collection-pattern check with one correction attempt; record each misconception and the test that exposes it.",
          "assessment": {
            "key": "ICS4U-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "State, Collection, and Iteration Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Hand traces",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after both lesson checkpoints and one corrected trace are submitted. Teacher feedback targets reasoning about state and invariants, not only final output.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "ICS4U-M02",
          "number": 2,
          "title": "Structured Records, Function Contracts, and Data Quality",
          "unitNumber": 1,
          "unitTitle": "Programming Concepts and Skills",
          "lessonIds": [
            "ICS4U-U1-L3",
            "ICS4U-U1-L4"
          ],
          "lessonTitles": [
            "Strings, Local Files, and Structured Records",
            "Function Contracts, Testing, and Debugging"
          ],
          "lessons": [
            {
              "key": "ICS4U-U1-L3",
              "id": "ICS4U-U1-L3",
              "title": "Strings, Local Files, and Structured Records",
              "order": 1
            },
            {
              "key": "ICS4U-U1-L4",
              "id": "ICS4U-U1-L4",
              "title": "Function Contracts, Testing, and Debugging",
              "order": 2
            }
          ],
          "learningFocus": [
            "Parse strings, local files, and structured records without losing the distinction between missing, malformed, and valid values.",
            "Design focused functions with explicit contracts and test evidence that makes defects reproducible."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U1-L3: Strings, Local Files, and Structured Records.",
            "Complete the fictional record-parsing table and preserve each original input before normalization.",
            "Student Coursebook Lesson ICS4U-U1-L4: Function Contracts, Testing, and Debugging.",
            "Assessment Reading Library: Evidence File 1: Fictional Community-Asset Data Quality Case.",
            "Annotate the assessment brief, function contracts, test expectations, and rubric before implementation."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M02-RESOURCE-01",
              "title": "Think Python, 3rd Edition",
              "provider": "Allen B. Downey / Green Tea Press",
              "url": "https://allendowney.github.io/ThinkPython/",
              "assignedUse": "Read the matching functions and dictionaries sections, refactor one solution, and document its preconditions, postconditions, and tests.",
              "order": 1
            },
            {
              "key": "ICS4U-M02-RESOURCE-02",
              "title": "Introduction to Computer Science and Programming in Python (6.0001)",
              "provider": "Massachusetts Institute of Technology OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
              "assignedUse": "Study a selected functions or testing segment, then apply the idea to an original local file-processing function rather than copying course solutions.",
              "order": 2
            },
            {
              "key": "ICS4U-M02-RESOURCE-03",
              "title": "SQLite in 5 Minutes or Less",
              "provider": "SQLite Project",
              "url": "https://www.sqlite.org/quickstart.html",
              "assignedUse": "Compare a small fictional table with the course CSV records and explain one benefit, one validation need, and one scope limitation.",
              "order": 3
            }
          ],
          "guidedPractice": "Build a data dictionary, separate parsing from validation and reporting, write normal/boundary/missing/malformed tests, and demonstrate one defect-and-repair cycle.",
          "lowStakesCheck": "Assessment-readiness check on file handling, record validation, contracts, helpful error messages, and regression tests, followed by a rubric self-check.",
          "assessment": {
            "key": "ICS4U-M02-ASSESSMENT",
            "assignmentKey": "ICS4U-M02-ASSIGNMENT",
            "assignmentKeys": [
              "ICS4U-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Local Data-Quality Utility",
            "weightPercent": 10,
            "evidenceFile": "Evidence File 1: Fictional Community-Asset Data Quality Case",
            "sequence": [
              "Evidence-file annotation",
              "Data dictionary and privacy screen",
              "Pseudocode and function-contract conference",
              "Mid-build test review",
              "Final utility, test dossier, and technical explanation",
              "Code walk-through and reflection"
            ],
            "taskType": "Individual programming artefact, test dossier, and technical explanation",
            "processCheckpoints": [
              "Approved problem statement, sample rows, and privacy screen",
              "Pseudocode and function-contract conference",
              "Mid-build test review with one demonstrated defect",
              "Final code walk-through and individual oral verification"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "ICS4U-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Local Data-Quality Utility",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approved problem statement, sample rows, and privacy screen",
                  "Pseudocode and function-contract conference",
                  "Mid-build test review with one demonstrated defect",
                  "Final code walk-through and individual oral verification"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "ICS4U-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher gives contract- and test-linked feedback before final submission. Unlock Module 3 after final submission and a reflection identifying one defect, revision, and remaining limitation.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "ICS4U-M03",
          "number": 3,
          "title": "Modular Boundaries, Interfaces, and Recursion",
          "unitNumber": 2,
          "unitTitle": "Software Development",
          "lessonIds": [
            "ICS4U-U2-L1",
            "ICS4U-U2-L2"
          ],
          "lessonTitles": [
            "Decomposition, Interfaces, Cohesion, and Coupling",
            "Recursion, Base Cases, and Stack Reasoning"
          ],
          "lessons": [
            {
              "key": "ICS4U-U2-L1",
              "id": "ICS4U-U2-L1",
              "title": "Decomposition, Interfaces, Cohesion, and Coupling",
              "order": 1
            },
            {
              "key": "ICS4U-U2-L2",
              "id": "ICS4U-U2-L2",
              "title": "Recursion, Base Cases, and Stack Reasoning",
              "order": 2
            }
          ],
          "learningFocus": [
            "Decompose a bounded problem into cohesive modules with explicit interfaces and manageable dependencies.",
            "Trace recursive calls, justify a terminating base case, and compare recursive and iterative alternatives."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U2-L1: Decomposition, Interfaces, Cohesion, and Coupling.",
            "Complete the module-responsibility and dependency map.",
            "Student Coursebook Lesson ICS4U-U2-L2: Recursion, Base Cases, and Stack Reasoning.",
            "Complete the call-stack trace and prove that the base case is reachable before running code."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M03-RESOURCE-01",
              "title": "Introduction to Computer Science and Programming in Python (6.0001)",
              "provider": "Massachusetts Institute of Technology OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
              "assignedUse": "Study selected recursion and decomposition material, then create an original trace and a safer iterative comparison.",
              "order": 1
            },
            {
              "key": "ICS4U-M03-RESOURCE-02",
              "title": "Python Tutor",
              "provider": "Philip Guo / Python Tutor",
              "url": "https://pythontutor.com/",
              "assignedUse": "Visualize an original recursive function and annotate the base case, recursive case, stack depth, and return path.",
              "order": 2
            },
            {
              "key": "ICS4U-M03-RESOURCE-03",
              "title": "How to Think Like a Computer Scientist: Interactive Edition",
              "provider": "Runestone Interactive Project at Luther College",
              "url": "https://runestone.academy/ns/books/published/thinkcspy/index.html",
              "assignedUse": "Predict three traces from a matching chapter, correct one misconception, and refactor one exercise into documented modules.",
              "order": 3
            }
          ],
          "guidedPractice": "Partition a fictional rule engine into modules, identify two coupling problems, trace one recursive structure, and compare it with a loop using correctness, clarity, and memory criteria.",
          "lowStakesCheck": "Interface-contract and recursion check requiring a responsibility table, stack trace, base-case explanation, and correction attempt.",
          "assessment": {
            "key": "ICS4U-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Modularity and Recursion Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Responsibility map",
              "Recursive trace",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after the module map and corrected recursion trace are accepted. Teacher flags unclear contracts, cyclic dependencies, and non-terminating reasoning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "ICS4U-M04",
          "number": 4,
          "title": "Objects, Invariants, Exceptions, and Refactoring",
          "unitNumber": 2,
          "unitTitle": "Software Development",
          "lessonIds": [
            "ICS4U-U2-L3",
            "ICS4U-U2-L4"
          ],
          "lessonTitles": [
            "Classes, Encapsulation, Composition, and Invariants",
            "Exceptions, Documentation, and Behaviour-Preserving Refactoring"
          ],
          "lessons": [
            {
              "key": "ICS4U-U2-L3",
              "id": "ICS4U-U2-L3",
              "title": "Classes, Encapsulation, Composition, and Invariants",
              "order": 1
            },
            {
              "key": "ICS4U-U2-L4",
              "id": "ICS4U-U2-L4",
              "title": "Exceptions, Documentation, and Behaviour-Preserving Refactoring",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use classes, encapsulation, composition, and invariants to prevent invalid program states.",
            "Design safe error behaviour and use tests and documentation to verify behaviour-preserving refactoring."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U2-L3: Classes, Encapsulation, Composition, and Invariants.",
            "Complete the object-state and invariant table.",
            "Student Coursebook Lesson ICS4U-U2-L4: Exceptions, Documentation, and Behaviour-Preserving Refactoring.",
            "Assessment Reading Library: Evidence File 2: Fictional Transit Fare Rule-Engine Architecture.",
            "Annotate the architecture, recursion choice, invariant, error-behaviour, and refactoring evidence before designing the assessment library."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M04-RESOURCE-01",
              "title": "Learn Java",
              "provider": "Oracle Java Platform / dev.java",
              "url": "https://dev.java/learn/",
              "assignedUse": "Read the classes, objects, exceptions, and collections material; compare one small model with the approved course language.",
              "order": 1
            },
            {
              "key": "ICS4U-M04-RESOURCE-02",
              "title": "Software Engineering at Google",
              "provider": "Google / Abseil, published with O'Reilly Media",
              "url": "https://abseil.io/resources/swe-book",
              "assignedUse": "Read selected testing and code-review material, then choose three proportionate practices for a small Grade 12 module library.",
              "order": 2
            },
            {
              "key": "ICS4U-M04-RESOURCE-03",
              "title": "Digital Accessibility Foundations",
              "provider": "World Wide Web Consortium Web Accessibility Initiative and UNESCO IITE",
              "url": "https://www.w3.org/WAI/courses/foundations-course/",
              "assignedUse": "Translate five accessibility checks into observable acceptance criteria for the text-based study planner.",
              "order": 3
            }
          ],
          "guidedPractice": "Model valid and invalid task states, write public interface contracts, test modules independently, and complete a before-and-after refactor while preserving regression evidence.",
          "lowStakesCheck": "Assessment-readiness quiz on composition, invariants, exception ownership, cohesion, coupling, independent tests, and accessible error states.",
          "assessment": {
            "key": "ICS4U-M04-ASSESSMENT",
            "assignmentKey": "ICS4U-M04-ASSIGNMENT",
            "assignmentKeys": [
              "ICS4U-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Accessible Study-Planner Module Library",
            "weightPercent": 12,
            "evidenceFile": "Evidence File 2: Fictional Transit Fare Rule-Engine Architecture",
            "sequence": [
              "Evidence-file annotation",
              "Module-boundary and invariant conference",
              "Interface and recursion checkpoint",
              "Independent-test demonstration",
              "Teacher feedback and refactoring",
              "Final module library, dossier, and design explanation"
            ],
            "taskType": "Modular local program, design dossier, and refactoring review",
            "processCheckpoints": [
              "Module boundary and data-invariant conference",
              "Interface-contract and recursion base-case check",
              "Independent-test demonstration before integration",
              "Refactoring review and individual explanation of one design trade-off"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "ICS4U-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Accessible Study-Planner Module Library",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Module boundary and data-invariant conference",
                  "Interface-contract and recursion base-case check",
                  "Independent-test demonstration before integration",
                  "Refactoring review and individual explanation of one design trade-off"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "ICS4U-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks whether modules can change and be tested independently before integration. Unlock Module 5 after final submission and an explanation of one design trade-off.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "ICS4U-M05",
          "number": 5,
          "title": "Correctness, Growth, and Search Strategies",
          "unitNumber": 3,
          "unitTitle": "Designing Modular Programs",
          "lessonIds": [
            "ICS4U-U3-L1",
            "ICS4U-U3-L2"
          ],
          "lessonTitles": [
            "Correctness, Input Size, and Asymptotic Growth",
            "Searching: Linear, Binary, and Indexed Lookup"
          ],
          "lessons": [
            {
              "key": "ICS4U-U3-L1",
              "id": "ICS4U-U3-L1",
              "title": "Correctness, Input Size, and Asymptotic Growth",
              "order": 1
            },
            {
              "key": "ICS4U-U3-L2",
              "id": "ICS4U-U3-L2",
              "title": "Searching: Linear, Binary, and Indexed Lookup",
              "order": 2
            }
          ],
          "learningFocus": [
            "Separate algorithm correctness from efficiency and relate input size to operation-count growth.",
            "Choose linear, binary, or indexed lookup only when its preconditions and workload justify it."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U3-L1: Correctness, Input Size, and Asymptotic Growth.",
            "Complete the operation-count table and state the correctness condition before comparing speed.",
            "Student Coursebook Lesson ICS4U-U3-L2: Searching: Linear, Binary, and Indexed Lookup.",
            "Trace each search strategy on found, absent, first, and last cases before using visual or textbook resources."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M05-RESOURCE-01",
              "title": "Algorithms",
              "provider": "Jeff Erickson / University of Illinois Urbana-Champaign",
              "url": "https://jeffe.cs.illinois.edu/teaching/algorithms/",
              "assignedUse": "Read a selected algorithms section, identify the invariant, and compare time and additional space for two input conditions.",
              "order": 1
            },
            {
              "key": "ICS4U-M05-RESOURCE-02",
              "title": "CS 61A: Structure and Interpretation of Computer Programs",
              "provider": "University of California, Berkeley, Department of Electrical Engineering and Computer Sciences",
              "url": "https://cs61a.org/",
              "assignedUse": "Read two relevant sections, then create an original search problem with tests and an explanation of the abstraction used.",
              "order": 2
            },
            {
              "key": "ICS4U-M05-RESOURCE-03",
              "title": "Computer Science Field Guide",
              "provider": "University of Canterbury Computer Science Education Research Group",
              "url": "https://www.csfieldguide.org.nz/en/",
              "assignedUse": "Complete one matching interactive and create a worked example that distinguishes correctness from observed timing.",
              "order": 3
            }
          ],
          "guidedPractice": "Prove comparable outputs on generated data, count operations for growing input sizes, and recommend a search strategy for one small one-time query and one repeated large workload.",
          "lowStakesCheck": "Mixed trace-and-explain check on correctness, preconditions, Big-O categories, preprocessing cost, and absent-key behaviour.",
          "assessment": {
            "key": "ICS4U-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Correctness, Growth, and Search Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Correctness proof",
              "Operation-count table",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after the correctness comparison and corrected search trace are submitted. Teacher feedback distinguishes unsupported speed claims from defensible complexity reasoning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "ICS4U-M06",
          "number": 6,
          "title": "Sorting, Data Structures, and Reproducible Benchmarks",
          "unitNumber": 3,
          "unitTitle": "Designing Modular Programs",
          "lessonIds": [
            "ICS4U-U3-L3",
            "ICS4U-U3-L4"
          ],
          "lessonTitles": [
            "Sorting, Stability, and Comparison Trade-offs",
            "Data-Structure Selection and Reproducible Benchmarking"
          ],
          "lessons": [
            {
              "key": "ICS4U-U3-L3",
              "id": "ICS4U-U3-L3",
              "title": "Sorting, Stability, and Comparison Trade-offs",
              "order": 1
            },
            {
              "key": "ICS4U-U3-L4",
              "id": "ICS4U-U3-L4",
              "title": "Data-Structure Selection and Reproducible Benchmarking",
              "order": 2
            }
          ],
          "learningFocus": [
            "Compare sorting strategies using correctness, stability, input pattern, time, and space rather than a single fastest run.",
            "Select data structures from required semantics and design a reproducible local benchmark with stated limitations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U3-L3: Sorting, Stability, and Comparison Trade-offs.",
            "Complete hand traces on random, sorted, reverse, nearly sorted, and duplicate-heavy inputs.",
            "Student Coursebook Lesson ICS4U-U3-L4: Data-Structure Selection and Reproducible Benchmarking.",
            "Assessment Reading Library: Evidence File 3: Search, Sort, and Structure Benchmark Pack.",
            "Annotate the correctness rule, generated input patterns, required operations, fair-comparison controls, and reporting template."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M06-RESOURCE-01",
              "title": "Open Data Structures (Pseudocode Edition)",
              "provider": "Pat Morin / Open Data Structures",
              "url": "https://opendatastructures.org/ods-python/",
              "assignedUse": "Compare two candidate structures, trace operations, and justify the choice using semantics, operation counts, and memory trade-offs.",
              "order": 1
            },
            {
              "key": "ICS4U-M06-RESOURCE-02",
              "title": "VisuAlgo: Visualising Data Structures and Algorithms Through Animation",
              "provider": "VisuAlgo / National University of Singapore School of Computing",
              "url": "https://visualgo.net/en",
              "assignedUse": "Compare insertion sort and merge sort on three chosen patterns, record comparisons and moves, and predict scaling before testing.",
              "order": 2
            },
            {
              "key": "ICS4U-M06-RESOURCE-03",
              "title": "The Python Tutorial",
              "provider": "Python Software Foundation",
              "url": "https://docs.python.org/3/tutorial/",
              "assignedUse": "Use the official data-structure reference to verify collection semantics and document one implementation-dependent limitation.",
              "order": 3
            }
          ],
          "guidedPractice": "Establish equal outputs, select generated datasets, repeat timed trials, report median and spread, and combine measured evidence with complexity and structure semantics in a conditional recommendation.",
          "lowStakesCheck": "Assessment-readiness check on stability, fair variables, repeated trials, input patterns, data-structure semantics, and limitations, followed by a rubric self-audit.",
          "assessment": {
            "key": "ICS4U-M06-ASSESSMENT",
            "assignmentKey": "ICS4U-M06-ASSIGNMENT",
            "assignmentKeys": [
              "ICS4U-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Algorithm Recommendation Lab",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 3: Search, Sort, and Structure Benchmark Pack",
            "sequence": [
              "Evidence-file annotation",
              "Algorithm and condition approval",
              "Correctness and complexity conference",
              "Benchmark-protocol review",
              "Teacher feedback",
              "Final prototype, results, recommendation memo, and defence"
            ],
            "taskType": "Comparative algorithm investigation, local prototype, and recommendation memo",
            "processCheckpoints": [
              "Algorithm and comparison-condition approval",
              "Trace and complexity conference before timing",
              "Benchmark protocol review for reproducibility and fairness",
              "Recommendation defence using one result and one limitation"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "ICS4U-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "Algorithm Recommendation Lab",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Algorithm and comparison-condition approval",
                  "Trace and complexity conference before timing",
                  "Benchmark protocol review for reproducibility and fairness",
                  "Recommendation defence using one result and one limitation"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "ICS4U-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks correctness before timing and reviews reproducibility before the final recommendation. Unlock Module 7 after submission and a limitation statement.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "ICS4U-M07",
          "number": 7,
          "title": "Requirements, Accessible Criteria, and Project Planning",
          "unitNumber": 4,
          "unitTitle": "Topics in Computer Science",
          "lessonIds": [
            "ICS4U-U4-L1",
            "ICS4U-U4-L2"
          ],
          "lessonTitles": [
            "Requirements, User Stories, and Accessible Acceptance Criteria",
            "Backlogs, Estimation, Dependencies, and Version Evidence"
          ],
          "lessons": [
            {
              "key": "ICS4U-U4-L1",
              "id": "ICS4U-U4-L1",
              "title": "Requirements, User Stories, and Accessible Acceptance Criteria",
              "order": 1
            },
            {
              "key": "ICS4U-U4-L2",
              "id": "ICS4U-U4-L2",
              "title": "Backlogs, Estimation, Dependencies, and Version Evidence",
              "order": 2
            }
          ],
          "learningFocus": [
            "Translate stakeholder needs into testable functional, non-functional, security, privacy, and accessibility criteria.",
            "Plan a bounded project through a prioritized backlog, dependencies, milestones, risks, and traceable version evidence."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U4-L1: Requirements, User Stories, and Accessible Acceptance Criteria.",
            "Complete a requirement-to-acceptance-test traceability table.",
            "Student Coursebook Lesson ICS4U-U4-L2: Backlogs, Estimation, Dependencies, and Version Evidence.",
            "Complete the backlog dependency map and identify the evidence required at each milestone."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M07-RESOURCE-01",
              "title": "NIST SP 800-218: Secure Software Development Framework (SSDF) Version 1.1",
              "provider": "U.S. National Institute of Standards and Technology",
              "url": "https://csrc.nist.gov/pubs/sp/800/218/final",
              "assignedUse": "Select four proportionate secure-development tasks, rewrite them in plain language, and attach one observable project artifact to each.",
              "order": 1
            },
            {
              "key": "ICS4U-M07-RESOURCE-02",
              "title": "Digital Accessibility Foundations",
              "provider": "World Wide Web Consortium Web Accessibility Initiative and UNESCO IITE",
              "url": "https://www.w3.org/WAI/courses/foundations-course/",
              "assignedUse": "Convert five accessibility concepts into testable acceptance criteria for a fictional local tool.",
              "order": 2
            },
            {
              "key": "ICS4U-M07-RESOURCE-03",
              "title": "Pro Git, 2nd Edition",
              "provider": "Git project / Scott Chacon and Ben Straub",
              "url": "https://git-scm.com/book/en/v2",
              "assignedUse": "Practise a local, fictional-data workflow with meaningful commits and submit a labelled evidence log; no public repository is required.",
              "order": 3
            }
          ],
          "guidedPractice": "Draft a charter and scope boundary, write accessible user stories, prioritize a backlog, map dependencies, and link each milestone to a reviewable artifact and risk control.",
          "lowStakesCheck": "Requirements-and-planning check requiring observable acceptance criteria, a dependency explanation, and a corrected traceability gap.",
          "assessment": {
            "key": "ICS4U-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Project Definition and Planning Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "User stories",
              "Traceability table",
              "Backlog and risks",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after the charter, acceptance criteria, and first backlog pass review. Teacher feedback identifies ambiguous scope, inaccessible criteria, and unowned risks.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "ICS4U-M08",
          "number": 8,
          "title": "Testing, Review, Licensing, and Project Closure",
          "unitNumber": 4,
          "unitTitle": "Topics in Computer Science",
          "lessonIds": [
            "ICS4U-U4-L3",
            "ICS4U-U4-L4"
          ],
          "lessonTitles": [
            "Test Strategy, Code Review, and Secure Local Development",
            "Documentation, Licensing, Release Review, and Retrospective"
          ],
          "lessons": [
            {
              "key": "ICS4U-U4-L3",
              "id": "ICS4U-U4-L3",
              "title": "Test Strategy, Code Review, and Secure Local Development",
              "order": 1
            },
            {
              "key": "ICS4U-U4-L4",
              "id": "ICS4U-U4-L4",
              "title": "Documentation, Licensing, Release Review, and Retrospective",
              "order": 2
            }
          ],
          "learningFocus": [
            "Design unit, integration, regression, acceptance, security, and accessibility evidence for a bounded local project.",
            "Use review, documentation, licence records, release criteria, contribution evidence, and retrospectives to close work responsibly."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U4-L3: Test Strategy, Code Review, and Secure Local Development.",
            "Complete the requirement-to-test matrix and one structured code review.",
            "Student Coursebook Lesson ICS4U-U4-L4: Documentation, Licensing, Release Review, and Retrospective.",
            "Assessment Reading Library: Evidence File 4: Fictional Project Governance and Quality Record.",
            "Annotate the charter, backlog, risk register, defect, release conditions, contribution evidence, and retrospective prompts."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M08-RESOURCE-01",
              "title": "Software Engineering at Google",
              "provider": "Google / Abseil, published with O'Reilly Media",
              "url": "https://abseil.io/resources/swe-book",
              "assignedUse": "Use selected code-review and testing practices to create a proportionate team checklist and explain what would be excessive for this project.",
              "order": 1
            },
            {
              "key": "ICS4U-M08-RESOURCE-02",
              "title": "OWASP Top Ten Web Application Security Risks",
              "provider": "OWASP Foundation",
              "url": "https://owasp.org/www-project-top-ten/",
              "assignedUse": "Select only relevant categories for the fictional project, write defensive misuse cases and controls, and restate the authorization boundary.",
              "order": 2
            },
            {
              "key": "ICS4U-M08-RESOURCE-03",
              "title": "Introduction to GitHub",
              "provider": "GitHub Skills",
              "url": "https://github.com/skills/introduction-to-github",
              "assignedUse": "Translate the workflow into a safe fictional project branch, review checklist, merge evidence, and reflection; use local version evidence when public work is inappropriate.",
              "order": 3
            }
          ],
          "guidedPractice": "Run a test-and-review cycle, repair an empty-state defect, update the guide and licence register, trace the change to a labelled version, and complete a no-blame process retrospective.",
          "lowStakesCheck": "Assessment-readiness review of acceptance coverage, negative tests, accessibility, security, source/licence records, contribution evidence, and release criteria.",
          "assessment": {
            "key": "ICS4U-M08-ASSESSMENT",
            "assignmentKey": "ICS4U-M08-ASSIGNMENT",
            "assignmentKeys": [
              "ICS4U-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Local Team Software Project Simulation",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 4: Fictional Project Governance and Quality Record",
            "sequence": [
              "Evidence-file annotation",
              "Charter and requirement approval",
              "Planning and architecture review",
              "Midpoint prototype, test, and contribution audit",
              "Teacher feedback and repair cycle",
              "Closing demonstration, portfolio, retrospective, and individual verification"
            ],
            "taskType": "Team process portfolio, local prototype, individual evidence, and project review",
            "processCheckpoints": [
              "Charter, scope, and accessibility/security requirement approval",
              "Planning review after first backlog and architecture draft",
              "Midpoint prototype, test, and contribution audit",
              "Closing demonstration, retrospective, and individual oral verification"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "ICS4U-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "Local Team Software Project Simulation",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Charter, scope, and accessibility/security requirement approval",
                  "Planning review after first backlog and architecture draft",
                  "Midpoint prototype, test, and contribution audit",
                  "Closing demonstration, retrospective, and individual oral verification"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "ICS4U-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher reviews team process and individual evidence separately. Unlock Module 9 after closing evidence, retrospective, and individual explanation are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "ICS4U-M09",
          "number": 9,
          "title": "Privacy, Bias, Accessibility, and Secure Design",
          "unitNumber": 5,
          "unitTitle": "Culminating Computer Science Inquiry and Communication",
          "lessonIds": [
            "ICS4U-U5-L1",
            "ICS4U-U5-L2"
          ],
          "lessonTitles": [
            "Privacy, Bias, Accessibility, and Ethical Decision Frameworks",
            "Threat Modelling, Secure Design, and Responsible Disclosure"
          ],
          "lessons": [
            {
              "key": "ICS4U-U5-L1",
              "id": "ICS4U-U5-L1",
              "title": "Privacy, Bias, Accessibility, and Ethical Decision Frameworks",
              "order": 1
            },
            {
              "key": "ICS4U-U5-L2",
              "id": "ICS4U-U5-L2",
              "title": "Threat Modelling, Secure Design, and Responsible Disclosure",
              "order": 2
            }
          ],
          "learningFocus": [
            "Apply data minimization, stakeholder, bias, fairness, accessibility, and professional-ethics reasoning to a bounded design.",
            "Build a defensive threat model with proportionate controls, safe local tests, residual risks, and responsible escalation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U5-L1: Privacy, Bias, Accessibility, and Ethical Decision Frameworks.",
            "Complete the stakeholder-impact, unnecessary-data, and accessible-alternative map.",
            "Student Coursebook Lesson ICS4U-U5-L2: Threat Modelling, Secure Design, and Responsible Disclosure.",
            "Complete the asset-threat-control-residual-risk table without testing any real system."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M09-RESOURCE-01",
              "title": "ACM Code of Ethics: Case Studies",
              "provider": "Association for Computing Machinery Committee on Professional Ethics",
              "url": "https://www.acm.org/code-of-ethics/case-studies",
              "assignedUse": "Apply at least three numbered principles to a selected case and compare two actions with priority given to the public good.",
              "order": 1
            },
            {
              "key": "ICS4U-M09-RESOURCE-02",
              "title": "OWASP Top Ten Web Application Security Risks",
              "provider": "OWASP Foundation",
              "url": "https://owasp.org/www-project-top-ten/",
              "assignedUse": "Write three defensive misuse cases, controls, and verification artifacts for a fictional app; do not test systems without explicit authorization.",
              "order": 2
            },
            {
              "key": "ICS4U-M09-RESOURCE-03",
              "title": "How I'm Fighting Bias in Algorithms",
              "provider": "TED / Joy Buolamwini",
              "url": "https://www.ted.com/talks/joy_buolamwini_how_i_m_fighting_bias_in_algorithms",
              "assignedUse": "Identify the claim-evidence-reasoning chain and propose a disaggregated test plan that states what would and would not justify a fairness claim.",
              "order": 3
            }
          ],
          "guidedPractice": "Remove unnecessary fictional fields, rewrite colour-only output as accessible text, build a defensive threat model, and explain why a control reduces but does not eliminate risk.",
          "lowStakesCheck": "Scenario check on data minimization, bias evidence, accessibility acceptance criteria, threat modelling, authorization, and residual risk.",
          "assessment": {
            "key": "ICS4U-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Responsible and Secure Computing Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Stakeholder/data map",
              "Threat model",
              "Self-study task",
              "Scenario check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after the impact map and defensive threat model are accepted. Teacher feedback checks evidence limits, accessibility, authorization, and residual risk.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "ICS4U-M10",
          "number": 10,
          "title": "Environmental Evidence, Emerging Technology, and Capstone Defence",
          "unitNumber": 5,
          "unitTitle": "Culminating Computer Science Inquiry and Communication",
          "lessonIds": [
            "ICS4U-U5-L3",
            "ICS4U-U5-L4"
          ],
          "lessonTitles": [
            "Environmental Stewardship, Emerging Technologies, Research, and Careers",
            "Capstone Integration, Demonstration, and Technical Defence"
          ],
          "lessons": [
            {
              "key": "ICS4U-U5-L3",
              "id": "ICS4U-U5-L3",
              "title": "Environmental Stewardship, Emerging Technologies, Research, and Careers",
              "order": 1
            },
            {
              "key": "ICS4U-U5-L4",
              "id": "ICS4U-U5-L4",
              "title": "Capstone Integration, Demonstration, and Technical Defence",
              "order": 2
            }
          ],
          "learningFocus": [
            "Evaluate environmental, emerging-technology, research, and career claims using defined system boundaries and evidence limits.",
            "Integrate modular design, algorithm analysis, testing, accessibility, security, privacy, environmental evidence, demonstration, and defence."
          ],
          "readingSteps": [
            "Student Coursebook Lesson ICS4U-U5-L3: Environmental Stewardship, Emerging Technologies, Research, and Careers.",
            "Complete the system-boundary, evidence-quality, and career/research question map.",
            "Student Coursebook Lesson ICS4U-U5-L4: Capstone Integration, Demonstration, and Technical Defence.",
            "Assessment Reading Library: Evidence File 5: Responsible Computing Impact Dossier.",
            "Annotate the fictional brief, proposed data, threat and accessibility observations, environmental assumptions, capstone rubric, and defence requirements."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M10-RESOURCE-01",
              "title": "Green Software Practitioner Training",
              "provider": "Green Software Foundation",
              "url": "https://learn.greensoftware.foundation/",
              "assignedUse": "Audit one small local program for an efficiency or hardware-life improvement and explain why correctness and accessibility remain guardrails.",
              "order": 1
            },
            {
              "key": "ICS4U-M10-RESOURCE-02",
              "title": "Computer Science Field Guide",
              "provider": "University of Canterbury Computer Science Education Research Group",
              "url": "https://www.csfieldguide.org.nz/en/",
              "assignedUse": "Use one less-emphasized topic to strengthen the capstone explanation and create a worked example in original language.",
              "order": 2
            },
            {
              "key": "ICS4U-M10-RESOURCE-03",
              "title": "Machine Learning Crash Course",
              "provider": "Google for Developers",
              "url": "https://developers.google.com/machine-learning/crash-course",
              "assignedUse": "Use selected datasets, overfitting, and fairness material to write an evidence-limited model-card comparison without unsupported claims.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete an integration trace from need to module to algorithm to test to risk control, rehearse a local demonstration, challenge one environmental claim, and answer a teacher-selected technical/ethical question.",
          "lowStakesCheck": "Capstone-readiness review covering scope, fictional/public data, traceability, tests, accessibility, threat controls, environmental limitations, source record, and defence evidence.",
          "assessment": {
            "key": "ICS4U-M10-ASSESSMENT",
            "assignmentKey": "ICS4U-M10-ASSIGNMENT",
            "assignmentKeys": [
              "ICS4U-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Responsible Offline Computing Capstone",
            "weightPercent": 15,
            "evidenceFile": "Evidence File 5: Responsible Computing Impact Dossier",
            "sequence": [
              "Evidence-file annotation",
              "Need, harm screen, data source, and no-deployment approval",
              "Design review",
              "Midpoint test demonstration and revision",
              "Teacher feedback",
              "Final local prototype, evidence portfolio, demonstration, and individual defence"
            ],
            "taskType": "Individual or paired offline prototype, evidence portfolio, demonstration, and defence",
            "processCheckpoints": [
              "Need, harm screen, data source, and no-deployment scope approval",
              "Design review covering modules, algorithm, accessibility, and threat model",
              "Midpoint test demonstration with one documented revision",
              "Final local demonstration and individual technical/ethical defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "ICS4U-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Responsible Offline Computing Capstone",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Need, harm screen, data source, and no-deployment scope approval",
                  "Design review covering modules, algorithm, accessibility, and threat model",
                  "Midpoint test demonstration with one documented revision",
                  "Final local demonstration and individual technical/ethical defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "ICS4U-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks technical and ethical evidence before the final defence. Unlock Module 11 after final submission, authenticated explanation, and a reflection on one unresolved limitation.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 10.5,
          "workloadLabel": "10.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "ICS4U-M11",
          "number": 11,
          "title": "Cumulative Synthesis, Culminating Performance, and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Integrate programming, modular design, algorithm analysis, project evidence, and responsible-computing reasoning across unfamiliar cases.",
            "Demonstrate independent, time-bounded code tracing, design analysis, evidence interpretation, and technical communication.",
            "Complete and defend the existing culminating performance before the mandatory written examination."
          ],
          "readingSteps": [
            "Review the five unit concept maps, test portfolios, and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved set requiring code tracing, algorithm choice, modular design, test selection, and ethical/security analysis.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "ICS4U-M11-RESOURCE-01",
              "title": "CS50's Introduction to Programming with Python (CS50P)",
              "provider": "Harvard University / CS50",
              "url": "https://cs50.harvard.edu/python/",
              "assignedUse": "Use only the topics identified by the correction log, then complete original retrieval and tracing practice without copying course solutions.",
              "order": 1
            },
            {
              "key": "ICS4U-M11-RESOURCE-02",
              "title": "The Python Tutorial",
              "provider": "Python Software Foundation",
              "url": "https://docs.python.org/3/tutorial/",
              "assignedUse": "Resolve syntax or standard-language gaps found in the correction log and build a concise personal reference before the examination.",
              "order": 2
            },
            {
              "key": "ICS4U-M11-RESOURCE-03",
              "title": "NIST SP 800-218: Secure Software Development Framework (SSDF) Version 1.1",
              "provider": "U.S. National Institute of Standards and Technology",
              "url": "https://csrc.nist.gov/pubs/sp/800/218/final",
              "assignedUse": "Review only the secure-development concepts assigned by the teacher and practise matching each to observable project evidence.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: trace and predict, design and decompose, analyse an algorithm, select verification evidence, and evaluate a responsible-computing scenario. Finish with a timed mock and teacher conference.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "ICS4U-M11-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [
              "ICS4U-M11-CULMINATING-ASSIGNMENT",
              "ICS4U-M11-WRITTEN-EXAM-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "ICS4U Final Evaluation: Culminating Performance and Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Scope, evidence, and integrity conference",
              "Interim artefact and source-trail review",
              "Testing, analysis, or feasibility checkpoint",
              "Final submission and authenticated individual defence",
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [
              "Scope, evidence, and integrity conference",
              "Interim artefact and source-trail review",
              "Testing, analysis, or feasibility checkpoint",
              "Final submission and authenticated individual defence"
            ],
            "authenticationEvidence": [
              "Final culminating submission and authenticated individual defence",
              "Supervised written examination administration record"
            ],
            "timeMinutes": 210,
            "components": [
              {
                "key": "ICS4U-M11-C01",
                "componentKey": "m11-culminating",
                "position": 1,
                "title": "ICS4U Culminating Performance and Defence",
                "type": "Culminating performance and defence",
                "weightPercent": 10,
                "timeMinutes": 120,
                "processCheckpoints": [
                  "Scope, evidence, and integrity conference",
                  "Interim artefact and source-trail review",
                  "Testing, analysis, or feasibility checkpoint",
                  "Final submission and authenticated individual defence"
                ],
                "submissionMode": "project",
                "assignmentKey": "ICS4U-M11-CULMINATING-ASSIGNMENT"
              },
              {
                "key": "ICS4U-M11-C02",
                "componentKey": "m11-written-exam",
                "position": 2,
                "title": "ICS4U Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 15,
                "timeMinutes": 90,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "ICS4U-M11-WRITTEN-EXAM-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes concept, trace, design, evidence, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 3.5,
          "workloadLabel": "3.5 h final evaluation (2 h culminating performance + 1.5 h supervised written examination)",
          "teacherPresence": "Culminating scope and source-trail checkpoints, authenticated individual defence, exam-readiness confirmation, approved accommodations, identity check, and supervised examination administration.",
          "evidenceToRetain": "Culminating artefact, source/work history, checkpoint feedback, authenticated defence record, supervised examination script, and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "ICS4U-M02-COURSEWORK",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M02",
          "moduleActivityKey": "ICS4U-M02-ASSESSMENT",
          "assignmentKey": "ICS4U-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Local Data-Quality Utility",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Evidence File 1: Fictional Community-Asset Data Quality Case"
        },
        {
          "key": "ICS4U-M04-COURSEWORK",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M04",
          "moduleActivityKey": "ICS4U-M04-ASSESSMENT",
          "assignmentKey": "ICS4U-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Accessible Study-Planner Module Library",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Evidence File 2: Fictional Transit Fare Rule-Engine Architecture"
        },
        {
          "key": "ICS4U-M06-COURSEWORK",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M06",
          "moduleActivityKey": "ICS4U-M06-ASSESSMENT",
          "assignmentKey": "ICS4U-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "Algorithm Recommendation Lab",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Evidence File 3: Search, Sort, and Structure Benchmark Pack"
        },
        {
          "key": "ICS4U-M08-COURSEWORK",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M08",
          "moduleActivityKey": "ICS4U-M08-ASSESSMENT",
          "assignmentKey": "ICS4U-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "Local Team Software Project Simulation",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Evidence File 4: Fictional Project Governance and Quality Record"
        },
        {
          "key": "ICS4U-M10-COURSEWORK",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M10",
          "moduleActivityKey": "ICS4U-M10-ASSESSMENT",
          "assignmentKey": "ICS4U-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Responsible Offline Computing Capstone",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Evidence File 5: Responsible Computing Impact Dossier"
        },
        {
          "key": "ICS4U-M11-CULMINATING",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M11",
          "moduleActivityKey": "ICS4U-M11-ASSESSMENT",
          "assignmentKey": "ICS4U-M11-CULMINATING-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-culminating",
          "title": "ICS4U Culminating Performance and Defence",
          "type": "Culminating performance and defence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "project",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "ICS4U-M11-WRITTEN-EXAM",
          "courseCode": "ICS4U",
          "moduleKey": "ICS4U-M11",
          "moduleActivityKey": "ICS4U-M11-ASSESSMENT",
          "assignmentKey": "ICS4U-M11-WRITTEN-EXAM-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "ICS4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 7,
          "evidenceDescription": null
        },
        {
          "key": "ICS4U-PARTICIPATION",
          "courseCode": "ICS4U",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 8,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    },
    {
      "code": "SPH4U",
      "title": "Physics",
      "department": "Science",
      "grade": "12",
      "courseType": "University Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "Physics, Grade 11, University Preparation",
      "description": "This course enables students to deepen their understanding of physics concepts and theories. Students will continue their exploration of energy transformations and the forces that affect motion, and will investigate electrical, gravitational, and magnetic fields and electromagnetic radiation. Students will also explore the wave nature of light, quantum mechanics, and special relativity. They will further develop their scientific investigation skills, learning, for example, how to analyse, qualitatively and quantitatively, data related to a variety of physics concepts and principles. Students will also consider the impact of technological applications of physics on society and the environment.",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 11 and 12: Science (Revised)",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with a diagram-first or prediction check before calculation.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 25,
        "culminatingTaskPercent": 0,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "SPH4U-M11-C01",
          "componentKey": "m11-written-exam",
          "position": 1,
          "title": "SPH4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "timeMinutes": 150,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "SPH4U-M00",
          "number": 0,
          "title": "Start Here: Learning Physics in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 25% mandatory written examination, 10% attendance and participation.",
            "Establish ethical, safe, and traceable practices for diagrams, data, calculations, simulations, citations, and investigations."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, diagram/data conventions, and investigation safety boundaries.",
            "Preview the five unit assessments and the SPH4U Mandatory Written Examination before beginning content."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, submit a sample vector diagram and unit-checked calculation, and practise locating rubric feedback.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering Grade 11 mechanics, algebra, trigonometry, vectors, units, significant figures, and graph interpretation; students receive a targeted review list.",
          "assessment": {
            "key": "SPH4U-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Safety, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Safety/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "SPH4U-M01",
          "number": 1,
          "title": "Vector Kinematics and Forces in a Plane",
          "unitNumber": 1,
          "unitTitle": "Dynamics",
          "lessonIds": [
            "SPH4U-U1-L1",
            "SPH4U-U1-L2"
          ],
          "lessonTitles": [
            "Vector Kinematics and Projectile Models",
            "Newton's Laws for Motion in a Plane"
          ],
          "lessons": [
            {
              "key": "SPH4U-U1-L1",
              "id": "SPH4U-U1-L1",
              "title": "Vector Kinematics and Projectile Models",
              "order": 1
            },
            {
              "key": "SPH4U-U1-L2",
              "id": "SPH4U-U1-L2",
              "title": "Newton's Laws for Motion in a Plane",
              "order": 2
            }
          ],
          "learningFocus": [
            "Resolve and combine vector motion quantities in planar and projectile models.",
            "Translate a physical situation into a free-body diagram and a consistent set of Newton-law equations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U1-L1: Vector Kinematics and Projectile Models.",
            "Complete the diagram-first vector and projectile retrieval set.",
            "Student Coursebook Lesson SPH4U-U1-L2: Newton's Laws for Motion in a Plane.",
            "Complete one free-body-diagram-to-equations translation before opening the extensions."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M01-RESOURCE-01",
              "title": "College Physics 2e",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/college-physics-2e/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",
              "assignedUse": "Read the matching projectile and force sections, predict one example result, and solve a comparable problem without notes.",
              "order": 1
            },
            {
              "key": "SPH4U-M01-RESOURCE-02",
              "title": "Projectile Motion",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/projectile-motion",
              "assignedUse": "Predict and test range across launch angles, then explain symmetry and the effect of drag.",
              "order": 2
            },
            {
              "key": "SPH4U-M01-RESOURCE-03",
              "title": "University Physics Volume 1",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
              "assignedUse": "Complete one diagram-first dynamics problem and record the governing principle, units, limiting case, and correction.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete a component-method vector set, compare analytic and simulated projectile results, and audit two flawed free-body diagrams before solving a planar force case.",
          "lowStakesCheck": "Ten-item vector/kinematics/dynamics check requiring diagrams and units, followed by one correction attempt and an error-log entry.",
          "assessment": {
            "key": "SPH4U-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Planar Motion and Force Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Diagram practice",
              "Simulation task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after both lesson checkpoints and one corrected free-body diagram are submitted. Teacher feedback targets coordinate choice, vector direction, and force identification.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SPH4U-M02",
          "number": 2,
          "title": "Circular Motion and Safety Decisions",
          "unitNumber": 1,
          "unitTitle": "Dynamics",
          "lessonIds": [
            "SPH4U-U1-L3",
            "SPH4U-U1-L4"
          ],
          "lessonTitles": [
            "Uniform Circular Motion",
            "Banked Curves, Vertical Circles, and Safety Decisions"
          ],
          "lessons": [
            {
              "key": "SPH4U-U1-L3",
              "id": "SPH4U-U1-L3",
              "title": "Uniform Circular Motion",
              "order": 1
            },
            {
              "key": "SPH4U-U1-L4",
              "id": "SPH4U-U1-L4",
              "title": "Banked Curves, Vertical Circles, and Safety Decisions",
              "order": 2
            }
          ],
          "learningFocus": [
            "Relate inward net force and acceleration to circular-motion variables without inventing an extra force.",
            "Evaluate banked-curve or vertical-circle evidence and communicate a bounded safety recommendation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U1-L3: Uniform Circular Motion.",
            "Complete the inward-direction and net-force retrieval set.",
            "Student Coursebook Lesson SPH4U-U1-L4: Banked Curves, Vertical Circles, and Safety Decisions.",
            "Assessment Reading Library: Dynamics Design Evidence File.",
            "Annotate the design constraints, assumptions, and safety criteria before calculating."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M02-RESOURCE-01",
              "title": "8.01SC Classical Mechanics",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
              "assignedUse": "Use one matching circular-motion session; predict demonstration outcomes and attempt two bounded problems before checking solutions.",
              "order": 1
            },
            {
              "key": "SPH4U-M02-RESOURCE-02",
              "title": "PHYS 200: Fundamentals of Physics I",
              "provider": "Open Yale Courses, Yale University",
              "url": "https://oyc.yale.edu/physics/phys-200",
              "assignedUse": "Study one matching mechanics segment and compare its assumptions with the SPH4U safety model.",
              "order": 2
            },
            {
              "key": "SPH4U-M02-RESOURCE-03",
              "title": "The Feynman Lectures on Physics: Online Edition",
              "provider": "California Institute of Technology",
              "url": "https://www.feynmanlectures.caltech.edu/",
              "assignedUse": "Read one teacher-selected dynamics section and identify an idealizing assumption that matters in a real safety decision.",
              "order": 3
            }
          ],
          "guidedPractice": "Draw force diagrams at multiple positions, solve a banked-curve sensitivity case, and prepare a one-page safety rationale that separates calculation, assumption, and design margin.",
          "lowStakesCheck": "Assessment-readiness quiz on radial direction, net force, normal force, friction, limiting cases, and safety-factor interpretation, followed by a rubric preflight.",
          "assessment": {
            "key": "SPH4U-M02-ASSESSMENT",
            "assignmentKey": "SPH4U-M02-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Planar Dynamics Safety Analysis",
            "weightPercent": 10,
            "evidenceFile": "Dynamics Design Evidence File",
            "sequence": [
              "Evidence-file annotation",
              "Free-body diagram and model checkpoint",
              "Sensitivity calculation",
              "Teacher feedback",
              "Final safety analysis",
              "Post-submission reflection"
            ],
            "taskType": "Technical modelling report and authenticated conference",
            "processCheckpoints": [
              "Scenario, safety boundary, variables, and assumptions approved",
              "Free-body diagram and component-equation review",
              "Data-model comparison and uncertainty conference",
              "Final technical report and individual verification"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SPH4U-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Planar Dynamics Safety Analysis",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Scenario, safety boundary, variables, and assumptions approved",
                  "Free-body diagram and component-equation review",
                  "Data-model comparison and uncertainty conference",
                  "Final technical report and individual verification"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SPH4U-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies the force model and one sensitivity calculation before final submission. Unlock Module 3 after the assessment and a reflection on the most consequential assumption are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SPH4U-M03",
          "number": 3,
          "title": "Work, Energy, Power, and Efficiency",
          "unitNumber": 2,
          "unitTitle": "Energy and Momentum",
          "lessonIds": [
            "SPH4U-U2-L1",
            "SPH4U-U2-L2"
          ],
          "lessonTitles": [
            "Work, Kinetic Energy, and Power",
            "Conservation of Energy and Efficiency"
          ],
          "lessons": [
            {
              "key": "SPH4U-U2-L1",
              "id": "SPH4U-U2-L1",
              "title": "Work, Kinetic Energy, and Power",
              "order": 1
            },
            {
              "key": "SPH4U-U2-L2",
              "id": "SPH4U-U2-L2",
              "title": "Conservation of Energy and Efficiency",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use work-energy relationships and power to analyse motion and energy transfer.",
            "Define system boundaries and distinguish total-energy conservation from mechanical-energy changes and efficiency losses."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U2-L1: Work, Kinetic Energy, and Power.",
            "Complete the sign-of-work and work-energy retrieval set.",
            "Student Coursebook Lesson SPH4U-U2-L2: Conservation of Energy and Efficiency.",
            "Complete one energy-flow representation and reconcile it with the equation set."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M03-RESOURCE-01",
              "title": "Energy Skate Park",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/energy-skate-park",
              "assignedUse": "Predict and test energy components at three positions with and without friction, then explain total versus mechanical energy.",
              "order": 1
            },
            {
              "key": "SPH4U-M03-RESOURCE-02",
              "title": "8.01SC Classical Mechanics",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
              "assignedUse": "Use one matching energy session and complete two problems before viewing explanations or solutions.",
              "order": 2
            },
            {
              "key": "SPH4U-M03-RESOURCE-03",
              "title": "University Physics Volume 1",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
              "assignedUse": "Solve one energy problem with a system diagram, governing principle, units, and limiting-case check.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a work-sign error, compare energy-flow and force-displacement solution paths, and calculate efficiency/power for a bounded device or motion case.",
          "lowStakesCheck": "Mixed conceptual/calculation check on system boundary, work sign, energy transformation, power, and efficiency with mandatory corrections.",
          "assessment": {
            "key": "SPH4U-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Energy and Efficiency Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Energy-diagram practice",
              "Simulation task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after one complete energy-flow explanation and corrected calculation are submitted. Teacher feedback prioritizes boundary choice and conservation claims.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SPH4U-M04",
          "number": 4,
          "title": "Impulse, Momentum, and Collision Evidence",
          "unitNumber": 2,
          "unitTitle": "Energy and Momentum",
          "lessonIds": [
            "SPH4U-U2-L3",
            "SPH4U-U2-L4"
          ],
          "lessonTitles": [
            "Impulse, Momentum, and One-Dimensional Collisions",
            "Two-Dimensional Momentum and Collision Evidence"
          ],
          "lessons": [
            {
              "key": "SPH4U-U2-L3",
              "id": "SPH4U-U2-L3",
              "title": "Impulse, Momentum, and One-Dimensional Collisions",
              "order": 1
            },
            {
              "key": "SPH4U-U2-L4",
              "id": "SPH4U-U2-L4",
              "title": "Two-Dimensional Momentum and Collision Evidence",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use impulse-momentum relationships and conservation with explicit system and direction conventions.",
            "Resolve two-dimensional collision evidence and distinguish momentum conservation from kinetic-energy behaviour."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U2-L3: Impulse, Momentum, and One-Dimensional Collisions.",
            "Complete the impulse-area and one-dimensional momentum checkpoint.",
            "Student Coursebook Lesson SPH4U-U2-L4: Two-Dimensional Momentum and Collision Evidence.",
            "Assessment Reading Library: Collision Protection Evidence File.",
            "Annotate measurement uncertainty, comparison basis, and protection criteria before analysis."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M04-RESOURCE-01",
              "title": "Collision Lab",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/collision-lab",
              "assignedUse": "Build four collision cases and compare momentum components and kinetic energy before and after.",
              "order": 1
            },
            {
              "key": "SPH4U-M04-RESOURCE-02",
              "title": "University Physics Volume 1",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
              "assignedUse": "Complete one diagram-first two-dimensional momentum problem and document the correction process.",
              "order": 2
            },
            {
              "key": "SPH4U-M04-RESOURCE-03",
              "title": "Direct Observation of Gravitational Waves: Educator's Guide",
              "provider": "LIGO Laboratory, Caltech/MIT, with Sonoma State University education team",
              "url": "https://www.ligo.caltech.edu/system/media_files/binaries/303/original/ligo-educators-guide.pdf?1455165573=",
              "assignedUse": "Read only the teacher-selected energy/evidence section and identify how multiple measurements strengthen a physical claim.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete impulse-from-graph calculations, solve a two-dimensional collision with component checks, and compare two protection designs using force-time and energy evidence.",
          "lowStakesCheck": "Assessment-readiness check on system choice, signs/components, impulse, momentum conservation, energy loss, uncertainty, and claim strength.",
          "assessment": {
            "key": "SPH4U-M04-ASSESSMENT",
            "assignmentKey": "SPH4U-M04-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Collision Protection and Energy Management Study",
            "weightPercent": 12,
            "evidenceFile": "Collision Protection Evidence File",
            "sequence": [
              "Evidence-file annotation",
              "Momentum/impulse calculation checkpoint",
              "Protection comparison",
              "Teacher feedback",
              "Final collision study",
              "Post-submission reflection"
            ],
            "taskType": "Data analysis, design comparison, and individual defence",
            "processCheckpoints": [
              "Approve system boundary and comparison criteria",
              "Verify graph scales, areas, units, and conservation equations",
              "Review uncertainty and design-trade-off matrix",
              "Submit final recommendation and complete individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SPH4U-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Collision Protection and Energy Management Study",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Approve system boundary and comparison criteria",
                  "Verify graph scales, areas, units, and conservation equations",
                  "Review uncertainty and design-trade-off matrix",
                  "Submit final recommendation and complete individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SPH4U-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies component conservation and one uncertainty statement before final submission. Unlock Module 5 after the assessment and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SPH4U-M05",
          "number": 5,
          "title": "Gravitational and Electric Fields",
          "unitNumber": 3,
          "unitTitle": "Gravitational, Electric, and Magnetic Fields",
          "lessonIds": [
            "SPH4U-U3-L1",
            "SPH4U-U3-L2"
          ],
          "lessonTitles": [
            "Gravitational Fields, Potential, and Orbits",
            "Electric Fields, Potential, and Capacitors"
          ],
          "lessons": [
            {
              "key": "SPH4U-U3-L1",
              "id": "SPH4U-U3-L1",
              "title": "Gravitational Fields, Potential, and Orbits",
              "order": 1
            },
            {
              "key": "SPH4U-U3-L2",
              "id": "SPH4U-U3-L2",
              "title": "Electric Fields, Potential, and Capacitors",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use field and potential models for gravitational interactions and orbital systems.",
            "Represent electric field, potential, work, and capacitor behaviour with consistent sign and symmetry reasoning."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U3-L1: Gravitational Fields, Potential, and Orbits.",
            "Complete the field-versus-potential and orbit retrieval set.",
            "Student Coursebook Lesson SPH4U-U3-L2: Electric Fields, Potential, and Capacitors.",
            "Complete a field/equipotential translation and one capacitor calculation."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M05-RESOURCE-01",
              "title": "Gravity Force Lab",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/gravity-force-lab",
              "assignedUse": "Run mass and distance controls, linearise the distance data with 1/r², and interpret the paired-force arrows.",
              "order": 1
            },
            {
              "key": "SPH4U-M05-RESOURCE-02",
              "title": "Charges and Fields",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/charges-and-fields",
              "assignedUse": "Predict and map field/equipotential patterns, including a location where potential may be zero while field is not.",
              "order": 2
            },
            {
              "key": "SPH4U-M05-RESOURCE-03",
              "title": "University Physics Volume 2",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-2/pages/1-introduction",
              "assignedUse": "Complete one point-charge field case with a diagram, law selection, sign/direction explanation, and unit check.",
              "order": 3
            }
          ],
          "guidedPractice": "Compare field and potential representations, solve an orbit/energy case, map a multi-charge arrangement, and justify a capacitor or field-model choice from stated assumptions.",
          "lowStakesCheck": "Diagram-and-calculation check on inverse-square relationships, potential, field direction, energy, equipotentials, and capacitors; require corrections.",
          "assessment": {
            "key": "SPH4U-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Gravitational and Electric Field Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Field-diagram practice",
              "Simulation tasks",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after a complete field/potential comparison and correction log are submitted. Teacher feedback targets scalar/vector distinctions and sign/symmetry reasoning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SPH4U-M06",
          "number": 6,
          "title": "Magnetic Forces, Induction, and Field Technologies",
          "unitNumber": 3,
          "unitTitle": "Gravitational, Electric, and Magnetic Fields",
          "lessonIds": [
            "SPH4U-U3-L3",
            "SPH4U-U3-L4"
          ],
          "lessonTitles": [
            "Magnetic Forces on Charges and Currents",
            "Electromagnetic Induction and Field Technologies"
          ],
          "lessons": [
            {
              "key": "SPH4U-U3-L3",
              "id": "SPH4U-U3-L3",
              "title": "Magnetic Forces on Charges and Currents",
              "order": 1
            },
            {
              "key": "SPH4U-U3-L4",
              "id": "SPH4U-U3-L4",
              "title": "Electromagnetic Induction and Field Technologies",
              "order": 2
            }
          ],
          "learningFocus": [
            "Determine the magnitude and direction of magnetic forces on charges and currents.",
            "Use flux change, Faraday's law, and Lenz's law to analyse technologies and compare field-based options."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U3-L3: Magnetic Forces on Charges and Currents.",
            "Complete the right-hand-rule and magnitude checkpoint.",
            "Student Coursebook Lesson SPH4U-U3-L4: Electromagnetic Induction and Field Technologies.",
            "Assessment Reading Library: Field Technology Evidence File.",
            "Annotate performance, evidence quality, safety, uncertainty, and comparison criteria before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M06-RESOURCE-01",
              "title": "8.02 Physics II: Electricity and Magnetism",
              "provider": "MIT OpenCourseWare",
              "url": "https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2019/",
              "assignedUse": "Study one magnetic-field and one induction segment; solve one quantitative example with a sign/direction explanation.",
              "order": 1
            },
            {
              "key": "SPH4U-M06-RESOURCE-02",
              "title": "Faraday's Law",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/faradays-law",
              "assignedUse": "Predict and test how speed, direction, pole orientation, and coil turns change induced voltage.",
              "order": 2
            },
            {
              "key": "SPH4U-M06-RESOURCE-03",
              "title": "PHYS 201: Fundamentals of Physics II",
              "provider": "Open Yale Courses, Yale University",
              "url": "https://oyc.yale.edu/physics/phys-201",
              "assignedUse": "Use one aligned fields lecture and submit a diagram-first solution plus a short symmetry/evidence reflection.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete direction card sorts, calculate magnetic force/flux cases, explain two Lenz-law signs, and compare field technologies on a normalized performance-risk basis.",
          "lowStakesCheck": "Assessment-readiness check on force direction, flux, induced emf sign, energy conservation, evidence sufficiency, and technology trade-offs.",
          "assessment": {
            "key": "SPH4U-M06-ASSESSMENT",
            "assignmentKey": "SPH4U-M06-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Field Technology Comparative Case",
            "weightPercent": 14,
            "evidenceFile": "Field Technology Evidence File",
            "sequence": [
              "Evidence-file annotation",
              "Field/induction calculation checkpoint",
              "Technology comparison matrix",
              "Teacher feedback",
              "Final comparative case",
              "Post-submission reflection"
            ],
            "taskType": "Model portfolio, quantitative case analysis, and defence",
            "processCheckpoints": [
              "Technology and safety boundary approved",
              "Diagram, sign convention, and equation check",
              "Evidence-quality and uncertainty review",
              "Final portfolio and authenticated defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SPH4U-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "Field Technology Comparative Case",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Technology and safety boundary approved",
                  "Diagram, sign convention, and equation check",
                  "Evidence-quality and uncertainty review",
                  "Final portfolio and authenticated defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SPH4U-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies direction reasoning and one quantitative comparison before final submission. Unlock Module 7 after the assessment and revision record are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SPH4U-M07",
          "number": 7,
          "title": "Wavefronts, Superposition, and Interference",
          "unitNumber": 4,
          "unitTitle": "The Wave Nature of Light",
          "lessonIds": [
            "SPH4U-U4-L1",
            "SPH4U-U4-L2"
          ],
          "lessonTitles": [
            "Wavefronts, Phase, and Superposition",
            "Double-Slit Interference"
          ],
          "lessons": [
            {
              "key": "SPH4U-U4-L1",
              "id": "SPH4U-U4-L1",
              "title": "Wavefronts, Phase, and Superposition",
              "order": 1
            },
            {
              "key": "SPH4U-U4-L2",
              "id": "SPH4U-U4-L2",
              "title": "Double-Slit Interference",
              "order": 2
            }
          ],
          "learningFocus": [
            "Represent wavefronts, phase, and superposition using diagrams and equations.",
            "Use path difference and double-slit evidence to predict and interpret interference patterns."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U4-L1: Wavefronts, Phase, and Superposition.",
            "Complete the phase/path-difference prediction set.",
            "Student Coursebook Lesson SPH4U-U4-L2: Double-Slit Interference.",
            "Complete one diagram-to-equation double-slit example and a limiting-case check."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M07-RESOURCE-01",
              "title": "Wave Interference",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/wave-interference",
              "assignedUse": "Run one-source, two-source, and double-slit trials with predictions, pattern records, and path-difference explanations.",
              "order": 1
            },
            {
              "key": "SPH4U-M07-RESOURCE-02",
              "title": "College Physics 2e, Chapter 27: Wave Optics",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/college-physics-2e/pages/27-introduction-to-wave-optics",
              "assignedUse": "Read the matching interference sections and solve one double-slit problem with a pattern sketch.",
              "order": 2
            },
            {
              "key": "SPH4U-M07-RESOURCE-03",
              "title": "University Physics Volume 3",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-3/pages/1-introduction",
              "assignedUse": "Use one aligned optics section to compare classical prediction, observed pattern, and mathematical model.",
              "order": 3
            }
          ],
          "guidedPractice": "Annotate wavefront and phase diagrams, predict pattern changes before calculating, and reconcile a simulated fringe spacing with the double-slit relation.",
          "lowStakesCheck": "Concept-and-calculation check on phase, path difference, constructive/destructive conditions, fringe spacing, and pattern scaling, with corrections.",
          "assessment": {
            "key": "SPH4U-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Interference Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Prediction task",
              "Simulation task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after the pattern prediction and corrected calculation are complete. Teacher feedback targets diagram-equation consistency and proportional reasoning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SPH4U-M08",
          "number": 8,
          "title": "Diffraction, Resolution, Refraction, and Polarization",
          "unitNumber": 4,
          "unitTitle": "The Wave Nature of Light",
          "lessonIds": [
            "SPH4U-U4-L3",
            "SPH4U-U4-L4"
          ],
          "lessonTitles": [
            "Diffraction, Gratings, and Resolution",
            "Refraction, Total Internal Reflection, and Polarization"
          ],
          "lessons": [
            {
              "key": "SPH4U-U4-L3",
              "id": "SPH4U-U4-L3",
              "title": "Diffraction, Gratings, and Resolution",
              "order": 1
            },
            {
              "key": "SPH4U-U4-L4",
              "id": "SPH4U-U4-L4",
              "title": "Refraction, Total Internal Reflection, and Polarization",
              "order": 2
            }
          ],
          "learningFocus": [
            "Analyse diffraction, gratings, and resolution using pattern evidence and appropriate approximations.",
            "Use refraction, total internal reflection, and polarization to justify an optical communication/design decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U4-L3: Diffraction, Gratings, and Resolution.",
            "Complete the diffraction/grating pattern-comparison checkpoint.",
            "Student Coursebook Lesson SPH4U-U4-L4: Refraction, Total Internal Reflection, and Polarization.",
            "Assessment Reading Library: Optical System Evidence File.",
            "Annotate wavelength, geometry, resolution, loss, and design constraints before selecting a system."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M08-RESOURCE-01",
              "title": "College Physics 2e, Chapter 27: Wave Optics",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/college-physics-2e/pages/27-introduction-to-wave-optics",
              "assignedUse": "Build a four-row comparison of interference, diffraction, gratings, and polarization and solve selected numerical cases.",
              "order": 1
            },
            {
              "key": "SPH4U-M08-RESOURCE-02",
              "title": "Bending Light",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/bending-light",
              "assignedUse": "Predict, measure, and graph refraction for four material pairs; interpret the slope and critical-angle condition.",
              "order": 2
            },
            {
              "key": "SPH4U-M08-RESOURCE-03",
              "title": "PHYS 201: Fundamentals of Physics II",
              "provider": "Open Yale Courses, Yale University",
              "url": "https://oyc.yale.edu/physics/phys-201",
              "assignedUse": "Use the wave-theory-of-light segment for one diagram-first solution and an evidence/model reflection.",
              "order": 3
            }
          ],
          "guidedPractice": "Compare slit/grating patterns, calculate one resolution and one critical-angle case, and use a decision matrix to select an optical design while stating model limits.",
          "lowStakesCheck": "Assessment-readiness check on pattern variables, resolution, Snell's law, total internal reflection, polarization, units, and evidence-based design trade-offs.",
          "assessment": {
            "key": "SPH4U-M08-ASSESSMENT",
            "assignmentKey": "SPH4U-M08-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Optical Communication and Resolution Design Brief",
            "weightPercent": 14,
            "evidenceFile": "Optical System Evidence File",
            "sequence": [
              "Evidence-file annotation",
              "Optics calculation checkpoint",
              "Design comparison matrix",
              "Teacher feedback",
              "Final design brief",
              "Post-submission reflection"
            ],
            "taskType": "Evidence-based optical design analysis and defence",
            "processCheckpoints": [
              "System purpose, optical safety boundary, and evidence source approved",
              "Diagram and variable-definition check",
              "Quantitative model and uncertainty review",
              "Final design brief and authenticated defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SPH4U-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "Optical Communication and Resolution Design Brief",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "System purpose, optical safety boundary, and evidence source approved",
                  "Diagram and variable-definition check",
                  "Quantitative model and uncertainty review",
                  "Final design brief and authenticated defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SPH4U-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one pattern/resolution calculation and the connection between evidence and design criterion. Unlock Module 9 after the final brief and limitation reflection are submitted.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SPH4U-M09",
          "number": 9,
          "title": "Photons, Matter Waves, and Quantum Evidence",
          "unitNumber": 5,
          "unitTitle": "Revolutions in Modern Physics: Quantum Mechanics and Special Relativity",
          "lessonIds": [
            "SPH4U-U5-L1",
            "SPH4U-U5-L2"
          ],
          "lessonTitles": [
            "Photons and the Photoelectric Effect",
            "Matter Waves, Electron Diffraction, and Uncertainty"
          ],
          "lessons": [
            {
              "key": "SPH4U-U5-L1",
              "id": "SPH4U-U5-L1",
              "title": "Photons and the Photoelectric Effect",
              "order": 1
            },
            {
              "key": "SPH4U-U5-L2",
              "id": "SPH4U-U5-L2",
              "title": "Matter Waves, Electron Diffraction, and Uncertainty",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use photoelectric evidence to distinguish the roles of frequency and intensity and evaluate classical/quantum models.",
            "Use de Broglie and diffraction evidence to explain matter waves and the limits of classical descriptions."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U5-L1: Photons and the Photoelectric Effect.",
            "Complete the classical-versus-photon prediction table.",
            "Student Coursebook Lesson SPH4U-U5-L2: Matter Waves, Electron Diffraction, and Uncertainty.",
            "Complete one photon-energy and one de Broglie calculation with an evidence interpretation."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M09-RESOURCE-01",
              "title": "College Physics 2e, Chapter 29: Introduction to Quantum Physics",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/college-physics-2e/pages/29-introduction-to-quantum-physics",
              "assignedUse": "Build an evidence-to-model timeline and solve one photon and one de Broglie problem.",
              "order": 1
            },
            {
              "key": "SPH4U-M09-RESOURCE-02",
              "title": "Photoelectric Effect",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/photoelectric",
              "assignedUse": "Vary frequency and intensity independently, estimate threshold behaviour, and write a claim-evidence-reasoning model comparison.",
              "order": 2
            },
            {
              "key": "SPH4U-M09-RESOURCE-03",
              "title": "University Physics Volume 3",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/university-physics-volume-3/pages/1-introduction",
              "assignedUse": "Use one aligned modern-physics section to connect classical prediction, observed evidence, revised model, and equation.",
              "order": 3
            }
          ],
          "guidedPractice": "Interpret photoelectric graphs, solve photon and matter-wave cases, and create a claim-evidence-reasoning table explaining why one classical prediction fails.",
          "lowStakesCheck": "Quantum-evidence check on photon energy, stopping potential, threshold frequency, de Broglie wavelength, uncertainty, and model claims, followed by corrections.",
          "assessment": {
            "key": "SPH4U-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Quantum Evidence Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Evidence table",
              "Simulation task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after the model-comparison table and corrected quantitative check are complete. Teacher feedback distinguishes observation, inference, and model claim.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "SPH4U-M10",
          "number": 10,
          "title": "Relativity, Mass-Energy, and Modern Technology",
          "unitNumber": 5,
          "unitTitle": "Revolutions in Modern Physics: Quantum Mechanics and Special Relativity",
          "lessonIds": [
            "SPH4U-U5-L3",
            "SPH4U-U5-L4"
          ],
          "lessonTitles": [
            "Special Relativity: Time, Length, and Simultaneity",
            "Mass-Energy, Model Change, and Modern Technologies"
          ],
          "lessons": [
            {
              "key": "SPH4U-U5-L3",
              "id": "SPH4U-U5-L3",
              "title": "Special Relativity: Time, Length, and Simultaneity",
              "order": 1
            },
            {
              "key": "SPH4U-U5-L4",
              "id": "SPH4U-U5-L4",
              "title": "Mass-Energy, Model Change, and Modern Technologies",
              "order": 2
            }
          ],
          "learningFocus": [
            "Apply constant-light-speed and relativity principles to time, length, and simultaneity evidence.",
            "Use mass-energy and model-change evidence to evaluate a modern-physics technology claim."
          ],
          "readingSteps": [
            "Student Coursebook Lesson SPH4U-U5-L3: Special Relativity: Time, Length, and Simultaneity.",
            "Complete a two-frame event diagram before calculating Lorentz effects.",
            "Student Coursebook Lesson SPH4U-U5-L4: Mass-Energy, Model Change, and Modern Technologies.",
            "Assessment Reading Library: Modern Physics Evidence File.",
            "Annotate the evidence hierarchy, model limits, uncertainty, and technology implications before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M10-RESOURCE-01",
              "title": "Einstein's twin paradox explained",
              "provider": "TED-Ed (lesson by Amber L. Stuver)",
              "url": "https://ed.ted.com/lessons/einstein-s-twin-paradox-explained-amber-l-stuver",
              "assignedUse": "Draw parallel timelines, calculate one Lorentz-factor case, and identify the frame change that breaks the apparent symmetry.",
              "order": 1
            },
            {
              "key": "SPH4U-M10-RESOURCE-02",
              "title": "Special Relativity: The Principle of Relativity",
              "provider": "Einstein Online, Max Planck Institute for Gravitational Physics",
              "url": "https://www.einstein-online.info/en/RelativityPrinciple/",
              "assignedUse": "Compare two reference frames, list dependent/invariant statements, and revise a light-clock prediction.",
              "order": 2
            },
            {
              "key": "SPH4U-M10-RESOURCE-03",
              "title": "Direct Observation of Gravitational Waves: Educator's Guide",
              "provider": "LIGO Laboratory, Caltech/MIT, with Sonoma State University education team",
              "url": "https://www.ligo.caltech.edu/system/media_files/binaries/303/original/ligo-educators-guide.pdf?1455165573=",
              "assignedUse": "Annotate the selected evidence and use E=mc² in a bounded calculation while distinguishing measurement from interpretation.",
              "order": 3
            }
          ],
          "guidedPractice": "Complete two-frame event diagrams, solve time-dilation/length/mass-energy cases with limiting checks, and rank evidence supporting a modern-technology claim.",
          "lowStakesCheck": "Assessment-readiness check on frames, invariants, simultaneity, Lorentz factor, mass-energy, evidence hierarchy, uncertainty, and model limits.",
          "assessment": {
            "key": "SPH4U-M10-ASSESSMENT",
            "assignmentKey": "SPH4U-M10-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Modern Physics Evidence and Technology Dossier",
            "weightPercent": 15,
            "evidenceFile": "Modern Physics Evidence File",
            "sequence": [
              "Evidence-file annotation",
              "Relativity/mass-energy calculation checkpoint",
              "Evidence hierarchy and claim outline",
              "Teacher feedback",
              "Final dossier",
              "Post-submission reflection"
            ],
            "taskType": "Evidence synthesis, quantitative analysis, and oral defence",
            "processCheckpoints": [
              "Evidence set, technology, and safety boundary approved",
              "Classical-versus-modern prediction table reviewed",
              "Quantitative verification and source-quality conference",
              "Final dossier and authenticated oral defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "SPH4U-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Modern Physics Evidence and Technology Dossier",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Evidence set, technology, and safety boundary approved",
                  "Classical-versus-modern prediction table reviewed",
                  "Quantitative verification and source-quality conference",
                  "Final dossier and authenticated oral defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "SPH4U-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies the reference-frame model and distinction between evidence and inference. Unlock Module 11 after the assessment and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 11.5,
          "workloadLabel": "11.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "SPH4U-M11",
          "number": 11,
          "title": "Cumulative Synthesis and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Select and connect force, energy, momentum, field, wave, and modern-physics models across unfamiliar contexts.",
            "Demonstrate independent, time-bounded diagramming, calculation, checking, and evidence communication."
          ],
          "readingSteps": [
            "Review the five unit concept maps and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved problem set that requires system/model selection and a diagram before calculation.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "SPH4U-M11-RESOURCE-01",
              "title": "College Physics 2e",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/college-physics-2e/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",
              "assignedUse": "Use only the sections identified by the correction log, then solve selected end-of-section questions without notes.",
              "order": 1
            },
            {
              "key": "SPH4U-M11-RESOURCE-02",
              "title": "The Feynman Lectures on Physics: Online Edition",
              "provider": "California Institute of Technology",
              "url": "https://www.feynmanlectures.caltech.edu/",
              "assignedUse": "Use one teacher-selected chapter to write prediction questions, reconstruct one derivation, and identify ideal assumptions.",
              "order": 2
            },
            {
              "key": "SPH4U-M11-RESOURCE-03",
              "title": "Fundamental Physical Constants",
              "provider": "National Institute of Standards and Technology",
              "url": "https://physics.nist.gov/cuu/Constants/index.html",
              "assignedUse": "Verify values, units, and uncertainty while preparing; this reference is not for examination use unless expressly permitted.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: draw the system, identify the governing model, solve, check units/limits, interpret evidence, and revise. Finish with a timed mock and teacher conference based on the error log.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "SPH4U-M11-ASSESSMENT",
            "assignmentKey": "SPH4U-M11-ASSIGNMENT",
            "assignmentKeys": [
              "SPH4U-M11-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "SPH4U Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": 150,
            "components": [
              {
                "key": "SPH4U-M11-C01",
                "componentKey": "m11-written-exam",
                "position": 1,
                "title": "SPH4U Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 25,
                "timeMinutes": 150,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "SPH4U-M11-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes model selection, diagram, physics, calculation, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 2.5,
          "workloadLabel": "2.5 h supervised written examination",
          "teacherPresence": "Readiness confirmation, approved accommodations, identity check, supervision, and post-exam closure.",
          "evidenceToRetain": "Supervised examination script and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "SPH4U-M02-COURSEWORK",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M02",
          "moduleActivityKey": "SPH4U-M02-ASSESSMENT",
          "assignmentKey": "SPH4U-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Planar Dynamics Safety Analysis",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Dynamics Design Evidence File"
        },
        {
          "key": "SPH4U-M04-COURSEWORK",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M04",
          "moduleActivityKey": "SPH4U-M04-ASSESSMENT",
          "assignmentKey": "SPH4U-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Collision Protection and Energy Management Study",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Collision Protection Evidence File"
        },
        {
          "key": "SPH4U-M06-COURSEWORK",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M06",
          "moduleActivityKey": "SPH4U-M06-ASSESSMENT",
          "assignmentKey": "SPH4U-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "Field Technology Comparative Case",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Field Technology Evidence File"
        },
        {
          "key": "SPH4U-M08-COURSEWORK",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M08",
          "moduleActivityKey": "SPH4U-M08-ASSESSMENT",
          "assignmentKey": "SPH4U-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "Optical Communication and Resolution Design Brief",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Optical System Evidence File"
        },
        {
          "key": "SPH4U-M10-COURSEWORK",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M10",
          "moduleActivityKey": "SPH4U-M10-ASSESSMENT",
          "assignmentKey": "SPH4U-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Modern Physics Evidence and Technology Dossier",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Modern Physics Evidence File"
        },
        {
          "key": "SPH4U-M11-WRITTEN-EXAM",
          "courseCode": "SPH4U",
          "moduleKey": "SPH4U-M11",
          "moduleActivityKey": "SPH4U-M11-ASSESSMENT",
          "assignmentKey": "SPH4U-M11-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "SPH4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "SPH4U-PARTICIPATION",
          "courseCode": "SPH4U",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 7,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    },
    {
      "code": "MHF4U",
      "title": "Advanced Functions",
      "department": "Mathematics",
      "grade": "12",
      "courseType": "University Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "Functions, Grade 11, University Preparation, or Mathematics for College Technology, Grade 12, College Preparation",
      "description": "This course extends students' experience with functions. Students will investigate the properties of polynomial, rational, logarithmic, and trigonometric functions; develop techniques for combining functions; broaden their understanding of rates of change; and develop facility in applying these concepts and skills. Students will also refine their use of the mathematical processes necessary for success in senior mathematics. This course is intended both for students taking the Calculus and Vectors course as a prerequisite for a university program and for those wishing to consolidate their understanding of mathematics before proceeding to any one of a variety of university programs.",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 11 and 12: Mathematics (Revised)",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with a retrieval check after each reading cluster.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 25,
        "culminatingTaskPercent": 0,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "MHF4U-M11-C01",
          "componentKey": "m11-written-exam",
          "position": 1,
          "title": "MHF4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "timeMinutes": 150,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "MHF4U-M00",
          "number": 0,
          "title": "Start Here: Learning Advanced Functions in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 25% mandatory written examination, 10% attendance and participation.",
            "Establish traceable practices for algebraic work, graphing-tool use, source citation, and mathematical communication."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, calculator and graphing-tool rules, and notation standards.",
            "Preview the five unit assessments and the MHF4U Mandatory Written Examination before beginning content."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, submit a sample algebra-and-graph record, and practise locating rubric feedback and resubmission instructions.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering algebra, factoring, function notation, transformations, domain and range, exact values, and graph interpretation; students receive a targeted review list.",
          "assessment": {
            "key": "MHF4U-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Tool-Use, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Tool-use/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "MHF4U-M01",
          "number": 1,
          "title": "Exponential Structure, Inverses, and Logarithmic Laws",
          "unitNumber": 1,
          "unitTitle": "Exponential and Logarithmic Functions",
          "lessonIds": [
            "MHF4U-U1-L1",
            "MHF4U-U1-L2"
          ],
          "lessonTitles": [
            "Exponential Functions, Parameters, and Inverses",
            "Logarithms and the Laws of Logarithms"
          ],
          "lessons": [
            {
              "key": "MHF4U-U1-L1",
              "id": "MHF4U-U1-L1",
              "title": "Exponential Functions, Parameters, and Inverses",
              "order": 1
            },
            {
              "key": "MHF4U-U1-L2",
              "id": "MHF4U-U1-L2",
              "title": "Logarithms and the Laws of Logarithms",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect exponential parameters, transformations, inverses, and graphical features.",
            "Use the definition and laws of logarithms with stated domains and reversible algebraic steps."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U1-L1: Exponential Functions, Parameters, and Inverses.",
            "Complete the parameter-effect and inverse-function retrieval set.",
            "Student Coursebook Lesson MHF4U-U1-L2: Logarithms and the Laws of Logarithms.",
            "Complete the logarithm-law error sort before opening the external resources."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M01-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 4: Exponential and Logarithmic Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/4-introduction-to-exponential-and-logarithmic-functions",
              "assignedUse": "Read the matching sections, reconstruct one worked example, and compare its notation with the Coursebook convention.",
              "order": 1
            },
            {
              "key": "MHF4U-M01-RESOURCE-02",
              "title": "Logarithms, Explained",
              "provider": "TED-Ed; lesson by Steve Kelly",
              "url": "https://ed.ted.com/lessons/steve-kelly-logarithms-explained",
              "assignedUse": "Create a concept map linking powers, logarithms, inverses, and common scales, then test it with three examples.",
              "order": 2
            },
            {
              "key": "MHF4U-M01-RESOURCE-03",
              "title": "CEMC Advanced Functions and Pre-Calculus Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/8",
              "assignedUse": "Complete one teacher-selected exponential or logarithmic lesson and record two corrections in the course error log.",
              "order": 3
            }
          ],
          "guidedPractice": "Match equations, tables, and graphs; derive inverse pairs; expand and condense logarithms; and explain every domain restriction before using a graphing tool to verify.",
          "lowStakesCheck": "Short mixed-representation check on parameter effects, inverse relationships, logarithmic laws, and domain restrictions, with one correction attempt.",
          "assessment": {
            "key": "MHF4U-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Exponential and Logarithmic Foundations Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Guided examples",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after both lesson checkpoints and a corrected logarithm-law item are submitted. Teacher feedback targets reversible reasoning and domain control.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MHF4U-M02",
          "number": 2,
          "title": "Equations, Growth and Decay, and Model Limits",
          "unitNumber": 1,
          "unitTitle": "Exponential and Logarithmic Functions",
          "lessonIds": [
            "MHF4U-U1-L3",
            "MHF4U-U1-L4"
          ],
          "lessonTitles": [
            "Solving Exponential and Logarithmic Equations",
            "Growth, Decay, Scales, and Model Limits"
          ],
          "lessons": [
            {
              "key": "MHF4U-U1-L3",
              "id": "MHF4U-U1-L3",
              "title": "Solving Exponential and Logarithmic Equations",
              "order": 1
            },
            {
              "key": "MHF4U-U1-L4",
              "id": "MHF4U-U1-L4",
              "title": "Growth, Decay, Scales, and Model Limits",
              "order": 2
            }
          ],
          "learningFocus": [
            "Solve exponential and logarithmic equations while checking domains and extraneous values.",
            "Build, compare, and critique growth or decay models using units, assumptions, residual evidence, and meaningful thresholds."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U1-L3: Solving Exponential and Logarithmic Equations.",
            "Complete the equation-method decision tree and verify each solution in the original equation.",
            "Student Coursebook Lesson MHF4U-U1-L4: Growth, Decay, Scales, and Model Limits.",
            "Assessment Reading Library: Evidence File 1: Growth, Decay, and Threshold Model Casebook.",
            "Annotate variables, units, assumptions, thresholds, and required model comparisons before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M02-RESOURCE-01",
              "title": "Paul's Online Math Notes: Algebra",
              "provider": "Paul Dawkins, Lamar University",
              "url": "https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx",
              "assignedUse": "Study one matching equation-solving section and complete a bounded set without viewing solutions until the end.",
              "order": 1
            },
            {
              "key": "MHF4U-M02-RESOURCE-02",
              "title": "Desmos Graphing Calculator",
              "provider": "Desmos Studio",
              "url": "https://www.desmos.com/calculator",
              "assignedUse": "Graph the competing models on a common domain and preserve labelled screenshots that verify intersections and thresholds.",
              "order": 2
            },
            {
              "key": "MHF4U-M02-RESOURCE-03",
              "title": "Exponential and Logarithmic Functions Interactive Lesson",
              "provider": "Ximera, The Ohio State University",
              "url": "https://ximera.osu.edu/mooculus/calculus1/reviewOfFamousFunctions/digInExponentialAndLogarithmeticFunctions",
              "assignedUse": "Complete the interactive review and summarize the two misconceptions most relevant to the evidence file.",
              "order": 3
            }
          ],
          "guidedPractice": "Solve and verify a mixed equation set, estimate parameters from bounded data, compare residual patterns, and write a conditional recommendation that identifies when the selected model stops being credible.",
          "lowStakesCheck": "Assessment-readiness check on equation methods, domains, units, parameter meaning, residuals, thresholds, and extrapolation limits, followed by a rubric self-check.",
          "assessment": {
            "key": "MHF4U-M02-ASSESSMENT",
            "assignmentKey": "MHF4U-M02-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Exponential and Logarithmic Model Audit",
            "weightPercent": 10,
            "evidenceFile": "Evidence File 1: Growth, Decay, and Threshold Model Casebook",
            "sequence": [
              "Evidence-file annotation",
              "Equation and parameter checkpoint",
              "Model comparison draft",
              "Teacher feedback",
              "Final modelling report and authenticated problem conference",
              "Post-submission reflection"
            ],
            "taskType": "Individual modelling report with authenticated problem conference",
            "processCheckpoints": [
              "Teacher approves the two contexts, data source, variables, and feasible domains.",
              "Student submits an algebra checkpoint showing model construction and one exact-to-approximate conversion.",
              "Student explains a domain restriction and reproduces one solution without automated equation solving.",
              "Student revises the interpretation after feedback and submits a source and technology-use record."
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MHF4U-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Exponential and Logarithmic Model Audit",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Teacher approves the two contexts, data source, variables, and feasible domains.",
                  "Student submits an algebra checkpoint showing model construction and one exact-to-approximate conversion.",
                  "Student explains a domain restriction and reproduces one solution without automated equation solving.",
                  "Student revises the interpretation after feedback and submits a source and technology-use record."
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MHF4U-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one equation pathway, one parameter interpretation, and one model limitation before final submission. Unlock Module 3 after the assessment and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MHF4U-M03",
          "number": 3,
          "title": "Radians, Exact Values, and Periodic Models",
          "unitNumber": 2,
          "unitTitle": "Trigonometric Functions",
          "lessonIds": [
            "MHF4U-U2-L1",
            "MHF4U-U2-L2"
          ],
          "lessonTitles": [
            "Radians, the Unit Circle, and Exact Values",
            "Sinusoidal and Reciprocal Function Models"
          ],
          "lessons": [
            {
              "key": "MHF4U-U2-L1",
              "id": "MHF4U-U2-L1",
              "title": "Radians, the Unit Circle, and Exact Values",
              "order": 1
            },
            {
              "key": "MHF4U-U2-L2",
              "id": "MHF4U-U2-L2",
              "title": "Sinusoidal and Reciprocal Function Models",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use radian measure and the unit circle to derive exact trigonometric values.",
            "Connect parameters, transformations, reciprocal relationships, and context in periodic models."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U2-L1: Radians, the Unit Circle, and Exact Values.",
            "Complete the unit-circle retrieval grid without a calculator, then correct sign and reference-angle errors.",
            "Student Coursebook Lesson MHF4U-U2-L2: Sinusoidal and Reciprocal Function Models.",
            "Complete a parameter-to-feature table before using graphing resources."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M03-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 5: Trigonometric Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/5-introduction-to-trigonometric-functions",
              "assignedUse": "Read the matching radian and unit-circle sections and reproduce one derivation of exact values.",
              "order": 1
            },
            {
              "key": "MHF4U-M03-RESOURCE-02",
              "title": "Trigonometry",
              "provider": "Michael Corral, Schoolcraft College",
              "url": "https://www.mecmath.net/trig/index.html",
              "assignedUse": "Use one teacher-selected section to complete a short exact-value and graphing practice set.",
              "order": 2
            },
            {
              "key": "MHF4U-M03-RESOURCE-03",
              "title": "GeoGebra Graphing Calculator",
              "provider": "GeoGebra",
              "url": "https://www.geogebra.org/graphing",
              "assignedUse": "Build a dynamic parameter graph and state how amplitude, period, phase shift, and vertical shift change independently.",
              "order": 3
            }
          ],
          "guidedPractice": "Derive exact values, convert between angle measures, match periodic equations to graphs, and critique a sinusoidal model whose scale or phase interpretation is incorrect.",
          "lowStakesCheck": "Mixed exact-value, reciprocal-function, transformation, and contextual-parameter check with an annotated correction for each missed item.",
          "assessment": {
            "key": "MHF4U-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Periodic Function Foundations Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Unit-circle retrieval",
              "Dynamic graph task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after students submit a complete unit-circle grid and one verified periodic model. Teacher flags degree-radian, sign, and parameter-meaning misconceptions.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MHF4U-M04",
          "number": 4,
          "title": "Identities, Equations, and Periodic Design Decisions",
          "unitNumber": 2,
          "unitTitle": "Trigonometric Functions",
          "lessonIds": [
            "MHF4U-U2-L3",
            "MHF4U-U2-L4"
          ],
          "lessonTitles": [
            "Trigonometric Identities and Proof",
            "Solving Trigonometric Equations"
          ],
          "lessons": [
            {
              "key": "MHF4U-U2-L3",
              "id": "MHF4U-U2-L3",
              "title": "Trigonometric Identities and Proof",
              "order": 1
            },
            {
              "key": "MHF4U-U2-L4",
              "id": "MHF4U-U2-L4",
              "title": "Solving Trigonometric Equations",
              "order": 2
            }
          ],
          "learningFocus": [
            "Prove trigonometric identities through logically valid one-sided transformations.",
            "Solve trigonometric equations on stated domains and use solutions in a constrained design decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U2-L3: Trigonometric Identities and Proof.",
            "Complete the identity strategy sort and annotate every legal transformation.",
            "Student Coursebook Lesson MHF4U-U2-L4: Solving Trigonometric Equations.",
            "Assessment Reading Library: Evidence File 2: Periodic Systems Design Packet.",
            "Annotate the design interval, units, constraints, required proof, and equation evidence before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M04-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 7: Trigonometric Identities and Equations",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/7-introduction-to-trigonometric-identities-and-equations",
              "assignedUse": "Reconstruct one identity proof and one equation solution, then label domain and equivalence conditions.",
              "order": 1
            },
            {
              "key": "MHF4U-M04-RESOURCE-02",
              "title": "Precalculus 2e, Chapter 6: Periodic Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/6-introduction-to-periodic-functions",
              "assignedUse": "Use the matching section to verify the selected periodic model and its parameter interpretation.",
              "order": 2
            },
            {
              "key": "MHF4U-M04-RESOURCE-03",
              "title": "CEMC Advanced Functions and Pre-Calculus Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/8",
              "assignedUse": "Complete a teacher-selected identity or trigonometric-equation problem set and preserve the full reasoning trail.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a circular identity proof, solve an equation on two different intervals, fit a periodic model to the evidence packet, and test whether the resulting design satisfies all stated constraints.",
          "lowStakesCheck": "Assessment-readiness check on identity logic, equivalent transformations, general versus interval solutions, periodic parameters, and constraint verification.",
          "assessment": {
            "key": "MHF4U-M04-ASSESSMENT",
            "assignmentKey": "MHF4U-M04-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Periodic Design and Trigonometric Reasoning Brief",
            "weightPercent": 12,
            "evidenceFile": "Evidence File 2: Periodic Systems Design Packet",
            "sequence": [
              "Evidence-file annotation",
              "Identity and equation checkpoint",
              "Periodic design draft",
              "Teacher feedback",
              "Final modelling investigation",
              "Post-submission reflection"
            ],
            "taskType": "Modelling investigation with identity proof and equation analysis",
            "processCheckpoints": [
              "Teacher approves the periodic variable, feasible interval, and measurement units.",
              "Student submits a unit-circle and parameter checkpoint before regression or slider use.",
              "Student presents the first three lines of the identity proof and names the permitted transformations.",
              "Student verifies equation solutions in the original relation and revises the design conclusion."
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MHF4U-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Periodic Design and Trigonometric Reasoning Brief",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Teacher approves the periodic variable, feasible interval, and measurement units.",
                  "Student submits a unit-circle and parameter checkpoint before regression or slider use.",
                  "Student presents the first three lines of the identity proof and names the permitted transformations.",
                  "Student verifies equation solutions in the original relation and revises the design conclusion."
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MHF4U-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks one identity proof, one full interval solution, and the design-constraint test before final submission. Unlock Module 5 after the assessment and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MHF4U-M05",
          "number": 5,
          "title": "Polynomial Structure, Zeros, and Algebraic Theorems",
          "unitNumber": 3,
          "unitTitle": "Polynomial and Rational Functions",
          "lessonIds": [
            "MHF4U-U3-L1",
            "MHF4U-U3-L2"
          ],
          "lessonTitles": [
            "Polynomial Structure, Zeros, and End Behaviour",
            "Polynomial Division, Theorems, and Equations"
          ],
          "lessons": [
            {
              "key": "MHF4U-U3-L1",
              "id": "MHF4U-U3-L1",
              "title": "Polynomial Structure, Zeros, and End Behaviour",
              "order": 1
            },
            {
              "key": "MHF4U-U3-L2",
              "id": "MHF4U-U3-L2",
              "title": "Polynomial Division, Theorems, and Equations",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect degree, leading coefficient, multiplicity, zeros, and end behaviour across representations.",
            "Use division and polynomial theorems to factor, solve, verify, and interpret equations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U3-L1: Polynomial Structure, Zeros, and End Behaviour.",
            "Complete a graph-to-factor and factor-to-graph retrieval set.",
            "Student Coursebook Lesson MHF4U-U3-L2: Polynomial Division, Theorems, and Equations.",
            "Complete one problem by both synthetic or long division and direct substitution verification."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M05-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 3: Polynomial and Rational Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/3-introduction-to-polynomial-and-rational-functions",
              "assignedUse": "Read the matching polynomial sections and complete selected exercises before checking answers.",
              "order": 1
            },
            {
              "key": "MHF4U-M05-RESOURCE-02",
              "title": "Paul's Online Math Notes: Algebra",
              "provider": "Paul Dawkins, Lamar University",
              "url": "https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx",
              "assignedUse": "Use one polynomial section to correct weaknesses identified in the retrieval set.",
              "order": 2
            },
            {
              "key": "MHF4U-M05-RESOURCE-03",
              "title": "Desmos Graphing Calculator",
              "provider": "Desmos Studio",
              "url": "https://www.desmos.com/calculator",
              "assignedUse": "Verify zeros, multiplicities, and end behaviour, then explain one apparent graph-window failure.",
              "order": 3
            }
          ],
          "guidedPractice": "Construct polynomials from constraints, rank plausible graphs, perform division, apply the remainder and factor theorems, and reconcile algebraic roots with numerical graph evidence.",
          "lowStakesCheck": "Short check on polynomial structure, multiplicity, end behaviour, division, and theorem use; require one independent verification method.",
          "assessment": {
            "key": "MHF4U-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Polynomial Structure Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Representation matching",
              "Theorem practice",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after a polynomial is reconstructed and verified from a bounded set of constraints. Teacher feedback targets multiplicity, sign, and theorem interpretation.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MHF4U-M06",
          "number": 6,
          "title": "Rational Behaviour, Inequalities, and Constraint Analysis",
          "unitNumber": 3,
          "unitTitle": "Polynomial and Rational Functions",
          "lessonIds": [
            "MHF4U-U3-L3",
            "MHF4U-U3-L4"
          ],
          "lessonTitles": [
            "Rational Functions, Restrictions, Holes, and Asymptotes",
            "Polynomial and Rational Inequalities"
          ],
          "lessons": [
            {
              "key": "MHF4U-U3-L3",
              "id": "MHF4U-U3-L3",
              "title": "Rational Functions, Restrictions, Holes, and Asymptotes",
              "order": 1
            },
            {
              "key": "MHF4U-U3-L4",
              "id": "MHF4U-U3-L4",
              "title": "Polynomial and Rational Inequalities",
              "order": 2
            }
          ],
          "learningFocus": [
            "Distinguish restrictions, removable discontinuities, vertical or horizontal asymptotes, and intercepts.",
            "Solve polynomial and rational inequalities using critical values, sign analysis, and contextual constraints."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U3-L3: Rational Functions, Restrictions, Holes, and Asymptotes.",
            "Complete a feature-classification table and preserve every original restriction.",
            "Student Coursebook Lesson MHF4U-U3-L4: Polynomial and Rational Inequalities.",
            "Assessment Reading Library: Evidence File 3: Function Behaviour and Constraint Case.",
            "Annotate excluded values, boundary conditions, decision intervals, and required representations before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M06-RESOURCE-01",
              "title": "Modeling, Functions, and Graphs",
              "provider": "Open Textbook Library, University of Minnesota / Katherine Yoshiwara",
              "url": "https://open.umn.edu/opentextbooks/textbooks/modeling-functions-and-graphs",
              "assignedUse": "Use the matching function-behaviour section to create a feature checklist for the case.",
              "order": 1
            },
            {
              "key": "MHF4U-M06-RESOURCE-02",
              "title": "Precalculus: An Investigation of Functions",
              "provider": "Open Textbook Library, University of Minnesota / David Lippman and Melonie Rasmussen",
              "url": "https://open.umn.edu/opentextbooks/textbooks/97",
              "assignedUse": "Complete one bounded rational-function or inequality investigation and compare its method with the Coursebook.",
              "order": 2
            },
            {
              "key": "MHF4U-M06-RESOURCE-03",
              "title": "GeoGebra Graphing Calculator",
              "provider": "GeoGebra",
              "url": "https://www.geogebra.org/graphing",
              "assignedUse": "Test behaviour near each critical value with a controlled viewing window and record where graphing alone is inconclusive.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a cancelled factor that hides a restriction, build a sign chart from exact critical values, compare algebraic and graphical solution sets, and defend the feasible interval in the evidence case.",
          "lowStakesCheck": "Assessment-readiness check on restrictions, holes, asymptotes, sign intervals, endpoint inclusion, and contextual feasibility, followed by a rubric self-check.",
          "assessment": {
            "key": "MHF4U-M06-ASSESSMENT",
            "assignmentKey": "MHF4U-M06-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Polynomial and Rational Function Behaviour Investigation",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 3: Function Behaviour and Constraint Case",
            "sequence": [
              "Evidence-file annotation",
              "Feature and sign-chart checkpoint",
              "Multi-representation investigation draft",
              "Teacher feedback",
              "Final investigation and inequality decision",
              "Post-submission reflection"
            ],
            "taskType": "Multi-representation investigation and inequality decision",
            "processCheckpoints": [
              "Teacher approves the function pair and contextual domain.",
              "Student submits factor and restriction analysis before graphing.",
              "Student explains one sign-chart interval using a test value and multiplicity.",
              "Student completes a short conference defending the difference between a hole and an intercept."
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MHF4U-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "Polynomial and Rational Function Behaviour Investigation",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Teacher approves the function pair and contextual domain.",
                  "Student submits factor and restriction analysis before graphing.",
                  "Student explains one sign-chart interval using a test value and multiplicity.",
                  "Student completes a short conference defending the difference between a hole and an intercept."
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MHF4U-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies original-domain restrictions, critical values, and one independent representation before final submission. Unlock Module 7 after the assessment and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MHF4U-M07",
          "number": 7,
          "title": "Function Operations, Domains, and Inverse Control",
          "unitNumber": 4,
          "unitTitle": "Characteristics of Functions",
          "lessonIds": [
            "MHF4U-U4-L1",
            "MHF4U-U4-L2"
          ],
          "lessonTitles": [
            "Operations on Functions and Domain Intersections",
            "Inverse Functions and Restricted Domains"
          ],
          "lessons": [
            {
              "key": "MHF4U-U4-L1",
              "id": "MHF4U-U4-L1",
              "title": "Operations on Functions and Domain Intersections",
              "order": 1
            },
            {
              "key": "MHF4U-U4-L2",
              "id": "MHF4U-U4-L2",
              "title": "Inverse Functions and Restricted Domains",
              "order": 2
            }
          ],
          "learningFocus": [
            "Perform operations and compositions while determining the resulting domain from all constraints.",
            "Construct, verify, and interpret inverse functions using appropriate restricted domains."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U4-L1: Operations on Functions and Domain Intersections.",
            "Complete a domain-intersection and composition-order retrieval set.",
            "Student Coursebook Lesson MHF4U-U4-L2: Inverse Functions and Restricted Domains.",
            "Complete an inverse-verification table using composition and graph symmetry."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M07-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 1: Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/1-introduction-to-functions",
              "assignedUse": "Read the matching operations, composition, or inverse section and reconstruct one example with explicit domains.",
              "order": 1
            },
            {
              "key": "MHF4U-M07-RESOURCE-02",
              "title": "Functions in Desmos",
              "provider": "Desmos Studio",
              "url": "https://help.desmos.com/hc/en-us/articles/4405177116941-Functions",
              "assignedUse": "Create named functions and compositions, then document how the platform displays undefined inputs and inverse relations.",
              "order": 2
            },
            {
              "key": "MHF4U-M07-RESOURCE-03",
              "title": "CEMC Advanced Functions and Pre-Calculus Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/8",
              "assignedUse": "Complete a teacher-selected functions lesson and add one domain or inverse misconception to the correction log.",
              "order": 3
            }
          ],
          "guidedPractice": "Build operation and composition tables, compare f composed with g against g composed with f, restrict a non-one-to-one function, and verify the inverse algebraically and graphically.",
          "lowStakesCheck": "Short check on operation domains, composition order, one-to-one conditions, restricted domains, and inverse verification with corrections.",
          "assessment": {
            "key": "MHF4U-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Function Operations and Inverses Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Domain practice",
              "Inverse verification",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after one composition and one inverse are verified with correct domains. Teacher feedback prioritizes domain provenance and equivalence.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MHF4U-M08",
          "number": 8,
          "title": "Rates of Change, Function Comparison, and Numerical Decisions",
          "unitNumber": 4,
          "unitTitle": "Characteristics of Functions",
          "lessonIds": [
            "MHF4U-U4-L3",
            "MHF4U-U4-L4"
          ],
          "lessonTitles": [
            "Average and Instantaneous Rate of Change",
            "Comparing Functions and Numerical Solutions"
          ],
          "lessons": [
            {
              "key": "MHF4U-U4-L3",
              "id": "MHF4U-U4-L3",
              "title": "Average and Instantaneous Rate of Change",
              "order": 1
            },
            {
              "key": "MHF4U-U4-L4",
              "id": "MHF4U-U4-L4",
              "title": "Comparing Functions and Numerical Solutions",
              "order": 2
            }
          ],
          "learningFocus": [
            "Estimate and interpret average or instantaneous rate of change from tables, graphs, and equations.",
            "Compare function families and use transparent numerical methods to support a bounded decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U4-L3: Average and Instantaneous Rate of Change.",
            "Complete a secant-to-tangent table and interpret units in context.",
            "Student Coursebook Lesson MHF4U-U4-L4: Comparing Functions and Numerical Solutions.",
            "Assessment Reading Library: Evidence File 4: Function Pipeline and Rate Audit.",
            "Annotate domain intersections, rate intervals, numerical tolerances, and verification requirements before assembling the portfolio."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M08-RESOURCE-01",
              "title": "Precalculus 2e, Chapter 12: Introduction to Calculus",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/12-introduction-to-calculus",
              "assignedUse": "Read the matching rate-of-change section and reproduce a secant-to-tangent argument with labelled units.",
              "order": 1
            },
            {
              "key": "MHF4U-M08-RESOURCE-02",
              "title": "CEMC Problem Solving and Mathematical Discovery",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/40?gid=128",
              "assignedUse": "Use a teacher-selected problem to document conjecture, test, counterexample search, and revision.",
              "order": 2
            },
            {
              "key": "MHF4U-M08-RESOURCE-03",
              "title": "Functions and Graphs Self-Study Collection",
              "provider": "mathcentre, UK higher-education mathematics support consortium",
              "url": "https://www.mathcentre.ac.uk/courses/engineering/graphs/",
              "assignedUse": "Complete only the graph or function topic identified by the correction log and retain the worked solutions.",
              "order": 3
            }
          ],
          "guidedPractice": "Estimate rates at decreasing intervals, compare two candidate functions on a shared domain, implement a transparent numerical search, and audit whether the resulting recommendation is sensitive to tolerance or rounding.",
          "lowStakesCheck": "Assessment-readiness check on rate units, interval choice, domain intersection, graphical/numerical agreement, tolerance, and reasonableness.",
          "assessment": {
            "key": "MHF4U-M08-ASSESSMENT",
            "assignmentKey": "MHF4U-M08-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Function Operations and Rate-of-Change Portfolio",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 4: Function Pipeline and Rate Audit",
            "sequence": [
              "Evidence-file annotation",
              "Domain and rate checkpoint",
              "Portfolio draft and numerical audit",
              "Teacher feedback",
              "Final authenticated portfolio",
              "Post-submission reflection"
            ],
            "taskType": "Authenticated portfolio of multi-representation problems",
            "processCheckpoints": [
              "Student submits domain reasoning before graphing operation functions.",
              "Teacher checks inverse notation and one-to-one restriction.",
              "Student reproduces one rate calculation and explains its units in conference.",
              "Student audits one technology-assisted result with a table, substitution, or residual."
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MHF4U-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "Function Operations and Rate-of-Change Portfolio",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Student submits domain reasoning before graphing operation functions.",
                  "Teacher checks inverse notation and one-to-one restriction.",
                  "Student reproduces one rate calculation and explains its units in conference.",
                  "Student audits one technology-assisted result with a table, substitution, or residual."
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MHF4U-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks one rate calculation, one domain intersection, and one numerical-verification record before final submission. Unlock Module 9 after the portfolio and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MHF4U-M09",
          "number": 9,
          "title": "Model Selection, Evidence, and Sensitivity",
          "unitNumber": 5,
          "unitTitle": "Culminating Advanced Functions Inquiry and Communication",
          "lessonIds": [
            "MHF4U-U5-L1",
            "MHF4U-U5-L2"
          ],
          "lessonTitles": [
            "Model Selection, Assumptions, and Data Provenance",
            "Parameter Estimation, Residuals, and Sensitivity"
          ],
          "lessons": [
            {
              "key": "MHF4U-U5-L1",
              "id": "MHF4U-U5-L1",
              "title": "Model Selection, Assumptions, and Data Provenance",
              "order": 1
            },
            {
              "key": "MHF4U-U5-L2",
              "id": "MHF4U-U5-L2",
              "title": "Parameter Estimation, Residuals, and Sensitivity",
              "order": 2
            }
          ],
          "learningFocus": [
            "Select a defensible function family from context, data provenance, behaviour, and assumptions.",
            "Estimate parameters, analyse residuals, and test sensitivity before claiming that a model supports a decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U5-L1: Model Selection, Assumptions, and Data Provenance.",
            "Complete a model-family screening matrix and a data-provenance check.",
            "Student Coursebook Lesson MHF4U-U5-L2: Parameter Estimation, Residuals, and Sensitivity.",
            "Complete one residual and one sensitivity analysis before selecting the dossier model."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M09-RESOURCE-01",
              "title": "Modeling, Functions, and Graphs",
              "provider": "Open Textbook Library, University of Minnesota / Katherine Yoshiwara",
              "url": "https://open.umn.edu/opentextbooks/textbooks/modeling-functions-and-graphs",
              "assignedUse": "Use one model-selection example to build a checklist for variables, assumptions, fit, and decision limits.",
              "order": 1
            },
            {
              "key": "MHF4U-M09-RESOURCE-02",
              "title": "Desmos Graphing Calculator",
              "provider": "Desmos Studio",
              "url": "https://www.desmos.com/calculator",
              "assignedUse": "Fit and compare candidate functions, preserve residual evidence, and test one parameter perturbation.",
              "order": 2
            },
            {
              "key": "MHF4U-M09-RESOURCE-03",
              "title": "Precalculus: An Investigation of Functions",
              "provider": "Open Textbook Library, University of Minnesota / David Lippman and Melonie Rasmussen",
              "url": "https://open.umn.edu/opentextbooks/textbooks/97",
              "assignedUse": "Read a matching modelling section and identify which steps are evidence-based and which depend on assumptions.",
              "order": 3
            }
          ],
          "guidedPractice": "Screen candidate models, trace every data value to its source, estimate parameters, graph residuals, perturb a key assumption, and write a provisional claim with an explicit limitation.",
          "lowStakesCheck": "Model-readiness conference artifact covering provenance, units, domain, parameter meaning, residual pattern, sensitivity, and uncertainty.",
          "assessment": {
            "key": "MHF4U-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Culminating Model Evidence Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Model screen",
              "Residual/sensitivity task",
              "Teacher conference",
              "Revision plan"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after the proposed model, source record, residual evidence, and revision plan are accepted. Teacher feedback targets model sufficiency rather than visual fit alone.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MHF4U-M10",
          "number": 10,
          "title": "Multi-Representation Argument, Verification, and Defence",
          "unitNumber": 5,
          "unitTitle": "Culminating Advanced Functions Inquiry and Communication",
          "lessonIds": [
            "MHF4U-U5-L3",
            "MHF4U-U5-L4"
          ],
          "lessonTitles": [
            "Multi-Representation Argument and Verification",
            "Synthesis, Error Diagnosis, and Examination Readiness"
          ],
          "lessons": [
            {
              "key": "MHF4U-U5-L3",
              "id": "MHF4U-U5-L3",
              "title": "Multi-Representation Argument and Verification",
              "order": 1
            },
            {
              "key": "MHF4U-U5-L4",
              "id": "MHF4U-U5-L4",
              "title": "Synthesis, Error Diagnosis, and Examination Readiness",
              "order": 2
            }
          ],
          "learningFocus": [
            "Build a coherent decision argument across algebraic, graphical, numerical, and contextual representations.",
            "Diagnose errors, verify key results independently, communicate limitations, and defend the final recommendation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MHF4U-U5-L3: Multi-Representation Argument and Verification.",
            "Complete the representation-consistency audit and independent verification record.",
            "Student Coursebook Lesson MHF4U-U5-L4: Synthesis, Error Diagnosis, and Examination Readiness.",
            "Assessment Reading Library: Evidence File 5: Multi-Model Decision Dossier.",
            "Annotate decision criteria, competing models, required evidence, uncertainty, and defence prompts before final synthesis."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M10-RESOURCE-01",
              "title": "Active Prelude to Calculus",
              "provider": "Active Calculus / Grand Valley State University",
              "url": "https://activecalculus.org/prelude/book-1.html",
              "assignedUse": "Use selected activities to rehearse connecting algebraic, graphical, numerical, and verbal representations.",
              "order": 1
            },
            {
              "key": "MHF4U-M10-RESOURCE-02",
              "title": "Precalculus, 3rd Corrected Edition",
              "provider": "Stitz Zeager Open Source Mathematics",
              "url": "https://www.stitz-zeager.com/",
              "assignedUse": "Use one relevant chapter review to identify and correct two cumulative weaknesses before the defence.",
              "order": 2
            },
            {
              "key": "MHF4U-M10-RESOURCE-03",
              "title": "Khan Academy Precalculus",
              "provider": "Khan Academy",
              "url": "https://www.khanacademy.org/math/precalculus/precalculus",
              "assignedUse": "Complete only the mastery items assigned from the error log and submit the worked corrections, not a platform score alone.",
              "order": 3
            }
          ],
          "guidedPractice": "Assemble the claim-evidence-reasoning chain, cross-check a key result by a second method, stress-test the recommendation under one changed assumption, and rehearse a bounded mathematical defence.",
          "lowStakesCheck": "Assessment-readiness review on model selection, representation consistency, verification, sensitivity, source use, and defence responses.",
          "assessment": {
            "key": "MHF4U-M10-ASSESSMENT",
            "assignmentKey": "MHF4U-M10-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Advanced Functions Decision Dossier and Defence",
            "weightPercent": 15,
            "evidenceFile": "Evidence File 5: Multi-Model Decision Dossier",
            "sequence": [
              "Evidence-file annotation",
              "Claim and verification checkpoint",
              "Dossier draft and sensitivity test",
              "Teacher feedback",
              "Final dossier and oral or written-interactive defence",
              "Post-submission reflection"
            ],
            "taskType": "Integrated modelling dossier with oral or written-interactive defence",
            "processCheckpoints": [
              "Teacher approves the question, dataset, and candidate function families.",
              "Student submits raw calculations and a representation crosswalk.",
              "Student completes an authenticated conference on one exact and one numerical solution.",
              "Student revises the recommendation after peer or teacher challenge and records the change."
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MHF4U-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Advanced Functions Decision Dossier and Defence",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Teacher approves the question, dataset, and candidate function families.",
                  "Student submits raw calculations and a representation crosswalk.",
                  "Student completes an authenticated conference on one exact and one numerical solution.",
                  "Student revises the recommendation after peer or teacher challenge and records the change."
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MHF4U-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies model provenance, one independent check, and one limitation before final submission. Unlock Module 11 after the dossier, defence, and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 11.5,
          "workloadLabel": "11.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MHF4U-M11",
          "number": 11,
          "title": "Cumulative Synthesis and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Integrate exponential, logarithmic, trigonometric, polynomial, rational, inverse, and rate-of-change reasoning across unfamiliar contexts.",
            "Demonstrate independent, time-bounded algebraic, graphical, numerical, and written mathematical communication."
          ],
          "readingSteps": [
            "Review the five unit concept maps and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved problem set that requires function-family and method selection before calculation.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "MHF4U-M11-RESOURCE-01",
              "title": "CEMC Advanced Functions and Pre-Calculus Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/8",
              "assignedUse": "Use the correction log to select review lessons and complete problems without notes before checking explanations.",
              "order": 1
            },
            {
              "key": "MHF4U-M11-RESOURCE-02",
              "title": "Precalculus 2e, Chapter 3: Polynomial and Rational Functions",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/3-introduction-to-polynomial-and-rational-functions",
              "assignedUse": "Review only the polynomial or rational sections identified by the diagnostic and complete selected end-of-section problems.",
              "order": 2
            },
            {
              "key": "MHF4U-M11-RESOURCE-03",
              "title": "Precalculus 2e, Chapter 7: Trigonometric Identities and Equations",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/precalculus-2e/pages/7-introduction-to-trigonometric-identities-and-equations",
              "assignedUse": "Use selected identity and equation problems for timed retrieval practice; show complete reasoning before checking answers.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: identify the function family and constraints, choose a method, solve, verify in a second representation, interpret, and revise. Finish with a timed mock and teacher conference based on the error log.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "MHF4U-M11-ASSESSMENT",
            "assignmentKey": "MHF4U-M11-ASSIGNMENT",
            "assignmentKeys": [
              "MHF4U-M11-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "MHF4U Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": 150,
            "components": [
              {
                "key": "MHF4U-M11-C01",
                "componentKey": "m11-written-exam",
                "position": 1,
                "title": "MHF4U Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 25,
                "timeMinutes": 150,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "MHF4U-M11-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes model selection, algebra, representation, interpretation, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 2.5,
          "workloadLabel": "2.5 h supervised written examination",
          "teacherPresence": "Readiness confirmation, approved accommodations, identity check, supervision, and post-exam closure.",
          "evidenceToRetain": "Supervised examination script and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "MHF4U-M02-COURSEWORK",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M02",
          "moduleActivityKey": "MHF4U-M02-ASSESSMENT",
          "assignmentKey": "MHF4U-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Exponential and Logarithmic Model Audit",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Evidence File 1: Growth, Decay, and Threshold Model Casebook"
        },
        {
          "key": "MHF4U-M04-COURSEWORK",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M04",
          "moduleActivityKey": "MHF4U-M04-ASSESSMENT",
          "assignmentKey": "MHF4U-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Periodic Design and Trigonometric Reasoning Brief",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Evidence File 2: Periodic Systems Design Packet"
        },
        {
          "key": "MHF4U-M06-COURSEWORK",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M06",
          "moduleActivityKey": "MHF4U-M06-ASSESSMENT",
          "assignmentKey": "MHF4U-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "Polynomial and Rational Function Behaviour Investigation",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Evidence File 3: Function Behaviour and Constraint Case"
        },
        {
          "key": "MHF4U-M08-COURSEWORK",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M08",
          "moduleActivityKey": "MHF4U-M08-ASSESSMENT",
          "assignmentKey": "MHF4U-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "Function Operations and Rate-of-Change Portfolio",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Evidence File 4: Function Pipeline and Rate Audit"
        },
        {
          "key": "MHF4U-M10-COURSEWORK",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M10",
          "moduleActivityKey": "MHF4U-M10-ASSESSMENT",
          "assignmentKey": "MHF4U-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Advanced Functions Decision Dossier and Defence",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Evidence File 5: Multi-Model Decision Dossier"
        },
        {
          "key": "MHF4U-M11-WRITTEN-EXAM",
          "courseCode": "MHF4U",
          "moduleKey": "MHF4U-M11",
          "moduleActivityKey": "MHF4U-M11-ASSESSMENT",
          "assignmentKey": "MHF4U-M11-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "MHF4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "MHF4U-PARTICIPATION",
          "courseCode": "MHF4U",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 7,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    },
    {
      "code": "MCV4U",
      "title": "Calculus and Vectors",
      "department": "Mathematics",
      "grade": "12",
      "courseType": "University Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "Advanced Functions, Grade 12, University Preparation, which must be taken prior to or concurrently with this course",
      "description": "This course builds on students' previous experience with functions and their developing understanding of rates of change. Students will solve problems involving geometric and algebraic representations of vectors and representations of lines and planes in threedimensional space; broaden their understanding of rates of change to include the derivatives of polynomial, sinusoidal, exponential, rational, and radical functions; and apply these concepts and skills to the modelling of real-world relationships. Students will also refine their use of the mathematical processes necessary for success in senior mathematics. This course is intended for students who choose to pursue careers in fields such as science, engineering, economics, and some areas of business, including those students who will be required to take a university-level calculus, linear algebra, or physics course. Note: The new Advanced Functions course (MHF4U) must be taken prior to or concurrently with Calculus and Vectors (MCV4U).",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 11 and 12: Mathematics (Revised)",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with a retrieval check after each reading cluster.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 25,
        "culminatingTaskPercent": 0,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "MCV4U-M11-C01",
          "componentKey": "m11-written-exam",
          "position": 1,
          "title": "MCV4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "timeMinutes": 150,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "MCV4U-M00",
          "number": 0,
          "title": "Start Here: Learning Calculus and Vectors in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 25% mandatory written examination, 10% attendance and participation.",
            "Establish traceable practices for algebra, notation, diagrams, graphing-tool use, source citation, and mathematical verification."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, calculator and graphing-tool rules, and notation standards.",
            "Preview the five unit assessments and the MCV4U Mandatory Written Examination before beginning content."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, submit a sample derivative-and-vector solution record, and practise locating rubric feedback and resubmission instructions.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering advanced functions, algebra, transformations, trigonometry, function notation, coordinate geometry, and vector basics; students receive a targeted review list.",
          "assessment": {
            "key": "MCV4U-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Tool-Use, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Tool-use/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "MCV4U-M01",
          "number": 1,
          "title": "Secants, Limits, and Instantaneous Change",
          "unitNumber": 1,
          "unitTitle": "Rate of Change",
          "lessonIds": [
            "MCV4U-U1-L1",
            "MCV4U-U1-L2"
          ],
          "lessonTitles": [
            "Average Rate of Change and Secant Slopes",
            "Limits, Tangent Slopes, and Instantaneous Change"
          ],
          "lessons": [
            {
              "key": "MCV4U-U1-L1",
              "id": "MCV4U-U1-L1",
              "title": "Average Rate of Change and Secant Slopes",
              "order": 1
            },
            {
              "key": "MCV4U-U1-L2",
              "id": "MCV4U-U1-L2",
              "title": "Limits, Tangent Slopes, and Instantaneous Change",
              "order": 2
            }
          ],
          "learningFocus": [
            "Calculate and interpret average rate of change as a secant slope with meaningful units.",
            "Use limits of difference quotients to connect secants, tangents, and instantaneous rate of change."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U1-L1: Average Rate of Change and Secant Slopes.",
            "Complete the secant-slope retrieval set and interpret every rate in context.",
            "Student Coursebook Lesson MCV4U-U1-L2: Limits, Tangent Slopes, and Instantaneous Change.",
            "Complete a shrinking-interval table and difference-quotient reconstruction before opening the external resources."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M01-RESOURCE-01",
              "title": "Calculus Volume 1, Chapter 2: Limits",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-1/pages/2-introduction",
              "assignedUse": "Read the matching limit sections and reconstruct one numerical and one algebraic example without looking.",
              "order": 1
            },
            {
              "key": "MCV4U-M01-RESOURCE-02",
              "title": "Definition of the Derivative",
              "provider": "Ximera, The Ohio State University",
              "url": "https://ximera.osu.edu/mooculus/calculus1/definitionOfTheDerivative/titlePage",
              "assignedUse": "Complete the interactive sequence and summarize how the input increment, quotient, and limit have different roles.",
              "order": 2
            },
            {
              "key": "MCV4U-M01-RESOURCE-03",
              "title": "CEMC Calculus and Vectors Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/11?gid=31",
              "assignedUse": "Complete one teacher-selected rate-of-change lesson and record two corrected misconceptions in the course error log.",
              "order": 3
            }
          ],
          "guidedPractice": "Compute secant slopes from equations, tables, and graphs; build a shrinking-interval record; derive one tangent slope from first principles; and explain units and assumptions.",
          "lowStakesCheck": "Short mixed-representation check on secants, difference quotients, limits, tangent slopes, and contextual units with one correction attempt.",
          "assessment": {
            "key": "MCV4U-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Rate-of-Change Foundations Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Secant table",
              "Limit task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after both lesson checkpoints and one corrected difference-quotient solution are submitted. Teacher feedback targets notation, interval logic, and interpretation.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MCV4U-M02",
          "number": 2,
          "title": "Derivative Graphs, Rules, and Evidence",
          "unitNumber": 1,
          "unitTitle": "Rate of Change",
          "lessonIds": [
            "MCV4U-U1-L3",
            "MCV4U-U1-L4"
          ],
          "lessonTitles": [
            "Derivative Graphs and Function Behaviour",
            "Derivative Rules for Core Function Families"
          ],
          "lessons": [
            {
              "key": "MCV4U-U1-L3",
              "id": "MCV4U-U1-L3",
              "title": "Derivative Graphs and Function Behaviour",
              "order": 1
            },
            {
              "key": "MCV4U-U1-L4",
              "id": "MCV4U-U1-L4",
              "title": "Derivative Rules for Core Function Families",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect a function and its derivative through slopes, signs, critical inputs, and graphical behaviour.",
            "Apply and verify derivative rules for core function families and simple combinations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U1-L3: Derivative Graphs and Function Behaviour.",
            "Complete a function-to-derivative graph matching task with sign justifications.",
            "Student Coursebook Lesson MCV4U-U1-L4: Derivative Rules for Core Function Families.",
            "Assessment Reading Library: Evidence File 1: Secant, Tangent, and Derivative Records.",
            "Annotate variables, units, estimation intervals, derivative evidence, and required verification before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M02-RESOURCE-01",
              "title": "Calculus Volume 1, Chapter 3: Derivatives",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-1/pages/3-introduction",
              "assignedUse": "Read the matching derivative-rule sections and reconstruct two worked examples before checking.",
              "order": 1
            },
            {
              "key": "MCV4U-M02-RESOURCE-02",
              "title": "Essence of Calculus",
              "provider": "3Blue1Brown",
              "url": "https://www.3blue1brown.com/topics/calculus",
              "assignedUse": "Use the matching visual explanation to write a concise connection between local slope, derivative value, and derivative graph.",
              "order": 2
            },
            {
              "key": "MCV4U-M02-RESOURCE-03",
              "title": "Paul's Online Math Notes: Calculus I",
              "provider": "Paul Dawkins, Lamar University",
              "url": "https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx",
              "assignedUse": "Complete a bounded derivative-rule practice set and document every error before viewing solutions.",
              "order": 3
            }
          ],
          "guidedPractice": "Match function and derivative records, differentiate by rule and first principles where required, verify a derivative numerically or graphically, and interpret one rate in the evidence context.",
          "lowStakesCheck": "Assessment-readiness check on derivative graphs, core rules, notation, units, and independent verification, followed by a rubric self-check.",
          "assessment": {
            "key": "MCV4U-M02-ASSESSMENT",
            "assignmentKey": "MCV4U-M02-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Rate-of-Change Evidence Investigation",
            "weightPercent": 10,
            "evidenceFile": "Evidence File 1: Secant, Tangent, and Derivative Records",
            "sequence": [
              "Evidence-file annotation",
              "Secant and derivative checkpoint",
              "Investigation draft",
              "Teacher feedback",
              "Final mathematical investigation and authenticated problem defence",
              "Post-submission reflection"
            ],
            "taskType": "Mathematical investigation and authenticated problem defence",
            "processCheckpoints": [
              "Function and interval approval",
              "Difference-quotient reasoning conference",
              "Derivative-rule verification review",
              "Final graph and defence checkpoint"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MCV4U-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Rate-of-Change Evidence Investigation",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Function and interval approval",
                  "Difference-quotient reasoning conference",
                  "Derivative-rule verification review",
                  "Final graph and defence checkpoint"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MCV4U-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one limit or derivative pathway, one graphical connection, and one contextual interpretation before final submission. Unlock Module 3 after the assessment and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MCV4U-M03",
          "number": 3,
          "title": "Curve Analysis and Constrained Optimization",
          "unitNumber": 2,
          "unitTitle": "Derivatives and Their Applications",
          "lessonIds": [
            "MCV4U-U2-L1",
            "MCV4U-U2-L2"
          ],
          "lessonTitles": [
            "First and Second Derivatives in Curve Sketching",
            "Optimization with Defined Constraints"
          ],
          "lessons": [
            {
              "key": "MCV4U-U2-L1",
              "id": "MCV4U-U2-L1",
              "title": "First and Second Derivatives in Curve Sketching",
              "order": 1
            },
            {
              "key": "MCV4U-U2-L2",
              "id": "MCV4U-U2-L2",
              "title": "Optimization with Defined Constraints",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use first and second derivatives to analyse intervals, extrema, concavity, inflection, and curve shape.",
            "Build and solve constrained optimization models, then verify feasibility and global conclusions."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U2-L1: First and Second Derivatives in Curve Sketching.",
            "Complete the derivative-sign and concavity retrieval table before sketching.",
            "Student Coursebook Lesson MCV4U-U2-L2: Optimization with Defined Constraints.",
            "Complete the variable-constraint-objective checklist and endpoint verification for one model."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M03-RESOURCE-01",
              "title": "Calculus Volume 1, Chapter 4: Applications of Derivatives",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-1/pages/4-introduction",
              "assignedUse": "Read the matching curve-analysis and optimization sections and reconstruct one complete constrained example.",
              "order": 1
            },
            {
              "key": "MCV4U-M03-RESOURCE-02",
              "title": "Optimization",
              "provider": "Ximera, The Ohio State University",
              "url": "https://ximera.osu.edu/mooculus/calculus1/optimization/titlePage",
              "assignedUse": "Complete the interactive sequence and create a checklist that separates modelling decisions from derivative calculations.",
              "order": 2
            },
            {
              "key": "MCV4U-M03-RESOURCE-03",
              "title": "CEMC Calculus and Vectors Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/11?gid=31",
              "assignedUse": "Complete a teacher-selected derivatives application lesson and add one correction to the error log.",
              "order": 3
            }
          ],
          "guidedPractice": "Build a sign chart, sketch a curve from derivative evidence, translate a bounded situation into an objective and domain, locate critical and endpoint candidates, and interpret the optimum conditionally.",
          "lowStakesCheck": "Mixed short-answer check on critical inputs, derivative signs, concavity, feasible domains, candidate testing, and contextual interpretation.",
          "assessment": {
            "key": "MCV4U-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Curve Analysis and Optimization Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Sign-chart practice",
              "Optimization model",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after one curve-analysis record and one fully constrained optimization model are accepted. Teacher feedback flags endpoint, domain, and global-versus-local errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MCV4U-M04",
          "number": 4,
          "title": "Motion, Related Rates, and Model-Based Decisions",
          "unitNumber": 2,
          "unitTitle": "Derivatives and Their Applications",
          "lessonIds": [
            "MCV4U-U2-L3",
            "MCV4U-U2-L4"
          ],
          "lessonTitles": [
            "Motion, Velocity, and Acceleration Models",
            "Rates and Model-Based Decision Problems"
          ],
          "lessons": [
            {
              "key": "MCV4U-U2-L3",
              "id": "MCV4U-U2-L3",
              "title": "Motion, Velocity, and Acceleration Models",
              "order": 1
            },
            {
              "key": "MCV4U-U2-L4",
              "id": "MCV4U-U2-L4",
              "title": "Rates and Model-Based Decision Problems",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect position, velocity, acceleration, rest, direction, and displacement through derivative evidence.",
            "Use marginal or related rates in bounded decisions while maintaining units, assumptions, and model limits."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U2-L3: Motion, Velocity, and Acceleration Models.",
            "Complete a motion-state table from symbolic and graphical evidence.",
            "Student Coursebook Lesson MCV4U-U2-L4: Rates and Model-Based Decision Problems.",
            "Assessment Reading Library: Evidence File 2: Optimization, Motion, and Marginal Decisions.",
            "Annotate constraints, units, rate definitions, decision criteria, and required verification before assembling the portfolio."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M04-RESOURCE-01",
              "title": "CLP-1 Differential Calculus",
              "provider": "University of British Columbia OER Collection",
              "url": "https://oer.open.ubc.ca/clp-1-differential-calculus/",
              "assignedUse": "Use one teacher-selected application problem for retrieval practice and compare its reasoning sequence with the Coursebook.",
              "order": 1
            },
            {
              "key": "MCV4U-M04-RESOURCE-02",
              "title": "Differentiation Topic Collection",
              "provider": "mathcentre, UK higher-education mathematics support consortium",
              "url": "https://www.mathcentre.ac.uk/students/topics/differentiation",
              "assignedUse": "Complete only the motion, rates, or application topic identified by the correction log and retain worked solutions.",
              "order": 2
            },
            {
              "key": "MCV4U-M04-RESOURCE-03",
              "title": "Differential Calculus",
              "provider": "Khan Academy",
              "url": "https://www.khanacademy.org/math/calculus/differential-calculus",
              "assignedUse": "Complete assigned application items and submit worked corrections rather than a platform score alone.",
              "order": 3
            }
          ],
          "guidedPractice": "Analyse a complete motion interval, distinguish speed from velocity, solve a rate or marginal decision with units, compare candidate actions, and test one result against original constraints.",
          "lowStakesCheck": "Assessment-readiness check on derivative relationships, motion signs, optimization, marginal interpretation, units, constraints, and reasonableness.",
          "assessment": {
            "key": "MCV4U-M04-ASSESSMENT",
            "assignmentKey": "MCV4U-M04-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Derivative Application Decision Portfolio",
            "weightPercent": 12,
            "evidenceFile": "Evidence File 2: Optimization, Motion, and Marginal Decisions",
            "sequence": [
              "Evidence-file annotation",
              "Curve/motion checkpoint",
              "Optimization and marginal draft",
              "Teacher feedback",
              "Final curve-analysis, optimization, and motion portfolio",
              "Post-submission reflection"
            ],
            "taskType": "Curve-analysis, optimization, and motion portfolio",
            "processCheckpoints": [
              "Problem-model approval",
              "Critical-candidate and sign-chart check",
              "Context and sensitivity conference",
              "Final authenticated explanation"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MCV4U-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Derivative Application Decision Portfolio",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Problem-model approval",
                  "Critical-candidate and sign-chart check",
                  "Context and sensitivity conference",
                  "Final authenticated explanation"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MCV4U-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks one derivative sign analysis, one constrained optimum, and one rate interpretation before final submission. Unlock Module 5 after the portfolio and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MCV4U-M05",
          "number": 5,
          "title": "Vectors, Components, and Linear Combinations",
          "unitNumber": 3,
          "unitTitle": "Geometry and Algebra of Vectors",
          "lessonIds": [
            "MCV4U-U3-L1",
            "MCV4U-U3-L2"
          ],
          "lessonTitles": [
            "Vectors in Two-Space and Three-Space",
            "Vector Operations and Linear Combinations"
          ],
          "lessons": [
            {
              "key": "MCV4U-U3-L1",
              "id": "MCV4U-U3-L1",
              "title": "Vectors in Two-Space and Three-Space",
              "order": 1
            },
            {
              "key": "MCV4U-U3-L2",
              "id": "MCV4U-U3-L2",
              "title": "Vector Operations and Linear Combinations",
              "order": 2
            }
          ],
          "learningFocus": [
            "Represent vectors geometrically and algebraically in two-space and three-space with defined coordinate conventions.",
            "Perform vector operations and linear combinations to model displacement, force, and other directed quantities."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U3-L1: Vectors in Two-Space and Three-Space.",
            "Complete a representation-conversion and magnitude retrieval set.",
            "Student Coursebook Lesson MCV4U-U3-L2: Vector Operations and Linear Combinations.",
            "Complete a component audit with labelled axes, units, and resultant checks."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M05-RESOURCE-01",
              "title": "Calculus Volume 3, Chapter 2: Vectors in Space",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-3/pages/2-introduction",
              "assignedUse": "Read the matching vector sections and reconstruct one two-dimensional and one three-dimensional example.",
              "order": 1
            },
            {
              "key": "MCV4U-M05-RESOURCE-02",
              "title": "PhET Vector Addition",
              "provider": "PhET Interactive Simulations, University of Colorado Boulder",
              "url": "https://phet.colorado.edu/en/simulations/vector-addition",
              "assignedUse": "Predict three resultants before testing, then reconcile graphical and component results.",
              "order": 2
            },
            {
              "key": "MCV4U-M05-RESOURCE-03",
              "title": "Vectors",
              "provider": "Ximera, The Ohio State University",
              "url": "https://ximera.osu.edu/mooculus/calculus2/vectors/titlePage",
              "assignedUse": "Complete selected vector representation and operation items and record one corrected misconception.",
              "order": 3
            }
          ],
          "guidedPractice": "Convert points and directed segments to vectors, normalize vectors, resolve and combine components, and verify a resultant graphically and algebraically under stated coordinate conventions.",
          "lowStakesCheck": "Short check on notation, components, magnitude, unit vectors, scalar multiplication, addition, and contextual interpretation with corrections.",
          "assessment": {
            "key": "MCV4U-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Vector Representation and Operations Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Representation practice",
              "Simulation task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after one two-space and one three-space model are verified. Teacher feedback targets orientation, components, units, and geometric-algebraic consistency.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MCV4U-M06",
          "number": 6,
          "title": "Dot Products, Cross Products, and Spatial Decisions",
          "unitNumber": 3,
          "unitTitle": "Geometry and Algebra of Vectors",
          "lessonIds": [
            "MCV4U-U3-L3",
            "MCV4U-U3-L4"
          ],
          "lessonTitles": [
            "Dot Product, Angles, and Projections",
            "Cross Product, Normals, Area, and Torque"
          ],
          "lessons": [
            {
              "key": "MCV4U-U3-L3",
              "id": "MCV4U-U3-L3",
              "title": "Dot Product, Angles, and Projections",
              "order": 1
            },
            {
              "key": "MCV4U-U3-L4",
              "id": "MCV4U-U3-L4",
              "title": "Cross Product, Normals, Area, and Torque",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use dot products to determine angles, perpendicularity, scalar projections, and context-specific components.",
            "Use cross products to determine orientation, normals, area, and torque while explaining order and units."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U3-L3: Dot Product, Angles, and Projections.",
            "Complete a projection diagram and angle calculation with an independent reasonableness check.",
            "Student Coursebook Lesson MCV4U-U3-L4: Cross Product, Normals, Area, and Torque.",
            "Assessment Reading Library: Evidence File 3: Vector Components, Products, and Orientation.",
            "Annotate axes, units, orientation rules, operation choices, and required visual evidence before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M06-RESOURCE-01",
              "title": "Dot Product as Projection Applet",
              "provider": "Math Insight, University of Minnesota",
              "url": "https://mathinsight.org/applet/dot_product_projection",
              "assignedUse": "Predict and test projection length and sign for selected vector pairs, then write the corresponding component interpretation.",
              "order": 1
            },
            {
              "key": "MCV4U-M06-RESOURCE-02",
              "title": "CLP-3 Multivariable Calculus: Vectors and Geometry",
              "provider": "University of British Columbia OER Collection",
              "url": "https://oer.open.ubc.ca/clp-3-multivariable-calculus/",
              "assignedUse": "Use one matching dot- or cross-product problem for independent practice before viewing the solution.",
              "order": 2
            },
            {
              "key": "MCV4U-M06-RESOURCE-03",
              "title": "GeoGebra 3D Calculator",
              "provider": "GeoGebra",
              "url": "https://www.geogebra.org/3d",
              "assignedUse": "Construct the evidence-file vectors and normals, then preserve labelled views that verify rather than replace calculations.",
              "order": 3
            }
          ],
          "guidedPractice": "Choose between dot and cross products from the question meaning, calculate and verify angle/projection/normal/area results, test orientation by order reversal, and explain one real-world decision.",
          "lowStakesCheck": "Assessment-readiness check on product choice, angles, projections, perpendicularity, orientation, normals, area or torque, units, and visual verification.",
          "assessment": {
            "key": "MCV4U-M06-ASSESSMENT",
            "assignmentKey": "MCV4U-M06-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Three-Space Vector Operations Case File",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 3: Vector Components, Products, and Orientation",
            "sequence": [
              "Evidence-file annotation",
              "Vector-operation checkpoint",
              "Computation and visual draft",
              "Teacher feedback",
              "Final vector case file and explanation",
              "Post-submission reflection"
            ],
            "taskType": "Vector modelling, computation, and visual explanation",
            "processCheckpoints": [
              "Coordinate-frame approval",
              "Component and magnitude verification",
              "Dot/cross orientation conference",
              "Final case-file defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MCV4U-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "Three-Space Vector Operations Case File",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Coordinate-frame approval",
                  "Component and magnitude verification",
                  "Dot/cross orientation conference",
                  "Final case-file defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MCV4U-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one operation choice, one product calculation, and one geometric interpretation before final submission. Unlock Module 7 after the case file and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MCV4U-M07",
          "number": 7,
          "title": "Representing Lines and Planes in Three-Space",
          "unitNumber": 4,
          "unitTitle": "Integrated Calculus and Vectors Applications",
          "lessonIds": [
            "MCV4U-U4-L1",
            "MCV4U-U4-L2"
          ],
          "lessonTitles": [
            "Vector and Parametric Equations of Lines",
            "Scalar and Vector Equations of Planes"
          ],
          "lessons": [
            {
              "key": "MCV4U-U4-L1",
              "id": "MCV4U-U4-L1",
              "title": "Vector and Parametric Equations of Lines",
              "order": 1
            },
            {
              "key": "MCV4U-U4-L2",
              "id": "MCV4U-U4-L2",
              "title": "Scalar and Vector Equations of Planes",
              "order": 2
            }
          ],
          "learningFocus": [
            "Construct and interpret vector and parametric equations of lines from points, directions, and context.",
            "Construct and convert scalar or vector equations of planes from points, directions, and normals."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U4-L1: Vector and Parametric Equations of Lines.",
            "Complete a data-to-line and line-to-data retrieval set.",
            "Student Coursebook Lesson MCV4U-U4-L2: Scalar and Vector Equations of Planes.",
            "Complete a plane-representation conversion table and verify point membership."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M07-RESOURCE-01",
              "title": "Calculus Volume 3, Section 2.5: Equations of Lines and Planes in Space",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-3/pages/2-5-equations-of-lines-and-planes-in-space",
              "assignedUse": "Read the matching sections and reconstruct one line and one plane example with defined parameters.",
              "order": 1
            },
            {
              "key": "MCV4U-M07-RESOURCE-02",
              "title": "GeoGebra 3D Calculator",
              "provider": "GeoGebra",
              "url": "https://www.geogebra.org/3d",
              "assignedUse": "Build a line-and-plane view and document how changes to a direction or normal alter the geometry.",
              "order": 2
            },
            {
              "key": "MCV4U-M07-RESOURCE-03",
              "title": "CLP-3 Multivariable Calculus: Vectors and Geometry",
              "provider": "University of British Columbia OER Collection",
              "url": "https://oer.open.ubc.ca/clp-3-multivariable-calculus/",
              "assignedUse": "Use one relevant vector-geometry section to reinforce representation conversion and point-membership checks.",
              "order": 3
            }
          ],
          "guidedPractice": "Construct lines and planes from multiple data forms, convert between equations, test membership, identify non-unique representations of the same object, and verify results with a labelled 3D view.",
          "lowStakesCheck": "Short check on line directions, plane normals, parameters, conversions, point membership, and geometric interpretation with corrections.",
          "assessment": {
            "key": "MCV4U-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Lines and Planes Representation Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Representation conversion",
              "3D construction",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after one line and one plane are represented and independently verified. Teacher feedback prioritizes direction/normal logic and parameter meaning.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MCV4U-M08",
          "number": 8,
          "title": "Intersections, Configurations, Distances, and Angles",
          "unitNumber": 4,
          "unitTitle": "Integrated Calculus and Vectors Applications",
          "lessonIds": [
            "MCV4U-U4-L3",
            "MCV4U-U4-L4"
          ],
          "lessonTitles": [
            "Intersections and Configurations of Lines and Planes",
            "Distances and Angles in Three-Space"
          ],
          "lessons": [
            {
              "key": "MCV4U-U4-L3",
              "id": "MCV4U-U4-L3",
              "title": "Intersections and Configurations of Lines and Planes",
              "order": 1
            },
            {
              "key": "MCV4U-U4-L4",
              "id": "MCV4U-U4-L4",
              "title": "Distances and Angles in Three-Space",
              "order": 2
            }
          ],
          "learningFocus": [
            "Classify and solve intersections or configurations of lines and planes using algebraic and geometric evidence.",
            "Calculate distances and angles in three-space and use them in a bounded spatial decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U4-L3: Intersections and Configurations of Lines and Planes.",
            "Complete the configuration decision tree and verify one intersection in all original equations.",
            "Student Coursebook Lesson MCV4U-U4-L4: Distances and Angles in Three-Space.",
            "Assessment Reading Library: Evidence File 4: Line, Plane, Distance, and Boundary Cases.",
            "Annotate coordinate conventions, constraints, boundary cases, tolerances, and required verifications before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M08-RESOURCE-01",
              "title": "GeoGebra 3D Calculator",
              "provider": "GeoGebra",
              "url": "https://www.geogebra.org/3d",
              "assignedUse": "Visualize each candidate configuration and preserve labelled views that test the algebraic classification.",
              "order": 1
            },
            {
              "key": "MCV4U-M08-RESOURCE-02",
              "title": "Calculus Volume 3, Chapter 2: Vectors in Space",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-3/pages/2-introduction",
              "assignedUse": "Read the matching lines, planes, distances, or angles section and reconstruct one complete example.",
              "order": 2
            },
            {
              "key": "MCV4U-M08-RESOURCE-03",
              "title": "Calculus Volume 3, Section 2.5: Equations of Lines and Planes in Space",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-3/pages/2-5-equations-of-lines-and-planes-in-space",
              "assignedUse": "Complete one bounded lines-or-planes problem and compare its classification method with the Coursebook decision tree.",
              "order": 3
            }
          ],
          "guidedPractice": "Solve and classify line/plane systems, test substituted points, calculate a distance and angle with normalized formulas, visualize boundary cases, and defend the feasible spatial option.",
          "lowStakesCheck": "Assessment-readiness check on configurations, system consistency, intersections, distance formulas, angles, tolerances, and boundary interpretation.",
          "assessment": {
            "key": "MCV4U-M08-ASSESSMENT",
            "assignmentKey": "MCV4U-M08-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Lines, Planes, and Spatial Constraint Investigation",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 4: Line, Plane, Distance, and Boundary Cases",
            "sequence": [
              "Evidence-file annotation",
              "Configuration and distance checkpoint",
              "Three-dimensional investigation draft",
              "Teacher feedback",
              "Final investigation and bounded-context decision",
              "Post-submission reflection"
            ],
            "taskType": "Three-dimensional geometry investigation and bounded-context decision",
            "processCheckpoints": [
              "Geometry and bounds approval",
              "Equation-construction review",
              "Configuration and substitution conference",
              "Final spatial recommendation defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MCV4U-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "Lines, Planes, and Spatial Constraint Investigation",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Geometry and bounds approval",
                  "Equation-construction review",
                  "Configuration and substitution conference",
                  "Final spatial recommendation defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MCV4U-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies one classification, one substituted intersection or distance, and one boundary/tolerance statement before final submission. Unlock Module 9 after the assessment and reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MCV4U-M09",
          "number": 9,
          "title": "Calculus and Vector Model Selection",
          "unitNumber": 5,
          "unitTitle": "Culminating Calculus and Vectors Inquiry and Communication",
          "lessonIds": [
            "MCV4U-U5-L1",
            "MCV4U-U5-L2"
          ],
          "lessonTitles": [
            "Calculus Model Selection and Evidence",
            "Vector Modelling of Paths, Forces, and Constraints"
          ],
          "lessons": [
            {
              "key": "MCV4U-U5-L1",
              "id": "MCV4U-U5-L1",
              "title": "Calculus Model Selection and Evidence",
              "order": 1
            },
            {
              "key": "MCV4U-U5-L2",
              "id": "MCV4U-U5-L2",
              "title": "Vector Modelling of Paths, Forces, and Constraints",
              "order": 2
            }
          ],
          "learningFocus": [
            "Select and justify a calculus model using variables, domains, units, derivative evidence, and decision constraints.",
            "Construct a compatible vector model with explicit origin, axes, orientation, parameters, forces, paths, or boundaries."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U5-L1: Calculus Model Selection and Evidence.",
            "Complete a calculus-model screening and source-provenance record.",
            "Student Coursebook Lesson MCV4U-U5-L2: Vector Modelling of Paths, Forces, and Constraints.",
            "Complete a coordinate-frame and compatibility audit before combining the models."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M09-RESOURCE-01",
              "title": "CEMC Calculus and Vectors Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/11?gid=31",
              "assignedUse": "Use selected calculus and vector lessons to review the exact weaknesses recorded in the cumulative error log.",
              "order": 1
            },
            {
              "key": "MCV4U-M09-RESOURCE-02",
              "title": "CLP-1 Differential Calculus",
              "provider": "University of British Columbia OER Collection",
              "url": "https://oer.open.ubc.ca/clp-1-differential-calculus/",
              "assignedUse": "Use one matching calculus section to verify the derivative model and its constraints.",
              "order": 2
            },
            {
              "key": "MCV4U-M09-RESOURCE-03",
              "title": "CLP-3 Multivariable Calculus: Vectors and Geometry",
              "provider": "University of British Columbia OER Collection",
              "url": "https://oer.open.ubc.ca/clp-3-multivariable-calculus/",
              "assignedUse": "Use one matching vector-geometry section to verify the coordinate system, vector operations, and spatial constraints.",
              "order": 3
            }
          ],
          "guidedPractice": "Screen candidate calculus and vector models, trace all input data, define a compatible coordinate and parameter system, test units and domains, and write a provisional integrated claim with a limitation.",
          "lowStakesCheck": "Model-readiness conference artifact covering source provenance, variables, units, domains, coordinate frame, parameter scale, constraints, and verification plan.",
          "assessment": {
            "key": "MCV4U-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Integrated Model Evidence Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Calculus model screen",
              "Vector model screen",
              "Teacher conference",
              "Revision plan"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after the calculus model, vector model, source record, compatibility audit, and revision plan are accepted. Teacher feedback targets model sufficiency and cross-model consistency.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "MCV4U-M10",
          "number": 10,
          "title": "Integrated Decision Study, Error Diagnosis, and Defence",
          "unitNumber": 5,
          "unitTitle": "Culminating Calculus and Vectors Inquiry and Communication",
          "lessonIds": [
            "MCV4U-U5-L3",
            "MCV4U-U5-L4"
          ],
          "lessonTitles": [
            "Integrated Calculus and Vector Decision Study",
            "Synthesis, Error Diagnosis, and Mathematical Defence"
          ],
          "lessons": [
            {
              "key": "MCV4U-U5-L3",
              "id": "MCV4U-U5-L3",
              "title": "Integrated Calculus and Vector Decision Study",
              "order": 1
            },
            {
              "key": "MCV4U-U5-L4",
              "id": "MCV4U-U5-L4",
              "title": "Synthesis, Error Diagnosis, and Mathematical Defence",
              "order": 2
            }
          ],
          "learningFocus": [
            "Integrate calculus and vector evidence into a bounded decision without losing domain, unit, coordinate, or parameter meaning.",
            "Diagnose errors, verify decisive results independently, communicate uncertainty, and defend the final recommendation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson MCV4U-U5-L3: Integrated Calculus and Vector Decision Study.",
            "Complete the cross-model substitution, units, and constraint audit.",
            "Student Coursebook Lesson MCV4U-U5-L4: Synthesis, Error Diagnosis, and Mathematical Defence.",
            "Assessment Reading Library: Evidence File 5: Integrated Model, Sensitivity, and Defence.",
            "Annotate decision criteria, model interfaces, sensitivity variables, evidence limits, and defence prompts before final synthesis."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M10-RESOURCE-01",
              "title": "Active Calculus Single Variable, Second Edition",
              "provider": "Active Calculus / Grand Valley State University",
              "url": "https://activecalculus.org/acs2e/",
              "assignedUse": "Use selected activities to rehearse interpreting derivative evidence and checking model assumptions.",
              "order": 1
            },
            {
              "key": "MCV4U-M10-RESOURCE-02",
              "title": "APEX Calculus",
              "provider": "APEX Calculus consortium",
              "url": "https://www.apexcalculus.com/home",
              "assignedUse": "Use relevant review problems to verify one calculus and one vector weakness before the defence.",
              "order": 2
            },
            {
              "key": "MCV4U-M10-RESOURCE-03",
              "title": "CEMC Calculus and Vectors Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/11?gid=31",
              "assignedUse": "Complete a teacher-selected integrated problem and preserve a full correction and verification record.",
              "order": 3
            }
          ],
          "guidedPractice": "Assemble the integrated claim-evidence-reasoning chain, verify one derivative and one spatial result by independent methods, change one sensitive assumption, and rehearse a bounded mathematical defence.",
          "lowStakesCheck": "Assessment-readiness review on model compatibility, calculus and vector calculations, units, coordinate conventions, sensitivity, source use, and defence responses.",
          "assessment": {
            "key": "MCV4U-M10-ASSESSMENT",
            "assignmentKey": "MCV4U-M10-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Calculus and Vectors Integrated Decision Dossier",
            "weightPercent": 15,
            "evidenceFile": "Evidence File 5: Integrated Model, Sensitivity, and Defence",
            "sequence": [
              "Evidence-file annotation",
              "Cross-model and verification checkpoint",
              "Integrated dossier draft and sensitivity test",
              "Teacher feedback",
              "Final synthesis dossier and mathematical defence",
              "Post-submission reflection"
            ],
            "taskType": "Culminating synthesis dossier and mathematical defence",
            "processCheckpoints": [
              "Scope, sources, and model approval",
              "Calculus evidence conference",
              "Vector geometry and alignment review",
              "Final dossier and independent defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "MCV4U-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Calculus and Vectors Integrated Decision Dossier",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Scope, sources, and model approval",
                  "Calculus evidence conference",
                  "Vector geometry and alignment review",
                  "Final dossier and independent defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "MCV4U-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher verifies model compatibility, one independent calculus check, one independent vector check, and one limitation before final submission. Unlock Module 11 after the dossier, defence, and feedback-use reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 11.5,
          "workloadLabel": "11.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "MCV4U-M11",
          "number": 11,
          "title": "Cumulative Synthesis and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Integrate rate-of-change, derivative-application, vector-operation, and three-space reasoning across unfamiliar contexts.",
            "Demonstrate independent, time-bounded algebraic, graphical, diagrammatic, numerical, and written mathematical communication."
          ],
          "readingSteps": [
            "Review the five unit concept maps and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved problem set that requires model, representation, and method selection before calculation.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "MCV4U-M11-RESOURCE-01",
              "title": "CEMC Calculus and Vectors Courseware",
              "provider": "University of Waterloo, Centre for Education in Mathematics and Computing",
              "url": "https://courseware.cemc.uwaterloo.ca/11?gid=31",
              "assignedUse": "Use the correction log to select review lessons and complete problems without notes before checking explanations.",
              "order": 1
            },
            {
              "key": "MCV4U-M11-RESOURCE-02",
              "title": "Calculus Volume 1, Chapter 3: Derivatives",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-1/pages/3-introduction",
              "assignedUse": "Review only the derivative sections identified by the diagnostic and complete selected end-of-section problems.",
              "order": 2
            },
            {
              "key": "MCV4U-M11-RESOURCE-03",
              "title": "Calculus Volume 3, Chapter 2: Vectors in Space",
              "provider": "OpenStax, Rice University",
              "url": "https://openstax.org/books/calculus-volume-3/pages/2-introduction",
              "assignedUse": "Review only the vector and three-space sections identified by the correction log, then complete selected problems without notes.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: identify the governing model and coordinate frame, choose a method, solve, verify in a second representation, interpret, and revise. Finish with a timed mock and teacher conference based on the error log.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "MCV4U-M11-ASSESSMENT",
            "assignmentKey": "MCV4U-M11-ASSIGNMENT",
            "assignmentKeys": [
              "MCV4U-M11-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "MCV4U Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": 150,
            "components": [
              {
                "key": "MCV4U-M11-C01",
                "componentKey": "m11-written-exam",
                "position": 1,
                "title": "MCV4U Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 25,
                "timeMinutes": 150,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "MCV4U-M11-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes model selection, calculus, vectors, representation, interpretation, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 2.5,
          "workloadLabel": "2.5 h supervised written examination",
          "teacherPresence": "Readiness confirmation, approved accommodations, identity check, supervision, and post-exam closure.",
          "evidenceToRetain": "Supervised examination script and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "MCV4U-M02-COURSEWORK",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M02",
          "moduleActivityKey": "MCV4U-M02-ASSESSMENT",
          "assignmentKey": "MCV4U-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Rate-of-Change Evidence Investigation",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Evidence File 1: Secant, Tangent, and Derivative Records"
        },
        {
          "key": "MCV4U-M04-COURSEWORK",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M04",
          "moduleActivityKey": "MCV4U-M04-ASSESSMENT",
          "assignmentKey": "MCV4U-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Derivative Application Decision Portfolio",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Evidence File 2: Optimization, Motion, and Marginal Decisions"
        },
        {
          "key": "MCV4U-M06-COURSEWORK",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M06",
          "moduleActivityKey": "MCV4U-M06-ASSESSMENT",
          "assignmentKey": "MCV4U-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "Three-Space Vector Operations Case File",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Evidence File 3: Vector Components, Products, and Orientation"
        },
        {
          "key": "MCV4U-M08-COURSEWORK",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M08",
          "moduleActivityKey": "MCV4U-M08-ASSESSMENT",
          "assignmentKey": "MCV4U-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "Lines, Planes, and Spatial Constraint Investigation",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Evidence File 4: Line, Plane, Distance, and Boundary Cases"
        },
        {
          "key": "MCV4U-M10-COURSEWORK",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M10",
          "moduleActivityKey": "MCV4U-M10-ASSESSMENT",
          "assignmentKey": "MCV4U-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Calculus and Vectors Integrated Decision Dossier",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Evidence File 5: Integrated Model, Sensitivity, and Defence"
        },
        {
          "key": "MCV4U-M11-WRITTEN-EXAM",
          "courseCode": "MCV4U",
          "moduleKey": "MCV4U-M11",
          "moduleActivityKey": "MCV4U-M11-ASSESSMENT",
          "assignmentKey": "MCV4U-M11-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "MCV4U Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 25,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "MCV4U-PARTICIPATION",
          "courseCode": "MCV4U",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 7,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    },
    {
      "code": "BBB4M",
      "title": "International Business Fundamentals",
      "department": "Business Studies",
      "grade": "12",
      "courseType": "University/College Preparation",
      "credit": "1.0",
      "hours": 110,
      "prerequisite": "None",
      "description": "This course provides an overview of the importance of international business and trade in the global economy and explores the factors that influence success in international markets. Students will learn about the techniques and strategies associated with marketing, distribution, and managing international business effectively. This course prepares students for postsecondary programs in business, including international business, marketing, and management.",
      "curriculum": {
        "title": "The Ontario Curriculum, Grades 11 and 12: Business Studies",
        "url": "https://www.dcp.edu.gov.on.ca/en/curriculum"
      },
      "implementationNote": "Independent Lotus Academy platform sequence informed by modular online-course design practices. It does not change the approved course content, 110-hour allocation, or grading structure.",
      "platformSequenceRules": [
        "Each instructional module opens with an overview, learning targets, estimated effort, and a connection to the unit assessment.",
        "Students complete the two Coursebook lessons in order, with an evidence-status, vocabulary, calculation, or decision check after each reading cluster.",
        "One to three existing self-study resources are assigned only after the matching core reading and are accompanied by a bounded student task.",
        "A guided application and low-stakes check precede each graded assessment; first attempts are used for feedback, not as additional course-weighted grades.",
        "The assessment evidence file appears only in the second module of each unit, immediately before the staged unit task.",
        "A teacher may override a prerequisite gate for an accommodation, technical barrier, or documented alternative pathway."
      ],
      "assessmentFramework": {
        "courseworkPercent": 65,
        "writtenExamPercent": 15,
        "culminatingTaskPercent": 10,
        "participationPercent": 10,
        "finalEvaluationPercent": 25,
        "gradedCourseworkModules": [
          2,
          4,
          6,
          8,
          10
        ],
        "participationEvidence": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
      },
      "finalEvaluationComponents": [
        {
          "key": "BBB4M-M11-C01",
          "componentKey": "m11-culminating",
          "position": 1,
          "title": "BBB4M Culminating Performance and Defence",
          "type": "Culminating performance and defence",
          "weightPercent": 10,
          "timeMinutes": 120,
          "processCheckpoints": [
            "Scope, evidence, and integrity conference",
            "Interim artefact and source-trail review",
            "Testing, analysis, or feasibility checkpoint",
            "Final submission and authenticated individual defence"
          ],
          "submissionMode": "project"
        },
        {
          "key": "BBB4M-M11-C02",
          "componentKey": "m11-written-exam",
          "position": 2,
          "title": "BBB4M Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 15,
          "timeMinutes": 90,
          "processCheckpoints": [],
          "submissionMode": "supervised"
        }
      ],
      "modules": [
        {
          "key": "BBB4M-M00",
          "number": 0,
          "title": "Start Here: Learning International Business in the Lotus Platform",
          "unitNumber": null,
          "unitTitle": "Course Orientation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Navigate the course, locate feedback and due dates, and explain the approved grade structure: 65% coursework, 10% culminating performance and defence, 15% mandatory written examination, 10% attendance and participation.",
            "Distinguish stable fictional assessment evidence, current official context, textbook concepts, calculations, assumptions, and student recommendations."
          ],
          "readingSteps": [
            "Read the course welcome, navigation guide, communication routines, and accessibility/support information.",
            "Read the assessment overview, academic-integrity expectations, source-evaluation rules, and the required labels for evidence status, assumptions, and limitations.",
            "Preview the five unit assessments and the BBB4M Mandatory Written Examination before beginning content.",
            "Preview BBB4M Culminating Performance and Defence and its staged authenticated defence checkpoints."
          ],
          "selfStudyResources": [],
          "guidedPractice": "Complete a navigation scavenger hunt, classify a short set of claims as fictional case data, current official context, concept, calculation, assumption, or decision, and practise finding rubric feedback.",
          "lowStakesCheck": "Ungraded prerequisite diagnostic covering business vocabulary, percentages, exchange-rate reasoning, charts, source status, claim-evidence-reasoning, and stakeholder analysis; students receive a targeted review list.",
          "assessment": {
            "key": "BBB4M-M00-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "orientation",
            "type": "Orientation evidence",
            "title": "Orientation, Evidence-Use, and Academic-Integrity Acknowledgement",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Navigation check",
              "Diagnostic",
              "Evidence/integrity acknowledgement"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher or automated feedback identifies prerequisite gaps. Unlock Module 1 after the navigation check and acknowledgement are complete; diagnostic score does not restrict entry.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 0,
          "workloadLabel": "1–2 h onboarding; not automatically recorded as credit time",
          "teacherPresence": "Welcome message, diagnostic response, support routing, and navigation confirmation.",
          "evidenceToRetain": "Navigation check, diagnostic record, and safety/integrity acknowledgement."
        },
        {
          "key": "BBB4M-M01",
          "number": 1,
          "title": "International Business Language and Comparative Advantage",
          "unitNumber": 1,
          "unitTitle": "Business, Trade, and the Economy",
          "lessonIds": [
            "BBB4M-U1-L1",
            "BBB4M-U1-L2"
          ],
          "lessonTitles": [
            "International Business Vocabulary and Evidence-Based Communication",
            "Specialization, Comparative Advantage, and Opportunity Cost"
          ],
          "lessons": [
            {
              "key": "BBB4M-U1-L1",
              "id": "BBB4M-U1-L1",
              "title": "International Business Vocabulary and Evidence-Based Communication",
              "order": 1
            },
            {
              "key": "BBB4M-U1-L2",
              "id": "BBB4M-U1-L2",
              "title": "Specialization, Comparative Advantage, and Opportunity Cost",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use international-business vocabulary and evidence labels precisely in a bounded decision.",
            "Calculate opportunity cost and use comparative advantage without confusing it with absolute advantage or a complete policy recommendation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U1-L1: International Business Vocabulary and Evidence-Based Communication.",
            "Complete the terminology and evidence-status table, including scope and limitation columns.",
            "Student Coursebook Lesson BBB4M-U1-L2: Specialization, Comparative Advantage, and Opportunity Cost.",
            "Complete the two-economy opportunity-cost calculation and explain what the model can and cannot decide."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M01-RESOURCE-01",
              "title": "International Business",
              "provider": "University of Minnesota Libraries Publishing",
              "url": "https://open.lib.umn.edu/internationalbusiness/",
              "assignedUse": "Read selected introductory and trade sections, add concepts to an evidence-tagged notebook, and transfer one principle to a fictional Canadian firm.",
              "order": 1
            },
            {
              "key": "BBB4M-M01-RESOURCE-02",
              "title": "Understanding the WTO",
              "provider": "World Trade Organization",
              "url": "https://www.wto.org/english/res_e/publications_e/understanding_wto_e.htm",
              "assignedUse": "Map four core trade principles and apply two to a fictional dispute while identifying one question requiring specialist advice.",
              "order": 2
            },
            {
              "key": "BBB4M-M01-RESOURCE-03",
              "title": "globalEDGE Online Course Modules",
              "provider": "Michigan State University International Business Center",
              "url": "https://globaledge.msu.edu/global-resources/online-course-modules",
              "assignedUse": "Complete one matching module, create an original ten-term glossary, correct quiz errors with evidence, and transfer the learning to the unit case.",
              "order": 3
            }
          ],
          "guidedPractice": "Classify business claims by evidence status, calculate opportunity costs for two fictional economies, identify comparative advantage, and write a conditional trade claim with a stakeholder and limitation.",
          "lowStakesCheck": "Vocabulary, evidence-status, and comparative-advantage check with one correction attempt and a short explanation of the model boundary.",
          "assessment": {
            "key": "BBB4M-M01-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Trade Language and Comparative-Advantage Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Evidence classification",
              "Opportunity-cost calculation",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 2 after the terminology/evidence table and corrected opportunity-cost analysis are submitted. Teacher feedback targets evidence status, units, and overclaiming.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "BBB4M-M02",
          "number": 2,
          "title": "Trade Flows, Value Chains, and Interdependence Decisions",
          "unitNumber": 1,
          "unitTitle": "Business, Trade, and the Economy",
          "lessonIds": [
            "BBB4M-U1-L3",
            "BBB4M-U1-L4"
          ],
          "lessonTitles": [
            "Trade Flows, Balance, Foreign Investment, and Canada's Economy",
            "Interdependence, Global Value Chains, and Trade Institutions"
          ],
          "lessons": [
            {
              "key": "BBB4M-U1-L3",
              "id": "BBB4M-U1-L3",
              "title": "Trade Flows, Balance, Foreign Investment, and Canada's Economy",
              "order": 1
            },
            {
              "key": "BBB4M-U1-L4",
              "id": "BBB4M-U1-L4",
              "title": "Interdependence, Global Value Chains, and Trade Institutions",
              "order": 2
            }
          ],
          "learningFocus": [
            "Interpret trade-flow, balance, investment, ownership, period, currency, and domestic-value-added evidence without collapsing distinct measures.",
            "Map global value-chain dependencies and compare export or assembly choices using control, employment, stakeholder, and risk evidence."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U1-L3: Trade Flows, Balance, Foreign Investment, and Canada's Economy.",
            "Complete the trade-and-investment flow ledger with direction, period, currency, and ownership labels.",
            "Student Coursebook Lesson BBB4M-U1-L4: Interdependence, Global Value Chains, and Trade Institutions.",
            "Assessment Reading Library: Evidence File 1: NorthStar Cycle Components Trade-and-Interdependence Case.",
            "Annotate the decision, stable fictional evidence, current-context needs, alternatives, responsible-business constraints, and rubric before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M02-RESOURCE-01",
              "title": "Canadian International Merchandise Trade Web Application",
              "provider": "Statistics Canada",
              "url": "https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2021004-eng.htm",
              "assignedUse": "Compare one commodity across two partners, preserve units and quality symbols, and explain why customs data alone do not prove demand or firm success.",
              "order": 1
            },
            {
              "key": "BBB4M-M02-RESOURCE-02",
              "title": "Actually, the World Isn't Flat",
              "provider": "TED / Pankaj Ghemawat",
              "url": "https://www.ted.com/talks/pankaj_ghemawat_actually_the_world_isn_t_flat",
              "assignedUse": "Identify three numerical claims, classify the cross-border flow, verify one with an official source, and state whether the updated evidence changes the conclusion.",
              "order": 2
            },
            {
              "key": "BBB4M-M02-RESOURCE-03",
              "title": "Canada Tariff Finder",
              "provider": "Business Development Bank of Canada, Export Development Canada, and the Canadian Trade Commissioner Service",
              "url": "https://www.tariffinder.ca/en/getStarted",
              "assignedUse": "Compare preliminary tariff results for a fictional product, record the assumed classification and trade direction, and list evidence requiring professional verification.",
              "order": 3
            }
          ],
          "guidedPractice": "Build a value-chain map, compare direct export, distributor export, licensed assembly, and pause using common criteria, run one adverse scenario, and submit a conditional recommendation for feedback.",
          "lowStakesCheck": "Assessment-readiness check on trade-flow labels, value-chain dependencies, tariff assumptions, alternatives, stakeholder effects, and monitoring triggers, followed by a rubric self-check.",
          "assessment": {
            "key": "BBB4M-M02-ASSESSMENT",
            "assignmentKey": "BBB4M-M02-ASSIGNMENT",
            "assignmentKeys": [
              "BBB4M-M02-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Canadian Trade and Interdependence Decision Brief",
            "weightPercent": 10,
            "evidenceFile": "Evidence File 1: NorthStar Cycle Components Trade-and-Interdependence Case",
            "sequence": [
              "Evidence-file annotation",
              "Scope, terminology, and evidence-status check",
              "Calculation or comparison conference",
              "Stakeholder, ethics, and risk review",
              "Teacher feedback",
              "Final decision brief and individual defence"
            ],
            "taskType": "Evidence-based international-business case analysis and authenticated defence",
            "processCheckpoints": [
              "Unit 1 case scope, terminology, and evidence-status check",
              "Unit 1 calculation or comparison conference",
              "Unit 1 stakeholder, ethics, and risk review",
              "Unit 1 final memo and individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "BBB4M-M02-C01",
                "componentKey": "m02-coursework",
                "position": 1,
                "title": "Canadian Trade and Interdependence Decision Brief",
                "type": "Coursework assessment",
                "weightPercent": 10,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Unit 1 case scope, terminology, and evidence-status check",
                  "Unit 1 calculation or comparison conference",
                  "Unit 1 stakeholder, ethics, and risk review",
                  "Unit 1 final memo and individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "BBB4M-M02-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher gives rubric-linked feedback on the alternative comparison and evidence status. Unlock Module 3 after final submission and a reflection naming one material uncertainty.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 12,
          "workloadLabel": "12 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "BBB4M-M03",
          "number": 3,
          "title": "Globalization, Institutions, Infrastructure, and Capability",
          "unitNumber": 2,
          "unitTitle": "The Global Business Environment",
          "lessonIds": [
            "BBB4M-U2-L1",
            "BBB4M-U2-L2"
          ],
          "lessonTitles": [
            "Globalization and the Strategic Choices of Canadian Firms",
            "Country Participation: Infrastructure, Institutions, and Human Capability"
          ],
          "lessons": [
            {
              "key": "BBB4M-U2-L1",
              "id": "BBB4M-U2-L1",
              "title": "Globalization and the Strategic Choices of Canadian Firms",
              "order": 1
            },
            {
              "key": "BBB4M-U2-L2",
              "id": "BBB4M-U2-L2",
              "title": "Country Participation: Infrastructure, Institutions, and Human Capability",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect globalization drivers to specific firm choices, stakeholder effects, opportunities, risks, and responses.",
            "Interpret infrastructure, institution, and human-capability indicators through an explicit business mechanism and evidence limitation."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U2-L1: Globalization and the Strategic Choices of Canadian Firms.",
            "Complete the driver-impact matrix for a fictional Canadian firm.",
            "Student Coursebook Lesson BBB4M-U2-L2: Country Participation: Infrastructure, Institutions, and Human Capability.",
            "Complete the participation-systems map and identify where a country indicator cannot predict one firm's outcome."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M03-RESOURCE-01",
              "title": "World Development Indicators: User Guide and Data Resources",
              "provider": "World Bank",
              "url": "https://datatopics.worldbank.org/world-development-indicators/user-guide.html",
              "assignedUse": "Select indicators for two economies, record code, unit, period, and missing-data notes, and write a cautious mechanism-based interpretation.",
              "order": 1
            },
            {
              "key": "BBB4M-M03-RESOURCE-02",
              "title": "International Business",
              "provider": "University of Minnesota Libraries Publishing",
              "url": "https://open.lib.umn.edu/internationalbusiness/",
              "assignedUse": "Read a matching globalization or environment section and separate the stable concept from current market evidence.",
              "order": 2
            },
            {
              "key": "BBB4M-M03-RESOURCE-03",
              "title": "Logistics Performance Indicators 2.0",
              "provider": "World Bank",
              "url": "https://lpi.worldbank.org/en/home",
              "assignedUse": "Compare two markets on four indicators, identify the weakest link, and propose a mitigation without treating the country measure as a shipment guarantee.",
              "order": 3
            }
          ],
          "guidedPractice": "Link three globalization drivers to operational decisions, audit indicator metadata, and create a country-participation map that shows mechanism, affected stage, constraint, mitigation, and uncertainty.",
          "lowStakesCheck": "Indicator-literacy and globalization check requiring source metadata, mechanism, stakeholder effect, and one limitation for every conclusion.",
          "assessment": {
            "key": "BBB4M-M03-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Global Environment Evidence Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Driver-impact matrix",
              "Indicator audit",
              "Self-study task",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 4 after the driver-impact and indicator-mechanism maps are accepted. Teacher feedback flags missing metadata, ecological inference, and unsupported country rankings.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "BBB4M-M04",
          "number": 4,
          "title": "Economic Scenarios, Exchange Rates, and Market Screening",
          "unitNumber": 2,
          "unitTitle": "The Global Business Environment",
          "lessonIds": [
            "BBB4M-U2-L3",
            "BBB4M-U2-L4"
          ],
          "lessonTitles": [
            "Economic Indicators, Exchange Rates, and Business-Cycle Scenarios",
            "Trade Agreements, Institutions, and Current Global Trends"
          ],
          "lessons": [
            {
              "key": "BBB4M-U2-L3",
              "id": "BBB4M-U2-L3",
              "title": "Economic Indicators, Exchange Rates, and Business-Cycle Scenarios",
              "order": 1
            },
            {
              "key": "BBB4M-U2-L4",
              "id": "BBB4M-U2-L4",
              "title": "Trade Agreements, Institutions, and Current Global Trends",
              "order": 2
            }
          ],
          "learningFocus": [
            "Translate economic indicators and exchange-rate scenarios into bounded revenue, cost, timing, and risk effects.",
            "Use official trade and institutional gateways to compare markets while preserving scope, current-context, and responsible-business limitations."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U2-L3: Economic Indicators, Exchange Rates, and Business-Cycle Scenarios.",
            "Complete the indicator-and-cash-flow table and base/adverse exchange-rate scenario.",
            "Student Coursebook Lesson BBB4M-U2-L4: Trade Agreements, Institutions, and Current Global Trends.",
            "Assessment Reading Library: Evidence File 2: PolarPeak Foods Market-Screen Case.",
            "Annotate the two-market evidence, criteria, weights, feasibility constraints, sensitivity test, and responsible-business controls."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M04-RESOURCE-01",
              "title": "Exchange Rates",
              "provider": "Bank of Canada",
              "url": "https://www.bankofcanada.ca/rates/exchange/",
              "assignedUse": "Model a fictional Canadian-dollar margin under a base rate and two scenarios, cite the exact series and period, and state why it is not a promised transaction rate.",
              "order": 1
            },
            {
              "key": "BBB4M-M04-RESOURCE-02",
              "title": "WTO e-Learning Platform",
              "provider": "World Trade Organization",
              "url": "https://www.learning.wto.org/?lang=en",
              "assignedUse": "Complete one relevant basic module and submit an original glossary, corrected knowledge-check log, and application to a fictional exporter.",
              "order": 2
            },
            {
              "key": "BBB4M-M04-RESOURCE-03",
              "title": "OECD FDI Regulatory Restrictiveness Index",
              "provider": "Organisation for Economic Co-operation and Development",
              "url": "https://www.oecd.org/en/topics/sub-issues/sustainable-investment/fdi-regulatory-restrictiveness-index.html",
              "assignedUse": "Compare two economies and sectors, decompose the index, and explain important investment-climate factors it does not measure.",
              "order": 3
            }
          ],
          "guidedPractice": "Build a transparent two-market screen, convert one exchange-rate scenario into margin effects, apply a disqualifying condition, and test whether a reasonable change in weight or assumption reverses the ranking.",
          "lowStakesCheck": "Assessment-readiness check on indicator definitions, units, exchange-rate direction, criteria, sensitivity, feasibility, official-source status, and monitoring triggers.",
          "assessment": {
            "key": "BBB4M-M04-ASSESSMENT",
            "assignmentKey": "BBB4M-M04-ASSIGNMENT",
            "assignmentKeys": [
              "BBB4M-M04-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Two-Market Global Environment Screen",
            "weightPercent": 12,
            "evidenceFile": "Evidence File 2: PolarPeak Foods Market-Screen Case",
            "sequence": [
              "Evidence-file annotation",
              "Scope, terminology, and evidence-status check",
              "Calculation and market-screen conference",
              "Stakeholder, ethics, and risk review",
              "Teacher feedback",
              "Final screen, recommendation, and individual defence"
            ],
            "taskType": "Evidence-based international-business case analysis and authenticated defence",
            "processCheckpoints": [
              "Unit 2 case scope, terminology, and evidence-status check",
              "Unit 2 calculation or comparison conference",
              "Unit 2 stakeholder, ethics, and risk review",
              "Unit 2 final memo and individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "BBB4M-M04-C01",
                "componentKey": "m04-coursework",
                "position": 1,
                "title": "Two-Market Global Environment Screen",
                "type": "Coursework assessment",
                "weightPercent": 12,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Unit 2 case scope, terminology, and evidence-status check",
                  "Unit 2 calculation or comparison conference",
                  "Unit 2 stakeholder, ethics, and risk review",
                  "Unit 2 final memo and individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "BBB4M-M04-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks the exchange-rate direction, criteria definitions, and sensitivity logic before final submission. Unlock Module 5 after the assessment and an uncertainty statement are submitted.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "BBB4M-M05",
          "number": 5,
          "title": "Culture, Communication, Political Risk, and Legal Evidence",
          "unitNumber": 3,
          "unitTitle": "Factors Influencing International Success",
          "lessonIds": [
            "BBB4M-U3-L1",
            "BBB4M-U3-L2"
          ],
          "lessonTitles": [
            "Culture, Communication, and Evidence-Based Adaptation",
            "Political, Legal, and Regulatory Environments"
          ],
          "lessons": [
            {
              "key": "BBB4M-U3-L1",
              "id": "BBB4M-U3-L1",
              "title": "Culture, Communication, and Evidence-Based Adaptation",
              "order": 1
            },
            {
              "key": "BBB4M-U3-L2",
              "id": "BBB4M-U3-L2",
              "title": "Political, Legal, and Regulatory Environments",
              "order": 2
            }
          ],
          "learningFocus": [
            "Use cultural inquiry and consultation to design testable adaptations without treating national labels as fixed individual traits.",
            "Trace political, legal, and regulatory evidence from authority and jurisdiction to a specific operational requirement, owner, and escalation trigger."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U3-L1: Culture, Communication, and Evidence-Based Adaptation.",
            "Complete the communication-and-adaptation map with evidence source, consultation step, risk, and test.",
            "Student Coursebook Lesson BBB4M-U3-L2: Political, Legal, and Regulatory Environments.",
            "Complete the rule-to-operation register and mark every point that requires current local or professional advice."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M05-RESOURCE-01",
              "title": "4 Myths and Misunderstandings About Doing Business in Africa",
              "provider": "TED / Nomava Zanazo",
              "url": "https://www.ted.com/talks/nomava_zanazo_4_myths_and_misunderstandings_about_doing_business_in_africa",
              "assignedUse": "Replace one continent-level generalization with a two-market comparison using official and local-context evidence, a limitation, and an in-market research question.",
              "order": 1
            },
            {
              "key": "BBB4M-M05-RESOURCE-02",
              "title": "OECD Guidelines for Multinational Enterprises on Responsible Business Conduct",
              "provider": "Organisation for Economic Co-operation and Development",
              "url": "https://www.oecd.org/en/publications/oecd-guidelines-for-multinational-enterprises-on-responsible-business-conduct_81f92357-en.html",
              "assignedUse": "Map one potential adverse impact, business relationship, prevention or mitigation action, owner, indicator, and remedy trigger for a fictional supplier.",
              "order": 2
            },
            {
              "key": "BBB4M-M05-RESOURCE-03",
              "title": "International Labour Standards and the ILO Helpdesk for Business",
              "provider": "International Labour Organization",
              "url": "https://www.ilo.org/international-labour-standards",
              "assignedUse": "Distinguish an international standard from national law and write due-diligence questions plus the point where specialist advice is required.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a stereotyped adaptation claim, design a consultation and testing step, trace one rule to an operational control, and write a conditional recommendation with a legal-advice flag.",
          "lowStakesCheck": "Scenario check on cultural evidence, adaptation testing, jurisdiction, authority, operational ownership, responsible-business impact, and advice limits.",
          "assessment": {
            "key": "BBB4M-M05-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Culture, Political, and Legal Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Adaptation map",
              "Rule-to-operation register",
              "Self-study task",
              "Scenario check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 6 after the adaptation map and rule register are accepted. Teacher feedback distinguishes inquiry from stereotype and official information from legal advice.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "BBB4M-M06",
          "number": 6,
          "title": "Geography, Infrastructure, Competitiveness, and Risk Review",
          "unitNumber": 3,
          "unitTitle": "Factors Influencing International Success",
          "lessonIds": [
            "BBB4M-U3-L3",
            "BBB4M-U3-L4"
          ],
          "lessonTitles": [
            "Economic, Geographic, and Infrastructure Conditions",
            "Competitiveness, Common Entry Mistakes, and Transparent Country Screening"
          ],
          "lessons": [
            {
              "key": "BBB4M-U3-L3",
              "id": "BBB4M-U3-L3",
              "title": "Economic, Geographic, and Infrastructure Conditions",
              "order": 1
            },
            {
              "key": "BBB4M-U3-L4",
              "id": "BBB4M-U3-L4",
              "title": "Competitiveness, Common Entry Mistakes, and Transparent Country Screening",
              "order": 2
            }
          ],
          "learningFocus": [
            "Connect affordability, geography, climate, infrastructure, connectivity, and service conditions to specific user and operating mechanisms.",
            "Build a transparent country screen and test how changed weights, scores, assumptions, and feasibility constraints affect the decision."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U3-L3: Economic, Geographic, and Infrastructure Conditions.",
            "Complete the site-to-service map with segment, route, lead time, climate, connectivity, maintenance, and uncertainty.",
            "Student Coursebook Lesson BBB4M-U3-L4: Competitiveness, Common Entry Mistakes, and Transparent Country Screening.",
            "Assessment Reading Library: Evidence File 3: Lumen Learning Devices Success-Factors Case.",
            "Annotate the market/adaptation decision, cultural and legal limits, weighted screen, feasibility controls, sensitivity test, and missing evidence."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M06-RESOURCE-01",
              "title": "World Development Indicators: User Guide and Data Resources",
              "provider": "World Bank",
              "url": "https://datatopics.worldbank.org/world-development-indicators/user-guide.html",
              "assignedUse": "Build a metadata-complete two-market indicator table and explain why each indicator is only one input to the firm decision.",
              "order": 1
            },
            {
              "key": "BBB4M-M06-RESOURCE-02",
              "title": "Logistics Performance Indicators 2.0",
              "provider": "World Bank",
              "url": "https://lpi.worldbank.org/en/home",
              "assignedUse": "Compare four logistics indicators, identify a weak link for each market, and propose an operational mitigation with an evidence limit.",
              "order": 2
            },
            {
              "key": "BBB4M-M06-RESOURCE-03",
              "title": "Fundamentals of Global Strategy",
              "provider": "Open Textbook Library / Saylor Foundation",
              "url": "https://open.umn.edu/opentextbooks/textbooks/fundamentals-of-global-strategy",
              "assignedUse": "Apply one selected strategy framework to the fictional firm, update any example with official evidence, and identify missing data before a real decision.",
              "order": 3
            }
          ],
          "guidedPractice": "Map route and service constraints, build a weighted country screen, run one adverse case and one weight/score sensitivity, apply a responsible-business disqualifier, and compare the result with an unweighted narrative.",
          "lowStakesCheck": "Assessment-readiness quiz on mechanism, country indicators, score rules, sensitivity, feasibility, stereotype avoidance, and monitoring triggers, followed by a rubric self-audit.",
          "assessment": {
            "key": "BBB4M-M06-ASSESSMENT",
            "assignmentKey": "BBB4M-M06-ASSIGNMENT",
            "assignmentKeys": [
              "BBB4M-M06-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "International Success Factors Risk Review",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 3: Lumen Learning Devices Success-Factors Case",
            "sequence": [
              "Evidence-file annotation",
              "Scope, terminology, and evidence-status check",
              "Country-screen and sensitivity conference",
              "Stakeholder, ethics, and risk review",
              "Teacher feedback",
              "Final risk review, recommendation, and individual defence"
            ],
            "taskType": "Evidence-based international-business case analysis and authenticated defence",
            "processCheckpoints": [
              "Unit 3 case scope, terminology, and evidence-status check",
              "Unit 3 calculation or comparison conference",
              "Unit 3 stakeholder, ethics, and risk review",
              "Unit 3 final memo and individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "BBB4M-M06-C01",
                "componentKey": "m06-coursework",
                "position": 1,
                "title": "International Success Factors Risk Review",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Unit 3 case scope, terminology, and evidence-status check",
                  "Unit 3 calculation or comparison conference",
                  "Unit 3 stakeholder, ethics, and risk review",
                  "Unit 3 final memo and individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "BBB4M-M06-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks indicator mechanisms, cultural limits, and sensitivity logic before final submission. Unlock Module 7 after the assessment and an evidence-gap reflection.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "BBB4M-M07",
          "number": 7,
          "title": "International Research, Segmentation, and Adaptation",
          "unitNumber": 4,
          "unitTitle": "International Marketing and Distribution",
          "lessonIds": [
            "BBB4M-U4-L1",
            "BBB4M-U4-L2"
          ],
          "lessonTitles": [
            "International Market Research, Segmentation, and Targeting",
            "Product Adaptation, Positioning, Branding, and Promotion"
          ],
          "lessons": [
            {
              "key": "BBB4M-U4-L1",
              "id": "BBB4M-U4-L1",
              "title": "International Market Research, Segmentation, and Targeting",
              "order": 1
            },
            {
              "key": "BBB4M-U4-L2",
              "id": "BBB4M-U4-L2",
              "title": "Product Adaptation, Positioning, Branding, and Promotion",
              "order": 2
            }
          ],
          "learningFocus": [
            "Design fit-for-purpose international research that links method, sample, measure, segment implication, bias risk, and follow-up.",
            "Compare standardization and adaptation choices using customer, legal, evidence, cost, brand, accessibility, and test criteria."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U4-L1: International Market Research, Segmentation, and Targeting.",
            "Complete the research-evidence matrix and identify one sampling or interpretation risk.",
            "Student Coursebook Lesson BBB4M-U4-L2: Product Adaptation, Positioning, Branding, and Promotion.",
            "Complete the adaptation decision table and design one bounded message or feature test."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M07-RESOURCE-01",
              "title": "Principles of Marketing: Marketing in a Global Environment",
              "provider": "OpenStax / Rice University",
              "url": "https://openstax.org/books/principles-marketing/pages/7-4-marketing-in-a-global-environment",
              "assignedUse": "Adapt product, price, promotion, and place for two markets, cite one official fact per market, and label every assumption.",
              "order": 1
            },
            {
              "key": "BBB4M-M07-RESOURCE-02",
              "title": "Core Principles of International Marketing",
              "provider": "Washington State University Pressbooks / Babu John Mariadoss",
              "url": "https://wsu.pressbooks.pub/cpim/",
              "assignedUse": "Build an evidence-tagged marketing table that distinguishes concepts, current facts, calculations, assumptions, and decisions.",
              "order": 2
            },
            {
              "key": "BBB4M-M07-RESOURCE-03",
              "title": "Step-by-Step Guide to Exporting",
              "provider": "Government of Canada Trade Commissioner Service",
              "url": "https://www.tradecommissioner.gc.ca/en/market-industry-info/export-learning/introduction.html",
              "assignedUse": "Use readiness and planning steps to draft a fictional export brief with target evidence, route, cost assumption, compliance question, and stop trigger.",
              "order": 3
            }
          ],
          "guidedPractice": "Convert a broad market claim into a research question, compare secondary and bounded primary evidence, define a reachable segment, and test one product or message adaptation for accessibility and unsupported claims.",
          "lowStakesCheck": "Research-and-adaptation check requiring a defensible method, sample limitation, segment evidence, adaptation criterion, accessibility test, and revision.",
          "assessment": {
            "key": "BBB4M-M07-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "International Research and Adaptation Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Research matrix",
              "Segment decision",
              "Adaptation test",
              "Knowledge check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 8 after the research and adaptation tables pass review. Teacher feedback flags imaginary average customers, weak samples, unsupported claims, and inaccessible promotion.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "BBB4M-M08",
          "number": 8,
          "title": "Pricing, Currency, Channels, and Border-Ready Distribution",
          "unitNumber": 4,
          "unitTitle": "International Marketing and Distribution",
          "lessonIds": [
            "BBB4M-U4-L3",
            "BBB4M-U4-L4"
          ],
          "lessonTitles": [
            "International Pricing, Currency, Payment, and Channel Economics",
            "Distribution, Logistics, Inventory, and Border-Ready Service"
          ],
          "lessons": [
            {
              "key": "BBB4M-U4-L3",
              "id": "BBB4M-U4-L3",
              "title": "International Pricing, Currency, Payment, and Channel Economics",
              "order": 1
            },
            {
              "key": "BBB4M-U4-L4",
              "id": "BBB4M-U4-L4",
              "title": "Distribution, Logistics, Inventory, and Border-Ready Service",
              "order": 2
            }
          ],
          "learningFocus": [
            "Build a transparent landed-cost and channel-economics waterfall with exchange-rate, fee, return, timing, price, and margin assumptions.",
            "Map order-to-return logistics, documents, inventory states, handoffs, controls, service promises, and exception routes."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U4-L3: International Pricing, Currency, Payment, and Channel Economics.",
            "Complete the unit-economics waterfall and one currency or return-rate sensitivity.",
            "Student Coursebook Lesson BBB4M-U4-L4: Distribution, Logistics, Inventory, and Border-Ready Service.",
            "Assessment Reading Library: Evidence File 4: CedarWave Skin Care Launch-Plan Case.",
            "Annotate the segment, adaptation, price, currency, channel, distribution controls, adverse scenarios, and pause conditions before drafting the launch plan."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M08-RESOURCE-01",
              "title": "Canadian International Merchandise Trade Web Application",
              "provider": "Statistics Canada",
              "url": "https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2021004-eng.htm",
              "assignedUse": "Use a matching commodity comparison only as contextual evidence, preserve quality symbols, and explain why it does not prove customer demand.",
              "order": 1
            },
            {
              "key": "BBB4M-M08-RESOURCE-02",
              "title": "Exporters' Guide to Reporting",
              "provider": "Canada Border Services Agency",
              "url": "https://www.cbsa-asfc.gc.ca/services/export/guide-eng.html",
              "assignedUse": "Build a preliminary reporting flowchart for a fictional non-restricted product and mark every point requiring current official or professional verification.",
              "order": 2
            },
            {
              "key": "BBB4M-M08-RESOURCE-03",
              "title": "Canada Tariff Finder",
              "provider": "Business Development Bank of Canada, Export Development Canada, and the Canadian Trade Commissioner Service",
              "url": "https://www.tariffinder.ca/en/getStarted",
              "assignedUse": "Estimate a preliminary tariff effect for the fictional product and list the classification, origin, and transaction evidence still required.",
              "order": 3
            }
          ],
          "guidedPractice": "Calculate total delivered cost and margin, run delay/demand-spike/damage/return scenarios through the process, verify each handoff and document owner, and submit a conditional launch or pause recommendation.",
          "lowStakesCheck": "Assessment-readiness review of currency direction, landed cost, margin, channel incentives, documents, inventory states, exception routes, claims, accessibility, and service integrity.",
          "assessment": {
            "key": "BBB4M-M08-ASSESSMENT",
            "assignmentKey": "BBB4M-M08-ASSIGNMENT",
            "assignmentKeys": [
              "BBB4M-M08-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "International Marketing and Distribution Launch Plan",
            "weightPercent": 14,
            "evidenceFile": "Evidence File 4: CedarWave Skin Care Launch-Plan Case",
            "sequence": [
              "Evidence-file annotation",
              "Scope, terminology, and evidence-status check",
              "Pricing and process conference",
              "Stakeholder, ethics, and risk review",
              "Teacher feedback",
              "Final launch plan and individual defence"
            ],
            "taskType": "Evidence-based international-business case analysis and authenticated defence",
            "processCheckpoints": [
              "Unit 4 case scope, terminology, and evidence-status check",
              "Unit 4 calculation or comparison conference",
              "Unit 4 stakeholder, ethics, and risk review",
              "Unit 4 final memo and individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "BBB4M-M08-C01",
                "componentKey": "m08-coursework",
                "position": 1,
                "title": "International Marketing and Distribution Launch Plan",
                "type": "Coursework assessment",
                "weightPercent": 14,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Unit 4 case scope, terminology, and evidence-status check",
                  "Unit 4 calculation or comparison conference",
                  "Unit 4 stakeholder, ethics, and risk review",
                  "Unit 4 final memo and individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "BBB4M-M08-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks the cost waterfall and operational handoffs before final submission. Unlock Module 9 after the assessment and a service-risk reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 14,
          "workloadLabel": "14 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "BBB4M-M09",
          "number": 9,
          "title": "Ethics, Labour Standards, and Worker-Centred Due Diligence",
          "unitNumber": 5,
          "unitTitle": "Ethics, Operations, and Market-Entry Plan",
          "lessonIds": [
            "BBB4M-U5-L1",
            "BBB4M-U5-L2"
          ],
          "lessonTitles": [
            "Ethical Decision-Making and Responsible Business Conduct",
            "Working Conditions, Labour Standards, and Cross-Cultural Teams"
          ],
          "lessons": [
            {
              "key": "BBB4M-U5-L1",
              "id": "BBB4M-U5-L1",
              "title": "Ethical Decision-Making and Responsible Business Conduct",
              "order": 1
            },
            {
              "key": "BBB4M-U5-L2",
              "id": "BBB4M-U5-L2",
              "title": "Working Conditions, Labour Standards, and Cross-Cultural Teams",
              "order": 2
            }
          ],
          "learningFocus": [
            "Identify actual and potential impacts, business relationships, leverage, prevention, mitigation, tracking, communication, escalation, and remedy.",
            "Evaluate working conditions using worker-centred evidence while distinguishing international standards, national law, management claims, and verification gaps."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U5-L1: Ethical Decision-Making and Responsible Business Conduct.",
            "Complete the due-diligence register with stakeholder, severity, likelihood, leverage, control, owner, evidence, and remedy.",
            "Student Coursebook Lesson BBB4M-U5-L2: Working Conditions, Labour Standards, and Cross-Cultural Teams.",
            "Complete the worker-centred conditions table and identify the evidence required to verify each management claim."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M09-RESOURCE-01",
              "title": "OECD Guidelines for Multinational Enterprises on Responsible Business Conduct",
              "provider": "Organisation for Economic Co-operation and Development",
              "url": "https://www.oecd.org/en/publications/oecd-guidelines-for-multinational-enterprises-on-responsible-business-conduct_81f92357-en.html",
              "assignedUse": "Apply the due-diligence cycle to one fictional adverse impact and specify prevention or mitigation, tracking, communication, and remedy evidence.",
              "order": 1
            },
            {
              "key": "BBB4M-M09-RESOURCE-02",
              "title": "International Labour Standards and the ILO Helpdesk for Business",
              "provider": "International Labour Organization",
              "url": "https://www.ilo.org/international-labour-standards",
              "assignedUse": "Write five worker-centred due-diligence questions and distinguish the international standard, national-law check, verification evidence, and advice boundary.",
              "order": 2
            },
            {
              "key": "BBB4M-M09-RESOURCE-03",
              "title": "The Ten Principles of the UN Global Compact",
              "provider": "United Nations Global Compact",
              "url": "https://unglobalcompact.org/what-is-gc/mission/principles",
              "assignedUse": "Apply one principle from each area to a fictional supplier and define a risk, question, indicator, owner, and escalation or remedy trigger.",
              "order": 3
            }
          ],
          "guidedPractice": "Map a fictional labour impact to cause, contribution, or direct linkage, compare prevention and mitigation options, design worker-centred verification, and specify an escalation and remedy route.",
          "lowStakesCheck": "Scenario check on stakeholder impact, severity, leverage, standards versus law, worker evidence, corrective action, tracking, communication, and remedy.",
          "assessment": {
            "key": "BBB4M-M09-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [],
            "activityType": "formative",
            "type": "Formative module check",
            "title": "Responsible Business and Labour Readiness Check",
            "weightPercent": 0,
            "evidenceFile": null,
            "sequence": [
              "Core reading",
              "Due-diligence register",
              "Worker-evidence table",
              "Self-study task",
              "Scenario check",
              "Correction log"
            ],
            "taskType": null,
            "processCheckpoints": [],
            "authenticationEvidence": [],
            "timeMinutes": null,
            "components": [],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Unlock Module 10 after the due-diligence and worker-evidence records are accepted. Teacher feedback checks stakeholder voice, evidence gaps, law/standard distinctions, and remedy.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 8,
          "workloadLabel": "8 h core lessons and embedded checks",
          "teacherPresence": "Targeted response to the retrieval check or correction log, plus a discussion, office-hour, or message touchpoint.",
          "evidenceToRetain": "Annotated readings, guided practice, knowledge-check corrections, and exit ticket."
        },
        {
          "key": "BBB4M-M10",
          "number": 10,
          "title": "Border Compliance, Entry Modes, and Integrated Implementation",
          "unitNumber": 5,
          "unitTitle": "Ethics, Operations, and Market-Entry Plan",
          "lessonIds": [
            "BBB4M-U5-L3",
            "BBB4M-U5-L4"
          ],
          "lessonTitles": [
            "Border Compliance, Documentation, and Supply-Chain Controls",
            "Entry Modes, Integrated Implementation, and Decision Defence"
          ],
          "lessons": [
            {
              "key": "BBB4M-U5-L3",
              "id": "BBB4M-U5-L3",
              "title": "Border Compliance, Documentation, and Supply-Chain Controls",
              "order": 1
            },
            {
              "key": "BBB4M-U5-L4",
              "id": "BBB4M-U5-L4",
              "title": "Entry Modes, Integrated Implementation, and Decision Defence",
              "order": 2
            }
          ],
          "learningFocus": [
            "Build a preliminary shipment-readiness register while marking classification, origin, permit, valuation, documentation, and professional-advice limits.",
            "Compare entry modes and a phased implementation using governance rights, costs, milestones, metrics, risk owners, evidence gates, and stop triggers."
          ],
          "readingSteps": [
            "Student Coursebook Lesson BBB4M-U5-L3: Border Compliance, Documentation, and Supply-Chain Controls.",
            "Complete the shipment-readiness register and place a hold on every unresolved material compliance item.",
            "Student Coursebook Lesson BBB4M-U5-L4: Entry Modes, Integrated Implementation, and Decision Defence.",
            "Assessment Reading Library: Evidence File 5: Boreal Mobility Systems Integrated Entry Case.",
            "Annotate the ethics, labour, border, operations, finance, governance, stakeholder, risk, stage-gate, and pause evidence before drafting."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M10-RESOURCE-01",
              "title": "Access2Markets",
              "provider": "European Commission Directorate-General for Trade and Economic Security",
              "url": "https://trade.ec.europa.eu/access-to-markets/en/home",
              "assignedUse": "Run a preliminary fictional product check, record the assumed classification, origin, tariff, and required checks, and label the EU-centred and professional-verification limitations.",
              "order": 1
            },
            {
              "key": "BBB4M-M10-RESOURCE-02",
              "title": "Step-by-Step Guide to Exporting",
              "provider": "Government of Canada Trade Commissioner Service",
              "url": "https://www.tradecommissioner.gc.ca/en/market-industry-info/export-learning/introduction.html",
              "assignedUse": "Use the readiness sequence to audit the proposed entry path and add a missing-evidence gate, owner, and stop trigger.",
              "order": 2
            },
            {
              "key": "BBB4M-M10-RESOURCE-03",
              "title": "Guiding Principles on Business and Human Rights",
              "provider": "United Nations Office of the High Commissioner for Human Rights",
              "url": "https://searchlibrary.ohchr.org/record/11593?ln=en",
              "assignedUse": "Map one potential human-rights impact, the firm's connection, prevention or mitigation, evidence, stakeholder communication, and remedy route.",
              "order": 3
            }
          ],
          "guidedPractice": "Audit a fictional shipment record, compare entry modes with consistent criteria, change key weights and assumptions, check unresolved high risks, and require evidence at each stage gate before further commitment.",
          "lowStakesCheck": "Capstone-readiness review of classification/origin assumptions, document ownership, entry-mode control, financial and operating feasibility, due diligence, stage gates, metrics, and stop triggers.",
          "assessment": {
            "key": "BBB4M-M10-ASSESSMENT",
            "assignmentKey": "BBB4M-M10-ASSIGNMENT",
            "assignmentKeys": [
              "BBB4M-M10-ASSIGNMENT"
            ],
            "activityType": "coursework",
            "type": "Coursework assessment",
            "title": "Responsible International Market-Entry Recommendation",
            "weightPercent": 15,
            "evidenceFile": "Evidence File 5: Boreal Mobility Systems Integrated Entry Case",
            "sequence": [
              "Evidence-file annotation",
              "Scope, terminology, and evidence-status check",
              "Entry-mode and implementation conference",
              "Stakeholder, ethics, compliance, and risk review",
              "Teacher feedback",
              "Final recommendation, implementation dashboard, and individual defence"
            ],
            "taskType": "Evidence-based international-business case analysis and authenticated defence",
            "processCheckpoints": [
              "Unit 5 case scope, terminology, and evidence-status check",
              "Unit 5 calculation or comparison conference",
              "Unit 5 stakeholder, ethics, and risk review",
              "Unit 5 final memo and individual defence"
            ],
            "authenticationEvidence": [
              "Teacher-approved question, plan, or design record",
              "Raw working, data, source notes, code, calculations, or version history",
              "Recorded checkpoint or teacher-student conference",
              "Independent parallel problem, explanation, demonstration, or defence"
            ],
            "timeMinutes": null,
            "components": [
              {
                "key": "BBB4M-M10-C01",
                "componentKey": "m10-coursework",
                "position": 1,
                "title": "Responsible International Market-Entry Recommendation",
                "type": "Coursework assessment",
                "weightPercent": 15,
                "timeMinutes": null,
                "processCheckpoints": [
                  "Unit 5 case scope, terminology, and evidence-status check",
                  "Unit 5 calculation or comparison conference",
                  "Unit 5 stakeholder, ethics, and risk review",
                  "Unit 5 final memo and individual defence"
                ],
                "submissionMode": "text_or_file",
                "assignmentKey": "BBB4M-M10-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "Teacher checks unresolved high risks and evidence gates before final submission. Unlock Module 11 after the recommendation, authenticated defence, and one monitoring-trigger reflection are complete.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 12.5,
          "workloadLabel": "12.5 h lessons, application, assessment, and feedback",
          "teacherPresence": "Rubric-linked process feedback, an authentication checkpoint or conference, and a documented unlock decision.",
          "evidenceToRetain": "Evidence-file notes, staged assessment work, feedback record, final submission, and reflection or defence."
        },
        {
          "key": "BBB4M-M11",
          "number": 11,
          "title": "Cumulative Synthesis, Culminating Performance, and Mandatory Written Examination",
          "unitNumber": null,
          "unitTitle": "Final Evaluation",
          "lessonIds": [],
          "lessonTitles": [],
          "lessons": [],
          "learningFocus": [
            "Integrate trade, global-environment, success-factor, marketing, distribution, ethics, operations, and entry-mode reasoning across unfamiliar cases.",
            "Demonstrate independent, time-bounded evidence interpretation, calculation, alternative comparison, risk analysis, and business communication.",
            "Complete and defend the existing culminating performance before the mandatory written examination."
          ],
          "readingSteps": [
            "Review the five unit concept maps, decision matrices, and correction logs; identify one persistent misconception per unit.",
            "Complete an interleaved case set requiring evidence-status labels, calculations, stakeholder analysis, alternative comparison, sensitivity, and a monitoring trigger.",
            "Complete one timed practice examination, analyse errors by category, and attend the required feedback conference.",
            "Read the examination instructions, permitted materials, integrity requirements, and submission procedure."
          ],
          "selfStudyResources": [
            {
              "key": "BBB4M-M11-RESOURCE-01",
              "title": "International Business",
              "provider": "University of Minnesota Libraries Publishing",
              "url": "https://open.lib.umn.edu/internationalbusiness/",
              "assignedUse": "Use only the chapters identified by the correction log, then complete original concept-to-case retrieval practice without notes.",
              "order": 1
            },
            {
              "key": "BBB4M-M11-RESOURCE-02",
              "title": "Core Principles of International Marketing",
              "provider": "Washington State University Pressbooks / Babu John Mariadoss",
              "url": "https://wsu.pressbooks.pub/cpim/",
              "assignedUse": "Review only the marketing and entry concepts tied to identified gaps and rebuild one evidence-tagged decision table.",
              "order": 2
            },
            {
              "key": "BBB4M-M11-RESOURCE-03",
              "title": "World Development Indicators: User Guide and Data Resources",
              "provider": "World Bank",
              "url": "https://datatopics.worldbank.org/world-development-indicators/user-guide.html",
              "assignedUse": "Resolve remaining indicator metadata and interpretation gaps, then practise writing a bounded conclusion with a mechanism and limitation.",
              "order": 3
            }
          ],
          "guidedPractice": "Use a five-station spiral review: classify evidence, calculate and check units, compare markets or modes, analyse stakeholders and risks, and defend a conditional recommendation. Finish with a timed mock and teacher conference.",
          "lowStakesCheck": "Exam-readiness checklist and timed mock examination; mock score is formative and does not replace the mandatory written examination.",
          "assessment": {
            "key": "BBB4M-M11-ASSESSMENT",
            "assignmentKey": null,
            "assignmentKeys": [
              "BBB4M-M11-CULMINATING-ASSIGNMENT",
              "BBB4M-M11-WRITTEN-EXAM-ASSIGNMENT"
            ],
            "activityType": "final_evaluation",
            "type": "Final evaluation",
            "title": "BBB4M Final Evaluation: Culminating Performance and Mandatory Written Examination",
            "weightPercent": 25,
            "evidenceFile": null,
            "sequence": [
              "Scope, evidence, and integrity conference",
              "Interim artefact and source-trail review",
              "Testing, analysis, or feasibility checkpoint",
              "Final submission and authenticated individual defence",
              "Cumulative review",
              "Timed formative mock",
              "Error analysis",
              "Teacher conference",
              "Mandatory written examination"
            ],
            "taskType": null,
            "processCheckpoints": [
              "Scope, evidence, and integrity conference",
              "Interim artefact and source-trail review",
              "Testing, analysis, or feasibility checkpoint",
              "Final submission and authenticated individual defence"
            ],
            "authenticationEvidence": [
              "Final culminating submission and authenticated individual defence",
              "Supervised written examination administration record"
            ],
            "timeMinutes": 210,
            "components": [
              {
                "key": "BBB4M-M11-C01",
                "componentKey": "m11-culminating",
                "position": 1,
                "title": "BBB4M Culminating Performance and Defence",
                "type": "Culminating performance and defence",
                "weightPercent": 10,
                "timeMinutes": 120,
                "processCheckpoints": [
                  "Scope, evidence, and integrity conference",
                  "Interim artefact and source-trail review",
                  "Testing, analysis, or feasibility checkpoint",
                  "Final submission and authenticated individual defence"
                ],
                "submissionMode": "project",
                "assignmentKey": "BBB4M-M11-CULMINATING-ASSIGNMENT"
              },
              {
                "key": "BBB4M-M11-C02",
                "componentKey": "m11-written-exam",
                "position": 2,
                "title": "BBB4M Mandatory Written Examination",
                "type": "Mandatory written examination",
                "weightPercent": 15,
                "timeMinutes": 90,
                "processCheckpoints": [],
                "submissionMode": "supervised",
                "assignmentKey": "BBB4M-M11-WRITTEN-EXAM-ASSIGNMENT"
              }
            ],
            "required": true
          },
          "unlockRule": {
            "ruleText": "The examination opens only after required coursework submissions and the exam-integrity check are complete, subject to documented accommodations. Final teacher feedback distinguishes concept, evidence, calculation, decision, and communication errors.",
            "teacherOverrideAllowed": true,
            "overrideReasonRequired": true
          },
          "estimatedCreditHours": 3.5,
          "workloadLabel": "3.5 h final evaluation (2 h culminating performance + 1.5 h supervised written examination)",
          "teacherPresence": "Culminating scope and source-trail checkpoints, authenticated individual defence, exam-readiness confirmation, approved accommodations, identity check, and supervised examination administration.",
          "evidenceToRetain": "Culminating artefact, source/work history, checkpoint feedback, authenticated defence record, supervised examination script, and administration record."
        }
      ],
      "gradebookItems": [
        {
          "key": "BBB4M-M02-COURSEWORK",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M02",
          "moduleActivityKey": "BBB4M-M02-ASSESSMENT",
          "assignmentKey": "BBB4M-M02-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m02-coursework",
          "title": "Canadian Trade and Interdependence Decision Brief",
          "type": "Coursework assessment",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 1,
          "evidenceDescription": "Evidence File 1: NorthStar Cycle Components Trade-and-Interdependence Case"
        },
        {
          "key": "BBB4M-M04-COURSEWORK",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M04",
          "moduleActivityKey": "BBB4M-M04-ASSESSMENT",
          "assignmentKey": "BBB4M-M04-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m04-coursework",
          "title": "Two-Market Global Environment Screen",
          "type": "Coursework assessment",
          "weightPercent": 12,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 2,
          "evidenceDescription": "Evidence File 2: PolarPeak Foods Market-Screen Case"
        },
        {
          "key": "BBB4M-M06-COURSEWORK",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M06",
          "moduleActivityKey": "BBB4M-M06-ASSESSMENT",
          "assignmentKey": "BBB4M-M06-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m06-coursework",
          "title": "International Success Factors Risk Review",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 3,
          "evidenceDescription": "Evidence File 3: Lumen Learning Devices Success-Factors Case"
        },
        {
          "key": "BBB4M-M08-COURSEWORK",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M08",
          "moduleActivityKey": "BBB4M-M08-ASSESSMENT",
          "assignmentKey": "BBB4M-M08-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m08-coursework",
          "title": "International Marketing and Distribution Launch Plan",
          "type": "Coursework assessment",
          "weightPercent": 14,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 4,
          "evidenceDescription": "Evidence File 4: CedarWave Skin Care Launch-Plan Case"
        },
        {
          "key": "BBB4M-M10-COURSEWORK",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M10",
          "moduleActivityKey": "BBB4M-M10-ASSESSMENT",
          "assignmentKey": "BBB4M-M10-ASSIGNMENT",
          "category": "coursework",
          "componentKey": "m10-coursework",
          "title": "Responsible International Market-Entry Recommendation",
          "type": "Coursework assessment",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "text_or_file",
          "position": 5,
          "evidenceDescription": "Evidence File 5: Boreal Mobility Systems Integrated Entry Case"
        },
        {
          "key": "BBB4M-M11-CULMINATING",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M11",
          "moduleActivityKey": "BBB4M-M11-ASSESSMENT",
          "assignmentKey": "BBB4M-M11-CULMINATING-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-culminating",
          "title": "BBB4M Culminating Performance and Defence",
          "type": "Culminating performance and defence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "project",
          "position": 6,
          "evidenceDescription": null
        },
        {
          "key": "BBB4M-M11-WRITTEN-EXAM",
          "courseCode": "BBB4M",
          "moduleKey": "BBB4M-M11",
          "moduleActivityKey": "BBB4M-M11-ASSESSMENT",
          "assignmentKey": "BBB4M-M11-WRITTEN-EXAM-ASSIGNMENT",
          "category": "final_evaluation",
          "componentKey": "m11-written-exam",
          "title": "BBB4M Mandatory Written Examination",
          "type": "Mandatory written examination",
          "weightPercent": 15,
          "maxScore": 100,
          "submissionMode": "supervised",
          "position": 7,
          "evidenceDescription": null
        },
        {
          "key": "BBB4M-PARTICIPATION",
          "courseCode": "BBB4M",
          "moduleKey": null,
          "moduleActivityKey": null,
          "assignmentKey": null,
          "category": "participation",
          "componentKey": "participation",
          "title": "Attendance and Participation",
          "type": "Attendance and participation evidence",
          "weightPercent": 10,
          "maxScore": 100,
          "submissionMode": "none",
          "position": 8,
          "evidenceDescription": "Collected across Modules 0-11 through required teacher contact, discussions, checkpoints, conferences, timely completion, and documented use of feedback; platform clicks alone are not sufficient evidence."
        }
      ],
      "recordedCreditHours": 110,
      "sourceComponents": {
        "core_lessons": "Component 01",
        "graded_assessments": "Component 02",
        "assessment_evidence_files": "Component 05",
        "self_study_resources": "Components 06 and 07"
      }
    }
  ],
  "totals": {
    "courses": 6,
    "modules": 72,
    "lessons": 120,
    "resources": 198,
    "recordedCreditHours": 660,
    "gradebookItems": 44,
    "weightedAssignments": 38,
    "weightedAssessmentComponents": 38
  }
};
  catalog.coursesByCode = Object.fromEntries(catalog.courses.map((course) => [course.code, course]));
  global.LFA_PLATFORM_CATALOG = catalog;
  global.LFA_PLATFORM_SEQUENCES = catalog;
})(window);
