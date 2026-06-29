"use client";

import { useEffect, useState } from "react";
import { SectionRendererClient } from "@/components/SectionRendererClient";
import { SectionVisibilityManager } from "@/components/SectionVisibilityManager";
import { usePreview } from "@/contexts/PreviewContext";
import {
  getCollectionBySlug,
  type CollectionWithProducts,
} from "@/lib/api/collections";

export default function PreviewPage() {
  const { pageData } = usePreview();
  const [collections, setCollections] = useState<CollectionWithProducts[]>([]);

  // Fetch collections when pageData changes
  useEffect(() => {
    if (pageData && pageData.sections) {
      const fetchCollections = async () => {
        let collectionSlugs: string[] = [];
        pageData.sections.forEach((ps: any) => {
          const secData = {
            ...(ps.section?.data || ps.data || ps || {}),
            ...(ps.customData || {}),
          };
          if (
            secData.collectionSlugs &&
            Array.isArray(secData.collectionSlugs)
          ) {
            collectionSlugs.push(...secData.collectionSlugs);
          }
          if (
            secData.collectionSlug &&
            typeof secData.collectionSlug === "string"
          ) {
            collectionSlugs.push(secData.collectionSlug);
          }
        });

        if (collectionSlugs.length > 0) {
          try {
            const uniqueSlugs = Array.from(new Set(collectionSlugs));
            const collectionPromises = uniqueSlugs.map((slug) =>
              getCollectionBySlug(slug, { limit: 100 })
                .then((res) => res.collection)
                .catch((err) => {
                  console.error(`Error fetching collection ${slug}:`, err);
                  return null;
                }),
            );
            const results = await Promise.all(collectionPromises);
            const fetched = results.filter(
              (c): c is CollectionWithProducts => c !== null,
            );
            setCollections(fetched);
          } catch (err) {
            console.error("Error fetching collections for preview:", err);
          }
        } else {
          setCollections([]);
        }
      };

      fetchCollections();
    }
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Waiting for preview data...</p>
        </div>
      </div>
    );
  }

  if (!pageData.sections || pageData.sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 font-medium">No sections to preview</p>
          <p className="text-sm text-gray-400 mt-2">
            Add sections in the editor to see them here
          </p>
        </div>
      </div>
    );
  }

  const headerSections = pageData.sections.filter((s: any) => s.group === "header" || s.group === "top");
  const footerSections = pageData.sections.filter((s: any) => s.group === "footer" || s.group === "bottom");
  const templateSections = pageData.sections.filter((s: any) =>
    s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")
  );

  return (
    <div className="preview-container min-h-screen bg-white flex flex-col">
      <SectionVisibilityManager sections={pageData.sections} />

      {/* Top sections */}
      <div id="top-sections" className="relative z-50">
        {headerSections.map((section: any) => {
          const index = pageData.sections.indexOf(section);
          return (
            <SectionRendererClient
              key={section.id || index}
              pageSection={section}
              index={index}
              extraProps={{
                collections,
                brandSlug: pageData.slug,
              }}
            />
          );
        })}
      </div>

      {/* Middle sections */}
      <div id="middle-sections" className="relative z-0">
        {templateSections.map((section: any) => {
          const index = pageData.sections.indexOf(section);
          return (
            <SectionRendererClient
              key={section.id || index}
              pageSection={section}
              index={index}
              extraProps={{
                collections,
                brandSlug: pageData.slug,
              }}
            />
          );
        })}
      </div>

      {/* Bottom sections */}
      <div id="bottom-sections" className="relative z-0">
        {footerSections.map((section: any) => {
          const index = pageData.sections.indexOf(section);
          return (
            <SectionRendererClient
              key={section.id || index}
              pageSection={section}
              index={index}
              extraProps={{
                collections,
                brandSlug: pageData.slug,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
