/* ==========================================================================
   MEDIKART 14.0 - HIGH PERFORMANCE IN-MEMORY CACHED DATA STORE
   60+ Medicines per Demo Dealer, 250+ Orders per Demo Dealer, Restock Logs,
   Dealer Notifications, Multi-Entity Search Data Engine v14
   ========================================================================== */

/* Bump DATA_SCHEMA_VERSION whenever the seeded record shape changes, so stale
   incompatible data in a returning visitor's browser is discarded rather than
   half-read. */
const DATA_SCHEMA_VERSION = 'v40';

const STORAGE_KEYS = {
  MEDICINES: `medikart_medicines_${DATA_SCHEMA_VERSION}`,
  DEALERS: `medikart_dealers_${DATA_SCHEMA_VERSION}`,
  BUYERS: `medikart_buyers_${DATA_SCHEMA_VERSION}`,
  ORDERS: `medikart_orders_${DATA_SCHEMA_VERSION}`,
  CART: `medikart_cart_${DATA_SCHEMA_VERSION}`,
  WISHLIST: `medikart_wishlist_${DATA_SCHEMA_VERSION}`,
  SETTINGS: `medikart_settings_${DATA_SCHEMA_VERSION}`,
  NOTIFICATIONS: `medikart_notifications_${DATA_SCHEMA_VERSION}`,
  COUPONS: `medikart_coupons_${DATA_SCHEMA_VERSION}`,
  REVIEWS: `medikart_reviews_${DATA_SCHEMA_VERSION}`,
  CURRENT_USER: `medikart_user_${DATA_SCHEMA_VERSION}`,
  SESSION: `medikart_session_${DATA_SCHEMA_VERSION}`,
  REFUNDS: `medikart_refunds_${DATA_SCHEMA_VERSION}`,
  TICKETS: `medikart_tickets_${DATA_SCHEMA_VERSION}`,
  AUDIT_LOGS: `medikart_audit_logs_${DATA_SCHEMA_VERSION}`,
  PAYOUTS: `medikart_payouts_${DATA_SCHEMA_VERSION}`
};

/* --------------------------------------------------------------------------
   1. PARAMETER CATEGORIES & DOSAGE PACKAGING FORMS
   -------------------------------------------------------------------------- */
const MEDICINE_TYPES = [
  { id: 'mt-1', name: 'Tablet', icon: 'fa-tablets', desc: 'Oral solid strip packaging' },
  { id: 'mt-2', name: 'Capsule', icon: 'fa-capsules', desc: 'Gelatin shell capsules' },
  { id: 'mt-3', name: 'Syrup', icon: 'fa-prescription-bottle', desc: 'Liquid oral suspension bottles' },
  { id: 'mt-4', name: 'Cream', icon: 'fa-pump-medical', desc: 'Topical skin application tubes' },
  { id: 'mt-5', name: 'Ointment', icon: 'fa-mortar-pestle', desc: 'Medicated protective topical paste' },
  { id: 'mt-6', name: 'Drops', icon: 'fa-eye-dropper', desc: 'Ophthalmic & pediatric dropper bottles' },
  { id: 'mt-7', name: 'Injection', icon: 'fa-syringe', desc: 'Sterile solution vials & ampoules' },
  { id: 'mt-8', name: 'Inhaler', icon: 'fa-lungs', desc: 'Pressurized respiratory inhalers' },
  { id: 'mt-9', name: 'Powder', icon: 'fa-flask', desc: 'Oral rehydration & protein jars' },
  { id: 'mt-10', name: 'Sachet', icon: 'fa-box-tissue', desc: 'Single-use powder packets' },
  { id: 'mt-11', name: 'Medical Device', icon: 'fa-heart-pulse', desc: 'Diagnostic & monitoring equipment' }
];

const THERAPEUTIC_CATEGORIES = [
  { id: 'tc-1', name: 'Fever', icon: 'fa-thermometer-half', desc: 'Antipyretics & cold care' },
  { id: 'tc-2', name: 'Pain Relief', icon: 'fa-hand-holding-medical', desc: 'Analgesics & anti-inflammatory' },
  { id: 'tc-3', name: 'Antibiotics', icon: 'fa-virus-slash', desc: 'Bacterial infection treatments' },
  { id: 'tc-4', name: 'Diabetes', icon: 'fa-vial', desc: 'Glycemic control & insulin support' },
  { id: 'tc-5', name: 'Cardiology', icon: 'fa-heartbeat', desc: 'Hypertension & cardiac care' },
  { id: 'tc-6', name: 'Respiratory', icon: 'fa-lungs', desc: 'Asthma, cough & lung care' },
  { id: 'tc-7', name: 'Digestive Care', icon: 'fa-stethoscope', desc: 'Acidity, digestion & gut health' },
  { id: 'tc-8', name: 'Skin Care', icon: 'fa-allergies', desc: 'Dermatology & topical relief' },
  { id: 'tc-9', name: 'Eye Care', icon: 'fa-eye', desc: 'Ophthalmology & ear drops' },
  { id: 'tc-10', name: 'Women\'s Health', icon: 'fa-female', desc: 'Hormonal, prenatal & wellness' },
  { id: 'tc-11', name: 'Vitamins & Supplements', icon: 'fa-pills', desc: 'Immunity, calcium & multivitamins' }
];

/* --------------------------------------------------------------------------
   2. VERIFIED DEALERS DATASET (10 Realistic Statutory Verification Test Cases)
   -------------------------------------------------------------------------- */
const DEALER_NAME_PARTS = [
  'Apollo MedShop', 'MedPlus Pharma Express', 'Wellness Forever Store', 'Frank Ross Healthcare',
  'Max Care Pharmacy', 'Guardian Lifesciences', 'Netmeds Partner Store', 'Sanjivani Chemist',
  '1mg Direct Chemist', 'Care & Cure Chemist', 'Metro Health Pharmacy', 'Apex Drug Store',
  'Royal Pharma Outlet', 'Green Cross Chemist', 'HealthFirst Pharmacy', 'Universal Chemist'
];

const LOCATIONS = [
  'Connaught Place, New Delhi', 'Andheri West, Mumbai', 'Indiranagar, Bengaluru',
  'Park Street, Kolkata', 'Banjara Hills, Hyderabad', 'T. Nagar, Chennai',
  'Sector 17, Chandigarh', 'Viman Nagar, Pune', 'C-Scheme, Jaipur', 'Koremangala, Bengaluru'
];

const INITIAL_DEALERS = [
  // CASE 1 — FULLY VERIFIED & LIVE SHOWCASE PHARMACY (Apollo MedShop)
  // This is the live seller the demo dashboards are built around: it holds the
  // full catalog, order history and settled payouts. The pending / expired /
  // incomplete verification scenarios are CASES 2-9 below.
  {
    id: 'dlr-101',
    name: 'Rajesh Sharma',
    ownerName: 'Rajesh Sharma (B.Pharm, Delhi Council)',
    businessName: 'Apollo MedShop Pvt Ltd',
    drugLicense: '20B/DL-88741/2024',
    licenseType: 'Form 20B & Form 21B Retail/Wholesale',
    issuingAuthority: 'State Drug Control Department, Delhi NCR',
    issueDate: '2024-01-10',
    expiryDate: '2028-12-31',
    licenseStatus: 'Verified',
    pharmacistName: 'Dr. Rajesh Sharma',
    pharmacistRegNo: 'REG-78420-DL',
    regAuthority: 'Delhi Pharmacy Council',
    qualification: 'B.Pharm, M.Pharm (Clinical Pharmacy)',
    pharmacistValidity: '2029-05-20',
    gstNumber: '07AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    email: 'apollo@medikart.com',
    phone: '+91 98765 43210',
    status: 'approved',
    approvedDate: '2024-01-18',
    registrationDate: '2024-01-10',
    // totalSales / totalMedicines / grossRevenue are derived from real data
    // after the generators run — see deriveDealerMetrics().
    rating: 4.9, reviewCount: 142, deliveryTime: 'Same Day Delivery', yearsOnMediKart: 4,
    address: 'Connaught Place, New Delhi', city: 'New Delhi', state: 'Delhi', pincode: '110001',
    bankAccount: 'HDFC Bank • A/C 98765432109', ifscCode: 'HDFC0000123', payoutStatus: 'Settled', transactionRef: 'TXN984210', payoutUpdatedDate: '2026-07-28',
    docDrugLicense: 'Form_20B_21B_ApolloMedShop.pdf',
    docPharmacistCert: 'Pharmacist_Registration_RajeshSharma.pdf',
    docGst: 'GSTIN_Certificate_07AAAAA0000A1Z5.pdf',
    docPan: 'PAN_Card_Company_ABCDE1234F.pdf',
    docAddressProof: 'Commercial_Establishment_RentAgreement.pdf',
    marketplaceRulesAccepted: true,
    acceptedDate: '2026-07-20',
    complianceHistory: [
      { date: '2024-01-10', issue: 'Initial Statutory Verification Application Submitted', severity: 'Info', action: 'Submitted', status: 'Resolved', notes: 'All statutory documents attached cleanly.' },
      { date: '2024-01-18', issue: 'Statutory Verification Approved', severity: 'Info', action: 'Approved', status: 'Resolved', notes: 'Drug License and Pharmacist credentials verified by Platform Admin.' }
    ]
  },

  // CASE 2 — EXPIRED DRUG LICENCE (Wellness Chemist)
  {
    id: 'dlr-102',
    name: 'Suresh Patel',
    ownerName: 'Suresh Patel',
    businessName: 'Wellness Chemist & Healthcare',
    drugLicense: '21B/DL-99412/2021',
    licenseType: 'Form 21B Retail Pharmacy',
    issuingAuthority: 'Food & Drug Administration, Maharashtra',
    issueDate: '2021-05-15',
    expiryDate: '2025-05-15', // EXPIRED!
    licenseStatus: 'Expired',
    pharmacistName: 'Suresh Patel',
    pharmacistRegNo: 'REG-99120-MH',
    regAuthority: 'Maharashtra State Pharmacy Council',
    qualification: 'D.Pharm',
    pharmacistValidity: '2027-11-30',
    gstNumber: '27BBBBB1111B2Z3',
    panNumber: 'BBBBB2222B',
    email: 'wellnesschemist@medikart.com',
    phone: '+91 98123 45678',
    status: 'pending',
    registrationDate: '2024-02-04', rating: 4.8, reviewCount: 98, totalSales: 980, totalMedicines: 60, deliveryTime: 'Express (12-24 hrs)', yearsOnMediKart: 3,
    address: 'Andheri West, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400053',
    bankAccount: 'ICICI Bank • A/C 44556677889', ifscCode: 'ICIC0000456', grossRevenue: 184500, payoutStatus: 'Pending Settlement',
    docDrugLicense: 'Expired_License_2025.pdf', docPharmacistCert: 'Pharmacist_Suresh_Patel.pdf', docGst: 'GST_27BBBBB.pdf', docPan: 'PAN_BBBBB.pdf', docAddressProof: 'Electricity_Bill_Store.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2026-06-10',
    complianceHistory: [
      { date: '2026-05-16', issue: 'Drug License Expired (Form 21B)', severity: 'High', action: 'Flagged', status: 'Blocking Issue', notes: 'Renewal certificate has not been provided.' }
    ]
  },

  // CASE 3 — MISSING DRUG LICENCE (Express Meds Direct)
  {
    id: 'dlr-105',
    name: 'Vikram Singh',
    ownerName: 'Vikram Singh',
    businessName: 'Express Meds Direct',
    drugLicense: '', // MISSING!
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'Karnataka State Drug Control',
    issueDate: '', expiryDate: '',
    licenseStatus: 'Missing',
    pharmacistName: 'Vikram Singh',
    pharmacistRegNo: 'REG-44102-KA',
    regAuthority: 'Karnataka Pharmacy Council',
    qualification: 'B.Pharm',
    pharmacistValidity: '2028-01-10',
    gstNumber: '29EEEEE5555E5Z5', panNumber: 'EEEEE5555E',
    email: 'expressmeds@medikart.com', phone: '+91 97777 88888',
    status: 'pending', registrationDate: '2026-06-01', rating: 4.2, reviewCount: 15, totalSales: 120, totalMedicines: 30, deliveryTime: 'Standard', yearsOnMediKart: 1,
    address: 'Koramangala 4th Block, Bengaluru', city: 'Bengaluru', state: 'Karnataka', pincode: '560034',
    docDrugLicense: null, docPharmacistCert: 'Pharmacist_Cert.pdf', docGst: 'GST_Doc.pdf', docPan: 'PAN_Card.pdf', docAddressProof: 'Lease_Agreement.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2026-06-01',
    complianceHistory: [
      { date: '2026-06-01', issue: 'Missing Drug License Submission', severity: 'High', action: 'Flagged', status: 'Blocking Issue', notes: 'License copy required before approval.' }
    ]
  },

  // CASE 4 — MISSING PHARMACIST INFORMATION (Quick Care Pharmacy)
  {
    id: 'dlr-106',
    name: 'Amit Agarwal',
    ownerName: 'Amit Agarwal',
    businessName: 'Quick Care Pharmacy',
    drugLicense: '20B/DL-66120/2025',
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'West Bengal Directorate of Drugs',
    issueDate: '2025-01-01', expiryDate: '2028-12-31',
    licenseStatus: 'Verified',
    pharmacistName: '', // MISSING!
    pharmacistRegNo: '', // MISSING!
    regAuthority: '', qualification: '', pharmacistValidity: '',
    gstNumber: '19FFFFF6666F6Z6', panNumber: 'FFFFF6666F',
    email: 'quickcare@medikart.com', phone: '+91 96666 55555',
    status: 'pending', registrationDate: '2026-06-15', rating: 4.3, reviewCount: 22, totalSales: 210, totalMedicines: 35, deliveryTime: 'Standard', yearsOnMediKart: 1,
    address: 'Salt Lake Sector 5, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '700091',
    docDrugLicense: 'DrugLicense_QuickCare.pdf', docPharmacistCert: null, docGst: 'GST_QuickCare.pdf', docPan: 'PAN_QuickCare.pdf', docAddressProof: 'Trade_License.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2026-06-15',
    complianceHistory: [
      { date: '2026-06-15', issue: 'Missing Pharmacist Registration Credentials', severity: 'High', action: 'Flagged', status: 'Blocking Issue', notes: 'Registered Pharmacist mandatory for Schedule H drugs.' }
    ]
  },

  // CASE 5 — MISSING DOCUMENTS (Metro Pharma Hub)
  {
    id: 'dlr-107',
    name: 'Rohan Mehta',
    ownerName: 'Rohan Mehta',
    businessName: 'Metro Pharma Hub',
    drugLicense: '20B/DL-55410/2025',
    licenseType: 'Form 20B & 21B Wholesale',
    issuingAuthority: 'Gujarat Food & Drugs Control Administration',
    issueDate: '2025-02-10', expiryDate: '2029-02-10',
    licenseStatus: 'Verified',
    pharmacistName: 'Rohan Mehta', pharmacistRegNo: 'REG-33210-GJ', regAuthority: 'Gujarat State Pharmacy Council', qualification: 'B.Pharm', pharmacistValidity: '2029-05-15',
    gstNumber: '24GGGGG7777G7Z7', panNumber: 'GGGGG7777G',
    email: 'metropharma@medikart.com', phone: '+91 95555 44444',
    status: 'pending', registrationDate: '2026-07-01', rating: 4.1, reviewCount: 18, totalSales: 150, totalMedicines: 40, deliveryTime: 'Standard', yearsOnMediKart: 1,
    address: 'CG Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009',
    docDrugLicense: 'License_Metro.pdf', docPharmacistCert: 'Pharmacist_Cert_Rohan.pdf', docGst: null, docPan: null, docAddressProof: null, // MISSING DOCS!
    marketplaceRulesAccepted: true, acceptedDate: '2026-07-01',
    complianceHistory: [
      { date: '2026-07-01', issue: 'Missing Statutory Documents (GST, PAN, Address Proof)', severity: 'High', action: 'Flagged', status: 'Blocking Issue', notes: 'Supporting tax and location documents pending upload.' }
    ]
  },

  // CASE 6 — INFORMATION MISMATCH (City Health Store)
  {
    id: 'dlr-108',
    name: 'Pooja Nair',
    ownerName: 'Pooja Nair',
    businessName: 'City Health Store',
    drugLicense: '20B/DL-33219/2025',
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'Kerala State Drugs Control',
    issueDate: '2025-04-01', expiryDate: '2029-04-01',
    licenseStatus: 'Mismatch',
    licenseNameOnDoc: 'City Medicals & Healthcare Pvt Ltd', // MISMATCH!
    pharmacistName: 'Pooja Nair', pharmacistRegNo: 'REG-11029-KL', regAuthority: 'Kerala State Pharmacy Council', qualification: 'M.Pharm', pharmacistValidity: '2028-10-10',
    gstNumber: '32HHHHH8888H8Z8', panNumber: 'HHHHH8888H',
    email: 'cityhealth@medikart.com', phone: '+91 94444 33333',
    status: 'pending', registrationDate: '2026-07-05', rating: 4.5, reviewCount: 30, totalSales: 290, totalMedicines: 45, deliveryTime: 'Standard', yearsOnMediKart: 1,
    address: 'MG Road, Kochi', city: 'Kochi', state: 'Kerala', pincode: '682016',
    docDrugLicense: 'License_CityMedicals.pdf', docPharmacistCert: 'Pharmacist_Pooja.pdf', docGst: 'GST_CityHealth.pdf', docPan: 'PAN_Pooja.pdf', docAddressProof: 'Rent_Deed.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2026-07-05',
    complianceHistory: [
      { date: '2026-07-05', issue: 'Business Name Mismatch with Drug License', severity: 'Medium', action: 'Flagged', status: 'Needs Review', notes: 'Application says "City Health Store", Licence document says "City Medicals & Healthcare Pvt Ltd".' }
    ]
  },

  // CASE 7 — MULTIPLE COMPLIANCE VIOLATIONS (Global Pharma Care)
  {
    id: 'dlr-109',
    name: 'Dinesh Kumar',
    ownerName: 'Dinesh Kumar',
    businessName: 'Global Pharma Care',
    drugLicense: '20B/DL-11980/2024',
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'Haryana Food & Drug Administration',
    issueDate: '2024-03-10', expiryDate: '2028-03-10',
    licenseStatus: 'Verified',
    pharmacistName: 'Dinesh Kumar', pharmacistRegNo: 'REG-77810-HR', regAuthority: 'Haryana Pharmacy Council', qualification: 'B.Pharm', pharmacistValidity: '2028-06-30',
    gstNumber: '06IIIII9999I9Z9', panNumber: 'IIIII9999I',
    email: 'globalpharma@medikart.com', phone: '+91 93333 22222',
    status: 'pending', registrationDate: '2025-08-10', rating: 3.4, reviewCount: 45, totalSales: 410, totalMedicines: 50, deliveryTime: 'Standard', yearsOnMediKart: 2,
    address: 'Cyber City Phase 2, Gurugram', city: 'Gurugram', state: 'Haryana', pincode: '122002',
    docDrugLicense: 'License_Global.pdf', docPharmacistCert: 'Pharmacist_Dinesh.pdf', docGst: 'GST_Global.pdf', docPan: 'PAN_Global.pdf', docAddressProof: 'Building_Permit.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2025-08-10',
    complianceHistory: [
      { date: '2026-06-12', issue: 'Prescription Workflow Breach (Schedule H dispatch without Rx verification)', severity: 'High', action: 'Warning Issued', status: 'Unresolved', notes: 'Customer received Schedule H antibiotic without valid doctor Rx.' },
      { date: '2026-06-18', issue: 'Customer Complaint: Damaged & Leaking Bottle', severity: 'Medium', action: 'Refund Deducted', status: 'Resolved', notes: 'Replacement unit sent to customer.' },
      { date: '2026-06-25', issue: 'Repeated Stock & Inventory Misrepresentation', severity: 'High', action: 'Audit Warning', status: 'Unresolved', notes: '3 consecutive orders cancelled due to fake stock listing.' }
    ]
  },

  // CASE 8 — LICENCE EXPIRING SOON (Frank Ross Healthcare - dlr-104)
  {
    id: 'dlr-104',
    name: 'Kavita Roy',
    ownerName: 'Kavita Roy',
    businessName: 'Frank Ross Healthcare',
    drugLicense: '20B/DL-77319/2025',
    licenseType: 'Form 20B & 21B Retail',
    issuingAuthority: 'West Bengal Directorate of Drugs Control',
    issueDate: '2023-09-15',
    expiryDate: '2026-09-15', // EXPIRING WITHIN 45 DAYS!
    licenseStatus: 'Expiring Soon',
    pharmacistName: 'Kavita Roy', pharmacistRegNo: 'REG-55410-WB', regAuthority: 'West Bengal Pharmacy Council', qualification: 'M.Pharm', pharmacistValidity: '2028-12-31',
    gstNumber: '19DDDDD3333D4Z9', panNumber: 'DDDDD4444D',
    email: 'frankross@medikart.com', phone: '+91 98321 65498',
    status: 'approved', registrationDate: '2025-03-15', rating: 4.8, reviewCount: 112, totalSales: 890, totalMedicines: 50, deliveryTime: 'Standard (24-48 hrs)', yearsOnMediKart: 3,
    address: 'Park Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '700016',
    bankAccount: 'State Bank of India • A/C 77889900112', ifscCode: 'SBIN0000123', grossRevenue: 156000, payoutStatus: 'Settled',
    docDrugLicense: 'FrankRoss_License.pdf', docPharmacistCert: 'Pharmacist_Kavita.pdf', docGst: 'GST_FrankRoss.pdf', docPan: 'PAN_FrankRoss.pdf', docAddressProof: 'Rent_Deed.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2025-03-15',
    complianceHistory: [
      { date: '2026-07-15', issue: 'Drug License Renewal Alert', severity: 'Low', action: 'Warning', status: 'Pending Renewal', notes: 'Form 20B licence expires in 45 days. Reminder sent to owner.' }
    ]
  },

  // CASE 9 — CORRECTION REQUIRED DEMO (Wellness Forever Store - dlr-103)
  {
    id: 'dlr-103',
    name: 'Anish Verma',
    ownerName: 'Anish Verma',
    businessName: 'Wellness Forever Store',
    drugLicense: '20B/DL-44120/2025',
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'Karnataka State Drugs Control',
    issueDate: '2025-01-15', expiryDate: '2029-01-15',
    licenseStatus: 'Verified',
    pharmacistName: 'Anish Verma', pharmacistRegNo: 'REG-88290-KA', regAuthority: 'Karnataka Pharmacy Council', qualification: 'B.Pharm', pharmacistValidity: '2029-08-20',
    gstNumber: '29CCCCC2222C3Z1', panNumber: 'CCCCC3333C',
    email: 'wellness@medikart.com', phone: '+91 97654 32109',
    status: 'correction_required', // DEMONSTRATE CORRECTION REQUIRED
    adminCorrectionNote: 'Please upload a clearer high-resolution scan of Form 21B Drug License and Pharmacist Registration Certificate.',
    registrationDate: '2025-01-15', rating: 4.7, reviewCount: 76, totalSales: 640, totalMedicines: 45, deliveryTime: 'Express (12-24 hrs)', yearsOnMediKart: 2,
    address: 'Indiranagar, Bengaluru', city: 'Bengaluru', state: 'Karnataka', pincode: '560038',
    bankAccount: 'Axis Bank • A/C 11223344556', ifscCode: 'UTIB0000789', grossRevenue: 128000, payoutStatus: 'Processing',
    docDrugLicense: 'Form20B_BlurryScan.pdf', docPharmacistCert: 'Pharmacist_Cert.pdf', docGst: 'GST_Wellness.pdf', docPan: 'PAN_Wellness.pdf', docAddressProof: 'Utility_Bill.pdf',
    marketplaceRulesAccepted: true, acceptedDate: '2025-01-15',
    complianceHistory: [
      { date: '2026-07-10', issue: 'Inventory Discrepancy (Paracetamol stock mismatch)', severity: 'Medium', action: 'Correction Requested', status: 'Resolved', notes: 'Stock counts synchronized with store inventory.' }
    ]
  },

  // CASE 10 — REPEATED SERIOUS VIOLATIONS & REJECTED (Apex Discount Chemist - dlr-110)
  {
    id: 'dlr-110',
    name: 'Sanjay Dutt',
    ownerName: 'Sanjay Dutt',
    businessName: 'Apex Discount Chemist',
    drugLicense: '20B/DL-00120/2023',
    licenseType: 'Form 20B Retail',
    issuingAuthority: 'Delhi Drug Control Department',
    issueDate: '2023-01-10', expiryDate: '2027-01-10',
    licenseStatus: 'Verified',
    pharmacistName: 'Sanjay Dutt', pharmacistRegNo: 'REG-11920-DL', regAuthority: 'Delhi Pharmacy Council', qualification: 'D.Pharm', pharmacistValidity: '2027-05-10',
    gstNumber: '07JJJJJ0000J0Z0', panNumber: 'JJJJJ0000J',
    email: 'apexchemist@medikart.com', phone: '+91 92222 11111',
    status: 'rejected',
    adminRejectionReason: 'Repeated high-risk prescription workflow violations and excessive customer cancellation rate (> 30%).',
    registrationDate: '2025-02-01', rating: 2.9, reviewCount: 60, totalSales: 350, totalMedicines: 40, deliveryTime: 'Standard', yearsOnMediKart: 2,
    address: 'Lajpat Nagar 2, New Delhi', city: 'New Delhi', state: 'Delhi', pincode: '110024',
    docDrugLicense: 'License_Apex.pdf', docPharmacistCert: 'Pharmacist_Sanjay.pdf', docGst: 'GST_Apex.pdf', docPan: 'PAN_Apex.pdf', docAddressProof: 'Rent_Agreement.pdf',
    marketplaceRulesAccepted: false, acceptedDate: null,
    complianceHistory: [
      { date: '2026-05-10', issue: 'Repeated Prescription Workflow Breaches', severity: 'High', action: 'Suspended', status: 'Rejected', notes: 'Dispatched controlled drugs without Rx.' },
      { date: '2026-06-01', issue: 'High Order Cancellation Rate (> 30%)', severity: 'High', action: 'Application Rejected', status: 'Rejected', notes: 'Multiple customer complaints regarding unfulfilled orders.' }
    ]
  }
];

for (let i = 5; i <= 120; i++) {
  const brand = DEALER_NAME_PARTS[i % DEALER_NAME_PARTS.length];
  const loc = LOCATIONS[i % LOCATIONS.length];
  const status = i % 10 === 0 ? 'pending' : i % 20 === 0 ? 'suspended' : 'approved';

  let pStatus = 'Settled';
  let errReason = null;
  let txRef = `TXN-${90000 + i}`;

  if (status === 'pending') {
    pStatus = 'Pending Approval';
    txRef = null;
  } else if (i % 7 === 0) {
    pStatus = 'Failed';
    errReason = 'Beneficiary Name Mismatch (Bank returned: Account holder name does not match registered GSTIN profile)';
    txRef = null;
  } else if (i % 11 === 0) {
    pStatus = 'On Hold';
    errReason = 'Form 20B Statutory Drug License annual renewal pending audit verification';
    txRef = null;
  } else if (i % 5 === 0) {
    pStatus = 'Processing';
    txRef = `PAYOUT-PROCS-${8000 + i}`;
  } else if (i % 3 === 0) {
    pStatus = 'Pending Settlement';
    txRef = null;
  }

  INITIAL_DEALERS.push({
    id: `dlr-${100 + i}`,
    name: `Pharmacist ${i}`,
    businessName: `${brand} #${i}`,
    drugLicense: `20B/DL-${80000 + i}/2025`,
    gstNumber: `${String(10 + (i % 25)).padStart(2, '0')}ABCDE${1000 + i}F${i % 9}Z${(i % 5) + 1}`,
    panNumber: `ABCDE${1000 + i}F`,
    email: `chemist${i}@medikart.com`,
    phone: `+91 98${Math.floor(10000000 + (i * 7654321) % 90000000)}`,
    status: status,
    registrationDate: '2025-05-10',
    rating: Number((4.1 + (i % 9) / 10).toFixed(1)),
    reviewCount: 20 + (i * 3) % 150,
    totalSales: status === 'pending' ? 0 : 50 + i * 8,
    totalMedicines: 25 + (i % 45),
    deliveryTime: i % 3 === 0 ? 'Same Day Delivery' : i % 2 === 0 ? 'Express (12-24 hrs)' : 'Standard (24-48 hrs)',
    yearsOnMediKart: 1 + (i % 4),
    address: `${loc}`,
    city: loc.split(', ')[1] || 'Bengaluru',
    state: 'India',
    pincode: `5600${10 + (i % 80)}`,
    bankAccount: `HDFC Bank • A/C 98${100000 + i}`,
    ifscCode: i % 7 === 0 ? 'INVALID_IFSC_999' : 'HDFC0000123',
    grossRevenue: status === 'pending' ? 0 : 15000 + i * 1250,
    payoutStatus: pStatus,
    payoutErrorReason: errReason,
    transactionRef: txRef,
    payoutUpdatedDate: '2026-08-01'
  });
}

/* --------------------------------------------------------------------------
   3. SEED CATALOG & MEDICINE GENERATOR (60 Medicines for dlr-101 Apollo MedShop)
   -------------------------------------------------------------------------- */
const SEED_CATALOG = [
  // FEVER
  { name: 'Crocin 650 Advance', genericName: 'Paracetamol 650mg', manufacturer: 'GSK Consumer Healthcare', medicineType: 'Tablet', therapeuticCategory: 'Fever', packaging: '10 Tablets / Strip', packageUnit: 'Strips', mrp: 48, sellingPrice: 38, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', description: 'Fast acting fever reducer and pain reliever.', isBestSeller: true, isPopular: true },
  { name: 'Dolo 650 Tablet', genericName: 'Paracetamol 650mg', manufacturer: 'Micro Labs Ltd', medicineType: 'Tablet', therapeuticCategory: 'Fever', packaging: '15 Tablets / Strip', packageUnit: 'Strips', mrp: 35, sellingPrice: 28, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1550572017-edf7061a663c?w=600&auto=format&fit=crop&q=80', description: 'Doctor recommended anti-pyretic for high fever.', isBestSeller: true },
  { name: 'Calpol 500 Suspension', genericName: 'Paracetamol 250mg/5ml', manufacturer: 'GSK Pharmaceuticals', medicineType: 'Syrup', therapeuticCategory: 'Fever', packaging: '60 ml Bottle', packageUnit: 'Bottles', mrp: 65, sellingPrice: 55, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80', description: 'Pediatric fever suspension for infants and kids.' },
  { name: 'Otrivin Adult Nasal Spray', genericName: 'Xylometazoline HCl 0.1%', manufacturer: 'GSK Consumer Healthcare', medicineType: 'Drops', therapeuticCategory: 'Fever', packaging: '10 ml Bottle', packageUnit: 'Bottles', mrp: 115, sellingPrice: 98, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Nasal decongestant for sinus and feverish cold.', isNewArrival: true },

  // PAIN RELIEF
  { name: 'Volini Pain Relief Gel', genericName: 'Diclofenac Diethylamine & Menthol', manufacturer: 'Sun Pharma', medicineType: 'Cream', therapeuticCategory: 'Pain Relief', packaging: '20 g Tube', packageUnit: 'Tubes', mrp: 110, sellingPrice: 95, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1626714494113-498b9a15754b?w=600&auto=format&fit=crop&q=80', description: 'Deep penetrating relief for muscle strain.', isBestSeller: true },
  { name: 'Combiflam Tablet', genericName: 'Ibuprofen 400mg + Paracetamol 325mg', manufacturer: 'Sanofi India', medicineType: 'Tablet', therapeuticCategory: 'Pain Relief', packaging: '20 Tablets / Strip', packageUnit: 'Strips', mrp: 45, sellingPrice: 38, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80', description: 'Dual action oral analgesic for joint and dental pain.' },
  { name: 'Moov Pain Ointment', genericName: 'Turpentine & Wintergreen Oil', manufacturer: 'Reckitt Benckiser', medicineType: 'Ointment', therapeuticCategory: 'Pain Relief', packaging: '30 g Tube', packageUnit: 'Tubes', mrp: 145, sellingPrice: 125, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', description: 'Ayurvedic lower back pain gel.' },
  { name: 'Dynapar AQ Injection', genericName: 'Diclofenac Sodium 75mg/1ml', manufacturer: 'Troikaa Pharmaceuticals', medicineType: 'Injection', therapeuticCategory: 'Pain Relief', packaging: '1 Vial', packageUnit: 'Vials', mrp: 32, sellingPrice: 26, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Acute pain relief injection for clinical use.' },

  // ANTIBIOTICS
  { name: 'Augmentin 625 Duo', genericName: 'Amoxicillin 500mg + Clavulanate 125mg', manufacturer: 'GSK Pharmaceuticals', medicineType: 'Tablet', therapeuticCategory: 'Antibiotics', packaging: '10 Tablets / Strip', packageUnit: 'Strips', mrp: 235, sellingPrice: 204, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80', description: 'Penicillin antibiotic for respiratory infections.', isBestSeller: true },
  { name: 'Azithral 500 Tablet', genericName: 'Azithromycin 500mg', manufacturer: 'Alembic Pharmaceuticals', medicineType: 'Tablet', therapeuticCategory: 'Antibiotics', packaging: '5 Tablets / Strip', packageUnit: 'Strips', mrp: 132, sellingPrice: 115, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1550572017-edf7061a663c?w=600&auto=format&fit=crop&q=80', description: 'Macrolide broad-spectrum antibiotic.' },
  { name: 'Ciplox 500 Tablet', genericName: 'Ciprofloxacin 500mg', manufacturer: 'Cipla Ltd', medicineType: 'Tablet', therapeuticCategory: 'Antibiotics', packaging: '10 Tablets / Strip', packageUnit: 'Strips', mrp: 48, sellingPrice: 40, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', description: 'Fluoroquinolone for urinary and gut infections.' },
  { name: 'Taxim 1g Injection', genericName: 'Cefotaxime Sodium 1g', manufacturer: 'Alkem Laboratories', medicineType: 'Injection', therapeuticCategory: 'Antibiotics', packaging: '1 Vial', packageUnit: 'Vials', mrp: 45, sellingPrice: 38, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Injectable antibiotic for severe systemic bacterial infections.' },

  // DIABETES & CAPSULES
  { name: 'Glycomet GP 2 Tablet', genericName: 'Metformin 500mg + Glimepiride 2mg', manufacturer: 'USV Pvt Ltd', medicineType: 'Tablet', therapeuticCategory: 'Diabetes', packaging: '15 Tablets / Strip', packageUnit: 'Strips', mrp: 180, sellingPrice: 152, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Blood sugar control for Type-2 Diabetes.', isBestSeller: true },
  { name: 'Omeprazole 20mg Capsule', genericName: 'Omeprazole 20mg', manufacturer: 'Dr. Reddy Labs', medicineType: 'Capsule', therapeuticCategory: 'Digestive Care', packaging: '15 Capsules / Strip', packageUnit: 'Strips', mrp: 65, sellingPrice: 52, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Acid reducer capsule for heartburn.' },
  { name: 'Evion 400 Capsule', genericName: 'Vitamin E 400mg', manufacturer: 'Procter & Gamble', medicineType: 'Capsule', therapeuticCategory: 'Vitamins & Supplements', packaging: '10 Capsules / Strip', packageUnit: 'Strips', mrp: 38, sellingPrice: 32, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Vitamin E antioxidant capsules.' },
  { name: 'Becosules Z Capsule', genericName: 'B-Complex + Vitamin C + Zinc', manufacturer: 'Pfizer Ltd', medicineType: 'Capsule', therapeuticCategory: 'Vitamins & Supplements', packaging: '20 Capsules / Strip', packageUnit: 'Strips', mrp: 52, sellingPrice: 44, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Multivitamin for tissue repair & immunity.', isBestSeller: true },
  { name: 'Revital H Daily Capsule', genericName: 'Ginseng + Multivitamins', manufacturer: 'Sun Pharma', medicineType: 'Capsule', therapeuticCategory: 'Vitamins & Supplements', packaging: '30 Capsules / Bottle', packageUnit: 'Bottles', mrp: 330, sellingPrice: 280, prescriptionRequired: false, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Daily energy & stamina supplement.', isPopular: true },
  { name: 'Pantocid D Capsule', genericName: 'Pantoprazole 40mg + Domperidone 30mg', manufacturer: 'Sun Pharma', medicineType: 'Capsule', therapeuticCategory: 'Digestive Care', packaging: '15 Capsules / Strip', packageUnit: 'Strips', mrp: 195, sellingPrice: 165, prescriptionRequired: true, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', description: 'Relieves acidity, heartburn, and gas reflux.', isBestSeller: true }
];

/* --------------------------------------------------------------------------
   CANONICAL PRODUCT CATALOG
   A product is a real-world SKU (brand + generic + pack). Multiple pharmacies
   list the SAME product at different prices — that shared identity is what
   makes the "compare verified sellers" feature return real results instead of
   fabricated rows.
   -------------------------------------------------------------------------- */
const PRODUCT_TEMPLATES = [];

MEDICINE_TYPES.forEach((mt, typeIdx) => {
  THERAPEUTIC_CATEGORIES.forEach((tc, catIdx) => {
    const seq = typeIdx * THERAPEUTIC_CATEGORIES.length + catIdx;

    let brandName, genericMol, mfrName, pack, packUnit;

    if (mt.name === 'Tablet') {
      brandName = `${tc.name}care ${250 + (seq % 4) * 250}mg Tablet`;
      genericMol = `Paracetamol ${250 + (seq % 4) * 250}mg`;
      mfrName = 'GSK Consumer Healthcare';
      pack = '10 Tablets / Strip'; packUnit = 'Strips';
    } else if (mt.name === 'Capsule') {
      brandName = `Capso${tc.name} ${100 + (seq % 3) * 100}mg Capsule`;
      genericMol = `Active Bio-Capsule ${100 + (seq % 3) * 100}mg`;
      mfrName = 'Dr. Reddy Labs';
      pack = '15 Capsules / Strip'; packUnit = 'Strips';
    } else if (mt.name === 'Syrup') {
      brandName = `Syru${tc.name} Liquid Relief`;
      genericMol = `Oral Suspension ${100 + (seq % 5) * 20}ml`;
      mfrName = 'Cipla Ltd';
      pack = '100 ml Bottle'; packUnit = 'Bottles';
    } else if (mt.name === 'Cream') {
      brandName = `Dermo${tc.name} Relief Cream`;
      genericMol = 'Topical Anti-Inflammatory 2%';
      mfrName = 'Glenmark Pharmaceuticals';
      pack = '20 g Tube'; packUnit = 'Tubes';
    } else if (mt.name === 'Ointment') {
      brandName = `${tc.name} Healing Ointment`;
      genericMol = 'Medicated Petroleum Base';
      mfrName = 'Reckitt Benckiser';
      pack = '30 g Tube'; packUnit = 'Tubes';
    } else if (mt.name === 'Drops') {
      brandName = `Ophthal${tc.name} Care Drops`;
      genericMol = 'Sterile Solution 0.5%';
      mfrName = 'Allergan India';
      pack = '10 ml Bottle'; packUnit = 'Bottles';
    } else if (mt.name === 'Injection') {
      brandName = `Injec${tc.name} Sterile Ampoule`;
      genericMol = 'Injectable Solution 1g';
      mfrName = 'Sanofi India';
      pack = '1 Vial'; packUnit = 'Vials';
    } else if (mt.name === 'Inhaler') {
      brandName = `Respi${tc.name} Inhaler`;
      genericMol = 'Pressurized Inhalation 200mcg';
      mfrName = 'Cipla Ltd';
      pack = '200 Doses Inhaler'; packUnit = 'Inhalers';
    } else if (mt.name === 'Powder') {
      brandName = `Nutri${tc.name} Health Powder`;
      genericMol = 'Bio-Active Soluble Formula';
      mfrName = 'Abbott Healthcare';
      pack = '100 g Jar'; packUnit = 'Jars';
    } else if (mt.name === 'Sachet') {
      brandName = `Insta${tc.name} Sachet`;
      genericMol = 'Oral Rehydration Salts';
      mfrName = 'FDC Ltd';
      pack = '5 g Sachet'; packUnit = 'Sachets';
    } else {
      brandName = `Medi${tc.name} Monitoring Device`;
      genericMol = 'Digital Diagnostic Unit';
      mfrName = 'Omron Healthcare';
      pack = '1 Piece'; packUnit = 'Pieces';
    }

    PRODUCT_TEMPLATES.push({
      sku: `SKU-${String(seq + 1).padStart(4, '0')}`,
      name: brandName,
      genericName: genericMol,
      manufacturer: mfrName,
      medicineType: mt.name,
      therapeuticCategory: tc.name,
      packaging: pack,
      packageUnit: packUnit,
      basePrice: 30 + (seq * 7) % 180,
      prescriptionRequired: seq % 3 === 0,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      description: `Verified ${mt.name.toLowerCase()} formulation for ${tc.name.toLowerCase()}.`
    });
  });
});

// Branded seed SKUs join the same shared catalog.
SEED_CATALOG.forEach((seed, i) => {
  PRODUCT_TEMPLATES.push({
    sku: `SKU-B${String(i + 1).padStart(3, '0')}`,
    name: seed.name,
    genericName: seed.genericName,
    manufacturer: seed.manufacturer,
    medicineType: seed.medicineType,
    therapeuticCategory: seed.therapeuticCategory,
    packaging: seed.packaging,
    packageUnit: seed.packageUnit,
    basePrice: seed.sellingPrice,
    mrpOverride: seed.mrp,
    prescriptionRequired: seed.prescriptionRequired,
    image: seed.image,
    description: seed.description,
    isBestSeller: !!seed.isBestSeller,
    isPopular: !!seed.isPopular,
    isNewArrival: !!seed.isNewArrival,
    isBranded: true
  });
});

/* --------------------------------------------------------------------------
   LISTING GENERATOR
   Every pharmacy receives a catalog it genuinely stocks. Windows of the shared
   product catalog overlap between dealers, so each product ends up with several
   competing sellers at slightly different prices.
   -------------------------------------------------------------------------- */
const SHOWCASE_DEALER_ID = 'dlr-101';
const SHOWCASE_LISTING_COUNT = 60;
const STANDARD_LISTING_COUNT = 6;

const INITIAL_MEDICINES = [];
let medIndex = 1;

INITIAL_DEALERS.forEach((dealer, dealerIdx) => {
  const isShowcase = dealer.id === SHOWCASE_DEALER_ID;
  const listingCount = isShowcase ? SHOWCASE_LISTING_COUNT : STANDARD_LISTING_COUNT;

  // Overlapping window into the shared catalog.
  const windowStart = (dealerIdx * 5) % PRODUCT_TEMPLATES.length;
  const productIds = [];
  for (let n = 0; n < listingCount; n++) {
    productIds.push((windowStart + n) % PRODUCT_TEMPLATES.length);
  }
  // The showcase pharmacy also carries every branded seed SKU.
  if (isShowcase) {
    PRODUCT_TEMPLATES.forEach((p, idx) => {
      if (p.isBranded && productIds.indexOf(idx) === -1) productIds.push(idx);
    });
  }

  productIds.forEach((pIdx, n) => {
    const product = PRODUCT_TEMPLATES[pIdx];
    const medId = `med-${String(medIndex).padStart(4, '0')}`;

    // Per-dealer price competition around the canonical base price.
    const priceDelta = ((dealerIdx * 3 + n) % 11) - 5;
    const sellingPrice = Math.max(10, product.basePrice + priceDelta);
    const mrp = product.mrpOverride && isShowcase
      ? product.mrpOverride
      : Math.round(sellingPrice * 1.25);

    // Stock distribution: optimal, low, and out-of-stock cases.
    let stock = 45 + (medIndex * 11) % 150;
    if (medIndex % 7 === 0) stock = 8;
    else if (medIndex % 13 === 0) stock = 0;

    // Expiry distribution, including a near-expiry cohort.
    let expYear = 2027 + (medIndex % 2);
    let expMonth = String((medIndex % 12) + 1).padStart(2, '0');
    if (medIndex % 6 === 0) { expYear = 2026; expMonth = '09'; }
    const expDate = `${expYear}-${expMonth}-25`;

    INITIAL_MEDICINES.push({
      id: medId,
      sku: product.sku,
      name: product.name,
      genericName: product.genericName,
      manufacturer: product.manufacturer,
      marketedBy: product.manufacturer,
      manufacturedBy: `${product.manufacturer} Labs Ltd`,
      dealerId: dealer.id,
      dealerName: dealer.businessName,
      medicineType: product.medicineType,
      therapeuticCategory: product.therapeuticCategory,
      packaging: product.packaging,
      packageUnit: product.packageUnit,
      mrp: mrp,
      sellingPrice: sellingPrice,
      stock: stock,
      batchNumber: `BTH-2026-X${String(medIndex).padStart(4, '0')}`,
      mfgDate: `${expYear - 2}-03-10`,
      expiryDate: expDate,
      status: medIndex % 12 === 0 ? 'Draft' : 'Approved',
      rejectionReason: null,
      prescriptionRequired: product.prescriptionRequired,
      image: product.image,
      description: product.description,
      uses: `Targeted treatment for ${product.therapeuticCategory.toLowerCase()} conditions.`,
      dosage: `Take 1 ${product.packageUnit.toLowerCase().replace(/s$/, '')} daily after food, or as prescribed.`,
      sideEffects: 'Mild drowsiness or minor digestive discomfort in rare sensitivity cases.',
      storage: 'Store below 25°C in a cool, dry place away from direct sunlight.',
      rating: Number((4.2 + (medIndex % 8) / 10).toFixed(1)),
      reviewCount: 15 + (medIndex * 3) % 180,
      isBestSeller: product.isBestSeller || medIndex % 9 === 0,
      isPopular: product.isPopular || medIndex % 7 === 0,
      isNewArrival: product.isNewArrival || medIndex % 11 === 0,
      restockHistory: [
        { id: `rst-${medIndex}-1`, date: '2026-07-01', change: `+${stock + 50} ${product.packageUnit}`, type: 'Restock', stockAfter: stock + 50, notes: 'Supplier Monthly Shipment' },
        { id: `rst-${medIndex}-2`, date: '2026-07-20', change: `-50 ${product.packageUnit} Sold`, type: 'Sale', stockAfter: stock, notes: 'Fulfill Customer Orders' }
      ]
    });

    medIndex++;
  });
});

/* --------------------------------------------------------------------------
   4. BUYER PROFILE DATASET
   -------------------------------------------------------------------------- */
const INITIAL_BUYER_PROFILE = {
  id: 'usr-501',
  name: 'Buyer',
  email: 'buyer@medikart.com',
  phone: '+91 98765 12345',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberSince: 'January 2025',
  status: 'active',
  addresses: [
    { id: 'addr-101', name: 'Buyer', tag: 'Home', mobile: '+91 98765 12345', line: 'Flat 402, Green Glen Apartments, HSR Layout Sector 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', isDefault: true },
    { id: 'addr-102', name: 'Buyer (Office)', tag: 'Work', mobile: '+91 98765 12345', line: 'Building 7B, 3rd Floor, Manyata Tech Park, Nagavara', city: 'Bengaluru', state: 'Karnataka', pincode: '560045', isDefault: false },
    { id: 'addr-103', name: 'Buyer Residence', tag: 'Others', mobile: '+91 98111 22334', line: 'Plot 88, Civil Lines, Near Metro Gate 2', city: 'New Delhi', state: 'Delhi', pincode: '110054', isDefault: false }
  ]
};

const INITIAL_BUYERS = [INITIAL_BUYER_PROFILE];

const BUYER_FIRST_NAMES = [
  'Amit', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Rohan', 'Pooja',
  'Karthik', 'Meera', 'Sanjay', 'Neha', 'Arjun', 'Divya', 'Alok', 'Ritu',
  'Deepak', 'Swati', 'Manish', 'Kavita', 'Gaurav', 'Anjali', 'Nikhil', 'Tanvi'
];

const BUYER_LAST_NAMES = [
  'Sharma', 'Nair', 'Deshmukh', 'Iyer', 'Malhotra', 'Gupta', 'Mehta', 'Agarwal',
  'Sundaram', 'Joshi', 'Rao', 'Kapoor', 'Verma', 'Pillai', 'Pandey', 'Chawla',
  'Bhasin', 'Reddy', 'Choudhury', 'Patel', 'Saxena', 'Mukherjee', 'Dutta', 'Singhania'
];

const CITIES = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Chennai', 'Pune', 'Jaipur', 'Ahmedabad', 'Chandigarh'];

for (let i = 2; i <= 250; i++) {
  const fName = BUYER_FIRST_NAMES[i % BUYER_FIRST_NAMES.length];
  const lName = BUYER_LAST_NAMES[i % BUYER_LAST_NAMES.length];
  const fullName = `${fName} ${lName}`;
  const city = CITIES[i % CITIES.length];
  const bId = `usr-${500 + i}`;
  const domain = i % 3 === 0 ? 'gmail.com' : i % 2 === 0 ? 'yahoo.com' : 'outlook.com';
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@${domain}`;
  const phone = `+91 ${98 + (i % 2)}${Math.floor(10000000 + (i * 7654321) % 90000000)}`;

  INITIAL_BUYERS.push({
    id: bId,
    name: fullName,
    email: email,
    phone: phone,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    memberSince: `2025-0${(i % 9) + 1}-${String((i % 25) + 1).padStart(2, '0')}`,
    status: 'active',
    totalOrders: 1 + (i % 18),
    addresses: [
      {
        id: `addr-${bId}-1`,
        name: fullName,
        tag: 'Home',
        mobile: phone,
        line: `Flat ${101 + (i * 7) % 800}, Sector ${(i % 25) + 1}, ${city} West`,
        city: city,
        state: 'India',
        pincode: `5600${10 + (i % 80)}`,
        isDefault: true
      }
    ]
  });
}

/* --------------------------------------------------------------------------
   5. ORDERS GENERATOR
   Every order is built FROM the selling pharmacy's own catalog, so dealer
   inventory, dealer sales and platform GMV all reconcile against each other.
   -------------------------------------------------------------------------- */
const INITIAL_ORDERS = [];

// Index each dealer's real listings once, instead of re-filtering per order.
const MEDS_BY_DEALER = {};
INITIAL_MEDICINES.forEach(m => {
  if (m.status !== 'Approved') return;
  if (!MEDS_BY_DEALER[m.dealerId]) MEDS_BY_DEALER[m.dealerId] = [];
  MEDS_BY_DEALER[m.dealerId].push(m);
});

// Only pharmacies that are actually live can have historical orders.
const SELLING_DEALERS = INITIAL_DEALERS.filter(
  d => d.status === 'approved' && (MEDS_BY_DEALER[d.id] || []).length > 0
);

const ORDER_GST_RATE = 12;
const ORDER_COUNT = 500;
let orderSeq = 0;

for (let i = 1; i <= ORDER_COUNT; i++) {
  // The showcase pharmacy carries the first 150 orders; the rest rotate across
  // live pharmacies that genuinely have stock.
  const showcase = INITIAL_DEALERS.find(d => d.id === SHOWCASE_DEALER_ID);
  const showcaseSellable = (MEDS_BY_DEALER[SHOWCASE_DEALER_ID] || []).length > 0;

  let dealer;
  if (i <= 150 && showcase && showcaseSellable) {
    dealer = showcase;
  } else if (SELLING_DEALERS.length > 0) {
    dealer = SELLING_DEALERS[i % SELLING_DEALERS.length];
  } else {
    continue;
  }

  const dealerMeds = MEDS_BY_DEALER[dealer.id] || [];
  if (dealerMeds.length === 0) continue;

  // The purchased item ALWAYS belongs to the selling pharmacy.
  const med = dealerMeds[i % dealerMeds.length];

  const buyer = INITIAL_BUYERS[i % INITIAL_BUYERS.length];
  const qty = 1 + (i % 4);
  const sub = Number((med.sellingPrice * qty).toFixed(2));
  const discount = i % 4 === 0 ? 25 : 0;
  const taxable = Math.max(0, sub - discount);
  const gst = Number((taxable * (ORDER_GST_RATE / 100)).toFixed(2));
  const delFee = sub > 500 ? 0 : 45;
  const gTotal = Number((taxable + gst + delFee).toFixed(2));

  // Order stage workflow: Placed -> Accepted -> Packed -> Shipped -> Out for Delivery -> Delivered
  let status = 'Delivered';
  if (i % 12 === 0) status = 'Placed';
  else if (i % 10 === 0) status = 'Accepted';
  else if (i % 8 === 0) status = 'Packed';
  else if (i % 6 === 0) status = 'Shipped';
  else if (i % 5 === 0) status = 'Out for Delivery';

  let payStatus = 'Paid';
  if (status === 'Placed') payStatus = i % 2 === 0 ? 'Paid' : 'Pending';

  // Dates spread across Jan-Aug 2026, with delivery after the order date.
  const monthNum = (i % 8) + 1;
  const dayNum = (i % 27) + 1;
  const ordDate = `2026-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  const deliveryDay = new Date(Date.UTC(2026, monthNum - 1, dayNum + 2));
  const expectedDelivery = deliveryDay.toISOString().split('T')[0];

  // Rx orders carry a prescription state consistent with their fulfilment stage.
  const rxRequired = !!med.prescriptionRequired;
  let rxStatus = 'N/A';
  if (rxRequired) rxStatus = status === 'Placed' ? 'Pending' : 'Verified';

  orderSeq++;

  INITIAL_ORDERS.push({
    id: `ORD-${980000 + orderSeq}`,
    invoiceNumber: `INV-2026-${980000 + orderSeq}`,
    buyerId: buyer.id,
    buyerName: buyer.name,
    buyerEmail: buyer.email,
    orderDate: ordDate,
    dealerId: dealer.id,
    dealerName: dealer.businessName,
    items: [
      {
        medicineId: med.id,
        medicineName: med.name,
        genericName: med.genericName,
        dealerId: dealer.id,
        dealerName: dealer.businessName,
        pricePerUnit: med.sellingPrice,
        packaging: med.packaging,
        packageUnit: med.packageUnit,
        prescriptionRequired: rxRequired,
        quantity: qty,
        subtotal: sub
      }
    ],
    totalUnits: qty,
    subtotal: sub,
    discount: discount,
    gstRate: ORDER_GST_RATE,
    gst: gst,
    deliveryFee: delFee,
    grandTotal: gTotal,
    paymentMethod: i % 3 === 0 ? 'UPI (Google Pay)' : i % 2 === 0 ? 'Credit Card' : 'Cash on Delivery',
    paymentStatus: payStatus,
    status: status,
    rxStatus: rxStatus,
    expectedDelivery: expectedDelivery,
    shippingAddress: buyer.addresses && buyer.addresses[0]
      ? `${buyer.addresses[0].line}, ${buyer.addresses[0].city} - ${buyer.addresses[0].pincode}`
      : 'Flat 402, Green Glen Apartments, HSR Layout, Bengaluru',
    timestamps: {
      Placed: `${ordDate} 09:15 AM`,
      Accepted: `${ordDate} 10:00 AM`,
      Packed: `${ordDate} 01:30 PM`,
      Shipped: `${ordDate} 04:45 PM`,
      'Out for Delivery': `${ordDate} 06:10 PM`,
      Delivered: `${expectedDelivery} 07:45 PM`
    }
  });
}

/* --------------------------------------------------------------------------
   DERIVED DEALER METRICS
   Listing counts and revenue are computed from the data that actually exists,
   rather than being advertised independently of it.
   -------------------------------------------------------------------------- */
(function deriveDealerMetrics() {
  const commissionRate = 8; // default platform rate

  INITIAL_DEALERS.forEach(dealer => {
    const listings = INITIAL_MEDICINES.filter(m => m.dealerId === dealer.id);
    const dealerOrders = INITIAL_ORDERS.filter(o => o.dealerId === dealer.id);

    // Gross sales = net product value only. GST is collected for the
    // government and delivery fees belong to logistics; neither is dealer
    // revenue and neither is commissionable.
    const grossRevenue = Number(
      dealerOrders.reduce((sum, o) => sum + (o.subtotal - (o.discount || 0)), 0).toFixed(2)
    );

    dealer.totalMedicines = listings.length;
    dealer.totalSales = dealerOrders.length;
    dealer.grossRevenue = grossRevenue;
    dealer.commissionRate = commissionRate;
    dealer.netPayout = Number((grossRevenue * (1 - commissionRate / 100)).toFixed(2));

    // Ensure every dealer has settlement details on file. Several hand-written
    // records omitted these, and the payouts screen assumed they were present.
    if (!dealer.bankAccount) {
      const acct = 90000000 + (parseInt(String(dealer.id).replace(/\D/g, ''), 10) || 0) * 137;
      dealer.bankAccount = `HDFC Bank • A/C ${acct}`;
    }
    if (!dealer.ifscCode) dealer.ifscCode = 'HDFC0000123';
    if (!dealer.payoutStatus) dealer.payoutStatus = 'Pending Settlement';

    if (dealer.status !== 'approved') {
      dealer.totalSales = 0;
      dealer.grossRevenue = 0;
      dealer.netPayout = 0;
    }
  });
})();

/* --------------------------------------------------------------------------
   6. DEALER & BUYER NOTIFICATIONS
   -------------------------------------------------------------------------- */
const INITIAL_NOTIFICATIONS = [
  // Dealer Account Specific Notifications
  { id: 'notif-dlr-1', dealerId: 'dlr-101', category: 'Pharmacy Registration', title: 'Statutory Registration Approved', message: 'Your Drug License (20B/DL-88741/2024) and GSTIN have been verified by Admin. Pharmacy is now Active.', time: '10 mins ago', read: false },
  { id: 'notif-dlr-2', dealerId: 'dlr-101', category: 'New Order', title: 'New Customer Order Received #ORD-980250', message: 'Order received from Amit Sharma for 3x Crocin 650 Advance (₹211.68). Please accept and pack.', time: '25 mins ago', read: false },
  { id: 'notif-dlr-3', dealerId: 'dlr-101', category: 'Medicine Listing', title: 'Medicine Listing Approved by Admin', message: 'Your listing for "Augmentin 625 Duo Tablet" has been approved and published to the catalog.', time: '2 hours ago', read: false },
  { id: 'notif-dlr-4', dealerId: 'dlr-101', category: 'Medicine Listing', title: 'Listing Resubmission Requested', message: 'Listing "NutriFever Health Powder" requires high-res image showing clear batch label details.', time: '5 hours ago', read: false },
  { id: 'notif-dlr-5', dealerId: 'dlr-101', category: 'Stock Alert', title: 'Low Stock Alert: Calpol 500 Suspension', message: 'Current stock is only 8 bottles. Please restock immediately to avoid catalog suspension.', time: '1 day ago', read: true },
  { id: 'notif-dlr-6', dealerId: 'dlr-101', category: 'Stock Alert', title: 'Medicine Nearing Expiry', message: 'Batch BTH-2026-X012 of Dolo 650 expires in less than 30 days (2026-08-25).', time: '1 day ago', read: true },
  { id: 'notif-dlr-7', dealerId: 'dlr-101', category: 'Payment Received', title: 'Weekly Net Payout Settled', message: '₹2,84,500.00 successfully transferred to your HDFC Bank account (Ref: TXN984210).', time: '2 days ago', read: true },
  { id: 'notif-dlr-8', dealerId: 'dlr-101', category: 'New Order', title: 'New Customer Order Received #ORD-980249', message: 'Order received from Ananya Iyer for 2x Volini Gel (₹190.00).', time: '3 days ago', read: true },

  // General Marketplace Notifications
  { id: 'notif-1', category: 'Order Updates', title: 'Order #ORD-982101 Out for Delivery', message: 'Your package containing Crocin 650 is out for delivery via Apollo MedShop.', time: '10 mins ago', read: false },
  { id: 'notif-2', category: 'Prescription', title: 'Refill Reminder: Glycomet GP 2', message: 'It is time to reorder your monthly Glycomet GP 2 prescription.', time: '1 hour ago', read: false },
  { id: 'notif-3', category: 'Promotions', title: 'Special Offer Unlocked: FEVER25', message: 'Use coupon code FEVER25 for 25% OFF on fever & cold remedies today.', time: '3 hours ago', read: false }
];

const INITIAL_COUPONS = [
  { code: 'MEDIFIRST20', discountPercent: 20, maxDiscount: 150, minOrder: 300, expiry: '2026-12-31', desc: 'Flat 20% OFF on your first medicine marketplace order.', category: 'All' },
  { code: 'HEALTH15', discountPercent: 15, maxDiscount: 200, minOrder: 500, expiry: '2026-09-30', desc: '15% Discount on all health supplements and multivitamins.', category: 'Vitamins & Supplements' },
  { code: 'FEVER25', discountPercent: 25, maxDiscount: 100, minOrder: 250, expiry: '2026-10-15', desc: '25% Instant Savings on Fever & Cold relief medications.', category: 'Fever' },
  { code: 'CARDIAC10', discountPercent: 10, maxDiscount: 250, minOrder: 800, expiry: '2026-11-30', desc: 'Flat 10% Cashback on chronic cardiac & blood pressure prescriptions.', category: 'Cardiology' }
];

// Seeded from real generated listings so the wishlist never points at ids that
// do not exist.
const INITIAL_WISHLIST = INITIAL_MEDICINES
  .filter(m => m.status === 'Approved' && m.stock > 0)
  .slice(0, 3)
  .map(m => m.id);

/* --------------------------------------------------------------------------
   7. DATA STORE ENGINE CLASS WITH IN-MEMORY CACHE
   -------------------------------------------------------------------------- */
class DataStore {
  constructor() {
    this.cache = {};
    this.init();
  }

  init() {
    try {
      const existingMedsStr = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      let existingMeds = [];
      if (existingMedsStr) {
        try { existingMeds = JSON.parse(existingMedsStr); } catch(e) { existingMeds = []; }
      }

      if (!existingMedsStr || !Array.isArray(existingMeds) || existingMeds.length < 50) {
        localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(INITIAL_MEDICINES));
        this.cache[STORAGE_KEYS.MEDICINES] = INITIAL_MEDICINES;
      } else {
        this.cache[STORAGE_KEYS.MEDICINES] = existingMeds;
      }

      if (!localStorage.getItem(STORAGE_KEYS.DEALERS)) {
        localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(INITIAL_DEALERS));
        this.cache[STORAGE_KEYS.DEALERS] = INITIAL_DEALERS;
      }
      
      const existingBuyersStr = localStorage.getItem(STORAGE_KEYS.BUYERS);
      let existingBuyers = [];
      if (existingBuyersStr) {
        try { existingBuyers = JSON.parse(existingBuyersStr); } catch(e) { existingBuyers = []; }
      }

      if (!existingBuyersStr || !Array.isArray(existingBuyers) || existingBuyers.length < 50) {
        localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(INITIAL_BUYERS));
        this.cache[STORAGE_KEYS.BUYERS] = INITIAL_BUYERS;
      } else {
        this.cache[STORAGE_KEYS.BUYERS] = existingBuyers;
      }

      const existingOrdersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
      let existingOrders = [];
      if (existingOrdersStr) {
        try { existingOrders = JSON.parse(existingOrdersStr); } catch(e) { existingOrders = []; }
      }
      if (!existingOrdersStr || !Array.isArray(existingOrders) || existingOrders.length < 100) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        this.cache[STORAGE_KEYS.ORDERS] = INITIAL_ORDERS;
      } else {
        this.cache[STORAGE_KEYS.ORDERS] = existingOrders;
      }

      if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        this.cache[STORAGE_KEYS.CART] = [];
      }
      if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(INITIAL_WISHLIST));
        this.cache[STORAGE_KEYS.WISHLIST] = INITIAL_WISHLIST;
      }
      if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        this.cache[STORAGE_KEYS.NOTIFICATIONS] = INITIAL_NOTIFICATIONS;
      }
      if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
        this.cache[STORAGE_KEYS.COUPONS] = INITIAL_COUPONS;
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        const defaultSettings = { commissionRate: 8, gstRate: 12, deliveryFee: 45, freeDeliveryThreshold: 500 };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        this.cache[STORAGE_KEYS.SETTINGS] = defaultSettings;
      }
    } catch(err) {
      console.warn('DataStore init storage warning:', err);
    }
  }

  getOrLoad(key, fallback) {
    if (this.cache[key]) return this.cache[key];
    try {
      const val = localStorage.getItem(key);
      if (val && val !== 'undefined' && val !== 'null') {
        const parsed = JSON.parse(val);
        if (parsed !== null && parsed !== undefined) {
          this.cache[key] = parsed;
          return parsed;
        }
      }
    } catch(e) {}
    this.cache[key] = fallback;
    return fallback;
  }

  saveData(key, data) {
    this.cache[key] = data;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.storageDegraded = false;
      return true;
    } catch (e) {
      // Quota exhaustion used to fail silently, so the user kept working while
      // nothing persisted. Surface it once, clearly.
      console.warn('Storage write failed; data is held in memory only.', e);
      if (!this.storageDegraded) {
        this.storageDegraded = true;
        if (window.MediKartApp && window.MediKartApp.toast) {
          window.MediKartApp.toast(
            'Browser storage is full — changes are active for this session but will be lost on reload.',
            'warning'
          );
        }
      }
      return false;
    }
  }

  getMedicines() {
    let medicines = this.getOrLoad(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
    return Array.isArray(medicines) ? medicines : INITIAL_MEDICINES;
  }

  getDealers() {
    let dealers = this.getOrLoad(STORAGE_KEYS.DEALERS, INITIAL_DEALERS);
    return Array.isArray(dealers) && dealers.length > 0 ? dealers : INITIAL_DEALERS;
  }

  analyzePharmacyVerification(dealer) {
    if (!dealer) return { blockingIssues: [], warningIssues: [], passedChecks: [], overallStatus: 'BLOCKED' };

    const blockingIssues = [];
    const warningIssues = [];
    const passedChecks = [];

    // 1. BUSINESS IDENTITY
    if (!dealer.businessName) blockingIssues.push({ category: 'Business Identity', text: 'Pharmacy / Business Name is missing' });
    else passedChecks.push({ category: 'Business Identity', text: `Business Name: ${dealer.businessName}` });

    if (!dealer.ownerName && !dealer.name) blockingIssues.push({ category: 'Business Identity', text: 'Owner / Authorized Person name missing' });
    else passedChecks.push({ category: 'Business Identity', text: `Owner / Authorized Person: ${dealer.ownerName || dealer.name}` });

    if (!dealer.panNumber) blockingIssues.push({ category: 'Business Identity', text: 'Company PAN Card Number missing' });
    else passedChecks.push({ category: 'Business Identity', text: `PAN Card: ${dealer.panNumber}` });

    if (!dealer.gstNumber) warningIssues.push({ category: 'Business Identity', text: 'GSTIN Registration Number incomplete / missing' });
    else passedChecks.push({ category: 'Business Identity', text: `GSTIN: ${dealer.gstNumber}` });

    // 2. DRUG LICENCE
    if (!dealer.drugLicense) {
      blockingIssues.push({ category: 'Drug Licence', text: 'Statutory Drug License (Form 20B/21B) number is missing' });
    } else {
      passedChecks.push({ category: 'Drug Licence', text: `Drug License No: ${dealer.drugLicense}` });
    }

    if (dealer.expiryDate) {
      const exp = new Date(dealer.expiryDate);
      const now = new Date();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        blockingIssues.push({ category: 'Drug Licence', text: `Drug License expired on ${dealer.expiryDate}` });
      } else if (diffDays <= 60) {
        warningIssues.push({ category: 'Drug Licence', text: `Drug License expires soon in ${diffDays} days (${dealer.expiryDate})` });
      } else {
        passedChecks.push({ category: 'Drug Licence', text: `Drug License valid till ${dealer.expiryDate}` });
      }
    } else {
      blockingIssues.push({ category: 'Drug Licence', text: 'Drug License Expiry Date missing or unverified' });
    }

    if (dealer.licenseStatus === 'Mismatch' || dealer.licenseNameOnDoc) {
      warningIssues.push({ category: 'Drug Licence', text: `Business Application name ("${dealer.businessName}") differs from Document Name ("${dealer.licenseNameOnDoc || 'Statutory Name'}")` });
    }

    // 3. REGISTERED PHARMACIST
    if (!dealer.pharmacistName) {
      blockingIssues.push({ category: 'Registered Pharmacist', text: 'Registered Pharmacist name and credentials missing' });
    } else {
      passedChecks.push({ category: 'Registered Pharmacist', text: `Pharmacist: ${dealer.pharmacistName} (${dealer.qualification || 'B.Pharm'})` });
    }

    if (!dealer.pharmacistRegNo) {
      blockingIssues.push({ category: 'Registered Pharmacist', text: 'State Pharmacy Council Registration Number missing' });
    } else {
      passedChecks.push({ category: 'Registered Pharmacist', text: `State Pharmacy Council Reg #: ${dealer.pharmacistRegNo}` });
    }

    // 4. REQUIRED DOCUMENTS
    if (!dealer.docDrugLicense) blockingIssues.push({ category: 'Required Documents', text: 'Form 20B/21B Drug License copy document missing' });
    else passedChecks.push({ category: 'Required Documents', text: 'Drug License Document Attached' });

    if (!dealer.docPharmacistCert) blockingIssues.push({ category: 'Required Documents', text: 'Registered Pharmacist Certificate copy missing' });
    else passedChecks.push({ category: 'Required Documents', text: 'Pharmacist Certificate Attached' });

    if (!dealer.docGst) warningIssues.push({ category: 'Required Documents', text: 'GST Certificate document not attached' });
    else passedChecks.push({ category: 'Required Documents', text: 'GST Registration Certificate Attached' });

    // 5. MARKETPLACE COMPLIANCE
    if (!dealer.marketplaceRulesAccepted) {
      blockingIssues.push({ category: 'Marketplace Compliance', text: 'Marketplace Genuine Medicine & Safety Rules not accepted' });
    } else {
      passedChecks.push({ category: 'Marketplace Compliance', text: `Marketplace Compliance Rules Accepted (${dealer.acceptedDate || '2026-07-20'})` });
    }

    // Unresolved Serious Violations in Compliance History
    if (dealer.complianceHistory && Array.isArray(dealer.complianceHistory)) {
      const unresolvedHigh = dealer.complianceHistory.filter(h => h.severity === 'High' && h.status !== 'Resolved');
      if (unresolvedHigh.length > 0) {
        blockingIssues.push({ category: 'Marketplace Compliance', text: `Unresolved Serious Compliance Violation: ${unresolvedHigh[0].issue}` });
      }
      const unresolvedMedium = dealer.complianceHistory.filter(h => h.severity === 'Medium' && h.status !== 'Resolved');
      if (unresolvedMedium.length > 0) {
        warningIssues.push({ category: 'Marketplace Compliance', text: `Past Audit Warning: ${unresolvedMedium[0].issue}` });
      }
    }

    let overallStatus = 'ELIGIBLE';
    if (blockingIssues.length > 0) {
      overallStatus = 'BLOCKED';
    } else if (warningIssues.length > 0) {
      overallStatus = 'NEEDS_REVIEW';
    }

    return { blockingIssues, warningIssues, passedChecks, overallStatus };
  }
  getBuyers() {
    let buyers = this.getOrLoad(STORAGE_KEYS.BUYERS, INITIAL_BUYERS);
    if (!Array.isArray(buyers) || buyers.length < 50) {
      buyers = INITIAL_BUYERS;
      this.saveBuyers(INITIAL_BUYERS);
    }
    return buyers;
  }
  getOrders() {
    let orders = this.getOrLoad(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return Array.isArray(orders) ? orders : INITIAL_ORDERS;
  }
  
  getCart() {
    let cart = this.getOrLoad(STORAGE_KEYS.CART, []);
    if (!Array.isArray(cart)) cart = [];
    return cart.filter(item => item && typeof item === 'object').map(item => ({
      ...item,
      quantity: Math.max(1, parseInt(item.quantity) || 1),
      subtotal: (Math.max(1, parseInt(item.quantity) || 1)) * (parseFloat(item.pricePerUnit) || 0)
    }));
  }

  getWishlist() {
    let list = this.getOrLoad(STORAGE_KEYS.WISHLIST, INITIAL_WISHLIST);
    return Array.isArray(list) ? list : INITIAL_WISHLIST;
  }

  getNotifications() {
    let notifs = this.getOrLoad(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return Array.isArray(notifs) ? notifs : INITIAL_NOTIFICATIONS;
  }

  getCoupons() {
    let coupons = this.getOrLoad(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    return Array.isArray(coupons) ? coupons : INITIAL_COUPONS;
  }
  getSettings() { return this.getOrLoad(STORAGE_KEYS.SETTINGS, { commissionRate: 8, gstRate: 12, deliveryFee: 45, freeDeliveryThreshold: 500 }); }
  getCurrentUser() { return this.getOrLoad(STORAGE_KEYS.CURRENT_USER, { role: 'buyer', id: 'usr-501', name: 'Buyer' }); }

  saveMedicines(data) { this.saveData(STORAGE_KEYS.MEDICINES, data); }
  saveDealers(data) { this.saveData(STORAGE_KEYS.DEALERS, data); }
  saveBuyers(data) { this.saveData(STORAGE_KEYS.BUYERS, data); }
  saveOrders(data) { this.saveData(STORAGE_KEYS.ORDERS, data); }
  saveCart(data) { this.saveData(STORAGE_KEYS.CART, data); }
  saveWishlist(data) { this.saveData(STORAGE_KEYS.WISHLIST, data); }
  saveNotifications(data) { this.saveData(STORAGE_KEYS.NOTIFICATIONS, data); }
  saveCoupons(data) { this.saveData(STORAGE_KEYS.COUPONS, data); }
  saveSettings(data) { this.saveData(STORAGE_KEYS.SETTINGS, data); }
  setCurrentUser(user) { this.saveData(STORAGE_KEYS.CURRENT_USER, user); }

  /* --------------------------------------------------------------------------
     SESSION & ROLE-BASED DEMO AUTHENTICATION ENGINE

     NOTE ON SECURITY: this is a client-side prototype. Credentials live in the
     browser and are compared in plaintext, so this provides NO real security —
     anyone can read them from the page source. It exists only to demonstrate
     role-based routing. A production build must move authentication to a server
     with hashed passwords (bcrypt/argon2) and signed, httpOnly session cookies.
     -------------------------------------------------------------------------- */
  getSession() {
    return this.getOrLoad(STORAGE_KEYS.SESSION, null);
  }

  saveSession(sessionData) {
    this.saveData(STORAGE_KEYS.SESSION, sessionData);
  }

  clearSession() {
    this.cache[STORAGE_KEYS.SESSION] = null;
    try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch(e) {}
  }

  getDemoAccounts() {
    const dealers = this.getDealers();
    const named = id => {
      const d = dealers.find(x => x.id === id);
      return d ? { id: d.id, name: d.businessName, email: d.email } : null;
    };

    const accounts = [
      { email: 'buyer@medikart.com', password: 'buyer123', role: 'buyer', id: 'usr-501', name: 'Amit Sharma' },
      { email: 'admin@medikart.com', password: 'admin123', role: 'admin', id: 'admin-001', name: 'Super Admin' }
    ];

    // Dealer demo accounts are derived from the dealer records themselves, so
    // the name and id can never drift out of sync with the roster.
    ['dlr-101', 'dlr-103', 'dlr-104'].forEach(id => {
      const d = named(id);
      if (d) accounts.push({ email: d.email, password: 'dealer123', role: 'dealer', id: d.id, name: d.name, dealerId: d.id });
    });

    return accounts;
  }

  getDemoCredentialHint(role) {
    const accounts = this.getDemoAccounts();
    const match = accounts.find(a => a.role === role);
    return match ? { email: match.email, password: match.password } : null;
  }

  /* Blocks sign-in for pharmacies that are not permitted to trade. */
  checkDealerLoginEligibility(dealerId) {
    const dealer = this.getDealers().find(d => d.id === dealerId);
    if (!dealer) return { allowed: false, error: 'Pharmacy account not found.' };

    if (dealer.status === 'rejected') {
      return {
        allowed: false,
        error: `Access denied: this pharmacy application was rejected. ${dealer.adminRejectionReason || 'Contact platform support to appeal.'}`
      };
    }
    if (dealer.status === 'suspended') {
      return {
        allowed: false,
        error: 'Access denied: this pharmacy is currently suspended from the marketplace. Contact platform support.'
      };
    }
    // 'pending' and 'correction_required' may sign in — the dealer portal shows
    // them a restricted, read-only verification screen.
    return { allowed: true, dealer };
  }

  authenticate(email, password, requestedRole) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both an email address and a password.' };
    }

    let account = this.getDemoAccounts().find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      const dealers = this.getDealers();
      const dMatch = dealers.find(d => (d.email || '').toLowerCase() === cleanEmail);
      if (dMatch) {
        account = { email: dMatch.email, password: 'dealer123', role: 'dealer', id: dMatch.id, name: dMatch.businessName, dealerId: dMatch.id };
      }
    }

    if (!account) {
      const buyers = this.getBuyers();
      const bMatch = buyers.find(b => (b.email || '').toLowerCase() === cleanEmail);
      if (bMatch) {
        account = { email: bMatch.email, password: 'buyer123', role: 'buyer', id: bMatch.id, name: bMatch.name, buyerId: bMatch.id };
      }
    }

    // Generic message: do not reveal whether the address exists.
    if (!account || account.password !== cleanPass) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    if (account.role !== requestedRole) {
      return { success: false, error: `Account role mismatch: this user is registered as "${account.role.toUpperCase()}" but you selected the "${requestedRole.toUpperCase()}" tab.` };
    }

    if (account.role === 'dealer') {
      const eligibility = this.checkDealerLoginEligibility(account.id);
      if (!eligibility.allowed) return { success: false, error: eligibility.error };
    }

    const session = {
      role: account.role,
      id: account.id,
      name: account.name,
      email: account.email,
      dealerId: account.role === 'dealer' ? account.id : null,
      buyerId: account.role === 'buyer' ? account.id : null,
      loginTime: new Date().toISOString()
    };

    return { success: true, session };
  }

  /* Re-checks a restored session against current account state, so a pharmacy
     suspended while signed in cannot keep its dashboard open across a reload. */
  revalidateSession(session) {
    if (!session || !session.role) {
      return { success: false, error: null };
    }

    if (session.role === 'dealer') {
      const eligibility = this.checkDealerLoginEligibility(session.dealerId || session.id);
      if (!eligibility.allowed) return { success: false, error: eligibility.error };
    }

    if (session.role === 'buyer') {
      const exists = this.getBuyers().some(b => b.id === (session.buyerId || session.id));
      if (!exists) return { success: false, error: null };
    }

    return { success: true, session };
  }

  /* --------------------------------------------------------------------------
     DERIVED MARKETPLACE STATISTICS
     The landing page reads these instead of advertising hardcoded totals.
     -------------------------------------------------------------------------- */
  getMarketplaceStats() {
    const dealers = this.getDealers();
    const medicines = this.getMedicines();
    const orders = this.getOrders();
    const buyers = this.getBuyers();

    return {
      verifiedPharmacies: dealers.filter(d => d.status === 'approved').length,
      listedMedicines: medicines.filter(m => m.status === 'Approved').length,
      customers: buyers.length,
      ordersDelivered: orders.filter(o => o.status === 'Delivered').length
    };
  }

  /* --------------------------------------------------------------------------
     COMMISSION & TAX BASIS

     Platform commission applies to NET PRODUCT VALUE only (subtotal less
     discount). GST is collected on behalf of the tax authority and the delivery
     fee belongs to logistics — charging commission on either would be skimming
     money the platform never earned.
     -------------------------------------------------------------------------- */
  getCommissionableValue(order) {
    if (!order) return 0;
    const subtotal = Number(order.subtotal) || 0;
    const discount = Number(order.discount) || 0;
    return Math.max(0, subtotal - discount);
  }

  getCommissionRate() {
    const settings = this.getSettings();
    return Number(settings.commissionRate) || 8;
  }

  getGstRate() {
    const settings = this.getSettings();
    return Number(settings.gstRate) || 12;
  }

  calculateOrderCommission(order, rate = null) {
    const commRate = rate === null ? this.getCommissionRate() : rate;
    return Number((this.getCommissionableValue(order) * (commRate / 100)).toFixed(2));
  }

  /* Live per-dealer financials, computed from current orders. Seeded
     dealer.grossRevenue is only a starting snapshot; using it directly would
     drift as soon as new orders were placed. Returns a { dealerId: summary }
     map so callers can render a whole table from one pass over the orders. */
  getFinancialsByDealer(rate = null) {
    const commRate = rate === null ? this.getCommissionRate() : rate;
    const orders = this.getOrders();
    const grouped = {};

    orders.forEach(o => {
      // Multi-dealer orders are attributed to each seller's own sub-order.
      if (o.subOrders && Array.isArray(o.subOrders) && o.subOrders.length > 0) {
        o.subOrders.forEach(sub => {
          if (!grouped[sub.dealerId]) grouped[sub.dealerId] = [];
          grouped[sub.dealerId].push({
            status: sub.status,
            subtotal: sub.subtotal,
            discount: 0,
            gst: 0,
            deliveryFee: 0,
            grandTotal: sub.subtotal
          });
        });
        return;
      }
      if (!o.dealerId) return;
      if (!grouped[o.dealerId]) grouped[o.dealerId] = [];
      grouped[o.dealerId].push(o);
    });

    const result = {};
    Object.keys(grouped).forEach(dealerId => {
      result[dealerId] = this.summarizeOrderFinancials(grouped[dealerId], commRate);
    });
    return result;
  }

  getDealerFinancials(dealerId, rate = null) {
    const map = this.getFinancialsByDealer(rate);
    return map[dealerId] || this.summarizeOrderFinancials([], rate);
  }

  /* Aggregate commissionable value, commission and dealer payout for a set of
     orders. Every financial screen uses this so the numbers reconcile. */
  summarizeOrderFinancials(orders, rate = null) {
    const commRate = rate === null ? this.getCommissionRate() : rate;
    const list = Array.isArray(orders) ? orders : [];

    // Cancelled and refunded orders are not revenue.
    const billable = list.filter(o => {
      const s = (o.status || '').toLowerCase();
      return s !== 'cancelled' && s !== 'refunded';
    });

    const netProductValue = billable.reduce((sum, o) => sum + this.getCommissionableValue(o), 0);
    const grossCollected = billable.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const gstCollected = billable.reduce((sum, o) => sum + (Number(o.gst) || 0), 0);
    const deliveryCollected = billable.reduce((sum, o) => sum + (Number(o.deliveryFee) || 0), 0);
    const commission = netProductValue * (commRate / 100);

    return {
      orderCount: billable.length,
      commissionRate: commRate,
      netProductValue: Number(netProductValue.toFixed(2)),
      grossCollected: Number(grossCollected.toFixed(2)),
      gstCollected: Number(gstCollected.toFixed(2)),
      deliveryCollected: Number(deliveryCollected.toFixed(2)),
      platformCommission: Number(commission.toFixed(2)),
      dealerPayout: Number((netProductValue - commission).toFixed(2))
    };
  }

  /* --------------------------------------------------------------------------
     CONTROLLED ORDER STAGE SEQUENCE & MULTI-DEALER SUB-ORDER QUERIES
     -------------------------------------------------------------------------- */
  getOrderStages() {
    return ['Placed', 'Accepted', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  }

  getNextOrderStage(currentStage) {
    const stages = this.getOrderStages();
    const idx = stages.indexOf(currentStage);
    if (idx >= 0 && idx < stages.length - 1) return stages[idx + 1];
    return null;
  }

  isValidStageTransition(currentStage, nextStage) {
    const expected = this.getNextOrderStage(currentStage);
    return expected === nextStage;
  }

  getDealerOrders(dealerId) {
    const allOrders = this.getOrders();
    const dealerOrders = [];

    allOrders.forEach(ord => {
      if (ord.subOrders && Array.isArray(ord.subOrders) && ord.subOrders.length > 0) {
        // Multi-dealer parent order
        const sub = ord.subOrders.find(s => s.dealerId === dealerId);
        if (sub) {
          dealerOrders.push({
            id: sub.subOrderId || `${ord.id}-${dealerId}`,
            parentOrderId: ord.id,
            invoiceNumber: ord.invoiceNumber,
            buyerId: ord.buyerId,
            buyerName: ord.buyerName,
            buyerEmail: ord.buyerEmail,
            orderDate: ord.orderDate,
            dealerId: sub.dealerId,
            dealerName: sub.dealerName,
            items: sub.items,
            subtotal: sub.subtotal,
            grandTotal: sub.subtotal,
            paymentMethod: ord.paymentMethod,
            paymentStatus: ord.paymentStatus,
            status: sub.status || 'Placed',
            shippingAddress: ord.shippingAddress,
            timestamps: sub.timestamps || { Placed: ord.orderDate },
            isSubOrder: true
          });
        }
      } else if (ord.dealerId === dealerId) {
        dealerOrders.push(ord);
      }
    });

    return dealerOrders;
  }

  updateOrderStage(orderOrSubOrderId, newStage, dealerId) {
    const orders = this.getOrders();
    let targetOrd = null;
    let targetSub = null;

    for (let i = 0; i < orders.length; i++) {
      const o = orders[i];
      if (o.id === orderOrSubOrderId) {
        targetOrd = o;
        break;
      }
      if (o.subOrders && Array.isArray(o.subOrders)) {
        const s = o.subOrders.find(sub => sub.subOrderId === orderOrSubOrderId || (sub.dealerId === dealerId && `${o.id}-${dealerId}` === orderOrSubOrderId));
        if (s) {
          targetOrd = o;
          targetSub = s;
          break;
        }
      }
    }

    if (!targetOrd && !targetSub) return { success: false, error: 'Order not found.' };

    const currentStage = targetSub ? targetSub.status : targetOrd.status;
    if (!this.isValidStageTransition(currentStage, newStage)) {
      return { success: false, error: `Invalid status transition: Cannot change from "${currentStage}" to "${newStage}". Expected "${this.getNextOrderStage(currentStage) || 'Completed'}".` };
    }

    // Enforce Prescription Verification Blocking for Rx Orders
    const checkTarget = targetSub || targetOrd;
    const isRxRequired = checkTarget.rxStatus && checkTarget.rxStatus !== 'N/A';
    if (isRxRequired && checkTarget.rxStatus !== 'Verified' && ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(newStage)) {
      return {
        success: false,
        error: `Prescription Review Required: Prescription status is currently "${checkTarget.rxStatus}". Order fulfillment cannot proceed to "${newStage}" until prescription is verified by pharmacist.`
      };
    }

    const timeStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    if (targetSub) {
      targetSub.status = newStage;
      if (!targetSub.timestamps) targetSub.timestamps = {};
      targetSub.timestamps[newStage] = timeStr;

      // Re-evaluate parent order status
      const subStatuses = targetOrd.subOrders.map(s => s.status);
      if (subStatuses.every(st => st === 'Delivered')) targetOrd.status = 'Delivered';
      else if (subStatuses.every(st => st === 'Accepted')) targetOrd.status = 'Accepted';
      else targetOrd.status = newStage;
    } else {
      targetOrd.status = newStage;
      if (!targetOrd.timestamps) targetOrd.timestamps = {};
      targetOrd.timestamps[newStage] = timeStr;
    }

    this.saveOrders(orders);
    return { success: true, newStage };
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: COUPON VALIDATION & DISCOUNT CALCULATION
     -------------------------------------------------------------------------- */
  getRefunds() { return this.getOrLoad(STORAGE_KEYS.REFUNDS, []); }
  saveRefunds(data) { this.saveData(STORAGE_KEYS.REFUNDS, data); }

  getTickets() { return this.getOrLoad(STORAGE_KEYS.TICKETS, []); }
  saveTickets(data) { this.saveData(STORAGE_KEYS.TICKETS, data); }

  getReviews() { return this.getOrLoad(STORAGE_KEYS.REVIEWS, []); }
  saveReviews(data) { this.saveData(STORAGE_KEYS.REVIEWS, data); }

  validateCoupon(code, cart, subtotal) {
    if (!code || !code.trim()) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code.' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiry && coupon.expiry < today) {
      return { success: false, error: 'This coupon has expired.' };
    }

    const minOrder = coupon.minOrder || 0;
    if (subtotal < minOrder) {
      return { success: false, error: `Minimum order requirement of ₹${minOrder} not reached for coupon ${coupon.code}. Add ₹${(minOrder - subtotal).toFixed(2)} more to qualify.` };
    }

    // Category restriction check
    let eligibleItems = cart || [];
    if (coupon.category && coupon.category !== 'All') {
      eligibleItems = (cart || []).filter(item => item.therapeuticCategory === coupon.category);
      if (eligibleItems.length === 0) {
        return { success: false, error: `Coupon ${coupon.code} is only valid for "${coupon.category}" medicines.` };
      }
    }

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    if (eligibleSubtotal <= 0) {
      return { success: false, error: 'No eligible items in cart for this coupon.' };
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = (eligibleSubtotal * coupon.discountPercent) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.fixedAmount) {
      discount = Math.min(coupon.fixedAmount, eligibleSubtotal);
    }

    discount = Math.min(discount, subtotal);

    return {
      success: true,
      coupon,
      discount: Number(discount.toFixed(2)),
      eligibleSubtotal
    };
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: CENTRALIZED DELIVERY FEE CALCULATION
     -------------------------------------------------------------------------- */
  calculateDeliveryFee(subtotal, deliveryOption = 'standard') {
    const settings = this.getSettings();
    const standardFee = settings.deliveryFee !== undefined ? Number(settings.deliveryFee) : 45;
    const threshold = settings.freeDeliveryThreshold !== undefined ? Number(settings.freeDeliveryThreshold) : 500;
    const expressFee = settings.expressDeliveryFee !== undefined ? Number(settings.expressDeliveryFee) : 95;

    if (deliveryOption === 'express') return expressFee;
    if (subtotal >= threshold) return 0;
    return standardFee;
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: PRESCRIPTION VERIFICATION & REJECTION WORKFLOW
     -------------------------------------------------------------------------- */
  verifyOrderPrescription(orderOrSubOrderId, dealerId) {
    const orders = this.getOrders();
    let targetSub = null;
    let targetOrd = null;

    orders.forEach(ord => {
      if (ord.id === orderOrSubOrderId) targetOrd = ord;
      if (ord.subOrders && Array.isArray(ord.subOrders)) {
        const sub = ord.subOrders.find(s => s.subOrderId === orderOrSubOrderId || s.dealerId === dealerId);
        if (sub) {
          targetOrd = ord;
          targetSub = sub;
        }
      }
    });

    if (targetSub) {
      targetSub.rxStatus = 'Verified';
      targetSub.rxRejectionReason = null;
    }
    if (targetOrd) {
      targetOrd.rxStatus = 'Verified';
      targetOrd.rxRejectionReason = null;
    }

    // Add Buyer Notification
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      buyerId: (targetOrd || {}).buyerId,
      category: 'Prescription Verification',
      title: `Prescription Verified for Order #${orderOrSubOrderId}`,
      message: `Your uploaded prescription has been verified by the pharmacy. Order is now moving to packing.`,
      time: 'Just now',
      read: false
    });

    this.saveOrders(orders);
    this.saveNotifications(notifs);
    return { success: true };
  }

  rejectOrderPrescription(orderOrSubOrderId, dealerId, reason) {
    const orders = this.getOrders();
    let targetSub = null;
    let targetOrd = null;

    orders.forEach(ord => {
      if (ord.id === orderOrSubOrderId) targetOrd = ord;
      if (ord.subOrders && Array.isArray(ord.subOrders)) {
        const sub = ord.subOrders.find(s => s.subOrderId === orderOrSubOrderId || s.dealerId === dealerId);
        if (sub) {
          targetOrd = ord;
          targetSub = sub;
        }
      }
    });

    if (targetSub) {
      targetSub.rxStatus = 'Rejected';
      targetSub.rxRejectionReason = reason;
    }
    if (targetOrd) {
      targetOrd.rxStatus = 'Rejected';
      targetOrd.rxRejectionReason = reason;
    }

    // Add Buyer Notification
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      buyerId: (targetOrd || {}).buyerId,
      category: 'Prescription Verification',
      title: `Prescription Rejected for Order #${orderOrSubOrderId}`,
      message: `Prescription rejected by pharmacy: "${reason}". Order fulfillment is paused.`,
      time: 'Just now',
      read: false
    });

    this.saveOrders(orders);
    this.saveNotifications(notifs);
    return { success: true };
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: ORDER CANCELLATION & INVENTORY RESTORATION
     -------------------------------------------------------------------------- */
  cancelOrder(orderId, dealerId = null) {
    const orders = this.getOrders();
    const ordIndex = orders.findIndex(o => o.id === orderId || (o.subOrders && o.subOrders.some(s => s.subOrderId === orderId)));
    if (ordIndex === -1) return { success: false, error: 'Order not found.' };

    const ord = orders[ordIndex];
    let targetSub = null;

    if (ord.subOrders && Array.isArray(ord.subOrders)) {
      targetSub = ord.subOrders.find(s => s.subOrderId === orderId || (dealerId && s.dealerId === dealerId));
    }

    const currentStage = targetSub ? targetSub.status : ord.status;
    if (['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(currentStage)) {
      return { success: false, error: `Cancellation not allowed: Order is already in "${currentStage}" stage.` };
    }

    const itemsToRestore = targetSub ? targetSub.items : ord.items;

    // Restore Inventory Stock
    const allMeds = this.getMedicines();
    itemsToRestore.forEach(item => {
      const med = allMeds.find(m => m.id === (item.listingId || item.medicineId));
      if (med) {
        med.stock += item.quantity;
        if (!med.restockHistory) med.restockHistory = [];
        med.restockHistory.unshift({
          id: `rst-cancel-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          change: `+${item.quantity} ${med.packageUnit}`,
          type: 'Restock',
          stockAfter: med.stock,
          notes: `Restored from Order Cancellation #${orderId}`
        });
      }
    });
    this.saveMedicines(allMeds);

    const timeStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    if (targetSub) {
      targetSub.status = 'Cancelled';
      if (!targetSub.timestamps) targetSub.timestamps = {};
      targetSub.timestamps['Cancelled'] = timeStr;

      // Re-evaluate parent order status based on sub-orders
      const subStatuses = ord.subOrders.map(s => s.status);
      if (subStatuses.every(st => st === 'Cancelled')) {
        ord.status = 'Cancelled';
      } else if (subStatuses.every(st => st === 'Delivered' || st === 'Cancelled')) {
        ord.status = 'Partially Completed';
      } else {
        ord.status = 'Partially Cancelled';
      }
    } else {
      ord.status = 'Cancelled';
      if (ord.subOrders && Array.isArray(ord.subOrders)) {
        ord.subOrders.forEach(s => {
          if (!['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(s.status)) {
            s.status = 'Cancelled';
          }
        });
      }
      if (!ord.timestamps) ord.timestamps = {};
      ord.timestamps['Cancelled'] = timeStr;
    }

    // Add Buyer & Dealer Notifications
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-cancel-b-${Date.now()}`,
      buyerId: ord.buyerId,
      category: 'Order Cancellation',
      title: `Order #${orderId} Cancelled`,
      message: `Your order has been cancelled. If paid, your refund (REF-${Math.floor(800000+Math.random()*100000)}) is processing.`,
      time: 'Just now',
      read: false
    });

    if (ord.dealerId) {
      notifs.unshift({
        id: `notif-cancel-d-${Date.now()}`,
        dealerId: ord.dealerId,
        category: 'Order Cancellation',
        title: `Customer Cancelled Order #${orderId}`,
        message: `Order #${orderId} was cancelled by buyer. Inventory stock restored.`,
        time: 'Just now',
        read: false
      });
    }

    this.saveOrders(orders);
    this.saveNotifications(notifs);
    return { success: true };
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: REFUND REQUEST WORKFLOW
     -------------------------------------------------------------------------- */
  requestRefund(orderId, buyerId, reason, notes, evidenceFileName = null) {
    const refunds = this.getRefunds();
    const orders = this.getOrders();
    const ord = orders.find(o => o.id === orderId);

    const refId = `REF-${Math.floor(800000 + Math.random() * 100000)}`;

    const newRefund = {
      id: refId,
      orderId,
      buyerId,
      dealerId: ord ? ord.dealerId : null,
      dealerName: ord ? ord.dealerName : 'Marketplace Seller',
      reason,
      notes,
      evidenceFileName,
      amount: ord ? ord.grandTotal : 0,
      status: 'Requested',
      requestedAt: new Date().toISOString()
    };

    refunds.unshift(newRefund);
    this.saveRefunds(refunds);

    if (ord) {
      ord.refundStatus = 'Requested';
      ord.refundId = refId;
      this.saveOrders(orders);
    }

    return { success: true, refund: newRefund };
  }

  /* --------------------------------------------------------------------------
     PROMPT 2: PERSISTENT SUPPORT TICKETS & CHAT
     -------------------------------------------------------------------------- */
  createSupportTicket(buyerId, category, subject, description, orderId = null) {
    const tickets = this.getTickets();
    const tkId = `TK-${Math.floor(89000 + Math.random() * 10000)}`;

    const newTicket = {
      id: tkId,
      buyerId,
      category,
      subject,
      description,
      orderId,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    this.saveTickets(tickets);
    return { success: true, ticket: newTicket };
  }
  /* --------------------------------------------------------------------------
     PROMPT 3: AUDIT LOG, PAYOUTS & PLATFORM OVERVIEW HELPERS
     -------------------------------------------------------------------------- */
  getAuditLogs() { return this.getOrLoad(STORAGE_KEYS.AUDIT_LOGS, []); }
  saveAuditLogs(data) { this.saveData(STORAGE_KEYS.AUDIT_LOGS, data); }

  getPayouts() { return this.getOrLoad(STORAGE_KEYS.PAYOUTS, []); }
  savePayouts(data) { this.saveData(STORAGE_KEYS.PAYOUTS, data); }

  logAudit(action, entity, targetId, reason = null, adminId = 'admin-001') {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}`,
      action,
      entity,
      targetId,
      reason,
      adminId,
      actorRole: 'admin',
      timestamp: new Date().toISOString()
    });
    this.saveAuditLogs(logs);
  }

  // Seller/dealer-side activity log — same ledger as platform audit, scoped by dealerId
  // so each seller only ever sees their own actions (restocks, listing edits, profile changes...).
  logDealerAudit(action, entity, targetId, details = null, dealerId = null, actorName = null) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      entity,
      targetId,
      reason: details,
      actorRole: 'dealer',
      dealerId,
      actorName,
      timestamp: new Date().toISOString()
    });
    this.saveAuditLogs(logs);
  }

  getDealerAuditLogs(dealerId) {
    return this.getAuditLogs().filter(l => l.actorRole === 'dealer' && l.dealerId === dealerId);
  }

  updateDealerStatus(dealerId, status, reason = null) {
    const dealers = this.getDealers();
    const dealer = dealers.find(d => d.id === dealerId);
    if (!dealer) return { success: false, error: 'Dealer not found.' };

    dealer.status = status;
    if (reason) dealer.statusReason = reason;
    dealer.statusUpdatedAt = new Date().toISOString();

    this.saveDealers(dealers);
    this.logAudit(`Dealer Status Updated: ${status.toUpperCase()}`, 'Dealer', dealerId, reason);

    // Notify Dealer
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-dlr-status-${Date.now()}`,
      dealerId: dealerId,
      category: 'Account Status Update',
      title: `Pharmacy Account Status: ${status.toUpperCase()}`,
      message: `Your pharmacy dealer account status was updated to "${status.toUpperCase()}". ${reason ? 'Reason: ' + reason : ''}`,
      time: 'Just now',
      read: false
    });
    this.saveNotifications(notifs);

    return { success: true, dealer };
  }

  updateRefundStatus(refundId, newStatus, reason = null) {
    const refunds = this.getRefunds();
    const ref = refunds.find(r => r.id === refundId);
    if (!ref) return { success: false, error: 'Refund request not found.' };

    ref.status = newStatus;
    if (reason) ref.adminReason = reason;
    ref.updatedAt = new Date().toISOString();
    if (newStatus === 'Refunded') ref.settlementRef = `REF-${Math.floor(800000 + Math.random()*100000)}`;

    this.saveRefunds(refunds);
    this.logAudit(`Refund Request ${newStatus.toUpperCase()}`, 'Refund', refundId, reason);

    // Notify Buyer
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-ref-status-${Date.now()}`,
      buyerId: ref.buyerId,
      category: 'Refund Request Update',
      title: `Refund Request #${refundId}: ${newStatus}`,
      message: `Your refund request for Order #${ref.orderId} was updated to "${newStatus}". ${reason ? 'Note: ' + reason : ''}`,
      time: 'Just now',
      read: false
    });
    this.saveNotifications(notifs);

    return { success: true, refund: ref };
  }

  updateTicketStatus(ticketId, newStatus, responseText = null) {
    const tickets = this.getTickets();
    const tk = tickets.find(t => t.id === ticketId);
    if (!tk) return { success: false, error: 'Support ticket not found.' };

    tk.status = newStatus;
    if (responseText) {
      if (!tk.responses) tk.responses = [];
      tk.responses.push({
        responder: 'Admin Patient Care Desk',
        text: responseText,
        timestamp: new Date().toISOString()
      });
    }
    tk.updatedAt = new Date().toISOString();

    this.saveTickets(tickets);
    this.logAudit(`Support Ticket ${newStatus.toUpperCase()}`, 'Ticket', ticketId, responseText);
    return { success: true, ticket: tk };
  }

  calculateDealerEligiblePayout(dealerId) {
    const orders = this.getDealerOrders(dealerId);
    const settings = this.getSettings();
    const commRate = settings.commissionRate !== undefined ? Number(settings.commissionRate) : 8;

    // Filter only completed, delivered & non-refunded orders
    const eligibleOrders = orders.filter(o => o.status === 'Delivered' && o.paymentStatus !== 'Failed' && o.refundStatus !== 'Refunded');

    const grossSales = eligibleOrders.reduce((sum, o) => sum + (o.subtotal || o.grandTotal || 0), 0);
    const platformCommission = (grossSales * commRate) / 100;
    const netPayout = Math.max(0, grossSales - platformCommission);

    return {
      grossSales: Number(grossSales.toFixed(2)),
      platformCommission: Number(platformCommission.toFixed(2)),
      netPayout: Number(netPayout.toFixed(2)),
      eligibleOrdersCount: eligibleOrders.length,
      commissionRate: commRate
    };
  }

  /* --------------------------------------------------------------------------
     SCOPED DEMO RESET
     Replaces localStorage.clear(), which wiped every key for the whole origin
     including data belonging to other apps served from it.
     -------------------------------------------------------------------------- */
  resetDemoData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      try { localStorage.removeItem(key); } catch (e) {}
    });
    this.cache = {};
    this.storageDegraded = false;
    this.init();
    return { success: true };
  }
}

window.MediKartData = new DataStore();
window.MEDICINE_TYPES = MEDICINE_TYPES;
window.THERAPEUTIC_CATEGORIES = THERAPEUTIC_CATEGORIES;
