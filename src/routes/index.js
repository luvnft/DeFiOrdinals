import { lazy } from "react";

export const publicRoutes = [
  {
    name: "Home",
    path: "/",
    component: lazy(() => import("../pages/home")),
  },
  // {
  //   name: "Borrow",
  //   path: "/borrow",
  //   component: lazy(() => import("../pages/borrow")),
  // },
  {
    name: "Faucet",
    path: "/faucet",
    component: lazy(() => import("../pages/faucet")),
  },
  {
    name: "Portfolio",
    path: "/portfolio",
    component: lazy(() => import("../pages/portfolio")),
  },
  // {
  //   name: "BorrowAsset",
  //   path: `/borrowasset`,
  //   component: lazy(() => import("../pages/borrowasset")),
  // },
  {
    name: "WalletAsset",
    path: `/wallet/assets/:address`,
    component: lazy(() => import("../pages/walletasset")),
  },
  {
    name: "Dashboard",
    path: `/dashboard`,
    component: lazy(() => import("../pages/dashboard")),
  },
  // {
  //   name: "Staking",
  //   path: `/staking`,
  //   component: lazy(() => import("../pages/staking")),
  // },
  {
    name: "Lending",
    path: `/lending`,
    component: lazy(() => import("../pages/lending")),
  },
  {
    name: "Veiw transactions",
    path: "/supply/transactions",
    component: lazy(() => import("../pages/transactions")),
  },
  {
    name: "Page 404",
    path: "*",
    component: lazy(() => import("../pages/404")),
  },
  {
    name: "btc/transaction",
    path: "/btc/transactions",
    component: lazy(() => import("../pages/btcTransaction")),
  },
];
