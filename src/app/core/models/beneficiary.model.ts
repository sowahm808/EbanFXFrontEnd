export interface Beneficiary {
  id: string;
  name: string;
  country: string;
  walletNetwork: 'TRON';
  walletAsset: 'USDT';
  walletAddress: string;
  createdAt: string;
}

export interface CreateBeneficiaryPayload {
  name: string;
  country: string;
  walletNetwork: 'TRON';
  walletAsset: 'USDT';
  walletAddress: string;
}
