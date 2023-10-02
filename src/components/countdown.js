import React from "react";
import "assets/css/mint.css";
import Countdown from 'react-countdown';

export default function CustomCountdown({ startTitle, titleStyles, completedTitle, startTimestamp }) {

	// build the countdown timer
	const countdownRenderer = ({ days, hours, minutes, seconds, completed, }) => {
		if (completed) {
			return (
				<>
					<div className="presale-timer-container text-center mt-4">
						{completedTitle && (<p className={`${titleStyles}`}>{completedTitle}</p>)}
					</div>
				</>
			);
		} else {
			return (
				<div className="presale-timer-container text-center mt-4 mb-3">
					{startTitle && (<p className={`mb-3 ${titleStyles}`}>{startTitle}</p>)}
					<strong>
						<span className="presale-timer-box p-2 me-2">{String(days).padStart(2, '0')} D</span>
						<span>: </span>
						<span className="presale-timer-box p-2 me-2">{String(hours).padStart(2, '0')} h</span>
						<span>: </span>
						<span className="presale-timer-box p-2 me-2">{String(minutes).padStart(2, '0')} m</span>
						<span>: </span>
						<span className="presale-timer-box p-2 me-2">{String(seconds).padStart(2, '0')} s</span>
					</strong>
				</div>
			);
		}
	};

	return (
		<Countdown renderer={countdownRenderer} date={startTimestamp} autoStart/>
	);
}