import React, { useEffect } from 'react';
import './Menu.css'

interface MenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

function Menu({ children, isOpen, onClose }: MenuProps) {

  useEffect(() => {

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    function handleClick(event: MouseEvent) {
      if (event.target === document.querySelector('.menu-overlay')) {
        onClose();
      }
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`menu-overlay ${isOpen ? 'open' : ''}`}>
      <div className="menu">
        <div className="menu-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Menu;
