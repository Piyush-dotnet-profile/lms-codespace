import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { drive } from "../config/drive.js";

const router = express.Router();

// GET /api/courses/my-courses - Get user's enrolled courses
router.get("/my-courses/enrolled", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "enrolledCourses",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user.enrolledCourses);
  } catch (error) {
    console.error("Get user courses error:", error);
    res.status(500).json({
      message: "Error fetching user courses",
      error: error.message,
    });
  }
});

// POST /api/courses/:id/enroll - Enroll user in a course
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseId = req.params.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check if user already enrolled
    if (course.enrolledUsers.includes(userId)) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
      });
    }

    // Add user to course
    course.enrolledUsers.push(userId);
    await course.save();

    // Add course to user
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    res.json({
      message: "Successfully enrolled in course",
      course,
    });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({
      message: "Error enrolling in course",
      error: error.message,
    });
  }
});

// GET /api/courses/:id/modules - Get course modules
router.get("/:id/modules", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select("modules title");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      title: course.title,
      modules: course.modules,
    });
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({
      message: "Error fetching modules",
      error: error.message,
    });
  }
});

// GET /api/courses/:courseId/modules/:moduleId
router.get("/:courseId/modules/:moduleId", optionalAuth, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId).select("modules");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.id(moduleId); // correct usage

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json(module);
  } catch (error) {
    console.error("Get module error:", error);
    res.status(500).json({
      message: "Error fetching module",
      error: error.message,
    });
  }
});

// POST /api/courses/:id/review - Add a review to course
router.post("/:id/review", authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const courseId = req.params.id;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Add review
    course.reviews.push({
      userId,
      userName: user.name,
      rating,
      comment,
    });

    // Update average rating
    const avgRating =
      course.reviews.reduce((sum, review) => sum + review.rating, 0) /
      course.reviews.length;
    course.rating = avgRating;

    await course.save();

    res.json({
      message: "Review added successfully",
      course,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      message: "Error adding review",
      error: error.message,
    });
  }
});
// POST /api/courses/:courseId/modules/:moduleId/progress - Update module progress
router.post(
  "/:courseId/modules/:moduleId/progress",
  authenticateToken,
  async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const { progress, videoProgress, documentId } = req.body;
      const userId = req.user.userId;

      // Validate inputs
      if (progress !== undefined && (progress < 0 || progress > 100)) {
        return res
          .status(400)
          .json({ message: "Progress must be between 0 and 100" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const module = course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Initialize progress for this course if not exists
      if (!user.progress.has(courseId)) {
        user.progress.set(courseId, {
          modules: new Map(),
          overallProgress: 0,
          quizCompleted: false,
          quizScore: null,
          quizAttempts: [],
          enrolledAt: new Date(),
        });
      }

      const courseProgress = user.progress.get(courseId);

      // Initialize module progress if not exists
      if (!courseProgress.modules.has(moduleId)) {
        courseProgress.modules.set(moduleId, {
          progress: 0,
          videoProgress: 0,
          completed: false,
          completedAt: null,
          documentsDownloaded: [],
        });
      }

      const moduleProgress = courseProgress.modules.get(moduleId);

      // Update module progress
      if (progress !== undefined) {
        moduleProgress.progress = Math.max(moduleProgress.progress, progress);
      }

      // Update video progress
      if (videoProgress !== undefined) {
        moduleProgress.videoProgress = Math.max(
          moduleProgress.videoProgress,
          videoProgress,
        );
      }

      // Track document download
      if (
        documentId &&
        !moduleProgress.documentsDownloaded.includes(documentId)
      ) {
        moduleProgress.documentsDownloaded.push(documentId);
      }

      // Mark as completed if progress is 100%
      if (moduleProgress.progress >= 100 && !moduleProgress.completed) {
        moduleProgress.completed = true;
        moduleProgress.completedAt = new Date();
      }

      // Calculate overall course progress
      let totalModuleProgress = 0;
      let completedModules = 0;
      courseProgress.modules.forEach((mProgress) => {
        totalModuleProgress += mProgress.progress;
        if (mProgress.completed) completedModules++;
      });

      const totalModules = course.modules.length;
      courseProgress.overallProgress = Math.round(
        totalModuleProgress / totalModules,
      );

      user.progress.set(courseId, courseProgress);
      await user.save();

      res.json({
        message: "Progress updated successfully",
        moduleProgress,
        overallProgress: courseProgress.overallProgress,
        completedModules,
        totalModules,
      });
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({
        message: "Error updating progress",
        error: error.message,
      });
    }
  },
);

// GET /api/courses/:courseId/progress - Get user's course progress
router.get("/:courseId/progress", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId).select("modules quiz");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!user.progress.has(courseId)) {
      // Initialize default progress if user hasn't started
      user.progress.set(courseId, {
        modules: new Map(),
        overallProgress: 0,
        quizCompleted: false,
        quizScore: null,
        quizAttempts: [],
        enrolledAt: new Date(),
      });
    }

    const courseProgress = user.progress.get(courseId);

    // Build detailed progress response with module status
    const moduleProgress = [];
    course.modules.forEach((module) => {
      const modProgress = courseProgress.modules.get(module._id.toString()) || {
        progress: 0,
        videoProgress: 0,
        completed: false,
        completedAt: null,
        documentsDownloaded: [],
      };

      moduleProgress.push({
        moduleId: module._id,
        title: module.title,
        ...modProgress,
      });
    });

    res.json({
      courseId,
      overallProgress: courseProgress.overallProgress,
      quizCompleted: courseProgress.quizCompleted,
      quizScore: courseProgress.quizScore,
      modules: moduleProgress,
      enrolledAt: courseProgress.enrolledAt,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      message: "Error fetching progress",
      error: error.message,
    });
  }
});

// GET /api/courses/:courseId/modules/:moduleId/is-unlocked - Check if module is unlocked
router.get(
  "/:courseId/modules/:moduleId/is-unlocked",
  authenticateToken,
  async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const module = course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // First module is always unlocked
      const moduleIndex = course.modules.findIndex((m) =>
        m._id.equals(moduleId),
      );
      if (moduleIndex === 0) {
        return res.json({ isUnlocked: true });
      }

      // Check if previous module meets unlock percentage
      const prevModule = course.modules[moduleIndex - 1];
      const courseProgress = user.progress.get(courseId);

      if (!courseProgress) {
        return res.json({ isUnlocked: false });
      }

      const prevModuleProgress = courseProgress.modules.get(
        prevModule._id.toString(),
      );
      if (!prevModuleProgress) {
        return res.json({ isUnlocked: false });
      }

      const unlockPercentage = prevModule.unlockPercentage || 50;
      const isUnlocked = prevModuleProgress.progress >= unlockPercentage;

      res.json({
        isUnlocked,
        currentProgress: prevModuleProgress.progress,
        requiredProgress: unlockPercentage,
      });
    } catch (error) {
      console.error("Check unlock error:", error);
      res.status(500).json({
        message: "Error checking module unlock status",
        error: error.message,
      });
    }
  },
);

// GET /api/courses/:courseId/quiz/is-unlocked - Check if quiz is unlocked
router.get(
  "/:courseId/quiz/is-unlocked",
  authenticateToken,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!course.quiz) {
        return res
          .status(404)
          .json({ message: "Quiz not available for this course" });
      }

      const courseProgress = user.progress.get(courseId);
      if (!courseProgress) {
        return res.json({
          isUnlocked: false,
          currentProgress: 0,
          requiredProgress: course.quiz.unlockPercentage || 50,
        });
      }

      const requiredProgress = course.quiz.unlockPercentage || 50;
      const isUnlocked = courseProgress.overallProgress >= requiredProgress;

      res.json({
        isUnlocked,
        currentProgress: courseProgress.overallProgress,
        requiredProgress,
        alreadyCompleted: courseProgress.quizCompleted,
      });
    } catch (error) {
      console.error("Check quiz unlock error:", error);
      res.status(500).json({
        message: "Error checking quiz unlock status",
        error: error.message,
      });
    }
  },
);

// GET /api/courses/:courseId/quiz - Get quiz details
router.get("/:courseId/quiz", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const course = await Course.findById(courseId).select("quiz");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not available for this course" });
    }

    const user = await User.findById(userId);
    const courseProgress = user.progress.get(courseId);

    // Check if user can access quiz
    const requiredProgress = course.quiz.unlockPercentage || 50;
    const canAccess =
      courseProgress && courseProgress.overallProgress >= requiredProgress;

    if (!canAccess) {
      return res.status(403).json({
        message:
          "Quiz is locked. Complete at least 50% of the course to unlock.",
        currentProgress: courseProgress?.overallProgress || 0,
        requiredProgress,
      });
    }

    // Return quiz without revealing correct answers
    const quizData = {
      title: course.quiz.title,
      description: course.quiz.description,
      passingScore: course.quiz.passingScore,
      questions: course.quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        // Note: Do NOT send correctAnswerIndex to client
      })),
      totalQuestions: course.quiz.questions.length,
    };

    res.json(quizData);
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      message: "Error fetching quiz",
      error: error.message,
    });
  }
});

// POST /api/courses/:courseId/quiz - Submit quiz answers
router.post("/:courseId/quiz", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // answers is an object: { questionId: selectedOptionIndex }
    const userId = req.user.userId;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers object is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not available for this course" });
    }

    const courseProgress = user.progress.get(courseId);
    if (!courseProgress) {
      return res
        .status(403)
        .json({ message: "User is not enrolled in this course" });
    }

    // Check if quiz is unlocked
    const requiredProgress = course.quiz.unlockPercentage || 50;
    if (courseProgress.overallProgress < requiredProgress) {
      return res.status(403).json({
        message:
          "Quiz is locked. Complete at least " +
          requiredProgress +
          "% of the course.",
        currentProgress: courseProgress.overallProgress,
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedResults = [];

    course.quiz.questions.forEach((question) => {
      const questionId = question._id.toString();
      const selectedIndex = answers[questionId];

      const isCorrect = selectedIndex === question.correctAnswerIndex;
      if (isCorrect) {
        correctAnswers++;
      }

      detailedResults.push({
        questionId,
        questionText: question.questionText,
        selectedOption: question.options[selectedIndex],
        correctOption: question.options[question.correctAnswerIndex],
        isCorrect,
        explanation: question.explanation,
      });
    });

    const totalQuestions = course.quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= (course.quiz.passingScore || 50);

    // Update user progress
    courseProgress.quizCompleted = true;
    courseProgress.quizScore = score;
    courseProgress.quizAttempts.push({
      answers: new Map(Object.entries(answers)),
      score,
      completedAt: new Date(),
    });

    user.progress.set(courseId, courseProgress);
    await user.save();

    res.json({
      message: "Quiz submitted successfully",
      score,
      passed,
      totalQuestions,
      correctAnswers,
      passingScore: course.quiz.passingScore || 50,
      detailedResults,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      message: "Error submitting quiz",
      error: error.message,
    });
  }
});

// Express route idea
router.get("/media/drive/:fileId", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const range = req.headers.range;

    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    const meta = await drive.files.get({
      fileId,
      fields: "size,mimeType",
    });

    const fileSize = Number(meta.data.size);
    const mimeType = meta.data.mimeType || "video/mp4";

    const start = Number(range.replace(/\D/g, ""));
    const CHUNK_SIZE = 10 ** 6;
    const end = Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

    const response = await drive.files.get(
      { fileId, alt: "media" },
      {
        responseType: "stream",
        headers: {
          Range: `bytes=${start}-${end}`,
        },
      },
    );

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mimeType,
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).json({ message: "Unable to stream video" });
  }
});

// GET /api/courses - Get all published courses
router.get("/", optionalAuth, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select("-reviews")
      .limit(100);

    res.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
});

// GET /api/courses/:id - Get course details
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json(course);
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
});

export default router;
