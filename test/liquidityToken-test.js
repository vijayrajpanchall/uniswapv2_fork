const { expect } = require("chai");
const { ethers, hre } = require("hardhat");

describe("LiquidityToken", function () {
    let liquidityToken;
    let accounts;

    beforeEach(async function () {
        accounts = await ethers.getSigners();
        const LiquidityToken = await ethers.getContractFactory("UniswapV2ERC20");
        liquidityToken = await LiquidityToken.deploy();
        await liquidityToken.deployed();
    });

    it("Should set name", async function () {
        expect(await liquidityToken.name()).to.equal("Uniswap V2");
    });

    it("Should have symbol", async function () {
        expect(await liquidityToken.symbol()).to.equal("UNI-V2");
    });

    it("Should have decimals", async function () {
        expect(await liquidityToken.decimals()).to.equal(18);
    });
});