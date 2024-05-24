import { createSlice } from "@reduxjs/toolkit";

const state = {
  isLoading: false,
  loaderTip: "Loading...",
  collection: ["", "", "", "", "", "", "", "", "", "", "", ""],
  btcvalue: null,
  ethvalue: null,
  aptosvalue: null,
  airPoints: null,
  collectionName: null,
  airDropData: {},
  isLendHeader: false,
  agent: undefined,
  ckBtcAgent: null,
  ckEthAgent: null,
  ckBtcActorAgent: null,
  ckEthActorAgent: null,
  withdrawAgent: null,
  affiliateCanister: null,
  LendRequests: null,
  allAssets: [],
  isPlugError: false,
  approvedCollections: ["", "", "", "", "", "", "", "", "", "", "", ""]
};

const constantSlice = createSlice({
  name: "constant",
  initialState: state,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setLoaderTip: (state, action) => {
      state.loaderTip = action.payload;
    },

    setCollection: (state, action) => {
      state.collection = action.payload;
    },

    setApprovedCollection: (state, action) => {
      state.approvedCollections = action.payload;
    },

    setBtcValue: (state, action) => {
      state.btcvalue = action.payload;
    },

    setEthValue: (state, action) => {
      state.ethvalue = action.payload;
    },

    setAptosValue: (state, action) => {
      state.aptosvalue = action.payload;
    },

    setAirDropData: (state, action) => {
      state.airDropData = action.payload;
    },

    setAirPoints: (state, action) => {
      state.airPoints = action.payload;
    },

    setCollectionName: (state, action) => {
      state.collectionName = action.payload;
    },

    setLendHeader: (state, action) => {
      state.isLendHeader = action.payload;
    },

    setAgent: (state, action) => {
      state.agent = action.payload;
    },

    setwithdrawAgent: (state, action) => {
      state.withdrawAgent = action.payload;
    },

    setCkBtcAgent: (state, action) => {
      state.ckBtcAgent = action.payload;
    },

    setCkEthAgent: (state, action) => {
      state.ckEthAgent = action.payload;
    },

    setCkBtcActorAgent: (state, action) => {
      state.ckBtcActorAgent = action.payload;
    },

    setCkEthActorAgent: (state, action) => {
      state.ckEthActorAgent = action.payload;
    },

    setAffiliateCanister: (state, action) => {
      state.affiliateCanister = action.payload;
    },

    setLendRequests: (state, action) => {
      state.LendRequests = action.payload;
    },

    setAllAssets: (state, action) => {
      state.allAssets = action.payload;
    },
  },
});

export const {
  setLoading,
  setLoaderTip,
  setCollection,
  setBtcValue,
  setAirDropData,
  setAirPoints,
  setCollectionName,
  setLendHeader,
  setAgent,
  setLendRequests,
  setCkBtcAgent,
  setEthValue,
  setAptosValue,
  setCkEthAgent,
  setCkBtcActorAgent,
  setCkEthActorAgent,
  setwithdrawAgent,
  setAllAssets,
  setAffiliateCanister,
  setApprovedCollection
} = constantSlice.actions;
export default constantSlice.reducer;
