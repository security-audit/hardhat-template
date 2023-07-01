// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { console } from "hardhat/console.sol";

contract Sign {
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

    function encode(string memory msg) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(msg));
    }

    function checkAddress(
        string memory str1,
        string memory str2,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 hash = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(str1, str2)));
        return ECDSA.recover(hash, signature);
    }

    function getEtherSignHash(string memory msg) public pure returns (bytes32) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(msg));
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
}
