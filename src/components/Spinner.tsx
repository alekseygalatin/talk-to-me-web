import React from "react";
import { HashLoader } from "react-spinners";

interface SpinnerProps {
  isLoading: boolean; // Controls the visibility of the spinner
  global?: boolean;   // Whether to show the spinner globally
  color?: string;     // Optional: Customize spinner color
  size?: number;      // Optional: Customize spinner size
  label?: string;      // Optional: Customize spinner size
}

const Spinner: React.FC<SpinnerProps> = ({
  isLoading,
  global = true,
  color = "#3498db", // Default blue color
  size = 50,
  label = ''
}) => {
  if (!isLoading) return null;

  return global ? (
    // Global spinner with full-page overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-10">
      <div className="flex flex-col items-center">
        <HashLoader color={color} size={size} />
        { label ? (<span className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</span>) : ('') }
    </div>
    </div>
  ) : (
    // Local spinner inside a container
    <div className="flex flex-col items-center justify-center h-40">
      <HashLoader color={color} size={size} />
      { label ? (<span className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</span>) : ('') }
    </div>
  );
};

export default Spinner;
