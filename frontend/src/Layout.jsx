import React, { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from './App';

export default function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white w-full grid grid-rows-[auto_1fr]">
      <header className="bg-white shadow-sm">
        <div className="w-full px-4 py-4 flex justify-between items-center">
          <div className="w-full">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-full object-contain"
              />
            </Link>
          </div>
          <nav>
            <div className="flex items-center space-x-6">
              {!auth.user ? (
                <button
                  onClick={() => navigate('/anmeldung')}
                  className="text-red-600 hover:bg-red-50/20 px-4 py-2 rounded-md transition-colors"
                >
                  Anmelden
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 bg-black hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg 
                      className="w-6 h-6 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" 
                      />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={() => {
                          navigate('/');
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 text-left"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/suche');
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 text-left"
                      >
                        Suche
                      </button>
                      <button
                        onClick={() => {
                          navigate('/uebersicht');
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 text-left"
                      >
                        Übersicht
                      </button>
                      <button
                        onClick={() => {
                          auth.signout(() => navigate('/'));
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 text-left"
                      >
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}