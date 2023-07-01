import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { GameItem } from "../../types/";
import type { GameItem__factory } from "../../types/factories/contracts/GameItem.sol/GameItem__factory";

export async function deployGreeterFixture(): Promise<{ GameItem: GameItem }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  // const greeting: string = "Hello, world!";
  const greeterFactory: GameItem__factory = <GameItem__factory>await ethers.getContractFactory("GameItem");
  const GameItem: GameItem = <GameItem>await greeterFactory.connect(admin).deploy();
  await GameItem.deployed();

  return { GameItem };
}
