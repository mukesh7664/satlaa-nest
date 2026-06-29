import React from "react";
import { TextField, Stack, Typography, Divider } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface ProductSpotlight {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  discountBadge: string;
  description: string;
}

interface ArtisticShowcaseEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ArtisticShowcaseEditor: React.FC<ArtisticShowcaseEditorProps> = ({ data, onChange }) => {
  const leftImage = data.leftImage || "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop";
  const product: ProductSpotlight = data.product || {
    id: "shoes-spotlight-1",
    name: "Nike Air Max 89 ES Deluxe",
    price: 90.00,
    originalPrice: 180.00,
    rating: 5,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=500&auto=format&fit=crop",
    discountBadge: "-50%",
    description: "A legendary revamp of the 1989 classic court trainer, engineered with active visible air units and mesh linings."
  };

  const handleUpdateProduct = (updatedFields: Partial<ProductSpotlight>) => {
    onChange({ ...data, product: { ...product, ...updatedFields } });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Artistic Showcase Settings
      </Typography>

      <ShopifyImagePicker
        label="Left Lifestyle Image"
        value={leftImage}
        onChange={(url) => onChange({ ...data, leftImage: url })}
      />

      <Divider />

      <Typography variant="subtitle2" fontWeight="bold">
        Spotlight Product Panel
      </Typography>

      <TextField
        label="Product Name"
        fullWidth
        size="small"
        value={product.name}
        onChange={(e) => handleUpdateProduct({ name: e.target.value })}
      />

      <TextField
        label="Product Short Details"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={product.description}
        onChange={(e) => handleUpdateProduct({ description: e.target.value })}
      />

      <TextField
        label="Price"
        type="number"
        fullWidth
        size="small"
        value={product.price}
        onChange={(e) => handleUpdateProduct({ price: parseFloat(e.target.value) || 0 })}
      />

      <TextField
        label="Original Price"
        type="number"
        fullWidth
        size="small"
        value={product.originalPrice}
        onChange={(e) => handleUpdateProduct({ originalPrice: parseFloat(e.target.value) || 0 })}
      />

      <TextField
        label="Discount Tag (e.g. -50%)"
        fullWidth
        size="small"
        value={product.discountBadge}
        onChange={(e) => handleUpdateProduct({ discountBadge: e.target.value })}
      />

      <ShopifyImagePicker
        label="Product Image"
        value={product.image}
        onChange={(url) => handleUpdateProduct({ image: url })}
      />
    </Stack>
  );
};
