module my_ordinals_loan::BorrowRequestContract {
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

    struct BorrowRequest has store, drop, copy {
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        borrower: address,
        platform_fee: u64,
        collection_name: string::String,
        inscription_number: u64,
        collection_id: u64,
        inscription_id: string::String,
        timestamp: u64,
        status: u64,
    }

    struct BorrowRequests has key {
        borrow_requests: smart_vector::SmartVector<BorrowRequest>
    } 
    
    struct AptosOrdinal has key {
        borrow_requests: table_with_length::TableWithLength<OrdinalIdentifier, BorrowRequest>,
        borrow_request_keys: vector<OrdinalIdentifier>, // Vector to track borrow request keys
        borrower_addresses: vector<address>, // Vector to track borrower addresses
        max_ordinals: u64,
    }

    fun get_marketplace_signer_addr(): address {
        object::create_object_address(&@my_ordinals_loan, APP_OBJECT_SEED)
    }

    fun get_marketplace_signer(marketplace_signer_addr: address): signer acquires MarketplaceSigner {
        object::generate_signer_for_extending(&borrow_global<MarketplaceSigner>(marketplace_signer_addr).extend_ref)
    }

    public entry fun create_borrow_request(
        borrower: &signer,
        collection_name: string::String,
        inscription_number: u64,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        platform_fee: u64,
        collection_id: u64,
        inscription_id: string::String,
    ) acquires AptosOrdinal, Borrowers, BorrowRequests, MarketplaceSigner {
        let borrower_addr = signer::address_of(borrower);
        let identifier = OrdinalIdentifier { collection_name, inscription_number };
        let aptos_ordinal = borrow_global_mut<AptosOrdinal>(borrower_addr);
        let status = 0;
        assert!(!table_with_length::contains(&aptos_ordinal.borrow_requests, identifier), EINVALID_BORROW_REQUEST);
        let borrow_request = BorrowRequest {
            loan_amount,
            repayment_amount,
            tenure,
            borrower: borrower_addr,
            platform_fee,
            collection_name,
            inscription_number,
            collection_id,
            inscription_id,
            timestamp: timestamp::now_seconds(),
            status,
        };
        table_with_length::add(&mut aptos_ordinal.borrow_requests, identifier, borrow_request);
        vector::push_back(&mut aptos_ordinal.borrow_request_keys, identifier); // Add key to the vector

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
    public fun get_borrow_request(contract_addr : address , collection_name: string::String, inscription_number: u64): option::Option<BorrowRequest> acquires AptosOrdinal {
        if (exists<AptosOrdinal>(contract_addr)) {
            let aptos_ordinal = borrow_global<AptosOrdinal>(contract_addr);
            let identifier = OrdinalIdentifier { collection_name, inscription_number };
            if (table_with_length::contains(&aptos_ordinal.borrow_requests, identifier)) {
                let borrow_request = table_with_length::borrow(&aptos_ordinal.borrow_requests, identifier);
                option::some(*borrow_request)
            } else {
                option::none<BorrowRequest>()
            }
        } else {
            option::none<BorrowRequest>()
        }
    }

    #[view]
    public fun get_max_ordinals(addr: address): option::Option<u64> acquires AptosOrdinal {
        if (exists<AptosOrdinal>(addr)) {
            let aptos_ordinal = borrow_global<AptosOrdinal>(addr);
            option::some(aptos_ordinal.max_ordinals)
        } else {
            option::none<u64>()
        }
    }
}
