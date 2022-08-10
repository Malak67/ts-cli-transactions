export type Transaction = {
  user_id: string;
  timestamp: string;
  currency: string;
  amount: string;
};

export enum CurrencyType {
  GBP = 'GBP',
  USD = 'USD',
  EUR = 'EUR',
}

export type Currency = {
  type: CurrencyType;
  values: number[];
  timestamps: string[];
};

export type FormattedTransaction = {
  [key: string]: Currency;
};
