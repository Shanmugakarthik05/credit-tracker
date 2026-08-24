import avatarImg from '../assets/avatar.jpg';
import { QRCodeSVG } from 'qrcode.react';

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
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(0px); }
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
                  {/* Photo — real uploaded avatar */}
                  <div className="rounded-xl overflow-hidden border-2 flex-shrink-0"
                       style={{ width: 120, height: 140, borderColor: 'rgba(120,100,255,0.5)',
                                boxShadow: '0 0 20px rgba(100,80,255,0.5)' }}>
                    <img
                      src={avatarImg}
                      alt="Developer Avatar"
                      style={{ width: 120, height: 140, objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  </div>

                  {/* Clickable QR Code */}
                  <a href="https://github.com/Shanmugakarthik05" target="_blank" rel="noopener noreferrer"
                     className="barcode-wrap flex flex-col items-center gap-1" title="Open GitHub">
                    <div style={{
                      padding: 4,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      border: '1px solid rgba(120,100,255,0.3)',
                      boxShadow: '0 0 10px rgba(100,80,255,0.3)'
                    }}>
                      <QRCodeSVG
                        value="https://github.com/Shanmugakarthik05"
                        size={106}
                        bgColor="transparent"
                        fgColor="#a78bff"
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <p style={{ fontSize: 7, color: '#7ec8ff', letterSpacing: '0.15em', textAlign: 'center' }}>
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
                      <p className="field-value">DEV-2024-SK</p>
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
