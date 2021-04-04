import state from '../services/state';
import dLog from '../utilities/debugLog';
import nationSearch from '../services/nationSearch';

/**
 * Finds nations to send the messages to
 * It is a timeout because the update time could change
 */
export default function nationSearchTimeout(): void {
  dLog(`Waiting for next loop with ${state.config.updatePeriodMilliseconds}ms delay.`);

  setTimeout(async () => {
    // Start the next one
    nationSearchTimeout();

    nationSearch.findNewNations();
  }, state.config.updatePeriodMilliseconds);
}
