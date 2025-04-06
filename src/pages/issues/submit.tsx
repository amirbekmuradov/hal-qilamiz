import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createIssue } from '../../store/slices/issuesSlice';
import { addNotification, NotificationType } from '../../store/slices/uiSlice';
import Layout from '../../components/layout/Layout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Link from 'next/link';

// Sample regions data (replace with API call)
const REGIONS = [
  { id: 'tashkent', name: 'Tashkent' },
  { id: 'samarkand', name: 'Samarkand' },
  { id: 'bukhara', name: 'Bukhara' },
  { id: 'andijan', name: 'Andijan' },
  { id: 'namangan', name: 'Namangan' },
  { id: 'fergana', name: 'Fergana' },
  { id: 'karakalpakstan', name: 'Karakalpakstan' },
];

export default function SubmitIssuePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.issues);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    regionId: '',
    isNationwide: false,
  });
  
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    regionId: '',
    media: '',
  });
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      dispatch(addNotification({
        type: NotificationType.WARNING,
        message: 'Please log in to report an issue.',
      }));
    }
  }, [isAuthenticated, router, dispatch]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size and type
      const invalidFiles = newFiles.filter(
        file => file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/')
      );
      
      if (invalidFiles.length > 0) {
        setFormErrors({
          ...formErrors,
          media: 'Only images up to 10MB are allowed',
        });
        return;
      }
      
      // Limit to 5 files
      if (mediaFiles.length + newFiles.length > 5) {
        setFormErrors({
          ...formErrors,
          media: 'Maximum 5 files allowed',
        });
        return;
      }
      
      // Clear media error
      setFormErrors({
        ...formErrors,
        media: '',
      });
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setMediaFiles([...mediaFiles, ...newFiles]);
      setMediaPreviewUrls([...mediaPreviewUrls, ...newPreviewUrls]);
    }
  };
  
  const handleRemoveMedia = (index: number) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    
    const newFiles = [...mediaFiles];
    const newPreviewUrls = [...mediaPreviewUrls];
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setMediaFiles(newFiles);
    setMediaPreviewUrls(newPreviewUrls);
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      title: '',
      description: '',
      regionId: '',
      media: '',
    };
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
      isValid = false;
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
      isValid = false;
    }
    
    // Region validation (only if not nationwide)
    if (!formData.isNationwide && !formData.regionId) {
      errors.regionId = 'Please select a region or mark as nationwide';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, validating...");
    
    if (!validateForm()) {
      console.log("Form validation failed", formErrors);
      return;
    }
    
    console.log("Form validated, creating issue data...");
    
    // Create the issue data
    const issueData = {
      title: formData.title,
      description: formData.description,
      location: {
        regionId: formData.isNationwide ? null : formData.regionId,
        regionName: formData.isNationwide 
          ? 'Nationwide' 
          : REGIONS.find(region => region.id === formData.regionId)?.name || '',
        isNationwide: formData.isNationwide,
      },
      mediaUrls: [], // This will be filled after uploading the media files
    };
    
    console.log("Dispatching createIssue action with data:", issueData);
    
    try {
      // In a real app, you would upload the media files to a storage service
      // and then add the URLs to the issue data
      console.log("Creating issue...");
      const resultAction = await dispatch(createIssue(issueData));
      console.log("Action result:", resultAction);
      
      if (createIssue.fulfilled.match(resultAction)) {
        console.log("Issue created successfully");
        dispatch(addNotification({
          type: NotificationType.SUCCESS,
          message: 'Issue reported successfully!',
        }));
        
        // Redirect to the issues page
        router.push('/issues');
      } else if (createIssue.rejected.match(resultAction)) {
        console.error("Issue creation rejected:", resultAction.error);
        dispatch(addNotification({
          type: NotificationType.ERROR,
          message: `Failed to create issue: ${resultAction.error.message || 'Unknown error'}`,
        }));
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      dispatch(addNotification({
        type: NotificationType.ERROR,
        message: 'Failed to create issue. Please try again.',
      }));
    }
  };
  
  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <Layout title="Report an Issue - Hal Qilamiz">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
              <Link href="/issues" className="hover:text-gray-700">
                Issues
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
              <span className="text-gray-900">Report Issue</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
            <p className="mt-1 text-sm text-gray-600">
              Provide details about the issue you're reporting
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Input
              label="Title"
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              error={formErrors.title}
              placeholder="Briefly describe the issue"
              maxLength={100}
              fullWidth
            />
            
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the issue. What happened? Where exactly? When? How many people are affected?"
                className={`mt-1 block w-full border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="isNationwide"
                  name="isNationwide"
                  type="checkbox"
                  checked={formData.isNationwide}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isNationwide" className="ml-2 block text-sm text-gray-700">
                  This is a nationwide issue
                </label>
              </div>
              
              {!formData.isNationwide && (
                <div className="space-y-1">
                  <label htmlFor="regionId" className="block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <select
                    id="regionId"
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleChange}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                      formErrors.regionId ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md`}
                    disabled={formData.isNationwide}
                  >
                    <option value="">Select a region</option>
                    {REGIONS.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.regionId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.regionId}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Photos/Videos (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {/* Preview of uploaded media */}
                {mediaPreviewUrls.map((url, index) => (
                  <div key={index} className="relative h-24 w-24">
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Add media button */}
                {mediaFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                multiple
                className="hidden"
              />
              
              <p className="text-xs text-gray-500">
                You can upload up to 5 images (max 10MB each)
              </p>
              
              {formErrors.media && (
                <p className="text-sm text-red-600">{formErrors.media}</p>
              )}
            </div>
            
            <div className="flex justify-end pt-5">
              <Button 
                type="button" 
                variant="outline" 
                as={Link} 
                href="/issues" 
                className="mr-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isLoading}
              >
                Submit Issue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}