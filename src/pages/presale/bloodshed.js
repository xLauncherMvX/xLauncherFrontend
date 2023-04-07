import React, { useEffect, useState } from "react";
import Layout from "layout/layout";
import "assets/css/globals.css";
import "assets/css/bloodshed.css";
import "assets/css/dateCountdown.css";
import Image from "react-bootstrap/Image";
import char1 from "assets/images/char1.png";
import char2 from "assets/images/char2.png";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { contractQuery, getAccountTokens } from "utils/api";
import { buyTickets, claimResults } from "utils/bloodshedLotteryApi.js";
import { customConfig, networkId, allTokens } from "config/customConfig";
import { networkConfig } from "config/networks";
import lotteryAbi from "abiFiles/launchpad.abi.json";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getIsLoggedIn, refreshAccount } from "@multiversx/sdk-dapp/utils";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Address, AddressValue } from "@multiversx/sdk-core/out";
import BloodshedTicketsSaleCard from "cards/BloodshedTicketsSaleCard";
import BloodshedClaimCard from "cards/BloodshedClaimCard";
// import DateCountdown from "components/dateCountdown";
import { multiplier } from "utils/utilities";
import { Card } from "react-bootstrap";
import logoTitle from "assets/images/zalmoxis_logo.png";

function Bloodshed() {
  const PHASE_MESSAGE_CLAIM_REWARDS = "Claim Rewards Phase is Open";
  const PHASE_MESSAGE_NOT_STARTED = "Buying Tickets Phase Starts in";
  const PHASE_MESSAGE_STARTED = "Buying Tickets Phase is Open";
  const PHASE_MESSAGE_WINNER_SELECTION = "Winner Selection Phase in Progress ";

  //Set the config network
  const config = customConfig[networkId];
  const tokens = allTokens[networkId];
  const { address } = useGetAccountInfo();
  //   const isLoggedIn = getIsLoggedIn();
  const isLoggedIn = address.startsWith("erd1");
  const networkProvider = new ProxyNetworkProvider(config.provider);
  const scAddress = config.bloodshedAddress;
  const scToken = config.bloodshedToken;
  const scName = "Launchpad";
  const chainID = networkConfig[networkId].shortId;
  const tokensAPI = config.apiLink + address + "/tokens?size=2000";

  //Sc query
  const [configuration, setConfiguration] = useState();
  const [totalNumberOfSoldTickets, setTotalNumberOfSoldTickets] =
    useState(null);
  const [totalNumberOfTicketsForAddress, setTotalNumberOfTicketsForAddress] =
    useState(0);
  const [numberOfWinningTicketsForAddress, setNumberOfWinningTicketsForAddress] =
    useState(0);
  const [disabledVar, setDisabledVar] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [currentTimestamp, _] = useState(
    new Date(Math.floor(new Date().getTime() / 1000))
  );
  const [currentPhase, setCurrentPhase] = useState("");
  const [timestamp, setTimestamp] = useState();
  const [timeLeftCountdown, setTimeLeftCountdown] = useState("");

  const countdownToTimestamp = (timestamp) => {
    const currentUtcTimestamp = new Date().getTime();
    let timeDiff = timestamp - currentUtcTimestamp;

    if (timeDiff < 0) {
      return "";
    } else {
      const one_second = 1000;
      const one_minute = 60 * one_second;
      const one_hour = 60 * one_minute;
      const one_day = 24 * one_hour;

      const days = Math.floor(timeDiff / one_day);
      timeDiff -= days * one_day;

      const hours = Math.floor(timeDiff / one_hour);
      timeDiff -= hours * one_hour;

      const minutes = Math.floor(timeDiff / one_minute);
      timeDiff -= minutes * one_minute;

      const seconds = Math.floor(timeDiff / one_second);
      timeDiff -= seconds * one_second;
      return (
          <span className="custom-ctt-numbers2">
            {days > 0 && <span>{days} <span className="text-white">d</span> </span>}
            {hours > 0 && <span>{hours} <span className="text-white">h</span> </span>}
            {minutes > 0 && <span>{minutes} <span className="text-white">min</span> </span>}
            {seconds > 0 && <span>{seconds} <span className="text-white">s</span> </span>}
          </span>
      );
    }
  };


  const getLotteryPhase = (newConfiguration) => {
    if (newConfiguration === undefined || newConfiguration === null) {
      return "";
    }

    if (currentTimestamp < newConfiguration.ticket_purchase_start_timestamp) {
      return "not_started";
    } else if (
      currentTimestamp >= newConfiguration.ticket_purchase_start_timestamp &&
      currentTimestamp < newConfiguration.winner_selection_start_timestamp
    ) {
      return "tickets_purchase";
    } else if (
      currentTimestamp >= newConfiguration.winner_selection_start_timestamp &&
      currentTimestamp < newConfiguration.claim_start_timestamp
    ) {
      return "winner_selection";
    } else if (currentTimestamp >= newConfiguration.claim_start_timestamp) {
      return "claim_results";
    }
  };

  const setContainerStatus = (phase, newConfiguration) => {
    let isDisabled = disabledVar;
    let newTimestamp = timestamp;
    if (phase) {
      switch (phase) {
        case "not_started":
          isDisabled = true;
          newTimestamp = parseInt(
            newConfiguration.ticket_purchase_start_timestamp
          );
          break;
        case "tickets_purchase":
          newTimestamp = parseInt(
            newConfiguration.winner_selection_start_timestamp
          );
          isDisabled = false;
          break;
        case "winner_selection":
          isDisabled = true;
          newTimestamp = parseInt(newConfiguration.claim_start_timestamp);
          break;
        case "claim_results":
          isDisabled = true;
          break;
      }
    }
    if (totalNumberOfTicketsForAddress > 0 || !isLoggedIn || !isWhitelisted) {
      isDisabled = true;
    }
    setCurrentPhase(phase);
    setDisabledVar(isDisabled);
    setTimestamp(newTimestamp);
    setTimeLeftCountdown(countdownToTimestamp(newTimestamp * 1000));
  };

  const getContractData = async () => {
    const newConfiguration = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getConfiguration",
      []
    );

    setConfiguration(newConfiguration);
    const lotteryPhase = getLotteryPhase(newConfiguration);
    setContainerStatus(lotteryPhase, newConfiguration);
    await setTicketCounters();
    return newConfiguration;
  };

  const setTicketCounters = async () => {
    const newTotalNumberOfSoldTickets = await contractQuery(
      networkProvider,
      lotteryAbi,
      scAddress,
      scName,
      "getTotalNumberOfTickets",
      []
    );
    setTotalNumberOfSoldTickets(newTotalNumberOfSoldTickets);

    if (isLoggedIn) {
      const newNumberOfWinningTicketsForAddress = await contractQuery(
        networkProvider,
        lotteryAbi,
        scAddress,
        scName,
        "getNumberOfWinningTicketsForAddress",
        [new AddressValue(new Address(address))]
      );
      setNumberOfWinningTicketsForAddress(newNumberOfWinningTicketsForAddress);

      const newTotalNumberOfTicketsForAddress = await contractQuery(
        networkProvider,
        lotteryAbi,
        scAddress,
        scName,
        "getTotalNumberOfTicketsForAddress",
        [new AddressValue(new Address(address))]
      );
      setTotalNumberOfTicketsForAddress(newTotalNumberOfTicketsForAddress);

      const newIsWhitelisted = await contractQuery(
          networkProvider,
          lotteryAbi,
          scAddress,
          scName,
          "isWhitelisted",
          [new AddressValue(new Address(address))]
      );
      setIsWhitelisted(newIsWhitelisted);
    }
  };

  //Get Account Tokens Balance
  const [vegldBalance, setVegldBalance] = useState(0);
  const getWalletData = async () => {
    try {
      const response = await fetch(tokensAPI, {
        headers: {
          Accept: "application/json",
        },
      });
      const json = await response.json();
      if (json) {
        json.forEach((item) => {
          if (item.identifier === scToken) {
            setVegldBalance(item.balance / multiplier);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getContractData();
    if (isLoggedIn) {
      getWalletData();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (configuration === undefined || configuration === null) {
      return;
    }
    const interval = window.setInterval(() => {
      dataToBeRefreshed().then(() => {
        // do nothing
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line
  }, [configuration]);

  //   useEffect(() => {
  //     const interval = window.setInterval(() => {
  //       setTicketCounters().then(() => {
  //         //do nothing
  //       });
  //     }, 6000);
  //     return () => window.clearInterval(interval);
  //     // eslint-disable-next-line
  //   }, []);

  const dataToBeRefreshed = async () => {
    let configurationToUse = configuration;
    if (configurationToUse === undefined || configurationToUse === null) {
      return;
    }
    const lotteryPhase = getLotteryPhase(configurationToUse);
    setCurrentPhase(lotteryPhase);
    setContainerStatus(lotteryPhase, configurationToUse);
    let timestampToUse = 0;
    switch (lotteryPhase) {
      case "not_started":
        timestampToUse =
          configurationToUse.ticket_purchase_start_timestamp.toNumber();
        break;
      case "tickets_purchase":
        timestampToUse =
          configurationToUse.winner_selection_start_timestamp.toNumber();
        break;
      case "winner_selection":
        timestampToUse = configurationToUse.claim_start_timestamp.toNumber();
        break;
    }
    setTimeLeftCountdown(countdownToTimestamp(timestampToUse * 1000));
  };

  return (
    <div>
      <Container>
        <Row className="text-center mt-5">
          {/* <Col>{topInfo}</Col> */}
          <Col>
            <div className="show-counter">
              {currentPhase === "not_started" && (
                <p className="h1 text-white"> {PHASE_MESSAGE_NOT_STARTED} </p>
              )}
              {currentPhase === "tickets_purchase" && (
                <p className="h1 text-white"> {PHASE_MESSAGE_STARTED} </p>
              )}
              {currentPhase === "winner_selection" && (
                <p className="h1 text-white">
                  {" "}
                  {PHASE_MESSAGE_WINNER_SELECTION}{" "}
                </p>
              )}
              {currentPhase === "claim_results" && (
                <p className="h1 text-white"> {PHASE_MESSAGE_CLAIM_REWARDS} </p>
              )}
              {["not_started", "tickets_purchase", "winner_selection"].includes(
                currentPhase
              ) && <a className="countdown-link">{timeLeftCountdown}</a>}
            </div>
          </Col>
        </Row>
        {currentPhase === "tickets_purchase" && (
          <Row>
            <Col
              xs={12}
              sm={{ offset: 2, span: 8 }}
              md={{ offset: 3, span: 6 }}
              lg={{ offset: 4, span: 4 }}
              className="text-center"
            >
              <p className="h5 text-white mt-4">
                Owned Tickets: {totalNumberOfTicketsForAddress.toString()}, KYC - {isWhitelisted ? 'Approved' : 'None'}
              </p>
              <BloodshedTicketsSaleCard
                buyTickets={(amount) =>
                  buyTickets(
                    networkProvider,
                    lotteryAbi,
                    scAddress,
                    scName,
                    chainID,
                    scToken,
                    amount
                  )
                }
                disabledVar={disabledVar}
                vegld={vegldBalance}
                totalNumberOfTicketsForAddress={totalNumberOfTicketsForAddress}
                isWhitelisted={isWhitelisted}
                currentPhase={currentPhase}
              />
            </Col>
          </Row>
        )}
        {(currentPhase === "winner_selection" || currentPhase === "claim_results") && (
          <Row>
            <Col
              xs={12}
              sm={{ offset: 2, span: 8 }}
              md={{ offset: 2, span: 8 }}
              lg={{ offset: 3, span: 6 }}
              className="text-center"
            >
              <BloodshedClaimCard
                totalNumberOfTicketsForAddress={totalNumberOfTicketsForAddress}
                claimResults={()=>claimResults(networkProvider, lotteryAbi, scAddress, scName, chainID)}
                numberOfWinningTicketsForAddress={numberOfWinningTicketsForAddress}
                currentPhase={currentPhase}
              />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default Bloodshed;
