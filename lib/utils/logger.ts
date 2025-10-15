/**
 * Logger Utility
 * Production-safe logging wrapper that respects NODE_ENV
 * Only logs in development, silent in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  context?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown; // Allow any additional properties
}

/**
 * Logger class with environment-aware logging
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log message with optional context and data
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    options?: LoggerOptions
  ): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${context} ${message}`;
  }

  /**
   * Log informational messages
   * Only logs in development
   */
  info(message: string, options?: LoggerOptions): void {
    if (!this.isDevelopment) return;

    const formattedMessage = this.formatMessage('info', message, options);
    console.log(formattedMessage);

    if (options?.data) {
      console.log('Data:', options.data);
    }
  }

  /**
   * Log warning messages
   * Logs in both development and production
   */
  warn(message: string, options?: LoggerOptions): void {
    const formattedMessage = this.formatMessage('warn', message, options);
    console.warn(formattedMessage);

    if (options?.data && this.isDevelopment) {
      console.warn('Data:', options.data);
    }
  }

  /**
   * Log error messages
   * Logs in both development and production
   */
  error(message: string, error?: Error | unknown, options?: LoggerOptions): void {
    const formattedMessage = this.formatMessage('error', message, options);
    console.error(formattedMessage);

    if (error instanceof Error) {
      console.error('Error:', error.message);
      if (this.isDevelopment && error.stack) {
        console.error('Stack:', error.stack);
      }
    } else if (error) {
      console.error('Error:', error);
    }

    if (options?.data && this.isDevelopment) {
      console.error('Data:', options.data);
    }
  }

  /**
   * Log debug messages
   * Only logs in development
   */
  debug(message: string, options?: LoggerOptions): void {
    if (!this.isDevelopment) return;

    const formattedMessage = this.formatMessage('debug', message, options);
    console.debug(formattedMessage);

    if (options?.data) {
      console.debug('Data:', options.data);
    }
  }

  /**
   * Log a generic object for inspection
   * Only logs in development
   */
  inspect(label: string, data: unknown): void {
    if (!this.isDevelopment) return;

    console.log(`\n=== ${label} ===`);
    console.dir(data, { depth: null, colors: true });
    console.log('='.repeat(label.length + 8) + '\n');
  }

  /**
   * Start a timer for performance measurement
   * Only logs in development
   */
  time(label: string): void {
    if (!this.isDevelopment) return;
    console.time(label);
  }

  /**
   * End a timer and log the duration
   * Only logs in development
   */
  timeEnd(label: string): void {
    if (!this.isDevelopment) return;
    console.timeEnd(label);
  }

  /**
   * Create a grouped log section
   * Only logs in development
   */
  group(label: string): void {
    if (!this.isDevelopment) return;
    console.group(label);
  }

  /**
   * End a grouped log section
   * Only logs in development
   */
  groupEnd(): void {
    if (!this.isDevelopment) return;
    console.groupEnd();
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Default export for convenience
 */
export default logger;
