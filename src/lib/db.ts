import { db } from "./firebase";
import { getSupabase } from "./supabase";
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  collection,
  query,
  where
} from "firebase/firestore";
import { Business, Service, Staff, Appointment, Customer } from "../types";

// Helper to convert snake_case (Supabase) keys to camelCase (JS/React)
function toCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (typeof obj === 'object') {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      const camel = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      n[camel] = toCamel(obj[k]);
    }
    return n;
  }
  return obj;
}

// Helper to convert camelCase (JS/React) keys to snake_case (Supabase)
function toSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (typeof obj === 'object') {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      // Avoid converting id to snake case or already snake-case keys
      if (k === 'id' || k === 'createdAt') {
        const snakeKey = k === 'createdAt' ? 'created_at' : k;
        n[snakeKey] = toSnake(obj[k]);
        continue;
      }
      const snake = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      n[snake] = toSnake(obj[k]);
    }
    return n;
  }
  return obj;
}

export function isSupabaseActive(): boolean {
  return !!getSupabase();
}

// --- Businesses Database Methods ---

export async function getBusiness(id: string): Promise<Business | null> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching business from Supabase:", id);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("[DB] Supabase business fetch error:", error);
      throw error;
    }
    return data ? toCamel(data) as Business : null;
  } else {
    console.log("[DB] Fetching business from Firestore:", id);
    const bSnap = await getDoc(doc(db, "businesses", id));
    return bSnap.exists() ? { id: bSnap.id, ...bSnap.data() } as Business : null;
  }
}

export async function saveBusiness(id: string, business: Partial<Business>): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Saving business in Supabase:", id, business);
    const snakeData = toSnake(business);

    // 1. Check if the business already exists
    const { data: existing, error: fetchError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error("[DB] Supabase business check existing error:", fetchError);
    }

    if (existing) {
      // 2. If it exists, perform a partial update
      const { error } = await supabase
        .from('businesses')
        .update(snakeData)
        .eq('id', id);

      if (error) {
        console.error("[DB] Supabase business update error:", error);
        throw error;
      }
    } else {
      // 3. If it doesn't exist, perform a full insert with safe fallbacks for required fields
      const insertData = {
        id,
        owner_id: id,
        name: business.name || "Estúdio",
        slug: business.slug || id.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        ...snakeData
      };
      
      const { error } = await supabase
        .from('businesses')
        .insert(insertData);

      if (error) {
        console.error("[DB] Supabase business insert error:", error);
        throw error;
      }
    }
  } else {
    console.log("[DB] Saving business in Firestore:", id, business);
    const bRef = doc(db, "businesses", id);
    await setDoc(bRef, business, { merge: true });
  }
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching business by slug from Supabase:", slug);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error("[DB] Supabase fetch by slug error:", error);
      throw error;
    }
    return data ? toCamel(data) as Business : null;
  } else {
    console.log("[DB] Fetching business by slug from Firestore:", slug);
    const q = query(collection(db, "businesses"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Business;
    }
    return null;
  }
}

export async function checkSlugTaken(slug: string, currentUserId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug);

    if (error) {
      console.error("[DB] Supabase check slug taken error:", error);
      return false;
    }
    return data ? data.some(d => d.id !== currentUserId) : false;
  } else {
    const q = query(collection(db, "businesses"), where("slug", "==", slug));
    const slugSnap = await getDocs(q);
    return slugSnap.docs.some(d => d.id !== currentUserId);
  }
}

// --- Services Database Methods ---

export async function getServices(businessId: string): Promise<Service[]> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching services from Supabase for:", businessId);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error("[DB] Supabase services fetch error:", error);
      throw error;
    }
    return data ? (toCamel(data) as Service[]) : [];
  } else {
    console.log("[DB] Fetching services from Firestore for:", businessId);
    const sSnap = await getDocs(collection(db, "businesses", businessId, "services"));
    return sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
  }
}

export async function addService(businessId: string, service: Omit<Service, 'id'>): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Adding service to Supabase:", service);
    const snakeData = toSnake(service);
    const { data, error } = await supabase
      .from('services')
      .insert({ business_id: businessId, ...snakeData })
      .select('id')
      .single();

    if (error) {
      console.error("[DB] Supabase service insert error:", error);
      throw error;
    }
    return data.id;
  } else {
    console.log("[DB] Adding service to Firestore:", service);
    const added = await addDoc(collection(db, "businesses", businessId, "services"), service);
    return added.id;
  }
}

export async function updateService(businessId: string, serviceId: string, service: Partial<Service>): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Updating service in Supabase:", serviceId, service);
    const snakeData = toSnake(service);
    const { error } = await supabase
      .from('services')
      .update(snakeData)
      .eq('id', serviceId);

    if (error) {
      console.error("[DB] Supabase service update error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Updating service in Firestore:", serviceId);
    await updateDoc(doc(db, "businesses", businessId, "services", serviceId), service);
  }
}

export async function deleteService(businessId: string, serviceId: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Deleting service from Supabase:", serviceId);
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      console.error("[DB] Supabase service delete error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Deleting service from Firestore:", serviceId);
    await deleteDoc(doc(db, "businesses", businessId, "services", serviceId));
  }
}

// --- Staff Database Methods ---

export async function getStaff(businessId: string): Promise<Staff[]> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching staff from Supabase for:", businessId);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error("[DB] Supabase staff fetch error:", error);
      throw error;
    }
    return data ? (toCamel(data) as Staff[]) : [];
  } else {
    console.log("[DB] Fetching staff from Firestore for:", businessId);
    const stSnap = await getDocs(collection(db, "businesses", businessId, "staff"));
    return stSnap.docs.map(d => ({ id: d.id, ...d.data() } as Staff));
  }
}

export async function addStaff(businessId: string, staff: Omit<Staff, 'id'>): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Adding staff to Supabase:", staff);
    const snakeData = toSnake(staff);
    const { data, error } = await supabase
      .from('staff')
      .insert({ business_id: businessId, ...snakeData })
      .select('id')
      .single();

    if (error) {
      console.error("[DB] Supabase staff insert error:", error);
      throw error;
    }
    return data.id;
  } else {
    console.log("[DB] Adding staff to Firestore:", staff);
    const added = await addDoc(collection(db, "businesses", businessId, "staff"), staff);
    return added.id;
  }
}

export async function updateStaff(businessId: string, staffId: string, staff: Partial<Staff>): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Updating staff in Supabase:", staffId, staff);
    const snakeData = toSnake(staff);
    const { error } = await supabase
      .from('staff')
      .update(snakeData)
      .eq('id', staffId);

    if (error) {
      console.error("[DB] Supabase staff update error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Updating staff in Firestore:", staffId);
    await updateDoc(doc(db, "businesses", businessId, "staff", staffId), staff);
  }
}

export async function deleteStaff(businessId: string, staffId: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Deleting staff from Supabase:", staffId);
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (error) {
      console.error("[DB] Supabase staff delete error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Deleting staff from Firestore:", staffId);
    await deleteDoc(doc(db, "businesses", businessId, "staff", staffId));
  }
}

// --- Appointments Database Methods ---

export async function getAppointments(businessId: string): Promise<Appointment[]> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching appointments from Supabase for:", businessId);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error("[DB] Supabase appointments fetch error:", error);
      throw error;
    }
    return data ? (toCamel(data) as Appointment[]) : [];
  } else {
    console.log("[DB] Fetching appointments from Firestore for:", businessId);
    const appSnap = await getDocs(collection(db, "businesses", businessId, "appointments"));
    return appSnap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
  }
}

export async function addAppointment(businessId: string, appointment: Omit<Appointment, 'id'>): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Adding appointment to Supabase:", appointment);
    const snakeData = toSnake(appointment);
    const { data, error } = await supabase
      .from('appointments')
      .insert({ business_id: businessId, ...snakeData })
      .select('id')
      .single();

    if (error) {
      console.error("[DB] Supabase appointment insert error:", error);
      throw error;
    }
    return data.id;
  } else {
    console.log("[DB] Adding appointment to Firestore:", appointment);
    const added = await addDoc(collection(db, "businesses", businessId, "appointments"), appointment);
    return added.id;
  }
}

export async function updateAppointmentStatus(
  businessId: string, 
  appointmentId: string, 
  status: string, 
  paymentStatus?: string
): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Updating appointment in Supabase:", appointmentId, { status, paymentStatus });
    const updates: any = { status };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }
    const { error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId);

    if (error) {
      console.error("[DB] Supabase appointment update error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Updating appointment in Firestore:", appointmentId);
    const updates: any = { status };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await updateDoc(doc(db, "businesses", businessId, "appointments", appointmentId), updates);
  }
}

// --- Customers Database Methods ---

export async function getCustomers(businessId: string): Promise<Customer[]> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching customers from Supabase for:", businessId);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error("[DB] Supabase customers fetch error:", error);
      throw error;
    }
    return data ? (toCamel(data) as Customer[]) : [];
  } else {
    console.log("[DB] Fetching customers from Firestore for:", businessId);
    const custSnap = await getDocs(collection(db, "businesses", businessId, "customers"));
    return custSnap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
  }
}

export async function addCustomer(businessId: string, customer: Omit<Customer, 'id'>): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Adding customer to Supabase:", customer);
    const snakeData = toSnake(customer);
    const { data, error } = await supabase
      .from('customers')
      .insert({ business_id: businessId, ...snakeData })
      .select('id')
      .single();

    if (error) {
      console.error("[DB] Supabase customer insert error:", error);
      throw error;
    }
    return data.id;
  } else {
    console.log("[DB] Adding customer to Firestore:", customer);
    const added = await addDoc(collection(db, "businesses", businessId, "customers"), customer);
    return added.id;
  }
}

export async function updateCustomerNotes(businessId: string, customerId: string, notes: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Updating customer notes in Supabase:", customerId);
    const { error } = await supabase
      .from('customers')
      .update({ notes })
      .eq('id', customerId);

    if (error) {
      console.error("[DB] Supabase customer update error:", error);
      throw error;
    }
  } else {
    console.log("[DB] Updating customer notes in Firestore:", customerId);
    const cRef = doc(db, "businesses", businessId, "customers", customerId);
    await updateDoc(cRef, { notes });
  }
}

export async function getAllBusinesses(): Promise<Business[]> {
  const supabase = getSupabase();
  if (supabase) {
    console.log("[DB] Fetching all businesses from Supabase");
    const { data, error } = await supabase
      .from('businesses')
      .select('*');

    if (error) {
      console.error("[DB] Supabase all businesses fetch error:", error);
      throw error;
    }
    return data ? (toCamel(data) as Business[]) : [];
  } else {
    console.log("[DB] Fetching all businesses from Firestore");
    const querySnapshot = await getDocs(collection(db, "businesses"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
  }
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  details?: string;
  tables: {
    businesses: boolean;
    services: boolean;
    staff: boolean;
    appointments: boolean;
    customers: boolean;
  };
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: "Supabase keys not found in environment.",
      tables: { businesses: false, services: false, staff: false, appointments: false, customers: false }
    };
  }

  const tables = {
    businesses: false,
    services: false,
    staff: false,
    appointments: false,
    customers: false
  };

  try {
    // 1. Test businesses
    const bRes = await supabase.from('businesses').select('id').limit(1);
    if (!bRes.error) {
      tables.businesses = true;
    } else {
      console.warn("[TEST] businesses table fail:", bRes.error);
    }

    // 2. Test services
    const sRes = await supabase.from('services').select('id').limit(1);
    if (!sRes.error) {
      tables.services = true;
    } else {
      console.warn("[TEST] services table fail:", sRes.error);
    }

    // 3. Test staff
    const stRes = await supabase.from('staff').select('id').limit(1);
    if (!stRes.error) {
      tables.staff = true;
    } else {
      console.warn("[TEST] staff table fail:", stRes.error);
    }

    // 4. Test appointments
    const aRes = await supabase.from('appointments').select('id').limit(1);
    if (!aRes.error) {
      tables.appointments = true;
    } else {
      console.warn("[TEST] appointments table fail:", aRes.error);
    }

    // 5. Test customers
    const cRes = await supabase.from('customers').select('id').limit(1);
    if (!cRes.error) {
      tables.customers = true;
    } else {
      console.warn("[TEST] customers table fail:", cRes.error);
    }

    const allOk = tables.businesses && tables.services && tables.staff && tables.appointments && tables.customers;

    if (allOk) {
      return {
        success: true,
        message: "Conexão de banco estabelecida e todas as 5 tabelas estão criadas e prontas!",
        tables
      };
    } else {
      const missing = [];
      if (!tables.businesses) missing.push("businesses");
      if (!tables.services) missing.push("services");
      if (!tables.staff) missing.push("staff");
      if (!tables.appointments) missing.push("appointments");
      if (!tables.customers) missing.push("customers");

      const errorMsg = bRes.error?.message || sRes.error?.message || stRes.error?.message || aRes.error?.message || cRes.error?.message || "";

      return {
        success: false,
        message: `Conectado ao Supabase, mas faltam tabelas no banco: ${missing.join(', ')}. Certifique-se de colar o script SQL abaixo no SQL Editor do seu Supabase e rodá-lo.`,
        tables,
        details: errorMsg
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Erro crítico de rede ou credenciais incorretas ao conectar: ${err.message || String(err)}`,
      tables,
      details: String(err)
    };
  }
}

