module my_ordinalsloan::loan_ledger {
    use std::signer;
    use std::vector;
    use std::string;
    use std::option;
    use aptos_std::table_with_length;
    use aptos_std::smart_vector;
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin;
    use aptos_framework::coin;

    #[test_only]
    use aptos_framework::account;

    const ENO_VENUE: u64 = 0;
    const EINVALID_BORROW_REQUEST: u64 = 9;
    const APP_OBJECT_SEED: vector<u8> = b"MYORDINALS";

    struct Borrowers has key {
        addresses: smart_vector::SmartVector<address>
    }

    struct BorrowRequestIdCount has key {
        counter: u64,
    }
    struct LoanIdCounter has key {
        counter: u64,
    }
    struct Loan has store, drop, copy {
        loan_id: u64,
        borrow_id: u64,
        lender: address,
        loanstart_time: u64,
        loanend_time: u64,
        status: u64,
    }
    struct Lenders has key {
        addresses: smart_vector::SmartVector<address>
    }
    struct LoanLedger has key {
        loans: smart_vector::SmartVector<Loan>
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
        borrow_id : u64,
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
        current_loans: table_with_length::TableWithLength<address, Loan>,
        loan_keys: vector<address>,  
    }

    fun get_marketplace_signer_addr(): address {
        object::create_object_address(&@my_ordinalsloan, APP_OBJECT_SEED)
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
        let counter = BorrowRequestIdCount { counter: 0 };
        let loanCounter = LoanIdCounter { counter: 0 };

        move_to(marketplace_signer, loanCounter);
        move_to(marketplace_signer, counter);
        move_to(marketplace_signer, MarketplaceSigner {
            extend_ref,
        });
    }

    public fun get_next_borrow_id(): u64 acquires BorrowRequestIdCount {
        let counter_resource = borrow_global_mut<BorrowRequestIdCount>(get_marketplace_signer_addr());
        let current_id = counter_resource.counter;
        counter_resource.counter = current_id + 1;
        current_id
    }
    
    public fun get_next_loan_id(): u64 acquires LoanIdCounter {
        let counter_resource = borrow_global_mut<LoanIdCounter>(get_marketplace_signer_addr());
        let current_id = counter_resource.counter;
        counter_resource.counter = current_id + 1;
        current_id
    }
    public entry fun init_ordinal(venue_owner: &signer) {
        let borrow_requests = table_with_length::new<address, BorrowRequest>();
        let borrow_request_keys = vector::empty<address>(); // Initialize the vector
        let borrower_addresses = vector::empty<address>(); // Initialize the vector
        let loan_keys = vector::empty<address>();
        let current_loans = table_with_length::new<address, Loan>();

        move_to<AptosOrdinal>(venue_owner, AptosOrdinal {borrow_requests, current_loans,loan_keys, borrow_request_keys, borrower_addresses});
    }


    public entry fun create_loan_request(
        lender: &signer,
        borrower: address,
        borrow_id: u64,
        loan_amount : u64,
        ordinal_token : address,
        tenure : u64
    ) acquires AptosOrdinal, LoanLedger, MarketplaceSigner, LoanIdCounter, Lenders    {

        let status = 0;

        if( ! (check_ownership(borrower,ordinal_token) && borrow_request_exists(borrower,ordinal_token)))
        {
            coin::transfer<aptos_coin::AptosCoin>(lender, borrower, 10);           
        }
        else
        {

            let lender_addr = signer::address_of(lender);
            let aptos_ordinal = borrow_global_mut<AptosOrdinal>(lender_addr);
            
            // Generate the next unique loan ID
            let loan_id = get_next_loan_id();
            

            let loan = Loan {
                loan_id,
                borrow_id,
                lender: lender_addr,
                loanstart_time: timestamp::now_seconds(),
                loanend_time: timestamp::now_seconds() + tenure * 86400, // Assuming tenure is in days
                status,
            };
            table_with_length::add(&mut aptos_ordinal.current_loans, ordinal_token, loan);
            vector::push_back(&mut aptos_ordinal.loan_keys, ordinal_token); // Add loan id to the vector

            if (exists<LoanLedger>(get_marketplace_signer_addr())) {
                let loan_ledger = borrow_global_mut<LoanLedger>(get_marketplace_signer_addr());
                if (!smart_vector::contains(&loan_ledger.loans, &loan)) {
                    smart_vector::push_back(&mut loan_ledger.loans, loan);
                }
            } else {
                let loan_ledger = LoanLedger {
                    loans: smart_vector::new(),
                };
                smart_vector::push_back(&mut loan_ledger.loans, loan);
                move_to(&get_marketplace_signer(get_marketplace_signer_addr()), loan_ledger);
            };

            if (exists<Lenders>(get_marketplace_signer_addr())) {
                let lenders = borrow_global_mut<Lenders>(get_marketplace_signer_addr());
                if (!smart_vector::contains(&lenders.addresses, &signer::address_of(lender))) {
                    smart_vector::push_back(&mut lenders.addresses, signer::address_of(lender));
                }
            } else {
                let lenders = Lenders {
                    addresses: smart_vector::new(),
                };
                smart_vector::push_back(&mut lenders.addresses, signer::address_of(lender));
                move_to(&get_marketplace_signer(get_marketplace_signer_addr()), lenders);
            };
            // Transfer loan amount from lender to borrower
            coin::transfer<aptos_coin::AptosCoin>(lender, borrower, loan_amount);           

        }

    }


    public entry fun create_borrow_request(
        borrower: &signer,
        ordinal_token: address,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        platform_fee: u64,
    ) acquires AptosOrdinal, Borrowers, BorrowRequests, BorrowRequestIdCount,MarketplaceSigner {


        let borrower_addr = signer::address_of(borrower);
        let aptos_ordinal = borrow_global_mut<AptosOrdinal>(borrower_addr);
        let status = 0;
        assert!(!table_with_length::contains(&aptos_ordinal.borrow_requests, ordinal_token), EINVALID_BORROW_REQUEST);

        if(check_ownership(borrower_addr,ordinal_token))
        {
            let borrow_id = get_next_borrow_id();
            let borrow_request = BorrowRequest {
                borrow_id,
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
    public fun get_all_loans(): vector<Loan> acquires LoanLedger {
        if (exists<LoanLedger>(get_marketplace_signer_addr())) {
            smart_vector::to_vector(&borrow_global<LoanLedger>(get_marketplace_signer_addr()).loans)
        } else {
            vector[]
        }
    }

    #[view]
    public fun get_all_lenders(): vector<address> acquires Lenders {
        if (exists<Lenders>(get_marketplace_signer_addr())) {
            smart_vector::to_vector(&borrow_global<Lenders>(get_marketplace_signer_addr()).addresses)
        } else {
            vector[]
        }
    }

    #[view]
    public fun check_ownership(owner_addr: address, token_addr: address): bool {
        my_ordinalsloan::ordinal_nft::token_belongs_to_owner(owner_addr, token_addr)
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
    public fun borrow_request_exists(borrower_addr: address, ordinal_token: address): bool acquires AptosOrdinal {
        if (exists<AptosOrdinal>(borrower_addr)) {
            let aptos_ordinal = borrow_global<AptosOrdinal>(borrower_addr);
            table_with_length::contains(&aptos_ordinal.borrow_requests, ordinal_token)
        } else {
            false
        }
    }
    #[view]
    public fun get_borrow_request(borrower_addr : address , ordinal_token: address): option::Option<BorrowRequest> acquires AptosOrdinal {
        if (exists<AptosOrdinal>(borrower_addr)) {
            let aptos_ordinal = borrow_global<AptosOrdinal>(borrower_addr);
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
