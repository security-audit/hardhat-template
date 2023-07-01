import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { ping } from "./Sign.behavior";
import { deployGreeterFixture } from "./Sign.fixture";

describe("Sign Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Sign", function () {
    beforeEach(async function () {
      // const { Sign } = await this.loadFixture(deployGreeterFixture);
      this.Sign = await this.loadFixture(deployGreeterFixture);
    });

    ping();

    // shouldBehaveLikeGreeter();
    // shoudBehavelRest();
  });
});
