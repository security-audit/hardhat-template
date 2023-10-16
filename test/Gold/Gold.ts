import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { create, deleteGold, queryGold, transaction } from "./Gold.behavior";
import { deployGreeterFixture } from "./Gold.fixture";

describe("Gold Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.users = signers.slice(1);
    this.loadFixture = loadFixture;
  });

  describe("Create", function () {
    beforeEach(async function () {
      // const { Sign } = await this.loadFixture(deployGreeterFixture);
      this.GoldTraceability = await this.loadFixture(deployGreeterFixture);
    });

    create();
    queryGold();

    // shouldBehaveLikeGreeter();
    // shoudBehavelRest();
  });

  describe("Delete", function () {
    beforeEach(async function () {
      // const { Sign } = await this.loadFixture(deployGreeterFixture);
      this.GoldTraceability = await this.loadFixture(deployGreeterFixture);
    });

    deleteGold();
  });

  describe("Transaction", function () {
    beforeEach(async function () {
      // const { Sign } = await this.loadFixture(deployGreeterFixture);
      this.GoldTraceability = await this.loadFixture(deployGreeterFixture);
    });

    transaction();
  });
});
