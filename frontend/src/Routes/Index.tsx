import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { authProtectedRoutes, publicRoutes } from './allRoutes';
import SimpleLayout from 'Layout/SimpleLayout';
import NonAuthLayout from "Layout/NonLayout"
import AuthProtected from './AuthProtected';
import NotFound from '../pages/NotFound';

const RouteIndex = () => {
  return (
    <React.Fragment>
      <Routes>
        {authProtectedRoutes.map((route: any, idx: number) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <AuthProtected>
                <SimpleLayout>
                  <route.component />
                </SimpleLayout>
              </AuthProtected>
            }
          />
        ))}
        {publicRoutes.map((route: any, idx: number) => (
          <Route
            path={route.path}
            key={idx}
            element={
              <NonAuthLayout>
                <route.component />
              </NonAuthLayout>
            } />
        ))}
        
        {/* Ruta 404 - Debe estar al final */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Fragment>
  );
};

export default RouteIndex;
