import type { CadenzaJsxElement } from "./jsx-runtime.js";
import { jsx } from "./jsx-runtime.js";

export { Fragment, jsx, jsxs } from "./jsx-runtime.js";

type Component<Props> = (props: Props) => CadenzaJsxElement;

export function jsxDEV<Props>(
  component: Component<Props>,
  props: Props,
): CadenzaJsxElement {
  return jsx(component, props);
}
