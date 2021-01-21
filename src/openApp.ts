import {promises} from 'dns';
import {hostname} from 'os';
import open from 'open';

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

// TODO: uncomment when web app is done
if (false) open('http://localhost:8055');
