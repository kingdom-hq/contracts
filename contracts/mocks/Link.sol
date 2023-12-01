// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Link {
  uint256 public constant decimals = 18;
  string public name = "ChainlinkToken";
  string public symbol = "LINK";
  uint256 public totalSupply;

  mapping (address => uint256) public balances;
  mapping (address => mapping (address => uint256)) private allowances;

  event Approval(address indexed src, address indexed usr, uint256 wad);
  event Transfer(address indexed src, address indexed dst, uint256 wad);

  function transfer(address dst, uint256 wad) external returns (bool) {
    return transferFrom(msg.sender, dst, wad);
  }

  function transferFrom(address src, address dst, uint256 wad) public returns (bool) {
    require(balances[src] >= wad, "Insufficient balance");
    if (src != msg.sender && allowances[src][msg.sender] != type(uint256).max) {
      require(allowances[src][msg.sender] >= wad, "Insufficient allowances");
      allowances[src][msg.sender] -= wad;
    }
    balances[src] -= wad;
    balances[dst] += wad;
    emit Transfer(src, dst, wad);
    return true;
  }

  function mint(address usr, uint256 wad) public {
    balances[usr] += wad;
    totalSupply += wad;
    emit Transfer(address(0), usr, wad);
  }

  function approve(address usr, uint256 wad) external returns (bool) {
    allowances[msg.sender][usr] = wad;
    emit Approval(msg.sender, usr, wad);
    return true;
  }

  function allowance(address owner, address spender) public view returns (uint256) {
    return allowances[owner][spender];
  }

  function balanceOf(address account) public view returns (uint256) {
    return balances[account];
  }
}
