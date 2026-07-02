/**
 * DocumentsSection Component
 * Displays client documents with download capability
 * Integrates with tRPC portal.myDocuments procedure
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Download, CircleAlert as AlertCircle, FileArchive } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentsSectionProps {
  className?: string;
}

export function DocumentsSection({ className = "" }: DocumentsSectionProps) {
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  // Fetch client documents
  const { data: documents, isLoading: docsLoading, error: docsError } = trpc.portal.myDocuments.useQuery();

  // Fetch policy documents if a policy is selected
  const { data: policyDocs, isLoading: policyDocsLoading } = trpc.portal.policyDocuments.useQuery(
    { policyId: selectedPolicyId! },
    { enabled: selectedPolicyId !== null }
  );

  const displayDocs = selectedPolicyId ? policyDocs : documents;
  const isLoading = selectedPolicyId ? policyDocsLoading : docsLoading;

  // Get unique policies from documents
  const uniquePolicies = documents
    ? Array.from(new Map(documents.map((doc) => [doc.policyId, doc.policyNumber])).entries()).map(
        ([id, number]) => ({ id, number })
      )
    : [];

  const handleDownload = (documentId: number, fileName: string) => {
    // TODO: Implement document download with signed URL
    console.log(`Downloading document ${documentId}: ${fileName}`);
  };

  if (docsError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load documents. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="w-5 h-5" />
          Documents
        </CardTitle>
        <CardDescription>View and download your policy documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Policy Filter */}
        {uniquePolicies.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPolicyId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPolicyId(null)}
            >
              All Policies
            </Button>
            {uniquePolicies.map((policy) => (
              <Button
                key={policy.id}
                variant={selectedPolicyId === policy.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPolicyId(policy.id)}
              >
                {policy.number}
              </Button>
            ))}
          </div>
        )}

        {/* Documents List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !displayDocs || displayDocs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon: Upload */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" disabled>
            Upload Document (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
