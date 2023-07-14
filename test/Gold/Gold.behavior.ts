import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import { expect } from "chai";

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

const producer = strToHex("AB");
const location = strToHex("shenzhen");
const weight = 100;
const time = new Date().getTime();
const id = strToHex("ABCDEFGH");
const parentId = [0];
const type = 0;

const signHash = getMessageBytes(id, producer, location, weight, time, parentId, type); // 对签名数据进行转换

export function create(): void {
  it("add Success -- 新增区块", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
    const gold = await connect.goldBlocks(1);
    expect(gold[1]).to.equal(producer);
  });

  it("add Success -- 新增工艺品", async function () {
    const parentId = [1, 2, 3];
    const type = 1;
    const signHash = getMessageBytes(id, producer, location, weight, time, parentId, type); // 对签名数据进行转换
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
    const gold = await connect.goldBlocks(1);
    expect(gold[1]).to.equal(producer);

    const parentIds = await connect.getParentIds(1);
    expect(parentIds[0]).to.equal(1);
    expect(parentIds.length).to.equal(3);
  });

  it("add Fail -- 重复提交", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
    try {
      await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'ID already used'",
      );
    }
  });

  it("add Fail -- 签名失败", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    try {
      // 故意签名不过。
      await connect.createGoldBlock(id, producer, location, weight + 1, time, parentId, type, signature1);

      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'Invalid signature'",
      );
    }
  });

  it("add Fail -- 使用他人签名提交数据", async function () {
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    const user0 = await this.GoldTraceability.connect(this.signers.users[0]);
    try {
      // 使用另外一个
      await user0.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'Invalid signature'",
      );
    }
  });
}

export function queryGold(): void {
  it("query Success", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);

    const list = await connect.getGoldBlocksByOwner(this.signers.admin.address);
    expect(list.length).to.equal(1);
    const info = await connect.goldBlocks(list[0]);
    expect(info[2]).to.equal(location);
    expect(info[3]).to.equal(weight);
  });
}

export function deleteGold(): void {
  it("delete Success", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash); // 签名
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);
    expect((await connect.goldBlocks(1))[2]).to.equal(location); // 确保数据存在

    await connect.destroyGoldBlock(1);
    expect((await connect.goldBlocks(1))[2]).not.to.equal(location);
  });
}

export function transaction(): void {
  it("transaction Success", async function () {
    // 生成一个区块
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash);
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);

    // 确保区块在。
    const list = await connect.getGoldBlocksByOwner(this.signers.admin.address);
    expect(list.length).to.equal(1);
    const blockId = list[0];

    const to = this.signers.users[0].address;
    await connect.transferGoldBlock(blockId, to); // 转移区块给to
    const info = await connect.goldBlocks(blockId);
    expect(info[5]).to.equal(to);
  });

  it("transaction -- 区块授权交易", async function () {
    // 生成一个区块
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash);
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);

    const user0 = this.signers.users[0].address;
    const connectUser0 = await this.GoldTraceability.connect(this.signers.users[0]);
    await connect.grantAccess(1, [user0]); // 授权user0

    // 通过授权的用户进行转移
    const to = this.signers.users[1].address;
    await connectUser0.transferGoldBlock(1, to); // 转移区块给to
    const info = await connect.goldBlocks(1);
    expect(info[5]).to.equal(to);

    try {
      await connect.transferGoldBlock(1, to); // 再次转移
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'Not authorized'",
      );
    }
  });

  it("transaction Fail -- 区块不存在", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    // const signature1 = await this.signers.admin.signMessage(signHash);
    // await connect.createGoldBlock(producer, location, weight, time, signature1);
    const to = this.signers.users[0].address;
    try {
      await connect.transferGoldBlock(1, to);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'Gold block does not exist'",
      );
    }
  });

  it("transaction Fail -- 区块不属于自己", async function () {
    const connect = await this.GoldTraceability.connect(this.signers.admin);
    const signature1 = await this.signers.admin.signMessage(signHash);
    await connect.createGoldBlock(id, producer, location, weight, time, parentId, type, signature1);

    const to = this.signers.users[0].address;
    const user0 = await this.GoldTraceability.connect(this.signers.users[0]);
    try {
      await user0.transferGoldBlock(1, to);
      expect(true).to.equal(false);
    } catch (e: any) {
      expect(e.message).to.contain(
        "VM Exception while processing transaction: reverted with reason string 'Not authorized'",
      );
    }
  });
}
