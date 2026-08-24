

export default function DeveloperCard() {
  return (
    <>
      {/* Inject keyframes globally via a style tag */}
      <style>{`
        @keyframes holo-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes shine-sweep {
          0%   { left: -100%; opacity: 0; }
          20%  { opacity: 0.6; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .dev-card-wrap {
          animation: card-float 4s ease-in-out infinite;
        }
        .dev-card-border {
          background: linear-gradient(
            135deg,
            #ff0080, #ff6b35, #ffe600, #00ff88,
            #00cfff, #a855f7, #ff0080
          );
          background-size: 400% 400%;
          animation: holo-shift 4s ease infinite;
        }
        .dev-card-shine::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255,255,255,0.35) 50%,
            transparent 80%
          );
          filter: blur(4px);
          animation: shine-sweep 3.5s ease-in-out infinite;
        }
        .dev-status-dot {
          animation: dot-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex justify-center">
        <div className="dev-card-wrap cursor-default select-none">

          {/* Rainbow holographic border */}
          <div className="dev-card-border p-[2px] rounded-2xl shadow-2xl">

            {/* Card body */}
            <div className="relative dev-card-shine overflow-hidden rounded-[14px] bg-[#0d1117] w-72">

              {/* Top coloured strip */}
              <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

              {/* Card content */}
              <div className="px-5 py-4 flex flex-col gap-3">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                    Developer ID
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                    <span className="dev-status-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Active
                  </span>
                </div>

                {/* Avatar + name block */}
                <div className="flex items-center gap-4">
                  {/* Holographic avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="dev-card-border w-14 h-14 rounded-xl p-[2px]">
                      <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 via-cyan-300 to-indigo-400">
                          SK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Name & dept */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">
                      Developed by
                    </p>
                    <p className="text-sm font-black text-white leading-tight tracking-wide truncate">
                      SHANMUGAKARTHIK G
                    </p>
                    <p className="text-[11px] text-slate-400 leading-none">
                      B.Tech — Information Technology
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                {/* Bottom row — decorative chip pattern */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {['bg-violet-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500'].map((c, i) => (
                      <div key={i} className={`w-1.5 h-4 rounded-sm ${c} opacity-70`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono tracking-widest">
                    2024 • SKCG
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
