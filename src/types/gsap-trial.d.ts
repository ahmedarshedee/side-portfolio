// Type declarations for gsap-trial plugin modules (no official @types package exists)

declare module "gsap-trial/SplitText" {
    export class SplitText {
        chars: Element[];
        words: Element[];
        lines: Element[];
        constructor(target: any, vars?: any);
        revert(): void;
        split(vars?: any): this;
    }
}

declare module "gsap-trial/ScrollSmoother" {
    export class ScrollSmoother {
        static create(vars?: any): ScrollSmoother;
        static refresh(soft?: boolean): void;
        scrollTop(position?: number): number;
        paused(value?: boolean): boolean | this;
        scrollTo(target: any, smooth?: boolean, position?: string): void;
        kill(): void;
        effects(targets: any, vars: any): any;
    }
}
