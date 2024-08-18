import React from 'react';
import './SettingItem.css';

interface SettingItemProps {
  label: string;
  id: string;
  name: string;
  value: number | string | boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  type: 'number' | 'checkbox';
  disabled?: boolean;
}

function SettingItem(props: SettingItemProps) {

  let inputClassName = props.type === 'checkbox' ? 'setting-input-checkbox' : 'setting-input-number';

  return (
    <div className="setting-item">
      <label htmlFor={props.id} className="setting-label">{props.label}</label>
      <input
        type={props.type}
        id={props.id}
        name={props.name}
        value={props.type === 'checkbox' ? undefined : String(props.value)}  // Convert to string if not checkbox
        checked={props.type === 'checkbox' ? Boolean(props.value) : undefined} // Handle checked for checkbox
        onChange={props.onChange}
        min={props.type === 'number' ? props.min : undefined}
        max={props.type === 'number' ? props.max : undefined}
        className={inputClassName}
        disabled={props.disabled}
      />
    </div>
  );
};

export default SettingItem;
