import React from 'react';
import './Bottle.css';

const Bottle = ({ startY, colors, onClick, selected }) => {
    const startX = 25; // Center the bottle horizontally within the 100px wide area

    return (
        <svg
            className={`bottle ${selected ? 'selected' : ''}`}
            width="100"
            height="300"
            viewBox="0 0 100 300"
            onClick={onClick}
        >
            {/* Conditionally render the color segments based on colors array */}
            {colors && colors.length >= 4 && (
                <path
                    d={`
                        M ${startX},${startY}
                        L ${startX},${startY + 50}
                        L ${startX + 50},${startY + 50}
                        L ${startX + 50},${startY}
                    `}
                    fill={colors[3]}
                    strokeWidth="0"
                />
            )}

            {colors && colors.length >= 3 && (
                <path
                    d={`
                        M ${startX},${startY + 50}
                        L ${startX},${startY + 100}
                        L ${startX + 50},${startY + 100}
                        L ${startX + 50},${startY + 50}
                    `}
                    fill={colors[2]}
                    strokeWidth="0"
                />
            )}

            {colors && colors.length >= 2 && (
                <path
                    d={`
                        M ${startX},${startY + 100}
                        L ${startX},${startY + 150}
                        L ${startX + 50},${startY + 150}
                        L ${startX + 50},${startY + 100}
                    `}
                    fill={colors[1]}
                    strokeWidth="0"
                />
            )}

            {colors && colors.length >= 1 && (
                <path
                    d={`
                        M ${startX},${startY + 150}
                        C ${startX},${startY + 210} ${startX + 50},${startY + 210} ${startX + 50},${startY + 150}
                    `}
                    fill={colors[0]}
                    strokeWidth="0"
                />
            )}

            {/* Always render the bottle outline */}
            <path
                d={`
                    M ${startX - 5},${startY - 10}
                    L ${startX},${startY - 10}
                    M ${startX},${startY - 10}
                    L ${startX},${startY + 50}
                    L ${startX},${startY + 100}
                    L ${startX},${startY + 150}
                    C ${startX},${startY + 210} ${startX + 50},${startY + 210} ${startX + 50},${startY + 150}
                    L ${startX + 50},${startY + 100}
                    L ${startX + 50},${startY + 50}
                    L ${startX + 50},${startY - 10}
                    L ${startX + 55},${startY - 10}
                `}
                fill="gray"
                fillOpacity="25%"
                stroke="white"
                strokeWidth="2"
            />
        </svg>
    );
};

export default Bottle;
