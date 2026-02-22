"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Info, Shield, Zap } from "lucide-react";
import type { RateLimitConfig } from "@/lib/api/aladhan-api-wrapper";
import { RATE_LIMIT_PRESETS } from "@/lib/config/app.config";

interface RateLimitConfigProps {
  config: RateLimitConfig;
  onChange: (config: RateLimitConfig) => void;
  estimatedRequests?: number; // Optional: total number of requests for estimation
}

export function RateLimitConfig({ config, onChange, estimatedRequests = 300 }: RateLimitConfigProps) {
  const [preset, setPreset] = useState<'conservative' | 'balanced' | 'aggressive' | 'fast' | 'turbo' | 'custom'>('fast');
  const [showCustom, setShowCustom] = useState(false);

  // Calculate estimated fetch time based on configuration
  const estimatedTime = useMemo(() => {
    const { interRequestDelay, interDistrictDelay, tokenBucket, maxConcurrentDistricts = 5 } = config;
    const requestsPerSecond = tokenBucket.refillRate;
    const concurrency = maxConcurrentDistricts;
    
    // Calculate effective requests per second (accounting for parallel processing)
    const effectiveRequestsPerSecond = Math.min(requestsPerSecond, concurrency * (1000 / (interRequestDelay + 100)));
    
    // Calculate time for all requests
    const requestTime = (estimatedRequests / effectiveRequestsPerSecond) * 1000; // in ms
    
    // Convert to minutes
    const totalMinutes = Math.ceil(requestTime / 60000);
    
    return totalMinutes;
  }, [config, estimatedRequests]);

  // Handle preset change
  const handlePresetChange = (newPreset: 'conservative' | 'balanced' | 'aggressive' | 'fast' | 'turbo' | 'custom') => {
    setPreset(newPreset);
    
    if (newPreset !== 'custom' && RATE_LIMIT_PRESETS[newPreset as keyof typeof RATE_LIMIT_PRESETS]) {
      onChange(RATE_LIMIT_PRESETS[newPreset as keyof typeof RATE_LIMIT_PRESETS]);
      setShowCustom(false);
    } else {
      setShowCustom(true);
    }
  };

  // Handle custom config change
  const handleCustomConfigChange = (field: keyof RateLimitConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  // Handle token bucket config change
  const handleTokenBucketChange = (field: 'capacity' | 'refillRate' | 'minWaitTime', value: number) => {
    onChange({
      ...config,
      tokenBucket: {
        ...config.tokenBucket,
        [field]: value,
      },
    });
  };

  // Get preset description
  const getPresetDescription = (p: 'conservative' | 'balanced' | 'aggressive' | 'fast' | 'turbo') => {
    switch (p) {
      case 'conservative':
        return 'Slowest but most reliable. Best for strict API limits.';
      case 'balanced':
        return 'Recommended balance of speed and reliability.';
      case 'aggressive':
        return 'Fast but may hit rate limits. Use with caution.';
      case 'fast':
        return 'Very fast for bulk operations. Recommended for large datasets.';
      case 'turbo':
        return 'Maximum speed. Only use if API has no strict limits.';
      default:
        return '';
    }
  };

  // Check if current config matches any preset
  const currentPreset = useMemo(() => {
    if (preset === 'custom') return 'custom';
    
    for (const [key, value] of Object.entries(RATE_LIMIT_PRESETS)) {
      const presetKey = key as keyof typeof RATE_LIMIT_PRESETS;
      if (
        value.batchSize === config.batchSize &&
        value.interRequestDelay === config.interRequestDelay &&
        value.interDistrictDelay === config.interDistrictDelay &&
        value.maxConcurrentDistricts === config.maxConcurrentDistricts &&
        value.tokenBucket.capacity === config.tokenBucket.capacity &&
        value.tokenBucket.refillRate === config.tokenBucket.refillRate &&
        value.tokenBucket.minWaitTime === config.tokenBucket.minWaitTime
      ) {
        return presetKey;
      }
    }
    
    return 'custom';
  }, [config, preset]);

  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Rate Limit Configuration
        </CardTitle>
        <CardDescription>
          Adjust API request rate to avoid 429 errors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selector */}
        <Tabs value={currentPreset} onValueChange={(value) => handlePresetChange(value as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conservative" className="rounded-full text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Conservative
            </TabsTrigger>
            <TabsTrigger value="balanced" className="rounded-full text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Balanced
            </TabsTrigger>
            <TabsTrigger value="aggressive" className="rounded-full text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Aggressive
            </TabsTrigger>
            <TabsTrigger value="fast" className="rounded-full text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Fast
            </TabsTrigger>
            <TabsTrigger value="turbo" className="rounded-full text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Turbo
            </TabsTrigger>
          </TabsList>

          {/* Preset Descriptions */}
          {currentPreset !== 'custom' && (
            <Alert className="mt-4 border-primary/30 bg-primary/8">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2">
                {getPresetDescription(currentPreset as 'conservative' | 'balanced' | 'aggressive' | 'fast' | 'turbo')}
              </AlertDescription>
            </Alert>
          )}

          {/* Custom Configuration */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Batch Size */}
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="batch-size"
                    type="number"
                    min="1"
                    max="10"
                    value={config.batchSize}
                    onChange={(e) => handleCustomConfigChange('batchSize', parseInt(e.target.value))}
                    className="h-10 rounded-xl border-border/60"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    districts at once
                  </span>
                </div>
              </div>

              {/* Max Concurrent Districts */}
              <div className="space-y-2">
                <Label htmlFor="max-concurrent-districts">Max Concurrent Districts</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="max-concurrent-districts"
                    type="number"
                    min="1"
                    max="20"
                    value={config.maxConcurrentDistricts || 5}
                    onChange={(e) => handleCustomConfigChange('maxConcurrentDistricts', parseInt(e.target.value))}
                    className="h-10 rounded-xl border-border/60"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    parallel districts
                  </span>
                </div>
              </div>

              {/* Inter-Request Delay */}
              <div className="space-y-2">
                <Label htmlFor="inter-request-delay">Inter-Request Delay</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="inter-request-delay"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={config.interRequestDelay}
                    onChange={(e) => handleCustomConfigChange('interRequestDelay', parseInt(e.target.value))}
                    className="h-10 rounded-xl border-border/60"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    milliseconds
                  </span>
                </div>
              </div>

              {/* Inter-District Delay */}
              <div className="space-y-2">
                <Label htmlFor="inter-district-delay">Inter-District Delay</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="inter-district-delay"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={config.interDistrictDelay}
                    onChange={(e) => handleCustomConfigChange('interDistrictDelay', parseInt(e.target.value))}
                    className="h-10 rounded-xl border-border/60"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    milliseconds
                  </span>
                </div>
              </div>

               {/* Token Bucket Configuration */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h4 className="text-sm font-semibold">Token Bucket</h4>
                
                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="token-capacity">Capacity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="token-capacity"
                      type="number"
                      min="1"
                      max="200"
                      value={config.tokenBucket.capacity}
                      onChange={(e) => handleTokenBucketChange('capacity', parseInt(e.target.value))}
                      className="h-10 rounded-xl border-border/60"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      max tokens
                    </span>
                  </div>
                </div>

                {/* Refill Rate */}
                <div className="space-y-2">
                  <Label htmlFor="refill-rate">Refill Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="refill-rate"
                      type="number"
                      min="0.01"
                      max="20"
                      step="0.1"
                      value={config.tokenBucket.refillRate}
                      onChange={(e) => handleTokenBucketChange('refillRate', parseFloat(e.target.value))}
                      className="h-10 rounded-xl border-border/60"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      tokens/sec
                    </span>
                  </div>
                </div>

                {/* Min Wait Time */}
                <div className="space-y-2">
                  <Label htmlFor="min-wait-time">Min Wait Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="min-wait-time"
                      type="number"
                      min="0"
                      max="10000"
                      step="100"
                      value={config.tokenBucket.minWaitTime}
                      onChange={(e) => handleTokenBucketChange('minWaitTime', parseInt(e.target.value))}
                      className="h-10 rounded-xl border-border/60"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      milliseconds
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Estimated Fetch Time */}
        <Alert className="border-primary/30 bg-primary/8">
          <Clock className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2">
            <div className="flex items-center justify-between">
              <span>Estimated fetch time:</span>
              <span className="font-semibold gradient-text">
                ~{estimatedTime} minute{estimatedTime !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on {estimatedRequests} requests at ~{(config.tokenBucket.refillRate * 60).toFixed(0)} requests/minute
            </div>
          </AlertDescription>
        </Alert>

        {/* Current Config Summary */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border/40">
          <div className="flex justify-between">
            <span>Request Rate:</span>
            <span className="font-medium">~{(config.tokenBucket.refillRate * 60).toFixed(0)} req/min</span>
          </div>
          <div className="flex justify-between">
            <span>Burst Capacity:</span>
            <span className="font-medium">{config.tokenBucket.capacity} requests</span>
          </div>
          <div className="flex justify-between">
            <span>Concurrent Districts:</span>
            <span className="font-medium">{config.maxConcurrentDistricts || 5}</span>
          </div>
          <div className="flex justify-between">
            <span>Min Delay:</span>
            <span className="font-medium">{config.tokenBucket.minWaitTime}ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
