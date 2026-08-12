-- ============================================================
-- SMART CAMPUS MANAGEMENT SYSTEM
-- Migration 004: Event Halls + Event Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. EVENT HALLS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_halls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  location    TEXT NOT NULL,
  capacity    INT NOT NULL DEFAULT 100,
  facilities  JSONB DEFAULT '[]'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE TRIGGER event_halls_updated_at BEFORE UPDATE ON public.event_halls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_event_halls_active ON public.event_halls(is_active);

-- ── 2. ADD hall_id TO events (optional FK, nullable) ─────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS hall_id UUID REFERENCES public.event_halls(id) ON DELETE SET NULL;

-- ── 3. RLS FOR event_halls ───────────────────────────────────
ALTER TABLE public.event_halls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "halls_select_all" ON public.event_halls;
CREATE POLICY "halls_select_all" ON public.event_halls
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "halls_manage_super_admin" ON public.event_halls;
CREATE POLICY "halls_manage_super_admin" ON public.event_halls
  FOR ALL USING (get_my_role() = 'super_admin');

-- ── 4. FIX event_registrations RLS ──────────────────────────
DROP POLICY IF EXISTS "event_reg_select_own" ON public.event_registrations;
CREATE POLICY "event_reg_select_own" ON public.event_registrations
  FOR SELECT USING (
    user_id = auth.uid()
    OR get_my_role() IN ('event_organizer', 'super_admin', 'faculty')
  );

DROP POLICY IF EXISTS "event_reg_delete_self" ON public.event_registrations;
CREATE POLICY "event_reg_delete_self" ON public.event_registrations
  FOR DELETE USING (user_id = auth.uid());

-- ── 5. SEED: EVENT CATEGORIES ────────────────────────────────
INSERT INTO public.event_categories (name, color) VALUES
  ('Technical',    '#6366F1'),
  ('Cultural',     '#F59E0B'),
  ('Sports',       '#10B981'),
  ('Workshop',     '#EC4899'),
  ('Seminar',      '#3B82F6'),
  ('Competition',  '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- ── 6. SEED: EVENT HALLS ─────────────────────────────────────
INSERT INTO public.event_halls (name, location, capacity, facilities) VALUES
  ('Main Auditorium',   'Academic Block A, Ground Floor',    800,  '["stage","projector","AC","microphone","sound_system","backstage"]'::jsonb),
  ('Seminar Hall 1',    'Academic Block B, First Floor',     200,  '["projector","AC","whiteboard","microphone"]'::jsonb),
  ('Open Air Theatre',  'Campus Ground, Near Cafeteria',     1500, '["stage","sound_system","large_screen"]'::jsonb),
  ('Conference Room A', 'Admin Block, Second Floor',         50,   '["projector","AC","video_conferencing","whiteboard"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ── 7. SEED: EVENTS + REGISTRATIONS ─────────────────────────
DO $$
DECLARE
  org_id     UUID;
  admin_id   UUID;
  student_id UUID;
  faculty_id UUID;
  cat_tech   UUID;
  cat_cult   UUID;
  cat_work   UUID;
  cat_semi   UUID;
  cat_comp   UUID;
  hall_main  UUID;
  hall_sem   UUID;
  hall_open  UUID;
  hall_conf  UUID;
  event1_id  UUID;
  event2_id  UUID;
  event3_id  UUID;
  event4_id  UUID;
  event5_id  UUID;
BEGIN
  SELECT id INTO org_id     FROM public.profiles WHERE email = 'organizer@smartcampus.com' LIMIT 1;
  SELECT id INTO admin_id   FROM public.profiles WHERE email = 'admin@smartcampus.com'     LIMIT 1;
  SELECT id INTO student_id FROM public.profiles WHERE email = 'student@smartcampus.com'   LIMIT 1;
  SELECT id INTO faculty_id FROM public.profiles WHERE email = 'faculty@smartcampus.com'   LIMIT 1;

  SELECT id INTO cat_tech FROM public.event_categories WHERE name = 'Technical'   LIMIT 1;
  SELECT id INTO cat_cult FROM public.event_categories WHERE name = 'Cultural'    LIMIT 1;
  SELECT id INTO cat_work FROM public.event_categories WHERE name = 'Workshop'    LIMIT 1;
  SELECT id INTO cat_semi FROM public.event_categories WHERE name = 'Seminar'     LIMIT 1;
  SELECT id INTO cat_comp FROM public.event_categories WHERE name = 'Competition' LIMIT 1;

  SELECT id INTO hall_main FROM public.event_halls WHERE name = 'Main Auditorium'   LIMIT 1;
  SELECT id INTO hall_sem  FROM public.event_halls WHERE name = 'Seminar Hall 1'    LIMIT 1;
  SELECT id INTO hall_open FROM public.event_halls WHERE name = 'Open Air Theatre'  LIMIT 1;
  SELECT id INTO hall_conf FROM public.event_halls WHERE name = 'Conference Room A' LIMIT 1;

  IF org_id IS NULL THEN
    RAISE NOTICE 'Event organizer user not found. Run seed.mjs first, then re-run this script.';
    RETURN;
  END IF;

  -- Event 1: AI & ML Workshop (upcoming)
  INSERT INTO public.events (title, description, category_id, organizer_id, venue, hall_id, start_time, end_time, capacity, registration_deadline, status, is_public, allow_faculty)
  VALUES (
    'AI & Machine Learning Workshop',
    'A hands-on full-day workshop exploring the fundamentals of artificial intelligence and machine learning. Participants will build and train their own models using Python and TensorFlow. Ideal for CS students and faculty.',
    cat_work, org_id,
    'Seminar Hall 1, Academic Block B', hall_sem,
    (NOW() + INTERVAL '5 days')::TIMESTAMPTZ,
    (NOW() + INTERVAL '5 days' + INTERVAL '8 hours')::TIMESTAMPTZ,
    150, (NOW() + INTERVAL '4 days')::TIMESTAMPTZ,
    'upcoming', TRUE, TRUE
  ) RETURNING id INTO event1_id;

  -- Event 2: Annual Cultural Fest (upcoming)
  INSERT INTO public.events (title, description, category_id, organizer_id, venue, hall_id, start_time, end_time, capacity, registration_deadline, status, is_public, allow_faculty)
  VALUES (
    'Annual Cultural Fest 2026',
    'Celebrate the vibrant culture of our campus with music, dance, drama, and art performances. This mega event features competitions, celebrity performances, and food stalls. Open to all students and faculty.',
    cat_cult, org_id,
    'Open Air Theatre, Campus Ground', hall_open,
    (NOW() + INTERVAL '15 days')::TIMESTAMPTZ,
    (NOW() + INTERVAL '17 days' + INTERVAL '4 hours')::TIMESTAMPTZ,
    1000, (NOW() + INTERVAL '12 days')::TIMESTAMPTZ,
    'upcoming', TRUE, TRUE
  ) RETURNING id INTO event2_id;

  -- Event 3: Hackathon 2026 (upcoming)
  INSERT INTO public.events (title, description, category_id, organizer_id, venue, hall_id, start_time, end_time, capacity, registration_deadline, status, is_public, allow_faculty)
  VALUES (
    'SmartCampus Hackathon 2026',
    '24-hour hackathon where teams of 3-5 students compete to build innovative solutions for real campus challenges. Cash prizes worth ₹1,00,000. Mentors from top tech companies will guide participants.',
    cat_comp, org_id,
    'Main Auditorium', hall_main,
    (NOW() + INTERVAL '10 days')::TIMESTAMPTZ,
    (NOW() + INTERVAL '11 days')::TIMESTAMPTZ,
    300, (NOW() + INTERVAL '8 days')::TIMESTAMPTZ,
    'upcoming', TRUE, FALSE
  ) RETURNING id INTO event3_id;

  -- Event 4: Research Seminar (ongoing)
  INSERT INTO public.events (title, description, category_id, organizer_id, venue, hall_id, start_time, end_time, capacity, registration_deadline, status, is_public, allow_faculty)
  VALUES (
    'Research Methodology Seminar',
    'A comprehensive seminar on modern research methodologies, academic paper writing, and publication strategies. Speakers include senior professors and journal editors. Certificate of participation will be provided.',
    cat_semi, org_id,
    'Conference Room A, Admin Block', hall_conf,
    (NOW() - INTERVAL '2 hours')::TIMESTAMPTZ,
    (NOW() + INTERVAL '4 hours')::TIMESTAMPTZ,
    50, (NOW() - INTERVAL '1 day')::TIMESTAMPTZ,
    'ongoing', TRUE, TRUE
  ) RETURNING id INTO event4_id;

  -- Event 5: Web Dev Bootcamp (completed)
  INSERT INTO public.events (title, description, category_id, organizer_id, venue, hall_id, start_time, end_time, capacity, registration_deadline, status, is_public, allow_faculty)
  VALUES (
    'Full Stack Web Development Bootcamp',
    'An intensive 2-day bootcamp covering React, Next.js, Node.js, and PostgreSQL. Participants built real-world projects and received hands-on mentorship from industry professionals.',
    cat_tech, org_id,
    'Seminar Hall 1, Academic Block B', hall_sem,
    (NOW() - INTERVAL '10 days')::TIMESTAMPTZ,
    (NOW() - INTERVAL '8 days')::TIMESTAMPTZ,
    120, (NOW() - INTERVAL '12 days')::TIMESTAMPTZ,
    'completed', TRUE, TRUE
  ) RETURNING id INTO event5_id;

  -- Registrations
  IF student_id IS NOT NULL THEN
    IF event1_id IS NOT NULL THEN
      INSERT INTO public.event_registrations (event_id, user_id, qr_code)
      VALUES (event1_id, student_id, uuid_generate_v4()::TEXT)
      ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
    IF event2_id IS NOT NULL THEN
      INSERT INTO public.event_registrations (event_id, user_id, qr_code)
      VALUES (event2_id, student_id, uuid_generate_v4()::TEXT)
      ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
    IF event5_id IS NOT NULL THEN
      INSERT INTO public.event_registrations (event_id, user_id, qr_code, attended, attended_at, certificate_issued)
      VALUES (event5_id, student_id, uuid_generate_v4()::TEXT, TRUE, (NOW() - INTERVAL '10 days'), TRUE)
      ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
  END IF;

  IF faculty_id IS NOT NULL THEN
    IF event1_id IS NOT NULL THEN
      INSERT INTO public.event_registrations (event_id, user_id, qr_code)
      VALUES (event1_id, faculty_id, uuid_generate_v4()::TEXT)
      ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
    IF event5_id IS NOT NULL THEN
      INSERT INTO public.event_registrations (event_id, user_id, qr_code, attended, attended_at)
      VALUES (event5_id, faculty_id, uuid_generate_v4()::TEXT, TRUE, (NOW() - INTERVAL '10 days'))
      ON CONFLICT (event_id, user_id) DO NOTHING;
    END IF;
  END IF;

  IF admin_id IS NOT NULL AND event4_id IS NOT NULL THEN
    INSERT INTO public.event_registrations (event_id, user_id, qr_code)
    VALUES (event4_id, admin_id, uuid_generate_v4()::TEXT)
    ON CONFLICT (event_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Event seed data inserted successfully.';
END $$;
