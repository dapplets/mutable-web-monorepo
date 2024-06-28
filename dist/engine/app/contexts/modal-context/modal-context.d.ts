/// <reference types="react" />
export declare enum NotificationType {
    Error = "error",
    Warning = "warning",
    Info = "info"
}
export type ModalProps = {
    subject: string;
    body: string;
    type: NotificationType;
    actions: {
        label: string;
        type?: 'primary' | 'default';
        onClick?: () => void;
    }[];
};
export type ModalContextState = {
    notify: (modalProps: ModalProps) => void;
};
export declare const contextDefaultValues: ModalContextState;
export declare const ModalContext: import("react").Context<ModalContextState>;
//# sourceMappingURL=modal-context.d.ts.map