import { InjectableTarget } from './engine-context';
export declare const usePortals: () => {
    portals: Map<string, {
        component: React.FC<unknown>;
        target: InjectableTarget;
    }>;
    addPortal: <T>(key: string, target: InjectableTarget, component: React.FC<T>) => void;
    removePortal: (key: string) => void;
};
//# sourceMappingURL=use-portals.d.ts.map