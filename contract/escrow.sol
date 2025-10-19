// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EscrowPayments {
    struct Payment {
        uint256 amount;
        uint256 expiry;      // deadline for receiver to withdraw
        bool withdrawn;      // true if receiver has withdrawn
    }

    // sender => receiver => Payment
    mapping(address => mapping(address => Payment)) public payments;

    // Deposit funds for someone with an expiry
    function depositFor(address receiver, uint256 expiryTimestamp) external payable {
        require(msg.value > 0, "No funds sent");
        require(expiryTimestamp > block.timestamp, "Expiry must be in the future");

        Payment storage p = payments[msg.sender][receiver];

        // if there’s already a payment, refund or handle carefully
        require(p.amount == 0 || p.withdrawn || block.timestamp >= p.expiry, 
            "Existing active payment");

        // store new payment
        p.amount = msg.value;
        p.expiry = expiryTimestamp;
        p.withdrawn = false;
    }

    // Receiver withdraws before expiry
    function withdrawFrom(address sender) external {
        Payment storage p = payments[sender][msg.sender];
        require(p.amount > 0, "No funds to withdraw");
        require(!p.withdrawn, "Already withdrawn");
        require(block.timestamp < p.expiry, "Payment expired");

        uint256 amount = p.amount;
        p.withdrawn = true;
        p.amount = 0;

        payable(msg.sender).transfer(amount);
    }

    // Sender refunds after expiry if receiver didn’t withdraw
    function refund(address receiver) external {
        Payment storage p = payments[msg.sender][receiver];
        require(p.amount > 0, "No funds to refund");
        require(!p.withdrawn, "Already withdrawn");
        require(block.timestamp >= p.expiry, "Not expired yet");

        uint256 amount = p.amount;
        p.withdrawn = true;
        p.amount = 0;

        payable(msg.sender).transfer(amount);
    }

    // Optional: View current payment
    function viewPayment(address sender, address receiver)
        external
        view
        returns (uint256 amount, uint256 expiry, bool withdrawn)
    {
        Payment storage p = payments[sender][receiver];
        return (p.amount, p.expiry, p.withdrawn);
    }

    function getNow() external view returns (uint256) {
    return block.timestamp;
}

}