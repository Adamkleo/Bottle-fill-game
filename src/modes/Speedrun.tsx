import { useEffect, useState } from 'react';
import Button from '../components/Button';
import GameHistory from '../components/GameHistory';
import Timer from '../components/Timer';
import Toolbar from '../components/Toolbar';

import { BottleData, GameStatistics } from '../ts/interfaces';
import { isWin } from '../ts/gameLogic';
import Menu from '../components/Menu';

interface SpeedrunProps {
    bottles: BottleData[];
    handleEndGame: () => void;
    handleUndo: () => void;
    handleNewGame: () => void;
    undoButtonDisabled: boolean;
}

function Speedrun({ bottles, handleUndo, handleEndGame, handleNewGame, undoButtonDisabled }: SpeedrunProps) {
    const [speedrunActive, setSpeedrunActive] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameStatistics[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentGame, setCurrentGame] = useState<BottleData[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    useEffect(() => {
        if (isWin(bottles)) {
            const latestGameStatistics: GameStatistics = { time: currentTime, moves: 0, bottles: currentGame };
            setGameHistory([...gameHistory, latestGameStatistics]);
            setSpeedrunActive(false);
        }
    }, [bottles]);

    const handleTimeUpdate = (time: number): void => {
        setCurrentTime(time);
    };


    return (
        <>
            <h1 className='header'>Speedrun</h1>
            <Timer onClick={() => { setIsMenuOpen(true) }} isRunning={speedrunActive} mode="minute" onTimeUpdate={handleTimeUpdate} />
            <Toolbar>
                <Button label="End" onClick={() => {
                    handleEndGame();
                    setSpeedrunActive(false);
                }} disabled={!speedrunActive} className="red" size="medium" />
                <Button label="Undo" onClick={handleUndo} disabled={undoButtonDisabled} className="red" size="medium" />
                <Button label="New Game" onClick={() => {
                    handleNewGame();
                    setCurrentGame(bottles);
                    setCurrentTime(0);
                    setSpeedrunActive(true);
                }
                } disabled={speedrunActive} className="green" size="medium" />
            </Toolbar>
        </>
    );
}

export default Speedrun;
