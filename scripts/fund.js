const { ethers } = require('hardhat');
const ask = require('../utils/ask');
const { attachNetworks } = require('../utils/ccip');

async function main() {
  const networks = await attachNetworks();
  const address = await ask('Address: ');
  if (!/^(?:0x)?[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error('Must be a 20 bytes hex string');
  }
  const chainSelector = parseInt(await ask('Chain Selector: '));
  if (isNaN(chainSelector)) {
    throw new Error("Must be a number");
  }
  const net  = networks.find(n => n.chainSelector === chainSelector);
  if (!net) {
    throw new Error(`Could not find chain ${chainSelector}`);
  }
  await net.provider.send('hardhat_setBalance', [
    address,
    "0xFF0000000000000000"
  ]);

  console.log(`Funded address ${address} with 4703.91 ETH`);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
