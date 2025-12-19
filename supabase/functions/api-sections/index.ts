import { createSupabaseClient } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-sections', '');
  const supabase = createSupabaseClient(req.headers.get('Authorization'));

  try {
    // GET /api-sections - List all sections
    if (req.method === 'GET' && !path.slice(1)) {
      const { data, error } = await supabase
        .from('sections')
        .select('*, section_bullets(*)')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return jsonResponse({ data });
    }

    // GET /api-sections/:id - Get single section
    if (req.method === 'GET' && path.slice(1)) {
      const id = path.slice(1);
      const { data, error } = await supabase
        .from('sections')
        .select('*, section_bullets(*)')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // POST /api-sections - Create section
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('sections')
        .insert({
          slug: body.slug,
          title: body.title,
          subtitle: body.subtitle,
          content_draft: body.content_draft || {},
          is_visible: body.is_visible ?? true,
          display_order: body.display_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data }, 201);
    }

    // PUT /api-sections/:id - Update section
    if (req.method === 'PUT' && path.slice(1)) {
      const id = path.slice(1);
      const body = await req.json();
      const { data, error } = await supabase
        .from('sections')
        .update({
          title: body.title,
          subtitle: body.subtitle,
          content_draft: body.content_draft,
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

    // DELETE /api-sections/:id - Soft delete section
    if (req.method === 'DELETE' && path.slice(1)) {
      const id = path.slice(1);
      const { data, error } = await supabase
        .from('sections')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    // PATCH /api-sections/reorder - Reorder sections
    if (req.method === 'PATCH' && path === '/reorder') {
      const body = await req.json();
      const updates = body.items.map((item: { id: string; display_order: number }) =>
        supabase
          .from('sections')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      return jsonResponse({ success: true });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Sections API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
