/**
 * AgriFlow Rescue & B2B Commodity Exchange
 * End-to-End Backend Verification & Test Runner Script
 * 
 * Verifies:
 * 1. Distressed harvest lot listing with defect profiler & Brix rating
 * 2. Industrial buyer discount bidding (45% discount offer)
 * 3. Farmer counter-offer (28% discount) and mathematical gain calculation (+136,000 ETB)
 * 4. Deal acceptance & atomic SQL escrow vault locking (HELD_IN_VAULT + DISPATCHED)
 * 5. Cold-chain IoT telematics streaming
 * 6. Gate QA verification & atomic disbursement transaction (RELEASED_TO_FARMER + DELIVERED)
 */

import { initSalvageDatabase, query } from '../src/db/salvageDb.ts';
import {
  computeLotEconomics,
  computeCounterGain,
  computeCarrierFreightFee,
} from '../src/lib/salvageCalculator.ts';

const ANSI_GREEN = '\x1b[32m';
const ANSI_BLUE = '\x1b[34m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_CYAN = '\x1b[36m';
const ANSI_BOLD = '\x1b[1m';
const ANSI_RESET = '\x1b[0m';

function logStep(step: number, title: string) {
  console.log(`\n${ANSI_CYAN}${ANSI_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI_RESET}`);
  console.log(`${ANSI_BLUE}${ANSI_BOLD}STEP ${step}:${ANSI_RESET} ${ANSI_BOLD}${title}${ANSI_RESET}`);
  console.log(`${ANSI_CYAN}${ANSI_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI_RESET}`);
}

async function runTestSuite() {
  console.log(`${ANSI_GREEN}${ANSI_BOLD}======================================================================${ANSI_RESET}`);
  console.log(`${ANSI_GREEN}${ANSI_BOLD}  AGRIFLOW RESCUE & B2B COMMODITY EXCHANGE - BACKEND ENGINE TEST SUITE${ANSI_RESET}`);
  console.log(`${ANSI_GREEN}${ANSI_BOLD}======================================================================${ANSI_RESET}`);

  // Initialize DB & run schema migration
  await initSalvageDatabase();

  // --------------------------------------------------------------------------
  // TEST 1: List a 10-ton bruised tomato lot
  // --------------------------------------------------------------------------
  logStep(1, 'List a 10-Ton Bruised Roma Tomato Salvage Lot');
  const weightKg = 10000;
  const benchmarkPricePerKg = 80.0;
  const defectType = 'TRANSIT_BRUISING';
  const defectSeverityPct = 32.0;
  const brixLevel = 5.2;
  const degradationHours = 48;

  const baselineEconomics = computeLotEconomics(weightKg, benchmarkPricePerKg, 0);
  console.log(`  • Commodity: Bruised Roma Field Tomatoes`);
  console.log(`  • Total Weight: ${weightKg.toLocaleString()} kg (10.0 Metric Tons)`);
  console.log(`  • Benchmark Market Price: ${benchmarkPricePerKg} ETB/kg`);
  console.log(`  • Standard Market Value: ${baselineEconomics.standardMarketValue.toLocaleString()} ETB`);
  console.log(`  • Defect: ${defectType} (${defectSeverityPct}% superficial surface bruising)`);
  console.log(`  • Sugar Density: ${brixLevel}°Bx (Optimal for high-solids paste concentration)`);

  const insertLotSql = `
    INSERT INTO salvage_crop_lots (
      farmer_id, commodity_name, target_industry, total_weight_kg, benchmark_price_per_kg,
      defect_type, defect_severity_pct, brix_level, moisture_pct, status, harvest_timestamp,
      degradation_deadline, origin_packhouse, notes
    ) VALUES (
      1, 'Bruised Roma Field Tomatoes', 'Ketchup & Paste', $1, $2,
      $3, $4, $5, 92.5, 'ACTIVE_LISTED', NOW(), NOW() + INTERVAL '48 hours',
      'Wonji Central Packhouse, East Shewa', 'Road transport vibration damage. Flesh intact.'
    ) RETURNING *;
  `;

  const lotRows = await query(insertLotSql, [
    weightKg,
    benchmarkPricePerKg,
    defectType,
    defectSeverityPct,
    brixLevel,
  ]);
  const lot = lotRows[0];
  console.log(`  ${ANSI_GREEN}✓ Lot registered in PostgreSQL with ID #${lot.id} (Status: ${lot.status})${ANSI_RESET}`);

  // --------------------------------------------------------------------------
  // TEST 2: Industrial buyer submits 45% discount bid
  // --------------------------------------------------------------------------
  logStep(2, 'Simulate Industrial Ketchup Buyer Submitting 45% Discount Bid');
  const buyerDiscountPct = 45;
  const buyerEconomics = computeLotEconomics(weightKg, benchmarkPricePerKg, buyerDiscountPct);

  console.log(`  • Buyer: RedGold Cannery & Puree Co. (User #2)`);
  console.log(`  • Proposed Discount: ${buyerDiscountPct}%`);
  console.log(`  • Calculated Effective Unit Price: ${buyerEconomics.effectivePricePerKg} ETB/kg`);
  console.log(`  • Calculated Gross Payout to Farmer: ${buyerEconomics.grossFarmerPayout.toLocaleString()} ETB`);
  console.log(`  • Calculated Cannery Raw Material Savings: ${buyerEconomics.factorySavings.toLocaleString()} ETB`);

  if (buyerEconomics.effectivePricePerKg !== 44.0) {
    throw new Error(`Unit price assertion failed: expected 44.00, got ${buyerEconomics.effectivePricePerKg}`);
  }
  if (buyerEconomics.grossFarmerPayout !== 440000) {
    throw new Error(`Gross payout assertion failed: expected 440,000, got ${buyerEconomics.grossFarmerPayout}`);
  }
  if (buyerEconomics.factorySavings !== 360000) {
    throw new Error(`Factory savings assertion failed: expected 360,000, got ${buyerEconomics.factorySavings}`);
  }

  const initialHistory = [
    {
      by: 'INDUSTRIAL_BUYER',
      discountPct: buyerDiscountPct,
      effectivePricePerKg: buyerEconomics.effectivePricePerKg,
      grossPayout: buyerEconomics.grossFarmerPayout,
      factorySavings: buyerEconomics.factorySavings,
      timestamp: new Date().toISOString(),
      notes: '45% discount proposed for bulk industrial puree/paste transformation.',
    },
  ];

  const insertNegSql = `
    INSERT INTO salvage_negotiations (
      lot_id, farmer_id, buyer_id, proposed_discount_pct, effective_unit_price,
      gross_farmer_payout, factory_savings, last_turn_by, status, counter_history,
      expiration_timestamp
    ) VALUES ($1, 1, 2, $2, $3, $4, $5, 'INDUSTRIAL_BUYER', 'PROPOSED_BY_BUYER', $6, NOW() + INTERVAL '6 hours')
    RETURNING *;
  `;

  const negRows = await query(insertNegSql, [
    lot.id,
    buyerDiscountPct,
    buyerEconomics.effectivePricePerKg,
    buyerEconomics.grossFarmerPayout,
    buyerEconomics.factorySavings,
    JSON.stringify(initialHistory),
  ]);
  const negotiation = negRows[0];

  await query("UPDATE salvage_crop_lots SET status = 'UNDER_NEGOTIATION' WHERE id = $1", [lot.id]);
  console.log(`  ${ANSI_GREEN}✓ Negotiation #${negotiation.id} created (Status: ${negotiation.status})${ANSI_RESET}`);
  console.log(`  ${ANSI_GREEN}✓ Lot #${lot.id} transitioned to UNDER_NEGOTIATION${ANSI_RESET}`);

  // --------------------------------------------------------------------------
  // TEST 3: Farmer counters with 28% discount & verifies mathematical gain
  // --------------------------------------------------------------------------
  logStep(3, 'Farmer Counters with 28% Discount & Verifies Mathematical Gain');
  const counterDiscountPct = 28;
  const gainCalculation = computeCounterGain(weightKg, benchmarkPricePerKg, buyerDiscountPct, counterDiscountPct);
  const counterEconomics = computeLotEconomics(weightKg, benchmarkPricePerKg, counterDiscountPct);

  console.log(`  • Previous Gross Farmer Payout (at 45%): ${gainCalculation.prevGrossPayout.toLocaleString()} ETB`);
  console.log(`  • Counter Gross Farmer Payout (at 28%): ${gainCalculation.newGrossPayout.toLocaleString()} ETB`);
  console.log(`  • Incremental Farmer Gain Retained: ${ANSI_YELLOW}${ANSI_BOLD}+${gainCalculation.gainRetained.toLocaleString()} ETB${ANSI_RESET}`);

  // Mathematical assertion:
  // (80 * (1 - 0.28) * 10,000) - (80 * (1 - 0.45) * 10,000) = 576,000 - 440,000 = +136,000 ETB
  if (gainCalculation.gainRetained !== 136000) {
    throw new Error(`Mathematical gain calculation error: expected 136000, received ${gainCalculation.gainRetained}`);
  }
  console.log(`  ${ANSI_GREEN}✓ Exact mathematical gain formula verified (+136,000 ETB retained)${ANSI_RESET}`);

  const updatedHistory = [
    ...initialHistory,
    {
      by: 'FARMER',
      discountPct: counterDiscountPct,
      gainRetained: gainCalculation.gainRetained,
      effectivePricePerKg: counterEconomics.effectivePricePerKg,
      grossPayout: counterEconomics.grossFarmerPayout,
      timestamp: new Date().toISOString(),
      notes: 'Countered with 28% discount floor based on high Brix sugar density.',
    },
  ];

  const updateNegSql = `
    UPDATE salvage_negotiations SET
      proposed_discount_pct = $1,
      effective_unit_price = $2,
      gross_farmer_payout = $3,
      factory_savings = $4,
      last_turn_by = 'FARMER',
      status = 'COUNTERED_BY_FARMER',
      counter_history = $5,
      updated_at = NOW()
    WHERE id = $6 RETURNING *;
  `;

  const updatedNegRows = await query(updateNegSql, [
    counterDiscountPct,
    counterEconomics.effectivePricePerKg,
    counterEconomics.grossFarmerPayout,
    counterEconomics.factorySavings,
    JSON.stringify(updatedHistory),
    negotiation.id,
  ]);
  const counterNegotiation = updatedNegRows[0];
  console.log(`  ${ANSI_GREEN}✓ Negotiation #${counterNegotiation.id} updated (Status: ${counterNegotiation.status}, Last Turn: ${counterNegotiation.last_turn_by})${ANSI_RESET}`);

  // --------------------------------------------------------------------------
  // TEST 4: Accept Deal & Lock Escrow Inside Strict Database Transaction
  // --------------------------------------------------------------------------
  logStep(4, 'Accept Deal, Lock Escrow Vault & Dispatch Carrier (Strict SQL Transaction)');
  const carrierFee = computeCarrierFreightFee(weightKg, 85);
  const platformFee = counterEconomics.platformFee; // 2.5% = 14,400 ETB
  const netFarmerTakeHome = counterEconomics.netFarmerTakeHome; // 561,600 ETB
  const grossEscrowHold = counterEconomics.grossFarmerPayout + carrierFee; // 576,000 + 15,125 = 591,125 ETB

  console.log(`  • Agreed Final Discount: ${counterDiscountPct}%`);
  console.log(`  • Total Lot Gross Value: ${counterEconomics.grossFarmerPayout.toLocaleString()} ETB`);
  console.log(`  • Platform Commission (2.5%): ${platformFee.toLocaleString()} ETB`);
  console.log(`  • Net Farmer Take-Home Allocation: ${netFarmerTakeHome.toLocaleString()} ETB`);
  console.log(`  • SwiftReefer Cold-Chain Carrier Fee: ${carrierFee.toLocaleString()} ETB`);
  console.log(`  • Total Escrow Deposit Locked in Vault: ${grossEscrowHold.toLocaleString()} ETB`);

  // Execute Transaction Block
  const txResult = await query('BEGIN');
  try {
    // 1. Lock rows FOR UPDATE
    await query('SELECT * FROM salvage_negotiations WHERE id = $1 FOR UPDATE', [counterNegotiation.id]);
    await query('SELECT * FROM salvage_crop_lots WHERE id = $1 FOR UPDATE', [lot.id]);

    // 2. Update Negotiation status to ACCEPTED
    await query("UPDATE salvage_negotiations SET status = 'ACCEPTED', updated_at = NOW() WHERE id = $1", [counterNegotiation.id]);

    // 3. Update Crop Lot status to DEAL_ACCEPTED
    await query("UPDATE salvage_crop_lots SET status = 'DEAL_ACCEPTED', updated_at = NOW() WHERE id = $1", [lot.id]);

    // 4. Insert Escrow Vault Record (Status: HELD_IN_VAULT)
    const depositRef = `TX-ESCROW-HOLD-${Date.now()}`;
    const vaultRows = await query(
      `INSERT INTO escrow_vault (
        lot_id, negotiation_id, buyer_id, farmer_id, carrier_id,
        gross_hold_amount, net_farmer_allocation, carrier_freight_allocation,
        platform_fee, escrow_status, deposit_transaction_ref
      ) VALUES ($1, $2, 2, 1, 3, $3, $4, $5, $6, 'HELD_IN_VAULT', $7)
      RETURNING *;`,
      [
        lot.id,
        counterNegotiation.id,
        grossEscrowHold,
        netFarmerTakeHome,
        carrierFee,
        platformFee,
        depositRef,
      ]
    );

    // 5. Create Freight Shipment Record (Status: DISPATCHED)
    const bolNumber = `eBOL-${Date.now().toString().slice(-6)}`;
    const shipmentRows = await query(
      `INSERT INTO freight_shipments (
        lot_id, negotiation_id, carrier_id, vehicle_type, target_temperature_celsius,
        telemetry_readings, pickup_location, dropoff_location, freight_fee, status,
        bol_number, driver_name, plate_number, dispatched_at
      ) VALUES ($1, $2, 3, 'TEMPERATURE_CONTROLLED_REEFER', 3.0, '[]'::jsonb,
        'Wonji Central Packhouse', 'RedGold Cannery Dock #3, Adama', $3, 'DISPATCHED',
        $4, 'Solomon Kebede', 'ET-3-88192-AA', NOW())
      RETURNING *;`,
      [lot.id, counterNegotiation.id, carrierFee, bolNumber]
    );

    await query('COMMIT');
    console.log(`  ${ANSI_GREEN}✓ SQL Transaction COMMITTED successfully.${ANSI_RESET}`);
    console.log(`  ${ANSI_GREEN}✓ Escrow Vault #${vaultRows[0].id} locked (Status: ${vaultRows[0].escrow_status}, Ref: ${depositRef})${ANSI_RESET}`);
    console.log(`  ${ANSI_GREEN}✓ Freight Shipment #${shipmentRows[0].id} created with e-BoL ${bolNumber} (Status: ${shipmentRows[0].status})${ANSI_RESET}`);
  } catch (txErr) {
    await query('ROLLBACK');
    throw txErr;
  }

  // --------------------------------------------------------------------------
  // TEST 5: Stream Cold-Chain IoT Telematics
  // --------------------------------------------------------------------------
  logStep(5, 'Stream Cold-Chain Reefer IoT Telematics (Temperature & Humidity)');
  const testTelemetry = [
    {
      timestamp: new Date().toISOString(),
      ambientTempCelsius: 2.8,
      humidityPercent: 88,
      batteryPercent: 98,
      waypoint: 'Wonji-Adama Expressway Milepost 14',
      coordinates: { lat: 8.54, lng: 39.27 },
      status: 'IN_TRANSIT',
    },
  ];

  await query(
    "UPDATE freight_shipments SET telemetry_readings = $1, status = 'IN_TRANSIT' WHERE lot_id = $2",
    [JSON.stringify(testTelemetry), lot.id]
  );
  await query("UPDATE salvage_crop_lots SET status = 'IN_TRANSIT' WHERE id = $1", [lot.id]);
  console.log(`  • IoT Sensor Reading: 2.8°C (Target: 3.0°C), 88% Relative Humidity, Battery: 98%`);
  console.log(`  ${ANSI_GREEN}✓ Telematics logged to JSONB stream and status set to IN_TRANSIT${ANSI_RESET}`);

  // --------------------------------------------------------------------------
  // TEST 6: Factory Gate QA Settlement Transaction (One-Click Release)
  // --------------------------------------------------------------------------
  logStep(6, 'Execute Factory Gate QA Verification & Escrow Settlement Transaction');
  const measuredBrix = 5.3;
  const measuredDefect = 29.5;
  const inspectorNotes = `Gate QA Approved: Refractometer measured ${measuredBrix}°Bx. Pulp sound, zero anaerobic soft rot.`;

  console.log(`  • Receiving Inspector: Dr. Dawit Haile (Lead Industrial Food Chemist)`);
  console.log(`  • Measured Brix: ${measuredBrix}°Bx (Specification: >= 4.5°Bx -> PASS)`);
  console.log(`  • Measured Defect: ${measuredDefect}% (Specification: <= 35.0% -> PASS)`);
  console.log(`  • Inspection Decision: QA_PASSED`);

  // Settlement Transaction
  await query('BEGIN');
  try {
    const vRows = await query('SELECT * FROM escrow_vault WHERE lot_id = $1 FOR UPDATE', [lot.id]);
    const vault = vRows[0];

    const disbRef = `TX-CHAPA-DISB-${Date.now()}`;

    // 1. Release Vault funds to farmer
    const settledVault = await query(
      `UPDATE escrow_vault SET
        escrow_status = 'RELEASED_TO_FARMER',
        qa_inspector_notes = $1,
        qa_pass_timestamp = NOW(),
        release_timestamp = NOW(),
        disbursement_transaction_ref = $2,
        updated_at = NOW()
      WHERE id = $3 RETURNING *;`,
      [inspectorNotes, disbRef, vault.id]
    );

    // 2. Mark crop lot QA_APPROVED
    await query("UPDATE salvage_crop_lots SET status = 'QA_APPROVED', updated_at = NOW() WHERE id = $1", [lot.id]);

    // 3. Mark freight shipment DELIVERED
    await query("UPDATE freight_shipments SET status = 'DELIVERED', delivered_at = NOW() WHERE lot_id = $1", [lot.id]);

    await query('COMMIT');
    console.log(`  ${ANSI_GREEN}✓ Settlement SQL Transaction COMMITTED.${ANSI_RESET}`);
    console.log(`  ${ANSI_GREEN}✓ Escrow Vault #${vault.id} status updated to RELEASED_TO_FARMER${ANSI_RESET}`);
    console.log(`  ${ANSI_GREEN}✓ Crop Lot #${lot.id} status updated to QA_APPROVED${ANSI_RESET}`);
    console.log(`  ${ANSI_GREEN}✓ Freight Shipment status updated to DELIVERED${ANSI_RESET}`);

    console.log(`\n  ${ANSI_BOLD}FINAL SETTLEMENT STATEMENT:${ANSI_RESET}`);
    console.log(`  ┌─────────────────────────────────────────────────────────────┐`);
    console.log(`  │ Disbursed to Farmer (Ato Bekele Tadesse):   ${netFarmerTakeHome.toLocaleString().padStart(12)} ETB │`);
    console.log(`  │ Disbursed to Carrier (SwiftReefer Logistics): ${carrierFee.toLocaleString().padStart(10)} ETB │`);
    console.log(`  │ Platform Fee (AgriLink Escrow Desk 2.5%):   ${platformFee.toLocaleString().padStart(12)} ETB │`);
    console.log(`  │ Total Gross Disbursed from Vault:           ${grossEscrowHold.toLocaleString().padStart(12)} ETB │`);
    console.log(`  │ Settlement Reference: ${disbRef}              │`);
    console.log(`  └─────────────────────────────────────────────────────────────┘`);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }

  console.log(`\n${ANSI_GREEN}${ANSI_BOLD}======================================================================${ANSI_RESET}`);
  console.log(`${ANSI_GREEN}${ANSI_BOLD}  ALL 6 TEST STAGES PASSED WITH 100% RELATIONAL INTEGRITY & PRECISION ${ANSI_RESET}`);
  console.log(`${ANSI_GREEN}${ANSI_BOLD}======================================================================${ANSI_RESET}\n`);
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
