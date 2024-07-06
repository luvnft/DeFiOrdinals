module my_ordinalsloan::ordinal_nft {
    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::timestamp;
    use aptos_std::string_utils::{to_string};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use std::error;
    use std::option;
    use std::signer::address_of;
    use std::string::{Self, String};
    use std::vector;

    /// Ordinal does not exist
    const E_ORDINAL_DOES_NOT_EXIST: u64 = 1;
    /// Accessory not available
    const E_ACCESSORY_NOT_AVAILABLE: u64 = 1;
    /// Parts length does not match
    const E_PARTS_LENGTH_NOT_MATCH: u64 = 2;
    /// Name exceeds limit
    const E_NAME_EXCEEDS_LIMIT: u64 = 3;

    // maximum health points: 5 hearts * 2 HP/heart = 10 HP
    const ENERGY_UPPER_BOUND: u64 = 10;
    const NAME_UPPER_BOUND: u64 = 40;
    const PARTS_SIZE: u64 = 3;
    const UNIT_PRICE: u64 = 100000000;

    #[event]
    struct MintOrdinalEvent has drop, store {
        ordinal_name: String,
        inscription_number: u64,
    }

    struct Ordinal has key {
        collection_name: String,
        inscription_number: u64,
        inscription: string::String,
        content_url: string::String, 
        mint_time: u64,
        extend_ref: object::ExtendRef,
        mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
    }

    struct OrdinalCollection has key {
        ordinals: vector<address>,
    }

    struct OrdinalBattleExt has key {
        attack_point: u64,
        defence_point: u64,
    }

    struct Accessory has key {
        category: String,
        id: u64,
    }

    // We need a contract signer as the creator of the ordinal collection and ordinal token
    // Otherwise we need admin to sign whenever a new ordinal token is minted which is inconvenient
    struct ObjectController has key {
        // This is the extend_ref of the app object, not the extend_ref of collection object or token object
        // app object is the creator and owner of ordinal collection object
        // app object is also the creator of all ordinal token (NFT) objects
        // but owner of each token object is ordinal owner (i.e. user who mints ordinal)
        app_extend_ref: ExtendRef,
    }

    const APP_OBJECT_SEED: vector<u8> = b"ORDINAL";
    const ORDINAL_COLLECTION_NAME: vector<u8> = b"Ordinal Collection";
    const ORDINAL_COLLECTION_DESCRIPTION: vector<u8> = b"Ordinal Collection Description";
    const ORDINAL_COLLECTION_URI: vector<u8> = b"https://otjbxblyfunmfblzdegw.supabase.co/storage/v1/object/public/aptoordinal/aptoordinal.png";



    // This function is only callable during publishing
    fun init_module(account: &signer) {
        let constructor_ref = &object::create_named_object(account, APP_OBJECT_SEED);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let app_signer = &object::generate_signer(constructor_ref);

        move_to(app_signer, ObjectController {
            app_extend_ref: extend_ref,
        });

        create_ordinal_collection(app_signer);
    }

    // ================================= Entry Functions ================================= //

    // Create an Ordinal token object
    public entry fun create_ordinal(user: &signer, inscription_number: u64, collection_name: String, content_url: String, inscription: String) acquires ObjectController, OrdinalCollection {
        assert!(string::length(&collection_name) <= NAME_UPPER_BOUND, error::invalid_argument(E_NAME_EXCEEDS_LIMIT));
        let description = string::utf8(ORDINAL_COLLECTION_DESCRIPTION);
        let user_addr = address_of(user);

        let constructor_ref = token::create_named_token(
            &get_app_signer(get_app_signer_address()),
            string::utf8(ORDINAL_COLLECTION_NAME),
            description,
            get_ordinal_token_name(user_addr, inscription_number),
            option::none(),
            content_url,
        );

        let token_signer = object::generate_signer(&constructor_ref);
        let mutator_ref = token::generate_mutator_ref(&constructor_ref);
        let burn_ref = token::generate_burn_ref(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        // initialize/set default Ordinal struct values
        let ordinal = Ordinal {
            collection_name,
            mint_time: timestamp::now_seconds(),
            inscription_number,
            inscription,
            content_url,
            extend_ref,
            mutator_ref,
            burn_ref,
        };

        move_to(&token_signer, ordinal);

        // Add the Ordinal address to the user's collection
        if (exists<OrdinalCollection>(user_addr)) {
            let user_collection = borrow_global_mut<OrdinalCollection>(user_addr);
            vector::push_back(&mut user_collection.ordinals, address_of(&token_signer));
        } else {
            let user_collection = OrdinalCollection {
                ordinals: vector::empty(),
            };
            vector::push_back(&mut user_collection.ordinals, address_of(&token_signer));
            move_to(user, user_collection);
        };

        // Emit event for minting Ordinal token
        event::emit<MintOrdinalEvent>(
            MintOrdinalEvent {
                ordinal_name: collection_name,
                inscription_number,
            },
        );

        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), address_of(user));
    }

    // ================================= View Functions ================================== //

    #[view]
    public fun token_belongs_to_owner(owner_addr: address, token_addr: address): bool acquires OrdinalCollection {
        if (exists<OrdinalCollection>(owner_addr)) {
            let user_collection = borrow_global<OrdinalCollection>(owner_addr);
            vector::contains(&user_collection.ordinals, &token_addr)
        } else {
            false
        }
    }

    // Get reference to Ordinal token object (CAN'T modify the reference)
    #[view]
    public fun get_ordinal_addresses(owner_addr: address): vector<address> acquires OrdinalCollection {
        if (exists<OrdinalCollection>(owner_addr)) {
            let user_collection = borrow_global<OrdinalCollection>(owner_addr);
            user_collection.ordinals
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun address_exists(token_address: address): bool {
        exists<Ordinal>(token_address)
    }


    // Returns all fields for the Ordinal at a given address (if found)
    #[view]
    public fun get_ordinal(token_address: address): (String, String, u64, String) acquires Ordinal {
        // if this address doesn't have an Ordinal, throw error
        assert!(exists<Ordinal>(token_address), error::not_found(E_ORDINAL_DOES_NOT_EXIST));

        let ordinal = borrow_global<Ordinal>(token_address);

        // view function can only return primitive types.
        (ordinal.collection_name, ordinal.content_url, ordinal.inscription_number, ordinal.inscription)
    }

    #[view]
    public fun get_inscription_number(token_address: address): u64 acquires Ordinal {
        assert!(exists<Ordinal>(token_address), error::not_found(E_ORDINAL_DOES_NOT_EXIST));

        let ordinal = borrow_global<Ordinal>(token_address);

        ordinal.inscription_number
    }

    // ================================= Helpers ================================== //

    fun get_app_signer_address(): address {
        object::create_object_address(&@my_ordinalsloan, APP_OBJECT_SEED)
    }

    fun get_app_signer(app_signer_address: address): signer acquires ObjectController {
        object::generate_signer_for_extending(&borrow_global<ObjectController>(app_signer_address).app_extend_ref)
    }

    // Create the collection that will hold all the Ordinals
    fun create_ordinal_collection(creator: &signer) {
        let description = string::utf8(ORDINAL_COLLECTION_DESCRIPTION);
        let collection_name = string::utf8(ORDINAL_COLLECTION_NAME);
        let uri = string::utf8(ORDINAL_COLLECTION_URI);

        collection::create_unlimited_collection(
            creator,
            description,
            collection_name,
            option::none(),
            uri,
        );
    }



    fun get_ordinal_token_name(owner_addr: address, inscription_number: u64): String {
        let token_name = string::utf8(b"ordinal");
        string::append(&mut token_name, to_string(&owner_addr));
        string::append(&mut token_name, to_string(&inscription_number));

        token_name
    }



    // ================================= Tests ================================== //

    // Setup testing environment
    #[test_only]
    use aptos_framework::account::create_account_for_test;
    #[test_only]
    use aptos_framework::aptos_coin;

    #[test_only]
    fun setup_test(aptos: &signer, account: &signer, creator: &signer) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos);

        // create fake accounts (only for testing purposes) and deposit initial balance

        create_account_for_test(address_of(account));
        coin::register<AptosCoin>(account);

        let creator_addr = address_of(creator);
        create_account_for_test(address_of(creator));
        coin::register<AptosCoin>(creator);
        let coins = coin::mint(3 * UNIT_PRICE, &mint_cap);
        coin::deposit(creator_addr, coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        timestamp::set_time_has_started_for_testing(aptos);
        init_module(account);
    }

    // Test creating an Ordinal
    #[test(aptos = @0x1, account = @my_ordinalsloan, creator = @0x123)]
    fun test_create_ordinal(aptos: &signer, account: &signer, creator: &signer) acquires ObjectController, OrdinalCollection {
        setup_test(aptos, account, creator);

        create_ordinal(creator, 1, string::utf8(b"test"), string::utf8(b"https://example.com"), string::utf8(b"test inscription"));

        let ordinals = get_ordinal_addresses(address_of(creator));
        assert!(vector::length(&ordinals) == 1, 1);
    }

    // Test getting an Ordinal, when user has not minted
    #[test(aptos = @0x1, account = @my_ordinalsloan, creator = @0x123)]
    #[expected_failure(abort_code = E_ORDINAL_DOES_NOT_EXIST, location = my_ordinalsloan::OrdinalNFT)]
    fun test_get_ordinal_without_creation(
        aptos: &signer,
        account: &signer,
        creator: &signer
    ) acquires Ordinal {
        setup_test(aptos, account, creator);

        // get ordinal without creating it
        let ordinals = get_ordinal_addresses(address_of(creator));
        get_ordinal(vector::borrow(&ordinals, 0));
    }

    #[test(aptos = @0x1, account = @my_ordinalsloan, creator = @0x123)]
    fun test_create_multiple_ordinals(aptos: &signer, account: &signer, creator: &signer) acquires ObjectController, OrdinalCollection {
        setup_test(aptos, account, creator);

        create_ordinal(creator, 1, string::utf8(b"test1"), string::utf8(b"https://example.com/1"), string::utf8(b"inscription1"));
        create_ordinal(creator, 2, string::utf8(b"test2"), string::utf8(b"https://example.com/2"), string::utf8(b"inscription2"));

        let ordinals = get_ordinal_addresses(address_of(creator));
        assert!(vector::length(&ordinals) == 2, 1);
    }


}
