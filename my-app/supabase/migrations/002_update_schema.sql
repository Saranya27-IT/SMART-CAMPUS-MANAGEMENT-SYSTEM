-- ============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM — COMPREHENSIVE SCHEMA UPDATE MIGRATION
-- Module Focus: Bus Management, Hostel Management, Mess Management
-- Run this in your Supabase SQL Editor to update all missing columns & tables.
-- ============================================================================

-- 1. PROFILES TABLE UPDATES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'HOSTELLER';

-- 2. BUS MANAGEMENT MODULE UPDATES
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS registration_number TEXT UNIQUE;
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES public.bus_routes(id) ON DELETE SET NULL;
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS starting_area TEXT;
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS destination TEXT;

ALTER TABLE public.bus_routes ADD COLUMN IF NOT EXISTS starting_area TEXT;
ALTER TABLE public.bus_routes ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.bus_routes ADD COLUMN IF NOT EXISTS college TEXT DEFAULT 'K.S.R. College';
ALTER TABLE public.bus_routes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

ALTER TABLE public.bus_stops ADD COLUMN IF NOT EXISTS sequence_number INT;
ALTER TABLE public.bus_stops ADD COLUMN IF NOT EXISTS expected_arrival_time TEXT;
ALTER TABLE public.bus_stops ADD COLUMN IF NOT EXISTS expected_departure_time TEXT;
ALTER TABLE public.bus_stops ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.student_bus_assignments ADD COLUMN IF NOT EXISTS bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.bus_complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Breakdown','Engine','Tyre','Brake','Electrical','AC','Accident','Other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','REJECTED')),
  admin_remarks TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HOSTEL MANAGEMENT MODULE UPDATES
ALTER TABLE public.hostel_complaints ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.hostel_complaints ADD COLUMN IF NOT EXISTS admin_remarks TEXT;

CREATE TABLE IF NOT EXISTS public.room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES public.hostel_beds(id) ON DELETE CASCADE,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deallocated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','TERMINATED','TRANSFERRED'))
);

-- 4. MESS MANAGEMENT MODULE UPDATES
CREATE TABLE IF NOT EXISTS public.mess_complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Food Quality','Hygiene','Service','Shortage','Staff Behavior','Other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','REJECTED')),
  admin_remarks TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.bus_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_complaints ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bus_complaints_all') THEN
    CREATE POLICY "bus_complaints_all" ON public.bus_complaints FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'room_allocations_all') THEN
    CREATE POLICY "room_allocations_all" ON public.room_allocations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mess_complaints_all') THEN
    CREATE POLICY "mess_complaints_all" ON public.mess_complaints FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
