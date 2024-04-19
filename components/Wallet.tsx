import Link from "next/link";
import {useListen} from "../hooks/useListen";
import {useMetamask} from "../hooks/useMetamask";
import {Loading} from "./Loading";
import {ethers} from "ethers";
import * as config from "../config.js"

export default function Wallet() {
  const {
    dispatch,
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();
  const listen = useListen();

  const showInstallMetamask =
    status !== "pageNotLoaded" && !isMetamaskInstalled;
  const showConnectButton =
    status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

  const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";

  // 创建以太坊提供者
  //Ethers 版本 V5
  // const provider = new ethers.providers.Web3Provider(window.ethereum);

  //Ethers 版本 V6
  // const provider = new ethers.BrowserProvider(window.ethereum)

  // const providerSepolia = new ethers.JsonRpcProvider(config.alchemy_Endpoints_Url_ethereum_sepolia)

// 调用合约的方法并发送交易
//   const callContractMethod = async () => {
//
//     if (typeof window !== 'undefined') {
//       console.log("window !== 'undefined")
//
//       const provider = new ethers.BrowserProvider(window.ethereum)
//
//       const signer = provider.getSigner();
//       const { Contract } = ethers;
//
//       // 创建合约实例，需要合约地址和 ABI（接口）定义
//       const contractAddress = config.myContractSepoliaSignNft
//       const abi = config.abiMyContractSepoliaSignNft;
//       const contract = new Contract(contractAddress, abi, provider.getSigner());
//       try {
//         // 调用合约方法，这里假设合约有一个名为 doSomething 的方法
//         const result = await contract.getAddress;
//         console.log("合约方法调用结果:", result);
//       } catch (error) {
//         console.error("调用合约方法时出错:", error);
//       }
//
//
//
//     }
//
//
//   };

// // 在应用程序加载时连接 MetaMask 并调用合约方法
//   window.addEventListener("load", async () => {
//     await connectToMetaMask();
//     await callContractMethod();
//   });



// 创建合约实例


  const callContractMethod = async () => {

    // let ethereum = (window as any).ethereum;
    // const provider = new ethers.BrowserProvider(ethereum)
    // // let provider = new BrowserProvider(ethereum);
    // provider.getSigner().then((signer) => {
    //   signer.signMessage("我需要签名0007")
    //   console.log("r.address:", signer.address)
    // });

    // try {
    //   let ethereum = (window as any).ethereum;
    //   const provider = new ethers.BrowserProvider(ethereum);
    //   const signer = await provider.getSigner();
    //   const signature = await signer.signMessage("我需要签名0007");
    //   console.log("Signature:", signature);
    //   console.log("Signer address:", signer.address);
    // } catch (error) {
    //   console.error("Error:", error);
    // }

    // provider.getSigner().then((signer) =>{
    //   console.log("r.address:", signer.address)
    //   signer.sendTransaction({
    //     to: "0xCe06B0A53b08C10fa508BF16D02bBdDc6961E3B3",
    //     value: ethers.parseEther("0.000000001")
    //   });
    // })

    // console.log("signer:",signer)

    // // 创建合约实例，需要合约地址和 ABI（接口）定义
    //   const contractAddress = config.myContractSepoliaSignNft
    //   const abi = config.abiMyContractSepoliaSignNft;
    //   const contract = new ethers.Contract(contractAddress, abi, signer);
    //

    let ethereum = (window as any).ethereum;
    const browserProvider = new ethers.BrowserProvider(ethereum);
    const contract = new ethers.Contract(config.myContractSepoliaSignNft, config.abiMyContractSepoliaSignNft, browserProvider);

    try {
      //  签名1
      // const signatureSignMessage = await signer.signMessage("我需要签名0007");
      // console.log("signatureMessage:", signatureSignMessage);
      // console.log("Signer address:", signer.address);


      // 签名2
      // const signatureSendTransaction = await signer.sendTransaction({
      //   to: config.myAddress2,
      //   value: ethers.parseEther("0.01")
      // });
      //
      // console.log("signatureTransaction:", signatureSendTransaction);
      // console.log("provider:", browserProvider);

      // 获取当前钱包账户
      const signer = await browserProvider.getSigner();
      const account = await signer.getAddress();
      console.log("Signer address:", signer.address);
      console.log("account :", account );

      // 调用合约方法
      // const name = await contract.name()
      // const maxSupply = await contract.maxSupply()
      // console.log("name:", name);
      // console.log("maxSupply:", maxSupply);

      const tx = await contract.safeMint(config.myAddress1, 19, config.tokenUrlImageJson)
      const call = await signer.call(tx)


      console.log("tx:", call);


      // 等待交易确认
      // await tx.wait();
      // console.log("Transaction confirmed");

      // 获取合约状态或结果
      // const result = await contract.getEvent;
      // console.log("Result:", result);

    } catch (error) {
      console.error("Error:", error);
    }

  };

  const handleConnect = async () => {
    dispatch({ type: "loading" });
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      console.log("已连接到 MetaMask");

      const balance = await window.ethereum!.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });
      dispatch({ type: "connect", wallet: accounts[0], balance });

      // we can register an event listener for changes to the users wallet
      listen();
    }
  };

  const handleDisconnect = () => {
    dispatch({ type: "disconnect" });
  };

  const handleAddUsdc = async () => {
    dispatch({ type: "loading" });

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
    dispatch({ type: "idle" });
  };

  const handleInvokeContract = async () => {
    dispatch({ type: "loading" });

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
    dispatch({ type: "idle" });
  };

  return (
    <div className="bg-truffle">
      <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="block">Metamask API intro</span>
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
            {status === "loading" ? <Loading /> : "Connect Wallet"}
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
            <button
              onClick={handleAddUsdc}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              {status === "loading" ? <Loading /> : "Add Token"}
            </button>

            <button
                onClick={callContractMethod}
                className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              {status === "loading" ? <Loading /> : "invoke Contract"}
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



