import React from "react";
import {MdOutlineDriveFileRenameOutline} from "react-icons/md";
import {Card} from 'react-bootstrap';

export function MiniNFTRankCard({image, title, border}){

	return (
		<div className={`mini-statistic-card text-center  ${border}`}>
			<div className="mx-auto mb-4 mt-2">
				<Card.Img variant="top" src={image} style={{borderRadius: "15px", height: "155px", width: 'auto'}}/>
			</div>
			<div className="light-divider" style={{ width: '100%', marginLeft: 0 }}> </div>
			<p className="text-white h5">{title}</p>
		</div>
	);
}