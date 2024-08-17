// constants.js

export const settings = {
  numBottles: 12,
  emptyBottles: 2,
  bottleLength: 4,
  maxBottleLength: 8,
  selectedPalette: 1
};

export const MIN_EMOTY_BOTTLES = 2;
export const MAX_BOTTLES = 14;
export const MIN_BOTTLE_LENGTH = 2;
export const MAX_BOTTLE_LENGTH = 7;

export const MIN_BOTTLES = () => MIN_EMOTY_BOTTLES + 2
export const MAX_EMPTY_BOTTLES = () => settings.numBottles - 2
export const NON_EMPTY_BOTTLES = () => settings.numBottles - settings.emptyBottles;



const COLORS1 = [
  "#FF5733", // Vivid Red-Orange
  "#C70039", // Deep Red
  "#900C3F", // Dark Purple
  "#581845", // Dark Maroon
  "#1F618D", // Strong Blue
  "#2874E6", // Medium Blue
  "#28B463", // Vibrant Green
  "#239B56", // Deep Green
  "#F1C40F", // Bright Yellow
  "#D35400", // Strong Orange
  "#7D3C98", // Rich Purple
  "#566573" // Steely Gray
];

const COLORS2 = [
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

const COLORS3 = [
  '#2d00f7',
  '#ff69eb',
  '#b100e8',
  '#d100d1',
  '#e500a4',
  '#b9faf8',
  '#ff6d00',
  '#ff9e00',
  '#4cc9f0',
  '#caff8a',
  '#ffee32',
  '#9cf945'
];

const COLORS4 = [
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


export const COLOR_PALETTES = {
  1: COLORS1,
  2: COLORS2,
  3: COLORS3,
  4: COLORS4
}

export const COLOR_PALETTES_LENGTH = Object.keys(COLOR_PALETTES).length;