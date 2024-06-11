import { lazy } from "react";

export const publicRoutes = [
  {
    name: "Home",
    path: "/",
    component: lazy(() => import("../pages/home")),
  },
  {
    name: "Borrowing",
    path: "/borrowing",
    component: lazy(() => import("../pages/borrowing")),
  },
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
  {
    name: "MyAssets",
    path: `/myassets`,
    component: lazy(() => import("../pages/my-assets")),
  },
  // {
  //   name: "Dashboard",
  //   path: `/dashboard`,
  //   component: lazy(() => import("../pages/dashboard")),
  // },
  {
    name: "Lending",
    path: `/lending`,
    component: lazy(() => import("../pages/lending")),
  },
  {
    name: "Page 404",
    path: "*",
    component: lazy(() => import("../pages/404")),
  },
];
