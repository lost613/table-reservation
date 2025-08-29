import { Component } from 'solid-js';
import { Router } from '@solidjs/router';
import styles from './App.module.css';
import LoginPage from './pages/Login';
import ReservationPage from './pages/Reservation';
import { ToastContainer } from './utils/toast';

const routes = [
  {
    path: '/',
    component: LoginPage
  },
  {
    path: '/reservation',
    component: ReservationPage
  }
];

const App: Component = () => {
  return (
    <Router root={(props) => (
      <div class={styles.App}>
        {props.children}
        <ToastContainer />
      </div>
    )} >
      {routes}
    </Router>
  );
};

export default App;
