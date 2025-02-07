import { SimpleAdapter, FetchResultVolume } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getTimestampAtStartOfDayUTC } from "../../utils/date";
import { Chain } from "@defillama/sdk/build/general";
import request, { gql } from "graphql-request";

interface IReferralRecord {
  volume: string; // Assuming volume is a string that represents a number
  timestamp: number;
}

interface IVolumeStat {
  cumulativeVolumeUsd: string;
  volumeUsd: string;
  id: string;
}

const fetch = () => {
  return async (timestamp: number): Promise<FetchResultVolume> => {
    const todaysTimestamp = getTimestampAtStartOfDayUTC(timestamp);

    const graphQuery = gql`
      query MyQuery {
        volumeStats(where: {timestamp: ${todaysTimestamp}, period: "daily"}) {
          cumulativeVolumeUsd
          id
          volumeUsd
        }
      }
    `;

    const endpoint =
      "https://linea-graph-node.metavault.trade/subgraphs/name/metavault/perpv1";
    const response = await request(endpoint, graphQuery);
    const volumeStats: IVolumeStat[] = response.volumeStats;

    let dailyVolumeUSD = BigInt(0);

    volumeStats.forEach((vol) => {
      dailyVolumeUSD += BigInt(vol.volumeUsd);
    });

    const finalDailyVolume = parseInt(dailyVolumeUSD.toString()) / 1e18;

    return {
      dailyVolume: finalDailyVolume.toString(),
      timestamp: todaysTimestamp,
    };
  };
};

const methodology = {
  dailyVolume:
    "Total cumulativeVolumeUsd for specified chain for the given day",
};

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.LINEA]: {
      fetch: fetch(),
      start: async () => 1701950449,
      meta: {
        methodology,
      },
    },
  },
};

export default adapter;
