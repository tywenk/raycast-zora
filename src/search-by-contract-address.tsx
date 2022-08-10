import { List, ActionPanel, Action, Detail, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCollectionStats, useCollectionSales } from "../hooks/useZora";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,

      refetchOnWindowFocus: false,
      refetchOnMount: false,
      cacheTime: 1 * 60 * 60 * 1000,
      staleTime: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchByContractAddress />
    </QueryClientProvider>
  );
};

const SearchByContractAddress = () => {
  const { data, isLoading } = useCollectionSales();

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Enter Contract Address">
      {!data || data?.sales?.nodes?.length < 1 ? (
        <List.EmptyView icon={Icon.XMarkCircle} title="No sales" />
      ) : (
        <List.Section title={data?.sales?.nodes?.[0]?.token?.tokenContract?.name || "hello"}>
          {data &&
            data?.sales?.nodes?.map((item, index) => {
              console.log(item?.sale?.price?.nativePrice);
              return (
                <List.Item
                  key={"item" + index}
                  title={"#" + item?.token?.tokenId || ""}
                  subtitle={""}
                  actions={
                    <ActionPanel title="#1 in raycast/extensions">
                      <Action.OpenInBrowser url="https://etherscan.com/raycast/extensions/pull/1" />
                      <Action.CopyToClipboard title="Copy Pull Request Number" content="#1" />
                      <Action title="Close Pull Request" onAction={() => console.log("Close PR #1")} />
                    </ActionPanel>
                  }
                />
              );
            })}
        </List.Section>
      )}
    </List>
  );
};

export default App;
