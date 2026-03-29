import { setNostrWasm } from "nostr-tools/wasm";
import { initNostrWasm } from "nostr-wasm";
import React from "react";
import ReactDOM from "react-dom/client";
import { DIProvider } from "./presentation/context/diContext";
import App from "./App";
import "./style.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	await initNostrWasm().then(setNostrWasm);

	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<DIProvider>
				<App />
			</DIProvider>
		</React.StrictMode>,
	);
} else {
	throw new Error("Could not find root element");
}
