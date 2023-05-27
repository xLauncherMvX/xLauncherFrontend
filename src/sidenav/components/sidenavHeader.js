import {ReactComponent as XLauncherLogo} from "assets/images/logo.svg";
import {useProSidebar} from "react-pro-sidebar";
import 'assets/css/sidenavHeader.css';
import 'assets/css/globals.css';
import React from "react";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {openInNewTab} from "utils/utilities";
import WebsiteIcon from '@mui/icons-material/Public';
import IconButton from "@mui/material/IconButton";
import {networkId, customConfig} from "config/customConfig";
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from '@mui/icons-material/Telegram';


export const SidenavHeader = () => {
	const config = customConfig[networkId];
	const {toggleSidebar, broken} = useProSidebar();

	return (
		<React.Fragment>
			<div className='styled-sidebar-header'>
				<div className='styled-sidebar-header-div'>
					<XLauncherLogo className="logo"/>
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
					<WebsiteIcon fontSize="small"/>
				</IconButton>
				<IconButton className="float-right text-white" onClick={() => openInNewTab("https://twitter.com/XLauncher_")}>
					<TwitterIcon fontSize="small"/>
				</IconButton>
				<IconButton className="float-right text-white" onClick={() => openInNewTab("https://t.me/XLauncherChat")}>
					<TelegramIcon fontSize="small"/>
				</IconButton>
			</div>
		</React.Fragment>
	);
};