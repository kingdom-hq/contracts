const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, cheapSignature } = require('../helpers');

describe('Royalties', function() {
  let owner;
  let addr1;
  let addr2;
  let signer;

  const context = {};
  before(async function () {
    [owner, addr1, addr2, signer] = await ethers.getSigners();
    const { link, router, contract, baseURI} = await deployAll(owner);
    context.link = link;
    context.router = router;
    context.contract = contract;
    context.baseURI = baseURI;
    await (await contract.setRole(signer.address, 1, true)).wait();
    await link.mint(contract.address, ethers.utils.parseEther('1000'));
    await contract.setSister(1, owner.address, true);
  });

  it('Supports royalties interface', async () => {
    const ok = await context.contract.supportsInterface('0x2a55205a');
    expect(ok).to.be.true;
  });

  it('Calculates the correct royalties', async () => {
    const salePrice = ethers.utils.parseEther('1');
    const [receiver, value] = await context.contract.royaltyInfo(45, salePrice);

    expect(receiver).to.eq(context.contract.address);
    expect(value).to.eq(salePrice.mul(5).div(100));
  });

  it('Royalties can be edited', async () => {
    const tx = await context.contract.setRoyaltiesConfig(1000, owner.address);
    const { events } = await tx.wait();
    expect(events).to.have.lengthOf(1);
    const { feeBps, recipient } = events[0].args;
    expect(feeBps).to.eq(1000);
    expect(recipient).to.eq(owner.address);
  });

  it('Still calculates the correct royalties', async () => {
    const salePrice = ethers.utils.parseEther('1.55');
    const [receiver, value] = await context.contract.royaltyInfo(45, salePrice);

    expect(receiver).to.eq(owner.address);
    expect(value).to.eq(salePrice.mul(10).div(100));
  });

});
