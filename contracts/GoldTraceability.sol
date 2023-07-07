// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library ArrayUtils {
    function removeValue(uint256[] memory array, uint256 value) public pure returns (uint256[] memory) {
        uint256 count = 0;

        // 计算新数组的长度
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] != value) {
                count++;
            }
        }

        // 创建新的动态数组
        uint256[] memory newArray = new uint256[](count);
        uint256 index = 0;

        // 复制不等于目标值的元素到新数组中
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] != value) {
                newArray[index] = array[i];
                index++;
            }
        }

        return newArray;
    }

    function append(uint256[] memory A, uint256 B) internal pure returns (uint256[] memory) {
        uint256[] memory newAddresses = new uint256[](A.length + 1);
        for (uint256 i = 0; i < A.length; i++) {
            newAddresses[i] = A[i];
        }
        newAddresses[A.length] = B;
        return newAddresses;
    }
}

contract GoldTraceability is Ownable {
    using ECDSA for bytes32;
    enum GoldType {
        GoldBlock,
        GoldProduct
    }

    struct GoldBlock {
        string id; // 编号字段
        string producer;
        string location;
        uint256 weight;
        uint256 timestamp;
        address owner;
        uint256[] transactionIds;
        uint256[] parentIds; // 关联的黄金块 ID 数组
        GoldType goldType; // 是否为黄金工艺品
    }

    struct Transaction {
        address from;
        address to;
        uint256 blockId;
        uint256 timestamp;
    }

    mapping(string => uint256) private usedIds; // 编号到区块 ID 的映射关系
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => GoldBlock) public goldBlocks;
    mapping(address => uint256[]) private goldBlocksByOwner;
    mapping(address => uint256[]) private transactionsByAddress;
    mapping(uint256 => mapping(address => bool)) public authorizedUsers;

    uint256 private nextBlockId;
    uint256 private nextTransactionId;

    constructor() {
        nextBlockId = 1;
        nextTransactionId = 1;
    }

    modifier onlyAuthorized(uint256 blockId) {
        require(goldBlocks[blockId].owner == msg.sender || authorizedUsers[blockId][msg.sender], "Not authorized");
        _;
    }

    modifier onlyOwnerAuthorized(uint256 blockId) {
        require(goldBlocks[blockId].owner == msg.sender, "Only owner can authorize users");
        _;
    }

    modifier onlyExistingBlock(uint256 blockId) {
        require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");
        _;
    }

    function createGoldBlock(
        string memory id,
        string memory producer,
        string memory location,
        uint256 weight,
        uint256 timestamp,
        uint256[] memory parentIds,
        GoldType goldType,
        bytes memory signature
    ) external {
        require(bytes(id).length > 0, "Invalid ID");
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
            new uint256[](0),
            parentIds,
            goldType
        );
        goldBlocks[nextBlockId] = newGoldBlock;
        goldBlocksByOwner[signer].push(nextBlockId);

        usedIds[id] = nextBlockId;
        emit GoldBlockCreated(nextBlockId, producer, location, weight, timestamp, signer);
        nextBlockId++;
    }

    function transferGoldBlock(
        uint256 blockId,
        address to
    ) external onlyExistingBlock(blockId) onlyAuthorized(blockId) {
        // require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");
        // require(goldBlocks[blockId].owner == msg.sender, "Not the owner of the gold block");
        address from = goldBlocks[blockId].owner;
        goldBlocks[blockId].owner = to;
        goldBlocksByOwner[to].push(blockId);

        uint256[] memory blockIds = goldBlocksByOwner[from];
        goldBlocksByOwner[from] = ArrayUtils.removeValue(blockIds, blockId);
        addTransaction(blockId, from, to);
        emit GoldBlockTransferred(blockId, msg.sender, to, block.timestamp);
    }

    function destroyGoldBlock(uint256 blockId) external onlyOwner {
        require(goldBlocks[blockId].owner != address(0), "Gold block does not exist");

        removeGoldBlockFromMappings(blockId);
        delete goldBlocks[blockId];

        emit GoldBlockDestroyed(blockId);
    }

    function getGoldBlocksByOwner(address owner) external view returns (uint256[] memory) {
        return goldBlocksByOwner[owner];
    }

    function getTransactionsByAddress(address addr) external view returns (uint256[] memory) {
        return transactionsByAddress[addr];
    }

    function removeGoldBlockFromMappings(uint256 blockId) private {
        address owner = goldBlocks[blockId].owner;

        uint256[] storage blockIds = goldBlocksByOwner[owner];
        for (uint256 i = 0; i < blockIds.length; i++) {
            if (blockIds[i] == blockId) {
                if (i != blockIds.length - 1) {
                    blockIds[i] = blockIds[blockIds.length - 1];
                }
                blockIds.pop();
                break;
            }
        }
    }

    function addTransaction(uint256 blockId, address from, address to) private {
        Transaction memory transaction = Transaction(from, to, blockId, block.timestamp);
        goldBlocks[blockId].transactionIds.push(nextTransactionId);
        transactions[nextTransactionId] = transaction;
        // transactionsByAddress[from].push(nextTransactionId);
        // transactionsByAddress[to].push(nextTransactionId);

        emit TransactionCreated(nextTransactionId, blockId, from, to, block.timestamp);

        nextTransactionId++;
    }

    function grantAccess(uint256 blockId, address[] memory users) external onlyOwnerAuthorized(blockId) {
        for (uint256 i = 0; i < users.length; i++) {
            authorizedUsers[blockId][users[i]] = true;
            emit UserAuthorized(blockId, users[i]);
        }
    }

    function revokeAuthorization(uint256 blockId, address[] memory users) external onlyOwnerAuthorized(blockId) {
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

    function getParentIds(uint256 blockId) public view returns (uint256[] memory) {
        return goldBlocks[blockId].parentIds;
    }

    function getTransactionIds(uint256 blockId) public view returns (uint256[] memory) {
        return goldBlocks[blockId].transactionIds;
    }

    event GoldBlockCreated(
        uint256 blockId,
        string producer,
        string location,
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
