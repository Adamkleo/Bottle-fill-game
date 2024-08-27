import { useState, useEffect } from 'react';
import { formatTime } from '../ts/utils';
import '../style/Timer.css';

const MS = 10;

interface TimerProps {
    isRunning: boolean;
    mode: 'hour' | 'minute' | 'second';
    onTimeUpdate?: (time: number) => void;
    onClick?: () => void;
}

function Timer({isRunning, mode, onTimeUpdate, onClick}: TimerProps) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval: number | undefined;

        if (isRunning) {
            interval = window.setInterval(() => {
                setTime((time) => time + MS);
            }, MS);
        } else {
            setTime(0);  // Reset the timer when isRunning is false
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    useEffect(() => {
        if (onTimeUpdate) {
            onTimeUpdate(time);
        }
    }, [time, onTimeUpdate]);

    return (
        <div>
            <span onClick={onClick} className="timer">{formatTime(time, mode)}</span>
        </div>
    );
}

export default Timer;
