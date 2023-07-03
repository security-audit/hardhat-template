import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import { expect } from "chai";

function getMessageBytes(str: string, str2: string, weight: number, time: number): Uint8Array {
  const message = keccak256(["string", "string", "uint256", "uint256"], [str, str2, weight, time]);
  return arrayify(message);
}

const producer = "1";
const location = "shenzhen";
const weight = 100;
const time = new Date().getTime();
const signHash = getMessageBytes(producer, location, weight, time); // 对签名数据进行转换

export function create(): void {
  it("add Success", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(producer, location, weight, time, signature1);
    // console.log("id", id.);
    const gold = await connect.goldBlocks(1);
    expect(gold[0]).to.equal(producer);
    // expect(id).to.equal(1);
  });

  it("add Fail -- 签名失败", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    try {
      // 故意签名不过。
      await connect.createGoldBlock(producer, location + "n", weight, time, signature1);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Invalid signature'",
      );
    }

    const user0 = await this.GoldTraceability.connect(this.signers.users[0]);
    try {
      // 使用另外一个
      await user0.createGoldBlock(producer, location, weight, time, signature1);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Invalid signature'",
      );
    }
  });

  it("add Fail -- 使用他人签名提交数据", async function () {
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    const user0 = await this.GoldTraceability.connect(this.signers.users[0]);
    try {
      // 使用另外一个
      await user0.createGoldBlock(producer, location, weight, time, signature1);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Invalid signature'",
      );
    }
  });
}

export function deleteGold(): void {
  it("delete Success", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(producer, location, weight, time, signature1);
    expect((await connect.goldBlocks(1))[1]).to.equal(location); // 确保数据存在

    await connect.destroyGoldBlock(1);
    expect((await connect.goldBlocks(1))[1]).not.to.equal(location);
  });
}
