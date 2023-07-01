import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { GameItem } from "../../types/contracts/GameItem";
import type { GameItem__factory } from "../../types/factories/contracts/GameItem__factory";

task("deploy:GameItem")
  // .addParam("greeting", "Say hello, be nice")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const greeterFactory: GameItem__factory = <GameItem__factory>await ethers.getContractFactory("GameItem");
    const greeter: GameItem = <GameItem>await greeterFactory.connect(signers[0]).deploy();
    await greeter.deployed();
    console.log("Greeter deployed to: ", greeter.address);
  });
