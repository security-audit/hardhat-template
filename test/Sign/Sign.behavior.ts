// import { keccak256 } from "@ethersproject/keccak256";
import { arrayify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { expect } from "chai";

const strToHex = (str: string): string => {
  return "0x" + Buffer.from(str, "utf8").toString("hex");
};

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

  it("test bytes", async function () {
    const a = "abc";
    const buf = toUtf8Bytes(a); // abc转成字节，字母==>ASCII码，ASCII用uint8(0-255)表示。uint8就是一个字节8个bit的十进制表示
    // console.log(buf); // buf是一个Uint8Array，所以合约中的bytes类型就是uint8[]，也就是一个字节数组. 0x616263
    const connect = await this.Sign.connect(this.signers.admin);
    const b = await connect.setBytes(buf);
    expect(toUtf8String(b)).to.equal(a);
    // b.toString;
  });

  it("test bytes3 -- buf", async function () {
    const a = "abc";
    const buf = toUtf8Bytes(a); // abc转成字节，字母==>ASCII码，ASCII用uint8(0-255)表示。uint8就是一个字节8个bit的十进制表示
    // console.log(buf); // buf是一个Uint8Array，所以合约中的bytes类型就是uint8[]，也就是一个字节数组. 0x616263
    const connect = await this.Sign.connect(this.signers.admin);
    const b = await connect.setBytes3(buf);
    expect(toUtf8String(b)).to.equal(a);
  });

  it("test bytes3 -- hex", async function () {
    const a = "abc";
    const connect = await this.Sign.connect(this.signers.admin);
    const hex = strToHex(a);
    const c = await connect.setBytes3(hex);
    expect(toUtf8String(c)).to.equal(a);
    // b.toString;
  });

  it("test getTime", async function () {
    const connect = await this.Sign.connect(this.signers.admin);
    const b = await connect.getTime();
    expect(b[0]).to.equal(2);
    expect(b[1]).to.equal(61);
    expect(b[2]).to.equal(3601);
  });

  it("test bool", async function () {
    const connect = await this.Sign.connect(this.signers.admin);
    const b = await connect.getBool(true);
    expect(b).to.equal(false);
  });

  it("test emun", async function () {
    const connect = await this.Sign.connect(this.signers.admin);
    const b = await connect.getGoldType();
    expect(b).to.equal(0);
  });
}
