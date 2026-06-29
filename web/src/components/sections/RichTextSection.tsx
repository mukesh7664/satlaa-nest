import React from "react";

interface RichTextSectionProps {
  data: {
    title?: string;
    content?: string;
  };
}

export const RichTextSection: React.FC<RichTextSectionProps> = ({ data }) => {
  if (!data?.content) return null;

  return (
    <section className="py-16 bg-white">
      <style>{`
        .rte-content { font-family: inherit; font-size: 16px; line-height: 1.75; color: #1f2937; }

        /* Headings */
        .rte-content h1 { font-size: 2.25em; font-weight: 700; line-height: 1.2; margin: 1.2em 0 0.5em; color: #111827; }
        .rte-content h2 { font-size: 1.75em; font-weight: 700; line-height: 1.25; margin: 1.1em 0 0.5em; color: #111827; }
        .rte-content h3 { font-size: 1.4em; font-weight: 600; line-height: 1.3; margin: 1em 0 0.4em; color: #111827; }
        .rte-content h4 { font-size: 1.15em; font-weight: 600; line-height: 1.35; margin: 0.9em 0 0.4em; color: #111827; }
        .rte-content h5, .rte-content h6 { font-size: 1em; font-weight: 600; line-height: 1.4; margin: 0.8em 0 0.4em; color: #111827; }

        /* Paragraph */
        .rte-content p { margin: 0 0 1em 0; }
        .rte-content p:last-child { margin-bottom: 0; }

        /* Bold / Italic / Underline / Strike */
        .rte-content strong, .rte-content b { font-weight: 700; }
        .rte-content em, .rte-content i { font-style: italic; }
        .rte-content u { text-decoration: underline; }
        .rte-content s, .rte-content del { text-decoration: line-through; }

        /* Superscript / Subscript */
        .rte-content sup { font-size: 0.75em; vertical-align: super; line-height: 0; }
        .rte-content sub { font-size: 0.75em; vertical-align: sub; line-height: 0; }

        /* Lists */
        .rte-content ul { list-style-type: disc; padding-left: 1.75em; margin: 0.75em 0 1em; }
        .rte-content ol { list-style-type: decimal; padding-left: 1.75em; margin: 0.75em 0 1em; }
        .rte-content li { margin: 0.3em 0; }
        .rte-content ul ul { list-style-type: circle; }
        .rte-content ul ul ul { list-style-type: square; }
        .rte-content ol ol { list-style-type: lower-alpha; }

        /* Links */
        .rte-content a { color: #4f46e5; text-decoration: underline; }
        .rte-content a:hover { color: #3730a3; }

        /* Blockquote */
        .rte-content blockquote {
          border-left: 4px solid #6366f1;
          padding: 0.75em 1em;
          margin: 1em 0;
          background: #f5f3ff;
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: #374151;
        }

        /* Code */
        .rte-content code {
          background: #f3f4f6;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875em;
          color: #be123c;
        }
        .rte-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1em 1.25em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875em;
          line-height: 1.6;
        }
        .rte-content pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

        /* Horizontal Rule */
        .rte-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }

        /* Images */
        .rte-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        /* Text Alignment */
        .rte-content [style*="text-align: left"], .rte-content .text-left { text-align: left; }
        .rte-content [style*="text-align: center"], .rte-content .text-center { text-align: center; }
        .rte-content [style*="text-align: right"], .rte-content .text-right { text-align: right; }
        .rte-content [style*="text-align: justify"], .rte-content .text-justify { text-align: justify; }

        /* Inline styles from TipTap (font-size, color, letter-spacing, line-height) pass through natively */
      `}</style>

      <div className="container-xl mx-auto px-4 max-w-4xl">
        {data.title && (
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
            {data.title}
          </h2>
        )}
        <div
          className="rte-content"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </section>
  );
};
