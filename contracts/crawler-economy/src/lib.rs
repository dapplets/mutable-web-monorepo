use near_sdk::borsh::BorshSerialize;
use near_sdk::env;
use near_sdk::near;
use near_sdk::store::IterableMap;
use near_sdk::Promise;
use near_sdk::{near_bindgen, AccountId, NearToken, PublicKey};

#[near(serializers=[borsh, json])]
pub struct ReceiptInput {
    pub id: String,
    pub amount: u128,
    pub recipient: String,
}

#[near(serializers=[borsh, json])]
pub struct Server {
    pub public_key: Vec<u8>,
    pub api_address: String,
}

#[near(serializers=[borsh, json])]
pub struct Receipt {
    pub data_hash: Vec<u8>,
    pub amount: u128,
    pub receiver_id: AccountId,
}

#[near(serializers=[borsh, json])]
pub struct SignedReceipt {
    pub receipt: Receipt,
    pub signature: Vec<u8>,
    pub public_key: PublicKey,
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

#[near_bindgen]
impl SmartContract {
    pub fn register_server(&mut self, public_key: Vec<u8>, api_address: String) {
        assert!(
            self.servers.get(&public_key).is_none(),
            "Server already registered."
        );
        let server = Server {
            public_key: public_key.clone(),
            api_address,
        };
        self.servers.insert(public_key, server);
    }

    #[payable]
    pub fn pay_for_data(&mut self, data_hash: Vec<u8>) {
        let amount = env::attached_deposit();
        assert!(!amount.is_zero(), "Must send a non-zero deposit.");

        let total_payment = self.payments.get(&data_hash).unwrap_or(&0);
        self.payments.insert(
            data_hash,
            total_payment
                .checked_add(amount.as_near())
                .expect("Overflow"),
        );
    }

    pub fn claim_reward(&mut self, signed_receipt: SignedReceipt) {
        self.servers
            .get(&signed_receipt.public_key.as_bytes().to_vec())
            .expect("Server not registered.");

        assert!(
            self.payments
                .contains_key(&signed_receipt.receipt.data_hash),
            "Payment not found for the ID."
        );

        assert!(
            signed_receipt.receipt.receiver_id == env::predecessor_account_id(),
            "Only the receiver can claim the reward."
        );

        let mut buffer: Vec<u8> = Vec::new();
        BorshSerialize::serialize(&signed_receipt.receipt, &mut buffer).unwrap();

        assert!(
            env::ed25519_verify(
                &signed_receipt
                    .signature
                    .try_into()
                    .expect("Invalid signature length"),
                &buffer,
                &signed_receipt
                    .public_key
                    .as_bytes()
                    .try_into()
                    .expect("Invalid public key length")
            ),
            "Invalid receipt signature."
        );

        let total_payment = self
            .payments
            .get(&signed_receipt.receipt.data_hash)
            .unwrap_or(&0);
        self.payments.insert(
            signed_receipt.receipt.data_hash,
            total_payment
                .checked_sub(signed_receipt.receipt.amount)
                .expect("Overflow"),
        );

        Promise::new(env::predecessor_account_id())
            .transfer(NearToken::from_yoctonear(signed_receipt.receipt.amount));
    }
}
