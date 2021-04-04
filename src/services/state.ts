import {Config, NationAPICall} from '../interfaces/types';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const packageRaw = readFileSync(join(__dirname, '../../..', './package.json'));
const packageJson = JSON.parse(packageRaw.toString());

/**
 * Handles the state across Bar 3
 */
class StateHandler {
  public config = new Config();
  public requestsMax = 0;
  public requestsUsed = 0;
  public isApplicationOn = false;
  public nationIDCache: number[] = [];
  public isSetup = false;
  public debug = false;
  public headless = false;
  public port = 8055;
  public workingDir = process.cwd();
  public serverVersion = packageJson.version;

  /**
   * Loads the config
   */
  constructor() {
    this.loadConfig();
    this.loadApplicationState();
  }

  /**
   * Updates the configuration
   * @param {Config} config The new config
   */
  writeConfig(config: Config) {
    this.config = config;
    try {
      writeFileSync(join(this.workingDir, './config.json'), JSON.stringify(config));
      this.isSetup = true;
    } catch {
      console.error('Can\'t write config!');
    }
  }

  /**
   * Writes parts of the current state to a file
   */
  writeApplicationState() {
    try {
      writeFileSync(join(this.workingDir, './state.json'), JSON.stringify({
        isApplicationOn: this.isApplicationOn,
      }));
    } catch {
      console.error('Can\'t write state!');
    }
  }

  /**
   * Load application state
   */
  loadApplicationState() {
    try {
      const rawConfig = readFileSync(join(this.workingDir, './state.json')).toString();
      this.isApplicationOn = JSON.parse(rawConfig).isApplicationOn;
    } catch {
      console.error('Can\'t load state!');
    }
  }

  /**
   * Loads the config from the JSON file.
   */
  private loadConfig() {
    try {
      const rawConfig = readFileSync(join(this.workingDir, './config.json')).toString();
      this.config = JSON.parse(rawConfig);
      this.isSetup = true;
    } catch {
      console.error('Can\'t load raw config!');
      this.isSetup = false;
    }
  }

  /**
   * Updates the API details
   * @param {number} requestsMax The max number of requests for an account
   * @param {number} requestsUsed The used number of requests for an account
   */
  updateCurrentAPIDetails(requestsMax: number, requestsUsed: number) {
    this.requestsMax = requestsMax;
    this.requestsUsed = requestsUsed;
  }

  /**
   * Turns the application on or off
   * @param {boolean} isOn Turn the application on or not
   */
  setApplicationOn(isOn: boolean) {
    this.isApplicationOn = isOn;
    this.writeApplicationState();
    console.log(`Set application state to ${isOn ? 'on' : 'off'}`);
  }

  /**
   * Updates the nation id cache
   * @param {NationAPICall.Nation[]} nations recieved array of nations
   */
  updateNationIDCache(nations: NationAPICall.Nation[]) {
    this.nationIDCache = [];

    let nation;
    for (nation of nations) {
      this.nationIDCache.push(nation.nation_id);
    }
  }

  /**
   * Sets debug mode on or off
   * @param {boolean} debugModeOn Whether or not to turn debug mode on
   */
  setDebugMode(debugModeOn: boolean) {
    this.debug = debugModeOn;
  }

  /**
   * Sets headless mode on or off
   * @param {boolean} headlessModeOn The new value of headless mode with true being on
   */
  setHeadlessMode(headlessModeOn: boolean) {
    this.headless = headlessModeOn;
  }

  /**
   * Sets the port that the UI is accessed on
   * @param {number} port The port as a number
   */
  setPort(port: number) {
    this.port = port;
  }

  /**
   * Sets the working directory and reloads state and config
   * @param {string} dir The working directory to change to
   */
  setWorkingDir(dir: string) {
    // Change directory
    process.chdir(dir);
    this.workingDir = process.cwd();

    // Reload config
    this.loadConfig();
    this.loadApplicationState();
  }
}

export default new StateHandler();
