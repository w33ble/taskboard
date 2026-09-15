import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import Layout from "./components/Layout";
import { readLastBoardProject } from "./lib/lastBoard";

const Board = lazy(() => import("./pages/Board"));
const Projects = lazy(() => import("./pages/Projects"));
const Teams = lazy(() => import("./pages/Teams"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Labels = lazy(() => import("./pages/Labels"));

/**
 * Restores the last board the user opened when the URL does not name one.
 * The redirect keeps the URL as the single source of truth, so the selection
 * stays shareable and survives reloads, bookmarks, and the browser back button.
 */
function BoardRoute() {
  const [searchParams] = useSearchParams();
  const remembered = readLastBoardProject();

  if (!searchParams.has("project") && remembered) {
    return (
      <Navigate to={`/?project=${encodeURIComponent(remembered)}`} replace />
    );
  }

  return (
    <Suspense fallback={null}>
      <Board />
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BoardRoute />} />
          <Route
            path="projects"
            element={
              <Suspense fallback={null}>
                <Projects />
              </Suspense>
            }
          />
          <Route
            path="teams"
            element={
              <Suspense fallback={null}>
                <Teams />
              </Suspense>
            }
          />
          <Route
            path="tickets"
            element={
              <Suspense fallback={null}>
                <Tickets />
              </Suspense>
            }
          />
          <Route
            path="labels"
            element={
              <Suspense fallback={null}>
                <Labels />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
