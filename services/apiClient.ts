
import { Asset, User, Notification, Bidder, Auction, LegalEvent } from '../types';
import { MOCK_ASSETS } from './mockData';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// --- AUTH ---

export const loginUser = async (email: string, password: string): Promise<{user: User, token: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<{user: User, token: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<{message: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  } catch (error) {
    throw error;
  }
};

// --- ASSETS ---

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.warn("⚠️ Backend API unreachable. Falling back to local Mock Data.");
    return MOCK_ASSETS;
  }
};

// Updated to support FormData for Image Upload
export const createAsset = async (formData: FormData): Promise<Asset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/`, {
      method: 'POST',
      body: formData // No Content-Type header needed for FormData, browser sets it
    });
    if (!response.ok) throw new Error('Creation failed');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const updateAsset = async (id: string, data: Partial<Asset>): Promise<Asset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Update failed');
    return response.json();
  } catch (error) {
    console.warn("⚠️ Backend API unreachable.");
    throw error;
  }
};

export const addLegalEvent = async (assetId: string, event: Partial<LegalEvent>): Promise<LegalEvent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error('Failed to add event');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const uploadDocument = async (assetId: string, file: File, extractedData: any) => {
  try {
    const formData = new FormData();
    formData.append('file', file); 
    formData.append('name', file.name);
    formData.append('doc_type', extractedData.documentType || 'Unknown');
    formData.append('extracted_data', JSON.stringify(extractedData));
    formData.append('status', 'verified');

    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/documents`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('File upload failed');
    return response.json();
  } catch (error) {
    console.warn("⚠️ Backend API unreachable.");
    return {
      id: Date.now().toString(),
      name: file.name,
      type: extractedData.documentType || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'verified',
      extractedData: extractedData
    };
  }
};

// --- AUCTIONS & BIDDING ---

export const scheduleAuction = async (assetId: string, reservePrice: number): Promise<Auction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, reservePrice })
    });
    if (!response.ok) throw new Error('Scheduling failed');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchAuctions = async (): Promise<Auction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/live`);
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const placeBid = async (auctionId: string, bidderName: string, amount: number): Promise<Auction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidderName, amount })
    });
    if (!response.ok) throw new Error('Bid failed');
    return response.json();
  } catch (error) {
    throw error;
  }
};

// --- BIDDERS ---

export const fetchBidders = async (): Promise<Bidder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bidders/`);
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  } catch (error) {
    return [];
  }
};

export const createBidder = async (bidderData: Partial<Bidder>): Promise<Bidder> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bidders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidderData)
    });
    if (!response.ok) throw new Error('Failed to create bidder');
    return response.json();
  } catch (error) {
    throw error;
  }
};

// --- NOTIFICATIONS ---

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [
      { id: '1', title: 'Hearing Tomorrow', message: 'Legal hearing for Green Textiles', type: 'alert', isRead: false, createdAt: new Date().toISOString() },
    ];
  }
};
