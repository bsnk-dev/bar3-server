import searchLoop from '../jobs/searchLoop';
import clearQueue from '../jobs/clearQueue';

/**
 * Starts the clearing queue loop
 */
clearQueue();

/**
 * Starts the nation searching loop
 */
searchLoop();
