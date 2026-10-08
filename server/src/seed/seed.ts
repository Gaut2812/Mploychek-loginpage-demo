import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Builder } from 'xml2js';

async function seed(): Promise<void> {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const user01Hash = await bcrypt.hash('User@123', 10);
  const user02Hash = await bcrypt.hash('User@456', 10);

  const now = new Date().toISOString();

  const data = {
    data: {
      users: {
        user: [
          {
            $: {
              id: 'admin01',
              password: adminHash,
              role: 'admin',
              fullName: 'Priya Sharma',
              email: 'priya.sharma@mploychek.com',
              department: 'IT Administration',
              status: 'active',
              createdAt: now,
              updatedAt: now,
            },
          },
          {
            $: {
              id: 'user01',
              password: user01Hash,
              role: 'general_user',
              fullName: 'Rahul Verma',
              email: 'rahul.verma@mploychek.com',
              department: 'Engineering',
              status: 'active',
              createdAt: now,
              updatedAt: now,
            },
          },
          {
            $: {
              id: 'user02',
              password: user02Hash,
              role: 'general_user',
              fullName: 'Ananya Gupta',
              email: 'ananya.gupta@mploychek.com',
              department: 'Marketing',
              status: 'active',
              createdAt: now,
              updatedAt: now,
            },
          },
        ],
      },
      records: {
        record: [
          {
            $: {
              id: 'REC001',
              userId: 'user01',
              title: 'Q3 Performance Review',
              description: 'Quarterly performance assessment for Engineering team',
              accessLevel: 'internal',
              status: 'approved',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC002',
              userId: 'user01',
              title: 'Leave Request - October',
              description: 'Annual leave request for Oct 15-20',
              accessLevel: 'public',
              status: 'pending',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC003',
              userId: 'user01',
              title: 'Training Completion: AWS Cert',
              description: 'AWS Solutions Architect certification completed',
              accessLevel: 'internal',
              status: 'approved',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC004',
              userId: 'user02',
              title: 'Campaign Budget Report',
              description: 'Q3 marketing campaign budget analysis',
              accessLevel: 'confidential',
              status: 'approved',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC005',
              userId: 'user02',
              title: 'Brand Guidelines Update',
              description: 'Updated brand guidelines v2.1',
              accessLevel: 'public',
              status: 'approved',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC006',
              userId: 'admin01',
              title: 'System Audit Log - September',
              description: 'Monthly system access audit report',
              accessLevel: 'confidential',
              status: 'approved',
              createdAt: now,
            },
          },
          {
            $: {
              id: 'REC007',
              userId: 'admin01',
              title: 'User Access Review',
              description: 'Quarterly user access permissions review',
              accessLevel: 'confidential',
              status: 'pending',
              createdAt: now,
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
  console.log('Demo credentials:');
  console.log('  admin01 / Admin@123 (Admin)');
  console.log('  user01  / User@123  (General User)');
  console.log('  user02  / User@456  (General User)');
}

seed().catch(console.error);
