// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    // 测试时注入 10^-8 ETH (10^10 wei) 和 10^-8 ERC20 代币
    constructor() ERC20("ZJUToken", "ZJUTokenSymbol") {
        _mint(msg.sender, 100 * (10**15));
    }

    function getBalance() external view returns (uint) {
        return balanceOf(msg.sender);
    }
}


