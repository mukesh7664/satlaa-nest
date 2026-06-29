# Admin UI Changes for Product Management

## Overview
This document outlines all the changes needed to support the new product model with tags, variants, bundles, and comparison features.

## Changes to Main Page (`page.tsx`)

### Update Initial formData State:
```typescript
const [formData, setFormData] = useState<any>({
  // NEW FIELDS - Add to top
  images: [], // Replace productSection
  targetAudience: ['business'], // NEW
  purchaseType: 'online_pay', // NEW
  productStructureType: 'single', // NEW
  tags: [], // NEW
  variants: [], // NEW
  bundleProducts: [], // NEW (if productStructureType is 'bundle')

  // REMOVE THESE:
  // saleBanner: ...
  // breadcrumbs: ...
  // guarantees: ...
  // productSection: { mainImage, thumbnails, alt }

  // Keep existing fields (brand, categories, productType, etc.)
});
```

### Update Image Handling:
```typescript
// Replace mainImageFile and thumbnailFiles with:
const [imageFiles, setImageFiles] = useState<File[]>([]);
```

## Changes to BasicInfoStep Component

### Add New Fields (after Product Title):

1. **Target Audience** (Multi-select checkboxes):
```tsx
<FormGroup>
  <FormLabel>Target Audience *</FormLabel>
  <FormControlLabel control={<Checkbox checked={...} />} label="Home" />
  <FormControlLabel control={<Checkbox checked={...} />} label="Business" />
  <FormControlLabel control={<Checkbox checked={...} />} label="Enterprise" />
  <FormControlLabel control={<Checkbox checked={...} />} label="Other" />
</FormGroup>
```

2. **Purchase Type** (Radio buttons):
```tsx
<FormControl>
  <FormLabel>Purchase Type *</FormLabel>
  <RadioGroup>
    <FormControlLabel value="online_pay" control={<Radio />} label="Online Payment" />
    <FormControlLabel value="request_order" control={<Radio />} label="Request Order/Quote" />
  </RadioGroup>
</FormControl>
```

3. **Product Structure Type** (Radio buttons):
```tsx
<FormControl>
  <FormLabel>Product Structure Type *</FormLabel>
  <RadioGroup onChange={handleProductStructureChange}>
    <FormControlLabel value="single" control={<Radio />} label="Single Product" />
    <FormControlLabel value="bundle" control={<Radio />} label="Bundle" />
  </RadioGroup>
</FormControl>
```

4. **Tags Selector** (Autocomplete):
```tsx
<Autocomplete
  multiple
  freeSolo
  options={availableTags}
  value={selectedTags}
  onChange={handleTagChange}
  renderInput={(params) => <TextField {...params} label="Tags" />}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip label={option.name} {...getTagProps({ index })} />
    ))
  }
/>
```

## Changes to ImagesStep Component

**Complete Rewrite** to support drag-drop array:

```tsx
<Box>
  <Typography variant="h6">Product Images</Typography>
  <Typography variant="body2">
    Drag to reorder. First image is the main/featured image. Min 1 required.
  </Typography>

  {/* Drag-Drop Image List */}
  <DndContext onDragEnd={handleDragEnd}>
    <SortableContext items={images}>
      {images.map((image, index) => (
        <SortableImage
          key={image.id}
          image={image}
          index={index}
          onDelete={handleDeleteImage}
          onAltChange={handleAltChange}
        />
      ))}
    </SortableContext>
  </DndContext>

  {/* Upload Button */}
  <Button component="label">
    <CloudUpload />
    Upload Images
    <input type="file" hidden multiple onChange={handleUpload} />
  </Button>
</Box>
```

## New Component: VariantsStep (Add as new step)

For single products with multiple plans (like Microsoft 365):

```tsx
<Box>
  <Typography variant="h6">Product Variants/Plans</Typography>

  {variants.map((variant, index) => (
    <Accordion key={index}>
      <AccordionSummary>
        Variant {index + 1}: {variant.name}
      </AccordionSummary>
      <AccordionDetails>
        <TextField label="Name" value={variant.name} />
        <TextField label="Price" value={variant.price} type="number" />
        <Select label="Billing Cycle" value={variant.billingCycle}>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
          <MenuItem value="one-time">One-Time</MenuItem>
        </Select>

        {/* Comparison Features */}
        <Box>
          <Typography variant="subtitle2">Comparison Features</Typography>
          <Autocomplete
            multiple
            options={comparisonFeatures}
            groupBy={(option) => option.category}
            renderInput={(params) => <TextField {...params} label="Add Feature" />}
          />

          {/* Feature Values */}
          {variant.comparisonFeatures.map((cf, cfIndex) => (
            <Box key={cfIndex}>
              <Typography variant="body2">{cf.feature.name}</Typography>
              {cf.feature.inputType === 'text' ? (
                <TextField label="Value" value={cf.value} />
              ) : (
                <Switch checked={cf.value} />
              )}
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  ))}

  <Button onClick={addVariant}>+ Add Variant</Button>
</Box>
```

## New Component: BundleProductsStep (Conditional)

Only shown if productStructureType === 'bundle':

```tsx
<Box>
  <Typography variant="h6">Bundle Products</Typography>

  {bundleProducts.map((bp, index) => (
    <Box key={index}>
      <Autocomplete
        options={allProducts}
        getOptionLabel={(option) => option.title}
        value={bp.product}
        onChange={(e, value) => handleProductSelect(index, value)}
        renderInput={(params) => <TextField {...params} label="Select Product" />}
      />
      <TextField
        label="Quantity"
        type="number"
        value={bp.quantity}
        onChange={(e) => handleQuantityChange(index, e.target.value)}
      />
      <IconButton onClick={() => removeProduct(index)}>
        <Delete />
      </IconButton>
    </Box>
  ))}

  <Button onClick={addProduct}>+ Add Product to Bundle</Button>
</Box>
```

## Changes to ProductDetailsStep

Add custom title fields for each section:

```tsx
{/* Overview Section */}
<Accordion>
  <AccordionSummary>Overview</AccordionSummary>
  <AccordionDetails>
    <FormControlLabel
      control={<Checkbox checked={overview.enabled} />}
      label="Enable Overview Section"
    />
    <TextField
      label="Section Title"
      value={overview.title}
      placeholder="Overview"
    />
    <TextField
      label="Content"
      multiline
      rows={6}
      value={overview.content}
    />
  </AccordionDetails>
</Accordion>

{/* Features Section */}
<Accordion>
  <AccordionSummary>Features</AccordionSummary>
  <AccordionDetails>
    <FormControlLabel
      control={<Checkbox checked={features.enabled} />}
      label="Enable Features Section"
    />
    <TextField
      label="Section Title"
      value={features.title}
      placeholder="Features"
    />
    {/* ... rest of features UI */}
  </AccordionDetails>
</Accordion>

{/* Repeat for: Specifications, Pricing, Reviews, FAQ */}
```

## API Services to Create

### `/admin/src/services/tags.api.ts`:
```typescript
export const tagsApi = {
  search: (query: string) => fetch(`/admin/tags/search?q=${query}`),
  create: (name: string) => fetch('/admin/tags', { method: 'POST', body: {name} }),
  getAll: () => fetch('/admin/tags'),
};
```

### `/admin/src/services/comparisonFeatures.api.ts`:
```typescript
export const comparisonFeaturesApi = {
  search: (query: string) => fetch(`/admin/comparison-features/search?q=${query}`),
  create: (data) => fetch('/admin/comparison-features', { method: 'POST', body: data }),
  getAll: (category?: string) => fetch(`/admin/comparison-features?category=${category}`),
  getCategories: () => fetch('/admin/comparison-features/categories'),
};
```

## Step-by-Step Implementation Plan

1. ✅ Update formData initial state in main page
2. ✅ Create tags API service
3. ✅ Create comparison features API service
4. ✅ Update BasicInfoStep with new fields
5. ✅ Create new ImagesStep with drag-drop
6. ✅ Create VariantsStep component
7. ✅ Create BundleProductsStep component (conditional)
8. ✅ Update ProductDetailsStep with custom titles
9. ✅ Update form submission logic
10. ✅ Test end-to-end product creation

## Notes

- Remove all references to: saleBanner, breadcrumbs, guarantees
- Image validation: At least 1 image required
- Tags: Auto-complete with create-on-fly functionality
- Variants: Only for single products (not bundles)
- Bundle Products: Only if productStructureType === 'bundle'
- Comparison Features: Grouped by category in dropdown
