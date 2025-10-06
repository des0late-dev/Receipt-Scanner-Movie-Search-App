import { receiptEmitter } from '@/util/receiptEmitter';
import { API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraCapturedPicture, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReceiptData {
  vendor_name?: string;
  date?: string;
  total_amount?: string;
  tax?: string;
  category?: string;
  imageUri?: string;
  timestamp: number;
}

export default function CameraComponent() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  


  async function takePicture() {
    if(cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true
      });
      setCapturedImage(photo);
      setShowCamera(false);
    }
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function analyzeReceipt() {
    if(!capturedImage?.base64) {
      setError("Nothing to analyze");
      return;
    }
    
    setIsProcessing(true); 
    setError(null);
    
    try {
      const GEMINI_API_KEY = API_KEY; 
      
     const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this receipt image and extract the following information in JSON format:
                    {
                      "vendor_name": "name of the store/merchant",
                      "total_amount": "total amount paid",
                      "tax": "any tax keep it 0 if none",
                      "date": "purchase date"
                        "items": ["list all items purchased"],

  "category": "Analyze the items above and choose the best category"

                    }
                    Only return valid JSON without any markdown formatting or extra text.`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: capturedImage.base64
                    }
                  }
                ]
              }
            ]
          })
        }
      );
      
      const data = await response.json();
    
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        
        
        const cleanedText = jsonText.replace(/```json\n?|\n?```/g, '').trim();
        
        const parsed = JSON.parse(cleanedText);
        setReceiptData(parsed);
        receiptEmitter.emit()
      } else {
        console.log('No valid response from API');
        setError('Failed to analyze receipt');
      }
    } catch(error) {
      console.error('Error analyzing receipt:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false); 
    }
  }

const saveReceiptToStorage = async () => {
    if (!receiptData) {
      Alert.alert('Error', 'No receipt data to save');
      return;
    }

    try {
     
      const receiptsJson = await AsyncStorage.getItem('receipts');
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      const now = new Date();

receiptData.timestamp = Date.now();
     
      receipts.push(receiptData);
      
      
      await AsyncStorage.setItem('receipts', JSON.stringify(receipts));
      receiptEmitter.emit();

      Alert.alert(
        'Success!',
        'Receipt saved successfully!',
        [
          {
            text: 'Take Another',
            onPress: () => {
              setShowCamera(true);
              setCapturedImage(null);
              setReceiptData(null);
              setError(null);
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      
      console.log('Receipt saved successfully!');
    } catch (error) {
      console.error('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt');
    }
  };



  if(showCamera) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setShowCamera(false)}>
            <Text style={styles.text}>Close Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Capture image</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    );
  } else {
    return(
      <View style={{flex: 1, alignItems: "center", justifyContent: "center", padding: 20}}>
        {capturedImage && (
          <>
            <Image 
              source={{ uri: capturedImage.uri }} 
              style={{ width: 300, height: 400, marginBottom: 30 }} 
            />
            <TouchableOpacity 
              onPress={analyzeReceipt}
              disabled={isProcessing}
              style={{
                backgroundColor: isProcessing ? '#ccc' : '#007AFF',
                padding: 15,
                borderRadius: 10,
                
                    paddingVertical: 12,
    paddingHorizontal: 24,
              }}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{color: 'white', fontWeight: 'bold',fontSize:16}}>
                  Analyze Receipt
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveReceiptToStorage}
              style={{
                backgroundColor: '#4CAF50',
                padding: 15,
                borderRadius: 10,
                marginTop: 30,
                marginBottom:30,
                alignItems: 'center',
                    paddingVertical: 12,
    paddingHorizontal: 24,
              }}
            >
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                💾 Save Receipt
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {error && (
          <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
        )}
        
        {receiptData && (
          <View style={{backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, width: '90%', marginBottom:5}}>
            <Text style={{fontWeight: 'bold', marginBottom: 10}}>Receipt Data:</Text>
            <Text>Vendor {receiptData.vendor_name}</Text>
            <Text>Date: {receiptData.date}</Text>
            <Text>Total: {receiptData.total_amount}</Text>
            {receiptData.tax && <Text>Tax: {receiptData.tax}</Text>}
          </View>
        )}

       <TouchableOpacity
  onPress={() => setShowCamera(true)}
  style={{
    
    backgroundColor: '#007AFF', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
 
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
    Turn on Camera
  </Text>
</TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});