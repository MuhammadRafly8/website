"use client";

import { useState } from "react";

interface EditCellProps {
  value: boolean;
  onChange: (newValue: boolean) => void;
}

const EditCell = ({ value, onChange }: EditCellProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleToggle = () => {
    const newValue = !currentValue;
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <div 
      className="cursor-pointer flex justify-center items-center h-8"
      onClick={handleToggle}
    >
      <div 
        className={`w-6 h-6 rounded-md border ${
          currentValue 
            ? "bg-green-600 border-green-700" 
            : "bg-white border-gray-300"
        }`}
      >
        {currentValue && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-white" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default EditCell;