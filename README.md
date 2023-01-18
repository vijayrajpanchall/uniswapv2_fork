# Decentralized Exchange Task (UniswapV2 Fork)

## Table of Content

- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Folder Structure](#a-typical-top-level-directory-layout)
- [Install and Run](#install-and-run)

## Project Description

This project is fork of uniswapV2 in with addition fee of 4% is taken from each trade, with 2% coming from the incoming token and 2% coming from the outgoing token. For example, if a user swaps $100 worth of BUSD for USDC, they will receive 96 dollars worth of USDC, and the exchange's reward wallet will receive $2 worth of BUSD and $2 worth of USDC.

## About the task 
For achiving this task 
1. Modified the UniswapV2Router02.sol contract to add a fee of 2% for outgoing token.

2. Modified UniswapV2Pair.sol contract to add a fee of 2% to each trade, with 2% for incoming token.

3. Modified UniswapV2Factory.sol to add a treasury wallet where the fees are sent to.

4. Modified UniswapV2Library.sol to remove liquidity fee from all transactions.

## Technologies Used

- Soldity
- Openzepplein
- Hardhat

## A typical top-level directory layout

    .
    ├── Contracts               # Contract files (alternatively `dist`)
    ├── Scripts                 # Script files (alternatively `deploy`)
    ├── test                    # Automated tests (alternatively `spec` or `tests`)
    ├── LICENSE
    └── README.md

## Install and Run

To run this project, you must have the following installed:

1.  [nodejs](https://nodejs.org/en/)
2.  [npm](https://github.com/nvm-sh/nvm)

- Run `npm install` to install dependencies

```bash
$ npm install
```

- Run `npx hardhat compile` to compile all contracts.

```bash
$ npx hardhat compile
```

## Test

For a unit testing smart contract using the command line.

```
$ npx hardhat test
```

Expecting `router-test.js` result.

```bash

  Router
    ✔ Should deploy (47ms)
    ✔ Should add liquidity (1315ms)
    ✔ Should add liquidity using ether
    ✔ Should remove liquidity (1734ms)
    ✔ Should remove liquidity in ETH pair
    ✔ should return correct amount from getAmountsOut without fee
    ✔ should return correct amount from getAmountsIn without fee
    ✔ Should return correct value from getAmountsOut without fee (1193ms)
    ✔ Should return correct value from getAmountsIn without fee (657ms)
    ✔ Should swap swapExactTokensForTokens (1915ms)
    ✔ Should swap swapTokensForExactTokens in path[3] and check treasury balance (2543ms)
    ✔ Should swap swapTokensForExactTokens (1818ms)
    ✔ Should swap swapExactETHForTokens
    ✔ Should swap swapTokensForExactETH


  14 passing (27s)
```



```
After testing if you want to deploy the contract using the command line.


$ npx hardhat node
# Open another Terminal
$ npx hardhat run scripts/deploy.js

# result in npx hardhat node Terminal
web3_clientVersion
eth_chainId
eth_accounts
eth_chainId
eth_estimateGas
eth_gasPrice
eth_sendTransaction
  Contract deployment: <UnrecognizedContract>
  Contract address:    0x5fb...aa3
  Transaction:         0x4d8...945
  From:                0xf39...266
  Value:               0 ETH
  Gas used:            323170 of 323170
  Block #1:            0xee6...85d

eth_chainId
eth_getTransactionByHash
eth_blockNumber
eth_chainId (2)
eth_getTransactionReceipt

# result in npx hardhat run Terminal
Deployer:  0xf3...266
Core contract[Factory] deployed to: 0xD5...d0b
Periphery[RouterV2] contract deployed to: 0x3C...1e9

```
