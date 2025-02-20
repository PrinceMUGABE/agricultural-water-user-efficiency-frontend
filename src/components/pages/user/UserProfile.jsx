/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    console.log("Retrieved user from localStorage:", storedUser);

    if (storedUser && storedUser.id.toString() === id) {
      setUserData(storedUser);
      setFormData({
        phone_number: storedUser.phone,
        email: storedUser.email,
        role: storedUser.role
      });
      console.log("Matching user data:", storedUser);
    }
  }, [id]);

  useEffect(() => {
    if (userData) {
      console.log("User data set in state:", userData);
    }
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

    if (!accessToken) {
      console.error('Access token is missing!');
      return;
    }

    const updatedUser = {
      ...userData,
      phone_number: formData.phone_number,
      email: formData.email,
      role: formData.role,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem('userData', JSON.stringify(updatedData));
        setUserData(updatedData);
        setIsEditing(false);
        console.log('User data updated:', updatedData);
        navigate(`/user/predictions`);
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-lg transition-all">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Profile Info
        </h1>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Phone</strong>
                <span className="text-gray-800 text-lg">{userData.phone}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Email</strong>
                <span className="text-gray-800 text-lg">{userData.email}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Role</strong>
                <span className="text-gray-800 text-lg">{userData.role}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-1">Created At</strong>
                <span className="text-gray-800 text-lg">
                  {new Date(userData.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleEditClick}
                className="px-8 py-3 text-white bg-green-700 hover:bg-black rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="phone_number"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-gray-700 text-sm font-medium mb-2" 
                  htmlFor="role"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleEditClick}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-white bg-green-700 hover:bg-black rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;