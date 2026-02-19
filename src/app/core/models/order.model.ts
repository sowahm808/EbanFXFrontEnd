import { Beneficiary } from './beneficiary.model';

export type OrderStatus =
  | 'PENDING'
  | 'FUNDS_CONFIRMED'
  | 'PROCESSING'
  | 'SENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FLAGGED';

export interface CreateOrderPayload {
  quoteId: string;
  beneficiaryId: string;
  note?: string;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  beneficiary: Beneficiary;
  amountGhs: number;
  amountUsd: number;
  status: OrderStatus;
  createdAt: string;
  settlementTxHash?: string;
  payoutRef?: string;
  timeline: OrderTimelineItem[];
}
