export const AffiliatesIdlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Hash = IDL.Nat32;
  const Airdrops = IDL.Record({
    ordinalAddress: IDL.Text,
    referral: Hash,
    timestamp: Time,
    icpWallet: IDL.Principal,
  });

  return IDL.Service({
    claimPoints: IDL.Func([], [IDL.Nat], []),
    getAirDrops: IDL.Func([IDL.Principal], [Airdrops], ["query"]),
    getUnclaimPoints: IDL.Func([IDL.Principal], [IDL.Nat], ["query"]),
    getUserPoints: IDL.Func([IDL.Principal], [IDL.Nat], ["query"]),
    setAirdrops: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    getReferral: IDL.Func([IDL.Principal], [Hash], ["query"]),
  });
};
