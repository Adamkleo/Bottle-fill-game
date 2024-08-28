import { useState, useEffect } from 'react';
import './App.css';

import Toolbar from './components/Toolbar';
import Menu from './components/Menu';
import GameHistory from './components/GameHistory';
import Timer from './components/Timer';
import BottleContainer from './components/BottleContainer';
import Button from './components/Button';
import SettingItem from './components/SettingItem';
import Creator from './modes/Creator';
import Solver from './modes/Solver';

import {
	settings, MIN_BOTTLES,
	MAX_BOTTLES, MIN_BOTTLE_LENGTH,
	MAX_BOTTLE_LENGTH, MIN_EMPTY_BOTTLES,
	MAX_EMPTY_BOTTLES, COLOR_PALETTES_LENGTH
} from './ts/options';

import { exportBottles, importBottles } from './ts/utils';
import { KeyActions, handleKeyPress } from './ts/keyHandlers';
import { GameStatistics, BottleData } from './ts/interfaces';

import { isWin, makeMove, generateEmptyState, generateRandomState } from './ts/gameLogic';
import { useSettings } from './context/SettingsContext';



function App() {

	const {
		animations,
		labels,
		numBottles,
		bottleLength,
		emptyBottles,
		selectedPalette,
		seed,
		setAnimations,
		setLabels,
		setNumBottles,
		setBottleLength,
		setEmptyBottles,
		setSelectedPalette,
		setSeed,
	} = useSettings();


	enum Mode {
		SpeedRun = 'SpeedRun',
		Solver = 'Solver',
		Creator = 'Creator',
		None = 'None',
	}


	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
	const [bottles, setBottles] = useState<BottleData[]>(generateEmptyState());
	const [states, setStates] = useState<BottleData[][]>([bottles]);
	const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

	const [currentMode, setCurrentMode] = useState<Mode>(Mode.None);

	const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [undoButtonDisabled, setUndoButtonDisabled] = useState<boolean>(false);
	const [currentGame, setCurrentGame] = useState<BottleData[]>(generateEmptyState());

	const [gameHistory, setGameHistory] = useState<GameStatistics[]>([]);

	const [seedInput, setSeedInput] = useState<string>(seed);
	const [settingModified, setSettingModified] = useState<boolean>(false);


	const actions: KeyActions = {
		// Game controls
		escape: () => setSelectedBottle(null),
		z: () => undo(),

		// Bottle controls
		one: () => handleBottleSelect(0),
		two: () => handleBottleSelect(1),
		three: () => handleBottleSelect(2),
		four: () => handleBottleSelect(3),
		five: () => handleBottleSelect(4),
		six: () => handleBottleSelect(5),
		seven: () => handleBottleSelect(6),
		q: () => handleBottleSelect(7),
		w: () => handleBottleSelect(8),
		e: () => handleBottleSelect(9),
		r: () => handleBottleSelect(10),
		t: () => handleBottleSelect(11),
		y: () => handleBottleSelect(12),
		u: () => handleBottleSelect(13),

		d: () => debug()

	};

	function debug() {
		resetGame();
	}


	useEffect(() => {
		const keyListener = (event: KeyboardEvent) => handleKeyPress(event, actions);
		window.addEventListener('keydown', keyListener);

		return () => {
			window.removeEventListener('keydown', keyListener);
		};
	}, [actions]);


	useEffect(() => {
		if (isWin(bottles)) handleWin();
	}, [bottles]);

	useEffect(() => {
		setUndoButtonDisabled(false);
		if (states.length <= 1) setUndoButtonDisabled(true);
	}, [bottles]);

	useEffect(() => {
		if (currentMode != Mode.SpeedRun) setSpeedrunActive(false);
		if (currentMode === Mode.SpeedRun) setBottles(generateEmptyState());
	}, [currentMode]);


	function handleWin(): void {
		setBottles(bottles);
		if (currentMode === Mode.SpeedRun) {
			const latestGameStatistics: GameStatistics = { time: currentTime, moves: states.length - 1, bottles: currentGame };
			setGameHistory([...gameHistory, latestGameStatistics]);
			setSpeedrunActive(false);
		}
		winAnimation();
		setButtonsDisabled(false);
	}

	function winAnimation(): void {
		let bottlesClone = bottles;

		let i = 0;
		let interval = setInterval(() => {
			if (i < settings.bottleLength) {
				bottlesClone = bottlesClone.map(bottle => {
					if (bottle.colors.length > 0) {
						const newColors = [...bottle.colors];
						newColors.pop();
						return { ...bottle, colors: newColors, freeSpace: bottle.freeSpace + 1 };
					}
					return bottle;
				});
				setBottles(bottlesClone);
				i++;
			} else {
				clearInterval(interval);
			}
		}, 300);
		setStates([]);
	}





	function handleBottleSelect(selectedBottleIndex: number): void {
		if (selectedBottleIndex >= settings.numBottles) return;

		const prevSelectedBottle = selectedBottle;
		const targetBottle = bottles[selectedBottleIndex];

		// Return if trying to select an empty bottle as the first bottle
		if (targetBottle.colors.length === 0 && prevSelectedBottle === null) {
			return;
		}

		// Select the bottle if no bottle was previously selected
		if (prevSelectedBottle === null) {
			setSelectedBottle(selectedBottleIndex);
			return;
		}

		// Deselect the currently selected bottle if clicked again
		if (prevSelectedBottle === selectedBottleIndex) {
			setSelectedBottle(null);
			return;
		}

		// Attempt to make the move
		const newBottles = makeMove(bottles, prevSelectedBottle, selectedBottleIndex);
		if (newBottles === null) {
			setSelectedBottle(null);
			return;
		}

		if (newBottles) {
			// Update the bottles and the game states
			setBottles(newBottles);
			setStates((prevStates) => [...prevStates, newBottles]);
		}

		// Reset the selected bottle
		setSelectedBottle(null);
	}


	function undo(): void {
		if (states.length > 1) {
			setBottles(states[states.length - 2]);
			setStates(states.slice(0, states.length - 1));
		}
		setSelectedBottle(null);
	}



	function resetGame(): void {
		const newBottles = generateRandomState();
		setBottles(newBottles);
		setCurrentGame(newBottles);
		setStates([newBottles]);
		setSelectedBottle(null);
		setButtonsDisabled(false);
	}


	const toggleMenu = (): void => {
		setIsMenuOpen(!isMenuOpen);
		setButtonsDisabled(!buttonsDisabled);
	};

	const startSpeedrun = (): void => {
		resetGame();
		setSpeedrunActive(true);
	}

	const endSpeedrun = (): void => {
		setBottles(generateEmptyState)
		setStates([])
		setSpeedrunActive(false);
	}


	const handleCloseMenu = (): void => {
		setIsMenuOpen(false);
		setButtonsDisabled(false);

		if (settingModified) {
			setBottles(generateEmptyState());
			setSelectedBottle(null);
		}

		setSettingModified(false);

	}



	const handleTimeUpdate = (time: number): void => {
		setCurrentTime(time);
	}

	const handleRestart = (): void => {
		if (currentGame === null) return;
		setBottles(currentGame);
		setStates([currentGame]);
	}


	const checkboxSettingItems = [
		{
			label: "Animations",
			id: "isAnimationsEnabled",
			value: animations,
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => setAnimations(event.target.checked),
		},
		{
			label: "Bottle Labels",
			id: "isBottleLabelsEnabled",
			value: labels,
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLabels(event.target.checked),
		},
	];

	const numberSettingItems = [
		{ label: "Bottles", id: "numBottles", value: numBottles, min: MIN_BOTTLES(), max: MAX_BOTTLES },
		{ label: "Bottle Size", id: "bottleLength", value: bottleLength, min: MIN_BOTTLE_LENGTH, max: MAX_BOTTLE_LENGTH },
		{ label: "Empty Bottles", id: "emptyBottles", value: emptyBottles, min: MIN_EMPTY_BOTTLES, max: MAX_EMPTY_BOTTLES() },
		{ label: "Color Palette", id: "selectedPalette", value: selectedPalette, min: 1, max: COLOR_PALETTES_LENGTH },
	];

	const handleNumberSettingChange = (id: string, value: number) => {
		switch (id) {
			case 'numBottles':
				setNumBottles(value);
				break;
			case 'bottleLength':
				setBottleLength(value);
				break;
			case 'emptyBottles':
				setEmptyBottles(value);
				break;
			case 'selectedPalette':
				setSelectedPalette(value);
				break;
			default:
				break;
		}
		setSettingModified(true);
	};

	function handleSeedChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		const regex = /^[0-9]*$/;
		if (regex.test(value) && value.length <= 16) {
			setSeedInput(value);
			setSettingModified(true);
		}
	}


	const switchMode = (mode: Mode) => {
		if (currentMode === mode) {
			setCurrentMode(Mode.None); // Toggle off if the same mode is selected
		} else {
			setCurrentMode(mode);
		}
	};


	return (
		<>
			<img src="src/assets/settings-w.png" alt="settings" className="settings-logo" onClick={() => !buttonsDisabled && toggleMenu()} />
			<img src="src/assets/restart-w.png" className='restart-logo' alt="restart" onClick={() => !buttonsDisabled && handleRestart()} />

			{/* Conditionally render the toolbar based on the active mode */}
			{currentMode === Mode.SpeedRun && (
				<>
					<Timer isRunning={speedrunActive} mode="minute" onTimeUpdate={handleTimeUpdate} />
					<Toolbar>
						<Button label="End" onClick={endSpeedrun} disabled={!speedrunActive} className="red" size="medium" />
						<Button label="Undo" onClick={undo} disabled={undoButtonDisabled} className="red" size="medium" />
						<Button label="New Game" onClick={startSpeedrun} disabled={speedrunActive} className="green" size="medium" />
					</Toolbar>
				</>
			)}

			{currentMode === Mode.Solver && (
				<Solver
					bottles={bottles}
					setBottles={setBottles}
					disabled={buttonsDisabled}
				/>
			)}

			{currentMode === Mode.Creator && (
				<Creator />
			)}

			{currentMode === Mode.None && (
				<>
					<h1 className='header'>Water Sort Plus</h1>
					<Toolbar>
						<Button label="Undo" onClick={undo} disabled={undoButtonDisabled} className="red" size="medium" />
						<Button label="New Game" onClick={resetGame} disabled={buttonsDisabled} className="green" size="medium" />
					</Toolbar>
				</>
			)}

			{(currentMode === Mode.SpeedRun || currentMode === Mode.None) && (
				<>
					<BottleContainer
						bottles={bottles}
						selectedBottle={selectedBottle}
						showBottleLabels={labels}
						onBottleSelect={handleBottleSelect}
					/>
					{currentMode === Mode.SpeedRun && (
						<GameHistory gameList={gameHistory} />
					)}
				</>
			)}

			<Menu isOpen={isMenuOpen} onClose={handleCloseMenu}>
				{numberSettingItems.map((settingItem, index) => (
					<SettingItem
						key={index}
						type="number"
						label={settingItem.label}
						id={settingItem.id}
						value={settingItem.value}
						onChange={(event) => handleNumberSettingChange(settingItem.id, parseInt(event.target.value))}
						min={settingItem.min}
						max={settingItem.max}
						disabled={currentMode === Mode.SpeedRun}
					/>
				))}
				{checkboxSettingItems.map((settingItem, index) => (
					<SettingItem
						key={index}
						type="checkbox"
						label={settingItem.label}
						id={settingItem.id}
						value={settingItem.value}
						onChange={settingItem.onChange}
					/>
				))}

				<a className='seed-label'>Seed</a>
				<div className='seed-container'>
					<SettingItem
						type="text"
						label=""
						id="seed"
						value={seedInput}
						onChange={handleSeedChange}
						disabled={currentMode === Mode.SpeedRun}
					/>
					<button className='confirm-button' onClick={() => setSeed(seedInput)} disabled={currentMode === Mode.SpeedRun}>Set</button>
				</div>
				<div className='import-export-container'>
					<button className='confirm-button' onClick={() => exportBottles(bottles)} disabled={currentMode === Mode.SpeedRun}>Export</button>
					<button className='confirm-button' onClick={() => importBottles(setBottles, setStates)} disabled={currentMode === Mode.SpeedRun}>Import</button>
				</div>

				<Toolbar>
					<Button
						size='small'
						label='SpeedRun'
						onClick={() => switchMode(Mode.SpeedRun)}
						disabled={false}
						className={currentMode === Mode.SpeedRun ? 'blue' : ''}
					/>
					<Button
						size='small'
						label='Solver'
						onClick={() => switchMode(Mode.Solver)}
						disabled={false}
						className={currentMode === Mode.Solver ? 'blue' : ''}
					/>
					<Button
						size='small'
						label='Creator'
						onClick={() => switchMode(Mode.Creator)}
						disabled={false}
						className={currentMode === Mode.Creator ? 'blue' : ''}
					/>
				</Toolbar>
			</Menu>


		</>
	);

}

export default App;