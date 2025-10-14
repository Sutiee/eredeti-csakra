import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-spiritual-purple-200/50'
    : '';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
