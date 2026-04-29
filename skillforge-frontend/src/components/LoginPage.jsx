import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <div className="relative flex items-center justify-center overflow-hidden px-6 sm:px-8 lg:px-12 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.10),_transparent_30%)]" />

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-orange-100 bg-white px-4 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold">
                SF
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Skill Forge
                </p>
                <p className="text-xs text-slate-500">
                  Learning Management System
                </p>
              </div>
            </div>

            <h1 className="max-w-md text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome back to your learning space.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Log in to continue your courses, track your progress, and access
              your dashboard.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Access your courses instantly",
                "Continue from where you stopped",
                "Track module progress easily",
                "Stay organized in one dashboard",
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
          <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/50">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Login
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your details to access your account.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-orange-100 bg-[#FFFDFB] px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-orange-100 bg-[#FFFDFB] px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-orange-700 hover:text-orange-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
