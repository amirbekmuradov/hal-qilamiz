import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { closeModal, openModal, addNotification, NotificationType } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
// We'll use a different approach without react-icons
// import { FcGoogle } from 'react-icons/fc';
// import { motion } from 'framer-motion';

// Sample regions data (replace with API call)
const REGIONS = [
  { id: 'tashkent', name: 'Tashkent' },
  { id: 'samarkand', name: 'Samarkand' },
  { id: 'bukhara', name: 'Bukhara' },
  { id: 'andijan', name: 'Andijan' },
  { id: 'namangan', name: 'Namangan' },
  { id: 'fergana', name: 'Fergana' },
  { id: 'karakalpakstan', name: 'Karakalpakstan' },
  { id: 'surkhandarya', name: 'Surkhandarya' },
  { id: 'kashkadarya', name: 'Kashkadarya' },
  { id: 'khorezm', name: 'Khorezm' },
  { id: 'jizzakh', name: 'Jizzakh' },
  { id: 'syrdarya', name: 'Syrdarya' },
  { id: 'navoi', name: 'Navoi' },
];

const RegisterModal: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    regionId: '',
    verificationCode: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    regionId: '',
    verificationCode: '',
  });

  // Store verification states
  const [isPhoneVerificationSent, setIsPhoneVerificationSent] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  
  // Countdown timer for verification code resend
  useEffect(() => {
    if (verificationCountdown > 0) {
      const timer = setTimeout(() => {
        setVerificationCountdown(verificationCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCountdown]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateStep1 = () => {
    let isValid = true;
    const errors = {
      ...formErrors,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Phone validation (simple format check for Uzbekistan)
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^(\+998|998)?[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Uzbekistan phone number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const validateStep2 = () => {
    let isValid = true;
    const errors = {
      ...formErrors,
      password: '',
      confirmPassword: '',
      regionId: '',
    };
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Region validation
    if (!formData.regionId) {
      errors.regionId = 'Please select your region';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const validateStep3 = () => {
    let isValid = true;
    const errors = {
      ...formErrors,
      verificationCode: '',
    };
    
    // Verification code validation
    if (!formData.verificationCode) {
      errors.verificationCode = 'Please enter the verification code';
      isValid = false;
    } else if (formData.verificationCode.length !== 6) {
      errors.verificationCode = 'Verification code must be 6 digits';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Send verification code and move to step 3
      sendVerificationCode();
      setStep(3);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const sendVerificationCode = () => {
    // Mock sending verification code
    // In a real app, call your API to send SMS
    console.log(`Sending verification code to ${formData.phone}`);
    
    setIsPhoneVerificationSent(true);
    setVerificationCountdown(60); // 60 seconds countdown
    
    // Show notification
    dispatch(addNotification({
      type: NotificationType.INFO,
      message: `Verification code sent to ${formData.phone}`,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 3 && validateStep3()) {
      try {
        const resultAction = await dispatch(registerUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }));
        
        if (registerUser.fulfilled.match(resultAction)) {
          dispatch(closeModal('register'));
          dispatch(addNotification({
            type: NotificationType.SUCCESS,
            message: 'Account created successfully!',
          }));
        }
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };
  
  const handleLoginClick = () => {
    dispatch(closeModal('register'));
    dispatch(openModal('login'));
  };
  
  const handleClose = () => {
    dispatch(closeModal('register'));
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={`Create an Account (Step ${step} of 3)`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <>
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
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                  required
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
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
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                  required
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                placeholder="+998 XX XXX XX XX"
                required
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>

            {/* Social login options (without react-icons) */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="mr-2">G</span> Google
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Step 2: Security & Location */}
        {step === 2 && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                required
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                required
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="regionId" className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                name="regionId"
                id="regionId"
                value={formData.regionId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                required
              >
                <option value="">Select your region</option>
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
          </>
        )}
        
        {/* Step 3: Verification */}
        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                We've sent a 6-digit verification code to your phone
              </p>
              <p className="font-medium">{formData.phone}</p>
            </div>
            
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-uz-blue focus:ring-uz-blue sm:text-sm"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              {formErrors.verificationCode && (
                <p className="mt-1 text-sm text-red-600">{formErrors.verificationCode}</p>
              )}
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={verificationCountdown > 0}
                className="text-sm font-medium text-uz-blue hover:text-uz-blue-dark disabled:text-gray-400"
              >
                {verificationCountdown > 0
                  ? `Resend code in ${verificationCountdown}s`
                  : 'Resend verification code'}
              </button>
            </div>
          </>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={handleLoginClick}>
              Already have an account?
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default RegisterModal;