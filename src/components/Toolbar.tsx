import './Toolbar.css';
import React from 'react';

interface ToolbarProps {
  children: React.ReactNode;
}

const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <div className="toolbar">
      {children}
    </div>
  );
};

export default Toolbar;
