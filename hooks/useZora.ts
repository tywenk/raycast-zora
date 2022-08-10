import { useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";
import { SaleSortKey, SortDirection, TokenSortKey } from "@zoralabs/zdk/dist/queries/queries-sdk";

const zdk = new ZDK();

/**
 * Get collection sales
 * @returns useQuery Promise
 */
const getCollectionSales = async () => {
  return await zdk.sales({
    where: {
      collectionAddresses: ["0x73168661D8e531a8b4Fe7F1E3e349778660A7F28"],
    },
    sort: { sortDirection: SortDirection.Desc, sortKey: SaleSortKey.None },
    filter: {},
    includeFullDetails: false,
    pagination: { limit: 3 },
  });
};

const useCollectionSales = () => {
  return useQuery(["collection-stats"], getCollectionSales, {
    onSuccess: (data) => console.log("success"),
  });
};

/**
 * Get collection stats
 * @returns useQuery Promise
 */
const getCollectionStats = async () => {
  return await zdk.collectionStatsAggregate({
    network: {},
    collectionAddress: "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
  });
};

const useCollectionStats = () => {
  return useQuery(["collection-stats"], getCollectionStats, {
    onSuccess: (data) => console.log("success"),
  });
};

export { useCollectionStats, useCollectionSales };
