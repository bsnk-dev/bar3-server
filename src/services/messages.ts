import {Message, NationAPICall, QueuedNation} from '../interfaces/types';
import configHandler from './state';
import SuperAgent from 'superagent';
import dLog from '../utilities/debugLog';
import {parse} from 'node-html-parser';
import analytics from './analytics';
import debugLog from '../utilities/debugLog';

/**
 * Sends, stores, and queues messages.
 */
class Messages {
  public sentMessages: Message[] = [];
  private readonly maxSentMesssagesToStore = 250;

  private queuedNations: QueuedNation[] = [];

  /**
   * Returns the hash of a string
   * @param {string} str The string to hash
   * @return {number} The hash of the string
   */
  private hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; ++i) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i));
    }

    return Math.abs(hash) | 0;
  }

  /**
   * Sends a message to a nation using your current config
   * @param {NationAPICall.Nation} nation The nation that you want to send the message to
   */
  public async sendMessage(nation: NationAPICall.Nation | { nation_id: number; nation: string; leader: string; }) {
    const config = configHandler.config;

    dLog(`sending message to ${nation.nation}`);

    let messageHTML = this.customizeMessage(config.messageHTML, nation);
    const subject = this.customizeMessage(config.messageSubject, nation);

    dLog('Customizing message', `Old: ${config.messageHTML}`, `New: ${messageHTML}`);
    dLog('Customizing subject', `Old: ${config.messageSubject}`, `New: ${subject}`);

    if (config.analyticsEnabled) {
      await analytics.incrementSendMessageCount().catch((e) => {
        dLog(`Can\'t increment sent count for analytics campaign, ${e}`);
      });

      dLog(`embeding pixel tracker and replacing links with tracking links...`);

      const trackedMessage = await this.addTracking(messageHTML, this.hashString(nation.leader).toString()).catch();
      if (trackedMessage) messageHTML = trackedMessage;
    }

    dLog(`Finished adding tracking for analytics`);

    const thisMessage = new Message();

    thisMessage.nation = nation;
    this.addMessageToSentMessages(thisMessage);

    dLog('Added message to sent messages');

    let error = '';

    const res = await SuperAgent.post('https://politicsandwar.com/api/send-message')
        .set('Content-Type', 'xxx-application/x-www-form-urlencoded')
        .accept('json')
        .type('form')
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
   * Embeds the analytics tracking pixel and replaces links with tracked ones
   * @param {string} messageHTML The input message before tracking
   * @param {string} user A user idenitfier to track with
   * @return {Promise<string>} The trackable message html
   */
  private async addTracking(messageHTML: string, user?: string): Promise<string> {
    const parsedMessage = parse(messageHTML);

    const allLinks = parsedMessage.querySelectorAll('a');

    for (const link of allLinks) {
      if (link.hasAttribute('href')) {
        const beforeLink = link.getAttribute('href');
        if (!beforeLink) continue;

        const trackedLink = await analytics.urlToShortLink(beforeLink, user).catch();
        if (!trackedLink) {
          debugLog(`Failed to get tracked link for ${beforeLink}`);
        }

        debugLog(`retrieved tracking link for ${beforeLink}, new url: ${trackedLink}`);

        link.setAttribute('href', trackedLink);
      }
    }

    debugLog(`finished replacing links in message, adding pixel.`);

    const messageWithTrackingLinks = parsedMessage.toString();
    const pixel = await analytics.getPixelLink(user).catch();

    if (!pixel) {
      debugLog(`Failed to retrieve tracking pixel`);
    }

    debugLog(`retrieved pixel link: ${pixel}`);

    const completedMessage = messageWithTrackingLinks + `<img src="${pixel}"/>`;

    return completedMessage;
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
  public async clearQueue() {
    dLog('Clearing the queue.');

    const usedNationIndexes: number[] = [];

    for (let i = 0; i < this.queuedNations.length; i++) {
      if (this.queuedNations[i].timeQueued + configHandler.config.queueTime < Date.now()) {
        await this.sendMessage(Object.assign({}, this.queuedNations[i].nation));
        usedNationIndexes.push(i);
      }
    }

    const newQueuedNationArray: QueuedNation[] = [];

    for (let i = 0; i < this.queuedNations.length; i++) {
      if (usedNationIndexes.includes(i)) continue;
      newQueuedNationArray.push(this.queuedNations[i]);
    }

    this.queuedNations = newQueuedNationArray;
  }

  /**
   * Adds a nation to the queue, clear it with clearQueue()
   * @param {NationAPICall.Nation} nation The sent message object
   */
  public addNationToQueue(nation: NationAPICall.Nation) {
    this.queuedNations.push({nation: nation, timeQueued: Date.now()});
    console.log(`Added ${nation.nation} to queue.`);
  }

  /**
   * Customizes the message to fit the nation
   * @param {string} text The message as HTML
   * @param {NationAPICall.Nation} nation The nation
   * @return {string} returns the customized message
   */
  private customizeMessage(text: string, nation: NationAPICall.Nation | { nation_id: number; nation: string; leader: string; }) {
    let customizedMessage = text;
    customizedMessage = customizedMessage.replace(/\\\(nation\)/g, nation.nation);
    customizedMessage = customizedMessage.replace(/\\\(leader\)/g, nation.leader);

    return customizedMessage;
  }
}

export default new Messages();
