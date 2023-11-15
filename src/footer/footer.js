import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import WebsiteIcon from '@mui/icons-material/Public';
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from '@mui/icons-material/Telegram';
import {openInNewTab} from "utils/utilities";
import {networkId, customConfig} from "config/customConfig";
import Image from "react-bootstrap/Image";
import StarWarsImage from '../assets/images/starWars/star_wars_text2.png';
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import QuestionImage from 'assets/images/starWars/question1.png';
import {useProSidebar} from "react-pro-sidebar";


export function Footer() {
	const config = customConfig[networkId];

	//Star wars modal
	const { broken } = useProSidebar();
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);


	return (
		<div className="text-white text-center mt-5" style={{marginBottom: '-25px'}}>
			{broken ? (
				<Image src={StarWarsImage} height={20} width="100%" onClick={() => setShow(true)}/>
			):(
				<Image src={StarWarsImage} height={30} onClick={() => setShow(true)}/>
			)}
			<p className="font-size-lg">
				&copy; {new Date().getFullYear()} made with&nbsp;
				<FontAwesomeIcon icon={faHeart} style={{color: "red"}}/>&nbsp;
				by the<span className="font-bold"> XLauncher Team</span>
				<WebsiteIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab(config.website)} sx={{marginTop: '-2px'}}/>
				<TwitterIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab("https://twitter.com/XLauncher_")} sx={{marginTop: '-2px'}}/>
				<TelegramIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab("https://t.me/XLauncherChat")} sx={{marginTop: '-2px'}}/>
			</p>

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
							<p className="h5 text-center mb-2 text-capitalize">Congratulations, you found the first secret question</p>
						</Col>
					</Row>
					<Row>
						<Col xs={12}>
							<div style={{ backgroundImage: `url(${QuestionImage})`, backgroundSize: 'cover', minHeight: '400px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
								<div className="p-4" style={{backgroundColor: 'rgba(0,0,0,0.6)', minHeight: '400px'}}>
									<h3 className="text-center mt-4">
										The Jedi&apos;s Wisdom
									</h3>
									<p className="mt-4 mb-4 text-justified">
										From the desert planet, where twin suns set,<br/>
										Seek the wisdom of a Jedi, don&apos;t forget.<br/>
										In a place of learning, where knowledge flows,<br/>
										Who said, &apos;Do, or do not. There is no try&apos; as wise Jedi glows?
									</p>
									<p>A. Yoda</p>
									<p>B. Obi-Wan Kenobi</p>
									<p>C. Mace Windu</p>
								</div>

							</div>
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
		</div>
	);
}