import React from "react";
import { Outlet } from "react-router-dom";

const SimpleLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Outlet /> 
    </div>
  );
};

export default SimpleLayout;
