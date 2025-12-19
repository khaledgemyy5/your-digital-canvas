import { useState } from 'react';
import { Send, Mail, MapPin, Calendar, Github, Linkedin, Twitter } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PreviewSocialLink } from '@/services/api/preview';
import { LucideIcon } from 'lucide-react';

interface ContactSectionProps {
  title: string;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  socialLinks?: PreviewSocialLink[];
}

// Map platform names to icons
const platformIcons: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
};

export function ContactSection({ title, subtitle, content, socialLinks = [] }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Extract content fields
  const email = (content?.email as string) || '';
  const location = (content?.location as string) || '';
  const availability = (content?.availability as string) || '';
  const callToAction = (content?.call_to_action as string) || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Message sent!',
      description: 'Thank you for reaching out. I\'ll get back to you soon.',
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    email && { icon: Mail, label: 'Email', value: email },
    location && { icon: MapPin, label: 'Location', value: location },
    availability && { icon: Calendar, label: 'Availability', value: availability },
  ].filter(Boolean) as { icon: LucideIcon; label: string; value: string }[];

  return (
    <SectionWrapper id="contact" variant="alternate">
      <div className="max-w-4xl mx-auto">
        <SectionHeader 
          title={title} 
          subtitle={subtitle || undefined}
          centered
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Info */}
          <div className="animate-fade-in-up">
            <h3 className="text-lg font-serif text-foreground mb-6">Contact Information</h3>
            
            {contactInfo.length > 0 && (
              <ul className="space-y-6 mb-8">
                {contactInfo.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-foreground">{item.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mb-8">
                {socialLinks.map((link) => {
                  const IconComponent = platformIcons[link.platform.toLowerCase()] || Mail;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                      aria-label={link.platform}
                    >
                      <IconComponent className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </a>
                  );
                })}
              </div>
            )}

            {callToAction && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Prefer a quick chat?</p>
                <p className="text-foreground">{callToAction}</p>
                <Button variant="outline" className="mt-4" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Call
                </Button>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <form 
            onSubmit={handleSubmit}
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell me about your project..."
                rows={5}
                required
                className="bg-background resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  Send Message
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </SectionWrapper>
  );
}
