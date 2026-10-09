import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/palette.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "./App.css";
import { Suspense } from "react";
import ErrorBoundary from "./error/ErrorBoundary";
import Loader from "./components/Loader";

const primeReactConfig = {
  hideOverlaysOnDocumentScrolling: true,
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ErrorBoundary>
    <Suspense fallback={<Loader isLoading={true} />}>
      <PrimeReactProvider value={primeReactConfig}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </PrimeReactProvider>
    </Suspense>
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
