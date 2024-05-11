import {
  Col,
  ConfigProvider,
  Flex,
  Row,
  Segmented,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { FaRegSmileWink } from "react-icons/fa";
import { FiArrowDownLeft } from "react-icons/fi";
import { ImSad } from "react-icons/im";
import { MdArrowOutward } from "react-icons/md";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import Etherium from "../../assets/coin_logo/cketh.png";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { sliceAddress } from "../../utils/common";

const Transactions = (props) => {
  /* global BigInt */

  const { api_agent } = props.wallet;
  const { reduxState } = props.redux;
  const { Title, Text } = Typography;
  const walletState = reduxState.wallet;
  let plugAddress = walletState.plug.principalId;
  const [ckBtcTransactions, setCkBtcTransactions] = useState([]);
  const [ckEthTransactions, setCkEthTransactions] = useState([]);
  const [btcTransactions, setBtcTransactions] = useState("ckBTC");

  const fetchBtcTransactions = async () => {
    try {
      const btcTransactions = await api_agent.getckBTCTransactions(plugAddress);
      if (btcTransactions.length) {
        const trans_ = btcTransactions[0].map((trans) => {
          const data = JSON.parse(trans);
          return {
            ...data,
            isWithdraw:
              data.from.owner.__principal__ ===
              process.env.REACT_APP_ORDINAL_CANISTER_ID,
          };
        });
        setCkBtcTransactions(trans_);
      }
    } catch (error) {
      console.log("Fetch BTC transaction error", error);
    }
  };

  const fetchEthTransactions = async () => {
    try {
      const ethTransactions = await api_agent.getckEthTransactions(plugAddress);
      if (ethTransactions.length) {
        const trans_ = ethTransactions[0].map((trans) => {
          const data = JSON.parse(trans);
          return {
            ...data,
            isWithdraw:
              data.from.owner.__principal__ ===
              process.env.REACT_APP_ORDINAL_CANISTER_ID,
          };
        });
        setCkEthTransactions(trans_);
      }
    } catch (error) {
      console.log("Fetch ETH transaction error", error);
    }
  };

  useEffect(() => {
    if (api_agent && plugAddress) {
      fetchBtcTransactions();
      fetchEthTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, plugAddress]);

  const SupplyTableColumns = [
    {
      key: "Serial No",
      title: "S.No",
      align: "center",
      dataIndex: "Serial No",
      render: (_, obj, index) => {
        return <Text className="text-color-one font-small">{index + 1}</Text>;
      },
    },
    {
      key: "isWithdraw",
      title: " ",
      align: "center",
      dataIndex: "isWithdraw",
      render: (_, obj) => {
        return (
          <Text className="text-color-one font-small letter-spacing-small ">
            {obj.isWithdraw ? (
              <MdArrowOutward size={30} color="red" />
            ) : (
              <FiArrowDownLeft size={30} color="green" />
            )}
          </Text>
        );
      },
    },
    {
      key: "From",
      title: "From",
      align: "center",
      dataIndex: "from",
      render: (_, obj) => {
        return (
          <Text className="text-color-one font-small letter-spacing-small">
            <Tooltip title={obj.from.owner.__principal__}>
              {" "}
              {sliceAddress(obj.from.owner.__principal__)}
            </Tooltip>
          </Text>
        );
      },
    },
    {
      key: "To",
      title: "To",
      align: "center",
      dataIndex: "to",
      render: (_, obj) => (
        <Text className="text-color-one font-small letter-spacing-small">
          <Tooltip title={obj.to.owner.__principal__}>
            {" "}
            {sliceAddress(obj.to.owner.__principal__)}
          </Tooltip>
        </Text>
      ),
    },
    {
      key: "Amount",
      title: "Amount",
      align: "center",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, obj) => {
        return <Text className="text-color-one font-small">{obj.amount}</Text>;
      },
    },
    {
      key: "Type",
      title: "Type",
      align: "center",
      dataIndex: "kind",
      render: (_, obj) => {
        return <Text className="text-color-one font-small">{obj.kind}</Text>;
      },
    },
    {
      key: "Withdraw",
      title: "Action",
      align: "center",
      dataIndex: "isWithdraw",
      filters: [
        {
          text: <Text className="text-color-one">Withdraw</Text>,
          value: "true",
        },
        {
          text: <Text className="text-color-one">Deposit</Text>,
          value: "false",
        },
      ],
      onFilter: (value, obj) => obj.isWithdraw.toString().includes(value),
      render: (_, obj) => {
        return (
          <Text className="text-color-one font-small letter-spacing-small ">
            {obj.isWithdraw ? (
              <Tag className="font-small" color="red">
                Withdraw
              </Tag>
            ) : (
              <Tag className="text-color-one font-small" color="green-inverse">
                <Text className="text-color-one font-small">Deposit</Text>
              </Tag>
            )}
          </Text>
        );
      },
    },
    {
      key: "Time stamp",
      title: "Date / Time",
      align: "center",
      dataIndex: "timestamp",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.timestamp - b.timestamp,
      render: (_, obj) => {
        const nanosecondsTimestamp = BigInt(obj.timestamp);
        const millisecondsTimestamp = Number(
          nanosecondsTimestamp / BigInt(1000000)
        );
        const date = new Date(millisecondsTimestamp);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
        return strTime;
      },
    },
  ];

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <Title level={2} className="gradient-text-one">
            Transactions
          </Title>
        </Col>
      </Row>

      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedBg: "#2f3242",
            },
          },
        }}
      >
        <Segmented
          className="mt"
          options={[
            {
              label: (
                <Flex gap={5} align="center">
                  <img src={Bitcoin} alt="Bitcoin" width={"25px"} />
                  <span className="font-small">ckBTC</span>
                </Flex>
              ),
              value: "ckBTC",
            },
            {
              label: (
                <Flex gap={5} align="center">
                  <img src={Etherium} alt="Etherium" width={"25px"} />
                  <span className="font-small">ckETH</span>
                </Flex>
              ),
              value: "ckETH",
            },
          ]}
          onChange={(e) => setBtcTransactions(e)}
        />
      </ConfigProvider>

      <Row className="mt-30" style={{ paddingBottom: "100px" }}>
        <Col xs={24}>
          <TableComponent
            locale={{
              emptyText: (
                <Flex align="center" justify="center" gap={5}>
                  {(btcTransactions === "ckBTC"
                    ? ckBtcTransactions
                    : ckEthTransactions) === null ? (
                    <>
                      <FaRegSmileWink size={25} />
                      <span className="font-medium">
                        Connect plug wallet Wallet!
                      </span>
                    </>
                  ) : (
                    <>
                      <ImSad size={25} />
                      <span className="font-medium">
                        Seems you have no supplies!
                      </span>
                    </>
                  )}
                </Flex>
              ),
            }}
            pagination={{
              pageSize: 10,
            }}
            rowKey={(e) => `${e?.asset}-${e?.debt}`}
            tableColumns={SupplyTableColumns}
            tableData={
              btcTransactions === "ckBTC"
                ? ckBtcTransactions
                : ckEthTransactions
            }
          />
        </Col>
      </Row>
    </>
  );
};
export default propsContainer(Transactions);
