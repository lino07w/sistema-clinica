import { useState, useEffect } from 'react';

const ContentWrapper = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Escuchar cambios en el sidebar colapsado
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        setCollapsed(sidebar.classList.contains('collapsed'));
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Observar cambios en la clase del sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const observer = new MutationObserver(handleResize);
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
      
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`content-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {children}
    </div>
  );
};

export default ContentWrapper;