import { User } from '../types';

export const sampleUsers: User[] = [
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@mindmate.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'user1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'user',
    createdAt: '2024-01-15T10:30:00.000Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isActive: true
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    role: 'user',
    createdAt: '2024-02-01T14:20:00.000Z',
    lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    isActive: true
  },
  {
    id: 'user3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    role: 'user',
    createdAt: '2024-02-10T09:15:00.000Z',
    lastLogin: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    isActive: false
  }
];

export const sampleCredentials = [
  { email: 'admin@mindmate.com', password: 'admin123' },
  { email: 'sarah.johnson@email.com', password: 'sarah123' },
  { email: 'michael.chen@email.com', password: 'michael123' },
  { email: 'emma.rodriguez@email.com', password: 'emma123' }
];