import { create } from 'zustand'
import type { Notification, Course, SubCourse, Comment } from './supabase'
import { User, Message, Group, Department, supabase } from './supabase'

interface AppState {
  // Authentication
  currentUser: User | null
  isAuthenticated: boolean

  // Theme
  isDarkMode: boolean

  // Users
  users: User[]

  // Messages
  messages: Message[]

  // Groups
  groups: Group[]

  // Departments
  departments: Department[]

  // Courses
  courses: Course[]

  // Sub Courses
  subCourses: SubCourse[]

  // Course Actions
  addCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<Course | null>
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: number) => Promise<void>
  fetchCourses: () => Promise<void>

  // Sub Course Actions
  addSubCourse: (subCourse: Omit<SubCourse, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateSubCourse: (id: number, subCourse: Partial<SubCourse>) => Promise<void>
  deleteSubCourse: (id: number) => Promise<void>
  fetchSubCourses: () => Promise<void>

  // Notifications
  notifications: Notification[]
  // Comments
  comments: Comment[]

  // Actions
  login: (email: string, password: string, role?: string) => Promise<boolean>
  logout: () => void
  toggleTheme: () => void

  // User Actions
  addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateUser: (id: number, user: Partial<User>) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  fetchUsers: () => Promise<void>

  // Message Actions
  addMessage: (message: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'read_count' | 'read_by' | 'acknowledged' | 'acknowledged_by'>) => Promise<Message>
  // Comment Actions
  fetchComments: () => Promise<void>
  addComment: (commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => Promise<Comment | null>
  updateComment: (id: number, commentData: Partial<Comment>) => Promise<void>
  deleteComment: (id: number) => Promise<void>
  acknowledgeMessage: (messageId: number, userId: number) => Promise<void>
  markMessageAsRead: (messageId: number) => void
  fetchMessages: () => Promise<void>
  getMessageAcknowledgementDetails: (messageId: number) => { acknowledged: any[]; pending: any[] }

  // Group Actions
  addGroup: (group: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGroup: (id: number, group: Partial<Group>) => Promise<void>
  deleteGroup: (id: number) => Promise<void>
  fetchGroups: () => Promise<void>

  // Department Actions
  addDepartment: (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Promise<Department | null>
  updateDepartment: (id: number, department: Partial<Department>) => Promise<void>
  deleteDepartment: (id: number) => Promise<void>
  fetchDepartments: () => Promise<void>

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>
  markNotificationAsRead: (id: number) => void
  markNotificationsAsReadForMessage: (messageId: number) => void
  getUnreadNotifications: () => Notification[]
}

// Demo users
const demoUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'tamilselvam.cm@gmail.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    department: 'Administration',
    phone_number: '1234567890',
    dob: '1985-01-15',
    age: 39,
    blood_group: 'O+',
  },
  {
    id: 2,
    name: 'Staff Member',
    email: 'staff@college.edu',
    password: 'staff123',
    role: 'staff',
    status: 'active',
    department: 'Computer Science',
    phone_number: '0987654321',
    dob: '1990-05-20',
    age: 34,
    blood_group: 'A+',
  },
  {
    id: 3,
    name: 'John Student',
    email: 'yashwanthrathnam@gmail.com',
    password: 'student123',
    role: 'student',
    status: 'active',
    department: 'Computer Science',
    course: 'B.Tech',
    sub_course: 'Computer Science',
    phone_number: '1122334455',
    parent_phone: '9988776655',
    responsible_staff: 'Staff Member',
    dob: '2003-08-10',
    age: 21,
    blood_group: 'B+',
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    email: 'sarah@college.edu',
    password: 'student123',
    role: 'student',
    status: 'active',
    department: 'Computer Science',
    course: 'B.Tech',
    sub_course: 'Computer Science',
    phone_number: '2233445566',
    parent_phone: '8877665544',
    responsible_staff: 'Staff Member',
    dob: '2003-03-15',
    age: 21,
    blood_group: 'A-',
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael@college.edu',
    password: 'student123',
    role: 'student',
    status: 'active',
    department: 'Electronics',
    course: 'B.Tech',
    sub_course: 'Electronics',
    phone_number: '3344556677',
    parent_phone: '7766554433',
    responsible_staff: 'Staff Member',
    dob: '2002-11-22',
    age: 22,
    blood_group: 'O-',
  },
]



// Demo groups
const demoGroups: Group[] = [
  {
    id: 1,
    name: 'Computer Science Students',
    description: 'All students from Computer Science department',
    created_by: 'admin@college.edu',
    members: ['student@college.edu', 'sarah@college.edu'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'B.Tech 2024 Batch',
    description: 'Students from 2024 batch',
    created_by: 'admin@college.edu',
    members: ['student@college.edu', 'sarah@college.edu', 'michael@college.edu'],
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Demo departments
const demoDepartments: Department[] = [
  {
    id: 1,
    name: 'Computer Science',
    description: 'Department of Computer Science and Engineering',
    head_of_department: 'Dr. Smith',
    created_by: 'admin@college.edu',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Electronics',
    description: 'Department of Electronics and Communication',
    head_of_department: 'Dr. Johnson',
    created_by: 'admin@college.edu',
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Mechanical Engineering',
    description: 'Department of Mechanical Engineering',
    head_of_department: 'Dr. Brown',
    created_by: 'admin@college.edu',
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Civil Engineering',
    description: 'Department of Civil Engineering',
    head_of_department: 'Dr. Davis',
    created_by: 'admin@college.edu',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'Administration',
    description: 'Administrative Department',
    head_of_department: 'Principal',
    created_by: 'admin@college.edu',
    created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  currentUser: null,
  isAuthenticated: false,
  isDarkMode: false,
  users: demoUsers,
  messages: [],
  groups: demoGroups,
  departments: demoDepartments,
  courses: [],
  subCourses: [],
  notifications: [],
  comments: [],

  // Authentication Actions
  login: async (email: string, password: string, role?: string) => {
    // First try to find in local users (including newly added ones)
    let user = get().users.find(
      (u) => u.email === email && u.password === password && u.status === 'active'
    )

    // If not found locally, try to fetch from Supabase
    if (!user) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .eq('status', 'active')
          .single()

        if (data && !error) {
          user = data
          // Add to local state
          set((state) => ({ users: [...state.users, user!] }))
        }
      } catch (supabaseError) {
        console.warn('Supabase login failed, using local storage only')
      }
    }

    // Validate role if provided
    if (user && role && user.role !== role) {
      console.warn(`Role mismatch: User has role '${user.role}' but login attempted with role '${role}'`)
      return Promise.resolve(false)
    }

    if (user) {
      // Normalize user shape to avoid runtime crashes when UI expects fields
      const normalizedUser = {
        // preserve original properties first
        ...user,
        // then ensure required fields exist and have safe defaults
        id: typeof (user as any).id === 'number' ? (user as any).id : Number((user as any).id) || 0,
        name: (user as any).name || (user as any).full_name || (user as any).email || 'Unknown User',
        email: (user as any).email || '',
        role: (user as any).role || 'student',
        status: (user as any).status || 'active',
        department: (user as any).department || 'N/A',
        phone_number: (user as any).phone_number || '',
      }

      if (!normalizedUser.id) {
        console.warn('Login: user has no numeric id, assigned fallback id 0. This may indicate inconsistent user schema.')
      }

      set({ currentUser: normalizedUser as any, isAuthenticated: true })
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false })
  },

  toggleTheme: () => {
    const newTheme = !get().isDarkMode
    set({ isDarkMode: newTheme })
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')

    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  // User Actions
  addUser: async (userData) => {
    try {
      // Save to local state first
      const newUser: User = {
        ...userData,
        id: Math.max(...get().users.map(u => u.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((state) => ({ users: [...state.users, newUser] }))

      // Try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            status: userData.status,
            phone_number: userData.phone_number,
            department: userData.department,
            course: userData.course,
            sub_course: userData.sub_course,
            dob: userData.dob,
            age: userData.age,
            blood_group: userData.blood_group,
            parent_phone: userData.parent_phone,
            responsible_staff: userData.responsible_staff,
          }])
          .select()
          .single()

        if (error) {
          console.warn('Supabase not configured or error occurred, using local storage:', error.message)
        } else {
          console.log('User saved to Supabase successfully')
        }
      } catch (supabaseError) {
        console.warn('Supabase not available, using local storage only')
      }
    } catch (error) {
      console.error('Failed to add user:', error)
      throw error
    }
  },

  updateUser: async (id, userData) => {
    try {
      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id
            ? { ...user, ...userData, updated_at: new Date().toISOString() }
            : user
        ),
      }))

      // Try to update in Supabase
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            status: userData.status,
            phone_number: userData.phone_number,
            department: userData.department,
            course: userData.course,
            sub_course: userData.sub_course,
            dob: userData.dob,
            age: userData.age,
            blood_group: userData.blood_group,
            parent_phone: userData.parent_phone,
            responsible_staff: userData.responsible_staff,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('Supabase not configured or error occurred, using local storage:', error.message)
        } else {
          console.log('User updated in Supabase successfully')
        }
      } catch (supabaseError) {
        console.warn('Supabase not available, using local storage only')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  },

  deleteUser: async (id) => {
    try {
      // Delete from local state
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }))

      // Try to delete from Supabase
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('Supabase not configured or error occurred, using local storage:', error.message)
        } else {
          console.log('User deleted from Supabase successfully')
        }
      } catch (supabaseError) {
        console.warn('Supabase not available, using local storage only')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },

  fetchUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        set(() => ({ users: data }))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  },

  // Message Actions
  addMessage: async (messageData) => {
    try {
      // Try to save to Supabase first
      let supabaseMessage: Message | null = null

      try {
        // Attempt 1: Try to insert with read_by (new schema)
        const { data, error } = await supabase
          .from('messages')
          .insert([{
            title: messageData.title,
            content: messageData.content,
            sender: messageData.sender,
            sender_role: messageData.sender_role,
            recipients: messageData.recipients,
            custom_groups: messageData.custom_groups,
            manual_recipients: messageData.manual_recipients,
            priority: messageData.priority,
            attachments: messageData.attachments,
            schedule_type: messageData.schedule_type,
            schedule_date: messageData.schedule_date,
            schedule_time: messageData.schedule_time,
            total_recipients: messageData.total_recipients,
            read_count: 0,
            read_by: [],
            acknowledged: false,
            acknowledged_by: [],
          }])
          .select()
          .single()

        if (error) {
          // If error is about missing column, try fallback
          console.warn('Supabase insert with read_by failed, retrying without it:', error.message)

          const { data: retryData, error: retryError } = await supabase
            .from('messages')
            .insert([{
              title: messageData.title,
              content: messageData.content,
              sender: messageData.sender,
              sender_role: messageData.sender_role,
              recipients: messageData.recipients,
              custom_groups: messageData.custom_groups,
              manual_recipients: messageData.manual_recipients,
              priority: messageData.priority,
              attachments: messageData.attachments,
              schedule_type: messageData.schedule_type,
              schedule_date: messageData.schedule_date,
              schedule_time: messageData.schedule_time,
              total_recipients: messageData.total_recipients,
              read_count: 0,
              acknowledged: false,
              acknowledged_by: [],
            }])
            .select()
            .single()

          if (retryError) {
            throw retryError
          } else {
            supabaseMessage = retryData
            console.log('Message saved to Supabase successfully (legacy schema):', retryData)
          }
        } else {
          supabaseMessage = data
          console.log('Message saved to Supabase successfully:', data)
        }
      } catch (supabaseError) {
        console.warn('Supabase operation failed, falling back to local storage', supabaseError)
      }

      // Create message object (use Supabase data if available, otherwise create local)
      const newMessage: Message = supabaseMessage || {
        id: Math.max(...get().messages.map(m => m.id), 0) + 1,
        title: messageData.title,
        content: messageData.content,
        sender: messageData.sender,
        sender_role: messageData.sender_role,
        recipients: messageData.recipients,
        custom_groups: messageData.custom_groups,
        manual_recipients: messageData.manual_recipients,
        priority: messageData.priority,
        attachments: messageData.attachments,
        schedule_type: messageData.schedule_type,
        schedule_date: messageData.schedule_date,
        schedule_time: messageData.schedule_time,
        total_recipients: messageData.total_recipients,
        read_count: 0,
        read_by: [],
        acknowledged: false,
        acknowledged_by: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Save to local state
      set((state) => ({ messages: [newMessage, ...state.messages] }))

      // Create notifications for recipients
      const { users, currentUser } = get()
      let recipientUsers: User[] = []

      if (messageData.recipients === 'all') {
        recipientUsers = users.filter(u => u.id !== currentUser?.id)
      } else if (messageData.recipients === 'students') {
        recipientUsers = users.filter(u => u.role === 'student')
      } else if (messageData.recipients === 'staff') {
        recipientUsers = users.filter(u => u.role === 'staff')
      } else if (messageData.recipients === 'admins') {
        recipientUsers = users.filter(u => u.role === 'admin')
      } else if (messageData.recipients === 'group' && messageData.custom_groups) {
        const targetEmails = new Set<string>()
        const allGroups = get().groups

        messageData.custom_groups.forEach(groupId => {
          const group = allGroups.find(g => g.id === groupId)
          if (group && group.members) {
            group.members.forEach(email => targetEmails.add(email))
          }
        })

        recipientUsers = users.filter(u => targetEmails.has(u.email))
      } else if (messageData.recipients === 'manual' && messageData.manual_recipients) {
        recipientUsers = users.filter(u => messageData.manual_recipients?.includes(u.email))
      }

      // Create one notification per recipient (await to avoid races)
      for (const user of recipientUsers) {
        await get().addNotification({
          message_id: newMessage.id,
          user_id: user.id,
          message: `New message: ${messageData.title}`,
          read: false,
        })
      }

      return newMessage
    } catch (error) {
      console.error('Failed to save message:', error)
      throw error
    }
  },
  acknowledgeMessage: async (messageId, userId) => {
    try {
      const state = get()
      const currentUser = state.currentUser

      if (!currentUser) return

      const message = state.messages.find(m => m.id === messageId)
      if (!message) return

      const currentAcknowledgedBy = message.acknowledged_by || []
      if (currentAcknowledgedBy.includes(userId)) return

      const newAcknowledgedBy = [...currentAcknowledgedBy, userId]

      // Update local state
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId
            ? {
              ...msg,
              acknowledged_by: newAcknowledgedBy,
              acknowledged: true,
            }
            : msg
        ),
      }))

      // Try to save to Supabase
      if (supabase) {
        try {
          // Update message acknowledged status
          const { data: updateData, error: updateError } = await supabase
            .from('messages')
            .update({
              acknowledged_by: newAcknowledgedBy
            })
            .eq('id', messageId)
            .select()

          console.log('Supabase update result:', { updateData, updateError })

          if (updateError) {
            console.error('Error updating message acknowledgement:', updateError)
            // Try camelCase just in case
            const { error: retryError } = await supabase
              .from('messages')
              .update({
                acknowledgedBy: newAcknowledgedBy
              })
              .eq('id', messageId)
              .select()
            if (!retryError) console.log('Retry with camelCase succeeded')
          }

          // Store acknowledgement details (ignore error if table doesn't exist)
          try {
            const { data: ackData, error: ackInsertError } = await supabase
              .from('acknowledgements')
              .insert({
                message_id: messageId,
                user_id: userId,
                user_name: currentUser.name,
                user_email: currentUser.email,
                user_role: currentUser.role,
                acknowledged_at: new Date().toISOString(),
              })
              .select()

            if (ackInsertError) {
              // Common causes: table doesn't exist, RLS or permission issues (401), or schema mismatch
              console.warn('Failed to insert into acknowledgements table:', ackInsertError)
              if (ackInsertError?.code === '401' || String(ackInsertError?.message || '').toLowerCase().includes('permission')) {
                console.warn('[acknowledgements] Permission error (401). Check Supabase RLS policies and anon key permissions for inserting into `acknowledgements`.')
              }
            } else {
              console.log('[acknowledgements] Inserted acknowledgement row:', ackData)
            }
          } catch (ackError) {
            console.warn('Unexpected error inserting into acknowledgements table (may not exist or insufficient permissions):', ackError)
          }
        } catch (supabaseError) {
          console.error('Supabase operation failed:', supabaseError)
        }
      }
    } catch (error) {
      console.error('Failed to acknowledge message:', error)
    }
  },

  getMessageAcknowledgementDetails: (messageId) => {
    const state = get()
    const message = state.messages.find(m => m.id === messageId)
    if (!message) return { acknowledged: [], pending: [] }

    const acknowledgedUserIds = message.acknowledged_by || []
    const acknowledged = state.users.filter(u => acknowledgedUserIds.includes(u.id))

    // Get pending users based on message recipients
    let allRecipients: typeof state.users = []

    if (message.recipients === 'all') {
      allRecipients = state.users.filter(u => u.id !== state.currentUser?.id)
    } else if (message.recipients === 'students') {
      allRecipients = state.users.filter(u => u.role === 'student')
    } else if (message.recipients === 'staff') {
      allRecipients = state.users.filter(u => u.role === 'staff')
    }

    const pending = allRecipients.filter(u => !acknowledgedUserIds.includes(u.id))

    return { acknowledged, pending }
  },

  markMessageAsRead: async (messageId) => {
    const state = get()
    const currentUser = state.currentUser
    if (!currentUser) return

    const message = state.messages.find(m => m.id === messageId)
    if (!message) return

    // Check if already read by this user
    const currentReadBy = message.read_by || []
    if (currentReadBy.includes(currentUser.id)) return

    const newReadBy = [...currentReadBy, currentUser.id]
    const newReadCount = (message.read_count || 0) + 1

    // Update local state
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, read_count: newReadCount, read_by: newReadBy }
          : msg
      ),
    }))

    // Update Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({
            read_count: newReadCount,
            read_by: newReadBy
          })
          .eq('id', messageId)

        if (error) {
          console.warn('Failed to update read_by, falling back to simple read_count increment', error)
          // Fallback: just update read_count
          await supabase
            .from('messages')
            .update({
              read_count: newReadCount
            })
            .eq('id', messageId)
        }
      } catch (error) {
        console.error('Error updating message read status:', error)
      }
    }
  },

  fetchMessages: async () => {
    try {
      // Try normal fetch first
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // If PostgREST returns an error due to missing columns in schema (400),
        // retry with a safe reduced column list that should exist on most schemas.
        console.warn('[fetchMessages] Initial fetch failed, retrying with safe column set:', error)

        try {
          const safeColumns = [
            'id', 'title', 'content', 'sender', 'sender_role', 'recipients',
            'custom_groups', 'manual_recipients', 'priority', 'attachments', 'schedule_type',
            'schedule_date', 'schedule_time', 'total_recipients', 'read_count',
            'acknowledged', 'created_at', 'updated_at'
          ].join(',')

          const { data: safeData, error: safeError } = await supabase
            .from('messages')
            .select(safeColumns)
            .order('created_at', { ascending: false })

          if (safeError) {
            console.error('[fetchMessages] Safe retry also failed:', safeError)
            return
          }

          if (safeData && Array.isArray(safeData) && safeData.length > 0) {
            // Type guard: verify first item has expected Message properties
            const firstItem = safeData[0]
            if (firstItem && typeof firstItem === 'object' && 'id' in firstItem && 'title' in firstItem) {
              console.log('[fetchMessages] Fetched messages (safe columns) sample:', firstItem)
              set(() => ({ messages: safeData as unknown as Message[] }))
              return
            }
          }

          if (safeData && Array.isArray(safeData) && safeData.length === 0) {
            console.log('[fetchMessages] No messages found')
            set(() => ({ messages: [] }))
            return
          }
        } catch (retryErr) {
          console.error('[fetchMessages] Retry with safe columns failed:', retryErr)
          return
        }
      }

      if (data && Array.isArray(data) && data.length > 0) {
        // Type guard: verify first item has expected Message properties
        const firstItem = data[0]
        if (firstItem && typeof firstItem === 'object' && 'id' in firstItem && 'title' in firstItem) {
          console.log('Fetched messages sample:', firstItem)
          set(() => ({ messages: data as unknown as Message[] }))
          return
        }
      }

      if (data && Array.isArray(data) && data.length === 0) {
        console.log('[fetchMessages] No messages found (initial fetch)')
        set(() => ({ messages: [] }))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  },

  // Group Actions
  addGroup: async (groupData) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([groupData])
        .select()

      if (error) throw error

      if (data) {
        set((state) => ({
          groups: [...state.groups, ...data],
        }))
      }
    } catch (error) {
      console.error('Error adding group:', error)
      const newGroup: Group = {
        ...groupData,
        id: Math.max(...get().groups.map(g => g.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((state) => ({ groups: [...state.groups, newGroup] }))
    }
  },

  updateGroup: async (id, groupData) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ ...groupData, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        groups: state.groups.map((group) =>
          group.id === id
            ? { ...group, ...groupData, updated_at: new Date().toISOString() }
            : group
        ),
      }))
    } catch (error) {
      console.error('Error updating group:', error)
      set((state) => ({
        groups: state.groups.map((group) =>
          group.id === id
            ? { ...group, ...groupData, updated_at: new Date().toISOString() }
            : group
        ),
      }))
    }
  },

  deleteGroup: async (id) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        groups: state.groups.filter((group) => group.id !== id),
      }))
    } catch (error) {
      console.error('Error deleting group:', error)
      set((state) => ({
        groups: state.groups.filter((group) => group.id !== id),
      }))
    }
  },

  fetchGroups: async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        set(() => ({ groups: data }))
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  },

  // Department Actions
  addDepartment: async (departmentData) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([departmentData])
        .select()

      if (error) {
        console.error('Supabase error adding department:', error)
        throw error
      }

      if (data) {
        set((state) => ({
          departments: [...state.departments, ...data],
        }))
        return data[0] as Department
      }
      return null
    } catch (error) {
      console.error('Error adding department:', error)
      // Fallback to local state if Supabase fails
      const newDepartment: Department = {
        ...departmentData,
        id: Math.max(...get().departments.map(d => d.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((state) => ({ departments: [...state.departments, newDepartment] }))
      return newDepartment
    }
  },

  updateDepartment: async (id, departmentData) => {
    try {
      // Get the old department name before updating
      const state = get()
      const oldDepartment = state.departments.find(d => d.id === id)
      const oldDeptName = oldDepartment?.name
      const newDeptName = departmentData.name

      console.log(`Updating department: "${oldDeptName}" → "${newDeptName}"`)

      // Update the department in Supabase
      const { error } = await supabase
        .from('departments')
        .update({ ...departmentData, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.warn('Error updating department in Supabase:', error)
      }

      // If department name changed, update all users with the old department name
      if (oldDeptName && newDeptName && oldDeptName !== newDeptName) {
        console.log(`Updating users with department: "${oldDeptName}"`)

        // Update in Supabase
        const { error: usersError } = await supabase
          .from('users')
          .update({ department: newDeptName, updated_at: new Date().toISOString() })
          .eq('department', oldDeptName)

        if (usersError) {
          console.warn('Error updating users with new department name:', usersError)
        } else {
          console.log(`Successfully updated users in Supabase`)
        }
      }

      // Update local state
      set((state) => {
        const updatedUsers = state.users.map((user) => {
          if (user.department === oldDeptName && newDeptName) {
            console.log(`Updating user ${user.name}: "${user.department}" → "${newDeptName}"`)
            return { ...user, department: newDeptName, updated_at: new Date().toISOString() }
          }
          return user
        })

        return {
          departments: state.departments.map((department) =>
            department.id === id
              ? { ...department, ...departmentData, updated_at: new Date().toISOString() }
              : department
          ),
          users: updatedUsers,
        }
      })
    } catch (error) {
      console.error('Error updating department:', error)
      // Fallback to local state update
      set((state) => {
        const oldDeptName = state.departments.find(d => d.id === id)?.name
        const newDeptName = departmentData.name
        return {
          departments: state.departments.map((department) =>
            department.id === id
              ? { ...department, ...departmentData, updated_at: new Date().toISOString() }
              : department
          ),
          users: state.users.map((user) =>
            user.department === oldDeptName && newDeptName
              ? { ...user, department: newDeptName }
              : user
          ),
        }
      })
    }
  },

  deleteDepartment: async (id) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        departments: state.departments.filter((department) => department.id !== id),
      }))
    } catch (error) {
      console.error('Error deleting department:', error)
      // Fallback to local state
      set((state) => ({
        departments: state.departments.filter((department) => department.id !== id),
      }))
    }
  },

  fetchDepartments: async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        set(() => ({ departments: data }))
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      // Keep existing local departments if fetch fails
    }
  },

  // Notification Actions
  addNotification: async (notificationData) => {
    try {
      // Dedup removed to allow multiple notifications for the same message (e.g. multiple comments)
      // const existsLocally = get().notifications.some(
      //   (n) => n.message_id === notificationData.message_id && n.user_id === notificationData.user_id
      // )

      // if (existsLocally) {
      //   console.info('Notification dedup: found locally, skipping', notificationData)
      //   return
      // }

      // Check Supabase for existing notification for same message + user
      // We also skip this check to allow multiple notifications
      /*
      try {
        const { data: existing, error: selectError } = await supabase
          .from('notifications')
          .select('*')
          .eq('message_id', notificationData.message_id)
          .eq('user_id', notificationData.user_id)
          .limit(1)

        if (selectError) {
          console.warn('Supabase select error while checking notifications dedup:', selectError.message || selectError)
        } else if (existing && existing.length > 0) {
          console.info('Notification dedup: found in Supabase, skipping', notificationData)
          return
        }
      } catch (err) {
        console.warn('Supabase not available when checking notification dedup, continuing with local only check')
      }
      */

      // Try to persist to Supabase
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select()
          .single()

        if (error) {
          console.warn('Supabase insert error for notification, falling back to local:', error.message || error)
        }

        if (data) {
          // Use returned Supabase row to maintain consistent ids/created_at
          set((state) => ({ notifications: [data as Notification, ...state.notifications] }))
          return
        }
      } catch (supabaseError) {
        console.warn('Supabase unavailable when inserting notification, will add locally')
      }

      // Fallback/local insertion
      const newNotification: Notification = {
        ...notificationData,
        id: Math.max(...get().notifications.map(n => n.id), 0) + 1,
        created_at: new Date().toISOString(),
      }

      set((state) => ({ notifications: [newNotification, ...state.notifications] }))
    } catch (error) {
      console.error('Failed to add notification:', error)
      throw error
    }
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    }))
  },

  markNotificationsAsReadForMessage: (messageId) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.message_id === messageId ? { ...notif, read: true } : notif
      ),
    }))
  },

  getUnreadNotifications: () => {
    const { notifications, currentUser } = get()
    return notifications.filter(
      (n) => n.user_id === currentUser?.id && !n.read
    )
  },

  // Comment Actions
  fetchComments: async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Error fetching comments from Supabase:', error)
      } else if (data) {
        set(() => ({ comments: data as Comment[] }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  },

  addComment: async (commentData) => {
    try {
      // Try Supabase insert first
      let savedComment: Comment | null = null
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([commentData])
          .select()
          .single()

        if (error) {
          console.warn('Supabase insert comment failed, falling back to local', error)
        } else {
          savedComment = data as Comment
        }
      } catch (supabaseError) {
        console.warn('Supabase unavailable for comments, will use local state', supabaseError)
      }

      const newComment: Comment = savedComment || {
        id: Math.max(...get().comments.map(c => c.id), 0) + 1,
        ...commentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add to local state
      set((state) => ({ comments: [...state.comments, newComment] }))

      // Notify message sender (if not the commenter)
      try {
        const message = get().messages.find(m => m.id === newComment.message_id)
        const currentUser = get().currentUser

        if (message && currentUser) {
          // 1. Notify Message Author
          // Try to find author by name (since message.sender stores name)
          const messageAuthor = get().users.find(u => u.name === message.sender) || get().users.find(u => u.email === message.sender)

          if (messageAuthor && messageAuthor.id !== currentUser.id) {
            await get().addNotification({
              message_id: message.id,
              user_id: messageAuthor.id,
              message: `New comment on: ${message.title}`,
              read: false,
            })
          }

          // 2. Notify Parent Comment Author (if reply)
          if (newComment.parent_comment_id) {
            const parentComment = get().comments.find(c => c.id === newComment.parent_comment_id)
            if (parentComment && parentComment.user_id && parentComment.user_id !== currentUser.id) {
              // Don't notify twice if parent author is same as message author
              if (!messageAuthor || messageAuthor.id !== parentComment.user_id) {
                await get().addNotification({
                  message_id: message.id,
                  user_id: parentComment.user_id,
                  message: `${currentUser.name} replied to your comment`,
                  read: false,
                })
              }
            }
          }

          // 3. Notify Message Recipients (if comment is from Message Author)
          // This ensures that if Admin comments on their own message, students get notified
          if (messageAuthor && currentUser.id === messageAuthor.id) {
            let recipientsToNotify: User[] = []

            if (message.recipients === 'all') {
              recipientsToNotify = get().users.filter(u => u.id !== currentUser.id)
            } else if (message.recipients === 'students') {
              recipientsToNotify = get().users.filter(u => u.role === 'student')
            } else if (message.recipients === 'staff') {
              recipientsToNotify = get().users.filter(u => u.role === 'staff')
            } else if (message.recipients === 'admins') {
              recipientsToNotify = get().users.filter(u => u.role === 'admin')
            }

            // Limit to avoid spam if 'all' is huge, but for now notify all found
            for (const recipient of recipientsToNotify) {
              await get().addNotification({
                message_id: message.id,
                user_id: recipient.id,
                message: `New update on: ${message.title}`,
                read: false,
              })
            }
          }
        }

      } catch (notifyErr) {
        console.warn('Failed to create notification for comment:', notifyErr)
      }

      // Handle role mentions like @staff or @students
      try {
        const mentions = (newComment.content || '').match(/@(staff|students|admins)\b/g)
        if (mentions && mentions.length > 0) {
          const roles = Array.from(new Set(mentions.map(m => m.replace('@', ''))))
          const usersToNotify: User[] = []
          for (const role of roles) {
            if (role === 'staff' || role === 'students' || role === 'admins') {
              const roleKey = role === 'students' ? 'student' : role
              usersToNotify.push(...get().users.filter(u => u.role === roleKey))
            }
          }
          for (const u of usersToNotify) {
            await get().addNotification({
              message_id: newComment.message_id,
              user_id: u.id,
              message: `You were mentioned in a comment`,
              read: false,
            })
          }
        }
      } catch (mentionErr) {
        console.warn('Failed to create mention notifications:', mentionErr)
      }

      return newComment
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  },

  updateComment: async (id, commentData) => {
    try {
      // Update local state
      set((state) => ({
        comments: state.comments.map((c) => c.id === id ? { ...c, ...commentData, updated_at: new Date().toISOString() } : c)
      }))

      // Try Supabase
      try {
        const { error } = await supabase
          .from('comments')
          .update({ ...commentData, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) console.warn('Supabase error updating comment:', error)
      } catch (supabaseError) {
        console.warn('Supabase unavailable when updating comment', supabaseError)
      }
    } catch (error) {
      console.error('Failed to update comment locally:', error)
    }
  },

  deleteComment: async (id) => {
    try {
      // Remove from local state
      set((state) => ({ comments: state.comments.filter(c => c.id !== id) }))

      // Try Supabase
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', id)

        if (error) console.warn('Supabase error deleting comment:', error)
      } catch (supabaseError) {
        console.warn('Supabase unavailable when deleting comment', supabaseError)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  },

  // Course Actions
  addCourse: async (courseData) => {
    try {
      console.log('[addCourse] Starting with data:', JSON.stringify(courseData, null, 2))

      // Validate required fields
      if (!courseData.name) {
        throw new Error('Course name is required')
      }
      if (!courseData.department_id) {
        throw new Error('Department ID is required')
      }
      if (!courseData.created_by) {
        throw new Error('Created by is required')
      }

      // Generate a default code if empty (from course name first letters)
      const courseCode = courseData.code && courseData.code.trim()
        ? courseData.code.trim()
        : courseData.name.split(' ').map(w => w[0]).join('').toUpperCase() || 'COURSE'

      console.log('[addCourse] Validation passed, inserting to Supabase...')

      const dataToInsert = {
        ...courseData,
        code: courseCode,
        description: courseData.description || null
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([dataToInsert])
        .select()

      console.log('[addCourse] Supabase response received')
      console.log('[addCourse] Data:', data)
      console.log('[addCourse] Error present:', !!error)

      if (error) {
        console.error('[addCourse] Supabase returned error object')
        console.error('[addCourse] Error keys:', Object.keys(error || {}))

        // Try to extract error information
        let errorMsg = 'Unknown Supabase error'
        if (typeof error === 'object' && error !== null) {
          if ('message' in error) errorMsg = String(error.message)
          if ('code' in error) console.error('[addCourse] Error code:', error.code)
          if ('details' in error) console.error('[addCourse] Error details:', error.details)
          if ('hint' in error) console.error('[addCourse] Error hint:', error.hint)
        }
        throw new Error(`Supabase error: ${errorMsg}`)
      }

      if (data && data.length > 0) {
        console.log('[addCourse] Course inserted successfully')
        set((state) => ({
          courses: [...state.courses, ...data],
        }))
        return data[0] as Course
      }

      console.warn('[addCourse] No data returned from insert, but no error either')
      return null
    } catch (error) {
      console.error('[addCourse] Exception caught')
      console.error('[addCourse] Error type:', typeof error)
      console.error('[addCourse] Error constructor:', error?.constructor?.name)

      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[addCourse] Error message:', errorMessage)

      if (error instanceof Error && error.stack) {
        console.error('[addCourse] Stack trace:', error.stack)
      }

      console.error('[addCourse] CourseData:', JSON.stringify(courseData, null, 2))

      // Fallback: add course optimistically to local state
      try {
        const newCourse: Course = {
          ...courseData,
          id: Math.max(...get().courses.map(c => c.id), 0) + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log('[addCourse] Adding course optimistically')
        set((state) => ({ courses: [...state.courses, newCourse] }))
        return newCourse
      } catch (fallbackError) {
        const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        console.error('[addCourse] Fallback failed:', fallbackMsg)
        throw error
      }
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ ...courseData, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id
            ? { ...course, ...courseData, updated_at: new Date().toISOString() }
            : course
        ),
      }))
    } catch (error) {
      console.error('Error updating course:', {
        message: error instanceof Error ? error.message : String(error),
        error,
        courseId: id,
        courseData,
      })
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id
            ? { ...course, ...courseData, updated_at: new Date().toISOString() }
            : course
        ),
      }))
    }
  },

  deleteCourse: async (id) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
      }))
    } catch (error) {
      console.error('Error deleting course:', {
        message: error instanceof Error ? error.message : String(error),
        error,
        courseId: id,
      })
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
      }))
    }
  },

  fetchCourses: async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        set(() => ({ courses: data }))
      }
    } catch (error) {
      console.error('Error fetching courses:', {
        message: error instanceof Error ? error.message : String(error),
        error,
      })
    }
  },

  // Sub Course Actions
  addSubCourse: async (subCourseData) => {
    try {
      const { data, error } = await supabase
        .from('sub_courses')
        .insert([subCourseData])
        .select()

      if (error) throw error

      if (data) {
        set((state) => ({
          subCourses: [...state.subCourses, ...data],
        }))
      }
    } catch (error) {
      console.error('Error adding sub course:', error)
      const newSubCourse: SubCourse = {
        ...subCourseData,
        id: Math.max(...get().subCourses.map(sc => sc.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((state) => ({ subCourses: [...state.subCourses, newSubCourse] }))
    }
  },

  updateSubCourse: async (id, subCourseData) => {
    try {
      const { error } = await supabase
        .from('sub_courses')
        .update({ ...subCourseData, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        subCourses: state.subCourses.map((subCourse) =>
          subCourse.id === id
            ? { ...subCourse, ...subCourseData, updated_at: new Date().toISOString() }
            : subCourse
        ),
      }))
    } catch (error) {
      console.error('Error updating sub course:', error)
      set((state) => ({
        subCourses: state.subCourses.map((subCourse) =>
          subCourse.id === id
            ? { ...subCourse, ...subCourseData, updated_at: new Date().toISOString() }
            : subCourse
        ),
      }))
    }
  },

  deleteSubCourse: async (id) => {
    try {
      const { error } = await supabase
        .from('sub_courses')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        subCourses: state.subCourses.filter((subCourse) => subCourse.id !== id),
      }))
    } catch (error) {
      console.error('Error deleting sub course:', error)
      set((state) => ({
        subCourses: state.subCourses.filter((subCourse) => subCourse.id !== id),
      }))
    }
  },

  fetchSubCourses: async () => {
    try {
      const { data, error } = await supabase
        .from('sub_courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        set(() => ({ subCourses: data }))
      }
    } catch (error) {
      console.error('Error fetching sub courses:', error)
    }
  },
}))

// Initialize store with data from Supabase if available
if (typeof window !== 'undefined') {
  useStore.getState().fetchUsers()
  useStore.getState().fetchDepartments()
  useStore.getState().fetchCourses()
  useStore.getState().fetchSubCourses()
}
