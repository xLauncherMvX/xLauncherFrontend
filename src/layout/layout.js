import React from "react";
import { Outlet } from "react-router-dom";
import { Sidenav } from "sidenav/sidenav";
import { Navbar } from "navbar/navbar";
import { Footer } from "footer/footer";
import "assets/css/globals.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Layout(props) {
  let bgClasses = "";
  if (props.bgClasses) bgClasses = props.bgClasses;
  return (
    <div className={`page-container ${bgClasses}`}>
      <Sidenav />
      <Container className="main-container">
        <Row style={{ minHeight: "calc(100vh - 107px)", display: "flex", flexDirection: "column" }}>
          <Col>
            <Navbar
              debugLog={props.debugLog}
              updateWalletAddress={props.updateWalletAddress}
              address={props.address}
              setTimeToConnect={props.setTimeToConnect}
              timeToConnect={props.timeToConnect}
              setAddress={props.setAddress}
            />
            <Outlet clientReportData={props.clientReportData} />
          </Col>
        </Row>
        <Footer/>
      </Container>
    </div>
  );
}

export default Layout;
