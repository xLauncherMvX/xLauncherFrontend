import "assets/css/staking.css";
import "assets/css/globals.css";
import React, {useState} from "react";
import rank1logo from "assets/images/ranks/rank1.png";
import rank2logo from "assets/images/ranks/rank2.png";
import rank3logo from "assets/images/ranks/rank3.png";
import Image from "react-bootstrap/Image";
import {Col, Row} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAnglesUp, faAnglesDown, faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Slider from "@mui/material/Slider";
import {calc2, intlNumberFormat} from "utils/utilities";
import Modal from "@mui/material/Modal";
import {stake as stakeMethod, unstake as unstakeMethod, claim as claimMethod} from "utils/stakingV2API";
import ProgressBar from 'react-bootstrap/ProgressBar';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	boxShadow: 5,
	backgroundColor: '#060b28f0',
	borderRadius: "25px",
	p: 4
};

const componentsProps = {
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

export default function StakingV2Card({
																				stakeV2Abi, stakeScAddress, scName, chainID, stakeToken, poolId,
																				title, tier, sftNumber, myXLH, myRewards, xlhBalance, isLoggedIn,
																				maxXLH, capacityPercentage,
																				stake, unstake, claim, loadingTransactions
																			}) {
	const [visible, setVisible] = useState(false);

	if (!isLoggedIn) {
		stake.disabled = true;
		claim.disabled = true;
		unstake.disabled = true;

		claim.hint = '';
		unstake.hint = '';
	}

	//Set the amount of xlh for staking from the input or max button
	const [xlhAmountS, setXlhAmountS] = useState(0);
	const handleSliderChangeS = (event) => {
		setXlhAmountS(parseFloat(event.target.value));
	};
	const handleInputChangeS = (event) => {
		if (event.target.value === '') {
			setXlhAmountS(0); // or any other default value you want
		} else {
			setXlhAmountS(parseFloat(event.target.value));
		}
	};

	let maxS;
	if (xlhBalance > maxXLH) {
		maxS = maxXLH;
	} else {
		maxS = xlhBalance;
	}
	const setMaxAmountS = () => {
		let newAmount = parseFloat(maxS);
		setXlhAmountS(calc2(newAmount));
	};

	//Stake Function settings
	const [openS, setOpenS] = useState(false);
	const handleOpenS = () => setOpenS(true);
	const handleCloseS = () => {
		setOpenS(false);
		setXlhAmountS(0);
	};

	//Set the amount of xlh for unstaking from the input or max button
	const [xlhAmountU, setXlhAmountU] = React.useState(0);
	const handleSliderChangeU = (event) => {
		setXlhAmountU(parseFloat(event.target.value));
	};
	const handleInputChangeU = (event) => {
		if (event.target.value === '') {
			setXlhAmountU(0); // or any other default value you want
		} else {
			setXlhAmountU(parseFloat(event.target.value));
		}
	};
	const setMaxAmountU = () => {
		let newAmountU = parseFloat(myXLH);
		setXlhAmountU(calc2(newAmountU));
	};

	//Unstake Function settings
	const [openU, setOpenU] = useState(false);
	const handleOpenU = () => setOpenU(true);
	const handleCloseU = () => {
		setOpenU(false);
		setXlhAmountU(0);
	};

	//Main methods
	const getMethodS = (poolId) => () => {
		stakeMethod(stakeV2Abi, stakeScAddress, scName, chainID, stakeToken, xlhAmountS, poolId);
		setOpenS(false);
	};
	const getMethodC = (poolId) => () => claimMethod(stakeV2Abi, stakeScAddress, scName, chainID, poolId);
	const getMethodU = (poolId) => () => {
		unstakeMethod(stakeV2Abi, stakeScAddress, scName, chainID, stakeToken, xlhAmountU, poolId);
		setOpenU(false);
	};

	//Calculate the max amount of xlh that can be staked in current pool
	let currentPoolXLh = 0;
	if (maxXLH) currentPoolXLh = 1000000 - maxXLH;

	//Change the logo based on farm tier
	let logo = rank1logo;
	switch (tier) {
		case "1":
			logo = rank1logo;
			break;
		case "2":
			logo = rank2logo;
			break;
		case "3":
			logo = rank3logo;
			break;
	}

	//Calculate apr based on staked sfts
	let apr = sftNumber ? (sftNumber * 1.5 + 15) : 15;
	if (apr > 30) apr = 30;

	//Set disable stake/unstake if the requested amount is not in range
	let disabledS = false;
	if (xlhAmountS > maxS || xlhAmountS <= 0.1 || !xlhAmountS) {
		disabledS = true;
	}

	let disabledU = false;
	if (xlhAmountU > myXLH || xlhAmountU <= 0.1 || !xlhAmountU) {
		disabledU = true;
	}

	//Change color of rewards to green when the reached amount is higher that set value
	let myRewardsColor = 'white';
	if (myRewards >= 0.1) {
		myRewardsColor = "lexaloffle-green";
		claim.disabled = false;
	}

	//disable modals / buttons if there is any loading transactions
	if(loadingTransactions){
		stake.disabled = true;
		unstake.disabled = true;
		claim.disabled = true;
		disabledS = true;
		disabledU = true;
	}


	return (
		<div className="farming-card" id={"id" + title.toString()}>
			<div className="float-end">
				{!visible ? (
					<Tooltip key="show" title="Show Extra" arrow placement="bottom" componentsProps={componentsProps}>
						<Button variant="text" onClick={() => setVisible(!visible)}>
							<FontAwesomeIcon fontSize={"medium"} icon={faAnglesDown} color="white"/>
						</Button>
					</Tooltip>
				) : (
					<Tooltip key="hide" title="Hide extra" arrow placement="bottom" componentsProps={componentsProps}>
						<Button variant="text" className="float-right" onClick={() => setVisible(!visible)}>
							<FontAwesomeIcon fontSize={"medium"} icon={faAnglesUp} color="white"/>
						</Button>
					</Tooltip>
				)}
			</div>
			<div className="d-flex align-items-center justify-content-between">
				<div className="text-center">
					<Image
						width={63}
						height={56}
						alt="18x18"
						src={logo}
						style={{filter: 'saturate(8)'}}
					/>
				</div>
				<div className="mx-auto text-center">
					<p className="farm-title" style={{fontSize: '18px'}}>{title}</p>
				</div>
			</div>
			<p className="rank-text mt-1 text-info ms-3">Tier</p>

			<div>
				<ProgressBar animated now={capacityPercentage}/>
				<p className="text-center text-white"
					 style={{fontSize: '12px', marginTop: '3px'}}>Capacity: {intlNumberFormat(calc2(currentPoolXLh))} / {intlNumberFormat(1000000, "en-GB", 0, 0)}</p>
			</div>

			<div className="light-divider" style={{width: '100%', marginLeft: 0, marginBottom: '5px'}}></div>
			<div className="mt-2" style={{minHeight: '75px'}}>
				<div className="d-flex justify-content-between align-items-end">
					<p className="details-text">My APR:</p>
					<p className="details-text text-white">{myXLH ? (apr + '%'): ('-')}</p>
				</div>
				<div className="d-flex justify-content-between align-items-end">
					<p className="details-text">My Staked XLH:</p>
					<p className="details-text text-white">{intlNumberFormat(myXLH)}</p>
				</div>
				<div className="d-flex justify-content-between align-items-end">
					<p className="details-text">My Earned XLH:</p>
					<p className={`details-text text-${myRewardsColor}`}>{intlNumberFormat(myRewards)}</p>
				</div>
			</div>
			<div className="light-divider" style={{width: '100%', marginLeft: 0, marginBottom: '5px'}}></div>

			<Row>
				<Col xs={12} md={6} lg={6} className="mt-2">
					<Button
						variant={stake.color}
						size={stake.size}
						className="btn btn-block farms-button"
						style={{minWidth: "90px"}}
						onClick={handleOpenS}
						disabled={stake.disabled}
					>
						{stake.label}
					</Button>
				</Col>
				<Col xs={12} md={6} lg={6} className="mt-2">
					<Tooltip key="claim" title={claim.hint} arrow placement="bottom" componentsProps={componentsProps}>
						<div>
							<Button
								variant={claim.color}
								size={claim.size}
								className="btn btn-block farms-button"
								style={{minWidth: "90px", width: '100%'}}
								onClick={getMethodC(poolId)}
								disabled={claim.disabled}
							>
								{claim.label}
							</Button>
						</div>
					</Tooltip>
				</Col>
			</Row>

			{visible ? (
				<Row>
					<Col xs={12} md={6} lg={6} className="mt-2">
						<Tooltip key="unstake" title={unstake.hint} arrow placement="bottom" componentsProps={componentsProps}>
							<div>
								<Button
									variant={unstake.color}
									size={unstake.size}
									className="btn btn-block farms-button"
									style={{minWidth: "90px", width: '100%'}}
									onClick={handleOpenU}
									disabled={unstake.disabled}
								>
									{unstake.label}
								</Button>
							</div>
						</Tooltip>
					</Col>
				</Row>
			) : ('')}

			{/*Stake Modal*/}
			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={openS}
				onClose={handleCloseS}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={openS}>
					<Box sx={style}>
						<div style={{minHeight: "250px"}} className="farm-card">
							<div className="d-flex align-items-center justify-content-between" style={{marginLeft: '-10px'}}>
								<div className="text-center">
									<Image
										width={63}
										height={56}
										alt="18x18"
										src={logo}
										style={{filter: 'saturate(8)'}}
									/>
								</div>
								<div className="mx-auto text-center">
									<p className="farm-title" style={{fontSize: '18px', marginLeft: '-30px'}}>{title}</p>
								</div>
							</div>
							<p className="rank-text mt-1 text-info ms-2">Tier</p>
							<div id="transition-modal-description" className="mt-5">
								<Row className="mb-2">
									<Col xs={12}>
										<Input
											value={xlhAmountS}
											size="small"
											placeholder="XLH Amount"
											onChange={handleInputChangeS}
											onKeyPress={(event) => {
												if (!/[0-9.]/.test(event.key)) {
													event.preventDefault();
												}
											}}
											disableUnderline
											disabled={false}
											className="text-white ps-3 pe-5 pt-1 b-r-md"
											style={{border: '0.5px solid rgb(74, 85, 104)', width: '100%'}}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={9}>
										<Slider
											value={xlhAmountS}
											onChange={handleSliderChangeS}
											step={100}
											min={0}
											max={maxS}
											className="text-white"
											style={{marginLeft: '10px'}}
										/>
									</Col>
									<Col xs={3}>
										<Button
											className="btn btn-block btn-outline-info btn-sm text-white"
											onClick={() => setMaxAmountS()}
											style={{fontSize: '11px', paddingBottom: '2px'}}
										>
											Max
										</Button>
									</Col>
								</Row>
								<p className="font-size-sm text-white text-capitalize">
									Balance: {intlNumberFormat(xlhBalance)} XLH
								</p>
								<p className="font-size-sm text-white text-capitalize mb-5" style={{marginTop: '-10px'}}>
									Max Staking Amount: {intlNumberFormat(maxS)} XLH
								</p>
								<Row className="mt-5">
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-info"
											style={{minWidth: "90px"}}
											onClick={getMethodS(poolId)}
											disabled={disabledS}
										>
											Stake
										</Button>
									</Col>
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-outline-light"
											style={{minWidth: "90px"}}
											onClick={handleCloseS}
										>
											Cancel
										</Button>
									</Col>
								</Row>
							</div>
						</div>
					</Box>
				</Fade>
			</Modal>

			{/*Unstake Modal*/}
			<Modal
				aria-labelledby="transition-modal-title2"
				aria-describedby="transition-modal-description2"
				open={openU}
				onClose={handleCloseU}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={openU}>
					<Box sx={style}>
						<div style={{minHeight: "250px"}} className="farm-card">
							<div className="d-flex align-items-center justify-content-between" style={{marginLeft: '-10px'}}>
								<div className="text-center">
									<Image
										width={63}
										height={56}
										alt="18x18"
										src={logo}
										style={{filter: 'saturate(8)'}}
									/>
								</div>
								<div className="mx-auto text-center">
									<p className="farm-title" style={{fontSize: '18px', marginLeft: '-30px'}}>{title}</p>
								</div>
							</div>
							<p className="rank-text mt-1 text-info ms-2">Tier</p>
							<div id="transition-modal-description2" className="mt-5">
								<Row className="mb-2">
									<Col xs={12}>
										<Input
											value={xlhAmountU}
											size="small"
											placeholder="XLH Amount"
											onChange={handleInputChangeU}
											onKeyPress={(event) => {
												if (!/[0-9.]/.test(event.key)) {
													event.preventDefault();
												}
											}}
											disableUnderline
											disabled={false}
											className="text-white ps-3 pe-5 pt-1 b-r-md"
											style={{border: '0.5px solid rgb(74, 85, 104)', width: '100%'}}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={9}>
										<Slider
											value={xlhAmountU}
											onChange={handleSliderChangeU}
											step={100}
											min={0}
											max={(calc2(myXLH))}
											className="text-white"
											style={{marginLeft: '10px'}}
										/>
									</Col>
									<Col xs={3}>
										<Button
											className="btn btn-block btn-outline-info btn-sm text-white"
											onClick={setMaxAmountU}
											style={{fontSize: '11px', paddingBottom: '2px'}}
										>
											Max
										</Button>
									</Col>
								</Row>
								<p className="font-size-sm text-white text-capitalize">
									Available: {intlNumberFormat(myXLH)} XLH
								</p>
								<Row className="mt-5">
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-info"
											style={{minWidth: "90px"}}
											onClick={getMethodU(poolId)}
											disabled={disabledU}
										>
											Unstake
										</Button>
									</Col>
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-outline-light"
											style={{minWidth: "90px"}}
											onClick={handleCloseU}
										>
											Cancel
										</Button>
									</Col>
								</Row>
							</div>
						</div>
					</Box>
				</Fade>
			</Modal>
		</div>
	);
}
