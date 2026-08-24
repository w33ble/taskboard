import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const Board = lazy(() => import("./pages/Board"));
const Projects = lazy(() => import("./pages/Projects"));
const Teams = lazy(() => import("./pages/Teams"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Labels = lazy(() => import("./pages/Labels"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Suspense fallback={null}><Board /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={null}><Projects /></Suspense>} />
          <Route path="teams" element={<Suspense fallback={null}><Teams /></Suspense>} />
          <Route path="tickets" element={<Suspense fallback={null}><Tickets /></Suspense>} />
          <Route path="labels" element={<Suspense fallback={null}><Labels /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
