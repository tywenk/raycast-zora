import { showToast, Toast } from "@raycast/api";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";
import { SaleSortKey, SalesQuery, SortDirection } from "@zoralabs/zdk/dist/queries/queries-sdk";

const zdk = new ZDK();

/**
 * Get collection sales
 * @returns useQuery Promise
 */

const getCollectionSales = async ({ queryKey }) => {
  const [_, address, filter] = queryKey;

  const isValidAddr = /^0x[a-fA-F0-9]{40}$/g.test(address);

  if (!isValidAddr) {
    throw new Error(`Invalid address`);
  }

  return await zdk.sales({
    where: {
      collectionAddresses: [address],
    },
    sort: { sortDirection: filter.sortDirection, sortKey: filter.sortKey },
    filter: {},
    includeFullDetails: true,
    includeMarkets: true,
    pagination: { limit: 5 },
  });
};

const useCollectionSales = (address, filter) => {
  return useQuery(["collection-stats", address, filter], getCollectionSales, {
    enabled: !!address && /^0x[a-fA-F0-9]{40}$/g.test(address),
    onSuccess: () => showToast({ style: Toast.Style.Success, title: "Success" }),
    onError: (error) => showToast({ style: Toast.Style.Failure, title: "Error", message: error?.message }),
  });
};

/**
 * Get collection stats
 * @returns useQuery Promise
 */
// const getCollectionStats = async () => {
//   return await zdk.collectionStatsAggregate({
//     network: {},
//     collectionAddress: "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
//   });
// };

// const useCollectionStats = () => {
//   return useQuery(["collection-stats"], getCollectionStats, {
//     onSuccess: (data) => console.log("success"),
//   });
// };

export { useCollectionSales };
