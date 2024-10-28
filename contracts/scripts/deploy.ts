import { ethers } from "hardhat";

async function main() {
  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const myERC20 = await MyERC20.deploy();
  await myERC20.deployed();
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
  const buyMyRoom = await BuyMyRoom.deploy(myERC20.address);
  await buyMyRoom.deployed();
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy(myERC20.address);
  await simpleSwap.deployed();

  console.log(`BuyMyRoom deployed to ${buyMyRoom.address}`);
  console.log(`MyERC20 deployed to ${myERC20.address}`);
  console.log(`SimpleSwap deployed to ${simpleSwap.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});