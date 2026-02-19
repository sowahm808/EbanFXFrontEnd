export interface CreateQuotePayload {
  amountGhs: number;
}

export interface Quote {
  id: string;
  amountGhs: number;
  customerRate: number;
  amountUsd: number;
  feeGhs: number;
  expiresAt: string;
}
