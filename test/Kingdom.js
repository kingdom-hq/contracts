const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, cheapSignature } = require('../helpers');

describe('Kingdom', function() {
  let owner;
  let addr1;
  let addr2;
  let signer;

  const context = {};
  before(async function () {
    [owner, addr1, addr2, signer] = await ethers.getSigners();
    const { link, router, contract, baseURI} = await deployAll();
    context.link = link;
    context.router = router;
    context.contract = contract;
    context.baseURI = baseURI;
    await (await contract.setRole(signer.address, 1, true)).wait();
    await link.mint(contract.address, ethers.utils.parseEther('1000'));
    await contract.setSister(1, owner.address, true);
  });

});
