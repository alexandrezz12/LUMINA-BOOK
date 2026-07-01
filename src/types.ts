export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  brandColor: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  ownerEmail?: string;
  plan?: 'Starter' | 'Professional' | 'Enterprise';
  subscriptionStatus?: 'active_trial' | 'active_subscribed' | 'trial_expired';
  trialStartDate?: string;
  defaultLanguage?: 'pt' | 'en' | 'es';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  enabled: boolean;
  createdAt: string;
}

export interface WorkingHour {
  start: string; // e.g., "09:00"
  end: string;   // e.g., "17:00"
  active: boolean;
}

export interface WorkingHours {
  [key: string]: WorkingHour; // monday, tuesday, etc.
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  workingHours: WorkingHours;
  assignedServices: string[]; // array of serviceIds
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  dateTime: string; // ISO format
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid';
  paymentAmount: number;
  notes: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  appointmentId: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}
