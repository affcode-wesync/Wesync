import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Watch } from "./pages/Watch";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:roomId" element={<Watch />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
