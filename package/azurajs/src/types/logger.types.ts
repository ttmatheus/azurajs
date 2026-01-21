/**
 * Logger configuration interface
 * Allows customization of logger appearance and behavior
 */
export interface LoggerConfig {
  /** Custom color mapping for log levels (supports hex, rgb, or predefined color names) */
  colors?: Record<string, string>;
  
  /** Custom icon mapping for log levels */
  icons?: Record<string, string>;
  
  /** Whether to display timestamps in log messages */
  showTimestamp?: boolean;
  
  /** Whether to display icons in log messages */
  showIcon?: boolean;
  
  /** Format for timestamp display: 'time' (HH:MM:SS), 'datetime' (full date and time), or 'iso' (ISO 8601) */
  timestampFormat?: "time" | "datetime" | "iso";
  
  /** Custom prefix for log messages (default: 'Azura') */
  prefix?: string;
  
  /** Whether to display log level in uppercase */
  uppercase?: boolean;
  
  /** Apply bold styling to log level label */
  bold?: boolean;
  
  /** Apply dim/faded styling to log level label */
  dim?: boolean;
  
  /** Background color for log level label (supports hex, rgb, or predefined bg color names) */
  backgroundColor?: string;
}