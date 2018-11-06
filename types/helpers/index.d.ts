/// <reference types="node" />
import { Template } from './extend';
import { Mixin } from './mixin';
export * from './files';
export * from './extend';
export declare function getData(text: string, data: object): any;
export declare function dropFirst(text: string): string;
export declare function find(query: string, data: object): any;
export declare function replaceHolders(text: string, data: object): string;
export declare function makeFragment(element: string | Buffer | Element): DocumentFragment;
export declare function fragmentFromFile(file: string): Promise<DocumentFragment>;
export declare function remove(element: Element): void;
export declare function step(root: Template, node: Document | Element | Node | DocumentFragment, data: object, mixins: Mixin[]): Promise<any>;
