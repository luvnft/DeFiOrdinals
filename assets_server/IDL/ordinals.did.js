const ordinalIdlFactory = ({ IDL }) => {

    return IDL.Service({
        // For storing all fetched assets in canister
        addWalletAssets: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        // To get newly added wallet address
        getBitcoinWallets: IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
            ['query'],
        ),
        removeBitcoinWallet: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    });
};
const ordinalInit = ({ IDL }) => { return []; };

module.exports = { ordinalIdlFactory, ordinalInit }