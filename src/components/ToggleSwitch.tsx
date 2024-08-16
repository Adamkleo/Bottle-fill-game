import './ToggleSwitch.css';


interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
    disabled: boolean;
    }


function ToggleSwitch(props: ToggleSwitchProps) {
  return (
    <div className="toggle-switch">
    <input
        type="checkbox"
        id="toggle"
        className="toggle-input"
        checked={props.isToggled}
        onChange={props.onToggle}
        disabled={props.disabled}
    />
    <label htmlFor="toggle" className="toggle-label">
        <span className="toggle-ball"></span>
    </label>
</div>
  );
}

export default ToggleSwitch;