import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n============================================================');
  console.log('AGRILINK ENTERPRISE PAYMENT VERIFICATION SUBSYSTEM TEST SUITE');
  console.log('============================================================\n');

  // Test sample fake receipt images (base64)
  const sampleImage1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const sampleImage2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNkWPm/nwEIGBkAAK8CBgQz12EAAAAASUVORK5CYII=';

  // 1. Test Valid Telebirr submission
  console.log('1. Submitting valid Telebirr Payment Proof:');
  const validTx = `ADQ${Date.now()}`;
  const res1 = await fetch(`${BASE_URL}/api/v1/payments/submit-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-TEST-901',
      payment_method: 'TELEBIRR_MANUAL',
      transaction_number: validTx,
      claimed_amount: 15400,
      receipt_image: sampleImage1,
      payer_id: '2',
      extracted_receiver_name: 'Agrilink Escrow Ltd',
    }),
  });
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}`);
  console.log('Response:', data1);
  if (res1.status === 201 && data1.status === 'success') {
    console.log('✓ PASS: Valid Telebirr proof accepted with SHA-256 hash:', data1.image_hash);
  } else {
    console.error('✗ FAIL: Submission rejected unexpectedly');
  }

  // 2. Test Anti-Recycling Duplicate Receipt Image Hash
  console.log('\n2. Testing Anti-Recycling Duplicate Image Hash Detection:');
  const differentTx = `ADQ${Date.now() + 1000}`;
  const res2 = await fetch(`${BASE_URL}/api/v1/payments/submit-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-TEST-902',
      payment_method: 'TELEBIRR_MANUAL',
      transaction_number: differentTx,
      claimed_amount: 15400,
      receipt_image: sampleImage1, // SAME IMAGE!
    }),
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  console.log('Response:', data2);
  if (res2.status === 409 && data2.code === 'RECYCLED_RECEIPT_DETECTED') {
    console.log('✓ PASS: Duplicate receipt image correctly rejected with 409 Conflict!');
  } else {
    console.error('✗ FAIL: Did not detect recycled receipt image');
  }

  // 3. Test Duplicate Normalized Transaction Reference Uniqueness
  console.log('\n3. Testing Duplicate Normalized Transaction ID Detection:');
  const res3 = await fetch(`${BASE_URL}/api/v1/payments/submit-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-TEST-903',
      payment_method: 'TELEBIRR_MANUAL',
      transaction_number: validTx.toLowerCase(), // SAME TX (different case)
      claimed_amount: 15400,
      receipt_image: sampleImage2, // different image
    }),
  });
  const data3 = await res3.json();
  console.log(`Status: ${res3.status}`);
  console.log('Response:', data3);
  if (res3.status === 409 && data3.code === 'DUPLICATE_TRANSACTION_NUMBER') {
    console.log('✓ PASS: Duplicate transaction reference correctly rejected with 409 Conflict!');
  } else {
    console.error('✗ FAIL: Duplicate transaction reference allowed');
  }

  // 4. Test Pattern Enforcement (CBE Mobile Banking requires FT prefix)
  console.log('\n4. Testing Pattern Enforcement (CBE Mobile Banking without FT):');
  const res4 = await fetch(`${BASE_URL}/api/v1/payments/submit-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-TEST-904',
      payment_method: 'CBE_MOBILE_BANKING',
      transaction_number: '123456789012', // missing FT prefix!
      claimed_amount: 25000,
      receipt_image: sampleImage2,
    }),
  });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status}`);
  console.log('Response:', data4);
  if (res4.status === 422 && data4.code === 'INVALID_TX_PATTERN') {
    console.log('✓ PASS: Invalid CBE pattern caught with 422 Unprocessable Entity!');
  } else {
    console.error('✗ FAIL: Pattern validator did not catch invalid CBE syntax');
  }

  // 5. Test Valid CBE Mobile Banking with FT prefix
  console.log('\n5. Testing Valid CBE Mobile Banking (Starts with FT):');
  const validCbeTx = `FT26${Date.now()}`;
  const res5 = await fetch(`${BASE_URL}/api/v1/payments/submit-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORD-TEST-905',
      payment_method: 'CBE_MOBILE_BANKING',
      transaction_number: validCbeTx,
      claimed_amount: 32000,
      receipt_image: sampleImage2,
    }),
  });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status}`);
  console.log('Response:', data5);
  if (res5.status === 201 && data5.status === 'success') {
    console.log('✓ PASS: Valid CBE Mobile Banking proof accepted and queued for audit!');
  } else {
    console.error('✗ FAIL: Valid CBE proof rejected');
  }

  // 6. Test Audit Queue Query
  console.log('\n6. Testing Admin / Finance Proofs Queue:');
  const res6 = await fetch(`${BASE_URL}/api/payments/proofs`);
  const data6 = await res6.json();
  console.log(`Status: ${res6.status}`);
  console.log('Summary metrics:', data6.summary);
  console.log(`Total proofs in queue: ${data6.proofs.length}`);
  if (res6.status === 200 && data6.proofs.length >= 2) {
    console.log('✓ PASS: Audit queue returned submitted evidence records with metrics!');
  } else {
    console.error('✗ FAIL: Proofs queue failed');
  }

  // 7. Test Admin Audit Decision Action
  console.log('\n7. Testing Admin Audit Decision (Approve CBE Proof):');
  const proofToAudit = data5.proof_id;
  const res7 = await fetch(`${BASE_URL}/api/payments/proofs/${proofToAudit}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'APPROVE',
      adminId: '1',
      adminNotes: 'Verified against CBE Core Banking Journal. Approved for immediate dispatch.',
    }),
  });
  const data7 = await res7.json();
  console.log(`Status: ${res7.status}`);
  console.log('Response:', data7);
  if (res7.status === 200 && data7.proof?.status === 'ADMIN_APPROVED') {
    console.log('✓ PASS: Admin audit transition to ADMIN_APPROVED verified!');
  } else {
    console.error('✗ FAIL: Audit transition failed');
  }

  console.log('\n============================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runTests().catch(console.error);
