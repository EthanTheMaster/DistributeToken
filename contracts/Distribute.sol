// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Distribute {
    function redistribute(address payable[] memory recipients, uint256[] memory shares) public payable returns (uint256) {
        require(recipients.length == shares.length, "Mismatch in assignment");

        (uint256[] memory allocation, uint256 leftover) = simulateRedistribute(shares, msg.value);
        for (uint i = 0; i < shares.length; i++) {
            recipients[i].transfer(allocation[i]);
        }

        payable(msg.sender).transfer(leftover);
        return leftover;
    }

    function simulateRedistribute(uint256[] memory shares, uint256 value) public pure returns (uint256[] memory, uint256) {
        uint256 totalShares = 0;
        for (uint i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares > 0, "There must be a split.");

        uint256 amountDistributed = 0;
        uint256[] memory res = new uint256[](shares.length);
        for (uint i = 0; i < shares.length; i++) {
            uint256 amount = value * shares[i] / totalShares;
            res[i] = amount;
            amountDistributed += amount;
        }

        uint256 leftover = value - amountDistributed;

        return (res, leftover);
    }
}