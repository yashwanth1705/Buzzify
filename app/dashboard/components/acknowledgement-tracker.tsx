'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, Clock, Users, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AcknowledgementTracker() {
  const { messages, users, getMessageAcknowledgementDetails, isDarkMode } = useStore()
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Filter messages sent by current user or all for admin
  const messagesToTrack = messages.filter(m => m.acknowledged_by && m.acknowledged_by.length >= 0)

  const getStats = (messageId: number) => {
    const { acknowledged, pending } = getMessageAcknowledgementDetails(messageId)
    const message = messages.find(m => m.id === messageId)
    const total = message?.total_recipients || 0
    const percentage = total > 0 ? Math.round((acknowledged.length / total) * 100) : 0

    return { acknowledged, pending, total, percentage }
  }

  const selectedMessageData = selectedMessage ? messages.find(m => m.id === selectedMessage) : null
  const selectedStats = selectedMessage ? getStats(selectedMessage) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Acknowledgement Tracker</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor which members have acknowledged your messages</p>
      </div>

      {messagesToTrack.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No messages sent yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messagesToTrack.map((message, idx) => {
            const stats = getStats(message.id!)
            return (
              <Card
                key={message.id}
                className={`card-lift cursor-pointer animate-slideUp delay-${Math.min(idx, 12)} hover:shadow-lg transition-all`}
                onClick={() => {
                  setSelectedMessage(message.id!)
                  setDetailsOpen(true)
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{message.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Sent on {formatDate(message.created_at || new Date().toISOString())}
                      </p>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">
                            {stats.acknowledged.length} acknowledged
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-medium">
                            {stats.pending.length} pending
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className={`text-3xl font-bold ${stats.percentage === 100 ? 'text-green-500' : stats.percentage >= 50 ? 'text-blue-500' : 'text-amber-500'}`}>
                        {stats.percentage}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.acknowledged.length}/{stats.total}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessage(message.id!)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300 w-[${stats.percentage}%]`}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedMessageData?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedMessageData && selectedStats && (
            <>
              <Tabs defaultValue="acknowledged" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="acknowledged" className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Acknowledged ({selectedStats.acknowledged.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Pending ({selectedStats.pending.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="acknowledged" className="space-y-3 mt-4">
                  {selectedStats.acknowledged.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No acknowledgements yet</p>
                  ) : (
                    selectedStats.acknowledged.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-200">{user.name}</p>
                          <p className="text-sm text-green-700 dark:text-green-300">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-500 hover:bg-green-600">{user.role}</Badge>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 mt-4">
                  {selectedStats.pending.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">All members have acknowledged!</p>
                  ) : (
                    selectedStats.pending.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-200">{user.name}</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-amber-500 hover:bg-amber-600">{user.role}</Badge>
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Summary</span>
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-500">{selectedStats.acknowledged.length}</p>
                    <p className="text-xs text-gray-500">Acknowledged</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{selectedStats.pending.length}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{selectedStats.percentage}%</p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
