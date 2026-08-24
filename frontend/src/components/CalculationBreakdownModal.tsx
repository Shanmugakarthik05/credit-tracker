import React from 'react';
import { X, Calculator, Info, TrendingUp } from 'lucide-react';

interface CourseDetail {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  is_passed: boolean;
  grade_point: number;
  earned_points: number;
  included_in_gpa: boolean;
}

interface SemesterData {
  semester: string;
  gpa: number | null;
  cgpa: number | null;
  status: string;
  courses_count: number;
  sem_credits: number;
  sem_points: number;
  cum_credits: number;
  cum_points: number;
  course_details: CourseDetail[];
}

interface CalculationBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesterData: SemesterData | null;
}

const GRADE_COLORS: Record<string, string> = {
  O:  'bg-violet-100 text-violet-700',
  'A+': 'bg-emerald-100 text-emerald-700',
  A:  'bg-green-100 text-green-700',
  'B+': 'bg-blue-100 text-blue-700',
  B:  'bg-sky-100 text-sky-700',
  C:  'bg-amber-100 text-amber-700',
  D:  'bg-orange-100 text-orange-700',
  F:  'bg-red-100 text-red-700',
  RA: 'bg-red-100 text-red-700',
};

function gradeClass(grade: string, isPassed: boolean) {
  if (!isPassed) return 'bg-red-100 text-red-700';
  return GRADE_COLORS[grade] ?? 'bg-slate-100 text-slate-700';
}

export const CalculationBreakdownModal: React.FC<CalculationBreakdownModalProps> = ({
  isOpen,
  onClose,
  semesterData,
}) => {
  if (!isOpen || !semesterData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.2)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="relative px-7 pt-6 pb-5 border-b border-slate-100">
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-t-3xl" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">{semesterData.semester}</h2>
                <p className="text-sm text-slate-400">GPA & CGPA Calculation Breakdown</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 mt-5">
            {[
              { label: 'Semester GPA', value: semesterData.gpa?.toFixed(2) ?? 'N/A', color: 'from-indigo-50 to-violet-50 border-indigo-100', text: 'text-indigo-700' },
              { label: 'Cumulative CGPA', value: semesterData.cgpa?.toFixed(2) ?? 'N/A', color: 'from-fuchsia-50 to-purple-50 border-fuchsia-100', text: 'text-fuchsia-700' },
              { label: 'Subjects', value: String(semesterData.courses_count), color: 'from-slate-50 to-slate-50 border-slate-100', text: 'text-slate-700' },
              { label: 'Status', value: semesterData.status, color: semesterData.status === 'All Clear' ? 'from-emerald-50 to-teal-50 border-emerald-100' : 'from-red-50 to-orange-50 border-red-100', text: semesterData.status === 'All Clear' ? 'text-emerald-700' : 'text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`flex-1 bg-gradient-to-br ${s.color} border rounded-2xl p-3 text-center`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-lg font-black ${s.text}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-8 custom-scrollbar">

          {/* GPA Calculation */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-black text-slate-800">GPA Calculation</h3>
              <div className="group relative">
                <Info className="w-4 h-4 text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10 shadow-lg">
                  GPA = Total Earned Points ÷ Total Credits (for passed courses this semester only).
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Course</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3 text-center">Pts</th>
                      <th className="px-4 py-3 text-center">Credits</th>
                      <th className="px-4 py-3 text-center">Earned</th>
                      <th className="px-4 py-3 text-center">Included</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {semesterData.course_details.map((course, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors hover:bg-indigo-50/30 ${!course.included_in_gpa ? 'opacity-50' : ''} ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                      >
                        <td className="px-5 py-3">
                          <div className="font-bold text-slate-800 text-xs">{course.course_code}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[220px]">{course.course_name}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black ${gradeClass(course.grade, course.is_passed)}`}>
                            {course.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{course.included_in_gpa ? course.grade_point : '—'}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{course.credits}</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{course.included_in_gpa ? course.earned_points : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {course.included_in_gpa ? (
                            <span className="text-emerald-500 text-xs font-black">✓ Yes</span>
                          ) : (
                            <span className="text-slate-300 text-xs">{course.is_passed ? '0 Cr' : 'Fail'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-50 border-t-2 border-indigo-100 font-black text-indigo-900 text-sm">
                      <td colSpan={3} className="px-5 py-3 text-right">Semester Totals:</td>
                      <td className="px-4 py-3 text-center">{semesterData.sem_credits}</td>
                      <td className="px-4 py-3 text-center text-indigo-600">{semesterData.sem_points}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* GPA Formula */}
            <div className="mt-4 flex items-center justify-center gap-5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5 rounded-2xl">
              {[
                { label: 'Total Points', value: semesterData.sem_points, color: 'text-indigo-700' },
                { sym: '÷' },
                { label: 'Total Credits', value: semesterData.sem_credits, color: 'text-indigo-700' },
                { sym: '=' },
                { label: 'Semester GPA', value: semesterData.gpa?.toFixed(2) ?? 'N/A', color: 'text-violet-700', big: true },
              ].map((item, i) =>
                'sym' in item ? (
                  <span key={i} className="text-2xl font-light text-slate-300">{item.sym}</span>
                ) : (
                  <div key={i} className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className={`font-black ${item.color} ${item.big ? 'text-3xl' : 'text-2xl'}`}>{item.value}</div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* CGPA Calculation */}
          <section className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-fuchsia-500" />
              <h3 className="text-lg font-black text-slate-800">CGPA Calculation (Cumulative)</h3>
            </div>
            <div className="flex items-center justify-center gap-5 bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-100 p-6 rounded-2xl">
              {[
                { label: 'Cumulative Points', value: semesterData.cum_points, color: 'text-fuchsia-700' },
                { sym: '÷' },
                { label: 'Cumulative Credits', value: semesterData.cum_credits, color: 'text-fuchsia-700' },
                { sym: '=' },
                { label: 'CGPA', value: semesterData.cgpa?.toFixed(2) ?? 'N/A', color: 'text-fuchsia-600', big: true },
              ].map((item, i) =>
                'sym' in item ? (
                  <span key={i} className="text-2xl font-light text-slate-300">{item.sym}</span>
                ) : (
                  <div key={i} className={`text-center ${item.big ? 'bg-white px-6 py-3 rounded-2xl shadow-sm border border-fuchsia-100' : ''}`}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className={`font-black ${item.color} ${item.big ? 'text-4xl' : 'text-2xl'}`}>{item.value}</div>
                  </div>
                )
              )}
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">
              Calculated using total points and credits from <strong className="text-slate-600">all passed semesters</strong> up to this point.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
