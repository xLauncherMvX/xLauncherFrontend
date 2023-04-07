import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Slider from "@mui/material/Slider";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faMinus, faShop, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Card } from "react-bootstrap";
import image from "assets/images/bloodshed_nfts.png";
import imageTitle from "assets/images/bloodshed_title.png";
import logoTitle from "assets/images/zalmoxis_logo.png";
import { isDisabled } from "@testing-library/user-event/dist/utils";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks";
import {openInNewTab} from "utils/utilities";

export default function BloodshedClaimCard({totalNumberOfTicketsForAddress, claimResults, numberOfWinningTicketsForAddress, currentPhase}) {
  let showButton = true;
  if((totalNumberOfTicketsForAddress.toString() > 0 || numberOfWinningTicketsForAddress.toString() > 0) && currentPhase === 'claim_results'){
    showButton = false;
  }
  return (
    <div className="farm-card">
      <Row>
        <Col xs={12}>
          <Card.Img variant="top" src={logoTitle}  style={{ height: "100px", width: '40%', marginTop: '-20px', marginBottom: '-20px'}}/>
          <Card.Img
            variant="top"
            src={image}
            style={{ borderRadius: "15px", height: "350px" }}
          />
        </Col>
      </Row>
      <div className="light-divider" style={{ width: "100%", marginLeft: 0 }}> </div>
      <Row>
        <Col xs={12}>
          <p className="h4 text-white">Bought Tickets: {totalNumberOfTicketsForAddress.toString()}</p>
        </Col>
      </Row>
      <div className="light-divider" style={{ width: "100%", marginLeft: 0 }}> </div>
      <Row>
        <Col xs={12}>
          <p className="h4 text-white">Winning Tickets: {numberOfWinningTicketsForAddress.toString()}</p>
        </Col>
      </Row>
      <div className="light-divider mb-2" style={{ width: "100%", marginLeft: 0 }}> </div>
      <Row>
        <Col xs={12}>
          <Button
            className="btn btn-block  btn-success mt-3"
            style={{ minWidth: "90px" }}
            onClick={() => claimResults()}
            disabled={showButton}
          >
            Claim Rewards
          </Button>
        </Col>
      </Row>
    </div>
  );
}
