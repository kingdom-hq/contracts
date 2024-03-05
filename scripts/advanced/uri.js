const ask = require('../../utils/ask');
const { attachNetworks } = require('../../utils/ccip');

async function main() {
  const networks = await attachNetworks();
  const chainSelector = parseInt(await ask('Chain Selector: '));
  if (isNaN(chainSelector)) {
    throw new Error("Must be a number");
  }
  const net  = networks.find(n => n.chainSelector === chainSelector);
  if (!net) {
    throw new Error(`Could not find chain ${chainSelector}`);
  }
  const id = await ask('Token ID: ');

  const uri = await net.contract.tokenURI(id);
  console.log('URI:', uri);
}

main().catch(e => {
  console.log(e);
  process.exit(1);
})
