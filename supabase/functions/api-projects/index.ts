import { createSupabaseClient } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-projects', '');
  const supabase = createSupabaseClient(req.headers.get('Authorization'));

  try {
    // GET /api-projects - List all projects
    if (req.method === 'GET' && !path.slice(1)) {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_pages(*)')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return jsonResponse({ data });
    }

    // GET /api-projects/:id - Get single project
    if (req.method === 'GET' && path.slice(1)) {
      const id = path.slice(1);
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_pages(*)')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // POST /api-projects - Create project
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('projects')
        .insert({
          slug: body.slug,
          title_draft: body.title,
          description_draft: body.description,
          technologies: body.technologies || [],
          thumbnail_url: body.thumbnail_url,
          github_url: body.github_url,
          external_url: body.external_url,
          is_featured: body.is_featured ?? false,
          is_visible: body.is_visible ?? true,
          display_order: body.display_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data }, 201);
    }

    // PUT /api-projects/:id - Update project
    if (req.method === 'PUT' && path.slice(1)) {
      const id = path.slice(1);
      const body = await req.json();
      const { data, error } = await supabase
        .from('projects')
        .update({
          title_draft: body.title,
          description_draft: body.description,
          technologies: body.technologies,
          thumbnail_url: body.thumbnail_url,
          github_url: body.github_url,
          external_url: body.external_url,
          is_featured: body.is_featured,
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

    // DELETE /api-projects/:id - Soft delete project
    if (req.method === 'DELETE' && path.slice(1)) {
      const id = path.slice(1);
      const { data, error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // PATCH /api-projects/reorder - Reorder projects
    if (req.method === 'PATCH' && path === '/reorder') {
      const body = await req.json();
      const updates = body.items.map((item: { id: string; display_order: number }) =>
        supabase
          .from('projects')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      return jsonResponse({ success: true });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Projects API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
