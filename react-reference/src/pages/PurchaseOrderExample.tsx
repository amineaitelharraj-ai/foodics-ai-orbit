import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '../components/ui'

const purchaseOrder = {
  supplier: 'Dana',
  destination: 'Branch 1 (B01)',
  creator: 'Dana Amer',
  createdAt: '2022-09-20 01:30pm',
  deliveryDate: '2022-09-20',
  businessDate: '-',
  numberOfItems: 3,
  totalCost: '₦ 5',
  status: 'Draft',
  items: [
    { name: 'stock product x', sku: 'sk-0032', available: '0 Unit', cost: '₦ 0', qty: '1 Unit', total: '₦ 0' },
    { name: 'Potato', sku: 'sk-0033', available: '6.95 Box', cost: '₦ 0', qty: '1 Box', total: '₦ 0' },
    { name: 'Orange Juice', sku: 'sk-0034', available: '21.99333 Bottle', cost: '₦ 5', qty: '1 Bottle', total: '₦ 5' },
  ]
}

export default function PurchaseOrderExample() {
  const navigate = useNavigate()
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="link" className="mb-4 p-0 h-auto text-blue-600">&lt; Back</Button>
      
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Order</h1>
        <Badge variant="default">{purchaseOrder.status}</Badge>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Supplier</span>
                <div className="font-medium">{purchaseOrder.supplier}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Business Date</span>
                <div className="font-medium">{purchaseOrder.businessDate}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Created At</span>
                <div className="font-medium">{purchaseOrder.createdAt}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Purchase Order Total Cost</span>
                <div className="font-medium text-lg">{purchaseOrder.totalCost}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Destination</span>
                <div className="font-medium">{purchaseOrder.destination}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Creator</span>
                <div className="font-medium">{purchaseOrder.creator}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Delivery Date</span>
                <div className="font-medium">{purchaseOrder.deliveryDate}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Number of Items</span>
                <div className="font-medium">{purchaseOrder.numberOfItems}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-8">
        <Button variant="outline">Print</Button>
        <Button variant="danger">Delete Permanently</Button>
        <Button variant="outline" onClick={() => navigate('/console/purchase-order')}>Edit</Button>
        <Button variant="primary">Submit For Review</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Button variant="outline" size="sm">Add Items</Button>
            <Button variant="outline" size="sm">Edit Quantities & Cost</Button>
            <Button variant="outline" size="sm">Import Items</Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Available Quantity</TableHead>
                <TableHead>Cost Per Unit</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.available}</TableCell>
                  <TableCell>{item.cost}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell className="font-medium">{item.total}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                      🗑️
                    </Button>
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