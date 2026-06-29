import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { productsApi, Product } from "@/services/products.api";
import { collectionsApi, Collection } from "@/services/collections.api";
import { pagesApi, Page } from "@/services/pages.api";

type ResourceType = "product" | "collection" | "page";

interface ResourceSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (
    slug: string,
    type: ResourceType,
    extraData?: Product | Collection | Page
  ) => void;
  initialType?: ResourceType;
}

export default function ResourceSelector({
  open,
  onClose,
  onSelect,
  initialType = "product",
}: ResourceSelectorProps) {
  const [activeTab, setActiveTab] = useState<ResourceType>(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<(Product | Collection | Page)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setItems([]);
      fetchItems(activeTab, "");
    }
  }, [open, activeTab]);

  const fetchItems = async (type: ResourceType, query: string) => {
    setLoading(true);
    try {
      let data: (Product | Collection | Page)[] = [];
      if (type === "product") {
        const response = await productsApi.getAllProducts({
          search: query,
          limit: 20,
        });
        data = response.products;
      } else if (type === "collection") {
        const response = await collectionsApi.getAllCollections({
          search: query,
          limit: 20,
        });
        data = response.collections;
      } else if (type === "page") {
        const response = await pagesApi.getPages({ search: query, limit: 20 });
        data = (response as any).pages || response;
      }
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(activeTab, searchQuery);
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: ResourceType
  ) => {
    setActiveTab(newValue);
    setSearchQuery("");
  };

  const getItemDisplay = (
    item: Product | Collection | Page,
    type: ResourceType
  ) => {
    let title = "";
    let slug = "";

    if (type === "product") {
      const product = item as Product;
      title = product.productInfo?.title || "";
      slug = product.slug || "";
    } else if (type === "collection") {
      const collection = item as Collection;
      title = collection.name || "";
      slug = collection.slug || "";
    } else if (type === "page") {
      const page = item as Page;
      title = page.title || "";
      slug = page.slug || "";
    }

    return { title, slug };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Resource</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Products" value="product" />
            <Tab label="Collections" value="collection" />
            <Tab label="Pages" value="page" />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${activeTab}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No items found
              </Typography>
            ) : (
              items.map((item) => {
                const { title, slug } = getItemDisplay(item, activeTab);
                return (
                  <ListItem key={item._id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        onSelect(slug, activeTab, item);
                        onClose();
                      }}
                    >
                      <ListItemText primary={title} secondary={slug} />
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
