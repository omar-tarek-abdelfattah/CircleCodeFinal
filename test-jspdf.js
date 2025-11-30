
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function testImport() {
    try {
        console.log('Importing jspdf...');
        const jsPDFModule = await import('jspdf');
        console.log('Module keys:', Object.keys(jsPDFModule));

        // Simulate the fix logic
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;
        console.log('Resolved jsPDF type:', typeof jsPDF);

        if (typeof jsPDF !== 'function') {
            throw new Error('Failed to load jsPDF constructor');
        }

        try {
            const doc = new jsPDF();
            console.log('Successfully created jsPDF instance with robust logic');
        } catch (e) {
            console.error('Failed to instantiate jsPDF:', e);
        }

    } catch (error) {
        console.error('Import failed:', error);
    }
}

testImport();
