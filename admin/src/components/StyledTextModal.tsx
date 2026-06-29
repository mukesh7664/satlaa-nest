import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";

interface StyledTextModalProps {
  open: boolean;
  onClose: () => void;
}

const StyledTextModal: React.FC<StyledTextModalProps> = ({ open, onClose }) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#4988FF");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const generateHtml = () => {
    let style = "";
    if (color && color !== "#000000") style += `color: ${color};`;
    if (isBold) style += " font-weight: bold;";
    if (isItalic) style += " font-style: italic;";

    if (!style) return text;
    return `<span style="${style.trim()}">${text}</span>`;
  };

  const handleCopy = () => {
    const html = generateHtml();
    navigator.clipboard.writeText(html);
  };

  const generatedHtml = generateHtml();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Styled Text</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <TextField
            label="Text to Style"
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Special Offer"
            autoFocus
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  height: 40,
                  width: 60,
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </Box>

            <TextField
              label="Hex Code"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                />
              }
              label="Bold"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isItalic}
                  onChange={(e) => setIsItalic(e.target.checked)}
                />
              }
              label="Italic"
            />
          </Box>

          <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              Preview:
            </Typography>
            <Typography variant="h5" component="div">
              <span
                style={{
                  color: color,
                  fontWeight: isBold ? "bold" : "normal",
                  fontStyle: isItalic ? "italic" : "normal",
                }}
              >
                {text || "Sample Text"}
              </span>
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "#e3f2fd",
              p: 2,
              borderRadius: 1,
              position: "relative",
            }}
          >
            <Typography
              variant="caption"
              color="primary"
              display="block"
              gutterBottom
            >
              Generated HTML (Copy this):
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", wordBreak: "break-all", pr: 4 }}
            >
              {generatedHtml}
            </Typography>
            <Tooltip title="Copy to Clipboard">
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
                color="primary"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StyledTextModal;
