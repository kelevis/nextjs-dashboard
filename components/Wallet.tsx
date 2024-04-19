import Link from "next/link";
import {useListen} from "../hooks/useListen";
import {useMetamask} from "../hooks/useMetamask";
import {Loading} from "./Loading";
import {ethers} from "ethers";
import * as config from "../config.js"
import React, { useState } from 'react';

// const handleClick = async () => {
//     setLoading(true);
//     try {
//         const signatureResult = await getSignature(config.myAddress1,3);
//         setSignature(signatureResult);
//     } catch (error) {
//         console.error('Error getting signature:', error);
//     } finally {
//         setLoading(false);
//     }
// };

export default function Wallet() {
    const {dispatch, state: {status, isMetamaskInstalled, wallet, balance},} = useMetamask();
    const listen = useListen();
    const showInstallMetamask = status !== "pageNotLoaded" && !isMetamaskInstalled;
    const showConnectButton = status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;
    const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";

    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [inputAddress, setInputAddress] = useState<string>('');
    const [inputTokenId, setInputTokenId] = useState<string>('');



    const getSignature = async (account: string, tokenId: bigint): Promise<string> => {
        const wallet = ethers.Wallet.fromPhrase(config.myMnemonic6)

        // const providerSepolia= new ethers.JsonRpcProvider(config.alchemy_Endpoints_Url_ethereum_sepolia)
        // const wallet = new ethers.Wallet(config.mylinkContractSepoliaPrivateKey, providerSepolia)

        // 创建消息  生成签名
        // const account = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
        // const tokenId = "0"
        // 等效于Solidity中的keccak256(abi.encodePacked(account, tokenId))
        const msgHash = ethers.solidityPackedKeccak256(['address', 'uint256'], [account, tokenId])
        console.log(`msgHash：${msgHash}`)

        // 签名
        const messageHashBytes = ethers.getBytes(msgHash)
        const signature = wallet.signMessage(messageHashBytes);
        console.log(`链下签名（相当于领货码）：${signature}`)

        return await signature
    };

    const handleAddUsdc = async () => {
        dispatch({type: "loading"});

        await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    symbol: "USDC",
                    decimals: 18,
                    image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=023",
                },
            },
        });
        dispatch({type: "idle"});
    };

    const handleConnect = async () => {
        dispatch({type: "loading"});
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
            console.log("已连接到 MetaMask");

            const balance = await window.ethereum!.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            });
            dispatch({type: "connect", wallet: accounts[0], balance});

            // we can register an event listener for changes to the users wallet
            listen();
        }
    };

    const handleDisconnect = () => {
        dispatch({type: "disconnect"});
    };

    const handleInputAddressChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setInputAddress(event.target.value); // 更新文本输入框的值
    };

    const handleInputTokenIdChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setInputTokenId(event.target.value); // 更新文本输入框的值
    };

    const handleGetSignature = async () => {
        try {
            const signatureResult = await getSignature(inputAddress,BigInt(inputTokenId)); // 调用 getSignature 函数，并传递文本输入框的值
            setSignature(signatureResult); // 更新签名结果
        } catch (error) {
            console.error('Error getting signature:', error);
        }
    };

    const handleContractWrite =async () => {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        // 获取当前钱包账户
        const signer = await browserProvider.getSigner()
        const account = await signer.getAddress();

        const balance = await browserProvider.getBalance(account);
        const contract = new ethers.Contract(config.myContractSepoliaSignNft, config.abiMyContractSepoliaSignNft, signer);

        console.log(`以太坊余额： ${ethers.formatUnits(balance)}`)

        try {
            console.log("safeMint inputTokenId:", BigInt(inputTokenId))
            console.log("safeMint tokenUrlImageJson ",config.tokenUrlImageJson)
            console.log("safeMint  signature",signature)

            const tx = await contract.safeMint(BigInt(inputTokenId), config.tokenUrlImageJson, signature)

            console.log("result tx:", tx.toString());

        } catch (error) {
            console.error("Error:", error);
        }

    };

    const handleContractWriteEth = async () => {

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        // 读取钱包地址  读取chainid    读取ETH余额
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const account = accounts[0]
        const {chainId} = await browserProvider.getNetwork()

        const signer = await browserProvider.getSigner()
        const balance = await browserProvider.getBalance(signer.getAddress());

        console.log(`钱包地址: ${account}`)
        console.log(`chainid: ${chainId}`)
        console.log(`以太坊余额： ${ethers.formatUnits(balance)}`)

        const contract = new ethers.Contract(config.myContractSepoliaSignNft, config.abiMyContractSepoliaSignNft, signer);

        try {
            // browserProvider.getSigner().then((signer) =>{
            //               await signer.sendTransaction({
            //                   to: "0xCe06B0A53b08C10fa508BF16D02bBdDc6961E3B3",
            //                   value: ethers.parseEther("0.000000001")
            //               });
            // })
            await signer.sendTransaction({
                to: "0xCe06B0A53b08C10fa508BF16D02bBdDc6961E3B3",
                value: ethers.parseEther("0.000000001")
            });

            //签名  信息
            browserProvider.getSigner().then((signer) => {
                signer.signMessage("我需要签名0007")
                console.log("r.address:", signer.address)
            });

            console.log("r.address:", signer.address)
            console.log("signer:",signer)

        } catch (error) {
            console.error("Error:", error);
        }

    };

    const handleContractRead = async () => {
        // 读取钱包地址
        // const accounts = await browserProvider.send("eth_requestAccounts", []);
        // const account = accounts[0]
        // 读取chainid

        // 获取当前钱包账户   读取ETH余额
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner()
        const account = await signer.getAddress();
        const balance = await browserProvider.getBalance(account);
        const {chainId} = await browserProvider.getNetwork()
        const contract = new ethers.Contract(config.myContractSepoliaSignNft, config.abiMyContractSepoliaSignNft, signer);
        console.log(`钱包地址: ${account}`)
        console.log(`chainid: ${chainId}`)
        console.log(`以太坊余额： ${ethers.formatUnits(balance)}`)

        try {
            // 调用合约方法
            const name = await contract.name()
            const maxSupply = await contract.maxSupply()
            console.log("name:", name);
            console.log("maxSupply:", maxSupply);

        } catch (error) {
            console.error("Error:", error);
        }

    };

    return (
        <div className="bg-truffle">
            <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    <span className="block">Metamask Api Invoke</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-white">
                    Follow along with the{" "}
                    <Link
                        href="https://github.com/GuiBibeau/web3-unleashed-demo"
                        target="_blank"
                    >
                        <span className="underline cursor-pointer">Repo</span>
                    </Link>{" "}
                    in order to learn how to use the Metamask API.
                </p>

                {wallet && balance && (
                    <div className=" px-4 py-5 sm:px-6">
                        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                            <div className="ml-4 mt-4">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <h1 className=" text-white">
                                            demo-Contract: 0xe0B07aAbDeA7bFd007399827D76e14F8A3722ad5
                                        </h1>
                                        <h2 className=" text-white">
                                            demo-Private: Ask the administrator                   .
                                        </h2>

                                        <h3 className="text-lg font-medium leading-6 text-white">
                                            Address: <span>{wallet}</span>
                                        </h3>
                                        <p className="text-sm text-white">
                                            Balance:{" "}
                                            <span>
                        {(parseInt(balance) / 1000000000000000000).toFixed(4)}{" "}
                                                ETH
                      </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showConnectButton && (
                    <button
                        onClick={handleConnect}
                        className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                    >
                        {status === "loading" ? <Loading/> : "Connect Wallet"}
                    </button>
                )}

                {showInstallMetamask && (
                    <Link
                        href="https://metamask.io/"
                        target="_blank"
                        className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                    >
                        Install Metamask
                    </Link>
                )}

                {isConnected && (
                    <div className="flex  w-full justify-center space-x-2">
                        <h1>数字签名输入</h1>
                        {/* 输入框 */}
                        <input
                            type="text"
                            value={inputAddress}
                            onChange={handleInputAddressChange}
                            placeholder="address"
                        />

                        <input
                            type="text"
                            value={inputTokenId}
                            onChange={handleInputTokenIdChange}
                            placeholder="tokenId"
                        />

                    </div>
                )}

                {isConnected && (
                    <div className="flex  w-full justify-center space-x-2">
                        <button
                            onClick={handleGetSignature}
                            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                        >
                            {status === "loading" ? <Loading/> : "get Signature"}
                        </button>


                    </div>
                )}

                {isConnected && (
                    <div className="flex  w-full justify-center space-x-2">
                        {/* 显示签名结果 */}
                        {signature && (
                            <div className="mt-4">
                                {/*<h2 className="text-lg font-medium leading-6 text-white">Signature:</h2>*/}
                                {/*<h3 className="text-lg font-medium leading-6 text-white">*/}
                                {/*    <span><text>{signature}</text></span>*/}
                                {/*</h3>*/}
                                <h2 >Signature:
                                    <textarea
                                        className="p-2 rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        rows={2} // 设置行数为 5，高度适中
                                        cols={100} // 设置列数为 50，显示为横向长条
                                        value={signature}
                                    />
                                </h2>



                            </div>
                        )}

                    </div>
                )}

                {isConnected && (
                    <div className="flex  w-full justify-center space-x-2">
                        <button
                            onClick={handleContractWrite}
                            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                        >
                            {status === "loading" ? <Loading/> : "invoke Contract"}
                        </button>

                    </div>
                )}

                {isConnected && (
                    <div className="flex  w-full justify-center space-x-2">
                        <button
                            onClick={handleAddUsdc}
                            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                        >
                            {status === "loading" ? <Loading/> : "Add Token"}
                        </button>

                        <button
                            onClick={handleDisconnect}
                            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                        >
                            Disconnect
                        </button>
                    </div>
                )}


            </div>
        </div>
    );
}



