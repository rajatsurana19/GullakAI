import React from 'react';

export default function Waveform({ active = false, color = "bg-paytm-cyan" }) {
  const bars = [40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70];

  return (
    <div className="flex items-center justify-center gap-1 h-12 py-2 px-4 rounded-xl bg-slate-900/5">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${color} ${
            active ? 'animate-pulse' : 'opacity-40'
          }`}
          style={{
            height: active ? `${Math.max(15, (height * (0.6 + Math.sin(i + Date.now() / 200) * 0.4)))}%` : '20%',
            animationDelay: `${i * 0.08}s`
          }}
        />
      ))}
    </div>
  );
}
