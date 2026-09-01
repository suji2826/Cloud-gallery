import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Zap,
  HardDrive,
  Database,
  Globe,
  ArrowRight,
  Server,
  RefreshCw,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { photoService } from '../../services/photoService';
import { CloudArchitectureStatus } from '../../types';
import { AWS_CONFIG } from '../../config/aws-config';

export const CloudArchitectureModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<CloudArchitectureStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCloudStatus = async () => {
    setLoading(true);
    try {
      const data = await photoService.getCloudStatus();
      setStatus(data);
    } catch {
      // Set default fallback info
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudStatus();
    }
  }, [isOpen]);

  const flowSteps = [
    {
      step: 1,
      title: '1. User & Cognito Auth',
      desc: 'Browser validates JWT Token with Amazon Cognito User Pools before any API Gateway request.',
      icon: ShieldCheck,
      service: 'AWS Cognito',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      step: 2,
      title: '2. API Gateway & Lambda',
      desc: 'Requests pre-signed PUT URL from Lambda function getUploadUrl using AWS SDK v3.',
      icon: Zap,
      service: 'API Gateway + Lambda',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      step: 3,
      title: '3. Direct S3 Binary PUT',
      desc: 'Client browser PUTs original binary directly into Private S3 Bucket (cloudgallery-originals).',
      icon: HardDrive,
      service: 'Amazon S3 (Originals)',
      color: 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      step: 4,
      title: '4. S3 Trigger & Sharp Lambda',
      desc: 'S3 ObjectCreated event invokes Thumbnail Generator Lambda to produce 800px web thumbnail.',
      icon: Server,
      service: 'AWS Lambda (Sharp)',
      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      step: 5,
      title: '5. DynamoDB Metadata Store',
      desc: 'Photo record (userId, photoId, size, tags, timestamps) saved to single-table DynamoDB.',
      icon: Database,
      service: 'Amazon DynamoDB',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      step: 6,
      title: '6. CloudFront CDN Delivery',
      desc: 'Thumbnail delivered at edge via CloudFront CDN. Private originals stay protected behind pre-signed GET URLs.',
      icon: Globe,
      service: 'Amazon CloudFront',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AWS Serverless Architecture Inspector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end cloud pipeline & real resource configuration
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Architecture Status Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                Active AWS Region: <span className="font-mono text-emerald-400">{AWS_CONFIG.region}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Serverless runtime active with DynamoDB single-table & dual-bucket S3 tier
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchCloudStatus}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-white border-slate-700 hover:bg-slate-800"
          >
            Refresh Diagnostics
          </Button>
        </div>

        {/* Interactive Architecture Step-by-Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {flowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2 relative overflow-hidden group hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${step.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{step.service}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">#{step.step}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">{step.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Resource Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Configured Cloud Infrastructure Resources</span>
            <span className="text-[10px] font-mono font-normal text-slate-400">AWS SDK v3 Ready</span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Original Photos Bucket (Private)</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {AWS_CONFIG.s3.originalsBucket}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Thumbnails Bucket</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {AWS_CONFIG.s3.thumbnailsBucket}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">DynamoDB Metadata Table</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {AWS_CONFIG.dynamodb.tableName} (PK: userId, SK: photoId)
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Cognito User Pool ID</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {AWS_CONFIG.cognito.userPoolId}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">CloudFront CDN Edge</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {AWS_CONFIG.cloudFront.distributionDomain}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};
