import '../style/Button.css';
import { ButtonProps } from '../ts/interfaces';


function Button({ label, className, size, onClick, disabled }: ButtonProps) {

    return (
        <button
            className={`${className} ${size}`}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>

    );
}

export default Button;
