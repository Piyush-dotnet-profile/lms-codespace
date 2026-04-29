import React, { useState, useEffect } from "react";

export default function AdminCourseForm({ course, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "Web Development",
    level: "Beginner",
    duration: "Self-paced",
    expectedTime: "Flexible",
    modules: [],
    quiz: {
      title: "Final Quiz",
      description: "Test your knowledge",
      questions: [],
      passingScore: 60,
      unlockPercentage: 50,
    },
    tags: [],
    isPublished: true,
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData(course);
    }
  }, [course]);

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        [name]:
          name.includes("Score") || name.includes("Percentage")
            ? parseInt(value)
            : value,
      },
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [
          ...prev.quiz.questions,
          {
            questionText: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0,
            explanation: "",
          },
        ],
      },
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData((prev) => {
      const questions = [...prev.quiz.questions];
      questions[index] = { ...questions[index], [field]: value };
      return {
        ...prev,
        quiz: { ...prev.quiz, questions },
      };
    });
  };

  const updateQuestionOption = (qIndex, oIndex, value) => {
    setFormData((prev) => {
      const questions = [...prev.quiz.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return {
        ...prev,
        quiz: { ...prev.quiz, questions },
      };
    });
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter((_, i) => i !== index),
      },
    }));
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: "",
          description: "",
          content: "",
          video: {
            title: "",
            url: "", // This is the Drive File ID
            duration: 0,
          },
          documents: [],
          unlockPercentage: 50,
          order: prev.modules.length + 1,
        },
      ],
    }));
  };

  const updateModule = (index, field, value) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      modules[index] = { ...modules[index], [field]: value };
      return { ...prev, modules };
    });
  };

  const updateModuleVideo = (index, field, value) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      modules[index].video = { ...modules[index].video, [field]: value };
      return { ...prev, modules };
    });
  };

  const removeModule = (index) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const method = course ? "PATCH" : "POST";
      const endpoint = course
        ? `${import.meta.env.VITE_API_URL}/api/admin/courses/${course._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/courses`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save course");
      }

      onSave();
    } catch (err) {
      console.error("Save course error:", err);
      setError(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">
          {course ? "Edit Course" : "Create New Course"}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-orange-100">
        <div className="flex gap-8">
          {["basic", "modules", "quiz"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 font-semibold border-b-2 transition capitalize ${
                activeTab === tab
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6 rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleBasicChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., Web Development Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleBasicChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              placeholder="Course description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleBasicChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                placeholder="Instructor name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              >
                <option>Web Development</option>
                <option>UI/UX Design</option>
                <option>Data Fundamentals</option>
                <option>Career Skills</option>
                <option>Productivity</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Expected Time
              </label>
              <input
                type="text"
                name="expectedTime"
                value={formData.expectedTime}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                placeholder="e.g., 4-6 weeks"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleBasicChange}
              className="w-5 h-5 rounded border border-slate-300"
            />
            <span className="font-semibold text-slate-900">Publish course</span>
          </label>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Modules</h3>
            <button
              type="button"
              onClick={addModule}
              className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200 transition"
            >
              + Add Module
            </button>
          </div>

          {formData.modules.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center">
              <p className="text-slate-600">
                No modules yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.modules.map((module, mIndex) => (
                <div
                  key={mIndex}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">
                      Module {mIndex + 1}: {module.title || "Untitled"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeModule(mIndex)}
                      className="px-3 py-1 rounded-full text-red-600 hover:bg-red-50 transition text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) =>
                        updateModule(mIndex, "title", e.target.value)
                      }
                      placeholder="Module title"
                      className="px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={module.unlockPercentage}
                      onChange={(e) =>
                        updateModule(
                          mIndex,
                          "unlockPercentage",
                          parseInt(e.target.value),
                        )
                      }
                      placeholder="Unlock percentage"
                      className="px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <textarea
                    value={module.description}
                    onChange={(e) =>
                      updateModule(mIndex, "description", e.target.value)
                    }
                    placeholder="Module description"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                  />

                  <div className="border-t border-slate-200 pt-4">
                    <h5 className="font-semibold text-slate-900 mb-3">Video</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={module.video.title}
                        onChange={(e) =>
                          updateModuleVideo(mIndex, "title", e.target.value)
                        }
                        placeholder="Video title"
                        className="px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={module.video.url}
                        onChange={(e) =>
                          updateModuleVideo(mIndex, "url", e.target.value)
                        }
                        placeholder="Google Drive File ID (not full URL)"
                        className="px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      💡 Tip: Paste only the File ID from the Google Drive URL,
                      not the full URL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && (
        <div className="space-y-6 rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.quiz.title}
              onChange={handleQuizChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.quiz.passingScore}
                onChange={handleQuizChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Unlock at (% of course)
              </label>
              <input
                type="number"
                name="unlockPercentage"
                value={formData.quiz.unlockPercentage}
                onChange={handleQuizChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Questions</h4>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200 transition text-sm"
              >
                + Add Question
              </button>
            </div>

            {formData.quiz.questions.length === 0 ? (
              <div className="text-center text-slate-600 py-8">
                No questions yet. Add one to create your quiz!
              </div>
            ) : (
              <div className="space-y-6">
                {formData.quiz.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="rounded-lg border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-slate-900">
                        Question {qIndex + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    <textarea
                      value={question.questionText}
                      onChange={(e) =>
                        updateQuestion(qIndex, "questionText", e.target.value)
                      }
                      placeholder="Question text"
                      rows={2}
                      className="w-full px-3 py-2 rounded border border-slate-200 focus:border-orange-500 focus:outline-none text-sm"
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700">
                        Options
                      </p>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswerIndex === oIndex}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateQuestion(
                                  qIndex,
                                  "correctAnswerIndex",
                                  oIndex,
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateQuestionOption(
                                qIndex,
                                oIndex,
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 px-3 py-2 rounded border border-slate-200 focus:border-orange-500 focus:outline-none text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(qIndex, "explanation", e.target.value)
                      }
                      placeholder="Explanation (optional)"
                      rows={2}
                      className="w-full px-3 py-2 rounded border border-slate-200 focus:border-orange-500 focus:outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 justify-end pt-6 border-t border-orange-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Course"}
        </button>
      </div>
    </form>
  );
}
