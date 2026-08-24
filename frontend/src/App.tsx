import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import {
  BookOpen, GraduationCap, Upload, LogOut, Award, BarChart3,
  AlertTriangle, Trash2, Rocket, FileCheck, ChartLine, Sparkles,
  ChevronRight, TrendingUp,
} from 'lucide-react';
import { UploadModal } from './components/UploadModal';
import { Chatbot } from './components/Chatbot';
import { CalculationBreakdownModal } from './components/CalculationBreakdownModal';
import DeveloperCard from './components/DeveloperCard';

function App() {
  const { token, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'performance'>('curriculum');
  const [activeModal, setActiveModal] = useState<'curriculum' | 'result' | 'online-curriculum' | null>(null);
  const [activeBreakdown, setActiveBreakdown] = useState<any>(null);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const [res, semRes] = await Promise.all([
        fetch(`${apiUrl}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/dashboard/semesters`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (res.status === 401) { logout(); return; }
      if (res.ok && semRes.ok) {
        const data = await res.json();
        data.semesters = await semRes.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (e) {
      console.error(e);
      setStats(null);
    }
    setLoading(false);
  }, [token, logout]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all your data? This will delete all uploaded results and curriculum progress.')) {
      try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/student/reset`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchStats();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Derive user initials for avatar
  const userEmail = token ? (() => { try { return JSON.parse(atob(token.split('.')[1])).sub ?? ''; } catch { return ''; } })() : '';
  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900 font-sans selection:bg-indigo-100 relative overflow-x-hidden">

      {/* Decorative bg blobs */}
      <div className="fixed top-[-15%] left-[-8%] w-[38%] h-[38%] rounded-full bg-indigo-200/35 mix-blend-multiply filter blur-3xl opacity-70 animate-float pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-8%] w-[38%] h-[38%] rounded-full bg-purple-200/35 mix-blend-multiply filter blur-3xl opacity-70 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* ── Top Navigation ──────────────────────────────── */}
      <header className="bg-white/75 backdrop-blur-2xl border-b border-white/60 sticky top-0 z-40 shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200/60 hover:scale-105 transition-transform duration-300">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-shimmer hidden sm:block">CreditTracker</span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('curriculum')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Curriculum</span>
            </button>
            <button
              onClick={() => setActiveModal('online-curriculum')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-200"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Online Curriculum</span>
            </button>
            <button
              onClick={() => setActiveModal('result')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Result</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Reset Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* User avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-200 ml-1 shrink-0">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {loading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center h-64 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-indigo-50 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-slate-400 font-semibold animate-pulse">Loading your academic profile...</p>
          </div>

        ) : stats ? (
          /* Dashboard */
          <div className="space-y-8 animate-fade-up">

            {/* ── Tab Switcher ── */}
            <div className="flex glass-card p-1.5 w-fit rounded-2xl mx-auto">
              {[
                { id: 'curriculum', label: 'Curriculum Tracker', icon: BookOpen },
                { id: 'performance', label: 'Performance Dashboard', icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ══ CURRICULUM TAB ══ */}
            {activeTab === 'curriculum' && (
              <div className="space-y-8 animate-fade-up">

                {/* Hero Progress Banner */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl shadow-indigo-900/20 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-900" />
                  <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-fuchsia-500/30 rounded-full blur-[80px] animate-pulse-glow" />
                  <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-cyan-500/30 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                  {/* Dot grid */}
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-5 flex-1 w-full">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest uppercase">B.Tech / 2024 Batch</span>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg ${
                          stats.graduation_status === 'Complete'
                            ? 'bg-emerald-400 text-emerald-950 shadow-emerald-500/20'
                            : 'bg-amber-400 text-amber-950 shadow-amber-500/20'
                        }`}>
                          {stats.graduation_status}
                        </span>
                      </div>

                      <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                        {Math.round(stats.total_required_credits > 0 ? (stats.completed_credits / stats.total_required_credits) * 100 : 0)}%
                        <span className="block text-indigo-200 text-3xl md:text-4xl font-semibold opacity-90 tracking-normal mt-1">Journey Completed</span>
                      </h2>

                      <div className="pt-4">
                        <div className="flex justify-between text-sm font-semibold text-indigo-100 mb-3 tracking-wide">
                          <span>{stats.completed_credits} Credits Earned</span>
                          <span>{stats.total_required_credits} Required</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-md overflow-hidden p-0.5 shadow-inner">
                          <div
                            className="progress-shimmer bg-gradient-to-r from-emerald-400 to-cyan-300 h-full rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-1000"
                            style={{ width: `${stats.total_required_credits > 0 ? Math.min(100, (stats.completed_credits / stats.total_required_credits) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-6 flex-1 min-w-32 text-center transform transition-transform group-hover:scale-105 duration-500">
                        <p className="text-indigo-200 text-xs font-bold tracking-widest uppercase mb-2">Remaining</p>
                        <p className="text-4xl font-black">{stats.remaining_credits}</p>
                      </div>
                      <div className="bg-red-950/30 border border-red-400/20 backdrop-blur-md rounded-3xl p-6 flex-1 min-w-32 text-center transform transition-transform group-hover:scale-105 duration-500 delay-75">
                        <p className="text-red-300 text-xs font-bold tracking-widest uppercase mb-2">Failed</p>
                        <p className="text-4xl font-black text-red-200">{stats.failed_credits}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Category Requirements</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {stats.categories.map((cat: any, idx: number) => {
                      const percent = cat.required_credits > 0 ? Math.min(100, (cat.completed_credits / cat.required_credits) * 100) : 0;
                      const isComplete = cat.required_credits > 0 && percent >= 100;
                      const remainingCredits = Math.max(0, cat.required_credits - cat.completed_credits);

                      return (
                        <div
                          key={idx}
                          className="glass-card rounded-[1.5rem] p-6 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgb(0,0,0,0.07)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between animate-fade-up"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          {/* Color stripe */}
                          <div className={`absolute top-0 left-0 w-full h-1 ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />

                          <div>
                            <div className="flex justify-between items-start mb-5">
                              <h4 className="font-bold text-slate-800 text-base leading-snug pr-4 group-hover:text-indigo-700 transition-colors">{cat.name}</h4>
                              <div className={`p-2 rounded-xl shadow-inner shrink-0 ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isComplete ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                <span><strong className="text-slate-800 text-sm">{cat.completed_credits}</strong> / {cat.required_credits} CR</span>
                                <span className={`font-black ${isComplete ? 'text-emerald-600' : 'text-slate-700'}`}>{Math.round(percent)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 progress-shimmer' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              {!isComplete && (
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">
                                  <span>Remaining: {remainingCredits} CR</span>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {(cat.failed_credits > 0 || cat.extra_credits > 0) && (
                              <div className="flex gap-2 flex-wrap">
                                {cat.failed_credits > 0 && (
                                  <span className="text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg text-xs font-bold">{cat.failed_credits} Failed</span>
                                )}
                                {cat.extra_credits > 0 && (
                                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold">+{cat.extra_credits} Extra</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Suggestion */}
                          <div className="mt-4 pt-4 border-t border-slate-100/60">
                            {isComplete ? (
                              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50/60 p-2.5 rounded-xl">
                                <span className="text-base">✨</span> Requirement fully satisfied!
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 leading-relaxed">
                                <strong className="text-slate-700">Tip:</strong> Need <strong className="text-indigo-600">{remainingCredits}</strong> more cr.
                                Take {remainingCredits > 3 ? `~${Math.ceil(remainingCredits / 3)} subjects` : '1 subject'} next sem.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PERFORMANCE TAB ══ */}
            {activeTab === 'performance' && (
              <div className="space-y-8 animate-fade-up">
                {stats.semesters && stats.semesters.length > 0 ? (
                  <>
                    {/* CGPA Hero */}
                    <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl group">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700" />
                      <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-pink-400/25 rounded-full blur-[80px] animate-pulse-glow" />
                      <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-300/20 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                          <p className="text-violet-200 font-bold tracking-widest uppercase text-sm mb-2">Overall Academic Performance</p>
                          <div className="flex items-end gap-4">
                            <h2 className="text-6xl font-black">
                              {stats.semesters[stats.semesters.length - 1].cgpa?.toFixed(2) || 'N/A'}
                            </h2>
                            <div className="pb-2">
                              <p className="text-violet-200 text-sm font-bold">CGPA</p>
                              <p className="text-white/50 text-xs">{stats.semesters.length} Semester{stats.semesters.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-24 h-24 bg-white/15 border border-white/25 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-inner transform transition-transform group-hover:rotate-12 duration-500">
                          <Award className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Semester cards */}
                    <div>
                      <div className="flex items-center gap-3 mb-6 px-1">
                        <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Semester Performance</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {stats.semesters.map((sem: any, idx: number) => (
                          <div
                            key={idx}
                            className="glass-card rounded-[1.5rem] p-7 flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-fade-up"
                            style={{ animationDelay: `${idx * 80}ms` }}
                          >
                            {/* Glow blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-15 -mr-10 -mt-10 transition-opacity group-hover:opacity-35 ${sem.status === 'All Clear' ? 'bg-emerald-400' : 'bg-red-400'}`} />

                            <div>
                              <div className="flex justify-between items-start mb-6">
                                <h4 className="font-black text-slate-800 text-xl uppercase tracking-wide group-hover:text-indigo-700 transition-colors">{sem.semester}</h4>
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                                  sem.status === 'All Clear'
                                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                                    : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                }`}>
                                  {sem.status}
                                </span>
                              </div>

                              <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4 border-b pb-5 border-slate-100">
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Semester GPA</p>
                                    <p className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                      {sem.gpa !== null ? sem.gpa.toFixed(2) : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="text-right border-l pl-4 border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cumulative</p>
                                    <p className="text-2xl font-bold text-slate-700 mt-2">
                                      {sem.cgpa !== null ? sem.cgpa.toFixed(2) : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                                  <BookOpen className="w-4 h-4 text-indigo-400" />
                                  {sem.courses_count} Subjects Processed
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setActiveBreakdown(sem)}
                              className="mt-5 w-full py-2.5 bg-white border-2 border-indigo-50 text-indigo-600 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 group/btn"
                            >
                              View Detailed Breakdown
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                      <BarChart3 className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-700 mb-2">No Performance Data Yet</h3>
                    <p className="text-slate-400 max-w-sm mb-6">Upload your semester results to see your GPA and CGPA calculations here.</p>
                    <button
                      onClick={() => setActiveModal('result')}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <Upload className="w-4 h-4" /> Upload Result
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        ) : (
          /* ── Empty / Onboarding State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
            {/* Animated icon */}
            <div className="relative w-28 h-28 mb-8">
              <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping-slow opacity-60" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200">
                <GraduationCap className="w-14 h-14 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black text-slate-800 mb-3">Welcome to CreditTracker</h2>
            <p className="text-slate-400 max-w-md mb-12 text-lg leading-relaxed">
              Upload your department's curriculum to unlock your personalized graduation progress tracker.
            </p>

            {/* Workflow steps */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-2xl">
              {[
                { icon: FileCheck, step: '01', title: 'Upload Curriculum', desc: 'Your department syllabus PDF', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                { icon: ChartLine, step: '02', title: 'Upload Results', desc: 'Your semester marksheets', color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-50', border: 'border-violet-100' },
                { icon: Sparkles, step: '03', title: 'Track Progress', desc: 'GPA, CGPA & credits live', color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
              ].map((item, i) => (
                <div key={i} className={`flex-1 ${item.bg} border ${item.border} rounded-2xl p-5 text-left`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-md`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{item.step}</span>
                  <h4 className="font-black text-slate-700 text-sm mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal('curriculum')}
              className="flex items-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-300/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Get Started — Upload Curriculum
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>

      {/* ── Modals ─────────────────────────────────────── */}
      <UploadModal isOpen={activeModal === 'curriculum'} onClose={() => setActiveModal(null)} title="Upload Curriculum PDF" endpoint="curriculum" token={token ?? ''} logout={logout} onSuccess={() => fetchStats()} />
      <UploadModal isOpen={activeModal === 'result'} onClose={() => setActiveModal(null)} title="Upload Semester Result" endpoint="result" token={token ?? ''} logout={logout} onSuccess={() => fetchStats()} />
      <UploadModal isOpen={activeModal === 'online-curriculum'} onClose={() => setActiveModal(null)} title="Upload Online Curriculum" endpoint="online-curriculum" token={token ?? ''} logout={logout} onSuccess={() => fetchStats()} />
      <CalculationBreakdownModal isOpen={activeBreakdown !== null} onClose={() => setActiveBreakdown(null)} semesterData={activeBreakdown} />

      <Chatbot />

      {/* Developer Credit Footer */}
      <footer className="py-8 px-8">
        <DeveloperCard />
      </footer>
    </div>
  );
}

export default App;
