import React, { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";

const UserProfilePage = () => {
  const { user, setUser, loading } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name) {
      setError("Name cannot be empty.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: name,
        role: role,
      });
      setUser({ ...user, name, role });
      setEditMode(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className=" py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {user ? (
            <>
              {!editMode ? (
                <div className="space-y-4">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>

                  {user.role === "admin" && (
                    <div className="shadow-lg p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Admin Controls</h3>
                      <p>As an admin, you can manage polls, users, and more.</p>
                    </div>
                  )}

                  {user.role === "voter" && (
                    <div className="shadow-lg p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Voter Dashboard</h3>
                      <p>As a student, you can participate in polls and view results.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <Select value={role} onValueChange={setRole}>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>No profile data available.</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!editMode ? (
            <>
              <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button onClick={handleUpdateProfile}>Save</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfilePage;