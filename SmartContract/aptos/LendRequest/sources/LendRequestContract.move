module AptosMyOrdinalsLoan200::LendRequest {
    use std::signer;
    use std::vector;
    use std::string;
    use aptos_std::table_with_length;
    use aptos_std::smart_vector;
    use aptos_framework::object;
    use aptos_framework::timestamp;

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
        collection_name: string::String,
        inscription_number: u64,
        collection_id: u64,
        inscription_id: string::String,
        loanstart_time: u64,
        loanend_time: u64,
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
        current_loans: table_with_length::TableWithLength<u64, Loan>,
        loan_keys: vector<u64>,  
    }

    fun get_marketplace_signer_addr(): address {
        object::create_object_address(&@AptosMyOrdinalsLoan200, APP_OBJECT_SEED)
    }

    fun get_marketplace_signer(marketplace_signer_addr: address): signer acquires MarketplaceSigner {
        object::generate_signer_for_extending(&borrow_global<MarketplaceSigner>(marketplace_signer_addr).extend_ref)
    }

    public fun get_next_loan_id(): u64 acquires LoanIdCounter {
        let counter_resource = borrow_global_mut<LoanIdCounter>(get_marketplace_signer_addr());
        let current_id = counter_resource.counter;
        counter_resource.counter = current_id + 1;
        current_id
    }

    public entry fun create_loan_request(
        borrower: address,
        lender: &signer,
        collection_name: string::String,
        inscription_number: u64,
        loan_amount: u64,
        repayment_amount: u64,
        tenure: u64,
        platform_fee: u64,
        collection_id: u64,
        inscription_id: string::String,
    ) acquires AptosOrdinal, LoanLedger, MarketplaceSigner, LoanIdCounter, Lenders {
        let lender_addr = signer::address_of(lender);
        let aptos_ordinal = borrow_global_mut<AptosOrdinal>(lender_addr);
        let status = 0;
        
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
            collection_name,
            inscription_number,
            collection_id,
            inscription_id,
            loanstart_time: timestamp::now_seconds(),
            loanend_time: timestamp::now_seconds() + tenure * 86400, // Assuming tenure is in days
            status,
        };
        table_with_length::add(&mut aptos_ordinal.current_loans, loan_id, loan);
        vector::push_back(&mut aptos_ordinal.loan_keys, loan_id); // Add loan id to the vector

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
