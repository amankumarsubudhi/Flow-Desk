import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  UserRole,
  WorkReport,
} from '../types';
import { useAuth } from './AuthContext';
import {
  apiGetRequests,
  apiGetCategories,
  apiGetTechnicians,
  apiGetAuditLogs,
  apiGetNotifications,
  apiCreateRequest,
  apiAssignTechnician,
  apiRespondAssignment,
  apiUpdateRequestStatus,
  apiSubmitWorkReport,
  apiConfirmWork,
  apiPayInvoice,
  apiCreateCategory,
  apiToggleCategory,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../services/api';

interface OperationsContextType {
  requests: ServiceRequest[];
  categories: ServiceCategory[];
  technicians: TechnicianProfile[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  // Actions
  createServiceRequest: (params: {
    title: string;
    description: string;
    categoryId: string;
    priority: Priority;
    address: string;
    preferredDate: string;
    preferredTimeWindow: string;
  }) => Promise<{ success: boolean; message: string; request?: ServiceRequest }>;
  assignTechnician: (
    requestId: string,
    technicianId: string,
    appointmentDate: string,
    appointmentTimeWindow: string
  ) => Promise<{ success: boolean; message: string }>;
  technicianRespondAssignment: (
    requestId: string,
    action: 'ACCEPT' | 'REJECT',
    reason?: string
  ) => Promise<{ success: boolean; message: string }>;
  updateRequestStatus: (
    requestId: string,
    toStatus: ServiceStatus,
    reason?: string
  ) => Promise<{ success: boolean; message: string }>;
  submitWorkReport: (
    requestId: string,
    reportData: {
      problemIdentified: string;
      workPerformed: string;
      partsUsed: PartItem[];
      laborCost: number;
      additionalCharges: number;
      notes: string;
      beforeImages?: string[];
      afterImages?: string[];
    }
  ) => Promise<{ success: boolean; message: string }>;
  customerConfirmWork: (
    requestId: string,
    action: 'CONFIRM' | 'DISPUTE',
    details?: { disputeReason?: string; ratingScore?: number; ratingComment?: string }
  ) => Promise<{ success: boolean; message: string }>;
  processPayment: (
    requestId: string,
    paymentMethod: string
  ) => Promise<{ success: boolean; message: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addCategory: (category: Omit<ServiceCategory, 'id'>) => Promise<{ success: boolean; message: string }>;
  toggleCategoryStatus: (id: string) => Promise<void>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [reqs, cats, techs, logs, notifs] = await Promise.allSettled([
        apiGetRequests(),
        apiGetCategories(),
        apiGetTechnicians(),
        apiGetAuditLogs(),
        apiGetNotifications(),
      ]);

      if (reqs.status === 'fulfilled') setRequests(reqs.value);
      if (cats.status === 'fulfilled') setCategories(cats.value);
      if (techs.status === 'fulfilled') setTechnicians(techs.value);
      if (logs.status === 'fulfilled') setAuditLogs(logs.value);
      if (notifs.status === 'fulfilled') setNotifications(notifs.value);
    } catch (err) {
      console.error('Failed to refresh data from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser && token) {
      refreshData();
    } else {
      setRequests([]);
      setCategories([]);
      setTechnicians([]);
      setAuditLogs([]);
      setNotifications([]);
    }
  }, [currentUser, token, refreshData]);

  // 1. Create Service Request
  const createServiceRequest = async (params: {
    title: string;
    description: string;
    categoryId: string;
    priority: Priority;
    address: string;
    preferredDate: string;
    preferredTimeWindow: string;
  }) => {
    try {
      const created = await apiCreateRequest(params);
      await refreshData();
      return {
        success: true,
        message: `Service Request #${created.id} submitted successfully.`,
        request: created,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to create service request.',
      };
    }
  };

  // 2. Assign Technician
  const assignTechnician = async (
    requestId: string,
    technicianId: string,
    appointmentDate: string,
    appointmentTimeWindow: string
  ) => {
    try {
      const updated = await apiAssignTechnician(requestId, technicianId, appointmentDate, appointmentTimeWindow);
      await refreshData();
      return {
        success: true,
        message: `Technician assigned to #${updated.id} successfully.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to assign technician.',
      };
    }
  };

  // 3. Technician Respond Assignment
  const technicianRespondAssignment = async (
    requestId: string,
    action: 'ACCEPT' | 'REJECT',
    reason?: string
  ) => {
    try {
      await apiRespondAssignment(requestId, action === 'ACCEPT', reason);
      await refreshData();
      return {
        success: true,
        message: action === 'ACCEPT' ? 'Assignment accepted.' : 'Assignment declined.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to respond to assignment.',
      };
    }
  };

  // 4. Update Request Status (State Machine)
  const updateRequestStatus = async (
    requestId: string,
    toStatus: ServiceStatus,
    reason?: string
  ) => {
    try {
      await apiUpdateRequestStatus(requestId, toStatus, reason);
      await refreshData();
      return {
        success: true,
        message: `Request status updated to ${toStatus}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to transition status.',
      };
    }
  };

  // 5. Submit Work Report
  const submitWorkReport = async (
    requestId: string,
    reportData: {
      problemIdentified: string;
      workPerformed: string;
      partsUsed: PartItem[];
      laborCost: number;
      additionalCharges: number;
      notes: string;
      beforeImages?: string[];
      afterImages?: string[];
    }
  ) => {
    try {
      await apiSubmitWorkReport(requestId, reportData);
      await refreshData();
      return {
        success: true,
        message: 'Work report and invoice generated successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to submit work report.',
      };
    }
  };

  // 6. Customer Confirm Work
  const customerConfirmWork = async (
    requestId: string,
    action: 'CONFIRM' | 'DISPUTE',
    details?: { disputeReason?: string; ratingScore?: number; ratingComment?: string }
  ) => {
    try {
      await apiConfirmWork(
        requestId,
        action === 'CONFIRM',
        details?.disputeReason,
        details?.ratingScore,
        details?.ratingComment
      );
      await refreshData();
      return {
        success: true,
        message:
          action === 'CONFIRM'
            ? 'Service confirmed successfully! Please proceed with payment.'
            : 'Dispute submitted. A dispatcher will review your case.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to submit confirmation/dispute.',
      };
    }
  };

  // 7. Process Payment
  const processPayment = async (requestId: string, paymentMethod: string) => {
    try {
      await apiPayInvoice(requestId, paymentMethod);
      await refreshData();
      return {
        success: true,
        message: 'Payment settled successfully! Service request closed.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to settle payment.',
      };
    }
  };

  // 8. Categories
  const addCategory = async (categoryData: Omit<ServiceCategory, 'id'>) => {
    try {
      await apiCreateCategory({
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        baseCharge: categoryData.baseCharge,
        active: categoryData.isActive,
      });
      await refreshData();
      return { success: true, message: 'Category added successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to add category.' };
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    try {
      await apiToggleCategory(id);
      await refreshData();
    } catch (err) {
      console.error('Failed to toggle category:', err);
    }
  };

  // 9. Notifications
  const markNotificationRead = async (id: string) => {
    try {
      await apiMarkNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiMarkAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <OperationsContext.Provider
      value={{
        requests,
        categories,
        technicians,
        auditLogs,
        notifications,
        unreadNotificationCount,
        isLoading,
        refreshData,
        createServiceRequest,
        assignTechnician,
        technicianRespondAssignment,
        updateRequestStatus,
        submitWorkReport,
        customerConfirmWork,
        processPayment,
        markNotificationRead,
        markAllNotificationsRead,
        addCategory,
        toggleCategoryStatus,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
