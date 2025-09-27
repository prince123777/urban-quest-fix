import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Upload,
  File,
  Image,
  Video,
  X,
  Loader2,
  Camera,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FileUploadProps {
  bucket: 'issue-photos' | 'issue-videos' | 'issue-documents' | 'government-ids' | 'proof-of-fix';
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onFilesUploaded: (urls: string[]) => void;
  existingFiles?: string[];
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

const FileUpload = ({
  bucket,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  onFilesUploaded,
  existingFiles = [],
  className = ''
}: FileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    const fileName = `${user?.id}/${timestamp}-${fileId}-${file.name}`;

    // Create file object for tracking
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success', progress: 100, url: publicUrl }
          : f
      ));

      // Record in media_uploads table
      await supabase.from('media_uploads').insert({
        user_id: user?.id,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        upload_type: bucket
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));

      throw error;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload files',
        variant: 'destructive'
      });
      return;
    }

    const newFiles = Array.from(fileList);
    const totalFiles = files.length + existingFiles.length + newFiles.length;

    if (totalFiles > maxFiles) {
      toast({
        title: 'Too Many Files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: 'File Validation Errors',
        description: errors.join('\n'),
        variant: 'destructive'
      });
    }

    if (validFiles.length === 0) return;

    try {
      // Upload files
      const uploadPromises = validFiles.map(uploadFile);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const successfulUrls = uploadedUrls.filter(url => url);
      
      if (successfulUrls.length > 0) {
        onFilesUploaded([...existingFiles, ...successfulUrls]);
        toast({
          title: 'Upload Successful',
          description: `${successfulUrls.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'Some files failed to upload',
        variant: 'destructive'
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // This would require storing the original File object
    // For now, just remove the failed upload
    removeFile(fileId);
    toast({
      title: 'Retry Upload',
      description: 'Please select the file again to retry upload',
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`cursor-pointer transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-dashed border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Upload Files'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Maximum {maxFiles} files, up to {maxSizeMB}MB each</p>
            <p>Supported: {acceptedTypes.join(', ')}</p>
          </div>
          <Button variant="outline" className="mt-4">
            <Camera className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaded Files</h4>
            <div className="space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Uploading...</span>
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(file.id)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;