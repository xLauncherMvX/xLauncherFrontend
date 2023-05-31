import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse } from '@mui/material';
import { useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks';
import { NftType } from '@multiversx/sdk-dapp/types/tokens.types';
import { FEE_DENOMINATOR } from './config';
import {
    decodeVestedAttributes,
    getAccountNftsByCollection,
    getElrondStatsFromApi,
    viewCoilBaseContext,
    viewVestingBaseContext,
} from './z/elrond';
import {
    CoilBaseContext,
    ElrondStatsType,
    VestingBaseContext,
} from './z/types';
import {
    convertBigNumberToLocalString,
    convertWeiToEsdt,
} from './z/utils';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account';

function TokenCard({
    token,
    elrondStats,
} : {
    token: NftType,
    elrondStats: ElrondStatsType | undefined,
}) {
    const [showDetails, setShowDetails] = useState<boolean>(false);

    function toggleShowDetailsButton() {
        setShowDetails(!showDetails);
    }

    const unlockMilestones = decodeVestedAttributes(token.attributes);

    return (
        <div className='vested-token-container mb-3'>
            <div className='d-flex justify-content-between align-items-center flex-row'>
                <div className="vested-token">
                    <div className="d-flex align-items-center gap-1">
                        <span style={{ fontSize: '1rem', color: '#98A1C0' }}>
                            {token.identifier}
                        </span>
                    </div>
                    <span>
                        {convertBigNumberToLocalString(convertWeiToEsdt(token.balance, token.decimals))}
                    </span>
                </div>

                <div className="vested-token">
                    <button
                        className="pool-collapse-button"
                        onClick={toggleShowDetailsButton}
                    >
                        {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </button>
                </div>
            </div>

            <Collapse in={showDetails}>
                <div className='mt-4'>
                    <div
                        style={{
                            color: '#F1DC46',
                            textAlign: 'center',
                            fontSize: '1rem',
                        }}
                    >
                        Unlock Schedule
                    </div>
                    {
                        unlockMilestones.map((um, index) => {
                            let unlockTimeText = '-';
                            if (elrondStats) {
                                if (um.unlock_epoch <= elrondStats.epoch) {
                                    unlockTimeText = 'Unlockable';
                                } else {
                                    const unlockDate = new Date(Date.now() + (um.unlock_epoch - elrondStats.epoch) * 3600 * 24 * 1000);
                                    unlockTimeText = unlockDate.toLocaleDateString();
                                }
                            }
                            
                            return (
                                <div className="presale-label-row" key={index}>
                                    <span>{convertBigNumberToLocalString(um.unlock_percent / FEE_DENOMINATOR)}%</span>
                                    <span>{unlockTimeText}</span>
                                </div>
                            );
                        })
                    }
                </div>
            </Collapse>
        </div>
    );
}

export const Account = () => {
    const { address } = useGetAccount();
    const { hasPendingTransactions } = useGetPendingTransactions();

    const [coilBaseContext, setCoilBaseContext] = useState<CoilBaseContext>();
    const [vestingBaseContext, setVestingBaseContext] = useState<VestingBaseContext>();
    const [elrondStats, setElrondStats] = useState<ElrondStatsType>();

    const [vouroTokens, setVouroTokens] = useState<NftType[]>([]);
    const [vaurynTokens, setVaurynTokens] = useState<NftType[]>([]);
    const [veaurynTokens, setVeaurynTokens] = useState<NftType[]>([]);

    useEffect(() => {
        (async () => {
            const _coilBaseContext = await viewCoilBaseContext();
            console.log('_coilBaseContext', _coilBaseContext);
            setCoilBaseContext(_coilBaseContext);
        })();

        (async () => {
            const _vestingBaseContext = await viewVestingBaseContext();
            console.log('_vestingBaseContext', _vestingBaseContext);
            setVestingBaseContext(_vestingBaseContext);
        })();

        (async () => {
            const _elrondStats = await getElrondStatsFromApi();
            console.log('_elrondStats', _elrondStats);
            setElrondStats(_elrondStats);
        })();
    }, []);

    useEffect(() => {
        if (!coilBaseContext || !vestingBaseContext || !address) return;
        if (hasPendingTransactions) return;

        (async () => {
            const _vouroTokens = await getAccountNftsByCollection(address, vestingBaseContext.tokens[0]);
            console.log('_vouroTokens', _vouroTokens);
            setVouroTokens(_vouroTokens);
        })();
        (async () => {
            const _vaurynTokens = await getAccountNftsByCollection(address, vestingBaseContext.tokens[1]);
            console.log('_vaurynTokens', _vaurynTokens);
            setVaurynTokens(_vaurynTokens);
        })();
        (async () => {
            const _vearuynTokens = await getAccountNftsByCollection(address, vestingBaseContext.tokens[2]);
            console.log('_vearuynTokens', _vearuynTokens);
            setVeaurynTokens(_vearuynTokens);
        })();

    }, [coilBaseContext, vestingBaseContext, address, hasPendingTransactions]);

    return (
        <>
            <div className="container" style={{ marginTop: '50px' }}>
                <div className='row'>
                    <div className='col-12'>
                        <div className="vesta_x_swap_card mb-4">
                            <div
                                style={{
                                    color: '#F1DC46',
                                    marginLeft: '.8rem',
                                    fontSize: '1.25rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Vested OURO
                            </div>
                            <div className="row">
                                {
                                    vouroTokens.map((token, index) => (
                                        <div className='col-lg-3' key={index}>
                                            <TokenCard token={token} elrondStats={elrondStats} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="vesta_x_swap_card mb-4">
                            <div
                                style={{
                                    color: '#F1DC46',
                                    marginLeft: '.8rem',
                                    fontSize: '1.25rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Vested AURYN
                            </div>
                            <div className="row">
                                {
                                    vaurynTokens.map((token, index) => (
                                        <div className='col-lg-3' key={index}>
                                            <TokenCard token={token} elrondStats={elrondStats} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="vesta_x_swap_card mb-4">
                            <div
                                style={{
                                    color: '#F1DC46',
                                    marginLeft: '.8rem',
                                    fontSize: '1.25rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Vested Elite AURYN
                            </div>
                            <div className="row">
                                {
                                    veaurynTokens.map((token, index) => (
                                        <div className='col-lg-3' key={index}>
                                            <TokenCard token={token} elrondStats={elrondStats} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toaster />
        </>
    );
};
