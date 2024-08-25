import './Toolbar.css';
import { ToolbarProps } from '../ts/interfaces';


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
                    className={`${button.className} ${props.buttonSize}`} 
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
