import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, Box, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

interface TrustedPartnersEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TrustedPartnersEditor: React.FC<TrustedPartnersEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateSectionField = (
    section: "softwareSection" | "hardwareSection",
    field: string,
    value: any
  ) => {
    const currentSection = data[section] || {};
    onChange({
      ...data,
      [section]: {
        ...currentSection,
        [field]: value,
      },
    });
  };

  // Generic Partner Management
  const addPartner = (section: "softwareSection" | "hardwareSection") => {
    const currentSection = data[section] || {};
    const currentPartners = currentSection.partners || [];
    const newPartner =
      section === "hardwareSection"
        ? { name: "", icon: "", varieties: "" }
        : { name: "", icon: "" };

    onChange({
      ...data,
      [section]: {
        ...currentSection,
        partners: [...currentPartners, newPartner],
      },
    });
  };

  const removePartner = (
    section: "softwareSection" | "hardwareSection",
    index: number
  ) => {
    const currentSection = data[section] || {};
    const currentPartners = currentSection.partners || [];
    const newPartners = currentPartners.filter(
      (_: any, i: number) => i !== index
    );

    onChange({
      ...data,
      [section]: {
        ...currentSection,
        partners: newPartners,
      },
    });
  };

  const updatePartner = (
    section: "softwareSection" | "hardwareSection",
    index: number,
    field: string,
    value: any
  ) => {
    const currentSection = data[section] || {};
    const currentPartners = [...(currentSection.partners || [])];
    currentPartners[index] = { ...currentPartners[index], [field]: value };

    onChange({
      ...data,
      [section]: {
        ...currentSection,
        partners: currentPartners,
      },
    });
  };

  return (
    <div className="space-y-8">
      <Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </Box>

      {/* Background Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Background Settings
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "color"}
            onChange={(e) => updateField("bgType", e.target.value)}
            className="bg-white"
            inputProps={{ className: "bg-white" }}
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              CSS Gradient
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || ""}
              onChange={(e) => updateField("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateField("backgroundImage", url)}
          />
        )}
      </div>
      {/* Main Section Settings */}
      <div className="space-y-4 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          General Settings
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Main Title
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Trusted Partners work with us"
              sx={{ bgcolor: "white" }}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <TextField
              fullWidth
              multiline
              value={data.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Section description..."
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
      </div>

      {/* Center Media */}
      <div className="space-y-4 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-800">Center Media</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Center Image
            </label>
            <ShopifyImagePicker
              label="Upload Image"
              value={data.centerImage || ""}
              onChange={(url) => updateField("centerImage", url)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Center Video
            </label>
            <ShopifyVideoPicker
              label="Upload Video"
              value={data.centerVideo || ""}
              onChange={(url) => updateField("centerVideo", url)}
            />
          </div>
        </div>
      </div>

      {/* Software Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Software Partners
        </h3>
        <div className="grid grid-cols-1 gap-6 mb-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Section Title
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.softwareSection?.title || ""}
              onChange={(e) =>
                updateSectionField("softwareSection", "title", e.target.value)
              }
              sx={{ bgcolor: "white" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Section Description
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.softwareSection?.description || ""}
              onChange={(e) =>
                updateSectionField(
                  "softwareSection",
                  "description",
                  e.target.value
                )
              }
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-slate-700">
              Software Partner List
            </h4>
            <button
              onClick={() => addPartner("softwareSection")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 rounded-md transition-colors"
            >
              <AddIcon fontSize="small" /> Add Partner
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(data.softwareSection?.partners || []).map(
              (partner: any, index: number) => (
                <div
                  key={index}
                  className="relative border border-slate-200 rounded-lg p-3 bg-white space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => removePartner("softwareSection", index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                  <div className="w-full mb-2">
                    <ShopifyImagePicker
                      label="Icon"
                      value={partner.icon || ""}
                      onChange={(url) =>
                        updatePartner("softwareSection", index, "icon", url)
                      }
                    />
                  </div>
                  <TextField
                    size="small"
                    fullWidth
                    value={partner.name || ""}
                    onChange={(e) =>
                      updatePartner(
                        "softwareSection",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Partner Name"
                    sx={{ bgcolor: "white" }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
