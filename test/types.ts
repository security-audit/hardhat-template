import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { GameItem, GoldTraceability, Sign } from "../types/";
// import type { Sign } from "../types/";
import type { Greeter } from "../types/Greeter";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    greeter: Greeter;
    GameItem: GameItem;
    Sign: Sign;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    GoldTraceability: GoldTraceability;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  users: SignerWithAddress[];
}
