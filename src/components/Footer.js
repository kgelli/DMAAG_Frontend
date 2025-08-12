// src/components/Footer.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
         
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('/gsu')} 
                  className="hover:text-white"
                >
                  GSU Records Database
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/troy')} 
                  className="hover:text-white"
                >
                  Troy Records Collection
                </button>
              </li>
              
            </ul>
          </div>
           
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">
              Georgia State University<br />
              Department of English<br />
              Email: ewest@gsu.edu<br />
              Phone: (404)413-5866
            </p>
            
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">DMMAG Project</h3>
            <p className="text-gray-400">
              Data Mining and Mapping Antebellum Georgia - A research initiative exploring historical data of enslaved individuals in Georgia
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Data Mining and Mapping Antebellum Georgia Project</p>
          <p className="text-sm mt-2">
            A collaboration between Georgia State University and Troy University
          </p>
        </div>
      </div>
    </footer>
  );
}