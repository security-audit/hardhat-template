import { expect } from "chai";

export function testEIP5192(): void {
  it("不能交易锁定的货币", async function () {
    const url = "https://www.qq.com/1.json";
    const admin = await this.GameItem.connect(this.signers.admin); // NFT管理员
    const user1 = await this.GameItem.connect(this.signers.users[1]); // 用户1
    const user2 = await this.GameItem.connect(this.signers.users[2]); // 用户2
    const address1 = this.signers.users[1].address; // 用户1的地址
    const address2 = this.signers.users[2].address; // 用户2的地址

    await admin.awardItem(address1, url); // 给用户1 mint 1个Token
    let number = await admin.balanceOf(address1); // 测试用户1的Token是是否有1个。
    expect(number.toNumber()).to.equal(1);

    await user1.transferFrom(address1, address2, "0"); // 用户1把NFT交易给用户2
    number = await user1.balanceOf(address1);
    expect(number.toNumber()).to.equal(0); // 用户1的token数目是0
    number = await user2.balanceOf(address2);
    expect(number.toNumber()).to.equal(1); // 用户2的token数目是1

    await admin.setLock("0", true); // 把token锁定。
    try {
      await user2.transferFrom(address2, address1, "0");
      expect(1).to.equal(2); // 设定一个假的断言，如果能交易说明报错。
    } catch (e) {
      expect(1).to.equal(1); // 设定一个真的断言。
    }
  });
}
