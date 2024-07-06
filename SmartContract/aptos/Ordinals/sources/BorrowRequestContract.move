module my_ordinals_loan::borrow_request_contract {
    use std::signer;
    use std::vector;
    use std::string;
    use std::option;
    use aptos_std::table_with_length;
    use aptos_std::smart_vector;
    use aptos_framework::object;
    use aptos_framework::timestamp;

    #[test_only]
    use aptos_framework::account;

    const ENO_VENUE: u64 = 0;
    const EINVALID_BORROW_REQUEST: u64 = 9;
    const APP_OBJECT_SEED: vector<u8> = b"MYORDINALS";

    struct Borrowers has key {
        addresses: smart_vector::SmartVector<address>
    }

    struct MarketplaceSigner has key {
        extend_ref: object::ExtendRef,
    }


    struct OrdinalIdentifier has store, drop, copy {
        collection_name: string::String,
        inscription_number: u64,
    }
    struct Ordinal has store, drop, copy {
        identifier: OrdinalIdentifier,
        inscription: string::String,
        content_url: string::String,
    }
    struct BorrowRequest has store, drop, copy {
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        borrower: address,
        platform_fee: u64,
        timestamp: u64,
        ordinal_token: address,
        status: u64,
    }

    struct BorrowRequests has key {
        borrow_requests: smart_vector::SmartVector<BorrowRequest>
    } 
    
    struct AptosOrdinal has key {
        borrow_requests: table_with_length::TableWithLength<address, BorrowRequest>,
        borrow_request_keys: vector<address>, // Vector to track borrow request keys
        borrower_addresses: vector<address>, // Vector to track borrower addresses
    }

    fun get_marketplace_signer_addr(): address {
        object::create_object_address(&@my_ordinals_loan, APP_OBJECT_SEED)
    }

    fun get_marketplace_signer(marketplace_signer_addr: address): signer acquires MarketplaceSigner {
        object::generate_signer_for_extending(&borrow_global<MarketplaceSigner>(marketplace_signer_addr).extend_ref)
    }

    fun init_module(deployer: &signer) {
        let constructor_ref = object::create_named_object(
            deployer,
            APP_OBJECT_SEED,
        );
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let marketplace_signer = &object::generate_signer(&constructor_ref);

        move_to(marketplace_signer, MarketplaceSigner {
            extend_ref,
        });
    }

    public entry fun init_ordinal(venue_owner: &signer) {
        let borrow_requests = table_with_length::new<address, BorrowRequest>();
        let borrow_request_keys = vector::empty<address>(); // Initialize the vector
        let borrower_addresses = vector::empty<address>(); // Initialize the vector
        move_to<AptosOrdinal>(venue_owner, AptosOrdinal {borrow_requests, borrow_request_keys, borrower_addresses});
    }


    public entry fun create_borrow_request(
        borrower: &signer,
        ordinal_token: address,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        platform_fee: u64,
    ) acquires AptosOrdinal, Borrowers, BorrowRequests, MarketplaceSigner {


        let borrower_addr = signer::address_of(borrower);
        let aptos_ordinal = borrow_global_mut<AptosOrdinal>(borrower_addr);
        let status = 0;
        assert!(!table_with_length::contains(&aptos_ordinal.borrow_requests, ordinal_token), EINVALID_BORROW_REQUEST);

        if(check_ownership(borrower_addr,ordinal_token))
        {
            let borrow_request = BorrowRequest {
                loan_amount,
                repayment_amount,
                tenure,
                borrower: borrower_addr,
                platform_fee,
                timestamp: timestamp::now_seconds(),
                ordinal_token,
                status,
            };
            table_with_length::add(&mut aptos_ordinal.borrow_requests, ordinal_token, borrow_request);
            vector::push_back(&mut aptos_ordinal.borrow_request_keys, ordinal_token); // Add key to the vector


            if (exists<Borrowers>(get_marketplace_signer_addr())) {
                let borrowers = borrow_global_mut<Borrowers>(get_marketplace_signer_addr());
                if (!smart_vector::contains(&borrowers.addresses, &signer::address_of(borrower))) {
                    smart_vector::push_back(&mut borrowers.addresses, signer::address_of(borrower));
                }
            } else {
                let borrowers = Borrowers {
                    addresses: smart_vector::new(),
                };
                smart_vector::push_back(&mut borrowers.addresses, signer::address_of(borrower));
                move_to(&get_marketplace_signer(get_marketplace_signer_addr()), borrowers);
            };

            if (exists<BorrowRequests>(get_marketplace_signer_addr())) {
                let borrowRequests = borrow_global_mut<BorrowRequests>(get_marketplace_signer_addr());
                if (!smart_vector::contains(&borrowRequests.borrow_requests, &borrow_request)) {
                    smart_vector::push_back(&mut borrowRequests.borrow_requests, borrow_request);
                }
            } else {
                let borrowRequests = BorrowRequests {
                    borrow_requests: smart_vector::new(),
                };
                smart_vector::push_back(&mut borrowRequests.borrow_requests, borrow_request);
                move_to(&get_marketplace_signer(get_marketplace_signer_addr()), borrowRequests);
            }; 
        };
    }

    #[view]
    public fun check_ownership(owner_addr: address, token_addr: address): bool {
        my_ordinals_loan::ordinal_nft::token_belongs_to_owner(owner_addr, token_addr)
    }
    
    #[view]
    public fun get_all_borrow_requests(): vector<BorrowRequest> acquires BorrowRequests {
        if (exists<BorrowRequests>(get_marketplace_signer_addr())) {
            smart_vector::to_vector(&borrow_global<BorrowRequests>(get_marketplace_signer_addr()).borrow_requests)
        } else {
            vector[]
        }
    }

    #[view]
    public fun get_all_borrowers(): vector<address> acquires Borrowers {
        if (exists<Borrowers>(get_marketplace_signer_addr())) {
            smart_vector::to_vector(&borrow_global<Borrowers>(get_marketplace_signer_addr()).addresses)
        } else {
            vector[]
        }
    }

    #[view]
    public fun get_borrow_request(contract_addr : address , ordinal_token: address): option::Option<BorrowRequest> acquires AptosOrdinal {
        if (exists<AptosOrdinal>(contract_addr)) {
            let aptos_ordinal = borrow_global<AptosOrdinal>(contract_addr);
            if (table_with_length::contains(&aptos_ordinal.borrow_requests, ordinal_token)) {
                let borrow_request = table_with_length::borrow(&aptos_ordinal.borrow_requests, ordinal_token);
                option::some(*borrow_request)
            } else {
                option::none<BorrowRequest>()
            }
        } else {
            option::none<BorrowRequest>()
        }
    }


}
