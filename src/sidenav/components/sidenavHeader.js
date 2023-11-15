import {ReactComponent as XLauncherLogo} from "assets/images/logo.svg";
import {useProSidebar} from "react-pro-sidebar";
import 'assets/css/sidenavHeader.css';
import 'assets/css/globals.css';
import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {openInNewTab} from "utils/utilities";
import WebsiteIcon from '@mui/icons-material/Public';
import IconButton from "@mui/material/IconButton";
import {networkId, customConfig} from "config/customConfig";
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from '@mui/icons-material/Telegram';
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import QuestionImage from 'assets/images/starWars/question2.png';


export const SidenavHeader = () => {
	const config = customConfig[networkId];
	const {toggleSidebar, broken} = useProSidebar();

	//Star wars modal
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);

	return (
		<React.Fragment>
			<div className='styled-sidebar-header'>
				<div className='styled-sidebar-header-div'>
					<XLauncherLogo className="logo" onClick={() => setShow(true)}/>
					<p className='logo-text'>
						XLauncher
					</p>
				</div>
				{broken ? (
					<Button variant="link" size="sm" style={{width: '40px', marginLeft: '-20px'}} onClick={() => toggleSidebar()}>
						<FontAwesomeIcon icon="fa-circle-xmark"/>
					</Button>
				) : (
					''
				)}
			</div>
			<div className='light-divider' style={{marginBottom: '1px'}}></div>
			<div className="d-flex justify-content-center">
				<IconButton className="text-white" onClick={() => openInNewTab(config.website)}>
					<WebsiteIcon className="footer-links" fontSize="small"/>
				</IconButton>
				<IconButton className="float-right text-white" onClick={() => openInNewTab("https://twitter.com/XLauncher_")}>
					<TwitterIcon className="footer-links" fontSize="small"/>
				</IconButton>
				<IconButton className="float-right text-white" onClick={() => openInNewTab("https://t.me/XLauncherChat")}>
					<TelegramIcon className="footer-links" fontSize="small"/>
				</IconButton>
			</div>
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
							<p className="h5 text-center mb-2 text-capitalize">Congratulations, you found the second secret question</p>
						</Col>
					</Row>
					<Row>
						<Col xs={12}>
							<div style={{ backgroundImage: `url(${QuestionImage})`, backgroundSize: 'cover', minHeight: '400px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
								<div className="p-4" style={{backgroundColor: 'rgba(0,0,0,0.6)', minHeight: '400px'}}>
									<h3 className="text-center mt-4">
										The Sith&apos;s Betrayal
									</h3>
									<p className="mt-4 mb-4 text-justified">
										In the shadows of the dark side&apos;s might, <br/>
										Uncover the tale of a Sith&apos;s deceitful plight.<br/>
										In a galaxy far, far away, where hatred brews,<br/>
										Who betrayed the Jedi and became Darth Vader?
									</p>
									<p>A. Anakin Skywalker</p>
									<p>B. Count Dooku</p>
									<p>C. Darth Maul</p>
								</div>

							</div>
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
		</React.Fragment>
	);
};