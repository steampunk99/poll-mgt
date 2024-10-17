'use client'

import React from "react";

export function ProfileInfo({ user }) {
  return (
    (<div className="space-y-4">
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>)
  );
}

export default ProfileInfo