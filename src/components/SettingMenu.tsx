import React, { useEffect, useState } from 'react';
import './SettingMenu.css';
import { settings, MAX_EMPTY_BOTTLES, MAX_BOTTLES, MIN_BOTTLES, MIN_BOTTLE_LENGTH, MAX_BOTTLE_LENGTH, COLOR_PALETTES_LENGTH, MIN_EMPTY_BOTTLES } from '../ts/constants';
import SettingItem from './SettingItem';
import Toolbar from './Toolbar';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: (settingModified: boolean) => void; // Pass the settingModified flag
  handleSpeedrun: () => void;
  handleAnimation: () => void;
  buttonsDisabled?: boolean;
}

function SettingMenu(props: SettingsMenuProps) {
  const [, setLocalSettings] = useState(settings);
  const [tempSettings, setTempSettings] = useState(settings);
  const [isSpeedRunEnabled, setIsSpeedRunEnabled] = useState(false);
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(false);
  const [settingModified, setSettingModified] = useState(false); // Track if a setting was modified

  useEffect(() => {
    // Reset settingModified whenever the menu is opened
    setSettingModified(false);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && props.isOpen) {
        handleClose(false); // Pass false if exiting without saving
      }
    };

    function handleClick(event: MouseEvent) {
      if (event.target === document.querySelector('.settings-menu-overlay')) {
        handleClose(false); // Pass false if exiting without saving
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

    // Set the settingModified flag to true if any change is detected
    setSettingModified(true);
  };

  function handleClose(saveChanges: boolean) {
    if (saveChanges) {
      handleSave(); // Save changes if saveChanges is true
    } else {
      setSettingModified(false); // Reset the settingModified flag if closing without saving
    }
    props.onClose(settingModified); // Pass settingModified to onClose
  }

  function validateSettings() {
    const { numBottles, emptyBottles, bottleLength } = tempSettings;
    const maxEmptyBottles = Math.min(MAX_EMPTY_BOTTLES(), numBottles - 1);
    const validEmptyBottles = Math.min(emptyBottles, maxEmptyBottles);

    return {
      numBottles,
      emptyBottles: validEmptyBottles,
      bottleLength,
      maxBottleLength: tempSettings.maxBottleLength,
      selectedPalette: tempSettings.selectedPalette,
    };
  };

  function handleSave() {
    const validatedSettings = validateSettings();
    setLocalSettings(validatedSettings);
    settings.numBottles = validatedSettings.numBottles;
    settings.emptyBottles = validatedSettings.emptyBottles;
    settings.bottleLength = validatedSettings.bottleLength;
    settings.selectedPalette = validatedSettings.selectedPalette;
  };

  const settingButtons = [
    {
      label: 'SpeedRun',
      onClick: function () {
        props.handleSpeedrun();
        setIsSpeedRunEnabled(!isSpeedRunEnabled); // Toggle the button state
      },
      disabled: false,
      toggle: isSpeedRunEnabled,
      className: isSpeedRunEnabled ? 'blue' : '',
    },
    {
      label: 'Animations',
      onClick: function () {
        props.handleAnimation();
        setIsAnimationsEnabled(!isAnimationsEnabled); // Toggle the button state
      },
      disabled: false,
      toggle: isAnimationsEnabled,
      className: isAnimationsEnabled ? 'blue' : '',
    },
  ];

  const menuButtons = [
    { label: 'Save', onClick: () => handleClose(true), disabled: false, className: 'green' },
    { label: 'Cancel', onClick: () => handleClose(false), disabled: false, className: 'red' },
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
            disabled={props.buttonsDisabled}
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
            disabled={props.buttonsDisabled}
          />
          <SettingItem
            type="number"
            label="Empty Bottles"
            id="emptyBottles"
            name="emptyBottles"
            value={tempSettings.emptyBottles}
            onChange={handleInputChange}
            min={MIN_EMPTY_BOTTLES}
            max={Math.min(MAX_EMPTY_BOTTLES(), tempSettings.numBottles - 2)}
            disabled={props.buttonsDisabled}
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
            disabled={props.buttonsDisabled}
          />
          <Toolbar buttons={settingButtons} buttonSize='small' />
          <Toolbar buttons={menuButtons} buttonSize='small' />
        </div>
      </div>
    </div>
  );
};

export default SettingMenu;
