import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCollectionSales } from "./hooks/useZora";
import { SaleSortKey, SortDirection } from "@zoralabs/zdk/dist/queries/queries-sdk";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      cacheTime: 10_000,
      staleTime: 1,
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
          3: { sortDirection: SortDirection.Desc, sortKey: SaleSortKey.NativePrice },
          4: { sortDirection: SortDirection.Asc, sortKey: SaleSortKey.NativePrice },
        };

        setFilterQuery(filterVals[newValue]);
      }}
    >
      <List.Dropdown.Section title="Filter options">
        <List.Dropdown.Item title={"Latest sales"} value={"1"} />
        <List.Dropdown.Item title={"Earliest sales"} value={"2"} />
        <List.Dropdown.Item title={"Highest sales"} value={"3"} />
        <List.Dropdown.Item title={"Cheapest sales"} value={"4"} />
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

const NFTSales = () => {
  const [addressQuery, setAddressQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState({ sortDirection: SortDirection.Desc, sortKey: SaleSortKey.None });
  const { data, isFetching, isError } = useCollectionSales(addressQuery, filterQuery);

  useEffect(() => {
    if (isFetching) showToast({ style: Toast.Style.Animated, title: "Loading..." });
  }, [isFetching]);

  const generateDetailMD = (item) => {
    console.log(item?.sale?.price);
    const markdown = `# $${item.token.tokenContract.symbol} ${item.token.tokenId}
    
    ## Buyer: ${item.sale.buyerAddress}
    ## Seller: ${item.sale.sellerAddress}
    `;

    return markdown;
  };

  return (
    <List
      isLoading={isFetching}
      searchBarPlaceholder="Enter Contract Address"
      searchText={addressQuery}
      searchBarAccessory={<FilterDropdown setFilterQuery={setFilterQuery} />}
      onSearchTextChange={setAddressQuery}
      isShowingDetail={!!data && true}
      throttle
    >
      {isFetching ? (
        <List.EmptyView title="Loading..." />
      ) : isError ? (
        <List.EmptyView icon={Icon.ExclamationMark} title="Error" />
      ) : !addressQuery ? (
        <List.EmptyView title="Enter search query" />
      ) : !data || data?.sales?.nodes?.length < 1 ? (
        <List.EmptyView icon={Icon.XMarkCircle} title="No sales" />
      ) : (
        <List.Section title={"Collection: " + data?.sales?.nodes?.[0]?.token?.tokenContract?.name || "hello"}>
          {data &&
            data?.sales?.nodes?.map((item, index) => {
              return (
                <List.Item
                  key={"item" + index}
                  title={"#" + item?.token?.tokenId || ""}
                  subtitle={item?.token?.tokenContract?.name || ""}
                  accessories={[
                    {
                      text: `Sale ${item?.sale?.price?.nativePrice?.decimal} ${item?.sale?.price?.nativePrice?.currency?.name}`,
                    },
                  ]}
                  actions={
                    <ActionPanel title="#1 in raycast/extensions">
                      <Action.OpenInBrowser
                        title="Open in Etherscan"
                        url={`https://etherscan.io/address/${addressQuery}`}
                      />
                      <Action.CopyToClipboard title="Copy Pull Request Number" content="#1" />
                      <Action title="Close Pull Request" onAction={() => console.log("Close PR #1")} />
                    </ActionPanel>
                  }
                  detail={<List.Item.Detail markdown={generateDetailMD(item)} />}
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
