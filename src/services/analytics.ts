import superagent from 'superagent';
import {CampaignAnalytics, CreatedTrackingObject, Link, TrackingAnalytics} from '../interfaces/analytics';
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
    const pixel = await superagent
        .post(`${this.analyticsURL}/createPixel`)
        .accept('json')
        .then();

    return pixel?.body || null;
  }

  /**
   * Creates a shortened and trackable link for a url
   * @param {string} url The url that the tracking link should redirect to
   * @return {CreatedTrackingObject}
   */
  async createLink(url: string): Promise<CreatedTrackingObject | null> {
    const link = await superagent
        .post(`${this.analyticsURL}/createLink`)
        .send({
          url: url,
        })
        .type('json')
        .then();

    return link?.body || null;
  }

  /**
   * Gets analytics about a particular tracking object
   * @param {'pixel' | 'link'} type The type of the tracking object
   * @param {string} id The UID of the tracking object
   * @param {string} auth The authoirzation code to access data about the object
   * @return {TrackingAnalytics}
   */
  async getAnalytics(type: 'pixel' | 'link', id: string, auth: string): Promise<TrackingAnalytics | null> {
    const analytics = await superagent
        .get(`${this.analyticsURL}/a`)
        .query({
          i: id,
          auth,
          type,
        })
        .type('json')
        .then();

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
}
