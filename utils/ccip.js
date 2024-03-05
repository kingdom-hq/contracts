const HardhatNode = require('./hardhat-node');
const { ethers } = require('hardhat')
const { deployAll, wait, attachAll} = require('../helpers');

const networkData = [
  {
    name: 'eth',
    port: 8545,
    chainSelector: 1
  },
  {
    name: 'polygon',
    port: 8546,
    chainSelector: 2,
  },
  {
    name: 'avalanche',
    port: 8547,
    chainSelector: 3
  }
];

async function initNetworks() {
  const networks = [];
  const approver = new ethers.Wallet(process.env.APPROVER_KEY);
  for (const data of networkData) {
    const node = new HardhatNode(data.port);
    process.stdout.write(`Starting node ${data.name} on port ${data.port}... `);
    try {
      const provider = new ethers.providers.JsonRpcProvider(`http://localhost:${data.port}`);
      while (true) {
        const net = await provider.getNetwork().catch(() => null);
        if (net?.chainId === 31337) break;
        await wait(500);
      }
      await wait(500);
      console.log('Ready');
      const deployer = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
      const { router, link, contract } = await deployAll(deployer);
      console.log('- Contracts deployed')
      const longAddress = '0x' + '0'.repeat(24) + contract.address.slice(-40).toLowerCase();
      await (await link.mint(contract.address, ethers.utils.parseEther('1000'))).wait();
      await (await contract.setRole(approver.address, 1, true)).wait();
      for (const otherData of networkData) {
        if (otherData === data) continue;
        await contract.setSister(otherData.chainSelector, contract.address, true);
      }
      console.log('- Sisters linked');
      await provider.send("evm_setIntervalMining", [1000]);
      await provider.send("evm_setAutomine", [true]);
      console.log('- Started mining');
      const network = {
        ...data,
        node,
        provider,
        router,
        link,
        contract,
        approver
      };
      networks.push(network);
      router.on('CCIPMessage', async (chain, receiver, message) => {
        console.log('Forwarding CCIP Message from chain', network.chainSelector, 'to', chain.toNumber(), 'in 10 sec');
        const recipient = ethers.utils.getAddress('0x' + receiver.slice(-40));
        const destinationNetwork = networks.find(n => n.chainSelector === chain.toNumber());
        const outMessage = {
          messageId: ethers.constants.HashZero,
          sourceChainSelector: network.chainSelector,
          sender: longAddress,
          data: message,
          destTokenAmounts: []
        };
        await new Promise(r => setTimeout(r, 10000));
        await (await destinationNetwork.router.routeMessage(outMessage, 0, 0, recipient)).wait();
        console.log('Forwarded CCIP Message from chain', network.chainSelector, 'to', chain.toNumber());
      });
    } catch (e) {
      await node.stop();
      for (const net of networks) {
        if (net.node === node) continue;
        await net.node.stop();
      }
      throw e;
    }
  }

  return networks;
}

async function attachNetworks() {
  const {
    ETH_TILES_CONTRACT_ADDRESS,
    ETH_ROUTER_ADDRESS,
    ETH_LINK_ADDRESS,
    POLYGON_TILES_CONTRACT_ADDRESS,
    POLYGON_ROUTER_ADDRESS,
    POLYGON_LINK_ADDRESS,
    AVALANCHE_TILES_CONTRACT_ADDRESS,
    AVALANCHE_ROUTER_ADDRESS,
    AVALANCHE_LINK_ADDRESS,
  } = process.env;
  if (
    !ETH_TILES_CONTRACT_ADDRESS ||
    !ETH_ROUTER_ADDRESS ||
    !ETH_LINK_ADDRESS ||
    !POLYGON_TILES_CONTRACT_ADDRESS ||
    !POLYGON_ROUTER_ADDRESS ||
    !POLYGON_LINK_ADDRESS ||
    !AVALANCHE_TILES_CONTRACT_ADDRESS ||
    !AVALANCHE_ROUTER_ADDRESS ||
    !AVALANCHE_LINK_ADDRESS
  ) throw new Error('Missing some contracts addresses');
  const networks = [];
  const approver = new ethers.Wallet(process.env.APPROVER_KEY);
  for (const data of networkData) {
    const provider = new ethers.providers.JsonRpcProvider(`http://localhost:${data.port}`);
    const deployer = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
    const { router, link, contract } = await attachAll(
      deployer,
      process.env[data.name.toUpperCase() + '_ROUTER_ADDRESS'],
      process.env[data.name.toUpperCase() + '_LINK_ADDRESS'],
      process.env[data.name.toUpperCase() + '_TILES_CONTRACT_ADDRESS'],
    );
    const network = {
      ...data,
      provider,
      router,
      link,
      contract,
      approver
    };
    networks.push(network);
  }

  return networks;
}

module.exports = {
  initNetworks,
  attachNetworks
}
