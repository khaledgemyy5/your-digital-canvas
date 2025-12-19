-- =============================================
-- PORTFOLIO CMS DATABASE SCHEMA
-- =============================================

-- SECTIONS TABLE
-- Stores portfolio sections (Summary, Skills, Experience, etc.)
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content_draft JSONB DEFAULT '{}'::jsonb,
  content_published JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SECTION BULLETS TABLE
-- Stores bullet points/highlights for sections
CREATE TABLE public.section_bullets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  content_draft TEXT,
  content_published TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PROJECTS TABLE
-- Stores portfolio projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_draft TEXT NOT NULL,
  title_published TEXT,
  description_draft TEXT,
  description_published TEXT,
  thumbnail_url TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  external_url TEXT,
  github_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PROJECT PAGES TABLE
-- Stores detailed project page content
CREATE TABLE public.project_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content_draft JSONB DEFAULT '{}'::jsonb,
  content_published JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SITE SETTINGS TABLE
-- Stores global site configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_draft JSONB,
  value_published JSONB,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- THEME SETTINGS TABLE
-- Stores theme/appearance configuration
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_draft JSONB,
  value_published JSONB,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SOCIAL LINKS TABLE
-- Stores social media links
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url_draft TEXT,
  url_published TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RESUME ASSETS TABLE
-- Stores resume file references
CREATE TABLE public.resume_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url_draft TEXT,
  file_url_published TEXT,
  external_url_draft TEXT,
  external_url_published TEXT,
  filename TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_assets ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Published content is publicly readable
CREATE POLICY "Public can read published sections"
  ON public.sections FOR SELECT
  USING (is_published = true AND is_visible = true AND deleted_at IS NULL);

CREATE POLICY "Public can read published section bullets"
  ON public.section_bullets FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Public can read published projects"
  ON public.projects FOR SELECT
  USING (is_published = true AND is_visible = true AND deleted_at IS NULL);

CREATE POLICY "Public can read published project pages"
  ON public.project_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can read published site settings"
  ON public.site_settings FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can read published theme settings"
  ON public.theme_settings FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can read published social links"
  ON public.social_links FOR SELECT
  USING (is_published = true AND is_visible = true AND deleted_at IS NULL);

CREATE POLICY "Public can read published resume"
  ON public.resume_assets FOR SELECT
  USING (is_published = true AND is_active = true);

-- ADMIN FULL ACCESS: Admins can do everything
CREATE POLICY "Admins can manage sections"
  ON public.sections FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage section bullets"
  ON public.section_bullets FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage project pages"
  ON public.project_pages FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage theme settings"
  ON public.theme_settings FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage social links"
  ON public.social_links FOR ALL
  USING (public.is_admin_email(auth.email()));

CREATE POLICY "Admins can manage resume assets"
  ON public.resume_assets FOR ALL
  USING (public.is_admin_email(auth.email()));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_sections_slug ON public.sections(slug);
CREATE INDEX idx_sections_order ON public.sections(display_order);
CREATE INDEX idx_section_bullets_section ON public.section_bullets(section_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_order ON public.projects(display_order);
CREATE INDEX idx_project_pages_project ON public.project_pages(project_id);
CREATE INDEX idx_social_links_order ON public.social_links(display_order);