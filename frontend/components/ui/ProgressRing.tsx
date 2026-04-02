"use client";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ProgressRingProps {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

export default function ProgressRing({ value, color, size = 120, strokeWidth = 8, label, sublabel }: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 70, damping: 18 });
  const dashOffset = useTransform(spring, (v) => circumference - (v / 100) * circumference);

  useEffect(() => { motionValue.set(Math.min(value, 100)); }, [value, motionValue]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black" style={{ color }}>{Math.round(value)}</span>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>g</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{label}</p>
        {sublabel && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
      </div>
    </div>
  );
}
