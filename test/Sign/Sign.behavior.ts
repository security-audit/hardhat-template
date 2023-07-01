// import { keccak256 } from "@ethersproject/keccak256";
import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import { expect } from "chai";

function toEthSignedMessageHash(str: string): string {
  const message = keccak256(["string"], [str]);
  const preFix = keccak256(["string", "bytes32"], ["\x19Ethereum Signed Message:\n32", message]);
  return preFix;
}

function getMessageBytes(str: string, str2: string): Uint8Array {
  const message = keccak256(["string", "string"], [str, str2]);
  return arrayify(message);
}

export function ping(): void {
  it("init", async function () {
    expect(await this.Sign.connect(this.signers.admin).greet()).to.equal("asdf");
  });

  it("check hash", async function () {
    const str = "0x1bf2c0ce4546651a1a2feb457b39d891a6b83931cc2454434f39961345ac378c"; // 签名原始数据 也可以是一个字符串
    const preFix = toEthSignedMessageHash(str); // 转换成ether标准的签名数据

    const hash = await this.Sign.connect(this.signers.admin).getEtherSignHash(str); // 从合约中获取签名数据
    // console.log(preFix, hash);
    expect(hash).to.equal(preFix);
  });

  it("check encode", async function () {
    const str = "asdf"; // 签名原始数据
    const message = keccak256(["string"], [str]);
    const encode = await this.Sign.connect(this.signers.admin).encode(str);
    // console.log(preFix, encode);
    expect(encode).to.equal(message);
  });

  it("check sign", async function () {
    const str = "abc"; // 签名原始数据
    const str2 = "def";
    const signHash = getMessageBytes(str, str2); // 对签名数据进行转换
    const signature1 = await this.signers.admin.signMessage(signHash); // 获取签名
    const signer1 = await this.Sign.connect(this.signers.admin).checkAddress(str, str2, signature1);
    expect(signer1).to.equal(await this.signers.admin.getAddress());
  });
}
