import { useState } from 'react';
import { Send, Mail, MapPin, Calendar } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@example.com' },
  { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
  { icon: Calendar, label: 'Availability', value: 'Open to opportunities' },
];

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  return (
    <SectionWrapper id="contact" variant="alternate">
      <div className="max-w-4xl mx-auto">
        <SectionHeader 
          title="Get in Touch" 
          subtitle="Have a project in mind or just want to chat? I'd love to hear from you."
          centered
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Info */}
          <div className="animate-fade-in-up">
            <h3 className="text-lg font-serif text-foreground mb-6">Contact Information</h3>
            
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

            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Prefer a quick chat?</p>
              <p className="text-foreground">
                Schedule a 15-minute call to discuss your project.
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Book a Call
              </Button>
            </div>
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
