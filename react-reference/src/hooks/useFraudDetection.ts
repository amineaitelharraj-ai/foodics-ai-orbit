import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fraudAPI } from '../services/fraud-api';

export interface FraudAlert {
  id: string;
  type: string;
  item: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  branch: string;
  cashier: string;
  orderId: string;
  amount: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  ruleTriggered: string;
  riskScore: number;
  evidenceJson: string;
}

export interface FraudRule {
  id: string;
  name: string;
  threshold: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  description: string;
  ruleFamily: string;
}

export interface FraudStats {
  totalTransactions: number;
  flaggedTransactions: number;
  falsePositives: number;
  confirmedFraud: number;
  potentialLoss: number;
  preventedLoss: number;
  securityScore: number;
  accuracyRate: number;
}

export interface UseFraudDetectionReturn {
  // Data
  fraudAlerts: FraudAlert[];
  fraudRules: FraudRule[];
  fraudStats: FraudStats;
  
  // Loading states
  isLoadingAlerts: boolean;
  isLoadingRules: boolean;
  isLoadingStats: boolean;
  
  // Error states
  alertsError: Error | null;
  rulesError: Error | null;
  statsError: Error | null;
  
  // Actions
  refreshData: () => void;
  toggleRule: (ruleId: string) => Promise<void>;
  submitEvent: (event: any) => Promise<void>;
  updateAlertStatus: (alertId: string, status: string) => Promise<any>;
  
  // WebSocket connection
  isConnected: boolean;
}

export const useFraudDetection = (): UseFraudDetectionReturn => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch fraud alerts
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['fraudAlerts'],
    queryFn: async () => {
      const response = await fraudAPI.getFraudFlags();
      if (!response.data) return [];
      return response.data.map((flag: any): FraudAlert => ({
        id: flag.id,
        type: flag.ruleName,
        item: `Order ${flag.event?.transactionId || flag.eventId}`,
        severity: flag.severity,
        description: flag.description,
        timestamp: new Date(flag.createdAt).toLocaleString(),
        branch: flag.storeId || 'Unknown',
        cashier: flag.cashierId || 'Unknown',
        orderId: flag.event?.transactionId || flag.eventId,
        amount: flag.event?.orderTotal ? `$${flag.event.orderTotal}` : '$0.00',
        status: (flag.status || '').toUpperCase(),
        ruleTriggered: flag.rule?.description || flag.ruleName,
        riskScore: flag.riskScore || 0,
        evidenceJson: flag.evidenceJson || '{}'
      }));
    },
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // 10 seconds
  });

  // Fetch fraud rules
  const {
    data: rulesData,
    isLoading: isLoadingRules,
    error: rulesError,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['fraudRules'],
    queryFn: async () => {
      const response = await fraudAPI.getFraudRules();
      if (!response.data) return [];
      return response.data.map((rule: any): FraudRule => ({
        id: rule.id,
        name: rule.name,
        threshold: rule.description,
        severity: rule.severity,
        enabled: rule.enabled,
        description: rule.description,
        ruleFamily: rule.ruleFamily
      }));
    },
    staleTime: 300000, // 5 minutes
  });

  // Calculate fraud stats from alerts data
  const fraudStats: FraudStats = {
    totalTransactions: 1247, // This would come from a separate endpoint
    flaggedTransactions: alertsData?.length || 0,
    falsePositives: alertsData?.filter((alert: FraudAlert) => alert.status === 'RESOLVED').length || 0,
    confirmedFraud: alertsData?.filter((alert: FraudAlert) => alert.status === 'INVESTIGATING').length || 0,
    potentialLoss: alertsData?.reduce((sum: number, alert: FraudAlert) => {
      const amount = parseFloat(alert.amount.replace('$', '')) || 0;
      return sum + amount;
    }, 0) || 0,
    preventedLoss: 1250.00, // This would come from backend calculation
    securityScore: Math.max(0, Math.min(100, 100 - (alertsData?.length || 0) * 2)),
    accuracyRate: alertsData?.length ? Math.round((alertsData.filter((alert: FraudAlert) => alert.status !== 'RESOLVED').length / alertsData.length) * 100) : 87
  };

  // Toggle fraud rule mutation
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string, enabled: boolean }) => {
      return await fraudAPI.updateFraudRule(ruleId, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraudRules'] });
    },
  });

  // Submit POS event mutation
  const submitEventMutation = useMutation({
    mutationFn: async (event: any) => {
      return await fraudAPI.submitPOSEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraudAlerts'] });
    },
  });

  // Update alert status mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string, status: string }) => {
      console.log('UpdateAlertMutation called with:', { alertId, status });
      try {
        const result = await fraudAPI.updateFraudFlag(alertId, { status });
        console.log('UpdateFraudFlag API result:', result);
        return result;
      } catch (error) {
        console.error('UpdateFraudFlag API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('UpdateAlertMutation onSuccess:', data);
      queryClient.invalidateQueries({ queryKey: ['fraudAlerts'] });
    },
    onError: (error) => {
      console.error('UpdateAlertMutation onError:', error);
    },
  });

  // Mark as connected (we rely on React Query 10-sec refetch instead of manual interval)
  useEffect(() => {
    setIsConnected(true);
    return () => setIsConnected(false);
  }, []);

  // Actions
  const refreshData = useCallback(() => {
    refetchAlerts();
    refetchRules();
  }, [refetchAlerts, refetchRules]);

  const toggleRule = useCallback(async (ruleId: string) => {
    const rule = rulesData?.find(r => r.id === ruleId);
    if (rule) {
      await toggleRuleMutation.mutateAsync({ ruleId, enabled: !rule.enabled });
    }
  }, [rulesData, toggleRuleMutation]);

  const submitEvent = useCallback(async (event: any) => {
    await submitEventMutation.mutateAsync(event);
  }, [submitEventMutation]);

  const updateAlertStatus = useCallback(async (alertId: string, status: string) => {
    console.log('🔄 updateAlertStatus called with:', { alertId, status });
    console.log('🔄 updateAlertMutation isLoading:', updateAlertMutation.isPending);
    try {
      const result = await updateAlertMutation.mutateAsync({ alertId, status });
      console.log('✅ updateAlertStatus SUCCESS:', result);
      // Force immediate refresh
      await refetchAlerts();
      console.log('🔄 Forced refetch completed');
      return result;
    } catch (error) {
      console.error('❌ updateAlertStatus ERROR:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [updateAlertMutation, refetchAlerts]);

  return {
    // Data
    fraudAlerts: alertsData || [],
    fraudRules: rulesData || [],
    fraudStats,
    
    // Loading states
    isLoadingAlerts,
    isLoadingRules,
    isLoadingStats: false, // Stats are calculated, not fetched
    
    // Error states
    alertsError: alertsError as Error | null,
    rulesError: rulesError as Error | null,
    statsError: null,
    
    // Actions
    refreshData,
    toggleRule,
    submitEvent,
    updateAlertStatus,
    
    // WebSocket
    isConnected
  };
}; 