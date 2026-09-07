export type UserRole =
  | 'FARMER'
  | 'BUYER'
  | 'BUSINESS_BUYER'
  | 'INPUT_SUPPLIER'
  | 'DRIVER'
  | 'LOGISTICS_ADMIN'
  | 'FINANCIAL_INSTITUTION'
  | 'HUB_OPERATOR'
  | 'PLATFORM_ADMIN';

export type ProductType =
  | 'FRESH_FOOD'
  | 'GRAIN'
  | 'PULSE'
  | 'FRUIT'
  | 'VEGETABLE'
  | 'ROOT_TUBER'
  | 'OILSEED'
  | 'COFFEE'
  | 'SPICE'
  | 'HERB'
  | 'HONEY'
  | 'DAIRY'
  | 'EGG'
  | 'POULTRY'
  | 'MEAT'
  | 'LIVESTOCK'
  | 'PROCESSED_FOOD'
  | 'OTHER';

export type QualityGrade =
  | 'PREMIUM'
  | 'GRADE_A'
  | 'GRADE_B'
  | 'STANDARD'
  | 'GRADE_1_EXPORT'
  | 'GRADE_1_LOCAL'
  | 'GRADE_2_COMMERCIAL'
  | 'PROCESSING_GRADE';

export type ProduceGrade = QualityGrade;

export type FreshnessStatus =
  | 'HARVESTED_TODAY'
  | 'HARVESTED_RECENTLY'
  | 'AVAILABLE_NOW';

export type TargetBuyerType =
  | 'ALL'
  | 'PROCESSOR'
  | 'INVESTOR'
  | 'BUYER';

export type FarmerClassification =
  | 'COMMERCIAL_GROWER'
  | 'SMALLHOLDER_COOP'
  | 'OUTGROWER_SCHEME'
  | 'SPECIALTY_EXPORTER';

export type OrderStatus =
  | 'CART'
  | 'CHECKOUT'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type DeliveryStatus =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'ARRIVED_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_DROPOFF'
  | 'DELIVERED'
  | 'FAILED';

export type LoanStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'REPAID'
  | 'DEFAULTED';

export interface User {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  organizationName?: string | null;
  region: string;
  zone?: string | null;
  woreda?: string | null;
  nationalIdNumber?: string | null;
  tinNumber?: string | null;
  address?: string | null;
  isVerified: boolean;
  isEmailVerified?: boolean;
  status: string;
  targetBuyerTypes?: string[] | null;
}

export interface FarmerProfile {
  id: number;
  userId: number;
  farmName: string;
  region: string;
  zone?: string | null;
  woreda?: string | null;
  totalAreaHectares: number;
  primaryCrops?: string[] | null;
  farmingExperienceYears: number;
  nationalIdNumber?: string | null;
  cooperativeMembership?: string | null;
  bankAccountNumber?: string | null;
  bankName: string;
  bio?: string | null;
  rating: number;
  completedOrdersCount: number;
  totalProduceSoldTons: number;
  isCertifiedOrganic: boolean;
  farmerClassification?: FarmerClassification | string;
  targetBuyerTypes?: string[] | null;
  certifications?: string[] | null;
  farmPhotos?: string[] | null;
}

export interface Farm {
  id: number;
  farmerId: number;
  name: string;
  locationName: string;
  region: string;
  latitude?: number | null;
  longitude?: number | null;
  sizeHectares: number;
  soilType: string;
  irrigationType: string;
  certifications?: string[] | null;
  documents?: any;
  fields?: FarmField[];
}

export interface FarmField {
  id: number;
  farmId: number;
  fieldName: string;
  areaHectares: number;
  currentCrop: string;
  variety?: string | null;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  status: string;
  healthScore: number;
  soilMoisturePercent: number;
  notes?: string | null;
}

export interface ProductSubcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  productType: ProductType;
  icon?: string | null;
  description?: string | null;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  subcategories?: ProductSubcategory[];
}

export interface Product {
  id: number;
  farmerId: number;
  farmId?: number | null;
  categoryId: number;
  subcategoryId?: number | null;
  name: string;
  subcategory?: string | null;
  productType: ProductType;
  variety?: string | null;
  description: string;
  grade: QualityGrade;
  qualityGrade?: QualityGrade | string;
  pricePerUnitEtb: number;
  currency?: string;
  unit: string;
  availableQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number | null;
  harvestDate: string;
  productionDate?: string | null;
  expirationDate?: string | null;
  freshnessStatus?: FreshnessStatus | string;
  expectedAvailability: string;
  farmLocation: string;
  region: string;
  zone?: string | null;
  woreda?: string | null;
  townCity?: string | null;
  altitudeMeters?: number | null;
  originDetails?: string | null;
  processingMethod?: string | null;
  harvestYear?: number | null;
  storageRequirements?: string | null;
  packagingType?: string | null;
  ingredients?: string | null;
  isLiveAnimal?: boolean;
  animalBreed?: string | null;
  veterinaryCertificate?: string | null;
  images?: string[] | null;
  lotBatchNumber: string;
  qualityScore: number;
  certifications?: string[] | null;
  isOrganic: boolean;
  isVerifiedFarmer?: boolean;
  deliveryAvailability?: string;
  status: string;
  shelfLifeDays: number;
  attributes?: Record<string, any>;
  targetBuyerType?: TargetBuyerType | string;
  targetBuyerNotes?: string | null;
  farmerName?: string;
  farmerRating?: number;
  farmerVerified?: boolean;
  farmerExperienceYears?: number;
  farmerBio?: string | null;
  farmerCompletedOrders?: number;
  farmName?: string;
  categoryName?: string;
  categorySlug?: string;
  reviews?: any[];
  inspections?: any[];
}

export interface InputProduct {
  id: number;
  supplierId: number;
  categoryId: number;
  name: string;
  brand: string;
  description: string;
  priceEtb: number;
  unit: string;
  stockQuantity: number;
  minOrderQuantity: number;
  specifications?: string | null;
  applicationGuide?: string | null;
  images?: string[] | null;
  isCertified: boolean;
  status: string;
  supplierName?: string;
  supplierVerified?: boolean;
  categoryName?: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  itemType: 'PRODUCE' | 'INPUT';
  productId?: number | null;
  inputProductId?: number | null;
  quantity: number;
  unitPriceEtb: number;
  product?: Product;
  inputProduct?: InputProduct;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemType: 'PRODUCE' | 'INPUT';
  productId?: number | null;
  inputProductId?: number | null;
  sellerId: number;
  name: string;
  grade?: string | null;
  unit: string;
  quantity: number;
  unitPriceEtb: number;
  subtotalEtb: number;
  lotBatchNumber?: string | null;
  status: string;
}

export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  amountEtb: number;
  currency: string;
  provider: 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR' | 'AWASH_BANK' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | string;
  transactionRef: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'ESCROW_HELD' | 'RELEASED_TO_FARMER' | 'REFUNDED' | 'FAILED' | string;
  paymentMethod?: string | null;
  payerAccountNumber?: string | null;
  paymentDetails?: any;
  paidAt?: string | null;
  createdAt: string;
  userName?: string;
  userPhone?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  orderType: string;
  totalAmountEtb: number;
  deliveryFeeEtb: number;
  serviceFeeEtb: number;
  grandTotalEtb: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryModel: 'DIRECT' | 'HUB_CROSS_DOCK';
  hubId?: number | null;
  deliveryAddress: string;
  deliveryRegion: string;
  deliveryZone?: string | null;
  deliveryWoreda?: string | null;
  nationalIdNumber?: string | null;
  tinNumber?: string | null;
  payerAccountNumber?: string | null;
  deliveryContactName: string;
  deliveryContactPhone: string;
  requestedDeliveryDate?: string | null;
  notes?: string | null;
  createdAt: string;
  buyerName?: string;
  buyer?: User;
  items?: OrderItem[];
  delivery?: Delivery;
  payment?: Payment;
  hub?: Hub;
}

export interface Delivery {
  id: number;
  orderId: number;
  driverId?: number | null;
  deliveryModel: 'DIRECT' | 'HUB_CROSS_DOCK';
  hubId?: number | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  status: DeliveryStatus;
  estimatedArrival?: string | null;
  actualDeliveredAt?: string | null;
  proofOfDeliveryUrl?: string | null;
  proofNotes?: string | null;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
}

export interface InputCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface Hub {
  id: number;
  name: string;
  code: string;
  region: string;
  city: string;
  locationAddress?: string;
  address?: string;
  latitude: number;
  longitude: number;
  capacityTons?: number;
  storageCapacityTons?: number;
  currentStorageTons: number;
  managerName?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  coldStorageAvailable: boolean;
  status: string;
}

export type Notification = NotificationItem;

export interface Driver {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlateNumber: string;
  capacityTons: number;
  hasRefrigeration: boolean;
  region: string;
  currentStatus: 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'OFFLINE';
  currentLat?: number | null;
  currentLng?: number | null;
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
}

export interface FinanceApplication {
  id: number;
  farmerId: number;
  institutionId?: number | null;
  loanType: string;
  amountRequestedEtb: number;
  purpose: string;
  farmId?: number | null;
  targetCrop: string;
  expectedYieldTons: number;
  expectedRevenueEtb: number;
  repaymentPeriodMonths: number;
  status: LoanStatus;
  approvedAmountEtb?: number | null;
  interestRatePercent?: number | null;
  reviewNotes?: string | null;
  farmerName?: string;
  farmName?: string;
  createdAt: string;
}

export interface QuoteRequest {
  id: number;
  businessBuyerId: number;
  sellerId?: number | null;
  productId?: number | null;
  productName: string;
  requestedQuantity: number;
  unit: string;
  requestedGrade: string;
  targetPriceEtb?: number | null;
  deliveryDate: string;
  deliveryLocation: string;
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  offerPriceEtb?: number | null;
  offerNotes?: string | null;
  buyerName?: string;
  buyerCompany?: string;
  createdAt: string;
}

export interface QualityInspection {
  id: number;
  productId?: number | null;
  orderId?: number | null;
  batchNumber: string;
  inspectorName: string;
  inspectionDate: string;
  gradeAssigned: string;
  moistureContentPercent?: number | null;
  defectRatePercent: number;
  appearanceScore: number;
  status: 'PENDING_INSPECTION' | 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW';
  reportSummary: string;
  certificateUrl?: string | null;
}

export interface Review {
  id: number;
  orderId: number;
  reviewerId: number;
  targetType: 'PRODUCT' | 'FARMER' | 'DRIVER';
  targetId: number;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  reviewerName?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  userId: number;
  category: 'PAYMENT' | 'ORDER_DISPUTE' | 'QUALITY_ISSUE' | 'DRIVER_DELAY' | 'ACCOUNT_VERIFICATION' | 'TECHNICAL' | string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedAdminId?: number | null;
  assignedAdminName?: string | null;
  resolutionNotes?: string | null;
  userName?: string;
  userRole?: string;
  userPhone?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  id: number;
  platformFeePercent: number;
  escrowHoldHours: number;
  minOrderAmountEtb: number;
  currency: string;
  maintenanceMode: boolean;
  supportPhone: string;
  supportEmail: string;
  taxRatePercent: number;
}

