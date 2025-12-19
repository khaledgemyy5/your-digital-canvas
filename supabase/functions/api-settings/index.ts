import { createSupabaseClient } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-settings', '');
  const supabase = createSupabaseClient(req.headers.get('Authorization'));

  try {
    // GET /api-settings/site - Get all site settings
    if (req.method === 'GET' && path === '/site') {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;
      
      // Transform to key-value object
      const settings = data.reduce((acc, item) => {
        acc[item.key] = { draft: item.value_draft, published: item.value_published, is_published: item.is_published };
        return acc;
      }, {} as Record<string, unknown>);
      
      return jsonResponse({ data: settings });
    }

    // PUT /api-settings/site - Update site settings
    if (req.method === 'PUT' && path === '/site') {
      const body = await req.json();
      const updates = Object.entries(body).map(async ([key, value]) => {
        const { error } = await supabase
          .from('site_settings')
          .update({ value_draft: value, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      });
      await Promise.all(updates);
      return jsonResponse({ success: true });
    }

    // GET /api-settings/theme - Get theme settings
    if (req.method === 'GET' && path === '/theme') {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*');

      if (error) throw error;
      
      const settings = data.reduce((acc, item) => {
        acc[item.key] = { draft: item.value_draft, published: item.value_published, is_published: item.is_published };
        return acc;
      }, {} as Record<string, unknown>);
      
      return jsonResponse({ data: settings });
    }

    // PUT /api-settings/theme - Update theme settings
    if (req.method === 'PUT' && path === '/theme') {
      const body = await req.json();
      const updates = Object.entries(body).map(async ([key, value]) => {
        const { error } = await supabase
          .from('theme_settings')
          .update({ value_draft: value, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      });
      await Promise.all(updates);
      return jsonResponse({ success: true });
    }

    // GET /api-settings/social - Get social links
    if (req.method === 'GET' && path === '/social') {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return jsonResponse({ data });
    }

    // POST /api-settings/social - Create social link
    if (req.method === 'POST' && path === '/social') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('social_links')
        .insert({
          platform: body.platform,
          url_draft: body.url,
          icon: body.icon,
          is_visible: body.is_visible ?? true,
          display_order: body.display_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data }, 201);
    }

    // PUT /api-settings/social/:id - Update social link
    if (req.method === 'PUT' && path.startsWith('/social/')) {
      const id = path.replace('/social/', '');
      const body = await req.json();
      const { data, error } = await supabase
        .from('social_links')
        .update({
          platform: body.platform,
          url_draft: body.url,
          icon: body.icon,
          is_visible: body.is_visible,
          display_order: body.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // DELETE /api-settings/social/:id - Soft delete social link
    if (req.method === 'DELETE' && path.startsWith('/social/')) {
      const id = path.replace('/social/', '');
      const { data, error } = await supabase
        .from('social_links')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // GET /api-settings/resume - Get resume asset
    if (req.method === 'GET' && path === '/resume') {
      const { data, error } = await supabase
        .from('resume_assets')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return jsonResponse({ data });
    }

    // PUT /api-settings/resume - Update resume asset
    if (req.method === 'PUT' && path === '/resume') {
      const body = await req.json();
      
      // First, set all existing to inactive
      await supabase.from('resume_assets').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Then upsert the new one
      const { data, error } = await supabase
        .from('resume_assets')
        .upsert({
          id: body.id,
          filename: body.filename,
          file_url_draft: body.file_url,
          external_url_draft: body.external_url,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Settings API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
