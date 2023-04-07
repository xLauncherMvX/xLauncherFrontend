import React, { useState } from "react";
import "assets/css/globals.css";
import "assets/css/bloodshed.css";
import "assets/css/dateCountdown.css";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import BloodshedRevealCard from "cards/BloodshedRevealCard";

function BloodshedReveal() {
  const [totalNumberOfTicketsForAddress, setTotalNumberOfTicketsForAddress] =
    useState(0);

  const handleReveal = async () => {
    window.alert("todo");
  };

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
              pendingRevealsRemaining={totalNumberOfTicketsForAddress}
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
