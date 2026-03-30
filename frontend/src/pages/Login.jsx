import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { LiquidButton } from "@/components/animate-ui/primitives/buttons/liquid";
import { showLoginSuccess } from "@/lib/authAlerts";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      return setError('Please provide both email and password.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      await showLoginSuccess(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials.');
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
          <div className="w-12 h-12 mx-auto rounded-full primary-gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(207,150,255,0.4)] mb-4">
            <span className="material-symbols-outlined text-black font-bold">login</span>
          </div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">Access Vault</h1>
          <p className="text-sm text-on-surface-variant">
            Enter your credentials to continue to Kinetic Market.
          </p>
        </div>

        {/* Form Fields */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
            <input 
              id="login-email"
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
              placeholder="ajani@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Password</label>
              <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-semibold">Forgot?</a>
            </div>
            <input 
              id="login-password"
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 w-full">
            <LiquidButton 
              disabled={loading}
              color="#ffffff"
              backgroundColor="rgba(255,255,255,0.08)"
              className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-white hover:text-black border border-white/20 transition-colors duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'AUTHENTICATING...' : 'Sign In'}
            </LiquidButton>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-on-surface-variant">
          New to Kinetic?{" "}
          <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">Create an account</Link>
        </div>

      </div>
    </div>
  );
}
