const ordinalIdlFactory = ({ IDL }) => {

    return IDL.Service({
        get_collections: IDL.Func([], [IDL.Text], []),
        addCollectionStat: IDL.Func([IDL.Text], [IDL.Bool], []),
        getApprovedCollections: IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
            ['query'],
        ),
        set_collections: IDL.Func([IDL.Text], [IDL.Bool], []),

        // Transactions
        addckBTCBalance: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
        addckBTCTransactions: IDL.Func(
            [IDL.Principal, IDL.Text],
            [IDL.Bool],
            [],
        ),
        addckEthBalance: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
        addckEthTransactions: IDL.Func(
            [IDL.Principal, IDL.Text],
            [IDL.Bool],
            [],
        ),
        setCkBTC_oldest_tx_id: IDL.Func([IDL.Nat], [IDL.Nat], []),
        setCkEth_oldest_tx_id: IDL.Func([IDL.Nat], [IDL.Nat], []),
        getCkBTC_oldest_tx_id: IDL.Func([], [IDL.Nat], ['query']),
        getCkEth_oldest_tx_id: IDL.Func([], [IDL.Nat], ['query']),
    });

};

module.exports = { ordinalIdlFactory }