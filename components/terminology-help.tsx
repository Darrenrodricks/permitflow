"use client";
import { useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
const copy = {
  drainage: {
    label: "Help with drainage or culvert",
    title: "What does this mean?",
    body: "Select Yes if your project changes how water flows around the driveway, roadside ditch, drainage pipe, or culvert.",
    examples: [
      "Replacing or modifying a pipe beneath the driveway",
      "Widening a driveway over an existing roadside ditch",
      "Changing drainage around the driveway entrance",
    ],
    note: "Not sure? Select Not sure to continue and flag this for NYSDOT review.",
  },
  rightOfWay: {
    label: "Help with state right-of-way",
    title: "What is a right-of-way?",
    body: "The land used for a public road and its supporting features. It can include shoulders and roadside ditches beyond the pavement.",
    note: "NYSDOT staff verify whether your proposed work is within the state right-of-way.",
  },
  additionalInsured: {
    label: "Help with additional insured",
    title: "What is an additional insured?",
    body: "A person or organization, other than the policyholder, included in an insurance policy’s coverage. Here, the document check looks for NYSDOT to be named.",
    note: "Staff verify the actual policy and required coverage.",
  },
};
export function TerminologyHelp({ term }: { term: keyof typeof copy }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const content = copy[term];
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !noteRef.current?.contains(e.target as Node)
      )
        ref.current.open = false;
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <details
      className="terminology-help"
      ref={ref}
      onToggle={() => {
        if (!ref.current?.open) {
          setPosition(null);
          return;
        }
        const rect = ref.current.getBoundingClientRect();
        const width = Math.min(330, window.innerWidth - 32);
        setPosition({
          left: Math.max(
            16,
            Math.min(rect.right - width, window.innerWidth - width - 16),
          ),
          top: Math.max(
            16,
            Math.min(rect.bottom + 8, window.innerHeight - 390),
          ),
        });
      }}
    >
      <summary aria-label={content.label} aria-controls={id}>
        <Info size={16} />
      </summary>
      {position &&
        createPortal(
          <div
            id={id}
            ref={noteRef}
            className="terminology-popover"
            role="note"
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
              right: "auto",
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
            }}
          >
            <strong>{content.title}</strong>
            <p>{content.body}</p>
            {"examples" in content && (
              <>
                <h4>Examples</h4>
                <ul>
                  {content.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </>
            )}
            <p>{content.note}</p>
          </div>,
          window.document.body,
        )}
    </details>
  );
}
