import React, { useState, useEffect } from 'react';
import './App.css';
import Bottle from './components/Bottle';
import Timer from './components/Timer';
import { shuffleArray, getNRandomColors, getRandomElements } from './ts/utils';
import { Solver } from './solver/solver';
import { BOTTLE_LENGTH, BOTTLE_LIMIT, EMPTY_BOTTLES, NUM_BOTTLES, COLORS2 } from './ts/constants';

function App() {

	const numColorsNeeded = NUM_BOTTLES - EMPTY_BOTTLES;


	const colors = getNRandomColors(COLORS2, numColorsNeeded);

	function generateInitialState() {
		let bottles = [];
		for (let i = 0; i < NUM_BOTTLES; i++) {
			bottles.push({ id: i, colors: [], freeSpace: numColorsNeeded });
		}
		return bottles
	}

	function generateRandomState() {
		let bottles = [];
		for (let i = 0; i < NUM_BOTTLES; i++) {
			if (i < NUM_BOTTLES - 2) {
				bottles.push({ id: i, colors: getRandomElements(colors, BOTTLE_LENGTH), freeSpace: 0 });
			} else {
				bottles.push({ id: i, colors: [], freeSpace: BOTTLE_LENGTH });
			}
		}
		return bottles;
	}

	const [selectedBottle, setSelectedBottle] = useState(null);
	const [bottles, setBottles] = useState(generateInitialState());
	const [states, setStates] = useState([bottles]);
	const [buttonsDisabled, setButtonsDisabled] = useState(false);

	let solver = new Solver();

	function undo() {
		if (states.length > 1) {
			setBottles(states[states.length - 2]);
			setStates(states.slice(0, states.length - 1));
		}
		setSelectedBottle(null);
	}

	function resetGame() {
		const newBottles = generateRandomState();
		setBottles(newBottles);
		setStates([newBottles]);
	}

	function animateStates(states) {
		if (!states) {
			return;
		}
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


	return (
		<>
			<h1>Bottle</h1>
			<Timer />
			<button onClick={undo} disabled={buttonsDisabled}>
				Undo
			</button>
			<button onClick={() => { resetGame() }} disabled={buttonsDisabled}>
				New
			</button>
			<button onClick={() => {
				setButtonsDisabled(true); // Disable buttons when solving starts
				let solve = solver.solve(bottles, 'bfs', true, BOTTLE_LENGTH);
				if (solve) {
					animateStates(solve);
				}
				else {
					alert("No solution found");
					setButtonsDisabled(false);
				}
				animateStates();
			}} disabled={buttonsDisabled}>
				Solve
			</button>


			<div>
				{bottles.map(bottle => (
					<Bottle
						key={bottle.id}
						startY={50}
						colors={bottle.colors}
						freeSpace={bottle.freeSpace}
						onClick={() => handleClick(bottle.id)}
						selected={selectedBottle === bottle.id}
					/>
				))}
			</div>
		</>
	);
}

export default App;
