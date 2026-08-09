'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { supabase } from '@/lib/supabase';

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
    );
  }
} else if (!apiHost) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured',
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: apiHost,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  });
}

export default function PostHogInit() {
  useEffect(() => {
    if (!projectToken || !apiHost) return;

    const identifyAuthenticatedUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user?.id) return;

      const name = typeof user.user_metadata.name === 'string' ? user.user_metadata.name : undefined;
      posthog.identify(user.id, {
        ...(user.email ? { email: user.email } : {}),
        ...(name ? { name } : {}),
      });
    };

    void identifyAuthenticatedUser();
  }, []);

  return null;
}
