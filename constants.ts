import { Lead, LeadStatus, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Sarah Agent',
  email: 'sarah@fm1sales.com',
  avatar: 'https://picsum.photos/100/100',
};

const CITIES = ['Tunis', 'Sfax', 'Sousse', 'Gabès', 'Bizerte', 'Ariana'];

export const MOCK_LEADS: Lead[] = Array.from({ length: 25 }).map((_, i) => {
  const statusValues = Object.values(LeadStatus);
  const randomStatus = statusValues[Math.floor(Math.random() * statusValues.length)];
  const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
  
  return {
    leadId: `l${i}`,
    liveSessionId: `session_${Math.floor(i / 10)}`,
    tiktokUsername: `user_tiktok_${i + 1}`,
    phoneNumber: `+216 55 ${Math.floor(100000 + Math.random() * 900000)}`,
    commentText: i % 3 === 0 ? "Je veux commander svp" : "Prix??",
    commentTimestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    capturedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    city: randomCity,
    tags: i % 2 === 0 ? ['VIP'] : [],
    status: i < 5 ? LeadStatus.UNCONTACTED : randomStatus, // Ensure some are new
    avatarUrl: `https://picsum.photos/200/200?random=${i}`,
  };
});