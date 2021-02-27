import {Config, NationAPICall} from '../interfaces/types';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const cwd = process.cwd();

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
      writeFileSync(join(cwd, './config.json'), JSON.stringify(config));
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
      writeFileSync(join(cwd, './state.json'), JSON.stringify({
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
      const rawConfig = readFileSync(join(cwd, './state.json')).toString();
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
      const rawConfig = readFileSync(join(cwd, './config.json')).toString();
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
}

export default new StateHandler();
