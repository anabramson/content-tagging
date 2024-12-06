import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface ContentTaggingTableProps {
  formData: {
    title: string;
    description: string;
    distributionChannel: string;
    accessLevel: string;
    contentType: string;
    writtenFormat: string;
    fileType: string;
    visualFormat: string;
    interactiveFormat: string;
    tags: string[];
  };
}

const ContentTaggingTable = ({ formData }: ContentTaggingTableProps) => {
  const [copied, setCopied] = useState(false);

  const categories = [
    { key: 'distributionChannel', label: 'Distribution Channel' },
    { key: 'accessLevel', label: 'Access Level' },
    { key: 'contentType', label: 'Content Type' },
    { key: 'writtenFormat', label: 'Written Format' },
    { key: 'fileType', label: 'File Type' },
    { key: 'visualFormat', label: 'Visual Format' },
    { key: 'interactiveFormat', label: 'Interactive Format' }
  ];

  const generateCopyableContent = () => {
    const rows = [
      ['Title:', formData.title],
      ['Description:', formData.description],
      [''],  // Empty line for spacing
      ['Category', 'Value'],  // Headers
      ...categories.map(cat => [
        cat.label,
        formData[cat.key as keyof typeof formData] || '-'
      ])
    ];

    return rows.map(row => row.join('\t')).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCopyableContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Tags</h3>
        <Button 
          onClick={handleCopy}
          variant="outline"
          className="ml-auto"
        >
          {copied ? "Copied!" : "Copy All"}
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/4">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Title
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 break-words">
                  {formData.title}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Description
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-wrap break-words">
                  {formData.description}
                </td>
              </tr>
              {categories.map(cat => (
                <tr key={cat.key}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {cat.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 break-words">
                    {formData[cat.key as keyof typeof formData] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentTaggingTable;