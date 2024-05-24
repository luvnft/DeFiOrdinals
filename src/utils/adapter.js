import { NightlyConnectAptosAdapter } from '@nightlylabs/wallet-selector-aptos'

let _adapter;
export const getAdapter = async (persisted = true) => {
  if (_adapter) return _adapter
  _adapter = await NightlyConnectAptosAdapter.build({
    appMetadata: {
      name: 'NCTestAptos',
      description: 'Nightly Connect Test',
      icon: 'https://docs.nightly.app/img/logo.png',
    },
  })
  return _adapter;
}
