import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../../services/api';
import { getUserIssues } from '../../services/api';
import Layout from '../../components/layout/Layout';
import IssuesList from '../../components/issues/IssuesList';
import Button from '../../components/ui/Button';
import { Tab } from '@headlessui/react';
import { UserProfile } from '../../types/user';
import { openModal } from '../../store/slices/uiSlice';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for editing profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    regionId: '',
  });
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const profileData = await getUserProfile(user.uid);
        setProfile(profileData.user);
        
        // Initialize form data
        setFormData({
          firstName: profileData.user.firstName,
          lastName: profileData.user.lastName,
          bio: profileData.user.bio || '',
          phone: profileData.user.phone,
          regionId: profileData.user.region.id,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile.user);
      setIsEditing(false);
      
      // Show success message
      // You can use your notification system here
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleUploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    try {
      const result = await uploadProfilePicture(file);
      
      // Update profile with new picture URL
      if (profile) {
        setProfile({
          ...profile,
          profilePictureUrl: result.profilePictureUrl,
        });
      }
      
      // Show success message
      // You can use your notification system here
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
    }
  };
  
  // If loading
  if (isLoading) {
    return (
      <Layout title="Profile - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue" />
          </div>
        </div>
      </Layout>
    );
  }
  
  // If not authenticated
  if (!isAuthenticated) {
    return (
      <Layout title="Sign In Required - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your profile.</p>
            <Button variant="primary" onClick={() => dispatch(openModal('login'))}>
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If error
  if (error) {
    return (
      <Layout title="Error - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If profile not found
  if (!profile) {
    return (
      <Layout title="Profile Not Found - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-8">Could not load your profile information.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="My Profile - Hal Qilamiz">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* ... rest of the profile content ... */}
        </div>
      </div>
    </Layout>
  );
}