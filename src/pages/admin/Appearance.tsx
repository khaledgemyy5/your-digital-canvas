import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Appearance: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Appearance</CardTitle>
          <CardDescription>Customize the look and feel of your site.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Appearance settings coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appearance;
