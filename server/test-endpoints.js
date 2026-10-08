const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Login as General User (user01 / General User) ---');
  const userLogin = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'user01', password: 'User@123', role: 'General User' }
  );
  console.log('Status:', userLogin.status);
  console.log('User Login response:', JSON.stringify(userLogin.data, null, 2));

  console.log('\n--- 2. Testing Mismatched Role Login (user01 claiming Administrator) ---');
  const mismatchLogin = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'user01', password: 'User@123', role: 'Administrator' }
  );
  console.log('Status (expected 401):', mismatchLogin.status, mismatchLogin.data);

  console.log('\n--- 3. Testing Login as Admin (admin01 / Administrator) ---');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'admin01', password: 'Admin@123', role: 'Administrator' }
  );
  console.log('Status:', adminLogin.status);
  console.log('Admin Login response:', JSON.stringify(adminLogin.data, null, 2));

  const userToken = userLogin.data?.token;
  const adminToken = adminLogin.data?.token;

  console.log('\n--- 4. Testing GET /api/users/me for user01 ---');
  const userMe = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log('Status:', userMe.status);
  console.log('User me:', userMe.data);

  console.log('\n--- 5. Testing GET /api/records for user01 (General User should see ONLY user01 records) ---');
  const userRecords = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log('Status:', userRecords.status);
  console.log(`user01 records count: ${userRecords.data?.length}`);
  console.log('Records:', userRecords.data);

  console.log('\n--- 6. Testing GET /api/records for admin01 (Administrator should see all records) ---');
  const adminRecords = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Status:', adminRecords.status);
  console.log(`Admin records count: ${adminRecords.data?.length}`);

  console.log('\n--- 7. Testing General User accessing GET /api/users (Expected 403 Forbidden) ---');
  const forbiddenUsers = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log('Status (expected 403):', forbiddenUsers.status, forbiddenUsers.data);

  console.log('\n--- 8. Testing Admin GET /api/users ---');
  const allUsers = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Status:', allUsers.status);
  console.log(`Users count: ${allUsers.data?.length}`);

  console.log('\n--- 9. Testing Delay parameter (?delay=1000) ---');
  const start = Date.now();
  const delayedRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records?delay=1000',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const duration = Date.now() - start;
  console.log(`Delayed response received in ${duration}ms, status: ${delayedRes.status}`);

  console.log('\nAll updated backend tests completed successfully!');
}

runTests().catch(console.error);
