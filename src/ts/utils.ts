


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
