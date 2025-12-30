import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PasteView from "./pages/PasteView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<PasteView />} />
      </Routes>
    </Router>
  );
}

export default App;
