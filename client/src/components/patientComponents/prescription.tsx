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
  rxSection: {
    marginTop: 20,
    fontSize: 24,
    color: teal800,
    marginBottom: 10,
  },
  prescriptionSection: {
    marginTop: 10,
    fontSize: 12,
  },
  medicationItem: {
    marginBottom: 5,
  },
  footerWave: {
    marginTop: 30,
    width: '100%',
    height: 50,
  },
});

interface PrescriptionTemplateProps {
  prescription: Prescription;
}

export const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({ prescription }) => {

  const medications = Array.isArray(prescription.medications)
    ? prescription.medications
    : typeof prescription.medications === 'string'
      ? prescription.medications.split('\n')
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
          <Text>Name: {prescription.patientId?.name || "N/A"}</Text>
          <Text>Age: {prescription.patientId?.age || "N/A"}</Text>
          <Text>Sex: {prescription.patientId?.gender || "N/A"}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>

  

        {/* Prescription Content */}
        <View style={styles.prescriptionSection}>
          <Text style={{ fontWeight: 'bold' }}>Diagnosis:</Text>
          <Text>{prescription.diagnosis || "N/A"}</Text>

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Medications:</Text>
          {medications.length > 0 ? (
            medications.map((medication, index) => (
              <Text key={index} style={styles.medicationItem}>
                {medication.trim()}
              </Text>
            ))
          ) : (
            <Text>N/A</Text>
          )}

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Instructions:</Text>
          <Text>{prescription.instructions || "N/A"}</Text>
        </View>

      
      </Page>
    </Document>
  );
};
