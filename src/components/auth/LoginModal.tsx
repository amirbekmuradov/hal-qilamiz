import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { closeModal, openModal, addNotification, NotificationType } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginModal: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
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
      email: '',
      password: '',
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
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const resultAction = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        dispatch(closeModal('login'));
        dispatch(addNotification({
          type: NotificationType.SUCCESS,
          message: 'Successfully logged in!',
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  const handleRegisterClick = () => {
    dispatch(closeModal('login'));
    dispatch(openModal('register'));
  };
  
  const handleClose = () => {
    dispatch(closeModal('login'));
  };
  
  const handleForgotPassword = () => {
    // Implement forgot password functionality
    console.log('Forgot password clicked');
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Log in to Hal Qilamiz"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
          fullWidth
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          autoComplete="current-password"
          fullWidth
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </button>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            fullWidth
          >
            Log in
          </Button>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleRegisterClick}
              fullWidth
            >
              Create an account
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;