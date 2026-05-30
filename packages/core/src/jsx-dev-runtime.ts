import type { CadenzaJsxElement } from "./jsx-runtime.ts";
import { jsx } from "./jsx-runtime.ts";

export { Fragment, jsx, jsxs } from "./jsx-runtime.ts";

type Component<Props> = (props: Props) => CadenzaJsxElement;

export function jsxDEV<Props>(
  component: Component<Props>,
  props: Props,
): CadenzaJsxElement {
  return jsx(component, props);
}
