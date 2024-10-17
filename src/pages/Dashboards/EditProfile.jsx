'use client'

import React, { useState } from "react";
import { Button } from "../..//components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";

export function EditProfileForm({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, role });
  };

  return (
    (<form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button type="submit">Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>)
  );
}

export default EditProfileForm