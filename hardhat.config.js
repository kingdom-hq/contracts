require('@chainlink/env-enc').config()
require('@nomicfoundation/hardhat-toolbox');

const {
  DEPLOYER_KEY,
  APPROVER_KEY,
  POLYGON_RPC,
  AVALANCHE_RPC,
  ETHEREUM_RPC,
  SNOWTRACE_API_KEY,
  POLYGONSCAN_API_KEY,
  ETHERSCAN_API_KEY
} = process.env;

const accounts = [DEPLOYER_KEY, APPROVER_KEY];

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  networks: {
    polygon: {
      url: POLYGON_RPC,
      accounts
    },
    avalanche: {
      url: AVALANCHE_RPC,
      accounts
    },
    mainnet: {
      url: ETHEREUM_RPC,
      accounts
    }
  },
  etherscan: {
    apiKey: {
      avalanche: SNOWTRACE_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    }
  }
};
