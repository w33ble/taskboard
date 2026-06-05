import { useEffect, useRef, useState } from "react";
import { api, Label } from "../api/client";
import LabelBadge from "./LabelBadge";

interface LabelPickerProps {
  selectedLabelIds: string[];
  onChange: (ids: string[]) => void;
}

export default function LabelPicker({
  selectedLabelIds,
  onChange,
}: LabelPickerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.labels.list().then(setLabels).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const toggleLabel = (id: string) => {
    onChange(
      selectedLabelIds.includes(id)
        ? selectedLabelIds.filter((x) => x !== id)
        : [...selectedLabelIds, id]
    );
  };

  const selectedLabels = labels.filter((l) =>
    selectedLabelIds.includes(l.id)
  );

  if (loading) {
    return <span className="text-sm text-slate-400">Loading labels...</span>;
  }

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.id}
              label={label}
              onRemove={() => toggleLabel(label.id)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors w-full text-left"
        onClick={() => setIsOpen((v) => !v)}
      >
        {selectedLabels.length === 0 ? "Labels" : "+ Add label"}
      </button>

      {isOpen && (
        <div className="absolute bg-slate-800 border border-slate-700 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10 w-full">
          {labels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);
            return (
              <div
                key={label.id}
                className="px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                onClick={() => toggleLabel(label.id)}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1">{label.name}</span>
                {isSelected && (
                  <span className="text-slate-500 text-xs">selected</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
