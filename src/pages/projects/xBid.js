import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "assets/css/globals.css";
import ProjectCard from "cards/ProjectCard";

import banner from "assets/images/xbid.png";

const details = [
    {
        title: "online auction platform",
        desc: "XBid represents a sophisticated online auction platform, designed to facilitate the bidding process in a secure and efficient virtual environment. Through this platform, participants are invited to submit price bids for a variety of enticing prizes."
    },
    {
        title: "online lottery",
        desc: " XBid also offers an online lottery experience, introducing an additional element of entertainment and suspense to the platform. Participants have the option to purchase tickets to enter lottery drawings, with the chance to win attractive prizes."
    },
    {
        title: "Starting Price",
        desc: "The starting price represents the initial price at the beginning of each auction. It is the minimum price accepted for the auctioned item and is set to initiate the bidding process. On the xBid platform, the starting price will be set at minimum 0.01 EGLD."
    },
    {
        title: "Price Increment System ",
        desc: "When you decide to participate in an auction, you will find a special button that allows you to place an automatic bid. Each accepted bid in the auction comes with a fixed price increment of 0.001 EGLD compared to the previous one."
    },
    {
        title: "Auction Duration",
        desc: "The auction conducted on the xBid platform is not restricted by a fixed time limit for completion. However, after each accepted bid, a timer will be activated for a duration of 60-180 seconds,depending on the event."
    },
    {
        title: "The xLottery",
        desc: "xLottery offers the excitement of virtual gaming with various draw categories like 10/20, 8/20, 12/62, and 20/80. Every hour, a set number of random draws will occur within your chosen category, and your goal is to select 3 numbers carefully, hoping for a match with the drawn numbers."
    },
    {
        title: "Types of lotteries",
        desc: "10/20 - Multiplier: 8, 8/20 - Multiplier: 18, 20/62 - Multiplier: 28, 20/80 - Multiplier: 50"
    },
    {
        title: "Token",
        desc: "The token distribution for the xBID platform has been carefully planned to support sustainable development and optimal functioning of the ecosystem. From tokens allocated for sale, the xstake program, and liquidity in trading pairs, to guarantee funds for xLottery, each category plays an essential role in creating a comprehensive experience and promoting participation and adoption."
    }
];

export default function xBID() {
    return (
        <div>
            <Row>
                <Col xs={12} md={12} lg={{offset: 2, span:8}}>
                    <ProjectCard
                        date="10.10.2023"
                        banner={banner}
                        website="https://www.xbid.app/auction"
                        twitter="https://twitter.com/XBid_MVX"
                        whitepaper="https://xbid.gitbook.io/xbid/"
                        details={details}
                    />
                </Col>
            </Row>
        </div>
    );
}