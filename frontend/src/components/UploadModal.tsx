import React, { useState, useEffect, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Loader, CheckCircle, ChevronRight } from 'lucide-react';
import { CurriculumAudit } from './CurriculumAudit';
import { SubjectMappingScreen } from './SubjectMappingScreen';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  onSuccess: (data: any) => void;
  token: string;
  logout: () => void;
}

const STEPS = ['Select File', 'Parse', 'Confirm'];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, title, endpoint, onSuccess, token, logout }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [curriculumCategories, setCurriculumCategories] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const currentStep = !file ? 0 : !parsedData ? 1 : 2;

  useEffect(() => {
    if (isOpen && endpoint === 'result' && token) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) { logout(); return null; }
          return res.json();
        })
        .then((data) => { if (data?.categories) setCurriculumCategories(data.categories); })
        .catch(console.error);
    }
    if (isOpen) {
      setFile(null);
      setParsedData(null);
      setError(null);
      setSelectedSemester('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, endpoint, token]);

  // ── All hooks must be declared before any early return ──
  const applyFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setParsedData(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') applyFile(dropped);
    else setError('Please drop a PDF file.');
  }, [applyFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) applyFile(e.target.files[0]);
  }, [applyFile]);

  if (!isOpen) return null;


  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/extract/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        let data = await res.json();
        if (endpoint === 'result' && selectedSemester && Array.isArray(data)) {
          data = data.map((item: any) => ({ ...item, semester: `Semester ${selectedSemester}` }));
        }
        setParsedData(data);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to parse file');
      }
    } catch {
      setError('Network error occurred during parsing');
    }
    setLoading(false);
  };

  const handleConfirmCurriculum = async () => {
    if (!parsedData) return;
    setLoading(true);
    setError(null);
    try {
      const isOnline = endpoint === 'online-curriculum' || endpoint === 'open-elective' || endpoint === 'minor-course';
      let saveEndpointPath = '/api/curriculums';
      if (endpoint === 'open-elective') saveEndpointPath = '/api/curriculums/open-elective';
      else if (endpoint === 'minor-course') saveEndpointPath = '/api/curriculums/minor-course';
      else if (endpoint === 'online-curriculum') saveEndpointPath = '/api/curriculums/online';

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const saveRes = await fetch(`${apiUrl}${saveEndpointPath}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(isOnline ? parsedData.categories[0].courses : parsedData),
      });
      if (saveRes.ok) {
        if (!isOnline) {
          const savedCurriculum = await saveRes.json();
          await fetch(`${apiUrl}/api/students?name=Student&curriculum_id=${savedCurriculum.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        onSuccess(parsedData);
        onClose();
      } else {
        setError('Failed to save curriculum');
      }
    } catch {
      setError('Network error occurred while saving');
    }
    setLoading(false);
  };

  const handleConfirmResults = async (resolvedResults: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const saveRes = await fetch(`${apiUrl}/api/results`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(resolvedResults),
      });
      if (saveRes.ok) { onSuccess(resolvedResults); onClose(); }
      else setError('Failed to save results');
    } catch {
      setError('Network error occurred while saving');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.2)] w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* ── Header ───────────────────────────── */}
        <div className="relative px-7 pt-7 pb-5">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-t-3xl" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800">{title}</h2>
              <p className="text-slate-400 text-sm mt-0.5">Upload a PDF to get started</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mt-5">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Body ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-7 py-4 custom-scrollbar">
          {!parsedData ? (
            <div className="space-y-5">
              {/* Semester selector */}
              {endpoint === 'result' && (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Semester Override <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 bg-white text-sm transition-all"
                  >
                    <option value="">Auto-detect from PDF</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s.toString()}>Semester {s}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1.5">If auto-detect fails, force all subjects to a specific semester.</p>
                </div>
              )}

              {/* Drag & drop zone */}
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-lg shadow-indigo-100'
                    : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/40'
                }`}
              >
                <div className={`flex flex-col items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                    <Upload className={`w-7 h-7 transition-colors duration-300 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">
                    {isDragging ? 'Drop it here!' : 'Drag & drop your PDF here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">or <span className="text-indigo-600 font-semibold">browse files</span> · PDF only · Max 5MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>

              {/* Selected file card */}
              {file && (
                <div className="flex items-center gap-4 p-4 bg-white border border-indigo-100 rounded-2xl shadow-sm animate-fade-up">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="text-indigo-500 w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-100 rounded-2xl animate-fade-up">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-300 w-full h-full">
              {endpoint === 'curriculum' || endpoint === 'online-curriculum' ? (
                <div className="space-y-5">
                  <CurriculumAudit data={parsedData} />
                  {error && (
                    <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-100 rounded-2xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  <SubjectMappingScreen results={parsedData} curriculumCategories={curriculumCategories} onConfirm={handleConfirmResults} />
                  {error && (
                    <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-100 rounded-2xl mt-4">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────── */}
        {(!parsedData || endpoint === 'curriculum' || endpoint === 'online-curriculum') && (
          <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            {!parsedData ? (
              <button
                onClick={handleParse}
                disabled={!file || loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Parsing PDF...
                  </>
                ) : (
                  <>
                    Parse Document
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleConfirmCurriculum}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Save
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
