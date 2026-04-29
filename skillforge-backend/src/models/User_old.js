import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progress: {
      type: Map,
      of: new mongoose.Schema(
        {
          modules: {
            type: Map,
            of: {
              progress: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
              },
              videoProgress: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
              },
              completed: {
                type: Boolean,
                default: false,
              },
              completedAt: Date,
              documentsDownloaded: [String], // Store document IDs
            },
          },
          overallProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
          },
          quizCompleted: {
            type: Boolean,
            default: false,
          },
          quizScore: Number,
          quizAttempts: [
            {
              answers: Map,
              score: Number,
              completedAt: Date,
            },
          ],
          enrolledAt: {
            type: Date,
            default: Date.now,
          },
        },
        { _id: false },
      ),
      default: new Map(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function () {
  const { password, ...user } = this.toObject();
  return user;
};

export default mongoose.model("User", userSchema);
