import { useEffect, useState } from 'react';
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
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profileData = await getUserProfile(user.id);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
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
            <p className="text-gray-600 mb-8">
              Please sign in to view your profile.
            </p>
            <Button 
              variant="primary"
              onClick={() => dispatch(openModal('login'))}
            >
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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="text-center">
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
            <p className="text-gray-600 mb-8">
              Could not load your profile information.
            </p>
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
        {/* Profile header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-uz-blue to-blue-700"></div>
          <div className="px-6 py-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                <div className="relative -mt-16 sm:-mt-24">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-100">
                    {profile.profilePictureUrl ? (
                      <img
                        src={profile.profilePictureUrl}
                        alt={profile.firstName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-uz-blue text-white text-2xl font-bold">
                        {profile.firstName.charAt(0)}
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <label 
                      htmlFor="profile-picture-upload"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 text-gray-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadProfilePicture}
                      />
                    </label>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        
        {/* Tabs for Profile, Issues, and Activity */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex border-t border-gray-200">
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                  selected
                    ? 'text-uz-blue border-b-2 border-uz-blue'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Profile
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                  selected
                    ? 'text-uz-blue border-b-2 border-uz-blue'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              My Issues
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                  selected
                    ? 'text-uz-blue border-b-2 border-uz-blue'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Subscribed
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Profile Panel */}
            <Tab.Panel className="p-6">
              {isEditing ? (
                // Edit profile form
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="regionId" className="block text-sm font-medium text-gray-700">
                          Region
                        </label>
                        <select
                          name="regionId"
                          id="regionId"
                          value={formData.regionId}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                        >
                          <option value="">Select a region</option>
                          {/* You would populate this with regions from your API */}
                          <option value="tashkent">Tashkent</option>
                          <option value="samarkand">Samarkand</option>
                          <option value="bukhara">Bukhara</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                // Profile display
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {profile.firstName} {profile.lastName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Region</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile.region.name}</dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">About</h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        {profile.bio || 'No bio provided yet.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Account</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {profile.role}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Trust Score</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">{profile.trustScore}/100</span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full ${
                                  profile.trustScore > 70
                                    ? 'bg-green-500'
                                    : profile.trustScore > 40
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${profile.trustScore}%` }}
                              />
                            </div>
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Badges</dt>
                        <dd className="mt-1 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {profile.badges && profile.badges.length > 0 ? (
                              profile.badges.map((badge, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {badge}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">No badges earned yet</span>
                            )}
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Verification</dt>
                        <dd className="mt-1 text-sm">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <span className={`h-2 w-2 rounded-full mr-2 ${profile.isEmailVerified ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className={profile.isEmailVerified ? 'text-gray-900' : 'text-gray-500'}>
                                Email {profile.isEmailVerified ? 'Verified' : 'Not Verified'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className={`h-2 w-2 rounded-full mr-2 ${profile.isPhoneVerified ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className={profile.isPhoneVerified ? 'text-gray-900' : 'text-gray-500'}>
                                Phone {profile.isPhoneVerified ? 'Verified' : 'Not Verified'}
                              </span>
                            </div>
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Tab.Panel>
            
            {/* My Issues Panel */}
            <Tab.Panel className="p-6">
              <IssuesList 
                showFilters={true}
                title="My Issues"
              />
            </Tab.Panel>
            
            {/* Subscribed Issues Panel */}
            <Tab.Panel className="p-6">
              <IssuesList 
                showFilters={true}
                title="Subscribed Issues"
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}