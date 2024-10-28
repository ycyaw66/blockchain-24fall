import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x3a68efd345314e58fc3a056bb285fd6f442125e5d624ce4b44d96694c8558c20',
        '0xc8ff6047d765f5332acaf0da9cdba350f23201d99cf350804163fc0679046cfc',
        '0x76d08b7933172e530b9c41be7fb80e6344bc876167d67589e3358687825c6981',
        '0x0579846ba9dfab576cb779f378a2013d11319c656127258a998588677151a7f0'
      ]
    },
  },
};

export default config;
