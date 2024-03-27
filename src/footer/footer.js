import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import WebsiteIcon from '@mui/icons-material/Public';
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from '@mui/icons-material/Telegram';
import {openInNewTab} from "utils/utilities";
import {networkId, customConfig} from "config/customConfig";

export function Footer() {
	const config = customConfig[networkId];

	return (
		<div className="text-white text-center mt-5" style={{marginBottom: '-25px'}}>
			<p className="font-size-lg">
				&copy; {new Date().getFullYear()} made with&nbsp;
				<FontAwesomeIcon icon={faHeart} style={{color: "red"}}/>&nbsp;
				by the<span className="font-bold"> XLauncher Team</span>
				<WebsiteIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab(config.website)} sx={{marginTop: '-2px'}}/>
				<TwitterIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab("https://twitter.com/XLauncherHub")} sx={{marginTop: '-2px'}}/>
				<TelegramIcon className="footer-links ms-1" fontSize="small" onClick={() => openInNewTab("https://t.me/XLauncherChat")} sx={{marginTop: '-2px'}}/>
			</p>
		</div>
	);
}