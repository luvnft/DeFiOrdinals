import { initJuno } from "@junobuild/core";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { WalletStandardProvider } from "@wallet-standard/react";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import LoadingWrapper from "../component/loading-wrapper";
import store, { persistor } from "../redux/store";
import "./../App.css";
import MainLayout from "./layout";

const App = () => {
  const satelliteId = process.env.REACT_APP_SATELLITE_ID;

  useEffect(() => {
    (async () =>
      await initJuno({
        satelliteId,
      }))();
  }, [satelliteId]);

  return (
    <React.Fragment>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LoadingWrapper>
            <Router>
              <WalletStandardProvider>
                <MainLayout />
              </WalletStandardProvider>
            </Router>
          </LoadingWrapper>
        </PersistGate>
      </Provider>
    </React.Fragment>
  );
};

export default App;
