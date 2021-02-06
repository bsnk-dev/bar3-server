import {Message, NationAPICall} from '../interfaces/types';
import configHandler from './state';
import SuperAgent from 'superagent';
import dLog from '../utilities/debugLog';

/**
 * Sends, stores, and queues messages.
 */
class Messages {
  public sentMessages: Message[] = [];
  private readonly maxSentMesssagesToStore = 250;

  private queuedNations: NationAPICall.Nation[] = [];

  /**
   * Sends a message to a nation using your current config
   * @param {NationAPICall.Nation} nation The nation that you want to send the message to
   */
  public async sendMessage(nation: NationAPICall.Nation) {
    const config = configHandler.config;

    dLog(`sending message to ${nation.nation}`);

    const messageHTML = this.customizeMessage(config.messageHTML, nation);
    const subject = this.customizeMessage(config.messageSubject, nation);

    dLog('Customizing message', `Old: ${config.messageHTML}`, `New: ${messageHTML}`);
    dLog('Customizing subject', `Old: ${config.messageSubject}`, `New: ${subject}`);

    const thisMessage = new Message();

    thisMessage.nation = nation;
    this.addMessageToSentMessages(thisMessage);

    dLog('Added message to sent messages');

    let error = '';

    const res = await SuperAgent.post('https://politicsandwar.com/api/send-message')
        .set('Content-Type', 'xxx-application/x-www-form-urlencoded')
        .accept('json')
        .send({
          key: config.apiKey,
          to: nation.nation_id,
          subject: subject,
          message: messageHTML,
        })
        .then()
        .catch((e) => {
          console.error(e);
          error = e;
        });

    dLog('Sent message with API');

    thisMessage.sentTimeMilliseconds = Date.now();

    if (!res) {
      thisMessage.successful = false;
      thisMessage.error = error;
      return thisMessage;
    }

    const resJson = res.body;

    if (!resJson.success) {
      dLog('API returns the message was not sent successfully.');
      thisMessage.successful = false;
      thisMessage.error = resJson.general_message;
      return thisMessage;
    }

    thisMessage.successful = true;

    console.log(`Sent message to ${nation.nation}.`);

    return thisMessage;
  }

  /**
   * Adds a message to the list of sent messages
   * @param {Message} message The sent message object
   */
  private addMessageToSentMessages(message: Message) {
    if (this.sentMessages.length >= this.maxSentMesssagesToStore) {
      this.sentMessages.splice(0, 1);
      dLog('Trimmed sent messages.');
    }

    this.sentMessages.push(message);
    dLog(`Pushed message ${message.nation.nation} to sent messages cache.`);
  }

  /**
   * Clears the internal queue of nations
   */
  public clearQueue() {
    dLog('Clearing the queue.');

    let nation;
    for (nation of this.queuedNations) {
      this.sendMessage(nation);
    }
  }

  /**
   * Adds a nation to the queue, clear it with clearQueue()
   * @param {NationAPICall.Nation} nation The sent message object
   */
  public addNationToQueue(nation: NationAPICall.Nation) {
    this.queuedNations.push(nation);
    console.log(`Added ${nation.nation} to queue.`);
  }

  /**
   * Customizes the message to fit the nation
   * @param {string} text The message as HTML
   * @param {NationAPICall.Nation} nation The nation
   * @return {string} returns the customized message
   */
  private customizeMessage(text: string, nation: NationAPICall.Nation) {
    let customizedMessage = text;
    customizedMessage = customizedMessage.replace(/\\\(nation\)/g, nation.nation);
    customizedMessage = customizedMessage.replace(/\\\(leader\)/g, nation.leader);

    return customizedMessage;
  }
}

export default new Messages();
