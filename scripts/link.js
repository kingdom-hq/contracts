const { ethers } = require('hardhat');
const ask = require('../utils/ask');

async function main() {
  const factory = await ethers.getContractFactory('KingdomTiles');
  const nftAddress = await ask('Local NFT address: ');
  const sisterAddress = await ask('Sister NFT Address: ');
  const sisterChain = await ask('Sister Chain Selector: ');
  console.log(`I'm about run\n\t- KingdomTiles.setSister(${sisterChain}, ${sisterAddress}, true)\n`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== confirm) {
    throw new Error('User abort');
  }

  const contract = factory.attach(nftAddress);
  const tx = await contract.setSister(sisterChain, sisterAddress, true);
  console.log('Transaction executed:', tx.hash);
  console.log('Confirming...');
  await tx.wait();
  console.log('Transaction confirmed');
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
