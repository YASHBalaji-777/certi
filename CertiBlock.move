module message_board_addr::CertiBlock {
    use aptos_std::string::{String, utf8};
    use aptos_std::table::{Self, Table};
    use std::signer;
    use std::vector;

    /// Errors
    const EALREADY_ISSUED: u64 = 0;
    const EINVALID_ISSUER: u64 = 1;

    /// Certificates storage for an organization
    struct IssuerCertificates has key {
        certificates: Table<u64, Certificate>,
    }

    /// Certificate struct
    struct Certificate has store, drop {
        student_id: u64,
        ipfs_hash: String,
        course_name: String,
        issuer: address,
    }

    /// List of authorized issuers
    struct Issuers has key {
        list: vector<address>,
    }

    /// Init issuer list for an organization
    public entry fun init_issuers(account: &signer) {
        move_to(account, Issuers { list: vector::empty<address>() });
    }

    /// Add new issuer
    public entry fun add_issuer(account: &signer, new_issuer: address) acquires Issuers {
        let issuers = borrow_global_mut<Issuers>(signer::address_of(account));
        vector::push_back(&mut issuers.list, new_issuer);
    }

  /// Issue new certificate
public entry fun issue_certificate(
    issuer: &signer,
    organization: &signer,   // FIX: take signer, not just address
    student_id: u64,
    ipfs_hash: String,
    course_name: String
) acquires IssuerCertificates, Issuers {
    let org_addr = signer::address_of(organization);

    // check issuer authorization
    assert!(is_issuer_authorized(org_addr, signer::address_of(issuer)), EINVALID_ISSUER);

    // create IssuerCertificates resource if not exists
    if (!exists<IssuerCertificates>(org_addr)) {
        move_to(organization, IssuerCertificates { certificates: table::new<u64, Certificate>() });
    };

    // borrow table
    let certs_ref = &mut borrow_global_mut<IssuerCertificates>(org_addr).certificates;

    // ensure not already issued
    assert!(!table::contains(certs_ref, student_id), EALREADY_ISSUED);

    // make cert
    let cert = Certificate {
        student_id,
        ipfs_hash,
        course_name,
        issuer: signer::address_of(issuer),
    };

    // insert
    table::add(certs_ref, student_id, cert);
}


    /// View: verify certificate
    public fun verify_certificate(
        organization: address,
        student_id: u64
    ): (bool, String, String) acquires IssuerCertificates {
        if (!exists<IssuerCertificates>(organization)) {
            return (false, utf8(b""), utf8(b""));
        };

        let certs_ref = &borrow_global<IssuerCertificates>(organization).certificates;

        if (!table::contains(certs_ref, student_id)) {
            return (false, utf8(b""), utf8(b""));
        };

        let cert_ref = table::borrow(certs_ref, student_id);
        (true, cert_ref.ipfs_hash, cert_ref.course_name)
    }

    /// helper
    fun is_issuer_authorized(organization: address, issuer: address): bool acquires Issuers {
        if (!exists<Issuers>(organization)) {
            return false;
        };
        let issuers = borrow_global<Issuers>(organization);
        vector::contains(&issuers.list, &issuer)
    }
}

