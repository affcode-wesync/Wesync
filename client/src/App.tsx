import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Watch } from "./pages/Watch";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:roomId" element={<Watch />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
