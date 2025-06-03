const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function signMessage(message) {
  const signature = await wallet.signMessage(message);
  const address = await wallet.getAddress();
  return { signature, address };
}

module.exports = { signMessage };
