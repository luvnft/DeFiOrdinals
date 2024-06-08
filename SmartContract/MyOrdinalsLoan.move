module myordinalsloan_addr::borrow {
    use aptos_framework::event;
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use std::string::String;
    use std::vector;

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const EBORROW_REQUEST_DOESNT_EXIST: u64 = 2;

    struct BorrowManager has key {
        borrow_requests: Table<u64, BorrowRequest>,
        request_keys: vector<u64>,
        set_borrow_request_event: event::EventHandle<BorrowRequest>,
        request_counter: u64,
    }

    struct BorrowRequest has store, drop, copy {
        collection_id: u64,
        ordinal_id: u64,
        inscription_number: String,
        loan_time: u64,
        borrower: address,
        terms: Terms,
    }

    struct Terms has store, drop, copy {
        terms: u64,
        loan_to_value: u64,
        loan_amount: u64,
        platform_fee: u64,
        yield_rate: u64,
        yield_accrued: u64,
        floor_value: u64,
    }

    public entry fun create_manager(account: &signer) {
        let borrow_manager = BorrowManager {
            borrow_requests: table::new(),
            request_keys: vector::empty<u64>(),
            set_borrow_request_event: account::new_event_handle<BorrowRequest>(account),
            request_counter: 0,
        };
        move_to(account, borrow_manager);
    }

    public entry fun create_borrow_request(
        account: &signer,
        collection_id: u64,
        ordinal_id: u64,
        inscription_number: String,
        loan_time: u64,
        terms: u64,
        loan_to_value: u64,
        loan_amount: u64,
        platform_fee: u64,
        yield_rate: u64,
        yield_accrued: u64,
        floor_value: u64
    ) acquires BorrowManager {
        let signer_address = signer::address_of(account);
        assert!(exists<BorrowManager>(signer_address), E_NOT_INITIALIZED);

        let borrow_manager = borrow_global_mut<BorrowManager>(signer_address);
        let counter = borrow_manager.request_counter + 1;
        let new_terms = Terms {
            terms,
            loan_to_value,
            loan_amount,
            platform_fee,
            yield_rate,
            yield_accrued,
            floor_value,
        };
        let new_request = BorrowRequest {
            collection_id,
            ordinal_id,
            inscription_number,
            loan_time,
            borrower: signer_address,
            terms: new_terms,
        };

        table::upsert(&mut borrow_manager.borrow_requests, counter, new_request);
        vector::push_back(&mut borrow_manager.request_keys, counter);
        borrow_manager.request_counter = counter;

        event::emit_event<BorrowRequest>(
            &mut borrow_manager.set_borrow_request_event,
            new_request,
        );
    }

    public entry fun update_terms(
        account: &signer,
        request_id: u64,
        terms: u64,
        loan_to_value: u64,
        loan_amount: u64,
        platform_fee: u64,
        yield_rate: u64,
        yield_accrued: u64,
        floor_value: u64
    ) acquires BorrowManager {
        let signer_address = signer::address_of(account);
        assert!(exists<BorrowManager>(signer_address), E_NOT_INITIALIZED);

        let borrow_manager = borrow_global_mut<BorrowManager>(signer_address);
        assert!(table::contains(&borrow_manager.borrow_requests, request_id), EBORROW_REQUEST_DOESNT_EXIST);

        let request = table::borrow_mut(&mut borrow_manager.borrow_requests, request_id);
        request.terms = Terms {
            terms,
            loan_to_value,
            loan_amount,
            platform_fee,
            yield_rate,
            yield_accrued,
            floor_value,
        };
    }

    // View function to get all borrow requests of a user
    #[view]
    public fun get_all_borrow_requests(
        user: address
    ): vector<BorrowRequest> acquires BorrowManager {
        assert!(exists<BorrowManager>(user), E_NOT_INITIALIZED);

        let borrow_manager = borrow_global<BorrowManager>(user);
        let requests = vector::empty<BorrowRequest>();

        let keys = &borrow_manager.request_keys;
        let len = vector::length(keys);
        let index = 0;
        while (index < len) {
            let key = *vector::borrow(keys, index);
            let request = *table::borrow(&borrow_manager.borrow_requests, key);
            if (request.borrower == user) {
                vector::push_back(&mut requests, request);
            };
            index = index + 1;
        };

        requests
    }

    #[test_only]
    use std::string;
    #[test(admin = @0x123)]
    public entry fun test_borrow_flow(admin: signer) acquires BorrowManager {
        account::create_account_for_test(signer::address_of(&admin));
        create_manager(&admin);

        create_borrow_request(
            &admin,
            1,
            1,
            string::utf8(b"123"),
            7,
            1,
            50,
            1000,
            10,
            5,
            0,
            500
        );
        create_borrow_request(
            &admin,
            2,
            2,
            string::utf8(b"456"),
            14,
            1,
            60,
            1200,
            12,
            6,
            0,
            600
        );

        let request_count = event::counter(&borrow_global<BorrowManager>(signer::address_of(&admin)).set_borrow_request_event);
        assert!(request_count == 2, 4);

        let borrow_manager = borrow_global<BorrowManager>(signer::address_of(&admin));
        assert!(borrow_manager.request_counter == 2, 5);

        let requests = get_all_borrow_requests(signer::address_of(&admin));
        assert!(vector::length(&requests) == 2, 6);

        let request1 = vector::borrow(&requests, 0);
        assert!(request1.collection_id == 1, 7);
        assert!(request1.ordinal_id == 1, 8);
        assert!(request1.inscription_number == string::utf8(b"123"), 9);
        assert!(request1.loan_time == 7, 10);
        assert!(request1.borrower == signer::address_of(&admin), 11);

        let request2 = vector::borrow(&requests, 1);
        assert!(request2.collection_id == 2, 12);
        assert!(request2.ordinal_id == 2, 13);
        assert!(request2.inscription_number == string::utf8(b"456"), 14);
        assert!(request2.loan_time == 14, 15);
        assert!(request2.borrower == signer::address_of(&admin), 16);
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = E_NOT_INITIALIZED)]
    public entry fun account_can_not_update_terms(admin: signer) acquires BorrowManager {
        account::create_account_for_test(signer::address_of(&admin));
        update_terms(
            &admin,
            1,
            1,
            60,
            1100,
            15,
            6,
            0,
            550
        );
    }
}
