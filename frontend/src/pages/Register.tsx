import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { score: 0, label: '', color: '' };
  if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-500' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        // Auto-login: get token right after registration so user doesn't need to re-enter credentials
        const loginForm = new URLSearchParams();
        loginForm.append('username', email);
        loginForm.append('password', password);
        const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginForm,
        });
        if (loginRes.ok) {
          const tokenData = await loginRes.json();
          login(tokenData.access_token);
          setTimeout(() => navigate('/'), 1000);
        } else {
          setTimeout(() => navigate('/login'), 1600);
        }
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Registration failed');
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800" />

        {/* Animated blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-fuchsia-500/25 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* Grid overlay */}
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

          {/* Steps */}
          <div className="mb-10 animate-fade-up delay-100">
            <h2 className="text-4xl font-black leading-tight mb-4">
              Your graduation<br />
              tracker in{' '}
              <span className="relative">
                3 steps.
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
              </span>
            </h2>
          </div>

          <div className="space-y-5 animate-fade-up delay-200">
            {[
              { step: '01', title: 'Upload your curriculum PDF', desc: 'We parse your department syllabus automatically.' },
              { step: '02', title: 'Upload semester results', desc: 'Drop your marksheet and we extract every grade.' },
              { step: '03', title: 'Track your progress', desc: 'See credits earned, remaining, GPA & CGPA live.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="shrink-0 w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black text-white/70">
                  {item.step}
                </span>
                <div>
                  <p className="font-bold text-white text-sm">{item.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-900/25 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10 animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white">CreditTracker</span>
          </div>

          {success ? (
            /* Success state */
            <div className="text-center animate-scale-in">
              <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Account created!</h2>
              <p className="text-slate-400 text-sm">Signing you in automatically...</p>
              <div className="mt-6 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[grow_1.6s_linear_forwards]" style={{ width: '100%', animation: 'shimmer 1.6s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Create account</h2>
                <p className="text-slate-400">Free to start. No credit card needed.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-up">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-red-500/20 rounded-full text-xs font-bold">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors z-10" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors z-10" />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {password && (
                    <div className="mt-2 space-y-1 animate-fade-up">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= strength.score ? strength.color : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Strength: <span className={`font-bold ${strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'}`}>{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 overflow-hidden group mt-6"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
