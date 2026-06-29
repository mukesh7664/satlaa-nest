import React from "react";
import { TextField, Stack, Typography, Divider } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BannerData {
  title: string;
  image: string;
  bgColor: string;
  link: string;
  buttonText: string;
}

interface DualSplitBannersEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const DualSplitBannersEditor: React.FC<DualSplitBannersEditorProps> = ({ data, onChange }) => {
  const left: BannerData = data.left || {
    title: "Women's Collection",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop",
    bgColor: "bg-[#ffcc00]",
    link: "/shop?gender=women",
    buttonText: "SHOP WOMEN'S"
  };

  const right: BannerData = data.right || {
    title: "Men's Collection",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    bgColor: "bg-slate-900",
    link: "/shop?gender=men",
    buttonText: "SHOP MEN'S"
  };

  const handleUpdateLeft = (updatedFields: Partial<BannerData>) => {
    onChange({ ...data, left: { ...left, ...updatedFields } });
  };

  const handleUpdateRight = (updatedFields: Partial<BannerData>) => {
    onChange({ ...data, right: { ...right, ...updatedFields } });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dual Split Banners Settings
      </Typography>

      <Typography variant="subtitle2" fontWeight="bold">
        Left Banner (Women)
      </Typography>

      <TextField
        label="Title Header"
        size="small"
        fullWidth
        value={left.title}
        onChange={(e) => handleUpdateLeft({ title: e.target.value })}
      />

      <TextField
        label="Background Color Class"
        size="small"
        fullWidth
        value={left.bgColor}
        onChange={(e) => handleUpdateLeft({ bgColor: e.target.value })}
      />

      <ShopifyImagePicker
        label="Image Backdrop"
        value={left.image}
        onChange={(url) => handleUpdateLeft({ image: url })}
      />

      <TextField
        label="Button Label"
        size="small"
        fullWidth
        value={left.buttonText}
        onChange={(e) => handleUpdateLeft({ buttonText: e.target.value })}
      />

      <TextField
        label="Target Link URL"
        size="small"
        fullWidth
        value={left.link}
        onChange={(e) => handleUpdateLeft({ link: e.target.value })}
      />

      <Divider />

      <Typography variant="subtitle2" fontWeight="bold">
        Right Banner (Men)
      </Typography>

      <TextField
        label="Title Header"
        size="small"
        fullWidth
        value={right.title}
        onChange={(e) => handleUpdateRight({ title: e.target.value })}
      />

      <TextField
        label="Background Color Class"
        size="small"
        fullWidth
        value={right.bgColor}
        onChange={(e) => handleUpdateRight({ bgColor: e.target.value })}
      />

      <ShopifyImagePicker
        label="Image Backdrop"
        value={right.image}
        onChange={(url) => handleUpdateRight({ image: url })}
      />

      <TextField
        label="Button Label"
        size="small"
        fullWidth
        value={right.buttonText}
        onChange={(e) => handleUpdateRight({ buttonText: e.target.value })}
      />

      <TextField
        label="Target Link URL"
        size="small"
        fullWidth
        value={right.link}
        onChange={(e) => handleUpdateRight({ link: e.target.value })}
      />
    </Stack>
  );
};
