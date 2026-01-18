import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '../components/ui'

const inventoryCount = {
  branch: 'Branch 1 (B01)',
  creator: 'Huda Aiman Aiman',
  businessDate: '2022-02-21',
  submitter: 'Huda Aiman Aiman',
  createdAt: '2022-02-21 02:28pm',
  totalVarianceCost: '₦ -2.5',
  numberOfItems: 1,
  status: 'Closed',
  items: [
    {
      name: 'Sauce',
      sku: 'sk-0007',
      storageUnit: 'L',
      enteredQty: 1,
      originalQty: 2,
      varianceQty: -1,
      variancePercent: '-50%',
      varianceCost: '₦ -2.5',
    },
  ],
}

export default function InventoryCountExample() {
  const navigate = useNavigate()
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="link" className="mb-4 p-0 h-auto text-blue-600">&lt; Back</Button>
      
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Count (IC-000003)</h1>
        <Badge variant={inventoryCount.status === 'Closed' ? 'default' : 'warning'}>
          {inventoryCount.status}
        </Badge>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Branch</span>
                <div className="font-medium">{inventoryCount.branch}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Creator</span>
                <div className="font-medium">{inventoryCount.creator}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Total Variance Cost</span>
                <div className="font-medium text-lg">{inventoryCount.totalVarianceCost}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Number of Items</span>
                <div className="font-medium">{inventoryCount.numberOfItems}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Business Date</span>
                <div className="font-medium">{inventoryCount.businessDate}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Submitter</span>
                <div className="font-medium">{inventoryCount.submitter}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Created At</span>
                <div className="font-medium">{inventoryCount.createdAt}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-8">
        <Button variant="outline">Print</Button>
        <Button variant="outline" onClick={() => navigate('/console/inventory-count')}>
          Duplicate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Storage Unit</TableHead>
                <TableHead>Entered Quantity</TableHead>
                <TableHead>Original Quantity</TableHead>
                <TableHead>Variance Quantity</TableHead>
                <TableHead>Variance Percent</TableHead>
                <TableHead>Variance Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryCount.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.storageUnit}</TableCell>
                  <TableCell>{item.enteredQty}</TableCell>
                  <TableCell>{item.originalQty}</TableCell>
                  <TableCell className={item.varianceQty < 0 ? 'text-red-600' : 'text-green-600'}>
                    {item.varianceQty}
                  </TableCell>
                  <TableCell className={item.variancePercent.includes('-') ? 'text-red-600' : 'text-green-600'}>
                    {item.variancePercent}
                  </TableCell>
                  <TableCell className={item.varianceCost.includes('-') ? 'text-red-600' : 'text-green-600'}>
                    {item.varianceCost}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 