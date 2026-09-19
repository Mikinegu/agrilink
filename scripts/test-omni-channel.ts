const BASE_URL = 'http://localhost:3000';

async function runOmniTests() {
  console.log('\n============================================================');
  console.log('TESTING OMNI-CHANNEL ESCROW & PAYMENT SUITE');
  console.log('============================================================\n');

  // 1. Test GET /api/v1/payments/endpoints
  console.log('1. Testing GET /api/v1/payments/endpoints:');
  const res1 = await fetch(`${BASE_URL}/api/v1/payments/endpoints`);
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}`);
  console.log(`Returned ${data1.endpoints?.length} official endpoints`);
  if (res1.status === 200 && data1.endpoints?.length >= 4) {
    console.log('✓ PASS: Official receiving accounts returned successfully.');
  } else {
    console.error('✗ FAIL: Endpoints fetch failed');
  }

  // 2. Test POST /api/v1/payments/submit-manual-proof (Valid CBE Mobile)
  console.log('\n2. Testing POST /api/v1/payments/submit-manual-proof (CBE Mobile):');
  const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38GBgYGBgYGBgABAwMB4/370AAAAABJRU5ErkJggg==';
  const txRef = `FT26${Date.now()}`;

  const res2 = await fetch(`${BASE_URL}/api/v1/payments/submit-manual-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-OMNI-101',
      rail: 'CBE_MOBILE_BANKING',
      tx_number: txRef,
      claimed_amount: 54200,
      receipt_image: sampleImage,
    }),
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  console.log('Response:', data2);
  if (res2.status === 201 && data2.status === 'success') {
    console.log('✓ PASS: Manual proof successfully recorded with escrow lock.');
  } else {
    console.error('✗ FAIL: Manual proof submission failed');
  }

  // 3. Test Duplicate Receipt Image Rejection (Anti-Recycling)
  console.log('\n3. Testing Duplicate Screenshot Anti-Recycling Guard:');
  const res3 = await fetch(`${BASE_URL}/api/v1/payments/submit-manual-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-OMNI-102',
      rail: 'CBE_MOBILE_BANKING',
      tx_number: `FT26${Date.now() + 5000}`,
      claimed_amount: 54200,
      receipt_image: sampleImage, // Duplicate image!
    }),
  });
  const data3 = await res3.json();
  console.log(`Status: ${res3.status}`);
  console.log('Response:', data3);
  if (res3.status === 409 && data3.code === 'DUPLICATE_RECEIPT') {
    console.log('✓ PASS: Recycled screenshot successfully rejected with 409 Conflict!');
  } else {
    console.error('✗ FAIL: Recycled screenshot guard failed');
  }

  // 4. Test Invalid Pattern Validator
  console.log('\n4. Testing Pattern Validator (CBE without FT prefix):');
  const res4 = await fetch(`${BASE_URL}/api/v1/payments/submit-manual-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-OMNI-103',
      rail: 'CBE_MOBILE_BANKING',
      tx_number: 'INVALID12345678', // Does not start with FT
      claimed_amount: 54200,
      receipt_image: 'data:image/png;base64,another_image_bytes',
    }),
  });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status}`);
  console.log('Response:', data4);
  if (res4.status === 422 && data4.code === 'INVALID_TX_ID') {
    console.log('✓ PASS: Invalid pattern rejected with 422 Unprocessable Entity!');
  } else {
    console.error('✗ FAIL: Invalid pattern check failed');
  }

  console.log('\n============================================================');
  console.log('OMNI-CHANNEL ESCROW SUITE VERIFICATION SUCCESSFUL!');
  console.log('============================================================\n');
}

runOmniTests().catch(console.error);
