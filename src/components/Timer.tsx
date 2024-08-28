import { useState, useEffect } from 'react';
import { formatTime } from '../ts/utils';
import '../style/Timer.css';
import { TimerProps } from '../ts/interfaces';

const MS = 10;

function Timer({isRunning, mode, onTimeUpdate}: TimerProps) {
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
            <span className="timer">{formatTime(time, mode)}</span>
        </div>
    );
}

export default Timer;
