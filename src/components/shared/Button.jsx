import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    icon: Icon
}) => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
        >
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

export default Button;