import Datastore from 'nedb';
import {CampaignAnalytics} from '../interfaces/analytics';

/**
 * Manages anything to do with saving data to databases
 */
class DatabaseService {
  private analyticsDB!: Datastore;
  private analyticsDBLoaded = false;

  /**
   * Sets up the databases for use
   */
  constructor() {
    this.analyticsDB = new Datastore({
      filename: 'analytics.db',
      autoload: true,
      onload: () => this.analyticsDBLoaded = true,
    });
  }

  /**
   * Saves updated analytics about a specific campaign
   * @param {CampaignAnalytics} analytics The analytics of a campaign
   * @param {string} name The name of the campaign
   */
  async saveCampaignAnalytics(analytics: CampaignAnalytics, name: string): Promise<undefined> {
    return await new Promise((resolve, reject) => {
      this.analyticsDB.update({name: name}, analytics, {upsert: true}, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(undefined);
      });
    });
  }

  /**
   * Get's info about a campaign
   * @param {string} name The name of the campaign to retrieve
   */
  async getCampaignAnalytics(name: string): Promise<CampaignAnalytics | null> {
    return await new Promise((resolve, reject) => {
      this.analyticsDB.findOne({name: name}, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  }

  /**
   * Get's info about the current, latest campaign
   */
  async getLatestCampaign(): Promise<CampaignAnalytics | null> {
    return await new Promise((resolve, reject) => {
      this.analyticsDB.find({}).sort({createdTime: 1}).limit(1).exec((err, docs) => {
        if (err) reject(err);
        resolve(docs[0] || null);
      });
    });
  }
}

export default new DatabaseService();
