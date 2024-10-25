import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Leaderboard from "./components/Leaderboard";
import Store from "./components/Store";
import Auth from "./components/Auth";
import Levels from "./components/Levels";
import Level1 from "./components/levels/Level1";
import Level2 from "./components/levels/Level2";
import Level3 from "./components/levels/Level3";
import Level4 from "./components/levels/Level4";
import Level5 from "./components/levels/Level5";
import Level6 from "./components/levels/Level6";
import Level7 from "./components/levels/Level7";
import Level8 from "./components/levels/Level8";
import { useAuthCheck } from './hooks/useAuthCheck';
import { createContext } from "react";

export const UserContext = createContext()

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, userId } = useAuthCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
}

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute><Levels /></ProtectedRoute>
    },
    {
      path: "/auth",
      element: <Auth />
    },
    {
      path: "/leaderboard",
      element: <ProtectedRoute><Leaderboard /></ProtectedRoute>
    },
    {
      path: "/store",
      element: <ProtectedRoute><Store /></ProtectedRoute>
    },
    {
      path: "/level1",
      element: <ProtectedRoute><Level1 /></ProtectedRoute>
    },
    {
      path: "/level2",
      element: <ProtectedRoute><Level2 /></ProtectedRoute>
    },
    {
      path: "/level3",
      element: <Level3 />
    },
    {
      path: "/level4",
      element: <ProtectedRoute><Level4 /></ProtectedRoute>
    },
    {
      path: "/level5",
      element: <ProtectedRoute><Level5 /></ProtectedRoute>
    },
    {
      path: "/level6",
      element: <ProtectedRoute><Level6 /></ProtectedRoute>
    },
    {
      path: "/level7",
      element: <ProtectedRoute><Level7 /></ProtectedRoute>
    },
    {
      path: "/level8",
      element: <ProtectedRoute><Level8 /></ProtectedRoute>
    }
  ]);

  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <RouterProvider router={router} />
    </>

  )
}

export default App;
