import {library} from "@fortawesome/fontawesome-svg-core";
import {fab} from "@fortawesome/free-brands-svg-icons";
import {fas} from '@fortawesome/free-solid-svg-icons';
import {
  faCheckSquare,
  faCoffee,
  faRightToBracket,
  faWallet,
  faBars,
  faCircleXmark,
  faXmark,
  faUser,
  faUserCircle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Dashboard from "pages/dashboard";
import Staking from "pages/staking";
import StakingV2 from "pages/stakingV2";
import Projects from "pages/projects";
import Team from "pages/team";
import Admin from "pages/admin";
import BloodshedReveal from "pages/presale/bloodshed_reveal";
import Zero2Infinity from "pages/projects/Zero2Infinity";
import EstarGames from "pages/projects/EstarGames";
import VestaXFinance from "pages/projects/VestaXFinance";
import XBid from "pages/projects/xBid";
import Farm from "pages/farm";
import {DappProvider} from "@multiversx/sdk-dapp/wrappers/DappProvider";
import {
  NotificationModal,
  SignTransactionsModals,
  TransactionsToastList,
} from "@multiversx/sdk-dapp/UI";
import {networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import Layout from "layout/layout";
import Bloodshed_lottery from "pages/presale/bloodshed_lottery";
import {NosferatuMint} from "pages/nosferatu/NosferatuMint";
import {SnakeMint} from "pages/snakeSale/SnakeMint";
import {VestaxBronzeMint} from "pages/snakeSale/VestaxBronzeMint";
import MidasChain from "pages/presale/midas_chain";
import CodingDivisionMint from "pages/presale/coding_division_mint";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks/account";

library.add(
  fab,
  faCheckSquare,
  faCoffee,
  faRightToBracket,
  faWallet,
  faBars,
  faCircleXmark,
  faXmark,
  faUser,
  faUserCircle,
  faCheck,
  fas
);

function App() {
  const { address, account } = useGetAccountInfo();
  const [nAddress, setAddress] = useState(address);

  useEffect(() => {
    setAddress(nAddress);
  }, [])

  //Set the config network
  const customNetConfig = networkConfig[networkId];

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout
          address={address}
          account={account}
          setAddress={setAddress}
        />
      ),
      children: [
        {path: "/", element: <Dashboard/>},
        {path: "/dashboard", element: <Dashboard/>},
        {path: "/staking", element: <Staking address={nAddress} account={account}/>},
        {path: "/projects", element: <Projects/>},
        {path: "/team", element: <Team/>},
        {path: "/admin", element: <Admin address={nAddress} account={account}/>},
        {path: "/lottery/bloodshed-reveal", element: <BloodshedReveal address={nAddress} account={account}/>},
        {path: "/lottery/nosferatu", element: <Bloodshed_lottery address={nAddress} account={account}/>},
        {path: "/projects/zero-2-infinity", element: <Zero2Infinity/>},
        {path: "/projects/estar-games", element: <EstarGames/>},
        {path: "/projects/vestax-finance", element: <VestaXFinance/>},
        {path: "/projects/xbid", element: <XBid/>},
        {path: "/staking2.0", element: <StakingV2 address={nAddress} account={account}/>},
        {path: "/view-farm/:farmId", element: <Farm address={nAddress} account={account}/>},
        {path: "/nosferatu-mint", element: <NosferatuMint address={nAddress} account={account}/>},
        {path: "/snake-mint", element: <SnakeMint address={nAddress} account={account}/>},
        {path: "/vestax-bronze-mint", element: <VestaxBronzeMint address={nAddress} account={account}/>},
        {path: "/midas-chain", element: <MidasChain address={nAddress} account={account}/>},
        {path: "/coding-division-mint", element: <CodingDivisionMint address={nAddress} account={account}/>},
      ],
    },
  ]);

  return (
    <DappProvider
      environment={customNetConfig.id}
      customNetworkConfig={customNetConfig}
      dappConfig={{shouldUseWebViewProvider: true}}
      completedTransactionsDelay={200}
    >
      <TransactionsToastList/>
      <NotificationModal/>
      <SignTransactionsModals/>
      <RouterProvider router={router}/>
    </DappProvider>
  );
}

export default App;
