export interface Price {
  amount: number;
  currency: string;
}

export type HITLStatus = 'pending' | 'approved' | 'rejected';

export type OperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'activate'
  | 'deactivate'
  | 'award'
  | 'redeem'
  | 'attach'
  | 'detach'
  | 'blacklist'
  | 'unblacklist'
  | 'add_product'
  | 'remove_product'
  | 'update_product'
  | 'add_modifier'
  | 'remove_modifier'
  | 'add_category'
  | 'remove_category'
  | 'add_tag'
  | 'remove_tag'
  | 'extend';

export interface BasePreview {
  type: string;
  version: string;
  operation: OperationType;
}

export interface ProductPreview extends BasePreview {
  type: 'product_preview';
  operation: 'create' | 'update' | 'delete' | 'restore';
  product: {
    id?: string;
    name: string;
    description?: string;
    name_localized?: string;
    price?: Price;
    cost_price?: Price;
    category?: { id: string; name: string };
    sku?: string;
    barcode?: string;
    image_url?: string;
    tax_group_id?: string;
    is_active: boolean;
  };
  combo_options?: Array<{
    name: string;
    type: string;
    price?: Price;
    quantity?: number;
  }>;
  modifiers?: Array<{
    name: string;
    type: 'modifier';
    price_delta?: Price;
    is_default?: boolean;
  }>;
  pricing_options?: {
    discount?: number;
    min_quantity?: number;
    max_quantity?: number;
  };
}

export interface CategoryPreview extends BasePreview {
  type: 'category_preview';
  operation: 'create' | 'update' | 'delete' | 'restore';
  category: {
    id?: string;
    name: string;
    name_localized?: string;
    reference?: string;
    color?: string;
    is_active: boolean;
    parent?: { id: string; name?: string };
  };
}

export interface ModifierPreview extends BasePreview {
  type: 'modifier_preview';
  operation: 'create' | 'update' | 'delete' | 'restore' | 'attach' | 'detach';
  modifier: {
    id?: string;
    name: string;
    name_localized?: string;
    reference?: string;
    price?: Price;
    is_active: boolean;
  };
  product?: { id: string; name?: string };
  options?: unknown[];
}

export interface BranchPreview extends BasePreview {
  type: 'branch_preview';
  operation: 'update' | 'delete';
  branch: {
    id: string;
    name: string;
    name_localized?: string;
    reference?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
  };
}

export interface SupplierPreview extends BasePreview {
  type: 'supplier_preview';
  operation: 'create' | 'update' | 'delete' | 'restore' | 'attach' | 'detach';
  supplier: {
    id?: string;
    name: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
  };
  item?: {
    id: string;
    name?: string;
    price?: Price;
  };
}

export interface CustomerPreview extends BasePreview {
  type: 'customer_preview';
  operation: 'create' | 'blacklist' | 'unblacklist' | 'update' | 'add_tag' | 'remove_tag';
  customer: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    loyalty_number?: string;
    is_blacklisted?: boolean;
  };
  tag?: {
    id?: string;
    name: string;
  };
  house_account?: {
    balance?: Price;
    credit_limit?: Price;
  };
}

export interface ComboPreview extends BasePreview {
  type: 'combo_preview';
  operation:
    | 'add_product'
    | 'remove_product'
    | 'update_product'
    | 'add_modifier'
    | 'remove_modifier'
    | 'activate'
    | 'deactivate';
  combo: {
    id: string;
    name?: string;
    description?: string;
    price?: Price;
    is_active: boolean;
  };
  product?: {
    id: string;
    name?: string;
    quantity?: number;
    price?: Price;
    is_required?: boolean;
  };
  modifier?: {
    id: string;
    name?: string;
    price?: Price;
  };
}

export interface PointsPreview extends BasePreview {
  type: 'points_preview';
  operation: 'award' | 'redeem';
  action: 'award' | 'redeem';
  customer: {
    id: string;
    name?: string;
    email?: string;
    loyalty_number?: string;
  };
  points: {
    amount: number;
    current_balance?: number;
    new_balance?: number;
  };
  reason?: string;
}

export interface LoyaltyProgramPreview extends BasePreview {
  type: 'loyalty_program_preview';
  operation: 'create' | 'update' | 'delete';
  program: {
    id?: string;
    name: string;
    description?: string;
    is_active: boolean;
  };
  points_config?: {
    points_per_currency?: number;
    currency_per_point?: number;
    min_spend?: Price;
  };
  expiration?: {
    days?: number;
    date?: string;
  };
}

export interface LoyaltyRewardPreview extends BasePreview {
  type: 'loyalty_reward_preview';
  operation: 'create' | 'update';
  reward: {
    id?: string;
    name: string;
    description?: string;
    points_cost: number;
    reward_type: string;
    value?: Price;
    is_active: boolean;
  };
  program?: {
    id: string;
    name?: string;
  };
}

export interface PromotionPreview extends BasePreview {
  type: 'promotion_preview';
  operation:
    | 'add_product'
    | 'remove_product'
    | 'add_category'
    | 'remove_category'
    | 'activate'
    | 'deactivate'
    | 'extend';
  promotion: {
    id: string;
    name?: string;
    description?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: string;
    is_active: boolean;
  };
  product?: {
    id: string;
    name?: string;
    price?: Price;
  };
  category?: {
    id: string;
    name?: string;
  };
  schedule?: {
    current_end_date?: string;
    new_end_date?: string;
    extension_days?: number;
  };
}

export interface InventoryTransactionPreview extends BasePreview {
  type: 'inventory_transaction_preview';
  operation: 'create';
  transaction: {
    type: 'in' | 'out' | 'adjustment';
    reason?: string;
    reference?: string;
  };
  item: {
    id: string;
    name?: string;
    sku?: string;
    unit?: string;
  };
  quantity: {
    amount: number;
    direction: 'in' | 'out';
    current_stock?: number;
    new_stock?: number;
  };
  branch?: {
    id: string;
    name?: string;
  };
}

export interface InventoryCountPreview extends BasePreview {
  type: 'inventory_count_preview';
  operation: 'create';
  count: {
    reference?: string;
    date?: string;
    notes?: string;
  };
  items?: Array<{
    id: string;
    name?: string;
    expected_quantity?: number;
    counted_quantity?: number;
  }>;
  branch?: {
    id: string;
    name?: string;
  };
}

export type HITLPreview =
  | ProductPreview
  | CategoryPreview
  | ModifierPreview
  | BranchPreview
  | SupplierPreview
  | CustomerPreview
  | ComboPreview
  | PointsPreview
  | LoyaltyProgramPreview
  | LoyaltyRewardPreview
  | PromotionPreview
  | InventoryTransactionPreview
  | InventoryCountPreview;

export interface HITLMessage {
  id: string;
  type: 'hitl_card';
  preview: HITLPreview;
  session_id: string;
  tool_name: string;
  status: HITLStatus;
  timestamp: Date;
  generatedImageUrl?: string;
}

export const OPERATION_STYLES: Record<string, { icon: string; color: string; statusText: string }> =
  {
    create: { icon: 'add', color: 'green', statusText: 'Creating...' },
    update: { icon: 'edit', color: 'blue', statusText: 'Updating...' },
    delete: { icon: 'delete', color: 'red', statusText: 'Deleting...' },
    restore: { icon: 'undo', color: 'yellow', statusText: 'Restoring...' },
    activate: { icon: 'check-circle', color: 'green', statusText: 'Activating...' },
    deactivate: { icon: 'pause-circle', color: 'gray', statusText: 'Deactivating...' },
    award: { icon: 'add', color: 'green', statusText: 'Awarding...' },
    redeem: { icon: 'remove', color: 'orange', statusText: 'Redeeming...' },
    attach: { icon: 'link', color: 'blue', statusText: 'Attaching...' },
    detach: { icon: 'unlink', color: 'orange', statusText: 'Detaching...' },
    blacklist: { icon: 'block', color: 'red', statusText: 'Blacklisting...' },
    unblacklist: { icon: 'check-circle', color: 'green', statusText: 'Removing...' },
    add_product: { icon: 'add', color: 'green', statusText: 'Adding...' },
    remove_product: { icon: 'remove', color: 'red', statusText: 'Removing...' },
    update_product: { icon: 'edit', color: 'blue', statusText: 'Updating...' },
    add_modifier: { icon: 'add', color: 'green', statusText: 'Adding...' },
    remove_modifier: { icon: 'remove', color: 'red', statusText: 'Removing...' },
    add_category: { icon: 'add', color: 'green', statusText: 'Adding...' },
    remove_category: { icon: 'remove', color: 'red', statusText: 'Removing...' },
    add_tag: { icon: 'add', color: 'green', statusText: 'Adding...' },
    remove_tag: { icon: 'remove', color: 'red', statusText: 'Removing...' },
    extend: { icon: 'calendar', color: 'blue', statusText: 'Extending...' },
  };

export const STATUS_STYLES: Record<HITLStatus, { color: string; text: string }> = {
  pending: { color: 'amber', text: 'Pending approval' },
  approved: { color: 'green', text: 'Approved' },
  rejected: { color: 'red', text: 'Rejected' },
};

export function getCompletedStatusText(operation: string): string {
  const mapping: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    restore: 'Restored',
    activate: 'Activated',
    deactivate: 'Deactivated',
    award: 'Awarded',
    redeem: 'Redeemed',
    attach: 'Attached',
    detach: 'Detached',
    blacklist: 'Blacklisted',
    unblacklist: 'Removed from blacklist',
    add_product: 'Added',
    remove_product: 'Removed',
    update_product: 'Updated',
    add_modifier: 'Added',
    remove_modifier: 'Removed',
    add_category: 'Added',
    remove_category: 'Removed',
    add_tag: 'Tag added',
    remove_tag: 'Tag removed',
    extend: 'Extended',
  };
  return mapping[operation] ?? 'Completed';
}
