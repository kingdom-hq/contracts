// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract Router is IRouterClient {

  uint256 private _counter;
  address private link;

  event CCIPMessage(uint64 chain, bytes receiver, bytes data);

  constructor(address _link) {
    link = _link;
  }

  function isChainSupported(uint64 chainSelector) external view returns (bool) {
    return true;
  }

  function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
    address[] memory out = new address[](1);
    out[0] = link;
    return out;
  }

  function getFee(
    uint64,
    Client.EVM2AnyMessage memory message
  ) public view returns (uint256) {
    return 10000 gwei;
  }

  function ccipSend(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage calldata message
  ) external payable returns (bytes32) {
    emit CCIPMessage(destinationChainSelector, message.receiver, message.data);
    _counter++;
    LinkTokenInterface(link).transferFrom(msg.sender, address(this), getFee(destinationChainSelector, message));
    return keccak256(abi.encodePacked(destinationChainSelector, message.data, _counter));
  }

  function ccipReceive(
    address dest,
    Client.Any2EVMMessage calldata message
  ) external {
    IAny2EVMMessageReceiver(dest).ccipReceive(message);
  }
}
