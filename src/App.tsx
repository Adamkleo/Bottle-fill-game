import { useState, useEffect, useMemo } from 'react';
import './App.css';

import Bottle from './components/Bottle';
import Toolbar from './components/Toolbar';
import SettingMenu from './components/SettingMenu';
import GameHistory from './components/GameHistory';
import Timer from './components/Timer';


import { getNRandomColors, getRandomElements } from './ts/utils';
import { Solver } from './solver/Solver';
import { settings, NON_EMPTY_BOTTLES, COLOR_PALETTES, BOTTLE_KEY_BINDS } from './ts/options';
import { KeyActions, handleKeyPress } from './ts/keyHandlers';
import { GameStatistics, BottleData, ButtonProps } from './ts/interfaces';

import { isWin, makeMove } from './ts/gameLogic';



function App() {

	const numColorsNeeded = NON_EMPTY_BOTTLES();

	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
	const [bottles, setBottles] = useState<BottleData[]>(generateInitialState());
	const [states, setStates] = useState<BottleData[][]>([bottles]);
	const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
	const [showSpeedrunMode, setShowSpeedrunMode] = useState<boolean>(false);
	const [showSolver, setShowSolver] = useState<boolean>(false);
	const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [undoButtonDisabled, setUndoButtonDisabled] = useState<boolean>(false);
	const [currentGame, setCurrentGame] = useState<BottleData[]>([]);
	const [bottleAnimations, setBottleAnimations] = useState<boolean>(settings.isAnimationsEnabled);
	const [showBottleLabels, setShowBottleLabels] = useState<boolean>(settings.isBottleLabelsEnabled);
	const [bottleTransforms, setBottleTransforms] = useState<{ [key: number]: string }>({});
	const [movingBottles, setMovingBottles] = useState<boolean[]>(new Array(settings.numBottles).fill(false));
	const [gameHistory, setGameHistory] = useState<GameStatistics[]>([]);
	const [showGameHistory, setShowGameHistory] = useState<boolean>(false);
	const [displaySolution, setDisplaySolution] = useState<boolean>(false);
	const [, setSolutionSteps] = useState<BottleData[][]>([]);

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
		resetGame()
	}

	useEffect(() => {
		const keyListener = (event: KeyboardEvent) => handleKeyPress(event, actions);
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



	useEffect(() => {
		if (isWin(bottles)) handleWin();
	}, [bottles]);

	useEffect(() => {
		setUndoButtonDisabled(false);
		if (states.length <= 1) setUndoButtonDisabled(true);
	}, [bottles]);

	useEffect(() => {
		if (!showSpeedrunMode) setSpeedrunActive(false);
		if (showSpeedrunMode) setBottles(generateInitialState());
	}, [showSpeedrunMode]);



	function generateInitialState(): BottleData[] {
		let bottles = [];
		for (let i = 0; i < settings.numBottles; i++) {
			const bottle: BottleData = { id: i, colors: [], freeSpace: numColorsNeeded, label: BOTTLE_KEY_BINDS[i] };
			bottles.push(bottle);
		}
		return bottles
	}

	function generateRandomState(palette: { [key: string]: number; }): BottleData[] {
		let bottles = [];
		for (let i = 0; i < settings.numBottles; i++) {
			if (i < NON_EMPTY_BOTTLES()) {
				bottles.push({ id: i, colors: getRandomElements(palette, settings.bottleLength), freeSpace: 0, label: BOTTLE_KEY_BINDS[i] });
			} else {
				bottles.push({ id: i, colors: [], freeSpace: settings.bottleLength, label: BOTTLE_KEY_BINDS[i] });
			}
		}
		return isWin(bottles) ? generateRandomState(palette) : bottles;;
	}



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
			if (bottleAnimations) {
				animateBottleMove(prevSelectedBottle, selectedBottleIndex);
			}
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
		setBottles(generateInitialState)
		setStates([])
		setSpeedrunActive(false);
	}

	const gameButtons: ButtonProps[] = [
		{ label: 'Undo', onClick: undo, disabled: undoButtonDisabled, className: 'red' },
		{ label: 'New Game', onClick: resetGame, disabled: buttonsDisabled, className: 'green' },
	];

	const speedRunButtons: ButtonProps[] = [
		{ label: 'End', onClick: endSpeedrun, disabled: !speedrunActive, className: 'red' },
		{ label: 'Undo', onClick: undo, disabled: undoButtonDisabled, className: 'red' },
		{ label: 'New Game', onClick: startSpeedrun, disabled: speedrunActive, className: 'green' },
	];

	const solverButtons: ButtonProps[] = [
		{ label: 'Solve', onClick: solveGame, disabled: buttonsDisabled, className: 'blue' },
	];

	const handleCloseMenu = (settingModified: boolean): void => {
		setIsMenuOpen(false);
		setButtonsDisabled(false);
		if (settingModified) {
			setBottles(generateInitialState());
		}
		setSelectedBottle(null);
	}

	const handleTimerClick = (): void => {
		setShowGameHistory(!showGameHistory);
	}

	const handleTimeUpdate = (time: number): void => {
		setCurrentTime(time);
	}

	function handleRestart(): void {
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


	function animateBottleMove(sourceIndex: number, targetIndex: number) {

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


	function computeRows(): BottleData[][] {
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
			<img src="src/assets/settings-w.png" alt="settings" className="settings-logo" onClick={() => !buttonsDisabled && toggleMenu()}/>
			<img src="src/assets/restart-w.png" className='restart-logo' alt="restart" onClick={() => !buttonsDisabled && handleRestart()} />

			{/* Conditionally render the toolbar based on the active mode */}
			{(!showSpeedrunMode && !showSolver) && (
				<Toolbar buttons={gameButtons} buttonSize="medium" />
			)}

			{showSpeedrunMode && (
				<>
					<Timer isRunning={speedrunActive} mode="minute" onTimeUpdate={handleTimeUpdate} onClick={handleTimerClick} />
					<Toolbar buttons={speedRunButtons} buttonSize="medium" />
				</>
			)}

			{showSolver && (
				<Toolbar buttons={solverButtons} buttonSize="medium" />
			)}

			<SettingMenu
				isOpen={isMenuOpen}
				onClose={handleCloseMenu}
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
									onClick={() => handleBottleSelect(bottle.id)}
									selected={selectedBottle === bottle.id}
									size={Math.min(settings.bottleLength, settings.maxBottleLength)}
									label={showBottleLabels ? bottle.label || '' : ''}
									transform={bottleTransforms[globalIndex] || ''}
									zIndex={movingBottles[globalIndex] ? 20 : 0}
								/>
							);
						})}
					</div>
				))}
			</div>

			{showSolver && displaySolution && (
				// <SolutionDisplay solution={solution} />
				<div></div>
			)}

			{showSpeedrunMode && showGameHistory && (
				<GameHistory gameList={gameHistory} />
			)}

		</>
	);
}

export default App;