import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";


const AppLayout: React.FC = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      
      <Header />
      
      <main>
        <Outlet /> {/* Renders the child route */}
      </main>

    </div>
  );
};

export default AppLayout;
