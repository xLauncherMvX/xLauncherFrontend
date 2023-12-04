import React, {useState, useEffect} from "react";
import {Col, Row, Card} from 'react-bootstrap';
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {openInNewTab} from "utils/utilities";
import CustomCountdown from "../components/countdown";

function ChristmasContest(props) {

	const timestamps = [
		0,
		1701700060000,
		1701700100000,
		1701697420000,
		1701698460000,
		1701698480000,
	];
	const words = [
		'',
		'book',
		'table',
		'car',
		'chair',
		'window'
	];
	let step = 0;
	const currentTimestamp = new Date().valueOf();
	let label = 'First Riddle Reveals in';
	let timestamp = timestamps[0];
	let nextTimestamp = timestamps[1];
	let word = words[0];

	if (currentTimestamp < timestamps[1]) {
		label = 'First Riddle Reveals in';
		step = 0;
		word = words[0];
		console.log("step0");
	} else if (currentTimestamp >= timestamps[1] && currentTimestamp < timestamps[2]) {
		label = 'Second Riddle Reveals in';
		step = 1;
		word = words[1];
		console.log("step1");
	} else {
		// Add additional conditions as needed
	}

	return (
		<div style={{backgroundColor: 'rgba(0,0,0,0.5)'}} className="mt-2">
			<Row>
				<Col xs={12} lg={12} className="text-center">
					{step === 0 && <CustomCountdown startTitle={label} titleStyles="h1 text-white font-bold" startTimestamp={timestamps[1]}/>}
					{step === 1 && <CustomCountdown startTitle={label} titleStyles="h1 text-white font-bold" startTimestamp={timestamps[2]}/>}
				</Col>
			</Row>
		</div>
	);
}

export default ChristmasContest;