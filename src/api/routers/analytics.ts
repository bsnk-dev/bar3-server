import express, {Request, Response} from 'express';
import {celebrate, Joi, Segments} from 'celebrate';

import analytics from '../../services/analytics';
import LogManager from '../../utilities/logManager';
import database from '../../services/database';

const router = express.Router();
router.use(express.json());
const apiLogs = new LogManager().updateContext('api');

router.get('/campaigns', async (req: Request, res: Response) => {
  const logs = apiLogs.customContext(['campaign']);

  await analytics.updateAnalyticsInCampaign().catch((e) => {
    logs.logError(`Cannot update latest campaign, ${e}`);
  });

  const campaigns = database.getAllCampaigns();

  res.status(200).contentType('json').send(campaigns).end();
});

router.post('/newCampaign', celebrate({
  [Segments.BODY]: {
    name: Joi.string().required(),
  },
}), async (req: Request, res: Response) => {
  const logs = apiLogs.customContext(['newCampaign']);

  const name = req.body.name;

  await analytics.newCampaign(name).catch((e) => {
    logs.logError(`Cannot create new campaign, ${e}`);
    res.status(500).end();
    return;
  });

  res.status(204).end();
});

export default router;
