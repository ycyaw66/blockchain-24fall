// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MyERC20.sol";

// 代码参考：https://www.wtf.academy/en/docs/solidity-103/DEX/#%E5%8E%BB%E4%B8%AD%E5%BF%83%E5%8C%96%E4%BA%A4%E6%98%93%E6%89%80

contract SimpleSwap is ERC20 {
    // 交易以太币和ERC20代币
    MyERC20 public token1;

    // 代币储备量
    uint public reserve0;
    uint public reserve1;
    
    // 事件 
    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1);

    // 构造器，初始化代币地址
    constructor(address _token1) ERC20("SimpleSwap", "SS") {
        token1 = MyERC20(_token1);
    }

    // 取两个数的最小值
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    // 计算平方根 babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // 添加流动性，转进代币，铸造LP
    // 如果首次添加，铸造的LP数量 = sqrt(amount0 * amount1)
    // 如果非首次，铸造的LP数量 = min(amount0/reserve0, amount1/reserve1)* totalSupply_LP
    // @param amount1Desired 添加的token1数量
    function addLiquidity(uint amount1Desired) public payable returns (uint liquidity) {
        // 将添加的流动性转入Swap合约，需事先给Swap合约授权
        uint amount0Desired = msg.value;
        token1.transferFrom(msg.sender, address(this), amount1Desired);
        // 计算添加的流动性
        uint _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            // 如果是第一次添加流动性，铸造 L = sqrt(x * y) 单位的LP（流动性提供者）代币
            liquidity = sqrt(amount0Desired * amount1Desired);
        } else {
            // 如果不是第一次添加流动性，按添加代币的数量比例铸造LP，取两个代币更小的那个比例
            liquidity = min(amount0Desired * _totalSupply / reserve0, amount1Desired * _totalSupply /reserve1);
        }

        // 检查铸造的LP数量
        require(liquidity > 0, 'INSUFFICIENT_LIQUIDITY_MINTED');

        // 更新储备量
        reserve0 += amount0Desired;
        reserve1 += amount1Desired;

        // 给流动性提供者铸造LP代币，代表他们提供的流动性
        _mint(msg.sender, liquidity);
        
        emit Mint(msg.sender, amount0Desired, amount1Desired);
    }

    // 移除流动性，本实验暂无需实现

    // 给定一个资产的数量和代币对的储备，计算交换另一个代币的数量
    // 由于乘积恒定
    // 交换前: k = x * y
    // 交换后: k = (x + delta_x) * (y + delta_y)
    // 可得 delta_y = - delta_x * y / (x + delta_x)
    // 正/负号代表转入/转出
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        require(amountIn > 0, 'INSUFFICIENT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'INSUFFICIENT_LIQUIDITY');
        amountOut = amountIn * reserveOut / (reserveIn + amountIn);
    }

    // ETH换ERC20代币
    function swapETHForERC20() external payable returns (uint amountOut) {
        amountOut = getAmountOut(msg.value, reserve0, reserve1);
        token1.transfer(msg.sender, amountOut);
        reserve0 += msg.value;
        reserve1 -= amountOut;
    }

    // ERC20代币换ETH
    function swapERC20ForETH(uint amountIn) external returns (uint amountOut) {
        amountOut = getAmountOut(amountIn, reserve1, reserve0);
        payable(msg.sender).transfer(amountOut);
        token1.transferFrom(msg.sender, address(this), amountIn);
        reserve0 -= amountOut;
        reserve1 += amountIn;
    }

    function getETHForERC20(uint amountIn) public view returns (uint amountOut) {
        amountOut = getAmountOut(amountIn, reserve0, reserve1);
    }

    function getERC20ForETH(uint amountIn) public view returns (uint amountOut) {
        amountOut = getAmountOut(amountIn, reserve1, reserve0);
    }
}