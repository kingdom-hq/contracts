const { ethers } = require('hardhat');
const ask = require('../utils/ask');

async function main() {
  const factory = await ethers.getContractFactory('KingdomTiles');
  const nftAddress = await ask('Local NFT address: ');
  const baseURI = await ask('BaseURI: ');
  console.log(`I'm about run\n\t- KingdomTiles.setBaseURI(${baseURI})`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== confirm) {
    throw new Error('User abort');
  }

  const contract = factory.attach(nftAddress);
  const tx = await contract.setBaseURI(baseURI);
  console.log('Transaction executed:', tx.hash);
  console.log('Confirming...');
  await tx.wait();
  console.log('Transaction confirmed');
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
