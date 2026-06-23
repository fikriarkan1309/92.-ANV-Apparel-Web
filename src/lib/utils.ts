import { clsx } from 'clsx';
import { type ClassValue } from 'clsx';
import { PureComponent } from 'react';
import { mergeConfigs, extendTailwindMerge } from 'tailwind-merge';

// A lightweight cn function using clsx and tailwind-merge
const customTwMerge = extendTailwindMerge({});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
