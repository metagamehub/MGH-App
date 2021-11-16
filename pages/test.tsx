import WalletConnectProvider from '@walletconnect/web3-provider'
import Fortmatic from "fortmatic";
import { providers } from 'ethers'
import Head from 'next/head'
import { useCallback, useEffect, useReducer } from 'react'
import Web3Modal from 'web3modal'
// import { ellipseAddress, getChainData } from '../lib/utilities'

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
            infuraId: INFURA_ID, // required
        },
    },
    fortmatic: {
        package: Fortmatic,
        options: {
            // Mikko's TESTNET api key
            key: "pk_test_391E26A3B43A3350"
        }
    }
}

let web3Modal: Web3Modal;
if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
        network: 'mainnet', // optional
        cacheProvider: false,
        providerOptions, // required
        theme: "dark",
    })
}

type StateType = {
    provider?: any
    web3Provider?: any
    address?: string
    chainId?: number
}

type ActionType =
    | {
        type: 'SET_WEB3_PROVIDER'
        provider?: StateType['provider']
        web3Provider?: StateType['web3Provider']
        address?: StateType['address']
        chainId?: StateType['chainId']
    }
    | {
        type: 'SET_ADDRESS'
        address?: StateType['address']
    }
    | {
        type: 'SET_CHAIN_ID'
        chainId?: StateType['chainId']
    }
    | {
        type: 'RESET_WEB3_PROVIDER'
    }

const initialState: StateType = {
    provider: null,
    web3Provider: null,
    address: undefined,
    chainId: undefined,
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        case 'SET_WEB3_PROVIDER':
            return {
                ...state,
                provider: action.provider,
                web3Provider: action.web3Provider,
                address: action.address,
                chainId: action.chainId,
            }
        case 'SET_ADDRESS':
            return {
                ...state,
                address: action.address,
            }
        case 'SET_CHAIN_ID':
            return {
                ...state,
                chainId: action.chainId,
            }
        case 'RESET_WEB3_PROVIDER':
            return initialState
        default:
            throw new Error()
    }
}

export const Home = (): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { provider, web3Provider, address, chainId } = state

    const connect = useCallback(async function () {
        // This is the initial `provider` that is returned when
        // using web3Modal to connect. Can be MetaMask or WalletConnect.
        web3Modal.clearCachedProvider()
        const provider = await web3Modal.connect()

        // We plug the initial `provider` into ethers.js and get back
        // a Web3Provider. This will add on methods from ethers.js and
        // event listeners such as `.on()` will be different.
        const web3Provider = new providers.Web3Provider(provider)

        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()

        const network = await web3Provider.getNetwork()

        dispatch({
            type: 'SET_WEB3_PROVIDER',
            provider,
            web3Provider,
            address,
            chainId: network.chainId,
        })
    }, [])

    const disconnect = useCallback(
        async function () {
            await web3Modal.clearCachedProvider()
            if (provider?.disconnect && typeof provider.disconnect === 'function') {
                await provider.disconnect()
            }
            dispatch({
                type: 'RESET_WEB3_PROVIDER',
            })
        },
        [provider]
    )

    // Auto connect to the cached provider
    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connect()
        }
    }, [connect])

    // A `provider` should come with EIP-1193 events. We'll listen for those events
    // here so that when a user switches accounts or networks, we can update the
    // local React state with that new information.
    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = (accounts: string[]) => {
                // eslint-disable-next-line no-console
                console.log('accountsChanged', accounts)
                dispatch({
                    type: 'SET_ADDRESS',
                    address: accounts[0],
                })
            }

            // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
            const handleChainChanged = (_hexChainId: string) => {
                window.location.reload()
            }

            const handleDisconnect = (error: { code: number; message: string }) => {
                // eslint-disable-next-line no-console
                console.log('disconnect', error)
                disconnect()
            }

            provider.on('accountsChanged', handleAccountsChanged)
            provider.on('chainChanged', handleChainChanged)
            provider.on('disconnect', handleDisconnect)

            // Subscription Cleanup
            return () => {
                if (provider.removeListener) {
                    provider.removeListener('accountsChanged', handleAccountsChanged)
                    provider.removeListener('chainChanged', handleChainChanged)
                    provider.removeListener('disconnect', handleDisconnect)
                }
            }
        }
    }, [provider, disconnect])

    //   const chainData = getChainData(chainId)

    return (
        <div className="container">
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header>
                {address && (
                    <div className="grid">
                        <div>
                            <p className="mb-1">Network:</p>
                            {/* <p>{chainData?.name}</p> */}
                        </div>
                        <div>
                            <p className="mb-1">Address:</p>
                            {/* <p>{ellipseAddress(address)}</p> */}
                        </div>
                    </div>
                )}
            </header>

            <main className="border z-50">
                <h1 className="title">Web3Modal Example</h1>
                {web3Provider ? (
                    <button className="button" type="button" onClick={disconnect}>
                        Disconnect
                    </button>
                ) : (
                    <button className="button" type="button" onClick={connect}>
                        Connect
                    </button>
                )}
            </main>

        </div>
    )
}

export default Home