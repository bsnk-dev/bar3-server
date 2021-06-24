import superagent from 'superagent';
import {CampaignAnalytics, CreatedTrackingObject, Link, TrackingAnalytics} from '../interfaces/analytics';
import debugLog from '../utilities/debugLog';
import database from './database';

/**
 * Provides management for analytics of messages, such as the read count, and retrieving and storing that information.
 */
class AnalyticsService {
  private analyticsURL = 'https://t.bsnk.dev';

  /**
   * Creates a pixel to track with and returns it's id and auth information
   * @return {CreatedTrackingObject}
   */
  async createPixel(): Promise<CreatedTrackingObject | null> {
    debugLog(`creating new tracking pixel`);

    const pixel = await superagent
        .post(`${this.analyticsURL}/createPixel`)
        .accept('json')
        .then();

    debugLog(`finished`);

    return pixel?.body || null;
  }

  /**
   * Creates a shortened and trackable link for a url
   * @param {string} url The url that the tracking link should redirect to
   * @return {CreatedTrackingObject}
   */
  async createLink(url: string): Promise<CreatedTrackingObject | null> {
    debugLog(`creating new trackable link`);

    const link = await superagent
        .post(`${this.analyticsURL}/createLink`)
        .send({
          url: url,
        })
        .type('json')
        .then();

    debugLog(`finished`);

    return link?.body || null;
  }

  /**
   * Adds a sent message to the count
   * @param {string?} campaignName The of the campaign, leave blank to get the latest one
   * @return {Promise<void>}
   */
  async incrementSendMessageCount(campaignName?: string) {
    debugLog(`incrementing sent count for tracking campaign ${campaignName}`);

    let campaign;

    (campaignName) ?
      campaign = await database.getCampaignAnalytics(campaignName) :
      campaign = await database.getLatestCampaign();

    if (!campaign) throw new Error('Can\'t get campaign to increment');

    campaign.sentCount++;

    await database.saveCampaignAnalytics(campaign, campaign.name);
  }

  /**
   * Gets analytics about a particular tracking object
   * @param {'pixel' | 'link'} type The type of the tracking object
   * @param {string} id The UID of the tracking object
   * @param {string} auth The authoirzation code to access data about the object
   * @return {TrackingAnalytics}
   */
  async getAnalytics(type: 'pixel' | 'link', id: string, auth: string): Promise<TrackingAnalytics | null> {
    debugLog(`retrieving analytics for ${type} ${id}`);

    const analytics = await superagent
        .get(`${this.analyticsURL}/a`)
        .query({
          i: id,
          auth,
          type,
        })
        .type('json')
        .then();

    debugLog(`finished`);

    return analytics?.body || null;
  }

  /**
   * Converts a URL to a shortened trackable link or returns an object that has already been converted
   * @param {string} url the url that should be converted into a short link
   * @param {string?} user an optional paramter to set the user profile of who should be clicking the link
   */
  async urlToShortLink(url: string, user?: string): Promise<string> {
    const campaignAnalytics = await database.getLatestCampaign().catch();
    if (!campaignAnalytics) throw new Error('Can\'t get latest campaign when creating short link');

    for (const link of campaignAnalytics.links) {
      if (link.url == url) return `${this.analyticsURL}/l?i=${link.id}${user ? '&u='+user : ''}`;
    }

    const newLink = await this.createLink(url);
    if (!newLink) throw new Error(`Cannot create new link for ${url}`);

    const linkData: Link = {
      url,
      id: newLink?.id,
      auth: newLink?.auth,
      readCount: 0,
      readHistory: [],
    };

    campaignAnalytics.links.push(linkData);
    await database.saveCampaignAnalytics(campaignAnalytics, campaignAnalytics.name);

    return `${this.analyticsURL}/l?i=${linkData.id}${user ? '&u='+user : ''}`;
  }

  /**
   * Gets a pixel link for the latest campaign
   * @param {string?} user Optional user who should be viewing this pixel
   */
  async getPixelLink(user?: string): Promise<string> {
    const campaignAnalytics = await database.getLatestCampaign();

    if (campaignAnalytics) {
      return `${this.analyticsURL}/p?i=${campaignAnalytics.messagePixel.id}${user ? '&u='+user : ''}`;
    }

    return '';
  }

  /**
   * Creates a new, blank campaign, saves it, and returns it.
   * @param {string} name The name of the campaign
   */
  async newCampaign(name: string): Promise<CampaignAnalytics> {
    debugLog(`creating new analytics campaign: ${name}`);

    const newMessagePixel = await this.createPixel();
    if (!newMessagePixel) throw new Error('Can\'t create new message pixel!');

    const campaign: CampaignAnalytics = {
      sentCount: 0,
      name,
      createdTime: Date.now(),
      links: [],
      messagePixel: {
        id: newMessagePixel.id,
        auth: newMessagePixel.auth,
        readCount: 0,
        readHistory: [],
      },
    };

    await database.saveCampaignAnalytics(campaign, name);
    return campaign;
  }

  /**
   * Updates the analytical tracking objects within a Analytics campaign
   * @param {string} name The of the campaign, leave blank to get the latest one
   * @return {Promise<void>}
   */
  async updateAnalyticsInCampaign(name?: string): Promise<void> {
    debugLog(`retrieving analytics for tracking campaign ${name}`);

    let campaign;

    (name) ?
      campaign = await database.getCampaignAnalytics(name) :
      campaign = await database.getLatestCampaign();

    if (!campaign) throw new Error('Can\'t get campaign');

    for (const link of campaign.links) {
      const updatedAnalytics = await this.getAnalytics('link', link.id, link.auth);

      link.readCount = updatedAnalytics?.readCount || 0;
      link.readHistory = updatedAnalytics?.readTimeHistory || [];
    }

    const pixelAnalytics = await this.getAnalytics('pixel', campaign.messagePixel.id, campaign.messagePixel.auth);

    campaign.messagePixel.readCount = pixelAnalytics?.readCount || 0;
    campaign.messagePixel.readHistory = pixelAnalytics?.readTimeHistory || [];

    await database.saveCampaignAnalytics(campaign, campaign.name).catch(() => {
      throw new Error('Can\'t save campaign information.');
    });
  }
}

export default new AnalyticsService();
