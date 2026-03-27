import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initNostrWasm } from "nostr-wasm";
import { setNostrWasm } from "nostr-tools/wasm";
import "./style.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	await initNostrWasm().then(setNostrWasm);

	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
} else {
	throw new Error("Could not find root element");
}
