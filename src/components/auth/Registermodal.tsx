import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { closeModal, openModal, addNotification, NotificationType } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      ...formErrors,
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // In a real app, you'd also set default values for required fields or handle on backend
        const resultAction = await dispatch(registerUser({
          email: formData.email,
          password: formData.password,
          firstName: 'User', // Default value
          lastName: formData.email.split('@')[0], // Use email username as last name
          phone: '', // Empty default
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
      title="Create an Account"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="your.email@example.com"
          autoComplete="email"
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          autoComplete="new-password"
          required
        />
        
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          autoComplete="new-password"
          required
        />

        {/* Social login option */}
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
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="ghost" onClick={handleLoginClick}>
            Already have an account?
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterModal;