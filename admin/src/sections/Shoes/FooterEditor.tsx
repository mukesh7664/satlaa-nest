import React from "react";
import { TextField, Stack, Typography, Button, IconButton, MenuItem, Select, FormControl, InputLabel, Divider } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface LinkItem {
  name: string;
  link: string;
}

interface FooterEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const FooterEditor: React.FC<FooterEditorProps> = ({ data, onChange }) => {
  const helpLinks: LinkItem[] = data.helpLinks || [
    { name: "Help Center", link: "#" },
    { name: "Shipping Info", link: "#" },
    { name: "Returns", link: "#" },
    { name: "How To Order", link: "#" },
    { name: "How To Track", link: "#" },
    { name: "Size Guide", link: "#" }
  ];

  const companyLinks: LinkItem[] = data.companyLinks || [
    { name: "About Us", link: "#" },
    { name: "Our Blog", link: "#" },
    { name: "Careers", link: "#" },
    { name: "Store Locations", link: "#" },
    { name: "Testimonial", link: "#" },
    { name: "Sitemap", link: "#" }
  ];

  const legalLinks: LinkItem[] = data.legalLinks || [
    { name: "PRIVACY POLICY", link: "#" },
    { name: "TERMS OF SERVICES", link: "#" }
  ];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateLink = (listKey: string, index: number, field: string, value: string) => {
    const list = [...(data[listKey] || (listKey === "helpLinks" ? helpLinks : listKey === "companyLinks" ? companyLinks : legalLinks))];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, [listKey]: list });
  };

  const addLink = (listKey: string) => {
    const list = [...(data[listKey] || (listKey === "helpLinks" ? helpLinks : listKey === "companyLinks" ? companyLinks : legalLinks))];
    list.push({ name: "New Link", link: "#" });
    onChange({ ...data, [listKey]: list });
  };

  const removeLink = (listKey: string, index: number) => {
    const defaultList = listKey === "helpLinks" ? helpLinks : listKey === "companyLinks" ? companyLinks : legalLinks;
    const list = [...(data[listKey] || defaultList)];
    const updated = list.filter((_, idx) => idx !== index);
    onChange({ ...data, [listKey]: updated });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Shoes Pitch Black Footer Settings
      </Typography>

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>BRAND / LOGO SETTINGS</Divider>

      <FormControl fullWidth size="small">
        <InputLabel>Logo Type</InputLabel>
        <Select
          value={data.logoType || "text"}
          label="Logo Type"
          onChange={(e) => updateField("logoType", e.target.value)}
        >
          <MenuItem value="text">Brand Name Text</MenuItem>
          <MenuItem value="image">Custom Logo Image</MenuItem>
        </Select>
      </FormControl>

      {data.logoType === "image" ? (
        <ShopifyImagePicker
          label="Logo Image"
          value={data.logoImage || ""}
          onChange={(url) => updateField("logoImage", url)}
        />
      ) : (
        <TextField
          label="Brand Logo Text"
          fullWidth
          size="small"
          value={data.logoText || ""}
          onChange={(e) => updateField("logoText", e.target.value)}
          placeholder="MATE"
        />
      )}

      <TextField
        label="Company Description"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>CONTACT INFORMATION</Divider>

      <TextField
        label="Customer Support Hotline"
        fullWidth
        size="small"
        value={data.hotline || ""}
        onChange={(e) => updateField("hotline", e.target.value)}
      />

      <TextField
        label="Support Email Address"
        fullWidth
        size="small"
        value={data.email || ""}
        onChange={(e) => updateField("email", e.target.value)}
      />

      <TextField
        label="Office Working Hours"
        fullWidth
        size="small"
        value={data.workingHours || ""}
        onChange={(e) => updateField("workingHours", e.target.value)}
      />

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>GET HELP COLUMN LINKS</Divider>
      
      <TextField
        label="Help Column Title"
        fullWidth
        size="small"
        value={data.helpTitle || ""}
        onChange={(e) => updateField("helpTitle", e.target.value)}
        placeholder="GET HELP"
      />

      <Stack spacing={1.5}>
        {(data.helpLinks || helpLinks).map((link: LinkItem, idx: number) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Link Name"
              size="small"
              value={link.name}
              onChange={(e) => updateLink("helpLinks", idx, "name", e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="URL"
              size="small"
              value={link.link}
              onChange={(e) => updateLink("helpLinks", idx, "link", e.target.value)}
              sx={{ flex: 1.5 }}
            />
            <IconButton color="error" size="small" onClick={() => removeLink("helpLinks", idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => addLink("helpLinks")} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
          Add Link
        </Button>
      </Stack>

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>OUR COMPANY COLUMN LINKS</Divider>

      <TextField
        label="Company Column Title"
        fullWidth
        size="small"
        value={data.companyTitle || ""}
        onChange={(e) => updateField("companyTitle", e.target.value)}
        placeholder="OUR COMPANY"
      />

      <Stack spacing={1.5}>
        {(data.companyLinks || companyLinks).map((link: LinkItem, idx: number) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Link Name"
              size="small"
              value={link.name}
              onChange={(e) => updateLink("companyLinks", idx, "name", e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="URL"
              size="small"
              value={link.link}
              onChange={(e) => updateLink("companyLinks", idx, "link", e.target.value)}
              sx={{ flex: 1.5 }}
            />
            <IconButton color="error" size="small" onClick={() => removeLink("companyLinks", idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => addLink("companyLinks")} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
          Add Link
        </Button>
      </Stack>

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>NEWSLETTER & SOCIAL</Divider>

      <TextField
        label="Newsletter Column Title"
        fullWidth
        size="small"
        value={data.newsletterTitle || ""}
        onChange={(e) => updateField("newsletterTitle", e.target.value)}
        placeholder="NEWSLETTER"
      />

      <TextField
        label="Newsletter Description"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.newsletterPromo || ""}
        onChange={(e) => updateField("newsletterPromo", e.target.value)}
      />

      <TextField
        label="Facebook URL"
        fullWidth
        size="small"
        value={data.facebookLink || ""}
        onChange={(e) => updateField("facebookLink", e.target.value)}
      />

      <TextField
        label="Instagram URL"
        fullWidth
        size="small"
        value={data.instagramLink || ""}
        onChange={(e) => updateField("instagramLink", e.target.value)}
      />

      <TextField
        label="Youtube URL"
        fullWidth
        size="small"
        value={data.youtubeLink || ""}
        onChange={(e) => updateField("youtubeLink", e.target.value)}
      />

      <TextField
        label="Chrome/Website URL"
        fullWidth
        size="small"
        value={data.chromeLink || ""}
        onChange={(e) => updateField("chromeLink", e.target.value)}
      />

      <Divider sx={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>LEGAL & COPYRIGHT</Divider>

      <TextField
        label="Copyright Text"
        fullWidth
        size="small"
        value={data.copyrightText || ""}
        onChange={(e) => updateField("copyrightText", e.target.value)}
        placeholder="© 2026 MATE SHOES. ALL RIGHTS RESERVED."
      />

      <Stack spacing={1.5}>
        <Typography variant="caption" fontWeight="bold">Legal Links</Typography>
        {(data.legalLinks || legalLinks).map((link: LinkItem, idx: number) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Link Name"
              size="small"
              value={link.name}
              onChange={(e) => updateLink("legalLinks", idx, "name", e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="URL"
              size="small"
              value={link.link}
              onChange={(e) => updateLink("legalLinks", idx, "link", e.target.value)}
              sx={{ flex: 1.5 }}
            />
            <IconButton color="error" size="small" onClick={() => removeLink("legalLinks", idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => addLink("legalLinks")} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
          Add Link
        </Button>
      </Stack>
    </Stack>
  );
};
