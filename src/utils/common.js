import { Actor, HttpAgent } from "@dfinity/agent";
import axios from "axios";
import magiceden from "../assets/brands/magiceden.svg";
import okx from "../assets/wallet-logo/OKX_Logo.svg";
import martin from "../assets/wallet-logo/martin.jpg";
import nightly from "../assets/wallet-logo/nightly.png";
import petra from "../assets/wallet-logo/petra.png";
import unisat from "../assets/wallet-logo/unisat_logo.png";
import xverse from "../assets/wallet-logo/xverse_logo_whitebg.png";

export const API_METHODS = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};

export const apiUrl = {
  Api_base_url: process.env.REACT_APP_ORDINALS_API,
  Coin_base_url: process.env.REACT_APP_COINBASE_API,
  Asset_server_base_url: process.env.REACT_APP_ASSET_SERVER,
  Unisat_open_api: process.env.REACT_APP_UNISAT_OPEN_API,
};

export const PLUG_WALLET_KEY = "plug";
export const XVERSE_WALLET_KEY = "xverse";
export const UNISAT_WALLET_KEY = "unisat";
export const PETRA_WALLET_KEY = "petra";
export const MARTIN_WALLET_KEY = "martin";
export const NIGHTLY_WALLET_KEY = "nightly";
export const OKX_WALLET_KEY = "okx";
export const MAGICEDEN_WALLET_KEY = "magiceden";
export const APTOS_BRAND_KEY = "aptos";
export const IS_USER = true;
export const IS_DEV = true;

export const ordinals = process.env.REACT_APP_ORDINAL_CANISTER_ID;
const btc = process.env.REACT_APP_BTC_CANISTER_ID;
const eth = process.env.REACT_APP_ETH_CANISTER_ID;
const affiliates = process.env.REACT_APP_AFFILIATES_CANISTER_ID;
const hostLink = process.env.REACT_APP_HOST;

export const whitelist = [ordinals, btc, eth, affiliates];
export const host = hostLink;

export const BTCWallets = [
  {
    label: "MAGICEDEN",
    image: magiceden,
    key: MAGICEDEN_WALLET_KEY,
  },
  {
    label: "XVERSE",
    image: xverse,
    key: XVERSE_WALLET_KEY,
  },
  {
    label: "UNISAT",
    image: unisat,
    key: UNISAT_WALLET_KEY,
  }
];

export const paymentWallets = [
  {
    label: "PETRA",
    image: petra,
    key: PETRA_WALLET_KEY,
  },
  {
    label: "MARTIN",
    image: martin,
    key: MARTIN_WALLET_KEY,
  },
  {
    label: "NIGHTLY",
    image: nightly,
    key: NIGHTLY_WALLET_KEY,
  },
  {
    label: "OKX",
    image: okx,
    key: OKX_WALLET_KEY,
  },
]

export const agentCreator = (apiFactory, canisterId) => {
  const agent = new HttpAgent({
    host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
  });
  const API = Actor.createActor(apiFactory, {
    agent,
    canisterId,
  });
  return API;
};

export const sliceAddress = (address, slicePoint = 5) => (
  <>
    {address?.slice(0, slicePoint)}
    ...
    {address?.slice(address.length - slicePoint, address.length)}
  </>
);

export const calculateFee = (bytes, preference) => {
  return Math.round(
    (Number(
      bytes?.split(" ")[0]
    ) /
      4) *
    preference *
    3.47
  )
}

export const calculateAPY = (interestRate, numberOfDays, toFixed = 2) => {
  const rateDecimal = interestRate / 100;
  const apy = Math.pow(1 + rateDecimal, 365 / numberOfDays) - 1;
  const apyPercentage = apy * 100;

  return apyPercentage.toFixed(toFixed);
}

export const calculateDailyInterestRate = (annualInterestRate, toFixed = 2) => {
  const rateDecimal = annualInterestRate / 100;
  const dailyInterestRate = rateDecimal / 365;
  const dailyInterestRatePercentage = dailyInterestRate * 100;

  return dailyInterestRatePercentage.toFixed(toFixed); // Return daily interest rate rounded to 5 decimal places
}

// Getting time ago statement
export const getTimeAgo = (timestamp) => {
  const now = new Date(); // Current date and time
  const diff = now.getTime() - timestamp; // Difference in milliseconds

  // Convert milliseconds to seconds
  const seconds = Math.floor(diff / 1000);

  // Calculate time difference in various units
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Determine appropriate phrase based on time difference
  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}


export const fetchCollections = async (collections) => {
  try {
    const promises = collections.map(async (collection) => {
      const collectionDetails = await axios({
        url: `${process.env.REACT_APP_MAGICEDEN_API}/v2/ord/btc/stat?collectionSymbol=${collection.symbol}`,
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_MAGICEDEN_BEARER}`,
        },
      });

      return {
        ...collectionDetails?.data,
        imageURI: collection?.imageURI,
        totalVolume: collectionDetails?.data?.totalVolume
          ? collectionDetails?.data?.totalVolume
          : collection?.totalVolume,
        floorPrice: collectionDetails?.data?.floorPrice
          ? collectionDetails?.data?.floorPrice
          : collection?.floorPrice,
      };
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error fetching data for collections:", error);
  }
};

export const getAllAssets = async (address) => {
  return new Promise((resolve) => {
    try {
      const result = API_METHODS.get(
        `${process.env.REACT_APP_MEMPOOL_API}/api/address/${address}/utxo`
      );
      resolve(result);
    } catch (error) {
      console.log("API Error", error);
    }
  });
};

export const confirmAssets = async (allAssets) => {
  const promises = allAssets
    .filter((utxo) => utxo.status.confirmed)
    .map(async (asset) => {
      try {
        const ordinalIds = await API_METHODS.get(
          `${process.env.REACT_APP_INSCRIBE_XVERSE_API}/v1/inscriptions/utxo/${asset.txid}/${asset.vout}`
        );
        if (ordinalIds.data.length) {
          return ordinalIds.data[0];
        }
      } catch (error) {
        console.log("API Error", error);
      }
    });
  const results = await Promise.all(promises);
  return results;
};

export const getConfirmedAssets = async (assetIds, address) => {
  const promises = assetIds.map(async (assetId) => {
    try {
      const result = await API_METHODS.get(
        `${process.env.REACT_APP_XVERSE_API}/v1/address/${address}/ordinals/inscriptions/${assetId}`
      );
      const asset = result.data;
      return {
        id: assetId,
        inscriptionNumber: asset.number,
        mimeType: asset.mime_type,
        ...asset,
      };
    } catch (error) {
      console.log("API Error", error);
    }
  });
  const results = await Promise.all(promises);
  return results;
};

export const Capitalaize = (data) => {
  if (data) {
    const words = data.split(/\s+/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  }
};

export const DateTimeConverter = (timestamps) => {
  const date = new Date(timestamps);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
  const timeStamp = strTime.split(",");

  return timeStamp;
};

// Function to format hours in 12-hour clock format
export const format12Hour = (hours) => {
  return hours % 12 || 12;
};

// Function to format single-digit minutes and seconds with leading zero
export const formatTwoDigits = (value) => {
  return value.toString().padStart(2, "0");
};

export const daysCalculator = (_timestamp = Date.now(), _daysAfter = 7) => {
  const timestamp = Number(_timestamp);

  const givenDate = new Date(timestamp);

  const resultDate = new Date(givenDate);
  resultDate.setDate(givenDate.getDate() + _daysAfter);

  const formattedResult = `${resultDate.getDate()}/${resultDate.getMonth() + 1
    }/${resultDate.getFullYear()} ${format12Hour(
      resultDate.getHours()
    )}:${formatTwoDigits(resultDate.getMinutes())}:${formatTwoDigits(
      resultDate.getSeconds()
    )} ${resultDate.getHours() >= 12 ? "pm" : "am"}`;

  return { date_time: formattedResult, timestamp: resultDate.getTime() };
};
