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

import { contractQuery } from "utils/api";
import { buyTickets, claimResults } from "utils/bloodshedLotteryApi.js";
import { customConfig, networkId } from "config/customConfig";
import { networkConfig } from "config/networks";
import lotteryAbi from "abiFiles/launchpad.abi.json";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getIsLoggedIn, refreshAccount } from "@multiversx/sdk-dapp/utils";
import Button from "react-bootstrap/Button";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Address, AddressValue } from "@multiversx/sdk-core/out";

function Bloodshed_lottery() {
  //Set the config network
  const config = customConfig["devnet"];
  const { address } = useGetAccountInfo();

  const networkProvider = new ProxyNetworkProvider(config.provider);
  const scAddress =
    "erd1qqqqqqqqqqqqqpgql0c4fszd8gy3dwqwvz66u85v6sxxfkhl6ppsa9c8de";
  const scToken = config.bloodshedToken;
  const scName = "Launchpad";
  const chainID = networkConfig[networkId].shortId;

  const [lotteryStage, setLotteryStage] = useState();
  const [configuration, setConfiguration] = useState();
  const [totalNumberOfSoldTickets, setTotalNumberOfSoldTickets] = useState();
  const [ticketRangeForAddress, setTicketRangeForAddress] = useState();
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
    <div className="container mt-4">
      <div className="row text-white">
        <div className="col-12 text-start">
          <h1>Nosferatu Legendary NFT lottery</h1>
        </div>
        <div className="col-12 col-lg-6">
          <h3>Lottery stage: {lotteryStage}</h3>
        </div>
        <div className="col-12">
          <div className="card card-body " style={{ color: "black" }}>
            <h3>
              Total number of tickets:{" "}
              {totalNumberOfSoldTickets === undefined
                ? 0
                : totalNumberOfSoldTickets.toNumber()}
            </h3>
            <h3>
              Your tickets:{" "}
              {totalNumberOfTicketsForAddress === undefined
                ? 0
                : totalNumberOfTicketsForAddress.toNumber()}
            </h3>
            {ticketRangeForAddress !== undefined && (
              <h3>
                Your ticket range:{" "}
                {ticketRangeForAddress.map((tr) => tr.toNumber()).join(" to ")}
              </h3>
            )}
            {lotteryStage === "Claim" && (
              <>
                {(winningTicketIdsForAddress ?? []).length > 0 && (
                  <>
                    <div className="text-center mb-3 mt-5">
                      Congratulations! You have won{" "}
                      {(winningTicketIdsForAddress ?? []).length} legendary NFT
                      {(winningTicketIdsForAddress ?? []).length > 1 && "s"}
                    </div>
                    <div className="text-center">
                      {!hasUserClaimedTokens && (
                        <button
                          className="btn btn-primary w-50"
                          onClick={handleClaimResults}
                        >
                          Claim tickets
                        </button>
                      )}
                      {hasUserClaimedTokens && (
                        <>You have already claimed your winning tickets</>
                      )}
                    </div>
                  </>
                )}
                {(winningTicketIdsForAddress ?? []).length === 0 && (
                  <>Bad luck, you have no winning tickets!</>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bloodshed_lottery;
