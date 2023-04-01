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
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "pages/dashboard";
import Staking from "pages/staking";
import Projects from "pages/projects";
import Team from "pages/team";
import Admin from "pages/admin";
import Bloodshed_lottery from "pages/presale/bloodshed_lottery";
import Bloodshed from "pages/presale/bloodshed";
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

function App() {
  const [walletState, setWalletState] = useState({});

  const updateWalletAddress = (newAddress) => {
    setWalletState((prefWalletAddress) => {
      return { ...prefWalletAddress, address: newAddress };
    });
  };

  //Set the config network
  const customNetConfig = networkConfig[networkId];

  const router = createBrowserRouter([{
    path: '/',
    element: <Layout/>,
  }])

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
      <RouterProvider router={router}/>
    </DappProvider>
  );
}

export default App;

