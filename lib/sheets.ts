import { GOOGLE_CONFIG } from './config';
import { Lead, LeadStatus, User } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let isAuthInitialized = false;

// Initialize GAPI Client for Sheets API
export const initGapiClient = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.client) {
      // Already loaded
      resolve();
      return;
    }
    
    // Retry mechanism for loading gapi
    const checkGapi = setInterval(() => {
      if (window.gapi) {
        clearInterval(checkGapi);
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_CONFIG.API_KEY,
              discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
            });
            resolve();
          } catch (error) {
            console.error('Error initializing GAPI client:', error);
            reject(error);
          }
        });
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGapi);
      reject(new Error("Timeout loading Google API"));
    }, 10000);
  });
};

// Initialize Google Identity Services (OAuth)
export const initGoogleAuth = (onUserChange: (user: User | null) => void): void => {
  if (isAuthInitialized || !window.google) return;

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      scope: GOOGLE_CONFIG.SCOPES,
      callback: async (response: any) => {
        if (response.error !== undefined) {
          console.error("Auth Error:", response);
          throw response;
        }
        
        // Fetch user profile after successful auth
        try {
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }).then(res => res.json());

          onUserChange({
            id: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            avatar: userInfo.picture
          });
        } catch (error) {
           console.error("Error fetching user info:", error);
        }
      },
    });
    isAuthInitialized = true;
  } catch (err) {
    console.error("Failed to initialize Google Auth:", err);
  }
};

export const signIn = () => {
  if (tokenClient) {
    // Request access token (triggers popup)
    // Note: If you see 'redirect_uri=storagerelay' errors, ensure your Origin is added to Cloud Console
    tokenClient.requestAccessToken();
  } else {
    console.error("Token client not initialized");
    alert("Google Sign-In not ready. Please refresh the page.");
  }
};

export const signOut = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken('');
    });
  }
};

// --- Sheets Operations ---

// Map a row array to a Lead object
const rowToLead = (row: string[], index: number): Lead => {
  // Columns:
  // A: ID (0)
  // B: Username (1)
  // C: Phone (2)
  // D: Status (3)
  // E: City (4)
  // F: Comment/Notes (5)
  // G: Timestamp (6)
  // H: Tags (7)
  
  return {
    leadId: row[0] || `lead_${index}`, 
    tiktokUsername: row[1] || 'Unknown',
    phoneNumber: row[2] || '',
    status: (row[3] as LeadStatus) || LeadStatus.UNCONTACTED,
    city: row[4] || '',
    commentText: row[5] || '', // This acts as our Notes field
    commentTimestamp: row[6] || new Date().toISOString(),
    tags: row[7] ? row[7].split(',').map(t => t.trim()) : [],
    // Computed/Default fields
    liveSessionId: 'session_1', 
    capturedAt: new Date().toISOString(),
    avatarUrl: `https://ui-avatars.com/api/?name=${row[1] || 'User'}&background=random`,
    rowIndex: index + 2 // +2 because API is 1-based and we skip header
  } as Lead;
};

export const fetchLeadsFromSheet = async (): Promise<Lead[]> => {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      range: `${GOOGLE_CONFIG.SHEET_NAME}!A2:H`, // Fetch columns A to H, skipping header
    });

    const rows = response.result.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row: string[], i: number) => rowToLead(row, i));
  } catch (err) {
    console.error('Error fetching leads:', err);
    throw err;
  }
};

export const updateLeadStatusInSheet = async (lead: Lead, newStatus: LeadStatus, note?: string): Promise<void> => {
  if (!lead.rowIndex) {
    throw new Error("Cannot update a lead without a row index");
  }

  // We want to update Status (Col D, index 3) and Notes (Col F, index 5).
  // We can do this efficiently by updating the range D{row}:F{row}.
  // D: Status, E: City, F: Notes.
  // We must preserve the City (E).
  
  const range = `${GOOGLE_CONFIG.SHEET_NAME}!D${lead.rowIndex}:F${lead.rowIndex}`;
  
  const values = [
    [newStatus, lead.city, note || lead.commentText]
  ];

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
    range: range,
    valueInputOption: 'RAW',
    resource: {
      values: values
    }
  });
};
