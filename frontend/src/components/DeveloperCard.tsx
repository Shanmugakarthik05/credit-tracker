export default function DeveloperCard() {
  return (
    <>
      <style>{`
        @keyframes holo-bg {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes holo-shine {
          0%   { opacity: 0; transform: translateX(-100%) rotate(25deg); }
          30%  { opacity: 0.5; }
          70%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateX(300%) rotate(25deg); }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        .dev-id-card {
          animation: card-float 5s ease-in-out infinite;
        }
        .holo-bg {
          background: linear-gradient(
            125deg,
            #f0c0ff 0%,
            #c0e8ff 15%,
            #b0ffdc 30%,
            #ffe8a0 45%,
            #ffc0cb 60%,
            #c0c8ff 75%,
            #f0c0ff 90%,
            #b0ffdc 100%
          );
          background-size: 400% 400%;
          animation: holo-bg 6s ease infinite;
        }
        .holo-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255,255,255,0.55) 50%,
            transparent 70%
          );
          width: 80px;
          animation: holo-shine 4s ease-in-out infinite;
        }
        .barcode-line {
          display: inline-block;
          height: 28px;
          background: #1a1a1a;
          margin-right: 1px;
          vertical-align: bottom;
        }
      `}</style>

      <div className="flex justify-center">
        <div className="dev-id-card cursor-default select-none">
          {/* Outer border / card frame */}
          <div className="holo-bg relative overflow-hidden rounded-2xl shadow-2xl p-[3px]" style={{ width: '300px' }}>

            {/* Shine sweep */}
            <div className="holo-shine" />

            {/* Inner card face */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-[14px] p-5 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.25)' }}>

              {/* Top row: Title + Globe */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-black text-gray-900 leading-none tracking-wide uppercase">Developer</p>
                  <p className="text-[13px] font-black text-gray-900 leading-none tracking-wide uppercase">Credit</p>
                </div>
                {/* Globe icon SVG */}
                <svg className="w-8 h-8 text-gray-800 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                </svg>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-800/30 mb-4" />

              {/* Main content: photo + details */}
              <div className="flex gap-4">
                {/* Photo box */}
                <div className="flex-shrink-0 w-[90px] h-[105px] rounded-lg overflow-hidden border-2 border-white/50 shadow-md bg-gradient-to-b from-slate-700 to-slate-900 flex items-end justify-center">
                  {/* Silhouette avatar drawn in SVG (anime/hoodie style like the reference) */}
                  <svg viewBox="0 0 90 105" width="90" height="105" className="absolute" style={{position:'relative'}}>
                    {/* Background */}
                    <rect width="90" height="105" fill="#1e293b"/>
                    {/* Body / hoodie */}
                    <ellipse cx="45" cy="118" rx="38" ry="30" fill="#1e1e1e"/>
                    <path d="M20 85 Q45 70 70 85 Q72 95 75 115 L15 115 Q18 95 20 85Z" fill="#111827"/>
                    {/* Neck */}
                    <rect x="38" y="62" width="14" height="18" rx="4" fill="#f5d0a9"/>
                    {/* Head */}
                    <ellipse cx="45" cy="52" rx="20" ry="22" fill="#f5d0a9"/>
                    {/* Hair */}
                    <ellipse cx="45" cy="35" rx="21" ry="14" fill="#1a1a1a"/>
                    <path d="M25 42 Q24 55 27 62 Q26 50 28 45Z" fill="#1a1a1a"/>
                    <path d="M65 42 Q66 55 63 62 Q64 50 62 45Z" fill="#1a1a1a"/>
                    <path d="M30 38 Q32 28 45 27 Q58 28 60 38 Q55 32 45 31 Q35 32 30 38Z" fill="#111"/>
                    {/* Mask */}
                    <rect x="31" y="56" width="28" height="16" rx="5" fill="#111827"/>
                    {/* Eyes */}
                    <ellipse cx="38" cy="50" rx="4" ry="4.5" fill="#1a1a1a"/>
                    <ellipse cx="52" cy="50" rx="4" ry="4.5" fill="#1a1a1a"/>
                    <ellipse cx="37" cy="49" rx="1.5" ry="1.5" fill="white" opacity="0.6"/>
                    <ellipse cx="51" cy="49" rx="1.5" ry="1.5" fill="white" opacity="0.6"/>
                  </svg>
                </div>

                {/* Info fields */}
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase leading-none">Name</p>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight mt-0.5">
                      SHANMUGAKARTHIK G
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase leading-none">Role</p>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight mt-0.5">
                      Full Stack Developer
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase leading-none">Dept</p>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight mt-0.5">
                      B.Tech — Info Tech
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase leading-none">ID</p>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight mt-0.5">
                      DEV-2024-SKG
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase leading-none">Valid Thru</p>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide leading-tight mt-0.5">
                      12/31/2026
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom row: barcode + signature */}
              <div className="flex items-end justify-between mt-4">
                {/* Barcode */}
                <div className="flex items-end gap-[1px]">
                  {[3,1,4,1,5,2,3,2,1,4,2,3,1,2,4,1,3,2,1,4,3,1,2,3,1,2,3,1].map((w, i) => (
                    <span
                      key={i}
                      className="barcode-line"
                      style={{ width: `${w * 1.3}px`, height: i % 5 === 0 ? '32px' : '24px' }}
                    />
                  ))}
                </div>

                {/* Signature + Authorized */}
                <div className="flex flex-col items-end">
                  <svg width="80" height="30" viewBox="0 0 80 30">
                    <path d="M5 22 C15 8, 25 5, 35 15 C42 22, 50 8, 60 12 C68 15, 73 10, 78 18"
                      fill="none" stroke="#1a1a2e" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M35 15 C37 20, 40 25, 43 22"
                      fill="none" stroke="#1a1a2e" strokeWidth="1.5"
                      strokeLinecap="round"/>
                  </svg>
                  <div className="w-full h-px bg-gray-800/40 mb-1" />
                  <p className="text-[8px] font-bold text-gray-700 tracking-widest uppercase">Authorized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
