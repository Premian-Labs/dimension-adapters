import { SimpleAdapter, FetchResultFees, BaseAdapter } from "../adapters/types";
import { MANTLE, CHAIN } from "../helpers/chains";


import {
    getGraphDimensions,
    DEFAULT_DAILY_VOLUME_FACTORY,
    DEFAULT_TOTAL_VOLUME_FIELD,
  } from "../helpers/getUniSubgraph"

type TStartTime = {
[key: string]: number;
}
const startTimeV2:TStartTime = {
[CHAIN.MANTLE]: 1704326400,
}


const v2Endpoints = {
    [CHAIN.MANTLE]: "https://subgraph-api.mantle.xyz/subgraphs/name/cleoexchange/cl-subgraph",
  };

const VOLUME_USD = "volumeUSD";

const v2Graphs = getGraphDimensions({
    graphUrls: v2Endpoints,
    totalVolume: {
        factory: "factories",
        field: DEFAULT_TOTAL_VOLUME_FIELD,
    },
    dailyVolume: {
        factory: DEFAULT_DAILY_VOLUME_FACTORY,
        field: VOLUME_USD,
    },
    feesPercent: {
        type: "fees",
        HoldersRevenue: 50,
        UserFees: 100, // User fees are 100% of collected fees
        Revenue: 50, // Revenue is 50% of collected fees
        SupplySideRevenue: 50,
    }
    });

    const methodology = {
    UserFees: "User pays 0.3% fees on each swap.",
    ProtocolRevenue: "Revenue going to the protocol.",
    HoldersRevenue: "User fees are distributed among holders."
    }

    const adapter: SimpleAdapter = {
        adapter: {
          [CHAIN.MANTLE]: {fetch: v2Graphs(MANTLE),
            start: async () => startTimeV2[CHAIN.MANTLE],
            meta: {
              methodology: {
                ...methodology,
                UserFees: "User pays 0.05%, 0.30%, or 1% on each swap."
              }
            }
          },
        }
      };

export default adapter;
