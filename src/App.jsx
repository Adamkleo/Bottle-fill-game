import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Bottle from './components/Bottle';
import Toolbar from './components/Toolbar';
import SettingMenu from './components/SettingMenu';
import Timer from './components/Timer';
import { getNRandomColors, getRandomElements, allEqual, formatTime } from './ts/utils';
import { Solver } from './solver/solver';
import { settings, NON_EMPTY_BOTTLES, COLOR_PALETTES, BOTTLE_KEY_BINDS } from './ts/options';
import { handleKeyPress } from './ts/keyHandlers';


function App() {

	const numColorsNeeded = NON_EMPTY_BOTTLES();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [selectedBottle, setSelectedBottle] = useState(null);
	const [bottles, setBottles] = useState(generateInitialState());
	const [states, setStates] = useState([bottles]);
	const [buttonsDisabled, setButtonsDisabled] = useState(false);
	const [showSpeedrunMode, setShowSpeedrunMode] = useState(false);
	const [showSolver, setShowSolver] = useState(false);
	const [speedrunActive, setSpeedrunActive] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [timeHistory, setTimeHistory] = useState([]);
	const [undoButtonDisabled, setUndoButtonDisabled] = useState(false);
	const [currentGame, setCurrentGame] = useState(null);
	const [animations, setAnimations] = useState(false);
	const [showBottleLabels, setShowBottleLabels] = useState(false);


	let solver = new Solver();

	const actions = {
		moveUp: () => console.log('Up arrow key action'),
		moveDown: () => console.log('Down arrow key action'),
		confirm: () => console.log('Enter key action'),
		escape: () => setSelectedBottle(null),
		
		// Bottle selection
		one: () => handleNumberPress(0),
		two: () => handleNumberPress(1),
		three: () => handleNumberPress(2),
		four: () => handleNumberPress(3),
		five: () => handleNumberPress(4),
		six: () => handleNumberPress(5),
		seven: () => handleNumberPress(6),
		q: () => handleNumberPress(7),
		w: () => handleNumberPress(8),
		e: () => handleNumberPress(9),
		r: () => handleNumberPress(10),
		t: () => handleNumberPress(11),
		y: () => handleNumberPress(12),
		u: () => handleNumberPress(13),
		escape: () => setSelectedBottle(null),
	};
	
	useEffect(() => {
		const keyListener = (event) => handleKeyPress(event, actions);
		window.addEventListener('keydown', keyListener);

		return () => {
			window.removeEventListener('keydown', keyListener);
		};
	}, [actions]);


	function handleNumberPress(bottleIndex) {
		if (selectedBottle === null) {
			// No bottle selected yet, so select this one
			setSelectedBottle(bottleIndex);
		} else {
			// A bottle is already selected, try to make a move
			const newBottles = makeMove(selectedBottle, bottleIndex);
			if (newBottles) {
				setBottles(newBottles);
				setStates([...states, newBottles]);
			}
			setSelectedBottle(null);
		}
	}
	

	useEffect(() => {
		checkIfWin(bottles)
	}, [bottles]);

	useEffect(() => {
		setUndoButtonDisabled(false);
		if (states.length === 1) {
			setUndoButtonDisabled(true);
		}
	}, [bottles]);

	useEffect(() => {
		if (!showSpeedrunMode) {
			setSpeedrunActive(false);
		}
		if (showSpeedrunMode) {
			setBottles(generateInitialState());
		}
	}, [showSpeedrunMode]);



	function generateInitialState() {
		let bottles = [];
		for (let i = 0; i < settings.numBottles; i++) {
			bottles.push({ id: i, colors: [], freeSpace: numColorsNeeded, number: BOTTLE_KEY_BINDS[i] });
		}
		return bottles
	}

	function generateRandomState(palette) {
		let bottles = [];
		for (let i = 0; i < settings.numBottles; i++) {
			if (i < NON_EMPTY_BOTTLES()) {
				bottles.push({ id: i, colors: getRandomElements(palette, settings.bottleLength), freeSpace: 0, number: BOTTLE_KEY_BINDS[i] });
			} else {
				bottles.push({ id: i, colors: [], freeSpace: settings.bottleLength, number: BOTTLE_KEY_BINDS[i] });
			}
		}
		return bottles;
	}


	function checkIfWin(bottles) {
		// Separate bottles into empty and full based on their contents
		let emptyBottles = bottles.filter(bottle => bottle.colors.length === 0);
		let fullBottles = bottles.filter(bottle => bottle.colors.length === settings.bottleLength && allEqual(bottle.colors));

		// Check that the number of empty bottles matches the expected EMPTY_BOTTLES
		// and that all remaining bottles are full and uniform in color
		if (emptyBottles.length === settings.emptyBottles && fullBottles.length === NON_EMPTY_BOTTLES()) {
			setBottles(bottles);
			if (showSpeedrunMode) {
				setTimeHistory([...timeHistory, currentTime]);
				setSpeedrunActive(false);
			}
			winAnimation();
			setButtonsDisabled(false);
		}
	}

	function winAnimation() {
		let bottlesClone = bottles;
		// for every non empty bottle, pop the top element, repeat in a timer for bottle_length times
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


	function animateStates(states) {
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

	function isValidMove(from, to) {
		// clone the bottles
		let bottlesClone = bottles;
		// Check if 'from' and 'to' bottles are within the bounds and not the same
		if (from < 0 || from >= settings.numBottles || to < 0 || to >= settings.numBottles || from === to) {
			return false;
		}

		// Check if the 'from' bottle is empty
		if (bottlesClone[from].freeSpace === settings.bottleLength) {
			return false;
		}

		// Check if the 'to' bottle is full
		if (bottlesClone[to].freeSpace === 0) {
			return false;
		}

		// Check if the 'to' bottle is empty
		if (bottlesClone[to].freeSpace === settings.bottleLength) {
			return true;
		}

		// Check if the colors of the top bottles are the same
		const topOfFrom = bottlesClone[from].colors[bottlesClone[from].colors.length - 1];
		const topOfTo = bottlesClone[to].colors[bottlesClone[to].colors.length - 1];
		return topOfFrom === topOfTo;
	}

	function makeMove(fromBottleIndex, toBottleIndex) {
		if (!isValidMove(fromBottleIndex, toBottleIndex)) {
			return;
		}

		// Create a deep copy of the game state
		let bottlesClone = bottles.map(bottle => ({ ...bottle, colors: [...bottle.colors] }));

		// Extract 'from' and 'to' bottles
		let fromBottle = bottlesClone[fromBottleIndex];
		let toBottle = bottlesClone[toBottleIndex];

		// Get the top color of the 'from' bottle
		const topColor = fromBottle.colors[fromBottle.colors.length - 1];

		// Count consecutive matching colors in the 'from' bottle
		let count = 0;
		while (fromBottle.colors.length > 0 && fromBottle.colors[fromBottle.colors.length - 1] === topColor) {
			count++;
			fromBottle.colors.pop(); // Remove the matching color
		}

		// Calculate how many colors can be moved to the 'to' bottle
		const availableSpace = settings.bottleLength - toBottle.colors.length;
		const colorsToMove = Math.min(count, availableSpace);

		// Move the colors to the 'to' bottle
		for (let i = 0; i < colorsToMove; i++) {
			toBottle.colors.push(topColor);
		}

		// If there are any remaining colors in 'from' that couldn't be moved, put them back
		const remainingColors = count - colorsToMove;
		for (let i = 0; i < remainingColors; i++) {
			fromBottle.colors.push(topColor);
		}

		// Update freeSpace properties accordingly
		bottlesClone[fromBottleIndex].freeSpace = settings.bottleLength - fromBottle.colors.length;
		bottlesClone[toBottleIndex].freeSpace = settings.bottleLength - toBottle.colors.length;

		return bottlesClone;
	}



	function handleClick(id) {

		const selected = selectedBottle;
		const targetBottle = bottles[id];

		if (targetBottle.colors.length === 0 && selected === null) {
			return;
		}

		// If no bottle is selected, select the clicked bottle
		if (selected === null) {
			setSelectedBottle(id);
			return;
		}

		// If the clicked bottle is the selected one, unselect it
		if (selected === id) {
			setSelectedBottle(null);
			return;
		}

		// If the clicked bottle is not the selected one, move the colors
		const newBottles = makeMove(selected, id);
		if (newBottles) {
			setBottles(newBottles);
			setStates([...states, newBottles]);
		}
		setSelectedBottle(null);
	}

	function undo() {
		if (states.length > 1) {
			setBottles(states[states.length - 2]);
			setStates(states.slice(0, states.length - 1));
		}
		setSelectedBottle(null);
	}



	function resetGame() {
		const newPalette = getNRandomColors(COLOR_PALETTES[settings.selectedPalette], NON_EMPTY_BOTTLES());
		const newBottles = generateRandomState(newPalette);
		setBottles(newBottles);
		setCurrentGame(newBottles);
		setStates([newBottles]);
		setSelectedBottle(null);
		setButtonsDisabled(false);
	}

	function solveGame() {
		setButtonsDisabled(true); // Disable buttons when solving starts
		let solve = solver.solve(bottles, 'bfs', true);
		if (solve) {
			animateStates(solve);
		}
		else {
			alert("No solution found");
			setButtonsDisabled(false);
		}
	}

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		setButtonsDisabled(!buttonsDisabled);
	};

	const startSpeedrun = () => {
		resetGame();
		setSpeedrunActive(true);
	}

	const endSpeedrun = () => {
		setBottles(generateInitialState)
		setSpeedrunActive(false);
	}

	const gameButtons = [
		{ label: 'Undo', onClick: undo, disabled: undoButtonDisabled, className: 'red' },
		{ label: 'New Game', onClick: resetGame, disabled: buttonsDisabled, className: 'green' },
	];

	const speedRunButtons = [
		{ label: 'End', onClick: endSpeedrun, disabled: !speedrunActive, className: 'red' },
		{ label: 'Undo', onClick: undo, disabled: undoButtonDisabled, className: 'red' },
		{ label: 'New Game', onClick: startSpeedrun, disabled: speedrunActive, className: 'green' },
	];

	const solverButtons = [
		{ label: 'Solve', onClick: solveGame, disabled: buttonsDisabled, className: 'blue' },
	];



	const handleSettingsChange = (name, value) => {
		settings[name] = value;
	};

	const handleCloseMenu = (settingModified) => {
		setIsMenuOpen(false);
		setButtonsDisabled(false);
		if (settingModified) {
			resetGame();
		}
		setSelectedBottle(null);
	}

	function handleTimeUpdate(time) {
		setCurrentTime(time);
	}

	function handleRestart() {
		if (currentGame === null) return;

		setBottles(currentGame);
		setStates([currentGame]);
	}


	return (
		<>
			<img src="src/assets/settings-w.png" alt="settings" className="settings-logo" onClick={toggleMenu} disabled={buttonsDisabled} />
			<img src="src/assets/restart-w.png" className='restart-logo' alt="restart" onClick={handleRestart} />

			{/* Conditionally render the toolbar based on the active mode */}
			{(!showSpeedrunMode && !showSolver) && (
				<Toolbar buttons={gameButtons} buttonSize="medium" />
			)}

			{showSpeedrunMode && (
				<>
					<Timer isRunning={speedrunActive} mode="minute" onTimeUpdate={handleTimeUpdate} />
					<Toolbar buttons={speedRunButtons} buttonSize="medium" />
				</>
			)}

			{showSolver && (
				<Toolbar buttons={solverButtons} buttonSize="medium" />
			)}

			<SettingMenu
				isOpen={isMenuOpen}
				onClose={handleCloseMenu}
				settings={settings}
				onSettingsChange={handleSettingsChange}
				handleSpeedrun={(isActive) => {
					setShowSpeedrunMode(isActive);
					if (isActive) {
						setShowSolver(false); // Ensure Solver mode is turned off when Speedrun is activated
					}
				}}
				handleSolver={(isActive) => {
					setShowSolver(isActive);
					if (isActive) {
						setShowSpeedrunMode(false); // Ensure Speedrun mode is turned off when Solver is activated
					}
				}}
				handleBottleLabels={(isActive) => setShowBottleLabels(isActive)}
				buttonsDisabled={showSpeedrunMode || showSolver}
			/>

			<div className='bottles'>
				{bottles.map(bottle => (
					<Bottle
						key={bottle.id}
						startY={50}
						colors={bottle.colors}
						freeSpace={bottle.freeSpace}
						onClick={() => handleClick(bottle.id)}
						selected={selectedBottle === bottle.id}
						size={Math.min(settings.bottleLength, settings.maxBottleLength)}
						number={showBottleLabels ? bottle.number : null}
					/>
				))}
			</div>

			{showSpeedrunMode && (
				<div className='time-history'>
					{timeHistory.map((time, index) => (
						<div key={index}>{formatTime(time)}</div>
					))}
				</div>
			)}

		</>
	);
}

export default App;