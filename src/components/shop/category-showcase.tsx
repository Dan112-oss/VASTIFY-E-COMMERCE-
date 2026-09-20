'use client';

import { LayerStack, Card } from '@/components/ui/layer-stack';

// Placeholder categories - later these will come from Supabase
const categories = [
  { name: 'Fashion', blurb: 'Clothing, shoes and accessories' },
  { name: 'Electronics', blurb: 'Phones, audio and smart gadgets' },
  { name: 'Home & Living', blurb: 'Furniture, decor and kitchen' },
  { name: 'Beauty', blurb: 'Skincare, fragrance and grooming' },
  { name: 'Sports', blurb: 'Gear and wear for every game' },
];

export function CategoryShowcase() {
  return (
    <LayerStack cardWidth={300} stageHeight={320} lastCardFullWidth={false}>
      {categories.map((cat, i) => (
        <Card
          key={cat.name}
          className='flex flex-col justify-between border border-border bg-linear-to-br from-card to-secondary p-6 text-left'
        >
          <span className='font-display text-5xl font-semibold text-primary/70'>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className='space-y-2'>
            <h3 className='font-display text-2xl font-semibold'>{cat.name}</h3>
            <p className='text-sm text-muted-foreground'>{cat.blurb}</p>
            <span className='inline-block pt-2 text-sm font-medium text-primary'>
              Explore &rarr;
            </span>
          </div>
        </Card>
      ))}
    </LayerStack>
  );
}
