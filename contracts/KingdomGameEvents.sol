// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "../libraries/ECDSA.sol";
import "./Roles.sol";

contract KingdomGameEvents is Roles {
    error UnapprovedInteraction();
    error WithdrawFailed();

    event KingdomGameEvent();

    mapping(address => uint256) private _userNonces;

    constructor(){
        _setRole(msg.sender, 0, true);
    }

    function sendApprovedMessage(
        bytes calldata data,
        bytes calldata signature
    ) external payable {
        _verifySignature(
            data,
            signature
        );
        _userNonces[msg.sender]++;
        emit KingdomGameEvent();
    }

    function _verifySignature(
        bytes calldata data,
        bytes calldata signature
    ) internal view {
        bytes32 signedMessage = ECDSA.toEthSignedMessageHash(
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    _userNonces[msg.sender],
                    data,
                    block.chainid,
                    msg.value
                )
            )
        );
        address signer = ECDSA.recover(signedMessage, signature);
        if (!_hasRole(signer, 1)) {
            revert UnapprovedInteraction();
        }
    }

    function withdraw() external onlyRole(0) {
        (bool success, ) = msg.sender.call{ value: address(this).balance }("");
        if (!success) {
            revert WithdrawFailed();
        }
    }
}
