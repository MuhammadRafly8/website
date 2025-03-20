"use client";

import Link from 'next/link';
import { useAuth } from '../auth/authContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (!isAuthenticated) return null;
  
  return (
    <header className="bg-green-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex w-full md:w-auto justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Matrix Consierge</h1>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0`}>
          <Link href="/matrix" className="hover:underline">
            Matrix
          </Link>
          
          {userRole === 'admin' && (
            <>
              <Link href="/admin/matrix" className="hover:underline">
                Matrix Management
              </Link>
              <Link href="/history" className="hover:underline">
                History
              </Link>
            </>
          )}
          
          <button 
            onClick={logout}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;