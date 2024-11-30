module my_ordinals_loan10::lend_request {
    use std::signer;
    use std::vector;
    use aptos_std::table_with_length;
    use aptos_std::smart_vector;
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use my_ordinals_loan20::borrow_request_contract;
    const APP_OBJECT_SEED: vector<u8> = b"MYORDINALS";

    struct LoanIdCounter has key {
        counter: u64,
    }
    
    struct Loan has store, drop, copy {
        loan_id: u64,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        borrower: address,
        lender: address,
        platform_fee: u64,
        loanstart_time: u64,
        loanend_time: u64,
        ordinal_token: address,
        status: u64,
    }

    struct LoanLedger has key {
        loans: smart_vector::SmartVector<Loan>
    }

    struct Lenders has key {
        addresses: smart_vector::SmartVector<address>
    }

    struct MarketplaceSigner has key {
        extend_ref: object::ExtendRef,
    }

    struct AptosOrdinal has key {
        current_loans: table_with_length::TableWithLength<address, Loan>,
        loan_keys: vector<address>,  
    }

    fun get_marketplace_signer_addr(): address {
        object::create_object_address(&@my_ordinals_loan10, APP_OBJECT_SEED)
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
        let counter = LoanIdCounter { counter: 0 };

        move_to(marketplace_signer, counter);

        move_to(marketplace_signer, MarketplaceSigner {
            extend_ref,
        });
    }

    public entry fun init_ordinal(venue_owner: &signer) {
        let current_loans = table_with_length::new<address, Loan>();

        let loan_keys = vector::empty<address>();
        move_to<AptosOrdinal>(venue_owner, AptosOrdinal {loan_keys, current_loans});
    }

    public fun get_next_loan_id(): u64 acquires LoanIdCounter {
        let counter_resource = borrow_global_mut<LoanIdCounter>(get_marketplace_signer_addr());
        let current_id = counter_resource.counter;
        counter_resource.counter = current_id + 1;
        current_id
    }

    public entry fun create_loan_request(
        borrower: address,
        ordinal_token: address,
        lender: &signer,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        platform_fee: u64,
    )    acquires AptosOrdinal, LoanLedger, MarketplaceSigner, LoanIdCounter, Lenders    {
        let lender_addr = signer::address_of(lender);
        let aptos_ordinal = borrow_global_mut<AptosOrdinal>(lender_addr);
        let status = 0;
        
        if(check_ownership(borrower,ordinal_token))
        {
            // Generate the next unique loan ID
            let loan_id = get_next_loan_id();
            
            let loan = Loan {
                loan_id,
                loan_amount,
                repayment_amount,
                tenure,
                borrower,
                lender: lender_addr,
                platform_fee,
                loanstart_time: timestamp::now_seconds(),
                loanend_time: timestamp::now_seconds() + tenure * 86400, // Assuming tenure is in days
                ordinal_token,
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
        };
    }

     
    #[view]
    public fun check_ownership(owner_addr: address, token_addr: address): bool {
        borrow_request_contract::check_ownership(owner_addr, token_addr)
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
}
