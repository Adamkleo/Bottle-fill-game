import React, { useState, useEffect } from 'react';
import { formatTime } from '../ts/utils';
import './Timer.css';

const MS = 10;

interface TimerProps {
    isRunning: boolean;
    mode: 'hour' | 'minute' | 'second';
    onTimeUpdate?: (time: number) => void; // New prop to send the time back to the parent
}

function Timer(props: TimerProps) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval: number | undefined;

        if (props.isRunning) {
            interval = window.setInterval(() => {
                setTime((time) => {
                    const newTime = time + MS;
                    if (props.onTimeUpdate) {
                        props.onTimeUpdate(newTime); // Send the time back to the parent
                    }
                    return newTime;
                });
            }, MS);
        } else {
            setTime(0);  // Reset the timer when isRunning is false
            if (props.onTimeUpdate) {
                props.onTimeUpdate(0); // Send reset time to the parent
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [props.isRunning]);
    
    return (
        <div>
            <span className="timer">{formatTime(time, props.mode)}</span>
        </div>
    );
}

export default Timer;