import React from 'react';
import { Cloud, Zap, ShieldCheck, Database, HardDrive, Globe } from 'lucide-react';

export interface CloudBadgeProps {
  type: 's3' | 'dynamodb' | 'lambda' | 'cloudfront' | 'firebase' | 'serverless';
  size?: 'sm' | 'md';
}

export const CloudBadge: React.FC<CloudBadgeProps> = ({ type, size = 'sm' }) => {
  const configs = {
    s3: {
      label: 'Amazon S3',
      icon: HardDrive,
      classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    dynamodb: {
      label: 'DynamoDB',
      icon: Database,
      classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    lambda: {
      label: 'AWS Lambda',
      icon: Zap,
      classes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    },
    cloudfront: {
      label: 'CloudFront CDN',
      icon: Globe,
      classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    firebase: {
      label: 'Firebase Auth',
      icon: ShieldCheck,
      classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    serverless: {
      label: 'Serverless',
      icon: Cloud,
      classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
  };

  const config = configs[type] || configs.serverless;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border ${config.classes} ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
