import state from '../services/state';
import dLog from '../utilities/debugLog';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv)
    .option('debug', {
      alias: 'd',
      type: 'boolean',
      description: 'Run with debug logging',
    }).argv;

if (argv.debug) {
  state.setDebugMode(true);
  dLog('Debugging logs are on!');
}
