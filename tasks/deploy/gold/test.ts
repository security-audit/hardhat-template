/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import Info from "./gold.abi.json";
import { CONFIG } from "./gold.config";

function getMessageBytes(
  id: string,
  producer: string,
  location: string,
  weight: number,
  time: number,
  parentIds: number[],
  type: number,
): Uint8Array {
  const message = keccak256(
    ["bytes", "bytes2", "bytes", "uint32", "uint256", "uint32[]", "uint8"],
    [id, producer, location, weight, time, parentIds, type],
  );
  return arrayify(message);
}

const strToHex = (str: string): string => {
  return "0x" + Buffer.from(str, "utf8").toString("hex");
};
// const contractsAddress = CONFIG.address;
const contractsAddress = "0xEa91fc883182e98b1d6c1f0d7705b3ECEAF76522";
const producer = strToHex("AB");
const location = strToHex("shenzhen");
const weight = 300;
const time = new Date().getTime();
const id = strToHex("ABCDEFG4");
const parentId = [0];
const type = 0;

const signHash = getMessageBytes(id, producer, location, weight, time, parentId, type); // 对签名数据进行转换

task("gold:create").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin = signers[0];
  const hash = await admin.signMessage(signHash);

  const contracts = new ethers.Contract(contractsAddress, Info.abi, admin);
  await contracts.createGoldBlock(id, producer, location, weight, time, parentId, type, hash);
  const log = await contracts.goldBlocks(1);
  console.log(log);
});

task("gold:get").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin = signers[0];

  const contracts = new ethers.Contract(contractsAddress, Info.abi, admin);
  const log = await contracts.goldBlocks(1);
  console.log(log);
});

task("gold:getVersion").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin = signers[0];

  const contracts = new ethers.Contract(contractsAddress, Info.abi, admin);
  const log = await contracts.getVersion();
  console.log(log);
});
