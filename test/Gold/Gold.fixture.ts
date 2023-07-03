import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { GoldTraceability } from "../../types/";
import type { GoldTraceability__factory } from "../../types/factories/contracts/GoldTraceability.sol/GoldTraceability__factory";

type IM = GoldTraceability;
type IMF = GoldTraceability__factory;
const contractsName = "GoldTraceability";

export async function deployGreeterFixture(): Promise<IM> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  // 部署ArrayUtils
  const ArrayUtilsFactory = await ethers.getContractFactory("ArrayUtils");
  const ArrayUtils = await ArrayUtilsFactory.deploy();

  const greeterFactory: IMF = <IMF>(<unknown>await ethers.getContractFactory(contractsName, {
    libraries: {
      ArrayUtils: ArrayUtils.address,
    },
  }));

  const greeter: IM = <IM>await greeterFactory.connect(admin).deploy();
  await greeter.deployed();

  return greeter;
}
