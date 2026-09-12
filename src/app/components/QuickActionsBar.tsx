'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, MessageCircle, FileBarChart, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickActionsBar() {
  const handleGenerateReport = () => {
    // Backend integration point: POST /api/admin/reports/sales — generates and streams PDF
    toast?.success('Sales report generated', {
      description: 'August 2026 report ready to download.',
      action: {
        label: 'Download',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/admin/products/new"
        className="btn-primary text-sm"
      >
        <Plus size={16} />
        Add New Product
      </Link>
      <Link
        href="/admin/marketing"
        className="btn-secondary text-sm"
      >
        <MessageCircle size={16} />
        WhatsApp Campaign
      </Link>
      <button
        onClick={handleGenerateReport}
        className="btn-secondary text-sm"
      >
        <FileBarChart size={16} />
        Generate Report
      </button>
      <div className="flex-1" />
      <span className="text-xs text-muted-foreground">
        Last synced: 12:38 PM
      </span>
    </div>
  );
}