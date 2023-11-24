import React, {useEffect, useState} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import picture from "assets/gif/animation.gif.mp4";
import Container from "@mui/material/Container";
import TextField from '@mui/material/TextField';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import CustomCountdown from "components/countdown";
import CustomProgressBar from "components/progress_bar";
import toast, {Toaster} from 'react-hot-toast';
import BigNumber from 'bignumber.js';
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import {intlNumberFormat, openInNewTab} from "utils/utilities";

import {contractQuery} from "utils/api";
import {customConfig, networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/coding_division_mint.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus} from "@fortawesome/free-solid-svg-icons";
import {
  AbiRegistry,
  Address,
  SmartContract,
  TokenTransfer,
  U64Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";
import {UpdateMintPrice} from "../../components/UpdateBloodshedPrice";

function CodingDivisionMint() {
  //Set the config network
  const config = customConfig[networkId];
  const {address} = useGetAccountInfo();

  const isLoggedIn = address.startsWith("erd");
  const networkProvider = new ProxyNetworkProvider(config.provider);
  const scAddress = "erd1qqqqqqqqqqqqqpgqkqjzwtwnlw0ew2lv6cmvvff252fqsxvjwmfsx5qpap";
  const scName = "SellSftsContract";
  const scToken = "OURO-9ecd6a";
  const chainID = networkConfig[networkId].shortId;
  const tokensAPI = config.apiLink + address + "/tokens?size=2000";
  const [mintCount, setMintCount] = useState(0);
  const [mintPrice, setMintPrice] = useState(0.0);
  const totalCount = 504;
  const startTimestamp = 1700848800000;

  //get loading transactions
  const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;

  //Balance
  const [ouroBalance, setOuroBalance] = useState(0.0);
  const getWalletData = async () => {
    try {
      const response = await fetch(tokensAPI, {
        headers: {
          Accept: "application/json",
        },
      });
      const json = await response.json();
      if (json) {
        json.forEach((item) => {
          if (item.identifier === scToken) {
            let auxBalance = new BigNumber(item.balance).shiftedBy(-18);
            setOuroBalance(parseFloat(auxBalance.toJSON()));
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Get payment Data + left count
  const [ouroData, setOuroData] = useState({identifier: '', nonce: 0, amount: 0});
  const [leftCount, setLeftCount] = useState(0);
  const getMintInfo = async () => {
    const tokenPayment1 = await contractQuery(
      networkProvider,
      abiFile,
      scAddress,
      scName,
      "getFirstTokenPayment",
      []
    );
    if (tokenPayment1) {
      let auxAmount = new BigNumber(tokenPayment1.amount).shiftedBy(-18);
      setOuroData({
        identifier: tokenPayment1.token_identifier,
        nonce: tokenPayment1.token_nonce,
        amount: parseFloat(auxAmount.toJSON())
      })
    }

    const leftData = await contractQuery(
      networkProvider,
      abiFile,
      scAddress,
      scName,
      "getTokensLeft",
      []
    );
    if (leftData) {
      setLeftCount(parseInt(leftData.toJSON()));
    }
  };

  const currentTimestamp = new Date().getTime();
  let mintIsOpen = false;
  if (startTimestamp - currentTimestamp <= 0) {
    mintIsOpen = true;
  }

  //+/- buttons
  const increaseAmount = (amount) => {
    if (mintCount > leftCount) {
      toast.error(
        "Not enough SFTS left",
        {
          position: 'top-right',
          duration: 1500,
          style: {
            border: '1px solid red'
          }
        }
      );
      return;
    }

    let newValue = mintCount + amount;
    setMintCount(newValue);
    let auxPrice = new BigNumber(ouroData.amount).multipliedBy(newValue);
    auxPrice = parseFloat(auxPrice.toJSON());
    setMintPrice(auxPrice);
  };

  const decreaseAmount = (amount) => {
    let newValue = mintCount - amount;

    if (newValue <= 0) {
      toast.error(
        "You cannot mint less than 1 SFT",
        {
          position: 'top-right',
          duration: 1500,
          style: {
            border: '1px solid red'
          }
        }
      );
      return;
    }

    if (newValue > 0) {
      setMintCount(newValue);
      let auxPrice = new BigNumber(ouroData.amount).multipliedBy(newValue);
      auxPrice = parseFloat(auxPrice.toJSON());
      setMintPrice(auxPrice);
    }
  };

  // input function
  const handleInputChange = (event) => {
    let newValue = event.target.value;
    if (newValue === '' || !newValue) {
      newValue = 0;
    }
    setMintCount(parseInt(newValue));
    let auxPrice = new BigNumber(ouroData.amount).multipliedBy(newValue);
    auxPrice = parseFloat(auxPrice.toJSON());
    setMintPrice(auxPrice);
  };

  let disabledButtons = true;
  if (isLoggedIn && (leftCount > 0) && !loadingTransactions) {
    disabledButtons = false;
  }

  //gasLimit
  let gasLimit = 25000000 + (2300000 * mintCount);

  //Mint Function
  const mintFunction = async (quantity, price) => {
    if (mintCount === 0 || !mintCount) {
      toast.error(
        "You cannot mint 0 SFTS",
        {
          position: 'top-right',
          duration: 1500,
          style: {
            border: '1px solid red'
          }
        }
      );
      return
    }
    if (mintCount > leftCount) {
      toast.error(
        "Not enough SFTS left",
        {
          position: 'top-right',
          duration: 1500,
          style: {
            border: '1px solid red'
          }
        }
      );
      return
    }

    try {
      let abiRegistry = AbiRegistry.create(abiFile);
      let contract = new SmartContract({
        address: new Address(scAddress),
        abi: abiRegistry
      });

      const transaction = contract.methodsExplicit
        .mint([new U64Value(quantity)])
        .withChainID(chainID)
        .withSingleESDTTransfer(
          TokenTransfer.fungibleFromAmount(ouroData.identifier, price, 18)
        )
        .buildTransaction();

      const mintTransaction = {
        value: 0,
        data: Buffer.from(transaction.getData().valueOf()),
        receiver: scAddress,
        gasLimit: gasLimit
      };
      await refreshAccount();

      const {sessionId} = await sendTransactions({
        transactions: mintTransaction,
        transactionsDisplayInfo: {
          processingMessage: 'Processing Mint transaction',
          errorMessage: 'An error has occurred during Mint transaction',
          successMessage: 'Mint transaction successful'
        },
        redirectAfterSign: false
      });

    } catch (error) {
      console.error(error);
    }
  };

  // Buy element
  const buyButton = () => {
    if (!mintIsOpen) {
      return (
        <Button
          className="btn btn-block btn-sm btn-info mt-3"
          style={{minWidth: "90px"}}
          onClick={() => {
            toast.error(
              "Mint not started",
              {
                position: 'top-right',
                duration: 1500,
                style: {
                  border: '1px solid red'
                }
              }
            );
          }}
        >
          Mint not started
        </Button>
      );
    }

    if (mintPrice > ouroBalance) {
      return (
        <Button
          className="btn btn-block btn-sm btn-info mt-3"
          style={{minWidth: "90px"}}
          onClick={() => {
            toast.error(
              `Insufficient OURO`,
              {
                position: 'top-right',
                duration: 1500,
                style: {
                  border: '1px solid red'
                }
              }
            );
          }}
        >
          Insufficient OURO
        </Button>
      );
    } else {
      return (
        <Button
          className="btn btn-block btn-sm btn-info mt-3"
          style={{minWidth: "90px"}}
          onClick={() => mintFunction(mintCount, mintPrice)}
          disabled={disabledButtons}
        >
          Mint SFTS
        </Button>
      );
    }
  };

  useEffect(() => {
    getMintInfo();
    const interval = window.setInterval(() => {
      getMintInfo();
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      getWalletData();
    }
    const interval = window.setInterval(() => {
      if (isLoggedIn) {
        getWalletData();
      }
    }, 4000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <Container>
        <Row>
          <Col xs={12} lg={12} className="text-center">
            <CustomCountdown startTitle={`Mint starts in`} titleStyles="h2" startTimestamp={startTimestamp}
                             completedTitle={"Mint started"}/>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={{offset: 3, span: 6}} className="text-center">
            {mintIsOpen &&
              <CustomProgressBar totalCount={totalCount} leftCount={leftCount} activeColor="#32CD32"/>}
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={{offset: 4, span: 4}} className="text-center">
            <div className="farm-card text-white mt-4">
              <Row>
                <Col xs={12}>
                  <p className="h4 text-white mb-1 mt-2">CODING DIVISION MINT</p>
                  <video autoPlay loop playsInline muted style={{ borderRadius: '15px' }} className="mt-2 mint-image2">
                    <source src={picture} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Col>
                <Col xs={12}>
                  <div className="light-divider" style={{width: "100%", marginLeft: 0}}>
                    {" "}
                  </div>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <p className="h3 text-white mb-1 mt-2">
                                            <span
                                              className="text-green-A200">{mintCount}</span> SFT{mintCount === 1 ? "" : "S"}
                    </p>
                  </Box>
                </Col>
                <Col xs={12}>
                  <div
                    className="light-divider"
                    style={{width: "100%", marginLeft: 0}}
                  >
                    {" "}
                  </div>
                  <div className="d-flex justify-content-center align-items-center">
                    <p className="text-green-A200 h4">{mintPrice.toString()} <span
                      className="text-white">OURO</span></p>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={{offset: 1, span: 10}}>
                  <Row>
                    <Box>
                      <div
                        className="light-divider"
                        style={{width: "100%", marginLeft: 0}}
                      >
                        {" "}
                      </div>
                    </Box>
                    <Col xs={12}>
                      <TextField
                        value={mintCount}
                        variant="outlined"
                        size="small"
                        onChange={handleInputChange}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        fullWidth
                        sx={{textAlign: 'center'}}
                        InputProps={{
                          className: 'text-center text-white mb-1 b-r-md',
                          style: {
                            border: '0.5px solid rgb(74, 85, 104)',
                            width: '100%',
                            textAlign: 'center',
                            height: '2.2em'
                          },
                          inputProps: {
                            style: {textAlign: "center"},
                          }
                        }}
                        disabled={disabledButtons}
                      />
                    </Col>
                    <Col xs={12}>
                      <Button
                        variant="success"
                        className="btn btn-sm btn-block"
                        disabled={disabledButtons}
                        onClick={() => increaseAmount(1)}
                      >
                        <FontAwesomeIcon fontSize={"medium"} icon={faAdd} color="white"/>
                        <span className="ms-2">Mint more</span>
                      </Button>
                    </Col>
                    <Col xs={12}>
                      <Button
                        variant="danger"
                        className="btn btn-sm btn-block mt-1"
                        disabled={disabledButtons}
                        onClick={() => decreaseAmount(1)}
                      >
                        <FontAwesomeIcon
                          fontSize={"medium"}
                          icon={faMinus}
                          color="white"
                          style={{marginLeft: "-9px"}}
                        />
                        <span className="ms-2">Mint less</span>
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <div
                        className="light-divider"
                        style={{width: "100%", marginLeft: 0}}
                      >
                        {" "}
                      </div>
                      <Box justifyContent="center" alignItems="center">
                        <p className="h5 text-white mb-2">
                          Balance:
                          <span
                            className="text-green-A200 ms-1 me-1">{intlNumberFormat(ouroBalance, "en-GB", 2, 2)}</span>
                          OURO
                        </p>
                      </Box>
                      <Button
                        variant="outline-light"
                        size="sm"
                        disabled={!isLoggedIn}
                        className="btn-block"
                        onClick={() => openInNewTab("https://app.jexchange.io/")}
                      >
                        <span className="ms-2">Buy OURO</span>
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col xs={12} mt={1}>
                  <Box mt={2} mb={2}>
                    <div
                      className="light-divider"
                      style={{width: "100%", marginLeft: 0}}
                    >
                      {" "}
                    </div>
                  </Box>
                </Col>
                {!isLoggedIn &&
                  <Col xs={12}>
                    <Button
                      className="btn btn-block btn-sm btn-info mt-3"
                      style={{minWidth: "90px"}}
                      disabled={true}
                    >
                      You are not logged in
                    </Button>
                  </Col>
                }
                {isLoggedIn && <Col xs={12}>{buyButton()}</Col>}
              </Row>
            </div>
          </Col>
        </Row>
        <UpdateMintPrice/>
      </Container>
      <Toaster/>
    </div>
  );
}

export default CodingDivisionMint;