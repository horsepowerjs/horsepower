import { JSDOM } from 'jsdom';
export interface Template {
    dom: JSDOM;
    document: Document;
    body: HTMLBodyElement;
    file: string;
    child?: Template;
}
export declare function extend(tpl: Template): Promise<Template>;
