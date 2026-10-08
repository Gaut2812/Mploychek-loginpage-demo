import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Builder } from 'xml2js';

async function seed(): Promise<void> {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const user01Hash = await bcrypt.hash('User@123', 10);
  const user02Hash = await bcrypt.hash('User@456', 10);

  const data = {
    data: {
      users: {
        user: [
          {
            $: {
              id: 'admin01',
              userId: 'admin01',
              password: adminHash,
              role: 'Administrator',
              name: 'Priya Sharma',
              fullName: 'Priya Sharma',
              email: 'priya.sharma@mploychek.com',
              department: 'IT Administration',
              status: 'Active',
              memberSince: '2022-08-01',
              createdAt: '2022-08-01T09:00:00.000Z',
              updatedAt: new Date().toISOString(),
            },
          },
          {
            $: {
              id: 'user01',
              userId: 'user01',
              password: user01Hash,
              role: 'General User',
              name: 'Rahul Verma',
              fullName: 'Rahul Verma',
              email: 'rahul.verma@mploychek.com',
              department: 'Engineering',
              status: 'Active',
              memberSince: '2023-01-15',
              createdAt: '2023-01-15T10:30:00.000Z',
              updatedAt: new Date().toISOString(),
            },
          },
          {
            $: {
              id: 'user02',
              userId: 'user02',
              password: user02Hash,
              role: 'General User',
              name: 'Ananya Gupta',
              fullName: 'Ananya Gupta',
              email: 'ananya.gupta@mploychek.com',
              department: 'Marketing',
              status: 'Active',
              memberSince: '2023-04-10',
              createdAt: '2023-04-10T11:15:00.000Z',
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      },
      records: {
        record: [
          {
            $: {
              id: 'REC-001',
              recordId: 'REC-001',
              userId: 'user01',
              ownerUserId: 'user01',
              title: 'Employee Performance Review',
              description: 'Annual engineering performance milestone evaluation',
              accessLevel: 'READ',
              status: 'Active',
              createdDate: '2024-01-10',
              createdAt: '2024-01-10T08:00:00.000Z',
            },
          },
          {
            $: {
              id: 'REC-002',
              recordId: 'REC-002',
              userId: 'user01',
              ownerUserId: 'user01',
              title: 'Engineering Evaluation',
              description: 'Technical architecture and code quality audit report',
              accessLevel: 'READ',
              status: 'Active',
              createdDate: '2024-02-14',
              createdAt: '2024-02-14T14:20:00.000Z',
            },
          },
          {
            $: {
              id: 'REC-003',
              recordId: 'REC-003',
              userId: 'user02',
              ownerUserId: 'user02',
              title: 'HR Performance Report',
              description: 'Marketing operations Q1 staffing and review log',
              accessLevel: 'READ',
              status: 'Active',
              createdDate: '2024-03-01',
              createdAt: '2024-03-01T09:45:00.000Z',
            },
          },
          {
            $: {
              id: 'REC-004',
              recordId: 'REC-004',
              userId: 'admin01',
              ownerUserId: 'admin01',
              title: 'Organization Compliance Report',
              description: 'Enterprise-wide security access and compliance log',
              accessLevel: 'READ/WRITE',
              status: 'Active',
              createdDate: '2024-03-15',
              createdAt: '2024-03-15T16:00:00.000Z',
            },
          },
          {
            $: {
              id: 'REC-005',
              recordId: 'REC-005',
              userId: 'user01',
              ownerUserId: 'user01',
              title: 'Cloud Infrastructure Assessment',
              description: 'Multi-region resilience and failover testing report',
              accessLevel: 'READ',
              status: 'Active',
              createdDate: '2024-04-02',
              createdAt: '2024-04-02T10:10:00.000Z',
            },
          },
          {
            $: {
              id: 'REC-006',
              recordId: 'REC-006',
              userId: 'admin01',
              ownerUserId: 'admin01',
              title: 'Security & Penetration Testing Results',
              description: 'Bi-annual network and API vulnerability audit findings',
              accessLevel: 'READ/WRITE',
              status: 'Active',
              createdDate: '2024-04-18',
              createdAt: '2024-04-18T13:30:00.000Z',
            },
          },
        ],
      },
    },
  };

  const builder = new Builder();
  const xml = builder.buildObject(data);
  const outPath = path.join(__dirname, 'data.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`Seed data written to ${outPath}`);
  console.log('Demo accounts seeded:');
  console.log('  user01  / User@123  (General User)');
  console.log('  user02  / User@456  (General User)');
  console.log('  admin01 / Admin@123 (Administrator)');
}

seed().catch(console.error);
