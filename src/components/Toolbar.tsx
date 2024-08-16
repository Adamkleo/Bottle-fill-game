import './Toolbar.css';

interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled: boolean;
    className?: string;
    toggle?: boolean; 
}

interface ToolbarProps {
    buttons: ButtonProps[];
    buttonSize: 'small' | 'large' | 'medium'; // Define the buttonSize as a prop of the Toolbar
}


function Toolbar(props: ToolbarProps) {

    const sizeToClass = {
        'small': 'toolbar-small',
        'medium': 'toolbar-medium',
        'large': 'toolbar-large'
    }

    return (
        <div className={`toolbar ${sizeToClass[props.buttonSize]}`}>
            {props.buttons.map((button, index) => (
                <button
                    className={`${button.className} ${props.buttonSize}`}  // Add buttonSize class to each button
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
