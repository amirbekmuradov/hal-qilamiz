import React, { InputHTMLAttributes, forwardRef } from 'react';

// Define input variants
export type InputVariant = 'standard' | 'outline' | 'filled';

// Define input sizes
export type InputSize = 'sm' | 'md' | 'lg';

// Define input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = 'standard',
      size = 'md',
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate id if not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    // Variant classes
    const variantClasses = {
      standard: 'border-b border-gray-300 focus:border-primary-500 bg-transparent',
      outline: 'border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500',
      filled: 'border border-gray-300 bg-gray-100 rounded-md focus:ring-primary-500 focus:border-primary-500',
    };
    
    // Width classes
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Error classes
    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : '';
    
    // Calculate padding based on icons
    let paddingClasses = '';
    if (leftIcon) paddingClasses += ' pl-10';
    if (rightIcon) paddingClasses += ' pr-10';
    
    return (
      <div className={`${widthClass} ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${sizeClasses[size]} ${variantClasses[variant]} ${errorClasses} ${paddingClasses} ${className} ${widthClass} focus:outline-none`}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;