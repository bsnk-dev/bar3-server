import express from 'express';
import cors from 'cors';
import state from '../services/state';
import messages from '../services/messages';
import dLog from '../utilities/debugLog';

const port = 8055;
const app = express();

app.use(cors());
app.use(express.json({limit: '2mb'}));

app.get('/api/config', async function(req: express.Request, res: express.Response) {
  res.send(JSON.stringify(state.config)).status(200).end();
});

app.post('/api/setConfig', async function(req: express.Request, res: express.Response) {
  const mergedConfig = Object.assign(state.config, req.body.config);

  dLog('Updated config with new values: '+JSON.stringify(req.body.config));

  state.writeConfig(mergedConfig);
  res.status(204).end();
});

app.post('/api/sendMessage', async function(req: express.Request, res: express.Response) {
  const messageHTML = req.body.messageHTML;
  const nationID = parseInt(req.body.nationID);
  const nationName = req.body.nationName;
  const leaderName = req.body.leaderName;

  dLog('Sending test message: '+messageHTML);

  const message = await messages.sendMessage({nation_id: nationID, nation: nationName, leader: leaderName});
  if (!message.successful) {
    res.status(400).end();
    dLog('Failed to send test message.');
    return;
  }

  dLog('Successfully sent test message!');

  res.status(204).end();
});

app.post('/api/setApplicationState', async function(req: express.Request, res: express.Response) {
  state.setApplicationOn(req.body.applicationOn);
  res.status(204).end();
});

app.get('/api/appData', async function(req: express.Request, res: express.Response) {
  res.send(JSON.stringify({
    applicationOn: state.isApplicationOn,
    isSetup: state.isSetup,
    sentMessages: messages.sentMessages,
    apiDetails: {
      used: state.requestsUsed,
      max: state.requestsMax,
    },
  })).status(200).end();
});

app.listen(port);
