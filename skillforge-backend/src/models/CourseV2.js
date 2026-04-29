import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    downloadUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const videoSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    duration: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    content: String,
    duration: String,
    order: Number,
    topics: [String],
    outcomes: [String],
    points: [String],
    documents: [documentSchema],
    video: videoSchema,
    unlockPercentage: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  { timestamps: false },
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswerIndex: { type: Number, required: true },
    explanation: String,
  },
  { timestamps: false },
);

const quizSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    unlockPercentage: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  { timestamps: false },
);

const courseV2Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a course title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a course description"],
    },
    instructor: {
      type: String,
      required: [true, "Please provide instructor name"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: [
        "Web Development",
        "UI/UX Design",
        "Data Fundamentals",
        "Career Skills",
        "Productivity",
        "Other",
      ],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, default: "Self-paced" },
    expectedTime: { type: String, default: "Flexible" },
    modules: [moduleSchema],
    quiz: quizSchema,
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserV2",
      },
    ],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublished: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true },
);

export default mongoose.model("CourseV2", courseV2Schema, "courses_v2");
