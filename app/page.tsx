'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { Sun, Moon } from 'lucide-react'
import ForgotPassword from './components/forgot-password'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const router = useRouter()
  const { login, isDarkMode, toggleTheme } = useStore()

  useEffect(() => {
    // Apply theme to document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!selectedRole) {
      setError('Please select a role')
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Password is required')
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const success = await login(email, password, selectedRole)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid credentials or role selection')
        setLoading(false)
        return // Don't continue to finally block
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
      return // Don't continue to finally block
    }

    // Only reached if login was successful
    setLoading(false)
  }


  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 to-gray-800'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
      <div className="w-full max-w-md space-y-6">
        {/* Theme Toggle Button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`rounded-full p-2 ${isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
              }`}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="text-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Buzzify
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Select your role and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Role</Label>
                <div className="flex space-x-2">
                  {['admin', 'staff', 'student'].map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={selectedRole === role ? 'default' : 'outline'}
                      onClick={() => setSelectedRole(role)}
                      className="flex-1"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center mb-4">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center mt-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot Password?
                </Button>
              </div>
            </form>


          </CardContent>
        </Card>
      </div>

      <ForgotPassword open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </div >
  )
}
