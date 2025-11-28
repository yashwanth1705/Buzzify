'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import Sidebar from './components/sidebar'
import Header from './components/header'
import MessageFeed from './components/message-feed'
import CreateMessage from './components/create-message'
import AdminPanel from './components/admin-panel'
import MessageDetail from './components/message-detail'
import AcknowledgementTracker from './components/acknowledgement-tracker'

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, isDarkMode } = useStore()
  const [activeView, setActiveView] = useState('messages')
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    } else {
      // Fetch initial data
      const { fetchMessages, fetchUsers, fetchGroups, fetchDepartments } = useStore.getState()
      fetchMessages()
      fetchUsers()
      fetchGroups()
      fetchDepartments()
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !currentUser) {
    return null
  }

  const renderContent = () => {
    if (selectedMessageId) {
      return (
        <MessageDetail
          messageId={selectedMessageId}
          onBack={() => setSelectedMessageId(null)}
        />
      )
    }

    switch (activeView) {
      case 'messages':
        return <MessageFeed onSelectMessage={setSelectedMessageId} />
      case 'create':
        return <CreateMessage onSuccess={() => setActiveView('messages')} />
      case 'acknowledgements':
        return <AcknowledgementTracker />
      case 'admin':
        return <AdminPanel />
      default:
        return <MessageFeed onSelectMessage={setSelectedMessageId} />
    }
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          onNotificationClick={(messageId: number) => {
            setSelectedMessageId(messageId)
            setActiveView('messages')
          }}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
