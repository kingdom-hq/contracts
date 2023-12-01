const { ethers } = require('hardhat');
const ask = require('../utils/ask');

async function main() {
  const [deployer, approver] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('KingdomTiles');
  const router = await ask('Router address: ');
  const linkToken = await ask('Link Token: ');
  const baseURI = await ask('BaseURI: ');
  console.log(`I'm about to deploy\n\t- KingdomTiles(${router}, ${linkToken}, '${baseURI}')\n`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== 'confirm') {
    throw new Error('User abort');
  }

  const contract = await factory.deploy(router, linkToken, baseURI);
  await contract.deployed();
  console.log('Deployed', await contract.address);
  await (await contract.setRole(approver.address, 1, true)).wait();
  console.log('Granted mint approver role to', approver.address);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
