export interface Record {
  recordId: string;
  userId: string;
  title: string;
  description: string;
  accessLevel: 'public' | 'internal' | 'confidential';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
