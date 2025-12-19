import { createSupabaseClient, createSupabaseAdmin } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-auth', '');
  const supabase = createSupabaseClient(req.headers.get('Authorization'));

  try {
    // POST /api-auth/login - Login with email/password
    if (req.method === 'POST' && path === '/login') {
      const { email, password } = await req.json();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return jsonResponse({
        data: {
          user: data.user,
          session: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
          },
        }
      });
    }

    // POST /api-auth/logout - Logout
    if (req.method === 'POST' && path === '/logout') {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return jsonResponse({ message: 'Logged out successfully' });
    }

    // POST /api-auth/refresh - Refresh token
    if (req.method === 'POST' && path === '/refresh') {
      const { refresh_token } = await req.json();
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      });
      
      if (error) throw error;
      
      return jsonResponse({
        data: {
          session: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
          },
        }
      });
    }

    // GET /api-auth/me - Get current user
    if (req.method === 'GET' && path === '/me') {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return errorResponse('Not authenticated', 401);
      }
      
      // Check if user is admin
      const adminClient = createSupabaseAdmin();
      const { data: isAdmin } = await adminClient.rpc('is_admin_email', { 
        check_email: user.email 
      });
      
      return jsonResponse({
        data: {
          id: user.id,
          email: user.email,
          is_admin: isAdmin ?? false,
        }
      });
    }

    // POST /api-auth/forgot-password - Request password reset
    if (req.method === 'POST' && path === '/forgot-password') {
      const { email } = await req.json();
      const origin = req.headers.get('origin') || '';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/admin/reset-password`,
      });
      
      if (error) throw error;
      
      return jsonResponse({ message: 'Password reset email sent' });
    }

    // POST /api-auth/reset-password - Reset password with token
    if (req.method === 'POST' && path === '/reset-password') {
      const { password } = await req.json();
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return jsonResponse({ message: 'Password updated successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Auth API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
