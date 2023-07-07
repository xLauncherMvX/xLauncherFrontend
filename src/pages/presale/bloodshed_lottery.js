import React, { useEffect, useState } from "react";
import Layout from "layout/layout";
import "assets/css/globals.css";
import "assets/css/bloodshed.css";
import Image from "react-bootstrap/Image";
import char1 from "assets/images/char1.png";
import char2 from "assets/images/char2.png";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Card } from "react-bootstrap";
import lotteryImage from "assets/images/lottery.png";

import { contractQuery } from "utils/api";
import {
  buyTickets,
  claimLegendaryNft,
  claimResults,
} from "utils/bloodshedLotteryApi.js";
import { customConfig, networkId } from "config/customConfig";
import { networkConfig } from "config/networks";
import lotteryAbi from "abiFiles/launchpad.abi.json";
import claimLegendaryNftAbi from "abiFiles/launchpadv2.abi.json";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getIsLoggedIn, refreshAccount } from "@multiversx/sdk-dapp/utils";
import Button from "react-bootstrap/Button";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Address, AddressValue, Transaction } from "@multiversx/sdk-core/out";
import axios from "axios";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

function Bloodshed_lottery() {
  //Set the config network
  const config = customConfig[networkId];
  const { address } = useGetAccountInfo();

  const networkProvider = new ProxyNetworkProvider(config.provider);
  const scAddress =
    "erd1qqqqqqqqqqqqqpgqujnlhf88kepdq90h2e5z3e8wfh365w8yyl5swlrzqw";
  const scToken = config.bloodshedToken;
  const scName = "Launchpad";
  const chainID = networkConfig[networkId].shortId;

  const [lotteryStage, setLotteryStage] = useState();
  const [configuration, setConfiguration] = useState();
  const [totalNumberOfSoldTickets, setTotalNumberOfSoldTickets] = useState();
  const [ticketRangeForAddress, setTicketRangeForAddress] = useState([]);
  const [totalNumberOfTicketsForAddress, setTotalNumberOfTicketsForAddress] =
    useState();
  const [winningTicketIdsForAddress, setWinningTicketIdsForAddress] =
    useState();
  const [hasUserClaimedTokens, setHasUserClaimedTokens] = useState();
  const [
    numberOfWinningTicketsForAddress,
    setNumberOfWinningTicketsForAddress,
  ] = useState();

  const getContractData = async () => {
    const newLotteryStage = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getLotteryStage",
      []
    );
    console.log(newLotteryStage["name"]);
    setLotteryStage(newLotteryStage["name"]);

    const newConfiguration = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getConfiguration",
      []
    );
    setConfiguration(newConfiguration);

    const newTotalNumberOfSoldTickets = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getTotalNumberOfTickets",
      []
    );
    setTotalNumberOfSoldTickets(newTotalNumberOfSoldTickets);

    console.log("getLotteryStage " + JSON.stringify(newLotteryStage, null, 2));
    console.log(
      "getConfiguration " + JSON.stringify(newConfiguration, null, 2)
    );
    console.log("getTotalNumberOfTickets " + newTotalNumberOfSoldTickets);
  };

  const getLoggedInContractData = async () => {
    const newTicketRangeForAddress = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getTicketRangeForAddress",
      [new AddressValue(new Address(address))]
    );
    setTicketRangeForAddress(newTicketRangeForAddress);

    const newTotalNumberOfTicketsForAddress = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getTotalNumberOfTicketsForAddress",
      [new AddressValue(new Address(address))]
    );
    setTotalNumberOfTicketsForAddress(newTotalNumberOfTicketsForAddress);

    const newWinningTicketIdsForAddress = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getWinningTicketIdsForAddress",
      [new AddressValue(new Address(address))]
    );
    setWinningTicketIdsForAddress(newWinningTicketIdsForAddress);

    const newHasUserClaimedTokens = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "hasUserClaimedTokens",
      [new AddressValue(new Address(address))]
    );
    setHasUserClaimedTokens(newHasUserClaimedTokens);

    const newNumberOfWinningTicketsForAddress = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getNumberOfWinningTicketsForAddress",
      [new AddressValue(new Address(address))]
    );
    setNumberOfWinningTicketsForAddress(newNumberOfWinningTicketsForAddress);

    console.log(
      "getTicketRangeForAddress " +
        JSON.stringify(newTicketRangeForAddress, null, 2)
    );
    console.log(
      "getTotalNumberOfTicketsForAddress " + newTotalNumberOfTicketsForAddress
    );
    console.log(
      "getWinningTicketIdsForAddress " + newWinningTicketIdsForAddress
    );
    console.log("hasUserClaimedTokens " + newHasUserClaimedTokens);
    console.log(
      "getNumberOfWinningTicketsForAddress " +
        newNumberOfWinningTicketsForAddress
    );
  };

  useEffect(() => {
    getContractData();
    if (getIsLoggedIn()) {
      getLoggedInContractData();
    }
    // eslint-disable-next-line
  }, []);

  const handleClaimResults = async () => {
    await claimResults(
      new ProxyNetworkProvider("https://gateway.multiversx.com"),
      lotteryAbi,
      scAddress,
      "launchpad",
      networkConfig.chainID
    );
  };

  const currentTimeStamp = new Date();

  const [winningTicketsCount, setWinningTicketsCount] = useState(-1);
  useEffect(() => {
    if (!address) {
      return;
    }

    axios
      .get(
        `https://api.multiversx.com/accounts/${address}/nfts?collections=DEMIOULTR-15a313&size=10000`
      )
      .then((res) => {
        if (res.data.length > 0) {
          setWinningTicketsCount(parseInt(res.data[0].balance));
        }
      });
  }, [address]);

  const handleClaimLegendary = async () => {
    await claimLegendaryNft(
      new ProxyNetworkProvider("https://gateway.multiversx.com"),
      claimLegendaryNftAbi,
      "erd1qqqqqqqqqqqqqpgqseuf6zuaxewychcxyt7920jz96x4ls0ayl5swmh07r",
      "Launchpadv2Contract",
      networkConfig.chainID,
      winningTicketsCount
    );
  };

  return (
    // <Container>
    //   <Row className="mt-5">
    //     <Col>
    //       <Button
    //         className="btn btn-block btn-sm btn-info mt-3"
    //         style={{ minWidth: "90px" }}
    //         onClick={() =>
    //           buyTickets(
    //             networkProvider,
    //             lotteryAbi,
    //             scAddress,
    //             scName,
    //             chainID
    //           )
    //         }
    //       >
    //         Claim Results
    //       </Button>
    //     </Col>
    //   </Row>
    // </Container>
    <>
      <div className="container mt-4 text-center">
        <p className="text-white font-bold mt-4" style={{ fontSize: "40px" }}>
          Nosferatu Legendary NFT lottery
        </p>
        <Row className="mt-4">
          <Col xs={12} lg={{ offset: 3, span: 6 }}>
            <div className="farm-card text-white">
              <Card.Img
                variant="top"
                src={lotteryImage}
                style={{ borderRadius: "15px", height: "250px" }}
              />
              <p className="h3 text-white mt-2">
                Lottery stage: {lotteryStage}
              </p>
              <div
                className="light-divider"
                style={{ width: "100%", marginLeft: 0, marginBottom: "5px" }}
              ></div>
              <div className="d-flex justify-content-between align-items-center mt-4">
                <p className="h5">Total number of tickets: </p>
                <p className="h5">
                  {totalNumberOfSoldTickets === undefined
                    ? 0
                    : totalNumberOfSoldTickets.toNumber()}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p className="h5">Your tickets: </p>
                <p className="h5">
                  {totalNumberOfTicketsForAddress === undefined
                    ? 0
                    : totalNumberOfTicketsForAddress.toNumber()}
                </p>
              </div>
              {totalNumberOfTicketsForAddress !== undefined ||
                (totalNumberOfTicketsForAddress > 0 && (
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="h5">Your ticket range: </p>
                    <p className="h5">
                      {ticketRangeForAddress
                        .map((tr) => tr && tr.toNumber())
                        .join(" to ")}
                    </p>
                  </div>
                ))}
              <div
                className="light-divider"
                style={{ width: "100%", marginLeft: 0, marginBottom: "5px" }}
              ></div>
              {address && lotteryStage === "Claim" && (
                <div className="b-r-xs text-white">
                  {(winningTicketIdsForAddress ?? []).length > 0 && (
                    <>
                      <div className="text-center mt-3">
                        <p className="h5 mt-3">
                          Congratulations! You have won{" "}
                          {(winningTicketIdsForAddress ?? []).length} legendary
                          NFT
                          {(winningTicketIdsForAddress ?? []).length > 1 && "s"}
                        </p>
                      </div>
                      <div
                        className="light-divider"
                        style={{
                          width: "100%",
                          marginLeft: 0,
                          marginTop: "15px",
                        }}
                      ></div>
                      <div className="text-center">
                        {!hasUserClaimedTokens && (
                          <button
                            className="btn btn-primary btn-block mt-2"
                            onClick={handleClaimResults}
                          >
                            Claim tickets
                          </button>
                        )}
                        {hasUserClaimedTokens && (
                          <button
                            className="btn btn-primary btn-block mt-2"
                            onClick={handleClaimResults}
                            disabled
                          >
                            You have already claimed your winning tickets
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {(winningTicketIdsForAddress ?? []).length === 0 && (
                    <p className="h5 mt-3">
                      Bad luck, you have no winning tickets!
                    </p>
                  )}
                </div>
              )}
              {!address && (
                <p className="h5 mt-3">Connect to see the lottery results and claim the Legendary NFT</p>
              )}
            </div>
          </Col>
        </Row>
      </div>
      {winningTicketsCount > 0 && (
        <div className="container mt-5 text-center">
          <p className="text-white font-bold mt-4" style={{ fontSize: "40px" }}>
            Claim the legendary Nosferatu NFT
          </p>
          <Row className="mt-4">
            <Col xs={12} lg={{ offset: 3, span: 6 }}>
              <div className="farm-card text-white">
                {address && (
                  <>
                    <h5 className="mt-2 mb-4">
                      You have {winningTicketsCount} Legendary Nosferatu NFTs to
                      claim
                    </h5>
                    <button
                      className="btn btn-primary btn-block mb-3"
                      onClick={handleClaimLegendary}
                    >
                      Claim now
                    </button>
                  </>
                )}
                {!address && (
                  <p className="h5 mt-3">Connect to see the lottery results</p>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
}

export default Bloodshed_lottery;
