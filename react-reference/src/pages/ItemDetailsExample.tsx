import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui'

const item = {
  name: 'YGoussef',
  sku: 'sk-0751',
  minLevel: '-',
  maxLevel: '-',
  ingredientUnit: 'Unit',
  costingMethod: 'From Transactions',
  totalCost: '₦ 0',
  nameLocalized: '-',
  barcode: '-',
  parLevel: '-',
  storageUnit: 'Unit',
  factor: '1 Unit = 1 Unit',
  category: '-',
}

export default function ItemDetailsExample() {
  const navigate = useNavigate()
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Button variant="link" className="mb-4 p-0 h-auto text-blue-600">&lt; Back</Button>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">Name</div>
                <div className="font-bold text-lg">{item.name}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">SKU</div>
                <div className="font-medium">{item.sku}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Minimum Level</div>
                <div className="font-medium">{item.minLevel}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Maximum Level</div>
                <div className="font-medium">{item.maxLevel}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Ingredient Unit</div>
                <div className="font-bold">{item.ingredientUnit}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Costing Method</div>
                <div className="font-bold">{item.costingMethod}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Total Cost of Production</div>
                <div className="font-bold text-lg">{item.totalCost}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">Name Localized</div>
                <div className="font-medium">{item.nameLocalized}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Barcode</div>
                <div className="font-medium">{item.barcode}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Par Level</div>
                <div className="font-medium">{item.parLevel}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Storage Unit</div>
                <div className="font-bold">{item.storageUnit}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Factor</div>
                <div className="font-medium">{item.factor}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Category</div>
                <div className="font-medium">{item.category}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => navigate('/console/item-details')}>
          Edit Item
        </Button>
      </div>
    </div>
  )
} 