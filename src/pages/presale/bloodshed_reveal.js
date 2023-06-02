import React, { useEffect, useState } from "react";
import "assets/css/globals.css";
import "assets/css/bloodshed.css";
import "assets/css/dateCountdown.css";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import fetch from "axios";
import BloodshedRevealCard from "cards/BloodshedRevealCard";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

function BloodshedReveal() {
  const { address } = useGetAccountInfo();
  const contractAddress =
    "erd1qqqqqqqqqqqqqpgquqwc8v09e5pmcz9h4569gynle8qwjdenyl5sayfsl0";
  const [pendingRevealsRemaining, setPendingRevealsRemaining] = useState(0);

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

  const handleReveal = async () => {
    const amountToReveal =
      pendingRevealsRemaining > 30 ? 30 : pendingRevealsRemaining;
    let amountAsHex = amountToReveal.toString(16);
    if (amountAsHex.length % 2 === 1) {
      amountAsHex = "0" + amountAsHex;
    }
    const hexContractAddr = new Address(contractAddress).hex();

    const txData = `ESDTNFTTransfer@424c4f4f4444524f502d363364633762@01@${amountAsHex}@${hexContractAddr}@627579@01@${amountAsHex}`;

    const tx = {
      data: txData,
      gasLimit: 3_000_000 * amountToReveal + 10_000_000,
      sender: address,
      receiver: address,
      value: "0",
      chainID: "1",
    };

    await sendTransactions({ transactions: [tx] });
  };

  const fetchRevealSFTs = async () => {
    const apiResponse = await fetch(
      `https://api.multiversx.com/accounts/${address}/nfts?identifiers=BLOODDROP-63dc7b-01`
    );
    if (apiResponse.status === 200 && apiResponse.data.length > 0) {
      return parseInt(apiResponse.data[0].balance);
    }
    return 0;
  };

  useEffect(() => {
    fetchRevealSFTs().then((v) => setPendingRevealsRemaining(v));
    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeftCountdown(countdownToTimestamp(1680890400000));
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <Container>
        <Row className="text-center mt-5">
          <Col>
            <div className="show-counter">
              <h1 className="text-white">Bloodshed NFT Reveal</h1>
              <a className="countdown-link">{timeLeftCountdown}</a>
            </div>
          </Col>
        </Row>
        <Row>
          <Col
            xs={12}
            sm={{ offset: 2, span: 8 }}
            md={{ offset: 2, span: 8 }}
            lg={{ offset: 3, span: 6 }}
            className="text-center"
          >
            <BloodshedRevealCard
              pendingRevealsRemaining={pendingRevealsRemaining}
              handleReveal={handleReveal}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default BloodshedReveal;
