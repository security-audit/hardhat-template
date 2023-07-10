// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import { console } from "hardhat/console.sol";

contract Sign {
    using ECDSA for bytes32;
    string public greeting;
    string private _init;

    constructor() {
        console.log("Deploying a Greeter with greeting:");
        // _init = _greeting;
        greeting = "asdf";
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature recovery");
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function encode(string memory d) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(d));
    }

    function checkAddress(
        string memory str1,
        string memory str2,
        bytes memory signature
    ) public pure returns (address) {
        // bytes32 hash = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(str1, str2)));
        // return ECDSA.recover(hash, signature);
        return keccak256(abi.encodePacked(str1, str2)).toEthSignedMessageHash().recover(signature);
    }

    function getEtherSignHash(string memory d) public pure returns (bytes32) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(d));
        return ECDSA.toEthSignedMessageHash(ethSignedMessageHash);
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function reSet() public {
        console.log("reset greeting  to '%s'", _init);
        greeting = _init;
    }

    function setBytes(bytes memory _bytes) public pure returns (bytes memory) {
        // console.logBytes(_bytes);
        bytes memory b = bytes("abc");
        bytes1 a = bytes1("a");
        require(BytesLib.equal(b, _bytes), "not equal");
        require(_bytes[0] == a, "not equal");
        require(_bytes[1] == hex"62", "not equal");
        require(_bytes.length == 3, "not equal");

        bytes2 c = bytes2("ab");
        require(c.length == 2, "not equal");
        require(c[0] == hex"61", "not equal");
        require(c[1] == hex"62", "not equal");
        return bytes("abc");
    }

    function setBytes3(bytes3 _bytes) public pure returns (bytes3) {
        // console.logBytes3(_bytes);
        bytes3 b = bytes3("abc");
        // require(BytesLib.equal(b, _bytes), "not equal");
        require(b == _bytes, "not equal");
        require(_bytes[0] == hex"61", "not equal"); // a
        require(_bytes[1] == hex"62", "not equal"); // b
        require(_bytes[2] == hex"63", "not equal"); // c
        return bytes3("abc");
    }

    enum GoldType {
        GoldBlock,
        GoldProduct
    }

    function getGoldType() public pure returns (GoldType) {
        return GoldType.GoldBlock;
    }
}
