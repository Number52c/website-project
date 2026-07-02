/**
 * PaymentsSection.test.tsx
 * Component tests for PaymentsSection with tRPC integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaymentsSection } from "./PaymentsSection";
import { trpc } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    portal: {
      myPaymentMethods: {
        useQuery: vi.fn(),
      },
      defaultPaymentMethod: {
        useQuery: vi.fn(),
      },
      myPaymentHistory: {
        useQuery: vi.fn(),
      },
      policyPaymentHistory: {
        useQuery: vi.fn(),
      },
      paymentSummary: {
        useQuery: vi.fn(),
      },
    },
  },
}));

describe("PaymentsSection Component", () => {
  const mockPaymentMethods = [
    {
      id: 1,
      cardholderName: "John Doe",
      cardNumber: "4111111111111111",
      expiryMonth: "12",
      expiryYear: "2027",
    },
    {
      id: 2,
      cardholderName: "Jane Doe",
      cardNumber: "5555555555554444",
      expiryMonth: "06",
      expiryYear: "2028",
    },
  ];

  const mockPaymentHistory = [
    {
      id: 1,
      policyId: 101,
      policyNumber: "POL-001",
      amount: 150.0,
      paymentDate: new Date("2026-03-01"),
      status: "completed",
      paymentMethod: "Credit Card",
    },
    {
      id: 2,
      policyId: 102,
      policyNumber: "POL-002",
      amount: 200.0,
      paymentDate: new Date("2026-03-05"),
      status: "pending",
      paymentMethod: "Bank Transfer",
    },
  ];

  const mockPaymentSummary = {
    totalPaid: 300.0,
    totalPending: 200.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render PaymentsSection component", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Manage payment methods and view payment history")).toBeInTheDocument();
  });

  it("should display Payment Methods tab", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const methodsTab = screen.getByRole("tab", { name: /Payment Methods/i });
    expect(methodsTab).toBeInTheDocument();
  });

  it("should display History tab", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    expect(historyTab).toBeInTheDocument();
  });

  it("should display masked card numbers", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    await waitFor(() => {
      expect(screen.getByText(/•••• •••• •••• 1111/)).toBeInTheDocument();
      expect(screen.getByText(/•••• •••• •••• 4444/)).toBeInTheDocument();
    });
  });

  it("should display cardholder names", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
  });

  it("should display expiry dates", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    await waitFor(() => {
      expect(screen.getByText(/Expires 12\/2027/)).toBeInTheDocument();
      expect(screen.getByText(/Expires 06\/2028/)).toBeInTheDocument();
    });
  });

  it("should mark default payment method", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    await waitFor(() => {
      expect(screen.getByText("Default")).toBeInTheDocument();
    });
  });

  it("should display payment history with amounts", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText("$150.00")).toBeInTheDocument();
      expect(screen.getByText("$200.00")).toBeInTheDocument();
    });
  });

  it("should display payment status indicators", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText("completed")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
    });
  });

  it("should display payment summary cards", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText("Total Paid")).toBeInTheDocument();
      expect(screen.getByText("$300.00")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("$200.00")).toBeInTheDocument();
    });
  });

  it("should filter payment history by policy", async () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    const pol001Button = screen.getByRole("button", { name: /POL-001/i });
    fireEvent.click(pol001Button);

    await waitFor(() => {
      expect(pol001Button).toHaveClass("bg-blue-600");
    });
  });

  it("should display empty state for no payment methods", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: null,
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    expect(screen.getByText("No payment methods on file")).toBeInTheDocument();
  });

  it("should display empty state for no payment history", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    expect(screen.getByText("No payment history")).toBeInTheDocument();
  });

  it("should display loading state", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: undefined,
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: undefined,
    });

    render(<PaymentsSection />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should display error state", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load payment methods"),
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: undefined,
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load payment history"),
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: undefined,
    });

    render(<PaymentsSection />);

    expect(screen.getByText(/Failed to load payment/i)).toBeInTheDocument();
  });

  it("should have disabled 'Make a Payment' button", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    render(<PaymentsSection />);

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    const paymentButton = screen.getByRole("button", { name: /Make a Payment/i });
    expect(paymentButton).toBeDisabled();
  });

  it("should be responsive with className prop", () => {
    (trpc.portal.myPaymentMethods.useQuery as any).mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      error: null,
    });
    (trpc.portal.defaultPaymentMethod.useQuery as any).mockReturnValue({
      data: mockPaymentMethods[0],
    });
    (trpc.portal.myPaymentHistory.useQuery as any).mockReturnValue({
      data: mockPaymentHistory,
      isLoading: false,
      error: null,
    });
    (trpc.portal.paymentSummary.useQuery as any).mockReturnValue({
      data: mockPaymentSummary,
    });

    const { container } = render(<PaymentsSection className="custom-class" />);

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
