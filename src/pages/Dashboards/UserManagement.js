import React, { useEffect, useState } from 'react'
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, UserPlus, Pencil, Trash2, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from '@/components/ui/card'
import { toast } from "@/hooks/use-toast"

export default function UserManagement() {
  const { 
    usersList, 
    fetchUsers, 
    updateUserRole, 
    toggleUserActivation, 
    loading, 
    addUser, 
    deleteUser, 
    resetPassword,
    searchUsers
  } = useUser()
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'voter' })
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers()
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    loadUsers()
  }, [fetchUsers])
  

  useEffect(() => {
    if (searchTerm) {
      searchUsers(searchTerm).then(setFilteredUsers)
    } else {
      setFilteredUsers(usersList)
    }
  }, [searchTerm, usersList, searchUsers])

  const handleAddUser = async (e) => {
    e.preventDefault()
    setIsAddingUser(true)
    try {
      await addUser(newUser.email, newUser.password, newUser.role)
      setNewUser({ email: '', password: '', role: 'voter' })
      Navigate('/dashboard/manage-users')
    } catch (error) {
      console.error("Error adding user:", error)
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleResetPassword = async (email) => {
    try {
      await resetPassword(email)
      toast({
        title: "Password reset email sent",
        description: `A password reset link has been sent to ${email}`,
      })
    } catch (error) {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId)
        toast({
          title: "User deleted successfully",
          description: "The user has been removed from the system",
        })
      } catch (error) {
        toast({
          title: "Error deleting user",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      voter: "bg-green-100 text-green-800"
    }
    return <Badge className={colors[role]}>{role}</Badge>
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">User List</h2>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voter">Voter</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={isAddingUser}>
                      {isAddingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add User
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, user.role === "admin" ? "voter" : "admin")}>
                            Toggle Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserActivation(user.id, user.isActive)}>
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="roles">
          <h2 className="text-2xl font-semibold mb-4">Role Management</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['admin', 'voter'].map((role) => (
                  <TableRow key={role}>
                    <TableCell>{getRoleBadge(role)}</TableCell>
                    <TableCell>{role === 'admin' ? 'Full access to manage users and polls' : 'Can participate in polls'}</TableCell>
                    <TableCell>{usersList.filter(user => user.role === role).length}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => {/* Implement edit role functionality */}}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Users by Role</h3>
            {['admin', 'voter'].map((role) => (
              <div key={role} className="mb-4">
                <h4 className="text-lg font-medium mb-2">{role.charAt(0).toUpperCase() + role.slice(1)}s</h4>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.filter(user => user.role === role).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Actions</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, user.role === "admin" ? "voter" : "admin")}>
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleUserActivation(user.id, user.isActive)}>
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}