import { createSupabaseClient } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-publish', '');
  const supabase = createSupabaseClient(req.headers.get('Authorization'));

  try {
    // POST /api-publish/section/:id - Publish a section
    if (req.method === 'POST' && path.startsWith('/section/')) {
      const id = path.replace('/section/', '');
      
      // Get current draft
      const { data: section, error: fetchError } = await supabase
        .from('sections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Copy draft to published
      const { data, error } = await supabase
        .from('sections')
        .update({
          content_published: section.content_draft,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Also publish related bullets
      const { data: bullets } = await supabase
        .from('section_bullets')
        .select('*')
        .eq('section_id', id)
        .is('deleted_at', null);
      
      if (bullets) {
        for (const bullet of bullets) {
          await supabase
            .from('section_bullets')
            .update({ 
              content_published: bullet.content_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', bullet.id);
        }
      }
      
      await supabase
        .from('section_bullets')
        .update({ 
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('section_id', id);
      
      return jsonResponse({ data, message: 'Section published successfully' });
    }

    // POST /api-publish/project/:id - Publish a project
    if (req.method === 'POST' && path.startsWith('/project/')) {
      const id = path.replace('/project/', '');
      
      // Get current draft
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Copy draft to published
      const { data, error } = await supabase
        .from('projects')
        .update({
          title_published: project.title_draft,
          description_published: project.description_draft,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Also publish related pages
      const { data: pages } = await supabase
        .from('project_pages')
        .select('*')
        .eq('project_id', id);
        
      if (pages) {
        for (const page of pages) {
          await supabase
            .from('project_pages')
            .update({ 
              content_published: page.content_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', page.id);
        }
      }
      
      return jsonResponse({ data, message: 'Project published successfully' });
    }

    // POST /api-publish/settings - Publish all settings
    if (req.method === 'POST' && path === '/settings') {
      // Publish site settings
      const { data: siteSettings } = await supabase.from('site_settings').select('*');
      if (siteSettings) {
        for (const setting of siteSettings) {
          await supabase
            .from('site_settings')
            .update({ 
              value_published: setting.value_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', setting.id);
        }
      }
      
      // Publish theme settings
      const { data: themeSettings } = await supabase.from('theme_settings').select('*');
      if (themeSettings) {
        for (const setting of themeSettings) {
          await supabase
            .from('theme_settings')
            .update({ 
              value_published: setting.value_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', setting.id);
        }
      }
      
      // Publish social links
      const { data: socialLinks } = await supabase.from('social_links').select('*').is('deleted_at', null);
      if (socialLinks) {
        for (const link of socialLinks) {
          await supabase
            .from('social_links')
            .update({ 
              url_published: link.url_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', link.id);
        }
      }
      
      // Publish resume
      const { data: resume } = await supabase.from('resume_assets').select('*').eq('is_active', true).single();
      if (resume) {
        await supabase
          .from('resume_assets')
          .update({ 
            file_url_published: resume.file_url_draft,
            external_url_published: resume.external_url_draft,
            is_published: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', resume.id);
      }
      
      return jsonResponse({ message: 'All settings published successfully' });
    }

    // POST /api-publish/all - Publish everything
    if (req.method === 'POST' && path === '/all') {
      // Publish all sections
      const { data: sections } = await supabase.from('sections').select('*').is('deleted_at', null);
      if (sections) {
        for (const section of sections) {
          await supabase
            .from('sections')
            .update({ 
              content_published: section.content_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', section.id);
        }
      }
      
      // Publish all bullets
      const { data: bullets } = await supabase.from('section_bullets').select('*').is('deleted_at', null);
      if (bullets) {
        for (const bullet of bullets) {
          await supabase
            .from('section_bullets')
            .update({ 
              content_published: bullet.content_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', bullet.id);
        }
      }
      
      // Publish all projects
      const { data: projects } = await supabase.from('projects').select('*').is('deleted_at', null);
      if (projects) {
        for (const project of projects) {
          await supabase
            .from('projects')
            .update({ 
              title_published: project.title_draft,
              description_published: project.description_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', project.id);
        }
      }
      
      // Publish all project pages
      const { data: pages } = await supabase.from('project_pages').select('*');
      if (pages) {
        for (const page of pages) {
          await supabase
            .from('project_pages')
            .update({ 
              content_published: page.content_draft,
              is_published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', page.id);
        }
      }
      
      // Also publish settings
      const settingsResponse = await fetch(new URL('/api-publish/settings', url.origin).href, {
        method: 'POST',
        headers: req.headers,
      });
      
      return jsonResponse({ message: 'All content published successfully' });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Publish API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
