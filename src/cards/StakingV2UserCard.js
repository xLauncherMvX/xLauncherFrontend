import "assets/css/staking.css";
import "assets/css/globals.css";
import React, { useState } from "react";
import XLHLogo from "assets/images/logo.svg";
import Image from "react-bootstrap/Image";
import { Col, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Slider from "@mui/material/Slider";
import {calc2, intlNumberFormat} from "../utils/utilities";
import Modal from "@mui/material/Modal";
import {stakeSFT as stakeMethod, unstakeSFT as unstakeMethod} from "utils/stakingV2API";


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

export default function StakingV2UserCard({
    stakeV2Abi, stakeScAddress, scName, chainID, sft, address,
    title, sftBalance, isLoggedIn,
    sftNumber, totalStaked, totalRewards, createdFarms,
    stake, unstake, loadingTransactions
}) {
    if(!isLoggedIn){
        stake.disabled = true;
        unstake.disabled = true;

        unstake.hint = '';
    }

    //Set the amount of sft for staking from the input or max button
    const [amountS, setAmountS] = useState(0);
    const handleSliderChangeS = (event) => {
        setAmountS(parseInt(event.target.value));
    };
    const handleInputChangeS = (event) => {
        if (event.target.value === '') {
            setAmountS(0); // or any other default value you want
        } else {
            setAmountS(parseInt(event.target.value));
        }
    };

    let sAux =  10 - sftNumber;
    let maxS;
    if(sftBalance > sAux){
        maxS = sAux;
    }else{
        maxS = sftBalance;
    }
    const setMaxAmountS = () => {
        setAmountS(parseInt(maxS));
    };

    //Stake Function settings
    const [openS, setOpenS] = useState(false);
    const handleOpenS = () => setOpenS(true);
    const handleCloseS = () => {
        setOpenS(false);
        setAmountS(0);
    };

    //Set the amount of sft for unstaking from the input or max button
    const [amountU, setAmountU] = React.useState(0);
    const handleSliderChangeU = (event) => {
        setAmountU(parseInt(event.target.value));
    };
    const handleInputChangeU = (event) => {
        if (event.target.value === '') {
            setAmountU(0); // or any other default value you want
        } else {
            setAmountU(parseInt(event.target.value));
        }
    };
    const setMaxAmountU = () => {
        setAmountU(parseInt(sftNumber));
    };

    //Unstake Function settings
    const [openU, setOpenU] = useState(false);
    const handleOpenU = () => setOpenU(true);
    const handleCloseU = () => {
        setOpenU(false);
        setAmountU(0);
    };

    const getMethodS = () => () => {
        stakeMethod(stakeV2Abi, stakeScAddress, scName, chainID, sft, address, amountS)
        setOpenS(false);
    };
    const getMethodU = () => () => {
        unstakeMethod(stakeV2Abi, stakeScAddress, scName, chainID, amountU)
        setOpenU(false);
    };

    let apr = sftNumber ? (sftNumber * 1.5 + 15) : 15;
    if (apr > 30) apr = 30;

    let disabledS = false;
    if(amountS > maxS || amountS < 1 || !amountS){
        disabledS = true;
    }

    let disabledU = false;
    if(amountU > sftNumber || amountU < 1 || !amountU){
        disabledU = true;
    }

    //disable modals / buttons if there is any loading transactions
    if(loadingTransactions){
        stake.disabled = true;
        unstake.disabled = true;
        disabledS = true;
        disabledU = true;
    }

    return (
        <div className="farming-card" id={"user_panel"}>
            <div className="d-flex align-items-center justify-content-between">
                <div className="text-center">
                    <Image
                      width={49}
                      height={42}
                      alt="18x18"
                      src={XLHLogo}
                      style={{filter: 'saturate(4)'}}
                    />
                </div>
                <div className="mx-auto">
                    <p className="farm-title" style={{fontSize: '18px', marginLeft: '-30px'}}>{title}</p>
                </div>
            </div>
            <div className="light-divider" style={{ width: '100%', marginLeft: 0, marginBottom: '5px' }}> </div>
            <div className="mt-2" style={{minHeight: '159px'}}>
                <div className="d-flex justify-content-between align-items-end">
                    <p className="details-text">My APR:</p>
                    <p className="details-text text-white">{apr}%</p>
                </div>
                <div className="d-flex justify-content-between align-items-end">
                    <p className="details-text">My Staked SFTs:</p>
                    <p className="details-text text-white">{sftNumber.toString()}</p>
                </div>
                <div className="d-flex justify-content-between align-items-end">
                    <p className="details-text">My Created Farms:</p>
                    <p className="details-text text-white">{createdFarms}</p>
                </div>
                <div className="light-divider" style={{ width: '100%', marginLeft: 0}}> </div>
                <div className="d-flex justify-content-between align-items-end">
                    <p className="details-text">Total Staked XLH:</p>
                    <p className="details-text text-white">{intlNumberFormat(totalStaked)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-end">
                    <p className="details-text">Total Earned XLH:</p>
                    <p className={`details-text text-white`}>{intlNumberFormat(totalRewards)}</p>
                </div>
            </div>
            <div className="light-divider" style={{ width: '100%', marginLeft: 0, marginBottom: '5px' }}> </div>

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
                    <Tooltip key="unstake" title={unstake.hint} arrow placement="bottom" componentsProps={componentsProps}>
                        <div>
                            <Button
                              variant={unstake.color}
                              size={unstake.size}
                              className="btn btn-block farms-button"
                              style={{ minWidth: "90px", width: '100%' }}
                              onClick={handleOpenU}
                              disabled={unstake.disabled}
                            >
                                {unstake.label}
                            </Button>
                        </div>
                    </Tooltip>
                </Col>
            </Row>

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
                        <div style={{ minHeight: "250px" }} className="farm-card">
                            <div className="d-flex mb-5 align-items-center">
                                <Image
                                    width={42}
                                    height={35}
                                    alt="18x18"
                                    src={XLHLogo}
                                />
                                <div id="transition-modal-title" className="ms-3 font-size-md text-capitalize text-white font-medium">
                                    Stake SFT
                                </div>
                            </div>
                            <div id="transition-modal-description" className="mt-5">
                                <Row className="mb-2">
                                    <Col xs={12}>
                                        <Input
                                            value={amountS}
                                            size="small"
                                            placeholder="SFT Amount"
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
                                            value={amountS}
                                            onChange={handleSliderChangeS}
                                            step={1}
                                            min={0}
                                            max={maxS}
                                            className="text-white ms-1"

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
                                    Available SFT Balance : {sftBalance} SFT
                                </p>
                                <p className="font-size-sm text-white text-capitalize mb-5" style={{marginTop: '-12px'}}>
                                    Max Staking Amount : {maxS} SFT
                                </p>
                                <Row className="mt-5">
                                    <Col xs={12} md={6} lg={6} className="mt-4">
                                        <Button
                                            className = "btn btn-block btn-sm btn-info"
                                            style={{ minWidth: "90px" }}
                                            onClick={getMethodS()}
                                            disabled={disabledS}
                                        >
                                            Stake SFT
                                        </Button>
                                    </Col>
                                    <Col xs={12} md={6} lg={6} className="mt-4">
                                        <Button
                                            className = "btn btn-block btn-sm btn-outline-light"
                                            style={{ minWidth: "90px" }}
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
                        <div style={{ minHeight: "250px" }} className="farm-card">
                            <div className="d-flex mb-5 align-items-center">
                                <Image
                                    width={42}
                                    height={35}
                                    alt="18x18"
                                    src={XLHLogo}
                                />
                                <div id="transition-modal-title2" className="ms-3 font-size-md text-capitalize text-white font-medium">
                                    Unstake SFT
                                </div>
                            </div>
                            <div id="transition-modal-description2" className="mt-5">
                                <Row className="mb-2">
                                    <Col xs={12}>
                                        <Input
                                            value={amountU}
                                            size="small"
                                            placeholder="SFT Amount"
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
                                            value={amountU}
                                            onChange={handleSliderChangeU}
                                            step={1}
                                            min={0}
                                            max={parseInt(sftNumber)}
                                            className="text-white ms-1"

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
                                <p className="font-size-sm text-white text-capitalize mb-5">
                                    Available SFTS: {sftNumber.toString()}
                                </p>
                                <Row className="mt-5">
                                    <Col xs={12} md={6} lg={6} className="mt-4">
                                        <Button
                                            className = "btn btn-block btn-sm btn-info"
                                            style={{ minWidth: "90px" }}
                                            onClick={getMethodU()}
                                            disabled={disabledU}
                                        >
                                            Unstake SFT
                                        </Button>
                                    </Col>
                                    <Col xs={12} md={6} lg={6} className="mt-4">
                                        <Button
                                            className = "btn btn-block btn-sm btn-outline-light"
                                            style={{ minWidth: "90px" }}
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
