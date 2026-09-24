async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  console.log('--- Testing Telebirr Link & AI Guardian APIs ---');

  // Test 1: Get Telebirr Link Config
  console.log('1. Testing GET /api/admin/telebirr-link...');
  const res1 = await fetch(`${BASE_URL}/api/admin/telebirr-link`);
  const data1 = await res1.json();
  console.log('Response:', data1);
  if (!data1.success || !data1.config?.phoneNumber) {
    throw new Error('GET /api/admin/telebirr-link failed');
  }
  console.log('✅ GET /api/admin/telebirr-link Passed!');

  // Test 2: Update Telebirr Link Config
  console.log('\n2. Testing POST /api/admin/telebirr-link...');
  const res2 = await fetch(`${BASE_URL}/api/admin/telebirr-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '0961123330',
      accountName: 'AgriLink Technologies PLC (Escrow Vault)',
      merchantCode: '884920',
      isLinked: true,
      aiMode: 'AI_AUTOPILOT',
      autoApproveGenuineTelebirr: true,
      notifyAdminOnPhone: true,
    }),
  });
  const data2 = await res2.json();
  console.log('Response:', data2);
  if (!data2.success || data2.config.phoneNumber !== '0961123330') {
    throw new Error('POST /api/admin/telebirr-link failed');
  }
  console.log('✅ POST /api/admin/telebirr-link Passed!');

  // Test 3: Phone Handshake Verification
  console.log('\n3. Testing POST /api/admin/telebirr-link/verify...');
  const res3 = await fetch(`${BASE_URL}/api/admin/telebirr-link/verify`, {
    method: 'POST',
  });
  const data3 = await res3.json();
  console.log('Response:', data3);
  if (!data3.success) {
    throw new Error('POST /api/admin/telebirr-link/verify failed');
  }
  console.log('✅ POST /api/admin/telebirr-link/verify Passed!');

  // Test 4: Simulate Incoming Buyer Payment (AI Intercept)
  console.log('\n4. Testing POST /api/admin/telebirr-link/simulate...');
  const res4 = await fetch(`${BASE_URL}/api/admin/telebirr-link/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 4500,
      buyerName: 'Abebe Demisse (Bole Supermarket)',
      buyerPhone: '+251 91 144 5566',
    }),
  });
  const data4 = await res4.json();
  console.log('Response:', data4);
  if (!data4.success || !data4.txRef || !data4.aiLog) {
    throw new Error('POST /api/admin/telebirr-link/simulate failed');
  }
  console.log('✅ POST /api/admin/telebirr-link/simulate Passed! Decision:', data4.aiLog.decision);

  // Test 5: Incoming SMS Receiver / Webhook Parser
  console.log('\n5. Testing POST /api/admin/telebirr-link/incoming-sms...');
  const res5 = await fetch(`${BASE_URL}/api/admin/telebirr-link/incoming-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      smsText: 'Dear customer, you have received ETB 4,500.00 from 251911223344 (Abebe Kebede). Transaction number: CC481029482 on 2026-09-23 11:45:00.',
    }),
  });
  const data5 = await res5.json();
  console.log('Response:', data5);
  if (!data5.success || !data5.parsed?.transactionRef) {
    throw new Error('POST /api/admin/telebirr-link/incoming-sms failed');
  }
  console.log('✅ POST /api/admin/telebirr-link/incoming-sms Passed! Parsed Ref:', data5.parsed.transactionRef);

  console.log('\n🎉 ALL 5 TELEBIRR API ENDPOINTS ARE FULLY OPERATIONAL!');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
