const helpers = require('@nomicfoundation/hardhat-network-helpers');
const { randomBytes } = require('crypto');
const { ethers } = require('hardhat');

const impersonate = async (address, provider) => {
  await provider.send("hardhat_impersonateAccount", [address]);
  await provider.send("hardhat_setBalance", [address, '0x3635c9adc5dea00000']);

};

const stopImpersonation = async (address, provider) => {
  await provider.send("hardhat_stopImpersonatingAccount", [address]);
};

async function getWalletWithEthers(provider) {
  const pk = randomBytes(32).toString('hex');
  const wallet = new ethers.Wallet(pk, provider);
  await provider.send("hardhat_setBalance", [wallet.address, '0x3635c9adc5dea00000']);
  return wallet;
}

const whileImpersonating = async (address, provider, fn) => {
  await impersonate(address, provider);
  const impersonatedSigner = await provider.getSigner(address);
  const result = await fn(impersonatedSigner);
  await stopImpersonation(address, provider);
  return result;
};


module.exports = {
  impersonate,
  stopImpersonation,
  whileImpersonating,
  getWalletWithEthers,
};
