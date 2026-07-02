import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface LinkHouseholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LinkHouseholdModal({ open, onOpenChange, onSuccess }: LinkHouseholdModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: clients } = trpc.admin.listClients.useQuery(undefined, {
    enabled: open,
  });

  const linkHouseholdMutation = trpc.admin.linkHousehold.useMutation({
    onSuccess: () => {
      toast.success('Household linked successfully!');
      setSelectedClientIds([]);
      setSearchTerm('');
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to link household');
    },
  });

  const filteredClients = clients?.filter((client) =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleClient = (clientId: number) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleLink = async () => {
    if (selectedClientIds.length < 2) {
      toast.error('Please select at least 2 clients to link');
      return;
    }

    setIsLoading(true);
    try {
      await linkHouseholdMutation.mutateAsync({
        clientIds: selectedClientIds,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Household</DialogTitle>
          <DialogDescription>
            Select multiple clients to link them as a household. They will share the same portal login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Client List */}
          <div className="border rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No clients found</p>
            ) : (
              filteredClients.map((client) => (
                <div key={client.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded">
                  <Checkbox
                    checked={selectedClientIds.includes(client.id)}
                    onCheckedChange={() => handleToggleClient(client.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                  {client.householdId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      HH: {client.householdId}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Selected Count */}
          <div className="text-sm text-muted-foreground">
            {selectedClientIds.length} client{selectedClientIds.length !== 1 ? 's' : ''} selected
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={selectedClientIds.length < 2 || isLoading}
              className="gap-2 bg-[#C9A84C] text-[#0D1B3E] hover:bg-[#D4AF37] font-semibold"
            >
              {isLoading && <Spinner className="h-4 w-4" />}
              Link Household
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
