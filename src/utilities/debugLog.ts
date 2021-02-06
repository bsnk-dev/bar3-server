import state from '../services/state';
import chalk from 'chalk';

/**
 * Logs only if debugging is on.
 */
export default function debugLog(...args: string[]): void {
  if (state.debug) {
    for (const arg of args) {
      console.log(chalk.magenta('debug'), chalk.green(new Date().toLocaleTimeString()), chalk.grey(arg));
    }
  }
}
