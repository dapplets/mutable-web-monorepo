import { FC, useEffect, useState } from 'react'
import * as ReactJsxRuntime from 'react/jsx-runtime'
import * as React from 'react'
import Sval from 'sval'
import * as ReactDOM from 'react-dom'
import * as customElements from '../../custom-elements'

const style = `
._button_1vtc1_1{background-color:red;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer}
`

const code = `
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { customElements } from "@mweb/engine";
const button = "_button_1vtc1_1";
const styles = {
  button
};
const { DappletPortal } = customElements;
const CounterButton = () => {
  const [counter, setCounter] = useState(0);
  const handleClick = () => {
    setCounter((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsxs("button", { className: styles.button, onClick: handleClick, children: [
    "Counter: ",
    counter
  ] });
};
function Dapplet() {
  return /* @__PURE__ */ jsx(
    DappletPortal,
    {
      target: {
        namespace: "bos.dapplets.testnet/parser/twitter",
        contextType: "post",
        if: { id: { not: null } },
        injectTo: "southPanel"
      },
      component: CounterButton
    }
  );
}
export {
  Dapplet as default
};


`

const interpreter = new Sval({
  ecmaVer: 'latest',
  sourceType: 'module',
  sandBox: true,
})

interpreter.import('react', React)
interpreter.import('react/jsx-runtime', ReactJsxRuntime)
interpreter.import('react-dom', ReactDOM)
interpreter.import('@mweb/engine', { customElements })

interpreter.run(code)

const Comp = interpreter.exports.default

interface SvalWidgetProps {}

export const SvalWidget: FC<SvalWidgetProps> = ({}) => {
  // const [Component, setComponent] = useState<React.ComponentType | null>(null)

  // useEffect(() => {

  //   setComponent(Comp)
  // }, [code])

  if (!Comp) return null

  return <Comp />
}
