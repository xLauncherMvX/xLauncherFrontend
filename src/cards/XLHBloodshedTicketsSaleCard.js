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
import image from "assets/images/bloodshed3.jpg";
import imageTitle from "assets/images/bloodshed_title.png";
import logoTitle from "assets/images/zalmoxis_logo.png";
import { isDisabled } from "@testing-library/user-event/dist/utils";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks";
import {openInNewTab} from "utils/utilities";

export default function XLHBloodshedTicketsSaleCard({
  buyTickets,
  disabledVar,
  vegldBalance,
  totalNumberOfTicketsForAddress,
  isWhitelisted,
  currentPhase
}) {
  const [ticketsNumber, setTicketsNumber] = React.useState(1);
  const isLoggedIn = useGetIsLoggedIn();
  //slider
  const handleSliderChangeS = (event) => {
    setTicketsNumber(event.target.value);
  };

  //input
  const handleInputChangeS = (event) => {
    setTicketsNumber(event.target.value);
  };

  //+/- buttons
  const increaseAmount = (amount) => {
    let newValue = ticketsNumber + amount;
    setTicketsNumber(newValue);
  };

  const decreaseAmount = (amount) => {
    let newValue = ticketsNumber - amount;
    if (newValue > 0) {
      setTicketsNumber(newValue);
    }
  };

  // let label = "Tickets";
  // if(ticketsNumber === 1) label = "Ticket";
  const getBuyButton = () => {
    if (vegldBalance > ticketsNumber) {
      return (
        <Button
          className="btn btn-block btn-sm btn-info mt-3"
          style={{ minWidth: "90px" }}
        >
          Insufficient XLH
        </Button>
      );
    } else {
      return (
        <Button
          className="btn btn-block btn-sm btn-info mt-3"
          style={{ minWidth: "90px" }}
          onClick={() => buyTickets(ticketsNumber)}
        >
          Buy Tickets
        </Button>
      );
    }
  };

  return (
    <div className="farm-card">
      <Row>
        <Col xs={12}>
          <Card.Img variant="top" src={imageTitle} />
          <Card.Img
            variant="top"
            src={"https://bloodshed.gg/sold.jpg"}
            style={{ borderRadius: "15px", height: "250px" }}
          />
          <Card.Img
            variant="top"
            src={logoTitle}
            style={{ height: "70px", width: "140px", marginTop: "-80px" }}
          />
        </Col>
        <Col xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <p className="h3 text-white mt-3">
              {ticketsNumber} Ticket{ticketsNumber > 1 ? "s" : ""}
            </p>
          </Box>
        </Col>
        <Col xs={12}>
          <div
            className="light-divider"
            style={{ width: "100%", marginLeft: 0 }}
          >
            {" "}
          </div>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <p className="h4 text-white">{ticketsNumber * 10000} XLH</p>
          </Box>
        </Col>

        <Col xs={{ offset: 1, span: 10 }}>
          <Box mb={3}>
            <div
              className="light-divider"
              style={{ width: "100%", marginLeft: 0 }}
            >
              {" "}
            </div>
          </Box>
          <Col xs={12}>
            <Button
              variant="success"
              className="btn btn-sm btn-block"
              disabled={true}
              onClick={() => increaseAmount(1)}
            >
              <FontAwesomeIcon fontSize={"medium"} icon={faAdd} color="white" />
              <span className="ms-2">Buy more</span>
            </Button>
          </Col>
          <Col xs={12}>
            <Button
              variant="danger"
              className="btn btn-sm btn-block mt-1"
              disabled={true}
              onClick={() => decreaseAmount(1)}
            >
              <FontAwesomeIcon
                fontSize={"medium"}
                icon={faMinus}
                color="white"
                style={{ marginLeft: "-9px" }}
              />
              <span className="ms-2">Buy less</span>
            </Button>
          </Col>
        </Col>
        <Col xs={1}> </Col>

        <Col xs={12} mt={1}>
          <Box mt={2} mb={2}>
            <div
              className="light-divider"
              style={{ width: "100%", marginLeft: 0 }}
            >
              {" "}
            </div>
          </Box>
        </Col>
        {(totalNumberOfTicketsForAddress <= 0 && isWhitelisted && currentPhase === 'tickets_purchase') && <Col xs={12}>{getBuyButton()}</Col>}
        {!isLoggedIn && <Col xs={12}>
          <Button
            className="btn btn-block btn-sm btn-info mt-3"
            style={{ minWidth: "90px" }}
            disabled={true}
          >
            You are not logged in
          </Button>
        </Col>}
      </Row>
    </div>
  );
}
