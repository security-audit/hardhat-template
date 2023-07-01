import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Sign } from "../../types/";
import type { Sign__factory } from "../../types/factories/contracts/Sign__factory";

type IM = Sign;
type IMF = Sign__factory;

export async function deployGreeterFixture(): Promise<IM> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  // const greeting: string = "Hello, world!";
  const greeterFactory: IMF = <IMF>(<unknown>await ethers.getContractFactory("Sign"));
  const greeter: IM = <IM>await greeterFactory.connect(admin).deploy();
  await greeter.deployed();

  return greeter;
}
