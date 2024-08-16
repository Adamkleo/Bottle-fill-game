import { Queue } from '../ts/queue';
import { GameState, GameConfig } from './GameState';
import { settings } from '../ts/constants';

interface BottleState {
    id: number;
    colors: string[];    // Array of color strings (hex codes in this case)
    freeSpace: number;   // Represents the number of free spaces in the bottle
}

export class Solver {

    public solve(state: BottleState[], mode: string, reconstruct: boolean = false): BottleState[] | BottleState[][] | null {
        const [initialState, colorDict] = this.convertToGameState(state);

        let result: GameState | GameState[] | null = null;
        if (mode === "bfs") {
            result = this.solveWithBFS(initialState, reconstruct);
        }

        if (result) {

            if (Array.isArray(result)) {
                // If reconstruct is true, return the entire path as an array of BottleState[]
                return result.map(gameState => this.convertToBottleState(gameState, colorDict, settings.bottleLength));
            } else {
                // If reconstruct is false, return just the final state as a BottleState[]
                return this.convertToBottleState(result, colorDict, settings.bottleLength);
            }
        }

        // If no solution is found
        return null;
    }



    private convertToBottleState(gameState: GameState, colorDict: { [key: string]: number }, bottleLength: number): BottleState[] {

        // Create a reverse mapping from color ID back to color string
        const reverseColorDict: { [key: number]: string } = {};
        for (const color in colorDict) {
            reverseColorDict[colorDict[color]] = color;
        }

        // Reconstruct the BottleState array
        const bottles: BottleState[] = gameState.bottles.map((bottleColors, index) => {
            const colors = bottleColors.map(colorId => reverseColorDict[colorId]);
            const freeSpace = bottleLength - colors.length; // Calculate freeSpace based on bottleLength
            return {
                id: index,
                colors: colors,
                freeSpace: freeSpace
            };
        });

        return bottles;
    }

    private convertToGameState(state: BottleState[]): [GameState, { [key: string]: number }] {
        const colors: string[] = [];
        const colorDict: { [key: string]: number } = {};
        let colorId = 0;

        for (const bottle of state) {
            for (const color of bottle.colors) {
                if (!(color in colorDict)) {
                    colorDict[color] = colorId;
                    colors.push(color);
                    colorId++;
                }
            }
        }

        let bottles: number[][] = [];
        for (const bottle of state) {
            let bottleColors: number[] = [];
            for (const color of bottle.colors) {
                bottleColors.push(colorDict[color]);
            }
            bottles.push(bottleColors);
        }

        // Create the game state config
        const config: GameConfig = {
            numBottles: state.length,
        };

        const gameState = new GameState(bottles, config);
        return [gameState, colorDict];
    }

    private solveWithBFS(initialState: GameState, reconstruct: boolean): GameState | GameState[] | null {

        interface StateWithParent {
            state: GameState;
            parent: StateWithParent | null;
        }

        const queue = new Queue<StateWithParent>();
        const visitedStates = new Set<string>();
        queue.enqueue({ state: initialState, parent: null });
        visitedStates.add(initialState.toString());

        let goalNode: StateWithParent | null = null;

        while (queue.size() > 0) {
            const currentNode = queue.dequeue()!;
            const currentState = currentNode.state;
            if (currentState.isGoalState()) {
                goalNode = currentNode;
                break;
            }

            for (const move of currentState.getAvailableMoves()) {
                const newState = currentState.makeMove(move.from, move.to);
                if (!visitedStates.has(newState.toString())) {
                    queue.enqueue({ state: newState, parent: currentNode });
                    visitedStates.add(newState.toString());
                }
            }
        }

        if (!goalNode) {
            return null;
        }
        if (!reconstruct) {
            return goalNode.state;
        }

        const path: GameState[] = [];
        let node: StateWithParent | null = goalNode;
        while (node) {
            path.unshift(node.state);
            node = node.parent;
        }
        return path;

        // If the queue is exhausted and no goal state is found

    }

}
