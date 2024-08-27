import React from 'react';
import '../style/SolutionDisplay.css';
import Bottle from './Bottle';
import { BottleData } from '../ts/interfaces';
import { settings } from '../ts/options';

interface SolutionDisplayProps {
    solution: BottleData[][];
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
    const getMoveData = (prevState: BottleData[], nextState: BottleData[]): { from: BottleData, to: BottleData } | null => {
        let fromBottle: BottleData | null = null;
        let toBottle: BottleData | null = null;

        for (let i = 0; i < prevState.length; i++) {
            const prevBottle = prevState[i];
            const nextBottle = nextState[i];

            if (prevBottle.colors.length > nextBottle.colors.length) {
                fromBottle = prevBottle;
            } else if (nextBottle.colors.length > prevBottle.colors.length) {
                toBottle = prevBottle; // Now using `prevState` for `toBottle` as well
            }

            if (fromBottle && toBottle) {
                console.log(`Move detected: Bottle ${fromBottle.label || fromBottle.id} -> Bottle ${toBottle.label || toBottle.id}`);
                return { from: fromBottle, to: toBottle };
            }
        }

        console.log('No move detected between steps');
        return null;
    };


    return (
        <div className="solution-display">
            <h2 className="solution-header">Solution</h2>
            {solution.map((step, index) => {
                if (index === 0) return null;
                const moveData = getMoveData(solution[index - 1], step);
                if (!moveData) return null;

                return (
                    <div key={index} className="solution-step">
                        <Bottle startY={50} freeSpace={moveData.from.freeSpace}
                            colors={moveData.from.colors} size={settings.bottleLength}
                            label={moveData.from.label} scale={0.5}
                        />

                        <svg
                            className="arrow"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 25 25"
                            width="25" 
                            height="25" 
                        >
                            <g id="Right-2" data-name="Right">
                                <polygon
                                    points="17.5 5.999 16.793 6.706 22.086 11.999 1 11.999 1 12.999 22.086 12.999 16.792 18.294 17.499 19.001 24 12.499 17.5 5.999"
                                    style={{ fill: 'white' }}
                                />
                            </g>
                        </svg>


                        <Bottle startY={50} freeSpace={moveData.to.freeSpace}
                            colors={moveData.to.colors} size={settings.bottleLength}
                            label={moveData.to.label} scale={0.5}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default SolutionDisplay;
