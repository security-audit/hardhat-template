// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./libs/ArrayUtils.sol";

contract GoldTraceability is OwnableUpgradeable {
    using ECDSA for bytes32;
    enum GoldType {
        GoldBlock,
        GoldProduct
    }

    struct GoldBlock {
        bytes8 id; // 编号字段
        bytes2 producer;
        bytes location;
        uint32 weight;
        uint256 timestamp;
        address owner;
        uint32[] transactionIds;
        uint32[] parentIds; // 关联的黄金块 ID 数组
        GoldType goldType; // 是否为黄金工艺品
    }

    struct Transaction {
        address from;
        address to;
        uint32 blockId;
        uint256 timestamp;
    }

    mapping(bytes8 => uint256) private usedIds; // 编号到区块 ID 的映射关系
    mapping(uint32 => Transaction) public transactions;
    mapping(uint32 => GoldBlock) public goldBlocks;
    mapping(address => uint32[]) private goldBlocksByOwner;
    mapping(address => uint32[]) private transactionsByAddress;
    mapping(uint32 => mapping(address => bool)) public authorizedUsers;

    uint32 private nextBlockId;
    uint32 private nextTransactionId;

    function initialize() public initializer {
        nextBlockId = 1;
        nextTransactionId = 1;
        __Ownable_init();
    }

    modifier onlyAuthorized(uint32 blockId) {
        require(goldBlocks[blockId].owner == msg.sender || authorizedUsers[blockId][msg.sender], "Not authorized");
        _;
    }

    modifier onlyOwnerAuthorized(uint32 blockId) {
        require(goldBlocks[blockId].owner == msg.sender, "Only owner can authorize users");
        _;
    }

    modifier onlyExistingBlock(uint32 blockId) {
        require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");
        _;
    }

    function createGoldBlock(
        bytes8 id,
        bytes2 producer,
        bytes memory location,
        uint32 weight,
        uint256 timestamp,
        uint32[] memory parentIds,
        GoldType goldType,
        bytes memory signature
    ) external {
        // require(bytes(id).length > 0, "Invalid ID");
        require(usedIds[id] == 0, "ID already used");

        address signer = keccak256(abi.encodePacked(id, producer, location, weight, timestamp, parentIds, goldType))
            .toEthSignedMessageHash()
            .recover(signature);
        require(signer != address(0), "Invalid signature");
        require(signer == msg.sender, "Invalid signature");

        GoldBlock memory newGoldBlock = GoldBlock(
            id,
            producer,
            location,
            weight,
            timestamp,
            signer,
            new uint32[](0),
            parentIds,
            goldType
        );
        goldBlocks[nextBlockId] = newGoldBlock;
        goldBlocksByOwner[signer].push(nextBlockId);

        usedIds[id] = nextBlockId;
        emit GoldBlockCreated(nextBlockId, producer, location, weight, timestamp, signer);
        nextBlockId++;
    }

    function transferGoldBlock(uint32 blockId, address to) external onlyExistingBlock(blockId) onlyAuthorized(blockId) {
        // require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");
        // require(goldBlocks[blockId].owner == msg.sender, "Not the owner of the gold block");
        address from = goldBlocks[blockId].owner;
        goldBlocks[blockId].owner = to;
        goldBlocksByOwner[to].push(blockId);

        uint32[] memory blockIds = goldBlocksByOwner[from];
        goldBlocksByOwner[from] = ArrayUtils.removeValue(blockIds, blockId);
        addTransaction(blockId, from, to);
        emit GoldBlockTransferred(blockId, msg.sender, to, block.timestamp);
    }

    function destroyGoldBlock(uint32 blockId) external onlyOwner {
        require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");

        removeGoldBlockFromMappings(blockId);
        delete goldBlocks[blockId];

        emit GoldBlockDestroyed(blockId);
    }

    function getGoldBlocksByOwner(address owner) external view returns (uint32[] memory) {
        return goldBlocksByOwner[owner];
    }

    function getTransactionsByAddress(address addr) external view returns (uint32[] memory) {
        return transactionsByAddress[addr];
    }

    function removeGoldBlockFromMappings(uint32 blockId) private {
        address owner = goldBlocks[blockId].owner;

        uint32[] storage blockIds = goldBlocksByOwner[owner];
        for (uint32 i = 0; i < blockIds.length; i++) {
            if (blockIds[i] == blockId) {
                if (i != blockIds.length - 1) {
                    blockIds[i] = blockIds[blockIds.length - 1];
                }
                blockIds.pop();
                break;
            }
        }
    }

    function addTransaction(uint32 blockId, address from, address to) private {
        Transaction memory transaction = Transaction(from, to, blockId, block.timestamp);
        goldBlocks[blockId].transactionIds.push(nextTransactionId);
        transactions[nextTransactionId] = transaction;
        // transactionsByAddress[from].push(nextTransactionId);
        // transactionsByAddress[to].push(nextTransactionId);

        emit TransactionCreated(nextTransactionId, blockId, from, to, block.timestamp);

        nextTransactionId++;
    }

    function grantAccess(uint32 blockId, address[] memory users) external onlyOwnerAuthorized(blockId) {
        for (uint256 i = 0; i < users.length; i++) {
            authorizedUsers[blockId][users[i]] = true;
            emit UserAuthorized(blockId, users[i]);
        }
    }

    function revokeAuthorization(uint32 blockId, address[] memory users) external onlyOwnerAuthorized(blockId) {
        for (uint256 i = 0; i < users.length; i++) {
            authorizedUsers[blockId][users[i]] = false;
            emit AuthorizationRevoked(blockId, users[i]);
        }
    }

    // struct ParentInfo {
    //     uint256 blockId;
    //     uint256[] parents;
    // }

    // function getParentBlocks(uint256 blockId) external view returns (uint256[] memory) {
    //     uint256[] memory parentBlocks;
    //     // uint256[] memory currentBlockId = new uint256[](blockId);
    //     // currentBlockId.push(blockId);
    //     ParentInfo[] storage foundIds;
    //     // while (true) {
    //     for (uint j = 0; j < blockIds.length; j++) {
    //         // uint256[] storage nextIds = goldBlocks[currentBlockId[j]].parentIds;
    //         uint256[] memory parentIds = goldBlocks[blockIds[j]].parentIds;

    //         foundIds.push(ParentInfo(blockIds[j], _getParents(parentIds)));
    //     }
    //     // }
    //     return foundIds;
    // }

    // function _getParents(uint256[] memory blockIds) internal view returns (ParentInfo[] memory) {
    //     ParentInfo[] storage parentBlocks;
    //     for (uint256 i = 0; i < blockIds.length; i++) {
    //         uint256[] memory parentIds = goldBlocks[blockIds[i]].parentIds;
    //         if (parentIds.length == 0) {
    //             parentBlocks.push(ParentInfo(blockIds[i], new ParentInfo[](0)));
    //         } else {
    //             parentBlocks.push(ParentInfo(blockIds[i], _getParents(parentIds)));
    //         }
    //     }
    //     return parentBlocks;
    // }

    function getParentIds(uint32 blockId) public view returns (uint32[] memory) {
        return goldBlocks[blockId].parentIds;
    }

    function getTransactionIds(uint32 blockId) public view returns (uint32[] memory) {
        return goldBlocks[blockId].transactionIds;
    }

    function getVersion() public pure returns (string memory) {
        return "v1.0.2";
    }

    event GoldBlockCreated(
        uint32 blockId,
        bytes2 producer,
        bytes location,
        uint256 weight,
        uint256 timestamp,
        address owner
    );

    event GoldBlockTransferred(uint256 blockId, address from, address to, uint256 timestamp);

    event GoldBlockDestroyed(uint256 blockId);

    event TransactionCreated(uint256 transactionId, uint256 blockId, address from, address to, uint256 timestamp);

    event UserAuthorized(uint256 indexed blockId, address indexed user);

    event AuthorizationRevoked(uint256 indexed blockId, address indexed user);
}
