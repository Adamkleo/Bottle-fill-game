import { useState, useEffect } from 'react';
import { BottleData } from '../ts/interfaces';
import { generateEmptyState, makeMove, generateRandomState, isWin } from '../ts/gameLogic';

function useBottleGame() {
    const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
    const [bottles, setBottles] = useState<BottleData[]>(generateEmptyState());
    const [states, setStates] = useState<BottleData[][]>([bottles]);
    const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
    const [undoButtonDisabled, setUndoButtonDisabled] = useState<boolean>(false);
    const [currentGame, setCurrentGame] = useState<BottleData[]>(generateEmptyState());

    useEffect(() => {
        if (isWin(bottles)) {
            handleWin();
        }
    }, [bottles]);

    useEffect(() => {
        setUndoButtonDisabled(states.length <= 1);
    }, [bottles]);

    const handleBottleSelect = (selectedBottleIndex: number): void => {
        if (selectedBottleIndex >= bottles.length) return;

        const prevSelectedBottle = selectedBottle;
        const targetBottle = bottles[selectedBottleIndex];

        if (targetBottle.colors.length === 0 && prevSelectedBottle === null) return;

        if (prevSelectedBottle === null) {
            setSelectedBottle(selectedBottleIndex);
            return;
        }

        if (prevSelectedBottle === selectedBottleIndex) {
            setSelectedBottle(null);
            return;
        }

        const newBottles = makeMove(bottles, prevSelectedBottle, selectedBottleIndex);
        if (newBottles === null) {
            setSelectedBottle(null);
            return;
        }

        setBottles(newBottles);
        setStates((prevStates) => [...prevStates, newBottles]);
        setSelectedBottle(null);
    };

    const undo = (): void => {
        if (states.length > 1) {
            setBottles(states[states.length - 2]);
            setStates(states.slice(0, states.length - 1));
        }
        setSelectedBottle(null);
    };

    const resetGame = (): void => {
        const newBottles = generateRandomState();
        setBottles(newBottles);
        setCurrentGame(newBottles);
        setStates([newBottles]);
        setSelectedBottle(null);
        setButtonsDisabled(false);
    };

    const handleWin = (): void => {
        setButtonsDisabled(true);
        winAnimation();
    };

    const winAnimation = (): void => {
        let bottlesClone = bottles;

        let i = 0;
        let interval = setInterval(() => {
            if (i < bottles[0].colors.length) {
                bottlesClone = bottlesClone.map((bottle) => {
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
    };

    return {
        bottles,
        selectedBottle,
        buttonsDisabled,
        undoButtonDisabled,
        currentGame,
        setBottles,
        setSelectedBottle,
        handleBottleSelect,
        undo,
        resetGame,
        setButtonsDisabled,
    };
}

export default useBottleGame;
