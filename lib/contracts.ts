import { Interface } from "ethers/lib/utils"

import stakingAbiMaticTestnet from "../backend/abi/stakingAbiMaticTestnet.json"
import tokenAbiMaticTestnet from "../backend/abi/tokenAbiMaticTestnet.json"
import stakingAbiMaticMainnet from "../backend/abi/stakingAbiMaticMainnet.json"
import tokenAbiMaticMainnet from "../backend/abi/tokenAbiMaticMainnet.json"

import tokenAbiETHRinkeby from "../backend/abi/tokenAbiETHRinkeby.json"
import stakingAbiETHRinkeby from "../backend/abi/stakingAbiETHRinkeby.json"


export const Contracts = {
    MGH_TOKEN: {
        MATIC_TESTNET: {
            address: "0xA26fcc9847F24C7D78f4e77Ba39A37B8A9eaFB02",
            abi: new Interface(tokenAbiMaticTestnet)
        },
        MATIC_MAINNET: {
            address: "0xc3C604F1943B8C619c5D65cd11A876e9C8eDCF10",
            abi: new Interface(tokenAbiMaticMainnet)
        },
        ETHEREUM_MAINNET: {
            address: "0x8765b1a0eb57ca49be7eacd35b24a574d0203656",
            abi: undefined
        },
        ETHEREUM_RINKEBY: {
            address: "0xe72bcCFCAbc7B62548d774D8F0208d1673454aC1",
            abi: new Interface(tokenAbiETHRinkeby)
        }
    },
    MGH_STAKING: {
        MATIC_TESTNET: {
            address: "0x7d267713502F979ffE3c49622fd0DC24d6D607D0",
            abi: new Interface(stakingAbiMaticTestnet)
        },
        MATIC_MAINNET: {
            address: "0xb2Cc21271f2D3Ac2Aaaffa8Ed2F40fDe1C63d894",
            abi: new Interface(stakingAbiMaticMainnet)
        },
        ETHEREUM_RINKEBY: {
            address: "0x23D2CeEb18486057AC642050fB09AE37F3C5AA58",
            abi: new Interface(stakingAbiETHRinkeby)
        }
    }

}