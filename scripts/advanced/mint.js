const ask = require('../../utils/ask');
const { cheapSignature } = require('../../helpers');
const { attachNetworks } = require('../../utils/ccip');
const { getWalletWithEthers } = require('../../utils/accounts');

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
  const tokenId = parseInt(await ask('Token ID: '));
  if (isNaN(tokenId)) {
    throw new Error("Must be a number");
  }

  const minter = await getWalletWithEthers(net.provider);
  console.log(`Initialized minter:\n  - Address: ${minter.address}\n  - Private Key: ${minter.privateKey}`);
  const signature = await cheapSignature(net.approver, tokenId, minter.address, 31337, 0);
  const asMinter = net.contract.connect(minter);

  console.log('Preparing to mint');
  await asMinter.mint(minter.address, tokenId, signature);
  console.log(`Minted #${tokenId} on network ${net.chainSelector} (${net.port})`);

}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
