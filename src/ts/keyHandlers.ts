// keyHandlers.ts

export interface KeyActions {
    moveUp: () => void;
    moveDown: () => void;
    confirm: () => void;
    escape: () => void;
    one: () => void;
    two: () => void;
    three: () => void;
    four: () => void;
    five: () => void;
    six: () => void;
    seven: () => void;
    q: () => void;
    w: () => void;
    e: () => void;
    r: () => void;
    t: () => void;
    y: () => void;
    u: () => void;
    // Add more actions as needed, matching the keys you will handle
}

export function handleKeyPress(event: KeyboardEvent, actions: KeyActions) {
    switch (event.key) {
        case 'ArrowUp':
            actions.moveUp();
            break;
        case 'ArrowDown':
            actions.moveDown();
            break;
        case 'Enter':
            actions.confirm();
            break;
        case 'Escape':
            actions.escape();
            break;
        case '1':
            actions.one();
            break;
        case '2':
            actions.two();
            break;
        case '3':
            actions.three();
            break;
        case '4':
            actions.four();
            break;
        case '5':
            actions.five();
            break;
        case '6':
            actions.six();
            break;
        case '7':
            actions.seven();
            break;
        case 'q':
            actions.q();
            break;
        case 'w':
            actions.w();
            break;
        case 'e':
            actions.e();
            break;
        case 'r':
            actions.r();
            break;
        case 't':
            actions.t();
            break;
        case 'y':
            actions.y();
            break;
        case 'u':
            actions.u();
            break;
        // Add more cases as needed
        default:
            break;
    }
}
