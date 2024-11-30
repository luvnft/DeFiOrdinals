import { Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWallets } from "@wallet-standard/react";
import {
  Col,
  ConfigProvider,
  Divider,
  Drawer,
  Flex,
  Grid,
  Menu,
  Modal,
  Row,
  Tabs,
  Tour,
  Typography,
} from "antd";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { RiWallet3Fill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import { AddressPurpose, BitcoinNetworkType, getAddress } from "sats-connect";
import ordinals_O_logo from "../../assets/brands/ordinals_O_logo.png";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import logo from "../../assets/logo/ordinalslogo.png";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import CardDisplay from "../../component/card";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import { setLendHeader, setLoading } from "../../redux/slice/constant";
import {
  clearWalletState,
  setMagicEdenCredentials,
  setMartinAddress,
  setMartinKey,
  setNightlyAddress,
  setNightlyKey,
  setPetraAddress,
  setPetraKey,
  setTableCreated,
  setUnisatCredentials,
  setXverseBtc,
  setXverseOrdinals,
  setXversePayment,
} from "../../redux/slice/wallet";
import { getAdapter } from "../../utils/adapter";
import { getAptosClient } from "../../utils/aptosClient";
import { Function, Module, contractAddress } from "../../utils/aptosService";
import {
  API_METHODS,
  BTCWallets,
  MAGICEDEN_WALLET_KEY,
  MARTIN_WALLET_KEY,
  NIGHTLY_WALLET_KEY,
  OKX_WALLET_KEY,
  PETRA_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
  addressRendererWithCopy,
  apiUrl,
  paymentWallets,
  sliceAddress,
} from "../../utils/common";
import { propsContainer } from "../props-container";

const Nav = (props) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakPoint = useBreakpoint();
  const { wallets } = useWallets();
  const {
    connect,
    disconnect,
    account,
    wallets: aptosWallets,
    connected,
  } = useWallet();

  const { location, navigate } = props.router;
  const { dispatch, reduxState } = props.redux;

  const walletState = reduxState.wallet;
  // const constantState = reduxState.constant;

  const isTableCreated = walletState.isTableCreated;
  const petraAddress = walletState.petra.address;
  const martinAddress = walletState.martin.address;
  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const nightlyAddress = walletState.nightly.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;

  const [isConnectModal, setConnectModal] = useState(false);
  const [nightlyWalletConnection, setNightlyWalletConnection] = useState(false);
  const [open, setOpen] = useState(false);
  const [screenDimensions, setScreenDimensions] = React.useState({
    width: window.screen.width,
    height: window.screen.height,
  });
  const [current, setCurrent] = useState();

  const avatar = process.env.REACT_APP_AVATAR;
  const SatsConnectNamespace = "sats-connect:";

  const { confirm } = Modal;
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  const [openTour, setOpenTour] = useState(
    localStorage.getItem("isTourEnabled") ?? true
  );

  const tourSteps = [
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Browse
        </Text>
      ),
      description:
        "In this you can veiw the approved collections and partners we have in group with us and we have a suprise page to view borrow and lend page.",
      target: () => ref1.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Dashboard
        </Text>
      ),
      description:
        "In Dashboard page, we have the wallet supplies details, your asset supplies details, asset to supply details and we also have your lendings, asset to lend details.",
      target: () => ref2.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Portfolio
        </Text>
      ),
      description:
        "In Portfolio page, we have the all the three wallet addresses plug wallet, unisat wallet and xverse wallet and we know what are the loan requests avaliable and we have details of our assets.",
      target: () => ref3.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Connect Button
        </Text>
      ),
      description:
        "This button is used to connect the wallet. when you click the button modal opens with two tabs, in BTC tab we connect plug wallet and in ICP tab we connect unisat or xverse wallet",
      target: () => ref4.current,
    },
  ];

  const tourConfirm = () => {
    confirm({
      className: "backModel",
      title: (
        <Text style={{ color: "white", fontSize: "20px", marginTop: -30 }}>
          Tour Alert
        </Text>
      ),
      okText: "Yes",
      cancelText: "No",
      type: "error",
      okButtonProps: { htmlType: "submit" },
      content: (
        <>
          <Row>
            <Col>
              <Typography
                style={{ marginBottom: 5, color: "white", fontSize: "18px" }}
              >
                Are you sure want to cancel tour?
              </Typography>
            </Col>
          </Row>
        </>
      ),
      onOk() {
        localStorage.setItem("isTourEnabled", false);
        setOpenTour(localStorage.getItem("isTourEnabled"));
      },
    });
  };

  const getItem = (label, key, icon, children) => {
    return {
      key,
      icon,
      children,
      label,
    };
  };

  useEffect(() => {
    if (location.pathname === "/") {
      setCurrent("tmp-0");
    } else if (location.pathname === "/borrow") {
      setCurrent("tmp-1");
    } else if (location.pathname === "/lend") {
      setCurrent("tmp-2");
    }
    if (location.pathname === "/portfolio") {
      setCurrent("tmp-3");
    }
  }, [current, location.pathname]);

  const errorMessageNotify = (message) => {
    Notify("error", message);
  };

  const successMessageNotify = (message) => {
    Notify("success", message);
  };

  const collapseConnectedModal = () => {
    setConnectModal(!isConnectModal);
    setOpen(false);
  };

  function isSatsConnectCompatibleWallet(wallet) {
    return SatsConnectNamespace in wallet.features;
  }

  const connectWallet = async (walletName) => {
    if (walletName === XVERSE_WALLET_KEY) {
      const getAddressOptions = {
        payload: {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          message: "Address for receiving Ordinals and payments",
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
        },
        onFinish: async (response) => {
          if (response.addresses) {
            const { addresses } = response;
            const ordinals = addresses.find(
              (ele) => ele.purpose === AddressPurpose.Ordinals
            );
            const payment = addresses.find(
              (ele) => ele.purpose === AddressPurpose.Payment
            );
            dispatch(setXversePayment(payment));
            dispatch(setXverseOrdinals(ordinals));

            const result = await API_METHODS.get(
              `${apiUrl.Unisat_open_api}/v1/indexer/address/${payment.address}/balance`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.REACT_APP_UNISAT_BEARER}`,
                },
              }
            );

            const xverseBtc =
              result.data.data.satoshi / process.env.REACT_APP_BTC_ZERO;

            dispatch(setXverseBtc(xverseBtc));

            collapseConnectedModal();
            successMessageNotify("x-verse Wallet connected!");
          }
        },
        onCancel: () => errorMessageNotify("User rejected the request."),
      };
      try {
        await getAddress(getAddressOptions);
      } catch (error) {
        errorMessageNotify(error.message);
      }
    } else if (walletName === UNISAT_WALLET_KEY) {
      // UNISAT
      if (typeof window.unisat !== "undefined") {
        try {
          dispatch(setLoading(true));
          var accounts = await window.unisat.requestAccounts();
          let publicKey = await window.unisat.getPublicKey();
          let { confirmed: BtcBalance } = await window.unisat.getBalance();
          dispatch(setLoading(false));

          collapseConnectedModal();
          dispatch(
            setUnisatCredentials({
              address: accounts[0],
              publicKey,
              BtcBalance: BtcBalance / process.env.REACT_APP_BTC_ZERO,
            })
          );
          successMessageNotify("Unisat Wallet connected!");
        } catch (error) {
          dispatch(setLoading(false));
          errorMessageNotify(error.message);
        }
      } else {
        errorMessageNotify("No unisat wallet installed!");
      }
    } else if (walletName === UNISAT_WALLET_KEY) {
      try {
        const provider = wallets.find(isSatsConnectCompatibleWallet);
        await getAddress({
          getProvider: async () =>
            provider.features[SatsConnectNamespace]?.provider,
          payload: {
            purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
            message: "Address for receiving Ordinals and payments",
            network: {
              type: BitcoinNetworkType.Mainnet,
            },
          },
          onFinish: async (response) => {
            const { addresses } = response;
            const ordinals = addresses.find(
              (ele) => ele.purpose === AddressPurpose.Ordinals
            );
            const payment = addresses.find(
              (ele) => ele.purpose === AddressPurpose.Payment
            );

            const result = await API_METHODS.get(
              `${apiUrl.Unisat_open_api}/v1/indexer/address/${payment.address}/balance`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.REACT_APP_UNISAT_BEARER}`,
                },
              }
            );

            const magicEdenBtc =
              result.data.data.satoshi / process.env.REACT_APP_BTC_ZERO;

            dispatch(
              setMagicEdenCredentials({
                ordinals,
                payment,
                btcBalance: magicEdenBtc,
              })
            );

            collapseConnectedModal();
            successMessageNotify("Magiceden Wallet connected!");
          },
          onCancel: () => {
            // alert("Request canceled");
          },
        });
      } catch (err) {
        console.log("magiceden error", err);
      }
    } else if (walletName === PETRA_WALLET_KEY) {
      // Petra wallet
      // const getAptosWallet = () => {
      //   if (APTOS_BRAND_KEY in window) {
      //     return window.aptos;
      //   } else {
      //     window.open("https://petra.app/", `_blank`);
      //     return false;
      //   }
      // };

      // const wallet = getAptosWallet();
      try {
        // if (!account?.address && !connected) {
        await connect(aptosWallets[0].name);
        // dispatch(setPetraKey(account.publicKey));
        // dispatch(setPetraAddress(account.address));
        // successMessageNotify("Petra Wallet connected!");
        // } else {
        //   Notify("error", "Connection failed!");
        // }
      } catch (error) {
        // { code: 4001, message: "User rejected the request."}
      }
    } else if (walletName === MARTIN_WALLET_KEY) {
      // Martin wallet
      const getProvider = () => {
        if ("martian" in window) {
          return window.martian;
        }
        window.open("https://www.martianwallet.xyz/", "_blank");
      };
      const wallet = getProvider();
      try {
        if (wallet) {
          await wallet.connect();
          const { address, publicKey } = await wallet.account();
          dispatch(setMartinKey(publicKey));
          dispatch(setMartinAddress(address));
          collapseConnectedModal();
          successMessageNotify("Martin Wallet connected!");
        } else {
          Notify("error", "Connection failed!");
        }
      } catch (error) {
        // { code: 4001, message: "User rejected the request."}
      }
    } else if (walletName === NIGHTLY_WALLET_KEY) {
      // Nightly wallet
      // dispatch(setNightlyActive());
      setNightlyWalletConnection(true);
      collapseConnectedModal();
    } else {
      collapseConnectedModal();
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const isDisabled = (key) => {
    const connected = walletState.active.includes(key);
    if (connected) return "card-disabled";
    const cond = (bool) => (bool ? "card-disabled" : "");
    switch (key) {
      case XVERSE_WALLET_KEY: {
        return cond(
          walletState.active.includes(UNISAT_WALLET_KEY) ||
            walletState.active.includes(MAGICEDEN_WALLET_KEY)
        );
      }
      case UNISAT_WALLET_KEY: {
        return cond(
          walletState.active.includes(XVERSE_WALLET_KEY) ||
            walletState.active.includes(MAGICEDEN_WALLET_KEY)
        );
      }
      case MAGICEDEN_WALLET_KEY: {
        return cond(
          walletState.active.includes(XVERSE_WALLET_KEY) ||
            walletState.active.includes(UNISAT_WALLET_KEY)
        );
      }
      case PETRA_WALLET_KEY: {
        return cond(
          walletState.active.includes(MARTIN_WALLET_KEY) ||
            walletState.active.includes(OKX_WALLET_KEY) ||
            walletState.active.includes(NIGHTLY_WALLET_KEY)
        );
      }
      case MARTIN_WALLET_KEY: {
        return cond(
          walletState.active.includes(PETRA_WALLET_KEY) ||
            walletState.active.includes(OKX_WALLET_KEY) ||
            walletState.active.includes(NIGHTLY_WALLET_KEY)
        );
      }
      case NIGHTLY_WALLET_KEY: {
        return cond(
          walletState.active.includes(PETRA_WALLET_KEY) ||
            walletState.active.includes(OKX_WALLET_KEY) ||
            walletState.active.includes(MARTIN_WALLET_KEY)
        );
      }
      case OKX_WALLET_KEY: {
        return cond(
          walletState.active.includes(PETRA_WALLET_KEY) ||
            walletState.active.includes(NIGHTLY_WALLET_KEY) ||
            walletState.active.includes(MARTIN_WALLET_KEY)
        );
      }
      default:
        return "";
    }
  };

  const walletCards = (wallet, index) => (
    <CardDisplay
      key={`${wallet.label}-${index + 1 * 123}`}
      className={`modalCardBg card-hover width pointer grey-bg m-top-bottom ${isDisabled(
        wallet.key
      )}`}
      hoverable={true}
      onClick={() => {
        connectWallet(wallet.key);
      }}
    >
      <Row align={"middle"}>
        <img
          src={wallet.image}
          alt={`${wallet.key}_logo`}
          style={{
            marginRight: wallet.key === "xverse" ? "20px" : "10px",
          }}
          width={wallet.key === "xverse" ? "7%" : "10%"}
        />{" "}
        <h2
          style={{ margin: "0" }}
          className="white-color font-courier font-large letter-spacing-medium"
          level={2}
        >
          {wallet.label}
        </h2>
      </Row>
    </CardDisplay>
  );

  const getScreenDimensions = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenDimensions({ width, height });
  };

  useEffect(() => {
    window.addEventListener("resize", getScreenDimensions);
    return () => {
      window.removeEventListener("resize", getScreenDimensions);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (account?.address && !petraAddress) {
        dispatch(setPetraKey(account.publicKey));
        dispatch(setPetraAddress(account.address));
        successMessageNotify("Petra Wallet connected!");
        if (!isTableCreated) {
          try {
            const aptosClient = getAptosClient(Network.DEVNET);
            const payload = {
              type: "entry_function_payload",
              function: `${contractAddress}::${Module.BORROW}::${Function.CREATE_MANAGER}`,
              arguments: [],
              type_arguments: [],
            };
            // console.log("payload", payload);
            const transaction = await window.aptos.signAndSubmitTransaction(
              payload
            );
            // console.log("transaction", transaction);
            await aptosClient.waitForTransaction(transaction.hash);
            if (transaction.hash) {
              dispatch(setTableCreated(true));
            }
          } catch (error) {
            console.log("Manager error", error);
          }
        }
        collapseConnectedModal();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, dispatch]);

  const init = async () => {
    const adapter = await getAdapter();
    try {
      const response = await adapter.connect();

      if (response.status === "Approved") {
        dispatch(setNightlyAddress(response.address));
        dispatch(setNightlyKey(response.publicKey));
      } else {
        setNightlyWalletConnection(false);
      }
    } catch (error) {
      setNightlyWalletConnection(false);
      await adapter.disconnect().catch(() => {});
      console.log(error);
    }
    return adapter;
  };

  useEffect(() => {
    (async () => {
      if (nightlyWalletConnection) {
        await init();
        // Events goes here
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, nightlyWalletConnection]);

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const options = [
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/");
          setOpen(false);
        }}
      >
        Browse
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/lending");
          setOpen(false);
        }}
      >
        Lending
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/borrowing");
          setOpen(false);
        }}
      >
        Borrowing
      </Row>
    ),
    getItem(
      <Row
        className="font-style "
        onClick={() => {
          navigate("/bridge");
          setOpen(false);
        }}
      >
        Bridge Ordinals
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/portfolio");
          setOpen(false);
        }}
      >
        Portfolio
      </Row>
    ),
  ];

  const avatarRenderer = (width) => (
    <img
      src={`${avatar}/svg?seed=${
        xverseAddress
          ? xverseAddress
          : unisatAddress
          ? unisatAddress
          : magicEdenAddress
          ? magicEdenAddress
          : petraAddress
          ? petraAddress
          : martinAddress
      }`}
      width={width}
      className="avatar"
      alt="avatar"
    />
  );
  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });

  return (
    <>
      <Row
        justify={{
          xs: "space-between",
          lg: "space-between",
          xl: "space-between",
        }}
        align={"middle"}
      >
        <Col>
          <Row align={"middle"}>
            <Col>
              <div className="hover14 column">
                <div>
                  <figure>
                    <img
                      style={{ marginRight: "20px" }}
                      src={logo}
                      alt="logo"
                      className="pointer"
                      width="70px"
                      onClick={() => {
                        navigate("/");
                        dispatch(setLendHeader(false));
                      }}
                    />
                  </figure>
                </div>
              </div>
            </Col>
          </Row>
        </Col>

        <Col>
          {screenDimensions.width >= 1200 && (
            <>
              <Flex gap={50}>
                <Text
                  className={`${
                    location.pathname === "/"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref1}
                >
                  Browse
                </Text>
                <Text className="font-xsmall color-grey">|</Text>
                <Text
                  className={`${
                    location.pathname === "/lending"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/lending");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref2}
                >
                  Lending
                </Text>
                <Text className="font-xsmall color-grey">|</Text>

                <Text
                  className={`${
                    location.pathname === "/borrowing"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/borrowing");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref2}
                >
                  Borrowing
                </Text>
                <Text className="font-xsmall color-grey">|</Text>

                <Text
                  className={`${
                    location.pathname === "/bridge"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/bridge");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref3}
                >
                  Bridge Ordinals
                </Text>
                {/* <Text className="font-xsmall color-grey">|</Text>
                <Text
                  className={`${
                    location.pathname.includes("faucet")
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one  `}
                  onClick={() => {
                    navigate("/faucet");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref4}
                >
                  Faucet
                </Text> */}
                <Text className="font-xsmall color-grey">|</Text>
                <Text
                  className={`${
                    location.pathname.includes("portfolio")
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one  `}
                  onClick={() => {
                    navigate("/portfolio");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref5}
                >
                  Portfolio
                </Text>
              </Flex>
            </>
          )}
        </Col>

        <Col>
          <Flex gap={10} justify="end" align={"center"} ref={ref4}>
            {xverseAddress ||
            unisatAddress ||
            magicEdenAddress ||
            petraAddress ||
            martinAddress ||
            nightlyAddress ? (
              <Col>
                <Flex
                  gap={5}
                  align="center"
                  className="pointer avatar-wrapper"
                  onClick={showDrawer}
                  justify="space-evenly"
                >
                  {screenDimensions.width > 767 ? (
                    <>{avatarRenderer(45)}</>
                  ) : (
                    <label class="hamburger">
                      <input type="checkbox" checked={open} />
                      <svg viewBox="0 0 32 32">
                        <path
                          class="line line-top-bottom"
                          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                        ></path>
                        <path class="line" d="M7 16 27 16"></path>
                      </svg>
                    </label>
                  )}
                </Flex>
              </Col>
            ) : (
              <Col>
                {!breakPoint.xs ? (
                  <Row justify={"end"}>
                    <CustomButton
                      className="click-btn gradient-bg white-color"
                      // old btn style
                      // className="button-css lend-button"
                      title={"Connect"}
                      onClick={() => {
                        if (walletState.active.length < 2) {
                          collapseConnectedModal();
                        } else {
                          successMessageNotify("Wallet already connected!");
                        }
                      }}
                    />
                  </Row>
                ) : (
                  <RxHamburgerMenu
                    color="violet"
                    size={25}
                    onClick={showDrawer}
                  />
                )}
              </Col>
            )}
          </Flex>
        </Col>
      </Row>

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "green",
          },
        }}
      >
        <Tour
          scrollIntoViewOptions={true}
          open={openTour === "false" ? false : true}
          zIndex={1}
          animated
          onClose={(location) => {
            if (location === 3) {
              localStorage.setItem("isTourEnabled", false);
              setOpenTour(localStorage.getItem("isTourEnabled"));
            } else {
              tourConfirm();
            }
          }}
          steps={tourSteps}
          indicatorsRender={(current, total) => (
            <span>
              {current + 1} / {total}
            </span>
          )}
        />
      </ConfigProvider>

      <ModalDisplay
        open={isConnectModal}
        footer={""}
        onCancel={() => collapseConnectedModal()}
        width={breakPoint.xs ? "100%" : "32%"}
      >
        <div>
          <Row justify={"start"} align={"middle"}>
            <Text
              className={`${
                breakPoint.xs ? "font-medium" : "font-large"
              } gradient-text-one biticon heading-one`}
            >
              <RiWallet3Fill
                size={breakPoint.xs ? 27 : 35}
                className="main-bg-gradient-two border-radius-5"
              />{" "}
              Connect Wallet{" "}
            </Text>
          </Row>

          <Row justify={"start"} align={"middle"}>
            <Text className={`font-small text-color-two biticon mt-15`}>
              Choose how you want to connect. If you don't have a wallet, you
              can select a provider and create one.
            </Text>
          </Row>

          <Row className="">
            <Col>
              <Tabs
                items={[
                  {
                    key: "1",
                    label: (
                      <Row align={"middle"}>
                        <img
                          src={Aptos}
                          alt="noimage"
                          style={{ paddingRight: "10px" }}
                          width="20px"
                        />
                        <Text className="font-weight-600 letter-spacing-medium text-color-one font-large">
                          {" "}
                          APTOS
                        </Text>
                      </Row>
                    ),
                    children: (
                      <>
                        {paymentWallets.map((wallet, index) => {
                          return (
                            <Row key={`index-${wallet.key}`}>
                              {walletCards(wallet, index)}
                            </Row>
                          );
                        })}
                      </>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <Row align={"middle"}>
                        <img
                          src={Bitcoin}
                          alt="noimage"
                          style={{ paddingRight: "10px" }}
                          width="25px"
                        />
                        <Text className="font-weight-600 letter-spacing-medium text-color-one font-large">
                          {" "}
                          BTC
                        </Text>
                      </Row>
                    ),
                    children: (
                      <>
                        {BTCWallets.map((wallet, index) => {
                          return (
                            <Row key={`index-${wallet.key}`}>
                              {walletCards(wallet, index)}
                            </Row>
                          );
                        })}
                      </>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </div>
      </ModalDisplay>

      <Drawer
        closeIcon
        width={screenDimensions.width > 425 ? "320px" : "280px"}
        style={{ height: screenDimensions.width > 1199 ? "43%" : "100%" }}
        title={
          <>
            <Row justify={"space-evenly"} align={"middle"}>
              <Flex gap={10} align="center">
                {avatarRenderer(45)}
                <Text className="text-color-one">
                  {xverseAddress ? (
                    <>{sliceAddress(xverseAddress, 5)}</>
                  ) : unisatAddress ? (
                    <>{sliceAddress(unisatAddress, 5)}</>
                  ) : magicEdenAddress ? (
                    <>{sliceAddress(magicEdenAddress, 5)}</>
                  ) : petraAddress ? (
                    <>{sliceAddress(petraAddress, 5)}</>
                  ) : nightlyAddress ? (
                    <>{sliceAddress(nightlyAddress, 5)}</>
                  ) : (
                    <>{sliceAddress(martinAddress, 5)}</>
                  )}
                </Text>
              </Flex>
            </Row>
            <Row justify={"center"}>
              <Divider />
            </Row>
          </>
        }
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        footer={
          <>
            {screenDimensions.width > 1199 && (
              <Row
                justify={"end"}
                className="iconalignment pointer"
                onClick={async () => {
                  let adapter;
                  if (walletState.active.includes(NIGHTLY_WALLET_KEY)) {
                    adapter = await getAdapter();
                    await adapter.disconnect();
                    setNightlyWalletConnection(false);
                  }
                  successMessageNotify("Your are signed out!");
                  walletState.active.forEach(async (wallet) => {
                    if (wallet === XVERSE_WALLET_KEY) {
                      dispatch(clearWalletState(XVERSE_WALLET_KEY));
                    } else if (wallet === UNISAT_WALLET_KEY) {
                      dispatch(clearWalletState(UNISAT_WALLET_KEY));
                    } else if (wallet === MAGICEDEN_WALLET_KEY) {
                      dispatch(clearWalletState(MAGICEDEN_WALLET_KEY));
                    } else if (wallet === PETRA_WALLET_KEY) {
                      dispatch(clearWalletState(PETRA_WALLET_KEY));
                      window.aptos.disconnect();
                      if (connected) {
                        disconnect();
                      }
                    } else if (wallet === NIGHTLY_WALLET_KEY) {
                      dispatch(clearWalletState(NIGHTLY_WALLET_KEY));
                    } else {
                      dispatch(clearWalletState(MARTIN_WALLET_KEY));
                      window.martian.disconnect();
                    }
                  });
                  onClose();
                }}
              >
                <AiOutlineDisconnect
                  color="white"
                  style={{ fill: "chocolate" }}
                  size={25}
                />
                <Text className="text-color-two font-small heading-one">
                  Disconnect
                </Text>
              </Row>
            )}
          </>
        }
      >
        {/* Drawer Renderer */}
        <>
          <Row justify={"space-between"} align={"middle"}>
            <Col>
              <Flex align="center">
                <img
                  src={Aptos}
                  alt="aptos"
                  style={{ marginRight: "10px" }}
                  width={25}
                />
                <Flex vertical>
                  <Text className="text-color-two font-medium">Payments</Text>
                  <Text className="text-color-one font-xsmall">
                    {petraAddress ? (
                      <>
                        {sliceAddress(petraAddress, 9)}{" "}
                        {addressRendererWithCopy(petraAddress)}
                      </>
                    ) : martinAddress ? (
                      <>
                        {sliceAddress(martinAddress, 9)}{" "}
                        {addressRendererWithCopy(martinAddress)}
                      </>
                    ) : nightlyAddress ? (
                      <>
                        {sliceAddress(nightlyAddress, 9)}{" "}
                        {addressRendererWithCopy(nightlyAddress)}
                      </>
                    ) : (
                      "---"
                    )}
                  </Text>
                </Flex>
              </Flex>
            </Col>

            <Col>
              {walletState.active.includes(PETRA_WALLET_KEY) ||
              walletState.active.includes(MARTIN_WALLET_KEY) ||
              walletState.active.includes(NIGHTLY_WALLET_KEY) ? null : (
                <CustomButton
                  className="font-size-18 black-bg text-color-one border-none"
                  title={"Connect"}
                  onClick={() => {
                    if (walletState.active.length < 2) {
                      collapseConnectedModal();
                    } else {
                      successMessageNotify("Wallet already connected!");
                    }
                  }}
                />
              )}
            </Col>
          </Row>

          <Row justify={"space-between"} className="mt" align={"middle"}>
            <Col>
              <Flex align="center">
                <img
                  src={ordinals_O_logo}
                  alt="bitcoin"
                  style={{ marginRight: "10px", borderRadius: "50%" }}
                  width={25}
                />
                <Flex vertical>
                  <Text className="text-color-two font-medium">Ordinals</Text>
                  <Text className="text-color-one font-xsmall">
                    {xverseAddress ? (
                      <>
                        {sliceAddress(xverseAddress, 9)}{" "}
                        {addressRendererWithCopy(xverseAddress)}
                      </>
                    ) : unisatAddress ? (
                      <>
                        {sliceAddress(unisatAddress, 9)}{" "}
                        {addressRendererWithCopy(unisatAddress)}
                      </>
                    ) : magicEdenAddress ? (
                      <>
                        {sliceAddress(magicEdenAddress, 9)}{" "}
                        {addressRendererWithCopy(magicEdenAddress)}
                      </>
                    ) : (
                      "---"
                    )}
                  </Text>
                </Flex>
              </Flex>
            </Col>

            <Col>
              {walletState.active.includes(XVERSE_WALLET_KEY) ||
              walletState.active.includes(UNISAT_WALLET_KEY) ||
              walletState.active.includes(MAGICEDEN_WALLET_KEY) ? null : (
                <CustomButton
                  className="font-size-18 black-bg text-color-one border-none"
                  title={"Connect"}
                  onClick={() => {
                    if (walletState.active.length < 2) {
                      collapseConnectedModal();
                    } else {
                      successMessageNotify("Wallet already connected!");
                    }
                  }}
                />
              )}
            </Col>
          </Row>

          {screenDimensions.width < 1200 && (
            <>
              <Row
                style={{ marginTop: "10px" }}
                justify={{
                  xs: "center",
                  sm: "center",
                  md: "end",
                  lg: "end",
                  xl: "end",
                }}
                className="iconalignment pointer"
                onClick={async () => {
                  let adapter;
                  if (walletState.active.includes(NIGHTLY_WALLET_KEY)) {
                    adapter = await getAdapter();
                    await adapter.disconnect();
                    setNightlyWalletConnection(false);
                  }
                  successMessageNotify("Your are signed outs!");
                  walletState.active.forEach((wallet) => {
                    if (wallet === XVERSE_WALLET_KEY) {
                      dispatch(clearWalletState(XVERSE_WALLET_KEY));
                    } else if (wallet === UNISAT_WALLET_KEY) {
                      dispatch(clearWalletState(UNISAT_WALLET_KEY));
                    } else if (wallet === MAGICEDEN_WALLET_KEY) {
                      dispatch(clearWalletState(MAGICEDEN_WALLET_KEY));
                    } else if (wallet === PETRA_WALLET_KEY) {
                      dispatch(clearWalletState(PETRA_WALLET_KEY));
                      window.aptos.disconnect();
                      if (connected) {
                        disconnect();
                      }
                    } else if (wallet === NIGHTLY_WALLET_KEY) {
                      dispatch(clearWalletState(NIGHTLY_WALLET_KEY));
                    } else {
                      dispatch(clearWalletState(MARTIN_WALLET_KEY));
                      window.martian.disconnect();
                    }
                  });
                  onClose();
                }}
              >
                <AiOutlineDisconnect
                  color="white"
                  style={{ fill: "chocolate" }}
                  size={25}
                />
                <Text className="text-color-two font-small heading-one">
                  Disconnect
                </Text>
              </Row>
              <Row justify={"center"}>
                <Divider />
              </Row>
              <Menu
                onClick={onClick}
                style={{ width: screenDimensions.width > 425 ? 270 : 230 }}
                defaultOpenKeys={["sub1"]}
                selectedKeys={[current]}
                mode="inline"
                items={options}
              />
              {/* {screenDimensions.width < 992 && (
                <Row style={{ padding: " 0px 24px", marginTop: "10px" }}>
                  <Col>
                    <Loading
                      spin={!constantState.btcvalue}
                      indicator={
                        <TailSpin
                          stroke="#6a85f1"
                          alignmentBaseline="central"
                        />
                      }
                    >
                      {constantState.btcvalue ? (
                        <Flex gap={5}>
                          <Text className="gradient-text-one font-small heading-one">
                            BTC
                          </Text>
                          <img
                            src={Bitcoin}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width="35dvw"
                          />{" "}
                          <Text className="gradient-text-one font-small heading-one">
                            $ {constantState.btcvalue}
                          </Text>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Loading>
                  </Col>
                </Row>
              )} */}
            </>
          )}
        </>
        {/* Drawer renderer ended */}
      </Drawer>
    </>
  );
};

export default propsContainer(Nav);
