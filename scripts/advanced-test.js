const { ethers } = require("hardhat");
const { initNetworks } = require('../utils/ccip');

let networks;

async function main() {
  networks = await initNetworks();
  const approver = new ethers.Wallet(process.env.APPROVER_KEY);
  const nfts = [];
  console.log('All networks ready');

  for (const net of networks) {
    console.log([net.name, 'tiles', 'contract', 'address'].join('_').toUpperCase() + '=' + net.contract.address);
    console.log([net.name, 'router', 'address'].join('_').toUpperCase() + '=' + net.router.address);
    console.log([net.name, 'link', 'address'].join('_').toUpperCase() + '=' + net.link.address);
  }

  //
  // for (const nft of nfts) {
  //   const otherNetworks = networks.filter(n => n !== nft.net);
  //   const destinationNetwork = otherNetworks[Math.floor(Math.random() * otherNetworks.length)];
  //   const tx = await nft.contract.bridge(nft.tokenId, nft.minter.address, destinationNetwork.chainSelector, destinationNetwork.contract.address);
  //   await tx.wait();
  //   console.log('Bridging nft to chain', destinationNetwork.chainSelector, `(${destinationNetwork.port})`);
  //   nft.destination = destinationNetwork;
  //   await wait(3000);
  // }
  //
  // for (const nft of nfts) {
  //   const originalUrl = await nft.net.contract.tokenURI(nft.tokenId);
  //   const currentChainUrl = await nft.destination.contract.tokenURI(nft.tokenId);
  //   console.log(`Token #${nft.tokenId}:\n\t- URI on chain ${nft.net.chainSelector}: ${originalUrl}\n\t- URI on chain ${nft.destination.chainSelector}: ${currentChainUrl}`);
  // }
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
