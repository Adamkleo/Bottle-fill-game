import './SettingItem.css';
import { SettingItemProps } from '../ts/interfaces';

function SettingItem({ label, id, value, onChange, min, max, type, disabled }: SettingItemProps) {

  // Determine the appropriate class name for the input
  let inputClassName = 'setting-input';
  if (type === 'checkbox') {
    inputClassName = 'setting-input-checkbox';
  } else if (type === 'number') {
    inputClassName = 'setting-input-number';
  } else if (type === 'text') {
    inputClassName = 'setting-input-text'; 
  }

  return (
    <div className="setting-item">
      <label htmlFor={id} className="setting-label">{label}</label>
      <input
        type={type}
        id={id}
        value={type === 'checkbox' ? undefined : String(value)} 
        checked={type === 'checkbox' ? Boolean(value) : undefined} 
        onChange={onChange}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        className={inputClassName}
        disabled={disabled}
      />
    </div>
  );
};

export default SettingItem;
