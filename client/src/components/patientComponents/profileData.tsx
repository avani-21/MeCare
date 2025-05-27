'use client';

import { getProfile, updateProfile, changePassword } from '@/lib/api/patient/patient';
import { IPatient } from '@/type/patient';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState } from '@/type/patient';
import img from "../../../public/logo.png"

const UserProfile = () => {
  const [userData, setUserData] = useState<IPatient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [editedData, setEditedData] = useState<Partial<IPatient>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState & { age?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const fetchData = async () => {
    try {
      const response = await getProfile();
      if (response.data.data) {
        setUserData(response.data.data);
        setEditedData(response.data.data);
        setImagePreviewUrl(response.data.data.profileImage || null);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = () => {
    if (userData) {
      setIsEditModalOpen(true);
      setSelectedFile(null);
      setError({}); // Clear errors when opening modal
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      // Prevent negative age
      if (parseInt(value) < 0) {
        setError(prev => ({ ...prev, age: 'Age cannot be negative' }));
        return;
      } else {
        setError(prev => ({ ...prev, age: undefined }));
      }
    }
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImagePreviewUrl(editedData.profileImage || null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for age validation before submitting
    if (error.age) {
      toast.error('Please correct the age field');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append("name", editedData.name || "");
      formData.append("phone", editedData.phone || "");
      formData.append("age", String(editedData.age || ""));
      formData.append("street", editedData.street || "");
      formData.append("city", editedData.city || "");
      formData.append("gender", editedData.gender || "");
      
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }
  
      const response = await updateProfile(formData);
      
      if (response?.data?.success) {
        toast.success('Profile updated successfully');
        await fetchData();
        setIsEditModalOpen(false);
      } else {
        toast.error(response?.data?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Update failed:', error.message);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSave = async () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    let tempError: ErrorState = {};

    if (!passwordData.newPassword) {
      tempError.newPassword = "Password is required";
    } else if (passwordData.newPassword.length < 6) {
      tempError.newPassword = "Password must be at least 6 characters long!";
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      tempError.newPassword = "Password must contain at least one letter, one number, and one special character!";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      tempError.confirmPassword = "Passwords do not match!";
    }

    if (Object.keys(tempError).length > 0) {
      setError(tempError);
      return;
    }

    try {
      const response = await changePassword({
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (response?.data.success) {
        toast.success("Password changed successfully");
        setIsChangePasswordModalOpen(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex items-start gap-8">
        <div className="w-20 h-20 rounded-full overflow-hidden relative">
          <Image
            src={userData?.profileImage || img}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2">{userData?.name ?? 'Loading...'}</h2>
          <hr className="border-t border-gray-300 mb-4" />

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Contact Information</h3>
            <p><span className="font-medium">Email id:</span> <a href={`mailto:${userData?.email}`} className="text-blue-500">{userData?.email}</a></p>
            <p><span className="font-medium">Phone:</span> <a href={`tel:${userData?.phone}`} className="text-blue-500">{userData?.phone}</a></p>
            <p><span className="font-medium">Address:</span> {userData?.street}, {userData?.city}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Basic Information</h3>
            <p><span className="font-medium">Gender:</span> {userData?.gender}</p>
            <p><span className="font-medium">Age:</span> {userData?.age}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 border border-gray-400 rounded-full hover:bg-teal-200 transition"
            >
              Edit
            </button>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-4 py-2 border border-gray-400 rounded-full hover:bg-teal-200 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4 flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={imagePreviewUrl || img}
                    alt="Profile Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <label htmlFor="profileImageInput" className="mt-2 text-sm text-gray-600 cursor-pointer hover:underline">
                  Change Profile Image
                </label>
                <input
                  type="file"
                  id="profileImageInput"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editedData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Age</label>
                <input
                  type="number"
                  name="age"
                  value={editedData.age || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                {error.age && (
                  <p className="text-red-500 text-sm mt-1">{error.age}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block font-medium">Street</label>
                <input
                  type="text"
                  name="street"
                  value={editedData.street || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={editedData.city || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Gender</label>
                <select
                  name="gender"
                  value={editedData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded"
                  disabled={loading || !!error.age}
                >
                  {loading ? "Updating ...." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="mb-4">
              <label className="block font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              {error.newPassword && (
                <p className="text-red-500 text-sm mt-1">{error.newPassword}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              {error.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePasswordSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;