const path = require('path');

require('dotenv').config();
const envPath = path.join(__dirname, `.env.${process.env.NODE_ENV}`);
console.log('Loading env', envPath);
require('dotenv').config({ path: envPath });
require('@nomicfoundation/hardhat-toolbox');

Error.stackTraceLimit = Infinity;
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
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      },
      evmVersion: 'shanghai'
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
      mainnet: ETHERSCAN_API_KEY
    }
  }
};
