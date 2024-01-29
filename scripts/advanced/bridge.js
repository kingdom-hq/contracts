const { ethers } = require('hardhat');
const ask = require('../../utils/ask');
const { attachNetworks } = require('../../utils/ccip');

async function main() {
  const networks = await attachNetworks();
  const chainSelector = parseInt(await ask('Chain Selector: '));
  if (isNaN(chainSelector)) {
    throw new Error("Must be a number");
  }
  const net  = networks.find(n => n.chainSelector === chainSelector);
  if (!net) {
    throw new Error(`Could not find chain ${chainSelector}`);
  }
  const minterPK = await ask('Minter PK: ');
  if (!/^(?:0x)?[0-9a-fA-F]{64}$/.test(minterPK)) {
    throw new Error('Must be a 32 bytes hex string');
  }
  const tokenId = parseInt(await ask('Token ID: '));
  if (isNaN(tokenId)) {
    throw new Error("Must be a number");
  }

  const minter = new ethers.Wallet(minterPK, net.provider);
  console.log('Initialized minter', minter.address);
  const asMinter = net.contract.connect(minter);

  const sisterChain = parseInt(await ask('Sister Chain Selector: '));
  if (isNaN(sisterChain)) {
    throw new Error("Must be a number");
  }
  const sisterNet = networks.find(n => n.chainSelector === sisterChain);

  if (!sisterNet) {
    throw new Error(`Could not find chain ${sisterChain}`);
  }

  await asMinter.bridge(tokenId, minter.address, sisterChain, sisterNet.contract.address);
  console.log(`Bridged #${tokenId} from network ${net.chainSelector} (${net.port}) to ${sisterNet.chainSelector} (${sisterNet.port})`);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
