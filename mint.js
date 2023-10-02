require("dotenv").config();
const fs = require('fs');
const ethers = require("ethers");
const { ABI_CONTRACT } = require("./utils/abi");

const rpcProviderEthereum = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;
const rpcProviderPolygon = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_POLYGON}`;

const provider = new ethers.JsonRpcProvider(rpcProviderPolygon);

const wallets = [
  new ethers.Wallet(process.env.WALLET_PK_1, provider)
]

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI_CONTRACT, provider);

const proofs = JSON.parse(fs.readFileSync(`${__dirname}/utils/proofs.json`))

const getWei = x => String(10n ** 9n * BigInt(x))

const options = { 
  maxFeePerGas: getWei("8000"),
  maxPriorityFeePerGas: getWei("7000"),
  value: ethers.parseEther("0") 
}

async function mintIn(signerWallet){
  const contractSigner = contract.connect(signerWallet);

  try{
    const tx = await contractSigner.mintWhitelist(
      proofs[signerWallet.address],
      options
    );

    await tx.wait();
    console.log(`\x1b[42m${signerWallet.address}\u001b[0m: ${tx.hash}`);
  }catch(error){
    // console.log(error)
    console.log(`\x1b[41m${signerWallet.address}\u001b[0m: Não foi possivel mintar`);
  }
}

for (const wallet of wallets) {
  mintIn(wallet);
}