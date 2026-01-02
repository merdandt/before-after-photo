import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-base font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "border-transparent text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 focus:ring-brand-400 shadow-soft hover:shadow-md-soft",
    secondary: "border-transparent text-dark bg-brand-100 hover:bg-brand-200 active:bg-brand-300 focus:ring-brand-400 shadow-sm-soft hover:shadow-soft",
    outline: "border border-light-border text-dark bg-white hover:bg-light-gray active:bg-light-border focus:ring-brand-400 shadow-sm-soft hover:shadow-soft"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
