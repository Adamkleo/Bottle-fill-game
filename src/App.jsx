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
	const [bottleAnimations, setBottleAnimations] = useState(settings.isAnimationsEnabled);
	const [showBottleLabels, setShowBottleLabels] = useState(settings.showBottleLabels);
	const [bottleTransforms, setBottleTransforms] = useState({});
	const [movingBottles, setMovingBottles] = useState(new Array(settings.numBottles).fill(false));


	let solver = new Solver();

	const actions = {
		moveUp: () => console.log('Up arrow key action'),
		moveDown: () => console.log('Down arrow key action'),
		confirm: () => console.log('Enter key action'),
		escape: () => setSelectedBottle(null),


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

	useEffect(() => {
		const handleResize = () => {

			setBottleTransforms({});
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);


	function handleNumberPress(bottleIndex) {
		if (selectedBottle === null) {
			if (bottles[bottleIndex].colors.length === 0) {
				return;
			}

			setSelectedBottle(bottleIndex);
		} else {

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

		let emptyBottles = bottles.filter(bottle => bottle.colors.length === 0);
		let fullBottles = bottles.filter(bottle => bottle.colors.length === settings.bottleLength && allEqual(bottle.colors));



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

		let bottlesClone = bottles;

		if (from < 0 || from >= settings.numBottles || to < 0 || to >= settings.numBottles || from === to) {
			return false;
		}


		if (bottlesClone[from].freeSpace === settings.bottleLength) {
			return false;
		}


		if (bottlesClone[to].freeSpace === 0) {
			return false;
		}


		if (bottlesClone[to].freeSpace === settings.bottleLength) {
			return true;
		}


		const topOfFrom = bottlesClone[from].colors[bottlesClone[from].colors.length - 1];
		const topOfTo = bottlesClone[to].colors[bottlesClone[to].colors.length - 1];
		return topOfFrom === topOfTo;
	}

	function makeMove(fromBottleIndex, toBottleIndex) {
		if (!isValidMove(fromBottleIndex, toBottleIndex)) {
			return;
		}


		let bottlesClone = bottles.map(bottle => ({ ...bottle, colors: [...bottle.colors] }));


		let fromBottle = bottlesClone[fromBottleIndex];
		let toBottle = bottlesClone[toBottleIndex];


		const topColor = fromBottle.colors[fromBottle.colors.length - 1];


		let count = 0;
		while (fromBottle.colors.length > 0 && fromBottle.colors[fromBottle.colors.length - 1] === topColor) {
			count++;
			fromBottle.colors.pop();
		}


		const availableSpace = settings.bottleLength - toBottle.colors.length;
		const colorsToMove = Math.min(count, availableSpace);


		for (let i = 0; i < colorsToMove; i++) {
			toBottle.colors.push(topColor);
		}


		const remainingColors = count - colorsToMove;
		for (let i = 0; i < remainingColors; i++) {
			fromBottle.colors.push(topColor);
		}


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


		if (selected === null) {
			setSelectedBottle(id);
			return;
		}


		if (selected === id) {
			setSelectedBottle(null);
			return;
		}


		const newBottles = makeMove(selected, id);
		if (newBottles) {
			if (bottleAnimations) {
				animateBottleMove(selected, id);
			}
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
		setButtonsDisabled(true);
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

	const bottleWidth = 100;
	const bottleHeight = 250;
	const gap = 32;
	const marginBottom = 16;
	const verticalGap = 16;
	const screenWidth = window.innerWidth;
	const numColumns = Math.floor(screenWidth / (bottleWidth + gap));
	const numRows = Math.ceil(settings.numBottles / numColumns);
	const bottlesPerRow = Math.floor(settings.numBottles / numRows);
	const remainder = settings.numBottles % numRows;
	const bottleSpacing = bottleWidth + gap;
	const additionalVerticalGap = 48;
	const rowHeight = bottleHeight + verticalGap + additionalVerticalGap;
	const rotationAngle = 55;


	function animateBottleMove(sourceIndex, targetIndex) {

		setMovingBottles(prev => {
			const newMovingBottles = [...prev];
			newMovingBottles[sourceIndex] = true; // Set the bottle as moving
			return newMovingBottles;
		});

		const sourceRow = Math.floor(sourceIndex / bottlesPerRow);
		const targetRow = Math.floor(targetIndex / bottlesPerRow);


		const sourceCol = sourceIndex % bottlesPerRow;
		const targetCol = targetIndex % bottlesPerRow;

		let direction = sourceCol < targetCol ? 1 : -1;

		const newPositionX = (targetCol - sourceCol) * bottleSpacing - 110 * direction;
		const newPositionY = (targetRow - sourceRow) * rowHeight - 100;

		setBottleTransforms(prevTransforms => ({
			...prevTransforms,
			[sourceIndex]: `translate(${newPositionX}px, ${newPositionY}px) rotate(${(rotationAngle) * direction}deg)`,
		}));
		

		setTimeout(() => {
			setBottleTransforms(prevTransforms => ({
				...prevTransforms,
				[sourceIndex]: `translate(0px, 0px)`,
			}));
			setMovingBottles(prev => {
				const newMovingBottles = [...prev];
				newMovingBottles[sourceIndex] = false; // Reset the moving state
				return newMovingBottles;
			});
		}, 1000);
	}



	function computeRows() {
		const rows = [];
		let start = 0;

		for (let i = 0; i < numRows; i++) {
			const end = start + bottlesPerRow + (i < remainder ? 1 : 0);
			rows.push(bottles.slice(start, end));
			start = end;
		}
		return rows;
	}

	const rows = useMemo(() => computeRows(), [bottles, numRows, remainder, bottlesPerRow]);


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
						setShowSolver(false);
					}
				}}
				handleSolver={(isActive) => {
					setShowSolver(isActive);
					if (isActive) {
						setShowSpeedrunMode(false);
					}
				}}
				handleAnimations={(isActive) => setBottleAnimations(isActive)}
				handleBottleLabels={(isActive) => setShowBottleLabels(isActive)}
				buttonsDisabled={showSpeedrunMode || showSolver}
			/>

			<div className='bottles-container'>
				{rows.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className='bottle-row'
						style={{
							display: 'flex',
							justifyContent: 'center',
							gap: `${gap}px`,
							marginBottom: `${marginBottom}px`,
						}}
					>
						{row.map((bottle, index) => {
							const globalIndex = rowIndex * bottlesPerRow + index;
							return (
								<Bottle
									key={bottle.id}
									startY={50}
									colors={bottle.colors}
									freeSpace={bottle.freeSpace}
									onClick={() => handleClick(bottle.id)}
									selected={selectedBottle === bottle.id}
									size={Math.min(settings.bottleLength, settings.maxBottleLength)}
									number={showBottleLabels ? bottle.number : null}
									transform={bottleTransforms[globalIndex] || ''}
									zIndex={movingBottles[globalIndex] ? 20 : 0}
								/>
							);
						})}
					</div>
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