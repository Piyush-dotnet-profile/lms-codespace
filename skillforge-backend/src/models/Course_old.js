import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
        "Other",
      ],
    },
    duration: {
      type: String, // e.g., "4 weeks", "6 hours"
      default: "Self-paced",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    modules: [
      {
        title: String,
        description: String,
        content: String,
        duration: String,
        order: Number,
        documents: [
          {
            title: String,
            url: String, // Document file URL or path
            downloadUrl: String, // Direct download URL
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        video: {
          title: String,
          url: String, // Video file URL or streaming service URL
          duration: Number, // Duration in seconds
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
        unlockPercentage: {
          type: Number,
          default: 50, // Next module unlocked at 50% completion
          min: 0,
          max: 100,
        },
      },
    ],
    quiz: {
      title: String,
      description: String,
      questions: [
        {
          questionText: String,
          options: [String], // Array of answer options
          correctAnswerIndex: Number, // Index of correct answer in options array
          explanation: String, // Explanation for the answer
        },
      ],
      passingScore: {
        type: Number,
        default: 50, // Passing percentage
        min: 0,
        max: 100,
      },
      unlockPercentage: {
        type: Number,
        default: 50, // Quiz unlocked at 50% course completion
        min: 0,
        max: 100,
      },
    },
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
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
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
