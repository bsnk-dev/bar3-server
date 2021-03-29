import state from '../services/state';
import dLog from '../utilities/debugLog';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv)
    .option('debug', {
      alias: 'd',
      type: 'boolean',
      description: 'Run with debug logging and skip opening web browser',
    })
    .option('headless', {
      alias: 'h',
      type: 'boolean',
      description: 'skip opening web browser',
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Change the port to access the ui',
    }).argv;

if (argv.debug) {
  state.setDebugMode(true);
  dLog('Debugging logs are on!');
}

if (argv.headless) {
  state.setHeadlessMode(true);
  console.log('Headless mode enabled');
}

if (argv.port) {
  state.setPort(argv.port);
  console.log('Port overrided to '+argv.port);
}
