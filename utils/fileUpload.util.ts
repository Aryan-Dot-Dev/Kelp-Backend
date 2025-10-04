import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

interface FilePickResult {
    success: boolean;
    file?: {
        uri: string;
        name: string;
        size: number;
        mimeType: string;
    };
    error?: string;
}

/**
 * Pick a PDF file using Expo DocumentPicker
 * @returns Promise with file details or error
 */
export async function pickPDFFile(): Promise<FilePickResult> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
            multiple: false
        });

        if (result.canceled) {
            return {
                success: false,
                error: 'File selection cancelled'
            };
        }

        const selectedFile = result.assets[0];

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (selectedFile.size && selectedFile.size > maxSize) {
            Alert.alert('File Too Large', 'Please select a PDF file smaller than 50MB');
            return {
                success: false,
                error: 'File size exceeds 50MB limit'
            };
        }

        return {
            success: true,
            file: {
                uri: selectedFile.uri,
                name: selectedFile.name,
                size: selectedFile.size || 0,
                mimeType: selectedFile.mimeType || 'application/pdf'
            }
        };
    } catch (error: any) {
        console.error('File picker error:', error);
        return {
            success: false,
            error: error.message || 'Failed to pick file'
        };
    }
}

/**
 * Upload a file to the server
 * @param fileUri - Local file URI
 * @param fileName - File name
 * @param endpoint - API endpoint
 * @param token - Auth token
 * @param additionalData - Additional form data
 * @returns Upload result with file URL and key
 */
export async function uploadFile(
    fileUri: string,
    fileName: string,
    endpoint: string,
    token: string,
    additionalData: Record<string, any> = {}
): Promise<{success: boolean; data?: any; error?: string}> {
    try {
        const formData = new FormData();
        
        // Add file
        formData.append('file', {
            uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
            name: fileName,
            type: 'application/pdf'
        } as any);

        // Add additional data
        Object.keys(additionalData).forEach(key => {
            if (additionalData[key] !== undefined && additionalData[key] !== null) {
                formData.append(key, additionalData[key].toString());
            }
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                success: true,
                data
            };
        } else {
            return {
                success: false,
                error: data.error || 'Upload failed'
            };
        }
    } catch (error: any) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

/**
 * Format file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Open a file URL in browser or download
 * @param fileUrl - File URL from File.io
 */
export async function openFile(fileUrl: string) {
    try {
        const { Linking } = await import('react-native');
        const canOpen = await Linking.canOpenURL(fileUrl);
        
        if (canOpen) {
            await Linking.openURL(fileUrl);
        } else {
            Alert.alert('Error', 'Cannot open file URL');
        }
    } catch (error) {
        console.error('Error opening file:', error);
        Alert.alert('Error', 'Failed to open file');
    }
}
