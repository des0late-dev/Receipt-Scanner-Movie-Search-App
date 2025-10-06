

import { receiptEmitter } from '@/util/receiptEmitter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReceiptData {
  id: string;
  vendor_name?: string;
  date?: string;
  total_amount?: string;
  tax?: string;
  category?: string;
  imageUri?: string;
  timestamp: number;
}


export default function StoredReceipts() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
  loadReceipts(); 
  const listener = () => loadReceipts();
  receiptEmitter.addListener(listener);
  return () => receiptEmitter.removeListener(listener);
}, []);

  const loadReceipts = async () => {
    try {
      const receiptsJson = await AsyncStorage.getItem('receipts');
      if (receiptsJson) {
        const data = JSON.parse(receiptsJson);
        setReceipts(data);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const deleteReceipt = async (id: string) => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const receiptsJson = await AsyncStorage.getItem('receipts');
              if (receiptsJson) {
                const allReceipts = JSON.parse(receiptsJson);
                const updatedReceipts = allReceipts.filter((r: ReceiptData) => r.id !== id);
                await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
                setReceipts(updatedReceipts);
                Alert.alert('Success', 'Receipt deleted!');
              }
            } catch (error) {
              console.error('Error deleting receipt:', error);
              Alert.alert('Error', 'Failed to delete receipt');
            }
          }
        }
      ]
    );
  };

  const clearAllReceipts = () => {
    Alert.alert(
      'Clear All Receipts',
      'Are you sure you want to delete all receipts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('receipts');
              setReceipts([]);
              Alert.alert('Success', 'All receipts cleared!');
            } catch (error) {
              console.error('Error clearing receipts:', error);
              Alert.alert('Error', 'Failed to clear receipts');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Receipts</Text>
        {receipts.length > 0 && (
          <TouchableOpacity onPress={clearAllReceipts} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {receipts.length === 0 ? (
          <View style={styles.emptyContainer}>
           
            <Text style={styles.emptyTitle}>No Receipts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your saved receipts will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.receiptsContainer}>
            <Text style={styles.countText}>
              {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'}
            </Text>
            
            {receipts.map((receipt,index) => {

            
            
            return( 
              <View key={receipt.id ?? index }  style={styles.receiptCard}>
              
                {receipt.imageUri && (
                  <Image 
                    source={{ uri: receipt.imageUri }} 
                    style={styles.receiptImage} 
                    resizeMode="cover"
                  />
                )}
                
                
                <View style={styles.detailsContainer}>
                  <Text style={styles.vendorName}>
                    {receipt.vendor_name || 'Unknown Vendor'}
                  </Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{receipt.date || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Total:</Text>
                    <Text style={[styles.value, styles.totalAmount]}>
                      {receipt.total_amount || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tax:</Text>
                    <Text style={styles.value}>{receipt.tax || '0'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Category:</Text>
                    <Text style={styles.value}>{receipt.category || "n/a"}</Text>
                  </View>
                  
                  <Text style={styles.timestamp}>
                    {new Date(receipt.timestamp).toLocaleString()}
                  </Text>
                </View>
                
                
                <TouchableOpacity
                  onPress={() => deleteReceipt(receipt.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}> Delete</Text>
                </TouchableOpacity>
              </View>
            )})}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#ff5252',
    borderRadius: 8,
  },
  clearAllText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  receiptsContainer: {
    padding: 15,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  detailsContainer: {
    padding: 16,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#4CAF50',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#ff5252',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});