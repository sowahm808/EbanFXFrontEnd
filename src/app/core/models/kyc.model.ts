import { KycStatus } from './user.model';

export interface KycSubmissionPayload {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  nationalId: string;
  address: string;
  documentPlaceholder: string;
}

export interface KycStatusResponse {
  status: KycStatus;
  submittedAt?: string;
  notes?: string;
}

export interface AdminKycItem {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  submittedAt: string;
}
