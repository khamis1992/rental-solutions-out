
import { Table, TableBody } from "@/components/ui/table";
import { AgreementTableHeader } from "../table/AgreementTableHeader";
import { AgreementTableRow } from "../table/AgreementTableRow";
import { VehicleTablePagination } from "../../vehicles/table/VehicleTablePagination";
import type { Agreement } from "../hooks/useAgreements";

interface AgreementListContentProps {
  agreements: Agreement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  onDeleted: () => void;
}

export const AgreementListContent = ({
  agreements,
  currentPage,
  totalPages,
  onPageChange,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
  onDeleteClick,
  onDeleted,
}: AgreementListContentProps) => {
  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="inline-block min-w-full align-middle">
            <div className="shadow-sm ring-1 ring-black ring-opacity-5">
              <Table>
                <AgreementTableHeader />
                <TableBody className="divide-y divide-gray-200">
                  {agreements.map((agreement) => (
                    <AgreementTableRow
                      key={agreement.id}
                      agreement={agreement}
                      onViewContract={onViewContract}
                      onPrintContract={onPrintContract}
                      onAgreementClick={onAgreementClick}
                      onNameClick={onNameClick}
                      onDeleted={onDeleted}
                      onDeleteClick={() => onDeleteClick(agreement.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <VehicleTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
