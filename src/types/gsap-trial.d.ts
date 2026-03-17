// gsap/SplitText and gsap/ScrollSmoother are bundled with the standard gsap package
// (GSAP is now fully free as of April 30, 2025 — no gsap-trial needed)
// These re-exports ensure TypeScript recognises the submodule paths.

declare module "gsap/SplitText" {
    export class SplitText {
        chars: Element[];
        words: Element[];
        lines: Element[];
        constructor(target: any, vars?: any);
        revert(): void;
        split(vars?: any): this;
    }
}

declare module "gsap/ScrollSmoother" {
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
