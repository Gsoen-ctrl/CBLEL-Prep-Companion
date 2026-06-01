import React from "react";
import { List, BookOpen, Layers, Settings, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onMoreClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onMoreClick,
}) => {
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
      >
        <div className="study-circle">
          <Layers size={20} color="white" />
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
