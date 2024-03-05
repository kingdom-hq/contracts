const { ethers } = require('hardhat');
const ask = require('../../utils/ask');
const { attachNetworks } = require('../../utils/ccip');
const {getWalletWithEthers} = require('../../utils/accounts');

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

  const recipient = await getWalletWithEthers(net.provider);
  const minter = new ethers.Wallet(minterPK, net.provider);
  console.log('Initialized owner', minter.address);
  console.log(`Initialized recipient:\n  - Address: ${recipient.address}\n  - Private Key: ${recipient.privateKey}`);
  const asMinter = net.contract.connect(minter);

  await asMinter.transferFrom(minter.address, recipient.address, tokenId);
  console.log(`Transfered #${tokenId} from ${minter.address} to ${recipient.address}`);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
