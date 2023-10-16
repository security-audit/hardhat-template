import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// Box deployed to: 0xEa91fc883182e98b1d6c1f0d7705b3ECEAF76522
// Impl address : 0xd6b4764CBCd026ECB9eaFEC4B1957D267eD9489d
// import type { GoldTraceability as IT } from "../../types/contracts/GoldTraceability";
import type { GoldTraceability__factory as IFT } from "../../../types/factories/contracts/GoldTraceability__factory";
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
    console.log("Impl address :", await upgrades.erc1967.getImplementationAddress(box.address));
    console.log("Proxy admin address :", await upgrades.erc1967.getAdminAddress(box.address));
  });

task("upgrades:gold", "test").setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
  const greeterFactory: IFT = <IFT>await ethers.getContractFactory("GoldTraceability", {
    libraries: {},
  });
  const BOX_ADDRESS = CONFIG.address;
  const box = await upgrades.upgradeProxy(BOX_ADDRESS, greeterFactory, {
    kind: "uups",
  });

  console.log("Box deployed to:", await box.address);
  console.log("Impl address :", await upgrades.erc1967.getImplementationAddress(box.address));
  // console.log("Upgrading Box...", box);
});
