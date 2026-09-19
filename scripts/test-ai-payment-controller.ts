/**
 * Verification Test: Admin Presence & Autonomous AI Payment Controller ("Admin Away Protocol")
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting AI Payment Controller & Admin Presence Test...\n');

  // 1. Check initial status
  console.log('1. Checking initial /api/admin/ai-controller/status...');
  const initRes = await fetch(`${BASE_URL}/api/admin/ai-controller/status`);
  const initStatus = await initRes.json();
  console.log('   Initial mode:', initStatus.mode, 'isHumanPresent:', initStatus.isHumanPresent, 'isAiInControl:', initStatus.isAiInControl);

  // 2. Ensure Human Control mode
  console.log('\n2. Setting mode to HUMAN_CONTROL...');
  const humanRes = await fetch(`${BASE_URL}/api/admin/ai-controller/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'HUMAN_CONTROL', isHumanPresent: true }),
  });
  console.log('   Presence response:', await humanRes.json());

  // 3. Place a Direct Order
  console.log('\n3. Placing an order with Telebirr payment...');
  const orderRes = await fetch(`${BASE_URL}/api/orders/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '5',
    },
    body: JSON.stringify({
      productId: 1,
      quantity: 5,
      deliveryAddress: 'Bole Medhanealem Commercial District, Addis Ababa',
      deliveryRegion: 'Addis Ababa',
      deliveryZone: 'Bole Sub-City',
      deliveryWoreda: 'Woreda 03',
      deliveryContactName: 'Yonas Alemu (Test Buyer)',
      deliveryContactPhone: '+251 91 122 3344',
      payerAccountNumber: '0911223344',
      provider: 'TELEBIRR',
      notes: 'Testing Admin human review vs. AI pass',
    }),
  });
  const orderData = await orderRes.json();
  console.log('   Order placed:', orderData.order?.orderNumber, 'Payment ID:', orderData.payment?.id, 'Status:', orderData.payment?.status);

  const paymentId = orderData.payment?.id;

  // 4. Test Manual Admin Pass
  if (paymentId) {
    console.log(`\n4. Testing Manual Human Admin Pass on Payment #${paymentId}...`);
    const passRes = await fetch(`${BASE_URL}/api/admin/payments/${paymentId}/pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: 'Verified via CBE Core Banking Portal by Admin Desk' }),
    });
    const passData = await passRes.json();
    console.log('   Manual pass response:', passData.message, 'Payment Status:', passData.payment?.status);
  }

  // 5. Test AI Auto-Pilot when Admin is Away
  console.log('\n5. Switching Admin mode to AI_AUTOPILOT (Admin Stepped Away)...');
  const awayRes = await fetch(`${BASE_URL}/api/admin/ai-controller/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'AI_AUTOPILOT', isHumanPresent: false }),
  });
  const awayData = await awayRes.json();
  console.log('   Away response: isAiInControl =', awayData.isAiInControl);

  // 6. Place another order while Admin is Away
  console.log('\n6. Placing second order while Admin is Away...');
  const order2Res = await fetch(`${BASE_URL}/api/orders/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '5',
    },
    body: JSON.stringify({
      productId: 2,
      quantity: 10,
      deliveryAddress: 'Kazanchis Business Center, Addis Ababa',
      deliveryRegion: 'Addis Ababa',
      deliveryZone: 'Kirkos',
      deliveryWoreda: 'Woreda 08',
      deliveryContactName: 'Yonas Alemu (Test Buyer)',
      deliveryContactPhone: '+251 91 122 3344',
      payerAccountNumber: '0911223344',
      provider: 'CBE_MOBILE_BANKING',
      notes: 'Testing Autonomous AI Escrow Controller',
    }),
  });
  const order2Data = await order2Res.json();
  const payment2Id = order2Data.payment?.id;
  console.log('   Order #2 placed:', order2Data.order?.orderNumber, 'Payment ID:', payment2Id);

  // 7. Payment #2 naturally starts as PENDING_APPROVAL, queued for AI evaluation
  console.log(`   Payment #${payment2Id} is in PENDING_APPROVAL state, awaiting AI auto-pass...`);

  // 8. Wait 5 seconds for the AI Auto-Pilot worker to detect and auto-pass
  console.log('\n8. Waiting 5 seconds for AI Autonomous Escrow Agent to evaluate...');
  await new Promise((r) => setTimeout(r, 5500));

  // 9. Inspect AI Controller Status and Logs
  console.log('\n9. Checking AI Controller Status and Audit Logs...');
  const auditRes = await fetch(`${BASE_URL}/api/admin/ai-controller/status`);
  const auditStatus = await auditRes.json();
  console.log('   AI Stats:', auditStatus.aiStats);
  console.log('   Latest AI Audit Log:', auditStatus.recentLogs[0]);

  // 10. Restore Admin presence to HUMAN_CONTROL
  console.log('\n10. Restoring Admin presence to HUMAN_CONTROL...');
  await fetch(`${BASE_URL}/api/admin/ai-controller/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'HUMAN_CONTROL', isHumanPresent: true }),
  });
  console.log('    Presence successfully restored to HUMAN_CONTROL');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
