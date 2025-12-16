export enum LeadStatus {
  UNCONTACTED = 'UNCONTACTED',
  NO_ANSWER = 'NO_ANSWER',
  ANSWERED = 'ANSWERED',
  ORDERED = 'ORDERED',
  CANCELLED = 'CANCELLED'
}

export enum ActionType {
  CALL = 'CALL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  NOTE = 'NOTE'
}

export interface Lead {
  leadId: string;
  liveSessionId: string;
  tiktokUsername: string;
  phoneNumber: string;
  commentText: string;
  commentTimestamp: string;
  capturedAt: string;
  city: string;
  tags: string[];
  status: LeadStatus;
  avatarUrl: string;
  lastUpdated?: string;
  rowIndex?: number; // Added to track Google Sheet row number
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface LiveSession {
  sessionId: string;
  date: string;
  totalLeads: number;
}