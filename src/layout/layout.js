import React from "react";
import { Outlet } from "react-router-dom";
import { Sidenav } from "sidenav/sidenav";
import { Navbar } from "navbar/navbar";
import { Footer } from "footer/footer";
import "assets/css/globals.css";
//import "assets/css/snow.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Snowfall from "react-snowfall";
import image from 'assets/images/snow/snowflake.png';

function Layout(props) {
  let bgClasses = "";
  if (props.bgClasses) bgClasses = props.bgClasses;
  return (
    <div className={`page-container ${bgClasses}`}>

      <Sidenav />
      <Container className="main-container">
        <Row style={{ minHeight: "calc(100vh - 107px)", display: "flex", flexDirection: "column" }}>
          <Col>
            <Navbar setAddress={props.setAddress} />
            <Outlet />
          </Col>
        </Row>
        <Footer/>
      </Container>
      {/* <Snowfall
        snowflakeCount={100}
        speed={[0.5,1]}
        wind={[0, 1]}
        radius={[0.5, 1.5]}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      /> */}
    </div>
  );
}

export default Layout;
