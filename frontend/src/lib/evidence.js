// src/lib/evidence.js
import api from "./api";

export const getEvidence = async (params = {}, signal) => {
    try {
        const options = { params };
        if (signal) {
            options.signal = signal;
        }

        const res = await api.get("/evidence", options);

        // Validate response structure
        if (!res.data || typeof res.data !== 'object') {
            throw new Error('Invalid response format from server');
        }

        return {
            evidences: res.data.evidences || [],
            total: res.data.total || 0,
            page: res.data.page || 1,
            limit: res.data.limit || 20
        };
    } catch (error) {
        // Handle different error types
        if (error.name === 'AbortError') {
            throw new Error('Request was cancelled');
        }

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            if (status === 401) {
                throw new Error('Authentication required');
            } else if (status === 403) {
                throw new Error('Access denied');
            } else if (status === 404) {
                throw new Error('Evidence not found');
            } else if (status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your connection.');
        }

        // Default error
        throw new Error(error.message || 'Failed to fetch evidence');
    }
};

export const uploadEvidence = async (formData, onUploadProgress, signal) => {
    try {
        const config = {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 300000, // 5 minutes for large file uploads
        };

        if (onUploadProgress) {
            config.onUploadProgress = onUploadProgress;
        }

        if (signal) {
            config.signal = signal;
        }

        const res = await api.post("/evidence/upload", formData, config);
        return res.data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Upload was cancelled');
        } else if (error.response?.status === 413) {
            throw new Error('File too large. Please select a smaller file.');
        } else if (error.response?.status === 415) {
            throw new Error('File type not supported.');
        }
        throw new Error(error.message || 'Failed to upload evidence');
    }
};

export const updateEvidence = async (id, data) => {
    try {
        if (!id) {
            throw new Error('Evidence ID is required');
        }

        const res = await api.put(`/evidence/${id}`, data);
        return res.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Evidence not found');
        }
        throw new Error(error.message || 'Failed to update evidence');
    }
};

export const deleteEvidence = async (id) => {
    try {
        if (!id) {
            throw new Error('Evidence ID is required');
        }

        const res = await api.delete(`/evidence/${id}`);
        return res.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Evidence not found');
        }
        throw new Error(error.message || 'Failed to delete evidence');
    }
};