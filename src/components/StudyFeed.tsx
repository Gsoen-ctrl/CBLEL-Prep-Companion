import React, { useState, useEffect, useRef } from "react";
import { generateQuestion, StudyQuestion } from "./StudyGenerator";
import { BookOpen } from "lucide-react";

export const StudyFeed: React.FC = () => {
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const isSnapScrollingRef = useRef(false);

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
    const cardHeight = el.clientHeight * 0.75;
    const scrollPos = el.scrollTop + el.clientHeight / 2;
    const index = Math.floor(scrollPos / cardHeight);

    if (index !== activeIndex && index >= 0 && index < questions.length) {
      setActiveIndex(index);
    }

    if (index >= questions.length - 2 && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      const q = await generateQuestion();
      setQuestions((prev) => [...prev, q]);
      loadingMoreRef.current = false;
    }
  };

  const handleScrollEnd = () => {
    if (containerRef.current && !isSnapScrollingRef.current) {
      const el = containerRef.current;
      const cardHeight = el.clientHeight * 0.75;
      const snapTarget = activeIndex * cardHeight;

      isSnapScrollingRef.current = true;
      el.scrollTo({
        top: snapTarget,
        behavior: "smooth",
      });

      setTimeout(() => {
        isSnapScrollingRef.current = false;
      }, 500);
    }
  };

  const scrollToNext = () => {
    if (containerRef.current) {
      const el = containerRef.current;
      const cardHeight = el.clientHeight * 0.75;
      const nextScrollTop = (activeIndex + 1) * cardHeight;
      isSnapScrollingRef.current = true;
      el.scrollTo({
        top: nextScrollTop,
        behavior: "smooth",
      });
      setTimeout(() => {
        isSnapScrollingRef.current = false;
      }, 500);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      handleScrollEnd();
    }, 150);
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
        onWheel={handleWheel}
        style={{
          height: "100%",
          width: "100%",
          maxWidth: "450px",
          background: "var(--cream-dark)",
          overflowY: "scroll",
          scrollBehavior: "smooth",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "calc(12.5% + 20px)",
          paddingBottom: "calc(12.5% + 20px)",
        }}
      >
        {questions.map((q, idx) => (
          <StudyItem
            key={`${idx}-${q.stem.slice(0, 10)}`}
            question={q}
            isActive={idx === activeIndex}
            onAutoScroll={scrollToNext}
            isNextVisible={idx === activeIndex + 1}
            isPrevVisible={idx === activeIndex - 1}
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
  isNextVisible: boolean;
  isPrevVisible: boolean;
}

const StudyItem: React.FC<StudyItemProps> = ({
  question,
  isActive,
  onAutoScroll,
  isNextVisible,
  isPrevVisible,
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
      }, 2000);
    }
  };

  const isDDC = question.classificationType === "DDC";
  const isLCC = question.classificationType === "LCC";
  const isClassification = question.type === "classification";

  const scale = isActive ? 1 : isPrevVisible || isNextVisible ? 0.88 : 0.75;
  const translateY = isPrevVisible ? -120 : isNextVisible ? 120 : 0;
  const opacity = isActive ? 1 : isPrevVisible || isNextVisible ? 0.6 : 0.3;

  return (
    <div
      style={{
        height: "75%",
        width: "100%",
        maxWidth: "380px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        background: "var(--cream)",
        borderRadius: "var(--radius)",
        boxShadow: isActive
          ? "0 20px 40px rgba(0,0,0,0.12)"
          : "0 8px 20px rgba(0,0,0,0.06)",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity: opacity,
        transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
        pointerEvents: isActive ? "auto" : "none",
        userSelect: isActive ? "auto" : "none",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "auto",
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
      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "var(--ink-faint)",
            fontSize: "calc(12px * var(--scale, 1))",
            opacity: selectedLetter ? 1 : 0.5,
            transition: "opacity 0.3s",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          Swipe up for next
        </div>
      )}
    </div>
  );
};