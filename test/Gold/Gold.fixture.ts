import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import type { GoldTraceability } from "../../types/";
import type { GoldTraceability__factory } from "../../types/factories/contracts/GoldTraceability__factory";

type IM = GoldTraceability;
type IMF = GoldTraceability__factory;
const contractsName = "GoldTraceability";

export async function deployGreeterFixture(): Promise<IM> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const greeterFactory: IMF = <IMF>(<unknown>await ethers.getContractFactory(contractsName, {
    signer: admin,
  }));

  // const greeter: IM = <IM>await greeterFactory.connect(admin).deploy();
  // await greeter.deployed();

  const greeter = <IM>await upgrades.deployProxy(greeterFactory, {
    kind: "uups",
  });
  await greeter.deployed();
  return greeter;
}
