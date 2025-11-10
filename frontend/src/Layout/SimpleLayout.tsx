import React, { useState } from 'react';
import SimpleHeader from './SimpleHeader';
import SimpleSidebar from './SimpleSidebar';

const SimpleLayout = ({ children }: { children: React.ReactNode }) => {
  // Este estado solo se usa para controlar el sidebar en pantallas móviles
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SimpleHeader toggleSidebar={toggleMobileSidebar} />
      <SimpleSidebar 
        isMobileSidebarOpen={isMobileSidebarOpen} 
        toggleMobileSidebar={toggleMobileSidebar} 
      />
      
      <main className="pt-16 min-h-screen transition-all duration-300">
        {/* El contenido principal se desplaza automáticamente según el tamaño de la pantalla */}
        <div className="px-4 py-6 md:px-6 lg:px-8 md:ml-64">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SimpleLayout;