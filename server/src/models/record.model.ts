export interface Record {
  recordId: string;
  title: string;
  description: string;
  ownerUserId: string;
  accessLevel: 'READ' | 'READ/WRITE' | string;
  status: 'Active' | 'Pending' | 'Approved' | 'Rejected' | string;
  createdDate: string;
  // Aliases for compatibility
  userId?: string;
  createdAt?: string;
}
