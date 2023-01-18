const { expect } = require("chai");
const { ethers, hre } = require("hardhat");


describe.only("Router", function () {
    let accounts;
    let weth;
    let factory;
    let router;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        const Router = await ethers.getContractFactory("UniswapV2Router02");
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        const WETH = await ethers.getContractFactory("WETH9");

        weth = await WETH.deploy();
        factory = await Factory.deploy(accounts[0].address);
        router = await Router.deploy(factory.address, weth.address);

        await weth.deployed();
        await factory.deployed();
        await router.deployed();
    });

    it("Should deploy", async () => {
        expect(await router.factory()).to.equal(factory.address);
        expect(await router.WETH()).to.equal(weth.address);
    });

    it("Should add liquidity", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        const tx1 = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000"));
        const tx2 = await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000"));
        tx1.wait();
        tx2.wait();

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        // console.log(tx3);

        tx3.wait();

        const pairAddress = await factory.getPair(tokenAInstance.address, tokenBInstance.address);
        const pairInstance = await ethers.getContractAt("UniswapV2Pair", pairAddress);
        const liquidityBalance = await pairInstance.balanceOf(accounts[0].address);
        

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await tokenBInstance.balanceOf(pairAddress);
        expect(liquidityBalance.toString()).to.be.not.equal("0");
        expect(liquidityBalance.toString()).to.equal("994987437106619953734".toString());
        expect(pairAbalance.toString()).to.equal(ethers.utils.parseEther("1000").toString());
        expect(pairBbalance.toString()).to.equal(ethers.utils.parseEther("990").toString())
    });

    it("Should add liquidity using ether", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);

        await tokenAInstance.deployed();

        const tx1 = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000"));
        tx1.wait();

        const tx3 = await router.addLiquidityETH(
            tokenAInstance.address,
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256,
            {
                value: ethers.utils.parseEther("1000")
            }
        );
        await tx3.wait();

        const pairAddress = await factory.getPair(tokenAInstance.address, weth.address);

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await weth.balanceOf(pairAddress);
        expect(pairAbalance.toString()).to.equal(ethers.utils.parseEther("1000").toString());
        expect(pairBbalance.toString()).to.equal(ethers.utils.parseEther("1000").toString());
    });

    it("Should remove liquidity", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000000"));

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        tx3.wait();

        //get minted uni token here
        const pairAddress = await factory.getPair(tokenAInstance.address, tokenBInstance.address);
        const pairInstance = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        //approve uni token
        await pairInstance.connect(accounts[1]).approve(router.address, ethers.utils.parseEther("1000000"));

        const tx4 = await router.connect(accounts[1]).removeLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1"),
            0,
            0,
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        tx4.wait();

        const pairAbalance2 =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance2 =  await tokenBInstance.balanceOf(pairAddress);
        
        expect(pairAbalance2.toString()).to.equal("998994962184740787925".toString());
        expect(pairBbalance2.toString()).to.equal("989005012562893380046".toString());
    });

    it("Should remove liquidity in ETH pair", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000000"));

        const tx3 = await router.addLiquidityETH(
            tokenAInstance.address,
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[1].address,
            ethers.constants.MaxUint256,
            {
                value: ethers.utils.parseEther("1000")
            }
        );
        tx3.wait();

        //get minted uni token here
        const pairAddress = await factory.getPair(tokenAInstance.address, weth.address);
        const pairInstance = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        //approve uni token
        await pairInstance.connect(accounts[1]).approve(router.address, ethers.utils.parseEther("1000000"));

        const tx4 = await router.connect(accounts[1]).removeLiquidityETH(
            tokenAInstance.address,
            ethers.utils.parseEther("1"),
            0,
            0,
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        tx4.wait();

        const pairAbalance2 =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance2 =  await weth.balanceOf(pairAddress);
        
        expect(pairAbalance2.toString()).to.equal("999000000000000000000".toString());
        expect(pairBbalance2.toString()).to.equal("999000000000000000000".toString());
    });

    it("should return correct amount from getAmountsOut without fee", async () => {
        const amountIn = ethers.utils.parseEther("1000");
        const reserveIn = ethers.utils.parseEther("10000");
        const reserveOut = ethers.utils.parseEther("10000");

        const amountOut = await router.getAmountOut(amountIn, reserveIn, reserveOut);
        expect(amountOut.toString()).to.equal("909090909090909090909".toString());
    });

    it("should return correct amount from getAmountsIn without fee", async () => {
        const amountOut = ethers.utils.parseEther("1000");
        const reserveIn = ethers.utils.parseEther("10000");
        const reserveOut = ethers.utils.parseEther("10000");

        const amountIn = await router.getAmountIn(amountOut, reserveIn, reserveOut);
        expect(amountIn.toString()).to.equal("1111111111111111111112".toString());
    });

    it("Should return correct value from getAmountsOut without fee", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000"));
        await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000"));

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        tx3.wait();

        const amountIn = ethers.utils.parseEther("1000");
        const amountOut = await router.getAmountsOut(amountIn, [tokenAInstance.address, tokenBInstance.address]);

        expect(amountOut[1].toString()).to.equal("495000000000000000000".toString());
    });

    it("Should return correct value from getAmountsIn without fee", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000"));
        await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000"));

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        tx3.wait();

        const amountOut = ethers.utils.parseEther("100");
        const amountIn = await router.getAmountsIn(amountOut, [tokenAInstance.address, tokenBInstance.address]);

        expect(amountIn[0].toString()).to.equal("112359550561797752809".toString());
    });

    it("Should swap swapExactTokensForTokens", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        const a = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const b = await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        await a.wait();
        await b.wait();

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        await tx3.wait();

        const tx5 = await router.swapExactTokensForTokens(
            ethers.utils.parseEther("100"),
            0,
            [tokenAInstance.address, tokenBInstance.address],
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        await tx5.wait();

        console.log("swap done");

        const pairAddress = await factory.getPair(tokenAInstance.address, tokenBInstance.address);

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await tokenBInstance.balanceOf(pairAddress);
        expect(pairAbalance.toString()).to.equal(ethers.utils.parseEther("1100").toString());
        expect(pairBbalance.toString()).to.equal(ethers.utils.parseEther("900").toString());
    });

    it.only("Should swap swapTokensForExactTokens in path[3] and check treasury balance", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const tokenC = await ethers.getContractFactory("DeflatingERC20");

        const totalSupply = ethers.utils.parseEther("1000000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);
        const tokenCInstance = await tokenC.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        const a = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const b = await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const c = await tokenCInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        await a.wait();
        await b.wait();
        await c.wait();

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        await tx3.wait();

        const tx4 = await router.addLiquidity(
            tokenBInstance.address,
            tokenCInstance.address,
            ethers.utils.parseEther("10000"),
            ethers.utils.parseEther("10000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        await tx4.wait();

        const tx5 = await router.swapTokensForExactTokens(
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("1000"),
            [tokenAInstance.address, tokenBInstance.address, tokenCInstance.address],
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        await tx5.wait();

        const treasury = await factory.treasury();
        const treasuryBalance = await tokenCInstance.balanceOf(treasury);

        expect(treasuryBalance).to.not.be.empty;
        expect(treasuryBalance.toString()).to.equal("990001980000000000000000".toString());

        account1_CtokenBalance = await tokenCInstance.balanceOf(accounts[1].address);

        expect(account1_CtokenBalance).to.not.be.empty;
        expect(account1_CtokenBalance.toString()).to.equal("97020000000000000000".toString());
    });

    it("Should swap swapTokensForExactTokens", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const tokenB = await ethers.getContractFactory("DeflatingERC20");
        const totalSupply = ethers.utils.parseEther("1000000");

        const tokenAInstance = await tokenA.deploy(totalSupply);
        const tokenBInstance = await tokenB.deploy(totalSupply);

        await tokenAInstance.deployed();
        await tokenBInstance.deployed();

        const a = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const b = await tokenBInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        await a.wait();
        await b.wait();

        const tx3 = await router.addLiquidity(
            tokenAInstance.address,
            tokenBInstance.address,
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256
        );
        await tx3.wait();        
        await factory.updateTreasuryWallet(accounts[1].address);

        const tx5 = await router.swapTokensForExactTokens(
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("1000"),
            [tokenAInstance.address, tokenBInstance.address],
            accounts[2].address,
            ethers.constants.MaxUint256
        );
        await tx5.wait();

        const pairAddress = await factory.getPair(tokenAInstance.address, tokenBInstance.address);

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await tokenBInstance.balanceOf(pairAddress);

        expect(pairAbalance.toString()).to.equal("1110112359550561797753".toString());//1110 tokens
        expect(pairBbalance.toString()).to.equal(ethers.utils.parseEther("890").toString());
    });

    it("Should swap swapExactETHForTokens", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const totalSupply = ethers.utils.parseEther("10000");

        const tokenAInstance = await tokenA.deploy(totalSupply);

        await tokenAInstance.deployed();

        const tx1 = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const tx2 = await weth.approve(router.address, ethers.utils.parseEther("1000000"));
        tx1.wait();
        tx2.wait();

        const tx3 = await router.addLiquidityETH(
            tokenAInstance.address,
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256,
            {
                value: ethers.utils.parseEther("1000")
            }
        );
        await tx3.wait();

        //set updateTreasuryWallet 
        await factory.updateTreasuryWallet(accounts[3].address);

        const tx5 = await router.swapExactETHForTokens(
            0,
            [weth.address, tokenAInstance.address],
            accounts[1].address,
            ethers.constants.MaxUint256,
            {
                value: ethers.utils.parseEther("100")
            }
        );
        await tx5.wait();
        const pairAddress = await factory.getPair(weth.address, tokenAInstance.address);

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await weth.balanceOf(pairAddress);
        expect(pairAbalance.toString()).to.equal("909090909090909090910".toString());
        expect(pairBbalance.toString()).to.equal("1098000000000000000000".toString());
    });

    it.skip("Should swap swapTokensForExactETH", async () => {
        const tokenA = await ethers.getContractFactory("ERC20");
        const totalSupply = ethers.utils.parseEther("1000000");

        const tokenAInstance = await tokenA.deploy(totalSupply);

        await tokenAInstance.deployed();

        const tx1 = await tokenAInstance.approve(router.address, ethers.utils.parseEther("1000000"));
        const tx2 = await weth.approve(router.address, ethers.utils.parseEther("1000000"));
        tx1.wait();
        tx2.wait();

        const tx3 = await router.addLiquidityETH(
            tokenAInstance.address,
            ethers.utils.parseEther("1000"),
            0,
            0,
            accounts[0].address,
            ethers.constants.MaxUint256,
            {
                value: ethers.utils.parseEther("1000")
            }
        );
        await tx3.wait();
        console.log("liquidity added");

        //set updateTreasuryWallet
        await factory.updateTreasuryWallet(accounts[3].address);

        const tx5 = await router.swapTokensForExactETH(
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("1000"),
            [tokenAInstance.address, weth.address],
            accounts[1].address,
            ethers.constants.MaxUint256
        );
        await tx5.wait();
        const balll = await weth.balanceOf(accounts[3].address);
        //check weth balance of accounts[1]
        console.log("accounts[1] weth ",balll.toString());

        const pairAddress = await factory.getPair(weth.address, tokenAInstance.address);

        const pairAbalance =  await tokenAInstance.balanceOf(pairAddress);
        const pairBbalance =  await weth.balanceOf(pairAddress);
        expect(pairAbalance.toString()).to.equal("1110112359550561797753".toString());
        expect(pairBbalance.toString()).to.equal("890000000000000000000".toString());
    });
});