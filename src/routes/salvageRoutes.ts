import { Router, Request, Response } from 'express';
import { query, transaction, initSalvageDatabase } from '../db/salvageDb.ts';
import {
  computeLotEconomics,
  computeCounterGain,
  computeCarrierFreightFee,
  evaluateIndustrialSuitability,
  computeDegradationDeadline,
  computeHoursRemaining,
} from '../lib/salvageCalculator.ts';

const router = Router();

// Ensure schema is ready before handling requests
router.use(async (_req, _res, next) => {
  try {
    await initSalvageDatabase();
    next();
  } catch (err) {
    console.error('[SalvageRouter] DB initialization error:', err);
    next(err);
  }
});

// ============================================================================
// 1. POST /api/salvage/lots - Create a new distressed crop listing
// ============================================================================
router.post('/lots', async (req: Request, res: Response) => {
  try {
    const {
      farmerId = 1,
      commodityName,
      targetIndustry = 'Ketchup & Paste',
      weightKg,
      benchmarkPrice,
      defectType,
      defectSeverityPct,
      brixLevel,
      moisturePct,
      degradationHours = 48,
      originPackhouse = 'Wonji Central Sorting Packhouse',
      imageUrl,
      notes,
    } = req.body;

    if (!commodityName || !weightKg || !benchmarkPrice || !defectType) {
      return res.status(400).json({
        error: 'Missing required lot fields: commodityName, weightKg, benchmarkPrice, defectType.',
      });
    }

    const validDefects = ['HAIL_IMPACT', 'SUNSCALD', 'TRANSIT_BRUISING', 'SKIN_SPLITTING', 'AESTHETIC_BLEMISH'];
    const safeDefectType = validDefects.includes(defectType) ? defectType : 'HAIL_IMPACT';

    const safeWeight = Number(weightKg);
    const safeBenchmark = Number(benchmarkPrice);
    const safeDefectPct = Number(defectSeverityPct) || 25;
    const safeBrix = Number(brixLevel) || 5.0;
    const safeMoisture = moisturePct ? Number(moisturePct) : null;
    const degradationDeadline = computeDegradationDeadline(Number(degradationHours));

    const insertSql = `
      INSERT INTO salvage_crop_lots (
        farmer_id, commodity_name, target_industry, total_weight_kg, benchmark_price_per_kg,
        defect_type, defect_severity_pct, brix_level, moisture_pct, status, harvest_timestamp,
        degradation_deadline, origin_packhouse, image_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE_LISTED', NOW(), $10, $11, $12, $13)
      RETURNING *;
    `;

    const rows = await query(insertSql, [
      Number(farmerId) || 1,
      commodityName,
      targetIndustry,
      safeWeight,
      safeBenchmark,
      safeDefectType,
      safeDefectPct,
      safeBrix,
      safeMoisture,
      degradationDeadline.toISOString(),
      originPackhouse,
      imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      notes || '',
    ]);

    const createdLot = rows[0];
    const economics = computeLotEconomics(safeWeight, safeBenchmark, 0);
    const suitability = evaluateIndustrialSuitability(commodityName, safeBrix, safeDefectPct);

    return res.status(201).json({
      success: true,
      lot: {
        ...createdLot,
        hoursRemaining: computeHoursRemaining(createdLot.degradation_deadline),
        economics,
        suitability,
      },
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/lots] Error:', err);
    return res.status(500).json({ error: 'Internal server error creating salvage lot', details: err?.message });
  }
});

// ============================================================================
// 2. GET /api/salvage/lots - Sourcing Feed with query filters
// ============================================================================
router.get('/lots', async (req: Request, res: Response) => {
  try {
    const { industry, minBrix, maxDefect, status } = req.query;

    let sql = `
      SELECT 
        l.*,
        u.full_name as farmer_name,
        u.organization_name as farmer_org,
        u.phone as farmer_phone,
        u.region as farmer_region
      FROM salvage_crop_lots l
      JOIN users u ON l.farmer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (industry) {
      params.push(`%${industry}%`);
      sql += ` AND l.target_industry ILIKE $${params.length}`;
    }
    if (minBrix) {
      params.push(Number(minBrix));
      sql += ` AND l.brix_level >= $${params.length}`;
    }
    if (maxDefect) {
      params.push(Number(maxDefect));
      sql += ` AND l.defect_severity_pct <= $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND l.status = $${params.length}`;
    }

    sql += ' ORDER BY l.id DESC';

    const lots = await query(sql, params);

    // Attach active negotiations, shipments, and escrow vaults
    const enrichedLots = await Promise.all(
      lots.map(async (lot) => {
        const [negotiations, shipments, vaults] = await Promise.all([
          query(
            `SELECT n.*, b.full_name as buyer_name, b.organization_name as buyer_org 
             FROM salvage_negotiations n
             JOIN users b ON n.buyer_id = b.id
             WHERE n.lot_id = $1 ORDER BY n.id DESC LIMIT 5`,
            [lot.id]
          ),
          query(
            `SELECT s.*, c.full_name as carrier_name, c.organization_name as carrier_org 
             FROM freight_shipments s
             JOIN users c ON s.carrier_id = c.id
             WHERE s.lot_id = $1 ORDER BY s.id DESC LIMIT 1`,
            [lot.id]
          ),
          query(
            `SELECT * FROM escrow_vault WHERE lot_id = $1 ORDER BY id DESC LIMIT 1`,
            [lot.id]
          ),
        ]);

        const hoursRemaining = computeHoursRemaining(lot.degradation_deadline);
        const suitability = evaluateIndustrialSuitability(
          lot.commodity_name,
          Number(lot.brix_level),
          Number(lot.defect_severity_pct)
        );

        return {
          ...lot,
          hoursRemaining,
          isExpired: hoursRemaining <= 0,
          industrialSuitability: suitability,
          negotiations: negotiations || [],
          activeNegotiation: negotiations[0] || null,
          shipment: shipments[0] || null,
          escrowVault: vaults[0] || null,
        };
      })
    );

    return res.json(enrichedLots);
  } catch (err: any) {
    console.error('[GET /api/salvage/lots] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve salvage lots', details: err?.message });
  }
});

// ============================================================================
// 3. POST /api/salvage/negotiate/bid - Buyer initiates offer
// ============================================================================
router.post('/negotiate/bid', async (req: Request, res: Response) => {
  try {
    const { lotId, buyerId = 2, proposedDiscountPercent = 45, intendedProduct, notes } = req.body;

    if (!lotId) {
      return res.status(400).json({ error: 'lotId is required to submit a negotiation bid.' });
    }

    const lotRows = await query('SELECT * FROM salvage_crop_lots WHERE id = $1', [Number(lotId)]);
    if (!lotRows.length) {
      return res.status(404).json({ error: `Salvage lot with ID ${lotId} not found.` });
    }
    const lot = lotRows[0];

    if (lot.status === 'DEAL_ACCEPTED' || lot.status === 'QA_APPROVED') {
      return res.status(400).json({ error: `Cannot bid on lot in status: ${lot.status}` });
    }

    const discountPct = Math.min(80, Math.max(5, Number(proposedDiscountPercent) || 45));
    const economics = computeLotEconomics(
      Number(lot.total_weight_kg),
      Number(lot.benchmark_price_per_kg),
      discountPct
    );

    const expirationTimestamp = new Date(Date.now() + 6 * 3600 * 1000); // 6 hour expiration window

    const counterHistory = [
      {
        by: 'INDUSTRIAL_BUYER',
        discountPct,
        effectivePricePerKg: economics.effectivePricePerKg,
        grossPayout: economics.grossFarmerPayout,
        factorySavings: economics.factorySavings,
        intendedProduct: intendedProduct || 'Industrial Food Processing',
        timestamp: new Date().toISOString(),
        notes: notes || `Initial offer with ${discountPct}% discount.`,
      },
    ];

    const insertNegSql = `
      INSERT INTO salvage_negotiations (
        lot_id, farmer_id, buyer_id, proposed_discount_pct, effective_unit_price,
        gross_farmer_payout, factory_savings, last_turn_by, status, counter_history,
        expiration_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'INDUSTRIAL_BUYER', 'PROPOSED_BY_BUYER', $8, $9)
      RETURNING *;
    `;

    const negRows = await query(insertNegSql, [
      lot.id,
      lot.farmer_id,
      Number(buyerId) || 2,
      discountPct,
      economics.effectivePricePerKg,
      economics.grossFarmerPayout,
      economics.factorySavings,
      JSON.stringify(counterHistory),
      expirationTimestamp.toISOString(),
    ]);

    // Transition lot status to UNDER_NEGOTIATION
    await query("UPDATE salvage_crop_lots SET status = 'UNDER_NEGOTIATION' WHERE id = $1", [lot.id]);

    return res.status(201).json({
      success: true,
      negotiation: negRows[0],
      economics,
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/negotiate/bid] Error:', err);
    return res.status(500).json({ error: 'Failed to create buyer offer', details: err?.message });
  }
});

// ============================================================================
// 4. POST /api/salvage/negotiate/counter - Farmer counters with lower discount
// ============================================================================
router.post('/negotiate/counter', async (req: Request, res: Response) => {
  try {
    const { negotiationId, counterDiscountPercent = 28, notes } = req.body;

    if (!negotiationId) {
      return res.status(400).json({ error: 'negotiationId is required to counter an offer.' });
    }

    const negRows = await query('SELECT * FROM salvage_negotiations WHERE id = $1', [Number(negotiationId)]);
    if (!negRows.length) {
      return res.status(404).json({ error: `Negotiation #${negotiationId} not found.` });
    }
    const neg = negRows[0];

    const lotRows = await query('SELECT * FROM salvage_crop_lots WHERE id = $1', [neg.lot_id]);
    const lot = lotRows[0];
    if (!lot) return res.status(404).json({ error: 'Associated crop lot not found.' });

    const prevDiscount = Number(neg.proposed_discount_pct);
    const newDiscount = Math.min(prevDiscount, Math.max(0, Number(counterDiscountPercent) || 28));

    const gainMetrics = computeCounterGain(
      Number(lot.total_weight_kg),
      Number(lot.benchmark_price_per_kg),
      prevDiscount,
      newDiscount
    );

    const newEcon = computeLotEconomics(
      Number(lot.total_weight_kg),
      Number(lot.benchmark_price_per_kg),
      newDiscount
    );

    let history: any[] = [];
    try {
      history = typeof neg.counter_history === 'string' ? JSON.parse(neg.counter_history) : (neg.counter_history || []);
    } catch {
      history = [];
    }

    const counterEntry = {
      by: 'FARMER',
      discountPct: newDiscount,
      gainRetained: gainMetrics.gainRetained,
      effectivePricePerKg: newEcon.effectivePricePerKg,
      grossPayout: newEcon.grossFarmerPayout,
      timestamp: new Date().toISOString(),
      notes: notes || `Farmer countered at ${newDiscount}% discount, retaining +${gainMetrics.gainRetained} ETB.`,
    };
    history.push(counterEntry);

    const updateSql = `
      UPDATE salvage_negotiations SET
        proposed_discount_pct = $1,
        effective_unit_price = $2,
        gross_farmer_payout = $3,
        factory_savings = $4,
        last_turn_by = 'FARMER',
        status = 'COUNTERED_BY_FARMER',
        counter_history = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;

    const updatedRows = await query(updateSql, [
      newDiscount,
      newEcon.effectivePricePerKg,
      newEcon.grossFarmerPayout,
      newEcon.factorySavings,
      JSON.stringify(history),
      neg.id,
    ]);

    return res.json({
      success: true,
      negotiation: updatedRows[0],
      gainMetrics,
      newEconomics: newEcon,
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/negotiate/counter] Error:', err);
    return res.status(500).json({ error: 'Failed to process counter-offer', details: err?.message });
  }
});

// ============================================================================
// 5. POST /api/salvage/negotiate/accept - Strict SQL Transaction
// ============================================================================
router.post('/negotiate/accept', async (req: Request, res: Response) => {
  try {
    const { negotiationId, carrierId = 3, agreedDiscount } = req.body;

    if (!negotiationId) {
      return res.status(400).json({ error: 'negotiationId is required to accept a deal.' });
    }

    // Execute within a strict SQL transaction block
    const result = await transaction(async (tx) => {
      // a. Lock negotiation row FOR UPDATE
      const negRows = await tx.query(
        'SELECT * FROM salvage_negotiations WHERE id = $1 FOR UPDATE',
        [Number(negotiationId)]
      );
      if (!negRows.length) {
        throw new Error(`Negotiation #${negotiationId} not found.`);
      }
      const neg = negRows[0];

      // Lock lot row FOR UPDATE
      const lotRows = await tx.query(
        'SELECT * FROM salvage_crop_lots WHERE id = $1 FOR UPDATE',
        [neg.lot_id]
      );
      if (!lotRows.length) {
        throw new Error(`Salvage lot #${neg.lot_id} not found.`);
      }
      const lot = lotRows[0];

      if (lot.status === 'DEAL_ACCEPTED' || lot.status === 'QA_APPROVED') {
        throw new Error(`Lot #${lot.id} has already been accepted or closed.`);
      }

      // b. Calculate economics based on final accepted discount
      const finalDiscount = agreedDiscount !== undefined ? Number(agreedDiscount) : Number(neg.proposed_discount_pct);
      const econ = computeLotEconomics(
        Number(lot.total_weight_kg),
        Number(lot.benchmark_price_per_kg),
        finalDiscount
      );
      const carrierFee = computeCarrierFreightFee(Number(lot.total_weight_kg));
      const grossHoldAmount = econ.grossFarmerPayout + carrierFee;

      // c. Update negotiation status to ACCEPTED
      const updatedNegRows = await tx.query(
        `UPDATE salvage_negotiations SET
          status = 'ACCEPTED',
          proposed_discount_pct = $1,
          effective_unit_price = $2,
          gross_farmer_payout = $3,
          factory_savings = $4,
          updated_at = NOW()
        WHERE id = $5 RETURNING *`,
        [finalDiscount, econ.effectivePricePerKg, econ.grossFarmerPayout, econ.factorySavings, neg.id]
      );

      // d. Update lot status to DEAL_ACCEPTED
      await tx.query(
        "UPDATE salvage_crop_lots SET status = 'DEAL_ACCEPTED', updated_at = NOW() WHERE id = $1",
        [lot.id]
      );

      // e. Insert Escrow Vault Record (Status: HELD_IN_VAULT)
      const depositRef = `TX-ESCROW-HOLD-${Date.now()}`;
      const vaultRows = await tx.query(
        `INSERT INTO escrow_vault (
          lot_id, negotiation_id, buyer_id, farmer_id, carrier_id,
          gross_hold_amount, net_farmer_allocation, carrier_freight_allocation,
          platform_fee, escrow_status, deposit_transaction_ref
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'HELD_IN_VAULT', $10)
        RETURNING *`,
        [
          lot.id,
          neg.id,
          neg.buyer_id,
          neg.farmer_id,
          Number(carrierId) || 3,
          grossHoldAmount,
          econ.netFarmerTakeHome,
          carrierFee,
          econ.platformFee,
          depositRef,
        ]
      );

      // f. Create Freight Shipment (Status: DISPATCHED)
      const bolNumber = `eBOL-${Math.floor(100000 + Math.random() * 900000)}`;
      const initialTelemetry = [
        {
          timestamp: new Date().toISOString(),
          waypoint: 'Origin Farm Packhouse',
          ambientTempCelsius: 2.8,
          humidityPercent: 88,
          batteryPercent: 99,
          coordinates: { lat: 8.52, lng: 39.29 },
          status: 'DISPATCHED',
        },
      ];

      const shipmentRows = await tx.query(
        `INSERT INTO freight_shipments (
          lot_id, negotiation_id, carrier_id, vehicle_type, target_temperature_celsius,
          telemetry_readings, pickup_location, dropoff_location, freight_fee, status,
          bol_number, driver_name, plate_number, dispatched_at
        ) VALUES ($1, $2, $3, 'TEMPERATURE_CONTROLLED_REEFER', 3.0, $4, $5, $6, $7, 'DISPATCHED', $8, 'Solomon Kebede', 'ET-3-88192-AA', NOW())
        RETURNING *`,
        [
          lot.id,
          neg.id,
          Number(carrierId) || 3,
          JSON.stringify(initialTelemetry),
          lot.origin_packhouse || 'Wonji Central Packhouse',
          'RedGold Cannery & Puree Co., Adama Agro-Park Dock #3',
          carrierFee,
          bolNumber,
        ]
      );

      return {
        negotiation: updatedNegRows[0],
        escrowVault: vaultRows[0],
        freightShipment: shipmentRows[0],
        economics: econ,
      };
    });

    return res.json({
      success: true,
      message: 'Negotiation accepted and escrow locked in vault under atomic transaction.',
      ...result,
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/negotiate/accept] Transaction Error:', err);
    return res.status(500).json({ error: 'Failed to accept deal transaction', details: err?.message });
  }
});

// ============================================================================
// 6. POST /api/salvage/negotiate/reject - Declines offer, reopens lot
// ============================================================================
router.post('/negotiate/reject', async (req: Request, res: Response) => {
  try {
    const { negotiationId, reason } = req.body;

    if (!negotiationId) {
      return res.status(400).json({ error: 'negotiationId is required.' });
    }

    const negRows = await query('SELECT * FROM salvage_negotiations WHERE id = $1', [Number(negotiationId)]);
    if (!negRows.length) {
      return res.status(404).json({ error: `Negotiation #${negotiationId} not found.` });
    }
    const neg = negRows[0];

    // Mark negotiation REJECTED
    await query("UPDATE salvage_negotiations SET status = 'REJECTED', updated_at = NOW() WHERE id = $1", [neg.id]);

    // Revert lot back to ACTIVE_LISTED so other industrial buyers can bid
    await query("UPDATE salvage_crop_lots SET status = 'ACTIVE_LISTED', updated_at = NOW() WHERE id = $1", [neg.lot_id]);

    return res.json({
      success: true,
      message: 'Offer declined. Crop lot status reverted to ACTIVE_LISTED for open bidding.',
      reason: reason || 'Terms not accepted.',
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/negotiate/reject] Error:', err);
    return res.status(500).json({ error: 'Failed to reject negotiation', details: err?.message });
  }
});

// ============================================================================
// 7. POST /api/salvage/logistics/telemetry - Receives simulated/live IoT readings
// ============================================================================
router.post('/logistics/telemetry', async (req: Request, res: Response) => {
  try {
    const {
      shipmentId,
      lotId,
      ambientTemperatureCelsius,
      relativeHumidityPercent,
      batteryPercent = 95,
      currentLocation = 'Expressway Transit Corridor',
      coordinates,
      status = 'IN_TRANSIT',
    } = req.body;

    const findSql = shipmentId
      ? 'SELECT * FROM freight_shipments WHERE id = $1'
      : 'SELECT * FROM freight_shipments WHERE lot_id = $1 ORDER BY id DESC LIMIT 1';
    const findParam = shipmentId ? Number(shipmentId) : Number(lotId);

    const shipRows = await query(findSql, [findParam]);
    if (!shipRows.length) {
      return res.status(404).json({ error: 'Freight shipment not found.' });
    }
    const shipment = shipRows[0];

    let telemetry: any[] = [];
    try {
      telemetry = typeof shipment.telemetry_readings === 'string'
        ? JSON.parse(shipment.telemetry_readings)
        : (shipment.telemetry_readings || []);
    } catch {
      telemetry = [];
    }

    const newReading = {
      timestamp: new Date().toISOString(),
      ambientTempCelsius: Number(ambientTemperatureCelsius) || shipment.target_temperature_celsius || 3.0,
      humidityPercent: Number(relativeHumidityPercent) || 88,
      batteryPercent: Number(batteryPercent) || 95,
      currentLocation,
      coordinates: coordinates || { lat: 8.60, lng: 39.15 },
      status,
    };

    telemetry.push(newReading);

    const updateSql = `
      UPDATE freight_shipments SET
        telemetry_readings = $1,
        status = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;

    const updatedShipments = await query(updateSql, [JSON.stringify(telemetry), status, shipment.id]);

    // Also sync lot status to IN_TRANSIT if applicable
    if (status === 'IN_TRANSIT') {
      await query("UPDATE salvage_crop_lots SET status = 'IN_TRANSIT' WHERE id = $1", [shipment.lot_id]);
    }

    return res.json({
      success: true,
      shipment: updatedShipments[0],
      latestReading: newReading,
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/logistics/telemetry] Error:', err);
    return res.status(500).json({ error: 'Failed to record logistics telemetry', details: err?.message });
  }
});

// ============================================================================
// 8. POST /api/salvage/escrow/release-qa - Factory Gate QA Settlement Transaction
// ============================================================================
router.post('/escrow/release-qa', async (req: Request, res: Response) => {
  try {
    const {
      lotId,
      vaultId,
      qaPassed = true,
      inspectorName = 'Dr. Dawit Haile (Lead Chemist)',
      measuredBrix,
      measuredDefectPct,
      inspectorNotes,
    } = req.body;

    if (!lotId && !vaultId) {
      return res.status(400).json({ error: 'lotId or vaultId is required for Gate QA settlement.' });
    }

    // Execute inside strict database transaction block
    const result = await transaction(async (tx) => {
      const vSql = vaultId
        ? 'SELECT * FROM escrow_vault WHERE id = $1 FOR UPDATE'
        : 'SELECT * FROM escrow_vault WHERE lot_id = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE';
      const vParam = vaultId ? Number(vaultId) : Number(lotId);

      const vaultRows = await tx.query(vSql, [vParam]);
      if (!vaultRows.length) {
        throw new Error('Associated escrow vault record not found.');
      }
      const vault = vaultRows[0];

      if (vault.escrow_status === 'RELEASED_TO_FARMER') {
        throw new Error('Escrow funds have already been released for this lot.');
      }

      if (qaPassed) {
        const disbRef = `TX-CHAPA-DISB-${Date.now()}`;
        const notes = inspectorNotes || `Gate QA passed: Brix ${measuredBrix || 'nominal'}°Bx, Defect ${measuredDefectPct || 'within tolerance'}%.`;

        // 1. Release Escrow Vault to Farmer
        const updatedVaultRows = await tx.query(
          `UPDATE escrow_vault SET
            escrow_status = 'RELEASED_TO_FARMER',
            qa_inspector_notes = $1,
            qa_pass_timestamp = NOW(),
            release_timestamp = NOW(),
            disbursement_transaction_ref = $2,
            updated_at = NOW()
          WHERE id = $3 RETURNING *`,
          [notes, disbRef, vault.id]
        );

        // 2. Update Crop Lot status to QA_APPROVED
        await tx.query(
          "UPDATE salvage_crop_lots SET status = 'QA_APPROVED', updated_at = NOW() WHERE id = $1",
          [vault.lot_id]
        );

        // 3. Update Freight Shipment to DELIVERED
        await tx.query(
          "UPDATE freight_shipments SET status = 'DELIVERED', delivered_at = NOW(), updated_at = NOW() WHERE lot_id = $1",
          [vault.lot_id]
        );

        const settlementStatement = {
          lotId: vault.lot_id,
          grossVaultAmount: Number(vault.gross_hold_amount),
          disbursedFarmerPayout: Number(vault.net_farmer_allocation),
          disbursedCarrierFreight: Number(vault.carrier_freight_allocation),
          retainedPlatformFee: Number(vault.platform_fee),
          disbursementTransactionRef: disbRef,
          inspector: inspectorName,
          inspectionTimestamp: new Date().toISOString(),
          qaStatus: 'PASSED',
        };

        return {
          qaPassed: true,
          settlementStatement,
          vault: updatedVaultRows[0],
        };
      } else {
        // QA Failed -> Dispute state
        const disputeNotes = inspectorNotes || 'Physical quality inspection failed. Defect density or rot exceeds processing threshold.';
        const updatedVaultRows = await tx.query(
          `UPDATE escrow_vault SET
            escrow_status = 'DISPUTED',
            qa_inspector_notes = $1,
            updated_at = NOW()
          WHERE id = $2 RETURNING *`,
          [disputeNotes, vault.id]
        );

        return {
          qaPassed: false,
          disputeLogged: true,
          vault: updatedVaultRows[0],
          arbitrationNotice: 'Funds held in vault. AgriLink Platform Compliance Arbiter notified for formal inspection review.',
        };
      }
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[POST /api/salvage/escrow/release-qa] Error:', err);
    return res.status(500).json({ error: 'Failed to process Gate QA release', details: err?.message });
  }
});

// ============================================================================
// 9. POST /api/salvage/reset - Clean & restore baseline Ethiopian lots
// ============================================================================
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    await query('DELETE FROM escrow_vault');
    await query('DELETE FROM freight_shipments');
    await query('DELETE FROM salvage_negotiations');
    await query('DELETE FROM salvage_crop_lots');

    global._salvageDbInitialized = false;
    await initSalvageDatabase();

    const lots = await query('SELECT * FROM salvage_crop_lots ORDER BY id ASC');
    return res.json({ success: true, message: 'Database reset to baseline state.', lotsCount: lots.length });
  } catch (err: any) {
    console.error('[POST /api/salvage/reset] Error:', err);
    return res.status(500).json({ error: 'Failed to reset database', details: err?.message });
  }
});

// ============================================================================
// 10. UI COMPATIBILITY ALIASES (Bridging SalvageExchange.tsx component)
// ============================================================================

// POST /api/salvage/lots/:id/bids
router.post('/lots/:id/bids', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { proposedDiscountPercent = 45, intendedProduct, notes } = req.body;
    const lotIdNum = parseInt(String(id).replace(/\D/g, ''), 10) || 1;

    // Check if lot exists or fallback to first lot
    let lotRows = await query('SELECT * FROM salvage_crop_lots WHERE id = $1', [lotIdNum]);
    if (!lotRows.length) {
      lotRows = await query('SELECT * FROM salvage_crop_lots ORDER BY id ASC LIMIT 1');
    }
    if (!lotRows.length) return res.status(404).json({ error: 'No salvage lots found' });

    const lot = lotRows[0];
    const discount = Number(proposedDiscountPercent) || 45;
    const econ = computeLotEconomics(Number(lot.total_weight_kg), Number(lot.benchmark_price_per_kg), discount);

    const history = [
      {
        by: 'INDUSTRIAL_BUYER',
        discountPct: discount,
        effectivePricePerKg: econ.effectivePricePerKg,
        grossPayout: econ.grossFarmerPayout,
        factorySavings: econ.factorySavings,
        intendedProduct: intendedProduct || 'Industrial Canning / Puree',
        timestamp: new Date().toISOString(),
        notes: notes || '',
      },
    ];

    const negRows = await query(
      `INSERT INTO salvage_negotiations (
        lot_id, farmer_id, buyer_id, proposed_discount_pct, effective_unit_price,
        gross_farmer_payout, factory_savings, last_turn_by, status, counter_history,
        expiration_timestamp
      ) VALUES ($1, $2, 2, $3, $4, $5, $6, 'INDUSTRIAL_BUYER', 'PROPOSED_BY_BUYER', $7, NOW() + INTERVAL '6 hours')
      RETURNING *`,
      [lot.id, lot.farmer_id, discount, econ.effectivePricePerKg, econ.grossFarmerPayout, econ.factorySavings, JSON.stringify(history)]
    );

    await query("UPDATE salvage_crop_lots SET status = 'UNDER_NEGOTIATION' WHERE id = $1", [lot.id]);

    return res.json({ success: true, negotiation: negRows[0], economics: econ });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
});

// POST /api/salvage/lots/:id/negotiate
router.post('/lots/:id/negotiate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, counterDiscount, agreedDiscount, notes } = req.body;
    const lotIdNum = parseInt(String(id).replace(/\D/g, ''), 10) || 1;

    let lotRows = await query('SELECT * FROM salvage_crop_lots WHERE id = $1', [lotIdNum]);
    if (!lotRows.length) lotRows = await query('SELECT * FROM salvage_crop_lots ORDER BY id ASC LIMIT 1');
    if (!lotRows.length) return res.status(404).json({ error: 'Lot not found' });
    const lot = lotRows[0];

    // Find latest negotiation
    const negRows = await query('SELECT * FROM salvage_negotiations WHERE lot_id = $1 ORDER BY id DESC LIMIT 1', [lot.id]);
    const negId = negRows.length ? negRows[0].id : null;

    if (action === 'ACCEPT') {
      if (!negId) {
        // Create an accepted negotiation directly
        const discount = Number(agreedDiscount) || 45;
        const econ = computeLotEconomics(Number(lot.total_weight_kg), Number(lot.benchmark_price_per_kg), discount);
        const createdNeg = await query(
          `INSERT INTO salvage_negotiations (
            lot_id, farmer_id, buyer_id, proposed_discount_pct, effective_unit_price,
            gross_farmer_payout, factory_savings, last_turn_by, status, expiration_timestamp
          ) VALUES ($1, $2, 2, $3, $4, $5, $6, 'INDUSTRIAL_BUYER', 'ACCEPTED', NOW() + INTERVAL '6 hours')
          RETURNING id`,
          [lot.id, lot.farmer_id, discount, econ.effectivePricePerKg, econ.grossFarmerPayout, econ.factorySavings]
        );
        req.body.negotiationId = createdNeg[0].id;
      } else {
        req.body.negotiationId = negId;
      }
      return (router as any).handle({ ...req, url: '/negotiate/accept', method: 'POST' }, res);
    }

    if (action === 'COUNTER') {
      if (!negId) return res.status(400).json({ error: 'No active negotiation to counter' });
      req.body.negotiationId = negId;
      req.body.counterDiscountPercent = counterDiscount;
      return (router as any).handle({ ...req, url: '/negotiate/counter', method: 'POST' }, res);
    }

    if (action === 'REJECT') {
      if (!negId) return res.status(400).json({ error: 'No active negotiation to reject' });
      req.body.negotiationId = negId;
      return (router as any).handle({ ...req, url: '/negotiate/reject', method: 'POST' }, res);
    }

    return res.json({ success: true, lot });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
});

// POST /api/salvage/lots/:id/gate-qa
router.post('/lots/:id/gate-qa', async (req: Request, res: Response) => {
  const { id } = req.params;
  const lotIdNum = parseInt(String(id).replace(/\D/g, ''), 10) || 1;
  req.body.lotId = lotIdNum;
  req.body.qaPassed = true;
  return (router as any).handle({ ...req, url: '/escrow/release-qa', method: 'POST' }, res);
});

export default router;
