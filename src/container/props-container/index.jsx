import { Actor, HttpAgent } from "@dfinity/agent";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Notify from "../../component/notification";
import { apiFactory } from "../../ordinal_canister";
import {
  setAgent,
  setApprovedCollection,
  setAptosValue,
  setBtcValue,
  setCollection,
} from "../../redux/slice/constant";
import {
  API_METHODS,
  agentCreator,
  apiUrl,
  ordinals,
} from "../../utils/common";

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
    const ckEthAgent = reduxState.constant.ckEthAgent;
    const ckEthActorAgent = reduxState.constant.ckEthActorAgent;
    const withdrawAgent = reduxState.constant.withdrawAgent;

    const aptosCanisterId = process.env.REACT_APP_APTOS_CANISTER_ID;

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

    useEffect(() => {
      (async () => {
        try {
          if (!api_agent) {
            const ordinalAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });

            const agent = Actor.createActor(apiFactory, {
              agent: ordinalAgent,
              canisterId: aptosCanisterId,
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
      //Fetching BTC Value
      fetchBTCLiveValue();

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
          fetchAptosPrice();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        const API = agentCreator(apiFactory, ordinals);
        const result = await API.get_collections();
        const collections = JSON.parse(result);
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
          dispatch(setApprovedCollection(collectionDetails));
        }
        dispatch(setCollection(collections));
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

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
