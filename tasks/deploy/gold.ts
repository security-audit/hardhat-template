import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { GoldTraceability as IT } from "../../types/contracts/GoldTraceability";
import type { GoldTraceability__factory as IFT } from "../../types/factories/contracts/GoldTraceability__factory";

// import Info from "./gold.json";

task("deploy:gold")
  // .addParam("greeting", "Say hello, be nice")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    // 部署ArrayUtils
    const ArrayUtilsFactory = await ethers.getContractFactory("ArrayUtils");
    const ArrayUtils = await ArrayUtilsFactory.deploy();

    const greeterFactory: IFT = <IFT>await ethers.getContractFactory("GoldTraceability", {
      libraries: {
        ArrayUtils: ArrayUtils.address,
      },
    });
    const greeter: IT = <IT>await greeterFactory.connect(signers[0]).deploy();
    await greeter.deployed();
    console.log("Greeter deployed to: ", greeter.address);
  });

task("upgrade:gold", "test").setAction(async function () {
  console.log("3asdf");
});
