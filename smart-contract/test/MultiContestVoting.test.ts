import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MultiContestVoting", function () {
  async function deployElectionFixture() {
    const [operator, voter1, voter2] = await ethers.getSigners();
    const MultiContestVoting = await ethers.getContractFactory(
      "MultiContestVoting"
    );
    const election = await MultiContestVoting.deploy();

    return { election, operator, voter1, voter2 };
  }

  it("should deploy with the correct operator", async function () {
    const { election, operator } = await loadFixture(deployElectionFixture);
    expect(await election.operator()).to.equal(operator.address);
  });

  it("should create a new vote", async function () {
    const { election, operator } = await loadFixture(deployElectionFixture);
    const currentTime = await time.latest();
    const startTime = currentTime + 60; // start in 60 seconds
    const endTime = startTime + 3600; // end in 1 hour

    await election.connect(operator).createVote(startTime, endTime);
    expect(await election.voteCount()).to.equal(1);
    const vote = await election.votes(1);
    expect(vote.startTime).to.equal(startTime);
    expect(vote.endTime).to.equal(endTime);
  });

  it("should add a candidate to a vote", async function () {
    const { election, operator } = await loadFixture(deployElectionFixture);
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    await election.connect(operator).createVote(startTime, endTime);
    await election.connect(operator).addCandidate(1, "Candidate 1");

    const candidate = await election.getCandidate(1, 1);
    expect(candidate.name).to.equal("Candidate 1");
    expect(candidate.votesCount).to.equal(0);
  });

  it("should allow a user to vote for a candidate", async function () {
    const { election, operator, voter1 } = await loadFixture(
      deployElectionFixture
    );
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    await election.connect(operator).createVote(startTime, endTime);
    await election.connect(operator).addCandidate(1, "Candidate 1");

    // Fast forward to voting period
    await time.increaseTo(startTime + 1);

    await election.connect(voter1).vote(1, 1);
    const candidate = await election.getCandidate(1, 1);
    expect(candidate.votesCount).to.equal(1);
  });

  it("should not allow double voting", async function () {
    const { election, operator, voter1 } = await loadFixture(
      deployElectionFixture
    );
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    await election.connect(operator).createVote(startTime, endTime);
    await election.connect(operator).addCandidate(1, "Candidate 1");

    await time.increaseTo(startTime + 1);

    await election.connect(voter1).vote(1, 1);
    await expect(election.connect(voter1).vote(1, 1)).to.be.revertedWith(
      "You have already voted"
    );
  });

  it("should not allow voting for a non-existent candidate", async function () {
    const { election, operator, voter1 } = await loadFixture(
      deployElectionFixture
    );
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    await election.connect(operator).createVote(startTime, endTime);

    await time.increaseTo(startTime + 1);

    await expect(election.connect(voter1).vote(1, 1)).to.be.revertedWith(
      "Invalid candidate ID"
    );
  });

  it("should not allow voting outside of the voting period", async function () {
    const { election, operator, voter1 } = await loadFixture(
      deployElectionFixture
    );
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    await election.connect(operator).createVote(startTime, endTime);
    await election.connect(operator).addCandidate(1, "Candidate 1");

    // Fast forward to after voting period
    await time.increaseTo(endTime + 1);

    await expect(election.connect(voter1).vote(1, 1)).to.be.revertedWith(
      "Voting has ended"
    );
  });
});
