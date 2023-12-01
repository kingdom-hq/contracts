const { ethers } = require('hardhat');
const ask = require('../utils/ask');
const { cheapSignature } = require('../helpers');

async function main() {
  const [deployer, minter, approver] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('KingdomTiles');
  const address = await ask('NFT Address: ');
  const id = await ask('Token ID: ');
  const { chainId } = await ethers.provider.getNetwork();
  const signature = await cheapSignature(
    approver,
    parseInt(id, 10),
    minter.address,
    chainId,
    0
  );
  console.log(`I'm about to run\n\t- KingdomTiles.mint(${minter.address}, ${id}, ${signature})\n`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== 'confirm') {
    throw new Error('User abort');
  }

  const contract = await factory.attach(address);
  const tx = await contract.mint(minter.address, id, signature);
  console.log('Transaction executed:', tx.hash);
  console.log('Confirming...');
  await tx.wait();
  console.log('Transaction confirmed');
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
