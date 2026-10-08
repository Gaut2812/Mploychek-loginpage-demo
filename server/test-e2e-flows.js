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

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function verifyAllFlows() {
  console.log('====================================================');
  console.log('MployChek Comprehensive End-to-End Verification');
  console.log('====================================================\n');

  // TEST 1: GENERAL USER LOGIN & PROFILE
  console.log('>>> TEST 1: General User Login (user01 / General User)');
  const resLogin1 = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'user01', password: 'User@123', role: 'General User' }
  );

  assert(resLogin1.status === 200, 'Login status is 200 OK');
  assert(resLogin1.data.success === true, 'Response contains success: true');
  assert(resLogin1.data.user.name === 'Rahul Verma', 'User name is Rahul Verma');
  assert(resLogin1.data.user.role === 'General User', 'User role is General User');
  assert(resLogin1.data.user.department === 'Engineering', 'Department is Engineering');
  const userToken = resLogin1.data.token;
  assert(!!userToken, 'JWT Token was issued');

  // TEST 2: GET /api/users/me for user01
  console.log('\n>>> TEST 2: GET /api/users/me for user01');
  const resMe1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(resMe1.status === 200, 'GET /api/users/me is 200 OK');
  assert(resMe1.data.userId === 'user01', 'Profile userId is user01');
  assert(resMe1.data.name === 'Rahul Verma', 'Profile name is Rahul Verma');
  assert(resMe1.data.memberSince === '2023-01-15', 'Profile memberSince is 2023-01-15');

  // TEST 3: ROLE-BASED SCOPING: user01 sees only user01 records
  console.log('\n>>> TEST 3: Role-based Records Scoping for user01');
  const resRec1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(resRec1.status === 200, 'GET /api/records is 200 OK');
  const user01Records = resRec1.data;
  assert(user01Records.length === 3, 'user01 receives exactly 3 personal records');
  const allOwnedByUser01 = user01Records.every((r) => r.ownerUserId === 'user01');
  assert(allOwnedByUser01, 'All returned records are strictly owned by user01');
  assert(user01Records.some((r) => r.recordId === 'REC-001'), 'Contains REC-001');
  assert(user01Records.some((r) => r.recordId === 'REC-002'), 'Contains REC-002');
  assert(user01Records.some((r) => r.recordId === 'REC-005'), 'Contains REC-005');

  // TEST 4: ROLE MISMATCH VALIDATION
  console.log('\n>>> TEST 4: Role Mismatch Validation (user01 claiming Administrator)');
  const resMismatch = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'user01', password: 'User@123', role: 'Administrator' }
  );
  assert(resMismatch.status === 401, 'Role mismatch rejected with 401 Unauthorized');
  assert(resMismatch.data.error.includes('Incorrect role'), 'Error message specifies role mismatch');

  // TEST 5: ADMIN LOGIN & PROFILE
  console.log('\n>>> TEST 5: Admin Login (admin01 / Administrator)');
  const resLoginAdmin = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: 'admin01', password: 'Admin@123', role: 'Administrator' }
  );
  assert(resLoginAdmin.status === 200, 'Admin login status is 200 OK');
  assert(resLoginAdmin.data.user.name === 'Priya Sharma', 'Admin name is Priya Sharma');
  assert(resLoginAdmin.data.user.role === 'Administrator', 'Admin role is Administrator');
  assert(resLoginAdmin.data.user.department === 'IT Administration', 'Department is IT Administration');
  const adminToken = resLoginAdmin.data.token;

  // TEST 6: ADMIN SEES ALL RECORDS
  console.log('\n>>> TEST 6: Global Scope Records for Administrator');
  const resRecAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(resRecAdmin.status === 200, 'Admin GET /api/records is 200 OK');
  assert(resRecAdmin.data.length === 6, 'Admin receives all 6 organization records');
  assert(resRecAdmin.data.some((r) => r.recordId === 'REC-004'), 'Contains REC-004 (admin record)');
  assert(resRecAdmin.data.some((r) => r.recordId === 'REC-003'), 'Contains REC-003 (user02 record)');

  // TEST 7: SECURITY: GENERAL USER CANNOT ACCESS /api/users
  console.log('\n>>> TEST 7: General User Restricted From Admin Endpoints');
  const resForbidden = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(resForbidden.status === 403, 'General User blocked with 403 Forbidden on GET /api/users');

  // TEST 8: ADMIN CRUD ON XML STORAGE
  console.log('\n>>> TEST 8: Admin User Management CRUD Operations');
  const newUserId = 'user99_test';
  // 8a: Create User
  const resCreate = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      userId: newUserId,
      password: 'Password@123',
      role: 'General User',
      fullName: 'Vikram Malhotra',
      email: 'vikram@mploychek.com',
      department: 'Finance',
    }
  );
  assert(resCreate.status === 201, 'POST /api/users returns 201 Created');
  assert(resCreate.data.name === 'Vikram Malhotra', 'Created user name matches');

  // 8b: Update User
  const resUpdate = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/users/${newUserId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      fullName: 'Vikram Malhotra (Lead)',
      department: 'Corporate Finance',
    }
  );
  assert(resUpdate.status === 200, 'PUT /api/users/:id returns 200 OK');
  assert(resUpdate.data.name === 'Vikram Malhotra (Lead)', 'Updated user name matches');
  assert(resUpdate.data.department === 'Corporate Finance', 'Updated department matches');

  // 8c: Delete User
  const resDelete = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/users/${newUserId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(resDelete.status === 200, 'DELETE /api/users/:id returns 200 OK');

  // TEST 9: ASYNC DELAY PARAMETER (?delay=3000)
  console.log('\n>>> TEST 9: Non-blocking Latency Simulator (?delay=3000)');
  const start3000 = Date.now();
  const resDelay3000 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/records?delay=3000',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const elapsed3000 = Date.now() - start3000;
  assert(resDelay3000.status === 200, 'Delayed response status is 200 OK');
  assert(
    elapsed3000 >= 3000 && elapsed3000 < 3500,
    `Latency simulator delayed for ${elapsed3000}ms (expected ~3000ms)`
  );

  console.log('\n====================================================');
  console.log('All 9 Test Flows Verified Successfully!');
  console.log('====================================================');
}

verifyAllFlows().catch(console.error);
