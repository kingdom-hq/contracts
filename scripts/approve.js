const { ethers } = require('hardhat');
const ask = require('../utils/ask');
const { cheapSignature } = require('../helpers');

async function main() {
  const [deployer, approver] = await ethers.getSigners();
  const id = await ask('Token ID: ');
  const minterAddress = await ask('Minter address: ');
  const { chainId } = await ethers.provider.getNetwork();
  const signature = await cheapSignature(
    approver,
    parseInt(id, 10),
    minterAddress,
    chainId,
    0
  );
  console.log(signature);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
