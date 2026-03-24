import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataListing from '../DataListing';
import * as api from '../../services/api';

vi.mock('../../services/api');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DataListing Component', () => {
  const mockData = [
    {
      id: 1,
      filename: 'sample1.pdf',
      original_name: 'sample1.pdf',
      file_size: 1024,
      uploaded_at: '2024-03-23T10:00:00Z',
      row_count: 5,
      status: 'completed',
      rows: [
        { Name: 'John', Age: '30', City: 'NYC' },
        { Name: 'Jane', Age: '25', City: 'LA' },
      ],
    },
    {
      id: 2,
      filename: 'sample2.pdf',
      original_name: 'sample2.pdf',
      file_size: 2048,
      uploaded_at: '2024-03-23T11:00:00Z',
      row_count: 3,
      status: 'completed',
      rows: [
        { Product: 'Laptop', Price: '$1000' },
        { Product: 'Mouse', Price: '$20' },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(api.getAllData).mockImplementation(() => new Promise(() => {}));
    
    render(<DataListing />);
    
    // Check for loading spinner by class name
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays data items after successful fetch', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
      expect(screen.getByText('sample2.pdf')).toBeInTheDocument();
      expect(screen.getByText(/Extracted Data \(2\)/i)).toBeInTheDocument();
    });
  });

  it('displays row count for each item', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('5 rows')).toBeInTheDocument();
      expect(screen.getByText('3 rows')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data is available', async () => {
    vi.mocked(api.getAllData).mockResolvedValue([]);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText(/No data uploaded yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload a PDF to get started/i)).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    vi.mocked(api.getAllData).mockRejectedValue(new Error('Network error'));
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('expands and collapses data rows on click', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
    });
    
    const firstItem = screen.getByText('sample1.pdf').closest('div');
    await userEvent.click(firstItem!);
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('NYC')).toBeInTheDocument();
    });
    
    await userEvent.click(firstItem!);
    
    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeInTheDocument();
    });
  });

  it('displays table headers correctly when expanded', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
    });
    
    const firstItem = screen.getByText('sample1.pdf').closest('div');
    await userEvent.click(firstItem!);
    
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    await userEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(api.getAllData).toHaveBeenCalledTimes(2);
    });
  });

  it('displays formatted dates for uploaded files', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      // Verify both files are displayed
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
      expect(screen.getByText('sample2.pdf')).toBeInTheDocument();
      // Date should be formatted and visible (contains "Mar" and "2024")
      const dateElements = screen.getAllByText(/Mar.*2024/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('handles multiple items expansion independently', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
      expect(screen.getByText('sample2.pdf')).toBeInTheDocument();
    });
    
    const firstItem = screen.getByText('sample1.pdf').closest('div');
    await userEvent.click(firstItem!);
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
    
    const secondItem = screen.getByText('sample2.pdf').closest('div');
    await userEvent.click(secondItem!);
    
    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });

  it('prevents duplicate API calls on mount', async () => {
    vi.mocked(api.getAllData).mockResolvedValue(mockData);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('sample1.pdf')).toBeInTheDocument();
    });
    
    expect(api.getAllData).toHaveBeenCalledTimes(1);
  });

  it('handles empty rows array gracefully', async () => {
    const dataWithEmptyRows = [
      {
        id: 1,
        filename: 'empty.pdf',
        original_name: 'empty.pdf',
        file_size: 512,
        uploaded_at: '2024-03-23T10:00:00Z',
        row_count: 0,
        status: 'completed',
        rows: [],
      },
    ];
    
    vi.mocked(api.getAllData).mockResolvedValue(dataWithEmptyRows);
    
    render(<DataListing />);
    
    await waitFor(() => {
      expect(screen.getByText('empty.pdf')).toBeInTheDocument();
    });
    
    const item = screen.getByText('empty.pdf').closest('div');
    await userEvent.click(item!);
    
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
