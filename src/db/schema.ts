import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. USERS & ROLES
// ==========================================
export const USER_ROLES = [
  'FARMER',
  'BUYER',
  'BUSINESS_BUYER',
  'INPUT_SUPPLIER',
  'DRIVER',
  'LOGISTICS_ADMIN',
  'FINANCIAL_INSTITUTION',
  'HUB_OPERATOR',
  'PLATFORM_ADMIN',
] as const;

export type UserRole = typeof USER_ROLES[number];

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or generated system UID
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('FARMER'), // FARMER, BUYER, BUSINESS_BUYER, INPUT_SUPPLIER, DRIVER, LOGISTICS_ADMIN, FINANCIAL_INSTITUTION, HUB_OPERATOR, PLATFORM_ADMIN
  avatarUrl: text('avatar_url'),
  organizationName: text('organization_name'),
  region: text('region').default('Oromia'), // Addis Ababa, Oromia, Amhara, Sidama, SNNPR, Tigray, Somali, etc.
  zone: text('zone'),
  woreda: text('woreda'),
  nationalIdNumber: text('national_id_number'), // Fayda / Kebele National ID
  tinNumber: text('tin_number'), // Ethiopian Tax Identification Number
  address: text('address'),
  isVerified: boolean('is_verified').default(false),
  status: text('status').default('ACTIVE'), // ACTIVE, SUSPENDED, PENDING
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  uidIdx: index('users_uid_idx').on(table.uid),
}));

// ==========================================
// 2. FARMER PROFILES & FARMS
// ==========================================
export const farmerProfiles = pgTable('farmer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  farmName: text('farm_name').notNull(),
  region: text('region').notNull(),
  zone: text('zone'),
  woreda: text('woreda'),
  totalAreaHectares: doublePrecision('total_area_hectares').default(1.0),
  primaryCrops: text('primary_crops').array(),
  farmingExperienceYears: integer('farming_experience_years').default(3),
  nationalIdNumber: text('national_id_number'),
  cooperativeMembership: text('cooperative_membership'),
  bankAccountNumber: text('bank_account_number'),
  bankName: text('bank_name').default('Commercial Bank of Ethiopia'),
  bio: text('bio'),
  rating: doublePrecision('rating').default(5.0),
  completedOrdersCount: integer('completed_orders_count').default(0),
  totalProduceSoldTons: doublePrecision('total_produce_sold_tons').default(0),
  isCertifiedOrganic: boolean('is_certified_organic').default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const farms = pgTable('farms', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  locationName: text('location_name').notNull(),
  region: text('region').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  sizeHectares: doublePrecision('size_hectares').default(2.5),
  soilType: text('soil_type').default('Clay Loam'), // Clay Loam, Black Vertisol, Sandy Loam, Red Nitisol
  irrigationType: text('irrigation_type').default('Drip & Rainfed'), // Rainfed, Drip, Sprinkler, Canal/River
  certifications: text('certifications').array(), // GlobalG.A.P, Organic Ethiopia, Fair Trade
  documents: jsonb('documents').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const farmFields = pgTable('farm_fields', {
  id: serial('id').primaryKey(),
  farmId: integer('farm_id').references(() => farms.id).notNull(),
  fieldName: text('field_name').notNull(),
  areaHectares: doublePrecision('area_hectares').notNull(),
  currentCrop: text('current_crop').notNull(),
  variety: text('variety'),
  plantingDate: text('planting_date'),
  expectedHarvestDate: text('expected_harvest_date'),
  status: text('status').default('GROWING'), // PREPARING, GROWING, HARVEST_READY, HARVESTED, FALLOW
  healthScore: integer('health_score').default(95),
  soilMoisturePercent: integer('soil_moisture_percent').default(68),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 3. BUYER & BUSINESS PROFILES
// ==========================================
export const buyerProfiles = pgTable('buyer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  buyerType: text('buyer_type').notNull().default('INDIVIDUAL'), // INDIVIDUAL, SUPERMARKET, RESTAURANT, HOTEL, PROCESSOR, WHOLESALER, EXPORTER
  companyName: text('company_name'),
  tinNumber: text('tin_number'),
  vatRegistered: boolean('vat_registered').default(false),
  deliveryAddress: text('delivery_address'),
  preferredPaymentMethod: text('preferred_payment_method').default('CHAPA'),
  creditLimitEtb: doublePrecision('credit_limit_etb').default(0),
  preferredCategories: text('preferred_categories').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 4. PRODUCE CATEGORIES & PRODUCTS
// ==========================================
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  imageUrl: text('image_url'),
});

export const productSubcategories = pgTable('product_subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => productCategories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  productType: text('product_type').notNull().default('FRESH_FOOD'),
  icon: text('icon'),
  description: text('description'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  farmId: integer('farm_id').references(() => farms.id),
  categoryId: integer('category_id').references(() => productCategories.id).notNull(),
  subcategoryId: integer('subcategory_id').references(() => productSubcategories.id),
  name: text('name').notNull(),
  subcategory: text('subcategory'),
  productType: text('product_type').notNull().default('FRESH_FOOD'), // FRESH_FOOD, GRAIN, PULSE, FRUIT, VEGETABLE, ROOT_TUBER, OILSEED, COFFEE, SPICE, HERB, HONEY, DAIRY, EGG, POULTRY, MEAT, LIVESTOCK, PROCESSED_FOOD, OTHER
  variety: text('variety'),
  description: text('description').notNull(),
  grade: text('grade').notNull().default('GRADE_A'), // PREMIUM, GRADE_A, GRADE_B, STANDARD, GRADE_1_EXPORT, GRADE_1_LOCAL, etc.
  qualityGrade: text('quality_grade').default('GRADE_A'), // PREMIUM, GRADE_A, GRADE_B, STANDARD
  pricePerUnitEtb: doublePrecision('price_per_unit_etb').notNull(),
  currency: text('currency').default('ETB'),
  unit: text('unit').notNull().default('KG'), // kg, gram, quintal, ton, liter, milliliter, piece, dozen, crate, bag, box, bundle, basket, animal
  availableQuantity: doublePrecision('available_quantity').notNull().default(100),
  minOrderQuantity: doublePrecision('min_order_quantity').notNull().default(10),
  maxOrderQuantity: doublePrecision('max_order_quantity'),
  harvestDate: text('harvest_date').notNull(),
  productionDate: text('production_date'),
  expirationDate: text('expiration_date'),
  freshnessStatus: text('freshness_status').default('AVAILABLE_NOW'), // HARVESTED_TODAY, HARVESTED_RECENTLY, AVAILABLE_NOW
  expectedAvailability: text('expected_availability').default('Immediate'),
  farmLocation: text('farm_location').notNull(),
  region: text('region').notNull(),
  zone: text('zone'),
  woreda: text('woreda'),
  townCity: text('town_city'),
  altitudeMeters: integer('altitude_meters'),
  originDetails: text('origin_details'),
  processingMethod: text('processing_method'), // Washed, Natural, Sun-dried, Roasted, Stone-Milled, Cold-Pressed, etc.
  harvestYear: integer('harvest_year').default(2026),
  storageRequirements: text('storage_requirements'),
  packagingType: text('packaging_type'),
  ingredients: text('ingredients'),
  isLiveAnimal: boolean('is_live_animal').default(false),
  animalBreed: text('animal_breed'),
  veterinaryCertificate: text('veterinary_certificate'),
  images: text('images').array(),
  lotBatchNumber: text('lot_batch_number').notNull(),
  qualityScore: integer('quality_score').default(96),
  certifications: text('certifications').array(),
  isOrganic: boolean('is_organic').default(false),
  isVerifiedFarmer: boolean('is_verified_farmer').default(true),
  deliveryAvailability: text('delivery_availability').default('ALL_ETHIOPIA'), // ALL_ETHIOPIA, REGIONAL_HUB_ONLY, LOCAL_PICKUP_ONLY
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PAUSED, OUT_OF_STOCK, PENDING_APPROVAL
  shelfLifeDays: integer('shelf_life_days').default(14),
  attributes: jsonb('attributes').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  farmerIdx: index('products_farmer_idx').on(table.farmerId),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  subcatIdx: index('products_subcat_idx').on(table.subcategoryId),
  productTypeIdx: index('products_type_idx').on(table.productType),
  gradeIdx: index('products_grade_idx').on(table.grade),
  statusIdx: index('products_status_idx').on(table.status),
  lotIdx: index('products_lot_idx').on(table.lotBatchNumber),
}));

// ==========================================
// 5. AGRICULTURAL INPUT SUPPLIERS & PRODUCTS
// ==========================================
export const inputSuppliers = pgTable('input_suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  companyName: text('company_name').notNull(),
  registrationNumber: text('registration_number'),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email'),
  warehouseLocation: text('warehouse_location').notNull(),
  region: text('region').notNull(),
  isVerified: boolean('is_verified').default(true),
  rating: doublePrecision('rating').default(4.9),
  totalProductsCount: integer('total_products_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inputCategories = pgTable('input_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
});

export const inputProducts = pgTable('input_products', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => inputSuppliers.id).notNull(),
  categoryId: integer('category_id').references(() => inputCategories.id).notNull(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  description: text('description').notNull(),
  priceEtb: doublePrecision('price_etb').notNull(),
  unit: text('unit').notNull().default('BAG'), // BAG, LITER, PACK, KG, UNIT, SET
  stockQuantity: integer('stock_quantity').notNull().default(50),
  minOrderQuantity: integer('min_order_quantity').default(1),
  specifications: text('specifications'),
  applicationGuide: text('application_guide'),
  images: text('images').array(),
  isCertified: boolean('is_certified').default(true),
  status: text('status').default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 6. CARTS & CART ITEMS
// ==========================================
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').references(() => carts.id).notNull(),
  itemType: text('item_type').notNull().default('PRODUCE'), // PRODUCE, INPUT
  productId: integer('product_id').references(() => products.id),
  inputProductId: integer('input_product_id').references(() => inputProducts.id),
  quantity: doublePrecision('quantity').notNull(),
  unitPriceEtb: doublePrecision('unit_price_etb').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 7. HUBS & LOGISTICS
// ==========================================
export const hubs = pgTable('hubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  region: text('region').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  capacityTons: doublePrecision('capacity_tons').default(500),
  currentStorageTons: doublePrecision('current_storage_tons').default(120),
  managerName: text('manager_name'),
  contactPhone: text('contact_phone'),
  coldStorageAvailable: boolean('cold_storage_available').default(true),
  status: text('status').default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  licenseNumber: text('license_number').notNull(),
  vehicleType: text('vehicle_type').notNull(), // ISUZU_NPR_TRUCK, REFRIGERATED_VAN, FLATBED_TRAILER, PICKUP_4X4, MOTORCYCLE
  vehiclePlateNumber: text('vehicle_plate_number').notNull(),
  capacityTons: doublePrecision('capacity_tons').notNull().default(3.5),
  hasRefrigeration: boolean('has_refrigeration').default(false),
  region: text('region').notNull(),
  currentStatus: text('current_status').default('AVAILABLE'), // AVAILABLE, ASSIGNED, EN_ROUTE, OFFLINE
  currentLat: doublePrecision('current_lat'),
  currentLng: doublePrecision('current_lng'),
  rating: doublePrecision('rating').default(4.9),
  totalDeliveries: integer('total_deliveries').default(0),
  isVerified: boolean('is_verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 8. ORDERS & ORDER ITEMS
// ==========================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  orderType: text('order_type').notNull().default('PRODUCE'), // PRODUCE, INPUT, BULK_COMMERCIAL
  totalAmountEtb: doublePrecision('total_amount_etb').notNull(),
  deliveryFeeEtb: doublePrecision('delivery_fee_etb').default(0),
  serviceFeeEtb: doublePrecision('service_fee_etb').default(0),
  grandTotalEtb: doublePrecision('grand_total_etb').notNull(),
  paymentStatus: text('payment_status').notNull().default('PENDING'), // PENDING, PROCESSING, PAID, FAILED, REFUNDED
  orderStatus: text('order_status').notNull().default('PAID'), // CART, CHECKOUT, PAYMENT_PENDING, PAID, CONFIRMED, PREPARING, READY_FOR_PICKUP, DRIVER_ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, DISPUTED
  deliveryModel: text('delivery_model').notNull().default('DIRECT'), // DIRECT, HUB_CROSS_DOCK
  hubId: integer('hub_id').references(() => hubs.id),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryRegion: text('delivery_region').notNull(),
  deliveryZone: text('delivery_zone'),
  deliveryWoreda: text('delivery_woreda'),
  nationalIdNumber: text('national_id_number'), // Fayda / Kebele National ID
  tinNumber: text('tin_number'),
  payerAccountNumber: text('payer_account_number'), // Telebirr / CBE / Chapa account reference
  deliveryContactName: text('delivery_contact_name').notNull(),
  deliveryContactPhone: text('delivery_contact_phone').notNull(),
  requestedDeliveryDate: text('requested_delivery_date'),
  actualDeliveryDate: text('actual_delivery_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  buyerIdx: index('orders_buyer_idx').on(table.buyerId),
  statusIdx: index('orders_status_idx').on(table.orderStatus),
  orderNumberIdx: index('orders_number_idx').on(table.orderNumber),
  hubIdx: index('orders_hub_idx').on(table.hubId),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  itemType: text('item_type').notNull().default('PRODUCE'),
  productId: integer('product_id').references(() => products.id),
  inputProductId: integer('input_product_id').references(() => inputProducts.id),
  sellerId: integer('seller_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  grade: text('grade'),
  unit: text('unit').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unitPriceEtb: doublePrecision('unit_price_etb').notNull(),
  subtotalEtb: doublePrecision('subtotal_etb').notNull(),
  lotBatchNumber: text('lot_batch_number'),
  status: text('status').default('CONFIRMED'),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  productIdx: index('order_items_product_idx').on(table.productId),
  sellerIdx: index('order_items_seller_idx').on(table.sellerId),
}));

export const orderStatusHistory = pgTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  actorId: integer('actor_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 9. PAYMENTS & TRANSACTIONS
// ==========================================
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amountEtb: doublePrecision('amount_etb').notNull(),
  currency: text('currency').default('ETB'),
  provider: text('provider').notNull().default('CHAPA'), // CHAPA, CBE_BIRR, TELEBIRR, BANK_TRANSFER, SYSTEM_GATEWAY
  transactionRef: text('transaction_ref').notNull().unique(),
  providerPaymentId: text('provider_payment_id'),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, PAID, FAILED, REFUNDED
  paymentMethod: text('payment_method').default('CARD_MOBILE_MONEY'),
  payerAccountNumber: text('payer_account_number'),
  paymentDetails: jsonb('payment_details').default({}),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  orderIdx: index('payments_order_idx').on(table.orderId),
  userIdx: index('payments_user_idx').on(table.userId),
  transRefIdx: index('payments_trans_ref_idx').on(table.transactionRef),
}));

// ==========================================
// 10. DELIVERIES & TRACKING
// ==========================================
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull().unique(),
  driverId: integer('driver_id').references(() => drivers.id),
  deliveryModel: text('delivery_model').notNull().default('DIRECT'), // DIRECT, HUB_CROSS_DOCK
  hubId: integer('hub_id').references(() => hubs.id),
  pickupLocation: text('pickup_location').notNull(),
  dropoffLocation: text('dropoff_location').notNull(),
  pickupLat: doublePrecision('pickup_lat'),
  pickupLng: doublePrecision('pickup_lng'),
  dropoffLat: doublePrecision('dropoff_lat'),
  dropoffLng: doublePrecision('dropoff_lng'),
  currentLat: doublePrecision('current_lat'),
  currentLng: doublePrecision('current_lng'),
  status: text('status').notNull().default('PENDING_ASSIGNMENT'), // PENDING_ASSIGNMENT, ASSIGNED, ARRIVED_PICKUP, PICKED_UP, IN_TRANSIT, ARRIVED_DROPOFF, DELIVERED, FAILED
  estimatedArrival: text('estimated_arrival'),
  actualDeliveredAt: timestamp('actual_delivered_at'),
  proofOfDeliveryUrl: text('proof_of_delivery_url'),
  proofNotes: text('proof_notes'),
  recipientSignature: text('recipient_signature'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const hubMovements = pgTable('hub_movements', {
  id: serial('id').primaryKey(),
  hubId: integer('hub_id').references(() => hubs.id).notNull(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  movementType: text('movement_type').notNull(), // INBOUND_RECEIVE, INSPECTION, SORTING, CROSS_DOCK, OUTBOUND_DISPATCH
  quantityUnits: doublePrecision('quantity_units').notNull(),
  notes: text('notes'),
  operatorId: integer('operator_id').references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ==========================================
// 11. QUALITY CONTROL & TRACEABILITY
// ==========================================
export const qualityInspections = pgTable('quality_inspections', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  orderId: integer('order_id').references(() => orders.id),
  batchNumber: text('batch_number').notNull(),
  inspectorId: integer('inspector_id').references(() => users.id),
  inspectorName: text('inspector_name').notNull(),
  inspectionDate: text('inspection_date').notNull(),
  gradeAssigned: text('grade_assigned').notNull(),
  moistureContentPercent: doublePrecision('moisture_content_percent'),
  defectRatePercent: doublePrecision('defect_rate_percent').default(1.2),
  appearanceScore: integer('appearance_score').default(95),
  status: text('status').notNull().default('PASSED'), // PENDING_INSPECTION, PASSED, FAILED, REQUIRES_REVIEW
  reportSummary: text('report_summary').notNull(),
  certificateUrl: text('certificate_url'),
  photos: text('photos').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 12. FARMER FINANCING
// ==========================================
export const financeApplications = pgTable('finance_applications', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  institutionId: integer('institution_id').references(() => users.id),
  loanType: text('loan_type').notNull(), // INPUT_FINANCING, WORKING_CAPITAL, EQUIPMENT_FINANCING, PRODUCTION_FINANCING
  amountRequestedEtb: doublePrecision('amount_requested_etb').notNull(),
  purpose: text('purpose').notNull(),
  farmId: integer('farm_id').references(() => farms.id),
  targetCrop: text('target_crop').notNull(),
  expectedYieldTons: doublePrecision('expected_yield_tons').notNull(),
  expectedRevenueEtb: doublePrecision('expected_revenue_etb').notNull(),
  repaymentPeriodMonths: integer('repayment_period_months').notNull().default(6),
  status: text('status').notNull().default('SUBMITTED'), // SUBMITTED, UNDER_REVIEW, MORE_INFORMATION_REQUIRED, APPROVED, REJECTED, DISBURSED, REPAID, DEFAULTED
  approvedAmountEtb: doublePrecision('approved_amount_etb'),
  interestRatePercent: doublePrecision('interest_rate_percent').default(9.5),
  reviewNotes: text('review_notes'),
  disbursedAt: timestamp('disbursed_at'),
  dueAt: timestamp('due_at'),
  documentUrls: text('document_urls').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// 13. BULK QUOTE REQUESTS
// ==========================================
export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  businessBuyerId: integer('business_buyer_id').references(() => users.id).notNull(),
  sellerId: integer('seller_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  requestedQuantity: doublePrecision('requested_quantity').notNull(),
  unit: text('unit').notNull().default('TON'),
  requestedGrade: text('requested_grade').default('GRADE_1_EXPORT'),
  targetPriceEtb: doublePrecision('target_price_etb'),
  deliveryDate: text('delivery_date').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, OFFERED, ACCEPTED, REJECTED, EXPIRED
  offerPriceEtb: doublePrecision('offer_price_etb'),
  offerNotes: text('offer_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 14. REVIEWS & RATINGS
// ==========================================
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  reviewerId: integer('reviewer_id').references(() => users.id).notNull(),
  targetType: text('target_type').notNull(), // PRODUCT, FARMER, DRIVER
  targetId: integer('target_id').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  comment: text('comment').notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 15. MESSAGES & NOTIFICATIONS
// ==========================================
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  senderId: integer('senderId').references(() => users.id).notNull(),
  recipientId: integer('recipient_id').references(() => users.id).notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('SYSTEM'), // ORDER, PAYMENT, DELIVERY, FINANCE, SYSTEM, CHAT
  linkUrl: text('link_url'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 16. AUDIT LOGS
// ==========================================
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ==========================================
// 17. SUPPORT TICKETS
// ==========================================
export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  category: text('category').notNull().default('ORDER_DISPUTE'),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  assignedAdminId: integer('assigned_admin_id').references(() => users.id),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// 18. PLATFORM SETTINGS
// ==========================================
export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  platformFeePercent: doublePrecision('platform_fee_percent').default(2.0),
  escrowHoldHours: integer('escrow_hold_hours').default(24),
  minOrderAmountEtb: doublePrecision('min_order_amount_etb').default(500.0),
  currency: text('currency').default('ETB'),
  maintenanceMode: boolean('maintenance_mode').default(false),
  supportPhone: text('support_phone').default('+251 91 100 2244'),
  supportEmail: text('support_email').default('support@agrilink.et'),
  taxRatePercent: doublePrecision('tax_rate_percent').default(0.0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// RELATIONS
// ==========================================
export const usersRelations = relations(users, ({ one, many }) => ({
  farmerProfile: one(farmerProfiles, {
    fields: [users.id],
    references: [farmerProfiles.userId],
  }),
  buyerProfile: one(buyerProfiles, {
    fields: [users.id],
    references: [buyerProfiles.userId],
  }),
  driverProfile: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  farms: many(farms),
  products: many(products),
  orders: many(orders),
  financeApplications: many(financeApplications),
  notifications: many(notifications),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  farmer: one(users, {
    fields: [farms.farmerId],
    references: [users.id],
  }),
  fields: many(farmFields),
  products: many(products),
}));

export const farmFieldsRelations = relations(farmFields, ({ one }) => ({
  farm: one(farms, {
    fields: [farmFields.farmId],
    references: [farms.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  subcategories: many(productSubcategories),
  products: many(products),
}));

export const productSubcategoriesRelations = relations(productSubcategories, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [productSubcategories.categoryId],
    references: [productCategories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  farmer: one(users, {
    fields: [products.farmerId],
    references: [users.id],
  }),
  farm: one(farms, {
    fields: [products.farmId],
    references: [farms.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  subcategory: one(productSubcategories, {
    fields: [products.subcategoryId],
    references: [productSubcategories.id],
  }),
  orderItems: many(orderItems),
  inspections: many(qualityInspections),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  hub: one(hubs, {
    fields: [orders.hubId],
    references: [hubs.id],
  }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  delivery: one(deliveries, {
    fields: [orders.id],
    references: [deliveries.orderId],
  }),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  inputProduct: one(inputProducts, {
    fields: [orderItems.inputProductId],
    references: [inputProducts.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}));
