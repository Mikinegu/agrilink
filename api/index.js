var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/db/index.ts
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  USER_ROLES: () => USER_ROLES,
  auditLogs: () => auditLogs,
  buyerProfiles: () => buyerProfiles,
  cartItems: () => cartItems,
  carts: () => carts,
  deliveries: () => deliveries,
  drivers: () => drivers,
  farmFields: () => farmFields,
  farmFieldsRelations: () => farmFieldsRelations,
  farmerProfiles: () => farmerProfiles,
  farms: () => farms,
  farmsRelations: () => farmsRelations,
  financeApplications: () => financeApplications,
  hubMovements: () => hubMovements,
  hubs: () => hubs,
  inputCategories: () => inputCategories,
  inputProducts: () => inputProducts,
  inputSuppliers: () => inputSuppliers,
  messages: () => messages,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusHistory: () => orderStatusHistory,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  payments: () => payments,
  platformSettings: () => platformSettings,
  productCategories: () => productCategories,
  productCategoriesRelations: () => productCategoriesRelations,
  productSubcategories: () => productSubcategories,
  productSubcategoriesRelations: () => productSubcategoriesRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  qualityInspections: () => qualityInspections,
  quoteRequests: () => quoteRequests,
  reviews: () => reviews,
  supportTickets: () => supportTickets,
  users: () => users,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var USER_ROLES = [
  "FARMER",
  "BUYER",
  "BUSINESS_BUYER",
  "INPUT_SUPPLIER",
  "DRIVER",
  "LOGISTICS_ADMIN",
  "FINANCIAL_INSTITUTION",
  "HUB_OPERATOR",
  "PLATFORM_ADMIN"
];
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  // Firebase Auth UID or generated system UID
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("FARMER"),
  // FARMER, BUYER, BUSINESS_BUYER, INPUT_SUPPLIER, DRIVER, LOGISTICS_ADMIN, FINANCIAL_INSTITUTION, HUB_OPERATOR, PLATFORM_ADMIN
  avatarUrl: text("avatar_url"),
  organizationName: text("organization_name"),
  region: text("region").default("Oromia"),
  // Addis Ababa, Oromia, Amhara, Sidama, SNNPR, Tigray, Somali, etc.
  zone: text("zone"),
  woreda: text("woreda"),
  nationalIdNumber: text("national_id_number"),
  // Fayda / Kebele National ID
  tinNumber: text("tin_number"),
  // Ethiopian Tax Identification Number
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  status: text("status").default("ACTIVE"),
  // ACTIVE, SUSPENDED, PENDING
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  uidIdx: index("users_uid_idx").on(table.uid)
}));
var farmerProfiles = pgTable("farmer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  farmName: text("farm_name").notNull(),
  region: text("region").notNull(),
  zone: text("zone"),
  woreda: text("woreda"),
  totalAreaHectares: doublePrecision("total_area_hectares").default(1),
  primaryCrops: text("primary_crops").array(),
  farmingExperienceYears: integer("farming_experience_years").default(3),
  nationalIdNumber: text("national_id_number"),
  cooperativeMembership: text("cooperative_membership"),
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name").default("Commercial Bank of Ethiopia"),
  bio: text("bio"),
  rating: doublePrecision("rating").default(5),
  completedOrdersCount: integer("completed_orders_count").default(0),
  totalProduceSoldTons: doublePrecision("total_produce_sold_tons").default(0),
  isCertifiedOrganic: boolean("is_certified_organic").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  locationName: text("location_name").notNull(),
  region: text("region").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  sizeHectares: doublePrecision("size_hectares").default(2.5),
  soilType: text("soil_type").default("Clay Loam"),
  // Clay Loam, Black Vertisol, Sandy Loam, Red Nitisol
  irrigationType: text("irrigation_type").default("Drip & Rainfed"),
  // Rainfed, Drip, Sprinkler, Canal/River
  certifications: text("certifications").array(),
  // GlobalG.A.P, Organic Ethiopia, Fair Trade
  documents: jsonb("documents").default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var farmFields = pgTable("farm_fields", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  fieldName: text("field_name").notNull(),
  areaHectares: doublePrecision("area_hectares").notNull(),
  currentCrop: text("current_crop").notNull(),
  variety: text("variety"),
  plantingDate: text("planting_date"),
  expectedHarvestDate: text("expected_harvest_date"),
  status: text("status").default("GROWING"),
  // PREPARING, GROWING, HARVEST_READY, HARVESTED, FALLOW
  healthScore: integer("health_score").default(95),
  soilMoisturePercent: integer("soil_moisture_percent").default(68),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var buyerProfiles = pgTable("buyer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  buyerType: text("buyer_type").notNull().default("INDIVIDUAL"),
  // INDIVIDUAL, SUPERMARKET, RESTAURANT, HOTEL, PROCESSOR, WHOLESALER, EXPORTER
  companyName: text("company_name"),
  tinNumber: text("tin_number"),
  vatRegistered: boolean("vat_registered").default(false),
  deliveryAddress: text("delivery_address"),
  preferredPaymentMethod: text("preferred_payment_method").default("CHAPA"),
  creditLimitEtb: doublePrecision("credit_limit_etb").default(0),
  preferredCategories: text("preferred_categories").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url")
});
var productSubcategories = pgTable("product_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  productType: text("product_type").notNull().default("FRESH_FOOD"),
  icon: text("icon"),
  description: text("description")
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").references(() => users.id).notNull(),
  farmId: integer("farm_id").references(() => farms.id),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  subcategoryId: integer("subcategory_id").references(() => productSubcategories.id),
  name: text("name").notNull(),
  subcategory: text("subcategory"),
  productType: text("product_type").notNull().default("FRESH_FOOD"),
  // FRESH_FOOD, GRAIN, PULSE, FRUIT, VEGETABLE, ROOT_TUBER, OILSEED, COFFEE, SPICE, HERB, HONEY, DAIRY, EGG, POULTRY, MEAT, LIVESTOCK, PROCESSED_FOOD, OTHER
  variety: text("variety"),
  description: text("description").notNull(),
  grade: text("grade").notNull().default("GRADE_A"),
  // PREMIUM, GRADE_A, GRADE_B, STANDARD, GRADE_1_EXPORT, GRADE_1_LOCAL, etc.
  qualityGrade: text("quality_grade").default("GRADE_A"),
  // PREMIUM, GRADE_A, GRADE_B, STANDARD
  pricePerUnitEtb: doublePrecision("price_per_unit_etb").notNull(),
  currency: text("currency").default("ETB"),
  unit: text("unit").notNull().default("KG"),
  // kg, gram, quintal, ton, liter, milliliter, piece, dozen, crate, bag, box, bundle, basket, animal
  availableQuantity: doublePrecision("available_quantity").notNull().default(100),
  minOrderQuantity: doublePrecision("min_order_quantity").notNull().default(10),
  maxOrderQuantity: doublePrecision("max_order_quantity"),
  harvestDate: text("harvest_date").notNull(),
  productionDate: text("production_date"),
  expirationDate: text("expiration_date"),
  freshnessStatus: text("freshness_status").default("AVAILABLE_NOW"),
  // HARVESTED_TODAY, HARVESTED_RECENTLY, AVAILABLE_NOW
  expectedAvailability: text("expected_availability").default("Immediate"),
  farmLocation: text("farm_location").notNull(),
  region: text("region").notNull(),
  zone: text("zone"),
  woreda: text("woreda"),
  townCity: text("town_city"),
  altitudeMeters: integer("altitude_meters"),
  originDetails: text("origin_details"),
  processingMethod: text("processing_method"),
  // Washed, Natural, Sun-dried, Roasted, Stone-Milled, Cold-Pressed, etc.
  harvestYear: integer("harvest_year").default(2026),
  storageRequirements: text("storage_requirements"),
  packagingType: text("packaging_type"),
  ingredients: text("ingredients"),
  isLiveAnimal: boolean("is_live_animal").default(false),
  animalBreed: text("animal_breed"),
  veterinaryCertificate: text("veterinary_certificate"),
  images: text("images").array(),
  lotBatchNumber: text("lot_batch_number").notNull(),
  qualityScore: integer("quality_score").default(96),
  certifications: text("certifications").array(),
  isOrganic: boolean("is_organic").default(false),
  isVerifiedFarmer: boolean("is_verified_farmer").default(true),
  deliveryAvailability: text("delivery_availability").default("ALL_ETHIOPIA"),
  // ALL_ETHIOPIA, REGIONAL_HUB_ONLY, LOCAL_PICKUP_ONLY
  status: text("status").notNull().default("ACTIVE"),
  // ACTIVE, PAUSED, OUT_OF_STOCK, PENDING_APPROVAL
  shelfLifeDays: integer("shelf_life_days").default(14),
  attributes: jsonb("attributes").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  farmerIdx: index("products_farmer_idx").on(table.farmerId),
  categoryIdx: index("products_category_idx").on(table.categoryId),
  subcatIdx: index("products_subcat_idx").on(table.subcategoryId),
  productTypeIdx: index("products_type_idx").on(table.productType),
  gradeIdx: index("products_grade_idx").on(table.grade),
  statusIdx: index("products_status_idx").on(table.status),
  lotIdx: index("products_lot_idx").on(table.lotBatchNumber)
}));
var inputSuppliers = pgTable("input_suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  companyName: text("company_name").notNull(),
  registrationNumber: text("registration_number"),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  warehouseLocation: text("warehouse_location").notNull(),
  region: text("region").notNull(),
  isVerified: boolean("is_verified").default(true),
  rating: doublePrecision("rating").default(4.9),
  totalProductsCount: integer("total_products_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var inputCategories = pgTable("input_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon")
});
var inputProducts = pgTable("input_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => inputSuppliers.id).notNull(),
  categoryId: integer("category_id").references(() => inputCategories.id).notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  priceEtb: doublePrecision("price_etb").notNull(),
  unit: text("unit").notNull().default("BAG"),
  // BAG, LITER, PACK, KG, UNIT, SET
  stockQuantity: integer("stock_quantity").notNull().default(50),
  minOrderQuantity: integer("min_order_quantity").default(1),
  specifications: text("specifications"),
  applicationGuide: text("application_guide"),
  images: text("images").array(),
  isCertified: boolean("is_certified").default(true),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow()
});
var carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(),
  itemType: text("item_type").notNull().default("PRODUCE"),
  // PRODUCE, INPUT
  productId: integer("product_id").references(() => products.id),
  inputProductId: integer("input_product_id").references(() => inputProducts.id),
  quantity: doublePrecision("quantity").notNull(),
  unitPriceEtb: doublePrecision("unit_price_etb").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var hubs = pgTable("hubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  region: text("region").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  capacityTons: doublePrecision("capacity_tons").default(500),
  currentStorageTons: doublePrecision("current_storage_tons").default(120),
  managerName: text("manager_name"),
  contactPhone: text("contact_phone"),
  coldStorageAvailable: boolean("cold_storage_available").default(true),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow()
});
var drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  // ISUZU_NPR_TRUCK, REFRIGERATED_VAN, FLATBED_TRAILER, PICKUP_4X4, MOTORCYCLE
  vehiclePlateNumber: text("vehicle_plate_number").notNull(),
  capacityTons: doublePrecision("capacity_tons").notNull().default(3.5),
  hasRefrigeration: boolean("has_refrigeration").default(false),
  region: text("region").notNull(),
  currentStatus: text("current_status").default("AVAILABLE"),
  // AVAILABLE, ASSIGNED, EN_ROUTE, OFFLINE
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  rating: doublePrecision("rating").default(4.9),
  totalDeliveries: integer("total_deliveries").default(0),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  orderType: text("order_type").notNull().default("PRODUCE"),
  // PRODUCE, INPUT, BULK_COMMERCIAL
  totalAmountEtb: doublePrecision("total_amount_etb").notNull(),
  deliveryFeeEtb: doublePrecision("delivery_fee_etb").default(0),
  serviceFeeEtb: doublePrecision("service_fee_etb").default(0),
  grandTotalEtb: doublePrecision("grand_total_etb").notNull(),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  // PENDING, PROCESSING, PAID, FAILED, REFUNDED
  orderStatus: text("order_status").notNull().default("PAID"),
  // CART, CHECKOUT, PAYMENT_PENDING, PAID, CONFIRMED, PREPARING, READY_FOR_PICKUP, DRIVER_ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, DISPUTED
  deliveryModel: text("delivery_model").notNull().default("DIRECT"),
  // DIRECT, HUB_CROSS_DOCK
  hubId: integer("hub_id").references(() => hubs.id),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryRegion: text("delivery_region").notNull(),
  deliveryZone: text("delivery_zone"),
  deliveryWoreda: text("delivery_woreda"),
  nationalIdNumber: text("national_id_number"),
  // Fayda / Kebele National ID
  tinNumber: text("tin_number"),
  payerAccountNumber: text("payer_account_number"),
  // Telebirr / CBE / Chapa account reference
  deliveryContactName: text("delivery_contact_name").notNull(),
  deliveryContactPhone: text("delivery_contact_phone").notNull(),
  requestedDeliveryDate: text("requested_delivery_date"),
  actualDeliveryDate: text("actual_delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  buyerIdx: index("orders_buyer_idx").on(table.buyerId),
  statusIdx: index("orders_status_idx").on(table.orderStatus),
  orderNumberIdx: index("orders_number_idx").on(table.orderNumber),
  hubIdx: index("orders_hub_idx").on(table.hubId)
}));
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  itemType: text("item_type").notNull().default("PRODUCE"),
  productId: integer("product_id").references(() => products.id),
  inputProductId: integer("input_product_id").references(() => inputProducts.id),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  grade: text("grade"),
  unit: text("unit").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitPriceEtb: doublePrecision("unit_price_etb").notNull(),
  subtotalEtb: doublePrecision("subtotal_etb").notNull(),
  lotBatchNumber: text("lot_batch_number"),
  status: text("status").default("CONFIRMED")
}, (table) => ({
  orderIdx: index("order_items_order_idx").on(table.orderId),
  productIdx: index("order_items_product_idx").on(table.productId),
  sellerIdx: index("order_items_seller_idx").on(table.sellerId)
}));
var orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  actorId: integer("actor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amountEtb: doublePrecision("amount_etb").notNull(),
  currency: text("currency").default("ETB"),
  provider: text("provider").notNull().default("CHAPA"),
  // CHAPA, CBE_BIRR, TELEBIRR, BANK_TRANSFER, SYSTEM_GATEWAY
  transactionRef: text("transaction_ref").notNull().unique(),
  providerPaymentId: text("provider_payment_id"),
  status: text("status").notNull().default("PENDING"),
  // PENDING, PROCESSING, PAID, FAILED, REFUNDED
  paymentMethod: text("payment_method").default("CARD_MOBILE_MONEY"),
  payerAccountNumber: text("payer_account_number"),
  paymentDetails: jsonb("payment_details").default({}),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  orderIdx: index("payments_order_idx").on(table.orderId),
  userIdx: index("payments_user_idx").on(table.userId),
  transRefIdx: index("payments_trans_ref_idx").on(table.transactionRef)
}));
var deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull().unique(),
  driverId: integer("driver_id").references(() => drivers.id),
  deliveryModel: text("delivery_model").notNull().default("DIRECT"),
  // DIRECT, HUB_CROSS_DOCK
  hubId: integer("hub_id").references(() => hubs.id),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupLat: doublePrecision("pickup_lat"),
  pickupLng: doublePrecision("pickup_lng"),
  dropoffLat: doublePrecision("dropoff_lat"),
  dropoffLng: doublePrecision("dropoff_lng"),
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  status: text("status").notNull().default("PENDING_ASSIGNMENT"),
  // PENDING_ASSIGNMENT, ASSIGNED, ARRIVED_PICKUP, PICKED_UP, IN_TRANSIT, ARRIVED_DROPOFF, DELIVERED, FAILED
  estimatedArrival: text("estimated_arrival"),
  actualDeliveredAt: timestamp("actual_delivered_at"),
  proofOfDeliveryUrl: text("proof_of_delivery_url"),
  proofNotes: text("proof_notes"),
  recipientSignature: text("recipient_signature"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var hubMovements = pgTable("hub_movements", {
  id: serial("id").primaryKey(),
  hubId: integer("hub_id").references(() => hubs.id).notNull(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  movementType: text("movement_type").notNull(),
  // INBOUND_RECEIVE, INSPECTION, SORTING, CROSS_DOCK, OUTBOUND_DISPATCH
  quantityUnits: doublePrecision("quantity_units").notNull(),
  notes: text("notes"),
  operatorId: integer("operator_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow()
});
var qualityInspections = pgTable("quality_inspections", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  orderId: integer("order_id").references(() => orders.id),
  batchNumber: text("batch_number").notNull(),
  inspectorId: integer("inspector_id").references(() => users.id),
  inspectorName: text("inspector_name").notNull(),
  inspectionDate: text("inspection_date").notNull(),
  gradeAssigned: text("grade_assigned").notNull(),
  moistureContentPercent: doublePrecision("moisture_content_percent"),
  defectRatePercent: doublePrecision("defect_rate_percent").default(1.2),
  appearanceScore: integer("appearance_score").default(95),
  status: text("status").notNull().default("PASSED"),
  // PENDING_INSPECTION, PASSED, FAILED, REQUIRES_REVIEW
  reportSummary: text("report_summary").notNull(),
  certificateUrl: text("certificate_url"),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var financeApplications = pgTable("finance_applications", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").references(() => users.id).notNull(),
  institutionId: integer("institution_id").references(() => users.id),
  loanType: text("loan_type").notNull(),
  // INPUT_FINANCING, WORKING_CAPITAL, EQUIPMENT_FINANCING, PRODUCTION_FINANCING
  amountRequestedEtb: doublePrecision("amount_requested_etb").notNull(),
  purpose: text("purpose").notNull(),
  farmId: integer("farm_id").references(() => farms.id),
  targetCrop: text("target_crop").notNull(),
  expectedYieldTons: doublePrecision("expected_yield_tons").notNull(),
  expectedRevenueEtb: doublePrecision("expected_revenue_etb").notNull(),
  repaymentPeriodMonths: integer("repayment_period_months").notNull().default(6),
  status: text("status").notNull().default("SUBMITTED"),
  // SUBMITTED, UNDER_REVIEW, MORE_INFORMATION_REQUIRED, APPROVED, REJECTED, DISBURSED, REPAID, DEFAULTED
  approvedAmountEtb: doublePrecision("approved_amount_etb"),
  interestRatePercent: doublePrecision("interest_rate_percent").default(9.5),
  reviewNotes: text("review_notes"),
  disbursedAt: timestamp("disbursed_at"),
  dueAt: timestamp("due_at"),
  documentUrls: text("document_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  businessBuyerId: integer("business_buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  requestedQuantity: doublePrecision("requested_quantity").notNull(),
  unit: text("unit").notNull().default("TON"),
  requestedGrade: text("requested_grade").default("GRADE_1_EXPORT"),
  targetPriceEtb: doublePrecision("target_price_etb"),
  deliveryDate: text("delivery_date").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  status: text("status").notNull().default("PENDING"),
  // PENDING, OFFERED, ACCEPTED, REJECTED, EXPIRED
  offerPriceEtb: doublePrecision("offer_price_etb"),
  offerNotes: text("offer_notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  targetType: text("target_type").notNull(),
  // PRODUCT, FARMER, DRIVER
  targetId: integer("target_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  senderId: integer("senderId").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("SYSTEM"),
  // ORDER, PAYMENT, DELIVERY, FINANCE, SYSTEM, CHAT
  linkUrl: text("link_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow()
});
var supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull().default("ORDER_DISPUTE"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("MEDIUM"),
  // LOW, MEDIUM, HIGH, URGENT
  status: text("status").notNull().default("OPEN"),
  // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  assignedAdminId: integer("assigned_admin_id").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  platformFeePercent: doublePrecision("platform_fee_percent").default(2),
  escrowHoldHours: integer("escrow_hold_hours").default(24),
  minOrderAmountEtb: doublePrecision("min_order_amount_etb").default(500),
  currency: text("currency").default("ETB"),
  maintenanceMode: boolean("maintenance_mode").default(false),
  supportPhone: text("support_phone").default("+251 91 100 2244"),
  supportEmail: text("support_email").default("support@agrilink.et"),
  taxRatePercent: doublePrecision("tax_rate_percent").default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  farmerProfile: one(farmerProfiles, {
    fields: [users.id],
    references: [farmerProfiles.userId]
  }),
  buyerProfile: one(buyerProfiles, {
    fields: [users.id],
    references: [buyerProfiles.userId]
  }),
  driverProfile: one(drivers, {
    fields: [users.id],
    references: [drivers.userId]
  }),
  farms: many(farms),
  products: many(products),
  orders: many(orders),
  financeApplications: many(financeApplications),
  notifications: many(notifications)
}));
var farmsRelations = relations(farms, ({ one, many }) => ({
  farmer: one(users, {
    fields: [farms.farmerId],
    references: [users.id]
  }),
  fields: many(farmFields),
  products: many(products)
}));
var farmFieldsRelations = relations(farmFields, ({ one }) => ({
  farm: one(farms, {
    fields: [farmFields.farmId],
    references: [farms.id]
  })
}));
var productCategoriesRelations = relations(productCategories, ({ many }) => ({
  subcategories: many(productSubcategories),
  products: many(products)
}));
var productSubcategoriesRelations = relations(productSubcategories, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [productSubcategories.categoryId],
    references: [productCategories.id]
  }),
  products: many(products)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  farmer: one(users, {
    fields: [products.farmerId],
    references: [users.id]
  }),
  farm: one(farms, {
    fields: [products.farmId],
    references: [farms.id]
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id]
  }),
  subcategory: one(productSubcategories, {
    fields: [products.subcategoryId],
    references: [productSubcategories.id]
  }),
  orderItems: many(orderItems),
  inspections: many(qualityInspections)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id]
  }),
  hub: one(hubs, {
    fields: [orders.hubId],
    references: [hubs.id]
  }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId]
  }),
  delivery: one(deliveries, {
    fields: [orders.id],
    references: [deliveries.orderId]
  }),
  statusHistory: many(orderStatusHistory)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  }),
  inputProduct: one(inputProducts, {
    fields: [orderItems.inputProductId],
    references: [inputProducts.id]
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id]
  })
}));

// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
var DEFAULT_SUPABASE_URL = "https://hkhlizasbjkdvbrcbakl.supabase.co";
var getSupabaseConfig = () => {
  const isBrowser = typeof window !== "undefined";
  const url = typeof process !== "undefined" && process.env?.SUPABASE_URL || typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL || typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let key = "";
  if (isBrowser) {
    key = typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY || typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY || "";
  } else {
    key = typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY || typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY || "";
  }
  return { url, key };
};
var isSupabaseConfigured = () => {
  const { key } = getSupabaseConfig();
  return Boolean(
    key && !key.includes("dummy_anon_key") && key !== "MY_SUPABASE_KEY" && key !== "your-anon-key" && key.length > 20
  );
};
var _supabaseClient = null;
var getSupabase = () => {
  if (!_supabaseClient) {
    const { url, key } = getSupabaseConfig();
    const safeKey = key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.dummy_anon_key_for_local_dev";
    const isBrowser = typeof window !== "undefined";
    _supabaseClient = createClient(url, safeKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
        storageKey: "agrilink_supabase_auth_token"
      }
    });
  }
  return _supabaseClient;
};
var supabase = getSupabase();
async function testSupabaseConnection() {
  try {
    const client = getSupabase();
    const { data, error } = await client.from("users").select("count", { count: "exact", head: true });
    if (error) {
      return {
        ok: true,
        message: `Connected to Supabase endpoint (${DEFAULT_SUPABASE_URL}). Table check: ${error.message}`,
        details: error
      };
    }
    return {
      ok: true,
      message: `Connected to Supabase successfully at ${DEFAULT_SUPABASE_URL}`,
      details: data
    };
  } catch (err) {
    return {
      ok: false,
      message: `Failed to connect to Supabase: ${err.message}`
    };
  }
}

// src/db/index.ts
var INIT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'FARMER',
  avatar_url TEXT,
  organization_name TEXT,
  region TEXT DEFAULT 'Oromia',
  zone TEXT,
  woreda TEXT,
  national_id_number TEXT,
  tin_number TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  region TEXT NOT NULL,
  zone TEXT,
  woreda TEXT,
  total_area_hectares DOUBLE PRECISION DEFAULT 1.0,
  primary_crops TEXT[],
  farming_experience_years INTEGER DEFAULT 3,
  national_id_number TEXT,
  cooperative_membership TEXT,
  bank_account_number TEXT,
  bank_name TEXT DEFAULT 'Commercial Bank of Ethiopia',
  bio TEXT,
  rating DOUBLE PRECISION DEFAULT 5.0,
  completed_orders_count INTEGER DEFAULT 0,
  total_produce_sold_tons DOUBLE PRECISION DEFAULT 0,
  is_certified_organic BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  size_hectares DOUBLE PRECISION DEFAULT 2.5,
  soil_type TEXT DEFAULT 'Clay Loam',
  irrigation_type TEXT DEFAULT 'Drip & Rainfed',
  certifications TEXT[],
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_fields (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  area_hectares DOUBLE PRECISION NOT NULL,
  current_crop TEXT NOT NULL,
  variety TEXT,
  planting_date TEXT,
  expected_harvest_date TEXT,
  status TEXT DEFAULT 'GROWING',
  health_score INTEGER DEFAULT 95,
  soil_moisture_percent INTEGER DEFAULT 68,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  buyer_type TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  company_name TEXT,
  tin_number TEXT,
  vat_registered BOOLEAN DEFAULT FALSE,
  delivery_address TEXT,
  preferred_payment_method TEXT DEFAULT 'CHAPA',
  credit_limit_etb DOUBLE PRECISION DEFAULT 0,
  preferred_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS product_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'FRESH_FOOD',
  icon TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  farm_id INTEGER,
  category_id INTEGER NOT NULL,
  subcategory_id INTEGER,
  name TEXT NOT NULL,
  subcategory TEXT,
  product_type TEXT NOT NULL DEFAULT 'FRESH_FOOD',
  variety TEXT,
  description TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'GRADE_A',
  quality_grade TEXT DEFAULT 'GRADE_A',
  price_per_unit_etb DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ETB',
  unit TEXT NOT NULL DEFAULT 'KG',
  available_quantity DOUBLE PRECISION NOT NULL DEFAULT 100,
  min_order_quantity DOUBLE PRECISION NOT NULL DEFAULT 10,
  max_order_quantity DOUBLE PRECISION,
  harvest_date TEXT NOT NULL,
  production_date TEXT,
  expiration_date TEXT,
  freshness_status TEXT DEFAULT 'AVAILABLE_NOW',
  expected_availability TEXT DEFAULT 'Immediate',
  farm_location TEXT NOT NULL,
  region TEXT NOT NULL,
  zone TEXT,
  woreda TEXT,
  town_city TEXT,
  altitude_meters INTEGER,
  origin_details TEXT,
  processing_method TEXT,
  harvest_year INTEGER DEFAULT 2026,
  storage_requirements TEXT,
  packaging_type TEXT,
  ingredients TEXT,
  is_live_animal BOOLEAN DEFAULT FALSE,
  animal_breed TEXT,
  veterinary_certificate TEXT,
  images TEXT[],
  lot_batch_number TEXT NOT NULL,
  quality_score INTEGER DEFAULT 96,
  certifications TEXT[],
  is_organic BOOLEAN DEFAULT FALSE,
  is_verified_farmer BOOLEAN DEFAULT TRUE,
  delivery_availability TEXT DEFAULT 'ALL_ETHIOPIA',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  shelf_life_days INTEGER DEFAULT 14,
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS input_suppliers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  warehouse_location TEXT NOT NULL,
  region TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  rating DOUBLE PRECISION DEFAULT 4.9,
  total_products_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS input_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS input_products (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  price_etb DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL DEFAULT 'BAG',
  stock_quantity INTEGER NOT NULL DEFAULT 50,
  min_order_quantity INTEGER DEFAULT 1,
  specifications TEXT,
  application_guide TEXT,
  images TEXT[],
  is_certified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER,
  input_product_id INTEGER,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity_tons DOUBLE PRECISION DEFAULT 500,
  current_storage_tons DOUBLE PRECISION DEFAULT 120,
  manager_name TEXT,
  contact_phone TEXT,
  cold_storage_available BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_plate_number TEXT NOT NULL,
  capacity_tons DOUBLE PRECISION NOT NULL DEFAULT 3.5,
  has_refrigeration BOOLEAN DEFAULT FALSE,
  region TEXT NOT NULL,
  current_status TEXT DEFAULT 'AVAILABLE',
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating DOUBLE PRECISION DEFAULT 4.9,
  total_deliveries INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id INTEGER NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'PRODUCE',
  total_amount_etb DOUBLE PRECISION NOT NULL,
  delivery_fee_etb DOUBLE PRECISION DEFAULT 0,
  service_fee_etb DOUBLE PRECISION DEFAULT 0,
  grand_total_etb DOUBLE PRECISION NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'PAID',
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER,
  delivery_address TEXT NOT NULL,
  delivery_region TEXT NOT NULL,
  delivery_zone TEXT,
  delivery_woreda TEXT,
  national_id_number TEXT,
  tin_number TEXT,
  payer_account_number TEXT,
  delivery_contact_name TEXT NOT NULL,
  delivery_contact_phone TEXT NOT NULL,
  requested_delivery_date TEXT,
  actual_delivery_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'PRODUCE',
  product_id INTEGER,
  input_product_id INTEGER,
  seller_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grade TEXT,
  unit TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_etb DOUBLE PRECISION NOT NULL,
  subtotal_etb DOUBLE PRECISION NOT NULL,
  lot_batch_number TEXT,
  status TEXT DEFAULT 'CONFIRMED'
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  actor_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount_etb DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ETB',
  provider TEXT NOT NULL DEFAULT 'CHAPA',
  transaction_ref TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'CARD_MOBILE_MONEY',
  payer_account_number TEXT,
  payment_details JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE,
  driver_id INTEGER,
  delivery_model TEXT NOT NULL DEFAULT 'DIRECT',
  hub_id INTEGER,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
  estimated_arrival TEXT,
  actual_delivered_at TIMESTAMPTZ,
  proof_of_delivery_url TEXT,
  proof_notes TEXT,
  recipient_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_movements (
  id SERIAL PRIMARY KEY,
  hub_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  quantity_units DOUBLE PRECISION NOT NULL,
  notes TEXT,
  operator_id INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,
  order_id INTEGER,
  batch_number TEXT NOT NULL DEFAULT 'BATCH-DEFAULT',
  inspector_id INTEGER,
  inspector_name TEXT NOT NULL DEFAULT 'QA Inspector',
  inspection_date TEXT NOT NULL DEFAULT '2026-01-01',
  grade_assigned TEXT NOT NULL DEFAULT 'GRADE_A',
  moisture_content_percent DOUBLE PRECISION,
  defect_rate_percent DOUBLE PRECISION DEFAULT 1.2,
  appearance_score INTEGER DEFAULT 95,
  status TEXT NOT NULL DEFAULT 'PASSED',
  report_summary TEXT NOT NULL DEFAULT 'Quality check passed',
  certificate_url TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_applications (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL,
  institution_id INTEGER,
  loan_type TEXT NOT NULL DEFAULT 'INPUT_FINANCING',
  amount_requested_etb DOUBLE PRECISION NOT NULL,
  purpose TEXT NOT NULL,
  farm_id INTEGER,
  target_crop TEXT NOT NULL DEFAULT 'General Crops',
  expected_yield_tons DOUBLE PRECISION NOT NULL DEFAULT 0,
  expected_revenue_etb DOUBLE PRECISION NOT NULL DEFAULT 0,
  repayment_period_months INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  approved_amount_etb DOUBLE PRECISION,
  interest_rate_percent DOUBLE PRECISION DEFAULT 9.5,
  review_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  document_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id SERIAL PRIMARY KEY,
  business_buyer_id INTEGER NOT NULL,
  seller_id INTEGER,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  requested_quantity DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL DEFAULT 'TON',
  requested_grade TEXT DEFAULT 'GRADE_1_EXPORT',
  target_price_etb DOUBLE PRECISION,
  delivery_date TEXT NOT NULL DEFAULT '2026-12-31',
  delivery_location TEXT NOT NULL DEFAULT 'Addis Ababa',
  status TEXT NOT NULL DEFAULT 'PENDING',
  offer_price_etb DOUBLE PRECISION,
  offer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  previous_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_surveys (
  id SERIAL PRIMARY KEY,
  survey_id TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  user_email TEXT,
  user_role TEXT DEFAULT 'GENERAL',
  satisfaction_rating TEXT NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  platform_fee_percent DOUBLE PRECISION DEFAULT 2.0,
  escrow_hold_hours INTEGER DEFAULT 24,
  min_order_amount_etb DOUBLE PRECISION DEFAULT 500.0,
  currency TEXT DEFAULT 'ETB',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  support_phone TEXT DEFAULT '0961123330',
  support_email TEXT DEFAULT 'support@agrilink.et',
  tax_rate_percent DOUBLE PRECISION DEFAULT 0.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;
var remoteUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
var getDb = () => {
  if (global._dbInstance) return global._dbInstance;
  if (remoteUrl) {
    try {
      const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15e3
      });
      global._dbInstance = drizzleNodePg(pool, { schema: schema_exports });
      return global._dbInstance;
    } catch (err) {
      console.warn("Postgres connection pool initialization notice:", err);
    }
  }
  try {
    if (!global._pgliteClient) {
      global._pgliteClient = new PGlite("memory://");
    }
    global._dbInstance = drizzlePglite(global._pgliteClient, { schema: schema_exports });
    return global._dbInstance;
  } catch (err) {
    console.warn("PGlite initialization skipped or unavailable in this environment:", err);
  }
  const createChain = () => {
    const chain = () => chain;
    chain.from = () => chain;
    chain.where = () => chain;
    chain.limit = () => chain;
    chain.offset = () => chain;
    chain.orderBy = () => chain;
    chain.values = () => chain;
    chain.set = () => chain;
    chain.returning = () => chain;
    chain.onConflictDoNothing = () => chain;
    chain.onConflictDoUpdate = () => chain;
    chain.execute = async () => [];
    chain.then = (resolve) => Promise.resolve([]).then(resolve);
    chain.catch = (reject) => Promise.resolve([]).catch(reject);
    return chain;
  };
  global._dbInstance = new Proxy({}, {
    get: (_target, prop) => {
      if (prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
        return () => createChain();
      }
      if (prop === "query") {
        return new Proxy({}, {
          get: () => ({
            findFirst: async () => null,
            findMany: async () => []
          })
        });
      }
      return () => createChain();
    }
  });
  return global._dbInstance;
};
var initDatabase = async () => {
  if (global._dbInitialized) return;
  global._dbInitialized = true;
  try {
    if (!remoteUrl && global._pgliteClient) {
      await global._pgliteClient.waitReady;
      await global._pgliteClient.exec(INIT_SCHEMA_SQL);
    }
  } catch (err) {
    console.warn("Database schema init skipped/failed:", err?.message);
  }
};
var db = getDb();

// server.ts
import { eq, desc, and, sql } from "drizzle-orm";

// src/db/seed.ts
async function seedDatabase(force = false) {
  try {
    await initDatabase();
    const existingCats = await db.select().from(productCategories).limit(1);
    if (existingCats.length > 0 && !force) {
      console.log("Database already has seeded data. Skipping initial seeding.");
      return;
    }
    console.log("Seeding AgriLink PostgreSQL database with authentic agricultural marketplace data...");
    if (force || existingCats.length > 0) {
      await db.delete(auditLogs);
      await db.delete(messages);
      await db.delete(notifications);
      await db.delete(reviews);
      await db.delete(quoteRequests);
      await db.delete(financeApplications);
      await db.delete(qualityInspections);
      await db.delete(deliveries);
      await db.delete(hubMovements);
      await db.delete(payments);
      await db.delete(orderStatusHistory);
      await db.delete(orderItems);
      await db.delete(orders);
      await db.delete(cartItems);
      await db.delete(carts);
      await db.delete(inputProducts);
      await db.delete(products);
      await db.delete(productSubcategories);
      await db.delete(farmFields);
      await db.delete(farms);
      await db.delete(drivers);
      await db.delete(inputSuppliers);
      await db.delete(buyerProfiles);
      await db.delete(farmerProfiles);
      await db.delete(users);
      await db.delete(hubs);
      await db.delete(inputCategories);
      await db.delete(productCategories);
    }
    const categoriesData = await db.insert(productCategories).values([
      {
        name: "Grains & Cereals",
        slug: "grains-cereals",
        description: "Super-white Teff, Sergegna, Red Teff, Durum Milling Wheat, Highland Barley, White & Yellow Maize, Sorghum, Millet, and Highland Oats.",
        icon: "Wheat",
        imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Pulses & Legumes",
        slug: "pulses-legumes",
        description: "Kabuli Chickpeas, Export Red Lentils, Faba Beans, White Haricot Beans, Red Kidney Beans, Green Split Peas, Grass Peas, and Soybeans.",
        icon: "Boxes",
        imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Roots & Tubers",
        slug: "roots-tubers",
        description: "Shashemene Highland Potatoes, Chencha Organic White Garlic, Sweet Potatoes, Enset / Kocho, Highland Ginger, Cassava, and Taro (Godere).",
        icon: "Carrot",
        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Fresh Vegetables",
        slug: "vegetables",
        description: "Greenhouse Roma & Slicing Tomatoes, Bombay Red Onions, Mareko Fana Chili, Ethiopian Kale (Gomen), Crisp Cabbage, Carrots, Green Beans, and Peppers.",
        icon: "Salad",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Fresh Fruits",
        slug: "fruits",
        description: "Export-grade Hass Avocados, Rift Valley Sweet Papayas, Arba Minch Cavendish Bananas, Guji Mangoes, Highland Strawberries, Citrus, and Pineapples.",
        icon: "Apple",
        imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Specialty Coffee",
        slug: "coffee",
        description: "Yirgacheffe Washed Grade 1, Sidama Natural Sun-Dried, Guji Specialty Q-Grade, Harar Longberry, Limu, and Roasted Whole Bean & Ground Coffees.",
        icon: "Coffee",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Oilseeds",
        slug: "oilseeds",
        description: "Humera White Sesame Seeds, Wollega Sesame, Niger Seed (Noug), Linseed (Flaxseed), Sunflower Seeds, Safflower, and Rapeseed.",
        icon: "Sun",
        imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Spices & Herbs",
        slug: "spices-herbs",
        description: "Fresh & Sun-Dried Mareko Berbere Chili, Korarima Cardamom, Ginger Root, Turmeric, Black Cumin (Tikur Azmud), Fenugreek (Abish), and Fresh Rosemary.",
        icon: "Sparkles",
        imageUrl: "https://images.unsplash.com/photo-1588879460618-924b172a6b29?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Honey & Bee Products",
        slug: "honey",
        description: "Tigray White Honey, Guji Forest Raw Honey, Highland Amber Honey, Natural Honeycomb, Organic Beeswax, Propolis, and Bee Pollen.",
        icon: "Hexagon",
        imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Dairy Products",
        slug: "dairy",
        description: "Highland Fresh Raw Milk, Pasteurized Bottled Milk, Ethiopian Spiced Butter (Niter Kibbeh), Traditional Raw Butter, Cottage Cheese (Ayib), and Yogurt.",
        icon: "Milk",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Eggs & Poultry",
        slug: "eggs-poultry",
        description: "Highland Free-Range Brown Eggs, Commercial Table Eggs, Live Local Sasso Chickens, Broiler Poultry, and Day-old Chicks.",
        icon: "Egg",
        imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Meat & Livestock",
        slug: "meat-livestock",
        description: "Fresh Chilled Highland Beef, Goat Meat, Mutton, Camel Meat, and Live Breeding Livestock (Boran Cattle, Bonga Sheep, Somali Camels).",
        icon: "Beef",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Farm-Processed Food",
        slug: "farm-processed",
        description: "Stone-Milled 100% White Teff Flour, Shiro Milled Legume Blend, Roasted Barley (Kolo), Roasted Flaxseed Snack, Spiced Chili Blends, and Dried Mango.",
        icon: "Package",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
      }
    ]).returning();
    const catMap = new Map(categoriesData.map((c) => [c.slug, c.id]));
    await db.insert(productSubcategories).values([
      // Grains
      { categoryId: catMap.get("grains-cereals"), name: "White Teff (Magna)", slug: "white-teff", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Red Teff", slug: "red-teff", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Mixed Teff (Sergegna)", slug: "mixed-teff", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Durum Wheat", slug: "wheat", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Barley", slug: "barley", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "White Maize / Corn", slug: "white-maize", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Yellow Maize", slug: "yellow-maize", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Sorghum", slug: "sorghum", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Millet", slug: "millet", productType: "GRAIN" },
      { categoryId: catMap.get("grains-cereals"), name: "Highland Oats", slug: "oats", productType: "GRAIN" },
      // Pulses
      { categoryId: catMap.get("pulses-legumes"), name: "Chickpeas (Kabuli & Desi)", slug: "chickpeas", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "Red Split Lentils", slug: "lentils", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "Faba Beans (Horse Beans)", slug: "faba-beans", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "White Haricot Beans", slug: "white-beans", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "Red Kidney Beans", slug: "red-kidney-beans", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "Soybeans", slug: "soybeans", productType: "PULSE" },
      { categoryId: catMap.get("pulses-legumes"), name: "Green Split Peas", slug: "field-peas", productType: "PULSE" },
      // Roots & Tubers
      { categoryId: catMap.get("roots-tubers"), name: "Highland Potatoes", slug: "potatoes", productType: "ROOT_TUBER" },
      { categoryId: catMap.get("roots-tubers"), name: "Sweet Potatoes", slug: "sweet-potatoes", productType: "ROOT_TUBER" },
      { categoryId: catMap.get("roots-tubers"), name: "Chencha Garlic Bulbs", slug: "garlic-roots", productType: "ROOT_TUBER" },
      { categoryId: catMap.get("roots-tubers"), name: "Enset / Fermented Kocho", slug: "enset-kocho", productType: "ROOT_TUBER" },
      { categoryId: catMap.get("roots-tubers"), name: "Fresh Ginger Root", slug: "ginger-root", productType: "ROOT_TUBER" },
      { categoryId: catMap.get("roots-tubers"), name: "Taro (Godere)", slug: "taro-godere", productType: "ROOT_TUBER" },
      // Vegetables
      { categoryId: catMap.get("vegetables"), name: "Roma Tomatoes", slug: "roma-tomatoes", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Beefsteak Slicing Tomatoes", slug: "beefsteak-tomatoes", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Red Bombay Onions", slug: "red-onions", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Ethiopian Kale (Gomen)", slug: "kale-gomen", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Head Cabbage", slug: "cabbage", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Crunchy Carrots", slug: "carrots", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Hot Green Chili Pepper", slug: "green-chili", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Ethiopian Berbere Peppers", slug: "berbere-pepper", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Cucumbers", slug: "cucumbers", productType: "VEGETABLE" },
      { categoryId: catMap.get("vegetables"), name: "Zucchini & Squash", slug: "zucchini-squash", productType: "VEGETABLE" },
      // Fruits
      { categoryId: catMap.get("fruits"), name: "Hass Export Avocado", slug: "hass-avocado", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Rift Valley Papaya", slug: "papaya", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Arba Minch Cavendish Bananas", slug: "bananas", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Guji Apple Mango", slug: "mangoes", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Highland Fresh Strawberries", slug: "strawberries", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Sweet Oranges & Citrus", slug: "citrus", productType: "FRUIT" },
      { categoryId: catMap.get("fruits"), name: "Pineapples", slug: "pineapples", productType: "FRUIT" },
      // Coffee
      { categoryId: catMap.get("coffee"), name: "Yirgacheffe Washed Grade 1", slug: "yirgacheffe-washed", productType: "COFFEE" },
      { categoryId: catMap.get("coffee"), name: "Sidama Natural Sun-Dried", slug: "sidama-natural", productType: "COFFEE" },
      { categoryId: catMap.get("coffee"), name: "Guji Specialty Q-Grade", slug: "guji-specialty", productType: "COFFEE" },
      { categoryId: catMap.get("coffee"), name: "Harar Longberry Arabica", slug: "harar-arabica", productType: "COFFEE" },
      { categoryId: catMap.get("coffee"), name: "Roasted Coffee Beans", slug: "roasted-coffee", productType: "COFFEE" },
      { categoryId: catMap.get("coffee"), name: "Artisan Ground Coffee", slug: "ground-coffee", productType: "COFFEE" },
      // Oilseeds
      { categoryId: catMap.get("oilseeds"), name: "Humera White Sesame", slug: "humera-sesame", productType: "OILSEED" },
      { categoryId: catMap.get("oilseeds"), name: "Niger Seed (Noug)", slug: "niger-seed-noug", productType: "OILSEED" },
      { categoryId: catMap.get("oilseeds"), name: "Linseed / Flaxseed", slug: "linseed-flaxseed", productType: "OILSEED" },
      { categoryId: catMap.get("oilseeds"), name: "Sunflower Seeds", slug: "sunflower-seeds", productType: "OILSEED" },
      // Spices & Herbs
      { categoryId: catMap.get("spices-herbs"), name: "Sun-Dried Mareko Berbere", slug: "dried-berbere", productType: "SPICE" },
      { categoryId: catMap.get("spices-herbs"), name: "Korarima Cardamom Pods", slug: "korarima-cardamom", productType: "SPICE" },
      { categoryId: catMap.get("spices-herbs"), name: "Turmeric Roots", slug: "turmeric", productType: "SPICE" },
      { categoryId: catMap.get("spices-herbs"), name: "Black Cumin (Tikur Azmud)", slug: "black-cumin", productType: "SPICE" },
      { categoryId: catMap.get("spices-herbs"), name: "Fresh Farm Rosemary", slug: "fresh-rosemary", productType: "HERB" },
      // Honey
      { categoryId: catMap.get("honey"), name: "Tigray Highland White Honey", slug: "tigray-white-honey", productType: "HONEY" },
      { categoryId: catMap.get("honey"), name: "Guji Wild Forest Honey", slug: "guji-forest-honey", productType: "HONEY" },
      { categoryId: catMap.get("honey"), name: "Raw Highland Honeycomb", slug: "raw-honeycomb", productType: "HONEY" },
      { categoryId: catMap.get("honey"), name: "Pure Organic Beeswax", slug: "organic-beeswax", productType: "HONEY" },
      // Dairy
      { categoryId: catMap.get("dairy"), name: "Highland Fresh Raw Milk", slug: "fresh-milk", productType: "DAIRY" },
      { categoryId: catMap.get("dairy"), name: "Ethiopian Spiced Butter (Niter Kibbeh)", slug: "niter-kibbeh", productType: "DAIRY" },
      { categoryId: catMap.get("dairy"), name: "Cottage Cheese (Ayib)", slug: "ayib-cheese", productType: "DAIRY" },
      { categoryId: catMap.get("dairy"), name: "Raw Dairy Butter", slug: "raw-butter", productType: "DAIRY" },
      // Eggs & Poultry
      { categoryId: catMap.get("eggs-poultry"), name: "Free-Range Highland Brown Eggs", slug: "free-range-eggs", productType: "EGG" },
      { categoryId: catMap.get("eggs-poultry"), name: "Live Local Sasso Chickens", slug: "live-chickens", productType: "POULTRY" },
      { categoryId: catMap.get("eggs-poultry"), name: "Chilled Broiler Poultry Meat", slug: "broiler-meat", productType: "MEAT" },
      // Meat & Livestock
      { categoryId: catMap.get("meat-livestock"), name: "Fresh Prime Beef Cuts", slug: "prime-beef", productType: "MEAT" },
      { categoryId: catMap.get("meat-livestock"), name: "Highland Goat Meat", slug: "goat-meat", productType: "MEAT" },
      { categoryId: catMap.get("meat-livestock"), name: "Live Boran Beef Cattle", slug: "live-cattle", productType: "LIVESTOCK" },
      { categoryId: catMap.get("meat-livestock"), name: "Live Highland Fat-Tail Sheep", slug: "live-sheep", productType: "LIVESTOCK" },
      { categoryId: catMap.get("meat-livestock"), name: "Live Somali Camel", slug: "live-camels", productType: "LIVESTOCK" },
      // Farm Processed
      { categoryId: catMap.get("farm-processed"), name: "100% Pure White Teff Flour", slug: "teff-flour", productType: "PROCESSED_FOOD" },
      { categoryId: catMap.get("farm-processed"), name: "Traditional Spiced Shiro Flour", slug: "shiro-flour", productType: "PROCESSED_FOOD" },
      { categoryId: catMap.get("farm-processed"), name: "Roasted Ethiopian Barley (Kolo)", slug: "roasted-barley-kolo", productType: "PROCESSED_FOOD" },
      { categoryId: catMap.get("farm-processed"), name: "Dried Organic Mango Slices", slug: "dried-mango", productType: "PROCESSED_FOOD" }
    ]);
    await db.insert(hubs).values([
      {
        name: "Addis Central Cross-Dock Hub",
        code: "HUB-ADD-01",
        region: "Addis Ababa",
        city: "Addis Ababa (Kality Terminal)",
        address: "Kality Freight Logistics Zone, Ring Road Corridor",
        latitude: 8.9123,
        longitude: 38.7612,
        capacityTons: 600,
        currentStorageTons: 185,
        managerName: "Tariku Bekele",
        contactPhone: "+251 91 144 8822",
        coldStorageAvailable: true
      },
      {
        name: "Adama Fast-Transit Hub",
        code: "HUB-ADA-02",
        region: "Oromia",
        city: "Adama / Nazret",
        address: "Expressway Gateway, Adama Industrial Zone",
        latitude: 8.54,
        longitude: 39.27,
        capacityTons: 450,
        currentStorageTons: 92,
        managerName: "Kenenisa Gemechu",
        contactPhone: "+251 92 334 1199",
        coldStorageAvailable: true
      },
      {
        name: "Hawassa Fresh Produce Hub",
        code: "HUB-HAW-03",
        region: "Sidama",
        city: "Hawassa",
        address: "Lake Hawassa Agro-Corridor, Plot 44",
        latitude: 7.0504,
        longitude: 38.4955,
        capacityTons: 350,
        currentStorageTons: 74,
        managerName: "Mulugeta Tadesse",
        contactPhone: "+251 93 555 4321",
        coldStorageAvailable: true
      },
      {
        name: "Bahir Dar Tana Hub",
        code: "HUB-BDR-04",
        region: "Amhara",
        city: "Bahir Dar",
        address: "Tana Logistics Port, Kebele 14",
        latitude: 11.5742,
        longitude: 37.3614,
        capacityTons: 300,
        currentStorageTons: 45,
        managerName: "Abebech Worku",
        contactPhone: "+251 91 887 6655",
        coldStorageAvailable: true
      },
      {
        name: "Dire Dawa Eastern Hub",
        code: "HUB-DIR-05",
        region: "Dire Dawa",
        city: "Dire Dawa",
        address: "Free Trade Zone Logistics Gate 2",
        latitude: 9.5931,
        longitude: 41.8661,
        capacityTons: 250,
        currentStorageTons: 38,
        managerName: "Ahmed Hassen",
        contactPhone: "+251 91 556 1234",
        coldStorageAvailable: true
      }
    ]);
    const seededUsers = await db.insert(users).values([
      // 0: Farmer 1 (Oromia - Wonji)
      {
        uid: "user_farmer_bekele",
        email: "bekele.tadesse@agrilink.et",
        fullName: "Bekele Tadesse",
        phone: "+251 91 234 5678",
        role: "FARMER",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        organizationName: "Wonji Horizon Farms & Co-op",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Adama Woreda",
        address: "Wonji Gefersa, East Shewa Zone",
        isVerified: true
      },
      // 1: Farmer 2 (Sidama - Yirgacheffe & Hawassa)
      {
        uid: "user_farmer_almaz",
        email: "almaz.desta@agrilink.et",
        fullName: "Almaz Desta",
        phone: "+251 92 987 6543",
        role: "FARMER",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
        organizationName: "Yirga Micro-Lots & Lakeside Farms",
        region: "Sidama",
        zone: "Gedeo Zone / Yirgacheffe",
        woreda: "Kochere Woreda",
        address: "Yirgacheffe Highland Highlands, Sidama",
        isVerified: true
      },
      // 2: Farmer 3 (Amhara - Gojjam & Gondar)
      {
        uid: "user_farmer_worku",
        email: "worku.mengistu@agrilink.et",
        fullName: "Worku Mengistu",
        phone: "+251 91 876 5432",
        role: "FARMER",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        organizationName: "Gojjam Grain & Honey Cooperative",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen Woreda",
        address: "Dejen Nile Gorge Valley, Amhara",
        isVerified: true
      },
      // 3: Farmer 4 (Tigray & Somali - Livestock & Honey)
      {
        uid: "user_farmer_fatima",
        email: "fatima.abdi@agrilink.et",
        fullName: "Fatima Abdi & Mohamed",
        phone: "+251 93 456 7890",
        role: "FARMER",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        organizationName: "Horn Highland Pastoralist Union",
        region: "Somali",
        zone: "Fafan Zone",
        woreda: "Jijiga Woreda",
        address: "Fafan Plains, Somali Region",
        isVerified: true
      },
      // 4: Individual Buyer
      {
        uid: "user_buyer_yonas",
        email: "yonas.alemu@gmail.com",
        fullName: "Yonas Alemu",
        phone: "+251 91 445 6677",
        role: "BUYER",
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
        organizationName: "Bole Fresh Marts",
        region: "Addis Ababa",
        address: "Bole Medhanealem, House 842, Addis Ababa",
        isVerified: true
      },
      // 5: Commercial Buyer
      {
        uid: "user_business_sara",
        email: "procurement@skylightaddis.et",
        fullName: "Sara Kebede",
        phone: "+251 91 556 7788",
        role: "BUSINESS_BUYER",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
        organizationName: "Ethiopian Skylight Hotels & Catering",
        region: "Addis Ababa",
        address: "Bole International Airport Corridor, Addis Ababa",
        isVerified: true
      },
      // 6: Input Supplier
      {
        uid: "user_supplier_kassahun",
        email: "kassahun.agro@ethioinputs.et",
        fullName: "Kassahun Belay",
        phone: "+251 91 667 8899",
        role: "INPUT_SUPPLIER",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        organizationName: "EthioAgro Certified Seeds & Inputs",
        region: "Addis Ababa",
        address: "Gotera Agro Industrial Park, Addis Ababa",
        isVerified: true
      },
      // 7: Driver
      {
        uid: "user_driver_dawit",
        email: "dawit.logistics@agrilink.et",
        fullName: "Dawit Haile",
        phone: "+251 92 333 4455",
        role: "DRIVER",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
        organizationName: "AgriLink Reefer Express Fleet",
        region: "Oromia",
        address: "Adama Expressway Depot",
        isVerified: true
      },
      // 8: Finance Officer
      {
        uid: "user_finance_helen",
        email: "helen.girma@cbe.com.et",
        fullName: "Helen Girma",
        phone: "+251 91 778 9900",
        role: "FINANCIAL_INSTITUTION",
        avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
        organizationName: "Commercial Bank of Ethiopia (Agri-Credit Division)",
        region: "Addis Ababa",
        address: "CBE HQ Tower, Churchill Road, Addis Ababa",
        isVerified: true
      },
      // 9: Platform Admin
      {
        uid: "user_admin_haile",
        email: "admin@agrilink.et",
        fullName: "Hailemariam Desalegn",
        phone: "+251 91 100 2244",
        role: "PLATFORM_ADMIN",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        organizationName: "AgriLink National Technology Governance",
        region: "Addis Ababa",
        address: "National ICT Park, Bole Kebele 02, Addis Ababa",
        isVerified: true
      }
    ]).returning();
    const farmer1 = seededUsers[0];
    const farmer2 = seededUsers[1];
    const farmer3 = seededUsers[2];
    const farmer4 = seededUsers[3];
    await db.insert(farmerProfiles).values([
      {
        userId: farmer1.id,
        farmName: "Wonji Horizon Main Estate",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Adama",
        totalAreaHectares: 18.5,
        primaryCrops: ["Roma Tomatoes", "Magna Super-White Teff", "Hass Avocado", "Bombay Red Onions"],
        farmingExperienceYears: 14,
        nationalIdNumber: "ETH-NID-94820194",
        cooperativeMembership: "Wonji Sugar & Horticulture Union #22",
        bankAccountNumber: "1000293847291",
        bankName: "Commercial Bank of Ethiopia",
        bio: "Third-generation commercial horticulture grower specializing in GlobalG.A.P certified greenhouse tomatoes, export-grade Hass avocados, and certified Magna Teff grains.",
        rating: 4.95,
        completedOrdersCount: 248,
        totalProduceSoldTons: 164.5,
        isCertifiedOrganic: true
      },
      {
        userId: farmer2.id,
        farmName: "Yirga Highland Micro-Lots & Dairy Farm",
        region: "Sidama",
        zone: "Gedeo Zone",
        woreda: "Kochere",
        totalAreaHectares: 12,
        primaryCrops: ["Yirgacheffe Washed Grade 1 Coffee", "Sidama Natural Coffee", "Highland Fresh Milk", "Pure Highland Honey"],
        farmingExperienceYears: 18,
        nationalIdNumber: "ETH-NID-88492019",
        cooperativeMembership: "Yirgacheffe Coffee Farmers Cooperative Union (YCFCU)",
        bankAccountNumber: "1000984729103",
        bankName: "Awash Bank",
        bio: "Specialty coffee producer at 2,150m altitude with dedicated wet mill processing, certified organic apiary hives, and high-altitude pasture dairy.",
        rating: 4.98,
        completedOrdersCount: 312,
        totalProduceSoldTons: 88,
        isCertifiedOrganic: true
      },
      {
        userId: farmer3.id,
        farmName: "Gojjam Fertile Highland Collective",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen",
        totalAreaHectares: 24,
        primaryCrops: ["Durum Wheat", "Kabuli Chickpeas", "Red Split Lentils", "Traditional Spiced Shiro", "Noug Oilseeds"],
        farmingExperienceYears: 20,
        nationalIdNumber: "ETH-NID-77291048",
        cooperativeMembership: "Damot Union Agriculture Cluster",
        bankAccountNumber: "1000384729184",
        bankName: "Dashen Bank",
        bio: "Master grain and pulse producer in the deep volcanic soils of Gojjam. Certified outgrower supplier of high-protein durum wheat, export chickpeas, and traditional stone-milled flours.",
        rating: 4.91,
        completedOrdersCount: 184,
        totalProduceSoldTons: 220,
        isCertifiedOrganic: true
      },
      {
        userId: farmer4.id,
        farmName: "Horn Pastoralist & Livestock Cooperative",
        region: "Somali",
        zone: "Fafan Zone",
        woreda: "Jijiga",
        totalAreaHectares: 50,
        primaryCrops: ["Boran Beef Cattle", "Somali Camels", "Highland Sheep", "White Honey", "Free-Range Eggs"],
        farmingExperienceYears: 25,
        nationalIdNumber: "ETH-NID-66382019",
        cooperativeMembership: "Somali Regional Livestock Traders Association",
        bankAccountNumber: "1000492810394",
        bankName: "Hijra Bank (Sharia Compliant)",
        bio: "Certified livestock breeder and pastoralist cooperative supplying health-inspected Boran cattle, pure camels, Somali honey, and free-range poultry with official veterinary certificates.",
        rating: 4.94,
        completedOrdersCount: 145,
        totalProduceSoldTons: 95,
        isCertifiedOrganic: false
      }
    ]);
    const farmsData = await db.insert(farms).values([
      {
        farmerId: farmer1.id,
        name: "Wonji Horizon Main Estate",
        locationName: "Wonji Gefersa Plot 12B",
        region: "Oromia",
        latitude: 8.4521,
        longitude: 39.2942,
        sizeHectares: 18.5,
        soilType: "Volcanic Sandy Loam",
        irrigationType: "Drip & Awash River Canal",
        certifications: ["GlobalG.A.P", "Ethiopian Organic Quality Seal", "Traceable Origin #ET-WNJ-09"]
      },
      {
        farmerId: farmer2.id,
        name: "Yirga Misty Altitude Estate",
        locationName: "Kochere Highland Slope, 2150m",
        region: "Sidama",
        latitude: 6.1622,
        longitude: 38.2054,
        sizeHectares: 12,
        soilType: "Rich Humus Red Clay",
        irrigationType: "Natural Mountain Spring Mist",
        certifications: ["FairTrade International", "Rainforest Alliance", "Q-Grader Certified (Score 89.5)"]
      },
      {
        farmerId: farmer3.id,
        name: "Gojjam Black Earth Fields",
        locationName: "Dejen Valley Basin",
        region: "Amhara",
        latitude: 10.1667,
        longitude: 38.1333,
        sizeHectares: 24,
        soilType: "Heavy Black Vertisol",
        irrigationType: "Rainfed & Gravity Canal",
        certifications: ["MoA Grain Purity 99.8%", "Ethiopian Standards Agency Level 1"]
      },
      {
        farmerId: farmer4.id,
        name: "Fafan Pastoralist Rangeland & Apiary",
        locationName: "Jijiga Green Belt Pastures",
        region: "Somali",
        latitude: 9.35,
        longitude: 42.8,
        sizeHectares: 50,
        soilType: "Alluvial Loam & Rangeland",
        irrigationType: "Borehole & Seasonal River Basin",
        certifications: ["National Veterinary Health Approved", "Halal Export Certified"]
      }
    ]).returning();
    const buyer1 = seededUsers[4];
    const buyer2 = seededUsers[5];
    await db.insert(buyerProfiles).values([
      {
        userId: buyer1.id,
        buyerType: "SUPERMARKET",
        companyName: "Bole Fresh Marts Ltd",
        tinNumber: "0049281729",
        vatRegistered: true,
        deliveryAddress: "Bole Medhanealem Commercial District, Addis Ababa",
        preferredPaymentMethod: "CHAPA",
        creditLimitEtb: 35e4
      },
      {
        userId: buyer2.id,
        buyerType: "HOTEL",
        companyName: "Ethiopian Skylight Hotel & Aviation Catering",
        tinNumber: "0098472910",
        vatRegistered: true,
        deliveryAddress: "Bole International Airport Road, Skylight Culinary Hub, Addis Ababa",
        preferredPaymentMethod: "CHAPA",
        creditLimitEtb: 18e5
      }
    ]);
    const supplierUser = seededUsers[6];
    await db.insert(inputSuppliers).values({
      userId: supplierUser.id,
      companyName: "EthioAgro Certified Seeds & Inputs",
      registrationNumber: "MOA-INPUT-REG-2024-092",
      contactPhone: "+251 91 667 8899",
      contactEmail: "orders@ethioinputs.et",
      warehouseLocation: "Gotera Logistics Park Warehouse 7, Addis Ababa",
      region: "Addis Ababa",
      isVerified: true,
      rating: 4.95,
      totalProductsCount: 15
    });
    const driverUser = seededUsers[7];
    await db.insert(drivers).values({
      userId: driverUser.id,
      fullName: "Dawit Haile",
      phone: "+251 92 333 4455",
      licenseNumber: "ET-DL-4920194",
      vehicleType: "ISUZU_NPR_REFRIGERATED_TRUCK",
      vehiclePlateNumber: "3-B49201-AA",
      capacityTons: 5,
      hasRefrigeration: true,
      region: "Addis Ababa & Central Corridor",
      currentStatus: "AVAILABLE",
      currentLat: 8.914,
      currentLng: 38.765,
      rating: 4.97,
      totalDeliveries: 420,
      isVerified: true
    });
    const prodGrains = catMap.get("grains-cereals");
    const prodPulses = catMap.get("pulses-legumes");
    const prodRoots = catMap.get("roots-tubers");
    const prodVeg = catMap.get("vegetables");
    const prodFruit = catMap.get("fruits");
    const prodCoffee = catMap.get("coffee");
    const prodOil = catMap.get("oilseeds");
    const prodSpices = catMap.get("spices-herbs");
    const prodHoney = catMap.get("honey");
    const prodDairy = catMap.get("dairy");
    const prodEggs = catMap.get("eggs-poultry");
    const prodMeat = catMap.get("meat-livestock");
    const prodProc = catMap.get("farm-processed");
    await db.insert(products).values([
      // 1. GRAIN: Magna Super-White Teff Grain
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodGrains,
        name: "Magna Super-White Teff Grain",
        subcategory: "White Teff (Magna)",
        productType: "GRAIN",
        variety: "Quncho DZ-Cr-387 (Super White)",
        description: "Pristine, double-cleaned super-white Teff grain harvested from the fertile volcanic black soils of East Shewa. Exceptional purity (99.8%), gluten-free, rich in iron, calcium, and complex carbohydrates.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 11800,
        currency: "ETB",
        unit: "QUINTAL",
        availableQuantity: 280,
        minOrderQuantity: 5,
        maxOrderQuantity: 100,
        harvestDate: "2026-08-15",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Wonji & Ada\u2019a Highland Parcel, East Shewa",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Ada\u2019a / Bishoftu",
        townCity: "Bishoftu",
        altitudeMeters: 1920,
        harvestYear: 2026,
        storageRequirements: "Store in cool, dry, pest-free ventilated warehouse (relative humidity < 60%).",
        packagingType: "100kg Triple-Layer PP Woven Bag",
        images: [
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-WNJ-TEF-2026-08",
        qualityScore: 99,
        certifications: ["Ethiopian Grain Trade Enterprise Seal", "Purity 99.8% Certified", "Non-GMO"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 2. GRAIN: Durum Milling Wheat
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodGrains,
        name: "Highland Durum Milling Wheat",
        subcategory: "Durum Wheat",
        productType: "GRAIN",
        variety: "Utuba / Ude High-Protein Durum",
        description: "Hard vitreous amber durum grain grown in East Gojjam. Protein content 14.2%, high gluten index, ideal for commercial pasta factories, industrial bakeries, and fine semolina milling.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 7200,
        currency: "ETB",
        unit: "QUINTAL",
        availableQuantity: 450,
        minOrderQuantity: 10,
        maxOrderQuantity: 200,
        harvestDate: "2026-08-10",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Dejen Valley Grain Cluster",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen",
        townCity: "Dejen",
        altitudeMeters: 2350,
        harvestYear: 2026,
        storageRequirements: "Dry grain silo or palleted warehouse.",
        packagingType: "100kg Jute / PP Bag",
        images: [
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-GJM-WHT-2026-08",
        qualityScore: 96,
        certifications: ["MoA Grain Certification", "Protein 14.2% Lab Tested"],
        isOrganic: false,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 3. PULSES: Kabuli Giant Chickpeas
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodPulses,
        name: "Export-Grade Kabuli Chickpeas",
        subcategory: "Chickpeas (Kabuli & Desi)",
        productType: "PULSE",
        variety: "Arerti Extra-Large Seed",
        description: "Uniform, cream-colored 8mm-9mm Kabuli chickpeas. Cleaned, sorted, low moisture (<10%), zero foreign matter. Ideal for export, canning, and culinary hummus production.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 145,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 12e3,
        minOrderQuantity: 50,
        harvestDate: "2026-08-18",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Gondar & Gojjam Outgrower Scheme",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen",
        altitudeMeters: 2200,
        harvestYear: 2026,
        storageRequirements: "Store in dry place on wooden pallets.",
        packagingType: "50kg Double Bag",
        images: [
          "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-AMH-CHK-2026-08",
        qualityScore: 98,
        certifications: ["Phytosanitary Export Pass", "ISO 22000 Ready"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 4. PULSES: Red Split Lentils
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodPulses,
        name: "Adet High-Altitude Red Lentils",
        subcategory: "Red Split Lentils",
        productType: "PULSE",
        variety: "Derash Highland Crimson",
        description: "Quick-cooking, deep-orange highland red lentils with delicious earthy aroma. Grown by cooperative outgrowers in crop rotation with teff for natural soil nitrogen fixation.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 125,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 8500,
        minOrderQuantity: 25,
        harvestDate: "2026-08-12",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Adet Research Valley, Gojjam",
        region: "Amhara",
        zone: "West Gojjam",
        woreda: "Yilmana Densa",
        altitudeMeters: 2400,
        harvestYear: 2026,
        storageRequirements: "Dry, insect-free storage.",
        packagingType: "50kg PP Bag",
        images: [
          "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-GJM-LNT-2026-08",
        qualityScore: 97,
        certifications: ["Ethiopian Quality Standard"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 5. ROOTS & TUBERS: Fresh Shashemene Potatoes
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodRoots,
        name: "Fresh Shashemene Highland Potatoes",
        subcategory: "Highland Potatoes",
        productType: "ROOT_TUBER",
        variety: "Jalene & Gudene Red-Skin Elite",
        description: "High dry-matter (22%) culinary potatoes harvested fresh from volcanic loam soils. Thick skin, minimal skinning, low sugar content, crisp frying and boiling texture.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 48,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 15e3,
        minOrderQuantity: 100,
        harvestDate: "2026-08-29",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Shashemene Highland Outgrower Cluster",
        region: "Oromia",
        zone: "West Arsi",
        woreda: "Shashemene Zuria",
        townCity: "Shashemene",
        altitudeMeters: 2050,
        harvestYear: 2026,
        storageRequirements: "Keep in ventilated dark wooden crates (10\xB0C - 15\xB0C). Do not expose to direct sunlight.",
        packagingType: "50kg Red Mesh Sacks",
        images: [
          "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-SHS-POT-2026-08",
        qualityScore: 97,
        certifications: ["100% Farm Fresh", "Pesticide Tested"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 45
      },
      // 6. ROOTS & TUBERS: Chencha Organic White Garlic Bulbs
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodRoots,
        name: "Chencha Giant Organic White Garlic",
        subcategory: "Chencha Garlic Bulbs",
        productType: "ROOT_TUBER",
        variety: "Chencha Highland White Pungent",
        description: "Sun-cured, pungent organic white garlic bulbs with tight protective skins and high allicin content. Grown at 2,700m elevation in the misty Gamo highlands without synthetic chemicals.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 175,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 3400,
        minOrderQuantity: 20,
        harvestDate: "2026-08-20",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Chencha Highland Slopes, Gamo",
        region: "South Ethiopia",
        zone: "Gamo Zone",
        woreda: "Chencha",
        townCity: "Chencha",
        altitudeMeters: 2720,
        harvestYear: 2026,
        storageRequirements: "Hang in dry breezy shade or breathable netted sacks.",
        packagingType: "25kg Netted Sacks",
        images: [
          "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-CHN-GAR-2026-08",
        qualityScore: 99,
        certifications: ["Certified Organic", "Allicin Potency Verified"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 120
      },
      // 7. VEGETABLES: Greenhouse Roma Tomatoes
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodVeg,
        name: "Greenhouse Vine-Ripened Roma Tomatoes",
        subcategory: "Roma Tomatoes",
        productType: "VEGETABLE",
        variety: "Ty-Shine Export Hybrid",
        description: "Firm, uniform deep-red greenhouse Roma tomatoes with thick fleshy walls, low seed count, and superior transport shelf life. Harvested daily with stem-on freshness.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 78,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 6500,
        minOrderQuantity: 40,
        harvestDate: "2026-08-30",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Wonji Greenhouse Sector Alpha",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Adama",
        townCity: "Adama",
        altitudeMeters: 1540,
        harvestYear: 2026,
        storageRequirements: "Store at 12\xB0C - 15\xB0C with stem attached for maximum firmness.",
        packagingType: "20kg Reusable Ventilated Plastic Crates",
        images: [
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-WNJ-TOM-2026-08-30",
        qualityScore: 98,
        certifications: ["GlobalG.A.P", "Zero Chemical Residue"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 16
      },
      // 8. VEGETABLES: Red Bombay Onions
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodVeg,
        name: "Highland Red Bombay Onions",
        subcategory: "Red Bombay Onions",
        productType: "VEGETABLE",
        variety: "Bombay Red Premium Cured",
        description: "Thoroughly dry cured, deep burgundy color, high pungency red onions with tight skins and low moisture content for extended transit and storage without rotting.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 64,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 18e3,
        minOrderQuantity: 50,
        harvestDate: "2026-08-25",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Awash Valley Irrigated Fields",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Wonji",
        altitudeMeters: 1500,
        harvestYear: 2026,
        storageRequirements: "Dry, well-ventilated storerooms.",
        packagingType: "50kg Red Net Bags",
        images: [
          "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-AWS-ONI-2026-08",
        qualityScore: 96,
        certifications: ["MoA Farm Seal"],
        isOrganic: false,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 60
      },
      // 9. FRUITS: Export Hass Avocados
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodFruit,
        name: "Export-Grade Hass Avocados",
        subcategory: "Hass Export Avocado",
        productType: "FRUIT",
        variety: "Export Hass Grafted",
        description: "Pebbly-skinned, high dry-matter (24.5% minimum) Hass avocados harvested at peak maturity index. Rich creamy nutty flavor, zero bruising, graded by optical sizing line.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 110,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 5500,
        minOrderQuantity: 30,
        harvestDate: "2026-08-28",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Wonji Hass Avocado Orchards",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Wonji",
        altitudeMeters: 1600,
        harvestYear: 2026,
        storageRequirements: "Store in pre-cooled cold room (5\xB0C - 7\xB0C) with controlled humidity.",
        packagingType: "4kg / 10kg Export Corrugated Cartons",
        images: [
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-WNJ-AVO-2026-08",
        qualityScore: 99,
        certifications: ["GlobalG.A.P", "Fairtrade Certified", "Phytosanitary Export Pass"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 21
      },
      // 10. FRUITS: Rift Valley Sweet Solo Papaya
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodFruit,
        name: "Rift Valley Sweet Solo Papaya",
        subcategory: "Rift Valley Papaya",
        productType: "FRUIT",
        variety: "Solo Sunrise Rift Hybrid",
        description: "Vibrant salmon-red interior, high brix (13.5\xB0), aromatic sweet flesh with tender texture. Pre-cooled on harvest day to ensure prime retail condition upon arrival.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 45,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 4200,
        minOrderQuantity: 20,
        harvestDate: "2026-08-30",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Lake Ziway North Riparian Fields",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Batu",
        townCity: "Batu / Ziway",
        altitudeMeters: 1640,
        harvestYear: 2026,
        storageRequirements: "10\xB0C - 13\xB0C. Do not stack unpadded.",
        packagingType: "15kg Padded Wooden / Cardboard Trays",
        images: [
          "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-ZWY-PAP-2026-08",
        qualityScore: 97,
        certifications: ["Ethiopian Quality Standard"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 10
      },
      // 11. COFFEE: Yirgacheffe Washed Grade 1
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodCoffee,
        name: "Yirgacheffe Washed Grade 1 Specialty Coffee",
        subcategory: "Yirgacheffe Washed Grade 1",
        productType: "COFFEE",
        variety: "Ethiopian Heirloom / Kurume",
        description: "Legendary Ethiopian micro-lot specialty coffee. Fully washed, fermented 36 hours in mountain spring water, sun-dried on raised African beds. Bright bergamot citrus, jasmine blossom florals, delicate lemon tea finish. SCA Cup Score: 89.5.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 38e3,
        currency: "ETB",
        unit: "QUINTAL",
        availableQuantity: 60,
        minOrderQuantity: 1,
        maxOrderQuantity: 20,
        harvestDate: "2026-07-20",
        freshnessStatus: "AVAILABLE_NOW",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Kochere Washing Station, Yirgacheffe",
        region: "Sidama",
        zone: "Gedeo Zone",
        woreda: "Kochere",
        townCity: "Yirgacheffe",
        altitudeMeters: 2150,
        originDetails: "Micro-lot Farm #08, Gedeo Highland Mist Corridor",
        processingMethod: "Fully Washed (Spring Fermentation & Sun-Bed Drying)",
        harvestYear: 2026,
        storageRequirements: "Climate-controlled warehouse, GrainPro hermetic lined sacks, 18\xB0C, 55% RH.",
        packagingType: "60kg GrainPro Hermetic Lined Jute Bag",
        images: [
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-YRG-COF-2026-Q1",
        qualityScore: 99,
        certifications: ["FairTrade International", "Rainforest Alliance", "Organic Ethiopia", "SCA Q-Grade 89.5"],
        isOrganic: true,
        isVerifiedFarmer: true,
        attributes: {
          cupScore: 89.5,
          flavorNotes: "Jasmine, Bergamot, Earl Grey, Peach, Cane Sugar",
          moistureContent: "10.8%",
          screenSize: "15/17",
          processingStation: "Kochere Wet Mill"
        },
        status: "ACTIVE",
        shelfLifeDays: 540
      },
      // 12. COFFEE: Sidama Natural Sun-Dried Grade 1
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodCoffee,
        name: "Sidama Natural Sun-Dried Grade 1 Coffee",
        subcategory: "Sidama Natural Sun-Dried",
        productType: "COFFEE",
        variety: "Heirloom 74110 & 74112 Varieties",
        description: "Full-bodied natural sun-dried specialty coffee dried inside intact ripe coffee cherries on raised beds for 21 days. Heavy blueberry jam sweetness, dark chocolate notes, complex winey finish. SCA Cup Score: 88.75.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 36500,
        currency: "ETB",
        unit: "QUINTAL",
        availableQuantity: 75,
        minOrderQuantity: 1,
        maxOrderQuantity: 25,
        harvestDate: "2026-07-28",
        freshnessStatus: "AVAILABLE_NOW",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Bensa Highland Parcel, Sidama",
        region: "Sidama",
        zone: "Bensa Zone",
        woreda: "Bensa",
        altitudeMeters: 2280,
        originDetails: "Bensa High-Altitude Forest Fringe",
        processingMethod: "Natural / Sun-Dried on Raised African Beds (21 Days)",
        harvestYear: 2026,
        storageRequirements: "GrainPro lined jute sacks in humidity-controlled dry depot.",
        packagingType: "60kg GrainPro Jute Sacks",
        images: [
          "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-SDM-COF-2026-N1",
        qualityScore: 98,
        certifications: ["Rainforest Alliance", "Single Origin Verified", "SCA Q-Grade 88.75"],
        isOrganic: true,
        isVerifiedFarmer: true,
        attributes: {
          cupScore: 88.75,
          flavorNotes: "Blueberry, Dried Strawberry, Dark Cocoa, Honeycomb",
          moistureContent: "11.2%"
        },
        status: "ACTIVE",
        shelfLifeDays: 540
      },
      // 13. OILSEEDS: Humera Whitish Sesame Seeds
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodOil,
        name: "Humera Pure Whitish Sesame Seeds",
        subcategory: "Humera White Sesame",
        productType: "OILSEED",
        variety: "Humera Grade A Whitish",
        description: "World-renowned Ethiopian Humera white sesame seeds famous for sweet nutty aroma and high oil content (>52%). Machine cleaned, 99.5% purity, zero GMOs, export ready.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 195,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 25e3,
        minOrderQuantity: 100,
        harvestDate: "2026-08-05",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Humera Agro-Export Corridor",
        region: "Tigray",
        zone: "Western Tigray",
        woreda: "Setit Humera",
        townCity: "Humera",
        altitudeMeters: 620,
        harvestYear: 2026,
        storageRequirements: "Store in cool dry warehouse (RH < 50%).",
        packagingType: "50kg PP Woven Bags with PE liner",
        images: [
          "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-HMR-SES-2026-08",
        qualityScore: 99,
        certifications: ["Export Quality Seal", "Oil Content 52.8% Verified"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 14. SPICES & HERBS: Sun-Dried Mareko Berbere Chili
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodSpices,
        name: "Sun-Dried Mareko Fana Berbere Chili Pods",
        subcategory: "Sun-Dried Mareko Berbere",
        productType: "SPICE",
        variety: "Mareko Fana Traditional Red",
        description: "Whole stemless, naturally sun-cured crimson berbere chili peppers. Intense fragrant aroma, deep natural red color value (ASTA 140+), medium-high pungency.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 220,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 4200,
        minOrderQuantity: 10,
        harvestDate: "2026-08-22",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Mareko Valley Spices, Gurage",
        region: "Central Ethiopia",
        zone: "Gurage Zone",
        woreda: "Mareko",
        altitudeMeters: 1780,
        harvestYear: 2026,
        storageRequirements: "Airtight packaging in dark dry pantry.",
        packagingType: "25kg Polyethylene Lined Sacks",
        images: [
          "https://images.unsplash.com/photo-1588879460618-924b172a6b29?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-MRK-BER-2026-08",
        qualityScore: 98,
        certifications: ["ASTA Color Certified", "Aflatoxin Tested Clean"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 365
      },
      // 15. SPICES & HERBS: Whole Korarima Cardamom Pods
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodSpices,
        name: "Wild Highland Korarima (Ethiopian Black Cardamom)",
        subcategory: "Korarima Cardamom Pods",
        productType: "SPICE",
        variety: "Wild Forest Large Pod (Aframomum corrorima)",
        description: "Sun-dried wild highland korarima pods harvested from the misty southwestern rainforests. Pungent eucalyptus, mint, and warm citrus notes. Indispensable for authentic Ethiopian stews, kibbeh, and specialty coffees.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 480,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 1500,
        minOrderQuantity: 5,
        harvestDate: "2026-08-15",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Kaffa Ancient Rainforest Canopy",
        region: "Southwest Ethiopia",
        zone: "Kaffa Zone",
        woreda: "Bonga",
        altitudeMeters: 1950,
        harvestYear: 2026,
        storageRequirements: "Store sealed in moisture-proof packaging.",
        packagingType: "10kg Sealed Kraft Bags",
        images: [
          "https://images.unsplash.com/photo-1588879460618-924b172a6b29?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-KFA-KOR-2026-08",
        qualityScore: 99,
        certifications: ["Wild Harvest Certified", "Organic Rainforest Protected"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 730
      },
      // 16. HONEY: Tigray Highland White Honey
      {
        farmerId: farmer4.id,
        farmId: farmsData[3].id,
        categoryId: prodHoney,
        name: "Tigray Organic Highland Pure White Honey",
        subcategory: "Tigray Highland White Honey",
        productType: "HONEY",
        variety: "Highland Becium Grandiflorum Blossom",
        description: "Exquisite creamy white honey harvested from the arid highland blossom flowers of northern Tigray. Naturally crystallized, smooth velvety spread texture, floral delicate aroma with zero sugar additives.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 650,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 2800,
        minOrderQuantity: 5,
        harvestDate: "2026-08-10",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Agame Highlands Apiary Network",
        region: "Tigray",
        zone: "Eastern Tigray",
        woreda: "Ganta Afeshum",
        townCity: "Adigrat",
        altitudeMeters: 2450,
        originDetails: "Pristine mountain floral pastures (Becium Grandiflorum / Tebeb)",
        harvestYear: 2026,
        storageRequirements: "Store in airtight jars at ambient room temperature. Do not refrigerate.",
        packagingType: "1kg / 5kg Food-Grade Airtight Glass Jars & Pails",
        images: [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-TGY-HON-2026-W1",
        qualityScore: 99,
        certifications: ["100% Raw Unpasteurized", "Purity Lab Verified (Moisture 16.4%)", "Organic Apiculture Seal"],
        isOrganic: true,
        isVerifiedFarmer: true,
        attributes: {
          pollenSource: "Becium Grandiflorum (Tebeb)",
          moistureContent: "16.4%",
          color: "Extra White Creamy",
          processing: "Cold Extracted & Unheated"
        },
        status: "ACTIVE",
        shelfLifeDays: 730
      },
      // 17. HONEY: Guji Wild Forest Raw Amber Honey
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodHoney,
        name: "Guji Wild Mountain Forest Raw Honey",
        subcategory: "Guji Wild Forest Honey",
        productType: "HONEY",
        variety: "Wild Forest Canopy Multi-Floral",
        description: "Deep amber raw honey sourced from traditional hanging log hives in the ancient Guji cloud forests. Rich smoky malt undertones, high enzyme activity, 100% unpasteurized.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 520,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 3600,
        minOrderQuantity: 5,
        harvestDate: "2026-08-14",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Guji Cloud Forest Apiary Reserve",
        region: "Oromia",
        zone: "Guji Zone",
        woreda: "Shakisso",
        altitudeMeters: 2200,
        harvestYear: 2026,
        storageRequirements: "Ambient dry pantry storage.",
        packagingType: "5kg Sealed Buckets & 1kg Jars",
        images: [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-GUJ-HON-2026-08",
        qualityScore: 98,
        certifications: ["Wild Forest Certified", "MoA Apiculture Standard"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 730
      },
      // 18. DAIRY: Ethiopian Clarified Spiced Butter (Niter Kibbeh)
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodDairy,
        name: "Traditional Ethiopian Spiced Butter (Niter Kibbeh)",
        subcategory: "Ethiopian Spiced Butter (Niter Kibbeh)",
        productType: "DAIRY",
        variety: "Highland Clarified Butter with Kosseret & Spices",
        description: "Artisanal clarified butter slowly simmered with highland herbs (kosseret, korarima, turmeric, garlic, ginger, and fenugreek). Golden color, mouthwatering traditional aroma, shelf-stable.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 780,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 1200,
        minOrderQuantity: 2,
        harvestDate: "2026-08-25",
        productionDate: "2026-08-25",
        expirationDate: "2027-02-25",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Hawassa Dairy Co-op Creamery",
        region: "Sidama",
        zone: "Sidama Zone",
        woreda: "Hawassa Zuria",
        townCity: "Hawassa",
        altitudeMeters: 1700,
        ingredients: "Pure grass-fed cow butter, kosseret, korarima, turmeric, ginger, garlic, fenugreek, sacred basil.",
        storageRequirements: "Store in cool dry place or refrigerate after opening.",
        packagingType: "1kg / 2.5kg Airtight Food-Grade Tins & Jars",
        images: [
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-SID-KIB-2026-08",
        qualityScore: 99,
        certifications: ["MoA Food Safety Approved", "100% Grass-Fed Dairy"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 180
      },
      // 19. DAIRY: Fresh Highland Raw Pasteurized Milk
      {
        farmerId: farmer2.id,
        farmId: farmsData[1].id,
        categoryId: prodDairy,
        name: "Highland Fresh Whole Milk (Chilled Cold-Chain)",
        subcategory: "Highland Fresh Raw Milk",
        productType: "DAIRY",
        variety: "Pure Grass-Fed Whole Cow Milk (3.8% Butterfat)",
        description: "Fresh, rich, unadulterated whole milk from grass-grazed highland dairy herds. Rapidly chilled to 4\xB0C directly at the milking parlour. Transported via AgriLink refrigerated cold-chain vans.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 65,
        currency: "ETB",
        unit: "LITER",
        availableQuantity: 2500,
        minOrderQuantity: 10,
        harvestDate: "2026-08-30",
        productionDate: "2026-08-30",
        expirationDate: "2026-09-04",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Dispatch (Cold Chain)",
        farmLocation: "Hawassa Lakeside Pasture Creamery",
        region: "Sidama",
        zone: "Sidama Zone",
        woreda: "Hawassa Zuria",
        altitudeMeters: 1750,
        storageRequirements: "REFRIGERATION MANDATORY: Keep strictly between 2\xB0C and 4\xB0C.",
        packagingType: "5-Liter & 10-Liter Food-Grade Sanitized Cold Jugs",
        images: [
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-DAI-MLK-2026-08-30",
        qualityScore: 98,
        certifications: ["Veterinary Somatic Cell Tested", "Cold-Chain Telemetry Verified"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 5
      },
      // 20. EGGS & POULTRY: Highland Free-Range Brown Eggs
      {
        farmerId: farmer4.id,
        farmId: farmsData[3].id,
        categoryId: prodEggs,
        name: "Highland Free-Range Farm Brown Eggs",
        subcategory: "Free-Range Highland Brown Eggs",
        productType: "EGG",
        variety: "Pastured Dual-Purpose Local Hens",
        description: "Nutrient-rich golden-yolk brown eggs from hens free to forage on organic pastures, grains, and green forage. Collected daily, candled, graded for size, and packed in reinforced pulp trays.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 18,
        currency: "ETB",
        unit: "PIECE",
        availableQuantity: 18e3,
        minOrderQuantity: 60,
        harvestDate: "2026-08-30",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Jijiga Green Belt Poultry Pastures",
        region: "Somali",
        zone: "Fafan Zone",
        woreda: "Jijiga",
        altitudeMeters: 1650,
        harvestYear: 2026,
        storageRequirements: "Cool ventilated egg storage (12\xB0C - 16\xB0C).",
        packagingType: "30-Egg Molded Pulp Cartons / 360-Egg Master Box",
        images: [
          "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-PLT-EGG-2026-08-30",
        qualityScore: 99,
        certifications: ["Free-Range Humane Certified", "Candled Grade AA"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 30
      },
      // 21. LIVESTOCK: Live Boran Breeding Beef Cattle
      {
        farmerId: farmer4.id,
        farmId: farmsData[3].id,
        categoryId: prodMeat,
        name: "Purebred Boran Breeding Bull / Steer (Live)",
        subcategory: "Live Boran Beef Cattle",
        productType: "LIVESTOCK",
        variety: "Ethiopian Pure Boran Zebu",
        description: "Hardy, tick-resistant purebred Boran cattle raised on natural open rangelands. Average live weight 380kg - 450kg. Inspected by Ministry of Agriculture veterinary officers, ear-tagged, vaccinated against FMD and CBPP.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 75e3,
        currency: "ETB",
        unit: "ANIMAL",
        availableQuantity: 45,
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        harvestDate: "2026-08-20",
        freshnessStatus: "AVAILABLE_NOW",
        expectedAvailability: "Immediate Livestock Transport Trucking",
        farmLocation: "Fafan Plains Rangeland",
        region: "Somali",
        zone: "Fafan Zone",
        woreda: "Jijiga",
        altitudeMeters: 1600,
        isLiveAnimal: true,
        animalBreed: "Purebred Boran Zebu",
        veterinaryCertificate: "ETH-VET-QUARANTINE-2026-9482",
        storageRequirements: "Ventilated live animal transport with fresh water and forage stops.",
        packagingType: "Live Cattle Flatbed Transport with Side Railings",
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-LIV-BOR-2026-08",
        qualityScore: 98,
        certifications: ["National Vet Health Certificate", "Ear-Tag Traceability #ET-SOM-4482"],
        isOrganic: true,
        isVerifiedFarmer: true,
        attributes: {
          averageWeightKg: 420,
          ageMonths: 28,
          healthStatus: "Vaccinated & De-wormed",
          earTagPrefix: "ET-BOR-"
        },
        status: "ACTIVE",
        shelfLifeDays: 90
      },
      // 22. MEAT: Prime Fresh Chilled Highland Beef Cut
      {
        farmerId: farmer4.id,
        farmId: farmsData[3].id,
        categoryId: prodMeat,
        name: "Prime Grass-Fed Highland Beef Carcass / Cuts",
        subcategory: "Fresh Prime Beef Cuts",
        productType: "MEAT",
        variety: "Pastured Steer Prime Cuts",
        description: "Freshly dressed, chilled prime beef from pasture-raised cattle slaughtered at export-licensed municipal abattoirs. Inspected, stamped Halal, transported at 1\xB0C in refrigerated vans.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 480,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 3500,
        minOrderQuantity: 20,
        harvestDate: "2026-08-30",
        productionDate: "2026-08-30",
        expirationDate: "2026-09-06",
        freshnessStatus: "HARVESTED_TODAY",
        expectedAvailability: "Immediate Cold-Chain Dispatch",
        farmLocation: "Adama Meat Inspection & Abattoir Facility",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Adama",
        altitudeMeters: 1540,
        storageRequirements: "Strict Cold-Chain (0\xB0C to 2\xB0C).",
        packagingType: "Vacuum-Sealed Food Grade Meat Packs",
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-MEA-BEF-2026-08-30",
        qualityScore: 98,
        certifications: ["Halal Slaughter Certified", "MoA Meat Inspection Stamp"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 7
      },
      // 23. PROCESSED FOOD: 100% Pure Ada'a White Teff Flour
      {
        farmerId: farmer1.id,
        farmId: farmsData[0].id,
        categoryId: prodProc,
        name: "Stone-Milled 100% Magna White Teff Flour",
        subcategory: "100% Pure White Teff Flour",
        productType: "PROCESSED_FOOD",
        variety: "Ada\u2019a Magna Super-White Pure Flour",
        description: "Authentic stone-milled Teff flour ground from double-cleaned Quncho grain. 100% pure with zero fillers or wheat blending. High fermentation yield, makes fluffy, light, eye-patterned (Ayn-rich) Injera with authentic sourdough tang.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 145,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 12e3,
        minOrderQuantity: 10,
        harvestDate: "2026-08-20",
        productionDate: "2026-08-25",
        expirationDate: "2027-02-25",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Ada\u2019a Farmers Union Milling Facility",
        region: "Oromia",
        zone: "East Shewa",
        woreda: "Ada\u2019a",
        townCity: "Bishoftu",
        altitudeMeters: 1900,
        ingredients: "100% Pure Ethiopian Super-White Teff Grain (Quncho DZ-Cr-387). Gluten-Free.",
        storageRequirements: "Store in cool, dry, odor-free pantry.",
        packagingType: "10kg / 25kg Food-Grade Multi-Wall Paper Kraft Sacks",
        images: [
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-AD-TEF-FLR-2026-08",
        qualityScore: 99,
        certifications: ["Gluten-Free Tested", "Purity Guarantee (Zero Blending)", "Ethiopian Conformity Assessment Seal"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 180
      },
      // 24. PROCESSED FOOD: Traditional Spiced Shiro Milled Flour
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodProc,
        name: "Gojjam Traditional Spiced Shiro Flour Blend",
        subcategory: "Traditional Spiced Shiro Flour",
        productType: "PROCESSED_FOOD",
        variety: "Artisan Roasted Chickpea & Pea Shiro Blend",
        description: "Premium roasted chickpea and field pea flour stone-ground with traditional Ethiopian sun-cured spices: korarima, dried garlic, ginger, sacred basil (besobila), tena adam, and mild berbere chili. Produces rich, fragrant, silky gourmet Shiro Wot.",
        grade: "PREMIUM",
        qualityGrade: "PREMIUM",
        pricePerUnitEtb: 190,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 6500,
        minOrderQuantity: 5,
        harvestDate: "2026-08-15",
        productionDate: "2026-08-22",
        expirationDate: "2027-04-22",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Dejen Artisanal Food Processing Cluster",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen",
        altitudeMeters: 2300,
        ingredients: "Roasted chickpeas, split field peas, dried garlic, ginger, korarima, besobila, tena adam, chili pepper, sea salt.",
        storageRequirements: "Airtight dry container.",
        packagingType: "5kg / 10kg Kraft Bags with Resealable Top",
        images: [
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-GJM-SHR-2026-08",
        qualityScore: 99,
        certifications: ["100% Natural Spices", "Artisan Women Roasters Seal"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 240
      },
      // 25. PROCESSED FOOD: Roasted Ethiopian Barley (Kolo) Snack
      {
        farmerId: farmer3.id,
        farmId: farmsData[2].id,
        categoryId: prodProc,
        name: "Highland Roasted Barley & Safflower Kolo Snack",
        subcategory: "Roasted Ethiopian Barley (Kolo)",
        productType: "PROCESSED_FOOD",
        variety: "Dejen Roasted Barley with Safflower (Suf)",
        description: "Crisp, crunchy, golden roasted highland barley hulls blended with nutty roasted safflower seeds and chickpeas. Lightly sea-salted, non-greasy, healthy high-fiber traditional snack.",
        grade: "GRADE_A",
        qualityGrade: "GRADE_A",
        pricePerUnitEtb: 160,
        currency: "ETB",
        unit: "KG",
        availableQuantity: 3800,
        minOrderQuantity: 5,
        harvestDate: "2026-08-18",
        productionDate: "2026-08-26",
        expirationDate: "2027-05-26",
        freshnessStatus: "HARVESTED_RECENTLY",
        expectedAvailability: "Immediate Dispatch",
        farmLocation: "Dejen Agro-Processing Co-op",
        region: "Amhara",
        zone: "East Gojjam",
        woreda: "Dejen",
        altitudeMeters: 2350,
        ingredients: "Roasted barley, roasted chickpeas, roasted safflower seeds, sea salt.",
        storageRequirements: "Store in dry airtight container.",
        packagingType: "1kg / 5kg Vacuum Sealed Stand-Up Pouches",
        images: [
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
        ],
        lotBatchNumber: "LOT-GJM-KLO-2026-08",
        qualityScore: 97,
        certifications: ["Food Grade Certified"],
        isOrganic: true,
        isVerifiedFarmer: true,
        status: "ACTIVE",
        shelfLifeDays: 270
      }
    ]);
    const inCatSeeds = await db.insert(inputCategories).values([
      { name: "Certified Hybrid Seeds", slug: "seeds", icon: "Sprout" },
      { name: "Fertilizers & Soil Health", slug: "fertilizers", icon: "FlaskConical" },
      { name: "Crop Protection & Bio-control", slug: "crop-protection", icon: "ShieldCheck" },
      { name: "Irrigation & Solar Systems", slug: "irrigation", icon: "Droplets" },
      { name: "Farm Tools & Machinery", slug: "tools", icon: "Wrench" }
    ]).returning();
    const inCat1 = inCatSeeds[0].id;
    const inCat2 = inCatSeeds[1].id;
    const inCat3 = inCatSeeds[3].id;
    await db.insert(inputProducts).values([
      {
        supplierId: 1,
        categoryId: inCat1,
        name: "Quncho DZ-Cr-387 Certified White Teff Seed",
        brand: "Ethiopian Seed Enterprise (ESE)",
        description: "Certified Grade-1 early maturity White Teff seed with 98% germination rate and resistance to lodging.",
        priceEtb: 4800,
        unit: "BAG (25KG)",
        stockQuantity: 150,
        minOrderQuantity: 1,
        isCertified: true,
        images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"]
      },
      {
        supplierId: 1,
        categoryId: inCat2,
        name: "NPS+Zn Balanced Granular Fertilizer",
        brand: "EthioAgro Mineral Tech",
        description: "Specialized blended nitrogen, phosphate, sulfur with zinc micronutrient for Ethiopian volcanic soils.",
        priceEtb: 3950,
        unit: "BAG (50KG)",
        stockQuantity: 400,
        minOrderQuantity: 2,
        isCertified: true,
        images: ["https://images.unsplash.com/photo-1588879460618-924b172a6b29?auto=format&fit=crop&w=800&q=80"]
      },
      {
        supplierId: 1,
        categoryId: inCat3,
        name: "Solar-Powered Precision Drip Irrigation Kit",
        brand: "SunAgri Solutions",
        description: "Complete 1-Hectare gravity & DC solar pump drip kit with pressure compensating emitters.",
        priceEtb: 145e3,
        unit: "KIT",
        stockQuantity: 25,
        minOrderQuantity: 1,
        isCertified: true,
        images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"]
      }
    ]);
    for (const usr of seededUsers) {
      await db.insert(carts).values({ userId: usr.id });
    }
    console.log("AgriLink database seeded successfully with all 13 categories, subcategories, verified farmers, and authentic Ethiopian agricultural products!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

// server.ts
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json());
app.use((req, res, next) => {
  const matched = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"];
  if (matched && matched.startsWith("/api")) {
    req.url = matched;
  } else if (!req.url.startsWith("/api") && !req.url.startsWith("/_")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
var currentUserId = 1;
var ALL_ROLES = [
  "FARMER",
  "BUYER",
  "BUSINESS_BUYER",
  "INPUT_SUPPLIER",
  "DRIVER",
  "LOGISTICS_ADMIN",
  "FINANCIAL_INSTITUTION",
  "HUB_OPERATOR",
  "PLATFORM_ADMIN"
];
var IN_MEMORY_USERS = [
  {
    id: 1,
    uid: "user_farmer_bekele",
    email: "bekele.tadesse@agrilink.et",
    fullName: "Bekele Tadesse",
    phone: "+251 91 234 5678",
    role: "FARMER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    organizationName: "Wonji Horizon Farms & Co-op",
    region: "Oromia",
    zone: "East Shewa",
    woreda: "Adama Woreda",
    address: "Wonji Gefersa, East Shewa Zone",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 2,
    uid: "user_farmer_almaz",
    email: "almaz.desta@agrilink.et",
    fullName: "Almaz Desta",
    phone: "+251 92 987 6543",
    role: "FARMER",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    organizationName: "Yirga Micro-Lots & Lakeside Farms",
    region: "Sidama",
    zone: "Gedeo Zone / Yirgacheffe",
    woreda: "Kochere Woreda",
    address: "Yirgacheffe Highland Highlands, Sidama",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 3,
    uid: "user_farmer_worku",
    email: "worku.mengistu@agrilink.et",
    fullName: "Worku Mengistu",
    phone: "+251 91 876 5432",
    role: "FARMER",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    organizationName: "Gojjam Grain & Honey Cooperative",
    region: "Amhara",
    zone: "East Gojjam",
    woreda: "Dejen Woreda",
    address: "Dejen Nile Gorge Valley, Amhara",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 4,
    uid: "user_farmer_fatima",
    email: "fatima.abdi@agrilink.et",
    fullName: "Fatima Abdi & Mohamed",
    phone: "+251 93 456 7890",
    role: "FARMER",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    organizationName: "Horn Highland Pastoralist Union",
    region: "Somali",
    zone: "Fafan Zone",
    woreda: "Jijiga Woreda",
    address: "Fafan Plains, Somali Region",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 5,
    uid: "user_buyer_yonas",
    email: "yonas.alemu@gmail.com",
    fullName: "Yonas Alemu",
    phone: "+251 91 445 6677",
    role: "BUYER",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    organizationName: "Bole Fresh Marts",
    region: "Addis Ababa",
    address: "Bole Medhanealem, House 842, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 6,
    uid: "user_business_sara",
    email: "procurement@skylightaddis.et",
    fullName: "Sara Kebede",
    phone: "+251 91 556 7788",
    role: "BUSINESS_BUYER",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    organizationName: "Ethiopian Skylight Hotels & Catering",
    region: "Addis Ababa",
    address: "Bole International Airport Corridor, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 7,
    uid: "user_supplier_kassahun",
    email: "kassahun.agro@ethioinputs.et",
    fullName: "Kassahun Belay",
    phone: "+251 91 667 8899",
    role: "INPUT_SUPPLIER",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    organizationName: "EthioAgro Certified Seeds & Inputs",
    region: "Addis Ababa",
    address: "Gotera Agro Industrial Park, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 8,
    uid: "user_driver_dawit",
    email: "dawit.logistics@agrilink.et",
    fullName: "Dawit Haile",
    phone: "+251 92 333 4455",
    role: "DRIVER",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    organizationName: "AgriLink Reefer Express Fleet",
    region: "Oromia",
    address: "Adama Expressway Depot",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 9,
    uid: "user_finance_helen",
    email: "helen.girma@cbe.com.et",
    fullName: "Helen Girma",
    phone: "+251 91 778 9900",
    role: "FINANCIAL_INSTITUTION",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
    organizationName: "Commercial Bank of Ethiopia (Agri-Credit Division)",
    region: "Addis Ababa",
    address: "CBE HQ Tower, Churchill Road, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 10,
    uid: "user_admin_haile",
    email: "admin@agrilink.et",
    fullName: "Hailemariam Desalegn",
    phone: "+251 91 100 2244",
    role: "PLATFORM_ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    organizationName: "AgriLink National Technology Governance",
    region: "Addis Ababa",
    address: "National ICT Park, Bole Kebele 02, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 11,
    uid: "user_bamlak_admin",
    email: "bamlaksisay270@gmail.com",
    fullName: "Bamlak Sisay",
    phone: "0961123330",
    role: "PLATFORM_ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    organizationName: "AgriLink Executive HQ",
    region: "Addis Ababa",
    address: "Bole Commercial Center, Addis Ababa",
    isVerified: true,
    isEmailVerified: true,
    status: "ACTIVE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var nextUserId = 20;
var IN_MEMORY_VERIFICATION_CODES = /* @__PURE__ */ new Map();
function generateVerificationCode(email, fullName) {
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  IN_MEMORY_VERIFICATION_CODES.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + 15 * 60 * 1e3,
    fullName
  });
  return code;
}
var SURVEY_RESPONSES = [];
var getAuthUser = async (req) => {
  let targetId = null;
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const match = token.match(/^agrilink-token-(\d+)/);
    if (match) {
      targetId = Number(match[1]);
    }
  }
  if (!targetId) {
    const headerUserId = req.headers["x-user-id"] || req.headers["x-auth-user"];
    if (headerUserId) {
      targetId = Number(headerUserId);
    }
  }
  if (!targetId) {
    return null;
  }
  try {
    const userList = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
    if (userList && userList[0]) return userList[0];
  } catch (err) {
  }
  const memUser = IN_MEMORY_USERS.find((u) => u.id === targetId) || null;
  return memUser;
};
if (!process.env.VERCEL) {
  (async () => {
    try {
      await initDatabase();
      await seedDatabase(false);
    } catch (err) {
      console.log("Database startup notice:", err?.message);
    }
  })();
}
app.get("/api/health", async (req, res) => {
  try {
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    res.json({
      status: "ok",
      database: "connected",
      usersCount: userCount[0]?.count || 0,
      activeUserId: currentUserId
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});
app.post("/api/seed", async (req, res) => {
  try {
    const force = req.body?.force !== false;
    await seedDatabase(force);
    res.json({ success: true, message: "Database seeded successfully with authentic Ethiopian farmer crops" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/auth/roles", (req, res) => {
  res.json({
    roles: [
      { id: "FARMER", title: "Smallholder / Commercial Farmer", description: "Lists produce, manages farm plots, tracks soil & harvest analytics, applies for agricultural credit" },
      { id: "BUYER", title: "Individual / Household Consumer", description: "Browses fresh local produce, orders direct or hub cross-dock delivery with mobile money" },
      { id: "BUSINESS_BUYER", title: "Commercial & Institutional Buyer", description: "Issues bulk RFQs, negotiates recurring supply contracts for supermarkets, hotels, and exporters" },
      { id: "INPUT_SUPPLIER", title: "Certified Input Supplier", description: "Distributes MoA-certified seeds, fertilizers, crop protection, and solar irrigation systems" },
      { id: "DRIVER", title: "Fleet Logistics Driver", description: "Receives regional transport dispatches, tracks GPS routes, completes digital proof-of-delivery" },
      { id: "FINANCIAL_INSTITUTION", title: "Agri-Credit & Underwriting Officer", description: "Underwrites farmer loans based on verifiable harvest history and escrow performance" },
      { id: "HUB_OPERATOR", title: "Regional Cross-Dock Hub Manager", description: "Manages cold storage staging, grading inspections, and cross-dock dispatch" },
      { id: "PLATFORM_ADMIN", title: "Platform Governance & Escrow Admin", description: "Oversees nationwide GMV, settlement reconciliation, dispute resolution, and audit logs" }
    ]
  });
});
app.get("/api/auth/users", async (req, res) => {
  try {
    await initDatabase();
    const allUsers = await db.select().from(users).orderBy(users.id);
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((u) => {
        const existingIdx = IN_MEMORY_USERS.findIndex((mu) => mu.id === u.id || u.email && mu.email === u.email);
        if (existingIdx >= 0) {
          IN_MEMORY_USERS[existingIdx] = { ...IN_MEMORY_USERS[existingIdx], ...u };
        } else {
          IN_MEMORY_USERS.push(u);
        }
      });
      return res.json(allUsers);
    }
  } catch (error) {
  }
  res.json(IN_MEMORY_USERS);
});
app.get("/api/auth/current", async (req, res) => {
  try {
    const queryEmail = req.query.email?.toLowerCase().trim();
    if (queryEmail) {
      let matched = IN_MEMORY_USERS.find((u) => u.email && u.email.toLowerCase() === queryEmail);
      if (!matched) {
        try {
          const dbUsers = await db.select().from(users).where(eq(users.email, queryEmail)).limit(1);
          if (dbUsers.length) matched = dbUsers[0];
        } catch (e) {
        }
      }
      if (matched) {
        return res.json({ success: true, user: matched });
      }
    }
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ user: null, error: "Not authenticated" });
    }
    let profileData = {};
    try {
      if (user.role === "FARMER") {
        const fProf = await db.select().from(farmerProfiles).where(eq(farmerProfiles.userId, user.id)).limit(1);
        const userFarms = await db.select().from(farms).where(eq(farms.farmerId, user.id));
        profileData = { farmerProfile: fProf[0] || null, farms: userFarms };
      } else if (user.role === "BUYER" || user.role === "BUSINESS_BUYER") {
        const bProf = await db.select().from(buyerProfiles).where(eq(buyerProfiles.userId, user.id)).limit(1);
        profileData = { buyerProfile: bProf[0] || null };
      } else if (user.role === "INPUT_SUPPLIER") {
        const sProf = await db.select().from(inputSuppliers).where(eq(inputSuppliers.userId, user.id)).limit(1);
        profileData = { supplierProfile: sProf[0] || null };
      } else if (user.role === "DRIVER") {
        const dProf = await db.select().from(drivers).where(eq(drivers.userId, user.id)).limit(1);
        profileData = { driverProfile: dProf[0] || null };
      }
    } catch (profileErr) {
    }
    res.json({ ...user, ...profileData });
  } catch (error) {
    const fallbackUser = IN_MEMORY_USERS.find((u) => u.id === currentUserId) || IN_MEMORY_USERS[0];
    res.json(fallbackUser);
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      email,
      fullName,
      role,
      phone,
      organizationName,
      region,
      zone,
      woreda,
      nationalIdNumber,
      tinNumber,
      address,
      farmSize,
      primaryCrops,
      farmerClassification,
      targetBuyerTypes,
      buyerType
    } = req.body;
    const cleanFullName = (fullName || "").trim();
    if (!cleanFullName) {
      return res.status(400).json({ error: "Please enter your Full Name." });
    }
    const cleanPhone = (phone || "").trim();
    let cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) {
      const sanitizedPhone = cleanPhone.replace(/\D/g, "");
      if (sanitizedPhone) {
        cleanEmail = `${sanitizedPhone}@agrilink.et`;
      } else {
        const sanitizedName = cleanFullName.toLowerCase().replace(/[^a-z0-9]/g, "");
        cleanEmail = `${sanitizedName || "user"}_${Date.now()}@agrilink.et`;
      }
    }
    const assignedRole = ALL_ROLES.includes(role) ? role : "FARMER";
    let existing = IN_MEMORY_USERS.find((u) => {
      if (u.email && u.email.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && u.phone) {
        const uDigits = u.phone.replace(/\D/g, "");
        const pDigits = cleanPhone.replace(/\D/g, "");
        if (pDigits.length >= 9 && uDigits.endsWith(pDigits.slice(-9))) return true;
        if (u.phone.replace(/\s+/g, "") === cleanPhone.replace(/\s+/g, "")) return true;
      }
      return false;
    });
    if (!existing) {
      try {
        const allUsers = await db.select().from(users);
        existing = allUsers.find((u) => {
          if (u.email && u.email.toLowerCase() === cleanEmail) return true;
          if (cleanPhone && u.phone) {
            const uDigits = u.phone.replace(/\D/g, "");
            const pDigits = cleanPhone.replace(/\D/g, "");
            if (pDigits.length >= 9 && uDigits.endsWith(pDigits.slice(-9))) return true;
          }
          return false;
        });
      } catch (err) {
      }
    }
    if (existing) {
      currentUserId = existing.id;
      if (assignedRole && assignedRole !== existing.role) {
        existing.role = assignedRole;
        try {
          await db.update(users).set({ role: assignedRole, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, existing.id));
        } catch (uErr) {
        }
      }
      return res.status(200).json({
        success: true,
        message: "Welcome! You have been signed in with your account.",
        user: existing
      });
    }
    const uid = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newId = ++nextUserId;
    const memUserRecord = {
      id: newId,
      uid,
      email: cleanEmail,
      fullName: cleanFullName,
      phone: cleanPhone || "0961123330",
      role: assignedRole,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      organizationName: organizationName || (assignedRole === "FARMER" ? `${cleanFullName} Agro Farm` : `${cleanFullName} Trading`),
      region: region || "Oromia",
      zone: zone || "East Shewa",
      woreda: woreda || "Adama",
      nationalIdNumber: nationalIdNumber || null,
      tinNumber: tinNumber || null,
      address: address || `${region || "Addis Ababa"}, Ethiopia`,
      isVerified: false,
      isEmailVerified: false,
      status: "PENDING_VERIFICATION",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    IN_MEMORY_USERS.push(memUserRecord);
    try {
      const newUser = await db.insert(users).values({
        uid,
        email: cleanEmail,
        fullName: cleanFullName,
        phone: cleanPhone || "+251 91 000 0000",
        role: assignedRole,
        organizationName: organizationName || null,
        region: region || "Oromia",
        zone: zone || null,
        woreda: woreda || null,
        nationalIdNumber: nationalIdNumber || null,
        tinNumber: tinNumber || null,
        address: address || null,
        isVerified: false,
        status: "PENDING_VERIFICATION"
      }).returning();
      if (newUser && newUser[0]) {
        memUserRecord.id = newUser[0].id;
      }
    } catch (dbInsertErr) {
      console.warn("DB User insert fallback to in-memory store:", dbInsertErr);
    }
    const devCode = generateVerificationCode(cleanEmail, cleanFullName);
    res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email address to complete activation.",
      requiresEmailVerification: true,
      email: cleanEmail,
      devCode,
      user: memUserRecord
    });
  } catch (error) {
    console.error("Registration server error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/send-verification-code", async (req, res) => {
  try {
    const { email, fullName } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const code = generateVerificationCode(cleanEmail, fullName);
    console.log(`[AgriLink Auth] Verification OTP sent to ${cleanEmail}: ${code}`);
    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      devCode: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/verify-email-code", async (req, res) => {
  try {
    const { email, code, supabaseUid } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanCode = (code || "").toString().trim();
    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ error: "Email and 6-digit verification code are required." });
    }
    const storedData = IN_MEMORY_VERIFICATION_CODES.get(cleanEmail);
    const isMatchingCode = storedData && storedData.code === cleanCode;
    if (!isMatchingCode && !supabaseUid) {
      return res.status(400).json({
        error: "Invalid verification code. Please enter the 6-digit code received in your Gmail inbox."
      });
    }
    let matchedUser = IN_MEMORY_USERS.find(
      (u) => u.email && u.email.toLowerCase() === cleanEmail || supabaseUid && u.uid === supabaseUid
    );
    if (matchedUser) {
      matchedUser.isVerified = true;
      matchedUser.isEmailVerified = true;
      matchedUser.status = "ACTIVE";
      matchedUser.updatedAt = /* @__PURE__ */ new Date();
      currentUserId = matchedUser.id;
    } else {
      const newId = ++nextUserId;
      matchedUser = {
        id: newId,
        uid: supabaseUid || `USR-${Date.now()}`,
        email: cleanEmail,
        fullName: storedData?.fullName || cleanEmail.split("@")[0],
        phone: "0961123330",
        role: "FARMER",
        region: "Oromia",
        isVerified: true,
        isEmailVerified: true,
        status: "ACTIVE",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      IN_MEMORY_USERS.push(matchedUser);
      currentUserId = matchedUser.id;
    }
    try {
      await db.update(users).set({ isVerified: true, status: "ACTIVE", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.email, cleanEmail));
    } catch (dbErr) {
    }
    IN_MEMORY_VERIFICATION_CODES.delete(cleanEmail);
    res.json({
      success: true,
      message: "Email successfully verified! Your account is now fully active.",
      user: matchedUser,
      token: `agrilink-token-${matchedUser.id}-${Date.now()}`
    });
  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) return res.status(400).json({ error: "Email address is required." });
    const code = generateVerificationCode(cleanEmail);
    res.json({
      success: true,
      message: `A fresh 6-digit verification code was sent to ${cleanEmail}.`,
      email: cleanEmail,
      devCode: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, phone, phoneOrEmail, pin } = req.body;
    const queryTerm = (phoneOrEmail || email || phone || "").trim();
    if (!queryTerm) {
      return res.status(400).json({ error: "Please enter your phone number or email address." });
    }
    const cleanTerm = queryTerm.toLowerCase();
    const cleanDigits = queryTerm.replace(/\D/g, "");
    let matchedUser = IN_MEMORY_USERS.find((u) => {
      if (u.email && u.email.toLowerCase() === cleanTerm) return true;
      if (u.phone) {
        const uDigits = u.phone.replace(/\D/g, "");
        if (cleanDigits.length >= 9 && uDigits.endsWith(cleanDigits.slice(-9))) return true;
        if (u.phone.replace(/\s+/g, "") === queryTerm.replace(/\s+/g, "")) return true;
      }
      return false;
    });
    if (!matchedUser) {
      try {
        const allUsers = await db.select().from(users);
        matchedUser = allUsers.find((u) => {
          if (u.email && u.email.toLowerCase() === cleanTerm) return true;
          if (u.phone) {
            const uDigits = u.phone.replace(/\D/g, "");
            if (cleanDigits.length >= 9 && uDigits.endsWith(cleanDigits.slice(-9))) return true;
            if (u.phone.replace(/\s+/g, "") === queryTerm.replace(/\s+/g, "")) return true;
          }
          return false;
        });
        if (matchedUser) {
          IN_MEMORY_USERS.push(matchedUser);
        }
      } catch (err) {
      }
    }
    if (!matchedUser && cleanTerm.includes("@")) {
      try {
        if (isSupabaseConfigured()) {
          const { data } = await supabase.auth.admin.listUsers();
          const sbMatch = data?.users?.find((u) => u.email?.toLowerCase() === cleanTerm);
          if (sbMatch) {
            const isConfirmed = Boolean(sbMatch.email_confirmed_at || sbMatch.confirmed_at);
            const newId = ++nextUserId;
            matchedUser = {
              id: newId,
              uid: sbMatch.id,
              email: sbMatch.email?.toLowerCase(),
              fullName: sbMatch.user_metadata?.full_name || sbMatch.email?.split("@")[0] || "AgriLink Member",
              phone: sbMatch.user_metadata?.phone || "0961123330",
              role: sbMatch.user_metadata?.role || "FARMER",
              organizationName: sbMatch.user_metadata?.organization_name || "AgriLink Member",
              region: sbMatch.user_metadata?.region || "Oromia",
              isVerified: isConfirmed,
              isEmailVerified: isConfirmed,
              status: isConfirmed ? "ACTIVE" : "PENDING_VERIFICATION",
              createdAt: new Date(sbMatch.created_at || Date.now()),
              updatedAt: /* @__PURE__ */ new Date()
            };
            IN_MEMORY_USERS.push(matchedUser);
            try {
              await db.insert(users).values({
                uid: matchedUser.uid,
                email: matchedUser.email,
                fullName: matchedUser.fullName,
                phone: matchedUser.phone,
                role: matchedUser.role,
                organizationName: matchedUser.organizationName,
                region: matchedUser.region,
                isVerified: matchedUser.isVerified,
                status: matchedUser.status
              });
            } catch (insErr) {
            }
          }
        }
      } catch (err) {
      }
    }
    if (!matchedUser) {
      return res.status(404).json({
        error: "No account found matching this phone number or email. Please check your credentials or create a new account."
      });
    }
    if (matchedUser.isEmailVerified === false) {
      let isVerifiedInSupabase = false;
      try {
        if (isSupabaseConfigured() && matchedUser.email) {
          const { data, error } = await supabase.auth.admin.listUsers();
          if (!error && data?.users) {
            const sbMatch = data.users.find(
              (u) => u.email?.toLowerCase() === matchedUser.email.toLowerCase()
            );
            if (sbMatch && (sbMatch.email_confirmed_at || sbMatch.confirmed_at)) {
              isVerifiedInSupabase = true;
              if (sbMatch.id) matchedUser.uid = sbMatch.id;
            }
          }
        }
      } catch (sbErr) {
        console.warn("[AgriLink Auth] Supabase confirmation check notice:", sbErr);
      }
      if (isVerifiedInSupabase) {
        matchedUser.isEmailVerified = true;
        matchedUser.isVerified = true;
        matchedUser.status = "ACTIVE";
        matchedUser.updatedAt = /* @__PURE__ */ new Date();
        try {
          await db.update(users).set({ isVerified: true, status: "ACTIVE", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.email, matchedUser.email.toLowerCase()));
        } catch (dbErr) {
        }
      } else {
        const code = generateVerificationCode(matchedUser.email, matchedUser.fullName);
        return res.status(403).json({
          error: "Email verification required. Please verify your email address before signing in.",
          requiresEmailVerification: true,
          email: matchedUser.email,
          fullName: matchedUser.fullName,
          devCode: code
        });
      }
    }
    currentUserId = matchedUser.id;
    res.json({
      success: true,
      message: "Authenticated successfully",
      user: matchedUser,
      token: `agrilink-token-${matchedUser.id}-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/check-email-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) return res.status(400).json({ error: "Email is required" });
    let isVerifiedInSupabase = false;
    let sbMatch = null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error && data?.users) {
        sbMatch = data.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (sbMatch && (sbMatch.email_confirmed_at || sbMatch.confirmed_at)) {
          isVerifiedInSupabase = true;
        }
      }
    }
    let matchedUser = IN_MEMORY_USERS.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      try {
        const dbUsers = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
        if (dbUsers.length) matchedUser = dbUsers[0];
      } catch (err) {
      }
    }
    if (isVerifiedInSupabase) {
      if (matchedUser) {
        matchedUser.isEmailVerified = true;
        matchedUser.isVerified = true;
        matchedUser.status = "ACTIVE";
        matchedUser.updatedAt = /* @__PURE__ */ new Date();
      } else if (sbMatch) {
        const newId = ++nextUserId;
        matchedUser = {
          id: newId,
          uid: sbMatch.id,
          email: cleanEmail,
          fullName: sbMatch.user_metadata?.full_name || cleanEmail.split("@")[0],
          phone: sbMatch.user_metadata?.phone || "0961123330",
          role: sbMatch.user_metadata?.role || "FARMER",
          organizationName: sbMatch.user_metadata?.organization_name || "AgriLink Member",
          region: sbMatch.user_metadata?.region || "Oromia",
          isVerified: true,
          isEmailVerified: true,
          status: "ACTIVE",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        IN_MEMORY_USERS.push(matchedUser);
      }
      if (matchedUser) {
        try {
          await db.update(users).set({ isVerified: true, status: "ACTIVE", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.email, cleanEmail));
        } catch (dbErr) {
        }
        currentUserId = matchedUser.id;
        return res.json({
          success: true,
          verified: true,
          message: "Email confirmed successfully via Supabase.",
          user: matchedUser,
          token: `agrilink-token-${matchedUser.id}-${Date.now()}`
        });
      }
    }
    return res.json({
      success: false,
      verified: false,
      message: "Email has not yet been confirmed in Supabase. Please check your inbox and click the confirmation link."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/switch-user", async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId && !role) return res.status(400).json({ error: "userId or role is required" });
    let target = null;
    if (userId) {
      const numId = Number(userId);
      try {
        const targetUser = await db.select().from(users).where(eq(users.id, numId)).limit(1);
        if (targetUser.length) target = targetUser[0];
      } catch (err) {
      }
      if (!target) {
        target = IN_MEMORY_USERS.find((u) => u.id === numId);
      }
    }
    if (!target && role) {
      try {
        const targetUser = await db.select().from(users).where(eq(users.role, role)).limit(1);
        if (targetUser.length) target = targetUser[0];
      } catch (err) {
      }
      if (!target) {
        target = IN_MEMORY_USERS.find((u) => u.role === role);
      }
    }
    if (!target) {
      target = IN_MEMORY_USERS[0];
    }
    currentUserId = Number(target.id);
    res.json({ success: true, user: target });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/supabase-sync", async (req, res) => {
  try {
    await initDatabase();
    const {
      supabaseUid,
      email,
      fullName,
      phone,
      role,
      organizationName,
      region,
      zone,
      woreda,
      farmSize,
      primaryCrops,
      farmerClassification,
      buyerType,
      isEmailVerified
    } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanFullName = (fullName || cleanEmail.split("@")[0] || "AgriLink User").trim();
    const assignedRole = ALL_ROLES.includes(role) ? role : "FARMER";
    const cleanUid = supabaseUid || `USR-SB-${Date.now()}`;
    const verifiedStatus = isEmailVerified === true;
    let existingUser = null;
    try {
      const allDbUsers = await db.select().from(users);
      existingUser = allDbUsers.find(
        (u) => u.uid && u.uid === cleanUid || u.email && u.email.toLowerCase() === cleanEmail
      );
    } catch (dbErr) {
    }
    if (!existingUser) {
      existingUser = IN_MEMORY_USERS.find(
        (u) => u.uid && u.uid === cleanUid || u.email && u.email.toLowerCase() === cleanEmail
      );
    }
    if (existingUser) {
      if (isEmailVerified !== void 0) {
        existingUser.isEmailVerified = isEmailVerified;
        existingUser.isVerified = isEmailVerified;
        if (isEmailVerified) existingUser.status = "ACTIVE";
      }
      if (existingUser.isEmailVerified !== false) {
        currentUserId = existingUser.id;
      }
      existingUser.fullName = cleanFullName || existingUser.fullName;
      if (phone) existingUser.phone = phone;
      if (assignedRole) existingUser.role = assignedRole;
      if (organizationName) existingUser.organizationName = organizationName;
      if (region) existingUser.region = region;
      existingUser.updatedAt = /* @__PURE__ */ new Date();
      try {
        await db.update(users).set({
          fullName: existingUser.fullName,
          phone: existingUser.phone,
          role: existingUser.role,
          organizationName: existingUser.organizationName,
          region: existingUser.region,
          isVerified: existingUser.isVerified,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, existingUser.id));
      } catch (updErr) {
      }
      return res.json({
        success: true,
        message: "Supabase session synced successfully",
        user: existingUser
      });
    }
    const newId = ++nextUserId;
    const memUserRecord = {
      id: newId,
      uid: cleanUid,
      email: cleanEmail || `user_${Date.now()}@agrilink.et`,
      fullName: cleanFullName,
      phone: phone || "0961123330",
      role: assignedRole,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      organizationName: organizationName || (assignedRole === "FARMER" ? `${cleanFullName} Agro Farm` : `${cleanFullName} Enterprises`),
      region: region || "Oromia",
      zone: zone || "East Shewa",
      woreda: woreda || "Adama",
      nationalIdNumber: null,
      tinNumber: null,
      address: `${region || "Oromia"}, Ethiopia`,
      isVerified: verifiedStatus,
      isEmailVerified: verifiedStatus,
      status: verifiedStatus ? "ACTIVE" : "PENDING_VERIFICATION",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    IN_MEMORY_USERS.push(memUserRecord);
    if (verifiedStatus) {
      currentUserId = memUserRecord.id;
    }
    const devCode = generateVerificationCode(cleanEmail, cleanFullName);
    try {
      const inserted = await db.insert(users).values({
        uid: cleanUid,
        email: memUserRecord.email,
        fullName: memUserRecord.fullName,
        phone: memUserRecord.phone,
        role: assignedRole,
        organizationName: memUserRecord.organizationName,
        region: memUserRecord.region,
        zone: zone || null,
        woreda: woreda || null,
        address: memUserRecord.address,
        isVerified: verifiedStatus,
        status: verifiedStatus ? "ACTIVE" : "PENDING_VERIFICATION"
      }).returning();
      if (inserted && inserted[0]) {
        memUserRecord.id = inserted[0].id;
        if (verifiedStatus) currentUserId = inserted[0].id;
        if (assignedRole === "FARMER") {
          try {
            await db.insert(farmerProfiles).values({
              userId: inserted[0].id,
              farmName: memUserRecord.organizationName,
              region: memUserRecord.region,
              zone: zone || "East Shewa",
              woreda: woreda || "Adama",
              totalAreaHectares: Number(farmSize) || 2.5,
              primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : ["White Teff (Magna)", "Red Onions"],
              farmingExperienceYears: 4
            });
            await db.insert(farms).values({
              farmerId: inserted[0].id,
              name: memUserRecord.organizationName,
              locationName: `${woreda || "Adama"}, ${region || "Oromia"}`,
              region: memUserRecord.region,
              sizeHectares: Number(farmSize) || 2.5
            });
          } catch (fErr) {
          }
        } else if (assignedRole === "BUYER" || assignedRole === "BUSINESS_BUYER") {
          try {
            await db.insert(buyerProfiles).values({
              userId: inserted[0].id,
              buyerType: buyerType || "COMMERCIAL_PROCESSOR",
              companyName: memUserRecord.organizationName,
              deliveryAddress: `${region || "Addis Ababa"}, Ethiopia`
            });
          } catch (bErr) {
          }
        }
      }
    } catch (dbErr) {
      console.warn("DB User insert on Supabase sync fallback:", dbErr);
    }
    res.status(201).json({
      success: true,
      message: "New Supabase user account registered & synced",
      user: memUserRecord,
      devCode
    });
  } catch (error) {
    console.error("Supabase sync route error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/auth/supabase-status", async (req, res) => {
  try {
    const config2 = getSupabaseConfig();
    const conn = await testSupabaseConnection();
    res.json({
      configured: Boolean(config2.url && config2.key),
      endpoint: config2.url,
      connection: conn
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/survey", async (req, res) => {
  try {
    const { satisfactionRating, feedbackText, userRole, userId, userEmail } = req.body;
    const record = {
      id: `SURV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      satisfactionRating: satisfactionRating || "Completely satisfied",
      feedbackText: feedbackText || "",
      userRole: userRole || "GENERAL",
      userId: userId || currentUserId,
      userEmail: userEmail || "anonymous@agrilink.et",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    SURVEY_RESPONSES.push(record);
    try {
      await supabase.from("user_surveys").insert([
        {
          survey_id: record.id,
          user_id: record.userId ? Number(record.userId) : null,
          user_email: record.userEmail,
          user_role: record.userRole,
          satisfaction_rating: record.satisfactionRating,
          feedback_text: record.feedbackText
        }
      ]);
    } catch (supaErr) {
    }
    res.json({
      success: true,
      message: "Thank you for your feedback on AgriLink!",
      survey: record
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/survey", (req, res) => {
  res.json({ responses: SURVEY_RESPONSES, count: SURVEY_RESPONSES.length });
});
app.get("/api/supabase/status", async (req, res) => {
  try {
    const conn = await testSupabaseConnection();
    const config2 = getSupabaseConfig();
    res.json({
      connected: conn.ok,
      projectUrl: config2.url,
      message: conn.message,
      configuredKey: config2.key ? `${config2.key.substring(0, 12)}...` : "not_set",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});
app.post("/api/auth/sync", async (req, res) => {
  try {
    const { uid, email, fullName, role, phone, organizationName, region } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "uid and email are required" });
    }
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length) {
      currentUserId = existing[0].id;
      return res.json({ user: existing[0], isNew: false });
    }
    const newUser = await db.insert(users).values({
      uid,
      email,
      fullName: fullName || email.split("@")[0],
      phone: phone || "+251 91 000 0000",
      role: role || "BUYER",
      organizationName: organizationName || null,
      region: region || "Addis Ababa",
      isVerified: false
    }).returning();
    currentUserId = newUser[0].id;
    if (role === "FARMER") {
      await db.insert(farmerProfiles).values({
        userId: newUser[0].id,
        farmName: `${newUser[0].fullName}'s Farm`,
        region: region || "Oromia",
        totalAreaHectares: 2
      });
    } else {
      await db.insert(buyerProfiles).values({
        userId: newUser[0].id,
        buyerType: role === "BUSINESS_BUYER" ? "BUSINESS" : "INDIVIDUAL",
        companyName: organizationName || null
      });
    }
    res.json({ user: newUser[0], isNew: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/categories", async (req, res) => {
  try {
    const cats = await db.select().from(productCategories).orderBy(productCategories.id);
    const subcats = await db.select().from(productSubcategories).orderBy(productSubcategories.name);
    const prods = await db.select({ categoryId: products.categoryId }).from(products).where(eq(products.status, "ACTIVE"));
    const catsWithDetails = cats.map((cat) => {
      const catSubs = subcats.filter((s) => s.categoryId === cat.id);
      const count = prods.filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat,
        subcategories: catSubs,
        productCount: count
      };
    });
    res.json(catsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/subcategories", async (req, res) => {
  try {
    const { category, categoryId } = req.query;
    let query = db.select().from(productSubcategories).orderBy(productSubcategories.name);
    let results = await query;
    if (categoryId) {
      results = results.filter((s) => s.categoryId === Number(categoryId));
    }
    if (category) {
      const matchingCat = await db.select().from(productCategories).where(eq(productCategories.slug, String(category))).limit(1);
      if (matchingCat.length) {
        results = results.filter((s) => s.categoryId === matchingCat[0].id);
      }
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      productType,
      search,
      grade,
      region,
      freshness,
      organic,
      verified,
      liveAnimal,
      farmerId,
      minPrice,
      maxPrice,
      targetBuyer,
      sortBy
    } = req.query;
    const productList = await db.select({
      id: products.id,
      farmerId: products.farmerId,
      farmId: products.farmId,
      categoryId: products.categoryId,
      subcategoryId: products.subcategoryId,
      name: products.name,
      subcategory: products.subcategory,
      productType: products.productType,
      variety: products.variety,
      description: products.description,
      grade: products.grade,
      qualityGrade: products.qualityGrade,
      pricePerUnitEtb: products.pricePerUnitEtb,
      currency: products.currency,
      unit: products.unit,
      availableQuantity: products.availableQuantity,
      minOrderQuantity: products.minOrderQuantity,
      maxOrderQuantity: products.maxOrderQuantity,
      harvestDate: products.harvestDate,
      productionDate: products.productionDate,
      expirationDate: products.expirationDate,
      freshnessStatus: products.freshnessStatus,
      expectedAvailability: products.expectedAvailability,
      farmLocation: products.farmLocation,
      region: products.region,
      zone: products.zone,
      woreda: products.woreda,
      townCity: products.townCity,
      altitudeMeters: products.altitudeMeters,
      originDetails: products.originDetails,
      processingMethod: products.processingMethod,
      harvestYear: products.harvestYear,
      storageRequirements: products.storageRequirements,
      packagingType: products.packagingType,
      ingredients: products.ingredients,
      isLiveAnimal: products.isLiveAnimal,
      animalBreed: products.animalBreed,
      veterinaryCertificate: products.veterinaryCertificate,
      images: products.images,
      lotBatchNumber: products.lotBatchNumber,
      qualityScore: products.qualityScore,
      certifications: products.certifications,
      isOrganic: products.isOrganic,
      isVerifiedFarmer: products.isVerifiedFarmer,
      deliveryAvailability: products.deliveryAvailability,
      status: products.status,
      shelfLifeDays: products.shelfLifeDays,
      attributes: products.attributes,
      farmerName: users.fullName,
      farmerRating: farmerProfiles.rating,
      farmerVerified: users.isVerified,
      farmerBio: farmerProfiles.bio,
      farmerExperienceYears: farmerProfiles.farmingExperienceYears,
      farmerCompletedOrders: farmerProfiles.completedOrdersCount,
      farmName: farms.name,
      categoryName: productCategories.name,
      categorySlug: productCategories.slug
    }).from(products).leftJoin(users, eq(products.farmerId, users.id)).leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId)).leftJoin(farms, eq(products.farmId, farms.id)).leftJoin(productCategories, eq(products.categoryId, productCategories.id)).where(eq(products.status, "ACTIVE")).orderBy(desc(products.id));
    const enhancedProducts = productList.map((p) => {
      let targetBuyerType = "ALL";
      let targetBuyerNotes = "Open to all verified buyers, food processors, retail chains & individual buyers.";
      if (p.grade === "PROCESSING_GRADE" || p.productType === "PROCESSED_FOOD" || p.name.toLowerCase().includes("flour") || p.name.toLowerCase().includes("paste")) {
        targetBuyerType = "PROCESSOR";
        targetBuyerNotes = "Targeted for Food Processors, Canneries & Industrial Mills (High volume bulk delivery & forward contracting).";
      } else if (p.grade === "PREMIUM" || p.grade === "GRADE_1_EXPORT" || p.productType === "COFFEE" || p.productType === "OILSEED" || p.name.toLowerCase().includes("avocado") || p.name.toLowerCase().includes("yirgacheffe")) {
        targetBuyerType = "INVESTOR";
        targetBuyerNotes = "Targeted for Agri-Investors & Exporters (Certified export outgrower lots with verifiable traceability).";
      } else {
        targetBuyerType = "BUYER";
        targetBuyerNotes = "Targeted for Supermarkets, Hotels & Retail Wholesalers (Fresh cold-chain dispatch).";
      }
      return {
        ...p,
        targetBuyerType,
        targetBuyerNotes
      };
    });
    let filtered = enhancedProducts;
    if (category) {
      const catParam = String(category).toLowerCase();
      filtered = filtered.filter(
        (p) => p.categorySlug?.toLowerCase() === catParam || String(p.categoryId) === catParam || p.categoryName?.toLowerCase() === catParam
      );
    }
    if (subcategory) {
      const subParam = String(subcategory).toLowerCase();
      filtered = filtered.filter(
        (p) => p.subcategory?.toLowerCase().includes(subParam) || p.name.toLowerCase().includes(subParam)
      );
    }
    if (productType) {
      filtered = filtered.filter((p) => p.productType === String(productType));
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.variety && p.variety.toLowerCase().includes(q) || p.subcategory && p.subcategory.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.farmerName && p.farmerName.toLowerCase().includes(q) || p.region && p.region.toLowerCase().includes(q) || p.farmLocation && p.farmLocation.toLowerCase().includes(q) || p.zone && p.zone.toLowerCase().includes(q) || p.categoryName && p.categoryName.toLowerCase().includes(q)
      );
    }
    if (grade) {
      filtered = filtered.filter((p) => p.grade === String(grade) || p.qualityGrade === String(grade));
    }
    if (region && region !== "ALL") {
      filtered = filtered.filter((p) => p.region.toLowerCase() === String(region).toLowerCase());
    }
    if (freshness) {
      filtered = filtered.filter((p) => p.freshnessStatus === String(freshness));
    }
    if (organic === "true") {
      filtered = filtered.filter((p) => p.isOrganic === true);
    }
    if (verified === "true") {
      filtered = filtered.filter((p) => p.farmerVerified === true || p.isVerifiedFarmer === true);
    }
    if (liveAnimal === "true") {
      filtered = filtered.filter((p) => p.isLiveAnimal === true);
    }
    if (farmerId) {
      filtered = filtered.filter((p) => p.farmerId === Number(farmerId));
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.pricePerUnitEtb >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.pricePerUnitEtb <= Number(maxPrice));
    }
    if (targetBuyer && targetBuyer !== "ALL") {
      filtered = filtered.filter(
        (p) => p.targetBuyerType === String(targetBuyer) || p.targetBuyerType === "ALL"
      );
    }
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.pricePerUnitEtb - b.pricePerUnitEtb);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.pricePerUnitEtb - a.pricePerUnitEtb);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.farmerRating || 0) - (a.farmerRating || 0));
    } else if (sortBy === "harvest_recent") {
      filtered.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    }
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/products/:id", async (req, res) => {
  try {
    const prodId = Number(req.params.id);
    const prodList = await db.select({
      id: products.id,
      farmerId: products.farmerId,
      farmId: products.farmId,
      categoryId: products.categoryId,
      subcategoryId: products.subcategoryId,
      name: products.name,
      subcategory: products.subcategory,
      productType: products.productType,
      variety: products.variety,
      description: products.description,
      grade: products.grade,
      qualityGrade: products.qualityGrade,
      pricePerUnitEtb: products.pricePerUnitEtb,
      currency: products.currency,
      unit: products.unit,
      availableQuantity: products.availableQuantity,
      minOrderQuantity: products.minOrderQuantity,
      maxOrderQuantity: products.maxOrderQuantity,
      harvestDate: products.harvestDate,
      productionDate: products.productionDate,
      expirationDate: products.expirationDate,
      freshnessStatus: products.freshnessStatus,
      expectedAvailability: products.expectedAvailability,
      farmLocation: products.farmLocation,
      region: products.region,
      zone: products.zone,
      woreda: products.woreda,
      townCity: products.townCity,
      altitudeMeters: products.altitudeMeters,
      originDetails: products.originDetails,
      processingMethod: products.processingMethod,
      harvestYear: products.harvestYear,
      storageRequirements: products.storageRequirements,
      packagingType: products.packagingType,
      ingredients: products.ingredients,
      isLiveAnimal: products.isLiveAnimal,
      animalBreed: products.animalBreed,
      veterinaryCertificate: products.veterinaryCertificate,
      images: products.images,
      lotBatchNumber: products.lotBatchNumber,
      qualityScore: products.qualityScore,
      certifications: products.certifications,
      isOrganic: products.isOrganic,
      isVerifiedFarmer: products.isVerifiedFarmer,
      deliveryAvailability: products.deliveryAvailability,
      status: products.status,
      shelfLifeDays: products.shelfLifeDays,
      attributes: products.attributes,
      farmerName: users.fullName,
      farmerPhone: users.phone,
      farmerEmail: users.email,
      farmerAvatar: users.avatarUrl,
      farmerRating: farmerProfiles.rating,
      farmerVerified: users.isVerified,
      farmerBio: farmerProfiles.bio,
      farmerExperienceYears: farmerProfiles.farmingExperienceYears,
      farmerCompletedOrders: farmerProfiles.completedOrdersCount,
      farmName: farms.name,
      farmSoil: farms.soilType,
      farmIrrigation: farms.irrigationType,
      categoryName: productCategories.name,
      categorySlug: productCategories.slug
    }).from(products).leftJoin(users, eq(products.farmerId, users.id)).leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId)).leftJoin(farms, eq(products.farmId, farms.id)).leftJoin(productCategories, eq(products.categoryId, productCategories.id)).where(eq(products.id, prodId)).limit(1);
    if (!prodList.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    const inspections = await db.select().from(qualityInspections).where(eq(qualityInspections.productId, prodId));
    const prodReviews = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      reviewerName: users.fullName
    }).from(reviews).leftJoin(users, eq(reviews.reviewerId, users.id)).where(and(eq(reviews.targetType, "PRODUCT"), eq(reviews.targetId, prodId)));
    res.json({
      ...prodList[0],
      inspections,
      reviews: prodReviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      categoryId,
      subcategoryId,
      subcategory,
      productType,
      variety,
      description,
      grade,
      qualityGrade,
      pricePerUnitEtb,
      currency,
      unit,
      availableQuantity,
      minOrderQuantity,
      maxOrderQuantity,
      harvestDate,
      productionDate,
      expirationDate,
      freshnessStatus,
      expectedAvailability,
      farmLocation,
      region,
      zone,
      woreda,
      townCity,
      altitudeMeters,
      originDetails,
      processingMethod,
      harvestYear,
      storageRequirements,
      packagingType,
      ingredients,
      isLiveAnimal,
      animalBreed,
      veterinaryCertificate,
      images,
      lotBatchNumber,
      certifications,
      isOrganic,
      shelfLifeDays,
      deliveryAvailability,
      attributes,
      farmId
    } = req.body;
    if (!name || !pricePerUnitEtb || !unit) {
      return res.status(400).json({ error: "Product name, price, and unit are required." });
    }
    const assignedGrade = qualityGrade || grade || "GRADE_1_LOCAL";
    const assignedType = productType || "FRESH_FOOD";
    const newProd = await db.insert(products).values({
      farmerId: currentUserId,
      farmId: farmId ? Number(farmId) : null,
      categoryId: Number(categoryId) || 1,
      subcategoryId: subcategoryId ? Number(subcategoryId) : null,
      name,
      subcategory: subcategory || null,
      productType: assignedType,
      variety: variety || "",
      description: description || "",
      grade: assignedGrade,
      qualityGrade: assignedGrade,
      pricePerUnitEtb: Number(pricePerUnitEtb),
      currency: currency || "ETB",
      unit: unit || "KG",
      availableQuantity: Number(availableQuantity) || 10,
      minOrderQuantity: Number(minOrderQuantity) || 1,
      maxOrderQuantity: maxOrderQuantity ? Number(maxOrderQuantity) : null,
      harvestDate: harvestDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      productionDate: productionDate || null,
      expirationDate: expirationDate || null,
      freshnessStatus: freshnessStatus || "AVAILABLE_NOW",
      expectedAvailability: expectedAvailability || "Immediate Dispatch",
      farmLocation: farmLocation || "Ethiopia",
      region: region || "Oromia",
      zone: zone || null,
      woreda: woreda || null,
      townCity: townCity || null,
      altitudeMeters: altitudeMeters ? Number(altitudeMeters) : null,
      originDetails: originDetails || null,
      processingMethod: processingMethod || null,
      harvestYear: harvestYear ? Number(harvestYear) : (/* @__PURE__ */ new Date()).getFullYear(),
      storageRequirements: storageRequirements || null,
      packagingType: packagingType || null,
      ingredients: ingredients || null,
      isLiveAnimal: Boolean(isLiveAnimal),
      animalBreed: animalBreed || null,
      veterinaryCertificate: veterinaryCertificate || null,
      images: images && images.length ? images : ["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"],
      lotBatchNumber: lotBatchNumber || `LOT-AGR-${Date.now().toString().slice(-6)}`,
      qualityScore: 98,
      certifications: Array.isArray(certifications) ? certifications : ["Verified Farmer Inspection"],
      isOrganic: Boolean(isOrganic),
      isVerifiedFarmer: true,
      deliveryAvailability: deliveryAvailability || "ALL_ETHIOPIA",
      status: "ACTIVE",
      shelfLifeDays: Number(shelfLifeDays) || 14,
      attributes: attributes || null
    }).returning();
    res.status(201).json(newProd[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/products/:id", async (req, res) => {
  try {
    const prodId = Number(req.params.id);
    const updated = await db.update(products).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, prodId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/products/:id/inventory", async (req, res) => {
  try {
    const prodId = Number(req.params.id);
    const { availableQuantity, status } = req.body;
    const qty = Number(availableQuantity);
    const newStatus = status || (qty <= 0 ? "OUT_OF_STOCK" : "ACTIVE");
    const updated = await db.update(products).set({
      availableQuantity: qty,
      status: newStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, prodId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/products/:id/price", async (req, res) => {
  try {
    const prodId = Number(req.params.id);
    const { pricePerUnitEtb } = req.body;
    const updated = await db.update(products).set({
      pricePerUnitEtb: Number(pricePerUnitEtb),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, prodId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/products/:id", async (req, res) => {
  try {
    const prodId = Number(req.params.id);
    await db.update(products).set({ status: "ARCHIVED", updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, prodId));
    res.json({ success: true, message: "Product archived successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/farmers", async (req, res) => {
  try {
    const farmerList = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      region: users.region,
      isVerified: users.isVerified,
      farmName: farmerProfiles.farmName,
      totalAreaHectares: farmerProfiles.totalAreaHectares,
      primaryCrops: farmerProfiles.primaryCrops,
      farmingExperienceYears: farmerProfiles.farmingExperienceYears,
      bio: farmerProfiles.bio,
      rating: farmerProfiles.rating,
      completedOrdersCount: farmerProfiles.completedOrdersCount,
      totalProduceSoldTons: farmerProfiles.totalProduceSoldTons,
      isCertifiedOrganic: farmerProfiles.isCertifiedOrganic
    }).from(users).innerJoin(farmerProfiles, eq(users.id, farmerProfiles.userId)).where(eq(users.role, "FARMER"));
    res.json(farmerList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/farmers/:id", async (req, res) => {
  try {
    const farmerId = Number(req.params.id);
    const userRes = await db.select().from(users).where(eq(users.id, farmerId)).limit(1);
    if (!userRes.length) return res.status(404).json({ error: "Farmer not found" });
    const profileRes = await db.select().from(farmerProfiles).where(eq(farmerProfiles.userId, farmerId)).limit(1);
    const farmerFarms = await db.select().from(farms).where(eq(farms.farmerId, farmerId));
    const farmIds = farmerFarms.map((f) => f.id);
    let farmFieldsList = [];
    if (farmIds.length) {
      farmFieldsList = await db.select().from(farmFields);
      farmFieldsList = farmFieldsList.filter((f) => farmIds.includes(f.farmId));
    }
    const farmerProds = await db.select().from(products).where(eq(products.farmerId, farmerId));
    const farmerReviews = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      reviewerName: users.fullName
    }).from(reviews).leftJoin(users, eq(reviews.reviewerId, users.id)).where(and(eq(reviews.targetType, "FARMER"), eq(reviews.targetId, farmerId)));
    res.json({
      ...userRes[0],
      profile: profileRes[0] || null,
      farms: farmerFarms.map((fm) => ({
        ...fm,
        fields: farmFieldsList.filter((fld) => fld.farmId === fm.id)
      })),
      products: farmerProds,
      reviews: farmerReviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/farms", async (req, res) => {
  try {
    const { name, locationName, region, sizeHectares, soilType, irrigationType, certifications } = req.body;
    const newFarm = await db.insert(farms).values({
      farmerId: currentUserId,
      name: name || "My Commercial Estate",
      locationName: locationName || "Oromia Region",
      region: region || "Oromia",
      sizeHectares: Number(sizeHectares) || 2.5,
      soilType: soilType || "Clay Loam",
      irrigationType: irrigationType || "Drip & Rainfed",
      certifications: certifications || ["Traceable Origin"]
    }).returning();
    res.json(newFarm[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/farms/:farmId/fields", async (req, res) => {
  try {
    const farmId = Number(req.params.farmId);
    const { fieldName, areaHectares, currentCrop, variety, plantingDate, expectedHarvestDate, notes } = req.body;
    const newField = await db.insert(farmFields).values({
      farmId,
      fieldName,
      areaHectares: Number(areaHectares) || 1,
      currentCrop,
      variety: variety || "",
      plantingDate: plantingDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      expectedHarvestDate: expectedHarvestDate || "",
      status: "GROWING",
      healthScore: 96,
      soilMoisturePercent: 70,
      notes: notes || ""
    }).returning();
    res.json(newField[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/input-categories", async (req, res) => {
  try {
    const cats = await db.select().from(inputCategories);
    res.json(cats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/inputs", async (req, res) => {
  try {
    const { category, search } = req.query;
    let list = await db.select({
      id: inputProducts.id,
      supplierId: inputProducts.supplierId,
      categoryId: inputProducts.categoryId,
      name: inputProducts.name,
      brand: inputProducts.brand,
      description: inputProducts.description,
      priceEtb: inputProducts.priceEtb,
      unit: inputProducts.unit,
      stockQuantity: inputProducts.stockQuantity,
      minOrderQuantity: inputProducts.minOrderQuantity,
      specifications: inputProducts.specifications,
      applicationGuide: inputProducts.applicationGuide,
      images: inputProducts.images,
      isCertified: inputProducts.isCertified,
      status: inputProducts.status,
      supplierName: inputSuppliers.companyName,
      supplierVerified: inputSuppliers.isVerified,
      categoryName: inputCategories.name,
      categorySlug: inputCategories.slug
    }).from(inputProducts).leftJoin(inputSuppliers, eq(inputProducts.supplierId, inputSuppliers.id)).leftJoin(inputCategories, eq(inputProducts.categoryId, inputCategories.id)).orderBy(desc(inputProducts.id));
    if (category) {
      list = list.filter((p) => p.categorySlug === String(category) || p.categoryId === Number(category));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/inputs", async (req, res) => {
  try {
    const { categoryId, name, brand, description, priceEtb, unit, stockQuantity, minOrderQuantity, specifications, applicationGuide, images } = req.body;
    let supp = await db.select().from(inputSuppliers).where(eq(inputSuppliers.userId, currentUserId)).limit(1);
    let supplierId = supp[0]?.id;
    if (!supplierId) {
      const firstSupp = await db.select().from(inputSuppliers).limit(1);
      supplierId = firstSupp[0]?.id || 1;
    }
    const newInProd = await db.insert(inputProducts).values({
      supplierId,
      categoryId: Number(categoryId) || 1,
      name,
      brand,
      description,
      priceEtb: Number(priceEtb),
      unit: unit || "BAG",
      stockQuantity: Number(stockQuantity) || 50,
      minOrderQuantity: Number(minOrderQuantity) || 1,
      specifications: specifications || "",
      applicationGuide: applicationGuide || "",
      images: images && images.length ? images : ["https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80"],
      isCertified: true
    }).returning();
    res.json(newInProd[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cart", async (req, res) => {
  try {
    let userCart = await db.select().from(carts).where(eq(carts.userId, currentUserId)).limit(1);
    if (!userCart.length) {
      userCart = await db.insert(carts).values({ userId: currentUserId }).returning();
    }
    const cartId = userCart[0].id;
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    const hydrated = await Promise.all(
      items.map(async (item) => {
        if (item.itemType === "PRODUCE" && item.productId) {
          const p = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
          return { ...item, product: p[0] || null };
        } else if (item.itemType === "INPUT" && item.inputProductId) {
          const ip = await db.select().from(inputProducts).where(eq(inputProducts.id, item.inputProductId)).limit(1);
          return { ...item, inputProduct: ip[0] || null };
        }
        return item;
      })
    );
    const subtotal = hydrated.reduce((acc, curr) => acc + curr.quantity * curr.unitPriceEtb, 0);
    const deliveryFee = subtotal > 0 ? subtotal > 2e4 ? 0 : 2500 : 0;
    const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.02) : 0;
    res.json({
      cartId,
      items: hydrated,
      subtotalEtb: subtotal,
      deliveryFeeEtb: deliveryFee,
      serviceFeeEtb: serviceFee,
      grandTotalEtb: subtotal + deliveryFee + serviceFee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cart/items", async (req, res) => {
  try {
    const { itemType, productId, inputProductId, quantity, unitPriceEtb } = req.body;
    let userCart = await db.select().from(carts).where(eq(carts.userId, currentUserId)).limit(1);
    if (!userCart.length) {
      userCart = await db.insert(carts).values({ userId: currentUserId }).returning();
    }
    const cartId = userCart[0].id;
    const existing = await db.select().from(cartItems).where(
      and(
        eq(cartItems.cartId, cartId),
        itemType === "PRODUCE" ? eq(cartItems.productId, Number(productId)) : eq(cartItems.inputProductId, Number(inputProductId))
      )
    ).limit(1);
    if (existing.length) {
      const updated = await db.update(cartItems).set({ quantity: existing[0].quantity + Number(quantity) }).where(eq(cartItems.id, existing[0].id)).returning();
      return res.json(updated[0]);
    }
    const newItem = await db.insert(cartItems).values({
      cartId,
      itemType: itemType || "PRODUCE",
      productId: productId ? Number(productId) : null,
      inputProductId: inputProductId ? Number(inputProductId) : null,
      quantity: Number(quantity) || 1,
      unitPriceEtb: Number(unitPriceEtb)
    }).returning();
    res.json(newItem[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/cart/items/:id", async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return res.json({ deleted: true });
    }
    const updated = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/cart/items/:id", async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/cart", async (req, res) => {
  try {
    const userCart = await db.select().from(carts).where(eq(carts.userId, currentUserId)).limit(1);
    if (userCart.length) {
      await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/orders/checkout", async (req, res) => {
  try {
    const {
      deliveryAddress,
      deliveryRegion,
      deliveryZone,
      deliveryWoreda,
      deliveryContactName,
      deliveryContactPhone,
      deliveryModel,
      hubId,
      nationalIdNumber,
      tinNumber,
      payerAccountNumber,
      notes,
      paymentMethod
    } = req.body;
    const userCart = await db.select().from(carts).where(eq(carts.userId, currentUserId)).limit(1);
    if (!userCart.length) return res.status(400).json({ error: "Cart is empty" });
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    if (!items.length) return res.status(400).json({ error: "Cart has no items" });
    let subtotal = 0;
    const orderItemsToInsert = [];
    for (const item of items) {
      const itemSubtotal = item.quantity * item.unitPriceEtb;
      subtotal += itemSubtotal;
      let sellerId = 1;
      let name = "Agricultural Produce";
      let grade = "GRADE_1_LOCAL";
      let unit = "KG";
      let lotBatchNumber = "LOT-DEFAULT";
      if (item.itemType === "PRODUCE" && item.productId) {
        const p = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (p.length) {
          sellerId = p[0].farmerId;
          name = p[0].name;
          grade = p[0].grade;
          unit = p[0].unit;
          lotBatchNumber = p[0].lotBatchNumber;
        }
      } else if (item.itemType === "INPUT" && item.inputProductId) {
        const ip = await db.select().from(inputProducts).where(eq(inputProducts.id, item.inputProductId)).limit(1);
        if (ip.length) {
          const supp = await db.select().from(inputSuppliers).where(eq(inputSuppliers.id, ip[0].supplierId)).limit(1);
          sellerId = supp[0]?.userId || 1;
          name = ip[0].name;
          unit = ip[0].unit;
        }
      }
      orderItemsToInsert.push({
        itemType: item.itemType,
        productId: item.productId,
        inputProductId: item.inputProductId,
        sellerId,
        name,
        grade,
        unit,
        quantity: item.quantity,
        unitPriceEtb: item.unitPriceEtb,
        subtotalEtb: itemSubtotal,
        lotBatchNumber
      });
    }
    const deliveryFee = subtotal > 2e4 ? 0 : 2500;
    const serviceFee = Math.round(subtotal * 0.02);
    const grandTotal = subtotal + deliveryFee + serviceFee;
    const orderNum = `AGR-${(/* @__PURE__ */ new Date()).getFullYear()}-${String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newOrder = await db.insert(orders).values({
      orderNumber: orderNum,
      buyerId: currentUserId,
      orderType: "PRODUCE",
      totalAmountEtb: subtotal,
      deliveryFeeEtb: deliveryFee,
      serviceFeeEtb: serviceFee,
      grandTotalEtb: grandTotal,
      paymentStatus: "PAID",
      // Directly simulate verified payment
      orderStatus: "CONFIRMED",
      deliveryModel: deliveryModel || "DIRECT",
      hubId: hubId ? Number(hubId) : null,
      deliveryAddress: deliveryAddress || "Addis Ababa, Ethiopia",
      deliveryRegion: deliveryRegion || "Addis Ababa",
      deliveryZone: deliveryZone || null,
      deliveryWoreda: deliveryWoreda || null,
      nationalIdNumber: nationalIdNumber || null,
      tinNumber: tinNumber || null,
      payerAccountNumber: payerAccountNumber || null,
      deliveryContactName: deliveryContactName || "Customer",
      deliveryContactPhone: deliveryContactPhone || "+251 91 000 0000",
      requestedDeliveryDate: new Date(Date.now() + 864e5 * 2).toISOString().split("T")[0],
      notes: notes || ""
    }).returning();
    const createdOrder = newOrder[0];
    for (const oi of orderItemsToInsert) {
      await db.insert(orderItems).values({
        ...oi,
        orderId: createdOrder.id
      });
      if (oi.itemType === "PRODUCE" && oi.productId) {
        const prod = await db.select().from(products).where(eq(products.id, oi.productId)).limit(1);
        if (prod.length) {
          const newQty = Math.max(0, prod[0].availableQuantity - oi.quantity);
          const newStatus = newQty === 0 ? "OUT_OF_STOCK" : prod[0].status;
          await db.update(products).set({ availableQuantity: newQty, status: newStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, oi.productId));
        }
      } else if (oi.itemType === "INPUT" && oi.inputProductId) {
        const inp = await db.select().from(inputProducts).where(eq(inputProducts.id, oi.inputProductId)).limit(1);
        if (inp.length) {
          const newQty = Math.max(0, inp[0].stockQuantity - oi.quantity);
          await db.update(inputProducts).set({ stockQuantity: newQty }).where(eq(inputProducts.id, oi.inputProductId));
        }
      }
    }
    const txRef = `TX-${(paymentMethod || "CHAPA").toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await db.insert(payments).values({
      orderId: createdOrder.id,
      userId: currentUserId,
      amountEtb: grandTotal,
      currency: "ETB",
      provider: paymentMethod || "CHAPA",
      transactionRef: txRef,
      status: "PAID",
      paymentMethod: "MOBILE_MONEY_OR_CARD",
      payerAccountNumber: payerAccountNumber || null,
      paidAt: /* @__PURE__ */ new Date()
    });
    try {
      const availDriver = await db.select().from(drivers).where(eq(drivers.currentStatus, "AVAILABLE")).limit(1);
      await db.insert(deliveries).values({
        orderId: createdOrder.id,
        driverId: availDriver[0]?.id || null,
        deliveryModel: deliveryModel || "DIRECT",
        hubId: hubId ? Number(hubId) : null,
        pickupLocation: "Farmer Regional Farm & Hub Gateway",
        dropoffLocation: `${deliveryAddress || "Addis Ababa"}${deliveryWoreda ? `, ${deliveryWoreda}` : ""}`,
        status: "ASSIGNED",
        estimatedArrival: "Estimated Delivery in 24-48 Hours"
      });
    } catch (deliveryErr) {
      console.warn("Delivery record creation failed (non-fatal):", deliveryErr.message);
    }
    await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    try {
      await db.insert(notifications).values({
        userId: currentUserId,
        title: `Order Placed: ${orderNum}`,
        message: `Your agricultural order for ${grandTotal.toLocaleString()} ETB was placed and confirmed.`,
        type: "ORDER",
        linkUrl: "/buyer/orders"
      });
    } catch (notifErr) {
      console.warn("Notification insert failed (non-fatal):", notifErr.message);
    }
    res.json({ success: true, order: createdOrder, transactionRef: txRef });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const { role } = req.query;
    let orderList = [];
    if (role === "FARMER") {
      const sellerItems = await db.select().from(orderItems).where(eq(orderItems.sellerId, currentUserId));
      const orderIds = Array.from(new Set(sellerItems.map((si) => si.orderId)));
      if (orderIds.length) {
        orderList = await db.select().from(orders).orderBy(desc(orders.id));
        orderList = orderList.filter((o) => orderIds.includes(o.id));
      }
    } else if (role === "BUYER" || role === "BUSINESS_BUYER") {
      orderList = await db.select().from(orders).where(eq(orders.buyerId, currentUserId)).orderBy(desc(orders.id));
    } else {
      orderList = await db.select().from(orders).orderBy(desc(orders.id));
    }
    const hydrated = await Promise.all(
      orderList.map(async (ord) => {
        const b = await db.select().from(users).where(eq(users.id, ord.buyerId)).limit(1);
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
        const del = await db.select().from(deliveries).where(eq(deliveries.orderId, ord.id)).limit(1);
        return {
          ...ord,
          buyerName: b[0]?.fullName || "Buyer",
          items,
          delivery: del[0] || null
        };
      })
    );
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const ord = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!ord.length) return res.status(404).json({ error: "Order not found" });
    const buyer = await db.select().from(users).where(eq(users.id, ord[0].buyerId)).limit(1);
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const del = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId)).limit(1);
    const pay = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    let driverData = null;
    if (del[0]?.driverId) {
      const drv = await db.select().from(drivers).where(eq(drivers.id, del[0].driverId)).limit(1);
      driverData = drv[0] || null;
    }
    res.json({
      ...ord[0],
      buyer: buyer[0] || null,
      items,
      delivery: del[0] ? { ...del[0], driver: driverData } : null,
      payment: pay[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status, notes } = req.body;
    const updated = await db.update(orders).set({ orderStatus: status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, orderId)).returning();
    await db.insert(orderStatusHistory).values({
      orderId,
      status,
      notes: notes || `Status updated to ${status}`,
      actorId: currentUserId
    });
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/hubs", async (req, res) => {
  try {
    const allHubs = await db.select().from(hubs).orderBy(hubs.id);
    res.json(allHubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/drivers", async (req, res) => {
  try {
    const allDrivers = await db.select().from(drivers).orderBy(drivers.id);
    res.json(allDrivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/logistics/deliveries", async (req, res) => {
  try {
    const allDel = await db.select().from(deliveries).orderBy(desc(deliveries.id));
    const hydrated = await Promise.all(
      allDel.map(async (d) => {
        const ord = await db.select().from(orders).where(eq(orders.id, d.orderId)).limit(1);
        const drv = d.driverId ? await db.select().from(drivers).where(eq(drivers.id, d.driverId)).limit(1) : [];
        const hb = d.hubId ? await db.select().from(hubs).where(eq(hubs.id, d.hubId)).limit(1) : [];
        return {
          ...d,
          orderNumber: ord[0]?.orderNumber || `ORD-${d.orderId}`,
          orderAmount: ord[0]?.grandTotalEtb || 0,
          driverName: drv[0]?.fullName || "Unassigned",
          driverPhone: drv[0]?.phone || "",
          vehiclePlate: drv[0]?.vehiclePlateNumber || "",
          hubName: hb[0]?.name || null
        };
      })
    );
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/logistics/deliveries/:id/status", async (req, res) => {
  try {
    const delId = Number(req.params.id);
    const { status, currentLat, currentLng, proofOfDeliveryUrl, proofNotes } = req.body;
    const updated = await db.update(deliveries).set({
      status,
      currentLat: currentLat ? Number(currentLat) : void 0,
      currentLng: currentLng ? Number(currentLng) : void 0,
      proofOfDeliveryUrl: proofOfDeliveryUrl || void 0,
      proofNotes: proofNotes || void 0,
      actualDeliveredAt: status === "DELIVERED" ? /* @__PURE__ */ new Date() : void 0,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(deliveries.id, delId)).returning();
    if (status === "DELIVERED" && updated[0]?.orderId) {
      await db.update(orders).set({ orderStatus: "DELIVERED", actualDeliveryDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }).where(eq(orders.id, updated[0].orderId));
    }
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/finance/applications", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    const isFarmer = user && user.role === "FARMER";
    const baseQuery = db.select({
      id: financeApplications.id,
      farmerId: financeApplications.farmerId,
      institutionId: financeApplications.institutionId,
      loanType: financeApplications.loanType,
      amountRequestedEtb: financeApplications.amountRequestedEtb,
      purpose: financeApplications.purpose,
      farmId: financeApplications.farmId,
      targetCrop: financeApplications.targetCrop,
      expectedYieldTons: financeApplications.expectedYieldTons,
      expectedRevenueEtb: financeApplications.expectedRevenueEtb,
      repaymentPeriodMonths: financeApplications.repaymentPeriodMonths,
      status: financeApplications.status,
      approvedAmountEtb: financeApplications.approvedAmountEtb,
      interestRatePercent: financeApplications.interestRatePercent,
      reviewNotes: financeApplications.reviewNotes,
      createdAt: financeApplications.createdAt,
      farmerName: users.fullName,
      farmerPhone: users.phone,
      farmerRating: farmerProfiles.rating,
      farmName: farmerProfiles.farmName
    }).from(financeApplications).leftJoin(users, eq(financeApplications.farmerId, users.id)).leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId));
    let apps;
    if (isFarmer && user?.id) {
      apps = await baseQuery.where(eq(financeApplications.farmerId, user.id)).orderBy(desc(financeApplications.id));
    } else {
      apps = await baseQuery.orderBy(desc(financeApplications.id));
    }
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/finance/applications", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    const applicantId = user?.id || currentUserId;
    const { loanType, amountRequestedEtb, purpose, farmId, targetCrop, expectedYieldTons, expectedRevenueEtb, repaymentPeriodMonths } = req.body;
    const newApp = await db.insert(financeApplications).values({
      farmerId: applicantId,
      loanType: loanType || "INPUT_FINANCING",
      amountRequestedEtb: Number(amountRequestedEtb),
      purpose: purpose || "AgriLink Verified Farm Expansion",
      farmId: farmId ? Number(farmId) : null,
      targetCrop: targetCrop || "Commercial Horticulture",
      expectedYieldTons: Number(expectedYieldTons) || 10,
      expectedRevenueEtb: Number(expectedRevenueEtb) || 5e5,
      repaymentPeriodMonths: Number(repaymentPeriodMonths) || 12,
      status: "SUBMITTED"
    }).returning();
    await db.insert(notifications).values({
      userId: applicantId,
      title: "Loan Application Submitted",
      message: `Your application for ${Number(amountRequestedEtb).toLocaleString()} ETB is now under bank credit appraisal.`,
      type: "FINANCE",
      linkUrl: "/farmer/finance"
    });
    res.json(newApp[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/finance/applications/:id/decision", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (user && user.role === "FARMER") {
      return res.status(403).json({
        error: "Access denied: Farmers cannot approve or decline credit applications. Only Awash Bank Underwriters or Platform Admins have credit appraisal authority."
      });
    }
    const appId = Number(req.params.id);
    const { status, approvedAmountEtb, interestRatePercent, reviewNotes } = req.body;
    const updated = await db.update(financeApplications).set({
      status,
      institutionId: user?.id || 6,
      approvedAmountEtb: approvedAmountEtb ? Number(approvedAmountEtb) : void 0,
      interestRatePercent: interestRatePercent ? Number(interestRatePercent) : void 0,
      reviewNotes: reviewNotes || void 0,
      disbursedAt: status === "APPROVED" ? /* @__PURE__ */ new Date() : void 0,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(financeApplications.id, appId)).returning();
    if (updated[0]) {
      await db.insert(notifications).values({
        userId: updated[0].farmerId,
        title: `Loan ${status}: ${Number(updated[0].approvedAmountEtb || updated[0].amountRequestedEtb).toLocaleString()} ETB`,
        message: reviewNotes || (status === "APPROVED" ? "Awash Bank & Admin have approved and disbursed your working capital loan." : "Your credit application was not approved at this time."),
        type: "FINANCE",
        linkUrl: "/farmer/finance"
      });
    }
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/quotes", async (req, res) => {
  try {
    const quotes = await db.select({
      id: quoteRequests.id,
      businessBuyerId: quoteRequests.businessBuyerId,
      sellerId: quoteRequests.sellerId,
      productId: quoteRequests.productId,
      productName: quoteRequests.productName,
      requestedQuantity: quoteRequests.requestedQuantity,
      unit: quoteRequests.unit,
      requestedGrade: quoteRequests.requestedGrade,
      targetPriceEtb: quoteRequests.targetPriceEtb,
      deliveryDate: quoteRequests.deliveryDate,
      deliveryLocation: quoteRequests.deliveryLocation,
      status: quoteRequests.status,
      offerPriceEtb: quoteRequests.offerPriceEtb,
      offerNotes: quoteRequests.offerNotes,
      createdAt: quoteRequests.createdAt,
      buyerName: users.fullName,
      buyerOrganization: users.organizationName
    }).from(quoteRequests).leftJoin(users, eq(quoteRequests.businessBuyerId, users.id)).orderBy(desc(quoteRequests.id));
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/quotes", async (req, res) => {
  try {
    const { productId, productName, requestedQuantity, unit, requestedGrade, targetPriceEtb, deliveryDate, deliveryLocation, sellerId } = req.body;
    const newQuote = await db.insert(quoteRequests).values({
      businessBuyerId: currentUserId,
      sellerId: sellerId ? Number(sellerId) : null,
      productId: productId ? Number(productId) : null,
      productName: productName || "Commercial Produce Batch",
      requestedQuantity: Number(requestedQuantity) || 10,
      unit: unit || "TON",
      requestedGrade: requestedGrade || "GRADE_1_EXPORT",
      targetPriceEtb: targetPriceEtb ? Number(targetPriceEtb) : null,
      deliveryDate: deliveryDate || new Date(Date.now() + 864e5 * 7).toISOString().split("T")[0],
      deliveryLocation: deliveryLocation || "Addis Ababa Central Procurement",
      status: "PENDING"
    }).returning();
    res.json(newQuote[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/quotes/:id", async (req, res) => {
  try {
    const quoteId = Number(req.params.id);
    const { status, offerPriceEtb, offerNotes } = req.body;
    const updated = await db.update(quoteRequests).set({
      status,
      offerPriceEtb: offerPriceEtb ? Number(offerPriceEtb) : void 0,
      offerNotes: offerNotes || void 0
    }).where(eq(quoteRequests.id, quoteId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const notifs = await db.select().from(notifications).where(eq(notifications.userId, currentUserId)).orderBy(desc(notifications.id));
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const notifId = Number(req.params.id);
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notifId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/reviews", async (req, res) => {
  try {
    const { orderId, targetType, targetId, rating, title, comment } = req.body;
    const newRev = await db.insert(reviews).values({
      orderId: Number(orderId) || 1,
      reviewerId: currentUserId,
      targetType: targetType || "PRODUCT",
      targetId: Number(targetId),
      rating: Number(rating) || 5,
      title,
      comment,
      isVerifiedPurchase: true
    }).returning();
    res.json(newRev[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/overview", async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allDeliveries = await db.select().from(deliveries);
    const allLoans = await db.select().from(financeApplications);
    const allPayments = await db.select().from(payments);
    const gmv = allOrders.reduce((sum, o) => sum + (o.grandTotalEtb || 0), 0);
    const totalPaidAmount = allPayments.filter((p) => p.status === "PAID" || p.status === "ESCROW_HELD" || p.status === "RELEASED_TO_FARMER").reduce((sum, p) => sum + (p.amountEtb || 0), 0);
    const totalEscrowHeld = allPayments.filter((p) => p.status === "ESCROW_HELD" || p.status === "PAID").reduce((sum, p) => sum + (p.amountEtb || 0), 0);
    const totalTonsInTransit = allDeliveries.filter((d) => d.status === "IN_TRANSIT" || d.status === "ASSIGNED").length * 4.5;
    res.json({
      totalUsers: allUsers.length,
      farmersCount: allUsers.filter((u) => u.role === "FARMER").length,
      buyersCount: allUsers.filter((u) => u.role === "BUYER" || u.role === "BUSINESS_BUYER").length,
      driversCount: allUsers.filter((u) => u.role === "DRIVER").length,
      suppliersCount: allUsers.filter((u) => u.role === "INPUT_SUPPLIER").length,
      activeListingsCount: allProducts.filter((p) => p.status === "ACTIVE").length,
      totalOrdersCount: allOrders.length,
      gmvEtb: gmv,
      totalPaidAmountEtb: totalPaidAmount,
      totalEscrowHeldEtb: totalEscrowHeld,
      platformRevenueEtb: Math.round(gmv * 0.02),
      activeDeliveriesCount: allDeliveries.filter((d) => d.status === "IN_TRANSIT").length,
      totalTonsInTransit,
      financeDisbursedEtb: allLoans.filter((l) => l.status === "APPROVED" || l.status === "DISBURSED").reduce((sum, l) => sum + (l.approvedAmountEtb || l.amountRequestedEtb), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/orders", async (req, res) => {
  try {
    const allOrdersList = await db.select().from(orders).orderBy(desc(orders.id));
    const allUsersList = await db.select().from(users);
    const allPaymentsList = await db.select().from(payments);
    const allDeliveriesList = await db.select().from(deliveries);
    const allDriversList = await db.select().from(drivers);
    const allOrderItemsList = await db.select().from(orderItems);
    const userMap = new Map(allUsersList.map((u) => [u.id, u]));
    const driverMap = new Map(allDriversList.map((d) => [d.id, d]));
    const enrichedOrders = allOrdersList.map((ord) => {
      const buyer = userMap.get(ord.buyerId);
      const items = allOrderItemsList.filter((it) => it.orderId === ord.id);
      const pay = allPaymentsList.find((p) => p.orderId === ord.id);
      const del = allDeliveriesList.find((d) => d.orderId === ord.id);
      const driver = del?.driverId ? driverMap.get(del.driverId) : null;
      return {
        ...ord,
        buyerName: buyer?.fullName || ord.deliveryContactName || "Customer",
        buyer: buyer || null,
        items,
        payment: pay ? {
          ...pay,
          userName: userMap.get(pay.userId)?.fullName || buyer?.fullName,
          userPhone: userMap.get(pay.userId)?.phone || buyer?.phone
        } : null,
        delivery: del ? {
          ...del,
          driverName: driver?.fullName,
          driverPhone: driver?.phone,
          vehiclePlate: driver?.vehiclePlateNumber
        } : null
      };
    });
    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/orders/:id/payment", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { paymentStatus, provider, transactionRef, notes } = req.body;
    const ord = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!ord.length) return res.status(404).json({ error: "Order not found" });
    const updatedOrder = await db.update(orders).set({
      paymentStatus: paymentStatus || ord[0].paymentStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, orderId)).returning();
    const existingPay = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    if (existingPay.length) {
      await db.update(payments).set({
        status: paymentStatus || existingPay[0].status,
        provider: provider || existingPay[0].provider,
        transactionRef: transactionRef || existingPay[0].transactionRef,
        paidAt: paymentStatus === "PAID" || paymentStatus === "ESCROW_HELD" ? /* @__PURE__ */ new Date() : existingPay[0].paidAt
      }).where(eq(payments.id, existingPay[0].id));
    } else {
      await db.insert(payments).values({
        orderId,
        userId: ord[0].buyerId,
        amountEtb: ord[0].grandTotalEtb,
        currency: "ETB",
        provider: provider || "TELEBIRR",
        transactionRef: transactionRef || `TX-ADMIN-${Date.now()}`,
        status: paymentStatus || "PAID",
        paidAt: /* @__PURE__ */ new Date()
      });
    }
    await db.insert(notifications).values({
      userId: ord[0].buyerId,
      title: `Payment Updated: ${ord[0].orderNumber}`,
      message: `Your payment status is now marked as ${paymentStatus}. Notes: ${notes || "Verified by Admin"}`,
      type: "PAYMENT",
      linkUrl: "/buyer/orders"
    });
    res.json({ success: true, order: updatedOrder[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/admin/orders/:id/dispatch", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { orderStatus, driverId, hubId, notes } = req.body;
    const updatedOrder = await db.update(orders).set({
      orderStatus: orderStatus || void 0,
      hubId: hubId ? Number(hubId) : void 0,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, orderId)).returning();
    if (driverId !== void 0) {
      const existingDel = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId)).limit(1);
      if (existingDel.length) {
        await db.update(deliveries).set({
          driverId: driverId ? Number(driverId) : null,
          status: orderStatus === "IN_TRANSIT" ? "IN_TRANSIT" : orderStatus === "DELIVERED" ? "DELIVERED" : "ASSIGNED",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(deliveries.id, existingDel[0].id));
      }
    }
    await db.insert(orderStatusHistory).values({
      orderId,
      status: orderStatus || "DISPATCH_UPDATED",
      notes: notes || "Dispatched by Owner/Admin",
      actorId: currentUserId
    });
    res.json({ success: true, order: updatedOrder[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/admin/payments", async (req, res) => {
  try {
    const allPay = await db.select().from(payments).orderBy(desc(payments.id));
    const allOrdersList = await db.select().from(orders);
    const allUsersList = await db.select().from(users);
    const orderMap = new Map(allOrdersList.map((o) => [o.id, o]));
    const userMap = new Map(allUsersList.map((u) => [u.id, u]));
    const enriched = allPay.map((p) => {
      const ord = orderMap.get(p.orderId);
      const usr = userMap.get(p.userId);
      return {
        ...p,
        orderNumber: ord?.orderNumber || `ORD-${p.orderId}`,
        deliveryAddress: ord?.deliveryAddress || "Addis Ababa",
        userName: usr?.fullName || ord?.deliveryContactName || "Customer",
        userPhone: usr?.phone || ord?.deliveryContactPhone || "",
        organizationName: usr?.organizationName || ""
      };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/ussd", async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text: text2, lang = "en" } = req.body;
    const isAmharic = lang === "am";
    const isOromo = lang === "om";
    const cleanText = (text2 || "").trim();
    const parts = cleanText ? cleanText.split("*") : [];
    let response = "";
    if (parts.length === 0 || cleanText === "") {
      if (isAmharic) {
        response = `CON \xE1\u2039\u02C6\xE1\u2039\xB0 \xE1\u0160\xA0\xE1\u0152\x8D\xE1\u02C6\xAA\xE1\u02C6\u0160\xE1\u0160\u2022\xE1\u0160\xAD \xE1\u0160\xA2\xE1\u2030\xB5\xE1\u2039\xAE\xE1\u0152\xB5\xE1\u2039\xAB (*6112#) \xE1\u2030\xA0\xE1\u2039\xB0\xE1\u02C6\u2026\xE1\u0160\u201C \xE1\u02C6\u02DC\xE1\u0152\xA1
1. \xE1\u2039\xA8\xE1\u0152\u02C6\xE1\u2030\xA0\xE1\u2039\xAB \xE1\u2039\u2039\xE1\u0152\u2039 \xE1\u02C6\u02DC\xE1\u02C6\xA8\xE1\u0152\u0192
2. \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5 \xE1\u02C6\u02DC\xE1\u02C6\xB8\xE1\u0152\xAB (\xE1\u0152\u02C6\xE1\u2039\xA2 \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1: \xE1\x8D\u2039\xE1\u2030\xA5\xE1\u02C6\xAA\xE1\u0160\xAB/\xE1\u2030\xA3\xE1\u02C6\u02C6\xE1\u02C6\u20AC\xE1\u2030\xA5\xE1\u2030\xB5/\xE1\u0160\x90\xE1\u0152\u2039\xE1\u2039\xB4)
3. \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u2039\u2039\xE1\u02C6\xBD \xE1\u2030\xA3\xE1\u0160\u2022\xE1\u0160\xAD \xE1\u0152\x8D\xE1\u2030\xA5\xE1\u2039\u201C\xE1\u2030\xB5 \xE1\u2030\xA5\xE1\u2039\xB5\xE1\u02C6\xAD
4. \xE1\u2030\xB4\xE1\u02C6\u0152\xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2039\xA8\xE1\u02C6\xBD\xE1\u2039\xAB\xE1\u0152\xAD \xE1\u02C6\u201A\xE1\u02C6\xB3\xE1\u2030\xA5 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u02C6\u203A\xE1\u2039\x8D\xE1\u0152\xAB
5. \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u02C6\xAD\xE1\u02C6\xB6 \xE1\u0160\xA0\xE1\u2039\xB0\xE1\u02C6\xAD \xE1\u02C6\x9D\xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xA3
6. \xE1\u2039\xA8\xE1\u2039\xB0\xE1\u0160\u2022\xE1\u2030\xA0\xE1\u0160\u017E\xE1\u2030\xBD \xE1\u0160\xA0\xE1\u0152\u02C6\xE1\u02C6\x8D\xE1\u0152\x8D\xE1\u02C6\u017D\xE1\u2030\xB5 (0961123330)`;
      } else if (isOromo) {
        response = `CON Baga gara AgriLink Ethiopia (*6112#) dhuftan
1. Gatii Gabaa Yeroo Ammaa
2. Oomisha Gurguruu (Fakkeenya: Warshaa/Investeroota/Bittaa)
3. Liqii Qonnaa Baankii Hawaash
4. Herrega Telebirr fi Baasii
5. Galmee Qonnaan Bulaa
6. Tajaajila Maamiltootaa (0961123330)`;
      } else {
        response = `CON Welcome to AgriLink Ethiopia (*6112#)
1. Real-time Market Prices
2. Sell Produce (Select Buyer: Processor/Investor/Buyer)
3. Awash Input Credit Financing
4. Telebirr Escrow Balance & Payout
5. Farmer Registration & Classification
6. Support Desk (0961123330)`;
      }
    } else {
      const topChoice = parts[0];
      if (topChoice === "1") {
        if (parts.length === 1) {
          response = isAmharic ? `CON \xE1\u2039\xA8\xE1\u02C6\xB0\xE1\u2030\xA5\xE1\u02C6\x8D \xE1\u0160\xA0\xE1\u2039\xAD\xE1\u0160\x90\xE1\u2030\xB5 \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1:
1. \xE1\u02C6\xAE\xE1\u02C6\u203A \xE1\u2030\xB2\xE1\u02C6\u203A\xE1\u2030\xB2\xE1\u02C6\x9D (\xE1\u0160\xA0\xE1\u2039\xB3\xE1\u02C6\u203A)
2. \xE1\u2030\u20AC\xE1\u2039\xAD \xE1\u02C6\xBD\xE1\u0160\u2022\xE1\u0160\xA9\xE1\u02C6\xAD\xE1\u2030\xB5 (\xE1\u02C6\u017E\xE1\u0152\u2020)
3. \xE1\u02C6\u203A\xE1\u0160\u203A \xE1\u0152\xA4\xE1\x8D\x8D (\xE1\u2039\xB0\xE1\u2030\xA5\xE1\u02C6\xA8 \xE1\u2039\u02DC\xE1\u2039\xAD\xE1\u2030\xB5)
4. \xE1\u02C6\u0192\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u2030\xAE\xE1\u0160\xAB\xE1\u2039\xB6 (\xE1\u2039\u02C6\xE1\u0160\u2022\xE1\u0152\u201A)
5. \xE1\u2039\xA8\xE1\u02C6\xBB\xE1\u02C6\xB8\xE1\u02C6\u02DC\xE1\u0160\u201D \xE1\u2039\xB5\xE1\u0160\u2022\xE1\u2030\xBD\xE1\u0160\u201C \xE1\u0160\x90\xE1\u0152\xAD \xE1\u02C6\xBD\xE1\u0160\u2022\xE1\u0160\xA9\xE1\u02C6\xAD\xE1\u2030\xB5` : `CON Select Crop for Live Spot Price:
1. Roma Tomatoes (Adama Hub)
2. Red Onions (Mojo Hub)
3. Teff Magna (Debre Zeit Hub)
4. Export Hass Avocados (Wonji)
5. Fresh Highland Potatoes & Garlic`;
        } else {
          const cropChoice = parts[1];
          const cropPrices = {
            "1": { en: "Roma Tomatoes: ETB 4,800/Quintal (+6.2% high demand in Addis)", am: "\xE1\u02C6\xAE\xE1\u02C6\u203A \xE1\u2030\xB2\xE1\u02C6\u203A\xE1\u2030\xB2\xE1\u02C6\x9D: 4,800 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u0160\xA9\xE1\u0160\u2022\xE1\u2030\xB3\xE1\u02C6\x8D (\xE1\u2030\xA0\xE1\u0160\xA0\xE1\u2039\xB2\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u2030\xA0\xE1\u2030\xA3 \xE1\u0160\xA8\xE1\x8D\x8D\xE1\u2030\xB0\xE1\u0160\u203A \xE1\x8D\x8D\xE1\u02C6\u2039\xE1\u0152\u017D\xE1\u2030\xB5)" },
            "2": { en: "Red Onions: ETB 6,400/Quintal (Stable cold-chain supply)", am: "\xE1\u2030\u20AC\xE1\u2039\xAD \xE1\u02C6\xBD\xE1\u0160\u2022\xE1\u0160\xA9\xE1\u02C6\xAD\xE1\u2030\xB5: 6,400 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u0160\xA9\xE1\u0160\u2022\xE1\u2030\xB3\xE1\u02C6\x8D (\xE1\u2030\xA0\xE1\u2030\u201A \xE1\u0160\xAD\xE1\u02C6\x9D\xE1\u2030\xBD\xE1\u2030\xB5)" },
            "3": { en: "Teff Magna Grade 1: ETB 12,200/Quintal (Export grade certified)", am: "\xE1\u02C6\u203A\xE1\u0160\u203A \xE1\u0152\xA4\xE1\x8D\x8D \xE1\u0160\xA0\xE1\u0160\u2022\xE1\u2039\xB0\xE1\u0160\u203A \xE1\u2039\xB0\xE1\u02C6\xA8\xE1\u0152\u0192: 12,200 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u0160\xA9\xE1\u0160\u2022\xE1\u2030\xB3\xE1\u02C6\x8D" },
            "4": { en: "Export Hass Avocado: ETB 75/KG (Brix 12% verified)", am: "\xE1\u02C6\u0192\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u2030\xAE\xE1\u0160\xAB\xE1\u2039\xB6: 75 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u0160\xAA\xE1\u02C6\u017D (\xE1\u0160\xA4\xE1\u0160\xAD\xE1\u02C6\xB5\xE1\x8D\u2013\xE1\u02C6\xAD\xE1\u2030\xB5 \xE1\u2039\xB0\xE1\u02C6\xA8\xE1\u0152\u0192)" },
            "5": { en: "Highland Potatoes: ETB 48/KG (Chencha garlic & fresh tubers)", am: "\xE1\u2039\xA8\xE1\u02C6\xBB\xE1\u02C6\xB8\xE1\u02C6\u02DC\xE1\u0160\u201D \xE1\u2039\xB5\xE1\u0160\u2022\xE1\u2030\xBD: 48 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u0160\xAA\xE1\u02C6\u017D (\xE1\u2039\xA8\xE1\u2030\xBC\xE1\u0160\u2022\xE1\u2030\xBB \xE1\u0160\x90\xE1\u0152\xAD \xE1\u02C6\xBD\xE1\u0160\u2022\xE1\u0160\xA9\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u0160\u201C \xE1\u2039\xB5\xE1\u0160\u2022\xE1\u2030\xBD)" }
          };
          const p = cropPrices[cropChoice] || cropPrices["1"];
          response = isAmharic ? `END ${p.am}
\xE1\u0152\u02C6\xE1\u2030\xA0\xE1\u2039\xAB\xE1\u2039\x8D\xE1\u0160\u2022 \xE1\u02C6\u02C6\xE1\u02C6\u02DC\xE1\u02C6\xB8\xE1\u0152\xA5 *6112*2# \xE1\u2039\xAD\xE1\u2039\xB0\xE1\u2039\x8D\xE1\u02C6\u2030\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u02C6\u203A\xE1\u02C6\xA8\xE1\u0152\u2039\xE1\u0152\u02C6\xE1\u0152\xAB SMS \xE1\u2039\u02C6\xE1\u2039\xB0 ${phoneNumber} \xE1\u2039\xB0\xE1\u02C6\xAD\xE1\u02C6\xB6\xE1\u2039\u017D\xE1\u2030\xB3\xE1\u02C6\x8D\xE1\x8D\xA2` : `END ${p.en}
To list harvest directly to verified buyers, dial *6112*2#. SMS details sent to ${phoneNumber}.`;
        }
      } else if (topChoice === "2") {
        if (parts.length === 1) {
          response = isAmharic ? `CON \xE1\u02C6\u02C6\xE1\u02C6\u02DC\xE1\u02C6\xB8\xE1\u0152\xA5 \xE1\u2039\xA8\xE1\u02C6\u0161\xE1\x8D\u02C6\xE1\u02C6\x8D\xE1\u0152\u2030\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u02C6\xB0\xE1\u2030\xA5\xE1\u02C6\x8D \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1:
1. \xE1\u02C6\xAE\xE1\u02C6\u203A \xE1\u2030\xB2\xE1\u02C6\u203A\xE1\u2030\xB2\xE1\u02C6\x9D
2. \xE1\u2030\u20AC\xE1\u2039\xAD \xE1\u02C6\xBD\xE1\u0160\u2022\xE1\u0160\xA9\xE1\u02C6\xAD\xE1\u2030\xB5
3. \xE1\u02C6\u203A\xE1\u0160\u203A \xE1\u0152\xA4\xE1\x8D\x8D
4. \xE1\u02C6\u0192\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u2030\xAE\xE1\u0160\xAB\xE1\u2039\xB6
5. \xE1\u02C6\xB5\xE1\u0160\u2022\xE1\u2039\xB4 \xE1\u2039\u02C6\xE1\u2039\xAD\xE1\u02C6\x9D \xE1\u2039\xA8\xE1\u2039\u02DC\xE1\u2039\xAD\xE1\u2030\xB5 \xE1\u0160\xA5\xE1\u02C6\u2026\xE1\u02C6\u017D\xE1\u2030\xBD` : `CON Select Produce to Sell:
1. Roma Tomatoes
2. Red Onions
3. Teff Magna
4. Hass Avocados
5. Wheat or Oilseeds`;
        } else if (parts.length === 2) {
          response = isAmharic ? `CON \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB1\xE1\u0160\u2022 \xE1\u02C6\u02C6\xE1\u02C6\u203A\xE1\u0160\u2022 \xE1\u02C6\u02DC\xE1\u02C6\xB8\xE1\u0152\xA5 \xE1\u2039\xAD\xE1\x8D\u02C6\xE1\u02C6\x8D\xE1\u0152\u2039\xE1\u02C6\u2030? (\xE1\u0152\u02C6\xE1\u2039\xA2 \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1):
1. \xE1\u02C6\u02C6\xE1\u02C6\x9D\xE1\u0152\x8D\xE1\u2030\xA5 \xE1\x8D\u2039\xE1\u2030\xA5\xE1\u02C6\xAA\xE1\u0160\xAB\xE1\u2039\u017D\xE1\u2030\xBD\xE1\u0160\u201C \xE1\u2039\u02C6\xE1\x8D\x8D\xE1\u0152\xAE\xE1\u2039\u017D\xE1\u2030\xBD (Food Processors)
2. \xE1\u02C6\u02C6\xE1\u0152\x8D\xE1\u2030\xA5\xE1\u02C6\xAD\xE1\u0160\u201C \xE1\u2030\xA3\xE1\u02C6\u02C6\xE1\u02C6\u20AC\xE1\u2030\xA5\xE1\u2030\xB6\xE1\u2030\xBD\xE1\u0160\u201C \xE1\u02C6\u2039\xE1\u0160\xAA\xE1\u2039\u017D\xE1\u2030\xBD (Agri-Investors/Exporters)
3. \xE1\u02C6\u02C6\xE1\u02C6\xB1\xE1\x8D\x90\xE1\u02C6\xAD\xE1\u02C6\u203A\xE1\u02C6\xAD\xE1\u0160\xAC\xE1\u2030\xB6\xE1\u2030\xBD\xE1\u0160\u201C \xE1\u0152\u2026\xE1\u02C6\x9D\xE1\u02C6\u2039 \xE1\u0160\x90\xE1\u0152\u2039\xE1\u2039\xB4\xE1\u2039\u017D\xE1\u2030\xBD (Commercial Buyers)
4. \xE1\u02C6\u02C6\xE1\u02C6\x81\xE1\u02C6\u2030\xE1\u02C6\x9D \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u02C6\xA8\xE1\u0152\u2039\xE1\u0152\u02C6\xE1\u0152\xA1 \xE1\u0152\u02C6\xE1\u2039\xA2\xE1\u2039\u017D\xE1\u2030\xBD (All Channels)` : `CON Select Target Buyer Channel:
1. Food Processors & Industrial Mills
2. Agri-Investors & Exporters (Contract/Outgrower)
3. Supermarkets & Retail Wholesalers
4. Open Market (All Verified Buyers)`;
        } else if (parts.length === 3) {
          response = isAmharic ? `CON \xE1\u2039\xAB\xE1\u02C6\u02C6\xE1\u2039\u017D\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2039\xA8\xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5 \xE1\u02C6\u02DC\xE1\u0152\xA0\xE1\u0160\u2022 \xE1\u2039\xAB\xE1\u02C6\xB5\xE1\u0152\u02C6\xE1\u2030\xA1 (\xE1\u2030\xA0\xE1\u0160\xA9\xE1\u0160\u2022\xE1\u2030\xB3\xE1\u02C6\x8D \xE1\u2039\u02C6\xE1\u2039\xAD\xE1\u02C6\x9D \xE1\u0160\xAA\xE1\u02C6\u017D):` : `CON Enter Available Harvest Quantity (e.g. 50 Quintals / 2000 KG):`;
        } else if (parts.length === 4) {
          response = isAmharic ? `CON \xE1\u2039\xA8\xE1\u02C6\u0161\xE1\x8D\u02C6\xE1\u02C6\x8D\xE1\u0152\u2030\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2039\u2039\xE1\u0152\u2039 \xE1\u2039\xAB\xE1\u02C6\xB5\xE1\u0152\u02C6\xE1\u2030\xA1 (\xE1\u2030\xA0\xE1\u2030\xA5\xE1\u02C6\xAD):` : `CON Enter Target Price per Unit (in ETB):`;
        } else {
          const cropMap = { "1": "Roma Tomatoes", "2": "Red Onions", "3": "Teff Magna", "4": "Hass Avocados", "5": "Wheat / Oilseeds" };
          const buyerMap = { "1": "PROCESSOR", "2": "INVESTOR", "3": "BUYER", "4": "ALL" };
          const buyerNameMap = {
            "1": "Food Processors & Mills",
            "2": "Agri-Investors & Exporters",
            "3": "Supermarkets & Retailers",
            "4": "All Verified Buyers"
          };
          const selectedCrop = cropMap[parts[1]] || "Farm Produce";
          const selectedBuyerType = buyerMap[parts[2]] || "ALL";
          const buyerName = buyerNameMap[parts[2]] || "Verified Buyers";
          const qty = Number(parts[3]) || 50;
          const price = Number(parts[4]) || 4500;
          try {
            await db.insert(products).values({
              farmerId: currentUserId || 1,
              categoryId: parts[1] === "4" ? 2 : parts[1] === "3" ? 3 : 1,
              name: `${selectedCrop} (USSD Lot)`,
              variety: "USSD Listed Grade 1",
              description: `Farmer listing via USSD *6112# targeting ${buyerName}. Direct from verified grower phone ${phoneNumber}.`,
              grade: selectedBuyerType === "PROCESSOR" ? "PROCESSING_GRADE" : selectedBuyerType === "INVESTOR" ? "GRADE_1_EXPORT" : "GRADE_1_LOCAL",
              pricePerUnitEtb: price,
              unit: parts[1] === "4" ? "KG" : "QUINTAL",
              availableQuantity: qty,
              minOrderQuantity: 5,
              harvestDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              expectedAvailability: "Immediate Dispatch",
              farmLocation: "Oromia / Rift Valley Hub",
              region: "Oromia",
              images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"],
              lotBatchNumber: `LOT-USSD-${Math.floor(1e5 + Math.random() * 9e5)}`,
              qualityScore: 97,
              isOrganic: false,
              status: "ACTIVE",
              shelfLifeDays: 14
            });
          } catch (e) {
            console.error("USSD db product insert err:", e);
          }
          response = isAmharic ? `END \xE1\u0160\xA5\xE1\u0160\u201C\xE1\u02C6\u02DC\xE1\u02C6\xB0\xE1\u0152\x8D\xE1\u0160\u201C\xE1\u02C6\u02C6\xE1\u0160\u2022! \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u2039\u017D \xE1\u2030\xA0\xE1\u2030\xB0\xE1\u02C6\xB3\xE1\u0160\xAB \xE1\u02C6\x81\xE1\u0160\u201D\xE1\u2030\xB3 \xE1\u02C6\u02C6[${buyerName}] \xE1\u2030\u20AC\xE1\u02C6\xAD\xE1\u2030\xA7\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u02C6\u017D\xE1\u2030\xB5 \xE1\u2030\x81\xE1\u0152\xA5\xE1\u02C6\xAD \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u2039\xA8\xE1\u02C6\u203A\xE1\u02C6\xA8\xE1\u0152\u2039\xE1\u0152\u02C6\xE1\u0152\xAB SMS \xE1\u2039\u02C6\xE1\u2039\xB0 ${phoneNumber} \xE1\u2030\xB0\xE1\u02C6\x8D\xE1\u0160\xB3\xE1\u02C6\x8D\xE1\x8D\xA2` : `END Success! ${qty} units of ${selectedCrop} listed targeting ${buyerName} at ETB ${price}/unit. SMS confirmation & driver dispatch code sent to ${phoneNumber}.`;
        }
      } else if (topChoice === "3") {
        if (parts.length === 1) {
          response = isAmharic ? `CON \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u2039\u2039\xE1\u02C6\xBD \xE1\u2030\xA3\xE1\u0160\u2022\xE1\u0160\xAD \xE1\u2039\xA8\xE1\u0152\x8D\xE1\u2030\xA5\xE1\u2039\u201C\xE1\u2030\xB5 \xE1\u2030\xA5\xE1\u2039\xB5\xE1\u02C6\xAD:
\xE1\u2039\xA8\xE1\u0160\xA5\xE1\u02C6\xAD\xE1\u02C6\xBB\xE1\u2039\u017D\xE1\u0160\u2022 \xE1\u02C6\xB5\xE1\x8D\u2039\xE1\u2030\xB5 \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1:
1. \xE1\u0160\xA8 2 \xE1\u02C6\u201E\xE1\u0160\xAD\xE1\u2030\xB3\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u2030\xB3\xE1\u2030\xBD (\xE1\u0160\xA5\xE1\u02C6\xB5\xE1\u0160\xA8 50,000 \xE1\u2030\xA5\xE1\u02C6\xAD)
2. 2 - 5 \xE1\u02C6\u201E\xE1\u0160\xAD\xE1\u2030\xB3\xE1\u02C6\xAD (\xE1\u0160\xA5\xE1\u02C6\xB5\xE1\u0160\xA8 150,000 \xE1\u2030\xA5\xE1\u02C6\xAD)
3. \xE1\u0160\xA8 5 \xE1\u02C6\u201E\xE1\u0160\xAD\xE1\u2030\xB3\xE1\u02C6\xAD \xE1\u2030\xA0\xE1\u02C6\u2039\xE1\u2039\xAD (\xE1\u0160\xA5\xE1\u02C6\xB5\xE1\u0160\xA8 400,000 \xE1\u2030\xA5\xE1\u02C6\xAD)` : `CON Awash Bank Agri-Credit:
Select Farm Acreage:
1. Under 2 Hectares (Up to ETB 50,000)
2. 2 - 5 Hectares (Up to ETB 150,000)
3. 5+ Hectares (Up to ETB 400,000)`;
        } else {
          const loanAmounts = { "1": "50,000", "2": "150,000", "3": "350,000" };
          const amt = loanAmounts[parts[1]] || "75,000";
          response = isAmharic ? `END \xE1\u0160\xA5\xE1\u0160\u2022\xE1\u0160\xB3\xE1\u0160\u2022 \xE1\u2039\xB0\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u02C6\u02C6\xE1\u2039\u017D\xE1\u2030\xB5! \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u2039\u2039\xE1\u02C6\xBD \xE1\u2030\xA3\xE1\u0160\u2022\xE1\u0160\xAD ${amt} \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2039\xA8\xE1\u0152\x8D\xE1\u2030\xA5\xE1\u2039\u201C\xE1\u2030\xB5 \xE1\u2030\xA5\xE1\u2039\xB5\xE1\u02C6\xAD \xE1\x8D\u02C6\xE1\u2030\u0192\xE1\u2039\xB5 \xE1\u0160\xA0\xE1\u0152\x8D\xE1\u0160\x9D\xE1\u2030\xB0\xE1\u2039\u2039\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u2039\xB2\xE1\u0152\u201A\xE1\u2030\xB3\xE1\u02C6\x8D \xE1\u0160\xA9\xE1\x8D\u2013\xE1\u0160\u2022 \xE1\u0160\xAE\xE1\u2039\xB5 \xE1\u2039\u02C6\xE1\u2039\xB0 ${phoneNumber} \xE1\u2030\xA0SMS \xE1\u2030\xB0\xE1\u02C6\x8D\xE1\u0160\xB3\xE1\u02C6\x8D\xE1\x8D\xA2` : `END Pre-Approved! Awash Bank has pre-approved your ETB ${amt} input credit voucher for certified seeds and fertilizer. Voucher code sent to ${phoneNumber}.`;
        }
      } else if (topChoice === "4") {
        response = isAmharic ? `END \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u0152\x8D\xE1\u02C6\xAA\xE1\u02C6\u0160\xE1\u0160\u2022\xE1\u0160\xAD \xE1\u2030\xB4\xE1\u02C6\u0152\xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u2039\xA8\xE1\u02C6\xBD\xE1\u2039\xAB\xE1\u0152\xAD \xE1\u02C6\u201A\xE1\u02C6\xB3\xE1\u2030\xA5\xE1\u2039\u017D 48,650.00 \xE1\u2030\xA5\xE1\u02C6\xAD \xE1\u0160\x90\xE1\u2039\x8D\xE1\x8D\xA2 2 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u0152\u201C\xE1\u0152\u201C\xE1\u2039\x9D \xE1\u02C6\u2039\xE1\u2039\xAD \xE1\u2039\xAB\xE1\u02C6\u2030 \xE1\u02C6\xBD\xE1\u2039\xAB\xE1\u0152\xAE\xE1\u2030\xBD \xE1\u0160\xA0\xE1\u02C6\u2030\xE1\x8D\xA2 \xE1\u0152\u02C6\xE1\u0160\u2022\xE1\u2039\u02DC\xE1\u2030\xA5 \xE1\u2039\u02C6\xE1\u2039\xB0 ${phoneNumber || "0961123330"} \xE1\u02C6\u02C6\xE1\u02C6\u203A\xE1\u02C6\xB5\xE1\u2030\xB0\xE1\u02C6\u2039\xE1\u02C6\u02C6\xE1\x8D\x8D \xE1\u2030\xA0SMS \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u02C6\u2039\xE1\u0160\xA8\xE1\u2039\x8D\xE1\u0160\u2022 \xE1\u02C6\u0161\xE1\u02C6\xB5\xE1\u0152\xA5\xE1\u02C6\xAD \xE1\u2030\x81\xE1\u0152\xA5\xE1\u02C6\xAD \xE1\u2039\xAD\xE1\u0152\xA0\xE1\u2030\u20AC\xE1\u02C6\u2122\xE1\x8D\xA2` : `END Your AgriLink Telebirr Escrow balance is ETB 48,650.00 (2 lots in transit). Instant payout initiated to registered phone ${phoneNumber || "0961123330"}.`;
      } else if (topChoice === "5") {
        if (parts.length === 1) {
          response = isAmharic ? `CON \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u02C6\xAD\xE1\u02C6\xB6 \xE1\u0160\xA0\xE1\u2039\xB0\xE1\u02C6\xAD \xE1\u02C6\x9D\xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xA3:
\xE1\u02C6\u2122\xE1\u02C6\u2030 \xE1\u02C6\xB5\xE1\u02C6\x9D\xE1\u2039\u017D\xE1\u0160\u2022 \xE1\u2039\xAB\xE1\u02C6\xB5\xE1\u0152\u02C6\xE1\u2030\xA1:` : `CON Farmer Registration:
Enter Full Name:`;
        } else if (parts.length === 2) {
          response = isAmharic ? `CON \xE1\u0160\xAD\xE1\u02C6\x8D\xE1\u02C6\x8D \xE1\u2039\xAD\xE1\u02C6\x9D\xE1\u02C6\xA8\xE1\u0152\xA1:
1. \xE1\u0160\xA6\xE1\u02C6\xAE\xE1\u02C6\u0161\xE1\u2039\xAB (Oromia)
2. \xE1\u0160\xA0\xE1\u02C6\u203A\xE1\u02C6\xAB (Amhara)
3. \xE1\u02C6\xB2\xE1\u2039\xB3\xE1\u02C6\u203A (Sidama)
4. \xE1\u2039\xB0\xE1\u2030\xA1\xE1\u2030\xA5 (SNNPR)` : `CON Select Region:
1. Oromia
2. Amhara
3. Sidama
4. SNNPR`;
        } else if (parts.length === 3) {
          response = isAmharic ? `CON \xE1\u2039\u2039\xE1\u0160\x90\xE1\u0160\u203A \xE1\u0152\u02C6\xE1\u2039\xA2\xE1\u2039\u017D \xE1\u02C6\u203A\xE1\u0160\u2022 \xE1\u0160\xA5\xE1\u0160\u2022\xE1\u2039\xB2\xE1\u02C6\u2020\xE1\u0160\u2022 \xE1\u2039\xAD\xE1\x8D\u02C6\xE1\u02C6\x8D\xE1\u0152\u2039\xE1\u02C6\u2030?:
1. \xE1\u2039\xA8\xE1\u02C6\x9D\xE1\u0152\x8D\xE1\u2030\xA5 \xE1\x8D\u2039\xE1\u2030\xA5\xE1\u02C6\xAA\xE1\u0160\xAB\xE1\u2039\u017D\xE1\u2030\xBD (Processors)
2. \xE1\u2039\xA8\xE1\u0152\x8D\xE1\u2030\xA5\xE1\u02C6\xAD\xE1\u0160\u201C \xE1\u2030\xA3\xE1\u02C6\u02C6\xE1\u02C6\u20AC\xE1\u2030\xA5\xE1\u2030\xB6\xE1\u2030\xBD (Investors)
3. \xE1\u02C6\xB1\xE1\x8D\x90\xE1\u02C6\xAD\xE1\u02C6\u203A\xE1\u02C6\xAD\xE1\u0160\xAC\xE1\u2030\xB6\xE1\u2030\xBD (Supermarkets)
4. \xE1\u02C6\x81\xE1\u02C6\u2030\xE1\u02C6\x9D (All)` : `CON Primary Target Buyer Focus:
1. Food Processors
2. Agri-Investors
3. Supermarkets
4. All Verified Buyers`;
        } else {
          const farmerName = parts[1] || "Farmer";
          response = isAmharic ? `END \xE1\u0160\xA5\xE1\u0160\u201C\xE1\u02C6\u02DC\xE1\u02C6\xB0\xE1\u0152\x8D\xE1\u0160\u201C\xE1\u02C6\u02C6\xE1\u0160\u2022 ${farmerName}! \xE1\u2039\xA8\xE1\u0160\xA0\xE1\u02C6\xAD\xE1\u02C6\xB6 \xE1\u0160\xA0\xE1\u2039\xB0\xE1\u02C6\xAD \xE1\u0160\xA0\xE1\u0160\xAB\xE1\u2039\x8D\xE1\u0160\u2022\xE1\u2030\xB5\xE1\u2039\u017D \xE1\u2030\xB0\xE1\u0160\xA8\xE1\x8D\x8D\xE1\u2030\xB7\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2030\xA0*6112# \xE1\u2030\xA0\xE1\u02C6\u203A\xE1\u0160\u2022\xE1\u0160\u203A\xE1\u2039\x8D\xE1\u02C6\x9D \xE1\u0152\u0160\xE1\u2039\u0153 \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u2039\u017D\xE1\u0160\u2022 \xE1\u02C6\u02DC\xE1\u02C6\xB8\xE1\u0152\xA5 \xE1\u2039\xAD\xE1\u2030\xBD\xE1\u02C6\u2039\xE1\u02C6\u2030\xE1\x8D\xA2` : `END Thank you ${farmerName}! Your AgriLink Farmer Profile is verified. You can dial *6112# anytime from your phone ${phoneNumber}.`;
        }
      } else if (topChoice === "6") {
        response = isAmharic ? `END \xE1\u0160\xA0\xE1\u0152\x8D\xE1\u02C6\xAA\xE1\u02C6\u0160\xE1\u0160\u2022\xE1\u0160\xAD \xE1\u0160\xA2\xE1\u2030\xB5\xE1\u2039\xAE\xE1\u0152\xB5\xE1\u2039\xAB \xE1\u2039\xA8\xE1\u2039\xB0\xE1\u0160\u2022\xE1\u2030\xA0\xE1\u0160\u017E\xE1\u2030\xBD \xE1\u0160\xA0\xE1\u0152\u02C6\xE1\u02C6\x8D\xE1\u0152\x8D\xE1\u02C6\u017D\xE1\u2030\xB5:
\xE1\u02C6\xB5\xE1\u02C6\x8D\xE1\u0160\xAD: 0961123330
\xE1\u0160\xA2\xE1\u02C6\u0153\xE1\u2039\xAD\xE1\u02C6\x8D: bamlaksisay270@gmail.com
\xE1\u0160\xA0\xE1\u2039\xB5\xE1\u02C6\xAB\xE1\u02C6\xBB: \xE1\u0160\xA0\xE1\u2039\xB2\xE1\u02C6\xB5 \xE1\u0160\xA0\xE1\u2030\xA0\xE1\u2030\xA3\xE1\x8D\xA3 \xE1\u0160\xA2\xE1\u2030\xB5\xE1\u2039\xAE\xE1\u0152\xB5\xE1\u2039\xAB` : `END AgriLink Support & Operations Desk:
Phone: 0961123330
Email: bamlaksisay270@gmail.com
Addis Ababa Central Logistics Hub`;
      } else {
        response = isAmharic ? `END \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u02C6\xB3\xE1\u02C6\xB3\xE1\u2030\xB0 \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u0152\xAB\xE1\x8D\xA2 \xE1\u0160\xA5\xE1\u2030\xA3\xE1\u0160\xAD\xE1\u2039\u017D *6112# \xE1\u0160\xA5\xE1\u0160\u2022\xE1\u2039\xB0\xE1\u0152\u02C6\xE1\u0160\u201C \xE1\u2039\xAD\xE1\u2039\xB0\xE1\u2039\x8D\xE1\u02C6\u2030\xE1\x8D\xA2` : `END Invalid selection. Please redial *6112# to try again.`;
      }
    }
    res.json({ response, message: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Error initializing GoogleGenAI client:", err);
    return null;
  }
};
app.post("/api/ai/diagnose-crop", async (req, res) => {
  try {
    const {
      cropName = "Roma Tomatoes",
      symptoms = "",
      region = "Oromia",
      imageBase64,
      lang = "en"
    } = req.body;
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are the chief plant pathologist and agronomist at AgriLink Ethiopia (Ministry of Agriculture certified advisor).
Analyze this crop diagnostic request.
Crop Name: ${cropName}
Region/Location in Ethiopia: ${region}
Observed symptoms: ${symptoms || "Visual examination of crop leaves/stems/fruit"}
Language requested: ${lang === "am" ? "Amharic (\xE1\u0160\xA0\xE1\u02C6\u203A\xE1\u02C6\xAD\xE1\u0160\u203A)" : lang === "om" ? "Afaan Oromoo" : lang === "ti" ? "Tigrinya (\xE1\u2030\xB5\xE1\u0152\x8D\xE1\u02C6\xAD\xE1\u0160\u203A)" : "English"}

Provide a structured, scientifically accurate diagnosis and treatment plan tailored for Ethiopian farmers and agricultural cooperatives.
Return ONLY valid JSON in this exact structure without markdown code blocks:
{
  "diagnosisName": "Disease/Pest name in English and ${lang}",
  "confidenceScore": 96,
  "severityLevel": "HIGH" | "MEDIUM" | "LOW",
  "affectedPlantParts": ["Leaves", "Stems", "Fruit"],
  "pathogenType": "Fungal" | "Bacterial" | "Viral" | "Insect Pest" | "Nutrient Deficiency",
  "rootCauses": "Key environmental and biological triggers in ${region} (humidity, soil moisture, infected seeds)",
  "organicRemedy": "Eco-friendly bio-treatment (e.g., Neem oil extract, Trichoderma, wood ash, crop rotation)",
  "chemicalTreatment": "Approved Ministry of Agriculture fungicide/pesticide dosage (e.g., Mancozeb 80% WP, Copper Oxychloride, Lambda-cyhalothrin)",
  "treatmentScheduleDays": "Step-by-step application interval (e.g. Day 1, Day 7, Day 14)",
  "preventativeMeasures": ["Drip irrigation instead of overhead spray", "Certified disease-free seeds", "Adequate field spacing"],
  "recommendedInputCategory": "Crop Protection & Bio-Inputs",
  "localizedAdvice": "Comprehensive localized advice in the requested language (${lang})",
  "audioSummaryText": "Clear, spoken-friendly summary in 2 sentences for farmer voice audio"
}`;
      let contents = [];
      if (imageBase64 && typeof imageBase64 === "string" && imageBase64.includes("base64,")) {
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const data = matches ? matches[2] : imageBase64;
        contents = [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data
                }
              }
            ]
          }
        ];
      } else {
        contents = [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ];
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents
      });
      const responseText = response.text || "";
      try {
        const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, diagnosis: parsed, aiPowered: true });
      } catch (parseErr) {
        console.warn("Failed to parse Gemini JSON output, using clean fallback:", parseErr);
      }
    }
    const cropFallbacks = {
      tomato: {
        diagnosisName: lang === "am" ? "\xE1\u2039\xA8\xE1\u2030\xB2\xE1\u02C6\u203A\xE1\u2030\xB2\xE1\u02C6\x9D \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\u02DC\xE1\u2039\xB5\xE1\u02C6\xA8\xE1\u2030\u2026 \xE1\u2030\xA0\xE1\u02C6\xBD\xE1\u2030\xB3 (Late Blight / Phytophthora infestans)" : "Late Blight (Phytophthora infestans)",
        confidenceScore: 94,
        severityLevel: "HIGH",
        affectedPlantParts: ["Leaves", "Stems", "Fruit Rot"],
        pathogenType: "Fungal",
        rootCauses: "Excessive humidity in the Rift Valley during morning dew and dense canopy moisture.",
        organicRemedy: "Spray 5% fermented cow urine + wood ash solution, or Certified Trichoderma harzianum bio-fungicide every 5 days.",
        chemicalTreatment: "Mancozeb 80% WP (2.5 kg/ha) or Metalaxyl-M + Mancozeb (Ridomil Gold) at 2.0 kg/ha at first sign of lesions.",
        treatmentScheduleDays: "Day 1: Initial systemic spray; Day 7: Secondary contact fungicide; Day 14: Preventive bio-fungicide maintenance.",
        preventativeMeasures: [
          "Switch to drip irrigation to keep foliage dry",
          "Ensure 60cm row spacing for optimal air circulation",
          "Stake tomato vines off the bare ground"
        ],
        recommendedInputCategory: "Crop Protection & Bio-Inputs",
        localizedAdvice: lang === "am" ? "\xE1\u2030\xA0\xE1\u02C6\xBD\xE1\u2030\xB3\xE1\u2039\x8D \xE1\u2030\xA0\xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\u017D\xE1\u2030\xBD\xE1\u0160\u201C \xE1\u2030\xA0\xE1\x8D\x8D\xE1\u02C6\xAC\xE1\u2039\x8D \xE1\u02C6\u2039\xE1\u2039\xAD \xE1\u0152\xA5\xE1\u2030\x81\xE1\u02C6\xAD \xE1\u0160\x90\xE1\u0152\xA0\xE1\u2030\xA5\xE1\u0152\xA3\xE1\u2030\xA5 \xE1\u2030\xA0\xE1\u02C6\u203A\xE1\u02C6\x9D\xE1\u0152\xA3\xE1\u2030\xB5 \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2030\xA0\xE1\x8D\x8D\xE1\u0152\xA5\xE1\u0160\x90\xE1\u2030\xB5 \xE1\u02C6\u0160\xE1\u2039\xAB\xE1\u0152\xA0\xE1\x8D\u2039 \xE1\u2039\xAD\xE1\u2030\xBD\xE1\u02C6\u2039\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u0152\xA0\xE1\u2030\x81\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\u017D\xE1\u2030\xBD \xE1\u2030\xA0\xE1\x8D\x8D\xE1\u0152\xA5\xE1\u0160\x90\xE1\u2030\xB5 \xE1\u2030\u2020\xE1\u02C6\xAD\xE1\u0152\xA0\xE1\u2039\x8D \xE1\u2039\xAB\xE1\u2030\u0192\xE1\u0152\xA5\xE1\u02C6\u2030\xE1\x8D\xA4 \xE1\u02C6\xAA\xE1\u2039\xB6\xE1\u02C6\u0161\xE1\u02C6\x8D \xE1\u0152\u017D\xE1\u02C6\x8D\xE1\u2039\xB5 \xE1\u2039\u02C6\xE1\u2039\xAD\xE1\u02C6\x9D \xE1\u02C6\u203A\xE1\u0160\u2022\xE1\u0160\xAE\xE1\u2039\u0153\xE1\u2030\xA5 \xE1\u2030\xA07 \xE1\u2030\u20AC\xE1\u0160\u201C\xE1\u2030\xB5 \xE1\u02C6\x8D\xE1\u2039\xA9\xE1\u0160\x90\xE1\u2030\xB5 \xE1\u2039\xAD\xE1\u02C6\xAD\xE1\u0152\xA9\xE1\x8D\xA2" : "Late Blight spreads rapidly in wet weather. Immediately prune and safely incinerate heavily infected foliage. Apply Ridomil Gold systemic fungicide and ensure plants are staked above ground.",
        audioSummaryText: lang === "am" ? "\xE1\u2039\xA8\xE1\u2030\xB2\xE1\u02C6\u203A\xE1\u2030\xB2\xE1\u02C6\x9D \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\u02DC\xE1\u2039\xB5\xE1\u02C6\xA8\xE1\u2030\u2026 \xE1\u2030\xA0\xE1\u02C6\xBD\xE1\u2030\xB3 \xE1\u2030\xB0\xE1\u0152\u02C6\xE1\u0160\x9D\xE1\u2030\xB7\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u0152\u017D\xE1\u2039\xB1\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\u017D\xE1\u2030\xBD \xE1\u2030\u2020\xE1\u02C6\xAD\xE1\u0152\xA0\xE1\u2039\x8D \xE1\u2030\xA0\xE1\u02C6\u203A\xE1\u2030\u0192\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\u203A\xE1\u0160\u2022\xE1\u0160\xAE\xE1\u2039\u0153\xE1\u2030\xA5 \xE1\u2039\u02C6\xE1\u2039\xAD\xE1\u02C6\x9D \xE1\u02C6\xAA\xE1\u2039\xB6\xE1\u02C6\u0161\xE1\u02C6\x8D \xE1\u0152\u017D\xE1\u02C6\x8D\xE1\u2039\xB5 \xE1\u2030\xA07 \xE1\u2030\u20AC\xE1\u0160\u201C\xE1\u2030\xB5 \xE1\u02C6\x8D\xE1\u2039\xA9\xE1\u0160\x90\xE1\u2030\xB5 \xE1\u2039\xAD\xE1\u02C6\xAD\xE1\u0152\xA9\xE1\x8D\xA2" : "Late Blight detected on tomato foliage. Prune affected branches and spray certified Mancozeb or Ridomil Gold every seven days."
      },
      coffee: {
        diagnosisName: lang === "am" ? "\xE1\u2039\xA8\xE1\u2030\xA1\xE1\u0160\u201C \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u2030\xA0\xE1\u02C6\xBD\xE1\u2030\xB3 (Coffee Leaf Rust / Hemileia vastatrix)" : "Coffee Leaf Rust (Hemileia vastatrix)",
        confidenceScore: 97,
        severityLevel: "MEDIUM",
        affectedPlantParts: ["Underside of Leaves", "Young Branches"],
        pathogenType: "Fungal",
        rootCauses: "High relative humidity combined with prolonged shade in Jimma/Sidama microclimates.",
        organicRemedy: "Apply Bacillus subtilis bio-spray and regulate shade trees to allow 50% sunlight penetration.",
        chemicalTreatment: "Copper Hydroxide 50% WP (Kocide 2000) at 3 kg/ha or Bayleton 25% WP at 0.5 kg/ha.",
        treatmentScheduleDays: "Spray before the onset of the main rainy season (Meher), followed by booster spray 30 days later.",
        preventativeMeasures: [
          "Prune dense coffee bushes after harvest",
          "Intercrop with shade trees like Cordia africana at recommended spacing",
          "Apply balanced NPSZnB fertilizer to boost plant immunity"
        ],
        recommendedInputCategory: "Crop Protection & Bio-Inputs",
        localizedAdvice: lang === "am" ? "\xE1\u2039\xA8\xE1\u2030\xA1\xE1\u0160\u201C \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u2030\xA0\xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\xB5\xE1\u02C6\xAD \xE1\u2030\xA2\xE1\u0152\xAB/\xE1\u2030\xA5\xE1\u02C6\xAD\xE1\u2030\xB1\xE1\u0160\xAB\xE1\u0160\u201C\xE1\u02C6\u203A \xE1\u2039\xB1\xE1\u2030\u201E\xE1\u2030\xB5 \xE1\u2039\xAD\xE1\x8D\u02C6\xE1\u0152\xA5\xE1\u02C6\xAB\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u2039\u203A\xE1\x8D\x8D \xE1\u2030\u2026\xE1\u02C6\xAD\xE1\u0160\u2022\xE1\u0152\xAB\xE1\x8D\u017D\xE1\u2030\xBD\xE1\u0160\u2022 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u0160\xA8\xE1\u02C6\xAD\xE1\u0160\xA8\xE1\u02C6\x9D \xE1\u2039\xA8\xE1\x8D\u20AC\xE1\u02C6\x90\xE1\u2039\xAD \xE1\u2030\xA5\xE1\u02C6\xAD\xE1\u02C6\u0192\xE1\u0160\u2022 \xE1\u0160\xA5\xE1\u0160\u2022\xE1\u2039\xB2\xE1\u2039\xAB\xE1\u0152\u02C6\xE1\u0160\x9D \xE1\u2039\xAB\xE1\u2039\xB5\xE1\u02C6\xAD\xE1\u0152\u2030\xE1\u0160\u201C \xE1\u0160\xAE\xE1\x8D\x90\xE1\u02C6\xAD \xE1\u02C6\u0192\xE1\u2039\xAD\xE1\u2039\xB5\xE1\u02C6\xAE\xE1\u0160\xAD\xE1\u02C6\xB3\xE1\u2039\xAD\xE1\u2039\xB5 \xE1\u2039\xAD\xE1\u02C6\xAD\xE1\u0152\xA9\xE1\x8D\xA2" : "Coffee Leaf Rust causes powdery orange-yellow pustules on leaf undersides. Prune canopy to improve sunlight and airflow, then apply Copper Hydroxide fungicide.",
        audioSummaryText: lang === "am" ? "\xE1\u2039\xA8\xE1\u2030\xA1\xE1\u0160\u201C \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u2030\xA0\xE1\u02C6\xBD\xE1\u2030\xB3 \xE1\u2030\xB0\xE1\u02C6\u02C6\xE1\u2039\xAD\xE1\u2030\xB7\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2039\xA8\xE1\u2039\u203A\xE1\x8D\x8D \xE1\u2030\u2026\xE1\u02C6\xAD\xE1\u0160\u2022\xE1\u0152\xAB\xE1\x8D\u017D\xE1\u2030\xBD\xE1\u0160\u2022 \xE1\u2039\xAD\xE1\u0160\xA8\xE1\u02C6\xAD\xE1\u0160\xAD\xE1\u02C6\u2122 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u0160\xAE\xE1\x8D\x90\xE1\u02C6\xAD \xE1\u02C6\u0192\xE1\u2039\xAD\xE1\u2039\xB5\xE1\u02C6\xAE\xE1\u0160\xAD\xE1\u02C6\xB3\xE1\u2039\xAD\xE1\u2039\xB5 \xE1\u2039\xA8\xE1\x8D\u02C6\xE1\u0160\u2022\xE1\u0152\u02C6\xE1\u02C6\xB5 \xE1\u02C6\u02DC\xE1\u0160\xA8\xE1\u02C6\u2039\xE1\u0160\xA8\xE1\u2039\xAB \xE1\u2039\xAD\xE1\u02C6\xAD\xE1\u0152\xA9\xE1\x8D\xA2" : "Coffee Leaf Rust identified. Prune excess shade and apply copper-based protective fungicide."
      },
      teff: {
        diagnosisName: lang === "am" ? "\xE1\u2039\xA8\xE1\u0152\xA4\xE1\x8D\x8D \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u0152\xA5\xE1\u2030\u20AC\xE1\u02C6\xAD\xE1\u02C6\xBB (Teff Rust / Uromyces eragrostidis)" : "Teff Rust (Uromyces eragrostidis)",
        confidenceScore: 92,
        severityLevel: "MEDIUM",
        affectedPlantParts: ["Stems", "Leaf Sheaths", "Panicles"],
        pathogenType: "Fungal",
        rootCauses: "Late planting season with heavy fog in Debre Zeit / Adaa plain.",
        organicRemedy: "Crop rotation with chickpeas or field peas; apply bio-slurry fertilizer rich in potash.",
        chemicalTreatment: "Propiconazole 250 EC (Tilt) at 0.5 L/ha or Tebuconazole 250 EW.",
        treatmentScheduleDays: "Single spray at flag-leaf emergence stage protects grains through dough development.",
        preventativeMeasures: [
          "Row planting with 20cm spacing instead of broadcasting seed",
          "Use Quncho (DZ-Cr-387) or Dagim certified rust-tolerant varieties"
        ],
        recommendedInputCategory: "Certified Seeds & Crop Protection",
        localizedAdvice: lang === "am" ? "\xE1\u2030\xA0\xE1\u0152\xA4\xE1\x8D\x8D \xE1\u0160\xA0\xE1\u0152\u02C6\xE1\u2039\xB3\xE1\u0160\u201C \xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\u2039\xE1\u2039\xAD \xE1\u2039\xA8\xE1\u02C6\u0161\xE1\u2030\xB3\xE1\u2039\xAD \xE1\u2030\u20AC\xE1\u2039\xAD/\xE1\u2030\xA1\xE1\u0160\u201C\xE1\u02C6\u203A \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u0160\x90\xE1\u2039\x8D\xE1\x8D\xA2 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u02C6\xB5\xE1\u02C6\u02DC\xE1\u02C6\xAD \xE1\u02C6\u02DC\xE1\u2039\x9D\xE1\u02C6\xAB\xE1\u2030\xB5 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u2039\xA8\xE1\u2030\xB0\xE1\u02C6\xBB\xE1\u02C6\xBB\xE1\u02C6\u2030 \xE1\u2039\xA8\xE1\u0152\xA4\xE1\x8D\x8D \xE1\u2039\x9D\xE1\u02C6\xAD\xE1\u2039\xAB\xE1\u2039\u017D\xE1\u2030\xBD\xE1\u0160\u2022 (\xE1\u2030\x81\xE1\u0160\u2022\xE1\u0152\xAE) \xE1\u02C6\u02DC\xE1\u0152\xA0\xE1\u2030\u20AC\xE1\u02C6\x9D \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2030\xA0\xE1\u0160\xA5\xE1\u0152\xA5\xE1\x8D\x8D \xE1\u2039\xAB\xE1\u02C6\xB3\xE1\u2039\xB5\xE1\u0152\u2039\xE1\u02C6\x8D\xE1\x8D\xA2" : "Teff rust reduces grain filling. Practice row planting with certified Quncho seed varieties and apply Tilt fungicide at booting stage if severe.",
        audioSummaryText: lang === "am" ? "\xE1\u2039\xA8\xE1\u0152\xA4\xE1\x8D\x8D \xE1\u2039\x9D\xE1\u0152\u02C6\xE1\u2030\xB5 \xE1\u2030\xB0\xE1\u0152\u02C6\xE1\u0160\x9D\xE1\u2030\xB7\xE1\u02C6\x8D\xE1\x8D\xA2 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u02C6\xB5\xE1\u02C6\u02DC\xE1\u02C6\xAD \xE1\u02C6\u02DC\xE1\u2039\x9D\xE1\u02C6\xAB\xE1\u2030\xB5 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u2030\xA0\xE1\u02C6\xB0\xE1\u2039\u201C\xE1\u2030\xB1 \xE1\x8D\u20AC\xE1\u02C6\xA8-\xE1\x8D\u02C6\xE1\u0160\u2022\xE1\u0152\u02C6\xE1\u02C6\xB5 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u02C6\xAD\xE1\u0152\xA8\xE1\u2030\xB5 \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5\xE1\u2039\u017D\xE1\u0160\u2022 \xE1\u2039\xAD\xE1\u0152\xA0\xE1\u2030\xA5\xE1\u2030\x81\xE1\x8D\xA2" : "Teff rust detected. Maintain row spacing and apply targeted fungicide at flag-leaf stage."
      }
    };
    const key = cropName.toLowerCase().includes("coffee") ? "coffee" : cropName.toLowerCase().includes("teff") ? "teff" : "tomato";
    const fallbackDiagnosis = cropFallbacks[key] || cropFallbacks.tomato;
    res.json({ success: true, diagnosis: fallbackDiagnosis, aiPowered: false });
  } catch (error) {
    console.error("Crop diagnosis error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/ai/market-intelligence", async (req, res) => {
  try {
    const marketData = [
      {
        crop: "Roma Tomatoes",
        category: "Vegetables",
        terminalMarket: "Addis Ababa (Piazza & Merkato)",
        currentPriceEtb: 48,
        unit: "KG",
        quintalPriceEtb: 4800,
        dayChangePercent: 6.4,
        demandRating: "VERY HIGH",
        trendDirection: "UP",
        harvestArrivalVolumeTons: 185,
        forecast30Days: [
          { day: "Day 1", price: 48, demandIndex: 88 },
          { day: "Day 5", price: 50, demandIndex: 92 },
          { day: "Day 10", price: 54, demandIndex: 95 },
          { day: "Day 15", price: 58, demandIndex: 98 },
          { day: "Day 20", price: 55, demandIndex: 90 },
          { day: "Day 25", price: 52, demandIndex: 85 },
          { day: "Day 30", price: 56, demandIndex: 94 }
        ],
        marketAdvisory: "Peak demand surge in urban retail centers. Recommended strategy: Sell 60% immediately, hold 40% in cold-hub staging for 10-day price peak."
      },
      {
        crop: "Red Onions (Bombaye)",
        category: "Vegetables",
        terminalMarket: "Adama & Modjo Cross-Dock",
        currentPriceEtb: 64,
        unit: "KG",
        quintalPriceEtb: 6400,
        dayChangePercent: 2.1,
        demandRating: "STABLE",
        trendDirection: "UP",
        harvestArrivalVolumeTons: 320,
        forecast30Days: [
          { day: "Day 1", price: 64, demandIndex: 78 },
          { day: "Day 5", price: 66, demandIndex: 82 },
          { day: "Day 10", price: 68, demandIndex: 85 },
          { day: "Day 15", price: 72, demandIndex: 91 },
          { day: "Day 20", price: 75, demandIndex: 94 },
          { day: "Day 25", price: 78, demandIndex: 96 },
          { day: "Day 30", price: 80, demandIndex: 98 }
        ],
        marketAdvisory: "Cold-cured red onions show 25% value upside over next 4 weeks. Ideal for bulk commercial contract fulfillment."
      },
      {
        crop: "Magna Teff Grade 1",
        category: "Grains & Pulses",
        terminalMarket: "Debre Zeit ECX Terminal",
        currentPriceEtb: 122,
        unit: "KG",
        quintalPriceEtb: 12200,
        dayChangePercent: 3.8,
        demandRating: "HIGH",
        trendDirection: "UP",
        harvestArrivalVolumeTons: 540,
        forecast30Days: [
          { day: "Day 1", price: 122, demandIndex: 90 },
          { day: "Day 5", price: 124, demandIndex: 92 },
          { day: "Day 10", price: 125, demandIndex: 93 },
          { day: "Day 15", price: 128, demandIndex: 95 },
          { day: "Day 20", price: 130, demandIndex: 97 },
          { day: "Day 25", price: 132, demandIndex: 98 },
          { day: "Day 30", price: 135, demandIndex: 99 }
        ],
        marketAdvisory: "Export-grade white Teff commands premium escrow pricing with institutional buyers and Diaspora food processors."
      },
      {
        crop: "Hass Avocados (Export Grade)",
        category: "Fruits & Export",
        terminalMarket: "Bole Cold-Chain Cargo Gateway",
        currentPriceEtb: 75,
        unit: "KG",
        quintalPriceEtb: 7500,
        dayChangePercent: 8.5,
        demandRating: "CRITICAL HIGH",
        trendDirection: "UP",
        harvestArrivalVolumeTons: 110,
        forecast30Days: [
          { day: "Day 1", price: 75, demandIndex: 96 },
          { day: "Day 5", price: 78, demandIndex: 97 },
          { day: "Day 10", price: 82, demandIndex: 98 },
          { day: "Day 15", price: 85, demandIndex: 100 },
          { day: "Day 20", price: 88, demandIndex: 100 },
          { day: "Day 25", price: 90, demandIndex: 99 },
          { day: "Day 30", price: 92, demandIndex: 100 }
        ],
        marketAdvisory: "European & Middle East direct flight reefer containers active. GlobalGAP certified farmers receiving instant verified wire escrow."
      },
      {
        crop: "Highland Potatoes",
        category: "Tubers & Roots",
        terminalMarket: "Shashemene & Hawassa Hub",
        currentPriceEtb: 42,
        unit: "KG",
        quintalPriceEtb: 4200,
        dayChangePercent: -1.2,
        demandRating: "MODERATE",
        trendDirection: "STABLE",
        harvestArrivalVolumeTons: 410,
        forecast30Days: [
          { day: "Day 1", price: 42, demandIndex: 70 },
          { day: "Day 5", price: 43, demandIndex: 72 },
          { day: "Day 10", price: 44, demandIndex: 75 },
          { day: "Day 15", price: 46, demandIndex: 78 },
          { day: "Day 20", price: 47, demandIndex: 80 },
          { day: "Day 25", price: 49, demandIndex: 82 },
          { day: "Day 30", price: 50, demandIndex: 85 }
        ],
        marketAdvisory: "Consistent demand from urban food processing plants and chip manufacturers. Contract forward supply recommended."
      }
    ];
    res.json({
      timestamp: /* @__PURE__ */ new Date(),
      exchange: "Ethiopian Commodity Exchange & Regional Spot Index (ECX-AgriLink)",
      currency: "ETB",
      commodities: marketData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/ai/agri-advisor", async (req, res) => {
  try {
    const {
      query,
      crop = "All Crops",
      region = "Oromia / Rift Valley",
      soilType = "Clay Loam",
      lang = "en"
    } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    const ai = getGeminiClient();
    if (ai) {
      const systemPrompt = `You are "AgriLink AI Agronomist", a world-class agricultural expert specialized in Ethiopian farming systems, Ministry of Agriculture standards, irrigation schedules, pest management, and post-harvest handling.
Location: ${region}
Crop context: ${crop}
Soil Type: ${soilType}
User Language: ${lang === "am" ? "Amharic (\xE1\u0160\xA0\xE1\u02C6\u203A\xE1\u02C6\xAD\xE1\u0160\u203A)" : lang === "om" ? "Afaan Oromoo" : "English"}

Provide a practical, clear, high-yield actionable response. Include:
1. Direct answer with precise numbers (fertilizer dosages in kg/ha, planting spacing, water intervals).
2. 3 bulleted Key Action Steps.
3. Relevant input products to acquire.
Respond warmly and professionally in the requested language.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}

Farmer Query: ${query}` }]
          }
        ]
      });
      return res.json({
        success: true,
        reply: response.text,
        aiPowered: true
      });
    }
    const defaultReply = lang === "am" ? `\xE1\u0152\xA4\xE1\u0160\u201C \xE1\u2039\xAD\xE1\u02C6\xB5\xE1\u0152\xA5\xE1\u02C6\x8D\xE1\u0160\x9D! \xE1\u02C6\u02C6${crop} \xE1\u02C6\x9D\xE1\u02C6\xAD\xE1\u2030\xB5 \xE1\u2030\xA0${region} \xE1\u0160\xAD\xE1\u02C6\x8D\xE1\u02C6\x8D \xE1\u2039\xA8\xE1\u02C6\u0161\xE1\u0160\xA8\xE1\u2030\xB0\xE1\u02C6\u2030\xE1\u2030\xB5\xE1\u0160\u2022 \xE1\u2039\u2039\xE1\u0160\u201C \xE1\u2039\u2039\xE1\u0160\u201C \xE1\u0160\x90\xE1\u0152\xA5\xE1\u2030\xA6\xE1\u2030\xBD \xE1\u2039\xAD\xE1\u2030\xB0\xE1\u0152\x8D\xE1\u2030\xA5\xE1\u02C6\xA9:

1. \xE1\u2039\xA8\xE1\u0160\xA0\xE1\x8D\u02C6\xE1\u02C6\xAD \xE1\u2039\x9D\xE1\u0152\x8D\xE1\u0152\u2026\xE1\u2030\xB5 \xE1\u0160\xA5\xE1\u0160\u201C \xE1\u02C6\u203A\xE1\u2039\xB3\xE1\u2030\xA0\xE1\u02C6\xAA\xE1\u2039\xAB: \xE1\u2030\xA0\xE1\u02C6\u201E\xE1\u0160\xAD\xE1\u2030\xB3\xE1\u02C6\xAD 100 \xE1\u0160\xAA\xE1\u02C6\u017D NPS \xE1\u2030\xA6\xE1\u02C6\xAE\xE1\u0160\u2022 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\u2039\x9D\xE1\u02C6\xAA\xE1\u2039\xAB \xE1\u2039\u02C6\xE1\u2030\u2026\xE1\u2030\xB5\xE1\x8D\xA3 \xE1\u0160\xA5\xE1\u0160\u201C 50 \xE1\u0160\xAA\xE1\u02C6\u017D \xE1\u2039\xA9\xE1\u02C6\xAA\xE1\u2039\xAB \xE1\u2030\xA030\xE1\u0160\u203A\xE1\u2039\x8D \xE1\u2030\u20AC\xE1\u0160\u2022 \xE1\u2039\xAD\xE1\u0152\xA8\xE1\u02C6\x9D\xE1\u02C6\xA9\xE1\x8D\xA2
2. \xE1\u2039\xA8\xE1\u02C6\u02DC\xE1\u02C6\xB5\xE1\u0160\u2013 \xE1\u0160\xA0\xE1\u0152\xA0\xE1\u2030\u0192\xE1\u2030\u20AC\xE1\u02C6\x9D: \xE1\u2030\xA0\xE1\u02C6\xB3\xE1\u02C6\x9D\xE1\u0160\u2022\xE1\u2030\xB5 2 \xE1\u0152\u0160\xE1\u2039\u0153 \xE1\u2030\xA0\xE1\u0152\xA0\xE1\u2039\u2039\xE1\u2030\xB5 \xE1\u2039\u02C6\xE1\u2039\xAD\xE1\u02C6\x9D \xE1\u2030\xA0\xE1\u02C6\u203A\xE1\u2030\xB3 \xE1\u2039\xAB\xE1\u0152\xA0\xE1\u0152\xA1\xE1\x8D\xA2
3. \xE1\u2039\xA8\xE1\u02C6\xB0\xE1\u2030\xA5\xE1\u02C6\x8D \xE1\u0152\xA5\xE1\u2030\xA0\xE1\u2030\u0192: \xE1\x8D\u20AC\xE1\u02C6\xA8-\xE1\u2030\xB0\xE1\u2030\xA3\xE1\u2039\xAD \xE1\u2030\xA0\xE1\u2039\xA810 \xE1\u2030\u20AC\xE1\u0160\u2018 \xE1\u2030\xA0\xE1\u02C6\u02DC\xE1\x8D\u02C6\xE1\u2030\xB0\xE1\u02C6\xBD \xE1\u2039\xA8\xE1\u2030\u2026\xE1\u0152\xA0\xE1\u02C6\x8D \xE1\u02C6\u02DC\xE1\u2039\xB5\xE1\u02C6\xA8\xE1\u2030\u2026 \xE1\u02C6\x9D\xE1\u02C6\x8D\xE1\u0160\xAD\xE1\u2030\xB5 \xE1\u0160\xAB\xE1\u02C6\u02C6 \xE1\u2039\u02C6\xE1\u2039\xB2\xE1\u2039\xAB\xE1\u2039\x8D\xE1\u0160\u2018 \xE1\u02C6\u203A\xE1\u0160\u2022\xE1\u0160\xAE\xE1\u2039\u0153\xE1\u2030\xA5 \xE1\u2039\xAD\xE1\u02C6\xAD\xE1\u0152\xA9\xE1\x8D\xA2` : `For optimal yield of ${crop} in ${region} (${soilType}):

1. Soil & Fertilizer: Apply 100 kg/ha NPS-Boron at planting, followed by 50 kg/ha Urea top-dressing at 30 days after germination.
2. Irrigation Scheduling: Irrigate 2-3 times weekly during flowering; avoid wetting foliage directly to prevent fungal blights.
3. Market Optimization: Ensure batch-level harvest grading (Grade 1 vs Processing Grade) to capture the highest ETB price on the AgriLink platform.`;
    res.json({
      success: true,
      reply: defaultReply,
      aiPowered: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/ai/yield-estimator", async (req, res) => {
  try {
    const {
      crop = "Roma Tomatoes",
      hectares = 2.5,
      irrigationType = "Drip Irrigation",
      seedQuality = "CERTIFIED_HYBRID",
      fertilizerType = "NPS_PLUS_UREA",
      region = "Oromia"
    } = req.body;
    const area = Number(hectares) || 1;
    let baseYieldPerHectareQuintals = 250;
    let pricePerQuintalEtb = 4800;
    let inputCostPerHectareEtb = 45e3;
    let maturityDays = 75;
    if (crop.toLowerCase().includes("tomato")) {
      baseYieldPerHectareQuintals = 280;
      pricePerQuintalEtb = 4800;
      inputCostPerHectareEtb = 52e3;
      maturityDays = 75;
    } else if (crop.toLowerCase().includes("onion")) {
      baseYieldPerHectareQuintals = 220;
      pricePerQuintalEtb = 6400;
      inputCostPerHectareEtb = 48e3;
      maturityDays = 110;
    } else if (crop.toLowerCase().includes("teff")) {
      baseYieldPerHectareQuintals = 24;
      pricePerQuintalEtb = 12200;
      inputCostPerHectareEtb = 22e3;
      maturityDays = 95;
    } else if (crop.toLowerCase().includes("avocado")) {
      baseYieldPerHectareQuintals = 160;
      pricePerQuintalEtb = 7500;
      inputCostPerHectareEtb = 35e3;
      maturityDays = 180;
    } else if (crop.toLowerCase().includes("potato")) {
      baseYieldPerHectareQuintals = 260;
      pricePerQuintalEtb = 4200;
      inputCostPerHectareEtb = 4e4;
      maturityDays = 90;
    }
    const irrigationMultiplier = irrigationType.includes("Drip") ? 1.25 : irrigationType.includes("Furrow") ? 1.05 : 0.85;
    const seedMultiplier = seedQuality === "CERTIFIED_HYBRID" ? 1.2 : 0.9;
    const fertilizerMultiplier = fertilizerType.includes("NPS") ? 1.15 : 0.95;
    const finalYieldPerHectare = Math.round(baseYieldPerHectareQuintals * irrigationMultiplier * seedMultiplier * fertilizerMultiplier);
    const totalProjectedYieldQuintals = Math.round(finalYieldPerHectare * area);
    const totalProjectedYieldKg = totalProjectedYieldQuintals * 100;
    const totalInputCostsEtb = Math.round(inputCostPerHectareEtb * area);
    const projectedGrossRevenueEtb = Math.round(totalProjectedYieldQuintals * pricePerQuintalEtb);
    const projectedNetProfitEtb = projectedGrossRevenueEtb - totalInputCostsEtb;
    const projectedRoiPercent = Math.round(projectedNetProfitEtb / totalInputCostsEtb * 100);
    const harvestDate = new Date(Date.now() + maturityDays * 864e5).toISOString().split("T")[0];
    res.json({
      crop,
      hectares: area,
      region,
      projectedYieldQuintals: totalProjectedYieldQuintals,
      projectedYieldKg: totalProjectedYieldKg,
      yieldPerHectareQuintals: finalYieldPerHectare,
      currentMarketPricePerQuintalEtb: pricePerQuintalEtb,
      totalInputCostsEtb,
      projectedGrossRevenueEtb,
      projectedNetProfitEtb,
      projectedRoiPercent,
      estimatedHarvestDate: harvestDate,
      daysToMaturity: maturityDays,
      recommendedBuyerChannels: [
        {
          channel: "Food Processors & Canneries",
          sharePercent: 50,
          targetPriceEtb: Math.round(pricePerQuintalEtb * 0.98),
          benefit: "Guaranteed high volume forward contract off-take with direct hub pickup."
        },
        {
          channel: "Agri-Investors & Exporters",
          sharePercent: 30,
          targetPriceEtb: Math.round(pricePerQuintalEtb * 1.15),
          benefit: "Top tier export premium with verified trace QR code certification."
        },
        {
          channel: "Supermarkets & Urban Grocers",
          sharePercent: 20,
          targetPriceEtb: Math.round(pricePerQuintalEtb * 1.08),
          benefit: "Immediate daily settlement into Telebirr Escrow account."
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var CHAPA_SECRET = process.env.CHAPA_SECRET_KEY || "";
var CHAPA_BASE_URL = "https://api.chapa.co/v1";
var APP_BASE_URL = process.env.APP_URL || "http://localhost:3000";
async function chapaPost(endpoint, payload) {
  const r = await fetch(CHAPA_BASE_URL + endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + CHAPA_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}
async function chapaGet(endpoint) {
  const r = await fetch(CHAPA_BASE_URL + endpoint, {
    headers: { Authorization: "Bearer " + CHAPA_SECRET }
  });
  return r.json();
}
function getSb() {
  return supabase;
}
app.post("/api/escrow/initialize", async (req, res) => {
  try {
    const { order_id, amount, email, buyer_name, phone } = req.body;
    if (!order_id || !amount) {
      return res.status(400).json({ error: "order_id and amount are required" });
    }
    const txRef = "ED-TX-" + String(order_id).substring(0, 8) + "-" + Date.now();
    const chapaPayload = {
      amount: String(amount),
      currency: "ETB",
      email: email || "buyer@agrilink.et",
      first_name: (buyer_name || "AgriLink Buyer").split(" ")[0],
      last_name: (buyer_name || "Buyer").split(" ").slice(1).join(" ") || "Customer",
      phone_number: phone || "0961123330",
      tx_ref: txRef,
      callback_url: APP_BASE_URL + "/api/webhooks/chapa",
      return_url: APP_BASE_URL + "/?payment=success&ref=" + txRef
    };
    chapaPayload["customization[title]"] = "AgriLink Escrow Payment";
    chapaPayload["customization[description]"] = "Escrow lock for Order #" + order_id;
    const chapaRes = await chapaPost("/transaction/initialize", chapaPayload);
    if (chapaRes?.status !== "success") {
      console.error("Chapa init failed:", chapaRes);
      return res.status(400).json({
        error: "Chapa payment initialization failed",
        details: chapaRes?.message || "Unknown Chapa error"
      });
    }
    try {
      const sb = getSb();
      await sb.from("escrow_ledger").insert({
        order_id: String(order_id),
        amount: Number(amount),
        chapa_tx_ref: txRef,
        status: "pending"
      });
    } catch (e) {
      console.warn("Supabase escrow insert:", e.message);
    }
    try {
      await db.insert(payments).values({
        orderId: Number(order_id),
        userId: currentUserId,
        amountEtb: Number(amount),
        currency: "ETB",
        provider: "CHAPA",
        transactionRef: txRef,
        status: "PENDING",
        paymentMethod: "CHAPA_CHECKOUT"
      });
    } catch (e) {
      console.warn("Local payment insert:", e.message);
    }
    return res.json({ success: true, checkout_url: chapaRes.data?.checkout_url, tx_ref: txRef });
  } catch (err) {
    console.error("Escrow initialize error:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/webhooks/chapa", async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    if (!tx_ref) return res.status(400).json({ error: "tx_ref missing" });
    let verified = status === "success";
    try {
      const v = await chapaGet("/transaction/verify/" + tx_ref);
      verified = v?.data?.status === "success";
    } catch (e) {
      console.warn("Chapa verify fallback:", e.message);
    }
    if (!verified) return res.status(400).json({ status: "failed" });
    try {
      await db.update(payments).set({ status: "PAID", paidAt: /* @__PURE__ */ new Date() }).where(eq(payments.transactionRef, tx_ref));
    } catch (e) {
      console.warn("DB payments update:", e.message);
    }
    try {
      const sb = getSb();
      const { data: escrow } = await sb.from("escrow_ledger").update({ status: "locked", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("chapa_tx_ref", tx_ref).select().single();
      if (escrow?.order_id) {
        await sb.from("core_orders").update({ status: "locked_in_escrow" }).eq("id", escrow.order_id);
        try {
          await db.update(orders).set({ paymentStatus: "PAID", orderStatus: "CONFIRMED", updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.payerAccountNumber, tx_ref));
        } catch {
        }
      }
    } catch (e) {
      console.warn("Supabase escrow lock:", e.message);
    }
    console.log("[Chapa Webhook] Escrow LOCKED \u2014 tx_ref:", tx_ref);
    return res.json({ status: "verified", tx_ref });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/escrow/verify/:txRef", async (req, res) => {
  try {
    const result = await chapaGet("/transaction/verify/" + req.params.txRef);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/escrow/status/:orderId", async (req, res) => {
  try {
    const sb = getSb();
    const { data, error } = await sb.from("escrow_ledger").select("*").eq("order_id", req.params.orderId).single();
    if (error || !data) return res.status(404).json({ error: "No escrow record found" });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/escrow/release", async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: "order_id is required" });
    const sb = getSb();
    const { data: orderData } = await sb.from("core_orders").select("*, farmer:farmer_id(phone, full_name)").eq("id", order_id).single();
    if (!orderData) return res.status(404).json({ error: "Order not found" });
    if (orderData.status !== "delivered") return res.status(400).json({
      error: "Order must be delivered before releasing payout. Current status: " + orderData.status
    });
    const farmerPhone = orderData.farmer?.phone;
    const farmerName = orderData.farmer?.full_name || "Farmer";
    const amount = orderData.price_etb;
    if (!farmerPhone) return res.status(400).json({ error: "Farmer phone not found" });
    const payoutRef = "PAYOUT-" + String(order_id).substring(0, 8) + "-" + Date.now();
    const payoutRes = await chapaPost("/transfers", {
      account_name: farmerName,
      account_number: farmerPhone,
      amount: String(amount),
      currency: "ETB",
      reference: payoutRef,
      bank_code: "856"
      // 856 = Telebirr
    });
    if (payoutRes?.status !== "success") {
      console.error("Chapa payout failed:", payoutRes);
      return res.status(500).json({ error: "Payout failed", details: payoutRes?.message });
    }
    await sb.from("escrow_ledger").update({ status: "released", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("order_id", order_id);
    await sb.from("core_orders").update({ status: "completed" }).eq("id", order_id);
    console.log("[Escrow Release]", amount, "ETB released to", farmerName, farmerPhone);
    return res.json({ success: true, payout_ref: payoutRef, message: "Payout released to " + farmerName });
  } catch (err) {
    console.error("Escrow release error:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/escrow/confirm-delivery", async (req, res) => {
  try {
    const { order_id, proof_notes, proof_url } = req.body;
    if (!order_id) return res.status(400).json({ error: "order_id is required" });
    const sb = getSb();
    await sb.from("core_orders").update({ status: "delivered" }).eq("id", order_id);
    await sb.from("logistics").update({ status: "delivered", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("order_id", order_id);
    try {
      await db.update(deliveries).set({
        status: "DELIVERED",
        actualDeliveredAt: /* @__PURE__ */ new Date(),
        proofNotes: proof_notes || "Delivery confirmed",
        proofOfDeliveryUrl: proof_url || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(deliveries.orderId, Number(order_id)));
    } catch {
    }
    return res.json({ success: true, message: "Order " + order_id + " marked as delivered. Escrow can now be released." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/escrow/ledger", async (req, res) => {
  try {
    const sb = getSb();
    const { data, error } = await sb.from("escrow_ledger").select("*, order:order_id(*)").order("updated_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriLink Platform Server running on http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default
};
