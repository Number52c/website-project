/**
 * PaymentsSection Component
 * Displays payment methods and payment history
 * Integrates with tRPC portal.myPaymentMethods and portal.myPaymentHistory procedures
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, DollarSign, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clock, Circle as XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentsSectionProps {
  className?: string;
}

export function PaymentsSection({ className = "" }: PaymentsSectionProps) {
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading, error: methodsError } = trpc.portal.myPaymentMethods.useQuery();

  // Fetch default payment method
  const { data: defaultMethod } = trpc.portal.defaultPaymentMethod.useQuery();

  // Fetch payment history
  const { data: paymentHistory, isLoading: historyLoading, error: historyError } = trpc.portal.myPaymentHistory.useQuery(
    { limit: 10 }
  );

  // Fetch policy payment history if selected
  const { data: policyHistory, isLoading: policyHistoryLoading } = trpc.portal.policyPaymentHistory.useQuery(
    { policyId: selectedPolicyId!, limit: 10 },
    { enabled: selectedPolicyId !== null }
  );

  // Fetch payment summary
  const { data: summary } = trpc.portal.paymentSummary.useQuery();

  const displayHistory = selectedPolicyId ? policyHistory : paymentHistory;
  const isHistoryLoading = selectedPolicyId ? policyHistoryLoading : historyLoading;

  // Get unique policies from payment history
  const uniquePolicies = paymentHistory
    ? Array.from(new Map(paymentHistory.map((p) => [p.policyId, p.policyNumber])).entries()).map(
        ([id, number]) => ({ id, number })
      )
    : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  };

  if (methodsError || historyError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load payment information. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payments
        </CardTitle>
        <CardDescription>Manage payment methods and view payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="space-y-4">
            {methodsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !paymentMethods || paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payment methods on file</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      method.id === defaultMethod?.id ? "bg-blue-50 border-blue-200" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{method.cardholderName}</p>
                        <p className="text-sm text-muted-foreground">{maskCardNumber(method.cardNumber)}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                      {method.id === defaultMethod?.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coming Soon: Add Payment Method */}
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" disabled>
                Add Payment Method (Coming Soon)
              </Button>
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-semibold">${summary.totalPaid.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-lg font-semibold">${summary.totalPending.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>
            )}

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

            {/* Payment History List */}
            {isHistoryLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !displayHistory || displayHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payment history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(payment.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()} • {payment.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{payment.paymentMethod}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Coming Soon: Make Payment */}
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" disabled>
                Make a Payment (Coming Soon)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
