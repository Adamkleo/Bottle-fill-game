import { useEffect, useState } from 'react';
import BottleContainer from '../components/BottleContainer';
import ColorPalette from '../components/ColorPalette';
import { BottleData } from '../ts/interfaces';
import { COLOR_PALETTES, settings } from '../ts/options';
import { generateEmptyState } from '../ts/gameLogic';
import '../style/Creator.css';
import Button from '../components/Button';
import { exportBottles } from '../ts/utils';

const Creator = () => {

    const [bottles, setBottles] = useState<BottleData[]>(generateEmptyState());
    const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    useEffect(() => {
        if (selectedBottle !== null && selectedColor !== null) {
            const newBottles = [...bottles];
            const bottle = newBottles[selectedBottle];

            if (selectedColor === 'eraser') {
                if (bottle.colors.length > 0) {
                    bottle.colors.pop();
                    bottle.freeSpace++;
                }
            } else if (bottle.freeSpace > 0) {
                bottle.colors.push(selectedColor);
                bottle.freeSpace--;
            }

            setSelectedColor(null);
            setBottles(newBottles);
        }
    }, [selectedColor]);


    function handleBottleSelect(index: number): void {
        const totalBottles = bottles.length;
        const nonSelectableStartIndex = totalBottles - settings.emptyBottles;

        // Prevent selecting the last N bottles
        if (index >= nonSelectableStartIndex) {
            return; // Do nothing if the selected bottle is one of the last N bottles
        }

        // Toggle selection off if the same bottle is selected
        if (selectedBottle === index) {
            setSelectedBottle(null);
            return;
        }

        setSelectedBottle(index);
    }

    function validate(): boolean {
        const totalBottles = bottles.length;
        const nonEmptyBottles = bottles.slice(0, totalBottles - settings.emptyBottles);
        const bottleSize = settings.bottleLength;

        // Step 1: Check that all non-empty bottles are completely full
        for (let bottle of nonEmptyBottles) {
            if (bottle.colors.length !== bottleSize) {
                return false; // Found a non-empty bottle that is not completely full
            }
        }

        // Step 2: Count occurrences of each color across all non-empty bottles
        const colorCounts: { [color: string]: number } = {};

        for (let bottle of nonEmptyBottles) {
            for (let color of bottle.colors) {
                if (colorCounts[color]) {
                    colorCounts[color]++;
                } else {
                    colorCounts[color] = 1;
                }
            }
        }

        // Step 3: Check that each color is used exactly `size` times
        for (let color in colorCounts) {
            if (colorCounts[color] !== bottleSize) {
                return false; // A color is not used exactly `size` times
            }
        }

        return true;
    }


    function handleSave(): void {
        if (!validate()) {
            alert('Invalid bottle configuration!');
            return;
        }

        const data = exportBottles(bottles);
        console.log(data);
    }

    return (
        <>
            <h1 className='header'>Creator</h1>
            <div>
                <Button
                    size='medium'
                    label='Save'
                    onClick={handleSave}
                    disabled={false}
                    className={'blue'}
                />
                <ColorPalette colors={COLOR_PALETTES[settings.selectedPalette]}
                    handleColorSelect={(color) => setSelectedColor(color)} />
                <BottleContainer
                    bottles={bottles}
                    selectedBottle={selectedBottle}
                    showBottleLabels={settings.labels}
                    onBottleSelect={handleBottleSelect}
                />
            </div>
        </>
    );
}

export default Creator;