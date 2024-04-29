// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

interface IKingdomEventHandler {
    function handleMessage(bytes32 message, bytes calldata data) external;
}
