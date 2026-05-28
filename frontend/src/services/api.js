import axios from 'axios';

// Use the env variable so the URL can be changed without touching source code.
// Falls back to localhost:8000 for local development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // ── Patients ──────────────────────────────────────────────────────────
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

    // ── Sessions ──────────────────────────────────────────────────────────
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
            // Backend expects: { patient_id: int, notes?: string }
            const response = await apiClient.post('/api/sessions/', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    },

    // ── Measurements ──────────────────────────────────────────────────────
    /**
     * Save a batch of joint measurements for a completed session.
     * @param {number} sessionId
     * @param {Array<{joint_name: string, angle: number, status: string}>} joints
     */
    saveMeasurements: async (sessionId, joints) => {
        try {
            const payload = joints.map((j) => ({
                session_id: sessionId,
                joint_name: j.joint_name,
                angle: j.angle,
                status: j.status,
            }));
            const response = await apiClient.post('/api/measurements/', payload);
            return response.data;
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw error;
        }
    },

    getMeasurements: async (sessionId) => {
        try {
            const response = await apiClient.get(`/api/measurements/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching measurements for session ${sessionId}:`, error);
            throw error;
        }
    },
};

// Export the base URL so other files (e.g. for window.open links) can use it too
export const API_URL = API_BASE_URL;

export default api;
