export const ROLES = ["STUDENT", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** Staff and admins can open the admin console; only admins manage users. */
export const CONSOLE_ROLES: Role[] = ["STAFF", "ADMIN"];

export const CAMPUSES = ["WESTERN", "EASTERN"] as const;
export type Campus = (typeof CAMPUSES)[number];
export const CAMPUS_LABEL: Record<Campus, string> = {
  WESTERN: "Western Campus",
  EASTERN: "Eastern Campus",
};

export const SHOP_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"] as const;
export type ShopStatus = (typeof SHOP_STATUSES)[number];

export const SHOP_CATEGORIES = [
  "Business Centre",
  "Food & Catering",
  "Retail",
  "Services",
  "Kiosk",
] as const;

export const SHOP_APP_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ALLOCATED"] as const;
export type ShopAppStatus = (typeof SHOP_APP_STATUSES)[number];

export const REG_STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED"] as const;
export type RegStatus = (typeof REG_STATUSES)[number];

export const PAYMENT_STATUSES = ["UNPAID", "AWAITING_VERIFICATION", "PAID"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PROGRAMME_CATEGORIES = ["ELEARNING", "SUMMER"] as const;
export type ProgrammeCategory = (typeof PROGRAMME_CATEGORIES)[number];
export const PROGRAMME_CATEGORY_LABEL: Record<ProgrammeCategory, string> = {
  ELEARNING: "E-Learning",
  SUMMER: "Summer Computer Programme",
};

export const CONTACT_CATEGORIES = [
  "General Enquiry",
  "Shop Allocation",
  "Programmes",
  "Career Guidance",
  "Training Workshop",
  "Facility Booking",
  "Consultancy",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ALLOCATED: "Allocated",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  UNPAID: "Unpaid",
  AWAITING_VERIFICATION: "Awaiting Verification",
  PAID: "Paid",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const BANK_DETAILS = {
  bank: "First Bank of Nigeria Plc",
  accountName: "MOAU Makurdi Consultancy Services",
  accountNumber: "0000000000",
  note: "Use your registration reference as the transfer narration.",
};
