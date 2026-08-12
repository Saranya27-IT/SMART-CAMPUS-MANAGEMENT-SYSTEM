-- ============================================================
-- SMART CAMPUS MANAGEMENT SYSTEM
-- Phase 1 — Full Database Schema + RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 1: CORE TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN (
                    'super_admin','student','faculty','librarian',
                    'event_organizer','bus_driver','hostel_warden','mess_manager'
                  )),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  department      TEXT,
  roll_number     TEXT UNIQUE,     -- Students only
  employee_id     TEXT UNIQUE,     -- Staff only
  gender          TEXT CHECK (gender IN ('male','female','other')),
  date_of_birth   DATE,
  address         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_roll_number ON public.profiles(roll_number) WHERE roll_number IS NOT NULL;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN (
                'library','event','bus','hostel','mess','system','general'
              )),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = FALSE;

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- SECTION 2: LIBRARY MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.book_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_authors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_publishers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.books (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn            TEXT UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  cover_url       TEXT,
  category_id     UUID REFERENCES public.book_categories(id) ON DELETE SET NULL,
  author_id       UUID REFERENCES public.book_authors(id) ON DELETE SET NULL,
  publisher_id    UUID REFERENCES public.book_publishers(id) ON DELETE SET NULL,
  publication_year INT,
  edition         TEXT,
  total_copies    INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
  available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  location_shelf  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_books_title ON public.books USING gin(title gin_trgm_ops);
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_books_author ON public.books(author_id);
CREATE TRIGGER books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.book_copies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id     UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  copy_number TEXT NOT NULL,
  qr_code     TEXT UNIQUE,
  status      TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','borrowed','damaged','lost')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, copy_number)
);
CREATE INDEX idx_book_copies_book ON public.book_copies(book_id);
CREATE INDEX idx_book_copies_status ON public.book_copies(status);

CREATE TABLE IF NOT EXISTS public.book_borrows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  copy_id         UUID NOT NULL REFERENCES public.book_copies(id) ON DELETE RESTRICT,
  book_id         UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  librarian_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  borrow_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE NOT NULL,
  return_date     DATE,
  renewal_count   INT NOT NULL DEFAULT 0,
  fine_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  fine_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed','returned','overdue','lost')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_borrows_student ON public.book_borrows(student_id);
CREATE INDEX idx_borrows_copy ON public.book_borrows(copy_id);
CREATE INDEX idx_borrows_status ON public.book_borrows(status);
CREATE INDEX idx_borrows_due_date ON public.book_borrows(due_date) WHERE status = 'borrowed';
CREATE TRIGGER borrows_updated_at BEFORE UPDATE ON public.book_borrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECTION 3: EVENTS MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  color       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT NOT NULL,
  description             TEXT,
  category_id             UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  organizer_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  venue                   TEXT NOT NULL,
  start_time              TIMESTAMPTZ NOT NULL,
  end_time                TIMESTAMPTZ NOT NULL,
  capacity                INT NOT NULL DEFAULT 100,
  registration_deadline   TIMESTAMPTZ,
  banner_url              TEXT,
  status                  TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN (
                            'draft','upcoming','ongoing','completed','cancelled'
                          )),
  is_public               BOOLEAN NOT NULL DEFAULT TRUE,
  allow_faculty           BOOLEAN NOT NULL DEFAULT TRUE,
  certificate_template    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id            UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended            BOOLEAN NOT NULL DEFAULT FALSE,
  attended_at         TIMESTAMPTZ,
  certificate_issued  BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_url     TEXT,
  qr_code             TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  UNIQUE(event_id, user_id)
);
CREATE INDEX idx_event_reg_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_reg_user ON public.event_registrations(user_id);

-- ============================================================
-- SECTION 4: BUS MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.buses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_number      TEXT NOT NULL UNIQUE,
  capacity        INT NOT NULL DEFAULT 50,
  model           TEXT,
  driver_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER buses_updated_at BEFORE UPDATE ON public.buses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.bus_routes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bus_stops (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id    UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  stop_order  INT NOT NULL,
  latitude    NUMERIC(10,7),
  longitude   NUMERIC(10,7),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, stop_order)
);
CREATE INDEX idx_bus_stops_route ON public.bus_stops(route_id);

CREATE TABLE IF NOT EXISTS public.student_bus_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id    UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE RESTRICT,
  stop_id     UUID REFERENCES public.bus_stops(id) ON DELETE SET NULL,
  valid_from  DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS public.bus_trips (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id      UUID NOT NULL REFERENCES public.buses(id) ON DELETE RESTRICT,
  route_id    UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE RESTRICT,
  driver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  trip_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  trip_type   TEXT NOT NULL CHECK (trip_type IN ('morning','evening','special')),
  start_time  TIMESTAMPTZ,
  end_time    TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
                'scheduled','in_progress','completed','cancelled'
              )),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_trips_driver ON public.bus_trips(driver_id);
CREATE INDEX idx_trips_date ON public.bus_trips(trip_date DESC);
CREATE TRIGGER trips_updated_at BEFORE UPDATE ON public.bus_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECTION 5: HOSTEL MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hostels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('male','female','mixed')),
  warden_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER hostels_updated_at BEFORE UPDATE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.hostel_blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id   UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hostel_id, name)
);

CREATE TABLE IF NOT EXISTS public.hostel_floors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id      UUID NOT NULL REFERENCES public.hostel_blocks(id) ON DELETE CASCADE,
  floor_number  INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(block_id, floor_number)
);

CREATE TABLE IF NOT EXISTS public.hostel_rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  floor_id    UUID NOT NULL REFERENCES public.hostel_floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity    INT NOT NULL DEFAULT 2,
  type        TEXT NOT NULL DEFAULT 'shared' CHECK (type IN ('single','shared','dormitory')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(floor_id, room_number)
);
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.hostel_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.hostel_beds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id     UUID NOT NULL REFERENCES public.hostel_rooms(id) ON DELETE CASCADE,
  bed_number  TEXT NOT NULL,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  allocated_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, bed_number)
);
CREATE INDEX idx_beds_student ON public.hostel_beds(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX idx_beds_room ON public.hostel_beds(room_id);
CREATE TRIGGER beds_updated_at BEFORE UPDATE ON public.hostel_beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent double allocation: a student can only occupy one bed
CREATE UNIQUE INDEX idx_beds_unique_student ON public.hostel_beds(student_id)
  WHERE student_id IS NOT NULL AND status = 'occupied';

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id       UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  warden_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  warden_remark   TEXT,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leave_student ON public.leave_requests(student_id);
CREATE INDEX idx_leave_hostel ON public.leave_requests(hostel_id);
CREATE TRIGGER leave_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.hostel_complaints (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id   UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN (
                'maintenance','cleanliness','food','security','noise','other'
              )),
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER hostel_complaints_updated_at BEFORE UPDATE ON public.hostel_complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.hostel_attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id   UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','on_leave')),
  marked_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);
CREATE INDEX idx_hostel_att_student ON public.hostel_attendance(student_id);
CREATE INDEX idx_hostel_att_date ON public.hostel_attendance(date DESC);

CREATE TABLE IF NOT EXISTS public.hostel_fees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id   UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,   -- e.g. "2025-01", "2025-Q1"
  amount      NUMERIC(10,2) NOT NULL,
  paid        BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at     TIMESTAMPTZ,
  due_date    DATE,
  receipt_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, period)
);
CREATE TRIGGER hostel_fees_updated_at BEFORE UPDATE ON public.hostel_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECTION 6: MESS MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mess_menus (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','snacks','dinner')),
  items       JSONB NOT NULL DEFAULT '[]',   -- Array of menu item strings
  manager_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, meal_type)
);
CREATE INDEX idx_mess_menu_date ON public.mess_menus(date DESC);
CREATE TRIGGER mess_menus_updated_at BEFORE UPDATE ON public.mess_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.mess_attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','snacks','dinner')),
  present     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date, meal_type)
);
CREATE INDEX idx_mess_att_student ON public.mess_attendance(student_id);
CREATE INDEX idx_mess_att_date ON public.mess_attendance(date DESC);

CREATE TABLE IF NOT EXISTS public.mess_feedback (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','snacks','dinner')),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date, meal_type)
);
CREATE INDEX idx_mess_feedback_date ON public.mess_feedback(date DESC);

CREATE TABLE IF NOT EXISTS public.mess_complaints (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'quality' CHECK (category IN (
                'quality','hygiene','quantity','service','other'
              )),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER mess_complaints_updated_at BEFORE UPDATE ON public.mess_complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECTION 7: AUTH TRIGGER (auto-create profile on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 8: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_complaints ENABLE ROW LEVEL SECURITY;

-- ── Helper function to get current user's role ──────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── PROFILES ─────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR get_my_role() IN ('super_admin','librarian','event_organizer','hostel_warden','mess_manager'));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_super_admin" ON public.profiles
  FOR INSERT WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "profiles_all_super_admin" ON public.profiles
  FOR ALL USING (get_my_role() = 'super_admin');

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_any_auth" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── AUDIT LOGS ──────────────────────────────────────────────────────────────
CREATE POLICY "audit_select_super_admin" ON public.audit_logs
  FOR SELECT USING (get_my_role() = 'super_admin');

CREATE POLICY "audit_insert_any_auth" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── LIBRARY: READ-ONLY for everyone, FULL for librarian/super_admin ──────────
CREATE POLICY "books_select_all" ON public.books
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "books_manage_librarian" ON public.books
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "book_categories_select" ON public.book_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "book_categories_manage" ON public.book_categories
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "book_authors_select" ON public.book_authors
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "book_authors_manage" ON public.book_authors
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "book_publishers_select" ON public.book_publishers
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "book_publishers_manage" ON public.book_publishers
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "book_copies_select" ON public.book_copies
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "book_copies_manage" ON public.book_copies
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "borrows_select_own" ON public.book_borrows
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('librarian','super_admin'));

CREATE POLICY "borrows_manage_librarian" ON public.book_borrows
  FOR ALL USING (get_my_role() IN ('librarian','super_admin'));

-- ── EVENTS ────────────────────────────────────────────────────────────────────
CREATE POLICY "event_categories_select" ON public.event_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "event_categories_manage" ON public.event_categories
  FOR ALL USING (get_my_role() IN ('event_organizer','super_admin'));

CREATE POLICY "events_select_public" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_manage_organizer" ON public.events
  FOR ALL USING (organizer_id = auth.uid() OR get_my_role() = 'super_admin');

CREATE POLICY "event_reg_select_own" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid() OR get_my_role() IN ('event_organizer','super_admin'));

CREATE POLICY "event_reg_insert_self" ON public.event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_reg_update_organizer" ON public.event_registrations
  FOR UPDATE USING (get_my_role() IN ('event_organizer','super_admin'));

-- ── BUS ───────────────────────────────────────────────────────────────────────
CREATE POLICY "buses_select_all" ON public.buses
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "buses_manage_admin" ON public.buses
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "routes_select_all" ON public.bus_routes
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "routes_manage_admin" ON public.bus_routes
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "stops_select_all" ON public.bus_stops
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stops_manage_admin" ON public.bus_stops
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "assignments_select_own" ON public.student_bus_assignments
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'super_admin');
CREATE POLICY "assignments_manage_admin" ON public.student_bus_assignments
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "trips_select_all" ON public.bus_trips
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trips_manage_driver" ON public.bus_trips
  FOR ALL USING (driver_id = auth.uid() OR get_my_role() = 'super_admin');

-- ── HOSTEL ────────────────────────────────────────────────────────────────────
CREATE POLICY "hostels_select_all" ON public.hostels
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "hostels_manage_warden" ON public.hostels
  FOR ALL USING (warden_id = auth.uid() OR get_my_role() = 'super_admin');

CREATE POLICY "blocks_select_all" ON public.hostel_blocks
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "blocks_manage_warden" ON public.hostel_blocks
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "floors_select_all" ON public.hostel_floors
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "floors_manage_warden" ON public.hostel_floors
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "rooms_select_all" ON public.hostel_rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rooms_manage_warden" ON public.hostel_rooms
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "beds_select_own_or_warden" ON public.hostel_beds
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('hostel_warden','super_admin'));
CREATE POLICY "beds_manage_warden" ON public.hostel_beds
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "leave_select_own_or_warden" ON public.leave_requests
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('hostel_warden','super_admin'));
CREATE POLICY "leave_insert_student" ON public.leave_requests
  FOR INSERT WITH CHECK (student_id = auth.uid() AND get_my_role() = 'student');
CREATE POLICY "leave_update_warden" ON public.leave_requests
  FOR UPDATE USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "hcomplaints_select_own_or_warden" ON public.hostel_complaints
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('hostel_warden','super_admin'));
CREATE POLICY "hcomplaints_insert_student" ON public.hostel_complaints
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "hcomplaints_update_warden" ON public.hostel_complaints
  FOR UPDATE USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "hatt_select_own_or_warden" ON public.hostel_attendance
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('hostel_warden','super_admin'));
CREATE POLICY "hatt_manage_warden" ON public.hostel_attendance
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

CREATE POLICY "hfees_select_own" ON public.hostel_fees
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('hostel_warden','super_admin'));
CREATE POLICY "hfees_manage_warden" ON public.hostel_fees
  FOR ALL USING (get_my_role() IN ('hostel_warden','super_admin'));

-- ── MESS ──────────────────────────────────────────────────────────────────────
CREATE POLICY "menus_select_all" ON public.mess_menus
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "menus_manage_mess_manager" ON public.mess_menus
  FOR ALL USING (get_my_role() IN ('mess_manager','super_admin'));

CREATE POLICY "matt_select_own" ON public.mess_attendance
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('mess_manager','super_admin'));
CREATE POLICY "matt_manage_manager" ON public.mess_attendance
  FOR ALL USING (get_my_role() IN ('mess_manager','super_admin'));

CREATE POLICY "mfeedback_select_own" ON public.mess_feedback
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('mess_manager','super_admin'));
CREATE POLICY "mfeedback_insert_student" ON public.mess_feedback
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "mcomplaints_select_own" ON public.mess_complaints
  FOR SELECT USING (student_id = auth.uid() OR get_my_role() IN ('mess_manager','super_admin'));
CREATE POLICY "mcomplaints_insert_student" ON public.mess_complaints
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "mcomplaints_update_manager" ON public.mess_complaints
  FOR UPDATE USING (get_my_role() IN ('mess_manager','super_admin'));

-- ============================================================
-- SECTION 9: SEED DATA (Basic categories for reference)
-- ============================================================
INSERT INTO public.book_categories (name) VALUES
  ('Computer Science'), ('Mathematics'), ('Physics'), ('Chemistry'),
  ('Engineering'), ('Management'), ('Literature'), ('History'),
  ('Reference'), ('General')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.event_categories (name, color) VALUES
  ('Technical', '#3B82F6'), ('Cultural', '#8B5CF6'), ('Sports', '#10B981'),
  ('Workshop', '#F59E0B'), ('Seminar', '#EF4444'), ('Social', '#EC4899'),
  ('Academic', '#6366F1'), ('Other', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
-- Next step: In Supabase Dashboard, enable Realtime on:
--   - notifications table (for in-app notification updates)
-- ============================================================
