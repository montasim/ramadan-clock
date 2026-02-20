/**
 * Cron Status Widget Component
 * Displays the status of the automated prayer time updates
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { getCronStatus, triggerCronJob } from '@/actions/cron';
import { toast } from 'sonner';

interface CronStatusData {
  lastExecution: {
    id: string;
    executedAt: Date | string;
    success: boolean;
    duration: number;
    locationsProcessed: number;
    entriesProcessed: number;
    entriesCreated: number;
    entriesUpdated: number;
    entriesFailed: number;
    errors: string | null;
  } | null;
  isHealthy: boolean;
  nextScheduledUpdate: string;
}

export function CronStatusWidget() {
  const [status, setStatus] = useState<CronStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const result = await getCronStatus();
      if (result.success && result.data) {
        setStatus(result.data);
      } else {
        toast.error('Failed to fetch cron status');
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
      toast.error('Failed to fetch cron status');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const result = await triggerCronJob();
      if (result.success) {
        toast.success('Prayer time update triggered successfully');
        await fetchStatus();
      } else {
        toast.error(result.error || 'Failed to trigger update');
      }
    } catch (error) {
      console.error('Error triggering cron job:', error);
      toast.error('Failed to trigger update');
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const formatDate = (dateString: Date | string) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Prayer Time Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Loading status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = status?.isHealthy ?? true;
  const lastExecution = status?.lastExecution;

  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Prayer Time Sync
        </CardTitle>
        <Badge
          variant={isHealthy ? "default" : "destructive"}
          className={isHealthy ? "bg-emerald-500 hover:bg-emerald-600" : ""}
        >
          {isHealthy ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Healthy
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Error
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastExecution ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Update</span>
                <span className="font-medium">{formatDate(lastExecution.executedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{formatDuration(lastExecution.duration)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Locations</span>
                <span className="font-medium">{lastExecution.locationsProcessed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Entries</span>
                <span className="font-medium">
                  {lastExecution.entriesCreated} created, {lastExecution.entriesUpdated} updated
                </span>
              </div>
            </div>

            {lastExecution.errors && (
              <Alert variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3" />
                <AlertDescription className="ml-2">
                  {lastExecution.errors}
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-2 border-t border-border/60">
              <Button
                onClick={handleTrigger}
                disabled={triggering}
                className="w-full btn-gradient rounded-full gap-2 font-semibold"
              >
                {triggering ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Update Now
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-1">No sync history yet</p>
              <p className="text-xs">Trigger the first update to get started</p>
            </div>
            <Button
              onClick={handleTrigger}
              disabled={triggering}
              className="w-full btn-gradient rounded-full gap-2 font-semibold"
            >
              {triggering ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Start Initial Sync
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
