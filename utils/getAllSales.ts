import { gql } from "@apollo/client";

const GET_ALL_SALES = gql`
  query WTSalesQuery($page: String!, $contract: String!) {
    sales(
      where: { collectionAddresses: $contract }
      networks: { chain: MAINNET, network: ETHEREUM }
      sort: { sortKey: TIME, sortDirection: DESC }
      pagination: { limit: 5, after: $page }
      filter: {
        saleTypes: [
          OPENSEA_SINGLE_SALE
          OPENSEA_BUNDLE_SALE
          LOOKS_RARE_SALE
          SUPERRARE_SALE
          RARIBLE_SALE
          ZORA_V3_ASK_SALE
          ZORA_V2_AUCTION_SALE
          ZEROX_SALE
          RARIBLE_SALE
          SEAPORT_SALE
        ]
      }
    ) {
      nodes {
        sale {
          price {
            blockNumber
            chainTokenPrice {
              decimal
              currency {
                name
              }
            }
          }
          buyerAddress
          sellerAddress
          transactionInfo {
            blockTimestamp
            transactionHash
          }
          saleType
        }
        token {
          name
          tokenId
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        limit
      }
    }
  }
`;

export default GET_ALL_SALES;
