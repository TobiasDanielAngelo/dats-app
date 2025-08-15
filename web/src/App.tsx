import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { LoginView } from "./components/core/LoginView";
import { MainView } from "./components/core/MainView";
import { createStore, StoreContext } from "./components/core/Store";
function App() {
  const store = createStore();

  return (
    <div>
      <StoreContext.Provider value={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<MainView />} />
            <Route path="/login" element={<LoginView />} />
          </Routes>
        </BrowserRouter>
      </StoreContext.Provider>
    </div>
  );
}

export default App;
