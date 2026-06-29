import React from "react";
import {
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ViewStream as SectionIcon,
} from "@mui/icons-material";

interface SectionListItemProps {
  title: string;
  isActive: boolean;
  isLastActive?: boolean;
  isEnabled: boolean;
  onSelect: () => void;
  onToggleEnable: (checked: boolean) => void;
  onDelete: () => void;
  // onMoveUp/Down removed
  isFirst?: boolean;
  isLast?: boolean;
  isDynamic?: boolean;
  dragHandleProps?: any; // For dnd-kit
}

export const SectionListItem = ({
  title,
  isActive,
  isLastActive,
  isEnabled,
  onSelect,
  onToggleEnable,
  onDelete,
  isDynamic,
  dragHandleProps,
}: SectionListItemProps) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-3 p-3 cursor-pointer transition-colors ${isActive
        ? "bg-blue-50/50"
        : isLastActive
          ? "bg-blue-50/30 shadow-inner"
          : "hover:bg-slate-50"
        }`}
    >
      <div
        className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
      >
        <DragIndicatorIcon sx={{ fontSize: 18 }} />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <SectionIcon sx={{ fontSize: 16, color: isActive ? "#2563eb" : "#94a3b8" }} />
        <span
          className={`text-sm font-medium truncate ${isActive ? "text-blue-600" : "text-slate-700 font-normal"
            }`}
        >
          {title}
        </span>
      </div>

      <div
        className="flex items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleEnable(!isEnabled)}
          title={isEnabled ? "Hide" : "Show"}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-colors ${isEnabled ? "text-slate-400 group-hover:text-slate-600" : "text-slate-300"
            }`}
        >
          {isEnabled ? (
            <VisibilityIcon sx={{ fontSize: 16 }} />
          ) : (
            <VisibilityOffIcon sx={{ fontSize: 16 }} />
          )}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Section"
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};
