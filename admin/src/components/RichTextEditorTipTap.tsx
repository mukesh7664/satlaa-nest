"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/core";


// ─── Custom Extensions ────────────────────────────────────────────────────────

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const LineHeight = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => el.style.lineHeight || null,
            renderHTML: (attrs) =>
              attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }: any) =>
          commands.updateAttributes("paragraph", { lineHeight }),
    } as any;
  },
});

const LetterSpacing = Extension.create({
  name: "letterSpacing",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (el) => el.style.letterSpacing || null,
            renderHTML: (attrs) =>
              attrs.letterSpacing
                ? { style: `letter-spacing: ${attrs.letterSpacing}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing:
        (spacing: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { letterSpacing: spacing }).run(),
    } as any;
  },
});

// ─── Toolbar Dropdown ─────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  currentValue?: string;
}

const ToolbarDropdown: React.FC<DropdownProps> = ({ label, options, onSelect, currentValue }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = currentValue
    ? options.find((o) => o.value === currentValue)?.label || label
    : label;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          fontSize: 12,
          fontWeight: 500,
          background: "transparent",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          cursor: "pointer",
          whiteSpace: "nowrap",
          color: "#374151",
          height: 28,
        }}
        title={label}
      >
        {displayLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 100,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onSelect(opt.value); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "5px 12px",
                fontSize: 12,
                cursor: "pointer",
                background: currentValue === opt.value ? "#f3f4f6" : "transparent",
                fontWeight: currentValue === opt.value ? 600 : 400,
                border: "none",
                color: "#374151",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────

const TBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      borderRadius: 4,
      border: "none",
      background: active ? "#e0e7ff" : "transparent",
      color: active ? "#4f46e5" : "#374151",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      fontSize: 13,
      fontWeight: active ? 700 : 400,
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
    }}
    onMouseLeave={(e) => {
      if (!active) (e.currentTarget as HTMLButtonElement).style.background = active ? "#e0e7ff" : "transparent";
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <span style={{ width: 1, height: 20, background: "#e5e7eb", display: "inline-block", margin: "0 4px" }} />
);

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const FONT_SIZES = [
  { label: "8px", value: "8px" }, { label: "10px", value: "10px" },
  { label: "12px", value: "12px" }, { label: "14px", value: "14px" },
  { label: "16px", value: "16px" }, { label: "18px", value: "18px" },
  { label: "20px", value: "20px" }, { label: "24px", value: "24px" },
  { label: "28px", value: "28px" }, { label: "32px", value: "32px" },
  { label: "36px", value: "36px" }, { label: "48px", value: "48px" },
  { label: "60px", value: "60px" }, { label: "72px", value: "72px" },
];

const LINE_HEIGHTS = [
  { label: "1.0", value: "1" }, { label: "1.2", value: "1.2" },
  { label: "1.5", value: "1.5" }, { label: "1.75", value: "1.75" },
  { label: "2.0", value: "2" }, { label: "2.5", value: "2.5" },
  { label: "3.0", value: "3" },
];

const LETTER_SPACINGS = [
  { label: "Normal", value: "normal" }, { label: "-0.05em", value: "-0.05em" },
  { label: "0em", value: "0em" }, { label: "0.025em", value: "0.025em" },
  { label: "0.05em", value: "0.05em" }, { label: "0.1em", value: "0.1em" },
  { label: "0.15em", value: "0.15em" }, { label: "0.25em", value: "0.25em" },
];

const HEADINGS = [
  { label: "Normal", value: "p" },
  { label: "Heading 1", value: "h1" }, { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" }, { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" }, { label: "Heading 6", value: "h6" },
];

const COLORS = [
  "#000000", "#374151", "#6b7280", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#ffffff",
];

const ColorPicker: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        title="Text Color"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", width: 28, height: 28, borderRadius: 4,
          border: "none", background: "transparent", cursor: "pointer", padding: 2,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, color: "#374151", lineHeight: 1 }}>A</span>
        <span style={{ display: "block", width: 16, height: 3, background: currentColor, borderRadius: 1, marginTop: 1 }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, zIndex: 9999, background: "#fff",
            border: "1px solid #e5e7eb", borderRadius: 8, padding: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", flexWrap: "wrap", width: 120, gap: 4,
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c} type="button"
              onClick={() => { editor.chain().focus().setColor(c).run(); setOpen(false); }}
              style={{
                width: 20, height: 20, background: c, borderRadius: 3, cursor: "pointer",
                border: currentColor === c ? "2px solid #6366f1" : "1px solid #d1d5db",
              }}
              title={c}
            />
          ))}
          <input
            type="color" value={currentColor}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            style={{ width: "100%", height: 24, cursor: "pointer", border: "1px solid #e5e7eb", borderRadius: 3 }}
            title="Custom color"
          />
        </div>
      )}
    </div>
  );
};

const Toolbar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) return null;

  const headingValue = HEADINGS.find((h) => {
    if (h.value === "p") return !editor.isActive("heading");
    const level = parseInt(h.value.replace("h", ""));
    return editor.isActive("heading", { level });
  })?.value || "p";

  const setHeading = (val: string) => {
    if (val === "p") { editor.chain().focus().setParagraph().run(); return; }
    const level = parseInt(val.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toolbarStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", flexWrap: "wrap",
    gap: 2, padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb", background: "#fafafa",
    borderRadius: "6px 6px 0 0",
  };

  return (
    <div style={toolbarStyle}>
      {/* Undo / Redo */}
      <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        ↩
      </TBtn>
      <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        ↪
      </TBtn>
      <Divider />

      {/* Font Size */}
      <ToolbarDropdown
        label="Font Size"
        options={FONT_SIZES}
        currentValue={editor.getAttributes("textStyle").fontSize}
        onSelect={(v) => (editor as any).chain().focus().setFontSize(v).run()}
      />

      {/* Line Height */}
      <ToolbarDropdown
        label="Line Height"
        options={LINE_HEIGHTS}
        currentValue={editor.getAttributes("paragraph").lineHeight}
        onSelect={(v) => (editor as any).chain().focus().setLineHeight(v).run()}
      />

      {/* Letter Spacing */}
      <ToolbarDropdown
        label="Letter Spacing"
        options={LETTER_SPACINGS}
        currentValue={editor.getAttributes("textStyle").letterSpacing}
        onSelect={(v) => (editor as any).chain().focus().setLetterSpacing(v).run()}
      />
      <Divider />

      {/* Color */}
      <ColorPicker editor={editor} />

      {/* Bold */}
      <TBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </TBtn>

      {/* Italic */}
      <TBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </TBtn>

      {/* Underline */}
      <TBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </TBtn>

      {/* Strike */}
      <TBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </TBtn>
      <Divider />

      {/* Superscript */}
      <TBtn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
        X²
      </TBtn>

      {/* Subscript */}
      <TBtn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
        X₂
      </TBtn>

      {/* Clear Formatting */}
      <TBtn title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        ✕
      </TBtn>
      <Divider />

      {/* Indent / Outdent (via list nesting) */}
      <TBtn title="Indent" onClick={() => editor.chain().focus().sinkListItem("listItem").run()}>
        →|
      </TBtn>
      <TBtn title="Outdent" onClick={() => editor.chain().focus().liftListItem("listItem").run()}>
        |←
      </TBtn>
      <Divider />

      {/* Text Align */}
      <TBtn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        ⬤≡
      </TBtn>
      <TBtn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        ≡
      </TBtn>
      <TBtn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        ≡⬤
      </TBtn>
      <TBtn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        ▤
      </TBtn>
      <Divider />

      {/* Heading */}
      <ToolbarDropdown
        label="Normal"
        options={HEADINGS}
        currentValue={headingValue}
        onSelect={setHeading}
      />
      <Divider />

      {/* Bullet List */}
      <TBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •≡
      </TBtn>

      {/* Ordered List */}
      <TBtn title="Numbered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1≡
      </TBtn>

      {/* Blockquote */}
      <TBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        "
      </TBtn>

      {/* Code */}
      <TBtn title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {"<>"}
      </TBtn>
      <Divider />

      {/* Link */}
      <TBtn
        title="Insert Link"
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("Enter URL:", editor.getAttributes("link").href || "https://");
          if (url === null) return;
          if (url === "") { editor.chain().focus().unsetLink().run(); return; }
          editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
        }}
      >
        🔗
      </TBtn>

      {/* Horizontal Rule */}
      <TBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </TBtn>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface RichTextEditorTipTapProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditorTipTap: React.FC<RichTextEditorTipTapProps> = ({
  value,
  onChange,
  placeholder = "Start writing content here...",
  minHeight = 300,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      TextStyle,
      Color,
      FontSize,
      LineHeight,
      LetterSpacing,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
        style: `min-height: ${minHeight}px; outline: none; padding: 16px;`,
      },
    },
  });

  // Sync external value changes (e.g., load from API)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .tiptap-editor-content { font-family: inherit; font-size: 14px; line-height: 1.6; color: #1f2937; }
        .tiptap-editor-content p { margin: 0 0 8px 0; }
        .tiptap-editor-content h1 { font-size: 2em; font-weight: 700; margin: 16px 0 8px; }
        .tiptap-editor-content h2 { font-size: 1.5em; font-weight: 700; margin: 14px 0 8px; }
        .tiptap-editor-content h3 { font-size: 1.25em; font-weight: 600; margin: 12px 0 8px; }
        .tiptap-editor-content h4 { font-size: 1.1em; font-weight: 600; margin: 10px 0 6px; }
        .tiptap-editor-content h5, .tiptap-editor-content h6 { font-size: 1em; font-weight: 600; margin: 8px 0 6px; }
        .tiptap-editor-content ul { list-style: disc; padding-left: 24px; margin: 8px 0; }
        .tiptap-editor-content ol { list-style: decimal; padding-left: 24px; margin: 8px 0; }
        .tiptap-editor-content li { margin: 2px 0; }
        .tiptap-editor-content blockquote { border-left: 4px solid #6366f1; padding: 8px 16px; background: #f5f3ff; margin: 8px 0; border-radius: 0 4px 4px 0; font-style: italic; }
        .tiptap-editor-content pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
        .tiptap-editor-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .tiptap-editor-content a { color: #6366f1; text-decoration: underline; }
        .tiptap-editor-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 16px 0; }
        .tiptap-editor-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; float: left; pointer-events: none; height: 0; }
        .tiptap-editor-content:focus { outline: none; }
      `}</style>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditorTipTap;
