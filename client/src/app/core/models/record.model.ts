export interface RecordItem {
  recordId: string;
  title: string;
  description: string;
  ownerUserId: string;
  userId?: string;
  accessLevel: 'READ' | 'READ/WRITE' | string;
  status: 'Active' | 'Pending' | 'Approved' | 'Rejected' | string;
  createdDate: string;
  createdAt?: string;
}
