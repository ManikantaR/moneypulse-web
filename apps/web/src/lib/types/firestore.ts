export interface CategoryDoc {
  id: string;
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  parentCategoryId: string | null;
  userAliasId: string;
}

export interface BudgetDoc {
  id: string;
  budgetId: string;
  categoryId: string | null;
  amountCents: number;
  period: 'monthly' | 'weekly';
  userAliasId: string;
}

export interface TransactionDoc {
  id: string;
  transactionAliasId: string;
  accountAliasId: string;
  amountCents: number;
  date: string;
  categoryId: string | null;
  merchantName: string | null;
  isCredit: boolean;
  isManual: boolean;
  userAliasId: string;
}

export interface NotificationDoc {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: unknown; // Firestore server timestamp
  userAliasId: string;
}

export interface DeviceTokenDoc {
  token: string;
  platform: 'web';
  platformDetail: string;
  userAliasId: string;
  lastSeenAt: unknown;
  createdAt: unknown;
}

export interface AiMetricsDoc {
  userAliasId: string;
  windowDays: number;
  totalRuns: number;
  avgLatencyMs: number | null;
  avgConfidence: number | null;
  piiDetectionCount: number;
  piiDetectionRate: number;
  categoriesAssignedTotal: number;
  model: string | null;
  healthStatus: 'ok' | 'degraded' | 'unavailable';
  generatedAt: string;
  syncedAt: unknown; // Firestore server timestamp
}
