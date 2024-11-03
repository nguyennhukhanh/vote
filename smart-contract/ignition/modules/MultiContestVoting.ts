import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiContestVotingModule = buildModule("MultiContestVotingModule", (m) => {
  // Deploy the MultiContestVoting contract
  const multiContestVoting = m.contract("MultiContestVoting", []);

  return { multiContestVoting };
});

export default MultiContestVotingModule;