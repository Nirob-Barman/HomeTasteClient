export interface TOrderStats {
  totalAllTime: number;
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  averageOrderValue: number;
}

export interface TRevenueStats {
  totalAllTime: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface TOrderStatusBreakdown {
  status: string;
  count: number;
}

export interface TTopMeal {
  mealId: string;
  mealName: string | null;
  totalQuantityOrdered: number;
  totalRevenue: number;
}

export interface TTopCustomer {
  userId: string;
  fullName: string | null;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
}

export interface TDailyRevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TSupportSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface TLoyaltySummary {
  totalActiveAccounts: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

export interface TInventorySummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface TDashboardStats {
  orders: TOrderStats;
  revenue: TRevenueStats;
  ordersByStatus: TOrderStatusBreakdown[];
  topMeals: TTopMeal[];
  topCustomers: TTopCustomer[];
  dailyRevenueLast30Days: TDailyRevenuePoint[];
  supportSummary: TSupportSummary;
  loyaltySummary: TLoyaltySummary;
  inventorySummary: TInventorySummary;
}
