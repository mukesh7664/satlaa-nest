"use client";
import React, { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function ClientTableOfContents({ htmlContent }: { htmlContent: string }) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse the HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const elements = Array.from(doc.querySelectorAll("h2, h3"));
    
    const extractedHeadings = elements.map((el, index) => {
      // In a real scenario, the content might already have IDs. If not, generate one.
      const text = el.textContent || "";
      const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const id = el.id || `${baseId}-${index}`;
      
      // We also need to actually set IDs on the real DOM elements rendered by dangerouslySetInnerHTML.
      // Since dangerouslySetInnerHTML doesn't give us interactive hooks into the DOM easily,
      // it's best we apply IDs dynamically after render to the `.prose` container elements.
      return {
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setHeadings(extractedHeadings);
  }, [htmlContent]);

  useEffect(() => {
    // Mutate the rendered DOM to inject IDs so anchor links work
    const proseDiv = document.querySelector(".prose");
    if (proseDiv) {
      const liveElements = Array.from(proseDiv.querySelectorAll("h2, h3"));
      liveElements.forEach((el, index) => {
        if (!el.id && headings[index]) {
          el.id = headings[index].id;
        }
      });
    }

    // Intersection Observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleElements = entries.filter((entry) => entry.isIntersecting);
        if (visibleElements.length > 0) {
          setActiveId(visibleElements[0].target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    if (proseDiv) {
      const liveElements = Array.from(proseDiv.querySelectorAll("h2, h3"));
      liveElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        On this page
      </h4>
      <ul className="space-y-2.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${heading.level === 3 ? "pl-4" : ""}`}
          >
            <a
              href={`#${heading.id}`}
              className={`block text-[13px] leading-snug transition-colors ${
                activeId === heading.id
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                   // Calculate offset to account for sticky header
                   const yOffset = -100; 
                   const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                   window.scrollTo({top: y, behavior: 'smooth'});
                   setActiveId(heading.id);
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
