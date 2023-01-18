pragma solidity =0.5.16;

import './interfaces/IUniswapV2Factory.sol';
import './UniswapV2Pair.sol';

contract UniswapV2Factory is IUniswapV2Factory {
    //feeTo is the address that receives liquidity fees
    address public feeTo;
    //feeToSetter is the address that can change the feeTo address
    address public feeToSetter;
    //treasury is the address that receives treasury fees
    address public treasury;

    //for testing only to deployment
    bytes32 public constant INIT_CODE_HASH = keccak256(abi.encodePacked(type(UniswapV2Pair).creationCode));

    //getPair is a mapping of tokenA and tokenB to the pair address
    mapping(address => mapping(address => address)) public getPair;
    //allPairs is an array of all pairs
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    /**
     * @dev Constructor function
     * @param _feeToSetter The initial feeToSetter address
     */
    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
        treasury = _feeToSetter;
    }

    /**
     * @dev Returns the number of pairs
     * @return uint The number of pairs
     */
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    /**
     * @notice createPair is a function that creates a pair of tokens
     * @param tokenA The first token 
     * @param tokenB The second token
     * @return pair The address of the pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IUniswapV2Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    /**
     * @notice setFeeTo is a function that sets the feeTo address
     * @param _feeTo The address that receives liquidity fees
     * @dev Only the feeToSetter can call this function
     */
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    /**
     * @notice setFeeToSetter is a function that sets the feeToSetter address
     * @param _feeToSetter The address that can change the feeTo address
     * 
     */
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

    /**
     * @notice updateTreasuryWallet is a function that update the treasury address
     * @param _treasuryWallet The address that receives treasury fees   
     * @dev Only the feeToSetter can call this function
     */
    function updateTreasuryWallet(address _treasuryWallet) external {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        treasury = _treasuryWallet;
    }
}
