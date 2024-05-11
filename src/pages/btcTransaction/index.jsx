import { Col, Flex, Row, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { FaExternalLinkSquareAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import TableComponent from "../../component/table";
import { DateTimeConverter, sliceAddress } from "../../utils/common";

const BtcTransaction = () => {
  const { Title, Text } = Typography;
  const [copy, setCopy] = useState("copy");
  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;
  const MEMPOOL_API = process.env.REACT_APP_MEMPOOL_API;
  const waheedAddress = process.env.REACT_APP_WAHEED_ADDRESS;
  const transaction = process.env.REACT_APP_TRANSACTION;
  const assetId = process.env.REACT_APP_ASSET_ID;
  const tableData = [
    {
      transaction: transaction,
      fee_rate: 21,
      timestamp: 1709363563061,
      bitcoinAddress: waheedAddress,
      asset_id: assetId,
    },
  ];

  const tableColumns = [
    {
      key: "Serial No",
      title: " ",
      align: "center",
      dataIndex: "Serial No",
      render: (_, obj, index) => {
        return <Text className="text-color-one font-small">{index + 1}</Text>;
      },
    },
    {
      key: "asset",
      title: (
        <Row justify={"center"} className="font-medium">
          Asset
        </Row>
      ),
      align: "center",
      render: (_, obj) => {
        return (
          <img
            src={`${CONTENT_API}/content/${obj.asset_id}`}
            alt={`${obj.asset_id}-borrow_image`}
            className="border-radius-30"
            width={70}
            height={70}
          />
        );
      },
    },
    {
      key: "to",
      title: (
        <Row justify={"center"} className="font-medium">
          To
        </Row>
      ),
      align: "center",
      dataIndex: "bitcoinAddress",
      render: (_, obj) => {
        return (
          <Row justify={"center"} className="font-medium">
            <Tooltip title={copy} color="purple">
              <span
                className="pointer"
                onClick={() => {
                  navigator.clipboard.writeText(obj.bitcoinAddress);
                  setCopy("copied");
                  setTimeout(() => {
                    setCopy("copy");
                  }, 2000);
                }}
              >
                {sliceAddress(obj.bitcoinAddress, 4)}
              </span>
            </Tooltip>
          </Row>
        );
      },
    },
    {
      key: "fee_rate",
      title: (
        <Row justify={"center"} className="font-medium">
          Fee Rate
        </Row>
      ),
      align: "center",
      dataIndex: "fee_rate",
      render: (_, obj) => {
        return `${obj.fee_rate} sats/Vbyte`;
      },
    },
    {
      key: "timeStamp",
      title: (
        <Row justify={"center"} className="font-medium">
          Date/Time
        </Row>
      ),
      align: "center",
      dataIndex: "timestamp",
      render: (_, obj) => {
        const timeStamp = DateTimeConverter(obj.timestamp);
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "Action",
      title: (
        <Row justify={"center"} className="font-medium">
          Action
        </Row>
      ),
      align: "center",
      // dataIndex: "action",
      render: (obj, index) => {
        return (
          <Row justify={"center"}>
            <Link
              target="_blank"
              to={`${MEMPOOL_API}/tx/${obj.transaction}`}
              className="font-medium text-decor-line text-color-three iconalignment"
            >
              View Tx <FaExternalLinkSquareAlt />
            </Link>
          </Row>
        );
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

      <Row className="mt-30">
        <Col xs={24}>
          <TableComponent
            pagination={false}
            tableColumns={tableColumns}
            tableData={tableData}
          />
        </Col>
      </Row>
    </>
  );
};
export default BtcTransaction;
