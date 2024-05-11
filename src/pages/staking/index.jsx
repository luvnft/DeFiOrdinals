import { Principal } from "@dfinity/principal";
import {
  Col,
  Divider,
  Dropdown,
  Flex,
  Input,
  Row,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { MdContentCopy } from "react-icons/md";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
import Icp from "../../assets/brands/icp_logo.png";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import Etherium from "../../assets/coin_logo/cketh.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import WalletConnectDisplay from "../../component/wallet-error-display";
import { propsContainer } from "../../container/props-container";
import { sliceAddress } from "../../utils/common";

const NumericInput = (props) => {
  const { onChange, data, placeholder } = props;

  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = data.asset === "ckETH" ? /^\d*(\.\d{0,3})?$/ : /^\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === "") {
      onChange(inputValue);
    }
  };

  return (
    <Input
      {...props}
      size="large"
      className="inputStyle"
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

const Staking = (props) => {
  /* global BigInt */
  const {
    api_agent,
    withdrawAgent,
    ckBtcAgent,
    ckEthAgent,
    ckBtcActorAgent,
    ckEthActorAgent,
  } = props.wallet;
  const { navigate } = props.router;
  const [ckEthRaw, setCkEthRaw] = useState(0);
  const [ckBtcRaw, setCkBtcRaw] = useState(0);
  const [ckEthBalance, setCkEthBalance] = useState(null);
  const [ckBtcBalance, setCkBtcBalance] = useState(null);
  const [ckEthValue, setCkEthValue] = useState(null);
  const [ckBtcValue, setCkBtcValue] = useState(null);
  const [ckEthRawBalance, setCkEthRawBalance] = useState(null);
  const [ckBtcRawBalance, setCkBtcRawBalance] = useState(null);
  const [copy, setCopy] = useState("Copy");
  const [withDrawModal, setWithdrawModal] = useState(false);
  const [coinDetailsModal, setCoinDetailsModal] = useState(false);
  const [assetToSupplyModal, setAssetToSupplyModal] = useState(false);
  const [value, setValue] = useState(null);
  const [ckBtcCanister, setCkbtcCanister] = useState(null);
  const [ckEthCanister, setCkethCanister] = useState(null);
  const [coinItems, setCoinItems] = useState({
    coinName: "",
    canisterId: "xxxx-xxxx-xxxx-xxxx",
  });

  const [assetToSupplyModalDetails, setAssetToSupplyModalDetails] = useState({
    asset: "",
    balance: "",
    img: "",
    isAllowance: false,
    ckBtcAllowance: 0,
    ckEthAllowance: 0,
  });
  const [withdrawModalData, setWithdrawModalData] = useState({
    asset: "",
    balance: "",
  });
  const [loadingState, setLoadingState] = useState({
    isApproveBtn: false,
    isSupplyBtn: false,
    isLendCkbtcBtn: false,
    isBorrowData: false,
    isLendData: false,
    isWithdrawBtn: false,
    isRepayBtn: false,
    isAssetSupplies: false,
    isAssetWithdraw: false,
  });

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ETH_ZERO = process.env.REACT_APP_ETH_ZERO;
  const CKBTC_CANISTER = process.env.REACT_APP_CKBTC_CANISTER_ID;
  const CKETH_CANISTER = process.env.REACT_APP_CKETH_CANISTER_ID;
  const ORDINAL_CANISTER = process.env.REACT_APP_ORDINAL_CANISTER_ID;
  const { reduxState, isPlugError } = props.redux;
  // const { navigate } = props.router;
  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;
  const ethvalue = reduxState.constant.ethvalue;
  const btcValue = reduxState.constant.btcvalue;
  let plugAddress = walletState.plug.principalId;
  const { Text } = Typography;

  const handleSupplyWithdraw = async () => {
    try {
      let withdrawResult;
      if (value > 0 && value < withdrawModalData.balance) {
        setLoadingState((prev) => ({ ...prev, isWithdrawBtn: true }));
        if (withdrawModalData.asset === "ckBTC") {
          withdrawResult = await withdrawAgent.withDrawckBTC(
            BigInt(Number(value) * BTC_ZERO)
          );
        } else {
          withdrawResult = await withdrawAgent.withDrawckEth(
            BigInt(Number(value) * ETH_ZERO)
          );
        }
        setLoadingState((prev) => ({ ...prev, isWithdrawBtn: false }));

        if (withdrawResult.Ok) {
          Notify("success", `The amount of ${value} withdrawn successfully`);
          handleCancel();
        }
      } else {
        Notify("error", "Oops!, Insufficient amount.");
      }
    } catch (error) {
      setLoadingState((prev) => ({ ...prev, isWithdrawBtn: false }));
    }
  };

  const fetchCkBtcAllowance = async () => {
    let allowanceResult;
    const allowanceArg = {
      spender: {
        owner: Principal.fromText(ORDINAL_CANISTER),
        subaccount: [],
      },
      account: {
        owner: Principal.fromText(plugAddress),
        subaccount: [],
      },
    };

    try {
      if (ckBtcAgent) {
        allowanceResult = await ckBtcAgent.icrc2_allowance(allowanceArg);
      } else {
        Notify("warning", "Reconnect the plug wallet to process!");
      }

      if (Number(allowanceResult.allowance) > 0) {
        setAssetToSupplyModalDetails((prev) => ({
          ...prev,
          isAllowance: true,
          ckBtcAllowance: Number(allowanceResult.allowance),
        }));
      }
    } catch (error) {
      Notify("error", error.message);
    }
  };

  const fetchCkEthAllowance = async () => {
    let allowanceResult;
    const allowanceArg = {
      spender: {
        owner: Principal.fromText(ORDINAL_CANISTER),
        subaccount: [],
      },
      account: {
        owner: Principal.fromText(plugAddress),
        subaccount: [],
      },
    };

    try {
      if (ckEthAgent) {
        allowanceResult = await ckEthAgent.icrc2_allowance(allowanceArg);
      } else {
        Notify("warning", "Reconnect the plug wallet to process!");
      }
      if (Number(allowanceResult.allowance) > 0) {
        setAssetToSupplyModalDetails((prev) => ({
          ...prev,
          isAllowance: true,
          ckEthAllowance: Number(allowanceResult.allowance),
        }));
      }
    } catch (error) {
      Notify("error", error.message);
    }
  };

  const handleApprove = async () => {
    const amount = Number(value);
    let coinValue =
      assetToSupplyModalDetails.asset === "ckBTC" ? ckBtcValue : ckEthValue;

    if (amount < coinValue && amount > 0) {
      try {
        const approveArg = {
          expected_allowance: [],
          expires_at: [],
          from_subaccount: [],
          spender: {
            owner: Principal.fromText(ORDINAL_CANISTER),
            subaccount: [],
          },
          fee: [],
          memo: [],
          created_at_time: [],
          amount:
            assetToSupplyModalDetails.asset === "ckBTC"
              ? parseInt(BigInt(amount * BTC_ZERO).toString())
              : BigInt(amount * 10000000000000000),
        };

        setLoadingState((prev) => ({ ...prev, isApproveBtn: true }));
        if (assetToSupplyModalDetails.asset === "ckBTC") {
          if (ckBtcAgent) {
            await ckBtcAgent.icrc2_approve(approveArg);
            fetchCkBtcAllowance();
          } else {
            Notify("warning", "Reconnect the plug wallet to process!");
          }
        } else {
          if (ckEthAgent) {
            await ckEthAgent.icrc2_approve(approveArg);
            fetchCkEthAllowance();
          } else {
            Notify("warning", "Reconnect the plug wallet to process!");
          }
        }
        setLoadingState((prev) => ({ ...prev, isApproveBtn: false }));
        Notify("success", `Amount of ${amount} has been approved successfully`);
      } catch (error) {
        Notify("error", error.message);
        setLoadingState((prev) => ({ ...prev, isApproveBtn: false }));
      }
    } else {
      Notify("error", "Oops!, Insufficient balance.");
    }
  };

  const handleTransfer = async () => {
    if (value) {
      try {
        const transferFromArg = {
          from: {
            owner: Principal.fromText(plugAddress),
            subaccount: [],
          },
          to: {
            owner: Principal.fromText(ORDINAL_CANISTER),
            subaccount: [],
          },
          fee: [],
          memo: [],
          spender_subaccount: [],
          created_at_time: [],
          amount: BigInt(value * BTC_ZERO),
        };

        setLoadingState((prev) => ({ ...prev, isSupplyBtn: true }));
        if (assetToSupplyModalDetails.asset === "ckBTC") {
          if (ckBtcAgent) {
            await ckBtcAgent.icrc2_transfer_from(transferFromArg);
          } else {
            Notify("warning", "Reconnect the plug wallet to process!");
          }
        } else {
          if (ckEthAgent) {
            await ckEthAgent.icrc2_transfer_from(transferFromArg);
          } else {
            Notify("warning", "Reconnect the plug wallet to process!");
          }
        }
        setLoadingState((prev) => ({ ...prev, isSupplyBtn: false }));
        handleCancel();
        Notify(
          "success",
          `Supply of ${value} has been transfered successfully!`
        );
      } catch (error) {
        Notify("error", error.message);
        setLoadingState((prev) => ({ ...prev, isSupplyBtn: false }));
      }
    } else {
      Notify("warning", "Fill the amount!");
    }
  };

  const fetchBtcAssetBalance = async () => {
    let ckBtcBalance = await ckBtcActorAgent.icrc1_balance_of({
      owner: Principal.fromText(plugAddress),
      subaccount: [],
    });

    if (Number(ckBtcBalance) < 99) {
      ckBtcBalance = 0;
    }

    setCkBtcValue(Number(ckBtcBalance) / BTC_ZERO);
    setCkBtcRaw(Number(ckBtcBalance));

    //Fetching ckEth
    let ckEthBalance = await ckEthActorAgent.icrc1_balance_of({
      owner: Principal.fromText(plugAddress),
      subaccount: [],
    });
    if (Number(ckEthBalance) < 99) {
      ckEthBalance = 0;
    }
    setCkEthValue(Number(ckEthBalance) / ETH_ZERO);
    setCkEthRaw(Number(ckEthBalance));
  };

  const fetchCkEthBalance = async () => {
    try {
      const ckEthBalance = await api_agent.getckEthBalance(
        Principal.fromText(plugAddress)
      );
      if (Number(ckEthBalance).length < 16) {
        setCkEthRawBalance(Number(ckEthBalance));
        setCkEthBalance(Number(ckEthBalance) / ETH_ZERO);
      } else {
        setCkEthRawBalance(0);
        setCkEthBalance(0);
      }
    } catch (error) {
      // console.log("Fetch ckEth Balance error", error);
    }
  };

  const fetchCkBtcBalance = async () => {
    try {
      const ckBtcBalance = await api_agent.getckBTCBalance(
        Principal.fromText(plugAddress)
      );
      if (Number(ckBtcBalance) > 99) {
        setCkBtcRawBalance(Number(ckBtcBalance));
        setCkBtcBalance(Number(ckBtcBalance) / BTC_ZERO);
      } else {
        setCkBtcRawBalance(0);
        setCkBtcBalance(0);
      }
    } catch (error) {
      // console.log("Fetch ckBtc Balance error", error);
    }
  };

  const showModal = (obj) => {
    setAssetToSupplyModal(true);
    setAssetToSupplyModalDetails((prev) => ({
      ...prev,
      asset: obj.asset,
      balance: obj.asset === "ckBTC" ? ckBtcValue : ckEthValue,
    }));
  };

  useEffect(() => {
    (async () => {
      if (ckBtcAgent && plugAddress) {
        fetchCkBtcAllowance();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckBtcAgent, plugAddress]);

  useEffect(() => {
    (async () => {
      if (
        ckEthAgent &&
        plugAddress &&
        !assetToSupplyModalDetails.ckEthAllowance
      ) {
        fetchCkEthAllowance();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckEthAgent, plugAddress]);

  // Fetching ckBtc asset balance
  useEffect(() => {
    if (plugAddress && ckBtcAgent && ckEthAgent) {
      fetchBtcAssetBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckBtcAgent, ckEthAgent, plugAddress]);

  // Fetching BTC & ETH Balance
  useEffect(() => {
    if (api_agent && plugAddress) {
      fetchCkBtcBalance();
      fetchCkEthBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, plugAddress]);

  const WalletSupplyTableData = [
    {
      key: 1,
      asset: "ckBTC",
      collateral: "Collateral",
    },
    {
      key: 2,
      asset: "ckETH",
      collateral: "Collateral",
    },
  ];

  const WalletAssestsToSupplyTableData = [
    {
      key: 1,
      asset: "ckBTC",
    },
    {
      key: 2,
      asset: "ckETH",
    },
    {
      key: 3,
      asset: "Canister Balances",
    },
  ];

  const showWithdrawModal = (obj) => {
    setWithdrawModal(true);
    setWithdrawModalData((prev) => ({
      ...prev,
      asset: obj.asset,
      balance: obj.asset === "ckBTC" ? ckBtcBalance : ckEthBalance,
    }));
  };

  const handleOk = () => {
    setWithdrawModal(false);
    setCoinDetailsModal(false);
    setAssetToSupplyModal(false);
  };

  const handleCancel = () => {
    setWithdrawModal(false);
    setValue(null);
    setCoinDetailsModal(false);
    setAssetToSupplyModal(false);
  };

  useEffect(() => {
    if (plugAddress && api_agent) {
      (async () => {
        const btcCanister = await api_agent.ckBTCBalance();
        const ethCanister = await api_agent.ckEthBalance();
        const ckBtcCanisterValue = Number(btcCanister) / BTC_ZERO;
        const ckEthCanisterValue = Number(ethCanister) / ETH_ZERO;
        setCkbtcCanister(ckBtcCanisterValue);
        setCkethCanister(ckEthCanisterValue);
      })();
    }
  }, [BTC_ZERO, ETH_ZERO, api_agent, plugAddress]);

  return (
    <>
      <Row align={"middle"} justify={"space-between"}>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Staking</h1>
        </Col>
        <Col>
          {walletState.active?.length > 1 && !isPlugError && (
            <CustomButton
              className="click-btn"
              onClick={() => navigate("/supply/transactions")}
              title="Transactions"
            ></CustomButton>
          )}
        </Col>
      </Row>
      {walletState.active?.length > 1 && !isPlugError ? (
        <>
          <Row justify={"space-between"} className="mt-15">
            {WalletSupplyTableData.map((obj) => {
              return (
                <Col xs={11} className="bg-cards pointer">
                  <Row
                    justify={"space-between"}
                    align={"middle"}
                    className="mt-20 pad-15"
                  >
                    <Text className="main-text soul-font color-white">
                      {obj.asset === "ckBTC" ? "ckBTC" : "ckETH"}
                    </Text>
                    <img
                      src={obj.asset === "ckBTC" ? Bitcoin : Etherium}
                      alt="noimg"
                      height={"120px"}
                      className="icons"
                    />
                  </Row>

                  <Row className="pad-15">
                    <Text className="font-xslarge color-white">
                      {obj.asset === "ckBTC" ? (
                        ckBtcBalance !== null ? (
                          ckBtcBalance
                        ) : (
                          <Loading
                            spin={!ckEthValue}
                            indicator={
                              <ThreeDots
                                stroke="#6a85f1"
                                alignmentBaseline="central"
                              />
                            }
                          />
                        )
                      ) : ckEthBalance !== null ? (
                        ckEthBalance
                      ) : (
                        <Loading
                          spin={!ckEthValue}
                          indicator={
                            <ThreeDots
                              stroke="#6a85f1"
                              alignmentBaseline="central"
                            />
                          }
                        />
                      )}
                    </Text>
                  </Row>

                  <Row
                    className="pad-15"
                    justify={"space-between"}
                    align={"middle"}
                  >
                    <Text className="font-medium text-color-two">
                      ${" "}
                      {obj.asset === "ckBTC"
                        ? (ckBtcBalance * btcValue).toFixed(2)
                        : (ckEthBalance * ethvalue).toFixed(2)}
                    </Text>
                    <CustomButton
                      disabled={
                        obj.asset === "ckBTC" ? !ckBtcBalance : !ckEthBalance
                      }
                      className={
                        "font-weight-600 letter-spacing-small click-btn"
                      }
                      title="Withdraw"
                      size="medium"
                      onClick={() => showWithdrawModal(obj)}
                    />
                  </Row>
                </Col>
              );
            })}
          </Row>

          <Row className="mt-30" justify={"space-between"}>
            {WalletAssestsToSupplyTableData.map((obj) => {
              return (
                <>
                  <div className="staking-card">
                    <Row className="stakingCard-border"></Row>
                    <Row justify={"space-between"}>
                      <Col className="iconalignment ">
                        <Text className="text-color-one font-large">
                          {obj.asset === "ckBTC"
                            ? "ckBTC"
                            : obj.asset === "ckETH"
                            ? "ckETH"
                            : "Canister Balances"}
                        </Text>

                        <img
                          src={
                            obj.asset === "ckBTC"
                              ? Bitcoin
                              : obj.asset === "ckETH"
                              ? Etherium
                              : Icp
                          }
                          alt="noimg"
                          width={"30px"}
                        />
                      </Col>
                      {(obj.asset === "ckBTC" || obj.asset === "ckETH") && (
                        <Col>
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "1",
                                  label: (
                                    <CustomButton
                                      title={"Details"}
                                      onClick={() => {
                                        setCoinItems(
                                          obj.asset === "ckBTC"
                                            ? {
                                                coinName: "ckBTC",
                                                canisterId: CKBTC_CANISTER,
                                              }
                                            : {
                                                coinName: "ckETH",
                                                canisterId: CKETH_CANISTER,
                                              }
                                        );
                                        setCoinDetailsModal(true);
                                      }}
                                    />
                                  ),
                                },
                              ],
                            }}
                            placement="bottom"
                            arrow={{
                              pointAtCenter: true,
                            }}
                          >
                            <PiDotsThreeVerticalBold
                              className="mt-7 pointer"
                              size={26}
                              color="white"
                            />
                          </Dropdown>
                        </Col>
                      )}
                    </Row>
                    <Divider className="line" />
                    {obj.asset === "Canister Balances" && (
                      <Row justify={"space-between"}>
                        <Col md={10}>
                          <Row justify={"center"}>
                            <Text className="text-color-one font-medium">
                              ckBTC
                            </Text>
                          </Row>
                        </Col>
                        <Col>
                          <Text className="text-color-one font-medium">|</Text>
                        </Col>
                        <Col md={10}>
                          <Row justify={"center"}>
                            {" "}
                            <Text className="text-color-one font-medium">
                              ckETH
                            </Text>
                          </Row>
                        </Col>
                      </Row>
                    )}

                    <Flex vertical>
                      {obj.asset === "ckBTC" ? (
                        <>
                          {ckBtcValue !== null ? (
                            <>
                              <span className="text-color-one font-small letter-spacing-small">
                                {ckBtcValue}
                              </span>
                              <span className="text-color-two font-xsmall letter-spacing-small">
                                $ {(ckBtcValue * btcValue).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <Loading
                              spin={!ckBtcValue}
                              indicator={
                                <ThreeDots
                                  stroke="#6a85f1"
                                  alignmentBaseline="central"
                                />
                              }
                            />
                          )}
                        </>
                      ) : obj.asset === "ckETH" ? (
                        <>
                          {ckEthValue !== null ? (
                            <>
                              <span className="text-color-one font-small letter-spacing-small">
                                {ckEthValue.toFixed(4)}
                              </span>
                              <span className="text-color-two font-xsmall letter-spacing-small">
                                $ {(ckEthValue * ethvalue).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <Loading
                              spin={!ckEthValue}
                              indicator={
                                <ThreeDots
                                  stroke="#6a85f1"
                                  alignmentBaseline="central"
                                />
                              }
                            />
                          )}
                        </>
                      ) : ckBtcCanister === null || ckEthCanister === null ? (
                        <Loading
                          spin={true}
                          indicator={
                            <ThreeDots
                              stroke="#6a85f1"
                              alignmentBaseline="central"
                            />
                          }
                        />
                      ) : (
                        <>
                          <Row>
                            <Col
                              md={11}
                              className="text-color-one font-small letter-spacing-small"
                            >
                              <Row justify={"center"}>
                                <span className="color-white font-small">
                                  {ckBtcCanister.toFixed(8)}
                                </span>
                                <span className="text-color-two font-xsmall letter-spacing-small">
                                  $ {(ckBtcCanister * btcValue).toFixed(2)}
                                </span>
                              </Row>
                            </Col>

                            <Col
                              offset={3}
                              md={10}
                              className=" letter-spacing-small"
                            >
                              <Row justify={"center"}>
                                <span className="color-white font-small">
                                  {ckEthCanister.toFixed(7)}
                                </span>
                                <span className="text-color-two font-xsmall letter-spacing-small">
                                  $ {(ckEthCanister * ethvalue).toFixed(2)}
                                </span>
                              </Row>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Flex>
                    {(obj.asset === "ckBTC" || obj.asset === "ckETH") && (
                      <CustomButton
                        className="click-btn"
                        onClick={() => showModal(obj)}
                        title="Supply"
                      ></CustomButton>
                    )}
                    {/* </Col> */}
                  </div>
                </>
              );
            })}
          </Row>

          {/*BTC/ETH Withdraw modal */}
          <ModalDisplay
            width={"25%"}
            open={withDrawModal}
            onCancel={handleCancel}
            onOk={handleOk}
            footer={null}
            title={
              <Row className="black-bg white-color font-large">
                Withdraw {withdrawModalData.asset}
              </Row>
            }
          >
            <Flex vertical>
              <Text className="text-color-two font-small iconalignment">
                Amount <HiOutlineInformationCircle />
              </Text>
              <NumericInput
                placeholder={"0.00"}
                data={withdrawModalData}
                value={value}
                onChange={setValue}
                suffix={
                  <Flex vertical align="end">
                    <span className="text-color-one font-small iconalignment font-weight-600">
                      <img
                        src={
                          withdrawModalData.asset === "ckBTC"
                            ? Bitcoin
                            : Etherium
                        }
                        alt="noimage"
                        style={{ justifyContent: "center" }}
                        width="30dvw"
                      />
                      {withdrawModalData.asset}
                    </span>
                    <span className="text-color-two">
                      Wallet balance {withdrawModalData.balance}
                      <span
                        style={{ marginLeft: "4px" }}
                        onClick={() => {
                          if (withdrawModalData.asset === "ckBTC")
                            setValue((ckBtcRawBalance - 99) / BTC_ZERO);
                          else {
                            if (ckEthRawBalance > 0)
                              setValue(
                                ((ckEthRawBalance - 10) / ETH_ZERO).toFixed(2)
                              );
                          }
                        }}
                        className="text-color-one font-weight-600 pointer"
                      >
                        MAX
                      </span>
                    </span>
                  </Flex>
                }
              />
            </Flex>
            <Row>
              {withdrawModalData.asset === "ckBTC" ? (
                <span className="text-color-two font-small">
                  $ {(value * constantState.btcvalue).toFixed(2)}
                </span>
              ) : (
                <span className="text-color-two font-small">
                  $ {(value * constantState.ethvalue).toFixed(2)}
                </span>
              )}
            </Row>
            <Row className="mt-15">
              <Text className="text-color-two font-small">
                Transaction overview
              </Text>
            </Row>
            <Flex vertical className="border-color">
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small"> Supply APY</Text>
                </Col>
                <Col>
                  <Text className="text-color-one font-small">0.01%</Text>
                </Col>
              </Row>
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small">
                    Collateralization
                  </Text>
                </Col>
                <Col>
                  <Text style={{ color: "green" }} className="font-small">
                    Enabled
                  </Text>
                </Col>
              </Row>
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small">
                    Health factor
                  </Text>
                </Col>
                <Col>
                  <Flex vertical align="end">
                    <Text style={{ color: "green" }} className="font-small">
                      7.79 - 8.24
                    </Text>
                  </Flex>
                </Col>
              </Row>
            </Flex>

            <Flex
              vertical
              className={`${
                (withdrawModalData.ckBtcAllowance &&
                  withdrawModalData.asset === "ckBTC") ||
                (withdrawModalData.ckEthAllowance &&
                  withdrawModalData.asset === "ckETH")
                  ? "modalBoxGreenShadow"
                  : "modalBoxRedShadow"
              } mt`}
            >
              <Row justify={"space-between"}>
                <Col
                  className={
                    (withdrawModalData.ckBtcAllowance &&
                      withdrawModalData.asset === "ckBTC") ||
                    (withdrawModalData.ckEthAllowance &&
                      withdrawModalData.asset === "ckETH")
                      ? ""
                      : "iconalignment"
                  }
                >
                  <HiOutlineInformationCircle />
                  {(withdrawModalData.ckBtcAllowance &&
                    withdrawModalData.asset === "ckBTC") ||
                  (withdrawModalData.ckEthAllowance &&
                    withdrawModalData.asset === "ckETH") ? (
                    <span>
                      {" "}
                      You already have an approved allowance of{" "}
                      {withdrawModalData.asset === "ckBTC"
                        ? withdrawModalData.ckBtcAllowance / BTC_ZERO
                        : withdrawModalData.ckEthAllowance / ETH_ZERO}
                      . If your supply amount exceeds allowance, you need to
                      approve to transfer supply.
                    </span>
                  ) : (
                    <span>You don't have any approved allowance!</span>
                  )}
                </Col>
              </Row>
            </Flex>

            <>
              <CustomButton
                loading={loadingState.isWithdrawBtn}
                className={"font-weight-600  m-25 width  letter-spacing-small"}
                title={`Withdraw ${withdrawModalData.asset}`}
                onClick={handleSupplyWithdraw}
              />
            </>
          </ModalDisplay>

          <ModalDisplay
            width={"50%"}
            title={
              <Row className="black-bg white-color font-large letter-spacing-small">
                Details
              </Row>
            }
            footer={null}
            open={coinDetailsModal}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Row className="mt-30">
              <Col md={6}>
                <Text className="gradient-text-one font-small font-weight-600">
                  Coin Details
                </Text>
              </Col>
              <Col md={18}>
                <Row>
                  <Col md={12}>
                    <img
                      src={coinItems.coinName === "ckBTC" ? Bitcoin : Etherium}
                      alt={"Coin_Image"}
                      className="border-radius-30"
                      width={125}
                    />
                    <Row>
                      <Text className="text-color-one ml">
                        <span className="font-weight-600 font-small ">$ </span>
                        {(coinItems.coinName === "ckBTC" &&
                        (btcValue || ethvalue)
                          ? btcValue
                          : ethvalue
                        )?.toFixed(2)}
                      </Text>
                    </Row>
                  </Col>
                  <Col md={12}>
                    <Row>
                      {" "}
                      <Flex vertical>
                        <Text className="text-color-two font-small">
                          Coin Name
                        </Text>
                        <Text className="text-color-one font-small font-weight-600">
                          {coinItems.coinName}
                        </Text>
                      </Flex>
                    </Row>
                    <Row>
                      {" "}
                      <Flex vertical>
                        <Text className="text-color-two font-small">
                          Canister Id
                        </Text>

                        <Text className="text-color-one font-small font-weight-600 iconalignment">
                          {sliceAddress(coinItems?.canisterId, 7)}
                          <Tooltip
                            arrow
                            title={copy}
                            trigger={"hover"}
                            placement="top"
                          >
                            <MdContentCopy
                              className="pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  coinItems?.canisterId
                                );
                                setCopy("Copied");
                                setTimeout(() => {
                                  setCopy("Copy");
                                }, 2000);
                              }}
                              size={20}
                              color="#764ba2"
                            />
                          </Tooltip>
                        </Text>
                      </Flex>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider />
            <Row className="mt-15">
              <Col md={6}>
                <Text className="gradient-text-one font-small font-weight-600">
                  About
                </Text>
              </Col>
              <Col md={18}>
                {coinItems.coinName === "ckBTC" ? (
                  <Flex vertical>
                    <Text className="text-color-two font-small">
                      Chain-key Bitcoin (ckBTC) is an ICRC-2-compliant token
                      that is backed 1:1 by bitcoins held 100% on the mainnet.
                    </Text>
                    <Text className="text-color-two font-small">
                      The ckBTC functionality is provided through an interplay
                      of two canisters:
                    </Text>
                    <Text className="text-color-two font-small font-weight-600 ml-75 iconalignment">
                      <img src={Bitcoin} alt="noimage" width="20px" />
                      The ckBTC minter.
                    </Text>
                    <Text className="text-color-two font-small font-weight-600 ml-75 iconalignment">
                      <img src={Bitcoin} alt="noimage" width="20px" />
                      The ckBTC ledger.
                    </Text>
                  </Flex>
                ) : (
                  <Flex vertical align="baseline">
                    <Text className="text-color-two font-small">
                      - Chain-key Ether, or ckETH, is an IC-native token that
                      represents Ether (ETH), the native token of Ethereum.
                      Anybody that has $ETH can use a canister smart contract on
                      the IC to convert that into ckETH.
                    </Text>
                    <Text className="text-color-two font-small">
                      - Vice-versa, any holder of ckETH can choose to receive
                      the underlying ETH instead.
                    </Text>
                  </Flex>
                )}
              </Col>
            </Row>
          </ModalDisplay>

          <ModalDisplay
            width={"25%"}
            open={assetToSupplyModal}
            onCancel={handleCancel}
            onOk={handleOk}
            footer={null}
            title={
              <Row className="black-bg white-color font-large">
                Supply {assetToSupplyModalDetails.asset}
              </Row>
            }
          >
            <Flex vertical>
              <Text className="text-color-two font-small iconalignment">
                Amount <HiOutlineInformationCircle />
              </Text>
              <NumericInput
                placeholder={"0.00"}
                data={assetToSupplyModalDetails}
                value={value}
                onChange={setValue}
                suffix={
                  <Flex vertical align="end">
                    <span className="text-color-one font-small iconalignment font-weight-600">
                      <img
                        src={
                          assetToSupplyModalDetails.asset === "ckBTC"
                            ? Bitcoin
                            : Etherium
                        }
                        alt="noimage"
                        style={{ justifyContent: "center" }}
                        width="30dvw"
                      />
                      {assetToSupplyModalDetails.asset}
                    </span>
                    <span className="text-color-two">
                      Wallet balance{" "}
                      {assetToSupplyModalDetails.asset === "ckBTC"
                        ? Number(assetToSupplyModalDetails.balance)
                        : Number(assetToSupplyModalDetails.balance).toFixed(4)}
                      <span
                        style={{ marginLeft: "4px" }}
                        onClick={() => {
                          if (assetToSupplyModalDetails.asset === "ckBTC")
                            setValue((ckBtcRaw - 99) / BTC_ZERO);
                          else setValue((ckEthRaw - 10) / ETH_ZERO);
                        }}
                        className="text-color-one font-weight-600 pointer"
                      >
                        MAX
                      </span>
                    </span>
                  </Flex>
                }
              />
            </Flex>
            <Row>
              {assetToSupplyModalDetails.asset === "ckBTC" ? (
                <span className="text-color-two font-small">
                  $ {(value * constantState.btcvalue).toFixed(2)}
                </span>
              ) : (
                <span className="text-color-two font-small">
                  $ {(value * constantState.ethvalue).toFixed(2)}
                </span>
              )}
            </Row>

            <Row className="mt-15">
              <Text className="text-color-two font-small">
                Transaction overview
              </Text>
            </Row>
            <Flex vertical className="border-color">
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small"> Supply APY</Text>
                </Col>
                <Col>
                  <Text className="text-color-one font-small">0.01%</Text>
                </Col>
              </Row>
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small">
                    Collateralization
                  </Text>
                </Col>
                <Col>
                  <Text style={{ color: "green" }} className="font-small">
                    Enabled
                  </Text>
                </Col>
              </Row>
              <Row justify={"space-between"}>
                <Col>
                  <Text className="text-color-one font-small">
                    Health factor
                  </Text>
                </Col>
                <Col>
                  <Flex vertical align="end">
                    <Text style={{ color: "green" }} className="font-small">
                      7.79 - 8.24
                    </Text>
                  </Flex>
                </Col>
              </Row>
            </Flex>

            <Flex
              vertical
              className={`${
                (assetToSupplyModalDetails.ckBtcAllowance &&
                  assetToSupplyModalDetails.asset === "ckBTC") ||
                (assetToSupplyModalDetails.ckEthAllowance &&
                  assetToSupplyModalDetails.asset === "ckETH")
                  ? "modalBoxGreenShadow"
                  : "modalBoxRedShadow"
              } mt`}
            >
              <Row justify={"space-between"}>
                <Col
                  className={
                    (assetToSupplyModalDetails.ckBtcAllowance &&
                      assetToSupplyModalDetails.asset === "ckBTC") ||
                    (assetToSupplyModalDetails.ckEthAllowance &&
                      assetToSupplyModalDetails.asset === "ckETH")
                      ? ""
                      : "iconalignment"
                  }
                >
                  <HiOutlineInformationCircle />
                  {(assetToSupplyModalDetails.ckBtcAllowance &&
                    assetToSupplyModalDetails.asset === "ckBTC") ||
                  (assetToSupplyModalDetails.ckEthAllowance &&
                    assetToSupplyModalDetails.asset === "ckETH") ? (
                    <span>
                      {" "}
                      You already have an approved allowance of{" "}
                      {assetToSupplyModalDetails.asset === "ckBTC"
                        ? assetToSupplyModalDetails.ckBtcAllowance / BTC_ZERO
                        : assetToSupplyModalDetails.ckEthAllowance / ETH_ZERO}
                      . If your supply amount exceeds allowance, you need to
                      approve to transfer supply.
                    </span>
                  ) : (
                    <span>You don't have any approved allowance!</span>
                  )}
                </Col>
              </Row>
            </Flex>

            {assetToSupplyModalDetails.asset === "ckBTC" && (
              <>
                {assetToSupplyModalDetails.ckBtcAllowance === 0 &&
                  value * BTC_ZERO >
                    assetToSupplyModalDetails.ckBtcAllowance && (
                    <CustomButton
                      loading={loadingState.isApproveBtn}
                      className={
                        "modalButton font-weight-600 text-color-one m-25 width  letter-spacing-small"
                      }
                      title={`Approve ${assetToSupplyModalDetails.asset} to continue `}
                      onClick={handleApprove}
                    />
                  )}
              </>
            )}

            {assetToSupplyModalDetails.asset === "ckETH" && (
              <>
                {assetToSupplyModalDetails.ckEthAllowance === 0 &&
                  value * ETH_ZERO >
                    assetToSupplyModalDetails.ckEthAllowance && (
                    <CustomButton
                      loading={loadingState.isApproveBtn}
                      className={
                        "modalButton font-weight-600 text-color-one m-25 width "
                      }
                      title={`Approve ${assetToSupplyModalDetails.asset} to continue `}
                      onClick={handleApprove}
                    />
                  )}
              </>
            )}

            {assetToSupplyModalDetails.asset === "ckBTC" && (
              <>
                {!(
                  value * BTC_ZERO >
                  assetToSupplyModalDetails.ckBtcAllowance
                ) && (
                  <CustomButton
                    loading={loadingState.isSupplyBtn}
                    className={
                      "font-weight-600  m-25 width  letter-spacing-small"
                    }
                    title={`Supply ${assetToSupplyModalDetails.asset}`}
                    onClick={handleTransfer}
                  />
                )}
              </>
            )}

            {assetToSupplyModalDetails.asset === "ckETH" && (
              <>
                {value * ETH_ZERO >
                  assetToSupplyModalDetails.ckEthAllowance && (
                  <CustomButton
                    loading={loadingState.isSupplyBtn}
                    className={
                      "font-weight-600  m-25 width  letter-spacing-small"
                    }
                    title={`Supply ${assetToSupplyModalDetails.asset}`}
                    onClick={handleTransfer}
                  />
                )}
              </>
            )}
          </ModalDisplay>
        </>
      ) : (
        <WalletConnectDisplay isPlugError={isPlugError} />
      )}
    </>
  );
};
export default propsContainer(Staking);
