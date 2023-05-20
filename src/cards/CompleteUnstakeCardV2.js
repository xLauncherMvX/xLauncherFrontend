import "assets/css/staking.css";
import "assets/css/globals.css";
import React from "react";
import XLHLogo from "assets/images/logo.svg";
import Image from "react-bootstrap/Image";
import {Col, Row} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import {claimUnstakeXLH, claimUnstakeSFT} from "utils/stakingV2API";
import Fade from "@mui/material/Fade/Fade";
import Tooltip from "@mui/material/Tooltip/Tooltip";

const componentsProps={
  tooltip: {
    sx: {
      maxWidth: '200px',
      backgroundColor: 'black',
      color: 'white',
      fontSize: '14px',
      fontWeight: '400',
      textAlign: 'center',
      borderRadius: '10px',
      padding: '10px',
      top: '-10px'
    },
  },
  arrow: {
    sx: {
      color: 'black',
    },
  },
  TransitionComponent: Fade,
};

export default function CompleteUnstakeCardV2({stakeV2Abi, stakeScAddress, scName, chainID, lockedTime, amount, timestamp, isSftCard, isLoggedIn}) {

  let getMethod = () => () => claimUnstakeXLH(stakeV2Abi, stakeScAddress, scName, chainID);
	if (isSftCard) {
		getMethod = () => () => claimUnstakeSFT(stakeV2Abi, stakeScAddress, scName, chainID);
	}

	const currentTimestamp = Date.now();
	let disabled = true;
	if(currentTimestamp >= timestamp && isLoggedIn){
	  disabled = false;
  }

	//Format the amount for a proper display
  let amountF= new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount.toString());
	if(isSftCard){
    amountF = amount.toString();
  }

  //Format the timestamp to human format
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  let timestampF = new Date(timestamp).toLocaleDateString(
    "en-GB",
    options
  );

  //Format the timestamp to human format for hint
  const optionsH = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const timestampFH = new Date(timestamp).toLocaleDateString(
    "en-GB",
    optionsH
  );
  let hint = "Unlocking Full Date: " + timestampFH;

  //Show a timer if timestamp is not reached
  let label = `Claim Unstake ${isSftCard ? 'SFT' : 'XLH'}`;
  const diff = timestamp - currentTimestamp;

  const unlockedTimeItemCUDays = Math.floor(diff / 86400000);
  const unlockedTimeItemCUHours = Math.floor(diff / 3600000) % 24;
  const unlockedTimeItemCUMinutes = Math.floor(diff / 60000) % 60;
  const unlockedTimeItemCUSeconds = Math.floor(diff / 1000) % 60;
  if (diff <= 0) {
    label = `Claim Unstake ${isSftCard ? 'SFT' : 'XLH'}`;
  } else if (diff < 60000) {
    label = `Unlocks in ${unlockedTimeItemCUSeconds}S`;
  } else if (diff < 3600000) {
    label = `Unlocks in ${unlockedTimeItemCUMinutes}M`;
  } else if (diff < 86400000) {
    label = `Unlocks in ${unlockedTimeItemCUHours}H`;
  } else {
    label = `Unlocks in ${unlockedTimeItemCUDays}D`;
  }

  if(amount <= 0){
    label = `Claim Unstake ${isSftCard ? 'SFT' : 'XLH'}`;
    disabled = true;
  }

  if(!isLoggedIn){
    hint = '';
    timestampF = '-';
  }

	return (
		<div className="farming-card claim-unstake-items" style={{minHeight: '100px'}}>
			<div className="d-flex mb-4 align-items-center">
				<Image
					width={42}
					height={35}
					alt="18x18"
					src={XLHLogo}
					style={{filter: 'saturate(4)'}}
				/>
				<div className="ms-2">
					<p className="farm-title">Claim Unstaked {isSftCard ? 'SFT' : 'XLH'}</p>
					<p className="locked-text">{lockedTime}</p>
				</div>
			</div>
			<div>
				<div className="d-flex justify-content-between align-items-end">
					<p className="details-text">Unstaked {isSftCard ? 'SFT Amount' : 'XLH'}:</p>
					<p className="details-text text-white">{amountF}</p>
				</div>
				<div className="d-flex justify-content-between align-items-end">
					<p className="details-text">Unlocking Date:</p>
					<p className="details-text text-white">{timestampF}</p>
				</div>
			</div>
			<div className="light-divider" style={{width: '100%', marginLeft: 0, marginBottom: '5px'}}></div>

			<Row>
				<Col xs={12} md={12} lg={12} className="mt-2">
          <Tooltip key="unstake" title={hint} arrow placement="bottom" componentsProps={componentsProps}>
					  <div>
              <Button
                variant="info"
                size="small"
                className="btn btn-block farms-button"
                style={{minWidth: "90px"}}
                onClick={getMethod}
                disabled={disabled}
              >
                {label}
              </Button>
            </div>
          </Tooltip>
				</Col>
			</Row>
		</div>
	);
}
