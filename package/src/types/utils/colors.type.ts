/**
 * ANSI escape codes for text styling
 * These codes control text formatting in terminal output
 */
export const RESET = "\x1b[0m";  // Reset all styles
export const BOLD = "\x1b[1m";   // Bold/bright text
export const DIM = "\x1b[2m";    // Dim/faded text

/**
 * Predefined ANSI foreground colors
 * Includes standard and bright color variants
 */
export const ANSI_COLORS = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
};

/**
 * ANSI background color codes
 * Used for highlighting text with colored backgrounds
 */
export const BG_COLORS = {
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

/**
 * Default color mapping for each log level
 * Provides semantic color coding for different message types
 */
export const DEFAULT_COLORS = {
  debug: ANSI_COLORS.gray,
  info: ANSI_COLORS.cyan,
  success: ANSI_COLORS.brightGreen,
  warn: ANSI_COLORS.yellow,
  error: ANSI_COLORS.red,
  fatal: ANSI_COLORS.brightRed,
  trace: ANSI_COLORS.magenta,
  log: ANSI_COLORS.white,
};
