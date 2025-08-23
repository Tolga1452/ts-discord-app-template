import { Component, Modal } from '../types/index.js';

export default class CustomIdArgs<Args extends readonly string[] = readonly string[]> {
    public map: Map<Args[number], string> = new Map();

    constructor(componentOrModal: Component | Modal, args: string[]) {
        for (let i = 0; i < args.length; i++) {
            this.map.set(componentOrModal.args[i], args[i]);
        };
    };

    public get(arg: Args[number]): string | undefined {
        return this.map.get(arg);
    };
};
