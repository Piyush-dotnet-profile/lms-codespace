import React, { useEffect, useState } from "react";
import { checkQuizUnlock, getQuiz, submitQuiz } from "../utils/progressApi";
import QuizResults from "./QuizResults";

export default function Quiz({ courseId }) {
  const [quizState, setQuizState] = useState("checking"); // checking, locked, loading, ready, submitting, completed, attemptsExceeded
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [unlockInfo, setUnlockInfo] = useState(null);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);

  // Check if quiz is unlocked
  useEffect(() => {
    const checkQuiz = async () => {
      try {
        const unlockStatus = await checkQuizUnlock(courseId);
        setUnlockInfo(unlockStatus);
        setAttemptsRemaining(unlockStatus.attemptsRemaining || 0);

        if (!unlockStatus.isUnlocked) {
          setQuizState("locked");
          return;
        }

        // Check if max attempts reached
        if (unlockStatus.maxAttemptsReached) {
          setQuizState("attemptsExceeded");
          return;
        }

        if (unlockStatus.alreadyCompleted) {
          // Load previous results
          setQuizState("completed");
          return;
        }

        // Fetch quiz questions
        setQuizState("loading");
        const quizData = await getQuiz(courseId);
        setQuiz(quizData);

        // Initialize answers object
        const initialAnswers = {};
        quizData.questions.forEach((q) => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);

        setQuizState("ready");
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError(err.message || "Failed to load quiz");
        setQuizState("locked");
      }
    };

    checkQuiz();
  }, [courseId]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    // Validate all answers are selected
    const allAnswered = Object.values(answers).every((ans) => ans !== null);
    if (!allAnswered) {
      setError("Please answer all questions before submitting");
      return;
    }

    try {
      setQuizState("submitting");
      setError("");

      const result = await submitQuiz(courseId, answers);
      setResults(result);
      setQuizState("completed");
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError(err.message || "Failed to submit quiz");
      setQuizState("ready");
    }
  };

  const unansweredCount = Object.values(answers).filter(
    (ans) => ans === null,
  ).length;

  // Locked state
  if (quizState === "locked") {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          Quiz Locked
        </h3>
        <p className="text-amber-800 mb-4">
          Complete at least {unlockInfo?.requiredProgress || 50}% of the course
          to unlock the quiz.
        </p>
        {unlockInfo && (
          <div className="space-y-2 text-sm text-amber-700">
            <p>
              Current progress:{" "}
              <span className="font-semibold">
                {unlockInfo.currentProgress}%
              </span>
            </p>
            <p>
              Progress needed:{" "}
              <span className="font-semibold">
                {unlockInfo.requiredProgress - unlockInfo.currentProgress}%
              </span>
            </p>
            <div className="mt-3 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all"
                style={{
                  width: `${(unlockInfo.currentProgress / unlockInfo.requiredProgress) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (quizState === "loading") {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <div className="inline-block">
          <svg
            className="w-8 h-8 animate-spin text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12a8 8 0 018-8V0c4.418 0 8 3.582 8 8h-2z"
            />
          </svg>
        </div>
        <p className="mt-4 text-slate-600">Loading quiz questions...</p>
      </div>
    );
  }

  // Completed state
  if (quizState === "completed" && results) {
    return <QuizResults results={results} courseId={courseId} />;
  }

  // Attempts Exceeded state
  if (quizState === "attemptsExceeded") {
    return (
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 4v2m0-4v2m0-4v2m6-8a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Maximum Attempts Reached
        </h3>
        <p className="text-red-800 mb-6">
          You have exhausted all 3 quiz attempts. You cannot retake this quiz
          anymore.
        </p>
        {unlockInfo && (
          <div className="space-y-2 text-sm text-red-700">
            <p>
              Total attempts used:{" "}
              <span className="font-semibold">{unlockInfo.totalAttempts}</span>
            </p>
            <p>
              Best score:{" "}
              <span className="font-semibold">
                {unlockInfo.bestScore || "N/A"}
              </span>
            </p>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Go Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Ready state
  if (quizState === "ready" && quiz) {
    const question = quiz.questions[currentQuestion];
    const isAnswered = answers[question._id] !== null;
    const totalAnswered = Object.values(answers).filter(
      (ans) => ans !== null,
    ).length;

    return (
      <div className="rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
        {/* Quiz header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-white/90">{quiz.description}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {quiz.totalQuestions}
            </span>
            <div className="flex items-center gap-4">
              {attemptsRemaining < 3 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Attempts remaining: {attemptsRemaining}/3
                </span>
              )}
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {totalAnswered}/{quiz.totalQuestions} answered
              </span>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width: `${((currentQuestion + 1) / quiz.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Quiz content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              {question.questionText}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question._id, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[question._id] === index
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        answers[question._id] === index
                          ? "border-orange-500 bg-orange-500"
                          : "border-slate-300"
                      }`}
                    >
                      {answers[question._id] === index && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-slate-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-medium hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {quiz.questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`h-10 w-10 rounded-full font-semibold transition ${
                    answers[q._id] !== null
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : idx === currentQuestion
                        ? "bg-orange-500 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion === quiz.totalQuestions - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={unansweredCount > 0}
                className="px-6 py-3 rounded-full bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {unansweredCount > 0
                  ? `Answer ${unansweredCount} more`
                  : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-6 py-3 rounded-full bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
