import state from '../services/state';
import superagent, {Response} from 'superagent';
import {NationAPICall} from '../interfaces/types';
import messages from '../services/messages';
import dLog from '../utilities/debugLog';

// FIXME
// let test = false;

/**
 * Finds nations to send the messages to
 * It is a timeout because the update time could change
 */
export default function nationSearchTimeout(): void {
  dLog(`Waiting for next loop with ${state.config.updatePeriodMilliseconds}ms delay.`);

  setTimeout(async () => {
    // Start the next one
    nationSearchTimeout();

    dLog(`Bar 3 is currently ${state.isApplicationOn ? 'on' : 'off'}`);
    if (!state.isApplicationOn) return;

    const nationsRequest: Response | void = await superagent.get(`https://politicsandwar.com/api/v2/nations/${state.config.apiKey}/&max_score=50&alliance_position=0`)
        .accept('json')
        .then()
        .catch((e) => {
          console.error('Cannot get nations!', e);
        });

    if (!nationsRequest) return;
    const apiCall: NationAPICall.RootObject = nationsRequest.body;

    if (!apiCall.api_request.success) {
      console.error('Can\'t get nations! Check your config.');
      dLog('API returned unsuccessful whilst getting nations.');
      return;
    }

    dLog(`API returned ${apiCall.data.length} new nations for processing`);

    state.updateCurrentAPIDetails(
        apiCall.api_request.api_key_details.daily_requests_maximum,
        apiCall.api_request.api_key_details.daily_requests_used);

    dLog('Updated API requests used and max');
    dLog(`Nation ID Cache is storing ${state.nationIDCache.length} nation IDs`);

    if (state.nationIDCache.length == 0) {
      state.updateNationIDCache(apiCall.data);
      return;
    }

    // FIXME
    /* if (!test) {
      messages.addNationToQueue({
        'nation_id': 115888,
        'nation': 'M1A1 Abrams',
        'leader': 'William McKinley',
        'continent': 1,
        'war_policy': 6,
        'domestic_policy': 4,
        'color': 8,
        'alliance_id': 5722,
        'alliance': 'The Ampersand',
        'alliance_position': 2,
        'cities': 3,
        'offensive_wars': 6,
        'defensive_wars': 0,
        'score': 675.37,
        'v_mode': false,
        'v_mode_turns': 0,
        'beige_turns': 0,
        'last_active': '2021-02-07 01:01:02',
        'founded': '2019-01-23 23:24:35',
        'soldiers': 32804,
        'tanks': 2490,
        'aircraft': 150,
        'ships': 20,
        'missiles': 0,
        'nukes': 0,
      });
      test = true;
    }*/

    let nation;
    for (nation of apiCall.data) {
      if (state.nationIDCache.includes(nation.nation_id)) return;
      messages.addNationToQueue(nation);
    }
  }, state.config.updatePeriodMilliseconds);
}
