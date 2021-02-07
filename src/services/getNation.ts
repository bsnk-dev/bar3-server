import superagent, {Response} from 'superagent';
import {NationAPICall} from '../interfaces/types';
import dLog from '../utilities/debugLog';
import state from './state';

/**
 * Gets a single nation from the politics and war API
 * @param {number} nationID The id of the nation to get info for.
 * @return {null | NationAPICall.Nation} The nation, or null as an indicator of failure
 */
export default async function getNation(nationID: number): Promise<null | NationAPICall.Nation> {
  const res: Response | null = await superagent.get(`https://politicsandwar.com/api/v2/nations/${state.config.apiKey}/`)
      .accept('json')
      .then()
      .catch((e) => {
        console.error('Cannot get nations!', e);
        return null;
      });

  if (!res || !res.body.api_request.success) {
    dLog('Get nation failed: '+res?.body.api_request.error);
    return null;
  }
  let nation: NationAPICall.Nation;

  for (nation of res.body.data) {
    if (nation.nation_id == nationID) {
      return nation;
    }
  }

  return null;
}
