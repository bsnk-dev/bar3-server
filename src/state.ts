import {Config, NationAPICall} from './types';

/**
 * Handles the configuration store
 */
class StateHandler {
  public config = new Config();
  public requestsMax = 0;
  public requestsUsed = 0;
  public isApplicationOn = true;
  public nationIDCache: number[] = [];

  /**
   * Updates the configuration
   * @param {Config} config The new config
   */
  writeConfig(config: Config) {
    this.config = config;
    // write file
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
}

export default new StateHandler();
