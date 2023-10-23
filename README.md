# Hardhat Template [![Open in Gitpod][gitpod-badge]][gitpod] [![Github Actions][gha-badge]][gha] [![Hardhat][hardhat-badge]][hardhat] [![License: MIT][license-badge]][license]

[gitpod]: https://gitpod.io/#https://github.com/JimYan/hardhat-template
[gitpod-badge]: https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-FFB45B?logo=gitpod
[gha]: https://github.com/JimYan/hardhat-template/actions
[gha-badge]: https://github.com/JimYan/hardhat-template/actions/workflows/ci.yml/badge.svg
[hardhat]: https://hardhat.org/
[hardhat-badge]: https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

A Hardhat-based template for developing Solidity smart contracts, with sensible defaults.

- [Hardhat](https://github.com/nomiclabs/hardhat): compile, run and test smart contracts
- [TypeChain](https://github.com/ethereum-ts/TypeChain): generate TypeScript bindings for smart contracts
- [Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation
- [Solhint](https://github.com/protofire/solhint): code linter
- [Solcover](https://github.com/sc-forks/solidity-coverage): code coverage
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter

## Getting Started

Click the [`Use this template`](https://github.com/paulrberg/hardhat-template/generate) button at the top of the page to
create a new repository with this repo as the initial state.

## Features

This template builds upon the frameworks and libraries mentioned above, so for details about their specific features,
please consult their respective documentations.

For example, for Hardhat, you can refer to the [Hardhat Tutorial](https://hardhat.org/tutorial) and the
[Hardhat Docs](https://hardhat.org/docs). You might be in particular interested in reading the
[Testing Contracts](https://hardhat.org/tutorial/testing-contracts) section.

### Sensible Defaults

This template comes with sensible default configurations in the following files:

```text
├── .editorconfig
├── .eslintignore
├── .eslintrc.yml
├── .gitignore
├── .prettierignore
├── .prettierrc.yml
├── .solcover.js
├── .solhint.json
├── .yarnrc.yml
└── hardhat.config.ts
```

### GitHub Actions

This template comes with GitHub Actions pre-configured. Your contracts will be linted and tested on every push and pull
request made to the `main` branch.

Note though that to make this work, you must use your `INFURA_API_KEY` and your `MNEMONIC` as GitHub secrets.

You can edit the CI script in [.github/workflows/ci.yml](./.github/workflows/ci.yml).

## Usage

### Pre Requisites

Before being able to run any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an
environment variable. You can follow the example in `.env.example`. If you don't already have a mnemonic, you can use
this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain bindings:

```sh
$ yarn typechain
```

### build

Compile & TypeChain

```sh
$ yarn build
```

### Test

Run the tests with Hardhat:

```sh
$ yarn test
```

Run the tests with special block chain

```sh
$ npx hardhat test --network localhost path/to/file
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ yarn deploy --greeting "Bonjour, le monde!"
$ npx hardhat deploy:GameItem --network polygon-mumbai
$ npx hardhat deploy:GameItem --network bscTestnet
# 部署合约
$ npx hardhat deploy:gold --network localhost
# 升级合约
$ npx hardhat upgrades:gold --network localhost
```

### Verify

```bash
$npx hardhat verify --contract "contracts/GameItem.sol:GameItem" 0x055AA93F9509e106544AF5D8872E0708831d83E9 --network polygon-mumbai
$npx hardhat verify --contract "contracts/GameItem.sol:GameItem" 0xbF24351D0a0578aFD74e44Fa1020A6641142A50B --network bscTestnet
$npx hardhat verify --contract "contracts/core/EntryPoint.sol:EntryPoint" 0x0576a174D229E3cFA37253523E645A78A0C91B57

$npx hardhat verify --contract "contracts/GoldTraceability.sol:GoldTraceability" 0xEa91fc883182e98b1d6c1f0d7705b3ECEAF76522 --network polygon-mumbai
```

## Tips

### Syntax Highlighting

If you use VSCode, you can get Solidity syntax highlighting with the
[hardhat-solidity](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity) extension.

## Using GitPod

[GitPod](https://www.gitpod.io/) is an open-source developer platform for remote development.

To view the coverage report generated by `yarn coverage`, just click `Go Live` from the status bar to turn the server
on/off.

## 常用命令

```sh
mkdir .scan
# step1. solhint扫描
npx solhint contracts/GoldTraceability.sol > .scan/solhint.log

# step2.0 slither扫描
slither contracts/GoldTraceability.sol --config-file slither.config.json --json .scan/.slither.json

# step2.1 slither打印变量信息
slither contracts/GoldTraceability.sol --config-file slither.config.json --print variable-order

# step2.1 slither打印函数信息
slither contracts/GoldTraceability.sol --config-file slither.config.json --print function-summary
slither contracts/GoldTraceability.sol --config-file slither.config.json --print function-id

# step2.2 slither打印修饰器信息
slither contracts/GoldTraceability.sol --config-file slither.config.json --print modifiers

# step2.3 打印函数集成和调用关系
slither contracts/GoldTraceability.sol --config-file slither.config.json --print inheritance
slither contracts/GoldTraceability.sol --config-file slither.config.json --print call-graph

# step2.4 打印权限控制信息
slither contracts/GoldTraceability.sol --config-file slither.config.json --print require
slither contracts/GoldTraceability.sol --config-file slither.config.json --print vars-and-auth

# step3 mythril扫描
myth a  --execution-timeout 30 -t 10 --solc-json config/mythril.config.json contracts/GoldTraceability.sol
slither-find-paths contracts/GoldTraceability.sol GoldTraceability.createGoldBlock --solc-remaps "@=node_modules/@"


# 其他
# 是否符合ERC规范
slither-check-erc  contracts/GoldTraceability.sol GoldTraceability --solc-remaps "@=node_modules/@" --erc erc20
# 查找函数调用链路
slither-find-paths contracts/GoldTraceability.sol  ArrayUtils.removeValue --solc-remaps "@=node_modules/@"

```

## License

[MIT](./LICENSE.md) © Paul Razvan Berg
