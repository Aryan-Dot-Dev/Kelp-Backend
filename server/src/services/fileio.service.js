const FormData = require('form-data');
const fetch = require('node-fetch');

const FILE_IO_BASE_URL = 'https://file.io';

/**
 * Upload a file to File.io
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {object} options - Upload options
 * @param {string} options.expires - Expiration time (e.g., '1w', '1m', '1y')
 * @param {number} options.maxDownloads - Maximum number of downloads
 * @param {boolean} options.autoDelete - Auto-delete after max downloads
 * @returns {Promise<{success: boolean, key: string, link: string, expires: string}>}
 */
async function uploadFile(fileBuffer, fileName, options = {}) {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: fileName,
            contentType: 'application/pdf'
        });

        // Add optional parameters
        if (options.expires) {
            formData.append('expires', options.expires);
        }
        if (options.maxDownloads) {
            formData.append('maxDownloads', options.maxDownloads.toString());
        }
        if (options.autoDelete !== undefined) {
            formData.append('autoDelete', options.autoDelete.toString());
        }

        const response = await fetch(`${FILE_IO_BASE_URL}/`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                success: true,
                key: data.key,
                link: data.link,
                expires: data.expires,
                size: data.size,
                name: data.name
            };
        } else {
            throw new Error(data.message || 'Failed to upload file');
        }
    } catch (error) {
        console.error('File.io upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
    }
}

/**
 * Get file metadata from File.io
 * @param {string} key - File key
 * @returns {Promise<object>}
 */
async function getFileMetadata(key) {
    try {
        const response = await fetch(`${FILE_IO_BASE_URL}/${key}`, {
            method: 'HEAD'
        });

        if (response.ok) {
            return {
                success: true,
                exists: true,
                contentType: response.headers.get('content-type'),
                size: response.headers.get('content-length')
            };
        } else {
            return {
                success: false,
                exists: false,
                error: 'File not found or expired'
            };
        }
    } catch (error) {
        console.error('File.io metadata error:', error);
        return {
            success: false,
            exists: false,
            error: error.message
        };
    }
}

/**
 * Delete a file from File.io
 * @param {string} key - File key
 * @returns {Promise<{success: boolean}>}
 */
async function deleteFile(key) {
    try {
        const response = await fetch(`${FILE_IO_BASE_URL}/${key}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                success: true,
                message: 'File deleted successfully'
            };
        } else {
            throw new Error(data.message || 'Failed to delete file');
        }
    } catch (error) {
        console.error('File.io delete error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * List files (requires authentication - may not be available in free tier)
 * @param {object} options - List options
 * @returns {Promise<object>}
 */
async function listFiles(options = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (options.search) queryParams.append('search', options.search);
        if (options.sort) queryParams.append('sort', options.sort);
        if (options.offset) queryParams.append('offset', options.offset.toString());
        if (options.limit) queryParams.append('limit', options.limit.toString());

        const url = `${FILE_IO_BASE_URL}/?${queryParams.toString()}`;
        const response = await fetch(url);

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                success: true,
                files: data.nodes || []
            };
        } else {
            throw new Error(data.message || 'Failed to list files');
        }
    } catch (error) {
        console.error('File.io list error:', error);
        return {
            success: false,
            error: error.message,
            files: []
        };
    }
}

/**
 * Validate file before upload
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {object} options - Validation options
 * @returns {{valid: boolean, error?: string}}
 */
function validateFile(fileBuffer, fileName, options = {}) {
    const maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    const allowedTypes = options.allowedTypes || ['.pdf'];

    // Check file size
    if (fileBuffer.length > maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
        };
    }

    // Check file extension
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
        return {
            valid: false,
            error: `File type ${fileExt} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    return { valid: true };
}

module.exports = {
    uploadFile,
    getFileMetadata,
    deleteFile,
    listFiles,
    validateFile
};
