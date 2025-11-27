'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import {
  Users,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  Eye,
  EyeOff,
  Search,
  Plus,
  Trash2 as TrashIcon
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminPanel() {
  const {
    users,
    messages,
    groups,
    departments,
    courses,
    subCourses,
    isDarkMode,
    addUser,
    updateUser,
    deleteUser,
    addGroup,
    updateGroup,
    deleteGroup,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    fetchDepartments,
    fetchUsers,
    fetchMessages,
    fetchGroups,
    fetchCourses,
    fetchSubCourses,
    addCourse,
    addSubCourse
  } = useStore()

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchUsers(),
          fetchMessages(),
          fetchGroups(),
          fetchDepartments(),
          fetchCourses(),
          fetchSubCourses()
        ])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchUsers, fetchMessages, fetchGroups, fetchDepartments, fetchCourses, fetchSubCourses])

  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false)
  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'staff',
    department: '',
    course: '',
    sub_course: '',
    phone_number: '',
    parent_phone: '',
    dob: '',
    blood_group: '',
    responsible_staff: '',
  })
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    departments: [] as string[],
    members: [] as string[],
  })
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [memberTab, setMemberTab] = useState('all')

  // Course Management State
  const [tempCourses, setTempCourses] = useState<{
    id: string; // temporary ID
    name: string;
    code: string;
    description: string;
    subCourses: { name: string; code: string; description: string }[];
  }[]>([])
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseCode, setNewCourseCode] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [activeCourseId, setActiveCourseId] = useState<string | number | null>(null)
  const [newSubCourseName, setNewSubCourseName] = useState('')
  const [newSubCourseCode, setNewSubCourseCode] = useState('')
  const [newSubCourseDescription, setNewSubCourseDescription] = useState('')

  // Statistics
  const totalUsers = users.length
  const totalMessages = messages.length
  const totalStudents = users.filter(u => u.role === 'student').length
  const totalStaff = users.filter(u => u.role === 'staff').length
  const averageReadRate = messages.length > 0
    ? Math.round(messages.reduce((acc, msg) => acc + (msg.read_count / msg.total_recipients * 100), 0) / messages.length)
    : 0
  const pendingAcknowledgements = messages.filter(msg => !msg.acknowledged).length

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'student',
      department: '',
      course: '',
      sub_course: '',
      phone_number: '',
      parent_phone: '',
      dob: '',
      blood_group: '',
      responsible_staff: '',
    })
  }

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      departments: [],
      members: [],
    })
  }

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: '',
      description: '',
    })
  }

  const handleAddDepartment = async () => {
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, departmentForm)
      setEditingDepartment(null)
    } else {
      const newDept = await addDepartment({
        ...departmentForm,
        created_by: 'admin@college.edu', // Current admin user
      })

      // If department created successfully and we have temp courses, create them
      if (newDept && tempCourses.length > 0) {
        for (const course of tempCourses) {
          const newCourse = await addCourse({
            name: course.name,
            code: course.code,
            description: course.description,
            department_id: newDept.id,
            created_by: 'admin@college.edu'
          })

          if (newCourse && course.subCourses.length > 0) {
            for (const subCourse of course.subCourses) {
              await addSubCourse({
                name: subCourse.name,
                code: subCourse.code,
                description: subCourse.description,
                course_id: newCourse.id,
                created_by: 'admin@college.edu'
              })
            }
          }
        }
      }
    }
    resetDepartmentForm()
    setTempCourses([]) // Clear temp courses
    setShowAddDepartmentDialog(false)
    // Refresh all data
    await Promise.all([
      fetchDepartments(),
      fetchCourses(),
      fetchSubCourses()
    ])
  }

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department)
    setDepartmentForm({
      name: department.name,
      description: department.description,
    })
    setShowAddDepartmentDialog(true)
  }

  const handleDeleteDepartment = async (departmentId: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDepartment(departmentId)
      // Refresh departments from database
      await fetchDepartments()
    }
  }

  const handleAddGroup = async () => {
    if (editingGroup) {
      await updateGroup(editingGroup.id, groupForm)
      setEditingGroup(null)
    } else {
      await addGroup({
        ...groupForm,
        created_by: 'admin@college.edu', // Current admin user
      })
    }
    resetGroupForm()
    setShowAddGroupDialog(false)
    await fetchGroups()
  }

  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setGroupForm({
      name: group.name,
      description: group.description,
      departments: group.departments || [],
      members: group.members,
    })
    setShowAddGroupDialog(true)
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      await deleteGroup(groupId)
      await fetchGroups()
    }
  }

  const generateEmail = async (name: string): Promise<string> => {
    // Convert name to lowercase and replace spaces with dots
    const baseEmail = name.toLowerCase().replace(/\s+/g, '.') + '@college.edu'

    // Check if email already exists
    const existingUser = users.find(user => user.email === baseEmail)

    if (!existingUser) {
      return baseEmail
    }

    // If email exists, add random numbers until we find a unique one
    let counter = 1
    while (counter < 1000) { // Prevent infinite loop
      const randomNum = Math.floor(Math.random() * 1000) + 1
      const newEmail = `${name.toLowerCase().replace(/\s+/g, '.')}${randomNum}@college.edu`

      const emailExists = users.find(user => user.email === newEmail)
      if (!emailExists) {
        return newEmail
      }
      counter++
    }

    // Fallback if we can't find a unique email
    return `${name.toLowerCase().replace(/\s+/g, '.')}${Date.now()}@college.edu`
  }

  const handleAddUser = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, userForm)
      setEditingUser(null)
    } else {
      // Auto-generate email if not provided
      let emailToUse = userForm.email
      if (!emailToUse.trim() && userForm.name.trim()) {
        emailToUse = await generateEmail(userForm.name)
      }

      await addUser({
        ...userForm,
        email: emailToUse,
        status: 'active',
        age: userForm.dob ? new Date().getFullYear() - new Date(userForm.dob).getFullYear() : undefined,
      })
    }
    resetUserForm()
    setShowAddUserDialog(false)
    await fetchUsers()
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      department: user.department || '',
      course: user.course || '',
      sub_course: user.sub_course || '',
      phone_number: user.phone_number || '',
      parent_phone: user.parent_phone || '',
      dob: user.dob || '',
      blood_group: user.blood_group || '',
      responsible_staff: user.responsible_staff || '',
    })
    setShowAddUserDialog(true)
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId)
      await fetchUsers()
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    await updateUser(userId, {
      status: currentStatus === 'active' ? 'inactive' : 'active'
    })
    await fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <Spinner size="sm" className="border-indigo-500" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex space-x-4 border-b">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'departments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'groups' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                      <p className="text-2xl font-bold">{totalMessages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Read Rate</p>
                      <p className="text-2xl font-bold">{averageReadRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Acks</p>
                      <p className="text-2xl font-bold">{pendingAcknowledgements}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 5).map((message, idx) => (
                    <div key={message.id} className={`flex items-center justify-between p-4 border rounded-lg animate-slideUp delay-${Math.min(idx, 12)}`}>
                      <div>
                        <h4 className="font-medium">{message.title}</h4>
                        <p className="text-sm text-gray-600">
                          By {message.sender} • {formatDate(message.created_at || '')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          message.priority === 'high' ? 'destructive' :
                            message.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {message.priority}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {message.read_count}/{message.total_recipients} read
                        </span>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">User Management</h3>
              <Button onClick={() => setShowAddUserDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                          User
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                          Role
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                          Department
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                          Status
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                      }`}>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                {user.name}
                              </div>
                              <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'staff'
                                ? 'bg-yellow-300 text-yellow-900'
                                : 'bg-blue-100 text-blue-800'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                            {user.department || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.status)}
                            >
                              {user.status === 'active' ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Department Management</h3>
              <Button onClick={() => setShowAddDepartmentDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <Card key={department.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Students</span>
                          <span className="text-lg font-bold">
                            {users.filter(u => u.department === department.name && u.role === 'student').length}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Staff</span>
                          <span className="text-lg font-bold">
                            {users.filter(u => u.department === department.name && u.role === 'staff').length}
                          </span>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Group Management</h3>
              <Button onClick={() => setShowAddGroupDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {group.members.length} members
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message Retention Period (days)
                    </label>
                    <Input type="number" defaultValue="365" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max File Upload Size (MB)
                    </label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Acknowledgement Timeout (hours)
                    </label>
                    <Input type="number" defaultValue="24" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Notifications
                    </label>
                    <Select defaultValue="enabled">
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only admins can set passwords for new users. Users can change their own password via Settings.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm({ ...userForm, role: value as 'student' | 'staff' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Select
                  value={userForm.department}
                  onValueChange={(value) => setUserForm({ ...userForm, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={userForm.phone_number}
                  onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })}
                />
              </div>
              {userForm.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course</label>
                    <Select
                      value={userForm.course}
                      onValueChange={(value) => setUserForm({ ...userForm, course: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter(course => {
                            const selectedDept = departments.find(d => d.name === userForm.department)
                            return selectedDept && course.department_id === selectedDept.id
                          })
                          .map((course) => (
                            <SelectItem key={course.id} value={course.name}>
                              {course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sub Course</label>
                    <Select
                      value={userForm.sub_course}
                      onValueChange={(value) => setUserForm({ ...userForm, sub_course: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub course" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCourses
                          .filter(subCourse => {
                            const selectedCourse = courses.find(c => c.name === userForm.course)
                            return selectedCourse && subCourse.course_id === selectedCourse.id
                          })
                          .map((subCourse) => (
                            <SelectItem key={subCourse.id} value={subCourse.name}>
                              {subCourse.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Parent Phone</label>
                    <Input
                      value={userForm.parent_phone}
                      onChange={(e) => setUserForm({ ...userForm, parent_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Responsible Staff</label>
                    <Select
                      value={userForm.responsible_staff}
                      onValueChange={(value) => setUserForm({ ...userForm, responsible_staff: value })}
                      disabled={!userForm.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={userForm.department ? "Select responsible staff" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {userForm.department && users
                          .filter((user) => user.role === 'staff' && user.department === userForm.department)
                          .map((staff) => (
                            <SelectItem key={staff.id} value={staff.name}>
                              {staff.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={userForm.dob}
                  onChange={(e) => setUserForm({ ...userForm, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Blood Group</label>
                <Select
                  value={userForm.blood_group}
                  onValueChange={(value) => setUserForm({ ...userForm, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddUserDialog(false)
                  setEditingUser(null)
                  resetUserForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Group Dialog */}
      <Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name *</label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Departments (Select one or more)</label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-white space-y-2">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <div key={dept.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dept-${dept.id}`}
                          checked={groupForm.departments.includes(dept.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupForm({
                                ...groupForm,
                                departments: [...groupForm.departments, dept.name],
                              })
                            } else {
                              setGroupForm({
                                ...groupForm,
                                departments: groupForm.departments.filter((d) => d !== dept.name),
                              })
                            }
                          }}
                        />
                        <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                          {dept.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No departments available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {groupForm.departments.length} department{groupForm.departments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Enter group description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Members</label>
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const departmentUsers = users.filter((user) => groupForm.departments.includes(user.department || ''))
                      setGroupForm({
                        ...groupForm,
                        members: departmentUsers.map((user) => user.email),
                      })
                    }}
                    disabled={groupForm.departments.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setGroupForm({
                        ...groupForm,
                        members: [],
                      })
                    }}
                  >
                    Deselect All
                  </Button>
                </div>
                <div className={`border rounded-md p-3 max-h-48 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                  {groupForm.departments.length > 0 ? (
                    users
                      .filter((user) => groupForm.departments.includes(user.department || ''))
                      .map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 py-2">
                          <input
                            type="checkbox"
                            id={`member-${user.id}`}
                            checked={groupForm.members.includes(user.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupForm({
                                  ...groupForm,
                                  members: [...groupForm.members, user.email],
                                })
                              } else {
                                setGroupForm({
                                  ...groupForm,
                                  members: groupForm.members.filter((email) => email !== user.email),
                                })
                              }
                            }}
                          />
                          <label htmlFor={`member-${user.id}`} className="text-sm cursor-pointer">
                            {user.name} ({user.email})
                          </label>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">Please select at least one department first</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {groupForm.members.length} member{groupForm.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddGroupDialog(false)
                  setEditingGroup(null)
                  resetGroupForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddGroup}>
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Group Dialog */}
      < Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog} >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name *</label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Departments (Select one or more)</label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-white space-y-2">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <div key={dept.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dept-${dept.id}`}
                          checked={groupForm.departments.includes(dept.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupForm({
                                ...groupForm,
                                departments: [...groupForm.departments, dept.name],
                              })
                            } else {
                              setGroupForm({
                                ...groupForm,
                                departments: groupForm.departments.filter((d) => d !== dept.name),
                              })
                            }
                          }}
                        />
                        <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                          {dept.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No departments available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {groupForm.departments.length} department{groupForm.departments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Enter group description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Members</label>

                {/* Search and Filter */}
                <div className="space-y-3 mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Tabs value={memberTab} onValueChange={setMemberTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="student">Students</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 active:scale-95 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                    onClick={() => {
                      const departmentUsers = users.filter((user) => groupForm.departments.includes(user.department || ''))
                      setGroupForm({
                        ...groupForm,
                        members: departmentUsers.map((user) => user.email),
                      })
                    }}
                    disabled={groupForm.departments.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 active:scale-95 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                    onClick={() => {
                      const studentUsers = users.filter((user) => groupForm.departments.includes(user.department || '') && user.role === 'student')
                      setGroupForm({
                        ...groupForm,
                        members: studentUsers.map((user) => user.email),
                      })
                    }}
                    disabled={groupForm.departments.length === 0}
                  >
                    Select Students
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 active:scale-95 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                    onClick={() => {
                      const staffUsers = users.filter((user) => groupForm.departments.includes(user.department || '') && user.role === 'staff')
                      setGroupForm({
                        ...groupForm,
                        members: staffUsers.map((user) => user.email),
                      })
                    }}
                    disabled={groupForm.departments.length === 0}
                  >
                    Select Staff
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 active:scale-95 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setGroupForm({
                        ...groupForm,
                        members: [],
                      })
                    }}
                  >
                    Deselect All
                  </Button>
                </div>
                <div className={`border rounded-md p-3 max-h-60 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                  {groupForm.departments.length > 0 ? (
                    users
                      .filter((user) => {
                        const inDepartment = groupForm.departments.includes(user.department || '')
                        const matchesSearch = user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(memberSearch.toLowerCase())
                        const matchesRole = memberTab === 'all' || user.role === memberTab
                        return inDepartment && matchesSearch && matchesRole
                      })
                      .map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2">
                          <input
                            type="checkbox"
                            id={`member-${user.id}`}
                            checked={groupForm.members.includes(user.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupForm({
                                  ...groupForm,
                                  members: [...groupForm.members, user.email],
                                })
                              } else {
                                setGroupForm({
                                  ...groupForm,
                                  members: groupForm.members.filter((email) => email !== user.email),
                                })
                              }
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`member-${user.id}`} className="text-sm cursor-pointer flex items-center gap-2 flex-1">
                            <span>{user.name} ({user.email})</span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] h-5 px-2 capitalize border ${user.role === 'admin'
                                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800'
                                : user.role === 'staff'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800'
                                  : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800'
                                }`}
                            >
                              {user.role}
                            </Badge>
                          </label>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">Please select at least one department first</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {groupForm.members.length} member{groupForm.members.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddGroupDialog(false)
                    setEditingGroup(null)
                    resetGroupForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddGroup}>
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Department Dialog */}
      <Dialog open={showAddDepartmentDialog} onOpenChange={setShowAddDepartmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department Name *</label>
                <Input
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  placeholder="Enter department description"
                />
              </div>

              {/* Course and Sub-course Management */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Courses & Sub-courses</h4>

                <div className="space-y-4 mb-4">
                  {/* List of Courses */}
                  {(editingDepartment ? courses.filter(c => c.department_id === editingDepartment.id) : tempCourses).map((course: any) => (
                    <div key={course.id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{course.name} <span className="text-xs text-muted-foreground">({course.code})</span></h5>
                          <p className="text-xs text-muted-foreground">{course.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={async () => {
                            if (editingDepartment) {
                              if (confirm('Delete this course?')) {
                                await useStore.getState().deleteCourse(course.id)
                                await fetchCourses()
                              }
                            } else {
                              setTempCourses(tempCourses.filter(c => c.id !== course.id))
                            }
                          }}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Sub-courses List */}
                      <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-1 space-y-2">
                        {(editingDepartment
                          ? subCourses.filter(sc => sc.course_id === course.id)
                          : course.subCourses
                        ).map((subCourse: any) => (
                          <div key={subCourse.id || subCourse.name} className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-2 rounded border">
                            <span>{subCourse.name} ({subCourse.code})</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-red-500"
                              onClick={async () => {
                                if (editingDepartment) {
                                  if (confirm('Delete this sub-course?')) {
                                    await useStore.getState().deleteSubCourse(subCourse.id)
                                    await fetchSubCourses()
                                  }
                                } else {
                                  setTempCourses(tempCourses.map(c => {
                                    if (c.id === course.id) {
                                      return {
                                        ...c,
                                        subCourses: c.subCourses.filter((sc: any) => sc.name !== subCourse.name)
                                      }
                                    }
                                    return c
                                  }))
                                }
                              }}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {/* Add Sub-course Input */}
                        <div className="flex gap-2 items-center mt-2">
                          <Input
                            placeholder="Sub-course Name"
                            className="h-7 text-xs"
                            value={activeCourseId === course.id ? newSubCourseName : ''}
                            onChange={(e) => {
                              setActiveCourseId(course.id)
                              setNewSubCourseName(e.target.value)
                            }}
                          />
                          <Input
                            placeholder="Code"
                            className="h-7 w-20 text-xs"
                            value={activeCourseId === course.id ? newSubCourseCode : ''}
                            onChange={(e) => setNewSubCourseCode(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 text-xs"
                            disabled={activeCourseId !== course.id || !newSubCourseName}
                            onClick={async () => {
                              if (editingDepartment) {
                                await addSubCourse({
                                  name: newSubCourseName,
                                  code: newSubCourseCode,
                                  description: newSubCourseDescription,
                                  course_id: course.id,
                                  created_by: 'admin@college.edu'
                                })
                                await fetchSubCourses()
                              } else {
                                setTempCourses(tempCourses.map(c => {
                                  if (c.id === course.id) {
                                    return {
                                      ...c,
                                      subCourses: [...c.subCourses, {
                                        name: newSubCourseName,
                                        code: newSubCourseCode,
                                        description: newSubCourseDescription
                                      }]
                                    }
                                  }
                                  return c
                                }))
                              }
                              setNewSubCourseName('')
                              setNewSubCourseCode('')
                              setNewSubCourseDescription('')
                              setActiveCourseId(null)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Course */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-dashed">
                  <h5 className="text-xs font-medium mb-2 uppercase text-muted-foreground">Add New Course</h5>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Course Name"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Course Code"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Description"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    className="h-8 text-sm mb-2"
                  />
                  <Button
                    size="sm"
                    className="w-full h-8"
                    disabled={!newCourseName}
                    onClick={async () => {
                      if (editingDepartment) {
                        await addCourse({
                          name: newCourseName,
                          code: newCourseCode,
                          description: newCourseDescription,
                          department_id: editingDepartment.id,
                          created_by: 'admin@college.edu'
                        })
                        await fetchCourses()
                      } else {
                        setTempCourses([...tempCourses, {
                          id: Date.now().toString(),
                          name: newCourseName,
                          code: newCourseCode,
                          description: newCourseDescription,
                          subCourses: []
                        }])
                      }
                      setNewCourseName('')
                      setNewCourseCode('')
                      setNewCourseDescription('')
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Course
                  </Button>
                </div>
              </div>

              {editingDepartment && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Students in Department</h4>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                      {users.filter(u => u.department === editingDepartment.name && u.role === 'student').length > 0 ? (
                        <div className="space-y-2">
                          {users
                            .filter(u => u.department === editingDepartment.name && u.role === 'student')
                            .map(student => (
                              <div key={student.id} className="text-sm flex justify-between items-center">
                                <span>{student.name}</span>
                                <span className="text-xs text-gray-500">{student.email}</span>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No students assigned</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Staff in Department</h4>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                      {users.filter(u => u.department === editingDepartment.name && u.role === 'staff').length > 0 ? (
                        <div className="space-y-2">
                          {users
                            .filter(u => u.department === editingDepartment.name && u.role === 'staff')
                            .map(staff => (
                              <div key={staff.id} className="text-sm flex justify-between items-center">
                                <span>{staff.name}</span>
                                <span className="text-xs text-gray-500">{staff.email}</span>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No staff assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDepartmentDialog(false)
                  setEditingDepartment(null)
                  resetDepartmentForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDepartment}>
                {editingDepartment ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
