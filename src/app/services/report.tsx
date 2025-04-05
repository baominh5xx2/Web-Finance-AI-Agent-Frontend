import axios from 'axios';

// Function to get stock report PDF
const getStockReportPDF = async (symbol = 'NKG') => {
  try {
    console.log('Fetching report for symbol:', symbol);
    // Directly use NKG as the fixed symbol with more detailed error logging
    const response = await axios.get(`http://localhost:8000/api/v2/pdf/NKG`, {
      responseType: 'blob', // Important for PDF files
    });
    
    console.log('Report fetched successfully, content type:', response.headers['content-type']);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock report:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Status text:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
    }
    throw error;
  }
};

// Export the service functions
export const reportService = {
  getStockReportPDF,
};