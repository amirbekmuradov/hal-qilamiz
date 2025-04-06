import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import CreateIssueModal from '../issues/CreateIssueModal';
import Notification from '../ui/Notification';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Hal Qilamiz - Citizen Issue Reporting Platform',
  description = 'A platform for citizens of Uzbekistan to report and track community issues until resolution.',
}) => {
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const modals = useSelector((state: RootState) => state.ui.modals);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            autoClose={notification.autoClose}
            duration={notification.duration}
          />
        ))}
      </div>

      {/* Modals */}
      {modals.login && <LoginModal />}
      {modals.register && <RegisterModal />}
      {modals.createIssue && <CreateIssueModal />}
    </div>
  );
};

export default Layout;