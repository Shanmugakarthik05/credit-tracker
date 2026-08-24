export default function DeveloperCard() {
  return (
    <>
      <style>{`
        @keyframes holo-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50%       { transform: translateY(-7px) rotate(0.5deg); }
        }
        @keyframes shine {
          0%   { left: -120%; opacity: 0; }
          25%  { opacity: 0.4; }
          75%  { opacity: 0.4; }
          100% { left: 150%;  opacity: 0; }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes text-holo {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .id-card-wrap { animation: card-float 5s ease-in-out infinite; }

        .id-card-border {
          background: linear-gradient(135deg,
            #ff00cc, #7b2fff, #00cfff, #00ffa0,
            #ffe600, #ff6b35, #ff00cc);
          background-size: 400% 400%;
          animation: holo-border 5s ease infinite;
        }

        .id-card-inner {
          background: radial-gradient(ellipse at 30% 40%, #1a1060 0%, #0a0a2e 50%, #060618 100%);
          position: relative;
          overflow: hidden;
        }

        /* fingerprint / wave texture overlay */
        .id-card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            120deg,
            transparent,
            transparent 18px,
            rgba(120,80,255,0.07) 19px,
            rgba(120,80,255,0.07) 20px
          );
          pointer-events: none;
        }

        .holo-title {
          background: linear-gradient(90deg,
            #ff6fff, #a78bff, #60d9ff, #a0ffcc, #ffe97a, #ff9f6b, #ff6fff);
          background-size: 300% 300%;
          animation: text-holo 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .id-shine {
          position: absolute;
          top: 0; bottom: 0;
          width: 100px;
          background: linear-gradient(105deg,
            transparent 20%,
            rgba(255,255,255,0.18) 50%,
            transparent 80%
          );
          filter: blur(6px);
          animation: shine 4s ease-in-out infinite;
        }

        .star { animation: star-twinkle 2s ease-in-out infinite; }
        .star-2 { animation: star-twinkle 3s ease-in-out 1s infinite; }
        .star-3 { animation: star-twinkle 2.5s ease-in-out 0.5s infinite; }

        .holo-bar {
          background: linear-gradient(90deg,
            #7b2fff, #00cfff, #00ffa0, #ffe600, #ff6b35, #ff00cc, #7b2fff);
          background-size: 300%;
          animation: holo-border 3s linear infinite;
        }

        .field-label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7ec8ff;
          line-height: 1;
          margin-bottom: 2px;
        }
        .field-value {
          font-size: 12px;
          font-weight: 800;
          color: #f0f0ff;
          letter-spacing: 0.04em;
          line-height: 1.2;
        }
        .field-value.inf {
          font-size: 18px;
          background: linear-gradient(90deg, #00ffa0, #00cfff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .github-val {
          font-size: 10px;
          font-weight: 700;
          color: #60d9ff;
          letter-spacing: 0.02em;
        }
        .barcode-wrap {
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .barcode-wrap:hover { opacity: 0.75; }
      `}</style>

      <div className="flex justify-center">
        <div className="id-card-wrap cursor-default select-none" style={{ maxWidth: 520 }}>

          {/* Glowing rainbow border */}
          <div className="id-card-border rounded-2xl p-[2.5px] shadow-2xl"
               style={{ boxShadow: '0 0 40px rgba(123,47,255,0.6), 0 0 80px rgba(0,207,255,0.3)' }}>

            {/* Card body */}
            <div className="id-card-inner rounded-[13px] px-6 pt-5 pb-4" style={{ width: 490 }}>

              {/* Shine sweep */}
              <div className="id-shine" />

              {/* Decorative stars */}
              <svg className="star absolute" style={{top:18, right:160, width:10, height:10}} viewBox="0 0 10 10">
                <polygon points="5,0 6,4 10,4 7,6 8,10 5,8 2,10 3,6 0,4 4,4" fill="#fff" opacity="0.8"/>
              </svg>
              <svg className="star-2 absolute" style={{top:70, right:60, width:8, height:8}} viewBox="0 0 10 10">
                <polygon points="5,0 6,4 10,4 7,6 8,10 5,8 2,10 3,6 0,4 4,4" fill="#a0f0ff" opacity="0.7"/>
              </svg>
              <svg className="star-3 absolute" style={{bottom:55, left:170, width:6, height:6}} viewBox="0 0 10 10">
                <polygon points="5,0 6,4 10,4 7,6 8,10 5,8 2,10 3,6 0,4 4,4" fill="#c0b0ff" opacity="0.7"/>
              </svg>

              {/* ── TOP ROW ── */}
              <div className="flex items-start justify-between mb-3">
                {/* Title */}
                <div>
                  <div className="holo-title text-[26px] font-black leading-none tracking-wide uppercase">DEVELOPER</div>
                  <div className="holo-title text-[26px] font-black leading-none tracking-wide uppercase">CREDIT</div>
                </div>
                {/* Globe */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="url(#g1)" strokeWidth="2"/>
                  <ellipse cx="24" cy="24" rx="10" ry="20" stroke="url(#g1)" strokeWidth="1.5"/>
                  <line x1="4" y1="24" x2="44" y2="24" stroke="url(#g1)" strokeWidth="1.5"/>
                  <line x1="8" y1="15" x2="40" y2="15" stroke="url(#g1)" strokeWidth="1"/>
                  <line x1="8" y1="33" x2="40" y2="33" stroke="url(#g1)" strokeWidth="1"/>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a78bff"/>
                      <stop offset="0.5" stopColor="#60d9ff"/>
                      <stop offset="1" stopColor="#00ffa0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Holographic separator bar */}
              <div className="holo-bar w-full h-[1.5px] rounded-full mb-4 opacity-60" />

              {/* ── MAIN ROW ── */}
              <div className="flex gap-5">

                {/* LEFT: Avatar */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  {/* Photo */}
                  <div className="rounded-xl overflow-hidden border-2 flex-shrink-0"
                       style={{ width: 120, height: 140, borderColor: 'rgba(120,100,255,0.5)',
                                boxShadow: '0 0 20px rgba(100,80,255,0.4)' }}>
                    <svg viewBox="0 0 120 140" width="120" height="140">
                      {/* Holographic bg for photo */}
                      <defs>
                        <linearGradient id="photoBg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1a1060"/>
                          <stop offset="100%" stopColor="#0a0830"/>
                        </linearGradient>
                        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f5d5b0"/>
                          <stop offset="100%" stopColor="#e8b890"/>
                        </linearGradient>
                      </defs>
                      <rect width="120" height="140" fill="url(#photoBg)"/>

                      {/* Subtle grid lines */}
                      {[0,1,2,3,4,5,6].map(i => (
                        <line key={i} x1="0" y1={i*22} x2="120" y2={i*22}
                              stroke="rgba(100,80,255,0.08)" strokeWidth="1"/>
                      ))}
                      {[0,1,2,3,4].map(i => (
                        <line key={i} x1={i*30} y1="0" x2={i*30} y2="140"
                              stroke="rgba(100,80,255,0.08)" strokeWidth="1"/>
                      ))}

                      {/* Body / hoodie */}
                      <ellipse cx="60" cy="185" rx="55" ry="55" fill="#111827"/>
                      <path d="M22 108 C35 95 85 95 98 108 C102 118 105 135 106 140 L14 140 C15 135 18 118 22 108Z"
                            fill="#111822"/>
                      {/* hoodie pocket seam */}
                      <path d="M45 125 Q60 120 75 125" stroke="#1e2535" strokeWidth="1.5" fill="none"/>
                      {/* </> text on hoodie */}
                      <text x="52" y="138" fill="#3a4570" fontSize="8" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>

                      {/* Neck */}
                      <rect x="50" y="76" width="20" height="24" rx="6" fill="url(#skinGrad)"/>

                      {/* Head */}
                      <ellipse cx="60" cy="64" rx="27" ry="28" fill="url(#skinGrad)"/>

                      {/* Ears */}
                      <ellipse cx="33" cy="64" rx="5" ry="7" fill="url(#skinGrad)"/>
                      <ellipse cx="87" cy="64" rx="5" ry="7" fill="url(#skinGrad)"/>

                      {/* Hair - messy/fluffy */}
                      <ellipse cx="60" cy="42" rx="28" ry="18" fill="#1a1a1a"/>
                      <path d="M33 50 Q30 35 38 28 Q46 22 60 20 Q74 22 82 28 Q90 35 87 50 Q80 38 60 36 Q40 38 33 50Z"
                            fill="#111111"/>
                      {/* Side hair strands */}
                      <path d="M33 55 Q28 65 30 78 Q31 68 35 62Z" fill="#111111"/>
                      <path d="M87 55 Q92 65 90 78 Q89 68 85 62Z" fill="#111111"/>
                      {/* Front hair tuft */}
                      <path d="M48 28 Q52 20 60 22 Q55 24 50 32Z" fill="#222"/>
                      <path d="M60 22 Q68 20 72 28 Q67 24 62 32Z" fill="#1a1a1a"/>

                      {/* Glasses */}
                      <rect x="38" y="58" width="16" height="11" rx="4" fill="none"
                            stroke="#4a4060" strokeWidth="1.5"/>
                      <rect x="66" y="58" width="16" height="11" rx="4" fill="none"
                            stroke="#4a4060" strokeWidth="1.5"/>
                      <line x1="54" y1="63" x2="66" y2="63" stroke="#4a4060" strokeWidth="1.5"/>
                      <line x1="34" y1="63" x2="38" y2="63" stroke="#4a4060" strokeWidth="1.5"/>
                      <line x1="82" y1="63" x2="86" y2="63" stroke="#4a4060" strokeWidth="1.5"/>
                      {/* Lens tint */}
                      <rect x="38.5" y="58.5" width="15" height="10" rx="3.5" fill="rgba(80,60,180,0.15)"/>
                      <rect x="66.5" y="58.5" width="15" height="10" rx="3.5" fill="rgba(80,60,180,0.15)"/>

                      {/* Eyes behind glasses */}
                      <ellipse cx="46" cy="63" rx="3.5" ry="4" fill="#2a1a1a"/>
                      <ellipse cx="74" cy="63" rx="3.5" ry="4" fill="#2a1a1a"/>
                      <ellipse cx="45" cy="62" rx="1.2" ry="1.2" fill="white" opacity="0.5"/>
                      <ellipse cx="73" cy="62" rx="1.2" ry="1.2" fill="white" opacity="0.5"/>

                      {/* Mask (black face mask) */}
                      <path d="M33 72 Q35 68 60 66 Q85 68 87 72 Q88 82 87 88 Q85 94 60 95 Q35 94 33 88 Q32 82 33 72Z"
                            fill="#0f1117"/>
                      {/* Mask seam lines */}
                      <path d="M36 80 Q60 77 84 80" stroke="#1e2535" strokeWidth="1" fill="none"/>
                      <path d="M36 86 Q60 83 84 86" stroke="#1e2535" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>

                  {/* Clickable barcode */}
                  <a href="https://github.com/Shanmugakarthik05" target="_blank" rel="noopener noreferrer"
                     className="barcode-wrap" title="Open GitHub">
                    <div className="flex items-end gap-[1.5px]" style={{ height: 30 }}>
                      {[2,1,3,1,2,4,1,2,1,3,2,1,3,1,2,1,4,1,2,3,1,2,1,3,1,2,1,3,2,1].map((w, i) => (
                        <div key={i} style={{
                          width: w * 1.5,
                          height: i % 4 === 0 ? 30 : i % 3 === 0 ? 24 : 20,
                          background: `hsl(${240 + i * 8}, 70%, 65%)`,
                          borderRadius: 1,
                          alignSelf: 'flex-end'
                        }}/>
                      ))}
                    </div>
                    <p style={{ fontSize: 7, color: '#7ec8ff', letterSpacing: '0.15em', marginTop: 2, textAlign: 'center' }}>
                      SCAN TO VISIT GITHUB
                    </p>
                  </a>
                </div>

                {/* RIGHT: Fields + shield */}
                <div className="flex flex-1 gap-3">
                  {/* Fields */}
                  <div className="flex flex-col justify-between flex-1" style={{ gap: 6 }}>
                    <div>
                      <p className="field-label">Name</p>
                      <p className="field-value">SHANMUGAKARTHIK G</p>
                    </div>
                    <div>
                      <p className="field-label">Role</p>
                      <p className="field-value">Vibe Coder</p>
                    </div>
                    <div>
                      <p className="field-label">ID</p>
                      <p className="field-value">DEV-2024-SKG</p>
                    </div>

                    <div className="holo-bar w-full h-px opacity-40 rounded-full" />

                    <div>
                      <p className="field-label">Skills</p>
                      <p className="field-value">Full Stack</p>
                    </div>

                    <div>
                      <p className="field-label">GitHub</p>
                      <a href="https://github.com/Shanmugakarthik05" target="_blank" rel="noopener noreferrer"
                         className="github-val hover:underline">
                        github.com/Shanmugakarthik05
                      </a>
                    </div>

                    <div>
                      <p className="field-label">Valid Thru</p>
                      <p className="field-value inf">∞</p>
                    </div>
                  </div>

                  {/* Shield + Signature column */}
                  <div className="flex flex-col items-center justify-between pb-1" style={{ width: 90 }}>
                    {/* Code shield */}
                    <svg width="62" height="70" viewBox="0 0 62 70" fill="none">
                      <path d="M31 2 L56 14 L56 38 Q56 58 31 68 Q6 58 6 38 L6 14 Z"
                            fill="none" stroke="url(#sg)" strokeWidth="1.8"/>
                      <text x="18" y="42" fill="url(#sg)" fontSize="14" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                      {/* inner glow */}
                      <path d="M31 8 L50 18 L50 37 Q50 53 31 62 Q12 53 12 37 L12 18 Z"
                            fill="rgba(100,80,255,0.06)"/>
                      <defs>
                        <linearGradient id="sg" x1="6" y1="2" x2="56" y2="68" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#a78bff"/>
                          <stop offset="0.5" stopColor="#60d9ff"/>
                          <stop offset="1" stopColor="#00ffa0"/>
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Signature */}
                    <div className="flex flex-col items-center">
                      <svg width="88" height="34" viewBox="0 0 88 34">
                        {/* "Keep Coding!" cursive path */}
                        <path d="M4 26 C10 10 18 6 24 16 C28 22 30 14 36 10 C42 6 46 12 48 20 C50 26 54 8 62 10 C68 12 72 8 80 14 C84 18 86 12 88 20"
                              fill="none" stroke="url(#sig)" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M48 20 C50 26 52 28 54 26"
                              fill="none" stroke="url(#sig)" strokeWidth="1.5"
                              strokeLinecap="round"/>
                        <defs>
                          <linearGradient id="sig" x1="0" y1="0" x2="88" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#a78bff"/>
                            <stop offset="1" stopColor="#60d9ff"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="holo-bar w-full h-px opacity-50 rounded-full mb-1" />
                      <p style={{ fontSize: 8, color: '#7ec8ff', letterSpacing: '0.18em', fontWeight: 700 }}>
                        AUTHORIZED
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
