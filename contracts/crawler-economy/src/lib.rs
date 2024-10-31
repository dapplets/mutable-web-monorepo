use near_sdk::borsh::BorshSerialize;
use near_sdk::env;
use near_sdk::json_types::{Base64VecU8, U128};
use near_sdk::near;
use near_sdk::store::IterableMap;
use near_sdk::Promise;
use near_sdk::{AccountId, NearToken};

#[derive(Clone)]
#[near(serializers=[borsh, json])]
pub struct Server {
    pub public_key: Base64VecU8,
    pub api_address: String,
}

#[near(serializers=[borsh, json])]
pub struct Receipt {
    pub data_hash: Base64VecU8,
    pub amount: U128,
    pub receiver_id: AccountId,
}

#[near(serializers=[borsh, json])]
pub struct SignedReceipt {
    pub receipt: Receipt,
    pub signature: Base64VecU8,
    pub public_key: Base64VecU8,
}

#[near(contract_state)]
pub struct SmartContract {
    pub servers: IterableMap<Vec<u8>, Server>,
    pub payments: IterableMap<Vec<u8>, u128>,
}

impl Default for SmartContract {
    fn default() -> Self {
        Self {
            servers: IterableMap::new(b"a".to_vec()),
            payments: IterableMap::new(b"b".to_vec()),
        }
    }
}

#[near]
impl SmartContract {
    // READ METHODS

    pub fn get_servers(&self, from_index: Option<U128>, limit: Option<u32>) -> Vec<Server> {
        let start = u128::from(from_index.unwrap_or(U128(0)));

        self.servers
            .values()
            .skip(start as usize)
            .take(limit.unwrap_or(50) as usize)
            .cloned()
            .collect()
    }

    pub fn check_receipt(&self, signed_receipt: SignedReceipt) -> bool {
        self._is_server_registered(signed_receipt.public_key.clone())
            && self._is_signature_valid(&signed_receipt)
            && self._is_data_paid(signed_receipt.receipt.data_hash.clone())
    }

    pub fn check_receipts(&self, signed_receipts: Vec<SignedReceipt>) -> Vec<bool> {
        let mut result: Vec<bool> = Vec::new();
        for receipt in signed_receipts {
            result.push(self.check_receipt(receipt));
        }
        result
    }

    pub fn is_paid_data(&self, data_hash: Base64VecU8) -> bool {
        let data_hash_vec: Vec<u8> = data_hash.clone().into();
        self.payments.contains_key(&data_hash_vec)
    }

    // WRITE METHODS

    pub fn register_server(&mut self, public_key: Base64VecU8, api_address: String) {
        let public_key_vec: Vec<u8> = public_key.clone().into();
        assert!(
            !self.servers.contains_key(&public_key_vec),
            "Server already registered."
        );
        let server = Server {
            public_key: public_key.clone(),
            api_address,
        };
        self.servers.insert(public_key_vec, server);
    }

    #[payable]
    pub fn pay_for_data(&mut self, data_hash: Base64VecU8) {
        let amount = env::attached_deposit().as_yoctonear();
        assert!(amount > 0, "Must send a non-zero deposit.");

        let data_hash_vec: Vec<u8> = data_hash.clone().into();

        let total_payment = self.payments.get(&data_hash_vec).unwrap_or(&0);
        self.payments.insert(
            data_hash_vec.clone(),
            total_payment.checked_add(amount).expect("Overflow"),
        );
    }

    pub fn claim_reward(&mut self, signed_receipt: SignedReceipt) {
        assert!(
            self._is_server_registered(signed_receipt.public_key.clone()),
            "Server not registered"
        );

        assert!(
            self._is_signature_valid(&signed_receipt),
            "Invalid receipt signature."
        );

        assert!(
            self._is_data_paid(signed_receipt.receipt.data_hash.clone()),
            "No tokens for the ID."
        );

        assert!(
            signed_receipt.receipt.receiver_id == env::predecessor_account_id(),
            "Only the receiver can claim the reward."
        );

        // decrease balance
        // ToDo: attack on balance?
        let data_hash_vec: Vec<u8> = signed_receipt.receipt.data_hash.clone().into();
        let balance = self.payments.get(&data_hash_vec).unwrap_or(&0).clone();
        self.payments.insert(
            signed_receipt.receipt.data_hash.clone().into(),
            balance - signed_receipt.receipt.amount.0,
        );

        Promise::new(env::predecessor_account_id())
            .transfer(NearToken::from_yoctonear(signed_receipt.receipt.amount.0));
    }

    pub fn claim_rewards(&mut self, signed_receipts: Vec<SignedReceipt>) {
        for receipt in signed_receipts {
            self.claim_reward(receipt);
        }
    }

    // Private methods

    fn _is_server_registered(&self, public_key: Base64VecU8) -> bool {
        let public_key_vec: Vec<u8> = public_key.clone().into();
        self.servers.contains_key(&public_key_vec)
    }

    fn _is_signature_valid(&self, receipt: &SignedReceipt) -> bool {
        let mut buffer: Vec<u8> = Vec::new();
        BorshSerialize::serialize(&receipt.receipt, &mut buffer).unwrap();

        let signature_array: Vec<u8> = receipt.signature.clone().into();
        let public_key_array: Vec<u8> = receipt.public_key.clone().into();

        env::ed25519_verify(
            &signature_array.try_into().expect("Invalid signature"),
            &buffer,
            &public_key_array.try_into().expect("Invalid public key"),
        )
    }

    fn _is_data_paid(&self, data_hash: Base64VecU8) -> bool {
        let data_hash_vec: Vec<u8> = data_hash.clone().into();
        let balance = self.payments.get(&data_hash_vec).unwrap_or(&0).clone();
        balance > 0
    }
}
