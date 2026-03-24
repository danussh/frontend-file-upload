import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../FileUpload';
import * as api from '../../services/api';

vi.mock('../../services/api');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('FileUpload Component', () => {
  const mockOnUploadSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the upload component with drag and drop area', () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    expect(screen.getByText(/Drag and drop to upload the PDF file or/i)).toBeInTheDocument();
    expect(screen.getByText(/You can upload PDF files/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size is 10MB/i)).toBeInTheDocument();
  });

  it('shows upload button when file is selected', async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upload & Extract/i })).toBeInTheDocument();
    });
  });

  it('validates file type - rejects non-PDF files', async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    // File should not be selected
    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });
  });

  it('validates file size - rejects files larger than 10MB', async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, largeFile);
    
    // File should not be selected
    await waitFor(() => {
      expect(screen.queryByText('large.pdf')).not.toBeInTheDocument();
    });
  });

  it('handles successful file upload', async () => {
    const mockResponse = {
      success: true,
      message: 'File uploaded successfully',
      data: {
        uploadId: 123,
        originalName: 'test.pdf',
        rowCount: 5,
        headers: ['Column1', 'Column2'],
        rows: [['value1', 'value2']],
      },
    };
    
    vi.mocked(api.uploadPDF).mockResolvedValue(mockResponse);
    
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    const uploadButton = await screen.findByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(api.uploadPDF).toHaveBeenCalledWith(file);
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });

  it('handles upload error', async () => {
    vi.mocked(api.uploadPDF).mockRejectedValue(new Error('Upload failed'));
    
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    const uploadButton = await screen.findByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(uploadButton);
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('allows removing selected file', async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByRole('button', { name: '' });
    await userEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      expect(screen.getByText(/Drag and drop to upload the PDF file or/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during upload', async () => {
    let resolveUpload: any;
    vi.mocked(api.uploadPDF).mockImplementation(() => new Promise(resolve => {
      resolveUpload = resolve;
    }));
    
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    const uploadButton = await screen.findByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(uploadButton);
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
      expect(uploadButton).toBeDisabled();
    });
    
    // Cleanup: resolve the promise
    if (resolveUpload) {
      resolveUpload({ success: true, message: 'Done', data: { uploadId: 1, originalName: 'test.pdf', rowCount: 0, headers: [], rows: [] } });
    }
  });

  it('renders drag and drop area', () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);
    
    // Verify drag and drop UI elements are present
    expect(screen.getByText(/Drag and drop to upload the PDF file or/i)).toBeInTheDocument();
    expect(screen.getByText(/You can upload PDF files/i)).toBeInTheDocument();
    
    // Verify file input exists
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('accept', '.pdf,application/pdf');
  });
});
