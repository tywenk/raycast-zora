import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCollectionSales } from "./hooks/useZora";
import { SaleSortKey, SortDirection } from "@zoralabs/zdk/dist/queries/queries-sdk";
import dayjs from "dayjs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      cacheTime: 10_000,
      staleTime: 1_000,
    },
  },
});

function FilterDropdown({ setFilterQuery }) {
  return (
    <List.Dropdown
      tooltip="Filter sales by price and time"
      storeValue={true}
      defaultValue={"1"}
      onChange={(newValue) => {
        const filterVals = {
          1: { sortDirection: SortDirection.Desc, sortKey: SaleSortKey.None },
          2: { sortDirection: SortDirection.Asc, sortKey: SaleSortKey.None },
          3: { sortDirection: SortDirection.Desc, sortKey: SaleSortKey.ChainTokenPrice },
          4: { sortDirection: SortDirection.Asc, sortKey: SaleSortKey.ChainTokenPrice },
        };

        setFilterQuery(filterVals[newValue]);
      }}
    >
      <List.Dropdown.Section title="Filter options">
        <List.Dropdown.Item title={"Recent sales"} value={"1"} />
        <List.Dropdown.Item title={"Oldest sales"} value={"2"} />
        <List.Dropdown.Item title={"Highest sales"} value={"3"} />
        <List.Dropdown.Item title={"Cheapest sales"} value={"4"} />
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
// adding a thing
// console.log(Object.keys(item?.token));
// Name: ${item.token.name}
// Image: ${item.token.image}
// Name: ${item.token.name}
// Buyer: ${item.sale.buyerAddress}
// Seller: ${item.sale.sellerAddress}
// Time: ${dayjs(item.sale.transactionInfo.blockTimestamp).format("DD MMM YYYY hh:mm A")}
// Block: ${item.sale.transactionInfo.blockNumber}
// TxHash: ${item.sale.transactionInfo.transactionHash}
// TxIndex: ${item.sale.transactionInfo.logIndex}
// Description: ${item.token.description}
// Attributes: ${item.token.attributes?.map((attr) => ` ${attr.traitType}: ${attr.value}`)}
// Minted: ${dayjs(item.token.mintInfo.mintContext.blockTimestamp).format("DD MMM YYYY hh:mm A")}
// Minted: ${item.token.mintInfo.mintContext.transactionHash}
// Minted: ${item.token.mintInfo.mintContext.logIndex}
// Sale:
const urlPicker = (imageObj) => {
  if (imageObj.url.substring(0, 7) === "ipfs://") {
    return imageObj.mediaEncoding.original;
  }
  return imageObj.url;
};

const NFTSales = () => {
  const [addressQuery, setAddressQuery] = useState("");
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [filterQuery, setFilterQuery] = useState({ sortDirection: SortDirection.Desc, sortKey: SaleSortKey.None });
  const { data, isFetching, isError } = useCollectionSales(addressQuery.trim(), filterQuery);

  useEffect(() => {
    if (isFetching) showToast({ style: Toast.Style.Animated, title: "Loading..." });
  }, [isFetching]);

  return (
    <List
      isLoading={isFetching}
      searchBarPlaceholder="Enter Contract Address"
      searchText={addressQuery}
      searchBarAccessory={<FilterDropdown setFilterQuery={setFilterQuery} />}
      onSearchTextChange={setAddressQuery}
      isShowingDetail={isShowDetail}
      throttle
    >
      {isFetching ? (
        <List.EmptyView title="Loading..." />
      ) : isError ? (
        <List.EmptyView icon={Icon.ExclamationMark} title="Error" />
      ) : !addressQuery ? (
        <List.EmptyView title="Enter search query" />
      ) : !data || data?.sales?.nodes?.length < 1 ? (
        <List.EmptyView icon={Icon.XMarkCircle} title="No data" />
      ) : (
        <List.Section title={"Collection: " + data?.sales?.nodes?.[0]?.token?.tokenContract?.name || "hello"}>
          {data &&
            data?.sales?.nodes?.map((item, index) => {
              return (
                <List.Item
                  key={"item" + index}
                  title={"#" + item?.token?.tokenId || ""}
                  subtitle={item?.token?.tokenContract?.name || ""}
                  accessories={
                    !isShowDetail
                      ? [
                          {
                            text: `Sale ${item?.sale?.price?.nativePrice?.decimal} ${item?.sale?.price?.nativePrice?.currency?.name}`,
                          },
                        ]
                      : []
                  }
                  actions={
                    <ActionPanel title="#1 in raycast/extensions">
                      <Action
                        title={isShowDetail ? "Hide detail" : "Show detail"}
                        onAction={() => setIsShowDetail(!isShowDetail)}
                      />
                      <Action.OpenInBrowser
                        title="Open in Etherscan"
                        url={`https://etherscan.io/tx/${item.sale.transactionInfo.transactionHash}`}
                      />
                      <Action.CopyToClipboard title="Copy Transaction" content="" />
                    </ActionPanel>
                  }
                  detail={
                    <List.Item.Detail
                      markdown={`![](${urlPicker(item.token.image)})`}
                      metadata={
                        <List.Item.Detail.Metadata>
                          <List.Item.Detail.Metadata.Label
                            title={item.token.tokenContract.symbol + " " + item.token.tokenId}
                            text={item.token.name}
                          />
                          <List.Item.Detail.Metadata.Label title={item.token.description} />
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Price"
                            text={
                              item?.sale?.price?.nativePrice?.decimal +
                              " " +
                              item?.sale?.price?.nativePrice?.currency?.name
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Sale"
                            text={dayjs(item.sale.transactionInfo.blockTimestamp).format("DD MMM YYYY hh:mm A")}
                          />

                          <List.Item.Detail.Metadata.Label
                            title="Minted"
                            text={dayjs(item.token.mintInfo.mintContext.blockTimestamp).format("DD MMM YYYY hh:mm A")}
                          />
                          <List.Item.Detail.Metadata.Separator />
                          {item.token.attributes.length > 0 && (
                            <>
                              <List.Item.Detail.Metadata.Label title="Attributes" />
                              {item.token.attributes?.map((attr, index) => (
                                <List.Item.Detail.Metadata.Label
                                  key={`attr-${index}`}
                                  title={attr.traitType}
                                  text={attr.value}
                                />
                              ))}
                              <List.Item.Detail.Metadata.Separator />
                            </>
                          )}
                        </List.Item.Detail.Metadata>
                      }
                    />
                  }
                />
              );
            })}
        </List.Section>
      )}
    </List>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NFTSales />
    </QueryClientProvider>
  );
};

export default App;
