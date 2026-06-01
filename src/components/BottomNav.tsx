import React, { useState, useEffect, useRef } from "react";
import { List, BookOpen, Layers, Settings, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onMoreClick: () => void;
  studyStreak?: number;
}

const COMPLIMENTS = [
  "Nice!",
  "Keep it up!",
  "You're on fire!",
  "Amazing!",
  "Unstoppable!",
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onMoreClick,
  studyStreak = 0,
}) => {
  const prevStreak = useRef(studyStreak);
  const [streakAnim, setStreakAnim] = useState<"subtle" | "noticeable" | null>(
    null,
  );
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (studyStreak > prevStreak.current) {
      if (studyStreak > 0 && studyStreak % 10 === 0) {
        setStreakAnim("noticeable");
        setTooltip(COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]);
        setTimeout(() => {
          setStreakAnim(null);
          setTooltip(null);
        }, 2500);
      } else {
        setStreakAnim("subtle");
        setTimeout(() => setStreakAnim(null), 600);
      }
    }
    prevStreak.current = studyStreak;
  }, [studyStreak]);

  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => setActiveTab("dashboard")}
      >
        <List size={20} />
      </button>

      <button
        className={`nav-item ${activeTab === "practice" ? "active" : ""}`}
        onClick={() => setActiveTab("practice")}
      >
        <BookOpen size={20} />
      </button>

      <button
        className={`nav-item study-btn ${activeTab === "study" ? "active" : ""}`}
        onClick={() => setActiveTab("study")}
        style={{ position: "relative" }}
      >
        {tooltip && activeTab === "study" && (
          <div className="streak-tooltip fade-in">{tooltip}</div>
        )}
        <div
          className={`study-circle ${streakAnim ? `anim-${streakAnim}` : ""}`}
        >
          {activeTab === "study" ? (
            <span className="streak-number">{studyStreak}</span>
          ) : (
            <Layers size={20} color="white" />
          )}
        </div>
      </button>

      <button
        className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
        onClick={() => setActiveTab("settings")}
      >
        <Settings size={20} />
      </button>

      <button className={`nav-item`} onClick={onMoreClick}>
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};
