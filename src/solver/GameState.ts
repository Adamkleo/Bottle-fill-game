import { settings } from "../ts/options";
import { allEqual } from "../ts/utils";
import { BottleData } from "../ts/interfaces";
import { isValidMove } from "../ts/gameLogic";


export class GameState {
    public bottles: BottleData[];

    constructor(bottles: BottleData[]) {
        this.bottles = bottles;
    }

    public clone(): GameState {
        const bottlesClone: BottleData[] = this.bottles.map(bottle => ({ ...bottle, colors: [...bottle.colors] }));
        return new GameState(bottlesClone);
    }

    public isGoalState(): boolean {
        // Filter to find bottles that are full (i.e., have the length of bottleLength)
        const fullBottles: BottleData[] = this.bottles.filter(bottle => bottle.colors.length === settings.bottleLength);
        // Check if the number of full bottles is correct: full = total - empty
        const fullBottlesSatisfied: boolean = fullBottles.length === settings.numBottles - settings.emptyBottles;
        // Check if each bottle contains only a single color (number) repeated bottleLength times
        const bottleContentsSatisfied: boolean = this.bottles.every(bottle => allEqual(bottle.colors));

        return fullBottlesSatisfied && bottleContentsSatisfied;
    }



    public getAvailableMoves(): Array<{ from: number, to: number }> {
        const availableMoves: Array<{ from: number, to: number }> = [];

        for (let fromBottleIndex = 0; fromBottleIndex < this.bottles.length; fromBottleIndex++) {
            for (let toBottleIndex = 0; toBottleIndex < this.bottles.length; toBottleIndex++) {
                if (fromBottleIndex !== toBottleIndex && isValidMove(this.bottles, fromBottleIndex, toBottleIndex)) {
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
            const thisBottle = thisClone.bottles.pop()!;

            // Find the matching bottle in otherClone
            const matchingIndex = otherClone.bottles.findIndex(otherBottle =>
                thisBottle.colors.length === otherBottle.colors.length &&
                thisBottle.colors.every((color, idx) => color === otherBottle.colors[idx])
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
            .map(bottle => bottle.colors.join(',')) // Convert the colors array of each bottle to a string
            .sort() // Sorting ensures that the order of bottles doesn't affect the uniqueness
            .join('|'); // Use '|' as a separator between different bottles
    }

}
