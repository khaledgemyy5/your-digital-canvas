import { createSupabaseClient, createSupabaseAdmin } from '../_shared/supabase.ts';
import { jsonResponse, errorResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname.replace('/api-preview', '');
  const mode = url.searchParams.get('mode') || 'draft'; // 'draft' or 'published'
  
  // Use admin client for preview to bypass RLS
  const supabase = createSupabaseAdmin();

  try {
    // GET /api-preview/site - Get full site data for preview
    if (req.method === 'GET' && path === '/site') {
      const usePublished = mode === 'published';
      
      // Get sections
      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });
      
      if (sectionsError) throw sectionsError;
      
      // Get section bullets
      const { data: bullets, error: bulletsError } = await supabase
        .from('section_bullets')
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });
      
      if (bulletsError) throw bulletsError;
      
      // Get projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });
      
      if (projectsError) throw projectsError;
      
      // Get site settings
      const { data: siteSettings, error: siteError } = await supabase
        .from('site_settings')
        .select('*');
      
      if (siteError) throw siteError;
      
      // Get theme settings
      const { data: themeSettings, error: themeError } = await supabase
        .from('theme_settings')
        .select('*');
      
      if (themeError) throw themeError;
      
      // Get social links
      const { data: socialLinks, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });
      
      if (socialError) throw socialError;
      
      // Get resume
      const { data: resume, error: resumeError } = await supabase
        .from('resume_assets')
        .select('*')
        .eq('is_active', true)
        .single();
      
      // Transform data based on mode
      const transformedSections = sections?.map(section => ({
        ...section,
        content: usePublished ? section.content_published : section.content_draft,
        bullets: bullets?.filter(b => b.section_id === section.id).map(b => ({
          ...b,
          content: usePublished ? b.content_published : b.content_draft,
        })),
      }));
      
      const transformedProjects = projects?.map(project => ({
        ...project,
        title: usePublished ? project.title_published : project.title_draft,
        description: usePublished ? project.description_published : project.description_draft,
      }));
      
      const transformedSiteSettings = siteSettings?.reduce((acc, item) => {
        acc[item.key] = usePublished ? item.value_published : item.value_draft;
        return acc;
      }, {} as Record<string, unknown>);
      
      const transformedThemeSettings = themeSettings?.reduce((acc, item) => {
        acc[item.key] = usePublished ? item.value_published : item.value_draft;
        return acc;
      }, {} as Record<string, unknown>);
      
      const transformedSocialLinks = socialLinks?.map(link => ({
        ...link,
        url: usePublished ? link.url_published : link.url_draft,
      }));
      
      const transformedResume = resume ? {
        ...resume,
        file_url: usePublished ? resume.file_url_published : resume.file_url_draft,
        external_url: usePublished ? resume.external_url_published : resume.external_url_draft,
      } : null;
      
      return jsonResponse({
        data: {
          sections: transformedSections,
          projects: transformedProjects,
          siteSettings: transformedSiteSettings,
          themeSettings: transformedThemeSettings,
          socialLinks: transformedSocialLinks,
          resume: transformedResume,
        }
      });
    }

    // GET /api-preview/section/:id - Get single section for preview
    if (req.method === 'GET' && path.startsWith('/section/')) {
      const id = path.replace('/section/', '');
      const usePublished = mode === 'published';
      
      const { data: section, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const { data: bullets } = await supabase
        .from('section_bullets')
        .select('*')
        .eq('section_id', id)
        .is('deleted_at', null)
        .order('display_order', { ascending: true });
      
      return jsonResponse({
        data: {
          ...section,
          content: usePublished ? section.content_published : section.content_draft,
          bullets: bullets?.map(b => ({
            ...b,
            content: usePublished ? b.content_published : b.content_draft,
          })),
        }
      });
    }

    // GET /api-preview/project/:id - Get single project for preview
    if (req.method === 'GET' && path.startsWith('/project/')) {
      const id = path.replace('/project/', '');
      const usePublished = mode === 'published';
      
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, project_pages(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return jsonResponse({
        data: {
          ...project,
          title: usePublished ? project.title_published : project.title_draft,
          description: usePublished ? project.description_published : project.description_draft,
          pages: project.project_pages?.map((page: any) => ({
            ...page,
            content: usePublished ? page.content_published : page.content_draft,
          })),
        }
      });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error: unknown) {
    console.error('Preview API error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
