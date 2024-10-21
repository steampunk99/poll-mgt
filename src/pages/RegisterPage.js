'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerWithEmail, loginWithGoogle, loginWithApple } from '../auth/auth'
import { Link } from 'react-router-dom'
import { FaGoogle, FaApple } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'
import { useToast } from "../hooks/use-toast"
import loginBG from '../assets/REG.png'
import Header from '@/components/Header'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const { toast } = useToast()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    try {
      await registerWithEmail(email, password)
      toast({
        title: "Registration Successful",
        description: "You have successfully registered!",
        duration: 5000,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setLoading(true)
    try {
      await loginWithGoogle(navigate)
      toast({
        title: "Registration Successful",
        description: "You have successfully registered with Google!",
        duration: 5000,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleRegister = async () => {
    setError(null)
    setLoading(true)
    try {
      await loginWithApple()
      toast({
        title: "Registration Successful",
        description: "You have successfully registered with Apple!",
        duration: 5000,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Header/>
      <div className="hidden relative lg:block lg:w-1/2 bg-background">
        <img 
          src="https://www.psfuganda.org/images/gallery/AFR_3030.jpg"
          alt="Register illustration" 
          className="w-full absolute h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 bg-card text-card-foreground p-8">
          <h2 className="text-3xl font-bold text-center">CREATE ACCOUNT</h2>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register
            </Button>
          </form>
          <div className="flex flex-col space-y-4">
            <Button onClick={handleGoogleRegister} variant="outline" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaGoogle className="mr-2 h-4 w-4 text-[#4285F4]" />
              )}
              Register with Google
            </Button>
            <Button onClick={handleAppleRegister} variant="outline" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaApple className="mr-2 h-4 w-4 text-[#000000]" />
              )}
              Register with Apple
            </Button>
          </div>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}