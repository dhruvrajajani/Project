import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { LiquidButton } from "@/components/animate-ui/primitives/buttons/liquid";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      return setError("Please fill in all fields.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.msg || "An error occurred during registration.";
      const details = err.response?.data?.details
        ? ` Details: ${err.response?.data?.details}`
        : "";
      setError(msg + details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-1 items-start justify-center px-4 pb-8 pt-6 pointer-events-none sm:px-6 sm:pt-8">
      {/* Monolith Card */}
      <div className="pointer-events-auto relative z-10 flex w-full max-w-md flex-col gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-xl backdrop-blur-sm sm:gap-8 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center shadow-[0_0_20px_rgba(56,255,236,0.4)] mb-4">
            <span className="material-symbols-outlined text-black font-bold">
              person_add
            </span>
          </div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">
            Create Profile
          </h1>
          <p className="text-sm text-on-surface-variant">
            Register your operative status to begin trading.
          </p>
        </div>

        {/* Form Fields */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="signup-username" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Operative Code (Username)
            </label>
            <input
              id="signup-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
              placeholder="Dhruvraj Ajani"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
              placeholder="ajani@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 w-full">
            <LiquidButton
              disabled={loading}
              color="#ffffff"
              backgroundColor="rgba(255,255,255,0.08)"
              className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-white hover:text-black border border-white/20 transition-colors duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Registering..." : "Register Account"}
            </LiquidButton>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-on-surface-variant">
          Already an operative?{" "}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
