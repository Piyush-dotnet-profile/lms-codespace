import express from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      message: "Error checking admin status",
      error: error.message,
    });
  }
};

// GET /api/admin/courses - Get all courses (admin)
router.get("/courses", authenticateToken, isAdmin, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Get admin courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
});

// POST /api/admin/courses - Create a new course
router.post("/courses", authenticateToken, isAdmin, async (req, res) => {
  try {
    const courseData = req.body;

    // Validate required fields
    if (
      !courseData.title ||
      !courseData.description ||
      !courseData.instructor
    ) {
      return res.status(400).json({
        message: "Title, description, and instructor are required",
      });
    }

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      message: "Error creating course",
      error: error.message,
    });
  }
});

// PATCH /api/admin/courses/:id - Update a course
router.patch("/courses/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findByIdAndUpdate(id, courseData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      message: "Error updating course",
      error: error.message,
    });
  }
});

// DELETE /api/admin/courses/:id - Delete a course
router.delete("/courses/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
});

// POST /api/admin/courses/:courseId/modules - Add module to course
router.post(
  "/courses/:courseId/modules",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const moduleData = req.body;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (!moduleData.title) {
        return res.status(400).json({
          message: "Module title is required",
        });
      }

      course.modules.push(moduleData);
      await course.save();

      res.json({
        message: "Module added successfully",
        course,
      });
    } catch (error) {
      console.error("Add module error:", error);
      res.status(500).json({
        message: "Error adding module",
        error: error.message,
      });
    }
  },
);

// PATCH /api/admin/courses/:courseId/modules/:moduleId - Update module
router.patch(
  "/courses/:courseId/modules/:moduleId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const moduleData = req.body;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const module = course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({
          message: "Module not found",
        });
      }

      // Update module fields
      Object.assign(module, moduleData);
      await course.save();

      res.json({
        message: "Module updated successfully",
        course,
      });
    } catch (error) {
      console.error("Update module error:", error);
      res.status(500).json({
        message: "Error updating module",
        error: error.message,
      });
    }
  },
);

// DELETE /api/admin/courses/:courseId/modules/:moduleId - Delete module
router.delete(
  "/courses/:courseId/modules/:moduleId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const moduleIndex = course.modules.findIndex(
        (m) => m._id.toString() === moduleId,
      );
      if (moduleIndex === -1) {
        return res.status(404).json({
          message: "Module not found",
        });
      }

      course.modules.splice(moduleIndex, 1);
      await course.save();

      res.json({
        message: "Module deleted successfully",
        course,
      });
    } catch (error) {
      console.error("Delete module error:", error);
      res.status(500).json({
        message: "Error deleting module",
        error: error.message,
      });
    }
  },
);

export default router;
