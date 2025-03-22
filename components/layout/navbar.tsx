"use client";

import Link from 'next/link';
import { useAuth } from '../auth/authContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (!isAuthenticated) return null;
  
  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left side - Logo only */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold">
              RAMS
            </Link>
          </div>
          
          {/* Right side - All navigation links */}
          <div className="flex items-center">
            {/* Desktop menu */}
            <div className="hidden sm:flex sm:space-x-6">
              <Link href="/matrix" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white">
                Matrices
              </Link>
              
              {/* Admin Links */}
              {userRole === 'admin' && (
                <>
                  <Link href="/admin/matrix" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white">
                    Manage Matrices
                  </Link>
                  <Link href="/admin/users" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white">
                    Manage Users
                  </Link>
                  <Link href="/history" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white">
                    History
                  </Link>
                </>
              )}
              
              <button 
                onClick={logout}
                className="inline-flex items-center px-3 py-1 ml-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700"
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
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/matrix" className="block px-3 py-2 text-base font-medium hover:bg-green-700 rounded-md">
                Matrices
              </Link>
              
              {userRole === 'admin' && (
                <>
                  <Link href="/admin/matrix" className="block px-3 py-2 text-base font-medium hover:bg-green-700 rounded-md">
                    Manage Matrices
                  </Link>
                  <Link href="/admin/users" className="block px-3 py-2 text-base font-medium hover:bg-green-700 rounded-md">
                    Manage Users
                  </Link>
                  <Link href="/history" className="block px-3 py-2 text-base font-medium hover:bg-green-700 rounded-md">
                    History
                  </Link>
                </>
              )}
              
              <button 
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-base font-medium bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;