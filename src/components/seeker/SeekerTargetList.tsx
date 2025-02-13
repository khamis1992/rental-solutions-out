
import { SeekerTarget } from '@/types/seeker';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Battery, 
  Signal, 
  MapPin, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSeekerTargets } from '@/hooks/use-seeker-targets';

interface SeekerTargetListProps {
  targets?: SeekerTarget[];
}

export function SeekerTargetList({ targets }: SeekerTargetListProps) {
  const { deleteTarget } = useSeekerTargets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Seen</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Battery</TableHead>
          <TableHead>Network</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets?.map((target) => (
          <TableRow key={target.id}>
            <TableCell className="font-medium">{target.target_name}</TableCell>
            <TableCell>{target.target_type}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(target.status)} mr-2`} />
                {target.status}
              </Badge>
            </TableCell>
            <TableCell>
              {target.last_seen_at ? (
                formatDistanceToNow(new Date(target.last_seen_at), { addSuffix: true })
              ) : (
                'Never'
              )}
            </TableCell>
            <TableCell>
              {target.last_location_lat && target.last_location_lng ? (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {target.last_location_lat.toFixed(6)}, {target.last_location_lng.toFixed(6)}
                </div>
              ) : (
                'Unknown'
              )}
            </TableCell>
            <TableCell>
              {target.battery_level ? (
                <div className="flex items-center">
                  <Battery className="w-4 h-4 mr-1" />
                  {target.battery_level}%
                </div>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell>
              {target.network_type ? (
                <div className="flex items-center">
                  <Signal className="w-4 h-4 mr-1" />
                  {target.network_type}
                </div>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteTarget.mutate(target.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {(!targets || targets.length === 0) && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
              No targets found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
