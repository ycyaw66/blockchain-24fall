// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./MyERC20.sol";

contract BuyMyRoom is ERC721 {

    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseBought(uint256 tokenId, uint256 price, address buyer);

    ERC20 public myERC20; // 代币合约地址

    struct House {
        address owner;          // 房屋所有者
        uint listedTimestamp;   // 挂单时间
        uint price;             // 价格，单位是ERC20代币
        uint index;             // 房屋索引
        bool isSelling;         // 是否在售
    }

    mapping(uint => House) public houses; // A map from house-index to its information

    address public manager;  // 合约部署者，用来转入手续费
    uint public houseIndex;  // 空投房屋索引
    uint public feeRate;     // 手续费率

    constructor(address token) ERC721("HouseToken", "HouseTokenSymbol") {
        houseIndex = 0;
        feeRate = 1;
        manager = msg.sender;
        myERC20 = MyERC20(token);
    }

    modifier onlyManager {
        require(msg.sender == manager, "Not the manager");
        _;
    }

    // 用户领取空投房屋，为了测试方便，每次调用都可以领取
    function airDrop() external {
        _mint(msg.sender, houseIndex);
        houses[houseIndex] = House(msg.sender, 0, 0, houseIndex, false);
        houseIndex++;
    }

    // 挂单
    function listHouse(uint tokenId, uint price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the house");
        require(!houses[tokenId].isSelling, "The house is already selling");
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].price = price;
        houses[tokenId].isSelling = true;
        emit HouseListed(tokenId, price, msg.sender);
    }

    // 购买
    function buyHouse(uint tokenId) external payable {
        require(houses[tokenId].isSelling, "The house is not selling");
        address seller = ownerOf(tokenId);
        uint fee = (block.timestamp - houses[tokenId].listedTimestamp) * feeRate * houses[tokenId].price / (10 ** 5);
        uint amount = houses[tokenId].price - fee;
        myERC20.transferFrom(msg.sender, seller, amount);
        myERC20.transferFrom(msg.sender, manager, fee);
        houses[tokenId].isSelling = false;
        _transfer(seller, msg.sender, tokenId); // 转移房屋所有权
        houses[tokenId].owner = msg.sender; // 更新房屋所有者
        emit HouseBought(tokenId, houses[tokenId].price, msg.sender);
    }

    // 用户房屋列表
    function getUserHouseList() external view returns (House[] memory) {
        uint count = 0;
        for (uint i = 0; i < houseIndex; i++) {
            if (ownerOf(i) == msg.sender) {
                count++;
            }
        }
        House[] memory userHouses = new House[](count);
        count = 0;
        for (uint i = 0; i < houseIndex; i++) {
            if (ownerOf(i) == msg.sender) {
                userHouses[count] = houses[i];
                count++;
            }
        }
        return userHouses;
    }

    // 出售房屋列表
    function getSellingHouseList() external view returns (House[] memory) {
        uint count = 0;
        for (uint i = 0; i < houseIndex; i++) {
            if (houses[i].isSelling) {
                count++;
            }
        }
        House[] memory marketHouses = new House[](count);
        count = 0;
        for (uint i = 0; i < houseIndex; i++) {
            if (houses[i].isSelling) {
                marketHouses[count] = houses[i];
                count++;
            }
        }
        return marketHouses;
    }
}