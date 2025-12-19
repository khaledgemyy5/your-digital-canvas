import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Monitor, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPreset {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
}

const colorPresets: ColorPreset[] = [
  { name: 'Teal', hue: 172, saturation: 50, lightness: 35 },
  { name: 'Blue', hue: 220, saturation: 60, lightness: 50 },
  { name: 'Purple', hue: 270, saturation: 55, lightness: 50 },
  { name: 'Pink', hue: 330, saturation: 60, lightness: 50 },
  { name: 'Red', hue: 0, saturation: 65, lightness: 50 },
  { name: 'Orange', hue: 25, saturation: 70, lightness: 50 },
  { name: 'Green', hue: 142, saturation: 55, lightness: 40 },
  { name: 'Slate', hue: 215, saturation: 20, lightness: 45 },
];

const defaultAccent = { hue: 172, saturation: 50, lightness: 35 };

// Calculate relative luminance for WCAG contrast
function getLuminance(h: number, s: number, l: number): number {
  const hsl2rgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return [f(0), f(8), f(4)];
  };

  const [r, g, b] = hsl2rgb(h, s, l);
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGLevel(ratio: number): { level: string; color: string } {
  if (ratio >= 7) return { level: 'AAA', color: 'text-success' };
  if (ratio >= 4.5) return { level: 'AA', color: 'text-success' };
  if (ratio >= 3) return { level: 'AA Large', color: 'text-warning' };
  return { level: 'Fail', color: 'text-destructive' };
}

const Appearance = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [allowVisitorToggle, setAllowVisitorToggle] = useState(true);
  const [accentHue, setAccentHue] = useState(defaultAccent.hue);
  const [accentSaturation, setAccentSaturation] = useState(defaultAccent.saturation);
  const [accentLightness, setAccentLightness] = useState(defaultAccent.lightness);
  const [customHex, setCustomHex] = useState('');

  const selectedPreset = colorPresets.find(
    (p) => p.hue === accentHue && p.saturation === accentSaturation && p.lightness === accentLightness
  );

  // Calculate contrast ratios
  const contrastInfo = useMemo(() => {
    const accentLum = getLuminance(accentHue, accentSaturation, accentLightness);
    const whiteLum = getLuminance(0, 0, 100);
    const blackLum = getLuminance(0, 0, 0);
    
    const whiteRatio = getContrastRatio(accentLum, whiteLum);
    const blackRatio = getContrastRatio(accentLum, blackLum);

    return {
      onWhite: { ratio: whiteRatio, ...getWCAGLevel(whiteRatio) },
      onBlack: { ratio: blackRatio, ...getWCAGLevel(blackRatio) },
    };
  }, [accentHue, accentSaturation, accentLightness]);

  const handlePresetSelect = (preset: ColorPreset) => {
    setAccentHue(preset.hue);
    setAccentSaturation(preset.saturation);
    setAccentLightness(preset.lightness);
    updateCSSVariables(preset.hue, preset.saturation, preset.lightness);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const result = hexToHSL(hex);
      if (result) {
        setAccentHue(result.h);
        setAccentSaturation(result.s);
        setAccentLightness(result.l);
        updateCSSVariables(result.h, result.s, result.l);
      }
    }
  };

  const handleReset = () => {
    setAccentHue(defaultAccent.hue);
    setAccentSaturation(defaultAccent.saturation);
    setAccentLightness(defaultAccent.lightness);
    setCustomHex('');
    updateCSSVariables(defaultAccent.hue, defaultAccent.saturation, defaultAccent.lightness);
    toast({ description: 'Reset to default colors' });
  };

  const updateCSSVariables = (h: number, s: number, l: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--accent', `${h} ${s}% ${l}%`);
    root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
  };

  const hexToHSL = (hex: string): { h: number; s: number; l: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const currentHex = hslToHex(accentHue, accentSaturation, accentLightness);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Theme</CardTitle>
          <CardDescription>Choose how your site appears to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <option.icon className={cn('h-5 w-5', theme === option.value ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium', theme === option.value ? 'text-foreground' : 'text-muted-foreground')}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Allow visitor toggle</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Let visitors switch between light and dark mode
              </p>
            </div>
            <Switch checked={allowVisitorToggle} onCheckedChange={setAllowVisitorToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Accent Color</CardTitle>
              <CardDescription>Primary color used throughout your site</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Palettes */}
          <div className="space-y-3">
            <Label>Preset Palettes</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors',
                    selectedPreset?.name === preset.name
                      ? 'border-foreground'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <div
                    className="h-8 w-8 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: `hsl(${preset.hue} ${preset.saturation}% ${preset.lightness}%)` }}
                  />
                  <span className="text-xs text-muted-foreground">{preset.name}</span>
                  {selectedPreset?.name === preset.name && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Custom Color</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
              </div>
              <Input
                value={customHex || currentHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="w-28 font-mono text-sm"
              />
              <div
                className="h-10 flex-1 rounded-md border border-border"
                style={{ backgroundColor: `hsl(${accentHue} ${accentSaturation}% ${accentLightness}%)` }}
              />
            </div>
          </div>

          {/* WCAG Contrast */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Contrast Ratio (WCAG)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">On White</span>
                  <Badge variant="outline" className={cn('text-xs', contrastInfo.onWhite.color)}>
                    {contrastInfo.onWhite.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{
                      backgroundColor: `hsl(${accentHue} ${accentSaturation}% ${accentLightness}%)`,
                      borderColor: 'hsl(0 0% 90%)',
                    }}
                  />
                  <span className="text-sm font-mono">{contrastInfo.onWhite.ratio.toFixed(2)}:1</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">On Black</span>
                  <Badge variant="outline" className={cn('text-xs', contrastInfo.onBlack.color)}>
                    {contrastInfo.onBlack.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded"
                    style={{
                      backgroundColor: `hsl(${accentHue} ${accentSaturation}% ${accentLightness}%)`,
                      border: '1px solid hsl(0 0% 20%)',
                    }}
                  />
                  <span className="text-sm font-mono">{contrastInfo.onBlack.ratio.toFixed(2)}:1</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <p className="text-sm">
              This is regular text with an{' '}
              <a href="#" className="text-primary underline hover:text-primary/80">
                accent-colored link
              </a>{' '}
              to demonstrate the color.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appearance;
