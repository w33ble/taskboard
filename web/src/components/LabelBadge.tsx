import { X } from "lucide-react";
import type { Label } from "../api/client";

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
}

export default function LabelBadge({ label, onRemove }: LabelBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: label.color + "1a",
        color: label.color,
      }}
    >
      {label.name}
      {onRemove && (
        <X
          className="w-3 h-3 ml-0.5 cursor-pointer text-slate-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </span>
  );
}
