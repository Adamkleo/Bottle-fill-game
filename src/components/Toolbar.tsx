import React from 'react';
import './Toolbar.css';

interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled: boolean;
    className?: string;
}

interface ToolbarProps {
    buttons: ButtonProps[];
}

function Toolbar(props: ToolbarProps) {
    return (
        <div className="toolbar">
            {props.buttons.map((button, index) => (
                <button
                    className={button.className}
                    key={index}
                    onClick={button.onClick}
                    disabled={button.disabled}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
}

export default Toolbar;
