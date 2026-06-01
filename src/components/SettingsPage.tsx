import React from "react";

export const SettingsPage: React.FC<{
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  simpleFont: boolean;
  setSimpleFont: (val: boolean) => void;
  fontSize: "S" | "M" | "L";
  setFontSize: (val: "S" | "M" | "L") => void;
  enableStreak: boolean;
  setEnableStreak: (val: boolean) => void;
}> = ({
  darkMode,
  setDarkMode,
  simpleFont,
  setSimpleFont,
  fontSize,
  setFontSize,
  enableStreak,
  setEnableStreak,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "calc(24px * var(--scale, 1))",
          color: "var(--ink)",
        }}
      >
        Settings
      </h2>

      {/* Theme Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          background: "var(--cream-dark)",
          borderRadius: "var(--radius)",
        }}
      >
        <span
          style={{
            fontSize: "calc(16px * var(--scale, 1))",
            fontWeight: 500,
            color: "var(--ink)",
          }}
        >
          Dark Mode
        </span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 50,
            height: 28,
            borderRadius: 14,
            background: darkMode ? "var(--accent)" : "var(--cream-border)",
            border: "none",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--cream)",
              position: "absolute",
              top: 4,
              left: darkMode ? 26 : 4,
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>

      {/* Font Style */}
      <div
        style={{
          padding: "16px",
          background: "var(--cream-dark)",
          borderRadius: "var(--radius)",
        }}
      >
        <div
          style={{
            fontSize: "calc(14px * var(--scale, 1))",
            fontWeight: 500,
            color: "var(--ink)",
            marginBottom: 12,
          }}
        >
          Font Style
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setSimpleFont(false)}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "calc(16px * var(--scale, 1))",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--cream-border)",
              background: !simpleFont ? "var(--accent-bg)" : "var(--cream)",
              color: !simpleFont ? "var(--accent)" : "var(--ink-muted)",
              fontFamily: "'Instrument Serif', Georgia, serif",
              cursor: "pointer",
            }}
          >
            Serif
          </button>
          <button
            onClick={() => setSimpleFont(true)}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "calc(16px * var(--scale, 1))",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--cream-border)",
              background: simpleFont ? "var(--accent-bg)" : "var(--cream)",
              color: simpleFont ? "var(--accent)" : "var(--ink-muted)",
              fontFamily: "'Fraunces', Georgia, serif",
              cursor: "pointer",
            }}
          >
            Fraunces
          </button>
        </div>
      </div>

      {/* Gamification Settings */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          background: "var(--cream-dark)",
          borderRadius: "var(--radius)",
        }}
      >
        <span
          style={{
            fontSize: "calc(16px * var(--scale, 1))",
            fontWeight: 500,
            color: "var(--ink)",
          }}
        >
          Study Cards Streak
        </span>
        <button
          onClick={() => setEnableStreak(!enableStreak)}
          style={{
            width: 50,
            height: 28,
            borderRadius: 14,
            background: enableStreak ? "var(--accent)" : "var(--cream-border)",
            border: "none",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--cream)",
              position: "absolute",
              top: 4,
              left: enableStreak ? 26 : 4,
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>

      {/* Font Size */}
      <div
        style={{
          padding: "16px",
          background: "var(--cream-dark)",
          borderRadius: "var(--radius)",
        }}
      >
        <div
          style={{
            fontSize: "calc(14px * var(--scale, 1))",
            fontWeight: 500,
            color: "var(--ink)",
            marginBottom: 12,
          }}
        >
          Text Size
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(["S", "M", "L"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: `calc(${s === "S" ? 14 : s === "M" ? 16 : 18}px * var(--scale, 1))`,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--cream-border)",
                background:
                  fontSize === s ? "var(--accent-bg)" : "var(--cream)",
                color: fontSize === s ? "var(--accent)" : "var(--ink-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
