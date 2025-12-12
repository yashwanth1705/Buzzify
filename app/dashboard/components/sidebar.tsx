'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Plus,
  Users,
  Settings,
  X,
  Bell,
  FileText,
  CheckCircle
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  const { currentUser, isDarkMode } = useStore()

  const menuItems = [
    {
      id: 'messages',
      label: 'Message Feed',
      icon: MessageSquare,
      roles: ['admin', 'staff', 'student']
    },
    {
      id: 'create',
      label: 'Create Message',
      icon: Plus,
      roles: ['admin', 'staff', 'student']
    },

    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Settings,
      roles: ['admin']
    }
  ]

  const filteredMenuItems = menuItems.filter(item =>
    currentUser?.role && item.roles.includes(currentUser.role)
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        "shadow-lg",
        isDarkMode ? 'glass-dark border-r border-gray-700' : 'glass border-r border-gray-100',
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Campus Portal
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className={`mb-4 p-3 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/30 backdrop-blur-sm' : 'bg-white/60 backdrop-blur-sm'}`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              {currentUser?.name}
            </p>
            <p className={`text-xs capitalize transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
              {currentUser?.role}
            </p>
          </div>

          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveView(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
