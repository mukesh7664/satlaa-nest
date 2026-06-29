import React from "react";
import { TextField, Typography, Paper, Stack, IconButton, Button, Divider, Card, CardContent, Box, Switch, FormControlLabel } from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

export const SportCoachingEditor: React.FC<any> = ({ data, onChange }) => {
  const safeData = {
    badge: data?.badge || "",
    title: data?.title || "",
    content: data?.content || "",
    phone: data?.phone || "",
    image: data?.image || "",
    features: data?.features || [],
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  const handleFeatureChange = (index: number, field: string, value: any) => {
    const newFeatures = [...safeData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateField("features", newFeatures);
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3, bgcolor: "slate.50" }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Visuals</Typography>
        <ShopifyImagePicker
          label="Main Image"
          value={safeData.image}
          onChange={(url) => updateField("image", url)}
        />
      </Paper>
      <Stack spacing={2}>
        <TextField label="Badge" fullWidth size="small" value={safeData.badge} onChange={(e) => updateField("badge", e.target.value)} />
        <TextField label="Title" fullWidth multiline rows={2} value={safeData.title} onChange={(e) => updateField("title", e.target.value)} />
        <TextField label="Content" fullWidth multiline rows={4} value={safeData.content} onChange={(e) => updateField("content", e.target.value)} />
        <TextField label="Phone Number" fullWidth size="small" value={safeData.phone} onChange={(e) => updateField("phone", e.target.value)} />
      </Stack>

      <Divider />
      
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">Features</Typography>
          <Button 
            startIcon={<FaPlus />} 
            onClick={() => updateField("features", [...safeData.features, { title: "", description: "" }])}
            size="small"
          >
            Add Feature
          </Button>
        </Stack>
        <Stack spacing={2}>
          {safeData.features.map((feature: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => updateField("features", safeData.features.filter((_: any, i: number) => i !== index))}
                sx={{ position: 'absolute', top: 5, right: 5 }}
              >
                <FaTrash size={12} />
              </IconButton>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <TextField 
                    label="Feature Title" 
                    fullWidth size="small" 
                    value={feature.title} 
                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)} 
                  />
                  <TextField 
                    label="Description" 
                    fullWidth multiline rows={2} size="small" 
                    value={feature.description} 
                    onChange={(e) => handleFeatureChange(index, "description", e.target.value)} 
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export const SportGalleryEditor: React.FC<any> = ({ data, onChange }) => {
  const safeData = {
    badge: data?.badge || "",
    title: data?.title || "",
    images: data?.images || [],
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  const handleImageChange = (index: number, field: string, value: any) => {
    const newImages = [...safeData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    updateField("images", newImages);
  };

  const addImage = () => {
    updateField("images", [...safeData.images, { url: "", alt: "" }]);
  };

  const removeImage = (index: number) => {
    const newImages = safeData.images.filter((_: any, i: number) => i !== index);
    updateField("images", newImages);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <TextField
          label="Badge"
          fullWidth
          size="small"
          value={safeData.badge}
          onChange={(e) => updateField("badge", e.target.value)}
        />
        <TextField
          label="Title"
          fullWidth
          value={safeData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Stack>

      <Divider />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Gallery Images
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FaPlus />}
            onClick={addImage}
            size="small"
          >
            Add Image
          </Button>
        </Stack>

        <Stack spacing={3}>
          {safeData.images.map((img: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
              <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                <IconButton
                  onClick={() => removeImage(index)}
                  color="error"
                  size="small"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                >
                  <FaTrash size={12} />
                </IconButton>
              </Box>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={2}>
                  <ShopifyImagePicker
                    label={`Image ${index + 1}`}
                    value={img.url || ""}
                    onChange={(url) => handleImageChange(index, "url", url)}
                  />
                  <TextField
                    label="Alt Text"
                    fullWidth
                    size="small"
                    value={img.alt || ""}
                    onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
          {safeData.images.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              No images added. Using default gallery shots.
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export const SportPricingEditor: React.FC<any> = ({ data, onChange }) => {
  const safeData = {
    badge: data?.badge || "",
    title: data?.title || "",
    plans: data?.plans || [],
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  const handlePlanChange = (index: number, field: string, value: any) => {
    const newPlans = [...safeData.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    updateField("plans", newPlans);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <TextField label="Badge" fullWidth size="small" value={safeData.badge} onChange={(e) => updateField("badge", e.target.value)} />
        <TextField label="Title" fullWidth value={safeData.title} onChange={(e) => updateField("title", e.target.value)} />
      </Stack>

      <Divider />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">Pricing Plans</Typography>
          <Button 
            startIcon={<FaPlus />} 
            onClick={() => updateField("plans", [...safeData.plans, { name: "", price: "", period: "/month", description: "", features: [], isPopular: false }])}
            size="small"
          >
            Add Plan
          </Button>
        </Stack>
        <Stack spacing={3}>
          {safeData.plans.map((plan: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => updateField("plans", safeData.plans.filter((_: any, i: number) => i !== index))}
                sx={{ position: 'absolute', top: 5, right: 5 }}
              >
                <FaTrash size={12} />
              </IconButton>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <TextField label="Plan Name" fullWidth size="small" value={plan.name} onChange={(e) => handlePlanChange(index, "name", e.target.value)} />
                  <Stack direction="row" spacing={1}>
                    <TextField label="Price" fullWidth size="small" value={plan.price} onChange={(e) => handlePlanChange(index, "price", e.target.value)} />
                    <TextField label="Period" fullWidth size="small" value={plan.period} onChange={(e) => handlePlanChange(index, "period", e.target.value)} />
                  </Stack>
                  <TextField label="Description" fullWidth size="small" multiline rows={2} value={plan.description} onChange={(e) => handlePlanChange(index, "description", e.target.value)} />
                  
                  <TextField 
                    label="Features (One per line)" 
                    fullWidth multiline rows={4} size="small" 
                    value={(plan.features || []).join("\n")} 
                    onChange={(e) => handlePlanChange(index, "features", e.target.value.split("\n"))} 
                    helperText="Enter each feature on a new line"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={!!plan.isPopular} 
                        onChange={(e) => handlePlanChange(index, "isPopular", e.target.checked)} 
                        size="small"
                      />
                    }
                    label={<Typography variant="caption">Highlight as Popular (Best Value)</Typography>}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export const SportAppPromoEditor: React.FC<any> = ({ data, onChange }) => {
  const safeData = {
    title: data?.title || "",
    content: data?.content || "",
    image: data?.image || "",
    qrCodeText: data?.qrCodeText || "",
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3 }}>
        <ShopifyImagePicker label="Store App Image" value={safeData.image} onChange={(url) => updateField("image", url)} />
      </Paper>
      <TextField label="Title" fullWidth multiline rows={2} value={safeData.title} onChange={(e) => updateField("title", e.target.value)} />
      <TextField label="Content" fullWidth multiline rows={3} value={safeData.content} onChange={(e) => updateField("content", e.target.value)} />
      <TextField label="QR Code Support Text" fullWidth size="small" value={safeData.qrCodeText} onChange={(e) => updateField("qrCodeText", e.target.value)} />
    </Stack>
  );
};

export const SportTestimonialsEditor: React.FC<any> = ({ data, onChange }) => {
  const safeData = {
    badge: data?.badge || "",
    title: data?.title || "",
    testimonials: data?.testimonials || [],
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  const handleTestimonialChange = (index: number, field: string, value: any) => {
    const newTestimonials = [...safeData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    updateField("testimonials", newTestimonials);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <TextField label="Badge" fullWidth size="small" value={safeData.badge} onChange={(e) => updateField("badge", e.target.value)} />
        <TextField label="Title" fullWidth value={safeData.title} onChange={(e) => updateField("title", e.target.value)} />
      </Stack>

      <Divider />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">Player Testimonials</Typography>
          <Button 
            startIcon={<FaPlus />} 
            onClick={() => updateField("testimonials", [...safeData.testimonials, { name: "", role: "", content: "", avatar: "", rating: 5 }])}
            size="small"
          >
            Add Testimonial
          </Button>
        </Stack>
        <Stack spacing={3}>
          {safeData.testimonials.map((item: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => updateField("testimonials", safeData.testimonials.filter((_: any, i: number) => i !== index))}
                sx={{ position: 'absolute', top: 5, right: 5 }}
              >
                <FaTrash size={12} />
              </IconButton>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <ShopifyImagePicker
                    label="Player Avatar"
                    value={item.avatar || ""}
                    onChange={(url) => handleTestimonialChange(index, "avatar", url)}
                  />
                  <TextField label="Player Name" fullWidth size="small" value={item.name} onChange={(e) => handleTestimonialChange(index, "name", e.target.value)} />
                  <TextField label="Role" fullWidth size="small" value={item.role} onChange={(e) => handleTestimonialChange(index, "role", e.target.value)} />
                  <TextField label="Review Content" fullWidth multiline rows={3} size="small" value={item.content} onChange={(e) => handleTestimonialChange(index, "content", e.target.value)} />
                  <TextField 
                    label="Rating (1-5)" 
                    type="number" 
                    fullWidth size="small" 
                    InputProps={{ inputProps: { min: 1, max: 5 } }}
                    value={item.rating} 
                    onChange={(e) => handleTestimonialChange(index, "rating", parseInt(e.target.value))} 
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};
