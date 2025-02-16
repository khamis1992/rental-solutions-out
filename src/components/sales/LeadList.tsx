
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SalesLead } from "@/types/sales.types";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface LeadListProps {
  leads: SalesLead[];
  onEdit: (lead: SalesLead) => void;
  onDelete: (id: string) => Promise<void>;
  onTransferToOnboarding: (lead: SalesLead) => Promise<void>;
}

export function LeadList({ leads, onEdit, onDelete, onTransferToOnboarding }: LeadListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [transferringId, setTransferringId] = useState<string | null>(null);

  const handleDelete = async (lead: SalesLead) => {
    try {
      setDeletingId(lead.id);
      await onDelete(lead.id);
      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTransfer = async (lead: SalesLead) => {
    try {
      setTransferringId(lead.id);
      await onTransferToOnboarding(lead);
      toast.success("Lead transferred to onboarding");
    } catch (error) {
      toast.error("Failed to transfer lead");
    } finally {
      setTransferringId(null);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Leads</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {leads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : ''}
                        ${lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${lead.status === 'qualified' ? 'bg-green-100 text-green-800' : ''}
                        ${lead.status === 'negotiating' ? 'bg-purple-100 text-purple-800' : ''}
                        ${lead.status === 'converted' ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${lead.status === 'lost' ? 'bg-red-100 text-red-800' : ''}
                        ${lead.status === 'in_onboarding' ? 'bg-teal-100 text-teal-800' : ''}
                      `}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(lead)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead)}
                        disabled={deletingId === lead.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      {lead.status !== 'in_onboarding' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTransfer(lead)}
                          disabled={transferringId === lead.id}
                        >
                          <UserPlus className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
