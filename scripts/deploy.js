/*For Uniswap contract*/

async function main() {
  // We get the contract to deploy

  const [deployer] = await ethers.getSigners();
  console.log("Deployer: ", await deployer.address);
  const construct = await deployer.address;

  //For Core contract
  const core = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await core.deploy(construct);
  console.log("Core contract[Factory] deployed to:", factory.address);
  const hash = await factory.INIT_CODE_HASH();
  console.log("INIT_CODE_HASH: ", hash);

  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();

  //For Periphery contract
  const periphery = await ethers.getContractFactory("UniswapV2Router02");
  const peripheryContracts = await periphery.deploy(factory.address, weth.address);
  console.log("Periphery[RouterV2] contract deployed to:", peripheryContracts.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





