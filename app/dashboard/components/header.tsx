'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Bell,
  LogOut,
  Menu,
  User,
  X,
  Sun,
  Moon
} from 'lucide-react'

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
  onNotificationClick?: (messageId: number) => void
}

export default function Header({ setSidebarOpen, onNotificationClick }: HeaderProps) {
  const { currentUser, logout, notifications, isDarkMode, toggleTheme } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadNotifications = notifications?.filter((n) => n.user_id === currentUser?.id && !n.read) || []
  const unreadCount = unreadNotifications.length

  const handleLogout = () => {
    logout()
  }

  return (
    <header className={`transition-colors duration-300 ${isDarkMode
        ? 'bg-gray-800 border-b border-gray-700'
        : 'bg-white border-b border-gray-200'
      } px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className={`text-xl font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <Card className="absolute right-0 top-12 w-80 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {unreadNotifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No new notifications
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unreadNotifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            if (onNotificationClick) {
                              onNotificationClick(notification.message_id)
                            }
                            // Mark this notification as read
                            const { markNotificationAsRead } = useStore.getState()
                            markNotificationAsRead(notification.id)
                            setShowNotifications(false)
                          }}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{currentUser?.name}</span>
          </div>

          {/* Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
