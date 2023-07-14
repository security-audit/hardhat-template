// import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// import type { GoldTraceability as IT } from "../../types/contracts/GoldTraceability";
import type { GoldTraceability__factory as IFT } from "../../types/factories/contracts/GoldTraceability__factory";
import { CONFIG } from "./gold.config";

task("deploy:gold")
  // .addParam("greeting", "Say hello, be nice")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    // const signers: SignerWithAddress[] = await ethers.getSigners();

    const greeterFactory: IFT = <IFT>await ethers.getContractFactory("GoldTraceability", {
      libraries: {},
    });

    const box = await upgrades.deployProxy(greeterFactory, {
      kind: "uups",
    });
    await box.deployed();
    console.log("Box deployed to:", await box.address);
  });

task("upgrades:gold", "test").setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
  const greeterFactory: IFT = <IFT>await ethers.getContractFactory("GoldTraceability", {
    libraries: {},
  });
  const BOX_ADDRESS = CONFIG.address;
  const box = await upgrades.upgradeProxy(BOX_ADDRESS, greeterFactory, {
    kind: "uups",
  });
  console.log("Upgrading Box...", box);
});
