import React, { useState, useEffect } from "react";

export interface ShelvingInteractiveProps {
  items: string[];
  originalItems: string[];
  onConfirm: (isCorrect: boolean, arranged: string[]) => void;
  showCorrectAnswerOnFail?: boolean;
  onRetry?: () => void;
  disableRetry?: boolean;
}

export const ShelvingInteractive: React.FC<ShelvingInteractiveProps> = ({
  items,
  originalItems,
  onConfirm,
  showCorrectAnswerOnFail = false,
  onRetry,
  disableRetry = false,
}) => {
  const [tray, setTray] = useState<string[]>([]);
  const [canvas, setCanvas] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userSubmission, setUserSubmission] = useState<string[] | null>(null);

  useEffect(() => {
    setTray([...items]);
    setCanvas([]);
    setHasSubmitted(false);
    setIsCorrect(null);
    setUserSubmission(null);
  }, [items]);

  const handleReset = () => {
    setTray([...items]);
    setCanvas([]);
    setHasSubmitted(false);
    setIsCorrect(null);
    setUserSubmission(null);
  };

  const handleTrayItemClick = (item: string) => {
    if (hasSubmitted) return;
    setTray((prev) => prev.filter((i) => i !== item));
    setCanvas((prev) => [...prev, item]);
  };

  const handleCanvasItemClick = (item: string) => {
    if (hasSubmitted) return;
    setCanvas((prev) => prev.filter((i) => i !== item));
    setTray((prev) => [...prev, item]);
  };

  const handlePointerDown = (e: React.PointerEvent, item: string) => {
    if (hasSubmitted) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setDraggedItem(item);
    setPointerPos({ x: e.clientX, y: e.clientY });
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedItem || !startPos) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    let currentlyDragging = isDragging;
    if (!currentlyDragging && Math.sqrt(dx * dx + dy * dy) > 5) {
      currentlyDragging = true;
      setIsDragging(true);
    }

    if (currentlyDragging) {
      setPointerPos({ x: e.clientX, y: e.clientY });

      const canvasEl = canvasRef.current;
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 20 &&
          e.clientX <= rect.right + 20 &&
          e.clientY >= rect.top - 20 &&
          e.clientY <= rect.bottom + 20
        ) {
          const children = Array.from(canvasEl.children).filter(
            (child) => child.getAttribute("data-draggable") === "true",
          );

          let foundIndex = children.length;
          for (let i = 0; i < children.length; i++) {
            const childRect = children[i].getBoundingClientRect();
            if (e.clientY < childRect.top + childRect.height / 2) {
              foundIndex = i;
              break;
            }
          }
          setDragOverIndex(foundIndex);
        } else {
          setDragOverIndex(null);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent, item: string) => {
    if (!draggedItem) return;

    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }

    if (!isDragging) {
      // Treat as click
      if (tray.includes(item)) {
        handleTrayItemClick(item);
      } else if (canvas.includes(item)) {
        handleCanvasItemClick(item);
      }
    } else {
      // Treat as drop
      if (dragOverIndex !== null) {
        handleDropAction(dragOverIndex, item);
      }
    }

    setDraggedItem(null);
    setPointerPos(null);
    setStartPos(null);
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDropAction = (dropIndex: number, item: string) => {
    if (tray.includes(item)) {
      setTray((prev) => prev.filter((i) => i !== item));
      setCanvas((prev) => {
        const newCanvas = [...prev];
        newCanvas.splice(dropIndex, 0, item);
        return newCanvas;
      });
    } else if (canvas.includes(item)) {
      setCanvas((prev) => {
        const draggedIndex = prev.indexOf(item);

        let finalDropIndex = dropIndex;
        if (draggedIndex < dropIndex) {
          finalDropIndex -= 1;
        }

        if (draggedIndex === finalDropIndex) return prev;

        const newCanvas = [...prev];
        newCanvas.splice(draggedIndex, 1);
        newCanvas.splice(finalDropIndex, 0, item);
        return newCanvas;
      });
    }
  };

  const handleConfirm = () => {
    if (canvas.length !== items.length) return;

    const correct = canvas.every(
      (item, index) => item === originalItems[index],
    );
    setIsCorrect(correct);
    setHasSubmitted(true);
    setUserSubmission([...canvas]);

    if (!correct && showCorrectAnswerOnFail) {
      setTimeout(() => {
        setCanvas([...originalItems]);
      }, 1000);
    }

    onConfirm(correct, canvas);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Ghost Element for Dragging */}
      {isDragging && draggedItem && pointerPos && (
        <div
          style={{
            position: "fixed",
            left: pointerPos.x,
            top: pointerPos.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1000,
            padding: "14px 16px",
            background: "var(--cream)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius)",
            color: "var(--ink)",
            fontSize: "calc(16px * var(--scale, 1))",
            fontFamily: "var(--font-body)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            opacity: 0.9,
          }}
        >
          {draggedItem}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{
          minHeight: "180px",
          background: "var(--cream)",
          border: "2px dashed var(--cream-border)",
          borderRadius: "var(--radius)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
          transition: "all 0.2s",
        }}
      >
        {canvas.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "var(--ink-faint)",
              fontSize: "calc(14px * var(--scale, 1))",
              pointerEvents: "none",
            }}
          >
            Click or drag items here
          </div>
        )}

        {canvas.map((item, idx) => {
          const isDraggingThis = isDragging && draggedItem === item;
          return (
            <React.Fragment key={item}>
              {dragOverIndex === idx && draggedItem !== item && (
                <div
                  style={{
                    height: "48px",
                    background: "rgba(0,0,0,0.03)",
                    borderRadius: "var(--radius)",
                    border: "2px dashed var(--accent)",
                    margin: "4px 0",
                  }}
                />
              )}
              <div
                data-draggable="true"
                onPointerDown={(e) => handlePointerDown(e, item)}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => handlePointerUp(e, item)}
                onPointerCancel={(e) => handlePointerUp(e, item)}
                style={{
                  padding: "14px 16px",
                  background:
                    hasSubmitted &&
                    userSubmission &&
                    userSubmission.indexOf(item) === originalItems.indexOf(item)
                      ? "var(--green-bg)"
                      : hasSubmitted &&
                          userSubmission &&
                          userSubmission.indexOf(item) !==
                            originalItems.indexOf(item) &&
                          showCorrectAnswerOnFail
                        ? "var(--red-bg)"
                        : "var(--cream)",
                  border:
                    hasSubmitted &&
                    userSubmission &&
                    userSubmission.indexOf(item) === originalItems.indexOf(item)
                      ? "1px solid var(--green)"
                      : hasSubmitted &&
                          userSubmission &&
                          userSubmission.indexOf(item) !==
                            originalItems.indexOf(item) &&
                          showCorrectAnswerOnFail
                        ? "1px solid var(--red)"
                        : "1px solid var(--cream-border)",
                  borderRadius: "var(--radius)",
                  color:
                    hasSubmitted &&
                    userSubmission &&
                    userSubmission.indexOf(item) === originalItems.indexOf(item)
                      ? "var(--green)"
                      : hasSubmitted &&
                          userSubmission &&
                          userSubmission.indexOf(item) !==
                            originalItems.indexOf(item) &&
                          showCorrectAnswerOnFail
                        ? "var(--red)"
                        : "var(--ink)",
                  fontSize: "calc(16px * var(--scale, 1))",
                  fontFamily: "var(--font-body)",
                  cursor: hasSubmitted
                    ? "default"
                    : isDraggingThis
                      ? "grabbing"
                      : "grab",
                  opacity: isDraggingThis ? 0.3 : 1,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  transition: isDraggingThis ? "none" : "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                {item}
              </div>
            </React.Fragment>
          );
        })}
        {dragOverIndex === canvas.length && draggedItem && (
          <div
            style={{
              height: "48px",
              background: "rgba(0,0,0,0.03)",
              borderRadius: "var(--radius)",
              border: "2px dashed var(--accent)",
              margin: "4px 0",
            }}
          />
        )}
      </div>

      {/* Tray */}
      <div
        style={{
          minHeight: "100px",
          background: "var(--cream-dark)",
          borderRadius: "var(--radius)",
          padding: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignContent: "flex-start",
        }}
      >
        {tray.map((item) => {
          const isDraggingThis = isDragging && draggedItem === item;
          return (
            <div
              key={item}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(e, item)}
              onPointerCancel={(e) => handlePointerUp(e, item)}
              style={{
                padding: "12px 16px",
                background: "var(--cream)",
                border: "1px solid var(--cream-border)",
                borderRadius: "var(--radius)",
                color: "var(--ink)",
                fontSize: "calc(15px * var(--scale, 1))",
                fontFamily: "var(--font-body)",
                cursor: hasSubmitted
                  ? "default"
                  : isDraggingThis
                    ? "grabbing"
                    : "grab",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                userSelect: "none",
                opacity: isDraggingThis ? 0.3 : 1,
                touchAction: "none",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Confirm Button */}
      {hasSubmitted ? (
        <div style={{ display: "flex", gap: "12px" }}>
          {!disableRetry && (
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: "calc(16px * var(--scale, 1))",
                fontWeight: 500,
                background: "var(--accent-bg)",
                color: "var(--accent)",
                border: "1px solid var(--accent-light)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Try Again
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: "calc(16px * var(--scale, 1))",
                fontWeight: 500,
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              New Practice
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleConfirm}
          disabled={canvas.length !== items.length}
          style={{
            padding: "16px",
            background:
              canvas.length === items.length
                ? "var(--accent)"
                : "var(--cream-border)",
            color:
              canvas.length === items.length
                ? "var(--cream)"
                : "var(--ink-faint)",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: "calc(16px * var(--scale, 1))",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            cursor: canvas.length === items.length ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Confirm
        </button>
      )}
    </div>
  );
};
