"use client";
import React from "react";
import { Download, Calendar, Loader2 } from "lucide-react";
import StatusBadge from "@/components/Analytics/StatusBadge";

interface ExportTabProps {
  reportTypes: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
  dateRanges: {
    [key: string]: { startDate: string; endDate: string; activePreset: string };
  };
  handleLegacyPreset: (key: string, preset: string) => void;
  handleLegacyDateChange: (key: string, field: "startDate" | "endDate", value: string) => void;
  openDownloadModal: (key: string, label: string) => void;
  downloading: string | null;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  reportTypes,
  dateRanges,
  handleLegacyPreset,
  handleLegacyDateChange,
  openDownloadModal,
  downloading,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Introduction Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-snug">Export Raw Store Reports</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Download raw CSV, XLSX, PDF, or JSON backups for bookkeeping, external CA audits, and inventory records.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5" />
        </div>
      </div>

      {/* Grid listing export targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const range = dateRanges[report.key] || {
            startDate: "",
            endDate: "",
            activePreset: "month",
          };
          const isCurrentDownloading = downloading === report.key;

          return (
            <div
              key={report.key}
              className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)] transition-all min-h-[300px]"
            >
              {/* Header Details */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0">
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{report.label}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {report.key} backup
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-5 min-h-[32px] leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Date Filter Configuration */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-50">
                {/* Preset Row selectors */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Preset timeline</span>
                  <select
                    value={range.activePreset}
                    onChange={(e) => handleLegacyPreset(report.key, e.target.value)}
                    className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Custom inputs details */}
                {range.activePreset === "custom" && (
                  <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                      <span>From:</span>
                      <input
                        type="date"
                        value={range.startDate}
                        onChange={(e) => handleLegacyDateChange(report.key, "startDate", e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-gray-100 pt-1.5">
                      <span>To:</span>
                      <input
                        type="date"
                        value={range.endDate}
                        onChange={(e) => handleLegacyDateChange(report.key, "endDate", e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Trigger configuration download */}
              <button
                onClick={() => openDownloadModal(report.key, report.label)}
                disabled={isCurrentDownloading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all"
              >
                {isCurrentDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Configure & Download
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExportTab;
