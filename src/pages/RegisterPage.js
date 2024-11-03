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
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Separator } from "@/components/ui/separator"
import Header from '@/components/Header'

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
    <div className="min-h-screen flex">
      <Header />
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2940&auto=format&fit=crop"
          alt="Register background" 
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white p-8 max-w-md">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-200">
              Create an account and start making impactful decisions. Your voice matters in shaping the future.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign up now to get started with your account
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleRegister}
                className="h-11"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FaGoogle className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAppleRegister}
                className="h-11"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FaApple className="mr-2 h-4 w-4" />
                )}
                Apple
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}