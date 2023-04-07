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
      gasLimit: 20_000_000 * amountToReveal,
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
  }, [address]);

  return (
    <div>
      <Container>
        <Row className="text-center mt-5">
          <Col>
            <div className="show-counter">
              <h1 className="text-white">Bloodshed NFT Reveal</h1>
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
        s
      </Container>
    </div>
  );
}

export default BloodshedReveal;
