import { lazy, Suspense } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import LoadingComponent from "./components/common/Loadingomponent.jsx";

// Lazy load components
const MainApp = lazy(() => import("./components/layout/MainApp.jsx"));
const BubblePoppingGame = lazy(() =>
  import("./features/number_hunter/number_hunter.jsx")
);
const NUMBER_HUNTER_V2 = lazy(() =>
  import("./features/number_hunter_v2/number_hunter_v2.jsx")
);
const NotFound = lazy(() => import("./components/errors/NotFound.jsx"));

// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />, // redirect root -> /home
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<LoadingComponent message="Loading Game Hub..." />}>
        <MainApp />
      </Suspense>
    ),
  },
  {
    path: "/number-hunter",
    element: (
      <Suspense
        fallback={
          <LoadingComponent message="Loading Number Hunter Classic..." />
        }
      >
        <BubblePoppingGame />
      </Suspense>
    ),
  },
  {
    path: "/number-hunter-v2",
    element: (
      <Suspense
        fallback={
          <LoadingComponent message="Loading Number Hunter Deluxe..." />
        }
      >
        <NUMBER_HUNTER_V2 />
      </Suspense>
    ),
  },
  {
    path: "*", // fallback 404
    element: (
      <Suspense fallback={<LoadingComponent message="Loading Error Page..." />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
