import { Queue } from '../ts/queue';
import { GameState } from './GameState';
import { BottleData } from '../ts/interfaces';
import { makeMove } from '../ts/gameLogic';

export class Solver {

    public solve(state: BottleData[], mode: string): BottleData[][] | null {
        const initialState = new GameState(state); // Create a GameState instance from the initial state

        let result: GameState[] | null = null;
        if (mode === "bfs") {
            result = this.solveWithBFS(initialState);
        }

        if (result) {
            return result.map(gameState => gameState.bottles); // Convert each GameState back to BottleData[] for the return value
        }

        // If no solution is found
        return null;
    }

    private solveWithBFS(initialState: GameState): GameState[] | null {

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
                const newBottles = makeMove(currentState.bottles, move.from, move.to);

                if (newBottles) {
                    const newState = new GameState(newBottles);

                    if (!visitedStates.has(newState.toString())) {
                        queue.enqueue({ state: newState, parent: currentNode });
                        visitedStates.add(newState.toString());
                    }
                }
            }
        }

        if (!goalNode) {
            return null;
        }

        const path: GameState[] = [];
        let node: StateWithParent | null = goalNode;
        while (node) {
            path.unshift(node.state);
            node = node.parent;
        }
        return path;
    }
}
