import "animate.css"
import { useState } from "react";

import useConnectWeb3 from "../backend/connectWeb3";
import { useAppSelector } from "../state/hooks";

import NavItem from './NavItem';
import WalletButton from "./WalletButton"
import SmallScreenToolbar from "./SmallScreenToolbar"
import WalletModal from "./WalletModal";
import NetworkButton from "./NetworkButton";
import { OptimizedImage } from "./General";


const Layout = ({ children }: any) => {
    const [openModal, setOpenModal] = useState(false)
    const { chainId } = useAppSelector(state => state.account)
    const { web3Provider, disconnectWallet } = useConnectWeb3();


    return (
        <>
            <div className="flex flex-col w-full h-full min-h-screen xl:h-screen pt-0 bg-grey-darkest overflow-auto">
                {openModal && <WalletModal onDismiss={() => setOpenModal(false)} />}

                {/* <div className="h-72 w-72 rounded-full border bg-gradient-to-br from-blue-500 to-pink-600 blur-3xl fixed top-0 left-0 xl:top-20 xl:left-0.15 2xl:left-0.125 opacity-80" />

                <div className="h-72 w-72 rounded-tl-full border bg-gradient-to-br from-blue-500 to-pink-600 blur-3xl fixed bottom-0 right-0 opacity-50" /> */}


                <SmallScreenToolbar onWalletClick={() => setOpenModal(true)} disconnectWallet={disconnectWallet} web3Provider={web3Provider} chainId={chainId} />

                <div className="hidden xl:flex space-x-10 w-full items-center justify-between p-5">
                    <a href="/" className="hover:scale-110 transition-all duration-500 ease-in-out ">
                        <OptimizedImage src="/images/mgh_logo.png" height={64} width={64} />
                    </a>

                    <div className="flex space-x-5 items-stretch">
                        {web3Provider && chainId && <NetworkButton provider={web3Provider.provider} chainId={chainId}/>}
                        <WalletButton onClick={() => setOpenModal(true)} disconnectWallet={disconnectWallet}/>
                    </div>
                </div>

                <div className="flex w-full justify-end flex-grow min-h-[10vh]">

                    <div className="hidden xl:flex h-full w-1/6 max-w-sm min-w-max flex-col items-start p-5 pt-16">
                        <div className="space-y-6 flex flex-col w-full">
                            <NavItem text="Home" link="/" />
                            <NavItem text="Swap" link="/swap" />
                            <NavItem text="Liquidity" link="/liquidity" />
                            <NavItem text="Stake" link="/stake" />
                            <NavItem text="NFT Pools" link="/pools" />
                            <NavItem text="LAND Valuation" link="/valuation" />
                        </div>
                    </div>

                    <main className="z-10 w-full h-full min-h-screen xl:min-h-full pt-16 xs:pt-16 sm:pt-20 md:pt-24 xl:pt-10 p-4 xs:p-6 sm:p-10 flex items-start justify-center flex-grow overflow-auto overscroll-auto animate-none xl:animate__animated animate__slideInRight border-t border-l border-white/0 xl:border-white/10 rounded-none xl:rounded-tl-3xl self-end bg-grey-dark bg-opacity-30 shadow-dark ">
                        {children}
                    </main>

                </div>

            </div>


        </>
    )
}


export default Layout
