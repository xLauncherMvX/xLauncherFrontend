import React from "react";
import LinearProgress, {
	linearProgressClasses,
} from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import {convertBigNumberToLocalString} from "pages/snakeSale/z/utils";

export default function CustomProgressBar({ totalCount, leftCount, activeColor}) {

	const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
		height: 4,
		borderRadius: 5,
		padding: '3px 0',
		[`&.${linearProgressClasses.colorPrimary}`]: {
			backgroundColor: '#2d3339',
		},
		[`& .${linearProgressClasses.bar}`]: {
			borderRadius: 5,
			backgroundColor: activeColor,
		},
	}));

	return (
		<>
			<div className="mt-2">
				<BorderLinearProgress
					variant="determinate"
					value={((totalCount - leftCount) / totalCount) * 100}
				/>
			</div>
			<div
				className="d-flex justify-content-between mt-2"
				style={{ fontSize: '.8rem', color: '#b6b3b3' }}
			>
                <span>
                  {convertBigNumberToLocalString(totalCount - leftCount)}{' '}
									{`(${convertBigNumberToLocalString(
										((totalCount - leftCount) / totalCount) * 100,
										2,
									)}%)`}
                </span>
				<span>{convertBigNumberToLocalString(totalCount)}</span>
			</div>
		</>
	);
}