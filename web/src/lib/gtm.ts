export const GTM_EVENTS = {
  VIEW_ITEM: "view_item",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
};

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const pushToDataLayer = (event: string, data: any) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object.
    window.dataLayer.push({ event, ecommerce: data });
  }
};
