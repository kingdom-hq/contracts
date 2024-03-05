const { ethers } = require("hardhat");
const { initNetworks } = require('../utils/ccip');

let networks;

async function main() {
  networks = await initNetworks();
  console.log('All networks ready');

  for (const net of networks) {
    console.log([net.name, 'tiles', 'contract', 'address'].join('_').toUpperCase() + '=' + net.contract.address);
    console.log([net.name, 'router', 'address'].join('_').toUpperCase() + '=' + net.router.address);
    console.log([net.name, 'link', 'address'].join('_').toUpperCase() + '=' + net.link.address);
  }
}

main().then(() => {
}).catch(e => {
  console.error(e);
  process.exitCode = 1;
});

process.on('SIGINT', async () => {
  console.log('Stopping networks');
  for (const net of networks) {
    await net.node.stop();
  }
  console.log('All networks stopped');
  process.exit();
});
