import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  AlertCircle,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    season: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Load user data into form when user changes or on mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        season: user.season || '',
      
      });

      setImagePreview(user.profileImage || user.image || null);
    }
  }, [user]);

  // Clear success message on edit start
  useEffect(() => {
    if (isEditing) {
      setSuccess('');
      setErrors({});
    }
  }, [isEditing]);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setErrors({ general: message });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPEG, PNG, WebP)',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size should be less than 5MB',
      };
    }

    return { isValid: true };
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.isValid) {
      setErrors({ image: validation.error });
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();

      // Backend identifies user from JWT token, so no userId here
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('department', formData.department.trim());
      formDataToSend.append('season', formData.season.trim());

      if (formData.address) {
        formDataToSend.append('address', formData.address.trim());
      }
     

      if (profileImageFile) {
        formDataToSend.append('image', profileImageFile);
      }

      // Debug logs (remove in production)
      console.log('Submitting form data:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const res = await updateProfile(formDataToSend);

      if (res && res.success) {
        setIsEditing(false);
        setProfileImageFile(null);
        showMessage('Profile updated successfully!');
      } else {
        throw new Error(res?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);

      if (error.response?.status === 403) {
        setErrors({ general: 'Access denied. Please log in again.' });
      } else if (error.response?.status === 401) {
        setErrors({ general: 'Your session has expired. Please log in again.' });
      } else {
        setErrors({ general: error.message || 'Failed to update profile. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        season: user.season || '',
       
      });
      setImagePreview(user.profileImage || user.image || null);
      setProfileImageFile(null);
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4 sm:mb-0">
                <div className="h-24 w-24 bg-white rounded-full p-1 shadow-lg">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}

                  {isEditing && (
                    <label
                      htmlFor="profileImageInput"
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        id="profileImageInput"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name and Actions */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      Member since {new Date(user.created_at || user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.image && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-600">{errors.image}</span>
              </div>
            )}

            {errors.general && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-600">{errors.general}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address || 'Not provided'}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Department
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Enter your department"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.department || 'Not provided'}</p>
                  )}
                </div>

                {/* Season */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Season
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        placeholder="Enter your season (e.g., Spring 2023)"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.season ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.season && <p className="mt-1 text-sm text-red-600">{errors.season}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.season || 'Not provided'}</p>
                  )}
                </div>

                {/* Bio (optional - uncomment if needed) */}
                {/* <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.bio || 'No bio provided'}</p>
                  )}
                </div> */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Type */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Type</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
