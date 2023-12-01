import React, {useState} from "react";
import {Col, Row, Card} from 'react-bootstrap';
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {openInNewTab} from "utils/utilities";
import andrei from "assets/images/team/andrei.jpg";
import bogdan from "assets/images/team/bogdan.jpg";
import cosmin from "assets/images/team/cosmin.jpg";
import ionut from "assets/images/team/ionut.png";

function Team(props) {
	return (
		<div>
			<p
				className="text-white font-bold mt-4 ms-2"
				style={{ fontSize: "40px" }}
			>
				Team
			</p>
			<Row>
        <Col xs={12} md={6} lg={3} className="text-center mt-5">
          <Card.Img variant="top" src={andrei} style={{borderRadius: "15px", height: "250px", width: 'auto'}}/>
          <p className="h2 text-white font-bold mt-3">Andrei Necula</p>
          <p className="h5 text-white font-bold mt-1">Co-Founder, Community Manager</p>
        </Col>
        <Col xs={12} md={6} lg={3} className="text-center mt-5">
          <Card.Img variant="top" src={cosmin} style={{borderRadius: "15px", height: "250px", width: 'auto'}}/>
					<p className="h2 text-white font-bold mt-3">Cosmin Radu</p>
					<p className="h5 text-white font-bold mt-1">Co-Founder, Partnerships Manager</p>
        </Col>

        <Col xs={12} md={6} lg={3} className="text-center mt-5">
          <Card.Img variant="top" src={ionut} style={{borderRadius: "15px", height: "250px", width: 'auto'}}/>
					<p className="h2 text-white font-bold mt-3">Ionut Cioarec</p>
					<p className="h5 text-white font-bold mt-1">Co-Founder, IT Engineer, Frontend Dev</p>
					<IconButton className="float-right text-white" onClick={() => openInNewTab("https://ro.linkedin.com/in/ionut-cioarec-8b859398")}>
						<LinkedInIcon className="footer-links" fontSize="large"/>
					</IconButton>
        </Col>
        <Col xs={12} md={6} lg={3} className="text-center mt-5">
          <Card.Img variant="top" src={bogdan} style={{borderRadius: "15px", height: "250px", width: 'auto'}}/>
					<p className="h2 text-white font-bold mt-3">Bogdan Oloeriu</p>
					<p className="h5 text-white font-bold mt-1">Co-Founder, Senior Web3 Developer</p>
					<IconButton className="float-right text-white" onClick={() => openInNewTab("https://be.linkedin.com/in/bogdan-oloeriu")}>
						<LinkedInIcon className="footer-links" fontSize="large"/>
					</IconButton>
        </Col>
      </Row>
		</div>
	);
}

export default Team;