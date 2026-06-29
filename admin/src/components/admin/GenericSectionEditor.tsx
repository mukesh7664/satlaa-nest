import React from "react";

interface GenericSectionEditorProps {
  data: any;
  onChange: (newData: any) => void;
  openResourcePicker?: (onSelect: (slug: string) => void, type?: "product" | "collection" | "page") => void;
  showAdvanced?: boolean;
  showTrustedBy?: boolean;
}

export const GenericSectionEditor: React.FC<GenericSectionEditorProps> = ({
  data,
  onChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openResourcePicker: _openResourcePicker,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showAdvanced: _showAdvanced,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showTrustedBy: _showTrustedBy,
}) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const renderField = (key: string, value: any) => {
    if (typeof value === "string") {
      // Long text detection
      if (value.length > 100) {
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            rows={4}
          />
        );
      }
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      );
    }
    if (typeof value === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(key, Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      );
    }
    if (typeof value === "boolean") {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleChange(key, e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
      );
    }
    if (Array.isArray(value)) {
      return (
        <div className="text-xs text-slate-500 italic">
          Array editing not supported in Generic Editor yet. Use specific
          editor.
        </div>
      );
    }
    if (typeof value === "object" && value !== null) {
      return (
        <div className="pl-4 border-l-2 border-slate-200 mt-2 space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">
                {subKey.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {/* Recursive is hard with flat onChange. We need deep Generic Editor. 
                             For now simplifies: JSON text area?
                          */}
              <div className="text-xs text-slate-400">
                Nested object editing limited.
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <div className="text-xs text-red-400">Unsupported type</div>;
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-xs text-yellow-800 mb-4">
        Using Generic Editor. Some complex fields may not be editable.
      </div>
      {Object.entries(data || {}).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </label>
          {renderField(key, value)}
        </div>
      ))}
    </div>
  );
};
