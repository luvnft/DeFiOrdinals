import { Principal } from "@dfinity/principal";
import { base64, hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { Checkbox, Col, Flex, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import { BsFillCircleFill } from "react-icons/bs";
import { CiPercent } from "react-icons/ci";
import { GiOpenTreasureChest } from "react-icons/gi";
import { GoInfo } from "react-icons/go";
import { LuCalendarDays } from "react-icons/lu";
import { PiCircleHalfLight, PiMagicWandFill } from "react-icons/pi";
import { BitcoinNetworkType, signTransaction } from "sats-connect";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import Notify from "../../component/notification";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";

const BorrowAsset = (props) => {
  const { location, navigate } = props.router;
  const { state } = location;
  const { cardDetails, imageUrl } = state;
  const { api_agent } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const btcValue = reduxState.constant.btcvalue;
  const principalId = reduxState.wallet.plug.principalId;
  const xverseWallet = reduxState.wallet.xverse;
  const { address: xverseOrdinalsAddress } = xverseWallet.ordinals;
  const { address: xversePaymentAddress } = xverseWallet.payment;
  const xverseOrdinalsPublicKey = reduxState.wallet.xverse.ordinals.publicKey;
  const xversePaymentPublicKey = reduxState.wallet.xverse.payment.publicKey;
  const [form] = Form.useForm();
  const [date, setDate] = useState(new Date());
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [blockValue, setBlockValue] = useState(0);
  const [dateString, setDateString] = useState("");
  const [BTCtoUSDvalue, setBTCtoUSDvalue] = useState(0);

  // Don't delete this code
  /* global BigInt */

  useEffect(() => {
    const formattedDate = formatDate(date);
    setDateString(formattedDate);
  }, [date]);

  useEffect(() => {
    form.setFieldValue("Desired loan amount", 0);
    form.setFieldValue("Desired loan duration", daysToAdd);
    form.setFieldValue("Desired APR", 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  const handleCancel = () => {
    navigate("/borrow");
    form.setFieldValue("Desired loan amount", 0);
    form.setFieldValue("Desired loan duration", 0);
    form.setFieldValue("Desired APR", 0);
    setBTCtoUSDvalue(0);
    setBlockValue(0);
  };

  const addonAfter = (name, Icon) => {
    return (
      <div className="iconalignment">
        {name}{" "}
        {name === "BTC" ? (
          <img src={Icon} alt="noimage" width="25px" />
        ) : (
          <Icon size={25} />
        )}
      </div>
    );
  };

  const handleUsdValue = (e) => {
    setBTCtoUSDvalue((e.target.value * btcValue).toFixed(2));
  };

  const handleBlockValue = (e) => {
    const newDaysToAdd =
      e.target.value > 3
        ? e.target.value < 31
          ? parseInt(e.target.value)
          : 30
        : 0;
    setDaysToAdd(newDaysToAdd);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + newDaysToAdd);
    setDate(e.target.value > 3 ? newDate : new Date());

    if (e.target.value > 30) {
      form.setFieldValue("Desired loan duration", 30);
    }
    if (
      form.getFieldValue("Desired loan duration") > 3 &&
      form.getFieldValue("Desired loan duration") < 31
    ) {
      setBlockValue(
        (form.getFieldValue("Desired loan duration") * 144).toFixed(2)
      );
    } else {
      setBlockValue(0);
    }
  };

  const handleLoanAmount = (e) => {
    form.setFieldValue("Desired loan amount", ((0.0985 * e) / 100).toFixed(2));
    return setBTCtoUSDvalue(
      (form.getFieldValue("Desired loan amount") * btcValue).toFixed(2)
    );
  };

  const handleLoanDuration = (e) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + e);
    setDate(e ? newDate : new Date());
    form.setFieldValue("Desired loan duration", e);
    return setBlockValue((e * 144).toFixed(2));
  };

  const handleApr = (e) => {
    form.setFieldValue("Desired APR", e);
  };

  const loanAmount =
    form.getFieldValue("Desired loan amount") === ""
      ? 0
      : form.getFieldValue("Desired loan amount");
  const loanDuration =
    form.getFieldValue("Desired loan duration") < 4
      ? 0
      : form.getFieldValue("Desired loan duration");
  const apr =
    form.getFieldValue("Desired APR") > 19 &&
    form.getFieldValue("Desired APR") < 301
      ? form.getFieldValue("Desired APR")
      : 0;

  const platformFee = (loanAmount * 1) / 100;
  const interestAccured = (loanAmount * loanDuration * apr) / 36500;
  const repayment =
    (Number(loanAmount) + Number(interestAccured) + platformFee) * btcValue;
  const lenderProfit = repayment - (platformFee + parseInt(loanAmount));

  const handleAprValue = (e) => {
    if (e.target.value > 300) {
      form.setFieldValue("Desired APR", 300);
    }
    if (
      form.getFieldValue("Desired APR") > 19 &&
      form.getFieldValue("Desired APR") < 301
    ) {
    } else {
    }
  };

  const getUTXOs = async (network, address) => {
    const url = `${process.env.REACT_APP_MEMPOOL_API}/api/address/${address}/utxo`;
    const response = await fetch(url);

    return response.json();
  };

  const createPSBT = async (
    networkType,
    paymentPublicKeyString,
    ordinalsPublicKeyString,
    paymentUnspentOutputs,
    ordinalsUnspentOutputs,
    recipient1,
    recipient2,
    assetDetails
  ) => {
    const network =
      networkType === BitcoinNetworkType.Testnet
        ? btc.TEST_NETWORK
        : btc.NETWORK;

    // Current borrowing tx details
    const asset = ordinalsUnspentOutputs.find(
      (asset) => asset.txid === assetDetails.tx_id
    );

    // choosing the unspent amount
    const paymentOutput = paymentUnspentOutputs[0];
    // Choosing the assets tx
    const ordinalOutput = asset;

    const paymentPublicKey = hex.decode(paymentPublicKeyString);
    const ordinalPublicKey = hex.decode(ordinalsPublicKeyString);

    const tx = new btc.Transaction({
      allowUnknownOutputs: true,
    });

    // create segwit spend
    const p2wpkh = btc.p2wpkh(paymentPublicKey, network);
    const p2sh = btc.p2sh(p2wpkh, network);

    // create taproot spend
    const p2tr = btc.p2tr(ordinalPublicKey, undefined, network);

    // set transfer amount and calculate change
    const fee = 300n; // set the miner fee amount
    const recipient1Amount = BigInt(Math.min(ordinalOutput.value, 3000)) - fee;
    const recipient2Amount = BigInt(Math.min(ordinalOutput.value, 3000));
    const total = recipient1Amount + recipient2Amount;
    const changeAmount =
      BigInt(paymentOutput.value) + BigInt(ordinalOutput.value) - total - fee;

    // payment input
    tx.addInput({
      txid: paymentOutput.txid,
      index: paymentOutput.vout,
      witnessUtxo: {
        script: p2sh.script ? p2sh.script : Buffer.alloc(0),
        amount: BigInt(paymentOutput.value),
      },
      redeemScript: p2sh.redeemScript ? p2sh.redeemScript : Buffer.alloc(0),
      witnessScript: p2sh.witnessScript,
      sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
    });

    // ordinals input
    tx.addInput({
      txid: ordinalOutput.txid,
      index: ordinalOutput.vout,
      witnessUtxo: {
        script: p2tr.script,
        amount: BigInt(ordinalOutput.value),
      },
      tapInternalKey: ordinalPublicKey,
      sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
    });

    tx.addOutputAddress(recipient1, recipient1Amount, network);
    tx.addOutputAddress(recipient2, recipient2Amount, network);
    tx.addOutputAddress(recipient2, changeAmount, network);

    tx.addOutput({
      script: btc.Script.encode([
        "HASH160",
        "DUP",
        new TextEncoder().encode("SP1KSN9GZ21F4B3DZD4TQ9JZXKFTZE3WW5GXREQKX"),
      ]),
      amount: 0n,
    });

    const psbt = tx.toPSBT(0);
    const psbtB64 = base64.encode(psbt);
    return psbtB64;
  };

  // set transfer amount and calculate change

  const onBorrow = async (assetDetails) => {
    form
      .validateFields()
      .then(async () => {
        try {
          const [paymentUnspentOutputs, ordinalsUnspentOutputs] =
            await Promise.all([
              getUTXOs(BitcoinNetworkType.Mainnet, xversePaymentAddress),
              getUTXOs(BitcoinNetworkType.Mainnet, xverseOrdinalsAddress),
            ]);

          let canContinue = true;

          if (paymentUnspentOutputs.length === 0) {
            Notify("warning", "No unspent outputs found for payment address");
            canContinue = false;
          }

          if (ordinalsUnspentOutputs.length === 0) {
            Notify("warning", "No unspent outputs found for ordinals address");
            canContinue = false;
          }

          if (!canContinue) {
            return;
          }

          // create psbt sending from payment address to ordinals address
          const outputRecipient1 = xverseOrdinalsAddress;
          const outputRecipient2 = xversePaymentAddress;

          const psbtBase64 = await createPSBT(
            BitcoinNetworkType.Mainnet,
            xversePaymentPublicKey,
            xverseOrdinalsPublicKey,
            paymentUnspentOutputs,
            ordinalsUnspentOutputs,
            outputRecipient1,
            outputRecipient2,
            assetDetails
          );

          const signPsbtOptions = {
            payload: {
              network: {
                type: BitcoinNetworkType.Mainnet,
              },
              message: "Sign Transaction",
              psbtBase64,
              broadcast: false,
              inputsToSign: [
                {
                  address: xversePaymentAddress,
                  signingIndexes: [0],
                  sigHash:
                    btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
                },
                {
                  address: xverseOrdinalsAddress,
                  signingIndexes: [1],
                  sigHash:
                    btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
                },
              ],
            },
            onFinish: async (response) => {
              if (principalId && response.psbtBase64) {
                const payload = {
                  apr: parseInt(apr),
                  owner: Principal.fromText(principalId),
                  name: "collections",
                  loan_amount: parseFloat(
                    form.getFieldValue("Desired loan amount")
                  ),
                  lender_profit: parseFloat(lenderProfit.toFixed(2)),
                  repayment_amount: parseFloat(repayment.toFixed(2)),
                  loan_duration: parseInt(
                    form.getFieldValue("Desired loan duration")
                  ),
                  inscriptionid: assetDetails.inscriptionId,
                  platform_fee: 0.01,
                  bitcoin_price: btcValue,
                };
                handleCancel();
                dispatch(setLoading(true));
                const getLoan = await api_agent.putLoanRequest(payload);
                dispatch(setLoading(false));
                if (getLoan) {
                  Notify("success", "Loan Request stored successfully");
                }
              } else {
                Notify("warning", "Connect wallet!");
              }
            },
            onCancel: () =>
              Notify("error", "Sign transaction cancelled by user!"),
          };
          await signTransaction(signPsbtOptions);
        } catch (error) {
          Notify("error", error.message);
        }
      })
      .catch(() => {
        Notify("warning", "Fill the inputs!");
      });
  };

  return (
    <>
      <Row className="m-top-bottom" justify={"center"}>
        <Col
          className={`heading-one font-large text-color-two iconalignment font-large`}
        >
          <GoInfo /> BRC-20 TOKENS NOT YET SUPPORTED
        </Col>
      </Row>

      <Form form={form}>
        <Row justify={"space-between"} className="mt-30">
          <Col md={11} xl={13}>
            <Row justify={"space-between"}>
              <Col
                className="m-top-bottom modalImage"
                xs={24}
                md={24}
                lg={24}
                xl={7}
              >
                {cardDetails.mimeType === "text/html" ? (
                  <Row
                    justify={{
                      xl: "space-between",
                      lg: "center",
                      md: "center",
                      sm: "center",
                      xs: "center",
                    }}
                  >
                    <iframe
                      title="lend_image"
                      width={280}
                      height={300}
                      src={imageUrl}
                    />
                  </Row>
                ) : (
                  <Row
                    justify={{
                      xl: "space-between",
                      lg: "center",
                      md: "center",
                      sm: "center",
                      xs: "center",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`modal_borrow_image`}
                      width={280}
                      height={300}
                      className="cardrelative border-radius-30"
                    />
                  </Row>
                )}
              </Col>

              <Col
                className="m-top-bottom details-bg card"
                xs={24}
                md={24}
                lg={24}
                xl={12}
              >
                <Row justify={"space-around"} style={{ padding: "5px 0px" }}>
                  <Col>
                    <Row className="font-size-20 text-color-two ">
                      Inscription ID
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Loan Amount
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Loan Due
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Interest Rate
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Lender Profit
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Platform fee
                    </Row>
                    <Row className="font-size-20 text-color-two mt">
                      Repayment
                    </Row>
                  </Col>
                  <Col>
                    <Row className="font-size-20 text-color-one ">
                      {cardDetails.inscriptionNumber}
                    </Row>
                    <Row className="font-size-20 text-color-one mt iconalignment">
                      {" "}
                      {form.getFieldValue("Desired loan amount")}{" "}
                      <img src={Bitcoin} alt="noimage" width="20px" />
                      ~${BTCtoUSDvalue}
                    </Row>
                    <Row className="font-size-20 text-color-one mt">
                      {dateString}{" "}
                    </Row>
                    <Row className="font-size-20 text-color-one mt">
                      {form.getFieldValue("Desired APR") > 19 &&
                      form.getFieldValue("Desired APR") < 301
                        ? form.getFieldValue("Desired APR")
                        : 0}
                      % APR
                    </Row>
                    <Row className="font-size-20 text-color-one mt iconalignment">
                      {" "}
                      {interestAccured.toFixed(10)}{" "}
                      <img src={Bitcoin} alt="noimage" width="20px" />
                    </Row>
                    <Row className="font-size-20 text-color-one mt iconalignment">
                      1%
                      <img src={Bitcoin} alt="noimage" width="20px" />
                    </Row>
                    <Row className="font-size-20 text-color-one mt iconalignment">
                      {repayment.toFixed(8)}
                      <img src={Bitcoin} alt="noimage" width="20px" />
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="m-top-bottom" justify={"space-between"}>
              <Col className="lend-button text-color-one m-top-bottom pointer font-size-20 iconalignment">
                Ord.io <PiCircleHalfLight color="violet" size={25} />
              </Col>
              <Col className="lend-button text-color-one m-top-bottom pointer font-size-20 iconalignment">
                Magic Eden <PiMagicWandFill color="violet" />
              </Col>
              <Col className="lend-button text-color-one m-top-bottom pointer font-size-20 iconalignment">
                Ordinals wallet <BsFillCircleFill color="lightblue" />
              </Col>
              <Col className="lend-button text-color-one m-top-bottom pointer font-size-20 iconalignment">
                Best in slot <GiOpenTreasureChest color={"brown"} />
              </Col>
            </Row>
          </Col>

          <Col xs={24} md={11} xl={10}>
            <Row className="m-bottom " justify={"space-between"}>
              <Col className="heading-one font-large text-color-two ">
                Desired Loan Amount
              </Col>
              <Col className="heading-one font-medium text-color-two">
                Floor:0.00985 BTC
              </Col>
            </Row>

            <Form.Item
              style={{ marginBottom: "10px" }}
              name="Desired loan amount"
              rules={[
                { required: true, message: "Please enter your loan amount!" },
                {
                  pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,100})?\s*$/,
                  message: "Please enter a valid loan amount",
                },
              ]}
            >
              <Input
                className="inputStyle"
                suffix={addonAfter("BTC", Bitcoin)}
                size="large"
                onChange={(e) => handleUsdValue(e)}
              />
            </Form.Item>

            <Row justify={"space-between"}>
              <Col md={17}>
                <Row>
                  <Col
                    className="btc-percent m-right text-color-one  pointer"
                    onClick={() => handleLoanAmount(25)}
                  >
                    25%
                  </Col>
                  <Col
                    className="btc-percent m-right text-color-one pointer"
                    onClick={() => handleLoanAmount(50)}
                  >
                    50%
                  </Col>
                  <Col
                    className="btc-percent m-right text-color-one  pointer"
                    onClick={() => handleLoanAmount(75)}
                  >
                    75%
                  </Col>
                </Row>
              </Col>

              <Col className=" font-style">{BTCtoUSDvalue} USD</Col>
            </Row>
            <Row className="m-top-bottom" justify={"start"}>
              <Col className="heading-one font-large text-color-two ">
                Desired Loan Duration
              </Col>
            </Row>

            <Form.Item
              style={{ marginBottom: "10px" }}
              name="Desired loan duration"
              rules={[
                { required: true, message: "Please enter your loan duration!" },
                {
                  pattern: /^([4-9]|[0-9][0-9]|[0-9][0-9][0-9])$/,
                  message: "Please enter a loan duration range 4 to 30",
                },
              ]}
            >
              <Input
                className="inputStyle"
                suffix={addonAfter("Days", LuCalendarDays)}
                placeholder={0}
                size="large"
                onChange={(e) => handleBlockValue(e)}
              />
            </Form.Item>

            <Row justify={"space-between"}>
              <Col md={18}>
                <Row>
                  <Col
                    style={{ paddingInline: "15px" }}
                    className="btc-percent m-right text-color-one pointer"
                    onClick={() => handleLoanDuration(7)}
                  >
                    7
                  </Col>
                  <Col
                    style={{ paddingInline: "12px" }}
                    className="btc-percent m-right text-color-one pointer"
                    onClick={() => handleLoanDuration(14)}
                  >
                    14
                  </Col>
                </Row>
              </Col>

              <Col className="gradient-text-one font-style">
                {blockValue} Blocks
              </Col>
            </Row>
            <Row className="m-top-bottom" justify={"start"} gutter={32}>
              <Col className="heading-one font-large text-color-two">
                Desired APR
              </Col>
            </Row>

            <Form.Item
              style={{ marginBottom: "10px" }}
              name="Desired APR"
              rules={[
                { required: true, message: "Please enter your desired APR!" },
                {
                  pattern:
                    /^([2-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])$/,
                  message: "Please enter a Apr percentage range 20 to 300",
                },
              ]}
            >
              <Input
                className="inputStyle"
                size="large"
                suffix={addonAfter("APR", CiPercent)}
                placeholder={0}
                onChange={(e) => handleAprValue(e)}
              />
            </Form.Item>

            <Row>
              <Col
                className="btc-percent m-right text-color-one pointer"
                onClick={() => handleApr(30)}
              >
                30%
              </Col>
              <Col
                className="btc-percent m-right text-color-one pointer"
                onClick={() => handleApr(60)}
              >
                60%
              </Col>
              <Col
                className="btc-percent m-right text-color-one pointer"
                onClick={() => handleApr(90)}
              >
                90%
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <Row>
        <Col xs={24} className="align-end ">
          <Checkbox className="text-color-two font-size-20">
            Accept ToS and User Agreement
          </Checkbox>
        </Col>
      </Row>

      <Form.Item>
        <Flex className="m-top-bottom" gap={20} justify={"end"}>
          <CustomButton
            title="Cancel"
            onClick={handleCancel}
            className="cancelButton btn-common-two"
          />

          <CustomButton
            className="continueButton btn-common-two"
            title={"Continue"}
            htmlType={"submit"}
            onClick={() => onBorrow(cardDetails)}
          />
        </Flex>
      </Form.Item>
    </>
  );
};

export default propsContainer(BorrowAsset);
