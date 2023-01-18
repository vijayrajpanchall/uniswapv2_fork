const { expect } = require("chai");
const { ethers, hre } = require("hardhat");

describe("Pair", function () {
    let pair;
    let accounts;
    let factory;
    let tokenA;
    let tokenB;
    let totalSupply;

    beforeEach(async function () {
        accounts = await ethers.getSigners();
        const Pair = await ethers.getContractFactory("UniswapV2Pair");
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        pair = await Pair.deploy();
        factory = await Factory.deploy(accounts[0].address);
        await pair.deployed();
        await factory.deployed();

        const TokenA = await ethers.getContractFactory("ERC20");
        const TokenB = await ethers.getContractFactory("DeflatingERC20");
        totalSupply = ethers.utils.parseEther("10000");

        tokenA = await TokenA.deploy(totalSupply);
        tokenB = await TokenB.deploy(totalSupply);

        await tokenA.deployed();
        await tokenB.deployed();

        // await factory.createPair(tokenA.address, tokenB.address);
    });

    //write test cases for uniswapV2Pair contract

    it("Should create pair", async function () {
        await factory.createPair(tokenA.address, tokenB.address);
        const pairLength = await factory.allPairsLength();
        expect(pairLength.toString()).to.equal("1");
    });

    it('should have a token0 and token1 address', async () => {
        const token0 = await pair.token0();
        const token1 = await pair.token1();

        expect(token0).to.not.be.empty;
        expect(token1).to.not.be.empty;
    });

    it('should have a factory address', async () => {
        const factoryAddress = await pair.factory();
        expect(factoryAddress).to.not.be.empty;
    });

    it('should have a kLast value', async () => {
        const kLast = await pair.kLast();
        expect(kLast).to.not.be.empty;
    });

    it('should have a price0CumulativeLast value', async () => {
        const price0CumulativeLast = await pair.price0CumulativeLast();
        expect(price0CumulativeLast).to.not.be.empty;
    });

    it('should have a price1CumulativeLast value', async () => {
        const price1CumulativeLast = await pair.price1CumulativeLast();
        expect(price1CumulativeLast).to.not.be.empty;
    });

    it('should have a MINIMUM_LIQUIDITY value', async () => {
        const MINIMUM_LIQUIDITY = await pair.MINIMUM_LIQUIDITY();
        expect(MINIMUM_LIQUIDITY.toString()).to.equal("1000");
    });

    it('should have a getReserves function', async () => {
        const reserves = await pair.getReserves();
        expect(reserves).to.not.be.empty;
    });

});   