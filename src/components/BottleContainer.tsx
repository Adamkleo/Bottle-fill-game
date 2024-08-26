import { useMemo, useEffect, useState } from 'react';
import Bottle from './Bottle';
import { BottleData, BottleContainerProps } from '../ts/interfaces';
import { settings } from '../ts/options';

function BottleContainer({ bottles, selectedBottle, showBottleLabels, onBottleSelect }: BottleContainerProps) {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const bottleWidth = 100;
    const gap = 32;
    const marginBottom = 16;
    const numColumns = Math.floor(screenWidth / (bottleWidth + gap));
    const numRows = Math.ceil(settings.numBottles / numColumns);
    const bottlesPerRow = Math.floor(settings.numBottles / numRows);
    const remainder = settings.numBottles % numRows;

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
                    {row.map((bottle) => (
                        <Bottle
                            key={bottle.id}
                            startY={50}
                            colors={bottle.colors}
                            freeSpace={bottle.freeSpace}
                            onClick={() => onBottleSelect(bottle.id)}
                            selected={selectedBottle === bottle.id}
                            size={Math.min(settings.bottleLength, settings.maxBottleLength)}
                            label={showBottleLabels ? bottle.label || '' : ''}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default BottleContainer;
