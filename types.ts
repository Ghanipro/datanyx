export enum AssetType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  INDUSTRIAL = 'Industrial',
  VEHICLE = 'Vehicle',
  LAND = 'Land'
}

export enum AssetStatus {
  NEW = 'New NPA',
  NOTICE_SENT = 'Notice Sent',
  POSSESSION_TAKEN = 'Possession Taken',
  AUCTION_SCHEDULED = 'Auction Scheduled',
  SOLD = 'Sold',
  SETTLED = 'Settled'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  extractedData?: Record<string, any>;
  status: 'pending' | 'processing' | 'verified' | 'flagged';
}

export interface LegalEvent {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  description: string;
  type: 'notice' | 'hearing' | 'possession' | 'valuation';
}

export interface Asset {
  id: string;
  borrowerName: string;
  loanAccountNumber: string;
  type: AssetType;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  outstandingAmount: number;
  reservePrice: number;
  marketValue: number;
  status: AssetStatus;
  documents: Document[];
  timeline: LegalEvent[];
  riskScore: number; // 0-100
  recoveryProbability: number; // 0-100
  imageUrl: string;
  description: string;
}

export interface Auction {
  id: string;
  assetId: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid: number;
  status: 'upcoming' | 'live' | 'ended';
  bidders: number;
}
