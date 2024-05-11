const ordinalIdlFactory = ({ IDL }) => {
    const Time = IDL.Int;

    return IDL.Service({
        // For storing individual fetched asset in canister
        addUserSupply: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        // To get lastly added timestamp
        getLatest_SupplyTime: IDL.Func([], [Time], ['query']),
        // Store lastly added asset's timestamp
        setLatest_SupplyTime: IDL.Func([Time], [Time], []),
    });
};

module.exports = { ordinalIdlFactory }