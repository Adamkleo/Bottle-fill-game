import './Toolbar.css';
import { ToolbarProps } from '../ts/interfaces';


function Toolbar({ buttons, buttonSize }: ToolbarProps) {

    const sizeToClass = {
        'small': 'toolbar-small',
        'medium': 'toolbar-medium',
        'large': 'toolbar-large'
    }

    return (
        <div className={`toolbar ${sizeToClass[buttonSize]}`}>
            {buttons.map((button, index) => (
                <button
                    className={`${button.className} ${buttonSize}`} 
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
