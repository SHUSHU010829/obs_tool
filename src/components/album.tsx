"use client";

import { useEffect, useRef } from "react";

interface AlbumProps {
  isPlaying?: boolean;
}

export default function Album({ isPlaying = true }: AlbumProps) {
  const discRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;

    if (animRef.current) {
      animRef.current.cancel();
    }

    animRef.current = disc.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 4000,
        iterations: Infinity,
        easing: "linear",
      }
    );

    if (!isPlaying) {
      animRef.current.pause();
    }

    return () => {
      animRef.current?.cancel();
    };
  }, [isPlaying]);

  return (
    <div className="vinyl-scene" style={styles.scene}>
      {/* 黑膠唱片 */}
      <svg
        ref={discRef}
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={styles.disc}
      >
        {/* 外圈主體 */}
        <circle cx="100" cy="100" r="98" fill="#111714" stroke="#1e2921" strokeWidth="1" />

        {/* 刻紋（多層透明度製造深度） */}
        <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="66" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

        {/* 光澤反射弧 */}
        <path
          d="M 40 60 Q 70 30 130 45"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 55 50 Q 85 25 125 38"
          fill="none"
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 中間標籤區 */}
        <circle cx="100" cy="100" r="34" fill="#0D1610" />
        <circle cx="100" cy="100" r="33" fill="none" stroke="rgba(0,255,135,0.12)" strokeWidth="1" />
        <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(0,255,135,0.06)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(0,255,135,0.08)" strokeWidth="0.8" />

        {/* 中心孔 */}
        <circle cx="100" cy="100" r="4" fill="#0A0F0C" />
        <circle cx="100" cy="100" r="3" fill="none" stroke="rgba(0,255,135,0.3)" strokeWidth="0.8" />
      </svg>

      {/* 唱針 */}
      <svg
        width="80"
        height="130"
        viewBox="0 0 80 130"
        style={styles.tonearm}
      >
        {/* 軸心點 */}
        <circle cx="22" cy="8" r="6" fill="#1a2420" stroke="rgba(0,255,135,0.3)" strokeWidth="1" />
        <circle cx="22" cy="8" r="2.5" fill="#00FF87" opacity={0.6} />

        {/* 臂桿（輕微彎曲感） */}
        <path
          d="M22 14 Q28 55 38 105"
          fill="none"
          stroke="#2a3530"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M22 14 Q28 55 38 105"
          fill="none"
          stroke="rgba(0,255,135,0.15)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* 唱針頭 */}
        <rect x="33" y="104" width="10" height="3" rx="1.5" fill="#1e2921" stroke="rgba(0,255,135,0.4)" strokeWidth="0.8" />
        <rect x="37" y="107" width="2" height="5" rx="1" fill="#00FF87" opacity={0.7} />
      </svg>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scene: {
    position: "relative",
    width: 200,
    height: 200,
    flexShrink: 0,
  },
  disc: {
    display: "block",
    transformOrigin: "center",
  },
  tonearm: {
    position: "absolute",
    top: -4,
    right: -10,
    transformOrigin: "22px 8px",
    animation: "arm-settle 0.8s ease-out forwards",
  },
};
