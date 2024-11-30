import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

export function getAptosClient(network) {
  const config = new AptosConfig({ network });
  return new Aptos(config);
}


