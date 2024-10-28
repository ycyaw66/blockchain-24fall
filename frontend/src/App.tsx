// App.tsx
import React, { useState } from 'react';
import { Card, Button, Input, List, Form, Modal, message } from 'antd';
import { buyMyRoomContract, myERC20Contract, simpleSwapContract } from './utils/contracts';
import { web3 } from './utils/contracts';
import './App.css';

const App = () => {
  const [account, setAccount] = useState<string>("未连接"); // 当前连接的钱包地址
  const [ethToInject, setEthToInject] = useState<string>();
  const [erc20ToInject, setErc20ToInject] = useState<string>();
  const [ethToErc20, setEthToErc20] = useState<string>();
  const [erc20ToEth, setErc20ToEth] = useState<string>();
  const [targetERC20Amount, setTargetERC20Amount] = useState(0);
  const [targetETHAmount, setTargetETHAmount] = useState(0);
  const [balance, setBalance] = useState<number>(0); // 当前账户余额
  const [userHouses, setUserHouses] = useState<{ owner: string, listedTimestamp: number, price: number, index: number, isSelling: boolean }[]>([]);
  const [marketHouses, setMarketHouses] = useState<{ owner: string, listedTimestamp: number, price: number, index: number, isSelling: boolean }[]>([]);

  // 连接钱包
  const connectWallet = async () => {
    // @ts-ignore
    const {ethereum} = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
      message.error('MetaMask未正确安装!');
      return;
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length) {
        setAccount(accounts[0]);
        message.success('连接账户成功!');
      } else {
        message.error('连接账户失败!');
      }
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 获取 ERC20 代币余额
  const getERC20 = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      const balance = await myERC20Contract.methods.getBalance(account).call( { from: account } );
      console.log(`Balance: ${balance}`);
      setBalance(Number(balance));
      message.success('获取余额成功!');
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 添加流动性
  const addLiquidity = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    if (!ethToInject || Number(ethToInject) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    if (!erc20ToInject || Number(erc20ToInject) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    console.log(`Injecting ${ethToInject} ETH and ${erc20ToInject} ERC20 tokens into the liquidity pool`);
    try {
      await myERC20Contract.methods.approve(simpleSwapContract.options.address, erc20ToInject).send({ from: account });
      await simpleSwapContract.methods.addLiquidity(web3.utils.toWei(erc20ToInject, "wei")).send({ from: account, value: web3.utils.toWei(ethToInject, "wei") });
      message.success('添加流动性成功!');
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 处理兑换1
  const handleEthToErc20 = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    if (!ethToErc20 || Number(ethToErc20) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    try {
      console.log(`Converting ${ethToErc20} Wei to ERC20 tokens`);
      const amount = await simpleSwapContract.methods.swapETHForERC20().send({ from: account, value: web3.utils.toWei(ethToErc20, "wei") });
      message.success('兑换成功!');
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 处理兑换2
  const handleErc20ToEth = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    if (!erc20ToEth || Number(erc20ToEth) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    try {
      console.log(`Converting ${erc20ToEth} ERC20 tokens to Wei`);
      myERC20Contract.methods.approve(simpleSwapContract.options.address, erc20ToEth).send({ from: account });
      simpleSwapContract.methods.swapERC20ForETH(web3.utils.toWei(erc20ToEth, "wei")).send({ from: account }).then(() => {
        message.success('兑换成功!');
      });
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 获取兑换额1
  const getEthToErc20 = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    if (!ethToErc20 || Number(ethToErc20) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    try {
      const amount = await simpleSwapContract.methods.getETHForERC20(ethToErc20).call();
      setTargetERC20Amount(Number(amount));
      message.success('获取兑换额成功!');
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  // 获取兑换额2
  const getErc20ToEth = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    if (!erc20ToEth || Number(erc20ToEth) <= 0) {
      message.error('请输入正确的数量!');
      return;
    }
    try {
      const amount = await simpleSwapContract.methods.getERC20ForETH(erc20ToEth).call();
      setTargetETHAmount(Number(amount));
      message.success('获取兑换额成功!');
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  const handleAirDrop = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      console.log('领取空投房屋');
      await buyMyRoomContract.methods.airDrop().send({ from: account });
      message.success("成功领取空投房屋！");
    } catch (error) {
      message.error("领取空投房屋失败");
    }
  };

  // 获取用户房屋的函数
  const fetchUserHouses = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      setUserHouses([]);
      const houses = await buyMyRoomContract.methods.getUserHouseList().call({ from: account }) || [];
      console.log(houses);
      const parsedHouses = houses.map((house: any)=> {
        return {
          owner: house.owner,
          listedTimestamp: house.listedTimestamp,
          price: house.price,
          index: house.index,
          isSelling: house.isSelling
        };}
      )
      setUserHouses(parsedHouses);
      console.log(userHouses);
      message.success('获取房屋列表成功')
    } catch (error) {
      message.error('获取房屋列表失败');
      console.error(error);
    }
  };

  const fetchMarketHouses = async () => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      setMarketHouses([]);
      const houses = await buyMyRoomContract.methods.getSellingHouseList().call({ from: account }) || [];
      console.log(houses);
      const parsedHouses = houses.map((house: any)=> {
        return {
          owner: house.owner,
          listedTimestamp: house.listedTimestamp,
          price: house.price,
          index: house.index,
          isSelling: house.isSelling
        };}
      )
      setMarketHouses(parsedHouses);
      console.log(marketHouses);
      message.success('获取市场房屋列表成功')
    } catch (error) {
      message.error('获取市场房屋列表失败');
      console.error(error);
    }
  };

  // 挂单出售的函数
  const handleListHouse = async (houseId: number, price: number) => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      await buyMyRoomContract.methods.listHouse(houseId, price).send({ from: account });
      message.success(`房屋 ${houseId} 挂单成功`);
      fetchUserHouses();
    } catch (error) {
      message.error('挂单失败');
      console.error(error);
    }
  };

  // 购买房屋的函数
  const handleBuyHouse = async (houseId: number, price: number) => {
    if (!account) {
      message.error('请先连接钱包!');
      return;
    }
    try {
      await myERC20Contract.methods.approve(buyMyRoomContract.options.address, price).send({ from: account })
      await buyMyRoomContract.methods.buyHouse(houseId).send({ from: account });
      message.success(`成功购买房子 ${houseId}`);
      fetchMarketHouses();
    } catch (error) {
      message.error('购买失败');
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="card-container">
        <Card title="账户信息">
          <p>当前账户地址: {account}</p>
          <Button type="primary" onClick={connectWallet}>连接钱包</Button>
        </Card>

        <Card title="代币兑换">
          <div>
            <Button type="primary" style={{ marginRight: '20px' }} onClick={getERC20}>获取余额</Button> 
            当前账户ERC20代币余额: {balance} 
          </div>
          <Form layout="inline" style={{ marginTop: '20px' }}>
            <Form.Item label="需注入的ETH">
              <Input
                value={ethToInject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEthToInject(e.target.value)}
                placeholder="输入ETH数量(Wei)"
              />
            </Form.Item>
            <Form.Item label="需注入的ERC20代币">
              <Input
                value={erc20ToInject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErc20ToInject(e.target.value)}
                placeholder="输入ERC20代币数量"
              />
            </Form.Item>
            <Button type="primary" onClick={addLiquidity}>注入流动性</Button>
            <Form.Item style={{ marginTop: '20px' }}>
              <Input
                placeholder="输入兑换数量(Wei)"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEthToErc20(e.target.value)}
                style={{ width: '220px' }}
              />
              <Button type="primary" onClick={getEthToErc20} style={{ marginLeft: '5px' }}>
                兑换额查询
              </Button>
              <Button type="primary" onClick={handleEthToErc20} style={{ marginLeft: '5px', marginRight: '5px' }}>
                ETH 兑换 ERC20
              </Button>
              可获取: {targetERC20Amount} ERC20代币
            </Form.Item>

            <Form.Item style={{ marginTop: '20px' }}>
              <Input
                placeholder="输入兑换数量"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErc20ToEth(e.target.value)}
                style={{ width: '220px' }}
              />
              <Button type="primary" onClick={getErc20ToEth} style={{ marginLeft: '5px' }}>
                兑换额查询
              </Button>
              <Button type="primary" onClick={handleErc20ToEth} style={{ marginLeft: '5px', marginRight: '5px' }}>
                ERC20 兑换 ETH
              </Button>
              可获取: {targetETHAmount} Wei
            </Form.Item>
          </Form>
          
        </Card>

        <Card title="房屋信息">
          <Button type="primary" onClick={handleAirDrop} style={{ marginBottom: '15px' }}>
            领取空投房屋
          </Button>
          <Button type="primary" onClick={fetchUserHouses} style={{ marginBottom: '15px', marginLeft: '15px'}}>
            获取我的房屋
          </Button>
          <List
            dataSource={userHouses}
            renderItem={(house) => (
              <List.Item key={house.index}>
                <p>房屋索引: {house.index.toString()}</p>
                <p>在售状态: {house.isSelling ? '在售' : '未挂出'}</p>
                <Form
                  layout="inline"
                  onFinish={(values: { price: number }) => handleListHouse(house.index, values.price)}
                >
                  <Form.Item label="出售价格" name="price">
                    <Input placeholder="输入出售价格" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" disabled={house.isSelling}>挂单出售</Button>
                </Form>
              </List.Item>
            )}
          />
        </Card>

        <Card title="房屋市场">
          <Button type="primary" onClick={fetchMarketHouses} style={{ marginBottom: '15px'}}>
            刷新房屋市场
          </Button>
          <List
            dataSource={marketHouses}
            renderItem={(house) => (
              <List.Item key={house.index}>
                <p>房屋拥有者: {house.owner}</p>
                <p>房屋索引: {house.index.toString()}</p>
                <p>房屋价格: {house.price.toString()}</p>
                <Button type="primary" onClick={() => handleBuyHouse(house.index, house.price)}>购买</Button>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default App;
