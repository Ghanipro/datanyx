
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
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
    }
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

export const updateUserProfile = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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
    console.warn("Falling back to local mock data due to API error");
    return MOCK_ASSETS;
  }
};

export const createAsset = async (formData: FormData): Promise<Asset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/`, {
      method: 'POST',
      body: formData 
    });
    if (!response.ok) throw new Error('Creation failed: ' + await response.text());
    return response.json();
  } catch (error) {
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
    return response.json();
  } catch (error) {
    throw error;
  }
};

// --- AUCTIONS ---

export const scheduleAuction = async (assetId: string, reservePrice: number): Promise<Auction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, reservePrice })
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchAuctions = async (): Promise<Auction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/live`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
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

export const selectAuctionWinner = async (auctionId: string, bidId: string): Promise<Auction> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/select-winner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bidId })
        });
        if (!response.ok) throw new Error('Failed to select winner');
        return response.json();
      } catch (error) {
        throw error;
      }
};

// --- BIDDERS ---

export const fetchBidders = async (): Promise<Bidder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bidders/`);
    return response.json();
  } catch (error) {
    return [];
  }
};

export const registerBidder = async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidders/register`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Registration failed');
      }
      return response.json();
    } catch (error) {
      throw error;
    }
  };

export const updateBidderStatus = async (bidderId: string, status: 'verified' | 'rejected'): Promise<Bidder> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bidders/${bidderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
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
    return [];
  }
};
