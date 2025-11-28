'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Settings as SettingsIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SystemSettings {
  messageRetention: number
  maxFileUpload: number
  acknowledgementTimeout: number
  emailNotifications: string
}

export default function CombinedSettings() {
  const { currentUser, updateUser, isDarkMode } = useStore()
  
  // Settings tabs state
  const [activeSettingsTab, setActiveSettingsTab] = useState('account')
  
  // Password management state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    messageRetention: 365,
    maxFileUpload: 10,
    acknowledgementTimeout: 24,
    emailNotifications: 'enabled',
  })
  const [systemSuccess, setSystemSuccess] = useState('')
  const [systemLoading, setSystemLoading] = useState(false)

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    // Validation
    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password')
      return
    }

    if (currentPassword !== currentUser?.password) {
      setPasswordError('Current password is incorrect')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setPasswordLoading(true)

    try {
      if (currentUser) {
        await updateUser(currentUser.id, { password: newPassword })
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 3000)
      }
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    setSystemSuccess('')
    setSystemLoading(true)

    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 500))
      setSystemSuccess('System settings saved successfully!')
      setTimeout(() => setSystemSuccess(''), 3000)
    } catch (err) {
      setSystemSuccess('Failed to save settings')
    } finally {
      setSystemLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser?.role === 'admin' && (
                <div className={`mb-4 p-3 rounded-lg flex space-x-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border border-blue-800' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    As an admin, you can change your own password here. To change other users' passwords, use the User Management section.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minimum 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className={`p-3 rounded-lg flex space-x-2 ${
                    isDarkMode 
                      ? 'bg-red-900/20 border border-red-800' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                    <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                      {passwordError}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className={`p-3 rounded-lg flex space-x-2 ${
                    isDarkMode 
                      ? 'bg-green-900/20 border border-green-800' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                      {passwordSuccess}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>
                    Message Retention Period (days)
                  </label>
                  <Input
                    type="number"
                    value={systemSettings.messageRetention}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        messageRetention: parseInt(e.target.value) || 0,
                      })
                    }
                    className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Messages older than this will be archived
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>
                    Max File Upload Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={systemSettings.maxFileUpload}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxFileUpload: parseInt(e.target.value) || 0,
                      })
                    }
                    className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Maximum file size allowed for uploads
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>
                    Acknowledgement Timeout (hours)
                  </label>
                  <Input
                    type="number"
                    value={systemSettings.acknowledgementTimeout}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        acknowledgementTimeout: parseInt(e.target.value) || 0,
                      })
                    }
                    className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Time to wait before marking as timed out
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>
                    Email Notifications
                  </label>
                  <Select
                    value={systemSettings.emailNotifications}
                    onValueChange={(value) =>
                      setSystemSettings({
                        ...systemSettings,
                        emailNotifications: value,
                      })
                    }
                  >
                    <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Send email notifications for important events
                  </p>
                </div>
              </div>

              {systemSuccess && (
                <div className={`p-3 rounded-lg flex space-x-2 ${
                  isDarkMode 
                    ? 'bg-green-900/20 border border-green-800' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                    {systemSuccess}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSystemSettings}
                  disabled={systemLoading}
                >
                  {systemLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
