/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CitizenApp } from './pages/CitizenApp';
import { ControlCenter } from './pages/ControlCenter';
import { Analytics } from './pages/Analytics';
import { Payments } from './pages/Payments';
import { Simulator } from './pages/Simulator';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/citizen" replace />} />
        <Route path="/citizen" element={<CitizenApp />} />
        <Route path="/control" element={<ControlCenter />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </Router>
  );
}

