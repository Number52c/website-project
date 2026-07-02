/**
 * DocumentsSection.test.tsx
 * Component tests for DocumentsSection with tRPC integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentsSection } from "./DocumentsSection";
import { trpc } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    portal: {
      myDocuments: {
        useQuery: vi.fn(),
      },
      policyDocuments: {
        useQuery: vi.fn(),
      },
    },
  },
}));

describe("DocumentsSection Component", () => {
  const mockDocuments = [
    {
      id: 1,
      policyId: 101,
      policyNumber: "POL-001",
      fileName: "policy_document.pdf",
      documentType: "Policy Document",
      uploadedAt: new Date("2026-01-15"),
      fileSize: 1024000,
      url: "/storage/doc1.pdf",
    },
    {
      id: 2,
      policyId: 102,
      policyNumber: "POL-002",
      fileName: "amendment_notice.pdf",
      documentType: "Amendment",
      uploadedAt: new Date("2026-02-20"),
      fileSize: 512000,
      url: "/storage/doc2.pdf",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render DocumentsSection component", () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("View and download your policy documents")).toBeInTheDocument();
  });

  it("should display loading state", () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<DocumentsSection />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should display error state", () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load documents"),
    });

    render(<DocumentsSection />);

    expect(screen.getByText(/Failed to load documents/i)).toBeInTheDocument();
  });

  it("should display empty state when no documents", () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    expect(screen.getByText("No documents available")).toBeInTheDocument();
  });

  it("should display document list", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    await waitFor(() => {
      expect(screen.getByText("policy_document.pdf")).toBeInTheDocument();
      expect(screen.getByText("amendment_notice.pdf")).toBeInTheDocument();
    });
  });

  it("should display document type badges", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    await waitFor(() => {
      expect(screen.getByText("Policy Document")).toBeInTheDocument();
      expect(screen.getByText("Amendment")).toBeInTheDocument();
    });
  });

  it("should display formatted upload dates", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    await waitFor(() => {
      expect(screen.getByText(/1\/15\/2026/)).toBeInTheDocument();
      expect(screen.getByText(/2\/20\/2026/)).toBeInTheDocument();
    });
  });

  it("should have download buttons for each document", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    await waitFor(() => {
      const downloadButtons = screen.getAllByRole("link", { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should filter documents by policy", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    const policyButtons = screen.getAllByRole("button", { name: /POL-/i });
    expect(policyButtons.length).toBeGreaterThan(0);

    fireEvent.click(policyButtons[0]);

    await waitFor(() => {
      expect(policyButtons[0]).toHaveClass("bg-blue-600");
    });
  });

  it("should display 'Coming Soon' for upload feature", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    const uploadButton = screen.getByRole("button", { name: /Upload Document/i });
    expect(uploadButton).toBeDisabled();
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
  });

  it("should display file size information", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    await waitFor(() => {
      // File sizes should be formatted (1MB, 512KB, etc.)
      expect(screen.getByText(/\d+(\.\d+)?\s*(KB|MB)/)).toBeInTheDocument();
    });
  });

  it("should handle policy filter state correctly", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    const allButton = screen.getByRole("button", { name: /All Policies/i });
    expect(allButton).toHaveClass("bg-blue-600");

    const pol001Button = screen.getByRole("button", { name: /POL-001/i });
    fireEvent.click(pol001Button);

    await waitFor(() => {
      expect(pol001Button).toHaveClass("bg-blue-600");
      expect(allButton).not.toHaveClass("bg-blue-600");
    });
  });

  it("should display document icon", async () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DocumentsSection />);

    const documentIcons = screen.getAllByRole("img", { hidden: true });
    expect(documentIcons.length).toBeGreaterThan(0);
  });

  it("should be responsive with className prop", () => {
    (trpc.portal.myDocuments.useQuery as any).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    const { container } = render(<DocumentsSection className="custom-class" />);

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
