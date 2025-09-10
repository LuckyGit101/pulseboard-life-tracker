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
    if (!file) {
      toast({
        title: "Missing information",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const fileContent = await file.text();

      // Robust CSV parsing (supports quoted commas and CRLF)
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (inQuotes) {
            if (ch === '"') {
              if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
              else { inQuotes = false; }
            } else { current += ch; }
          } else {
            if (ch === '"') inQuotes = true; else if (ch === ',') { result.push(current); current = ''; } else current += ch;
          }
        }
        result.push(current);
        return result;
      };
      const lines = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
      const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows: any[] = [];
      const normalizeDate = (s?: string) => {
        if (!s) return undefined as any;
        let t = String(s).replace(/\u00A0/g, ' ').trim();
        const mmm: Record<string,string> = { jan:'01',january:'01', feb:'02',february:'02', mar:'03',march:'03', apr:'04',april:'04', may:'05', jun:'06',june:'06', jul:'07',july:'07', aug:'08',august:'08', sep:'09',sept:'09',september:'09', oct:'10',october:'10', nov:'11',november:'11', dec:'12',december:'12' };
        const dm = t.match(/^(\d{1,2})-([A-Za-z]{3,9})-(\d{4})$/);
        if (dm) {
          const dd = String(Number(dm[1])).padStart(2,'0');
          const mm = mmm[dm[2].toLowerCase()];
          const yyyy = dm[3];
          if (mm) return `${yyyy}-${mm}-${dd}`;
        }
        const sm = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (sm) {
          const dd = String(Number(sm[1])).padStart(2,'0');
          const mm = String(Number(sm[2])).padStart(2,'0');
          const yyyy = sm[3];
          return `${yyyy}-${mm}-${dd}`;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
        const dt = new Date(t);
        if (!isNaN(dt.getTime())) {
          const yyyy = dt.getUTCFullYear();
          const mm = String(dt.getUTCMonth() + 1).padStart(2,'0');
          const dd = String(dt.getUTCDate()).padStart(2,'0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return t;
      };
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length === 1 && cols[0].trim() === '') continue;
        const raw: any = {};
        headers.forEach((h, idx) => { raw[h] = (cols[idx] ?? '').trim(); });
        const cleaned: any = {
          name: (raw.name ?? '').trim(),
          categories: (raw.categories ?? '').trim(),
          points: (raw.points ?? '').trim(),
          status: String(raw.status ?? 'pending').toLowerCase(),
          date: normalizeDate(raw.date),
          description: (raw.description ?? '').trim(),
          duration: raw.duration !== undefined && String(raw.duration).trim() !== '' ? Number(String(raw.duration).trim()) : undefined,
        };
        rows.push(cleaned);
      }

      // Send in safe chunks to avoid payload limits
      const CHUNK_SIZE = 300;
      let totalImported = 0; let totalDuplicates = 0; let totalFailed = 0; const allErrors: string[] = [];
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const res = await apiClient.importTasksBatch(chunk, false);
        totalImported += res.imported || 0;
        totalDuplicates += res.duplicates || 0;
        totalFailed += res.failed || 0;
        if (res.errors?.length) allErrors.push(...res.errors);
      }
      const importResult = {
        success: totalImported,
        failed: totalFailed,
        errors: allErrors,
        summary: { totalRows: rows.length, completedTasks: 0, pendingTasks: 0 }
      };
      
      setResult(importResult);
      
      if (importResult.success > 0) {
        toast({
          title: "Upload successful!",
          description: `Successfully imported ${importResult.success} tasks (${totalDuplicates} duplicates skipped).`,
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

          {/* Admin Password removed */}

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
                disabled={!file || isUploading}
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
