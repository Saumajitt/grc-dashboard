// src/components/EvidenceUploadModal.jsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { uploadEvidence } from "@/lib/evidence";
import {
    Upload,
    FileText,
    Image,
    BookOpen,
    Package,
    X,
    Check,
    AlertCircle,
    File
} from "lucide-react";

const categoryConfig = {
    policy: {
        icon: BookOpen,
        color: "blue",
        label: "Policy Document",
        description: "Organizational policies and procedures"
    },
    diagram: {
        icon: Image,
        color: "purple",
        label: "Diagram",
        description: "Visual diagrams and charts"
    },
    doc: {
        icon: FileText,
        color: "emerald",
        label: "Document",
        description: "General documents and files"
    },
    other: {
        icon: Package,
        color: "orange",
        label: "Other",
        description: "Miscellaneous files"
    }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5; // Limit number of files
const UPLOAD_TIMEOUT = 60000; // 60 seconds

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf': return '📄';
        case 'doc':
        case 'docx': return '📝';
        case 'xls':
        case 'xlsx': return '📊';
        case 'ppt':
        case 'pptx': return '📽️';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif': return '🖼️';
        default: return '📋';
    }
};

export default function EvidenceUploadModal({ onSuccess }) {
    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            category: 'doc'
        }
    });

    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Use ref to track upload controller for cancellation
    const uploadController = useRef(null);

    const selectedCategory = watch('category');

    // Validate file before adding
    const validateFile = (file) => {
        const errors = [];

        if (file.size > MAX_FILE_SIZE) {
            errors.push(`File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
        }

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|txt|csv|png|jpg|jpeg|gif)$/i)) {
            errors.push(`File type "${file.type}" is not supported.`);
        }

        return errors;
    };

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError(null);

        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles.flatMap(rejection =>
                rejection.errors.map(error =>
                    `${rejection.file.name}: ${error.message}`
                )
            );
            setError(`Upload failed: ${errors.join('. ')}`);
            return;
        }

        // Limit total number of files
        const currentFileCount = files.length;
        const newFileCount = acceptedFiles.length;

        if (currentFileCount + newFileCount > MAX_FILES) {
            setError(`Too many files. Maximum ${MAX_FILES} files allowed. Currently have ${currentFileCount} files.`);
            return;
        }

        // Validate each file
        const validationErrors = [];
        const validFiles = [];

        acceptedFiles.forEach(file => {
            const errors = validateFile(file);
            if (errors.length > 0) {
                validationErrors.push(...errors);
            } else {
                validFiles.push(file);
            }
        });

        if (validationErrors.length > 0) {
            setError(validationErrors.join(' '));
            return;
        }

        // Add valid files
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        setValue("files", updatedFiles);
        setDragActive(false);
    }, [files, setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'text/*': ['.txt', '.csv']
        },
        maxSize: MAX_FILE_SIZE,
        multiple: true,
        disabled: loading
    });

    const removeFile = useCallback((index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setValue("files", newFiles);
    }, [files, setValue]);

    const cancelUpload = () => {
        if (uploadController.current) {
            uploadController.current.abort();
            uploadController.current = null;
        }
        setLoading(false);
        setProgress(0);
    };

    const onSubmit = async (data) => {
        if (files.length === 0) {
            setError("Please select at least one file to upload");
            return;
        }

        if (!data.title?.trim()) {
            setError("Please enter a title for your evidence");
            return;
        }

        setError(null);
        setLoading(true);
        setProgress(0);

        // Create abort controller for timeout
        uploadController.current = new AbortController();
        const timeoutId = setTimeout(() => {
            uploadController.current?.abort();
            setError("Upload timed out. Please try again with smaller files.");
            setLoading(false);
            setProgress(0);
        }, UPLOAD_TIMEOUT);

        try {
            const formData = new FormData();
            formData.append("title", data.title.trim());
            formData.append("category", data.category || 'doc');

            // Add files to FormData
            files.forEach((file) => {
                formData.append("files", file);
            });

            await uploadEvidence(formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            }, uploadController.current.signal);

            clearTimeout(timeoutId);

            // Success - show completion briefly
            setProgress(100);

            // Reset form after brief delay
            setTimeout(() => {
                reset();
                setFiles([]);
                setProgress(0);
                uploadController.current = null;
                onSuccess?.();
            }, 500);

        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                setError("Upload was cancelled");
            } else if (err.response?.status === 413) {
                setError("File too large. Please select smaller files.");
            } else if (err.response?.status === 415) {
                setError("File type not supported.");
            } else {
                setError(err.response?.data?.message || err.message || "Upload failed. Please try again.");
            }
            setProgress(0);
        } finally {
            uploadController.current = null;
            setLoading(false);
        }
    };

    const currentConfig = categoryConfig[selectedCategory];
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-400 font-medium">Upload Error</p>
                        <p className="text-red-300 text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-white">
                        Evidence Title *
                    </Label>
                    <Input
                        id="title"
                        {...register("title", {
                            required: "Title is required",
                            minLength: { value: 3, message: "Title must be at least 3 characters" }
                        })}
                        placeholder="Enter a descriptive title for your evidence..."
                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:bg-slate-800 focus:border-blue-500/50"
                        disabled={loading}
                    />
                    <p className="text-xs text-slate-400">Choose a clear, descriptive title that will help you find this evidence later.</p>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-white">Category *</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(categoryConfig).map(([value, config]) => {
                            const Icon = config.icon;
                            const isSelected = selectedCategory === value;

                            return (
                                <label
                                    key={value}
                                    className={`relative flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                        } ${isSelected
                                            ? 'border-blue-500/50 bg-blue-500/10'
                                            : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={value}
                                        {...register("category")}
                                        className="sr-only"
                                        disabled={loading}
                                    />
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-500/20' : 'bg-slate-700/50'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                            {config.label}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{config.description}</p>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* File Upload Area */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-white">Files *</Label>

                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${isDragActive || dragActive
                                ? "border-blue-500/50 bg-blue-500/5"
                                : "border-slate-600/50 bg-slate-800/20 hover:bg-slate-800/30"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center space-y-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDragActive ? 'bg-blue-500/20' : 'bg-slate-700/50'
                                }`}>
                                <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {loading ? "Upload in progress..." :
                                        isDragActive ? "Drop files here" :
                                            "Drag & drop files here"}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                    {loading ? "Please wait..." :
                                        <>or <span className="text-blue-400 hover:text-blue-300">browse</span> to choose files</>}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                                <span>PDF, DOC, XLS, Images</span>
                                <span>•</span>
                                <span>Max {formatFileSize(MAX_FILE_SIZE)} per file</span>
                                <span>•</span>
                                <span>Max {MAX_FILES} files</span>
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white">
                                    Selected Files ({files.length}/{MAX_FILES})
                                </p>
                                <p className="text-xs text-slate-400">
                                    Total: {formatFileSize(totalSize)}
                                </p>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <span className="text-lg">{getFileIcon(file.name)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{file.name}</p>
                                                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            disabled={loading}
                                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {loading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Upload Progress</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-blue-400">{progress}%</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelUpload}
                                    className="text-red-400 hover:text-red-300 text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-800/50" />
                        <p className="text-xs text-slate-400">
                            Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 min-w-[120px]"
                        disabled={loading || files.length === 0}
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Upload Evidence</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}