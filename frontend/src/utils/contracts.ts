import Address from './contract-address.json'
import BuyMyRoom from './abis/BuyMyRoom.json'
import MyERC20 from './abis/MyERC20.json'
import SimpleSwap from './abis/SimpleSwap.json'
import Web3 from 'web3';

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const buyMyRoomAddress = Address.buyMyRoom
const myERC20Address = Address.myERC20
const simpleSwapAddress = Address.simpleSwap
const buyMyRoomABI = BuyMyRoom.abi
const myERC20ABI = MyERC20.abi
const simpleSwapABI = SimpleSwap.abi

// 获取合约实例
const buyMyRoomContract = new web3.eth.Contract(buyMyRoomABI, buyMyRoomAddress);
const myERC20Contract = new web3.eth.Contract(myERC20ABI, myERC20Address);
const simpleSwapContract = new web3.eth.Contract(simpleSwapABI, simpleSwapAddress);

// 导出web3实例和其它部署的合约
export {web3, buyMyRoomContract, myERC20Contract, simpleSwapContract}