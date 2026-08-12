// ============================================================
// SMART CAMPUS MANAGEMENT SYSTEM — Supabase Database Types
// Auto-generated shape — matches the migration schema exactly
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          department: string | null;
          roll_number: string | null;
          employee_id: string | null;
          gender: string | null;
          date_of_birth: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          department?: string | null;
          roll_number?: string | null;
          employee_id?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      book_categories: {
        Row: { id: string; name: string; description: string | null; created_at: string };
        Insert: { id?: string; name: string; description?: string | null };
        Update: Partial<Database["public"]["Tables"]["book_categories"]["Insert"]>;
      };
      book_authors: {
        Row: { id: string; name: string; bio: string | null; created_at: string };
        Insert: { id?: string; name: string; bio?: string | null };
        Update: Partial<Database["public"]["Tables"]["book_authors"]["Insert"]>;
      };
      book_publishers: {
        Row: { id: string; name: string; website: string | null; created_at: string };
        Insert: { id?: string; name: string; website?: string | null };
        Update: Partial<Database["public"]["Tables"]["book_publishers"]["Insert"]>;
      };
      books: {
        Row: {
          id: string;
          isbn: string | null;
          title: string;
          description: string | null;
          cover_url: string | null;
          category_id: string | null;
          author_id: string | null;
          publisher_id: string | null;
          publication_year: number | null;
          edition: string | null;
          total_copies: number;
          available_copies: number;
          location_shelf: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          isbn?: string | null;
          title: string;
          description?: string | null;
          cover_url?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          publisher_id?: string | null;
          publication_year?: number | null;
          edition?: string | null;
          total_copies?: number;
          available_copies?: number;
          location_shelf?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
      };
      book_copies: {
        Row: {
          id: string;
          book_id: string;
          copy_number: string;
          qr_code: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          copy_number: string;
          qr_code?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["book_copies"]["Insert"]>;
      };
      book_borrows: {
        Row: {
          id: string;
          copy_id: string;
          book_id: string;
          student_id: string;
          librarian_id: string | null;
          borrow_date: string;
          due_date: string;
          return_date: string | null;
          renewal_count: number;
          fine_amount: number;
          fine_paid: boolean;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          copy_id: string;
          book_id: string;
          student_id: string;
          librarian_id?: string | null;
          borrow_date?: string;
          due_date: string;
          return_date?: string | null;
          renewal_count?: number;
          fine_amount?: number;
          fine_paid?: boolean;
          status?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["book_borrows"]["Insert"]>;
      };
      event_categories: {
        Row: { id: string; name: string; color: string | null; created_at: string };
        Insert: { id?: string; name: string; color?: string | null };
        Update: Partial<Database["public"]["Tables"]["event_categories"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          organizer_id: string;
          venue: string;
          start_time: string;
          end_time: string;
          capacity: number;
          registration_deadline: string | null;
          banner_url: string | null;
          status: string;
          is_public: boolean;
          allow_faculty: boolean;
          certificate_template: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          organizer_id: string;
          venue: string;
          start_time: string;
          end_time: string;
          capacity?: number;
          registration_deadline?: string | null;
          banner_url?: string | null;
          status?: string;
          is_public?: boolean;
          allow_faculty?: boolean;
          certificate_template?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registered_at: string;
          attended: boolean;
          attended_at: string | null;
          certificate_issued: boolean;
          certificate_url: string | null;
          qr_code: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          attended?: boolean;
          certificate_issued?: boolean;
          certificate_url?: string | null;
          qr_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Insert"]>;
      };
      buses: {
        Row: {
          id: string;
          bus_number: string;
          capacity: number;
          model: string | null;
          driver_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bus_number: string;
          capacity?: number;
          model?: string | null;
          driver_id?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["buses"]["Insert"]>;
      };
      bus_routes: {
        Row: { id: string; name: string; description: string | null; is_active: boolean; created_at: string };
        Insert: { id?: string; name: string; description?: string | null; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["bus_routes"]["Insert"]>;
      };
      bus_stops: {
        Row: {
          id: string;
          route_id: string;
          name: string;
          stop_order: number;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name: string;
          stop_order: number;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["bus_stops"]["Insert"]>;
      };
      student_bus_assignments: {
        Row: {
          id: string;
          student_id: string;
          route_id: string;
          stop_id: string | null;
          valid_from: string;
          valid_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          route_id: string;
          stop_id?: string | null;
          valid_from?: string;
          valid_until?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["student_bus_assignments"]["Insert"]>;
      };
      bus_trips: {
        Row: {
          id: string;
          bus_id: string;
          route_id: string;
          driver_id: string;
          trip_date: string;
          trip_type: string;
          start_time: string | null;
          end_time: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bus_id: string;
          route_id: string;
          driver_id: string;
          trip_date?: string;
          trip_type: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bus_trips"]["Insert"]>;
      };
      hostels: {
        Row: {
          id: string;
          name: string;
          type: string;
          warden_id: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          warden_id?: string | null;
          address?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hostels"]["Insert"]>;
      };
      hostel_blocks: {
        Row: { id: string; hostel_id: string; name: string; created_at: string };
        Insert: { id?: string; hostel_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["hostel_blocks"]["Insert"]>;
      };
      hostel_floors: {
        Row: { id: string; block_id: string; floor_number: number; created_at: string };
        Insert: { id?: string; block_id: string; floor_number: number };
        Update: Partial<Database["public"]["Tables"]["hostel_floors"]["Insert"]>;
      };
      hostel_rooms: {
        Row: {
          id: string;
          floor_id: string;
          room_number: string;
          capacity: number;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          floor_id: string;
          room_number: string;
          capacity?: number;
          type?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hostel_rooms"]["Insert"]>;
      };
      hostel_beds: {
        Row: {
          id: string;
          room_id: string;
          bed_number: string;
          student_id: string | null;
          status: string;
          allocated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          bed_number: string;
          student_id?: string | null;
          status?: string;
          allocated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hostel_beds"]["Insert"]>;
      };
      leave_requests: {
        Row: {
          id: string;
          student_id: string;
          hostel_id: string;
          from_date: string;
          to_date: string;
          reason: string;
          status: string;
          warden_id: string | null;
          warden_remark: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          hostel_id: string;
          from_date: string;
          to_date: string;
          reason: string;
          status?: string;
          warden_id?: string | null;
          warden_remark?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leave_requests"]["Insert"]>;
      };
      hostel_complaints: {
        Row: {
          id: string;
          student_id: string;
          hostel_id: string;
          category: string;
          description: string;
          status: string;
          priority: string;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          hostel_id: string;
          category: string;
          description: string;
          status?: string;
          priority?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hostel_complaints"]["Insert"]>;
      };
      hostel_attendance: {
        Row: {
          id: string;
          student_id: string;
          hostel_id: string;
          date: string;
          status: string;
          marked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          hostel_id: string;
          date?: string;
          status?: string;
          marked_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hostel_attendance"]["Insert"]>;
      };
      hostel_fees: {
        Row: {
          id: string;
          student_id: string;
          hostel_id: string;
          period: string;
          amount: number;
          paid: boolean;
          paid_at: string | null;
          due_date: string | null;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          hostel_id: string;
          period: string;
          amount: number;
          paid?: boolean;
          paid_at?: string | null;
          due_date?: string | null;
          receipt_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hostel_fees"]["Insert"]>;
      };
      mess_menus: {
        Row: {
          id: string;
          date: string;
          meal_type: string;
          items: Json;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          meal_type: string;
          items?: Json;
          manager_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mess_menus"]["Insert"]>;
      };
      mess_attendance: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          meal_type: string;
          present: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          date?: string;
          meal_type: string;
          present?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["mess_attendance"]["Insert"]>;
      };
      mess_feedback: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          meal_type: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          date?: string;
          meal_type: string;
          rating: number;
          comment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mess_feedback"]["Insert"]>;
      };
      mess_complaints: {
        Row: {
          id: string;
          student_id: string;
          description: string;
          category: string;
          status: string;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          description: string;
          category?: string;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mess_complaints"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
};

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type BookCopy = Database["public"]["Tables"]["book_copies"]["Row"];
export type BookBorrow = Database["public"]["Tables"]["book_borrows"]["Row"];
export type BookCategory = Database["public"]["Tables"]["book_categories"]["Row"];
export type BookAuthor = Database["public"]["Tables"]["book_authors"]["Row"];
export type BookPublisher = Database["public"]["Tables"]["book_publishers"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventRegistration = Database["public"]["Tables"]["event_registrations"]["Row"];
export type EventCategory = Database["public"]["Tables"]["event_categories"]["Row"];
export type Bus = Database["public"]["Tables"]["buses"]["Row"];
export type BusRoute = Database["public"]["Tables"]["bus_routes"]["Row"];
export type BusStop = Database["public"]["Tables"]["bus_stops"]["Row"];
export type BusTrip = Database["public"]["Tables"]["bus_trips"]["Row"];
export type StudentBusAssignment = Database["public"]["Tables"]["student_bus_assignments"]["Row"];
export type Hostel = Database["public"]["Tables"]["hostels"]["Row"];
export type HostelBlock = Database["public"]["Tables"]["hostel_blocks"]["Row"];
export type HostelFloor = Database["public"]["Tables"]["hostel_floors"]["Row"];
export type HostelRoom = Database["public"]["Tables"]["hostel_rooms"]["Row"];
export type HostelBed = Database["public"]["Tables"]["hostel_beds"]["Row"];
export type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];
export type HostelComplaint = Database["public"]["Tables"]["hostel_complaints"]["Row"];
export type HostelAttendance = Database["public"]["Tables"]["hostel_attendance"]["Row"];
export type HostelFee = Database["public"]["Tables"]["hostel_fees"]["Row"];
export type MessMenu = Database["public"]["Tables"]["mess_menus"]["Row"];
export type MessAttendance = Database["public"]["Tables"]["mess_attendance"]["Row"];
export type MessFeedback = Database["public"]["Tables"]["mess_feedback"]["Row"];
export type MessComplaint = Database["public"]["Tables"]["mess_complaints"]["Row"];
