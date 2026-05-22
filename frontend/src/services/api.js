import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Patients Endpoints
    getPatients: async () => {
        try {
            const response = await apiClient.get('/api/patients/');
            return response.data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    getPatient: async (patientId) => {
        try {
            const response = await apiClient.get(`/api/patients/${patientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching patient ${patientId}:`, error);
            throw error;
        }
    },

    createPatient: async (patientData) => {
        try {
            // Backend expects: { name: string, age: number, condition: string }
            const response = await apiClient.post('/api/patients/', patientData);
            return response.data;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    },

    // Sessions & ROM measurements
    getPatientSessions: async (patientId) => {
        try {
            const response = await apiClient.get(`/api/sessions/${patientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sessions for patient ${patientId}:`, error);
            throw error;
        }
    },

    createSession: async (sessionData) => {
        try {
            // Backend expects: { patient_id: int, notes: string, date?: string }
            const response = await apiClient.post('/api/sessions/', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }
};

export default api;
