export interface SettingsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    handleSpeedrun: (isActive: boolean) => void;
    handleSolver: (isActive: boolean) => void;
    handleAnimations: (isActive: boolean) => void;
    handleBottleLabels: (isActive: boolean) => void;
    handleSeedChange: (seed: number) => void;
    buttonsDisabled?: boolean;
}

export interface SettingItemProps {
    label: string;
    id: string;
    value: number | string | boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    min?: number;
    max?: number;
    type: 'number' | 'checkbox' | 'text';
    disabled?: boolean;
}

export interface GameHistoryProps {
    gameList: GameStatistics[];
};

export type GameStatistics = {
    time: number;
    moves: number;
};

export interface BottleProps {
    startY: number;
    colors: string[];
    onClick: () => void;
    selected: boolean;
    size: number;
    number?: number;
    label: string;
    freeSpace: number;
}

export type BottleData = {
    id: number;
    colors: string[];
    freeSpace: number;
    label?: string;
}


export type Settings = {
    numBottles: number;
    emptyBottles: number;
    bottleLength: number;
    maxBottleLength: number;
    selectedPalette: number;
    seed: string;
    animations: boolean;
    labels: boolean;
};

export interface BottleContainerProps {
    bottles: BottleData[];
    selectedBottle: number | null;
    showBottleLabels: boolean;
    onBottleSelect: (bottleId: number) => void;
}

export interface ButtonProps {
    label: string,
    className: string,
    size: string,
    onClick: () => void;
    disabled: boolean;
}