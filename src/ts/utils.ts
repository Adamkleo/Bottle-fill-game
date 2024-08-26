import { BottleData } from "./interfaces";



export function allEqual<T>(arr: T[]): boolean {
    return arr.every(val => val === arr[0]);
}



export function shuffleArray<T>(array: T[]): T[] {
    // Input validation
    if (!Array.isArray(array)) {
        throw new Error('Invalid parameter: input must be an array');
    }

    try {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    } catch (error) {
        console.error('An error occurred while shuffling the array:', error);
        throw error;
    }

    return array;
}


export function getNRandomColors(arr: string[], N: number): { [key: string]: number } {
    let colors: { [key: string]: number } = {};
    shuffleArray(arr);
    arr.slice(0, N).forEach(color => {
        colors[color] = 0;
    });
    return colors;
}


export function getRandomElements(obj: { [key: string]: number }, N: number): string[] {
    // Input validation
    if (typeof N !== 'number' || N <= 0 || !Number.isInteger(N)) {
        throw new Error('Invalid parameter: N must be a positive integer');
    }

    if (Object.keys(obj).length === 0) {
        throw new Error('Invalid parameter: Object must not be empty');
    }

    let elements: string[] = [];

    try {
        do {
            let keys = Object.keys(obj);
            let element = keys[Math.floor(Math.random() * keys.length)];
            if (obj[element] >= N) {
                continue;
            }
            elements.push(element);
            obj[element]++;
        } while (elements.length < N);
    } catch (error) {
        console.error('An error occurred while selecting random elements:', error);
        throw error;
    }

    return elements;
}



type TimerMode = 'hour' | 'minute' | 'second';

export function formatTime(time: number, mode: TimerMode): string {
    const hours = Math.floor(time / 3_600_000).toString().padStart(2, '0'); // 3,600,000 ms in an hour
    const minutes = Math.floor((time % 3_600_000) / 60_000).toString().padStart(2, '0'); // 60,000 ms in a minute
    const seconds = Math.floor((time % 60_000) / 1_000).toString().padStart(2, '0'); // 1,000 ms in a second
    const milliseconds = Math.floor((time % 1_000) / 10).toString().padStart(2, '0'); // Keep two-digit milliseconds

    if (mode === 'hour') {
        return `${hours}:${minutes}:${seconds}:${milliseconds}`;
    } else if (mode === 'minute') {
        return `${minutes}:${seconds}:${milliseconds}`;
    }
    return `${seconds}:${milliseconds}`;
}



export function calculateNumArrayAvg(timeList: number[], indices?: [number, number]): number {
    if (indices) {
        const [i, j] = indices;
        const selectedTimes = timeList.slice(i, j);
        const sum = selectedTimes.reduce((acc, time) => acc + time, 0);
        return selectedTimes.length > 0 ? sum / selectedTimes.length : 0;
    } else {
        const sum = timeList.reduce((acc, time) => acc + time, 0);
        return timeList.length > 0 ? sum / timeList.length : 0;
    }
}


export const exportBottles = (bottles: BottleData[]): void => {
    const data = JSON.stringify(bottles);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bottles.json';
    a.click();
    URL.revokeObjectURL(url);
}

export const importBottles = (
    bottleSetter: (newBottles: BottleData[]) => void,
    stateSetter: (newState: BottleData[][]) => void
): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const data = reader.result as string;
                const newBottles = JSON.parse(data);
                bottleSetter(newBottles);
                stateSetter([newBottles]);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}