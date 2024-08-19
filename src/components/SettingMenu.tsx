import React, { useEffect, useState } from 'react';
import './SettingMenu.css';
import { settings, MAX_EMPTY_BOTTLES, MAX_BOTTLES, MIN_BOTTLES, MIN_BOTTLE_LENGTH, MAX_BOTTLE_LENGTH, COLOR_PALETTES_LENGTH, MIN_EMPTY_BOTTLES } from '../ts/options';
import SettingItem from './SettingItem';
import Toolbar from './Toolbar';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: (settingModified: boolean) => void;
  handleSpeedrun: (isActive: boolean) => void;
  handleSolver: (isActive: boolean) => void;
  handleAnimations: (isActive: boolean) => void;
  handleBottleLabels: (isActive: boolean) => void;
  buttonsDisabled?: boolean;
}

function SettingMenu(props: SettingsMenuProps) {
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
      if (event.key === 'Escape' && props.isOpen) {
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
  }, [props.isOpen, props.onClose]);

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
    props.onClose(settingModified);
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
    props.handleSpeedrun(newSpeedRunState);
    props.handleSolver(false); // Make sure solver is off
  }

  function toggleSolver() {
    const newSolverState = !isSolverEnabled;
    setIsSolverEnabled(newSolverState);
    setIsSpeedRunEnabled(false); // Disable speedrun mode when solver is enabled
    props.handleSolver(newSolverState);
    props.handleSpeedrun(false); // Make sure speedrun is off
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
          <SettingItem
            type="checkbox"
            label="Animations"
            id="isAnimationsEnabled"
            name="isAnimationsEnabled"
            value={isAnimationsEnabled}
            onChange={(event) => {
              const isChecked = event.target.checked;
              setIsAnimationsEnabled(isChecked);
            }}

          />
          <SettingItem
            type="checkbox"
            label="Bottle Labels"
            id="isBottleLabelsEnabled"
            name="isBottleLabelsEnabled"
            value={isBottleLabelsEnabled}
            onChange={(event) => {
              const isChecked = event.target.checked;
              setIsBottleLabelsEnabled(isChecked);
              props.handleBottleLabels(isChecked);
            }}
            
          />

          <Toolbar buttons={settingButtons} buttonSize='small' />
          <Toolbar buttons={menuButtons} buttonSize='small' />
        </div>
      </div>
    </div>
  );
};

export default SettingMenu;
