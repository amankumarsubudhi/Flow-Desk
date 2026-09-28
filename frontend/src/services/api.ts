import {
  AuditLog,
  Invoice,
  NotificationItem,
  PartItem,
  Priority,
  ServiceCategory,
  ServiceRequest,
  ServiceStatus,
  TechnicianProfile,
  User,
  UserRole,
  WorkReport,
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('flowdesk_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Not JSON response
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ----------------- Auth API -----------------

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  return request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}): Promise<{ token: string; user: User }> {
  return request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetCurrentUser(): Promise<User> {
  return request<User>('/auth/me');
}

export async function apiGetUsers(): Promise<User[]> {
  return request<User[]>('/auth/users');
}

// ----------------- Categories API -----------------

export async function apiGetCategories(activeOnly = false): Promise<ServiceCategory[]> {
  const raw = await request<any[]>(`/categories?activeOnly=${activeOnly}`);
  return raw.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    icon: c.icon || 'Wrench',
    isActive: c.active !== undefined ? c.active : true,
    baseCharge: c.baseCharge || 500,
  }));
}

export async function apiCreateCategory(data: {
  name: string;
  description: string;
  icon?: string;
  baseCharge: number;
  active?: boolean;
}): Promise<ServiceCategory> {
  const raw = await request<any>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    icon: raw.icon || 'Wrench',
    isActive: raw.active !== undefined ? raw.active : true,
    baseCharge: raw.baseCharge || 500,
  };
}

export async function apiToggleCategory(id: string): Promise<ServiceCategory> {
  const raw = await request<any>(`/categories/${id}/toggle`, {
    method: 'PATCH',
  });
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    icon: raw.icon || 'Wrench',
    isActive: raw.active !== undefined ? raw.active : true,
    baseCharge: raw.baseCharge || 500,
  };
}

// ----------------- Technicians API -----------------

export async function apiGetTechnicians(): Promise<TechnicianProfile[]> {
  const raw = await request<any[]>('/technicians');
  return raw.map((t) => ({
    id: t.id,
    userId: t.user?.id || '',
    name: t.user?.name || 'Technician',
    email: t.user?.email || '',
    phone: t.user?.phone || '',
    avatar: t.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skills: Array.isArray(t.skillCategoryIds) ? t.skillCategoryIds : Array.from(t.skillCategoryIds || []),
    isAvailable: t.available !== undefined ? t.available : true,
    rating: t.rating ?? 5.0,
    completedJobsCount: t.completedJobsCount ?? 0,
    currentLocation: t.currentLocation || 'City Center',
  }));
}

// ----------------- Service Requests API -----------------

function transformRequest(r: any): ServiceRequest {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    categoryId: r.category?.id || '',
    categoryName: r.category?.name || 'General',
    customerId: r.customer?.id || '',
    customerName: r.customer?.name || 'Customer',
    customerPhone: r.customer?.phone || '+1 (555) 000-0000',
    address: r.address || '',
    priority: r.priority as Priority,
    preferredDate: r.preferredDate || '',
    preferredTimeWindow: r.preferredTimeWindow || '',
    status: r.status as ServiceStatus,
    assignedTechnicianId: r.assignedTechnician?.id || undefined,
    assignedTechnicianName: r.assignedTechnician?.user?.name || undefined,
    appointmentDate: r.appointmentDate || undefined,
    appointmentTimeWindow: r.appointmentTimeWindow || undefined,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
    workReport: r.workReport
      ? {
          id: r.workReport.id,
          requestId: r.id,
          problemIdentified: r.workReport.problemIdentified,
          workPerformed: r.workReport.workPerformed,
          partsUsed: (r.workReport.partsUsed || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity || 1,
            unitCost: p.unitCost || 0,
          })),
          laborCost: r.workReport.laborCost || 0,
          additionalCharges: r.workReport.additionalCharges || 0,
          serviceCharge: r.invoice?.serviceCharge || 500,
          subtotal: r.invoice?.subtotal || 0,
          taxRate: r.invoice?.taxRate || 0.18,
          taxAmount: r.invoice?.taxAmount || 0,
          totalAmount: r.invoice?.totalAmount || 0,
          notes: r.workReport.notes || '',
          beforeImages: r.workReport.beforeImages || [],
          afterImages: r.workReport.afterImages || [],
          completedAt: r.workReport.completedAt || new Date().toISOString(),
        }
      : undefined,
    invoice: r.invoice
      ? {
          id: r.invoice.id,
          requestId: r.id,
          serviceCharge: r.invoice.serviceCharge || 0,
          partsTotal: r.invoice.partsTotal || 0,
          laborTotal: r.invoice.laborTotal || 0,
          additionalCharges: r.invoice.additionalCharges || 0,
          subtotal: r.invoice.subtotal || 0,
          taxRate: r.invoice.taxRate || 0.18,
          taxAmount: r.invoice.taxAmount || 0,
          totalAmount: r.invoice.totalAmount || 0,
          status: r.invoice.status || 'PENDING',
          paidAt: r.invoice.paidAt,
          paymentMethod: r.invoice.paymentMethod,
        }
      : undefined,
    disputeReason: r.disputeReason,
    customerRating: r.ratingScore
      ? {
          score: r.ratingScore,
          comment: r.ratingComment || '',
          submittedAt: r.updatedAt || new Date().toISOString(),
        }
      : undefined,
    attachments: [],
  };
}

export async function apiGetRequests(): Promise<ServiceRequest[]> {
  const raw = await request<any[]>('/requests');
  return raw.map(transformRequest);
}

export async function apiGetRequestById(id: string): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${id}`);
  return transformRequest(raw);
}

export async function apiCreateRequest(data: {
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  address: string;
  preferredDate: string;
  preferredTimeWindow: string;
}): Promise<ServiceRequest> {
  const raw = await request<any>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return transformRequest(raw);
}

export async function apiAssignTechnician(
  requestId: string,
  technicianId: string,
  appointmentDate: string,
  appointmentTimeWindow: string
): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ technicianId, appointmentDate, appointmentTimeWindow }),
  });
  return transformRequest(raw);
}

export async function apiRespondAssignment(
  requestId: string,
  accept: boolean,
  reason?: string
): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ accept, reason }),
  });
  return transformRequest(raw);
}

export async function apiUpdateRequestStatus(
  requestId: string,
  status: ServiceStatus,
  reason?: string
): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
  return transformRequest(raw);
}

export async function apiSubmitWorkReport(
  requestId: string,
  report: {
    problemIdentified: string;
    workPerformed: string;
    partsUsed: PartItem[];
    laborCost: number;
    additionalCharges: number;
    notes?: string;
    beforeImages?: string[];
    afterImages?: string[];
  }
): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/work-report`, {
    method: 'POST',
    body: JSON.stringify(report),
  });
  return transformRequest(raw);
}

export async function apiConfirmWork(
  requestId: string,
  confirm: boolean,
  disputeReason?: string,
  ratingScore?: number,
  ratingComment?: string
): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ confirm, disputeReason, ratingScore, ratingComment }),
  });
  return transformRequest(raw);
}

export async function apiPayInvoice(requestId: string, paymentMethod: string): Promise<ServiceRequest> {
  const raw = await request<any>(`/requests/${requestId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
  });
  return transformRequest(raw);
}

// ----------------- Audit Logs & Notifications API -----------------

export async function apiGetAuditLogs(): Promise<AuditLog[]> {
  const raw = await request<any[]>('/audit-logs');
  return raw.map((l) => ({
    id: l.id,
    actorId: l.actorId,
    actorName: l.actorName,
    actorRole: l.actorRole as UserRole,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    fromState: l.fromState,
    toState: l.toState,
    details: l.details,
    timestamp: l.timestamp,
  }));
}

export async function apiGetNotifications(): Promise<NotificationItem[]> {
  const raw = await request<any[]>('/notifications');
  return raw.map((n) => ({
    id: n.id,
    userId: n.userId,
    targetRole: n.targetRole,
    title: n.title,
    message: n.message,
    requestId: n.requestId,
    type: n.type || 'INFO',
    isRead: n.isRead || false,
    createdAt: n.createdAt,
  }));
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await request<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await request<void>('/notifications/read-all', { method: 'PATCH' });
}

// ----------------- Admin User Management API -----------------

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
}

export async function apiGetStaffUsers(): Promise<StaffUser[]> {
  return request<StaffUser[]>('/admin/users');
}

export async function apiCreateStaffUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'TECHNICIAN' | 'DISPATCHER';
  phone?: string;
}): Promise<StaffUser> {
  return request<StaffUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateStaffUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'TECHNICIAN' | 'DISPATCHER';
    phone?: string;
  }
): Promise<StaffUser> {
  return request<StaffUser>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiToggleStaffUserActive(id: string): Promise<StaffUser> {
  return request<StaffUser>(`/admin/users/${id}/toggle`, {
    method: 'PATCH',
  });
}
