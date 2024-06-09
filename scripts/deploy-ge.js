const { ethers } = require('hardhat');
const ask = require('../utils/ask');

async function main() {
  const [_, approver] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('KingdomGameEvents');
  console.log(`I'm about to deploy\n\t- KingdomGameEvents()\n`);
  const confirm = await ask('Type "confirm" to continue:\n\n- ');
  if (confirm !== 'confirm') {
    throw new Error('User abort');
  }

  const contract = await factory.deploy();
  await contract.deployed();
  console.log('Deployed', await contract.address);
  await (await contract.setRole(approver.address, 1, true)).wait();
  console.log('Granted message signer role to', approver.address);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
