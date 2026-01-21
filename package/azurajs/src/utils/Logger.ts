import type { LoggerConfig } from "../types/logger.types";
import {
  ANSI_COLORS,
  BG_COLORS,
  BOLD,
  DEFAULT_COLORS,
  DIM,
  RESET,
} from "../types/utils/colors.type";
import { DEFAULT_ICONS } from "../types/utils/icons.type";

/**
 * Global logger configuration
 * These settings apply to all logger calls unless overridden by instance-specific options
 */
let globalConfig: LoggerConfig = {
  showTimestamp: false,
  showIcon: true,
  timestampFormat: "time",
  prefix: "Azura",
  uppercase: true,
  bold: false,
  dim: false,
};

/**
 * Configure the logger globally
 * Updates default settings that apply to all subsequent log calls
 * @param config - Logger configuration options
 * @example
 * configureLogger({
 *   showTimestamp: true,
 *   timestampFormat: 'datetime',
 *   bold: true,
 *   prefix: 'MyApp'
 * });
 */
export function configureLogger(config: LoggerConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Convert hexadecimal color code to ANSI escape sequence
 * @param hex - Hexadecimal color string (e.g., '#ff5733')
 * @returns ANSI color escape sequence for 24-bit RGB color
 * @example hexToAnsi('#00ff00') // Returns ANSI code for green
 */
function hexToAnsi(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
}

/**
 * Convert RGB color values to ANSI escape sequence
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns ANSI color escape sequence for 24-bit RGB color
 * @example rgbToAnsi(255, 0, 128) // Returns ANSI code for custom pink
 */
function rgbToAnsi(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

/**
 * Resolve color string to ANSI escape sequence
 * Supports hex (#rrggbb), rgb (rgb(r,g,b)), and predefined color names
 * @param color - Color specification string
 * @returns ANSI escape sequence for the specified color
 * @example
 * getColorCode('#ff0000')      // Hex color
 * getColorCode('rgb(255,0,0)') // RGB color
 * getColorCode('brightRed')    // Predefined color
 */
function getColorCode(color: string): string {
  if (color.startsWith("#")) {
    return hexToAnsi(color);
  }
  if (color.startsWith("rgb(")) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return rgbToAnsi(Number(match[1]), Number(match[2]), Number(match[3]));
    }
  }
  return (ANSI_COLORS as any)[color] || color;
}

/**
 * Format current timestamp according to specified format
 * @param format - Timestamp format: 'time' (HH:MM:SS), 'datetime' (locale string), or 'iso' (ISO 8601)
 * @returns Formatted timestamp string
 * @example
 * formatTimestamp('time')     // '14:23:45'
 * formatTimestamp('datetime') // '1/11/2026, 2:23:45 PM'
 * formatTimestamp('iso')      // '2026-01-11T14:23:45.123Z'
 */
function formatTimestamp(format: "time" | "datetime" | "iso"): string {
  const now = new Date();
  switch (format) {
    case "time":
      return now.toLocaleTimeString();
    case "datetime":
      return now.toLocaleString();
    case "iso":
      return now.toISOString();
    default:
      return now.toLocaleTimeString();
  }
}

/**
 * Main logger function - outputs formatted log messages to console
 * Supports multiple log levels, custom colors, icons, timestamps, and styling options
 * @param level - Log level (debug, info, success, warn, error, fatal, trace, log)
 * @param msg - Message to log
 * @param options - Optional configuration to override global settings for this log call
 * @example
 * logger('info', 'Server started on port 3000');
 * logger('error', 'Connection failed', { showTimestamp: true });
 * logger('success', 'Task completed', { colors: { success: '#00ff00' } });
 */
export function logger(
  level: keyof typeof DEFAULT_COLORS,
  msg: string,
  options?: LoggerConfig
): void {
  const config = { ...globalConfig, ...options };

  const colors = { ...DEFAULT_COLORS, ...config.colors };
  const icons = { ...DEFAULT_ICONS, ...config.icons };

  const color = getColorCode(colors[level] || ANSI_COLORS.white);
  const icon = config.showIcon !== false ? icons[level] || "" : "";
  const levelLabel = config.uppercase ? level.toUpperCase() : level;

  let style = color;
  if (config.bold) style += BOLD;
  if (config.dim) style += DIM;
  if (config.backgroundColor) {
    style += getColorCode(config.backgroundColor);
  }

  const parts: string[] = [];

  // Add timestamp if enabled
  if (config.showTimestamp) {
    const timestamp = formatTimestamp(config.timestampFormat || "time");
    parts.push(`${DIM}${timestamp}${RESET}`);
  }

  // Add icon
  if (icon) {
    parts.push(icon);
  }

  // Add prefix and level
  const prefix = config.prefix
    ? `${style}[${config.prefix}:${levelLabel}]${RESET}`
    : `${style}[${levelLabel}]${RESET}`;
  parts.push(prefix);

  // Add message
  parts.push(msg);

  const output = parts.join(" ");

  // Use appropriate console method
  const consoleMethod =
    level === "error" || level === "fatal"
      ? console.error
      : level === "warn"
      ? console.warn
      : level === "debug" || level === "trace"
      ? console.debug
      : console.log;

  consoleMethod(output);
}

/**
 * Convenience methods for each log level
 * Provides a cleaner API for common logging operations
 * @example
 * log.info('Server started');
 * log.error('Connection failed');
 * log.success('Task completed successfully');
 */
export const log = {
  debug: (msg: string, options?: LoggerConfig) => logger("debug", msg, options),
  info: (msg: string, options?: LoggerConfig) => logger("info", msg, options),
  success: (msg: string, options?: LoggerConfig) => logger("success", msg, options),
  warn: (msg: string, options?: LoggerConfig) => logger("warn", msg, options),
  error: (msg: string, options?: LoggerConfig) => logger("error", msg, options),
  fatal: (msg: string, options?: LoggerConfig) => logger("fatal", msg, options),
  trace: (msg: string, options?: LoggerConfig) => logger("trace", msg, options),
  log: (msg: string, options?: LoggerConfig) => logger("log", msg, options),
};

/**
 * Color utility functions and constants for advanced customization
 * Provides direct access to color conversion functions and ANSI codes
 * @example
 * colors.hex('#ff5733')        // Convert hex to ANSI
 * colors.rgb(255, 87, 51)      // Convert RGB to ANSI
 * colors.ansi.brightGreen      // Access predefined colors
 * colors.bg.bgRed              // Access background colors
 */
export const colors = {
  hex: hexToAnsi,
  rgb: rgbToAnsi,
  ansi: ANSI_COLORS,
  bg: BG_COLORS,
  reset: RESET,
  bold: BOLD,
  dim: DIM,
};
