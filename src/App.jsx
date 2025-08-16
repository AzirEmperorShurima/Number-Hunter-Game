import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Lazy load components
const MainApp = lazy(() => import("./components/layout/MainApp.jsx"));
const BubblePoppingGame = lazy(() =>
  import("./features/number_hunter/number_hunter.jsx")
);
const NUMBER_HUNTER_V2 = lazy(() =>
  import("./features/number_hunter_v2/number_hunter_v2.jsx")
);

// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/home",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <MainApp />
      </Suspense>
    ),
  },
  {
    path: "/number-hunter",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <BubblePoppingGame />
      </Suspense>
    ),
  },
  {
    path: "/number-hunter-v2",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <NUMBER_HUNTER_V2 />
      </Suspense>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
