import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import { Card } from "react-bootstrap";
import image from "assets/images/bloodshed_nfts.png";
import logoTitle from "assets/images/zalmoxis_logo.png";

export default function BloodshedRevealCard({
  pendingRevealsRemaining,
  handleReveal,
}) {
  let showButton = true;
  if (pendingRevealsRemaining > 0) {
    showButton = false;
  }

  const RELEASE_TIME = 1680890400000;
  const [currentTimestamp, setCurrentTimestamp] = useState(
    new Date().getTime()
  );
  const [isPastReleaseTime, setIsPastReleaseTime] = useState(
    currentTimestamp > RELEASE_TIME
  );

  return (
    <div className="farm-card">
      <Row>
        <Col xs={12}>
          <Card.Img
            variant="top"
            src={logoTitle}
            style={{
              height: "100px",
              width: "40%",
              marginTop: "-20px",
              marginBottom: "-20px",
            }}
          />
          <Card.Img
            variant="top"
            src={image}
            style={{ borderRadius: "15px", height: "350px" }}
          />
        </Col>
      </Row>
      <div className="light-divider" style={{ width: "100%", marginLeft: 0 }}>
        {" "}
      </div>
      <Row>
        <Col xs={12}>
          <p className="h4 text-white">
            Pending Reveals: {pendingRevealsRemaining?.toString()}
          </p>
        </Col>
      </Row>
      <div className="light-divider" style={{ width: "100%", marginLeft: 0 }}>
        {" "}
      </div>
      <Row>
        <Col xs={12}>
          <p className="h4 text-white">
            You can reveal up to 30 SFTs per transaction
          </p>
        </Col>
      </Row>
      <div
        className="light-divider mb-2"
        style={{ width: "100%", marginLeft: 0 }}
      >
        {" "}
      </div>
      <Row>
        <Col xs={12}>
          {isPastReleaseTime && (
            <Button
              className="btn btn-block  btn-success mt-3"
              style={{ minWidth: "90px" }}
              onClick={handleReveal}
              disabled={showButton}
            >
              Reveal{" "}
              {pendingRevealsRemaining > 30
                ? "30"
                : pendingRevealsRemaining?.toString()}
            </Button>
          )}
          {!isPastReleaseTime && (
            <Button
              className="btn btn-block  btn-success mt-3"
              style={{ minWidth: "90px" }}
              disabled={true}
            >
              Reveal starts at 18:00 UTC
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}
