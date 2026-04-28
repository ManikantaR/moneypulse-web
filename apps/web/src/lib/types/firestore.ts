export interface CategoryDoc {
  id: string;
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  parentCategoryId: string | null;
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
