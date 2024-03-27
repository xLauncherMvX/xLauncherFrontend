import React, { useEffect, useState } from "react";
import Layout from "layout/layout";
import "assets/css/globals.css";
import "assets/css/bloodshed.css";
import "assets/css/dateCountdown.css";
import Image from "react-bootstrap/Image";
import char1 from "assets/images/char1.png";
import char2 from "assets/images/char2.png";
import Container from "@mui/material/Container";
import CustomCountdown from "components/countdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomProgressBar from "components/progress_bar";
import BigNumber from 'bignumber.js';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import picture from "assets/images/capybara_logo.png";

import { contractQuery, getAccountTokens } from "utils/api";
import { customConfig, networkId, allTokens } from "config/customConfig";
import { networkConfig } from "config/networks";
import { Address, AddressValue } from "@multiversx/sdk-core/out";
import { multiplier } from "utils/utilities";
import { Card } from "react-bootstrap";

function Capybara() {
  const config = customConfig[networkId];
  const scAddress = 'erd1t2mnpzg0kstjx0a0gf5v4lv7nkyscl03fysexsd760dy807y3m8skn6su2';
  const tokensAPI = config.apiLink + scAddress;
  const totalCount = 1000;  

  let ended = false;
  const startTimestamp = 1711470600000;
	const currentTimestamp = new Date().getTime();
	if (currentTimestamp -  startTimestamp >= 0) {
		ended = true;
	}

  //Copy to Clipboard Utility
  const [isCopied, setIsCopied] = React.useState(false);
  function CopyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  }

  // format the egld balance
	const [balance, setBalance] = useState(0);
	const getBalance = async () => {
		try {
			const response = await fetch(tokensAPI, {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();			
			if (json) {
        setBalance(parseFloat(new BigNumber(json.balance).shiftedBy(-18).toFixed(4)));
			}
		} catch (e) {
			console.error(e);
		}
	};

  useEffect(() => {
		//getBalance();
		const interval = window.setInterval(() => {
			//getBalance();
		}, 2000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

  return (
    <div>
      <Container className="customFont">
        <Row className="text-center mt-5">
          <Col>
            <div className="show-counter">
              <img src={picture} />
              <h1 className="text-white">Capybara Fundraising</h1>
            </div>            
          </Col>
        </Row>
        <Row>
					<Col xs={12} lg={{offset: 3, span: 6}} className="text-center">
						<h3 className="text-lexaloffle-green font-bold">Raised: 14413.6611 EGLD</h3>
					</Col>
				</Row>
        <Row>
					<Col xs={12} lg={{offset: 3, span: 6}} className="text-center">
            <CustomCountdown startTitle="" completedTitle="Ended"  titleStyles="h1" startTimestamp={1711470600000}/>
					</Col>
				</Row>
        
        <Row>
					<Col xs={12} lg={{offset: 2, span: 8}} className="text-center">
            <div className="farm-card text-white mt-4">
              <h4 className="text-lexaloffle-green">Overview</h4>
              <p className="text-justified mt-4">The CAPY token is a product of xLauncher, which provides the investment confidence that represents a huge advantage for investors.
                Join our 24-hour subscription to reach 1000 EGLD. If we exceed 1000 EGLD, we&apos;ll refund part of each participant&apos;s investment.
              </p>
              <p className="text-justified">Token price: 600,000 CAPY/EGLD.</p>
              
              <h4 className="mt-5 text-lexaloffle-green">Initial Funds Wallet</h4>
              {!ended && 
                <p className="mt-3 font-bold" style={{ maxWidth: '100%' }}>              
                  {!isCopied ? (
                        <Button
                          variant="link"
                          onClick={() => CopyToClipboard(scAddress)}
                          className="text-white"
                          style={{textDecoration: 'none'}}
                        >
                          <span className="me-2" style={{ wordWrap: 'break-word', wordBreak: 'break-all'}}>
                            erd1t2mnpzg0kstjx0a0gf5v4lv7nkyscl03fysexsd760dy807y3m8skn6su2
                          </span>
                          <FontAwesomeIcon icon={faCopy} />
                        </Button>
                      ) : (
                        <Button variant="link" className="text-white">
                          <span className="me-2" style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                            erd1t2mnpzg0kstjx0a0gf5v4lv7nkyscl03fysexsd760dy807y3m8skn6su2
                          </span>
                          <FontAwesomeIcon icon="fa-check" />
                        </Button>
                  )}                
                </p>
              }
              {ended && <p className="mt-3">Ended</p>}

              <h4 className="mt-5 text-lexaloffle-green">How it works</h4>
              <p className="text-left mt-4">&#9656; Subscription opens for 24 hours.</p>
              <p className="text-left">&#9656; Send EGLD to participate.</p>
              <p className="text-left">&#9656; At the end, we calculate total EGLD raised.</p>
              <p className="text-left">&#9656; Calculate return percentage based on 1000 EGLD target.</p>
              <p className="text-left">&#9656; Refund EGLD accordingly to each participant.</p>

              <h4 className="mt-5 text-lexaloffle-green">Token Supply and Distribution</h4>
              <p className="text-justified mt-4">Total supply: 1.2 billion CAPY tokens. </p>
              <p className="text-justified">&#9733; <span className="text-underlined">600 million CAPY (50% of total supply)</span>will be distributed proportionally to the first individuals who provide EGLD for initial LP addition. We aim to raise 1000 EGLD, for which we will distribute the sum of 600 million $CAPY according to the following formula:</p>
              <p className="text-left ms-3">&#9656; 20% at Token Generation Event (TGE)</p>
              <p className="text-left ms-3">&#9656; 3-day cliff</p>
              <p className="text-left ms-3">&#9656; 80% distributed over 15 days through CoinDrip.</p>
              <p className="text-justified">&#9733; <span className="text-underlined">The remaining 600 million $CAPY (50% of total supply)</span> will be added to liquidity alongside the initial 1000 EGLD collected. </p>


              <h4 className="mt-5 text-lexaloffle-green">Listing Details</h4>
              <p className="text-justified mt-4">CAPY will be listed on the following DEXs:</p>
              <p className="text-left">&#9656; xExchange: 390 million CAPY /650 EGLD</p>
              <p className="text-left">&#9656; OneDex: 180 million CAPY /300 EGLD</p>
              <p className="text-left">&#9656; VestaDEX: 30 million CAPY /45 vEGLD (equivalent to 50 EGLD)</p>
              <p className="text-justified">Participants will receive their CAPY tokens in their wallet within a maximum of 3 hours from the conclusion of the subscription period, and listing will occur within a maximum of 6 hours from the conclusion of the subscription period.</p>

              <p className="text-justified mt-5  font-bold text-danger">*All 1000 LP egld will be completely burned</p>          
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Capybara;