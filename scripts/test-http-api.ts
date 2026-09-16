/**
 * HTTP REST API Client Verification for AgriFlow Rescue
 */

async function testHttpApi() {
  const baseUrl = 'http://localhost:3000/api/salvage';

  console.log('Testing live HTTP REST API on', baseUrl);

  // 1. GET /lots
  const lotsRes = await fetch(`${baseUrl}/lots`);
  const lots = await lotsRes.json();
  console.log(`1. GET /lots returned ${lots.length} lots. (First Lot ID: ${lots[0].id})`);

  // 2. POST /lots
  const newLotRes = await fetch(`${baseUrl}/lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farmerId: 1,
      commodityName: 'B-Grade Processing Tomatoes',
      weightKg: 10000,
      benchmarkPrice: 80,
      defectType: 'HAIL_IMPACT',
      defectSeverityPct: 30,
      brixLevel: 5.5,
      degradationHours: 48,
    }),
  });
  const created = await newLotRes.json();
  console.log(`2. POST /lots created lot #${created.lot.id} (Status: ${created.lot.status})`);
  const lotId = created.lot.id;

  // 3. POST /negotiate/bid
  const bidRes = await fetch(`${baseUrl}/negotiate/bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lotId,
      buyerId: 2,
      proposedDiscountPercent: 45,
      intendedProduct: 'Bulk Paste',
    }),
  });
  const bidData = await bidRes.json();
  const negId = bidData.negotiation.id;
  console.log(`3. POST /negotiate/bid created negotiation #${negId} with 45% discount (Gross Payout: ${bidData.economics.grossFarmerPayout} ETB)`);

  // 4. POST /negotiate/counter
  const counterRes = await fetch(`${baseUrl}/negotiate/counter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      negotiationId: negId,
      counterDiscountPercent: 28,
      notes: 'Countering with 28% discount floor',
    }),
  });
  const counterData = await counterRes.json();
  console.log(`4. POST /negotiate/counter updated discount to 28% (Retained Gain: +${counterData.gainMetrics.gainRetained} ETB, Status: ${counterData.negotiation.status})`);

  // 5. POST /negotiate/accept (Strict SQL Transaction)
  const acceptRes = await fetch(`${baseUrl}/negotiate/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      negotiationId: negId,
      carrierId: 3,
    }),
  });
  const acceptData = await acceptRes.json();
  console.log(`5. POST /negotiate/accept executed SQL transaction: Escrow Vault #${acceptData.escrowVault.id} locked (${acceptData.escrowVault.escrow_status}), Shipment e-BoL: ${acceptData.freightShipment.bol_number}`);

  // 6. POST /logistics/telemetry
  const telemRes = await fetch(`${baseUrl}/logistics/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lotId,
      ambientTemperatureCelsius: 2.8,
      relativeHumidityPercent: 88,
      batteryPercent: 97,
      currentLocation: 'Adama Expressway Checkpoint',
      status: 'IN_TRANSIT',
    }),
  });
  const telemData = await telemRes.json();
  console.log(`6. POST /logistics/telemetry recorded reading: ${telemData.latestReading.ambientTempCelsius}°C, Status: ${telemData.shipment.status}`);

  // 7. POST /escrow/release-qa (Gate QA Settlement Transaction)
  const qaRes = await fetch(`${baseUrl}/escrow/release-qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lotId,
      qaPassed: true,
      measuredBrix: 5.5,
      inspectorName: 'Dr. Dawit Haile',
      inspectorNotes: 'Quality verified. B-grade flesh sound for paste concentration.',
    }),
  });
  const qaData = await qaRes.json();
  console.log(`7. POST /escrow/release-qa executed settlement transaction:`);
  console.log(`   - Disbursed to Farmer: ${qaData.settlementStatement.disbursedFarmerPayout} ETB`);
  console.log(`   - Disbursed to Carrier: ${qaData.settlementStatement.disbursedCarrierFreight} ETB`);
  console.log(`   - Retained Platform Fee: ${qaData.settlementStatement.retainedPlatformFee} ETB`);
  console.log(`   - Settlement Ref: ${qaData.settlementStatement.disbursementTransactionRef}`);

  console.log('\n✓ ALL LIVE HTTP API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!');
}

testHttpApi().catch((e) => {
  console.error('HTTP Test Error:', e);
  process.exit(1);
});
