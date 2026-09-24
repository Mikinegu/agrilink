import { parseTelebirrSms, verifyPaymentAgainstAdminTelebirr } from '../src/utils/aiPaymentController.ts';

console.log('--- Testing Telebirr SMS Parser ---');

// Test 1: English Telebirr SMS
const englishSms = 'Dear customer, you have received ETB 4,500.00 from 251911223344 (Abebe Kebede). Transaction number: CC481029482 on 2026-09-23 11:45:00. Your current balance is ETB 128,450.00.';
const parsedEn = parseTelebirrSms(englishSms);
console.log('Test 1 (English SMS):', parsedEn);
if (parsedEn.success && parsedEn.transactionRef === 'CC481029482' && parsedEn.amountEtb === 4500 && parsedEn.senderPhone === '251911223344') {
  console.log('✅ Test 1 Passed!');
} else {
  console.error('❌ Test 1 Failed:', parsedEn);
  process.exit(1);
}

// Test 2: Amharic Telebirr SMS
const amharicSms = 'ክቡር ደንበኛ፣ ከ 251911223344 4,500.00 ብር ገቢ ተደርጎልዎታል:: የግብይት ቁጥር ADQ882941091 ቀን 2026-09-23 11:45:00:: አጠቃላይ ቀሪ ሂሳብዎ 128,450.00 ብር ነው።';
const parsedAm = parseTelebirrSms(amharicSms);
console.log('Test 2 (Amharic SMS):', parsedAm);
if (parsedAm.success && parsedAm.transactionRef === 'ADQ882941091' && parsedAm.amountEtb === 4500) {
  console.log('✅ Test 2 Passed!');
} else {
  console.error('❌ Test 2 Failed:', parsedAm);
  process.exit(1);
}

// Test 3: Cross-Verification against Admin Telebirr Account
const verifyValid = verifyPaymentAgainstAdminTelebirr({
  rawTxRef: 'CC481029482',
  claimedAmount: 4500,
  expectedAmount: 4500,
  adminTelebirrPhone: '0961123330',
  adminMerchantCode: '884920',
});
console.log('Test 3 (Valid Verification):', verifyValid);
if (verifyValid.isAuthentic && verifyValid.recommendation === 'AUTO_PASS') {
  console.log('✅ Test 3 Passed!');
} else {
  console.error('❌ Test 3 Failed:', verifyValid);
  process.exit(1);
}

// Test 4: Fraud Detection (Mismatched Amount)
const verifyFraud = verifyPaymentAgainstAdminTelebirr({
  rawTxRef: 'CC481029482',
  claimedAmount: 1200,
  expectedAmount: 4500,
  adminTelebirrPhone: '0961123330',
});
console.log('Test 4 (Fraud - Amount Mismatch):', verifyFraud);
if (!verifyFraud.isAuthentic && verifyFraud.recommendation !== 'AUTO_PASS') {
  console.log('✅ Test 4 Passed!');
} else {
  console.error('❌ Test 4 Failed:', verifyFraud);
  process.exit(1);
}

console.log('🎉 ALL UNIT TESTS PASSED!');
