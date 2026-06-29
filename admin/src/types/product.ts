export interface Product {
    id: string;
    saleBanner: { text: string; link: string };
    breadcrumbs: string;
    productSection: { mainImage: string; thumbnails: string[]; alt: string };
    productInfo: {
      brand: string;
      title: string;
      price: { current: string; original: string; discount: string; per: string };
      offers: string[];
      viewOffers: string;
      amc: { title: string; plan: string; description: string };
      plans: string[];
      ctas: { addToCart: string; getFreeDemo: string };
    };
    guarantees: { title: string; subtitle: string }[];
    productDetails: {
      overview: { title: string; content: string };
      whyChoose: { title: string; points: { title: string; content: string }[] };
      features: { title: string; description: string; featurePoints: { title: string; content: string }[]; checklist: string[] };
      specifications: { title: string; columns: { title: string; value: string }[][] };
      pricing: { title: string; plans: { name: string; price: string; description: string }[] };
      faq: { title: string; questions: { question: string; answer: string }[] };
    };
    otherProducts: { title: string; products: { name: string; category: string; price: number; originalPrice: number; discount: number; rating: number; image: string; backgroundColor: string }[] };
  }
  
  export const defaultProduct: Product = {
    id: "",
    saleBanner: { text: "", link: "" },
    breadcrumbs: "",
    productSection: { mainImage: "", thumbnails: [], alt: "" },
    productInfo: {
      brand: "",
      title: "",
      price: { current: "", original: "", discount: "", per: "" },
      offers: [],
      viewOffers: "",
      amc: { title: "", plan: "", description: "" },
      plans: [],
      ctas: { addToCart: "", getFreeDemo: "" },
    },
    guarantees: [],
    productDetails: {
      overview: { title: "", content: "" },
      whyChoose: { title: "", points: [] },
      features: { title: "", description: "", featurePoints: [], checklist: [] },
      specifications: { title: "", columns: [[], []] },
      pricing: { title: "", plans: [] },
      faq: { title: "", questions: [] },
    },
    otherProducts: { title: "", products: [] },
  };
  