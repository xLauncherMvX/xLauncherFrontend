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
import {createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Dashboard from "pages/dashboard";
import Staking from "pages/staking";
import StakingV2 from "pages/stakingV2";
import Projects from "pages/projects";
import Team from "pages/team";
import Admin from "pages/admin";
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
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks/account";
import {networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import Layout from "layout/layout";
import {SnakeMint} from "pages/snakeSale/SnakeMint";
import ChristmasContest from "pages/christmas_contest";

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
        {path: "/projects/zero-2-infinity", element: <Zero2Infinity/>},
        {path: "/projects/estar-games", element: <EstarGames/>},
        {path: "/projects/vestax-finance", element: <VestaXFinance/>},
        {path: "/projects/xbid", element: <XBid/>},
        {path: "/staking2.0", element: <StakingV2 address={nAddress} account={account}/>},
        {path: "/view-farm/:farmId", element: <Farm address={nAddress} account={account}/>},
        {path: "/snake-mint", element: <SnakeMint address={nAddress} account={account}/>},
        {path: "/xmas-contest", element: <ChristmasContest/>},
        {path: "/unlock", element: <Navigate to="/dashboard" /> }
      ],
    },
  ]);

  return (
    <DappProvider
      environment={customNetConfig.id}
      customNetworkConfig={customNetConfig}
      dappConfig={{shouldUseWebViewProvider: true, logoutRoute: '/'}}
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
