import './SettingMenu.css';
import React, { useEffect, useState } from 'react';
import { settings, MAX_EMPTY_BOTTLES, MAX_BOTTLES, MIN_BOTTLES, MIN_BOTTLE_LENGTH, MAX_BOTTLE_LENGTH, COLOR_PALETTES_LENGTH, MIN_EMPTY_BOTTLES } from '../ts/options';
import SettingItem from './SettingItem';
import Toolbar from './Toolbar';
import { SettingsMenuProps } from '../ts/interfaces';


function SettingMenu({ isOpen, onClose, handleSpeedrun, handleSolver,
  handleAnimations, handleBottleLabels, buttonsDisabled }: SettingsMenuProps) {
  const [, setLocalSettings] = useState(settings);
  const [tempSettings, setTempSettings] = useState(settings);
  const [settingModified, setSettingModified] = useState(false);
  const [isSpeedRunEnabled, setIsSpeedRunEnabled] = useState(false);
  const [isSolverEnabled, setIsSolverEnabled] = useState(false);
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(settings.isAnimationsEnabled);
  const [isBottleLabelsEnabled, setIsBottleLabelsEnabled] = useState(settings.isBottleLabelsEnabled);

  useEffect(() => {
    setSettingModified(false);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        handleClose(false);
      }
    };

    function handleClick(event: MouseEvent) {
      if (event.target === document.querySelector('.settings-menu-overlay')) {
        handleClose(false);
      }
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    const parsedValue = type === 'checkbox' ? checked : parseInt(value, 10);

    setTempSettings((prevSettings) => ({
      ...prevSettings,
      [name]: parsedValue,
    }));

    setSettingModified(true);
  };

  function handleClose(saveChanges: boolean) {
    if (saveChanges) {
      handleSave();
    } else {
      setSettingModified(false);
    }
    onClose(settingModified);
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
      isAnimationsEnabled: isAnimationsEnabled,
      isBottleLabelsEnabled: isBottleLabelsEnabled,
    };
  };

  function handleSave() {
    const validatedSettings = validateSettings();
    setLocalSettings(validatedSettings);
    settings.numBottles = validatedSettings.numBottles;
    settings.emptyBottles = validatedSettings.emptyBottles;
    settings.bottleLength = validatedSettings.bottleLength;
    settings.selectedPalette = validatedSettings.selectedPalette;
    settings.isAnimationsEnabled = validatedSettings.isAnimationsEnabled;
    settings.isBottleLabelsEnabled = validatedSettings.isBottleLabelsEnabled;
  };

  function toggleSpeedRun() {
    const newSpeedRunState = !isSpeedRunEnabled;
    setIsSpeedRunEnabled(newSpeedRunState);
    setIsSolverEnabled(false); // Disable solver mode when speedrun is enabled
    handleSpeedrun(newSpeedRunState);
    handleSolver(false); // Make sure solver is off
  }

  function toggleSolver() {
    const newSolverState = !isSolverEnabled;
    setIsSolverEnabled(newSolverState);
    setIsSpeedRunEnabled(false); // Disable speedrun mode when solver is enabled
    handleSolver(newSolverState);
    handleSpeedrun(false); // Make sure speedrun is off
  }

  const settingButtons = [
    {
      label: 'SpeedRun',
      onClick: toggleSpeedRun,
      disabled: false,
      toggle: isSpeedRunEnabled,
      className: isSpeedRunEnabled ? 'blue' : '',
    },
    {
      label: 'Solver',
      onClick: toggleSolver,
      disabled: false,
      toggle: isSolverEnabled,
      className: isSolverEnabled ? 'blue' : '',
    },
  ];

  const menuButtons = [
    { label: 'Save', onClick: () => handleClose(true), disabled: false, className: 'green' },
    { label: 'Cancel', onClick: () => handleClose(false), disabled: false, className: 'red' },
  ];



  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<boolean>>, handler: (isChecked: boolean) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setter(isChecked);
      handler(isChecked);
    };
  };


  const numberSettingItems = [
    { label: "Bottles", id: "numBottles", name: "numBottles", value: tempSettings.numBottles, min: MIN_BOTTLES(), max: MAX_BOTTLES, disabled: buttonsDisabled },
    { label: "Bottle Size", id: "bottleLength", name: "bottleLength", value: tempSettings.bottleLength, min: MIN_BOTTLE_LENGTH, max: MAX_BOTTLE_LENGTH, disabled: buttonsDisabled },
    { label: "Empty Bottles", id: "emptyBottles", name: "emptyBottles", value: tempSettings.emptyBottles, min: MIN_EMPTY_BOTTLES, max: MAX_EMPTY_BOTTLES(), disabled: buttonsDisabled },
    { label: "Color Palette", id: "selectedPalette", name: "selectedPalette", value: tempSettings.selectedPalette, min: 1, max: COLOR_PALETTES_LENGTH, disabled: buttonsDisabled },
  ]

  const checkboxSettingItems = [
    {
      label: "Animations",
      id: "isAnimationsEnabled",
      name: "isAnimationsEnabled",
      value: isAnimationsEnabled,
      onChange: handleCheckboxChange(setIsAnimationsEnabled, handleAnimations),
    },
    {
      label: "Bottle Labels",
      id: "isBottleLabelsEnabled",
      name: "isBottleLabelsEnabled",
      value: isBottleLabelsEnabled,
      onChange: handleCheckboxChange(setIsBottleLabelsEnabled, handleBottleLabels),
    },
  ];


  return (
    <div className={`settings-menu-overlay ${isOpen ? 'open' : ''}`}>
      <div className="settings-menu">
        <div className="settings-menu-body">
          {numberSettingItems.map((settingItem, index) => (
            <SettingItem
              key={index}
              type="number"
              label={settingItem.label}
              id={settingItem.id}
              name={settingItem.name}
              value={settingItem.value}
              onChange={handleInputChange}
              min={settingItem.min}
              max={settingItem.max}
              disabled={settingItem.disabled}
            />
          ))}

          {checkboxSettingItems.map((settingItem, index) => (
            <SettingItem
              key={index}
              type="checkbox"
              label={settingItem.label}
              id={settingItem.id}
              name={settingItem.name}
              value={settingItem.value}
              onChange={settingItem.onChange}
            />
          ))}

          <Toolbar buttons={settingButtons} buttonSize='small' />
          <Toolbar buttons={menuButtons} buttonSize='small' />
        </div>
      </div>
    </div>
  );
};

export default SettingMenu;
