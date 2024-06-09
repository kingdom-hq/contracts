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
  ETHERSCAN_API_KEY,
  ETH_CHAINID,
  AVA_CHAINID,
  POL_CHAINID,
  ETH_EXPLORER_API_URL,
  ETH_EXPLORER_BROWSER_URL,
  POL_EXPLORER_API_URL,
  POL_EXPLORER_BROWSER_URL,
  AVA_EXPLORER_API_URL,
  AVA_EXPLORER_BROWSER_URL,
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
    ethereum: {
      url: ETHEREUM_RPC,
      accounts
    },
  },
  etherscan: {
    customChains: [
      {
        network: 'ethereum',
        chainId: parseInt(ETH_CHAINID),
        urls: {
          apiURL: ETH_EXPLORER_API_URL,
          browserURL: ETH_EXPLORER_BROWSER_URL
        }
      },
      {
        network: 'avalanche',
        chainId: parseInt(AVA_CHAINID),
        urls: {
          apiURL: AVA_EXPLORER_API_URL,
          browserURL: AVA_EXPLORER_BROWSER_URL
        }
      },
      {
        network: 'polygon',
        chainId: parseInt(POL_CHAINID),
        urls: {
          apiURL: POL_EXPLORER_API_URL,
          browserURL: POL_EXPLORER_BROWSER_URL
        }
      }
    ],
    apiKey: {
      avalanche: SNOWTRACE_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      ethereum: ETHERSCAN_API_KEY
    }
  }
};
