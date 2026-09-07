'use strict';
/**
 * @file slim wrapper around console.log to tag logs with timestamps
 * @author Asteria Hart <asteria@strawbs.io>
 */

const dateTag = (parts, ...args) => {
  const assembled = [new Date().toISOString(), parts[0]];
  args.forEach((arg, idx) => {
    assembled.push(arg, parts[idx + 1]);
  });
  return assembled.join('');
};

/**
 *
 * @enum {string} Log levels
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class Logger {
  _level = 'info';

  /**
   * Create a new logger instance, usually a singleton
   * @param {LogLevel} level
   */
  constructor(level) {
    this._level = level;
  }

  /**
   * Change the level of this logger instance dynamically
   * @param {LogLevel} level
   */
  setLevel(level) {
    this._level = level;
  }

  /**
   * Basic log-level enforcement
   * @param {LogLevel} level
   * @returns {boolean} `true` if the message should log
   */
  _shouldLog(level) {
    const setIdx = Object.values(LogLevel).indexOf(this._level);
    const queryIdx = Object.values(LogLevel).indexOf(level);
    return queryIdx >= setIdx;
  }

  _log(level, msg, consoleFunc = 'log') {
    if (!this._shouldLog(level)) return;
    console[consoleFunc](dateTag`  [${level}]:\t${msg}`);
  }

  debug(msg) {
    this._log(LogLevel.DEBUG, msg);
  }

  info(msg) {
    this._log(LogLevel.INFO, msg);
  }

  warn(msg) {
    this._log(LogLevel.WARN, msg);
  }

  error(msg) {
    this._log(LogLevel.ERROR, msg, 'error');
  }
}

const LoggerSingleton = new Logger(LogLevel.INFO);
export default LoggerSingleton;
