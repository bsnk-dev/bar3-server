import state from '../services/state';
import messages from '../services/messages';

/**
 * Sends the messages that have been queued
 * It is a timeout because the queue time could change
 */
export default function clearNationTimeout(): void {
  setTimeout(() => {
    clearNationTimeout();
    if (!state.isApplicationOn) return;

    messages.clearQueue();
  }, state.config.queueTime);
}
