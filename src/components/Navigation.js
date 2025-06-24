// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, BarChart2, Info, Search, MapPin } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 hover:text-blue-100 transition-colors">
            {/* <Database className="h-6 w-6" /> */}
            <img 
              src="/logo.png" 
              alt="DMMAG Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-xl">DMMAG</span>
          </Link>
          <div className="flex space-x-4">
            <Link 
              to="/advanced-search" 
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md flex items-center ${
                currentPath === '/advanced-search' ? 'bg-blue-700' : ''
              }`}
            >
              <Search className="h-4 w-4 mr-1" />
              Advanced Search
            </Link>
            <Link 
              to="/gsu" 
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md ${
                currentPath === '/gsu' ? 'bg-blue-700' : ''
              }`}
            >
              GSU Records
            </Link>
            <Link 
              to="/troy" 
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md ${
                currentPath === '/troy' ? 'bg-blue-700' : ''
              }`}
            >
              Troy Records
            </Link>
            <Link 
              to="/visualization" 
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md flex items-center ${
                currentPath.includes('/visualization') ? 'bg-blue-700' : ''
              }`}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Visualizations
            </Link>
            {/* New Geographic Story Mapping link */}
            <button
              onClick={() => handleExternalLink('https://storymaps.arcgis.com/stories/62ae4d70bb074afea292b3a96d43a1ca')} 
              className="hover:text-blue-100 transition-colors px-3 py-2 rounded-md flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Geographic Story Mapping
            </button>
            <Link 
              to="/about" 
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md flex items-center ${
                currentPath === '/about' ? 'bg-blue-700' : ''
              }`}
            >
              <Info className="h-4 w-4 mr-1" />
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;