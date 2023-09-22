import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from '@fortawesome/free-solid-svg-icons';
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
import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider";
import {
  NotificationModal,
  SignTransactionsModals,
  TransactionsToastList,
} from "@multiversx/sdk-dapp/UI";
import { networkId } from "config/customConfig";
import { networkConfig } from "config/networks";
import Layout from "layout/layout";
import Bloodshed_lottery from "pages/presale/bloodshed_lottery";
import { NosferatuMint } from "pages/nosferatu/NosferatuMint";
import { SnakeMint } from "pages/snakeSale/SnakeMint";
import { VestaxBronzeMint } from "pages/snakeSale/VestaxBronzeMint";

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

const defaultClientReportData = {
  totalAmount: "",
  totalRewards: "",
  farm1Amount: "",
  farm1Rewards: "",
  farm2Amount: "",
  farm2Rewards: "",
  farm3Amount: "",
  farm3Rewards: "",
};

function App() {
  const [walletState, setWalletState] = useState({
    address: "",
    clientReportData: defaultClientReportData,
    timeToConnect: false,
  });

  const updateWalletAddress = (newAddress) => {
    console.log("newAddress", newAddress);
    setWalletState((prevWalletState) => {
      return { ...prevWalletState, address: newAddress };
    });
  };

  const debugLog = (message) => {
    console.log(message);
  };

  const setTimeToConnect = (timeToConnect) => {
    setWalletState((prevWalletState) => {
      return { ...prevWalletState, timeToConnect: timeToConnect };
    });
  };

  const setAddress = (address) => {
    if (walletState.address === address) {
      return;
    }

    setWalletState((prevWalletState) => {
      return { ...prevWalletState, address: address };
    });
  };

  //Set the config network
  const customNetConfig = networkConfig[networkId];

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout
          updateWalletAddress={updateWalletAddress}
          debugLog={debugLog}
          clientReportData={walletState.clientReportData}
          setTimeToConnect={setTimeToConnect}
          timeToConnect={walletState.timeToConnect}
          setAddress={setAddress}
        />
      ),
      children: [
        { path: "/", element: <Dashboard/> },
        { path: "/dashboard", element: <Dashboard /> },
        {
          path: "/staking",
          element: <Staking walletState={walletState} />,
        },
        { path: "/projects", element: <Projects /> },
        { path: "/team", element: <Team /> },
        { path: "/admin", element: <Admin walletState={walletState} /> },
        { path: "/lottery/bloodshed-reveal", element: <BloodshedReveal walletState={walletState}/> },
        { path: "/lottery/nosferatu", element: <Bloodshed_lottery walletState={walletState}/> },
        { path: "/projects/zero-2-infinity", element: <Zero2Infinity /> },
        { path: "/projects/estar-games", element: <EstarGames /> },
        { path: "/projects/vestax-finance", element: <VestaXFinance /> },
        { path: "/projects/xbid", element: <XBid /> },
        { path: "/staking2.0", element: <StakingV2 walletState={walletState} /> },
        { path: "/view-farm/:farmId", element: <Farm walletState={walletState} /> },
        { path: "/nosferatu-mint", element: <NosferatuMint /> },
        { path: "/snake-mint", element: <SnakeMint /> },
        { path: "/vestax-bronze-mint", element: <VestaxBronzeMint /> },

        { path: "*", element: <Dashboard /> },
      ],
    },
  ]);

  return (
    <DappProvider
      environment={customNetConfig.id}
      customNetworkConfig={customNetConfig}
      dappConfig={{ shouldUseWebViewProvider: true }}
      completedTransactionsDelay={200}
    >
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
      <RouterProvider router={router} />
    </DappProvider>
  );
}

export default App;
