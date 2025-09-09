import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'tasks' | 'expenses';
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onSuccess, mode = 'tasks' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file || !adminPassword) {
      toast({
        title: "Missing information",
        description: "Please select a CSV file and enter the admin password.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Upload to backend
      const importResult = mode === 'expenses'
        ? await apiClient.bulkImportExpenses(fileContent, adminPassword)
        : await apiClient.bulkImportTasks(fileContent, adminPassword);
      
      setResult(importResult);
      
      if (importResult.success > 0) {
        toast({
          title: "Upload successful!",
          description: mode === 'expenses'
            ? `Successfully imported ${importResult.success} expenses.`
            : `Successfully imported ${importResult.success} tasks.`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Upload failed",
          description: "No tasks were imported. Check the errors below.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setAdminPassword('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {mode === 'expenses' ? 'Upload CSV Expenses' : 'Upload CSV Tasks'}
          </CardTitle>
          <CardDescription>
            {mode === 'expenses'
              ? 'Upload your expense/income data from a CSV file. The system will automatically convert your data format.'
              : 'Upload your task data from a CSV file. The system will automatically convert your data format.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Admin Password */}
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={isUploading}
            />
          </div>

          {/* Note about required type column for expenses uploads */}
          {mode === 'expenses' && (
            <div className="text-xs text-muted-foreground">
              Add a 'type' column in your CSV with values 'income' or 'expense' per row.
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Results</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.totalRows}</div>
                  <div className="text-sm text-blue-600">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-sm text-green-600">Successfully Imported</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Completed Tasks</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{result.summary.completedTasks}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Pending Tasks</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{result.summary.pendingTasks}</div>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Errors encountered:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {result.errors.slice(0, 10).map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>... and {result.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button 
                onClick={handleUpload} 
                disabled={!file || !adminPassword || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUploadModal;
