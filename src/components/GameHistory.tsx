import { formatTime } from "../ts/utils";
import { GameHistoryProps, GameStatistics } from "../ts/interfaces";
import './GameHistory.css';


function GameHistory({ gameList }: GameHistoryProps) {



    return (
        <div className="game-history-container">
            <a className="game-history-title">Previous Games</a>
            <div className='game-history-line'>
                <span className="game-history-header">Game</span>
                <span className="game-history-header">Time</span>
                <span className="game-history-header">Moves</span>
            </div>
            {gameList.map((game: GameStatistics, index: number) => (
                <div className='game-history-line'>
                    <span className="game-history-entry">{index + 1}</span>
                    <span className="game-history-entry">{formatTime(game.time, 'minute')}</span>
                    <span className="game-history-entry">{game.moves}</span>
                </div>
            ))}
        </div>
    );
}

export default GameHistory;