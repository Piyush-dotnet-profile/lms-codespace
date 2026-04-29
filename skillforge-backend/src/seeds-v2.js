import dotenv from "dotenv";
import connectDB from "./config/database.js";
import Course from "./models/Course.js";
import User from "./models/User.js";

dotenv.config();

const sampleCourses = [
  {
    title: "Full Stack Web Foundations",
    description:
      "Build web applications start to finish with HTML, CSS, JavaScript, and backend APIs.",
    instructor: "Aisha Patel",
    category: "Web Development",
    level: "Beginner",
    duration: "8 weeks",
    expectedTime: "8 weeks",
    tags: ["HTML", "CSS", "JavaScript", "APIs"],
    modules: [
      {
        title: "HTML Essentials",
        description: "Create structured pages with semantic HTML.",
        content:
          "Learn the building blocks of every webpage and how to structure content for accessibility.",
        duration: "1 week",
        order: 1,
        topics: ["HTML tags", "Semantic markup", "Forms"],
        outcomes: ["Build pages", "Use semantic HTML"],
        documents: [
          {
            title: "HTML Cheatsheet",
            url: "https://example.com/html-cheatsheet.pdf",
            downloadUrl: "https://example.com/download/html-cheatsheet.pdf",
          },
        ],
        video: {
          title: "HTML Crash Course",
          url: "https://example.com/videos/html-intro.mp4",
          duration: 420,
        },
        unlockPercentage: 0,
      },
      {
        title: "CSS Styling & Layout",
        description: "Style pages with modern CSS and responsive design.",
        content:
          "Master layout systems, typography, and color to bring interfaces to life.",
        duration: "2 weeks",
        order: 2,
        topics: ["Flexbox", "Grid", "Responsive design"],
        outcomes: ["Create responsive sites", "Style components"],
        documents: [
          {
            title: "CSS Reference Guide",
            url: "https://example.com/css-guide.pdf",
            downloadUrl: "https://example.com/download/css-guide.pdf",
          },
        ],
        video: {
          title: "CSS Layout Techniques",
          url: "https://example.com/videos/css-layout.mp4",
          duration: 540,
        },
      },
      {
        title: "JavaScript Interactivity",
        description: "Add behavior to your web apps with JavaScript.",
        content:
          "Use JavaScript to manipulate the DOM, respond to user input, and build dynamic pages.",
        duration: "2 weeks",
        order: 3,
        topics: ["DOM", "Events", "State"],
        outcomes: ["Build interactive UI", "Manage page state"],
        video: {
          title: "JavaScript Basics",
          url: "https://example.com/videos/js-basics.mp4",
          duration: 600,
        },
      },
      {
        title: "Backend APIs & Deployment",
        description: "Connect frontend to backend APIs and publish your work.",
        content:
          "Learn how web applications talk to servers and how to deploy a finished project.",
        duration: "3 weeks",
        order: 4,
        topics: ["REST APIs", "Authentication", "Deployment"],
        outcomes: ["Build backend APIs", "Deploy apps"],
        documents: [
          {
            title: "API Design Checklist",
            url: "https://example.com/api-checklist.pdf",
            downloadUrl: "https://example.com/download/api-checklist.pdf",
          },
        ],
        video: {
          title: "API Fundamentals",
          url: "https://example.com/videos/api-fundamentals.mp4",
          duration: 660,
        },
      },
    ],
    quiz: {
      title: "Web Foundations Quiz",
      description: "Validate your understanding of web fundamentals.",
      questions: [
        {
          questionText: "Which HTML element is used for the page title?",
          options: ["<title>", "<head>", "<h1>", "<meta>"],
          correctAnswerIndex: 0,
          explanation:
            "The <title> tag defines the title shown in the browser tab.",
        },
        {
          questionText:
            "Which CSS property controls layout in a row or column?",
          options: ["display", "position", "flex-direction", "float"],
          correctAnswerIndex: 2,
          explanation:
            "flex-direction controls layout direction in flex containers.",
        },
        {
          questionText: "Which method adds an event listener to a DOM element?",
          options: [
            "setEvent()",
            "addEventListener()",
            "listen()",
            "attachEvent()",
          ],
          correctAnswerIndex: 1,
          explanation:
            "addEventListener() is the standard method for DOM events.",
        },
      ],
      passingScore: 70,
      unlockPercentage: 60,
    },
    isPublished: true,
  },
  {
    title: "UX Design & Product Thinking",
    description:
      "Design beautiful experiences and turn ideas into user-centered products.",
    instructor: "Priya Sharma",
    category: "UI/UX Design",
    level: "Beginner",
    duration: "6 weeks",
    expectedTime: "6 weeks",
    tags: ["Design", "UX", "Research"],
    modules: [
      {
        title: "Design Principles",
        description: "Learn the core principles of good interface design.",
        content:
          "Understand layout, color, typography, and visual hierarchy for polished interfaces.",
        duration: "1.5 weeks",
        order: 1,
        topics: ["Hierarchy", "Color", "Typography"],
        outcomes: ["Design clear UI", "Use visual principles"],
        video: {
          title: "Design Principles Explained",
          url: "https://example.com/videos/design-principles.mp4",
          duration: 480,
        },
      },
      {
        title: "User Research",
        description: "Collect insights from real users and test ideas.",
        content:
          "Learn research methods like interviews, surveys, and usability testing.",
        duration: "1.5 weeks",
        order: 2,
        topics: ["Interviews", "Surveys", "Personas"],
        outcomes: ["Gather user data", "Create personas"],
      },
      {
        title: "Wireframes & Prototypes",
        description: "Turn ideas into clickable prototypes.",
        content:
          "Create early wireframes and interactive prototypes to validate your design.",
        duration: "1.5 weeks",
        order: 3,
        topics: ["Sketching", "Prototyping", "Feedback"],
        outcomes: ["Build prototypes", "Iterate designs"],
      },
      {
        title: "Design Reviews",
        description: "Refine your product with critique and iteration.",
        content:
          "Learn how to collect feedback and improve your design through review cycles.",
        duration: "1.5 weeks",
        order: 4,
        topics: ["Critique", "Iteration", "Final polish"],
        outcomes: ["Improve designs", "Present work"],
      },
    ],
    quiz: {
      title: "UX Fundamentals Quiz",
      description: "Check your understanding of user-centered design.",
      questions: [
        {
          questionText: "What is the main goal of user research?",
          options: [
            "Increase visual polish",
            "Understand user needs",
            "Write code faster",
            "Reduce project cost",
          ],
          correctAnswerIndex: 1,
          explanation:
            "User research is primarily about understanding the needs and behavior of users.",
        },
        {
          questionText: "What does a wireframe show?",
          options: [
            "Final visuals",
            "Brand colors",
            "Layout and structure",
            "Backend architecture",
          ],
          correctAnswerIndex: 2,
          explanation:
            "Wireframes display layout and structure without detailed visual design.",
        },
      ],
      passingScore: 60,
      unlockPercentage: 50,
    },
    isPublished: true,
  },
  {
    title: "Data Storytelling Essentials",
    description:
      "Learn how to analyze data, create dashboards, and tell compelling stories.",
    instructor: "Mateo Lopez",
    category: "Data Fundamentals",
    level: "Intermediate",
    duration: "5 weeks",
    expectedTime: "5 weeks",
    tags: ["Data", "Analytics", "Visualization"],
    modules: [
      {
        title: "Data Collection",
        description: "Collect and clean data for analysis.",
        content:
          "Discover sources of data and practical techniques for preparing datasets.",
        duration: "1 week",
        order: 1,
        topics: ["Sources", "Cleanup", "Validation"],
        outcomes: ["Collect clean data", "Prepare datasets"],
      },
      {
        title: "Data Visualization",
        description: "Turn numbers into clear charts and dashboards.",
        content:
          "Use visualization best practices to present insights effectively.",
        duration: "2 weeks",
        order: 2,
        topics: ["Charts", "Dashboards", "Storytelling"],
        outcomes: ["Build dashboards", "Communicate insights"],
      },
      {
        title: "Presentation Skills",
        description: "Share your findings with confidence.",
        content:
          "Learn how to present data stories to stakeholders and execute insights.",
        duration: "2 weeks",
        order: 3,
        topics: ["Story arc", "Audience", "Visual clarity"],
        outcomes: ["Present insights", "Drive decisions"],
      },
    ],
    quiz: {
      title: "Data Storytelling Quiz",
      description: "Test your ability to communicate data clearly.",
      questions: [
        {
          questionText:
            "Which chart type is best for showing change over time?",
          options: ["Bar chart", "Line chart", "Pie chart", "Scatter plot"],
          correctAnswerIndex: 1,
          explanation:
            "Line charts are ideal for showing trends and changes over time.",
        },
        {
          questionText: "Why are labels important in dashboards?",
          options: [
            "They make colors brighter",
            "They explain what the data means",
            "They reduce chart size",
            "They hide data flaws",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Labels help viewers understand what each part of the dashboard represents.",
        },
      ],
      passingScore: 65,
      unlockPercentage: 50,
    },
    isPublished: true,
  },
];

const createSampleUsers = (courseRecords) => {
  const [courseA, courseB] = courseRecords;

  return [
    {
      name: "Emma Carter",
      email: "emma.carter@example.com",
      password: "Password123",
      enrolledCourses: [courseA._id, courseB._id],
      progress: new Map([
        [
          courseA._id.toString(),
          {
            modules: new Map([
              [
                courseA.modules[0]._id.toString(),
                {
                  progress: 85,
                  videoProgress: 100,
                  completed: true,
                  completedAt: new Date(),
                  documentsDownloaded: ["HTML Cheatsheet"],
                },
              ],
              [
                courseA.modules[1]._id.toString(),
                {
                  progress: 60,
                  videoProgress: 80,
                  completed: false,
                  documentsDownloaded: [],
                },
              ],
            ]),
            overallProgress: 55,
            quizCompleted: false,
            quizScore: null,
            quizAttempts: [],
            enrolledAt: new Date(),
          },
        ],
        [
          courseB._id.toString(),
          {
            modules: new Map([
              [
                courseB.modules[0]._id.toString(),
                {
                  progress: 100,
                  videoProgress: 100,
                  completed: true,
                  completedAt: new Date(),
                  documentsDownloaded: [],
                },
              ],
            ]),
            overallProgress: 33,
            quizCompleted: false,
            quizScore: null,
            quizAttempts: [],
            enrolledAt: new Date(),
          },
        ],
      ]),
    },
    {
      name: "Noah Green",
      email: "noah.green@example.com",
      password: "Password123",
      enrolledCourses: [courseB._id],
      progress: new Map([
        [
          courseB._id.toString(),
          {
            modules: new Map([
              [
                courseB.modules[0]._id.toString(),
                {
                  progress: 40,
                  videoProgress: 40,
                  completed: false,
                  completedAt: null,
                  documentsDownloaded: [],
                },
              ],
            ]),
            overallProgress: 40,
            quizCompleted: false,
            quizScore: null,
            quizAttempts: [],
            enrolledAt: new Date(),
          },
        ],
      ]),
    },
  ];
};

const seedV2 = async () => {
  try {
    await connectDB();
    await Course.deleteMany({});
    await User.deleteMany({});

    console.log("🧹 Cleared course and user collections for v2 data");

    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Created ${createdCourses.length} Course documents`);

    const sampleUsers = createSampleUsers(createdCourses);
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} User documents`);

    // Link enrolled users on courses
    const userIds = createdUsers.map((user) => user._id);
    createdCourses[0].enrolledUsers = [userIds[0]];
    createdCourses[1].enrolledUsers = [userIds[0], userIds[1]];
    createdCourses[2].enrolledUsers = [];
    await Promise.all(createdCourses.map((course) => course.save()));

    console.log("✅ Linked enrolled users to Course documents");

    console.log("🎉 Seed v2 data created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed v2 error:", error);
    process.exit(1);
  }
};

seedV2();
