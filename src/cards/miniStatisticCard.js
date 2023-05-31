import React from "react";
import {MdOutlineDriveFileRenameOutline} from "react-icons/md";
import {Icon} from "@mui/material";

export function MiniStatisticCard({icon, title, description, value, border}){

	return (
		<div className={`mini-statistic-card text-center  ${border}`}>
			<div className="bg-primary text-white p-3 b-r-sm mx-auto mt-2" style={{width: "65px", mineight: '65px'}}>
				<Icon component={icon} color="white" style={{fontSize: '35px'}}/>
			</div>
			<p className="text-white h5 mt-4">{title}</p>
			<p className="text-muted font-size-sm">{description}</p>
			<div className='light-divider'></div>
			<p className="text-white font-bold font-size-lg">{value}</p>
		</div>
	);
}