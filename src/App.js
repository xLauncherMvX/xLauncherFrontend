import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
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
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from "pages/dashboard";
import Staking from "pages/staking";
import StakingV2 from "pages/stakingV2";
import Projects from "pages/projects";
import Team from "pages/team";
import Admin from "pages/admin";
import Bloodshed from "pages/presale/bloodshed";
import XLHBloodshed from "pages/presale/xlh_bloodshed";
import SnakeTokenPresale from "pages/presale/snake_token_presale";
import BloodshedReveal from "pages/presale/bloodshed_reveal";
import Zero2Infinity from "pages/projects/Zero2Infinity";
import EstarGames from "pages/projects/EstarGames";
import VestaXFinance from "pages/projects/VestaXFinance";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider";
import {
  NotificationModal,
  SignTransactionsModals,
  TransactionsToastList,
} from "@multiversx/sdk-dapp/UI";
import { networkId } from "config/customConfig";
import { networkConfig } from "config/networks";
import Layout from "layout/layout";

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
  faCheck
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

  //<Route path="/staking" element={<Staking />} />
  //              <Route path="/projects" element={<Projects />} />

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
        { path: "/admin", element: <Admin /> },
        // { path: "/lottery/bloodshed", element: <Bloodshed walletState={walletState}/> },
        // { path: "/lottery/xlh-bloodshed", element: <XLHBloodshed walletState={walletState}/> },
        { path: "/lottery/bloodshed-reveal", element: <BloodshedReveal walletState={walletState}/> },
        { path: "/projects/zero-2-infinity", element: <Zero2Infinity /> },
        { path: "/projects/estar-games", element: <EstarGames /> },
        { path: "/projects/vestax-finance", element: <VestaXFinance /> },
        { path: "/staking2.0", element: <StakingV2 walletState={walletState} /> },
        { path: "/snake-token-presale", element: <SnakeTokenPresale walletState={walletState} /> },

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
