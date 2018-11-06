import { Template } from './helpers';
export declare class Red5Template {
    private data;
    constructor(options?: object);
    static render(file: string, data?: object): Promise<string>;
    build(tpl: Template): Promise<Template>;
}
