export type UserRole = "admin" | "client";

export interface Profile {
  id: string;
  role: UserRole;
  theme?: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  photo_url?: string;
  cover_url?: string;
  welcome_email_sent_at?: string;
  admin_notes?: string;
  status?: string;
  created_at: string;
}

export type DocumentType = "contract" | "welcome" | "invoice";

export interface Document {
  id: string;
  client_id: string;
  type: DocumentType;
  title: string;
  file_url?: string;
  content?: string; // JSON for invoice details
  seen_by_client?: boolean;
  signed?: boolean;
  signature_data?: string;
  signed_at?: string;
  created_at: string;
}

export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "paused";

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export type DeliverableStatus = "pending" | "in_progress" | "review" | "completed";

export interface Deliverable {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: DeliverableStatus;
  order_index: number;
  scheduled_date?: string | null;
  client_approved?: boolean | null;
  client_feedback?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  client_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  seen_by_client?: boolean;
  uploaded_by?: "admin" | "client";
  created_at: string;
}

export type ReferralStatus = "pending" | "contacted" | "converted" | "rejected";

export interface Referral {
  id: string;
  client_id: string;
  referred_name: string;
  referred_email: string;
  referred_phone?: string;
  referred_company?: string;
  notes?: string;
  status: ReferralStatus;
  created_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  sender_id: string;
  sender_role: UserRole;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  read: boolean;
  created_at: string;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  concept: string;
  payment_method?: string;
  status: PaymentStatus;
  reference_number?: string;
  notes?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  pago_token?: string;
  comprobante_url?: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  completed: boolean;
  created_at: string;
}

export type NotificationType =
  | "contract_signed"
  | "message_received"
  | "referral_submitted"
  | "testimonial_submitted"
  | "payment_overdue"
  | "payment_received"
  | "file_uploaded"
  | "cuestionario_completed"
  | "deliverable_approved";

export type EtapaProspecto =
  | "nuevo"
  | "cuestionario_enviado"
  | "cuestionario_completado"
  | "en_negociacion"
  | "cerrado_ganado"
  | "cerrado_perdido";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  client_id?: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_id: string;
  rating: number;
  title: string;
  content: string;
  is_approved: boolean;
  is_published: boolean;
  submitted_at: string;
}

export interface Tarea {
  id: string;
  client_id?: string;
  analisis_id?: string;
  texto: string;
  completada: boolean;
  fecha_limite?: string;
  created_at: string;
}
