import React, { useEffect, useState } from 'react';
import './SettingMenu.css';
import { settings, MAX_EMPTY_BOTTLES, MAX_BOTTLES, MIN_BOTTLES, MIN_BOTTLE_LENGTH, MAX_BOTTLE_LENGTH, COLOR_PALETTES_LENGTH, MIN_EMOTY_BOTTLES } from '../ts/constants';
import SettingItem from './SettingItem';
import Toolbar from './Toolbar';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  handleSpeedrun: () => void;
  handleAnimation: () => void;
}

function SettingMenu(props: SettingsMenuProps) {
  const [, setLocalSettings] = useState(settings);
  const [tempSettings, setTempSettings] = useState(settings);
  const [isSpeedRunEnabled, setIsSpeedRunEnabled] = useState(false); 
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && props.isOpen) {
        handleClose();
      }
    };

    function handleClick(event: MouseEvent) {
      if (event.target === document.querySelector('.settings-menu-overlay')) {
        handleClose();
      }
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.isOpen, props.onClose]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const intValue = parseInt(value, 10);

    setTempSettings((prevSettings) => ({
      ...prevSettings,
      [name]: intValue,
    }));
  };

  function handleClose() {
    setTempSettings(settings);  // Reset tempSettings to original settings
    props.onClose();  // Execute the passed onClose function
  }

  function validateSettings() {
    const { numBottles, emptyBottles, bottleLength } = tempSettings;
    const maxEmptyBottles = Math.min(MAX_EMPTY_BOTTLES(), numBottles - 1);
    const validEmptyBottles = Math.min(emptyBottles, maxEmptyBottles);
 
    return {
      numBottles,
      emptyBottles: validEmptyBottles,
      bottleLength,
      maxBottleLength: tempSettings.maxBottleLength,         // Ensure this property is retained
      selectedPalette: tempSettings.selectedPalette
    };
  };

  function handleSave() {
    const validatedSettings = validateSettings();
    setLocalSettings(validatedSettings);
    settings.numBottles = validatedSettings.numBottles;
    settings.emptyBottles = validatedSettings.emptyBottles;
    settings.bottleLength = validatedSettings.bottleLength;
    settings.selectedPalette = validatedSettings.selectedPalette;
    props.onClose();
  };

  const settingButtons = [
    {
      label: 'SpeedRun',
      onClick: function () {
        props.handleSpeedrun();
        setIsSpeedRunEnabled(!isSpeedRunEnabled); // Toggle the button state
      },
      disabled: false, // Disable the button based on state
      toggle: isSpeedRunEnabled,
      className: isSpeedRunEnabled ? 'blue' : '',
    },
    {
      label: 'Animations',
      onClick: function () {
        props.handleAnimation();
        setIsAnimationsEnabled(!isAnimationsEnabled); // Toggle the button state
      },
      disabled: false, // Disable the button based on state
      toggle: isAnimationsEnabled,
      className: isAnimationsEnabled ? 'blue' : '',
    },
  ];


  const menuButtons = [
    { label: 'Save', onClick: handleSave, disabled: false, className: 'green' },
    { label: 'Cancel', onClick: handleClose, disabled: false, className: 'red' },
  ];

  return (
    <div className={`settings-menu-overlay ${props.isOpen ? 'open' : ''}`}>
      <div className="settings-menu">
        <div className="settings-menu-body">
          <SettingItem
            type="number"
            label="Bottles"
            id="numBottles"
            name="numBottles"
            value={tempSettings.numBottles}
            onChange={handleInputChange}
            min={Math.max(MIN_BOTTLES(), tempSettings.emptyBottles + 2)}
            max={MAX_BOTTLES}
          />
          <SettingItem
            type="number"
            label="Bottle Size"
            id="bottleLength"
            name="bottleLength"
            value={tempSettings.bottleLength}
            onChange={handleInputChange}
            min={MIN_BOTTLE_LENGTH}
            max={MAX_BOTTLE_LENGTH}
          />
          <SettingItem
            type="number"
            label="Empty Bottles"
            id="emptyBottles"
            name="emptyBottles"
            value={tempSettings.emptyBottles}
            onChange={handleInputChange}
            min={MIN_EMOTY_BOTTLES}
            max={Math.min(MAX_EMPTY_BOTTLES(), tempSettings.numBottles - 2)}
          />
          <SettingItem
            type="number"
            label="Color Palette"
            id="selectedPalette"
            name="selectedPalette"
            value={tempSettings.selectedPalette}
            onChange={handleInputChange}
            min={1}
            max={COLOR_PALETTES_LENGTH}
          />
          <Toolbar buttons={settingButtons} buttonSize='small'/>
          <Toolbar buttons={menuButtons} buttonSize='medium'/>
        </div>
      </div>
    </div>
  );
};

export default SettingMenu;
