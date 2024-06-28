"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Engine_selector;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const constants_1 = require("./constants");
const near_signer_service_1 = require("./app/services/near-signer/near-signer.service");
const social_db_service_1 = require("./app/services/social-db/social-db.service");
const local_db_service_1 = require("./app/services/local-db/local-db.service");
const local_storage_1 = require("./app/services/local-db/local-storage");
const mutation_repository_1 = require("./app/services/mutation/mutation.repository");
const application_repository_1 = require("./app/services/application/application.repository");
const user_link_repository_1 = require("./app/services/user-link/user-link.repository");
const parser_config_repository_1 = require("./app/services/parser-config/parser-config.repository");
const mutation_service_1 = require("./app/services/mutation/mutation.service");
const application_service_1 = require("./app/services/application/application.service");
const user_link_service_1 = require("./app/services/user-link/user-link.service");
const parser_config_service_1 = require("./app/services/parser-config/parser-config.service");
class Engine {
    constructor(config) {
        this.config = config;
        _Engine_selector.set(this, void 0);
        if (!this.config.storage) {
            this.config.storage = new local_storage_1.LocalStorage('mutable-web-engine');
        }
        __classPrivateFieldSet(this, _Engine_selector, this.config.selector, "f");
        const nearConfig = (0, constants_1.getNearConfig)(this.config.networkId);
        const localDb = new local_db_service_1.LocalDbService(this.config.storage);
        const nearSigner = new near_signer_service_1.NearSigner(__classPrivateFieldGet(this, _Engine_selector, "f"), localDb, nearConfig);
        const socialDb = new social_db_service_1.SocialDbService(nearSigner, nearConfig.contractName);
        const mutationRepository = new mutation_repository_1.MutationRepository(socialDb, localDb);
        const applicationRepository = new application_repository_1.ApplicationRepository(socialDb, localDb);
        const userLinkRepository = new user_link_repository_1.UserLinkRepository(socialDb, nearSigner);
        const parserConfigRepository = new parser_config_repository_1.ParserConfigRepository(socialDb);
        this.mutationService = new mutation_service_1.MutationService(mutationRepository, nearConfig);
        this.applicationService = new application_service_1.ApplicationService(applicationRepository);
        this.userLinkService = new user_link_service_1.UserLinkSerivce(userLinkRepository, this.applicationService);
        this.parserConfigService = new parser_config_service_1.ParserConfigService(parserConfigRepository);
    }
}
exports.Engine = Engine;
_Engine_selector = new WeakMap();
