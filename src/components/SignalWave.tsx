export default function SignalWave() {
  return (
    <svg
      viewBox="0 0 1200 400"
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      <defs>
        <style>{`
          @keyframes wave-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
          .wave-amber {
            animation: wave-pulse 3s ease-in-out infinite;
          }
          .wave-cyan {
            animation: wave-pulse 3s ease-in-out infinite 0.5s;
          }
        `}
      </style>
      </defs>
      {/* Amber wave */}
      <path
        d="M 0 200 Q 75 100 150 200 T 300 200 T 450 200 T 600 200 T 750 200 T 900 200 T 1050 200 T 1200 200"
        stroke="#F59E0B"
        strokeWidth="3"
        fill="none"
        className="wave-amber"
      />
      {/* Cyan wave */}
      <path
        d="M 0 200 Q 75 150 150 200 T 300 200 T 450 200 T 600 200 T 750 200 T 900 200 T 1050 200 T 1200 200"
        stroke="#06B6D4"
        strokeWidth="2"
        fill="none"
        className="wave-cyan"
      />
    </svg>
  );
}