const { ethers } = require('hardhat');
const ask = require('../utils/ask');

async function main() {
  const [deployer, minter] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('KingdomTiles');
  const address = await ask('NFT Address: ');
  const id = await ask('Token ID: ');
  const sisterChain = await ask('Sister Chain Selector: ');
  const sisterAddress = await ask('Sister NFT Address: ');
  console.log(`I'm about to run\n\t- KingdomTiles.bridge(${id}, ${minter.address}, ${sisterChain}, ${sisterAddress})\n`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== 'confirm') {
    throw new Error('User abort');
  }

  const contract = await factory.attach(address);
  const tx = await contract.connect(minter).bridge(id, minter.address, sisterChain, sisterAddress);
  console.log('Transaction executed:', tx.hash);
  console.log('Confirming...');
  await tx.wait();
  console.log('Transaction confirmed');
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
