import {promises} from 'dns';
import {hostname} from 'os';
import open from 'open';
import state from './state';
import debugLog from '../utilities/debugLog';

/**
 * Gets the local IP address of a computer
 */
async function getLocalIPAddress() {
  const res = await promises.lookup(hostname(), {}).catch((e) => {
    console.error(e);
  });

  if (!res) return false;

  return res.address;
}

/**
 * Logs out the ways to access Bar 3
 */
async function logAddresses() {
  const localIP = await getLocalIPAddress();

  console.log('Access Bar 3 on this computer, go to: http://localhost:8055');
  if (localIP) console.log(`Access Bar 3 on your Home Network, go to: http://${localIP}:8055/`);
}

// log to the user where to access the website and open it locally
logAddresses();

if (!state.debug && !state.headless) {
  open('http://localhost:8055');
} else {
  debugLog('Skipping auto-open. Don\'t use --debug or --headless to enable it.');
}
