-- ============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM — LIBRARY MODULE ENHANCEMENT MIGRATION
-- Run this in your Supabase SQL Editor to add required library fields & policies.
-- ============================================================================

-- 1. BOOKS TABLE ENHANCEMENTS
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';

-- 2. BOOK COPIES TABLE ENHANCEMENTS
ALTER TABLE public.book_copies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.book_copies ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good';
ALTER TABLE public.book_copies ADD COLUMN IF NOT EXISTS acquisition_date DATE DEFAULT CURRENT_DATE;

-- Update status check constraint if needed
ALTER TABLE public.book_copies DROP CONSTRAINT IF EXISTS book_copies_status_check;
ALTER TABLE public.book_copies ADD CONSTRAINT book_copies_status_check 
  CHECK (status IN ('available','borrowed','overdue','damaged','lost','maintenance'));

-- 3. BOOK BORROWS TABLE ENHANCEMENTS
ALTER TABLE public.book_borrows ADD COLUMN IF NOT EXISTS fine_status TEXT DEFAULT 'PENDING' CHECK (fine_status IN ('PENDING', 'PAID', 'WAIVED'));
ALTER TABLE public.book_borrows ADD COLUMN IF NOT EXISTS waived_at TIMESTAMPTZ;
ALTER TABLE public.book_borrows ADD COLUMN IF NOT EXISTS waived_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. RLS POLICIES FOR FACULTY AND STUDENT SELF-SERVICE
DO $$ 
BEGIN
  -- Allow borrower to update own borrow (for renewal)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'borrows_update_own') THEN
    CREATE POLICY "borrows_update_own" ON public.book_borrows 
      FOR UPDATE USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
END $$;
