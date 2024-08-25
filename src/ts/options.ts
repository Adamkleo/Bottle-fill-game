// options.ts


import { Settings } from "./interfaces";

export const settings: Settings = {
  numBottles: 8,
  emptyBottles: 2,
  bottleLength: 4,
  maxBottleLength: 8,
  selectedPalette: 1,
  isAnimationsEnabled: false,
  isBottleLabelsEnabled: false,
};

export const MIN_EMPTY_BOTTLES: number = 2;
export const MAX_BOTTLES: number = 14;
export const MIN_BOTTLE_LENGTH: number = 2;
export const MAX_BOTTLE_LENGTH: number = 7;
export const BOTTLE_SCALE: number = 1;

export const MIN_BOTTLES = (): number => MIN_EMPTY_BOTTLES + 2;
export const MAX_EMPTY_BOTTLES = (): number => settings.numBottles - 2;
export const NON_EMPTY_BOTTLES = (): number => settings.numBottles - settings.emptyBottles;


export const BOTTLE_KEY_BINDS: { [key: number]: string } = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
  5: '6',
  6: '7',
  7: 'Q',
  8: 'W',
  9: 'E',
  10: 'R',
  11: 'T',
  12: 'Y',
  13: 'U'
};



const COLORS1: string[] = [
  "#FF0000", // Red
  "#FFA500", // Orange
  "#FFFF00", // Yellow
  "#008000", // Green
  "#00FFFF", // Cyan
  "#0000FF", // Blue
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
  "#808080", // Gray
  "#ADD8E6", // Light Blue
  "#FF00FF"  // Magenta
];


const COLORS2: string[] = [
  "#FF6347", // Tomato
  "#4682B4", // Steel Blue
  "#32CD32", // Lime Green
  "#FFD700", // Gold
  "#8A2BE2", // Blue Violet
  "#FF4500", // Orange Red
  "#00CED1", // Dark Turquoise
  "#ADFF2F", // Green Yellow
  "#FF1493", // Deep Pink
  "#7FFF00", // Chartreuse
  "#FF69B4", // Hot Pink
  "#20B2AA"  // Light Sea Green
];

const COLORS3: string[] = [
  "#FF0000", // Pure Red
  "#00FF00", // Pure Green
  "#0000FF", // Pure Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#000080", // Navy Blue
  "#FFC0CB", // Pink
  "#A52A2A"  // Brown
];


export const COLOR_PALETTES: { [key: number]: string[] } = {
  1: COLORS1,
  2: COLORS2,
  3: COLORS3
}

export const COLOR_PALETTES_LENGTH: number = Object.keys(COLOR_PALETTES).length;