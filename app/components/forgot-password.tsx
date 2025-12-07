'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, ArrowLeft } from 'lucide-react'

interface ForgotPasswordProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ForgotPassword({ open, onOpenChange }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { users, updateUser } = useStore()

  const handleVerifyEmail = async () => {
    setError('')
    setLoading(true)

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      setError('Email not found in system')
      setLoading(false)
      return
    }

    if (user.role === 'admin') {
      setError('Admins cannot reset their own password. Please contact system administrator.')
      setLoading(false)
      return
    }

    // Demo: generate a simple verification code
    // In production, this would be sent via email
    const code = Math.random().toString().substring(2, 8)
    sessionStorage.setItem('verificationCode', code)
    sessionStorage.setItem('resetEmail', email)
    sessionStorage.setItem('resetUserId', user.id.toString())

    console.log(`[Demo] Verification code sent to ${email}: ${code}`)
    setStep('verify')
    setLoading(false)
  }

  const handleVerifyCode = () => {
    setError('')

    const storedCode = sessionStorage.getItem('verificationCode')
    if (verificationCode !== storedCode) {
      setError('Invalid verification code')
      return
    }

    setStep('reset')
  }

  const handleResetPassword = async () => {
    setError('')

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const userId = parseInt(sessionStorage.getItem('resetUserId') || '0')
      await updateUser(userId, { password: newPassword })

      // Clear session storage
      sessionStorage.removeItem('verificationCode')
      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetUserId')

      setStep('success')
      setLoading(false)

      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
        setStep('email')
        setEmail('')
        setVerificationCode('')
        setNewPassword('')
        setConfirmPassword('')
      }, 2000)
    } catch {
      setError('Failed to reset password. Please try again.')
      setLoading(false)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        {step === 'email' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter your email address to receive a verification code.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyEmail}
                disabled={!email.trim() || loading}
              >
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A verification code has been sent to <strong>{email}</strong>
              <br />
              <span className="text-xs text-gray-500">[Demo: Check console for code]</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('email')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyCode}
                disabled={!verificationCode.trim()}
              >
                Verify
              </Button>
            </div>
          </div>
        )}

        {step === 'reset' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter your new password.
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('verify')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleResetPassword}
                disabled={!newPassword.trim() || !confirmPassword.trim() || loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 animate-fadeIn" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">Password Reset Successful!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
