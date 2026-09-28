// Shared types across apps

export type Role = 'STUDENT' | 'STAFF' | 'SECURITY_OFFICER' | 'ADMIN';
export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'OPEN' | 'MATCHED' | 'CLAIMED' | 'RESOLVED' | 'ARCHIVED';
export type ClaimStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISPUTED';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  avatarUrl?: string;
  isVerified: boolean;
  reputationScore: number;
}