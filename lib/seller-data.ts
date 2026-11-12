// lib/seller-data.ts
// Expanded Snapdeal KAM Dataset with 10 Realistic Sellers, Products, Metrics & Analytics

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface SellerProduct {
  id: string; // Globally unique SKU ID
  title: string;
  category: string;
  price: number;
  stock: number;
  status: StockStatus;
  monthlySalesUnits: number;
}

export interface MonthMetrics {
  sales: number;
  orders: number;
  cancellationRate: number; // percentage (e.g. 14 for 14%)
  avgSellingPrice: number;
  outOfStockProducts: number;
  totalInventory: number;
  impressions: number;
  clicks: number;
  conversionRate: number; // percentage (e.g. 6.5 for 6.5%)
  returnRate: number; // percentage (e.g. 5.2 for 5.2%)
}

export type ScenarioType =
  | 'inventory_shortage'
  | 'high_returns'
  | 'low_visibility'
  | 'poor_conversion'
  | 'hero_stockout'
  | 'high_cancellations'
  | 'healthy_growth'
  | 'asp_erosion'
  | 'ad_inefficiency'
  | 'cart_abandonment';

export interface SellerProfile {
  sellerId: string; // SD001 - SD010
  name: string;
  store: string;
  category: string;
  city: string;
  phone: string;
  scenario: string;
  scenarioType: ScenarioType;
  primaryBottleneck: string;
  lastMonth: MonthMetrics;
  thisMonth: MonthMetrics;
  products: SellerProduct[];
}

export interface ComputedDeltas {
  salesDelta: number;
  salesChangePct: number;
  ordersDelta: number;
  ordersChangePct: number;
  cancellationDelta: number;
  returnRateDelta: number;
  conversionRateDelta: number;
  impressionsDelta: number;
  impressionsChangePct: number;
  clicksDelta: number;
  clicksChangePct: number;
  stockoutDelta: number;
  aspDelta: number;
  aspChangePct: number;
}

export interface SellerInsight {
  sellerId: string;
  sellerName: string;
  store: string;
  category: string;
  scenario: string;
  scenarioType: ScenarioType;
  deltas: ComputedDeltas;
  primaryBottlenecks: string[];
  diagnosis: string;
  recommendations: string[];
  summary: string;
}

export interface SellerSummary {
  sellerId: string;
  name: string;
  store: string;
  category: string;
  city: string;
  scenario: string;
  scenarioType: ScenarioType;
  currentSales: number;
  salesChangePct: number;
}

// -------------------------------------------------------------
// 10 REALISTIC SELLERS WITH DETERMINISTIC MOCK DATA
// -------------------------------------------------------------

export const MOCK_SELLERS: Record<string, SellerProfile> = {
  // SD001: Rajesh Sharma (Preserves original assignment data exactly)
  SD001: {
    sellerId: 'SD001',
    name: 'Rajesh Sharma',
    store: 'Rajesh Electronics',
    category: 'Electronics & Mobile Accessories',
    city: 'New Delhi',
    phone: '+91 98765 43210',
    scenario: 'Inventory Shortages & Visibility Trap',
    scenarioType: 'inventory_shortage',
    primaryBottleneck: '18 products out of stock combined with cancellation rate climbing to 14%',
    lastMonth: {
      sales: 200000,
      orders: 400,
      cancellationRate: 8,
      avgSellingPrice: 500,
      outOfStockProducts: 5,
      totalInventory: 450,
      impressions: 85000,
      clicks: 5100,
      conversionRate: 7.8,
      returnRate: 4.5,
    },
    thisMonth: {
      sales: 135000,
      orders: 270,
      cancellationRate: 14,
      avgSellingPrice: 500,
      outOfStockProducts: 18,
      totalInventory: 180,
      impressions: 42000,
      clicks: 2700,
      conversionRate: 10.0,
      returnRate: 5.2,
    },
    products: [
      {
        id: 'SKU-SD001-01',
        title: 'Fast USB-C Braided Cable (1m)',
        category: 'Electronics',
        price: 299,
        stock: 0,
        status: 'out_of_stock',
        monthlySalesUnits: 0,
      },
      {
        id: 'SKU-SD001-02',
        title: 'Magnetic Car Phone Air Vent Mount',
        category: 'Electronics',
        price: 499,
        stock: 0,
        status: 'out_of_stock',
        monthlySalesUnits: 0,
      },
      {
        id: 'SKU-SD001-03',
        title: '20W Dual Port Fast Wall Charger',
        category: 'Electronics',
        price: 699,
        stock: 4,
        status: 'low_stock',
        monthlySalesUnits: 85,
      },
      {
        id: 'SKU-SD001-04',
        title: 'Wireless Bluetooth Neckband Pro with Bass',
        category: 'Electronics',
        price: 899,
        stock: 22,
        status: 'in_stock',
        monthlySalesUnits: 185,
      },
    ],
  },

  // SD002: Pooja Gupta (High Return Rate Crisis)
  SD002: {
    sellerId: 'SD002',
    name: 'Pooja Gupta',
    store: 'Vastra Trends',
    category: 'Fashion & Ethnic Apparel',
    city: 'Jaipur, Rajasthan',
    phone: '+91 98112 34567',
    scenario: 'High Return Rate Crisis (Size & Quality Mismatches)',
    scenarioType: 'high_returns',
    primaryBottleneck: 'Customer returns spiked to 28% from 9% due to inaccurate kurti size charts',
    lastMonth: {
      sales: 320000,
      orders: 380,
      cancellationRate: 6,
      avgSellingPrice: 842,
      outOfStockProducts: 4,
      totalInventory: 600,
      impressions: 95000,
      clicks: 6200,
      conversionRate: 6.1,
      returnRate: 9,
    },
    thisMonth: {
      sales: 240000,
      orders: 350,
      cancellationRate: 7,
      avgSellingPrice: 685,
      outOfStockProducts: 6,
      totalInventory: 550,
      impressions: 90000,
      clicks: 5800,
      conversionRate: 6.0,
      returnRate: 28,
    },
    products: [
      {
        id: 'SKU-SD002-01',
        title: 'Anarkali Cotton Printed Kurti Set with Dupatta',
        category: 'Fashion',
        price: 899,
        stock: 45,
        status: 'in_stock',
        monthlySalesUnits: 120,
      },
      {
        id: 'SKU-SD002-02',
        title: 'Embroidered Rayon Straight Daily Wear Kurta',
        category: 'Fashion',
        price: 599,
        stock: 30,
        status: 'in_stock',
        monthlySalesUnits: 110,
      },
      {
        id: 'SKU-SD002-03',
        title: 'Bandhani Chiffon Dupatta Combo (Pack of 2)',
        category: 'Fashion',
        price: 399,
        stock: 60,
        status: 'in_stock',
        monthlySalesUnits: 90,
      },
      {
        id: 'SKU-SD002-04',
        title: 'Festive Silk Blend Embroidered Palazzo Suit',
        category: 'Fashion',
        price: 1299,
        stock: 12,
        status: 'low_stock',
        monthlySalesUnits: 30,
      },
    ],
  },

  // SD003: Amit Verma (Low Visibility & Impression Collapse)
  SD003: {
    sellerId: 'SD003',
    name: 'Amit Verma',
    store: 'HomeCraft Living',
    category: 'Home & Kitchen Essentials',
    city: 'Moradabad, Uttar Pradesh',
    phone: '+91 97234 56789',
    scenario: 'Low Visibility & Impression Collapse',
    scenarioType: 'low_visibility',
    primaryBottleneck: 'Listing impressions fell 76% due to expired search campaign and outdated metadata',
    lastMonth: {
      sales: 180000,
      orders: 225,
      cancellationRate: 5,
      avgSellingPrice: 800,
      outOfStockProducts: 2,
      totalInventory: 380,
      impressions: 88000,
      clicks: 4400,
      conversionRate: 5.1,
      returnRate: 3.8,
    },
    thisMonth: {
      sales: 72000,
      orders: 90,
      cancellationRate: 5,
      avgSellingPrice: 800,
      outOfStockProducts: 3,
      totalInventory: 350,
      impressions: 21000,
      clicks: 1200,
      conversionRate: 7.5,
      returnRate: 4.0,
    },
    products: [
      {
        id: 'SKU-SD003-01',
        title: '3-Tier Stainless Steel Kitchen Spice Organizer Rack',
        category: 'Home & Kitchen',
        price: 749,
        stock: 55,
        status: 'in_stock',
        monthlySalesUnits: 30,
      },
      {
        id: 'SKU-SD003-02',
        title: 'Non-Stick Granite Dosa Tawa (28cm Induction Base)',
        category: 'Home & Kitchen',
        price: 699,
        stock: 40,
        status: 'in_stock',
        monthlySalesUnits: 25,
      },
      {
        id: 'SKU-SD003-03',
        title: 'Insulated Double Wall Stainless Steel Casserole (1.5L)',
        category: 'Home & Kitchen',
        price: 899,
        stock: 25,
        status: 'in_stock',
        monthlySalesUnits: 18,
      },
      {
        id: 'SKU-SD003-04',
        title: 'Airtight Modular Kitchen Food Storage Jar Set (6 Pcs)',
        category: 'Home & Kitchen',
        price: 599,
        stock: 70,
        status: 'in_stock',
        monthlySalesUnits: 17,
      },
    ],
  },

  // SD004: Neha Kapoor (Poor Conversion Rate despite High Clicks)
  SD004: {
    sellerId: 'SD004',
    name: 'Neha Kapoor',
    store: 'GlowNatural Beauty',
    category: 'Beauty & Personal Care',
    city: 'Mumbai, Maharashtra',
    phone: '+91 99887 76655',
    scenario: 'Poor Conversion Rate (Traffic without Buyer Trust)',
    scenarioType: 'poor_conversion',
    primaryBottleneck: 'Conversion dropped from 9.3% to 2.7% due to missing customer photo reviews and unbundled pricing',
    lastMonth: {
      sales: 150000,
      orders: 300,
      cancellationRate: 4,
      avgSellingPrice: 500,
      outOfStockProducts: 1,
      totalInventory: 500,
      impressions: 55000,
      clicks: 3200,
      conversionRate: 9.3,
      returnRate: 2.5,
    },
    thisMonth: {
      sales: 65000,
      orders: 130,
      cancellationRate: 5,
      avgSellingPrice: 500,
      outOfStockProducts: 2,
      totalInventory: 480,
      impressions: 72000,
      clicks: 4800,
      conversionRate: 2.7,
      returnRate: 3.0,
    },
    products: [
      {
        id: 'SKU-SD004-01',
        title: 'Vitamin C 20% Brightening Face Serum (30ml)',
        category: 'Beauty',
        price: 499,
        stock: 65,
        status: 'in_stock',
        monthlySalesUnits: 45,
      },
      {
        id: 'SKU-SD004-02',
        title: 'Organic Tea Tree Clarifying Face Wash (150ml)',
        category: 'Beauty',
        price: 349,
        stock: 90,
        status: 'in_stock',
        monthlySalesUnits: 40,
      },
      {
        id: 'SKU-SD004-03',
        title: 'Ayurvedic Red Onion Hair Growth Oil (200ml)',
        category: 'Beauty',
        price: 449,
        stock: 50,
        status: 'in_stock',
        monthlySalesUnits: 25,
      },
      {
        id: 'SKU-SD004-04',
        title: 'SPF 50 PA+++ Ultra Matte Gel Sunscreen (50g)',
        category: 'Beauty',
        price: 599,
        stock: 35,
        status: 'in_stock',
        monthlySalesUnits: 20,
      },
    ],
  },

  // SD005: Vikas Malhotra (Critical Hero Product Stockout)
  SD005: {
    sellerId: 'SD005',
    name: 'Vikas Malhotra',
    store: 'StepUp Footwear',
    category: 'Footwear & Athletic Shoes',
    city: 'Agra, Uttar Pradesh',
    phone: '+91 98345 67890',
    scenario: 'Critical Hero SKU Stockout (Halved Revenue)',
    scenarioType: 'hero_stockout',
    primaryBottleneck: 'Top 2 bestselling running shoes (60% sales) went out of stock in prime sizes 8 & 9',
    lastMonth: {
      sales: 260000,
      orders: 400,
      cancellationRate: 6,
      avgSellingPrice: 650,
      outOfStockProducts: 3,
      totalInventory: 700,
      impressions: 75000,
      clicks: 5200,
      conversionRate: 7.7,
      returnRate: 6.5,
    },
    thisMonth: {
      sales: 120000,
      orders: 185,
      cancellationRate: 8,
      avgSellingPrice: 648,
      outOfStockProducts: 15,
      totalInventory: 210,
      impressions: 48000,
      clicks: 2900,
      conversionRate: 6.4,
      returnRate: 7.0,
    },
    products: [
      {
        id: 'SKU-SD005-01',
        title: 'Ultra-Light Breathable Mesh Running Shoes (Black)',
        category: 'Footwear',
        price: 699,
        stock: 0,
        status: 'out_of_stock',
        monthlySalesUnits: 0,
      },
      {
        id: 'SKU-SD005-02',
        title: 'Synthetic Leather Memory Foam Slip-On Loafers',
        category: 'Footwear',
        price: 599,
        stock: 0,
        status: 'out_of_stock',
        monthlySalesUnits: 0,
      },
      {
        id: 'SKU-SD005-03',
        title: 'Waterproof Outdoor All-Weather Trekking Sandals',
        category: 'Footwear',
        price: 499,
        stock: 18,
        status: 'low_stock',
        monthlySalesUnits: 95,
      },
      {
        id: 'SKU-SD005-04',
        title: 'Formal Derby Brogue Lace-Up Office Shoes',
        category: 'Footwear',
        price: 899,
        stock: 45,
        status: 'in_stock',
        monthlySalesUnits: 90,
      },
    ],
  },

  // SD006: Sunita Rao (High Logistics Cancellation Spike)
  SD006: {
    sellerId: 'SD006',
    name: 'Sunita Rao',
    store: 'Prakriti Organics',
    category: 'Gourmet & Organic Staples',
    city: 'Bengaluru, Karnataka',
    phone: '+91 97456 12345',
    scenario: 'Logistics SLA Failures & Cancellation Spike',
    scenarioType: 'high_cancellations',
    primaryBottleneck: 'Cancellation surged from 7% to 23% due to courier dispatch backlogs and SLA delays',
    lastMonth: {
      sales: 175000,
      orders: 350,
      cancellationRate: 7,
      avgSellingPrice: 500,
      outOfStockProducts: 2,
      totalInventory: 420,
      impressions: 50000,
      clicks: 3600,
      conversionRate: 9.7,
      returnRate: 3.0,
    },
    thisMonth: {
      sales: 95000,
      orders: 190,
      cancellationRate: 23,
      avgSellingPrice: 500,
      outOfStockProducts: 4,
      totalInventory: 380,
      impressions: 38000,
      clicks: 2400,
      conversionRate: 7.9,
      returnRate: 4.5,
    },
    products: [
      {
        id: 'SKU-SD006-01',
        title: 'Raw Unprocessed Himalayan Forest Honey (500g Jar)',
        category: 'Gourmet',
        price: 449,
        stock: 40,
        status: 'in_stock',
        monthlySalesUnits: 65,
      },
      {
        id: 'SKU-SD006-02',
        title: 'Wood Cold-Pressed Kachi Ghani Mustard Oil (1L Bottle)',
        category: 'Gourmet',
        price: 299,
        stock: 80,
        status: 'in_stock',
        monthlySalesUnits: 60,
      },
      {
        id: 'SKU-SD006-03',
        title: 'Organic Certified A2 Vedic Cow Desi Bilona Ghee (500ml)',
        category: 'Gourmet',
        price: 850,
        stock: 15,
        status: 'low_stock',
        monthlySalesUnits: 35,
      },
      {
        id: 'SKU-SD006-04',
        title: 'Superfood Combo: Chia Seeds + Roasted Flax Seeds (400g)',
        category: 'Gourmet',
        price: 349,
        stock: 50,
        status: 'in_stock',
        monthlySalesUnits: 30,
      },
    ],
  },

  // SD007: Karan Mehta (Healthy Scaling Performance)
  SD007: {
    sellerId: 'SD007',
    name: 'Karan Mehta',
    store: 'IronGrip Fitness',
    category: 'Sports & Home Fitness',
    city: 'Meerut, Uttar Pradesh',
    phone: '+91 99123 45678',
    scenario: 'Healthy Sales & High Growth Scaling',
    scenarioType: 'healthy_growth',
    primaryBottleneck: 'None (Healthy 40% growth); ready for Snapdeal Gold Tier & mega promotional bundles',
    lastMonth: {
      sales: 210000,
      orders: 300,
      cancellationRate: 4,
      avgSellingPrice: 700,
      outOfStockProducts: 2,
      totalInventory: 650,
      impressions: 65000,
      clicks: 4200,
      conversionRate: 7.1,
      returnRate: 3.2,
    },
    thisMonth: {
      sales: 294000,
      orders: 420,
      cancellationRate: 3.5,
      avgSellingPrice: 700,
      outOfStockProducts: 1,
      totalInventory: 800,
      impressions: 92000,
      clicks: 6100,
      conversionRate: 6.9,
      returnRate: 3.0,
    },
    products: [
      {
        id: 'SKU-SD007-01',
        title: 'Rubber Encased Anti-Roll Hex Dumbbells (5kg Pair)',
        category: 'Fitness',
        price: 1199,
        stock: 60,
        status: 'in_stock',
        monthlySalesUnits: 140,
      },
      {
        id: 'SKU-SD007-02',
        title: 'High-Density Non-Slip Eco TPE Yoga Mat (6mm with Strap)',
        category: 'Fitness',
        price: 499,
        stock: 85,
        status: 'in_stock',
        monthlySalesUnits: 130,
      },
      {
        id: 'SKU-SD007-03',
        title: 'Heavy Duty Resistance Workout Bands Set (11 Pcs)',
        category: 'Fitness',
        price: 649,
        stock: 90,
        status: 'in_stock',
        monthlySalesUnits: 90,
      },
      {
        id: 'SKU-SD007-04',
        title: 'Multi-Function Color-Coded Push Up Board System',
        category: 'Fitness',
        price: 549,
        stock: 40,
        status: 'in_stock',
        monthlySalesUnits: 60,
      },
    ],
  },

  // SD008: Deepak Patel (Severe ASP Drop & Price War)
  SD008: {
    sellerId: 'SD008',
    name: 'Deepak Patel',
    store: 'GizmoWorld Accessories',
    category: 'Mobile & Computer Accessories',
    city: 'Ahmedabad, Gujarat',
    phone: '+91 98250 12345',
    scenario: 'Severe ASP Erosion from Price Wars',
    scenarioType: 'asp_erosion',
    primaryBottleneck: 'Average selling price collapsed from ₹650 to ₹372 (-43%) due to competitor undercut bidding',
    lastMonth: {
      sales: 250000,
      orders: 385,
      cancellationRate: 5,
      avgSellingPrice: 650,
      outOfStockProducts: 3,
      totalInventory: 550,
      impressions: 78000,
      clicks: 4900,
      conversionRate: 7.8,
      returnRate: 4.2,
    },
    thisMonth: {
      sales: 145000,
      orders: 390,
      cancellationRate: 6,
      avgSellingPrice: 372,
      outOfStockProducts: 4,
      totalInventory: 500,
      impressions: 82000,
      clicks: 5300,
      conversionRate: 7.4,
      returnRate: 4.8,
    },
    products: [
      {
        id: 'SKU-SD008-01',
        title: '10,000mAh Ultra-Slim Dual Output Power Bank',
        category: 'Electronics',
        price: 599,
        stock: 50,
        status: 'in_stock',
        monthlySalesUnits: 120,
      },
      {
        id: 'SKU-SD008-02',
        title: 'Ergonomic 2.4GHz Wireless Silent Optical Mouse',
        category: 'Electronics',
        price: 299,
        stock: 70,
        status: 'in_stock',
        monthlySalesUnits: 150,
      },
      {
        id: 'SKU-SD008-03',
        title: 'High-Speed 4-Port USB 3.0 Aluminum Data Hub',
        category: 'Electronics',
        price: 249,
        stock: 65,
        status: 'in_stock',
        monthlySalesUnits: 90,
      },
      {
        id: 'SKU-SD008-04',
        title: '65W GaN Dual Type-C Fast Laptop Charger',
        category: 'Electronics',
        price: 999,
        stock: 18,
        status: 'low_stock',
        monthlySalesUnits: 30,
      },
    ],
  },

  // SD009: Meera Joshi (Ad Spend Inefficiency)
  SD009: {
    sellerId: 'SD009',
    name: 'Meera Joshi',
    store: 'Vidya Books & Stationers',
    category: 'Books & Exam Stationery',
    city: 'Pune, Maharashtra',
    phone: '+91 98500 23456',
    scenario: 'Ad Spend Inefficiency (Irrelevant Clicks & Low ROI)',
    scenarioType: 'ad_inefficiency',
    primaryBottleneck: 'Ad impressions rose 51% but orders fell 45% because ad budget is drained by non-converting broad keywords',
    lastMonth: {
      sales: 160000,
      orders: 320,
      cancellationRate: 4,
      avgSellingPrice: 500,
      outOfStockProducts: 2,
      totalInventory: 580,
      impressions: 45000,
      clicks: 2800,
      conversionRate: 11.4,
      returnRate: 2.1,
    },
    thisMonth: {
      sales: 88000,
      orders: 176,
      cancellationRate: 5,
      avgSellingPrice: 500,
      outOfStockProducts: 3,
      totalInventory: 520,
      impressions: 68000,
      clicks: 4600,
      conversionRate: 3.8,
      returnRate: 2.5,
    },
    products: [
      {
        id: 'SKU-SD009-01',
        title: 'Comprehensive Quantitative Aptitude Guide (Bank/SSC 2026)',
        category: 'Books',
        price: 450,
        stock: 40,
        status: 'in_stock',
        monthlySalesUnits: 55,
      },
      {
        id: 'SKU-SD009-02',
        title: 'Executive Hardbound Ruled A5 Journal (Set of 3)',
        category: 'Stationery',
        price: 399,
        stock: 65,
        status: 'in_stock',
        monthlySalesUnits: 50,
      },
      {
        id: 'SKU-SD009-03',
        title: 'Waterproof Fine-Liner Technical Drawing Pens (Pack of 8)',
        category: 'Stationery',
        price: 320,
        stock: 55,
        status: 'in_stock',
        monthlySalesUnits: 45,
      },
      {
        id: 'SKU-SD009-04',
        title: 'Ergonomic Wooden Laptop Bed Table with Cup Holder',
        category: 'Stationery',
        price: 799,
        stock: 14,
        status: 'low_stock',
        monthlySalesUnits: 26,
      },
    ],
  },

  // SD010: Ananya Singhal (Post-Festive Drop & Cart Abandonment)
  SD010: {
    sellerId: 'SD010',
    name: 'Ananya Singhal',
    store: 'Aashirwad Traditional Jewelry',
    category: 'Fashion & Imitation Jewelry',
    city: 'Hyderabad, Telangana',
    phone: '+91 99480 34567',
    scenario: 'Post-Festive Slump & High Cart Abandonment',
    scenarioType: 'cart_abandonment',
    primaryBottleneck: 'Sales fell 51% post-festival due to heavy bridal catalog reliance; 74% cart abandonment at checkout',
    lastMonth: {
      sales: 280000,
      orders: 350,
      cancellationRate: 6,
      avgSellingPrice: 800,
      outOfStockProducts: 4,
      totalInventory: 600,
      impressions: 88000,
      clicks: 5800,
      conversionRate: 6.0,
      returnRate: 7.2,
    },
    thisMonth: {
      sales: 136000,
      orders: 170,
      cancellationRate: 9,
      avgSellingPrice: 800,
      outOfStockProducts: 8,
      totalInventory: 480,
      impressions: 52000,
      clicks: 3100,
      conversionRate: 5.5,
      returnRate: 8.5,
    },
    products: [
      {
        id: 'SKU-SD010-01',
        title: 'Heavy Kundan Choker Bridal Necklace Set with Jhumkas',
        category: 'Jewelry',
        price: 899,
        stock: 25,
        status: 'in_stock',
        monthlySalesUnits: 50,
      },
      {
        id: 'SKU-SD010-02',
        title: 'Antique Oxidized Silver Tribal Daily Wear Jhumka Earrings',
        category: 'Jewelry',
        price: 299,
        stock: 80,
        status: 'in_stock',
        monthlySalesUnits: 75,
      },
      {
        id: 'SKU-SD010-03',
        title: '24K Micro Gold Plated Handcrafted Bangles (Set of 4)',
        category: 'Jewelry',
        price: 699,
        stock: 30,
        status: 'in_stock',
        monthlySalesUnits: 45,
      },
      {
        id: 'SKU-SD010-04',
        title: 'American Diamond Solitaire Adjustable Finger Ring',
        category: 'Jewelry',
        price: 399,
        stock: 0,
        status: 'out_of_stock',
        monthlySalesUnits: 0,
      },
    ],
  },
};

// -------------------------------------------------------------
// REUSABLE ANALYTICS & COMPUTATION ENGINE
// -------------------------------------------------------------

export function getAllSellers(): SellerSummary[] {
  return Object.values(MOCK_SELLERS).map((s) => {
    const deltas = computeSellerDeltas(s);
    return {
      sellerId: s.sellerId,
      name: s.name,
      store: s.store,
      category: s.category,
      city: s.city,
      scenario: s.scenario,
      scenarioType: s.scenarioType,
      currentSales: s.thisMonth.sales,
      salesChangePct: deltas.salesChangePct,
    };
  });
}

export function getSellerById(sellerId: string): SellerProfile | undefined {
  const normalizedId = sellerId?.toUpperCase()?.trim();
  return MOCK_SELLERS[normalizedId] || Object.values(MOCK_SELLERS).find((s) => s.sellerId === normalizedId);
}

export function getSellerProducts(sellerId: string): SellerProduct[] {
  const seller = getSellerById(sellerId);
  return seller ? seller.products : [];
}

export function computeSellerDeltas(seller: SellerProfile): ComputedDeltas {
  const lm = seller.lastMonth;
  const tm = seller.thisMonth;

  const salesDelta = tm.sales - lm.sales;
  const salesChangePct = Math.round((salesDelta / (lm.sales || 1)) * 100);

  const ordersDelta = tm.orders - lm.orders;
  const ordersChangePct = Math.round((ordersDelta / (lm.orders || 1)) * 100);

  const cancellationDelta = tm.cancellationRate - lm.cancellationRate;
  const returnRateDelta = tm.returnRate - lm.returnRate;
  const conversionRateDelta = Number((tm.conversionRate - lm.conversionRate).toFixed(1));

  const impressionsDelta = tm.impressions - lm.impressions;
  const impressionsChangePct = Math.round((impressionsDelta / (lm.impressions || 1)) * 100);

  const clicksDelta = tm.clicks - lm.clicks;
  const clicksChangePct = Math.round((clicksDelta / (lm.clicks || 1)) * 100);

  const stockoutDelta = tm.outOfStockProducts - lm.outOfStockProducts;

  const aspDelta = tm.avgSellingPrice - lm.avgSellingPrice;
  const aspChangePct = Math.round((aspDelta / (lm.avgSellingPrice || 1)) * 100);

  return {
    salesDelta,
    salesChangePct,
    ordersDelta,
    ordersChangePct,
    cancellationDelta,
    returnRateDelta,
    conversionRateDelta,
    impressionsDelta,
    impressionsChangePct,
    clicksDelta,
    clicksChangePct,
    stockoutDelta,
    aspDelta,
    aspChangePct,
  };
}

export function getSellerAnalytics(sellerId: string): SellerInsight {
  const seller = getSellerById(sellerId) || MOCK_SELLERS.SD001;
  const deltas = computeSellerDeltas(seller);

  let primaryBottlenecks: string[] = [];
  let diagnosis = '';
  let recommendations: string[] = [];
  let summary = '';

  switch (seller.scenarioType) {
    case 'inventory_shortage': // SD001
      primaryBottlenecks = [
        `Inventory stockout crisis: ${seller.thisMonth.outOfStockProducts} products out of stock (+${deltas.stockoutDelta} newly empty)`,
        `Cancellation spike from ${seller.lastMonth.cancellationRate}% to ${seller.thisMonth.cancellationRate}%`,
        `Algorithm visibility penalty reducing impressions to ${seller.thisMonth.impressions.toLocaleString('en-IN')}`,
      ];
      diagnosis = `Rajesh, your ${Math.abs(deltas.salesChangePct)} percent sales decline is driven by 18 products running out of stock and cancellations climbing to 14 percent. On Snapdeal, stockouts and cancellations trigger our search algorithm to demote listing visibility, starving in-stock items of impressions.`;
      recommendations = [
        'Restock all 18 out-of-stock SKUs within the next 48 hours to stop losing an estimated 4 to 5 orders daily per product.',
        'Review cancellation reasons on your Snapdeal dashboard and integrate with Snapdeal Priority Fulfillment to streamline dispatches.',
        'Launch a 7-day 10 to 15 percent promotional discount on your top 5 products to quickly recover algorithm ranking and buyer traffic.',
      ];
      summary = `To summarize today's call, Rajesh: your 33 percent sales drop is caused by 18 products being out of stock and cancellations rising to 14 percent. Your priorities are restocking in 48 hours, resolving logistics bottlenecks, and running a targeted discount campaign.`;
      break;

    case 'high_returns': // SD002
      primaryBottlenecks = [
        `Dangerous return rate spike from ${seller.lastMonth.returnRate}% to ${seller.thisMonth.returnRate}%`,
        `Net revenue erosion of ₹${Math.abs(deltas.salesDelta).toLocaleString('en-IN')} despite steady order volume (${seller.thisMonth.orders} orders)`,
        `Buyer sizing confusion and fabric transparency complaints on ethnic kurtis`,
      ];
      diagnosis = `Pooja, your order volume is strong at 350 orders, but your return rate surged from 9 to 28 percent this month. Customers are returning garments due to size chart mismatches and fabric discrepancies, which wipes out your net profits.`;
      recommendations = [
        'Update all kurti listings with an exact Indian standard bust/waist measurement chart and model height references.',
        'Enforce a pre-dispatch quality check to ensure fabric weave matches catalog descriptions.',
        'Introduce bundled non-returnable accessories like matching dupattas to lift margin and buffer return costs.',
      ];
      summary = `To summarize, Pooja: your sales contraction is primarily driven by customer returns climbing to 28 percent. Your action items are overhauling size charts immediately, conducting pre-dispatch checks, and creating accessory bundles.`;
      break;

    case 'low_visibility': // SD003
      primaryBottlenecks = [
        `Severe impression collapse: dropped ${Math.abs(deltas.impressionsChangePct)}% from ${seller.lastMonth.impressions.toLocaleString('en-IN')} to ${seller.thisMonth.impressions.toLocaleString('en-IN')}`,
        `Orders fell from ${seller.lastMonth.orders} to ${seller.thisMonth.orders} while conversion remained healthy (${seller.thisMonth.conversionRate}%)`,
        `Expired search promotion tags and lack of sponsored product ad visibility`,
      ];
      diagnosis = `Amit, your product conversion is actually very healthy at 7.5 percent, but your impressions collapsed by 76 percent to just 21,000 views. Customers who find your kitchenware buy it, but almost no one is discovering your listings right now.`;
      recommendations = [
        'Re-index your top 4 products with high-frequency buyer search keywords like "stainless steel induction tawa" and "modular storage".',
        'Activate a targeted ₹300 daily Snapdeal Sponsored Listing campaign across kitchen essentials.',
        'Join the upcoming Snapdeal Home Festival deal event with a 10 percent promotional badge to trigger platform algorithm visibility.',
      ];
      summary = `In summary, Amit: your issue is discovery, not product quality, as impressions plunged 76 percent. Your three steps are updating listing SEO keywords, turning on sponsored listing ads, and participating in the Home Festival.`;
      break;

    case 'poor_conversion': // SD004
      primaryBottlenecks = [
        `Conversion rate collapsed from ${seller.lastMonth.conversionRate}% to ${seller.thisMonth.conversionRate}%`,
        `High traffic waste: ${seller.thisMonth.clicks.toLocaleString('en-IN')} clicks generated only ${seller.thisMonth.orders} orders`,
        `Product detail pages lack user review photos, ingredient certification, and bundle offers`,
      ];
      diagnosis = `Neha, your marketing is bringing traffic with 4,800 clicks, but your conversion rate plummeted from 9.3 percent down to 2.7 percent. Buyers are landing on your serum and facewash pages but abandoning because of missing trust elements.`;
      recommendations = [
        'Add verified customer photo reviews and dermatological test certification badges directly to your hero product galleries.',
        'Create high-value combos, like pairing your Vitamin C serum with the sunscreen gel at a 15 percent bundled discount.',
        'Add a clear 100 percent paraben-free guarantee badge in the top bullet points of your description.',
      ];
      summary = `To summarize, Neha: you are getting plenty of clicks, but conversion fell from 9.3 to 2.7 percent. Focus on adding social proof images, introducing combo bundles, and showcasing purity certifications to turn clicks into buyers.`;
      break;

    case 'hero_stockout': // SD005
      primaryBottlenecks = [
        `Top 2 running shoe SKUs out of stock in prime sizes 8 and 9`,
        `Monthly sales dropped ${Math.abs(deltas.salesChangePct)}% from ₹${seller.lastMonth.sales.toLocaleString('en-IN')} to ₹${seller.thisMonth.sales.toLocaleString('en-IN')}`,
        `15 catalog products currently out of stock`,
      ];
      diagnosis = `Vikas, your sales dropped by more than half because your two bestselling running shoe SKUs ran completely out of stock in sizes 8 and 9. Those two items alone generate over 60 percent of your store's total volume.`;
      recommendations = [
        'Prioritize an emergency restock of 100 pairs of running shoes in sizes 8 and 9 within 72 hours.',
        'Enable pre-order or "Notify Me" notifications on the Snapdeal product page to capture pent-up buyer demand.',
        'Temporarily boost advertising visibility on your in-stock trekking sandals and formal shoes to recover immediate cash flow.',
      ];
      summary = `To summarize, Vikas: your 54 percent revenue drop is directly tied to hero shoe stockouts. Your three priorities are emergency restocking of sizes 8 and 9, capturing pre-orders, and shifting ad budget to your active footwear inventory.`;
      break;

    case 'high_cancellations': // SD006
      primaryBottlenecks = [
        `Cancellation rate skyrocketed to ${seller.thisMonth.cancellationRate}% from ${seller.lastMonth.cancellationRate}%`,
        `Orders dropped by ${Math.abs(deltas.ordersChangePct)}% due to warehouse dispatch delays`,
        `Late dispatch penalties threatening seller account tier downgrade`,
      ];
      diagnosis = `Sunita, your cancellation rate has skyrocketed to 23 percent this month. Customers are cancelling orders before dispatch because your local warehouse logistics partner is taking over 48 hours to initiate pick-ups.`;
      recommendations = [
        'Switch your primary fulfillment courier to Snapdeal Express Direct for guaranteed same-day order pick-up.',
        'Implement automated inventory reservation to prevent selling products that are awaiting batch packaging.',
        'Set up SMS dispatch alerts to update buyers immediately when their organic honey or ghee is packed.',
      ];
      summary = `To recap, Sunita: your 23 percent cancellation rate is caused by dispatch delays. Your immediate action items are switching to Snapdeal Express Direct, enforcing inventory reservation, and enabling real-time buyer notifications.`;
      break;

    case 'healthy_growth': // SD007
      primaryBottlenecks = [
        `Ready to scale: Sales grew +${deltas.salesChangePct}% from ₹${seller.lastMonth.sales.toLocaleString('en-IN')} to ₹${seller.thisMonth.sales.toLocaleString('en-IN')}`,
        `Super low cancellation (${seller.thisMonth.cancellationRate}%) and low return rate (${seller.thisMonth.returnRate}%)`,
        `Capitalize on high organic momentum and qualify for Snapdeal Gold Merchant status`,
      ];
      diagnosis = `Karan, your fitness brand is in fantastic health with sales surging 40 percent to 2,94,000 rupees and cancellations dropping to just 3.5 percent. Your customer ratings and fulfillment speeds are exceptional.`;
      recommendations = [
        'Apply for the Snapdeal Gold Merchant badge this week to unlock free algorithm boost and featured homepage slots.',
        'Introduce complete Home Gym Bundles pairing your hex dumbbells with the yoga mat and resistance bands.',
        'Increase inventory buffer by 30 percent ahead of the upcoming seasonal fitness rush.',
      ];
      summary = `To summarize, Karan: you are performing brilliantly with 40 percent growth and low cancellations. Your roadmap is claiming your Snapdeal Gold badge, building curated home gym bundles, and scaling your inventory buffer.`;
      break;

    case 'asp_erosion': // SD008
      primaryBottlenecks = [
        `Average Selling Price collapsed by ${Math.abs(deltas.aspChangePct)}% from ₹${seller.lastMonth.avgSellingPrice} down to ₹${seller.thisMonth.avgSellingPrice}`,
        `Total orders remained stable (${seller.thisMonth.orders} orders) but revenue crashed by ${Math.abs(deltas.salesChangePct)}%`,
        `Margin erosion caused by deep price cutting to compete with unauthorized resellers`,
      ];
      diagnosis = `Deepak, your order volume is completely steady at 390 orders, but your revenue crashed by 42 percent because your average selling price dropped from 650 to 372 rupees due to price slashing.`;
      recommendations = [
        'Stop the standalone price war on your slim power banks and bundle them with fast braided cables at a profitable ₹799 price point.',
        'Register your brand under Snapdeal Brand Protection to remove gray-market unauthorized duplicate sellers.',
        'Focus marketing spend on your high-margin GaN laptop chargers which maintain strong profitability.',
      ];
      summary = `To summarize, Deepak: your orders are solid but your average selling price collapsed by 43 percent. Your action plan is creating bundled accessories, activating brand protection against unauthorized sellers, and promoting high-margin GaN chargers.`;
      break;

    case 'ad_inefficiency': // SD009
      primaryBottlenecks = [
        `Ad clicks rose +${deltas.clicksChangePct}% but orders fell by ${Math.abs(deltas.ordersChangePct)}%`,
        `Conversion rate degraded from ${seller.lastMonth.conversionRate}% to ${seller.thisMonth.conversionRate}%`,
        `Ad budget wasted on generic search keywords rather than high-intent exam titles`,
      ];
      diagnosis = `Meera, your ad spend is generating 4,600 clicks, but your conversion rate plunged from 11.4 percent to 3.8 percent. Your campaign is bidding on generic broad keywords like "books" and "notebooks" that attract casual browsers instead of serious exam buyers.`;
      recommendations = [
        'Refine your ad keyword match types to exact exam phrases like "Bank PO reasoning guide" and "SSC aptitude 2026".',
        'Add negative keywords for school textbooks and fictional novels to immediately stop wasting ad budget.',
        'Bundle your exam guides with high-grade ruled journals at an attractive combi-pack discount.',
      ];
      summary = `In summary, Meera: your marketing budget is leaking into irrelevant clicks, dropping conversion from 11.4 to 3.8 percent. Your action steps are refining keyword match types, adding negative keywords, and creating exam student combo packs.`;
      break;

    case 'cart_abandonment': // SD010
      primaryBottlenecks = [
        `Post-festive demand dropped sales by ${Math.abs(deltas.salesChangePct)}% from ₹${seller.lastMonth.sales.toLocaleString('en-IN')} to ₹${seller.thisMonth.sales.toLocaleString('en-IN')}`,
        `High checkout cart abandonment (74%) due to unexpected shipping charges on jewelry`,
        `Over-dependence on heavy bridal sets with zero daily-wear imitation jewelry diversity`,
      ];
      diagnosis = `Ananya, your sales fell 51 percent following the post-festive slowdown, and checkout cart abandonment is at 74 percent. Customers love your jewelry designs, but heavy bridal sets are experiencing an off-season slump.`;
      recommendations = [
        'Diversify your catalog immediately with lightweight, daily-wear oxidized silver earrings and anti-tarnish office jewelry under ₹399.',
        'Enroll in Snapdeal Free Shipping on orders over ₹499 to remove buyer hesitation at the checkout payment screen.',
        'Launch a "Gift for Her" seasonal marketing push with personalized jewelry packaging.',
      ];
      summary = `To recap today's call, Ananya: your 51 percent drop is caused by post-festive bridal cooling and checkout abandonment. Your priorities are launching lightweight daily-wear collections, offering threshold free shipping, and promoting gift packaging.`;
      break;

    default:
      primaryBottlenecks = ['General performance variance'];
      diagnosis = `Looking at your data, there has been a ${Math.abs(deltas.salesChangePct)}% change in your monthly sales.`;
      recommendations = ['Audit catalog listings', 'Optimize fulfillment', 'Run targeted promotions'];
      summary = `Summary of next steps: review catalog and promotions.`;
  }

  return {
    sellerId: seller.sellerId,
    sellerName: seller.name,
    store: seller.store,
    category: seller.category,
    scenario: seller.scenario,
    scenarioType: seller.scenarioType,
    deltas,
    primaryBottlenecks,
    diagnosis,
    recommendations,
    summary,
  };
}

// Backwards compatibility export for any existing SD001 references
export const SELLER_DATA: SellerProfile = MOCK_SELLERS.SD001;
export const COMPUTED = {
  salesDropPct: 33,
  ordersDropPct: 33,
  cancellationIncrease: 6,
  newOutOfStockCount: 13,
  lostRevenue: 65000,
  dailyLostOrders: 4,
};
