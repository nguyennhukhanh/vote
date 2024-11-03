import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MultiContestVoting = await ethers.getContractFactory(
    "MultiContestVoting"
  );
  const election = await MultiContestVoting.deploy();

  console.log("MultiContestVoting deployed to:", election.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
