import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AffiliatesIdlFactory } from "../../affiliate_canister";
import { ckBtcIdlFactory } from "../../ckBTC_canister";
import { ckEthIdlFactory } from "../../ckETH_canister";
import Notify from "../../component/notification";
import { apiFactory } from "../../ordinal_canister";
import {
  setAffiliateCanister,
  setAgent,
  setAirDropData,
  setAirPoints,
  setApprovedCollection,
  setAptosValue,
  setBtcValue,
  setCkBtcActorAgent,
  setCkBtcAgent,
  setCkEthActorAgent,
  setCkEthAgent,
  setCollection,
  setEthValue,
  setwithdrawAgent,
} from "../../redux/slice/constant";
import { setPlugPrincipalId } from "../../redux/slice/wallet";
import { API_METHODS, apiUrl } from "../../utils/common";

export const propsContainer = (Component) => {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const reduxState = useSelector((state) => state);
    const api_agent = reduxState.constant.agent;
    const aptosvalue = reduxState.constant.aptosvalue;
    const collections = reduxState.constant.collection;
    const ckBtcAgent = reduxState.constant.ckBtcAgent;
    const ckBtcActorAgent = reduxState.constant.ckBtcActorAgent;
    const affiliateCanister = reduxState.constant.affiliateCanister;
    const ckEthAgent = reduxState.constant.ckEthAgent;
    const ckEthActorAgent = reduxState.constant.ckEthActorAgent;
    const withdrawAgent = reduxState.constant.withdrawAgent;
    const principalId = reduxState.wallet.plug.principalId;
    const xverseAddress = reduxState.wallet.xverse.ordinals.address;
    const unisatAddress = reduxState.wallet.unisat.address;

    const [isPlugError, setIsPlugError] = useState(false);

    const btcPrice = async () => {
      const BtcData = await API_METHODS.get(
        `${apiUrl.Asset_server_base_url}/api/v1/fetch/BtcPrice`
      );
      return BtcData;
    };

    const fetchBTCLiveValue = async () => {
      try {
        const BtcData = await btcPrice();
        if (BtcData.data.data[0]?.length) {
          const btcValue = BtcData.data.data[0].flat();
          dispatch(setBtcValue(btcValue[1]));
        } else {
          fetchBTCLiveValue();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch ckBtc");
      }
    };

    const fetchETHLiveValue = async () => {
      try {
        const EthData = await API_METHODS.get(
          `${apiUrl.Asset_server_base_url}/api/v1/fetch/EthPrice`
        );
        if (EthData.data.data[0]?.length) {
          const btcValue = EthData.data.data[0].flat();
          dispatch(setEthValue(btcValue[1]));
        } else {
          fetchETHLiveValue();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch ckEth");
      }
    };

    const fetchAptosPrice = async () => {
      let ONE_MINUTE = 60;
      const unixTimestampSeconds = Math.floor(new Date().getTime() / 1000);
      try {
        const AptosData = await API_METHODS.get(
          `${apiUrl.Coin_base_url}/products/APT-USD/candles?start=${Math.floor(
            unixTimestampSeconds - 60
          )}&end=${unixTimestampSeconds}&granularity=${ONE_MINUTE}`
        );
        if (AptosData.data[0]?.length) {
          const aptosValue = AptosData.data[0].flat();
          dispatch(setAptosValue(aptosValue[1]));
        } else {
          fetchAptosPrice();
          if (!aptosvalue) dispatch(setAptosValue(8.44));
        }
      } catch (error) {
        // Notify("error", "Failed to fetch Aptos");
      }
    };

    const fetchUserPoints = async () => {
      try {
        const claimedPoints = await affiliateCanister.getUserPoints(
          Principal.fromText(principalId)
        );
        dispatch(setAirPoints(Number(claimedPoints)));
      } catch (error) {
        console.log("Get Air Drop error", error);
      }
    };

    const fetchAirDropData = async () => {
      try {
        const airDropData = await affiliateCanister.getAirDrops(
          Principal.fromText(principalId)
        );
        if (airDropData.ordinalAddress) {
          dispatch(setAirDropData(airDropData));
        }
      } catch (error) {
        console.log("Get Air Drop error", error);
      }
    };

    const verifyConnection = async () => {
      if (principalId) {
        const connected = await window.ic.plug.isConnected();
        if (!connected) {
          // Notify("warning", "Connection aborted, please reconnect wallet!");
          return false;
        } else {
          return true;
        }
      }
    };

    useEffect(() => {
      (async () => {
        try {
          if (!api_agent) {
            const ordinalAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });

            const agent = Actor.createActor(apiFactory, {
              agent: ordinalAgent,
              canisterId: process.env.REACT_APP_ORDINAL_CANISTER_ID,
            });

            dispatch(setAgent(agent));
          }
        } catch (error) {
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        try {
          if (!ckBtcActorAgent) {
            const ckBtcHttpAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });

            const ckBtcActorAgent = Actor.createActor(ckBtcIdlFactory, {
              agent: ckBtcHttpAgent,
              canisterId: process.env.REACT_APP_BTC_CANISTER_ID,
            });

            dispatch(setCkBtcActorAgent(ckBtcActorAgent));
          }
        } catch (error) {
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        try {
          if (!ckEthActorAgent) {
            const ckEthHttpAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });

            const ckEthActorAgent = Actor.createActor(ckEthIdlFactory, {
              agent: ckEthHttpAgent,
              canisterId: process.env.REACT_APP_ETH_CANISTER_ID,
            });

            dispatch(setCkEthActorAgent(ckEthActorAgent));
          }
        } catch (error) {
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        try {
          if (window?.ic?.plug) {
            const isVerified = await verifyConnection();
            if (isVerified) {
              if (!ckBtcAgent) {
                // Btc canister for transactions
                const ckBtcAgent = await window.ic?.plug.createActor({
                  canisterId: process.env.REACT_APP_BTC_CANISTER_ID,
                  interfaceFactory: ckBtcIdlFactory,
                });

                dispatch(setCkBtcAgent(ckBtcAgent));
              }

              if (!ckEthAgent) {
                const ckEthAgent = await window.ic?.plug.createActor({
                  canisterId: process.env.REACT_APP_ETH_CANISTER_ID,
                  interfaceFactory: ckEthIdlFactory,
                });

                dispatch(setCkEthAgent(ckEthAgent));
              }

              if (!withdrawAgent) {
                // My Ordinal Canister for withdraw purpose
                const withdrawAgent = await window.ic?.plug.createActor({
                  canisterId: process.env.REACT_APP_ORDINAL_CANISTER_ID,
                  interfaceFactory: apiFactory,
                });

                dispatch(setwithdrawAgent(withdrawAgent));
              }

              if (!affiliateCanister) {
                // Btc canister for transactions
                const affiliateAgent = await window.ic?.plug.createActor({
                  canisterId: process.env.REACT_APP_AFFILIATES_CANISTER_ID,
                  interfaceFactory: AffiliatesIdlFactory,
                });

                dispatch(setAffiliateCanister(affiliateAgent));
              }
            }
          }
        } catch (error) {
          console.log("error", error);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        if (
          principalId &&
          affiliateCanister &&
          (xverseAddress || unisatAddress)
        ) {
          await fetchUserPoints();
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      dispatch,
      affiliateCanister,
      principalId,
      xverseAddress,
      unisatAddress,
    ]);

    useEffect(() => {
      (async () => {
        if (
          principalId &&
          affiliateCanister &&
          (xverseAddress || unisatAddress)
        ) {
          await fetchAirDropData();
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      dispatch,
      affiliateCanister,
      principalId,
      xverseAddress,
      unisatAddress,
    ]);

    useEffect(() => {
      //Fetching BTC Value
      fetchBTCLiveValue();

      //Fetching ETH Value
      fetchETHLiveValue();

      //Fetch aptos value
      fetchAptosPrice();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          if (ckBtcAgent) fetchBTCLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          if (ckEthAgent) fetchETHLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchAptosPrice();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        if (api_agent) {
          const result = await api_agent.get_collections();
          const collections = JSON.parse(result);
          console.log("collections", collections);
          if (collections[0]?.symbol) {
            const collectionPromise = collections.map(async (asset) => {
              return new Promise(async (resolve, reject) => {
                const { data } = await API_METHODS.get(
                  `${apiUrl.Asset_server_base_url}/api/v2/fetch/collection/${asset.symbol}`
                );
                resolve({ ...asset, ...data });
              });
            });

            const collectionDetails = await Promise.all(collectionPromise);
            console.log("collectionDetails", collectionDetails);
            dispatch(setApprovedCollection(collectionDetails));
          }
          dispatch(setCollection(collections));
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        setInterval(async () => {
          if (
            collections.length &&
            api_agent &&
            (location.pathname === "/" || location.pathname === "/dashboard")
          ) {
            const collection = await api_agent.get_collections();
            dispatch(setCollection(JSON.parse(collection)));
          }
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        if (principalId) {
          const result = await window.ic.plug.isConnected();
          if (result) {
            if (window.ic.plug.principalId) {
              dispatch(setPlugPrincipalId(window.ic.plug.principalId));
            }
            setIsPlugError(false);
          } else {
            if (!isPlugError) {
              setIsPlugError(true);
              Notify(
                "warning",
                "Please reconnect your wallet as account changed!"
              );
            }
          }
        } else {
          setIsPlugError(false);
        }
      })();
    }, [dispatch, principalId, isPlugError]);

    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
        redux={{ dispatch, reduxState, isPlugError }}
        wallet={{
          api_agent,
          ckBtcAgent,
          ckEthAgent,
          withdrawAgent,
          ckBtcActorAgent,
          ckEthActorAgent,
        }}
      />
    );
  }
  return ComponentWithRouterProp;
};
