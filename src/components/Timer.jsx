import { useState, useEffect } from 'react';
import './Timer.css';

const SECOND = 1_000;

const Timer = ({ interval = SECOND }) => {

    const [time, setTime] = useState(0); // Time in milliseconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => prevTime + interval);
        }, interval);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(timer);
    }, [interval]);

    // Function to format time in HH:MM:SS
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div>
            <h1>Timer</h1>
            <p>{formatTime(time)}</p>
        </div>
    );
};

export default Timer;
