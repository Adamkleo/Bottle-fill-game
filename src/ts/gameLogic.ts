import { BottleData } from "./interfaces";
import { settings, NON_EMPTY_BOTTLES, BOTTLE_KEY_BINDS } from "./options";
import { allEqual } from "./utils";
import { getRandomElements } from "./utils";

export function isWin(bottles: BottleData[]): boolean {

    let emptyBottles = bottles.filter(bottle => bottle.colors.length === 0);
    let fullBottles = bottles.filter(bottle => bottle.colors.length === settings.bottleLength && allEqual(bottle.colors));

    return emptyBottles.length === settings.emptyBottles && fullBottles.length === NON_EMPTY_BOTTLES()
}


export function isValidMove(bottles: BottleData[], fromBottleIndex: number, toBottleIndex: number): boolean {
    // Boundary checks
    if (
        fromBottleIndex < 0 ||
        fromBottleIndex >= settings.numBottles ||
        toBottleIndex < 0 ||
        toBottleIndex >= settings.numBottles ||
        fromBottleIndex === toBottleIndex
    ) {
        return false;
    }

    const fromBottle = bottles[fromBottleIndex];
    const toBottle = bottles[toBottleIndex];

    // Check if fromBottle is empty or toBottle is full
    if (fromBottle.freeSpace === settings.bottleLength) return false;
    if (toBottle.freeSpace === 0) return false;

    // If the toBottle is completely empty, the move is valid
    if (toBottle.freeSpace === settings.bottleLength) return true;

    // Compare the top colors of both bottles
    const topOfFromBottle = fromBottle.colors[fromBottle.colors.length - 1];
    const topOfToBottle = toBottle.colors[toBottle.colors.length - 1];

    return topOfFromBottle === topOfToBottle;
}


export function makeMove(bottles: BottleData[], fromBottleIndex: number, toBottleIndex: number, force: boolean = false): BottleData[] | null {
    if (!force && !isValidMove(bottles, fromBottleIndex, toBottleIndex)) {
        return null;
    }

    let bottlesClone = bottles.map(bottle => ({ ...bottle, colors: [...bottle.colors] }));

    let fromBottle = bottlesClone[fromBottleIndex];
    let toBottle = bottlesClone[toBottleIndex];

    const topColor = fromBottle.colors[fromBottle.colors.length - 1];

    let count = 0;
    while (fromBottle.colors.length > 0 && fromBottle.colors[fromBottle.colors.length - 1] === topColor) {
        count++;
        fromBottle.colors.pop();
    }

    const availableSpace = settings.bottleLength - toBottle.colors.length;
    const colorsToMove = Math.min(count, availableSpace);

    for (let i = 0; i < colorsToMove; i++) {
        toBottle.colors.push(topColor);
    }

    const remainingColors = count - colorsToMove;
    for (let i = 0; i < remainingColors; i++) {
        fromBottle.colors.push(topColor);
    }

    bottlesClone[fromBottleIndex].freeSpace = settings.bottleLength - fromBottle.colors.length;
    bottlesClone[toBottleIndex].freeSpace = settings.bottleLength - toBottle.colors.length;

    return bottlesClone;
}



export function generateEmptyState(): BottleData[] {
    const bottles = [];
    for (let i = 0; i < settings.numBottles; i++) {
        const bottle: BottleData = { id: i, colors: [], freeSpace: settings.bottleLength, label: BOTTLE_KEY_BINDS[i] };
        bottles.push(bottle);
    }
    return bottles
}

export function generateRandomState(palette: { [key: string]: number; }): BottleData[] {
    const bottles = [];
    for (let i = 0; i < settings.numBottles; i++) {
        if (i < NON_EMPTY_BOTTLES()) {
            bottles.push({ id: i, colors: getRandomElements(palette, settings.bottleLength), freeSpace: 0, label: BOTTLE_KEY_BINDS[i] });
        } else {
            bottles.push({ id: i, colors: [], freeSpace: settings.bottleLength, label: BOTTLE_KEY_BINDS[i] });
        }
    }
    return isWin(bottles) ? generateRandomState(palette) : bottles;
}




