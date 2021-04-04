import state from '../services/state';
import dLog from '../utilities/debugLog';
import yargs from 'yargs/yargs';
import chalk from 'chalk';

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
    })
    .option('workingdir', {
      alias: 'w',
      type: 'string',
      description: 'Change the working directory where config and state is stored',
    }).argv;

if (argv.workingdir) {
  try {
    state.setWorkingDir(argv.workingdir);
    console.log(chalk.green('Config dir override:'), state.workingDir);
  } catch {
    console.log(chalk.red('Invalid working directory provided, defaulting to:'), state.workingDir);
  }
}

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
