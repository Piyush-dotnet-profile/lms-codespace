import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const moduleProgressSchema = new mongoose.Schema(
  {
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
    documentsDownloaded: [String],
  },
  { _id: false },
);

const courseProgressSchema = new mongoose.Schema(
  {
    modules: {
      type: Map,
      of: moduleProgressSchema,
      default: new Map(),
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
        answers: {
          type: Map,
          of: String,
          default: new Map(),
        },
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
);

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
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progress: {
      type: Map,
      of: courseProgressSchema,
      default: new Map(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

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

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model("User", userSchema, "users_v2");
