"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutationDisabled = exports.mutationSwitched = void 0;
const modal_context_1 = require("../modal-context/modal-context");
const mutationSwitched = ({ fromMutationId, toMutationId, onBack, }) => ({
    subject: 'Mutation Switched',
    body: `The mutation has been switched from ${fromMutationId} to ${toMutationId}`,
    type: modal_context_1.NotificationType.Info,
    actions: [
        { label: 'Ok, got it', type: 'primary' },
        {
            label: `Turn back`,
            type: 'default',
            onClick: onBack,
        },
    ],
});
exports.mutationSwitched = mutationSwitched;
const mutationDisabled = ({ onBack }) => ({
    subject: 'Mutation Disabled',
    body: `You disabled all mutations`,
    type: modal_context_1.NotificationType.Warning,
    actions: [
        { label: 'Ok, got it', type: 'primary' },
        {
            label: `Turn back`,
            type: 'default',
            onClick: onBack,
        },
    ],
});
exports.mutationDisabled = mutationDisabled;
