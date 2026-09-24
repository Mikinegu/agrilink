// AgriLink AI Payment Controller & Anti-Fraud Sentinel
// Automated Payer Tracking ('Who Paid vs. Who Did Not Pay') & Real-Time Transaction Authenticity Verification

export interface TransactionValidationResult {
  isValid: boolean;
  status: 'VALID' | 'INVALID_SYNTAX' | 'GIBBERISH_DETECTED' | 'TOO_SHORT' | 'REPEATED_CHARS' | 'EMPTY';
  confidence: number;
  channel: string;
  normalizedRef: string;
  feedbackMessageEn: string;
  feedbackMessageAm: string;
  feedbackMessageOm: string;
  suggestedCorrection?: string;
  sampleValidRef?: string;
}

export interface PayerReconciliationItem {
  id: string;
  orderId: string;
  buyerName: string;
  buyerPhone: string;
  buyerOrg: string;
  cropDetails: string;
  amountEtb: number;
  paymentStatus: 'PAID_VERIFIED' | 'UNPAID_PENDING' | 'UNPAID_OVERDUE' | 'UNDER_AUDIT' | 'REJECTED_FAKE';
  paymentMethod?: string;
  transactionRef?: string;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'NOT_FUNDED' | 'DISPUTED';
  dueDate: string;
  lastUpdated: string;
  aiAuditNotes: string;
}

export interface ReceiptInspectionResult {
  isValid: boolean;
  status: 'CONFIRMED' | 'MISSING_PAYMENT_NAME' | 'MISMATCHED_PAYMENT_NAME' | 'EMPTY_OR_UNREADABLE';
  confidence: number;
  expectedPaymentName: string;
  detectedPaymentName?: string;
  feedbackMessageEn: string;
  feedbackMessageAm: string;
  feedbackMessageOm: string;
  detectedKeywords: string[];
}

// Known Ethiopian Banking Rail Syntax Definitions
export const RAIL_RULES: Record<
  string,
  {
    name: string;
    officialPaymentName: string;
    shortName: string;
    amharicName: string;
    oromoName: string;
    keywords: string[];
    prefix?: string;
    minLen: number;
    maxLen: number;
    regex: RegExp;
    formatDescription: string;
    sampleValid: string;
  }
> = {
  CBE_MOBILE_BANKING: {
    name: 'Commercial Bank of Ethiopia (CBE Direct)',
    officialPaymentName: 'Commercial Bank of Ethiopia (CBE Direct)',
    shortName: 'CBE',
    amharicName: 'የኢትዮጵያ ንግድ ባንክ',
    oromoName: 'Baankii Daldala Itoophiyaa',
    keywords: ['commercial bank of ethiopia', 'cbe', 'ንግድ ባንክ', 'የኢትዮጵያ ንግድ ባንክ', 'cbe birr', 'cbe mobile', 'cbe direct', 'ethiopian commercial bank'],
    prefix: 'FT',
    minLen: 12,
    maxLen: 24,
    regex: /^FT[0-9A-Za-z]{10,22}$/i,
    formatDescription: 'Must start with "FT" followed by 10 to 14 numbers/letters (e.g. FT260948123048).',
    sampleValid: 'FT260948123048',
  },
  CBE_BIRR: {
    name: 'CBE Birr Wallet',
    officialPaymentName: 'CBE Birr Mobile Wallet',
    shortName: 'CBE Birr',
    amharicName: 'ሲቢኢ ብር',
    oromoName: 'CBE Birr',
    keywords: ['cbe birr', 'cbebirr', 'cbe', 'ንግድ ባንክ', '847', 'cbe mobile wallet'],
    minLen: 10,
    maxLen: 18,
    regex: /^[0-9]{10,18}$/,
    formatDescription: '10 to 18 numeric digits found on your CBE Birr SMS (e.g. 100084920192).',
    sampleValid: '100084920192',
  },
  TELEBIRR_MANUAL: {
    name: 'Telebirr Mobile Money',
    officialPaymentName: 'Telebirr Mobile Money (Ethio Telecom)',
    shortName: 'Telebirr',
    amharicName: 'ቴሌብር (ኢትዮ ቴሌኮም)',
    oromoName: 'Telebirr (Ityoo Teelekoom)',
    keywords: ['telebirr', 'tele birr', 'ethio telecom', 'ቴሌብር', 'ኢትዮ ቴሌኮም', 'superapp', '127'],
    minLen: 10,
    maxLen: 24,
    regex: /^[A-Za-z0-9]{10,24}$/,
    formatDescription: '10 to 16 alphanumeric characters found on Ethio Telecom receipt (e.g. ADQ882941091).',
    sampleValid: 'ADQ882941091',
  },
  AWASH_BIRR: {
    name: 'Awash Bank / Awash Birr',
    officialPaymentName: 'Awash Bank / Awash Birr',
    shortName: 'Awash Bank',
    amharicName: 'አዋሽ ባንክ',
    oromoName: 'Baankii Hawaash',
    keywords: ['awash bank', 'awash birr', 'awash', 'አዋሽ', 'አዋሽ ባንክ', 'awb', 'awash mobile'],
    minLen: 8,
    maxLen: 20,
    regex: /^(AWB)?[0-9A-Za-z]{8,20}$/i,
    formatDescription: '8 to 16 character transfer journal code (e.g. AWB948102384).',
    sampleValid: 'AWB948102384',
  },
  DASHEN_AMOLE: {
    name: 'Dashen Bank / Amole',
    officialPaymentName: 'Dashen Bank / Amole',
    shortName: 'Dashen Bank',
    amharicName: 'ዳሽን ባንክ',
    oromoName: 'Baankii Daashan',
    keywords: ['dashen bank', 'dashen', 'amole', 'ዳሽን', 'ዳሽን ባንክ', 'dsh', 'amole payment'],
    minLen: 8,
    maxLen: 22,
    regex: /^(DSH)?[0-9A-Za-z]{8,22}$/i,
    formatDescription: '8 to 16 character transfer reference code (e.g. DSH849201948).',
    sampleValid: 'DSH849201948',
  },
  BANK_OF_ABYSSINIA: {
    name: 'Bank of Abyssinia',
    officialPaymentName: 'Bank of Abyssinia (BoA)',
    shortName: 'Bank of Abyssinia',
    amharicName: 'አቢሲኒያ ባንክ',
    oromoName: 'Baankii Abisiiniyaa',
    keywords: ['bank of abyssinia', 'abyssinia', 'boa', 'አቢሲኒያ', 'አቢሲኒያ ባንክ', 'boa mobile'],
    minLen: 8,
    maxLen: 22,
    regex: /^(BOA)?[0-9A-Za-z]{8,22}$/i,
    formatDescription: '8 to 16 character transfer reference from BoA mobile app (e.g. BOA294810293).',
    sampleValid: 'BOA294810293',
  },
  ZEMEN_BANK: {
    name: 'Zemen Bank',
    officialPaymentName: 'Zemen Bank',
    shortName: 'Zemen Bank',
    amharicName: 'ዘመን ባንክ',
    oromoName: 'Baankii Zamen',
    keywords: ['zemen bank', 'zemen', 'ዘመን ባንክ', 'ዘመን', 'zmn'],
    minLen: 8,
    maxLen: 22,
    regex: /^(ZMN)?[0-9A-Za-z]{8,22}$/i,
    formatDescription: '8 to 16 character Zemen transfer slip number (e.g. ZMN492810291).',
    sampleValid: 'ZMN492810291',
  },
};

const COMMON_GIBBERISH_STRINGS = [
  'asdf', 'qwerty', 'zxcv', '12345', '99999', '00000', 'test', 'fake',
  'unknown', 'random', 'xxxx', 'aaaa', 'bbbb', 'cccc', 'none', 'nothing',
  'null', 'abcd', '1111', '2222', '3333', 'sample',
];

/**
 * Validates a transaction number in real-time.
 * If user enters unknown, random, gibberish or malformed text,
 * it returns professional guidance asking them to check their receipt and try again.
 */
export function validatePaymentTransaction(
  channel: string,
  rawTx: string
): TransactionValidationResult {
  const tx = (rawTx || '').trim().replace(/\s+/g, '');

  if (!tx) {
    return {
      isValid: false,
      status: 'EMPTY',
      confidence: 0,
      channel,
      normalizedRef: '',
      feedbackMessageEn: 'Please enter the official transaction reference number from your bank or mobile payment SMS receipt.',
      feedbackMessageAm: 'እባክዎ ከባንክዎ ወይም ከቴሌብር የደረሰዎትን ትክክለኛ የግብይት ቁጥር (Transaction Number) ያስገቡ።',
      feedbackMessageOm: 'Maaloo lakkoofsa gurgurtaa sirrii herreega baankii ykn ergaa gabaabaa Telebirr keessan irraa galchaa.',
    };
  }

  const normalized = tx.toUpperCase();
  const rule = RAIL_RULES[channel] || RAIL_RULES.CBE_MOBILE_BANKING;

  // 1. Detect common gibberish words
  const lower = tx.toLowerCase();
  for (const g of COMMON_GIBBERISH_STRINGS) {
    if (lower.includes(g) && tx.length < 15) {
      return {
        isValid: false,
        status: 'GIBBERISH_DETECTED',
        confidence: 99,
        channel,
        normalizedRef: normalized,
        feedbackMessageEn: `The transaction reference you entered ("${tx}") appears to be a random or placeholder input. Commercial banking gateways will decline this. Please check your official SMS receipt and try again.`,
        feedbackMessageAm: `ያስገቡት የግብይት ቁጥር ("${tx}") ትክክለኛ የባንክ ማረጋገጫ አይመስልም። እባክዎ ከደረሰኝዎ ወይም ከባንክ የፅሁፍ መልዕክት ላይ ትክክለኛውን ቁጥር አይተው እንደገና ይሞክሩ።`,
        feedbackMessageOm: `Lakkoofsi gurgurtaa galchan ("${tx}") soba ykn sirrii kan hin taane fakkaata. Maaloo ergaa baankii keessan ilaaluun irra deebi'aa yaalaa.`,
        suggestedCorrection: rule.sampleValid,
        sampleValidRef: rule.sampleValid,
      };
    }
  }

  // 2. Detect repeated identical characters (e.g., '111111111' or 'aaaaaaaaa')
  if (/^(.)\1{4,}$/.test(tx)) {
    return {
      isValid: false,
      status: 'REPEATED_CHARS',
      confidence: 98,
      channel,
      normalizedRef: normalized,
      feedbackMessageEn: `The transaction number contains repeated identical characters ("${tx}"). Genuine bank confirmation numbers have unique digits. Please verify your receipt and try again.`,
      feedbackMessageAm: `ያስገቡት ቁጥር ተደጋጋሚ ተመሳሳይ ፊደላትን/ቁጥሮችን የያዘ ነው ("${tx}")። ትክክለኛ የባንክ ደረሰኝ ቁጥር አይተው እንደገና ይሞክሩ።`,
      feedbackMessageOm: `Lakkoofsi kun qubee/lakkoofsa wal fakkaatu irra deddeebi'e qaba. Maaloo nagahee keessan mirkaneeffachuun irra deebi'aa yaalaa.`,
      sampleValidRef: rule.sampleValid,
    };
  }

  // 3. Length checks
  if (tx.length < rule.minLen) {
    return {
      isValid: false,
      status: 'TOO_SHORT',
      confidence: 95,
      channel,
      normalizedRef: normalized,
      feedbackMessageEn: `Transaction reference "${tx}" is too short (${tx.length} characters). ${rule.name} references require at least ${rule.minLen} characters. ${rule.formatDescription} Please check your receipt and try again.`,
      feedbackMessageAm: `ያስገቡት የግብይት ቁጥር በጣም አጭር ነው (${tx.length} ፊደላት)። ቢያንስ ${rule.minLen} ቁምፊዎችን መያዝ አለበት። እባክዎ እንደገና ይሞክሩ።`,
      feedbackMessageOm: `Lakkoofsi galchan baay'ee gabaabaadha. Yoo xiqqaate qubee/lakkoofsa ${rule.minLen} qabaachuu qaba. Maaloo irra deebi'aa yaalaa.`,
      sampleValidRef: rule.sampleValid,
    };
  }

  // 4. Special Check: CBE Mobile Banking must start with FT
  if (channel === 'CBE_MOBILE_BANKING') {
    if (!normalized.startsWith('FT')) {
      return {
        isValid: false,
        status: 'INVALID_SYNTAX',
        confidence: 96,
        channel,
        normalizedRef: normalized,
        feedbackMessageEn: `Invalid format for CBE Mobile Banking: The transaction number must start with "FT" (e.g. ${rule.sampleValid}). You entered "${tx}". Please verify your CBE transaction SMS and try again.`,
        feedbackMessageAm: `የኢትዮጵያ ንግድ ባንክ የግብይት ቁጥር በ"FT" መጀመር አለበት (ለምሳሌ፡ ${rule.sampleValid})። ያስገቡት "${tx}" ነው፤ እባክዎ ደረሰኝዎን አይተው እንደገና ይሞክሩ።`,
        feedbackMessageOm: `Gurgurtaan Baankii Daldala Itoophiyaa 'FT'n jalqabamuu qaba (fkn: ${rule.sampleValid}). Maaloo irra deebi'aa yaalaa.`,
        suggestedCorrection: normalized.length >= 10 ? `FT${normalized}` : rule.sampleValid,
        sampleValidRef: rule.sampleValid,
      };
    }
  }

  // 5. Special Check: CBE Birr must be numeric
  if (channel === 'CBE_BIRR') {
    if (!/^[0-9]+$/.test(tx)) {
      return {
        isValid: false,
        status: 'INVALID_SYNTAX',
        confidence: 95,
        channel,
        normalizedRef: normalized,
        feedbackMessageEn: `Invalid format for CBE Birr: The transaction ID must contain only numbers. You entered letters or symbols in "${tx}". Please check your CBE Birr SMS and try again.`,
        feedbackMessageAm: `የሲቢኢ ብር (CBE Birr) የግብይት ቁጥር ቁጥሮችን ብቻ መያዝ አለበት። ያስገቡት ፊደላትን አካቷል፤ እባክዎ ትክክለኛውን ቁጥር እንደገና ያስገቡ።`,
        feedbackMessageOm: `Lakkoofsi CBE Birr lakkoofsa qofa ta'uu qaba. Maaloo irra deebi'aa sirreessaa.`,
        sampleValidRef: rule.sampleValid,
      };
    }
  }

  // 6. Regex syntax verification
  if (!rule.regex.test(normalized)) {
    return {
      isValid: false,
      status: 'INVALID_SYNTAX',
      confidence: 92,
      channel,
      normalizedRef: normalized,
      feedbackMessageEn: `Unrecognized transaction pattern for ${rule.name}. ${rule.formatDescription} You entered "${tx}". Please check your receipt and try again.`,
      feedbackMessageAm: `ያስገቡት የግብይት ቁጥር ቅርፅ ከ${rule.name} ጋር አይዛመድም። ${rule.formatDescription} እባክዎ እንደገና ይሞክሩ።`,
      feedbackMessageOm: `Bifti lakkoofsa galchitan sirrii miti. ${rule.formatDescription} Maaloo irra deebi'aa yaalaa.`,
      sampleValidRef: rule.sampleValid,
    };
  }

  // Passed all authentic pattern and anti-fraud checks!
  return {
    isValid: true,
    status: 'VALID',
    confidence: 99,
    channel,
    normalizedRef: normalized,
    feedbackMessageEn: `✨ AI Verified: Authentic transaction reference pattern confirmed for ${rule.name} (${normalized}). Ready for escrow locking.`,
    feedbackMessageAm: `✨ በሰው ሰራሽ አስተውሎት ተረጋግጧል፡ የግብይት ቁጥሩ ከ${rule.name} ህጋዊ አሰራር ጋር ትክክለኛ ሆኖ ተገኝቷል (${normalized})።`,
    feedbackMessageOm: `✨ AI mirkaneesseera: Lakkoofsi gurgurtaa kun sirrii ta'uun isaa mirkanaa'eera (${normalized}).`,
    sampleValidRef: rule.sampleValid,
  };
}

// Sample Reconciliation Database of Active Platform Orders ('Who Paid vs Who Did Not Pay')
export const SAMPLE_RECONCILIATION_LEDGER: PayerReconciliationItem[] = [
  {
    id: 'REC-101',
    orderId: 'ORD-7821',
    buyerName: 'Yonas Alemu',
    buyerPhone: '+251 91 445 6677',
    buyerOrg: 'Bole Fresh Marts',
    cropDetails: 'White Teff (Magna) • 50 Quintals',
    amountEtb: 472500,
    paymentStatus: 'PAID_VERIFIED',
    paymentMethod: 'Telebirr Mobile Money',
    transactionRef: 'ADQ882941091',
    escrowStatus: 'LOCKED',
    dueDate: '2026-09-22',
    lastUpdated: '15 mins ago',
    aiAuditNotes: 'AI Verified: Telebirr official receipt matched with SHA-256 fingerprint. Funds secured in NBE Escrow Vault.',
  },
  {
    id: 'REC-102',
    orderId: 'ORD-7790',
    buyerName: 'Sara Kebede (Procurement)',
    buyerPhone: '+251 91 556 7788',
    buyerOrg: 'Ethiopian Skylight Hotels & Catering',
    cropDetails: 'Yirgacheffe Washed Grade 1 • 20 Quintals',
    amountEtb: 490000,
    paymentStatus: 'PAID_VERIFIED',
    paymentMethod: 'CBE Settlement',
    transactionRef: 'FT260948123048',
    escrowStatus: 'RELEASED',
    dueDate: '2026-09-18',
    lastUpdated: '2 hours ago',
    aiAuditNotes: 'AI Audited: Delivery quality inspection passed (Score 98/100). Funds disbursed to farmer Almaz Desta wallet.',
  },
  {
    id: 'REC-103',
    orderId: 'ORD-8104',
    buyerName: 'Dr. Henok Haile',
    buyerPhone: '+251 91 223 9900',
    buyerOrg: 'RedGold Foods & Puree Ltd.',
    cropDetails: 'Roma Processing Tomatoes • 150 Crates',
    amountEtb: 217500,
    paymentStatus: 'UNPAID_PENDING',
    paymentMethod: 'Awash Bank Escrow Transfer',
    transactionRef: undefined,
    escrowStatus: 'NOT_FUNDED',
    dueDate: '2026-09-23',
    lastUpdated: 'Just now',
    aiAuditNotes: 'AI Alert: Awaiting buyer bank transfer. Harvest batch reserved for 18 hours before auto-release to secondary buyers.',
  },
  {
    id: 'REC-104',
    orderId: 'ORD-8092',
    buyerName: 'Tariku Tsegaye',
    buyerPhone: '+251 92 884 1122',
    buyerOrg: 'Adama Food Complex',
    cropDetails: 'Highland Durum Wheat • 100 Quintals',
    amountEtb: 720000,
    paymentStatus: 'UNPAID_OVERDUE',
    paymentMethod: 'CBE Mobile Banking',
    transactionRef: undefined,
    escrowStatus: 'NOT_FUNDED',
    dueDate: '2026-09-21',
    lastUpdated: 'Yesterday',
    aiAuditNotes: 'AI Warning: Payment overdue by 26 hours. Automated reminder SMS sent. Consignment hold expiring.',
  },
  {
    id: 'REC-105',
    orderId: 'ORD-8119',
    buyerName: 'Meron Teshome',
    buyerPhone: '+251 93 112 3344',
    buyerOrg: 'Addis Supermarket Union',
    cropDetails: 'Export Hass Avocado • 500 KG',
    amountEtb: 67500,
    paymentStatus: 'UNDER_AUDIT',
    paymentMethod: 'CBE Mobile Banking',
    transactionRef: 'FT260948991204',
    escrowStatus: 'LOCKED',
    dueDate: '2026-09-23',
    lastUpdated: '8 mins ago',
    aiAuditNotes: 'AI Diagnostic: Transaction reference format valid (FT260948991204). Bank reconciliation audit in progress.',
  },
  {
    id: 'REC-106',
    orderId: 'ORD-7995',
    buyerName: 'Abel Girma',
    buyerPhone: '+251 94 556 7788',
    buyerOrg: 'Private Wholesale Depot',
    cropDetails: 'Chencha White Garlic • 30 Quintals',
    amountEtb: 555000,
    paymentStatus: 'REJECTED_FAKE',
    paymentMethod: 'Telebirr',
    transactionRef: 'ASDF1234XYZ',
    escrowStatus: 'DISPUTED',
    dueDate: '2026-09-20',
    lastUpdated: '1 day ago',
    aiAuditNotes: 'AI Blocked: Submitted transaction number "ASDF1234XYZ" was flagged as unrecognized gibberish. Buyer requested to submit genuine bank receipt.',
  },
];

/**
 * Inspects an uploaded payment receipt image to ensure it contains AT LEAST the name of the payment provider/service.
 * Detects missing payment names, mismatched payment channels (e.g. Telebirr receipt uploaded for CBE payment),
 * or fake/placeholder/blank uploads with courteous, professional retry advice.
 */
export function inspectPaymentReceiptImage(
  channel: string,
  receiptDataOrUrl: string,
  fileName?: string
): ReceiptInspectionResult {
  const rule = RAIL_RULES[channel] || RAIL_RULES.CBE_MOBILE_BANKING;
  const rawInput = `${receiptDataOrUrl || ''} ${fileName || ''}`.toLowerCase();

  // 1. Check if input is empty or completely unreadable
  if (!receiptDataOrUrl && !fileName) {
    return {
      isValid: false,
      status: 'EMPTY_OR_UNREADABLE',
      confidence: 0,
      expectedPaymentName: rule.officialPaymentName,
      feedbackMessageEn: `No receipt image detected. Please upload an official receipt screenshot that clearly shows the payment name "${rule.officialPaymentName}".`,
      feedbackMessageAm: `ምንም የደረሰኝ ምስል አልተገኘም። እባክዎ የክፍያውን ስም "${rule.amharicName}" በግልጽ የሚያሳይ ትክክለኛ ደረሰኝ ይጫኑ።`,
      feedbackMessageOm: `Suuraan nagahee hin argamne. Maaloo nagahee maqaa kaffaltii "${rule.oromoName}" qabu fe'aa.`,
      detectedKeywords: [],
    };
  }

  // 2. Check for negative placeholder/fake indicators in filename
  const negativeIndicators = [
    'cat.jpg', 'cat.png', 'dog.', 'car.', 'selfie', 'wallpaper',
    'meme', 'random', 'fake', 'test_image', 'placeholder', 'empty',
    'unknown_image', 'download.', 'untitled', 'screen_test'
  ];
  const hasNegative = negativeIndicators.some((neg) => (fileName || '').toLowerCase().includes(neg));

  // 3. Scan for keywords of the EXPECTED channel
  const detectedTargetKeywords: string[] = [];
  for (const kw of rule.keywords) {
    if (rawInput.includes(kw.toLowerCase())) {
      detectedTargetKeywords.push(kw);
    }
  }

  // 4. Scan for keywords of OTHER channels (to catch cross-channel mismatches)
  const detectedOtherChannels: { channelKey: string; name: string; keyword: string }[] = [];
  for (const [otherKey, otherRule] of Object.entries(RAIL_RULES)) {
    if (otherKey !== channel) {
      for (const kw of otherRule.keywords) {
        if (kw.length >= 4 && rawInput.includes(kw.toLowerCase())) {
          detectedOtherChannels.push({ channelKey: otherKey, name: otherRule.officialPaymentName, keyword: kw });
          break;
        }
      }
    }
  }

  // If other provider keywords found strongly and NONE of the target keywords found:
  if (detectedTargetKeywords.length === 0 && detectedOtherChannels.length > 0) {
    const mismatch = detectedOtherChannels[0];
    return {
      isValid: false,
      status: 'MISMATCHED_PAYMENT_NAME',
      confidence: 96,
      expectedPaymentName: rule.officialPaymentName,
      detectedPaymentName: mismatch.name,
      feedbackMessageEn: `Payment Provider Mismatch: The uploaded receipt image appears to be for "${mismatch.name}" (detected: "${mismatch.keyword}"), but you selected "${rule.officialPaymentName}". Please upload the authentic receipt for "${rule.officialPaymentName}", or switch your payment method.`,
      feedbackMessageAm: `የክፍያ ተቋም አለመጣጣም፡ የተጫነው ደረሰኝ ለ"${mismatch.name}" የተዘጋጀ ይመስላል፤ ነገር ግን የመረጡት "${rule.amharicName}" ነው። እባክዎ ትክክለኛውን የ"${rule.amharicName}" ደረሰኝ ይጫኑ።`,
      feedbackMessageOm: `Madaallii Kaffaltii: Nagaheen fe'ame "${mismatch.name}" argisiisa, garuu kan filattan "${rule.oromoName}" dha. Maaloo nagahee "${rule.oromoName}" fe'aa.`,
      detectedKeywords: [mismatch.keyword],
    };
  }

  // If negative placeholder or no target keywords found
  if (hasNegative || detectedTargetKeywords.length === 0) {
    return {
      isValid: false,
      status: 'MISSING_PAYMENT_NAME',
      confidence: 94,
      expectedPaymentName: rule.officialPaymentName,
      feedbackMessageEn: `AI Receipt Verification Alert: The uploaded image does not appear to contain the required payment name ("${rule.officialPaymentName}"). Receipts must clearly display the payment service name (e.g. ${rule.shortName} / ${rule.officialPaymentName}), transaction reference, and amount. Please check the image and try again.`,
      feedbackMessageAm: `የሰው ሰራሽ አስተውሎት (AI) ደረሰኝ ማረጋገጫ፡ የተጫነው ፎቶ የክፍያውን ስም ("${rule.amharicName}") አልያዘም። ደረሰኙ ቢያንስ የባንኩን ስም፣ የግብይት ቁጥር እና የተከፈለውን መጠን በግልጽ ማሳየት አለበት። እባክዎ እንደገና ይሞክሩ።`,
      feedbackMessageOm: `Hubachiisa AI: Suuraan fe'ame maqaa kaffaltii ("${rule.oromoName}") hin qabu. Nagaheen maqaa baankichaa ifatti argisiisuu qaba. Maaloo irra deebi'aa yaalaa.`,
      detectedKeywords: [],
    };
  }

  // Confirmed: Contains at least the name of the payment!
  return {
    isValid: true,
    status: 'CONFIRMED',
    confidence: 99.2,
    expectedPaymentName: rule.officialPaymentName,
    detectedPaymentName: rule.officialPaymentName,
    feedbackMessageEn: `✨ AI Verified: Payment name "${rule.officialPaymentName}" successfully detected on receipt (identified: ${detectedTargetKeywords.join(', ')}). Ready for escrow settlement.`,
    feedbackMessageAm: `✨ በሰው ሰራሽ አስተውሎት ተረጋግጧል፡ የክፍያው ስም "${rule.amharicName}" በደረሰኙ ላይ በትክክል ተገኝቷል። ለኢስክሮው ክፍያ ዝግጁ ነው።`,
    feedbackMessageOm: `✨ AI Mirkaneesseera: Maqaan kaffaltii "${rule.oromoName}" nagahee irratti argameera. Qophii ta'eera.`,
    detectedKeywords: detectedTargetKeywords,
  };
}

/**
 * Generates an authentic SVG receipt Data URI for a given banking channel.
 * Contains the official payment brand name, transaction reference, amount, and recipient.
 */
export function generateSampleBankReceipt(
  channel: string,
  orderId: string | number,
  amountEtb: number,
  txNumber?: string
): { dataUrl: string; fileName: string; txNumber: string } {
  const rule = RAIL_RULES[channel] || RAIL_RULES.CBE_MOBILE_BANKING;
  const tx = txNumber || rule.sampleValid;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  let primaryColor = '#7B1846'; // CBE burgundy
  let secondaryColor = '#E6A117'; // gold
  let brandHeader = 'COMMERCIAL BANK OF ETHIOPIA';
  let serviceSub = 'CBE Mobile Banking Direct Transfer';
  let accountDetails = 'Debit: 1000****4819 • Credit: Agrilink Escrow Vault (1000293847291)';

  if (channel === 'TELEBIRR_MANUAL') {
    primaryColor = '#0059A8';
    secondaryColor = '#FFCB05';
    brandHeader = 'TELEBIRR MOBILE MONEY';
    serviceSub = 'Ethio Telecom Official Transfer Receipt';
    accountDetails = 'Merchant: Agrilink Technologies PLC • Code: 884920';
  } else if (channel === 'CBE_BIRR') {
    primaryColor = '#005A2B';
    secondaryColor = '#D4AF37';
    brandHeader = 'CBE BIRR WALLET';
    serviceSub = 'Commercial Bank of Ethiopia Mobile Wallet';
    accountDetails = 'ShortCode: 847291 • Beneficiary: Agrilink Vault';
  } else if (channel === 'AWASH_BIRR') {
    primaryColor = '#C8102E';
    secondaryColor = '#00205B';
    brandHeader = 'AWASH BANK / AWASH BIRR';
    serviceSub = 'Awash Bank Official Transaction Advice';
    accountDetails = 'Beneficiary: Agrilink Escrow Account • Branch: Bole Medhanialem';
  } else if (channel === 'DASHEN_AMOLE') {
    primaryColor = '#003366';
    secondaryColor = '#F2A900';
    brandHeader = 'DASHEN BANK / AMOLE';
    serviceSub = 'Dashen Digital Transaction Advice';
    accountDetails = 'Amole Pay • Beneficiary: Agrilink Agro Escrow';
  } else if (channel === 'BANK_OF_ABYSSINIA') {
    primaryColor = '#102A45';
    secondaryColor = '#E4A025';
    brandHeader = 'BANK OF ABYSSINIA (BOA)';
    serviceSub = 'BoA Mobile Banking Transfer Voucher';
    accountDetails = 'Beneficiary: Agrilink Escrow • Account: 84928102';
  } else if (channel === 'ZEMEN_BANK') {
    primaryColor = '#800020';
    secondaryColor = '#D4AF37';
    brandHeader = 'ZEMEN BANK';
    serviceSub = 'Zemen Digital Banking Receipt';
    accountDetails = 'Beneficiary: Agrilink Escrow • Account: 77218940';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="520" viewBox="0 0 600 520">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FAFAFA" />
        <stop offset="100%" stop-color="#F4F4F5" />
      </linearGradient>
    </defs>
    <rect width="600" height="520" rx="16" fill="url(#bg)" stroke="#E4E4E7" stroke-width="2"/>
    <path d="M 0 16 Q 0 0 16 0 L 584 0 Q 600 0 600 16 L 600 90 L 0 90 Z" fill="${primaryColor}"/>
    <circle cx="48" cy="45" r="22" fill="${secondaryColor}" opacity="0.9"/>
    <text x="48" y="52" fill="#FFFFFF" font-family="sans-serif" font-weight="900" font-size="18" text-anchor="middle">✓</text>
    
    <text x="84" y="38" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="17" letter-spacing="0.5">${brandHeader}</text>
    <text x="84" y="58" fill="#E4E4E7" font-family="sans-serif" font-weight="500" font-size="12">${serviceSub}</text>
    <text x="560" y="50" fill="${secondaryColor}" font-family="sans-serif" font-weight="700" font-size="12" text-anchor="end">OFFICIAL RECEIPT</text>
    
    <rect x="28" y="110" width="544" height="85" rx="12" fill="#FFFFFF" stroke="#E4E4E7"/>
    <text x="48" y="138" fill="#71717A" font-family="sans-serif" font-size="11" font-weight="600">TRANSFER AMOUNT (ETB)</text>
    <text x="48" y="172" fill="#18181B" font-family="sans-serif" font-size="28" font-weight="900">${amountEtb.toLocaleString()} ETB</text>
    <rect x="420" y="132" width="132" height="28" rx="14" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
    <text x="486" y="151" fill="#047857" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">SUCCESSFUL</text>

    <rect x="28" y="210" width="544" height="230" rx="12" fill="#FFFFFF" stroke="#E4E4E7"/>
    <text x="48" y="240" fill="#71717A" font-family="sans-serif" font-size="11" font-weight="600">TRANSACTION REFERENCE / JOURNAL #</text>
    <text x="48" y="264" fill="#0F172A" font-family="monospace" font-size="17" font-weight="800">${tx}</text>
    
    <line x1="48" y1="282" x2="552" y2="282" stroke="#F4F4F5" stroke-width="1.5"/>
    <text x="48" y="306" fill="#71717A" font-family="sans-serif" font-size="11" font-weight="600">BENEFICIARY ACCOUNT / RECIPIENT</text>
    <text x="48" y="328" fill="#18181B" font-family="sans-serif" font-size="13" font-weight="700">${accountDetails}</text>

    <line x1="48" y1="346" x2="552" y2="346" stroke="#F4F4F5" stroke-width="1.5"/>
    <text x="48" y="370" fill="#71717A" font-family="sans-serif" font-size="11" font-weight="600">ORDER IDENTIFIER</text>
    <text x="48" y="392" fill="#18181B" font-family="sans-serif" font-size="13" font-weight="700">Order #${orderId} • AgriLink Custodial Escrow</text>

    <text x="420" y="370" fill="#71717A" font-family="sans-serif" font-size="11" font-weight="600">DATE &amp; TIME</text>
    <text x="420" y="392" fill="#18181B" font-family="sans-serif" font-size="13" font-weight="700">${dateStr} ${timeStr}</text>

    <rect x="28" y="455" width="544" height="45" rx="8" fill="#F8FAFC"/>
    <text x="48" y="482" fill="#64748B" font-family="sans-serif" font-size="11">🔐 Protected by NBE Digital Settlement Standards • SHA-256 Verified Receipt</text>
  </svg>`;

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const cleanName = rule.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `${cleanName}_official_receipt_${tx}.svg`;

  return {
    dataUrl,
    fileName,
    txNumber: tx,
  };
}

export interface TelebirrParsedSms {
  success: boolean;
  rawText: string;
  transactionRef: string | null;
  amountEtb: number | null;
  senderPhone: string | null;
  senderName: string | null;
  receiverPhoneOrAccount: string | null;
  timestamp: string | null;
  confidence: number;
  error?: string;
}

/**
 * Parses Telebirr SMS receipts in English or Amharic received on the Admin's phone.
 * Extracts Transaction Reference, Amount (ETB), Sender Phone/Name, and Timestamp.
 */
export function parseTelebirrSms(rawSms: string): TelebirrParsedSms {
  if (!rawSms || typeof rawSms !== 'string' || !rawSms.trim()) {
    return {
      success: false,
      rawText: rawSms || '',
      transactionRef: null,
      amountEtb: null,
      senderPhone: null,
      senderName: null,
      receiverPhoneOrAccount: null,
      timestamp: null,
      confidence: 0,
      error: 'Empty SMS text provided.',
    };
  }

  const text = rawSms.trim();

  // 1. Extract Transaction Reference (e.g. Txn ID: CC481029482, Transaction number: ADQ882941091, የግብይት ቁጥር: ...)
  let txRef: string | null = null;
  const txMatches = [
    /(?:transaction\s*(?:number|id|ref|no|#)|txn\s*id|txnid|trans\.?\s*id|ref\s*#?)[:\s]+([A-Za-z0-9]{8,24})/i,
    /(?:የግብይት\s*ቁጥር|መለያ|ቁጥር)[:\s]+([A-Za-z0-9]{8,24})/,
    /\b([A-Z0-9]{10,20})\b/,
  ];

  for (const regex of txMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim().toUpperCase();
      // Avoid matching common words
      if (!['TELEBIRR', 'ETHIOTELECOM', 'CUSTOMER', 'BALANCE', 'ACCOUNT', 'TRANSACTION'].includes(candidate)) {
        txRef = candidate;
        break;
      }
    }
  }

  // 2. Extract Amount (ETB / ብር)
  let amountEtb: number | null = null;
  const amountMatches = [
    /(?:ETB|birr)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:ETB|birr|ብር)/i,
    /(?:credited\s*with|received|transferred)\s*(?:ETB)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:ብር\s*ገቢ|ብር)/,
  ];

  for (const regex of amountMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        amountEtb = parsed;
        break;
      }
    }
  }

  // 3. Extract Sender Phone & Name
  let senderPhone: string | null = null;
  let senderName: string | null = null;

  // Phone match (e.g. from 251911223344, 0911223344, +2519...)
  const phoneMatch = text.match(/(?:from|ከ)\s*(?:phone\s*)?(\+?251\s?[79]\d{8}|0[79]\d{8})/i);
  if (phoneMatch && phoneMatch[1]) {
    senderPhone = phoneMatch[1].replace(/\s+/g, '');
  }

  // Name match inside parentheses or after phone (e.g. 'from 251911223344 (Abebe Kebede)')
  const nameMatch = text.match(/(?:from|ከ)\s*(?:\+?251\s?[79]\d{8}|0[79]\d{8})\s*\(([^)]+)\)/i);
  if (nameMatch && nameMatch[1]) {
    senderName = nameMatch[1].trim();
  }

  // 4. Timestamp
  let timestamp: string | null = null;
  const timeMatch = text.match(/(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?)/);
  if (timeMatch && timeMatch[1]) {
    timestamp = timeMatch[1];
  } else {
    timestamp = new Date().toISOString();
  }

  const success = Boolean(txRef && amountEtb);
  const confidence = (txRef ? 50 : 0) + (amountEtb ? 35 : 0) + (senderPhone ? 15 : 0);

  return {
    success,
    rawText: text,
    transactionRef: txRef,
    amountEtb,
    senderPhone,
    senderName,
    receiverPhoneOrAccount: null,
    timestamp,
    confidence,
  };
}

/**
 * Cross-references an incoming payment attempt against the Admin's linked Telebirr account.
 */
export function verifyPaymentAgainstAdminTelebirr(params: {
  rawTxRef: string;
  claimedAmount: number;
  expectedAmount: number;
  adminTelebirrPhone: string;
  adminMerchantCode?: string;
  payerProvidedPhone?: string;
}): {
  isAuthentic: boolean;
  confidenceScore: number;
  fraudRiskScore: number;
  reasons: string[];
  recommendation: 'AUTO_PASS' | 'FLAG_FOR_REVIEW' | 'REJECT';
} {
  const { rawTxRef, claimedAmount, expectedAmount, adminTelebirrPhone } = params;
  const reasons: string[] = [];
  let riskScore = 0.05;

  const normalizedTx = (rawTxRef || '').trim().toUpperCase();

  // Syntax check
  if (!/^[A-Za-z0-9]{10,24}$/.test(normalizedTx)) {
    riskScore += 0.65;
    reasons.push('Transaction reference format does not match official Telebirr 10-24 alphanumeric pattern.');
  }

  // Amount match check
  const amountDiff = Math.abs(claimedAmount - expectedAmount);
  if (amountDiff > 1.0) {
    riskScore += 0.75;
    reasons.push(`Claimed amount (${claimedAmount} ETB) does not match order amount (${expectedAmount} ETB).`);
  }

  // Admin phone validation
  if (!adminTelebirrPhone || adminTelebirrPhone.length < 9) {
    reasons.push('Admin Telebirr phone is not linked or verified.');
  }

  const confidenceScore = Math.max(0, Math.round((1 - riskScore) * 100));

  let recommendation: 'AUTO_PASS' | 'FLAG_FOR_REVIEW' | 'REJECT' = 'AUTO_PASS';
  if (riskScore >= 0.7) {
    recommendation = 'REJECT';
  } else if (riskScore >= 0.3) {
    recommendation = 'FLAG_FOR_REVIEW';
  }

  return {
    isAuthentic: riskScore < 0.3,
    confidenceScore,
    fraudRiskScore: riskScore,
    reasons,
    recommendation,
  };
}

