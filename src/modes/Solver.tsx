import { useState } from 'react';

import Toolbar from '../components/Toolbar';
import Button from '../components/Button';
import SolutionDisplay from '../components/SolutionDisplay';
import BottleContainer from '../components/BottleContainer';

import { BottleData } from '../ts/interfaces';
import { Solver as BottleSolver } from '../solver/Solver';
import { settings } from '../ts/options';

interface SolverProps {
    bottles: BottleData[];
    setBottles: (bottles: BottleData[]) => void;
    disabled: boolean;
}

const Solver = ({ bottles, setBottles, disabled }: SolverProps) => {
    const [displaySolution, setDisplaySolution] = useState(false);
    const [solution, setSolution] = useState<BottleData[][]>([]);
    const solver = new BottleSolver();

    const handleSolve = () => {
        const result = solver.solve(bottles, 'bfs'); // Assuming 'bfs' is your solving method
        if (result) {
            animateStates(result);
            setSolution(result);
        } else {
            alert("No solution found.");
        }
        setDisplaySolution(true);
    };


	function animateStates(states: BottleData[][]) {
		if (!states) return;
		let i = 0;
		let interval = setInterval(() => {
			if (i < states.length) {
				setBottles(states[i]);
				i++;
			} else {
				clearInterval(interval);
			}
		}, 100);
	}

    return (
        <>
            <h1 className='header'>Solver</h1>
            <Toolbar>
                <Button
                    label="Solve"
                    onClick={handleSolve}
                    disabled={disabled}
                    className="blue"
                    size="medium"
                />
            </Toolbar>

            <BottleContainer
                bottles={bottles}
                selectedBottle={null}
                showBottleLabels={settings.labels}
                onBottleSelect={() => {}} 
            />

            {displaySolution && <SolutionDisplay solution={solution} />}
        </>
    );
};

export default Solver;
