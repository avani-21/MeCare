'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/api/patient/auth'
import { toast } from 'sonner'

interface ErrorState {
  password?: string
  confirmPassword?: string
}

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<ErrorState>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors: ErrorState = {}
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long!'
      isValid = false
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter, one number, and one special character!'
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match!'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name as keyof ErrorState]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
    
      const email = localStorage.getItem("email")
    if (!email) {
      toast.error("Email not found. Please try again.")
      return
    }
    let response=await resetPassword(email,formData.password)
       if(response){
        toast.success("Password resetted successfully")
        router.push('/login')
       }
    } catch (error) {
      console.error('Password reset failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-8">Reset Password</h2>
        
        <form onSubmit={handleSubmit} noValidate>
         
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password.trim()}
                onChange={handleChange}
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-400'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="confirmPassword" className="block text-sm mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-400'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirmPassword-error"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-teal-700 hover:bg-teal-600 text-white py-3 rounded-md font-medium transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'SAVE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  )
}