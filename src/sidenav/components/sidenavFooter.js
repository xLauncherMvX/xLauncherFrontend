import {Star} from "assets/svg/Star";
import 'assets/css/sidenavFooter.css';
import 'assets/css/globals.css';
import React from "react";

const codeUrl = 'https://x-launcher.com/files/Whitepaper.pdf';
const codeUrl_ro = 'https://x-launcher.com/files/Whitepaper_ro.pdf';

export const SidenavFooter = () => {
	return (
		<div className='sidenav-container'>
			<div>
				<div className='star-container'>
					<Star className="star-logo"/>
				</div>
				<div className='card-container'>
					<p className="h6">Need more info?</p>

				</div>
				<div className='d-grid gap-2 button-container'>
					<a href={codeUrl} target='_blank' rel="noreferrer" className='btn btn-gradient-dark btn-sm'>
						Whitepaper EN
					</a>
					<a href={codeUrl_ro} target='_blank' rel="noreferrer" className='btn btn-gradient-dark btn-sm'>
						Whitepaper RO
					</a>
				</div>
			</div>
		</div>
	);
};