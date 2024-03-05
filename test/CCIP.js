const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, cheapSignature} = require('../helpers');

describe("CCIP", function () {
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

  it('Sends NFT via CCIP', async () => {
    const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
    const { contract, router, baseURI } = context;
    await (await contract.mint(addr1.address, 1, signature)).wait();
    expect(await contract.tokenURI(1)).to.eq(`${baseURI}1.json`);
    expect(await contract.ownerOf(1)).to.eq(addr1.address);
    const { events } = await (await contract.connect(addr1).bridge(1, addr2.address, 1, owner.address)).wait();
    const event = router.interface.parseLog(events[1]);
    expect(event.name).to.eq('CCIPMessage');
    expect(event.args.receiver.slice(-40)).to.eq(owner.address.slice(-40).toLowerCase());
    expect(event.args.data).to.eq([
      '0x',
      '0'.repeat(23),
      '1',
      addr2.address.toLowerCase().slice(-40)
    ].join(''));
    expect(await contract.ownerOf(1)).to.eq(contract.address);
    expect(await contract.tokenURI(1)).to.eq(`${baseURI}1_ccip.json`);
  });

  it('Does not accept CCIP messages from non-router', async () => {
    const Router = await ethers.getContractFactory("Router");
    const otherRouter = await Router.deploy(context.link.address);
    await otherRouter.deployed();
    await expect(otherRouter.routeMessage(
      {
        messageId: '0x' + '0'.repeat(63) + '1',
        sourceChainSelector: 1,
        sender: '0x' + '0'.repeat(24) + owner.address.slice(-40),
        data: ['0x', '0'.repeat(23), '2', addr2.address.toLowerCase().slice(-40)].join(''),
        destTokenAmounts: []
      }, 0, 0, context.contract.address
    )).to.be.revertedWithCustomError(context.contract, 'InvalidRouter');
  });

  it('Mints an NFT when receiving a CCIP Message', async () => {
    const { contract, router, baseURI } = context;
    const tx = await router.routeMessage(
      {
        messageId: '0x' + '0'.repeat(63) + '1',
        sourceChainSelector: 1,
        sender: '0x' + '0'.repeat(24) + owner.address.slice(-40),
        data: ['0x', '0'.repeat(23), '2', addr2.address.toLowerCase().slice(-40)].join(''),
        destTokenAmounts: []
      }, 0, 0, contract.address
    );
    await tx.wait();
    expect(await contract.ownerOf(2)).to.eq(addr2.address);
    expect(await contract.tokenURI(2)).to.eq(`${baseURI}2.json`);
  });

  it('Can change CCIP Router', async () => {
    const { contract, link } = context;
    const Router = await ethers.getContractFactory("Router");
    const otherRouter = await Router.deploy(link.address);
    await otherRouter.deployed();
    await contract.setCCIPRouter(otherRouter.address);
    context.router = otherRouter;
  });

  it('CCIP Receive previously sent item', async () => {
    const { contract, router, baseURI } = context;
    expect(await contract.tokenURI(1)).to.eq(`${baseURI}1_ccip.json`);
    const tx = await router.routeMessage(
      {
        messageId: '0x' + '0'.repeat(63) + '2',
        sourceChainSelector: 1,
        sender: '0x' + '0'.repeat(24) + owner.address.slice(-40),
        data: ['0x', '0'.repeat(23), '1', addr2.address.toLowerCase().slice(-40)].join(''),
        destTokenAmounts: []
      }, 0, 0, contract.address
    );
    await tx.wait();
    expect(await contract.ownerOf(1)).to.eq(addr2.address);
    expect(await contract.tokenURI(1)).to.eq(`${baseURI}1.json`);
  });

  it('Can withdraw LINK', async () => {
    const { contract, link } = context;
    const bal = await link.balanceOf(contract.address);
    expect(bal).to.not.eq(0);
    const tx = await contract.withdrawToken(link.address, owner.address);
    const { events } = await tx.wait();
    const event = link.interface.parseLog(events[0]);
    expect(event.name).to.eq('Transfer');
    const { src, dst, wad } = event.args;
    expect(src).to.eq(contract.address);
    expect(dst).to.eq(owner.address);
    expect(wad).to.eq(bal);
    expect(await link.balanceOf(contract.address)).to.eq(0);
    expect(await link.balanceOf(owner.address)).to.eq(bal);
  })

});
