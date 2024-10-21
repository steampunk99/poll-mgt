import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginWithEmail, loginWithGoogle, loginWithApple } from '../auth/auth'
import { Link } from 'react-router-dom'
import { FaGoogle, FaApple } from 'react-icons/fa'
import loginBG from '../assets/Green and Pink Voter Education Flyers.png'
import { useUser } from '@/context/UserContext'
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, getDocs,addDoc ,collection, updateDoc, setDoc, deleteDoc } from "firebase/firestore"
import Header from '@/components/Header'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const {user} = useUser()

  // audit logs
    // audit log
    const logUserAction = async (userId, action, details = {}) => {
      try {
        await addDoc(collection(db, 'auditLogs'), {
          userId,
          action,
          timestamp: new Date(),
          details
        });
      } catch (err) {
        console.error("Error logging user action:", err);
      }
    };

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    try {
      await loginWithEmail(email, password)
      await logUserAction(user?.uid, 'login user', { email });
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setSuccess(false)
    try {
      await loginWithGoogle()
      await logUserAction(user?.uid, 'login user', { email });
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAppleLogin = async () => {
    setError(null)
    setSuccess(false)
    try {
      await loginWithApple()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Header className="mb-6" />
      <div className="relative hidden min-h-screen w-full  lg:block lg:w-1/2  items-center justify-center">
        <img 
          src="https://www.psfuganda.org/images/gallery/AFR_3030.jpg"
          alt="Login illustration" 
          className=" rounded-lg absolute w-full h-screen object-cover" 
          
        />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 bg-card text-card-foreground  p-8">
          <h2 className="text-3xl font-bold text-center">LOGIN</h2>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>Login successful!</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full">LOGIN</Button>
          </form>
          <div className="flex flex-col space-y-4">
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
              <FaGoogle className="mr-2" /> Login with Google
            </Button>
            <Button onClick={handleAppleLogin} variant="outline" className="w-full">
              <FaApple className="mr-2" /> Login with Apple
            </Button>
          </div>
          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}