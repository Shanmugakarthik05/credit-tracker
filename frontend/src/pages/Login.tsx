import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp, Award } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        login(data.access_token);
        navigate('/');
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-950 font-sans">

      {/* ── Left Panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-16 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900" />

        {/* Animated blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-500/25 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] rounded-full bg-indigo-300/15 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-md text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 animate-fade-up">
            <div className="w-14 h-14 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">CreditTracker</h1>
              <p className="text-white/60 text-xs font-medium tracking-wider uppercase">Academic Intelligence</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-12 animate-fade-up delay-100">
            <h2 className="text-5xl font-black leading-[1.1] mb-4">
              Track every<br />
              <span className="relative inline-block">
                credit.
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
              </span>
              <br />
              <span className="text-white/70">Own your</span> degree.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Upload your results, visualize your progress, and never lose track of what you need to graduate.
            </p>
          </div>

          {/* Stats cards */}
          <div className="flex gap-3 animate-fade-up delay-200">
            {[
              { icon: TrendingUp, label: 'GPA Tracked', value: '9.1+', color: 'from-emerald-400/20 to-cyan-400/20' },
              { icon: Award, label: 'Credits Monitored', value: '160+', color: 'from-violet-400/20 to-fuchsia-400/20' },
              { icon: Sparkles, label: 'Smart Analysis', value: 'AI', color: 'from-amber-400/20 to-orange-400/20' },
            ].map((stat) => (
              <div key={stat.label} className={`flex-1 bg-gradient-to-br ${stat.color} border border-white/15 rounded-2xl p-4 backdrop-blur-sm`}>
                <stat.icon className="w-5 h-5 text-white/70 mb-2" />
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10 animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white">CreditTracker</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-up">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-red-500/20 rounded-full text-xs font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            {/* Password input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 overflow-hidden group mt-6"
            >
              {/* Shimmer overlay */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
