import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, RefreshCw, Cloud, Database, Bot } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const GoogleSheetsIntegration = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/google-sheets/status');
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch Google Sheets status:', error);
      setStatus({ available: false, error: 'Failed to connect' });
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/google-sheets/sync', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Data synced to Google Sheets successfully!');
        fetchStatus(); // Refresh status
      } else {
        alert('❌ Sync failed: ' + data.error);
      }
    } catch (error) {
      alert('❌ Sync failed: ' + error.message);
    }
    setSyncing(false);
  };

  const handleSetup = async () => {
    setSetupMode(true);
    try {
      const response = await fetch('/api/google-sheets/setup', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Google Sheets integration setup successfully!');
        fetchStatus(); // Refresh status
      } else {
        alert('❌ Setup failed: ' + data.error);
      }
    } catch (error) {
      alert('❌ Setup failed: ' + error.message);
    }
    setSetupMode(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Sheets Integration
        </CardTitle>
        <CardDescription>
          Real-time sync with Google Drive • Owner: hemanth.gajjala88@gmail.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database Sync</span>
            <Badge variant={status?.sync_initialized ? "default" : "secondary"}>
              {status?.sync_initialized ? "Ready" : "Not Setup"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="text-sm">AI Chat</span>
            <Badge variant={status?.ai_chat_initialized ? "default" : "secondary"}>
              {status?.ai_chat_initialized ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <span className="text-sm">Google Sheets</span>
            <Badge variant={status?.available ? "default" : "destructive"}>
              {status?.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>

        {/* Spreadsheet Link */}
        {status?.spreadsheet_url && (
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Your data is live in Google Sheets</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(status.spreadsheet_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Sheets
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Required */}
        {!status?.available && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p>Google Sheets integration requires setup:</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Download Google credentials from Cloud Console</li>
                  <li>Place google_credentials.json in backend folder</li>
                  <li>Click "Setup Integration" below</li>
                </ol>
                <Button 
                  onClick={handleSetup} 
                  disabled={setupMode}
                  className="mt-2"
                >
                  {setupMode ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Setup Integration'
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {status?.available && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSync} 
              disabled={syncing}
              variant="outline"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
            
            <Button 
              onClick={fetchStatus}
              variant="outline"
              size="sm"
            >
              Refresh Status
            </Button>
          </div>
        )}

        {/* Last Sync Info */}
        {status?.last_sync && (
          <div className="text-sm text-muted-foreground">
            Last sync: {new Date(status.last_sync).toLocaleString()}
          </div>
        )}

        {/* Error Display */}
        {status?.error && (
          <Alert variant="destructive">
            <AlertDescription>
              Error: {status.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsIntegration;
