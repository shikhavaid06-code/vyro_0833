'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatAppLayout from './components/ChatAppLayout';

export default function MainAppChatInterfacePage() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Auth guard - block URL sharing access
    const hasSession = localStorage.getItem('creo_session') || sessionStorage.getItem('creo_session');
    const user = localStorage.getItem('creo_current_user');
    if (!hasSession || !user) {
      router.replace('/sign-up-login-screen');
    }
  }, []);

  return <ChatAppLayout />;
}
