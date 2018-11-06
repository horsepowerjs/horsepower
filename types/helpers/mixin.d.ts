import { Template } from './extend';
export interface Mixin {
    name: string;
    element: Element;
}
export declare function getMixins(tpl: Template): Mixin[];
export declare function includeMixin(root: Template, element: Element, data: object, mixins: Mixin[]): void;
