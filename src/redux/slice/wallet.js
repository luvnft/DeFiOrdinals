import { createSlice } from "@reduxjs/toolkit";
import { MAGICEDEN_WALLET_KEY, MARTIN_WALLET_KEY, NIGHTLY_WALLET_KEY, PETRA_WALLET_KEY, UNISAT_WALLET_KEY, XVERSE_WALLET_KEY } from "../../utils/common";

const state = {
  xverse: {
    ordinals: {},
    payment: {},
    signature: null,
    btcBalance: 0.0,
  },
  magicEden: {
    ordinals: {},
    payment: {},
    signature: null,
    btcBalance: 0.0,
  },
  unisat: {
    address: null,
    publicKey: null,
    signature: null,
    btcBalance: 0.0,
  },
  petra: {
    publicKey: null,
    address: null,
  },
  martin: {
    publicKey: null,
    address: null,
  },
  nightly: {
    publicKey: null,
    address: null,
  },
  isTableCreated: false,
  active: [],
};

const walletSlice = createSlice({
  name: "wallet",
  initialState: state,
  reducers: {
    setXverseOrdinals: (state, action) => {
      state.xverse.ordinals = action.payload;
    },

    setXversePayment: (state, action) => {
      state.xverse.payment = action.payload;
      state.active.push(XVERSE_WALLET_KEY);
    },

    setXverseSignature: (state, action) => {
      state.xverse.signature = action.payload;
    },

    setXverseBtc: (state, action) => {
      state.xverse.btcBalance = action.payload;
    },

    setMagicEdenCredentials: (state, action) => {
      state.magicEden.ordinals = action.payload.ordinals;
      state.magicEden.payment = action.payload.payment;
      state.magicEden.btcBalance = action.payload.btcBalance;
      state.active.push(MAGICEDEN_WALLET_KEY);
    },

    setUnisatCredentials: (state, action) => {
      state.unisat.address = action.payload.address;
      state.unisat.publicKey = action.payload.publicKey;
      state.unisat.btcBalance = action.payload.BtcBalance;
      state.active.push(UNISAT_WALLET_KEY);
    },

    setPetraKey: (state, action) => {
      state.petra.publicKey = action.payload;
    },

    setPetraAddress: (state, action) => {
      state.petra.address = action.payload;
      if (action.payload && !state.active.includes(PETRA_WALLET_KEY))
        state.active.push(PETRA_WALLET_KEY);
    },

    setMartinAddress: (state, action) => {
      state.martin.address = action.payload;
      if (action.payload && !state.active.includes(MARTIN_WALLET_KEY))
        state.active.push(MARTIN_WALLET_KEY);
    },

    setMartinKey: (state, action) => {
      state.martin.publicKey = action.payload;
    },

    setNightlyAddress: (state, action) => {
      state.nightly.address = action.payload;
      state.active.push(NIGHTLY_WALLET_KEY);
    },

    setNightlyKey: (state, action) => {
      state.nightly.publicKey = action.payload;
    },

    setTableCreated: (state, action) => {
      state.isTableCreated = action.payload;
    },

    clearWalletState: (state, action) => {
      if (action.payload === XVERSE_WALLET_KEY) {
        state.xverse = {
          ordinals: {},
          payment: {},
          signature: null,
        };
      } else if (action.payload === UNISAT_WALLET_KEY) {
        state.unisat = {
          address: null,
          signature: null,
          publicKey: null,
          btcBalance: 0.0,
        };
      } else if (action.payload === MAGICEDEN_WALLET_KEY) {
        state.magicEden = {
          ordinals: {},
          payment: {},
          signature: null,
          btcBalance: 0.0,
        };
      } else if (action.payload === PETRA_WALLET_KEY) {
        state.petra = {
          publicKey: null,
          address: null
        }
      } else if (action.payload === MARTIN_WALLET_KEY) {
        state.martin = {
          publicKey: null,
          address: null
        }
      } else if (action.payload === NIGHTLY_WALLET_KEY) {
        state.nightly = {
          publicKey: null,
          address: null
        }
      }
      state.active = state.active.filter((wallet) => action.payload !== wallet);
    },
  },
});

export const {
  setPetraKey,
  setXverseBtc,
  setMartinKey,
  setNightlyKey,
  setPetraAddress,
  setTableCreated,
  setXversePayment,
  setMartinAddress,
  clearWalletState,
  setXverseOrdinals,
  setNightlyAddress,
  setXverseSignature,
  setUnisatCredentials,
  setMagicEdenCredentials,
} = walletSlice.actions;
export default walletSlice.reducer;
