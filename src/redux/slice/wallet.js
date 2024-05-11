import { createSlice } from "@reduxjs/toolkit";
import { MAGICEDEN_WALLET_KEY, PETRA_WALLET_KEY, PLUG_WALLET_KEY, UNISAT_WALLET_KEY, XVERSE_WALLET_KEY } from "../../utils/common";

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
  plug: {
    key: {},
    principalId: null,
  },
  petra: {
    publicKey: null,
    address: null,
  },
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

    setPlugKey: (state, action) => {
      state.plug.key = action.payload;
    },

    setPetraKey: (state, action) => {
      state.petra.publicKey = action.payload;
    },

    setPlugPrincipalId: (state, action) => {
      state.plug.principalId = action.payload;
      if (action.payload && !state.active.includes(PLUG_WALLET_KEY))
        state.active.push(PLUG_WALLET_KEY);
    },

    setPetraAddress: (state, action) => {
      state.petra.address = action.payload;
      if (action.payload && !state.active.includes(PETRA_WALLET_KEY))
        state.active.push(PETRA_WALLET_KEY);
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
      } else if (action.payload === PLUG_WALLET_KEY) {
        state.plug = {
          key: {},
          principalId: null,
        };
      } else if (action.payload === MAGICEDEN_WALLET_KEY) {
        state.magicEden = {
          ordinals: {},
          payment: {},
          signature: null,
          btcBalance: 0.0,
        };
      } else {
        state.petra = {
          publicKey: null,
          address: null
        }
      }
      state.active = state.active.filter((wallet) => action.payload !== wallet);
    },
  },
});

export const {
  setPlugKey,
  setPetraKey,
  setXverseBtc,
  setPetraAddress,
  setXversePayment,
  clearWalletState,
  setXverseOrdinals,
  setPlugPrincipalId,
  setXverseSignature,
  setUnisatCredentials,
  setMagicEdenCredentials,
} = walletSlice.actions;
export default walletSlice.reducer;
