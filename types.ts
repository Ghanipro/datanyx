
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

export type UserRole = 'Recovery Officer' | 'Bidder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  token?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  extractedData?: Record<string, any>;
  status: 'pending' | 'processing' | 'verified' | 'flagged';
  filePath?: string;
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
  riskScore: number;
  recoveryProbability: number;
  imageUrl: string;
  description: string;
  areaSqFt?: number;
  summary?: string;
  keywords?: string[];
}

export interface Bid {
  _id?: string;
  bidderId?: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface Auction {
  id: string;
  assetId: string;
  assetSnapshot?: {
    borrowerName: string;
    imageUrl: string;
    city: string;
  };
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid: number;
  status: 'upcoming' | 'live' | 'ended' | 'closed';
  bids: Bid[];
  winner?: string;
  winningBid?: number;
}

export interface Bidder {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharNumber?: string;
  panUrl?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
}
