import { createBrowserRouter } from "react-router-dom";

import { AdminRoute } from "@/components/routes/admin-route";
import { ProtectedRoute } from "@/components/routes/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { AdminMoviesPage } from "@/pages/admin-movies-page";
import { AdminReviewsPage } from "@/pages/admin-reviews-page";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { MovieDetailPage } from "@/pages/movie-detail-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProfilePage } from "@/pages/profile-page";
import { RegisterPage } from "@/pages/register-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "movies/:id",
        element: <MovieDetailPage />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />
          }
        ]
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "admin/movies",
            element: <AdminMoviesPage />
          },
          {
            path: "admin/reviews",
            element: <AdminReviewsPage />
          }
        ]
      }
    ]
  }
]);

