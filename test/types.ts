import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { GoldTraceability } from "../types/";

// import type { Sign } from "../types/";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    GoldTraceability: GoldTraceability;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  users: SignerWithAddress[];
}
