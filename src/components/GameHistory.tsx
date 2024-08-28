import { formatTime } from "../ts/utils";
import { GameHistoryProps, GameStatistics } from "../ts/interfaces";
import { BottleData } from "../ts/interfaces";
import '../style/GameHistory.css';

function GameHistory({ gameList }: GameHistoryProps) {

    const showGame = (bottles: BottleData[]) => {
        console.log(bottles)
    }

    return (
        <div className="game-history-container">
            <div className='game-history-line'>
                <span className="game-history-header">Game</span>
                <span className="game-history-header">Time</span>
                <span className="game-history-header">Moves</span>
            </div>
            {gameList.map((game: GameStatistics, index: number) => (
                <div className='game-history-line' key={index}> {/* Adding a key prop here */}
                    <span onClick={() => showGame(game.bottles)} className="game-history-entry clickable">{index + 1}</span>
                    <span className="game-history-entry">{formatTime(game.time, 'minute')}</span>
                    <span className="game-history-entry">{game.moves}</span>
                </div>
            ))}
        </div>
    );
}

export default GameHistory;
