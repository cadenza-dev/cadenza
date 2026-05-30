import type { CadenzaNode } from "./typed-api/primitives.ts";

export type CadenzaJsxElement = CadenzaNode;

type Component<Props> = (props: Props) => CadenzaJsxElement;

export namespace JSX {
  export type Element = CadenzaJsxElement;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicElements {
    [name: string]: never;
  }
}

export function jsx<Props>(
  component: Component<Props>,
  props: Props,
): CadenzaJsxElement {
  return component(props);
}

export const jsxs = jsx;

export function Fragment(props: {
  children: CadenzaJsxElement;
}): CadenzaJsxElement {
  return props.children;
}
