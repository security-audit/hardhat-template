import { Signer } from "@ethersproject/abstract-signer";
import { task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
  const accounts: Signer[] = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

task("balance", "Prints an account's balance", async (taskArgs, hre) => {
  const accounts: Signer[] = await hre.ethers.getSigners();
  const account = accounts[0];

  const balance = await account.getBalance();
  console.log(balance.toString());
});
