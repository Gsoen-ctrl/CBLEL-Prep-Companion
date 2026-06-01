import React from "react";
import { X } from "lucide-react";

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  return (
    <>
      <div
        className={`more-sheet-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div className={`more-sheet ${isOpen ? "open" : ""}`}>
        <div className="more-sheet-handle" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "calc(24px * var(--scale, 1))",
              color: "var(--ink)",
            }}
          >
            More
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-muted)",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => {
              setActiveTab("checklist");
              onClose();
            }}
            style={{
              padding: "16px",
              background:
                activeTab === "checklist"
                  ? "var(--cream-dark)"
                  : "var(--cream)",
              border: `1px solid ${activeTab === "checklist" ? "var(--accent)" : "var(--cream-border)"}`,
              borderRadius: "var(--radius)",
              textAlign: "left",
              fontSize: "calc(16px * var(--scale, 1))",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
            }}
          >
            Checklist
          </button>
          <button
            onClick={() => {
              setActiveTab("milestones");
              onClose();
            }}
            style={{
              padding: "16px",
              background:
                activeTab === "milestones"
                  ? "var(--cream-dark)"
                  : "var(--cream)",
              border: `1px solid ${activeTab === "milestones" ? "var(--accent)" : "var(--cream-border)"}`,
              borderRadius: "var(--radius)",
              textAlign: "left",
              fontSize: "calc(16px * var(--scale, 1))",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
            }}
          >
            Milestones
          </button>
          <button
            onClick={() => {
              setActiveTab("subjects");
              onClose();
            }}
            style={{
              padding: "16px",
              background:
                activeTab === "subjects" ? "var(--cream-dark)" : "var(--cream)",
              border: `1px solid ${activeTab === "subjects" ? "var(--accent)" : "var(--cream-border)"}`,
              borderRadius: "var(--radius)",
              textAlign: "left",
              fontSize: "calc(16px * var(--scale, 1))",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
            }}
          >
            Subjects
          </button>
        </div>
      </div>
    </>
  );
};
