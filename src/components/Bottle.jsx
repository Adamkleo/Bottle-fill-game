import React from 'react';
import './Bottle.css';

const Bottle = ({ startY, colors, onClick, selected, size }) => {
    const startX = 25; // Center the bottle horizontally within the 100px wide area
    const colorCellSize = 50;
    const bottleHeight = (size * colorCellSize) + 60; // Adjust height dynamically

    function generateColorSegment(startY, index) {
        const startX = 25; // Assuming startX is constant
        const colorCellSize = 50; // Assuming this is a constant for cell size

        const yOffset = index == 0 ? (size - 1) * colorCellSize : (size - 1 - index) * colorCellSize;
        if (index === 0) {
            // Last color segment with a curved bottom
            return (
                <path
                    key={index}
                    d={`
                        M ${startX},${startY + yOffset}
                        C ${startX},${startY + yOffset + 60} ${startX + 50},${startY + yOffset + 60} ${startX + 50},${startY + yOffset}
                    `}
                    fill={colors[index]}
                    strokeWidth="0"
                />
            );
        } else {
            // Regular color segment with wavy top and bottom
            return (
                <path
                    key={index}
                    d={`
                        M ${startX},${startY + yOffset}
                        L ${startX},${startY + 50 + yOffset}
                        L ${startX + 50},${startY + 50 + yOffset}
                        L ${startX + 50},${startY + yOffset}
                    `}
                    fill={colors[index]}
                    strokeWidth="0"
                />
            );
        }
    }



    return (
        <svg
            className={`bottle ${selected ? 'selected' : ''}`}
            width="100"
            height={bottleHeight} // Dynamically set the height
            viewBox={`0 0 100 ${bottleHeight}`} // Dynamically set the viewBox height
            onClick={onClick}
        >

            {/* Render the color segments */}
            {colors && colors.map((color, index) => generateColorSegment(startY, index))}
            
            {/* Render the first bottle shadow */}
            <path
                d={`
                    M ${startX + 4},${startY + (size - 1) * colorCellSize + 5} 
                    L ${startX + 4},${startY - 18}
                    L ${startX + 12},${startY - 14}
                    L ${startX + 12},${startY + (size - 1) * colorCellSize + 5}
                    M ${startX + 4},${startY + (size - 1) * colorCellSize + 5}
                    C ${startX + 4},${startY + (size - 1) * colorCellSize + 15} ${startX + 12},${startY + (size - 1) * colorCellSize + 40} ${startX + 12},${startY + (size - 1) * colorCellSize + 5}


                `}
                fill="white"
                fillOpacity="40%"
            />

            {/* Render the second bottle shadow */}
            <path
                d={`
                    M ${startX + 15},${startY + (size - 1) * colorCellSize + 5}
                    L ${startX + 15},${startY - 18}
                    L ${startX + 19},${startY - 14}
                    L ${startX + 19},${startY + (size - 1) * colorCellSize + 5}
                    M ${startX + 15},${startY + (size - 1) * colorCellSize + 5}
                    C ${startX + 15},${startY + (size - 1) * colorCellSize + 10} ${startX + 19},${startY + (size - 1) * colorCellSize + 10} ${startX + 19},${startY + (size - 1) * colorCellSize + 5}
                `}
                fill="white"
                fillOpacity="40%"
            />

            {/* Render the bottle */}
            <path
                d={`
                    M ${startX},${startY - 20}
                    L ${startX},${startY + (size - 1) * colorCellSize} 
                    C ${startX},${startY + (size - 1) * colorCellSize + 60} ${startX + 50},${startY + (size - 1) * colorCellSize + 60} ${startX + 50},${startY + (size - 1) * colorCellSize}
                    L ${startX + 50},${startY - 20}
                `}
                fill="gray"
                fillOpacity="15%"
                stroke="white"
                strokeWidth="3"
            />

            <ellipse cx="50" cy="29" rx="25" ry="8" fill="#747474" stroke="white" strokeWidth="3" />


        </svg>
    );
};

export default Bottle;

