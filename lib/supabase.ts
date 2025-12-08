import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database Types
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff' | 'student'
  password: string
  status: 'active' | 'inactive'
  phone_number?: string
  department?: string
  course?: string
  sub_course?: string
  dob?: string
  age?: number
  blood_group?: string
  parent_phone?: string
  responsible_staff?: string
  created_at?: string
  updated_at?: string
}

export interface Acknowledgement {
  id: number
  message_id: number
  user_id: number
  user_name: string
  user_email: string
  user_role: string
  acknowledged_at: string
  created_at?: string
}

export interface Message {
  id: number
  title: string
  content: string
  sender: string
  sender_role: string
  recipients: string
  custom_groups?: number[]
  manual_recipients?: string[]
  priority: 'low' | 'medium' | 'high'
  category?: string
  attachments?: string[]
  schedule_type: 'now' | 'later'
  schedule_date?: string
  schedule_time?: string
  total_recipients: number
  read_count: number
  read_by?: number[]
  acknowledged: boolean
  acknowledged_by?: number[]
  acknowledgements?: Acknowledgement[]
  created_at?: string
  updated_at?: string
}

export interface Group {
  id: number
  name: string
  description: string
  department?: string
  created_by: string
  members: string[]
  created_at?: string
  updated_at?: string
}

export interface Department {
  id: number
  name: string
  description: string
  head_of_department?: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface Notification {
  id: number
  message_id: number
  user_id: number
  message: string
  read: boolean
  created_at?: string
}

export interface Comment {
  id: number
  message_id: number
  parent_comment_id?: number | null
  user_id?: number
  user_name?: string
  user_email?: string
  user_role?: string
  user_department?: string
  content: string
  mentions?: string[]
  created_at?: string
  updated_at?: string
}

export interface Course {
  id: number
  name: string
  code?: string
  description?: string | null
  department_id: number
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface SubCourse {
  id: number
  name: string
  code?: string
  description?: string | null
  course_id: number
  created_by: string
  created_at?: string
  updated_at?: string
}
