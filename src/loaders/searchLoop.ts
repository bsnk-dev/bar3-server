import state from '../services/state';
import superagent, {Response} from 'superagent';
import {NationAPICall} from '../interfaces/types';
import messages from '../services/messages';

/**
 * Finds nations to send the messages to
 * It is a timeout because the update time could change
 */
function nationSearchTimeout() {
  setTimeout(async () => {
    // Start the next one
    nationSearchTimeout();

    if (!state.isApplicationOn) return;

    const nationsRequest: Response | void = await superagent.get(`https://politicsandwar.com/api/v2/nations/${state.config.apiKey}/&max_score=50&alliance_position=0`)
        .accept('json')
        .then()
        .catch((e) => {
          console.error('Cannot get nations!', e);
        });

    if (!nationsRequest) return;
    const apiCall: NationAPICall.RootObject = nationsRequest.body;

    state.updateCurrentAPIDetails(
        apiCall.api_request.api_key_details.daily_requests_maximum,
        apiCall.api_request.api_key_details.daily_requests_used);

    if (state.nationIDCache.length == 0) {
      state.updateNationIDCache(apiCall.data);
      return;
    }

    let nation;
    for (nation of apiCall.data) {
      if (state.nationIDCache.includes(nation.nation_id)) return;
      messages.addNationToQueue(nation);
    }
  }, state.config.updatePeriodMilliseconds);
}


/**
 * Sends the messages that have been queued
 * It is a timeout because the queue time could change
 */
function clearNationTimeout() {
  setTimeout(() => {
    clearNationTimeout();
    if (!state.isApplicationOn) return;

    messages.clearQueue();
  }, state.config.queueTime);
}

/**
 * Starts the clearing of the queue
 */
clearNationTimeout();

/**
 * Starts the nation searching loop
 */
nationSearchTimeout();
