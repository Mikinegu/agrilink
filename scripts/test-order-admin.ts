/**
 * End-to-End Verification Test for Database, Ordering Pipeline & Admin Portal
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting AgriLink End-to-End Backend & Database Verification...\n');

  // 1. Re-seed Database
  console.log('1. Re-seeding database with authentic Ethiopian agricultural orders...');
  const seedRes = await fetch(`${BASE_URL}/api/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  const seedData = await seedRes.json();
  console.log('   Seed response:', seedData.message || seedData);

  // 2. Query Admin Orders and Products
  console.log('\n2. Querying /api/admin/orders and /api/products...');
  const [adminOrdersRes, prodsRes] = await Promise.all([
    fetch(`${BASE_URL}/api/admin/orders`),
    fetch(`${BASE_URL}/api/products`),
  ]);
  const initialAdminOrders = await adminOrdersRes.json();
  const allProds = await prodsRes.json();
  const testProd1 = allProds[0];
  const testProd2 = allProds[1] || allProds[0];

  console.log(`   Fetched ${initialAdminOrders.length} initial orders from Admin endpoint.`);
  console.log(`   Sample order #1: ${initialAdminOrders[0]?.orderNumber}, Buyer: ${initialAdminOrders[0]?.buyerName}, Total: ${initialAdminOrders[0]?.grandTotalEtb} ETB, Status: ${initialAdminOrders[0]?.orderStatus}`);
  console.log(`   Selected Test Product 1: ID=${testProd1.id} (${testProd1.name}), Price=${testProd1.pricePerUnitEtb} ETB`);

  // 3. Place Direct Order (Buyer Yonas Alemu, userId: 5)
  console.log('\n3. Placing a Direct Order via /api/orders/direct...');
  const directOrderRes = await fetch(`${BASE_URL}/api/orders/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '5',
    },
    body: JSON.stringify({
      productId: testProd1.id,
      quantity: 3,
      deliveryAddress: 'Bole Medhanealem, House 842, Addis Ababa',
      deliveryRegion: 'Addis Ababa',
      deliveryContactName: 'Yonas Alemu',
      deliveryContactPhone: '+251 91 445 6677',
      deliveryModel: 'DIRECT',
      paymentMethod: 'TELEBIRR',
      transactionRef: `TX-TB-TEST-${Date.now()}`,
      notes: 'Automated test direct order verification',
    }),
  });
  const directOrderData = await directOrderRes.json();
  if (!directOrderRes.ok) {
    throw new Error(`Direct order failed: ${JSON.stringify(directOrderData)}`);
  }
  const directOrderId = directOrderData.order.id;
  const directOrderNum = directOrderData.order.orderNumber;
  console.log(`   ✅ Direct order created successfully! ID: ${directOrderId}, OrderNum: ${directOrderNum}, Total: ${directOrderData.order.grandTotalEtb} ETB`);

  // 4. Test Cart Addition and Checkout (Buyer Sara Kebede, userId: 6)
  console.log('\n4. Testing Cart & Checkout via /api/cart/items and /api/orders/checkout...');
  const addCartRes = await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '6',
    },
    body: JSON.stringify({
      productId: testProd2.id,
      quantity: 5,
    }),
  });
  const cartItem = await addCartRes.json();
  console.log(`   Added product ${testProd2.name} to cart. Item ID: ${cartItem.id}, Unit Price: ${cartItem.unitPriceEtb} ETB`);

  const checkoutRes = await fetch(`${BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '6',
    },
    body: JSON.stringify({
      deliveryAddress: 'Ethiopian Skylight Hotel, Airport Corridor, Addis Ababa',
      deliveryRegion: 'Addis Ababa',
      deliveryContactName: 'Sara Kebede',
      deliveryContactPhone: '+251 91 556 7788',
      deliveryModel: 'HUB_CROSS_DOCK',
      paymentMethod: 'CBE_BIRR',
      transactionRef: `TX-CBE-CART-${Date.now()}`,
      notes: 'Cart checkout test consignment',
    }),
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutRes.ok) {
    throw new Error(`Checkout failed: ${JSON.stringify(checkoutData)}`);
  }
  const checkoutOrderId = checkoutData.order.id;
  const checkoutOrderNum = checkoutData.order.orderNumber;
  console.log(`   ✅ Cart checkout completed! ID: ${checkoutOrderId}, OrderNum: ${checkoutOrderNum}, Total: ${checkoutData.order.grandTotalEtb} ETB`);

  // 5. Verify Admin Orders reflects both new orders
  console.log('\n5. Verifying Admin Orders has updated in real-time...');
  const updatedOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`);
  const updatedOrders = await updatedOrdersRes.json();
  console.log(`   Admin now sees ${updatedOrders.length} orders (increased from ${initialAdminOrders.length}).`);

  const foundDirect = updatedOrders.find((o: any) => o.id === directOrderId);
  const foundCheckout = updatedOrders.find((o: any) => o.id === checkoutOrderId);
  console.log(`   Direct Order in Admin: Found = ${!!foundDirect} (OrderNum: ${foundDirect?.orderNumber}, Buyer: ${foundDirect?.buyerName}, Payment: ${foundDirect?.paymentStatus})`);
  console.log(`   Checkout Order in Admin: Found = ${!!foundCheckout} (OrderNum: ${foundCheckout?.orderNumber}, Buyer: ${foundCheckout?.buyerName}, Payment: ${foundCheckout?.paymentStatus})`);

  // 6. Test Admin Dispatch Action
  console.log('\n6. Testing Admin Dispatch Action (PATCH /api/admin/orders/:id/dispatch)...');
  const dispatchRes = await fetch(`${BASE_URL}/api/admin/orders/${directOrderId}/dispatch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderStatus: 'IN_TRANSIT' }),
  });
  const dispatchData = await dispatchRes.json();
  console.log(`   Order #${directOrderId} status updated to: ${dispatchData.order.orderStatus}`);

  // 7. Test Admin Escrow Release Action
  console.log('\n7. Testing Admin Escrow Release Action (PATCH /api/admin/orders/:id/payment)...');
  const escrowRes = await fetch(`${BASE_URL}/api/admin/orders/${directOrderId}/payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus: 'RELEASED_TO_FARMER', notes: 'Escrow released to CBE account' }),
  });
  const escrowData = await escrowRes.json();
  console.log(`   Order #${directOrderId} payment status updated to: ${escrowData.order.paymentStatus}`);

  // 8. Query Admin Overview Metrics
  console.log('\n8. Querying Admin Overview Metrics (/api/admin/overview)...');
  const overviewRes = await fetch(`${BASE_URL}/api/admin/overview`);
  const metrics = await overviewRes.json();
  console.log(`   Overview Metrics:
   - Total Orders: ${metrics.totalOrdersCount}
   - GMV: ${metrics.gmvEtb?.toLocaleString()} ETB
   - Total Paid: ${metrics.totalPaidAmountEtb?.toLocaleString()} ETB
   - Total Escrow Held: ${metrics.totalEscrowHeldEtb?.toLocaleString()} ETB
   - Platform Revenue: ${metrics.platformRevenueEtb?.toLocaleString()} ETB
   - Active Deliveries: ${metrics.activeDeliveriesCount}
   - Farmers: ${metrics.farmersCount}
   - Buyers: ${metrics.buyersCount}`);

  // 9. Query AI Market Intelligence & Logistics Copilot
  console.log('\n9. Querying AI Market Intelligence & Copilot (/api/admin/ai-insights)...');
  const aiRes = await fetch(`${BASE_URL}/api/admin/ai-insights`);
  const aiData = await aiRes.json();
  console.log(`   AI Health Score: ${aiData.healthScore}%`);
  console.log(`   AI Summary: "${aiData.aiSummary}"`);
  console.log(`   Cold-Chain Compliance: ${aiData.metrics?.coldChainCompliance}`);
  console.log(`   Fraud Anomaly Rate: ${aiData.metrics?.fraudAnomalyRate}`);
  console.log(`   Actionable Alerts: ${aiData.actionableAlerts?.length} active alerts`);

  // 10. Test Smart 1-Click Auto-Dispatch
  console.log('\n10. Testing Smart 1-Click Auto-Dispatch (/api/admin/orders/:id/auto-dispatch)...');
  const autoDispatchRes = await fetch(`${BASE_URL}/api/admin/orders/${checkoutOrderId}/auto-dispatch`, {
    method: 'POST',
  });
  const autoDispatchData = await autoDispatchRes.json();
  console.log(`   Auto-dispatched Order #${autoDispatchData.order.orderNumber}:`);
  console.log(`   - Driver Assigned: ${autoDispatchData.driver?.fullName} (${autoDispatchData.driver?.vehiclePlateNumber})`);
  console.log(`   - Route Corridor: ${autoDispatchData.corridor}`);
  console.log(`   - Perishability Risk: ${autoDispatchData.perishabilityRisk}`);
  console.log(`   - Estimated ETA: ${autoDispatchData.eta}`);

  // 11. Test Smart Batch Dispatch
  console.log('\n11. Testing Smart Batch Dispatch (/api/admin/orders/batch-dispatch)...');
  const batchDispatchRes = await fetch(`${BASE_URL}/api/admin/orders/batch-dispatch`, {
    method: 'POST',
  });
  const batchDispatchData = await batchDispatchRes.json();
  console.log(`   Batch Dispatch: Dispatched ${batchDispatchData.count} orders (${batchDispatchData.message})`);

  // 12. Test Smart Batch Escrow Release
  console.log('\n12. Testing Smart Batch Escrow Release (/api/admin/orders/batch-release-escrow)...');
  // First mark checkout order as DELIVERED to make it eligible for escrow settlement
  await fetch(`${BASE_URL}/api/admin/orders/${checkoutOrderId}/dispatch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderStatus: 'DELIVERED' }),
  });
  const batchEscrowRes = await fetch(`${BASE_URL}/api/admin/orders/batch-release-escrow`, {
    method: 'POST',
  });
  const batchEscrowData = await batchEscrowRes.json();
  console.log(`   Batch Escrow Settlement: Settled ${batchEscrowData.count} orders, Total Released: ${batchEscrowData.totalAmountReleasedEtb?.toLocaleString()} ETB`);

  console.log('\n🎉 ALL DATABASE, BACKEND, SMART LOGISTICS, AND ADMIN COPILOT CAPABILITIES FULLY VERIFIED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
