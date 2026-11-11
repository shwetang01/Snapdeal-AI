export interface MonthMetrics {
  sales: number;
  orders: number;
  cancellationRate: number;
  avgSellingPrice: number;
  outOfStockProducts: number;
}

export interface SellerProfile {
  name: string;
  store: string;
  category: string;
  sellerId: string;
  phone: string;
  city: string;
  lastMonth: MonthMetrics;
  thisMonth: MonthMetrics;
}

export const SELLER_DATA: SellerProfile = {
  name: 'Rajesh Sharma',
  store: 'Rajesh Electronics',
  category: 'Electronics & Mobile Accessories',
  sellerId: 'SND-EL-49201',
  phone: '+91 98765 43210',
  city: 'New Delhi',
  lastMonth: {
    sales: 200000,
    orders: 400,
    cancellationRate: 8,
    avgSellingPrice: 500,
    outOfStockProducts: 5,
  },
  thisMonth: {
    sales: 135000,
    orders: 270,
    cancellationRate: 14,
    avgSellingPrice: 500,
    outOfStockProducts: 18,
  },
};

export const COMPUTED = {
  salesDropPct: Math.round(((200000 - 135000) / 200000) * 100), // 32.5% -> 33%
  ordersDropPct: Math.round(((400 - 270) / 400) * 100), // 32.5% -> 33%
  cancellationIncrease: 14 - 8, // +6 percentage points
  newOutOfStockCount: 18 - 5, // +13 products
  lostRevenue: 200000 - 135000, // ₹65,000
  dailyLostOrders: 4, // ~4-5 lost orders per out of stock product per day
};

