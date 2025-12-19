/**
 * Core Types - Provider Agnostic
 * These types define the data structures used across the application.
 * They are designed to be portable and not tied to any specific backend.
 */

// Status for content items
export type ContentStatus = 'draft' | 'published';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Section types for the portfolio
export type SectionType = 
  | 'summary'
  | 'skills'
  | 'experience'
  | 'how-i-work'
  | 'projects'
  | 'contact';

// Section data structure
export interface Section extends BaseEntity {
  type: SectionType;
  title: string;
  body: string; // Rich text content (stored as portable format)
  highlights: string[]; // 3-5 bullet points
  isVisible: boolean;
  order: number;
}

// Project data structure
export interface Project extends BaseEntity {
  title: string;
  slug: string;
  shortSummary: string;
  fullDescription: string; // Rich text
  role: string;
  responsibilities: string[];
  techStack: string[];
  imageUrls: string[];
  isVisible: boolean;
  isFeatured: boolean;
}

// Social link
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  order: number;
}

// Site settings
export interface SiteSettings {
  id: string;
  siteTitle: string;
  metaDescription: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  resumeUrl?: string;
  accentColor: string;
  updatedAt: string;
}

// Theme preference
export type ThemeMode = 'light' | 'dark' | 'system';

// User session (admin)
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

// Auth state
export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Draft comparison
export interface DraftComparison<T> {
  draft: T;
  published: T | null;
  hasChanges: boolean;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Navigation item for public site
export interface NavItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
}
