import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { testEIP5192 } from "./Game.5192";
import { shouldBehaveLikeGreeter } from "./Game.behavior";
import { deployGreeterFixture } from "./Game.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.users = signers.slice(1, 5);
    // console.log(signers);

    this.loadFixture = loadFixture;
  });

  describe("GameItem", function () {
    beforeEach(async function () {
      const { GameItem } = await this.loadFixture(deployGreeterFixture);
      this.GameItem = GameItem;
    });

    shouldBehaveLikeGreeter();
    testEIP5192();
    // shoudBehavelRest();
  });
});
