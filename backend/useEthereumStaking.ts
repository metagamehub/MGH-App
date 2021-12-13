import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { formatEther } from "@ethersproject/units"

import { Chains } from "../lib/chains"

import { getPeriodInfo, getStakeAmount, getMGHBalance } from "./ethereumStaking"


export default function useEthereumStaking(web3Provider: ethers.providers.Web3Provider | undefined, address: string | undefined, chainId: number | undefined, poolId: number) {

    const [MGHBalance, setMGHBalance] = useState("")
    const [totalStaked, setTotalStaked] = useState("0")

    const [isTransferPhase, setIsTransferPhase] = useState(false)
    const [depositDuration, setDepositDuration] = useState<number | undefined>()
    const [timeUntilDeposit, setTimeUntilDeposit] = useState<number | undefined>()

    const [loading, setLoading] = useState(true)

    const calcDepositDuration = (startOfDeposit: number) => {
        const endOfDeposit = startOfDeposit + 604800 // 7 days
        const timestampNow = new Date().getTime() / 1000
        const despositDuration = Math.floor((endOfDeposit - timestampNow) / 3600)
        return despositDuration
    }

    const calcTimeUntilDeposit = (startOfDeposit: number) => {
        //if depositDuration < 1: countdown in minutes
        const timestampNow = new Date().getTime() / 1000
        const despositDuration = Math.floor((startOfDeposit - timestampNow) / (3600 * 24))
        return despositDuration
    }

    useEffect(() => {
        let active = true

        const setStates = async () => {
            let totalStaked = "0"
            let balance = "";
            let depositDuration;
            let timeUntilDeposit;

            const { isTransferPhase, startOfDeposit } = await getPeriodInfo(web3Provider, chainId, poolId)


            if (isTransferPhase) {
                depositDuration = calcDepositDuration(startOfDeposit)
            } else if (startOfDeposit > new Date().getTime() / 1000) {
                timeUntilDeposit = calcTimeUntilDeposit(startOfDeposit)
            }

            if (web3Provider && address && chainId === Chains.ETHEREUM_RINKEBY.chainId) {
                balance = formatEther(await getMGHBalance(web3Provider, address))
                totalStaked = formatEther(await getStakeAmount(web3Provider, address, poolId, isTransferPhase))
            }

            return { totalStaked, balance, isTransferPhase, depositDuration, timeUntilDeposit }
        }

        setStates().then(({ totalStaked, balance, isTransferPhase, depositDuration, timeUntilDeposit }) => {
            if (active) {
                setTotalStaked(totalStaked)
                setMGHBalance(balance)
                setIsTransferPhase(isTransferPhase)
                setDepositDuration(depositDuration)
                setTimeUntilDeposit(timeUntilDeposit)
                setLoading(false)
            }
        })

        return () => { active = false; setLoading(true) }

    }, [web3Provider, address, chainId, poolId])


    return { totalStaked, MGHBalance, isTransferPhase, depositDuration, timeUntilDeposit, loading }
}