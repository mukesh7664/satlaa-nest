"use client";

import { useState, useEffect } from "react";

export interface SportSection {
  id: string;
  type: string;
  data: any;
  settings: any;
}

export function usePageSections(slug: string) {
  const [sections, setSections] = useState<SportSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

        const response = await fetch(`${API_URL}/pages/slug/${slug}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch page sections");
        }

        const json = await response.json();
        const pageData = json.data;

        if (pageData && pageData.sections) {
          const transformedSections = pageData.sections.map((ps: any) => ({
            id: ps.id,
            type: ps.section.type,
            data: ps.section.data,
            settings: ps.settings || {},
          }));
          setSections(transformedSections);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchSections();
    }
  }, [slug]);

  return { sections, loading, error };
}
