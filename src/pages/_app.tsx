import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { store } from '../store';
import { setUser } from '../store/slices/authSlice';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      store.dispatch(setUser(user));
      
      // If user is on auth pages but already logged in, redirect to home
      if (user && (router.pathname === '/auth/login' || router.pathname === '/auth/register')) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;