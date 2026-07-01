import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;
let lastUsedUrl: string | null = null;
let lastUsedKey: string | null = null;

export function getSupabase(forceReload = false) {
  const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!rawUrl || !rawKey) {
    supabaseClient = null;
    lastUsedUrl = null;
    lastUsedKey = null;
    return null;
  }

  // Sanitizing URL to prevent PGRST125 ("Invalid path specified in request URL") errors
  let url = rawUrl.trim();
  
  // 1. If user accidentally pasted Supabase dashboard URL
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    url = `https://${dashboardMatch[1]}.supabase.co`;
  } else {
    // 2. Remove trailing slashes
    url = url.replace(/\/+$/, "");
    // 3. Remove /rest/v1 if the user appended it
    url = url.replace(/\/rest\/v1\/?$/, "");
    // 4. Ensure it has https:// protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
  }

  const key = rawKey.trim();

  // Recreate client if url/key changed, or if forced
  if (supabaseClient && !forceReload && url === lastUsedUrl && key === lastUsedKey) {
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(url, key);
    lastUsedUrl = url;
    lastUsedKey = key;
    return supabaseClient;
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    return null;
  }
}

// SQL Schema Helper instructions for the merchant to create tables in Supabase
export const SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor to match the Luminabook data structure!

-- SE VOCÊ RECEBER UM ERRO DE TIPO INCOMPATÍVEL (UUID vs TEXT), DESCOMENTE A LINHA ABAIXO PARA APAGAR AS TABELAS ANTIGAS E RECRIAR CORRETAMENTE:
-- DROP TABLE IF EXISTS public.appointments, public.staff, public.services, public.customers, public.businesses CASCADE;

-- 1. Create Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY, -- Supports text string IDs from auth providers
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#000000',
    slug TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    owner_email TEXT,
    plan TEXT DEFAULT 'Starter',
    subscription_status TEXT DEFAULT 'active_trial',
    trial_start_date TEXT,
    default_language TEXT DEFAULT 'pt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    working_hours JSONB NOT NULL,
    assigned_services TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    staff_name TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    payment_amount NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access policies (Can be customized as needed)
CREATE POLICY "Allow public read access to businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read access to staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Allow public read access to appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to customers" ON public.customers FOR SELECT USING (true);

-- Allow all operations for management
CREATE POLICY "Allow management on businesses" ON public.businesses FOR ALL USING (true);
CREATE POLICY "Allow management on services" ON public.services FOR ALL USING (true);
CREATE POLICY "Allow management on staff" ON public.staff FOR ALL USING (true);
CREATE POLICY "Allow management on appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow management on customers" ON public.customers FOR ALL USING (true);
`;
