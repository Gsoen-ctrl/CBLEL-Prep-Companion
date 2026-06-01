import React, { useState, useEffect, useRef } from "react";
import { generateQuestion, StudyQuestion } from "./StudyGenerator";
import { BookOpen } from "lucide-react";

export const StudyFeed: React.FC = () => {
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function init() {
      const q1 = await generateQuestion();
      const q2 = await generateQuestion();
      const q3 = await generateQuestion();
      setQuestions([q1, q2, q3]);
      setLoading(false);
    }
    init();
  }, []);

  const loadingMoreRef = useRef(false);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }

    if (index >= questions.length - 2 && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      const q = await generateQuestion();
      setQuestions((prev) => [...prev, q]);
      loadingMoreRef.current = false;
    }
  };

  const scrollToNext = () => {
    if (containerRef.current) {
      const el = containerRef.current;
      const nextScrollTop = (activeIndex + 1) * el.clientHeight;
      el.scrollTo({
        top: nextScrollTop,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "var(--ink-muted)",
        }}
      >
        Loading Feed...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        background: "var(--cream-dark)",
        overflow: "hidden",
      }}
    >
      <div
        className="study-feed-container"
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: "100%",
          width: "100%",
          maxWidth: "450px",
          background: "var(--cream)",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          boxShadow: "0 0 40px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {questions.map((q, idx) => (
          <StudyItem
            key={`${idx}-${q.stem.slice(0, 10)}`}
            question={q}
            isActive={idx === activeIndex}
            onAutoScroll={scrollToNext}
          />
        ))}
      </div>
    </div>
  );
};

interface StudyItemProps {
  question: StudyQuestion;
  isActive: boolean;
  onAutoScroll: () => void;
}

const StudyItem: React.FC<StudyItemProps> = ({
  question,
  isActive,
  onAutoScroll,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (letter: string) => {
    if (selectedLetter) return;

    const correctOpt = question.options.find((o: any) => o.correct);
    const correct = letter === correctOpt?.letter;

    setSelectedLetter(letter);
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        onAutoScroll();
      }, 10000);
    }
  };

  const isDDC = question.classificationType === "DDC";
  const isLCC = question.classificationType === "LCC";
  const isClassification = question.type === "classification";

  return (
    <div
      className="study-feed-item"
      style={{
        height: "100%",
        width: "100%",
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Topic Tag */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--accent)",
          }}
        >
          <BookOpen size={16} />
          <span
            style={{
              fontSize: "calc(13px * var(--scale, 1))",
              fontWeight: 500,
            }}
          >
            {isClassification
              ? isDDC
                ? "DDC Practice"
                : "LCC Practice"
              : `Subject: ${question.subject}`}
          </span>
        </div>

        {/* Question Stem */}
        <div
          style={{
            fontSize: isClassification
              ? "calc(24px * var(--scale, 1))"
              : "calc(20px * var(--scale, 1))",
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            textAlign: isClassification ? "center" : "left",
            marginBottom: 32,
            lineHeight: 1.3,
          }}
        >
          {question.stem}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {question.options.map((opt: any) => {
            const isSelected = selectedLetter === opt.letter;
            const isActualCorrect = opt.correct;

            let bg = "var(--cream-dark)";
            let border = "1px solid var(--cream-border)";
            let color = "var(--ink)";

            if (selectedLetter) {
              if (isActualCorrect) {
                bg = "var(--green-bg)";
                border = "1px solid var(--green)";
                color = "var(--green)";
              } else if (isSelected && !isActualCorrect) {
                bg = "var(--red-bg)";
                border = "1px solid var(--red)";
                color = "var(--red)";
              } else {
                color = "var(--ink-faint)";
              }
            }

            return (
              <button
                key={opt.letter}
                onClick={() => handleSelect(opt.letter)}
                disabled={!!selectedLetter}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius)",
                  background: bg,
                  border: border,
                  color: color,
                  fontSize: isClassification
                    ? "calc(18px * var(--scale, 1))"
                    : "calc(16px * var(--scale, 1))",
                  textAlign: isClassification ? "center" : "left",
                  cursor: selectedLetter ? "default" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-body)",
                }}
              >
                {!isClassification && (
                  <span style={{ fontWeight: 500, marginRight: 8 }}>
                    {opt.letter}.
                  </span>
                )}
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {selectedLetter && !isCorrect && question.explanation && (
          <div
            style={{
              marginTop: 24,
              padding: "16px",
              background: "var(--accent-bg)",
              borderRadius: "var(--radius)",
              borderLeft: "3px solid var(--accent)",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                fontSize: "calc(12px * var(--scale, 1))",
                color: "var(--ink-muted)",
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              Explanation
            </div>
            <div
              style={{
                fontSize: "calc(14px * var(--scale, 1))",
                color: "var(--ink)",
              }}
            >
              {question.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Scroll Hint */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(20px + env(safe-area-inset-bottom))",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "var(--ink-faint)",
          fontSize: "calc(12px * var(--scale, 1))",
          opacity: selectedLetter ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      >
        Swipe up for next
      </div>
    </div>
  );
};
