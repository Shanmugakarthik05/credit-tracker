import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight, Check } from 'lucide-react';

interface SubjectMappingScreenProps {
  results: any[];
  curriculumCategories: any[];
  onConfirm: (resolvedResults: any[]) => void;
}

export const SubjectMappingScreen: React.FC<SubjectMappingScreenProps> = ({ results, curriculumCategories, onConfirm }) => {
  const [localResults, setLocalResults] = useState([...results]);

  const unresolvedCount = useMemo(() => {
    return localResults.filter(r => r.match.review_status === "REVIEW_REQUIRED" && r.match.possible_matches?.length > 0).length;
  }, [localResults]);

  // Calculate projected progress
  const projectedStats = useMemo(() => {
    let newOverallCompleted = 0;
    const catProjected: Record<number, number> = {};
    
    // Add existing completed credits
    let overallRequired = 0;
    curriculumCategories.forEach(cat => {
      catProjected[cat.id] = cat.completed_credits || 0;
      newOverallCompleted += cat.completed_credits || 0;
      overallRequired += cat.required_credits || 0;
    });

    // Add newly accepted results
    localResults.forEach(r => {
      if (r.match.review_status === "ACCEPTED" && r.is_passed) {
        newOverallCompleted += r.credits || 0;
        if (r.match.category_id) {
          catProjected[r.match.category_id] = (catProjected[r.match.category_id] || 0) + (r.credits || 0);
        }
      }
    });

    return { overallCompleted: newOverallCompleted, overallRequired, catProjected };
  }, [localResults, curriculumCategories]);

  const handleResolve = (index: number, categoryId: number, courseId: number) => {
    const updated = [...localResults];
    updated[index].match.review_status = "ACCEPTED";
    updated[index].match.match_type = "MANUAL";
    updated[index].match.category_id = categoryId;
    updated[index].match.curriculum_course_id = courseId;
    setLocalResults(updated);
  };

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm flex flex-col h-[700px] max-h-[85vh]">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Transcript Subject Mapping</h3>
          <p className="text-sm text-slate-500">Review and resolve ambiguous matches before saving.</p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold text-sm ${unresolvedCount === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {unresolvedCount} Actions Required
        </div>
      </div>
      
      {/* Projected Progress Bars */}
      <div className="mb-4 bg-slate-50 p-4 rounded-xl border">
        <h4 className="text-sm font-bold text-slate-700 mb-2">Projected Progress (Including These Results)</h4>
        
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Overall Degree Progress</span>
            <span>{projectedStats.overallCompleted} / {projectedStats.overallRequired} Credits ({Math.round(projectedStats.overallRequired > 0 ? (projectedStats.overallCompleted / projectedStats.overallRequired) * 100 : 0)}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${projectedStats.overallRequired > 0 ? Math.min(100, (projectedStats.overallCompleted / projectedStats.overallRequired) * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Category Progress Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {curriculumCategories.map(cat => {
            const projected = projectedStats.catProjected[cat.id] || 0;
            const required = cat.required_credits || 0;
            const percent = required > 0 ? Math.min(100, (projected / required) * 100) : 0;
            const isComplete = required > 0 && percent >= 100;

            return (
              <div key={cat.id} className="bg-white p-2 rounded border text-xs">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="truncate pr-2 text-slate-700">{cat.name}</span>
                  <span className={isComplete ? 'text-emerald-600' : 'text-slate-600'}>{projected}/{required}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {localResults.map((result, idx) => {
          const isResolved = result.match.review_status === "ACCEPTED" || result.match.possible_matches?.length === 0;
          
          return (
            <div key={idx} className={`border rounded-xl p-4 transition-colors ${isResolved ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    {result.course_code} - {result.course_name}
                    {isResolved ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Grade: <span className="font-semibold text-slate-700">{result.grade}</span> | 
                    Status: <span className={result.is_passed ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>{result.is_passed ? ' Pass' : ' Fail'}</span>
                  </p>
                  {isResolved && (
                    <div className="mt-2 bg-emerald-50 text-emerald-700 p-2 rounded text-xs border border-emerald-100 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>
                        {result.match.review_status === "ACCEPTED" ? (
                          <>
                            Matched to Curriculum: <strong>
                            {curriculumCategories.find(c => c.id === result.match.category_id)?.courses?.find((c: any) => c.id === result.match.curriculum_course_id)?.course_name || 'Selected Subject'}
                            </strong> 
                            &nbsp;({curriculumCategories.find(c => c.id === result.match.category_id)?.name || 'Unknown Category'})
                          </>
                        ) : (
                          <>Saved as Extra Subject (Not in Curriculum)</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                {!isResolved && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Review Needed</span>
                )}
              </div>

              {!isResolved && (
                <div className="mt-4 bg-white p-3 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Possible Matches ({result.match.possible_matches?.length || 0})</p>
                  
                  {result.match.possible_matches?.length > 0 ? (
                    <div className="space-y-2">
                      {result.match.possible_matches.map((pm: any, pmIdx: number) => {
                        const category = curriculumCategories.find(c => c.id === pm.category_id);
                        return (
                          <div key={pmIdx} className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-indigo-50 border transition-colors group">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">{pm.name}</span>
                              <span className="text-xs text-slate-500">Category: {category?.name || 'Unknown'} (Confidence: {pm.score}%)</span>
                            </div>
                            <button 
                              onClick={() => handleResolve(idx, pm.category_id, pm.id)}
                              className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No close matches found. Please manually select a category.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t mt-4 pt-4 flex justify-end">
        <button
          onClick={() => {
            const payload = localResults.map(r => ({
              ...r,
              matches: [{
                match_type: r.match.match_type,
                confidence: r.match.confidence,
                review_status: r.match.review_status,
                category_id: r.match.category_id,
                curriculum_course_id: r.match.curriculum_course_id,
                credits_counted: r.is_passed ? (r.credits || 0) : 0
              }]
            }));
            onConfirm(payload);
          }}
          disabled={unresolvedCount > 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
            unresolvedCount === 0 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Save to Transcript <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
