const { expect } = require("chai");
const { ethers } = require("hardhat");
const {deployAll, cheapSignature} = require('../helpers');

const contractName = 'KingdomTiles';
const contractSymbol = 'KT';
const safeTransferFrom = 'safeTransferFrom(address,address,uint256)';

describe("ERC721", function () {
  let router;
  let link;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let signer;

  beforeEach(async function () {
    [owner, addr1, addr2, signer] = await ethers.getSigners();
    const contracts = await deployAll(owner);
    link = contracts.link;
    router = contracts.router;
    contract = contracts.contract;
    await (await contract.setRole(signer.address, 1, true)).wait();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should mint a new token for free", async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 1, signature);
      expect(await contract.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should mint a new token for ETH", async function () {
      const value = ethers.utils.parseEther('0.15');
      const signature = await cheapSignature(
        signer,
        1,
        addr1.address,
        31337,
        value
      );
      await (await contract.connect(addr1).mint(addr1.address, 1, signature, { value })).wait();
      expect(await contract.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should fail to mint the same token", async function () {
      {
        const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
        await contract.connect(addr1).mint(addr1.address, 1, signature);
        expect(await contract.balanceOf(addr1.address)).to.equal(1);
      }
      const value = ethers.utils.parseEther('0.15');
      const signature = await cheapSignature(
        signer,
        1,
        addr1.address,
        31337,
        value
      );
      await expect(contract.connect(addr1).mint(addr1.address, 1, signature, { value })).to.be.reverted;
    });

    it("Should fail to mint with a wrong value", async function () {
      const value = ethers.utils.parseEther('0.15');
      const signature = await cheapSignature(
        signer,
        2,
        addr1.address,
        31337,
        value
      );
      await expect (
        contract.connect(addr1).mint(addr1.address, 2, signature, { value: 15 })
      ).to.be.revertedWithCustomError(contract, 'UnauthorizedMint');
    });

    it("Should transfer tokens between accounts", async function () {
      const signature = await cheapSignature(signer, 2, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 2, signature);
      await contract.connect(addr1).transferFrom(addr1.address, addr2.address, 2);
      expect(await contract.balanceOf(addr2.address)).to.equal(1);
      expect(await contract.balanceOf(addr1.address)).to.equal(0);
    });

  });

  describe("Token Details", function () {
    it('name', async function () {
      expect(await contract.name()).to.eq(contractName);
    });

    it('symbol', async function () {
      expect(await contract.symbol()).to.eq(contractSymbol);
    });

    it("Should return correct tokenURI", async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 1, signature);
      expect(await contract.tokenURI(1)).to.equal("http://truc/1.json");
    });

    it('Can update metadata URI', async () => {
      const tx = await contract.setBaseURI('https://machinbidule.com/');
      const { events } = await tx.wait();
      expect(events).to.have.lengthOf(1);
      expect(events[0].event).to.eq('BatchMetadataUpdate');
      const { _fromTokenId, _toTokenId } = events[0].args;
      expect(_fromTokenId).to.eq(0);
      expect(_toTokenId).to.eq(ethers.constants.MaxUint256);
      expect(await contract.tokenURI(1)).to.equal("https://machinbidule.com/1.json");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 1, signature);
    });

    it("Should set and query approval for a token", async function () {
      await contract.connect(addr1).approve(addr2.address, 1);
      expect(await contract.getApproved(1)).to.equal(addr2.address);
    });

    it("Should allow approved address to transfer a token", async function () {
      await contract.connect(addr1).approve(addr2.address, 1);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should not allow unapproved address to transfer a token", async function () {
      await expect(
        contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWithCustomError(contract, 'TransferCallerNotOwnerNorApproved');
    });
  });

  describe("Operator Approvals", function () {
    beforeEach(async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 1, signature);
    });

    it("Should set and query an operator", async function () {
      await contract.connect(addr1).setApprovalForAll(addr2.address, true);
      expect(await contract.isApprovedForAll(addr1.address, addr2.address)).to.be.true;
    });

    it("Should allow operator to transfer any token of the owner", async function () {
      await contract.connect(addr1).setApprovalForAll(addr2.address, true);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should not allow non-operator to transfer the token", async function () {
      await expect(
        contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWithCustomError(contract, 'TransferCallerNotOwnerNorApproved');
    });
  });

  describe("Safe Transfer From", function () {
    beforeEach(async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 1, signature);
    });

    it("Should safely transfer a token from one address to another", async function () {
      await contract.connect(addr1)[safeTransferFrom](addr1.address, addr2.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should revert when trying to transfer to the KingdomTiles contract itself", async function () {
      await expect(
        contract.connect(addr1)[safeTransferFrom](addr1.address, contract.address, 1)
      ).to.be.revertedWithCustomError(contract, 'TransferToNonERC721ReceiverImplementer');
    });
  });

  describe("Event Emission", function () {
    it("Should emit Transfer event on mint", async function () {
      const signature = await cheapSignature(signer, 1, addr1.address, 31337, 0);
      await expect(contract.connect(addr1).mint(addr1.address, 1, signature))
        .to.emit(contract, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1);
    });

    it("Should emit Approval event when token is approved", async function () {
      const signature = await cheapSignature(signer, 2, addr1.address, 31337, 0);
      await contract.connect(addr1).mint(addr1.address, 2, signature);
      await expect(contract.connect(addr1).approve(addr2.address, 2))
        .to.emit(contract, "Approval")
        .withArgs(addr1.address, addr2.address, 2);
    });

    it("Should emit ApprovalForAll event when operator is approved", async function () {
      await expect(contract.connect(addr1).setApprovalForAll(addr2.address, true))
        .to.emit(contract, "ApprovalForAll")
        .withArgs(addr1.address, addr2.address, true);
    });
  });

  describe("ERC165 Standard", function () {
    it("Should support ERC721 interface", async function () {
      expect(await contract.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      expect(await contract.supportsInterface("0x5b5e139f")).to.be.true;
    });

    it("Should not support a random interface", async function () {
      expect(await contract.supportsInterface("0x12345678")).to.be.false;
    });
  });
});
