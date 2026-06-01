import React, { useState, useEffect, useRef } from "react";
import { generateQuestion, StudyQuestion } from "./StudyGenerator";
import { BookOpen } from "lucide-react";
import { loadJSON, saveJSON } from "../utils/storage";

interface StudyFeedProps {
  onAnswer: (correct: boolean) => void;
}

export const StudyFeed: React.FC<StudyFeedProps> = ({ onAnswer }) => {
  const [questions, setQuestions] = useState<StudyQuestion[]>(() =>
    loadJSON("studyFeedQuestions", []),
  );
  const [loading, setLoading] = useState(questions.length === 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    loadJSON("studyFeedActiveIndex", 0),
  );

  useEffect(() => {
    async function init() {
      if (questions.length === 0) {
        const q1 = await generateQuestion();
        const q2 = await generateQuestion();
        const q3 = await generateQuestion();
        const initial = [q1, q2, q3];
        setQuestions(initial);
        saveJSON("studyFeedQuestions", initial);
        setLoading(false);
      }
    }
    init();
  }, [questions.length]);

  // Restore scroll position on mount after a tiny delay to let the DOM paint
  useEffect(() => {
    if (!loading && containerRef.current && activeIndex > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          const el = containerRef.current;
          const items = el.querySelectorAll(".study-feed-item");
          if (activeIndex < items.length) {
            const item = items[activeIndex] as HTMLElement;
            const targetScroll =
              item.offsetTop - (el.clientHeight - item.clientHeight) / 2;
            el.scrollTo({ top: targetScroll, behavior: "instant" });
          }
        }
      }, 50);
    }
  }, [loading]);

  const loadingMoreRef = useRef(false);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    // Find the item closest to the center of the scroll container
    const containerCenter = el.scrollTop + el.clientHeight / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(el.children).forEach((child, index) => {
      const htmlChild = child as HTMLElement;
      // We only care about study-feed-item nodes
      if (htmlChild.classList.contains("study-feed-item")) {
        const childCenter = htmlChild.offsetTop + htmlChild.clientHeight / 2;
        const distance = Math.abs(containerCenter - childCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      saveJSON("studyFeedActiveIndex", closestIndex);
    }

    if (closestIndex >= questions.length - 2 && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      const q = await generateQuestion();
      setQuestions((prev) => {
        const next = [...prev, q];
        saveJSON("studyFeedQuestions", next);
        return next;
      });
      loadingMoreRef.current = false;
    }
  };

  const handleItemAnswer = (idx: number, letter: string, correct: boolean) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], answeredLetter: letter };
      saveJSON("studyFeedQuestions", next);
      return next;
    });
    onAnswer(correct);
  };

  const scrollToNext = () => {
    if (containerRef.current) {
      const el = containerRef.current;
      const items = el.querySelectorAll(".study-feed-item");
      if (activeIndex + 1 < items.length) {
        const nextItem = items[activeIndex + 1] as HTMLElement;
        const nextScrollTop =
          nextItem.offsetTop - (el.clientHeight - nextItem.clientHeight) / 2;
        el.scrollTo({
          top: nextScrollTop,
          behavior: "smooth",
        });
      }
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
          background: "transparent",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          position: "relative",
          paddingTop: "10vh",
          paddingBottom: "10vh",
          display: "flex",
          flexDirection: "column",
          gap: "2vh",
        }}
      >
        {questions.map((q, idx) => (
          <StudyItem
            key={`${idx}-${q.stem.slice(0, 10)}`}
            question={q}
            isActive={idx === activeIndex}
            onAutoScroll={scrollToNext}
            onAnswer={(letter, correct) =>
              handleItemAnswer(idx, letter, correct)
            }
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
  onAnswer: (letter: string, correct: boolean) => void;
}

const StudyItem: React.FC<StudyItemProps> = ({
  question,
  isActive,
  onAutoScroll,
  onAnswer,
}) => {
  const selectedLetter = question.answeredLetter || null;
  const correctOpt = question.options.find((o: any) => o.correct);
  const isCorrect = selectedLetter === correctOpt?.letter;

  const handleSelect = (letter: string) => {
    if (selectedLetter) return;

    const correct = letter === correctOpt?.letter;

    onAnswer(letter, correct);

    if (correct) {
      setTimeout(() => {
        onAutoScroll();
      }, 1200);
    }
  };

  const isDDC = question.classificationType === "DDC";
  const isLCC = question.classificationType === "LCC";
  const isClassification = question.type === "classification";

  return (
    <div
      className="study-feed-item"
      style={{
        height: "80vh",
        width: "90%",
        margin: "0 auto",
        flexShrink: 0,
        scrollSnapAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        background: "var(--cream)",
        borderRadius: "24px",
        boxShadow: isActive
          ? "0 10px 40px rgba(0,0,0,0.12)"
          : "0 4px 12px rgba(0,0,0,0.05)",
        transform: isActive ? "scale(1)" : "scale(0.92)",
        opacity: isActive ? 1 : 0.6,
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
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
          bottom: "16px",
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
