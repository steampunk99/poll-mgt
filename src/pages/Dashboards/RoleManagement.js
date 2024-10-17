// src/pages/RoleManagement.js
import React, { useEffect } from 'react';
import { useUser } from "../../context/UserContext";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

const RoleManagement = () => {
  const { usersList, fetchUsers, updateUserRole, loading } = useUser();

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border-b p-4">Email</th>
            <th className="border-b p-4">Role</th>
            <th className="border-b p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map(user => (
            <tr key={user.id}>
              <td className="border-b p-4">{user.email}</td>
              <td className="border-b p-4">{user.role}</td>
              <td className="border-b p-4 flex space-x-2">
                <Button onClick={() => updateUserRole(user.id, user.role === "admin" ? "voter" : "admin")}>
                  Toggle Role
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManagement;
