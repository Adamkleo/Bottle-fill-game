import React from 'react';
import './SettingItem.css'

interface SettingItemProps {
  label: string;
  id: string;
  name: string;
  value: number | string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  type: 'number' | 'range';
}


function SettingItem (props: SettingItemProps  ) {

  let inputClassName = 'setting-input-number'; // default value
  inputClassName = props.type === 'range' ? 'setting-input-range' : 'setting-input-number';

  return (
    <div className="setting-item">
      <label htmlFor={props.id} className="setting-label">{props.label}</label>
      <input
        type={props.type}
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        min={props.min}
        max={props.max}
        className={inputClassName}
      />
    </div>
  );
};

export default SettingItem;
