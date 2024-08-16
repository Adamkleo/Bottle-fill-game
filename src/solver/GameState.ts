import { settings } from "../ts/constants";
import { allEqual } from "../ts/utils";


export interface GameConfig {
    numBottles: number;
}

export class GameState {
    public bottles: number[][];
    private config: GameConfig;

    constructor(bottles: number[][], config: GameConfig) {
        this.bottles = bottles;
        this.config = config;

    }

    public clone(): GameState {
        // Clone the current game state
        return new GameState(this.bottles.map(bottle => bottle.slice()), this.config);
    }

    public isGoalState(): boolean {
        // Filter to find bottles that are full (i.e., have the length of bottleLength)
        const fullBottles: number[][] = this.bottles.filter(bottle => bottle.length === settings.bottleLength);
        // Check if the number of full bottles is correct: full = total - empty
        const fullBottlesSatisfied: boolean = fullBottles.length === (this.config.numBottles - settings.emptyBottles);
        // Check if each bottle contains only a single color (number) repeated bottleLength times
        const bottleContentsSatisfied: boolean = fullBottles.every(bottle => allEqual(bottle));

        return fullBottlesSatisfied && bottleContentsSatisfied;
    }

    public isValidMove(fromBottleIndex: number, toBottleIndex: number): boolean {
        // Check if 'from' and 'to' bottles are within the bounds and not the same
        if (!this.checkBounds(fromBottleIndex, toBottleIndex)) {
            throw new Error("Invalid move: out of bounds!");
        }

        // Check if the 'from' bottle is empty
        if (this.bottles[fromBottleIndex].length === 0) {
            return false;
        }

        // Check if the 'to' bottle is full
        if (this.bottles[toBottleIndex].length === settings.bottleLength) {
            return false;
        }

        // Check if the 'to' bottle is empty
        if (this.bottles[toBottleIndex].length === 0) {
            return true;
        }

        // Check if the colors of the top bottles are the same
        const topOfFromBottle: number = this.bottles[fromBottleIndex][this.bottles[fromBottleIndex].length - 1];
        const topOfToBottle: number = this.bottles[toBottleIndex][this.bottles[toBottleIndex].length - 1];
        return topOfFromBottle === topOfToBottle;
    }

    public makeMove(fromBottleIndex: number, toBottleIndex: number): GameState {
        if (!this.isValidMove(fromBottleIndex, toBottleIndex)) {
            throw new Error("Invalid move from " + fromBottleIndex + " to " + toBottleIndex);
        }

        // Create a copy of the game state
        const newState: GameState = this.clone();
        const bottles: number[][] = newState.bottles;

        // Determine the top color in the 'from' bottle
        const topColor = bottles[fromBottleIndex][bottles[fromBottleIndex].length - 1];

        // Count consecutive matching colors in the 'from' bottle
        let count = 0;
        while (bottles[fromBottleIndex].length > 0 && bottles[fromBottleIndex][bottles[fromBottleIndex].length - 1] === topColor) {
            count++;
            bottles[fromBottleIndex].pop(); // Remove the matching color
        }

        // Calculate how many colors can be moved to the 'to' bottle
        const availableSpace = settings.bottleLength - bottles[toBottleIndex].length;
        const colorsToMove = Math.min(count, availableSpace);

        // Move the colors to the 'to' bottle
        for (let i = 0; i < colorsToMove; i++) {
            bottles[toBottleIndex].push(topColor);
        }

        // If there are any remaining colors in 'from' that couldn't be moved, put them back
        const remainingColors = count - colorsToMove;
        for (let i = 0; i < remainingColors; i++) {
            bottles[fromBottleIndex].push(topColor);
        }

        // Return the new game state
        return newState;
    }


    public getAvailableMoves(): Array<{ from: number, to: number }> {
        const availableMoves: Array<{ from: number, to: number }> = [];

        for (let fromBottleIndex = 0; fromBottleIndex < this.bottles.length; fromBottleIndex++) {
            for (let toBottleIndex = 0; toBottleIndex < this.bottles.length; toBottleIndex++) {
                if (fromBottleIndex !== toBottleIndex && this.isValidMove(fromBottleIndex, toBottleIndex)) {
                    availableMoves.push({ from: fromBottleIndex, to: toBottleIndex });
                }
            }
        }

        return availableMoves;
    }


    public isSameState(other: GameState): boolean {
        // Clone both states to avoid modifying the originals
        const thisClone = this.clone();
        const otherClone = other.clone();

        // While there are bottles left in thisClone
        while (thisClone.bottles.length > 0) {
            const bottle = thisClone.bottles.pop()!;

            // Find the matching bottle in otherClone
            const matchingIndex = otherClone.bottles.findIndex(otherBottle =>
                bottle.length === otherBottle.length && bottle.every((color, idx) => color === otherBottle[idx])
            );

            // If no matching bottle is found, states are not the same
            if (matchingIndex === -1) {
                return false;
            }

            // Remove the matching bottle from otherClone
            otherClone.bottles.splice(matchingIndex, 1);
        }

        // If all bottles are matched, the states are the same
        return true;
    }



    public isDeadlock(): boolean {
        // A deadlock occurs when there are no available moves
        return this.getAvailableMoves().length === 0;
    }

    public toString(): string {
        // Create a string that represents the state of the bottles
        return this.bottles
            .map(bottle => bottle.join(','))
            .sort() // Sorting ensures that the order of bottles doesn't affect the uniqueness
            .join('|'); // Use '|' as a separator between different bottles
    }



    private checkBounds(fromBottleIndex: number, toBottleIndex: number): boolean {
        if ((fromBottleIndex < 0 || fromBottleIndex >= this.config.numBottles) ||
            (toBottleIndex < 0 || toBottleIndex >= this.config.numBottles) ||
            (fromBottleIndex === toBottleIndex)) {
            return false;
        }
        return true;
    }


}
