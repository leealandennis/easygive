import api from './api';

export const taxService = {
  getSummary: async (year?: number): Promise<{
    taxYear: number;
    hasRecord: boolean;
    summary: {
      totalDonations: number;
      totalTaxDeductible: number;
      donationCount: number;
      uniqueCharities: number;
    };
    documents: any;
    status?: string;
    generatedAt?: string;
  }> => {
    const params = year ? `?year=${year}` : '';
    const res = await api.get(`/tax/summary${params}`);
    return res.data.data;
  },

  generate: async (taxYear: number): Promise<any> => {
    const res = await api.post('/tax/records/generate', { taxYear });
    return res.data.data;
  },

  getYears: async (): Promise<number[]> => {
    const res = await api.get('/tax/years');
    return res.data.data;
  },

  getDownloadInfo: async (recordId: string, documentType: 'scheduleA' | 'receipt' | 'summary'): Promise<{
    downloadUrl: string;
    generatedAt: string;
  }> => {
    const res = await api.get(`/tax/records/${recordId}/download/${documentType}`);
    return res.data.data;
  },

  downloadFile: async (recordId: string, documentType: 'scheduleA' | 'receipt' | 'summary'): Promise<Blob> => {
    const res = await api.get(`/tax/records/${recordId}/download/${documentType}/file`, { responseType: 'blob' });
    return res.data as Blob;
  }
};





