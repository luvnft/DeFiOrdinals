import { Row, Typography } from "antd";
import { LiaConnectdevelop } from "react-icons/lia";

const WalletConnectDisplay = ({ isPlugError }) => {
  const { Text } = Typography;
  return (
    <>
      <Row justify={"center"} className="mt-70">
        <LiaConnectdevelop color="violet" className="egg" size={150} />
      </Row>
      <Row justify={"center"}>
        <Text className="text-color-one font-large font-weight-600">
          Please {isPlugError ? "reconnect" : "connect"} your wallet
        </Text>
      </Row>
      <Row justify={"center"}>
        <Text className="text-color-two font-small mt">
          Please {isPlugError ? "reconnect" : "connect"} your wallet to see your
          supplies, borrowings, and open positions.
        </Text>
      </Row>
    </>
  );
};

export default WalletConnectDisplay;
