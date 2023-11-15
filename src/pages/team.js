import React, {useState} from "react";
import {Col, Row, Card} from 'react-bootstrap';
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {openInNewTab} from "utils/utilities";
import andrei from "assets/images/team/andrei.jpg";
import bogdan from "assets/images/team/bogdan.jpg";
import cosmin from "assets/images/team/cosmin.jpg";
import ionut from "assets/images/team/ionut.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import QuestionImage from 'assets/images/starWars/question4.png';
import Button from "react-bootstrap/Button";

function Team(props) {

	//Star wars modal
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);

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
					<p className="h5 text-white font-bold mt-1">Co-Founder, IT Engineer, Frontend Dev, <span onClick={() => setShow(true)}>Padawan</span></p>
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
			{/*Star wars event modal*/}
			<Modal show={show} onHide={handleClose} centered size={"sm"}>
				<Modal.Body>
					<Row>
						<Col xs={12}>
							<Button
								size="sm"
								variant="danger"
								className="float-end b-r-sm"
								onClick={handleClose}
								style={{zIndex: 999}}
							>
								<FontAwesomeIcon icon="fa-xmark" size="sm" />
							</Button>
							<p className="h5 text-center mb-2 text-capitalize">Congratulations, you found the last secret question</p>
						</Col>
					</Row>
					<Row>
						<Col xs={12}>
							<div style={{ backgroundImage: `url(${QuestionImage})`, backgroundSize: 'cover', minHeight: '400px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
								<div className="p-4" style={{backgroundColor: 'rgba(0,0,0,0.6)', minHeight: '400px'}}>
									<h3 className="text-center mt-4">
										The Galactic Hideaway
									</h3>
									<p className="mt-4 mb-4 text-justified">
										To complete your quest, your final endeavor,<br/>
										Discover the place where heroes gather.<br/>
										In a cantina&apos;s hustle, where tales are spun,<br/>
										What&apos;s the name of the desert planet where the journey begun?<br/>
									</p>
									<p>A. Endor</p>
									<p>B. Tatooine</p>
									<p>C. Jakku</p>
								</div>

							</div>
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
		</div>
	);
}

export default Team;