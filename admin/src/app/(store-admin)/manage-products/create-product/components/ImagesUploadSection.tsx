"use client";
import { useState } from "react";
import MediaPickerModal from "@/components/MediaPickerModal";
import { Button, IconButton } from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

// We need to pass data back up, standard props for controlled form
interface ImagesUploadSectionProps {
  mainImage?: string;
  setMainImage: (url: string) => void;
  thumbnails?: string[];
  setThumbnails: (urls: string[]) => void;
}

export default function ImagesUploadSection({
  mainImage,
  setMainImage,
  thumbnails = [],
  setThumbnails,
}: ImagesUploadSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [target, setTarget] = useState<"main" | "thumbnail">("main");

  const openPicker = (type: "main" | "thumbnail") => {
    setTarget(type);
    setPickerOpen(true);
  };

  const handleSelect = (file: any) => {
    const url = file.url;
    if (target === "main") {
      setMainImage(url);
    } else {
      setThumbnails([...thumbnails, url]);
    }
  };

  const removeThumbnail = (index: number) => {
    const newThumbnails = [...thumbnails];
    newThumbnails.splice(index, 1);
    setThumbnails(newThumbnails);
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">
        Product Images
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Main Image
          </label>
          <div
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden group transition-all"
            onClick={() => openPicker("main")}
          >
            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt="Main"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Change Image
                </div>
              </>
            ) : (
              <>
                <ImageIcon className="text-slate-400 text-4xl mb-2" />
                <span className="text-sm text-slate-500">
                  Select Main Image
                </span>
              </>
            )}
          </div>
          {mainImage && (
            <Button
              size="small"
              color="error"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                setMainImage("");
              }}
              sx={{ mt: 1 }}
            >
              Remove
            </Button>
          )}
        </div>

        {/* Thumbnails */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Gallery Images
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {thumbnails.map((url, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg border border-slate-200 relative group overflow-hidden bg-slate-50"
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeThumbnail(idx)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500"
                >
                  <CloseIcon fontSize="small" style={{ fontSize: 16 }} />
                </button>
              </div>
            ))}

            {/* Add Button */}
            <div
              className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all"
              onClick={() => openPicker("thumbnail")}
            >
              <AddIcon fontSize="large" />
              <span className="text-xs mt-1">Add Image</span>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        title={target === "main" ? "Select Main Image" : "Select Gallery Image"}
      />
    </div>
  );
}
