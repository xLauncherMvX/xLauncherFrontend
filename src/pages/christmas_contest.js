import React, {useState} from "react";
import {Col, Row, Card} from 'react-bootstrap';
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {openInNewTab} from "utils/utilities";

function ChristmasContest(props) {
	return (
		<div>
			<Row>
        <Col xs={12} className="text-center mt-5">
					<p
						className="text-white font-bold mt-4"
						style={{ fontSize: "40px" }}
					>
						Christmas Contest
					</p>
        </Col>
      </Row>
		</div>
	);
}

export default ChristmasContest;