export interface SettingsMenuProps {
    isOpen: boolean;
    onClose: (settingModified: boolean) => void;
    handleSpeedrun: (isActive: boolean) => void;
    handleSolver: (isActive: boolean) => void;
    handleAnimations: (isActive: boolean) => void;
    handleBottleLabels: (isActive: boolean) => void;
    buttonsDisabled?: boolean;
}

export interface SettingItemProps {
    label: string;
    id: string;
    name: string;
    value: number | string | boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    min?: number;
    max?: number;
    type: 'number' | 'checkbox';
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

export interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled: boolean;
    className: string;
    toggle?: boolean; 
}


export interface ToolbarProps {
    buttons: ButtonProps[];
    buttonSize: 'small' | 'large' | 'medium'; // Define the buttonSize as a prop of the Toolbar
}



export type Settings = {
    numBottles: number;
    emptyBottles: number;
    bottleLength: number;
    maxBottleLength: number;
    selectedPalette: number;
    isAnimationsEnabled: boolean;
    isBottleLabelsEnabled: boolean;
};

export interface BottleContainerProps {
    bottles: BottleData[];
    selectedBottle: number | null;
    showBottleLabels: boolean;
    onBottleSelect: (bottleId: number) => void;
}