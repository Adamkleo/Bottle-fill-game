import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Bottle from './components/Bottle';
import Toolbar from './components/Toolbar';
import SettingMenu from './components/SettingMenu';
import ToggleSwitch from './components/ToggleSwitch';
import Timer from './components/Timer';
import { getNRandomColors, getRandomElements, allEqual, formatTime } from './ts/utils';
import { Solver } from './solver/solver';
import { settings, NON_EMPTY_BOTTLES, COLOR_PALETTES } from './ts/constants';


function App() {

	const numColorsNeeded = NON_EMPTY_BOTTLES();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSwitchToggled, setisSwitchToggled] = useState(false);
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

	let solver = new Solver();

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
			bottles.push({ id: i, colors: [], freeSpace: numColorsNeeded });
		}
		return bottles
	}

	function generateRandomState(palette) {
		let bottles = [];
		for (let i = 0; i < settings.numBottles; i++) {
			if (i < NON_EMPTY_BOTTLES()) {
				bottles.push({ id: i, colors: getRandomElements(palette, settings.bottleLength), freeSpace: 0 });
			} else {
				bottles.push({ id: i, colors: [], freeSpace: settings.bottleLength });
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

		let removed_colors = [];

		// If a different bottle is selected and the clicked bottle is not full, move the color
		const topOfTarget = targetBottle.colors[targetBottle.colors.length - 1];
		const topOfSelected = bottles[selected].colors[bottles[selected].colors.length - 1];
		if (targetBottle.colors.length < 4 && bottles[selected].colors.length > 0 && (targetBottle.colors.length === 0 || topOfTarget === topOfSelected)) {
			const newBottles = bottles.map(bottle => {
				if (bottle.id === selected) {
					const newColors = [...bottle.colors];

					let removed_color;
					do {
						removed_color = newColors.pop();
						removed_colors.push(removed_color);
					} while (
						newColors.length > 0 &&
						newColors[newColors.length - 1] === removed_color
					);

					let num_removed = removed_colors.length
					let target_capacity = targetBottle.freeSpace
					if (num_removed > target_capacity) {
						let difference = num_removed - target_capacity
						for (let i = 0; i < difference; i++) {
							let removal = removed_colors.pop()
							newColors.push(removal)
						}
					}

					return { ...bottle, colors: newColors, freeSpace: bottle.freeSpace + removed_colors.length };
				}

				return bottle; // Return unchanged bottles immediately
			}).map(bottle => {
				if (bottle.id === id) {
					const newColors = [...bottle.colors, ...removed_colors];
					return { ...bottle, colors: newColors, freeSpace: bottle.freeSpace - removed_colors.length };
				}
				return bottle; // Return unchanged bottles immediately
			});

			setBottles(newBottles);
			setStates([...states, newBottles]);


			setSelectedBottle(null);


			return;
		}
		// Otherwise, select the new bottle
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

	function handleSpeedrun(isSpeedrunActive) {
		setShowSpeedrunMode(isSpeedrunActive);
		if (isSpeedrunActive) {
			setShowSolver(false);  // Turn off Solver mode if Speedrun is activated
		}
	}
	
	function handleSolver(isSolverActive) {
		setShowSolver(isSolverActive);
		if (isSolverActive) {
			setShowSpeedrunMode(false);  // Turn off Speedrun mode if Solver is activated
		}
	}

	return (
		<>
			<img src="src/assets/settings-w.png" alt="settings" className="settings-logo" onClick={toggleMenu} disabled={buttonsDisabled} />
	
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
				handleAnimation={() => { }}
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