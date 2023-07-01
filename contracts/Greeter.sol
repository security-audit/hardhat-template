// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import { console } from "hardhat/console.sol";

error GreeterError();

contract Greeter {
    string public greeting;
    string private _init;

    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        _init = _greeting;
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function reSet() public {
        console.log("reset greeting  to '%s'", _init);
        greeting = _init;
    }

    function throwError() external pure {
        revert GreeterError();
    }
}
