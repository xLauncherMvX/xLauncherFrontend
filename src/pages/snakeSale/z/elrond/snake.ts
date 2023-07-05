import {
  AbiRegistry,
  Address,
  AddressValue,
  ArgSerializer,
  BigUIntValue,
  BinaryCodec,
  ResultsParser,
  StringValue,
  TokenIdentifierValue,
  TokenTransfer,
  TypedValue,
  U64Value,
  U8Value,
} from '@multiversx/sdk-core/out'
import { refreshAccount } from '@multiversx/sdk-dapp/utils'
import abiNosferatu from './abi/nosferatu-nft-minter.abi.json'
import {
  EGLD_WRAPPER_ADDRESS,
  NOSFERATU_SC_ADDRESS,
  PRESALE_BUY_GAS_LIMIT,
  SNAKE_NFT_COLLECTION,
  SNAKE_SC_ADDRESS,
  USDC_TOKEN_ID,
} from '../../config'
import {
  CoilBaseContext,
  PresaleStatsContext,
  PresaleUserContext,
  PriceType,
  UnlockMilestoneType,
  VestingBaseContext,
} from '../types'
import { convertTokenIdentifierToTicker, ZERO_STRING } from '../utils'
import { elrondDappSendTransactions, parseEsdtTokenPayment } from './common'
import { elrondProvider, snakeSmartContract } from './provider'
import {
  getAccountNftCountByCollection,
  getAccountNftsByCollection,
} from './elrond-api'

export async function getSnakeCollection(): Promise<string> {
  return SNAKE_NFT_COLLECTION
}

export async function getSnakeLeftCount(): Promise<number> {
  try {
    const interaction = snakeSmartContract.methods.remaining([1])
    const query = interaction.check().buildQuery()
    const queryResponse = await elrondProvider.queryContract(query)
    const endpointDefinition = interaction.getEndpoint()
    const {
      firstValue,
      returnCode,
      returnMessage,
    } = new ResultsParser().parseQueryResponse(
      queryResponse,
      endpointDefinition,
    )

    if (!firstValue || !returnCode.isSuccess()) {
      throw Error(returnMessage)
    }

    const value = firstValue.valueOf()
    const decoded = value.toNumber()

    return decoded
  } catch (err) {
    return 0
  }
  //   const nft_info = await getAccountNftsByCollection(
  //     SNAKE_SC_ADDRESS,
  //     SNAKE_NFT_COLLECTION,
  //   )
  //   return parseInt(nft_info[0].balance)
}

export async function getMintedSnakes(address: string): Promise<number> {
  const nft_info = await getAccountNftsByCollection(
    address,
    SNAKE_NFT_COLLECTION,
  )
  if (nft_info.length === 0 || nft_info[0].balance === undefined) {
    return 0
  }
  return parseInt(nft_info[0]?.balance)
}

export async function getSnakePriceMap(): Promise<PriceType[]> {
  try {
    // const interaction = nosferatuSmartContract.methodsExplicit.getPriceMap();
    // const query = interaction.check().buildQuery();
    // const queryResponse = await elrondProvider.queryContract(query);
    // const endpointDefinition = interaction.getEndpoint();
    // const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);

    // if (!firstValue || !returnCode.isSuccess()) {
    //     throw Error(returnMessage);
    // }

    // const values = firstValue.valueOf();
    // const decoded = values.map((value: any) => ({
    //     identifier: value[0].toString(),
    //     ticker: convertTokenIdentifierToTicker(value[0].toString()),
    //     price: value[1].toFixed(0),
    // }));

    // return decoded;
    return [
      {
        identifier: USDC_TOKEN_ID,
        ticker: 'USDC',
        price: '2500000000',
      },
    ]
  } catch (err) {
    return []
  }
}

export async function snakeBuy(payment: TokenTransfer, quantity: number) {
  const args: TypedValue[] = [
    new TokenIdentifierValue(payment.tokenIdentifier),
    new BigUIntValue(payment.amountAsBigInteger),
    new StringValue('buy'),
    new U64Value(1),
    new U8Value(quantity),
  ]

  const { argumentsString } = new ArgSerializer().valuesToString(args)
  const data = `ESDTTransfer@${argumentsString}`
  const tx = {
    value: 0,
    data,
    receiver: SNAKE_SC_ADDRESS,
    gasLimit: PRESALE_BUY_GAS_LIMIT,
  }

  const txName = 'Buy'
  const { sessionId, error } = await elrondDappSendTransactions(tx, txName)

  return { sessionId, error }
}
