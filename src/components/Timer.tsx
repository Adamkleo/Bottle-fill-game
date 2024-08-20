import React, { useState, useEffect } from 'react';
import { formatTime } from '../ts/utils';
import './Timer.css';

const MS = 10;

interface TimerProps {
    isRunning: boolean;
    mode: 'hour' | 'minute' | 'second';
    onTimeUpdate?: (time: number) => void;
}

function Timer(props: TimerProps) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval: number | undefined;

        if (props.isRunning) {
            interval = window.setInterval(() => {
                setTime((time) => time + MS);
            }, MS);
        } else {
            setTime(0);  // Reset the timer when isRunning is false
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [props.isRunning]);

    useEffect(() => {
        if (props.onTimeUpdate) {
            props.onTimeUpdate(time);
        }
    }, [time, props.onTimeUpdate]);

    return (
        <div>
            <span className="timer">{formatTime(time, props.mode)}</span>
        </div>
    );
}

export default Timer;
