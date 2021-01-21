import express from 'express';
import cors from 'cors';
import state from './state';
import messages from './messages';
import './searchLoop';
import './openApp';

console.log('Started Bar 3!');

const port = 8055;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/config', async function(req: express.Request, res: express.Response) {
  res.send(JSON.stringify(state.config)).status(200).end();
});

app.post('/api/setConfig', async function(req: express.Request, res: express.Response) {
  state.writeConfig(req.body.config);
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
  })).status(200).end();
});

app.listen(port);
