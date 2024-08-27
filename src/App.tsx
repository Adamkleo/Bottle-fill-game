import { useState, useEffect } from 'react';
import './App.css';

import Toolbar from './components/Toolbar';
import Menu from './components/Menu';
import GameHistory from './components/GameHistory';
import Timer from './components/Timer';
import BottleContainer from './components/BottleContainer';
import Button from './components/Button';
import SettingItem from './components/SettingItem';
import SolutionDisplay from './components/SolutionDisplay';

import { settings, NON_EMPTY_BOTTLES,
		COLOR_PALETTES, MIN_BOTTLES, 
		MAX_BOTTLES, MIN_BOTTLE_LENGTH,
		MAX_BOTTLE_LENGTH, MIN_EMPTY_BOTTLES,
	   	MAX_EMPTY_BOTTLES, COLOR_PALETTES_LENGTH } from './ts/options';
import { Solver } from './solver/Solver';
import { getNRandomColors, exportBottles, importBottles } from './ts/utils';
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


	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
	const [bottles, setBottles] = useState<BottleData[]>(generateEmptyState());
	const [states, setStates] = useState<BottleData[][]>([bottles]);
	const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
	const [showSpeedrunMode, setShowSpeedrunMode] = useState<boolean>(false);
	const [showSolver, setShowSolver] = useState<boolean>(false);
	const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [undoButtonDisabled, setUndoButtonDisabled] = useState<boolean>(false);
	const [currentGame, setCurrentGame] = useState<BottleData[]>(generateEmptyState());

	const [gameHistory, setGameHistory] = useState<GameStatistics[]>([]);
	const [showGameHistory, setShowGameHistory] = useState<boolean>(false);
	const [displaySolution, setDisplaySolution] = useState<boolean>(false);
	const [solution, setSolutionSteps] = useState<BottleData[][]>([]);

	const [seedInput, setSeedInput] = useState<string>(seed);
	const [settingModified, setSettingModified] = useState<boolean>(false);

	let solver = new Solver();

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
		if (!showSpeedrunMode) setSpeedrunActive(false);
		if (showSpeedrunMode) setBottles(generateEmptyState());
	}, [showSpeedrunMode]);


	function handleWin(): void {
		setBottles(bottles);
		if (showSpeedrunMode) {
			const latestGameStatistics: GameStatistics = { time: currentTime, moves: states.length - 1 };
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


	function animateStates(states: BottleData[][]) {
		if (!states) return;
		let i = 0;
		let interval = setInterval(() => {
			if (i < states.length) {
				setBottles(states[i]);
				i++;
			} else {
				clearInterval(interval);
				setButtonsDisabled(false);
			}
		}, 100);
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
		const newPalette = getNRandomColors(COLOR_PALETTES[settings.selectedPalette], NON_EMPTY_BOTTLES());
		const newBottles = generateRandomState(newPalette);
		setBottles(newBottles);
		setCurrentGame(newBottles);
		setStates([newBottles]);
		setSelectedBottle(null);
		setButtonsDisabled(false);
		setDisplaySolution(false);
		setSolutionSteps([]);
	}

	function solveGame(): void {
		setButtonsDisabled(true);
		let solve: BottleData[][] | null = solver.solve(bottles, 'bfs');
		if (solve) {
			setButtonsDisabled(true);
			animateStates(solve);
			setSolutionSteps(solve);
			setDisplaySolution(true);
			setCurrentGame([]);
		}
		else {
			alert("No solution found");
			setButtonsDisabled(false);
		}
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

	const handleTimerClick = (): void => {
		setShowGameHistory(!showGameHistory);
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

	return (
		<>
			<img src="src/assets/settings-w.png" alt="settings" className="settings-logo" onClick={() => !buttonsDisabled && toggleMenu()} />
			<img src="src/assets/restart-w.png" className='restart-logo' alt="restart" onClick={() => !buttonsDisabled && handleRestart()} />


			{/* Conditionally render the toolbar based on the active mode */}
			{(!showSpeedrunMode && !showSolver) && (
				<Toolbar>
					<Button label="Undo" onClick={undo} disabled={undoButtonDisabled} className="red" size="medium" />
					<Button label="New Game" onClick={resetGame} disabled={buttonsDisabled} className="green" size="medium" />
				</Toolbar>
			)}

			{showSpeedrunMode && (
				<>
					<Timer isRunning={speedrunActive} mode="minute" onTimeUpdate={handleTimeUpdate} onClick={handleTimerClick} />
					<Toolbar>
						<Button label="End" onClick={endSpeedrun} disabled={!speedrunActive} className="red" size="medium" />
						<Button label="Undo" onClick={undo} disabled={undoButtonDisabled} className="red" size="medium" />
						<Button label="New Game" onClick={startSpeedrun} disabled={speedrunActive} className="green" size="medium" />
					</Toolbar>
				</>
			)}

			{showSolver && (
				<Toolbar>
					<Button label="Solve" onClick={solveGame} disabled={buttonsDisabled} className="blue" size="medium" />
				</Toolbar>
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
						disabled={showSpeedrunMode}
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
						disabled={showSpeedrunMode}
					/>
					<button className='confirm-button' onClick={() => setSeed(seedInput)} disabled={showSpeedrunMode}>Set</button>
				</div>
				<div className='import-export-container'>
					<button className='confirm-button' onClick={() => exportBottles(bottles)} disabled={showSpeedrunMode}>Export</button>
					<button className='confirm-button' onClick={() => importBottles(setBottles, setStates)} disabled={showSpeedrunMode}>Import</button>
				</div>

				<Toolbar>
					<Button
						size='small'
						label='SpeedRun'
						onClick={() => {
							setShowSolver(false)
							setShowSpeedrunMode(!showSpeedrunMode)
						}}
						disabled={false}
						className={showSpeedrunMode ? 'blue' : ''}
					/>
					<Button
						size='small'
						label='Solver'
						onClick={() => {
							setShowSpeedrunMode(false)
							setShowSolver(!showSolver)
						}}
						disabled={false}
						className={showSolver ? 'blue' : ''}
					/>
				</Toolbar>
			</Menu>


			<BottleContainer
				bottles={bottles}
				selectedBottle={selectedBottle}
				showBottleLabels={labels}
				onBottleSelect={handleBottleSelect}
			/>

			{showSolver && displaySolution && (
				<SolutionDisplay solution={solution} />
			)}

			{showSpeedrunMode && showGameHistory && (
				<GameHistory gameList={gameHistory} />
			)}

		</>
	);
}

export default App;