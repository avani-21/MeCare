import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Prescription } from '@/type/doctor';
import Logo from '../../../public/logo.png';
import React from 'react';

const teal800 = '#00695c';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
  },
  hospitalDetails: {
    textAlign: 'right',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: teal800,
  },
  slogan: {
    fontSize: 10,
    color: teal800,
  },
  address: {
    fontSize: 8,
  },
  contact: {
    fontSize: 8,
  },
  website: {
    fontSize: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: teal800,
    paddingBottom: 5,
  },
  prescriptionSection: {
    marginTop: 10,
    fontSize: 12,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: teal800,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: teal800,
  },
  tableHeader: {
    backgroundColor: teal800,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
    textAlign: 'left',
  },
  tableColName: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: teal800,
  },
  tableColDosage: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: teal800,
  },
  tableColFrequency: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: teal800,
  },
  tableColDuration: {
    width: '20%',
  },
});

interface PrescriptionTemplateProps {
  prescription: Prescription;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({ prescription }) => {

  const medications: Medication[] = Array.isArray(prescription.medications) && prescription.medications.every(med => typeof med === 'object')
    ? prescription.medications
    : typeof prescription.medications === 'string'
      ? prescription.medications.split('\n').map(med => ({
          name: med.trim(),
          dosage: '',
          frequency: '',
          duration: '',
        }))
      : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src={Logo.src} />
          <View style={styles.hospitalDetails}>
            <Text style={styles.hospitalName}>MECARE</Text>
            <Text style={styles.slogan}>Your Health, Our Priority</Text>
            <Text style={styles.address}>
              Health Road, Near Calicut University, Thenhipalam, Kerala, 673635, India
            </Text>
            <Text style={styles.contact}>Phone: +1 8853254315</Text>
            <Text style={styles.website}>www.mecarewebsite.com</Text>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <Text>Name: {prescription.patientId?.name || 'N/A'}</Text>
          <Text>Age: {prescription.patientId?.age || 'N/A'}</Text>
          <Text>Sex: {prescription.patientId?.gender || 'N/A'}</Text>
        </View>

        {/* Prescription Content */}
        <View style={styles.prescriptionSection}>
          <Text style={{ fontWeight: 'bold' }}>Diagnosis:</Text>
          <Text>{prescription.diagnosis || 'N/A'}</Text>

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Medications:</Text>
          {medications.length > 0 ? (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, { backgroundColor: teal800 }]}>
                <View style={styles.tableColName}>
                  <Text style={styles.tableHeader}>Name</Text>
                </View>
                <View style={styles.tableColDosage}>
                  <Text style={styles.tableHeader}>Dosage</Text>
                </View>
                <View style={styles.tableColFrequency}>
                  <Text style={styles.tableHeader}>Frequency</Text>
                </View>
                <View style={styles.tableColDuration}>
                  <Text style={styles.tableHeader}>Duration</Text>
                </View>
              </View>
              {/* Table Rows */}
              {medications.map((medication, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableColName}>
                    <Text style={styles.tableCell}>{medication.name || 'N/A'}</Text>
                  </View>
                  <View style={styles.tableColDosage}>
                    <Text style={styles.tableCell}>{medication.dosage || 'N/A'}</Text>
                  </View>
                  <View style={styles.tableColFrequency}>
                    <Text style={styles.tableCell}>{medication.frequency || 'N/A'}</Text>
                  </View>
                  <View style={styles.tableColDuration}>
                    <Text style={styles.tableCell}>{medication.duration || 'N/A'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text>N/A</Text>
          )}

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Instructions:</Text>
          <Text>{prescription.instructions || 'N/A'}</Text>
        </View>
      </Page>
    </Document>
  );
};