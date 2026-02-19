export type UserRole = 'user' | 'admin' | 'compliance';
export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface CurrentUserProfile {
  uid: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
}
