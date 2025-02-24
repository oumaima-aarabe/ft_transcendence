import React, { useState } from 'react';

// Define the structure of each option
export interface Option {
  value: string;
  label: string;
  src: string; // Still a string, but it references the imported SVG paths.
}

// Props for the CustomSelect component
export const CustomSelect: React.FC<{
  options: Option[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}> = ({ options, selectedValue, setSelectedValue }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the selected option from the options list
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className="relative w-2/3">
      {/* Label */}
      <label htmlFor="status" className="text-white text-sm mb-2 block">
        Status
      </label>
      {/* Selected Value (Clickable) */}
      <div
        className="flex items-center justify-between w-full h-12 pl-3 pr-4 bg-[#2D2A2A]/30 border border-white/20 rounded-xl text-white text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedOption && (
            <>
              <img
                src={selectedOption.src}
                alt={selectedOption.label}
                className="h-5 w-5"
              />
              <span>{selectedOption.label}</span>
            </>
          )}
        </div>
        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-white transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {/* Dropdown Options */}
      {isOpen && (
        <ul className="absolute top-full mt-2 w-full bg-[#2D2A2A]/90 border border-white/20 rounded-lg text-white text-sm shadow-lg z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#40CFB7]/30 cursor-pointer"
              onClick={() => {
                setSelectedValue(option.value);
                setIsOpen(false);
              }}
            >
              <img
                src={option.src}
                alt={option.label}
                className="h-5 w-5"
              />
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
