export type ThemeMode = 'orange' | 'white' | 'purple' | 'green';

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ServiceStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED_BY_TECHNICIAN'
  | 'SCHEDULED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'DISPUTED'
  | 'REOPENED'
  | 'CANCELLED'
  | 'CLOSED'
  | 'REFUNDED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  baseCharge: number;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  skills: string[]; // category IDs or names
  isAvailable: boolean;
  rating: number;
  completedJobsCount: number;
  currentLocation: string;
}

export interface PartItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface WorkReport {
  id: string;
  requestId: string;
  problemIdentified: string;
  workPerformed: string;
  partsUsed: PartItem[];
  laborCost: number;
  additionalCharges: number;
  serviceCharge: number;
  subtotal: number;
  taxRate: number; // e.g. 0.18
  taxAmount: number;
  totalAmount: number;
  notes: string;
  beforeImages: string[];
  afterImages: string[];
  completedAt: string;
}

export interface Invoice {
  id: string;
  requestId: string;
  serviceCharge: number;
  partsTotal: number;
  laborTotal: number;
  additionalCharges: number;
  subtotal: number;
  taxRate: number; // 0.18
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  paymentMethod?: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  priority: Priority;
  preferredDate: string;
  preferredTimeWindow: string;
  status: ServiceStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  appointmentDate?: string;
  appointmentTimeWindow?: string;
  createdAt: string;
  updatedAt: string;
  workReport?: WorkReport;
  invoice?: Invoice;
  disputeReason?: string;
  customerRating?: {
    score: number;
    comment: string;
    submittedAt: string;
  };
  attachments: {
    id: string;
    name: string;
    url: string;
    type: 'CUSTOMER_ATTACHMENT' | 'BEFORE_IMAGE' | 'AFTER_IMAGE' | 'RECEIPT' | 'DOCUMENT';
  }[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  fromState?: string;
  toState?: string;
  details: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole: UserRole | 'ALL';
  title: string;
  message: string;
  requestId?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}
