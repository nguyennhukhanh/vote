// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiContestVoting {
    address public operator;

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Vote {
        uint256 startTime;
        uint256 endTime;
        uint256 candidateCount;
        bool ended;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Vote) public votes;
    uint256 public voteCount;

    modifier onlyOperator() {
        require(
            msg.sender == operator,
            "Only the operator can perform this action"
        );
        _;
    }

    modifier votingActive(uint256 voteId) {
        require(
            block.timestamp >= votes[voteId].startTime,
            "Voting has not started yet"
        );
        require(block.timestamp <= votes[voteId].endTime, "Voting has ended");
        _;
    }

    event VoteCreated(uint256 voteId, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 voteId, uint256 candidateId, string name);
    event Voted(uint256 voteId, address voter, uint256 candidateId);

    constructor() {
        operator = msg.sender;
    }

    function createVote(
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOperator returns (uint256) {
        require(_startTime < _endTime, "Start time must be before end time");

        voteCount++;
        Vote storage newVote = votes[voteCount];
        newVote.startTime = _startTime;
        newVote.endTime = _endTime;
        newVote.ended = false;

        emit VoteCreated(voteCount, _startTime, _endTime);
        return voteCount;
    }

    function addCandidate(
        uint256 voteId,
        string memory _name
    ) public onlyOperator {
        require(
            block.timestamp < votes[voteId].startTime,
            "Cannot add candidates after voting has started"
        );

        Vote storage currentVote = votes[voteId];
        currentVote.candidateCount++;
        currentVote.candidates[currentVote.candidateCount] = Candidate(
            _name,
            0
        );

        emit CandidateAdded(voteId, currentVote.candidateCount, _name);
    }

    function vote(
        uint256 voteId,
        uint256 _candidateId
    ) public votingActive(voteId) {
        Vote storage currentVote = votes[voteId];
        require(!currentVote.hasVoted[msg.sender], "You have already voted");
        require(
            _candidateId > 0 && _candidateId <= currentVote.candidateCount,
            "Invalid candidate ID"
        );

        currentVote.candidates[_candidateId].voteCount++;
        currentVote.hasVoted[msg.sender] = true;

        emit Voted(voteId, msg.sender, _candidateId);
    }

    function getCandidate(
        uint256 voteId,
        uint256 _candidateId
    ) public view returns (string memory name, uint256 votesCount) {
        Vote storage currentVote = votes[voteId];
        require(
            _candidateId > 0 && _candidateId <= currentVote.candidateCount,
            "Invalid candidate ID"
        );

        Candidate storage candidate = currentVote.candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    }

    function endVote(uint256 voteId) public onlyOperator {
        votes[voteId].ended = true;
    }
}
