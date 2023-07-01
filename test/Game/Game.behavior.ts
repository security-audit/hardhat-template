import { expect } from "chai";

export function shouldBehaveLikeGreeter(): void {
  it("should return the new greeting once it's changed", async function () {
    // console.log(this.signers);
    expect(await this.GameItem.connect(this.signers.admin).name()).to.equal("GameItem");
    expect(await this.GameItem.connect(this.signers.admin).symbol()).to.equal("ITM");
  });

  it("should owner 1", async function () {
    // console.log(this.signers);
    const url = "https://www.qq.com/1.json";
    const url2 = "https://www.qq.com/12.json";
    const address = this.signers.users[0].address;
    const connect = this.GameItem.connect(this.signers.admin);
    await connect.awardItem(address, url);
    await connect.awardItem(address, url2);
    const number = await connect.balanceOf(address);
    expect(number.toNumber()).to.equal(2);

    expect(await connect.ownerOf("1")).equal(this.signers.users[0].address);
  });

  it("transfer token ID 1 to user 2", async function () {
    const url = "https://www.qq.com/1.json";
    const url2 = "https://www.qq.com/12.json";
    const address = this.signers.users[0].address;
    const address2 = this.signers.users[1].address;
    const connect = this.GameItem.connect(this.signers.admin);
    await connect.awardItem(address, url);
    await connect.awardItem(address, url2);
    const number = await connect.balanceOf(address);
    expect(number.toNumber()).to.equal(2);

    await this.GameItem.connect(this.signers.users[0]).transferFrom(address, address2, "1");
    const number2 = await connect.balanceOf(address2);
    expect(number2.toNumber()).to.equal(1);
  });

  it("不允许非管理员Mint", async function () {
    const url = "https://www.qq.com/1.json";
    const address = this.signers.users[0].address;
    try {
      const connect = this.GameItem.connect(this.signers.users[0]);
      await connect.awardItem(address, url);
      expect(true).to.equal(false);
    } catch (e) {
      expect(e instanceof Error).to.equal(true);
    }
  });

  it("获取当前的count", async function () {
    const connect = this.GameItem.connect(this.signers.admin);
    const url = "https://www.qq.com/1.json";
    const address = this.signers.users[0].address;
    await connect.awardItem(address, url);

    try {
      await this.GameItem.connect(this.signers.users[0]).getTokenIds();
      expect(true).to.equal(false);
    } catch (e) {
      expect(e instanceof Error).to.equal(true);
    }
  });
}
