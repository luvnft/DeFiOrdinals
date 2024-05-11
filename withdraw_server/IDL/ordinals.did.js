const ordinalsIDL = ({ IDL }) => {
    const WithdrawRequest = IDL.Record({
        'transaction_id': IDL.Text,
        'fee_rate': IDL.Nat,
        'timestamp': IDL.Nat64,
        'bitcoinAddress': IDL.Text,
        'priority': IDL.Text,
        'asset_id': IDL.Text,
        'calculated_fee': IDL.Nat,
    });
    const TransactionDetail = IDL.Record({
        'transaction': IDL.Text,
        'fee_rate': IDL.Nat,
        'timestamp': IDL.Nat64,
        'bitcoinAddress': IDL.Text,
        'asset_id': IDL.Text,
    });

    return IDL.Service({
        'getWithDrawAssetsRequest': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, WithdrawRequest))],
            ['query'],
        ),
        'removeWithDrawAssetsRequest': IDL.Func(
            [TransactionDetail],
            [IDL.Bool],
            [],
        ),
    });
};

module.exports = { ordinalsIDL }